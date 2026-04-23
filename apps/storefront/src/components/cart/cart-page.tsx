"use client";
import { Button } from "@blinds/ui";
import { QuantityStepper } from "@blinds/ui";
import { SectionPanel, SurfaceCard, SurfaceMuted } from "@blinds/ui";
import { PageTitle } from "@blinds/ui";

import Link from "next/link";
import type { HttpTypes } from "@medusajs/types";
import { useStorefront } from "@/components/storefront/storefront-provider";
import { getCustomSizeDetail, getCustomSizeLabel } from "@/lib/custom-size";
import { formatPrice } from "@/lib/format-price";

type CartItem = NonNullable<HttpTypes.StoreCart["items"]>[number] & {
  metadata?: Record<string, unknown> | null;
};

function getLineItemTotal(item: CartItem) {
  const total = item.total ?? item.item_total;

  if (typeof total === "number") {
    return total;
  }

  const unitPrice =
    item.unit_price ??
    item.variant?.calculated_price?.calculated_amount ??
    item.variant?.calculated_price?.calculated_amount_without_tax ??
    0;

  return unitPrice * (item.quantity ?? 0);
}

export function CartPage() {
  const { cart, commerceEnabled, isReady, isLoading, updateLineItem, removeLineItem } =
    useStorefront();

  if (!commerceEnabled) {
    return (
      <SectionPanel as="section" className="px-6 py-10">
        <p className="text-base leading-7 text-slate/72">
          Medusa is not configured in this environment yet, so live cart retrieval is disabled.
        </p>
      </SectionPanel>
    );
  }

  if (!isReady) {
    return <p className="text-base text-slate/70">Initializing cart...</p>;
  }

  const items = cart?.items ?? [];
  const currencyCode = cart?.currency_code?.toUpperCase() ?? "USD";
  const total =
    cart?.total ??
    items.reduce((sum, item) => sum + getLineItemTotal(item), 0);

  return (
    <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <SectionPanel className="px-6 py-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-olive">Cart</p>
        <PageTitle>Your Cart</PageTitle>

        {items.length === 0 ? (
          <SurfaceMuted className="mt-8 px-5 py-6">
            <p className="text-base leading-7 text-slate/72">
              Your cart is empty. Add a variant from a product page to test real Medusa cart line
              item creation.
            </p>
            <Button asChild variant="default" className="mt-4">
              <Link href="/products">
                Browse Products
              </Link>
            </Button>
          </SurfaceMuted>
        ) : (
          <div className="mt-8 space-y-4">
            {items.map((item) => (
              <SurfaceCard
                as="article"
                key={item.id}
                className="grid gap-4 px-4 py-4 md:grid-cols-[0.9fr_0.5fr_0.4fr]"
              >
                <div>
                  <p className="text-lg font-semibold text-slate">
                    {item.product_title ?? item.title ?? "Cart Item"}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate/72">
                    {getCustomSizeLabel(item.metadata)
                      ? "Custom size"
                      : (item.variant_title ?? item.variant?.title ?? "Configured variant")}
                  </p>
                  {getCustomSizeDetail(item.metadata) ? (
                    <p className="mt-1 text-[0.72rem] uppercase tracking-[0.1em] text-slate/50">
                      {getCustomSizeDetail(item.metadata)}
                    </p>
                  ) : null}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brass">
                    Quantity
                  </p>
                  <div className="mt-2">
                    <QuantityStepper
                      value={item.quantity ?? 1}
                      onChange={(nextValue) => void updateLineItem(item.id, nextValue)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="flex flex-col items-start justify-between gap-3 md:items-end">
                  <p className="text-lg font-semibold text-slate">
                    {formatPrice(getLineItemTotal(item), currencyCode)}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="compact"
                    onClick={() => void removeLineItem(item.id)}
                    disabled={isLoading}
                    className="h-auto px-0 py-0 text-sm font-semibold text-brass hover:text-olive"
                  >
                    Remove
                  </Button>
                </div>
              </SurfaceCard>
            ))}
          </div>
        )}
      </SectionPanel>

      <SectionPanel as="aside" className="px-6 py-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-olive">Summary</p>
        <dl className="mt-6 space-y-4">
          <div className="flex items-center justify-between gap-4 text-sm text-slate/72">
            <dt>Line items</dt>
            <dd>{items.length}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 text-sm text-slate/72">
            <dt>Currency</dt>
            <dd>{currencyCode}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 text-lg font-semibold text-slate">
            <dt>Total</dt>
            <dd>{formatPrice(total, currencyCode)}</dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-col gap-3">
          <Button
            asChild
            variant="default"
            disabled={items.length === 0}
            className="w-full text-center"
          >
            <Link
              href="/checkout"
              className={items.length === 0 ? "pointer-events-none" : ""}
            >
              Proceed to Checkout
            </Link>
          </Button>
          <Button asChild variant="secondary" className="w-full text-center">
            <Link href="/products">
              Continue Shopping
            </Link>
          </Button>
        </div>
      </SectionPanel>
    </section>
  );
}
