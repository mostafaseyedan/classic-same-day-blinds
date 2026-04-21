"use client";
import { CloseButton } from "@blinds/ui";
import { Badge } from "@blinds/ui";
import { Button } from "@blinds/ui";

import Link from "next/link";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";

import { formatPrice } from "@/lib/format-price";
import type { CatalogProduct } from "@/lib/medusa/catalog";
import { ProductMedia } from "@/components/storefront/product-media";

type QuickViewModalProps = {
  product: CatalogProduct | null;
  onClose: () => void;
};

export function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const [activeImage, setActiveImage] = useState<string>("");
  const [mounted, setMounted] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousBodyOverflowRef = useRef<string>("");

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    setActiveImage(product?.images?.[0] ?? product?.image ?? "");
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    previousBodyOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousBodyOverflowRef.current;
    };
  }, [product, onClose]);

  useEffect(() => {
    if (!product) return;
    closeButtonRef.current?.focus();
  }, [product]);

  if (!product || !mounted) return null;

  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;
  const galleryImages = product.images.length > 0 ? product.images : [product.image];
  const optionTitles = product.options.slice(0, 3).map((option) => option.title);
  const highlights = product.highlights.slice(0, 2);

  return createPortal(
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-[rgba(23,35,43,0.55)] p-4"
      onClick={onClose}
      role="presentation"
    >
      <div className="mx-auto flex min-h-full w-full items-start justify-center py-3 md:py-6">
        <div
          className="dialog-shell relative w-full max-w-[68rem] flex-col md:flex md:max-h-[calc(100dvh-3rem)] md:flex-row"
          role="dialog"
          aria-modal="true"
          aria-labelledby="quick-view-title"
          onClick={(e) => e.stopPropagation()}
        >
          <CloseButton
            ref={closeButtonRef}
            onClick={onClose}
            magnetic
            className="absolute right-4 top-4 z-20"
          />

          <div className="relative w-full shrink-0 overflow-hidden border-b border-black/6 bg-bone md:w-[48%] md:border-b-0 md:border-r">
            <ProductMedia
              src={activeImage || product.image}
              alt={product.name}
              title={product.name}
              categoryLabel={product.categoryLabel}
              className="h-72 w-full object-cover object-center md:h-full"
              fallbackClassName="h-72 md:h-full"
            />

            {product.badge ? (
              <Badge variant="soft" className="absolute left-3 top-3">
                {product.badge}
              </Badge>
            ) : null}

            {discount > 0 ? (
              <Badge variant="discount" className="absolute left-3 bottom-3">
                -{discount}%
              </Badge>
            ) : null}

            {galleryImages.length > 1 ? (
              <div className="absolute inset-x-4 bottom-4 z-10 flex gap-2 overflow-x-auto">
                {galleryImages.slice(0, 4).map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    onClick={() => setActiveImage(image)}
                    className={`h-14 w-14 shrink-0 overflow-hidden rounded-media border bg-white/92 p-0.5 transition ${
                      activeImage === image ? "border-olive shadow-sm" : "border-black/10 hover:border-black/20"
                    }`}
                    aria-label={`View image ${index + 1}`}
                  >
                    <img src={image} alt="" className="h-full w-full rounded-media object-cover object-center" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex flex-1 flex-col overflow-y-auto px-6 py-6 md:px-7 md:py-7">
            <div>
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-brass/95">
                {product.categoryLabel}
              </p>
              <h2 id="quick-view-title" className="mt-2 font-display text-[2rem] font-medium leading-[1.02] tracking-tight text-slate">
                {product.name}
              </h2>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-[2rem] font-semibold tracking-tight text-slate">
                {formatPrice(product.price, product.currencyCode)}
              </span>
              {product.originalPrice && product.originalPrice > product.price ? (
                <span className="text-sm text-slate/45 line-through">
                  {formatPrice(product.originalPrice, product.currencyCode)}
                </span>
              ) : null}
            </div>

            <p className="mt-4 max-w-2xl text-[0.94rem] leading-6 text-slate/68">
              {product.story || product.description}
            </p>

            <div className="mt-5 border-y border-black/6 py-5">
              <div className="grid gap-5 md:grid-cols-[9rem_1fr]">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-olive">
                  Best for
                </p>
                <p className="text-[0.92rem] leading-6 text-slate">{product.bestFor}</p>
              </div>
              <div className="mt-5 grid gap-5 md:grid-cols-[9rem_1fr]">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-brass">
                  Lead time
                </p>
                <p className="text-[0.92rem] leading-6 text-slate">{product.leadTime}</p>
              </div>
              {optionTitles.length > 0 ? (
                <div className="mt-5 grid gap-5 md:grid-cols-[9rem_1fr]">
                  <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-slate/48">
                    Configure
                  </p>
                  <p className="text-[0.92rem] leading-6 text-slate">
                    Choose {optionTitles.join(", ")} on the product page.
                  </p>
                </div>
              ) : null}
            </div>

            {highlights.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {highlights.map((highlight) => (
                  <Badge key={highlight} variant="soft">
                    {highlight}
                  </Badge>
                ))}
              </div>
            ) : null}

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="default"><Link
                href={`/products/${product.slug}`}
                onClick={onClose}
                className="flex-1"
              >
                View full details
              </Link></Button>
              <Button variant="secondary"
                type="button"
                onClick={onClose}
                className="flex-1"
              >
                Keep browsing
              </Button>
            </div>

            <p className="mt-5 text-[0.82rem] leading-6 text-slate/50">
              Use quick view to judge the product. Use the full product page to configure sizes, controls, and final details.
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
