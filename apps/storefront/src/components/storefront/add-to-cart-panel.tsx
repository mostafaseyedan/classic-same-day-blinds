"use client";
import { Button } from "@blinds/ui";
import { QuantityStepper } from "@blinds/ui";

import { useMemo, useState } from "react";

import { DimensionSelector } from "@/components/product/dimension-selector";
import type { DimensionState } from "@/components/product/dimension-selector";
import { AffirmMessaging } from "@/components/product/affirm-messaging";
import { RestockNotification } from "@/components/product/restock-notification";
import { useStorefront } from "@/components/storefront/storefront-provider";
import { formatPrice } from "@/lib/format-price";
import { formatMeasurementValue } from "@/lib/measurement-format";
import type { CatalogOptionGroup, CatalogProduct, CatalogVariant } from "@/lib/medusa/catalog";

type AddToCartPanelProps = {
  product: CatalogProduct;
};

function buildInitialSelection(product: CatalogProduct) {
  const defaultVariant = product.variants[0];

  if (!defaultVariant) {
    return {};
  }

  return { ...defaultVariant.options };
}

// Base reference size for area-formula fallback: 24" × 36" = 864 sq in.
const BASE_AREA_SQIN = 24 * 36;

function calcDimensionPrice(basePrice: number, widthIn: number, heightIn: number): number {
  const area = widthIn * heightIn;
  if (area <= BASE_AREA_SQIN) return basePrice;
  return Math.round((basePrice * area) / BASE_AREA_SQIN * 100) / 100;
}

function sizeLabel(value: number) {
  return formatMeasurementValue(value);
}

// --- Size-variant helpers ---

/** Parse a "W X H" or "WxH" option value like "22 X 36" or "22x36" into numeric inches. */
function parseSizeOption(value: string): { w: number; h: number } | null {
  const match = /^(\d+(?:\.\d+)?)\s*[Xx]\s*(\d+(?:\.\d+)?)$/.exec(value.trim());
  if (!match) return null;
  return { w: parseFloat(match[1]), h: parseFloat(match[2]) };
}

/** Return true if every value in this option group looks like a "WxH" size. */
function isSizeOptionGroup(option: CatalogOptionGroup): boolean {
  return option.values.length > 0 && option.values.every((v) => parseSizeOption(v) !== null);
}

/**
 * Find the best-fit variant for entered dimensions.
 * - First narrows by chip selections for non-size options.
 * - Then picks the smallest variant whose width ≥ enteredW AND height ≥ enteredH.
 * - Falls back to the largest available if dimensions exceed all sizes.
 */
function findSizeVariant(
  variants: CatalogVariant[],
  sizeOptionTitle: string,
  widthIn: number,
  heightIn: number,
  chipSelection: Record<string, string>,
  nonSizeOptionTitles: string[],
): { variant: CatalogVariant; parsed: { w: number; h: number }; exact: boolean } | null {
  // Filter by chip selections for non-size options
  const pool =
    nonSizeOptionTitles.length > 0
      ? variants.filter((v) =>
        nonSizeOptionTitles.every((title) => {
          const sel = chipSelection[title];
          return !sel || v.options[title] === sel;
        }),
      )
      : variants;

  // Parse size from each variant
  const parsed = pool
    .map((v) => {
      const raw = v.options[sizeOptionTitle];
      if (!raw) return null;
      const size = parseSizeOption(raw);
      if (!size) return null;
      return { variant: v, w: size.w, h: size.h };
    })
    .filter(Boolean) as Array<{ variant: CatalogVariant; w: number; h: number }>;

  if (parsed.length === 0) return null;

  // Variants that cover the entered dimensions
  const fitting = parsed.filter((p) => p.w >= widthIn && p.h >= heightIn);

  if (fitting.length > 0) {
    const best = fitting.reduce((a, b) => (a.w * a.h <= b.w * b.h ? a : b));
    const exact = best.w === Math.ceil(widthIn) && best.h === Math.ceil(heightIn);
    return { variant: best.variant, parsed: { w: best.w, h: best.h }, exact };
  }

  // Nothing fits — return the largest available with a warning flag
  const largest = parsed.reduce((a, b) => (a.w * a.h >= b.w * b.h ? a : b));
  return { variant: largest.variant, parsed: { w: largest.w, h: largest.h }, exact: false };
}

