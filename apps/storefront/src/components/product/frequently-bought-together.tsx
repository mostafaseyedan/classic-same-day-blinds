"use client";
import { Badge } from "@blinds/ui";
import { Button } from "@blinds/ui";
import { SurfaceMuted } from "@blinds/ui";

import Link from "next/link";
import { useState } from "react";

import { useStorefront } from "@/components/storefront/storefront-provider";
import { formatPrice } from "@/lib/format-price";
import type { CatalogProduct } from "@/lib/medusa/catalog";

type FrequentlyBoughtTogetherProps = {
  currentProduct: CatalogProduct;
  relatedProducts: CatalogProduct[];
};

export function FrequentlyBoughtTogether({
  currentProduct,
  relatedProducts,
}: FrequentlyBoughtTogetherProps) {
  const { addToCart, isLoading, commerceEnabled } = useStorefront();
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(
    new Set(relatedProducts.slice(0, 2).map((product) => product.id)),
  );
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (relatedProducts.length === 0) {
    return null;
  }

  const allProducts = [currentProduct, ...relatedProducts];
  const selectedRelated = relatedProducts.filter((product) => selectedProductIds.has(product.id));
  const bundleProducts = [currentProduct, ...selectedRelated];
  const total = bundleProducts.reduce((sum, product) => {
    const variant = product.variants[0];
    return sum + (variant?.calculatedPrice ?? product.price);
  }, 0);
  const currency = currentProduct.currencyCode;

  async function handleAddBundle() {
    setStatusMessage(null);

    try {
      for (const product of bundleProducts) {
        const variant = product.variants[0];

        if (!variant) {
          continue;
        }

        await addToCart(variant.id, 1);
      }

      setStatusMessage("Bundle added to cart.");
    } catch {
      setStatusMessage("Unable to add the full bundle to cart.");
    }
  }

  function toggleProduct(productId: string) {
    setSelectedProductIds((current) => {
      const next = new Set(current);

      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }

      return next;
    });
  }

  return (
    <section>
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="flex items-center gap-3 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-olive">
            <span className="block h-px w-6 bg-olive" />
            Frequently Bought Together
          </p>
          <h2 className="mt-2 font-display text-[1.55rem] font-medium text-slate">Build a faster order bundle.</h2>
        </div>
        <p className="max-w-[23rem] text-[0.84rem] leading-6 text-slate/62">
          Toggle the related items you want to add with the current product.
        </p>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {allProducts.map((product, index) => {
          const isCurrent = product.id === currentProduct.id;
          const selected = isCurrent || selectedProductIds.has(product.id);
          const variant = product.variants[0];

          return (
            <div key={product.id} className="relative">
              <button
                type="button"
                onClick={() => {
                  if (!isCurrent) {
                    toggleProduct(product.id);
                  }
                }}
                className={`w-full rounded-2xl bg-white px-3 py-3 text-left shadow-[0_10px_28px_rgba(24,36,34,0.06)] transition ${
                  selected
                    ? "ring-1 ring-olive/28"
                    : "hover:-translate-y-[1px] hover:shadow-[0_14px_34px_rgba(24,36,34,0.08)]"
                }`}
              >
                <div className="aspect-[4/3] overflow-hidden rounded-media bg-shell/70">
                  <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                </div>
                <div className="mt-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-[1rem] font-medium leading-[1.1] text-slate">{product.name}</p>
                    <p className="mt-1 text-[0.62rem] uppercase tracking-[0.12em] text-slate/58">{product.categoryLabel}</p>
                  </div>
                  <Badge
                    variant={isCurrent ? "soft-brass" : selected ? "soft-olive" : "soft-slate"}
                    className="shrink-0"
                  >
                    {isCurrent ? "Included" : selected ? "Selected" : "Optional"}
                  </Badge>
                </div>
                <p className="mt-3 text-[1rem] font-semibold text-slate">
                  {formatPrice(variant?.calculatedPrice ?? product.price, currency)}
                </p>
              </button>
              {index < allProducts.length - 1 ? (
                <div className="pointer-events-none absolute -right-2 top-1/2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0_8px_20px_rgba(24,36,34,0.08)] text-sm text-slate/45 lg:flex">
                  +
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <SurfaceMuted className="mt-5 flex flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="flex items-center gap-3 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-olive">
            <span className="block h-px w-6 bg-olive" />
            Bundle Total
          </p>
          <p className="mt-2 text-[1.7rem] font-semibold text-slate">{formatPrice(total, currency)}</p>
          <p className="mt-1 text-[0.74rem] uppercase tracking-[0.08em] text-slate/58">{bundleProducts.length} items selected</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {commerceEnabled ? (
            <Button
              type="button"
              variant="default"
              size="compact"
              onClick={() => void handleAddBundle()}
              disabled={isLoading}
            >
              {isLoading ? "Updating Cart..." : `Add ${bundleProducts.length} Items`}
            </Button>
          ) : null}
          <Button asChild variant="secondary" size="compact">
            <Link href="/cart">
              View Cart
            </Link>
          </Button>
        </div>
      </SurfaceMuted>

      {statusMessage ? <p className="mt-4 text-sm text-olive">{statusMessage}</p> : null}
    </section>
  );
}
