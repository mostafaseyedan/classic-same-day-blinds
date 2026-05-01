"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { HttpTypes } from "@medusajs/types";
import type { CustomerAccountOrder, CustomerAccountOrdersResponse } from "@blinds/types";

import { useStorefront } from "@/components/storefront/storefront-provider";
import { getPublicRuntimeConfig } from "@/lib/platform-config";
import { getBrowserMedusaClient } from "@/lib/medusa/sdk-browser";

type CustomerContextValue = {
  commerceEnabled: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  customer: HttpTypes.StoreCustomer | null;
  orders: CustomerAccountOrder[];
  addresses: HttpTypes.StoreCustomerAddress[];
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (input: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  updateProfile: (input: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    company_name?: string;
  }) => Promise<void>;
  addAddress: (input: HttpTypes.StoreCreateCustomerAddress) => Promise<void>;
  updateAddress: (
    addressId: string,
    input: HttpTypes.StoreUpdateCustomerAddress,
  ) => Promise<void>;
  deleteAddress: (addressId: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  requestAccountDeletion: () => Promise<void>;
};

const CustomerContext = createContext<CustomerContextValue | null>(null);
const CUSTOMER_JWT_STORAGE_KEY = "blinds_storefront_customer_jwt";

export function CustomerProvider({ children }: { children: React.ReactNode }) {
  const sdk = useMemo(() => getBrowserMedusaClient(), []);
  const config = useMemo(() => getPublicRuntimeConfig(), []);
  const { cart, refreshCart } = useStorefront();
  const [customer, setCustomer] = useState<HttpTypes.StoreCustomer | null>(null);
  const [orders, setOrders] = useState<CustomerAccountOrder[]>([]);
  const [addresses, setAddresses] = useState<HttpTypes.StoreCustomerAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    if (!sdk || !config.commerceEnabled) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token =
        typeof window === "undefined"
          ? null
          : window.localStorage.getItem(CUSTOMER_JWT_STORAGE_KEY);

      const [{ customer: nextCustomer }, { orders: nextOrders }, { addresses: nextAddresses }] =
        await Promise.all([
          sdk.store.customer.retrieve(),
          loadCustomerOrders({
            medusaBaseUrl: config.medusaBaseUrl,
            publishableKey: config.medusaPublishableKey,
            token,
          }),
          sdk.store.customer.listAddress(),
        ]);

      setCustomer(nextCustomer);
      setOrders(nextOrders ?? []);
      setAddresses(nextAddresses ?? []);
    } catch (refreshError) {
      setCustomer(null);
      setOrders([]);
      setAddresses([]);
      const message =
        refreshError instanceof Error
          ? refreshError.message
          : "Unable to load customer account.";

      if (/401|unauthorized|not allowed/i.test(message)) {
        setError(null);
      } else {
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function attachCustomerCart() {
    if (!sdk || !cart?.id) {
      return;
    }

    try {
      await sdk.store.cart.transferCart(cart.id);
      await refreshCart();
    } catch {
      // Ignore cart transfer issues until checkout shipping/payment is fully configured.
    }
  }

  async function login(email: string, password: string) {
    if (!sdk) {
      throw new Error("Medusa is not configured.");
    }

    setError(null);
    const result = await sdk.auth.login("customer", "emailpass", { email, password });

    if (typeof result !== "string") {
      throw new Error("Additional authentication steps are required.");
    }

    await attachCustomerCart();
    await refresh();
  }

  async function register(input: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }) {
    if (!sdk) {
      throw new Error("Medusa is not configured.");
    }

    setError(null);

    const registrationToken = await sdk.auth.register("customer", "emailpass", {
      email: input.email,
      password: input.password,
    });

    await sdk.store.customer.create(
      {
        email: input.email,
        first_name: input.firstName,
        last_name: input.lastName,
        phone: input.phone,
      },
      {},
      {
        authorization: `Bearer ${registrationToken}`,
      },
    );

    await login(input.email, input.password);
  }

  async function logout() {
    if (!sdk) {
      return;
    }

    await sdk.auth.logout();
    setCustomer(null);
    setOrders([]);
    setAddresses([]);
    setError(null);
  }

  async function updateProfile(input: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    company_name?: string;
  }) {
    if (!sdk) {
      throw new Error("Medusa is not configured.");
    }

    await sdk.store.customer.update({
      first_name: input.first_name,
      last_name: input.last_name,
      phone: input.phone,
      company_name: input.company_name,
    });
    await refresh();
  }

  async function addAddress(input: HttpTypes.StoreCreateCustomerAddress) {
    if (!sdk) {
      throw new Error("Medusa is not configured.");
    }

    await sdk.store.customer.createAddress(input);
    await refresh();
  }

  async function updateAddress(
    addressId: string,
    input: HttpTypes.StoreUpdateCustomerAddress,
  ) {
    if (!sdk) {
      throw new Error("Medusa is not configured.");
    }

    await sdk.store.customer.updateAddress(addressId, input);
    await refresh();
  }

  async function deleteAddress(addressId: string) {
    if (!sdk) {
      throw new Error("Medusa is not configured.");
    }

    await sdk.store.customer.deleteAddress(addressId);
    await refresh();
  }

  async function requestPasswordReset(email: string) {
    if (!sdk) {
      throw new Error("Medusa is not configured.");
    }

    await sdk.auth.resetPassword("customer", "emailpass", { identifier: email });
  }

  async function resetPassword(token: string, newPassword: string) {
    if (!sdk) {
      throw new Error("Medusa is not configured.");
    }

    await sdk.auth.updateProvider(
      "customer",
      "emailpass",
      {
        password: newPassword,
      },
      token,
    );
  }

  async function requestAccountDeletion() {
    if (!customer) {
      throw new Error("No customer session found.");
    }

    const opsApiUrl = config.opsApiBaseUrl;

    if (!opsApiUrl) {
      throw new Error("Ops API is not configured.");
    }

    const token =
      typeof window === "undefined"
        ? null
        : window.localStorage.getItem(CUSTOMER_JWT_STORAGE_KEY);

    if (!token) {
      throw new Error("Customer session token is missing.");
    }

    const res = await fetch(`${opsApiUrl}/api/v1/account/delete-request`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Deletion request failed (${res.status}).`);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const value = useMemo<CustomerContextValue>(
    () => ({
      commerceEnabled: config.commerceEnabled,
      isLoading,
      isAuthenticated: Boolean(customer),
      customer,
      orders,
      addresses,
      error,
      login,
      register,
      logout,
      refresh,
      updateProfile,
      addAddress,
      updateAddress,
      deleteAddress,
      requestPasswordReset,
      resetPassword,
      requestAccountDeletion,
    }),
    [
      config.commerceEnabled,
      isLoading,
      customer,
      orders,
      addresses,
      error,
    ],
  );

  return <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>;
}

async function loadCustomerOrders(input: {
  medusaBaseUrl: string;
  publishableKey: string;
  token: string | null;
}): Promise<CustomerAccountOrdersResponse> {
  if (!input.token) {
    return { orders: [] };
  }

  const response = await fetch(`${input.medusaBaseUrl}/store/customers/me/orders`, {
    headers: {
      authorization: `Bearer ${input.token}`,
      "x-publishable-api-key": input.publishableKey,
    },
  });

  if (!response.ok) {
    throw new Error(`Unable to load customer orders (${response.status})`);
  }

  return (await response.json()) as CustomerAccountOrdersResponse;
}

export function useCustomer() {
  const context = useContext(CustomerContext);

  if (!context) {
    throw new Error("useCustomer must be used within CustomerProvider");
  }

  return context;
}
