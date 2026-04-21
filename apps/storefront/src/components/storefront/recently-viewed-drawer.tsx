"use client";
import { CloseButton } from "@blinds/ui";
import { Button } from "@blinds/ui";
import { Badge } from "@blinds/ui";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CaretDown, ClockCounterClockwise } from "@phosphor-icons/react";

import { formatPrice } from "@/lib/format-price";
import { useStorefront } from "@/components/storefront/storefront-provider";
import { getRecentlyViewed, type RecentProduct } from "@/lib/recently-viewed";

export function RecentlyViewedDrawer() {
  const [products, setProducts] = useState<RecentProduct[]>([]);
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { cart } = useStorefront();

  useEffect(() => {
    const load = () => {
      const items = getRecentlyViewed();
      setProducts(items);
    };
    load();
    window.addEventListener("recently-viewed-updated", load);
    return () => window.removeEventListener("recently-viewed-updated", load);
  }, [dismissed]);

  if (products.length === 0 || dismissed) return null;

  const cartCount = cart?.items?.reduce((sum, item) => sum + (item.quantity ?? 0), 0) ?? 0;
  const cartTotal = cart?.total ?? 0;
  const currencyCode = cart?.currency_code?.toUpperCase() ?? "USD";

  return (
    <>
      {/* Collapsed side tab */}
      {!open && (
        <Button
          type="button"
          variant="secondary"
          size="compact"
          onClick={() => setOpen(true)}
          className="group fixed right-0 top-[60%] z-[9990] h-auto -translate-y-1/2 overflow-hidden rounded-l-[0.5rem] rounded-r-none border border-black/8 bg-white px-2 py-4 shadow-[-4px_0_15px_rgba(0,0,0,0.05)] hover:bg-shell"
        >
          <div className="flex items-center justify-center gap-2 -rotate-180 text-xs font-bold tracking-widest text-slate/70 group-hover:text-olive uppercase" style={{ writingMode: 'vertical-rl' }}>
            <ClockCounterClockwise className="h-3.5 w-3.5 rotate-90" />
            Recently Viewed
          </div>
        </Button>
      )}

      {/* Drawer Overlay */}
      {open && (
        <div 
          className="fixed inset-0 z-[9994] bg-black/5" 
          onClick={() => setOpen(false)} 
        />
      )}

      {/* Slide-out Panel */}
      <div
        className={`fixed top-0 bottom-0 right-0 z-[9995] flex w-80 flex-col bg-white shadow-[-20px_0_40px_rgba(24,36,34,0.1)] transition-transform duration-500 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-shell/40 px-6 py-4 shrink-0">
          <div className="flex items-center gap-2 text-slate">
            <ClockCounterClockwise className="h-4 w-4 text-olive" />
            <span className="text-sm font-bold tracking-wide uppercase">Recently Viewed</span>
            <span className="text-xs text-slate/40">({products.length})</span>
          </div>
          <CloseButton
            onClick={() => setOpen(false)}
            variant="neutral"
            magnetic
            size="md"
            className="-mr-1"
          />
        </div>

        {/* Vertical Products List */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          <div className="flex flex-col gap-6">
            {products.map((product) => {
              const discount =
                product.originalPrice && product.originalPrice > product.price
                  ? Math.round(((product.originalPrice - product.price) / product.price) * 100)
                  : 0;

              return (
                <Link
                  key={product.slug}
                  href={`/products/${product.slug}`}
                  className="group flex gap-4"
                >
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-shell transition group-hover:shadow-[0_10px_24px_rgba(24,36,34,0.08)]">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover object-center transition duration-300 group-hover:scale-105"
                    />
                    {discount > 0 && (
                      <Badge variant="discount" className="absolute right-1.5 top-1.5 px-1.5 py-0.5 text-[9px] shadow-sm">
                        -{discount}%
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-brass">
                      {product.categoryLabel}
                    </p>
                    <p className="mt-1 text-sm font-semibold leading-snug text-slate line-clamp-2 group-hover:text-olive transition">
                      {product.name}
                    </p>
                    <p className="mt-1.5 text-sm font-bold text-slate">
                      {formatPrice(product.price, "USD")}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Footer actions inside drawer */}
        <div className="bg-shell/20 px-6 py-4 shrink-0">
          {cartCount > 0 && (
            <div className="mb-4 rounded-full bg-white px-4 py-3 shadow-[0_10px_24px_rgba(24,36,34,0.08)]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-olive">
                Cart Waiting
              </p>
              <p className="mt-1 text-sm font-semibold text-slate">
                {cartCount} item{cartCount !== 1 ? "s" : ""}
              </p>
              <p className="mt-1 text-xs text-slate/60">
                Est. total: {formatPrice(cartTotal, currencyCode)}
              </p>
              <Button asChild variant="default"><Link href="/cart" className="mt-3 w-full justify-center">
                View Cart
              </Link></Button>
            </div>
          )}
          <Button variant="secondary"
            onClick={() => { setDismissed(true); setOpen(false); }}
            
          >
            Clear Recently Viewed
          </Button>
        </div>
      </div>
    </>
  );
}