export function AddToCartPanel({ product }: AddToCartPanelProps) {
  const sizeOption = useMemo(
    () => product.options.find(isSizeOptionGroup) ?? null,
    [product.options],
  );
  const availableSizeDimensions = useMemo(() => {
    if (!sizeOption) {
      return {
        minWidth: 24,
        maxWidth: 24,
        minHeight: 36,
        maxHeight: 36,
        defaultWidth: 24,
        defaultHeight: 36,
      };
    }

    const parsed = product.variants
      .map((variant) => {
        const rawSize = variant.options[sizeOption.title];
        if (!rawSize) return null;
        const size = parseSizeOption(rawSize);
        if (!size) return null;
        return { w: size.w, h: size.h, price: variant.calculatedPrice };
      })
      .filter((entry): entry is { w: number; h: number; price: number } => Boolean(entry));

    const widths = Array.from(new Set(parsed.map((entry) => entry.w))).sort((a, b) => a - b);
    const heights = Array.from(new Set(parsed.map((entry) => entry.h))).sort((a, b) => a - b);
    // Default to the variant with the lowest calculated price
    const defaultSize = parsed.length > 0
      ? parsed.reduce((min, curr) => (curr.price < min.price ? curr : min), parsed[0])
      : { w: 24, h: 36 };

    return {
      minWidth: widths[0] ?? 24,
      maxWidth: widths[widths.length - 1] ?? 24,
      minHeight: heights[0] ?? 36,
      maxHeight: heights[heights.length - 1] ?? 36,
      defaultWidth: defaultSize.w,
      defaultHeight: defaultSize.h,
    };
  }, [product.variants, sizeOption]);
  const initialWidth = availableSizeDimensions.defaultWidth ?? 24;
  const initialHeight = availableSizeDimensions.defaultHeight ?? 36;
  const [quantity, setQuantity] = useState(1);
  const [selection, setSelection] = useState<Record<string, string>>(() =>
    buildInitialSelection(product),
  );
  const [dimensions, setDimensions] = useState<DimensionState>({
    widthDecimal: initialWidth,
    heightDecimal: initialHeight,
  });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const { addToCart, isLoading, commerceEnabled } = useStorefront();

  // Detect whether this product uses WxH size variants
  const nonSizeOptions = useMemo(
    () => (sizeOption ? product.options.filter((o) => o.id !== sizeOption.id) : product.options),
    [product.options, sizeOption],
  );
  const nonSizeOptionTitles = useMemo(
    () => nonSizeOptions.map((o) => o.title),
    [nonSizeOptions],
  );

  // Size-variant match result (null when no size option present)
  const sizeMatch = useMemo(() => {
    if (!sizeOption) return null;
    return findSizeVariant(
      product.variants,
      sizeOption.title,
      dimensions.widthDecimal,
      dimensions.heightDecimal,
      selection,
      nonSizeOptionTitles,
    );
  }, [sizeOption, product.variants, dimensions, selection, nonSizeOptionTitles]);

  const selectedVariant = useMemo(() => {
    if (sizeOption) {
      return sizeMatch?.variant ?? null;
    }

    if (product.options.length === 0) {
      return product.variants[0] ?? null;
    }

    return (
      product.variants.find((variant) =>
        product.options.every((option) => {
          const selected = selection[option.title];

          if (!selected) {
            return false;
          }

          return variant.options[option.title] === selected;
        }),
      ) ?? null
    );
  }, [product, selection, sizeOption, sizeMatch]);

  const sqFt = (dimensions.widthDecimal * dimensions.heightDecimal) / 144;
  const currencyCode = selectedVariant?.currencyCode ?? "USD";

  // When using size variants, use the variant price directly.
  // For other products, apply the area-ratio formula.
  const unitPrice = selectedVariant
    ? sizeOption
      ? selectedVariant.calculatedPrice
      : calcDimensionPrice(
        selectedVariant.calculatedPrice,
        dimensions.widthDecimal,
        dimensions.heightDecimal,
      )
    : null;

  const perSqFt =
    unitPrice != null && sqFt > 0
      ? Math.round((unitPrice / sqFt) * 100) / 100
      : selectedVariant
        ? Math.round((selectedVariant.calculatedPrice / (BASE_AREA_SQIN / 144)) * 100) / 100
        : null;

  const dimensionsOutOfRange = sizeOption !== null && (
    dimensions.widthDecimal < availableSizeDimensions.minWidth ||
    dimensions.widthDecimal > availableSizeDimensions.maxWidth ||
    dimensions.heightDecimal < availableSizeDimensions.minHeight ||
    dimensions.heightDecimal > availableSizeDimensions.maxHeight
  );
  const selectedCustomSizeLabel = `${sizeLabel(dimensions.widthDecimal)} × ${sizeLabel(dimensions.heightDecimal)}`;
  const pricingSizeLabel = sizeMatch
    ? `${formatMeasurementValue(sizeMatch.parsed.w)} × ${formatMeasurementValue(sizeMatch.parsed.h)}`
    : null;

  const inventoryMessage = selectedVariant
    ? !selectedVariant.manageInventory || (selectedVariant.inventoryQuantity ?? 0) > 0
      ? "In stock"
      : "Out of stock"
    : "Select options to continue";
  const showRestockNotification = Boolean(
    selectedVariant &&
    selectedVariant.manageInventory &&
    (selectedVariant.inventoryQuantity ?? 0) <= 0,
  );

  async function handleAddToCart() {
    if (!selectedVariant) {
      setStatusMessage("Select a valid variant combination before adding to cart.");
      return;
    }

    if (dimensionsOutOfRange) {
      setStatusMessage(
        `Requested size is outside the allowed range. Width: ${formatMeasurementValue(availableSizeDimensions.minWidth)} to ${formatMeasurementValue(availableSizeDimensions.maxWidth)}. Height: ${formatMeasurementValue(availableSizeDimensions.minHeight)} to ${formatMeasurementValue(availableSizeDimensions.maxHeight)}.`,
      );
      return;
    }

    setStatusMessage(null);

    const metadata: Record<string, unknown> = {
      measurement_model: "custom-size",
      custom_size: selectedCustomSizeLabel,
      width: sizeLabel(dimensions.widthDecimal),
      height: sizeLabel(dimensions.heightDecimal),
      width_decimal: dimensions.widthDecimal,
      height_decimal: dimensions.heightDecimal,
      size_sqft: Math.round(sqFt * 100) / 100,
    };

    if (pricingSizeLabel) {
      metadata.pricing_size = pricingSizeLabel;
    }

    try {
      await addToCart(selectedVariant.id, quantity, metadata);
      setStatusMessage("Added to cart.");
    } catch {
      setStatusMessage("Unable to add the selected variant to cart.");
    }
  }

  return (
    <div>
      <div className="grid gap-4">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_14rem] lg:items-end">
          <div>
            <div>
              <DimensionSelector
                widthDecimal={dimensions.widthDecimal}
                heightDecimal={dimensions.heightDecimal}
                minWidthDecimal={availableSizeDimensions.minWidth}
                maxWidthDecimal={availableSizeDimensions.maxWidth}
                minHeightDecimal={availableSizeDimensions.minHeight}
                maxHeightDecimal={availableSizeDimensions.maxHeight}
                onChange={setDimensions}
              />
            </div>
            {sizeOption && sizeMatch && !dimensionsOutOfRange && (
              <p className="mt-2 text-[0.64rem] text-slate/50">
                Priced as {formatMeasurementValue(sizeMatch.parsed.w)} × {formatMeasurementValue(sizeMatch.parsed.h)} (nearest available size)
              </p>
            )}
            {dimensionsOutOfRange && (
              <p className="mt-2 text-[0.64rem] font-semibold text-red-500">
                Allowed width {formatMeasurementValue(availableSizeDimensions.minWidth)} to {formatMeasurementValue(availableSizeDimensions.maxWidth)}. Allowed height {formatMeasurementValue(availableSizeDimensions.minHeight)} to {formatMeasurementValue(availableSizeDimensions.maxHeight)}.
              </p>
            )}
          </div>

          <div className="grid gap-3 lg:justify-items-end">
            <div className="text-left lg:text-right">
              {product.originalPrice && product.originalPrice > product.price ? (
                <div className="flex items-center gap-2 lg:justify-end">
                  <p className="text-[0.78rem] font-medium uppercase tracking-[0.08em] text-slate/42 line-through">
                    {formatPrice(product.originalPrice, currencyCode)}
                  </p>
                  <p className="text-[0.76rem] font-semibold uppercase tracking-[0.12em] text-brass">
                    Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                  </p>
                </div>
              ) : null}
              <p className="mt-1 text-[2rem] font-semibold leading-none text-slate">
                {formatPrice(unitPrice ?? product.price, currencyCode)}
              </p>
              {perSqFt != null && (
                <p className="mt-1.5 text-[0.8rem] text-slate/64">
                  {formatPrice(perSqFt, currencyCode)}/sq ft
                </p>
              )}
            </div>

            {commerceEnabled ? (
              <div className="flex flex-wrap gap-2.5 lg:justify-end">
                <Button variant="default"
                  type="button"
                  onClick={() => void handleAddToCart()}
                  disabled={!selectedVariant || isLoading || dimensionsOutOfRange}
                  className="h-9 px-4 text-[0.68rem] tracking-[0.14em]"
                >
                  {isLoading ? "Updating Cart..." : "Add to Cart"}
                </Button>
              </div>
            ) : (
              <p className="text-sm leading-6 text-slate/70 lg:text-right">
                Medusa is not configured in this environment yet. Add the publishable key and backend URL
                to enable live cart operations.
              </p>
            )}
          </div>
        </div>

        <AffirmMessaging amountInDollars={unitPrice ?? product.price} />

        {nonSizeOptions.map((option) => (
          <div key={option.id}>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-slate">{option.title}</p>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {option.values.map((value) => {
                const active = selection[option.title] === value;

                return (
                  <Button
                    key={value}
                    type="button"
                    onClick={() =>
                      setSelection((current) => ({
                        ...current,
                        [option.title]: value,
                      }))
                    }
                    variant={active ? "chip-active" : "chip"}
                    size="compact"
                    className="rounded-lg px-3 py-1.5 text-[0.64rem] tracking-[0.13em] shadow-none"
                  >
                    {value}
                  </Button>
                );
              })}
            </div>
          </div>
        ))}

        <div className="grid items-start gap-4 border-t border-black/6 pt-3 sm:grid-cols-[11rem_1fr]">
          <label className="grid gap-2">
            <span className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-slate">Quantity</span>
            <QuantityStepper
              value={quantity}
              onChange={setQuantity}
              disabled={isLoading}
              className="h-9 w-fit"
              valueClassName="min-w-[2rem] text-[0.88rem]"
            />
          </label>
          <div className="pt-1">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-brass">
              {sizeOption ? `Custom size ${selectedCustomSizeLabel}` : (selectedVariant?.title ?? "Select options")}
            </p>
            <p className="mt-0.5 text-[0.62rem] uppercase tracking-[0.09em] text-slate/42">
              {sqFt.toFixed(2)} sq ft selected
            </p>
            <p className="mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-olive">
              {inventoryMessage}
            </p>
            {unitPrice != null && quantity > 1 && (
              <p className="mt-1 text-[0.64rem] uppercase tracking-[0.08em] text-slate/48">
                {formatPrice(unitPrice, currencyCode)} × {quantity}
              </p>
            )}
          </div>
        </div>

        {statusMessage ? <p className="text-sm text-olive">{statusMessage}</p> : null}

        {showRestockNotification ? (
          <RestockNotification
            productId={product.id}
            productName={`${product.name} - ${sizeOption ? selectedCustomSizeLabel : (selectedVariant?.title ?? "Selected Variant")}`}
          />
        ) : null}
      </div>
    </div>
  );
}
