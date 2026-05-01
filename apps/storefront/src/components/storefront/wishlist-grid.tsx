"use client";
import { Badge, Button, CloseButton, SectionPanel } from "@blinds/ui";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "@phosphor-icons/react";

import { formatPrice } from "@/lib/format-price";
import {
  getWishlistItems,
  removeFromWishlist,
  type WishlistItem,
  WISHLIST_EVENT,
} from "@/lib/wishlist-store";

export function WishlistGrid() {
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    const load = () => setItems(getWishlistItems());
    load();
    window.addEventListener(WISHLIST_EVENT, load);
    return () => window.removeEventListener(WISHLIST_EVENT, load);
  }, []);

  if (items.length === 0) {
    return (
      <SectionPanel className="flex flex-col items-center gap-5 border-dashed bg-shell py-24 text-center shadow-none">
        <div>
          <p className="font-display text-2xl font-semibold text-slate">Nothing saved yet</p>
          <p className="mt-2 text-sm text-slate/55">
            Tap the heart on any product to save it here.
          </p>
        </div>
        <Button asChild variant="default"><Link
          href="/products"
          className="mt-2 px-6"
        >
          Browse products
        </Link></Button>
      </SectionPanel>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => {
        const discount =
          item.originalPrice && item.originalPrice > item.price
            ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
            : 0;

        return (
          <div
            key={item.id}
            className="card-interactive group relative"
          >
            {/* Remove button */}
            <CloseButton
              onClick={() => removeFromWishlist(item.id)}
              variant="ghost"
              size="sm"
              className="absolute right-3 top-3 z-20"
              aria-label="Remove from wishlist"
            />

            {/* Image */}
            <Link href={`/products/${item.slug}`}>
              <div className="relative aspect-[4/4.5] overflow-hidden bg-shell">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover object-center"
                />
                {item.badge && (
                  <Badge variant="soft" className="absolute left-4 top-4 border-transparent bg-shell/90 backdrop-blur">
                    {item.badge}
                  </Badge>
                )}
                {discount > 0 && (
                  <Badge variant="soft" className="absolute right-4 bottom-4 border-[#f0d4d4] bg-white text-[#b82a2a]">
                    -{discount}%
                  </Badge>
                )}
              </div>
            </Link>

            {/* Content */}
            <div className="px-5 py-5 pb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brass">
                {item.categoryLabel}
              </p>
              <Link href={`/products/${item.slug}`}>
                <h3 className="mt-2 text-lg font-semibold leading-tight text-slate line-clamp-2 hover:text-olive transition">
                  {item.name}
                </h3>
              </Link>

              <div className="mt-4 flex items-end gap-2">
                <p className="text-2xl font-bold text-slate">
                  {formatPrice(item.price, item.currencyCode)}
                </p>
                {item.originalPrice && item.originalPrice > item.price && (
                  <p className="pb-0.5 text-sm text-slate/40 line-through">
                    {formatPrice(item.originalPrice, item.currencyCode)}
                  </p>
                )}
              </div>

              {item.highlights.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {item.highlights.slice(0, 2).map((h) => (
                    <Badge key={h} variant="pill">
                      {h}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="mt-5 flex gap-2">
                <Button asChild variant="default"><Link
                  href={`/products/${item.slug}`}
                  className="flex-1 justify-center py-2.5 text-xs"
                >
                  <ShoppingCart className="h-3.5 w-3.5" />
                  View &amp; Order
                </Link></Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
