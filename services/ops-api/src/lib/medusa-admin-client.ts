/**
 * Thin Medusa Admin API client used by ops-api.
 *
 * Auth flow: POST /auth/user/emailpass → {token}
 * Then every request carries Authorization: Bearer {token}
 *
 * Token is cached in-process and refreshed on 401.
 */


// ── Price modifier ────────────────────────────────────────────────────────────

export type PriceModifier =
  | { type: "pct_off";     value: number }  // sell at (100 - value)% of competitor price
  | { type: "fixed_off";   value: number }  // subtract $value from competitor price
  | { type: "fixed_price"; value: number }; // use this exact price in USD

// ── Store product sync ────────────────────────────────────────────────────────

export type MedusaProductForSync = {
  id: string;
  handle: string;
  title: string;
  categories: Array<{ name: string }>;
  options: Array<{ id: string; title: string; values: Array<{ value: string }> }>;
  variants: Array<{
    id: string;
    title: string;
    sku: string | null;
    options: Array<{ option_id: string; value: string }>;
    calculated_price: { calculated_amount: number | null } | null;
  }>;
};

export async function fetchMedusaProductsWithPrices(
  medusaBackendUrl: string,
  publishableKey: string,
): Promise<MedusaProductForSync[]> {
  const resp = await fetch(
    `${medusaBackendUrl}/store/products?fields=*variants.calculated_price,*variants.options,*options,*categories&limit=100`,
    { headers: { "x-publishable-api-key": publishableKey } },
  );
  if (!resp.ok) {
    throw new Error(`Medusa store products fetch failed: ${resp.status}`);
  }
  const data = (await resp.json()) as { products: MedusaProductForSync[] };
  return data.products;
}
