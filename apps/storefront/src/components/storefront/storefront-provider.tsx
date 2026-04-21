"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { HttpTypes } from "@medusajs/types";

import { getPublicRuntimeConfig } from "@/lib/platform-config";
import { getBrowserMedusaClient } from "@/lib/medusa/sdk-browser";

const CART_STORAGE_KEY = "blinds_storefront_cart_id";
const REGION_STORAGE_KEY = "blinds_storefront_region_id";

type StorefrontContextValue = {
  commerceEnabled: boolean;
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  region: HttpTypes.StoreRegion | null;
  cart: HttpTypes.StoreCart | null;
  cartQuantity: number;
  refreshCart: () => Promise<void>;
  addToCart: (variantId: string, quantity?: number, metadata?: Record<string, unknown>) => Promise<void>;
  updateLineItem: (lineItemId: string, quantity: number) => Promise<void>;
  removeLineItem: (lineItemId: string) => Promise<void>;
  updateCartEmail: (email: string) => Promise<void>;
  applyPromoCode: (code: string) => Promise<void>;
  removePromoCode: (code: string) => Promise<void>;
  clearCart: () => void;
};

const StorefrontContext = createContext<StorefrontContextValue | null>(null);

function getStoredValue(key: string) {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(key);
}

function setStoredValue(key: string, value: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, value);
}

function removeStoredValue(key: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(key);
}

export function StorefrontProvider({ children }: { children: React.ReactNode }) {
  const config = getPublicRuntimeConfig();
  const [region, setRegion] = useState<HttpTypes.StoreRegion | null>(null);
  const [cart, setCart] = useState<HttpTypes.StoreCart | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sdk = useMemo(() => getBrowserMedusaClient(), []);

  async function loadRegion() {
    if (!sdk) {
      return null;
    }

    const storedRegionId = getStoredValue(REGION_STORAGE_KEY);
    const { regions } = await sdk.store.region.list({
      limit: 10,
    });

    const selected =
      regions.find((entry: HttpTypes.StoreRegion) => entry.id === storedRegionId) ??
      regions[0] ??
      null;

    if (selected) {
      setStoredValue(REGION_STORAGE_KEY, selected.id);
      setRegion(selected);
    }

    return selected;
  }

  async function createCart(regionId: string) {
    if (!sdk) {
      return null;
    }

    const { cart: nextCart } = await sdk.store.cart.create({
      region_id: regionId,
    });

    setStoredValue(CART_STORAGE_KEY, nextCart.id);
    setCart(nextCart);

    return nextCart;
  }

  async function retrieveCart(cartId: string) {
    if (!sdk) {
      return null;
    }

    const { cart: currentCart } = await sdk.store.cart.retrieve(cartId);
    setCart(currentCart);
    return currentCart;
  }

  async function ensureCart() {
    if (!sdk) {
      return null;
    }

    const nextRegion = region ?? (await loadRegion());

    if (!nextRegion) {
      return null;
    }

    const cartId = getStoredValue(CART_STORAGE_KEY);

    if (cartId) {
      try {
        return await retrieveCart(cartId);
      } catch {
        removeStoredValue(CART_STORAGE_KEY);
      }
    }

    return createCart(nextRegion.id);
  }

  async function refreshCart() {
    if (!sdk) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await ensureCart();
    } catch (refreshError) {
      setError(
        refreshError instanceof Error ? refreshError.message : "Unable to refresh the Medusa cart.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function mutateCart(
    operation: (currentCart: HttpTypes.StoreCart) => Promise<HttpTypes.StoreCart | null>,
  ) {
    if (!sdk) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const currentCart = await ensureCart();

      if (!currentCart) {
        throw new Error("Unable to initialize a cart.");
      }

      const updatedCart = await operation(currentCart);

      if (updatedCart) {
        setCart(updatedCart);
      }
    } catch (mutationError) {
      setError(
        mutationError instanceof Error ? mutationError.message : "Cart operation failed.",
      );
      throw mutationError;
    } finally {
      setIsLoading(false);
    }
  }

  async function addToCart(variantId: string, quantity = 1, metadata?: Record<string, unknown>) {
    await mutateCart(async (currentCart) => {
      const { cart: updatedCart } = await sdk!.store.cart.createLineItem(currentCart.id, {
        variant_id: variantId,
        quantity,
        ...(metadata ? { metadata } : {}),
      });

      return updatedCart;
    });
  }

  async function updateLineItem(lineItemId: string, quantity: number) {
    await mutateCart(async (currentCart) => {
      const { cart: updatedCart } = await sdk!.store.cart.updateLineItem(
        currentCart.id,
        lineItemId,
        {
          quantity,
        },
      );

      return updatedCart;
    });
  }

  async function removeLineItem(lineItemId: string) {
    await mutateCart(async (currentCart) => {
      const response = await sdk!.store.cart.deleteLineItem(currentCart.id, lineItemId);
      return response.parent ?? null;
    });
  }

  async function updateCartEmail(email: string) {
    await mutateCart(async (currentCart) => {
      const { cart: updatedCart } = await sdk!.store.cart.update(currentCart.id, {
        email,
      });

      return updatedCart;
    });
  }

  async function applyPromoCode(code: string) {
    await mutateCart(async (currentCart) => {
      const existingCodes = (
        (currentCart as { promotions?: Array<{ code?: string }> }).promotions ?? []
      )
        .map((p) => p.code)
        .filter((c): c is string => Boolean(c));

      if (existingCodes.includes(code)) {
        return currentCart;
      }

      const { cart: updatedCart } = await sdk!.store.cart.update(currentCart.id, {
        promo_codes: [...existingCodes, code],
      });

      return updatedCart;
    });
  }

  async function removePromoCode(code: string) {
    await mutateCart(async (currentCart) => {
      const remaining = (
        (currentCart as { promotions?: Array<{ code?: string }> }).promotions ?? []
      )
        .map((p) => p.code)
        .filter((c): c is string => Boolean(c) && c !== code);

      const { cart: updatedCart } = await sdk!.store.cart.update(currentCart.id, {
        promo_codes: remaining,
      });

      return updatedCart;
    });
  }

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      if (!config.commerceEnabled) {
        if (mounted) {
          setIsReady(true);
        }

        return;
      }

      setIsLoading(true);

      try {
        await ensureCart();
      } catch (bootstrapError) {
        if (mounted) {
          setError(
            bootstrapError instanceof Error
              ? bootstrapError.message
              : "Unable to initialize Medusa commerce.",
          );
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
          setIsReady(true);
        }
      }
    }

    void bootstrap();

    return () => {
      mounted = false;
    };
  }, [config.commerceEnabled]);

  const cartQuantity = cart?.items?.reduce((sum, item) => sum + (item.quantity ?? 0), 0) ?? 0;
  function clearCart() {
    removeStoredValue(CART_STORAGE_KEY);
    setCart(null);
  }

  return (
    <StorefrontContext.Provider
      value={{
        commerceEnabled: config.commerceEnabled,
        isReady,
        isLoading,
        error,
        region,
        cart,
        cartQuantity,
        refreshCart,
        addToCart,
        updateLineItem,
        removeLineItem,
        updateCartEmail,
        applyPromoCode,
        removePromoCode,
        clearCart,
      }}
    >
      {children}
    </StorefrontContext.Provider>
  );
}

export function useStorefront() {
  const context = useContext(StorefrontContext);

  if (!context) {
    throw new Error("useStorefront must be used within StorefrontProvider");
  }

  return context;
}
