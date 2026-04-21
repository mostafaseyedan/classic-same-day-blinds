/**
 * Thin Medusa Admin API client used by ops-api.
 *
 * Auth flow: POST /auth/user/emailpass → {token}
 * Then every request carries Authorization: Bearer {token}
 *
 * Token is cached in-process and refreshed on 401.
 */

import { opsApiEnv } from "../config.js";
import { uploadCompetitorImages } from "./gcs.js";

// ── Price modifier ────────────────────────────────────────────────────────────

export type PriceModifier =
  | { type: "pct_off";     value: number }  // sell at (100 - value)% of competitor price
  | { type: "fixed_off";   value: number }  // subtract $value from competitor price
  | { type: "fixed_price"; value: number }; // use this exact price in USD

function applyPriceModifier(baseUsd: number, modifier?: PriceModifier): number {
  if (!modifier || baseUsd <= 0) return baseUsd;
  switch (modifier.type) {
    case "pct_off":
      return baseUsd * (1 - modifier.value / 100);
    case "fixed_off":
      return Math.max(0, baseUsd - modifier.value);
    case "fixed_price":
      return modifier.value;
  }
}

let cachedToken: string | null = null;

async function getAdminToken(): Promise<string> {
  if (cachedToken) return cachedToken;

  const { medusaBackendUrl, medusaAdminEmail, medusaAdminPassword } = opsApiEnv;

  if (!medusaAdminEmail || !medusaAdminPassword) {
    throw new Error(
      "MEDUSA_ADMIN_EMAIL and MEDUSA_ADMIN_PASSWORD must be set to use Medusa admin features",
    );
  }

  const res = await fetch(`${medusaBackendUrl}/auth/user/emailpass`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: medusaAdminEmail, password: medusaAdminPassword }),
  });

  if (!res.ok) {
    throw new Error(`Medusa admin auth failed: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as { token?: string };
  if (!data.token) {
    throw new Error("Medusa auth response missing token");
  }

  cachedToken = data.token;
  return cachedToken;
}

async function medusaAdmin<T>(
  method: "GET" | "POST" | "DELETE",
  path: string,
  body?: unknown,
): Promise<T> {
  const { medusaBackendUrl } = opsApiEnv;
  const token = await getAdminToken();

  const res = await fetch(`${medusaBackendUrl}${path}`, {
    method,
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    // Token expired — clear cache and retry once
    cachedToken = null;
    const freshToken = await getAdminToken();
    const retry = await fetch(`${medusaBackendUrl}${path}`, {
      method,
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${freshToken}`,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!retry.ok) {
      throw new Error(`Medusa ${method} ${path} failed after token refresh: ${retry.status} ${await retry.text()}`);
    }
    return retry.json() as Promise<T>;
  }

  if (!res.ok) {
    throw new Error(`Medusa ${method} ${path} failed: ${res.status} ${await res.text()}`);
  }

  return res.json() as Promise<T>;
}

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
