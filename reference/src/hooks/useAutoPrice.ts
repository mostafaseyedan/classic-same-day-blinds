import { useMemo } from 'react';
import {
  getAutoAdjustedPrice,
  isAutoTrackedProduct,
  getAllAutoAdjustedPrices,
  type AutoPriceResult,
} from '../utils/pricingEngine';

/** Per-product hook — resolves the current month's auto price for one product. */
export function useAutoPrice(productId: number): {
  autoPrice: AutoPriceResult | null;
  isAutoTracked: boolean;
} {
  const isAutoTracked = isAutoTrackedProduct(productId);
  const autoPrice = useMemo(
    () => getAutoAdjustedPrice(productId),
    [productId],
  );
  return { autoPrice, isAutoTracked };
}

/** Bulk hook — resolves auto prices for ALL tracked products at once. */
export function useAllAutoPrices(): Record<number, AutoPriceResult> {
  return useMemo(() => getAllAutoAdjustedPrices(), []);
}
