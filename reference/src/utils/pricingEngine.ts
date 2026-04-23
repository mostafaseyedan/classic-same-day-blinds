// ─────────────────────────────────────────────────────────────────
//  Auto-Pricing Engine
//  Keeps our prices 15% below Blinds.com every month, automatically.
//  Reads the current month → looks up competitor monthly history →
//  returns the pre-computed 15%-lower price.
// ─────────────────────────────────────────────────────────────────

import { competitorProducts } from '../mocks/competitorPricing';

// Product ID (from products.ts) → competitor pricing entry ID
export const PRODUCT_COMPETITOR_MAP: Record<number, string> = {
  13: 'vinyl-plus-mini-blind-1in',
  14: 'aluminum-business-class-1in',
  15: 'vinyl-mini-blind-1in',
  16: 'aluminum-blinds-1in',
};

const MONTH_SHORTS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export interface AutoPriceResult {
  competitorPrice: number;
  ourPrice: number;
  monthLabel: string;
  monthShort: string;
  saleLabel?: string;
  hasSale: boolean;
  competitorProductName: string;
  competitorUrl: string;
  savingsAmount: number;
  savingsPct: number;
}

/**
 * Returns the auto-adjusted price for a given product for the current month.
 * Returns null if the product is not competitor-tracked.
 */
export function getAutoAdjustedPrice(
  productId: number,
  date: Date = new Date(),
): AutoPriceResult | null {
  const competitorId = PRODUCT_COMPETITOR_MAP[productId];
  if (!competitorId) return null;

  const competitorProduct = competitorProducts.find((p) => p.id === competitorId);
  if (!competitorProduct) return null;

  const monthShort = MONTH_SHORTS[date.getMonth()];
  const monthData = competitorProduct.monthlyHistory.find((m) => m.monthShort === monthShort);
  if (!monthData) return null;

  const savingsAmount = Math.round((monthData.competitorPrice - monthData.ourPrice) * 100) / 100;
  const savingsPct = Math.round((savingsAmount / monthData.competitorPrice) * 100);

  return {
    competitorPrice: monthData.competitorPrice,
    ourPrice: monthData.ourPrice,
    monthLabel: monthData.month,
    monthShort,
    saleLabel: monthData.saleLabel,
    hasSale: monthData.hasSale,
    competitorProductName: competitorProduct.competitorProductName,
    competitorUrl: competitorProduct.competitorUrl,
    savingsAmount,
    savingsPct,
  };
}

/** True if a product's price is managed by the auto-pricing engine. */
export function isAutoTrackedProduct(productId: number): boolean {
  return productId in PRODUCT_COMPETITOR_MAP;
}

/**
 * Returns auto-adjusted prices for ALL tracked products for the current month.
 * Useful for batch rendering in admin tables.
 */
export function getAllAutoAdjustedPrices(
  date: Date = new Date(),
): Record<number, AutoPriceResult> {
  const results: Record<number, AutoPriceResult> = {};
  for (const id of Object.keys(PRODUCT_COMPETITOR_MAP).map(Number)) {
    const result = getAutoAdjustedPrice(id, date);
    if (result) results[id] = result;
  }
  return results;
}
