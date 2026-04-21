import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Client } from "pg";

/**
 * GET /admin/variants/cost-prices?variants=handle1__size1,handle2__size2,...
 *
 * Cost price is stored per-variant in product.metadata.cost_prices[sizeLabel].
 * Returns { cost_prices: { "handle__sizeLabel": number | null } }
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const raw = req.query.variants as string | undefined;
  const pairs = raw
    ? raw.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  if (!pairs.length) {
    return res.json({ cost_prices: {} });
  }

  // Parse "handle__sizeLabel" pairs
  const parsed = pairs.map((p) => {
    const sep = p.indexOf("__");
    if (sep === -1) return { handle: p, sizeLabel: "" };
    return { handle: p.slice(0, sep), sizeLabel: p.slice(sep + 2) };
  });

  const uniqueHandles = [...new Set(parsed.map((p) => p.handle))];

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    const { rows } = await client.query<{ handle: string; cost_prices: Record<string, string> | null }>(
      `SELECT handle, metadata->'cost_prices' AS cost_prices
         FROM product
        WHERE handle = ANY($1::text[])`,
      [uniqueHandles],
    );

    const handleToRow = new Map(rows.map((r) => [r.handle, r.cost_prices]));

    const cost_prices: Record<string, number | null> = {};
    for (const { handle, sizeLabel } of parsed) {
      const key = `${handle}__${sizeLabel}`;
      const perVariant = handleToRow.get(handle);
      const raw = perVariant?.[sizeLabel];
      cost_prices[key] = raw != null ? parseFloat(raw) : null;
    }

    res.json({ cost_prices });
  } finally {
    await client.end();
  }
}
