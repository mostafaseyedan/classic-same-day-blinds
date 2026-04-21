"use client";
import { Button, CloseButton } from "@blinds/ui";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, ShoppingCart } from "@phosphor-icons/react";

import { useStorefront } from "@/components/storefront/storefront-provider";
import { formatPrice } from "@/lib/format-price";

// In a real production app, you might look at cart.updated_at and compare it to now.
// For this demo, we'll just show it after a short delay if the cart has items.

export function AbandonedCartBanner() {
  const { cart, commerceEnabled } = useStorefront();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Hide if we are on cart or checkout pages
    if (pathname === "/cart" || pathname === "/checkout") {
      setVisible(false);
      return;
    }

    const dismissed = sessionStorage.getItem("abandoned_cart_dismissed");
    if (dismissed) {
      return;
    }

    if (!cart || !cart.items || cart.items.length === 0) {
      setVisible(false);
      return;
    }

    // Delay showing the banner for effect
    const timer = setTimeout(() => {
      setVisible(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, [cart, pathname]);

  const handleDismiss = () => {
    sessionStorage.setItem("abandoned_cart_dismissed", "1");
    setVisible(false);
  };

  if (!visible || !cart || !cart.items || cart.items.length === 0) {
    return null;
  }

  const firstItem = cart.items[0];
  if (!firstItem) return null; // type safety

  // Calculate generic derived values
  const count = cart.items.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
  const totalRaw = cart.total ?? 0;
  
  // Convert based on currency code (assume USD for Medusa standard formatting if needed, though formatPrice handles it)
  // Medusa prices are typically in cents/minor units unless handled elsewhere. formatPrice takes care of this format if configured properly.
  // Actually in the Medusa UI components, we might just use cart.total directly if formatPrice handles it. We'll use cart.currency_code
  const currencyCode = cart.currency_code?.toUpperCase() ?? "USD";
  const displayTotal = totalRaw; 

  return (
    <div className="fixed bottom-20 right-6 z-50 w-full max-w-sm animate-in slide-in-from-bottom-8 duration-500 ease-out sm:bottom-24">
      <div className="overflow-hidden rounded-card bg-white shadow-[0_12px_40px_rgba(24,36,34,0.12)]">
        {/* Top Accent Bar */}
        <div className="h-1 w-full bg-olive"></div>

        <div className="p-4">
          <div className="flex items-start gap-4">
            {/* Product Thumbnail */}
            {firstItem.thumbnail && (
              <div className="h-16 w-16 overflow-hidden rounded-media bg-shell shrink-0">
                <img
                  src={firstItem.thumbnail}
                  alt={firstItem.product_title || firstItem.title}
                  className="w-full h-full object-cover object-center"
                />
              </div>
            )}

            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-bold text-brass uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Cart Left Waiting
                  </p>
                  <p className="text-sm font-semibold text-slate leading-snug">
                    You have {count} item{count !== 1 ? "s" : ""} in your cart
                  </p>
                  <p className="text-xs text-slate/70 mt-1">
                    Est. total:{" "}
                    <span className="font-semibold text-slate">
                      {/* Note: Medusa v2 often returns total raw, we format it assuming base is 1 */}
                      {typeof displayTotal === 'number' ? `$${(displayTotal).toFixed(2)}` : 'N/A'}
                    </span>
                  </p>
                </div>
                <CloseButton
                  onClick={handleDismiss}
                  variant="ghost"
                  size="sm"
                  className="-mr-1 -mt-1"
                  aria-label="Dismiss banner"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex gap-2 pt-4">
            <Button asChild variant="default"><Link
              href="/cart"
              className="flex-1 gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Complete Order
            </Link></Button>
            <Button variant="secondary"
              onClick={handleDismiss}
            >
              Not now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
