"use client";
import { Badge } from "@blinds/ui";
import { Button } from "@blinds/ui";

import { useState } from "react";
import Link from "next/link";
import { Heart } from "@phosphor-icons/react";

import { formatPrice } from "@/lib/format-price";
import type { CatalogProduct } from "@/lib/medusa/catalog";
import { toggleWishlist, isInWishlist } from "@/lib/wishlist-store";
import { QuickViewModal } from "@/components/storefront/quick-view-modal";
import { ProductMedia } from "@/components/storefront/product-media";

type ProductCardProps = {
  product: CatalogProduct;
};

export function ProductCard({ product }: ProductCardProps) {
  const [quickView, setQuickView] = useState(false);
  const [wishlisted, setWishlisted] = useState(() => isInWishlist(product.id));

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const hasDiscount = discount > 0;
  const leadCopy = product.leadTime.includes("Ships") ? product.leadTime : "Ready to configure";
  const primaryHighlight = product.highlights?.[0];

  return (
    <>
      <article className="card-interactive group relative flex h-full flex-col">
        <Link href={`/products/${product.slug}`} className="absolute inset-0 z-0">
          <span className="sr-only">View {product.name}</span>
        </Link>

        <div className="relative aspect-[4/4.55] overflow-hidden bg-bone">
          <ProductMedia
            src={product.image}
            alt={product.name}
            title={product.name}
            categoryLabel={product.categoryLabel}
            className="h-full w-full object-cover object-center"
          />

          {product.badge ? (
            <Badge variant="soft" className="absolute left-3 top-3 z-10">
              {product.badge}
            </Badge>
          ) : null}

          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product);
              setWishlisted((value) => !value);
            }}
            variant="icon"
            size="icon"
            className={`absolute right-3 top-3 z-20 border-white/40 bg-white/80 backdrop-blur-md ${
              wishlisted ? "text-olive" : "text-slate/62 hover:text-olive"
            }`}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={`h-4 w-4 ${wishlisted ? "fill-olive" : ""}`} />
          </Button>
        </div>

        <div className="px-3 pb-3 pt-3">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-brass/95">
            {product.categoryLabel}
          </p>
          <Link
            href={`/products/${product.slug}`}
            className="relative z-10"
          >
            <h3
              title={product.name}
              className="mt-2 truncate whitespace-nowrap font-display text-[1rem] font-medium leading-[1.16] tracking-[-0.01em] text-slate transition group-hover:text-slate"
            >
              {product.name}
            </h3>
          </Link>

          <div className="mt-3 min-h-[4.75rem]">
            <div className="flex items-end gap-2">
              <p className="text-[1.3rem] font-semibold leading-none text-slate">
                {formatPrice(product.price, product.currencyCode)}
              </p>
              {product.originalPrice && product.originalPrice > product.price ? (
                <p className="pb-[0.15rem] text-[0.8rem] font-medium text-slate/40 line-through">
                  {formatPrice(product.originalPrice, product.currencyCode)}
                </p>
              ) : null}
            </div>

            <div className="mt-3 flex min-h-[1.5rem] items-start justify-between gap-3">
              <div className="min-w-0">
                {primaryHighlight ? (
                  <p className="truncate text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-slate/52">
                    {primaryHighlight}
                  </p>
                ) : null}
              </div>
              {hasDiscount ? (
                <p className="shrink-0 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-brass">
                  Save {discount}%
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-4 border-t border-black/6 pt-3">
            <div className="flex items-center justify-between gap-3">
              <Button asChild variant="default" className="relative z-10 px-4 py-2 text-sm">
                <Link
                  href={`/products/${product.slug}#add-to-cart`}
                  onClick={(e) => e.stopPropagation()}
                  className="w-fit"
                >
                  Configure
                </Link>
              </Button>
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setQuickView(true);
                }}
                title={leadCopy}
                variant="secondary"
                className="relative z-10 px-4 py-2 text-sm"
              >
                Quick view
              </Button>
            </div>
          </div>
        </div>
      </article>

      {quickView ? (
        <QuickViewModal product={product} onClose={() => setQuickView(false)} />
      ) : null}
    </>
  );
}
