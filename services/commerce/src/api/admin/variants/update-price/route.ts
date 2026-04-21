import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Client } from "pg";

type Body =
  | { field: "source_price"; sku: string; sizeLabel: string; value: number }
  | { field: "store_price";  variantId: string;              value: number };

/**
 * POST /admin/variants/update-price
 *
 * source_price — stores cost in product.metadata.cost_prices[sizeLabel] (by product handle)
 * store_price  — updates the USD price for a specific variant (by variantId)
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = req.body as Body;
  const { field, value } = body;

  if (!field || typeof value !== "number" || value < 0) {
    return res.status(400).json({ error: "Invalid payload: field and non-negative value are required." });
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    await client.query("BEGIN");

    if (field === "source_price") {
      const { sku: handle, sizeLabel } = body as Extract<Body, { field: "source_price" }>;
      if (!handle || !sizeLabel) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: "source_price requires sku and sizeLabel." });
      }

      const { rowCount } = await client.query(
        `UPDATE product
            SET metadata   = COALESCE(metadata, '{}') ||
                             jsonb_build_object(
                               'cost_prices',
                               COALESCE(metadata->'cost_prices', '{}'::jsonb) ||
                               jsonb_build_object($1::text, $2::numeric)
                             ),
                updated_at = NOW()
          WHERE handle = $3`,
        [sizeLabel, value, handle],
      );

      if (!rowCount) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: `Product not found: ${handle}` });
      }

    } else {
      // store_price — update USD price for this specific variant
      const { variantId } = body as Extract<Body, { field: "store_price" }>;
      if (!variantId) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: "store_price requires variantId." });
      }

      const { rowCount } = await client.query(
        `UPDATE price p
            SET amount = $1, updated_at = NOW()
           FROM price_set ps
           JOIN product_variant_price_set pvps ON pvps.price_set_id = ps.id
          WHERE p.price_set_id  = ps.id
            AND pvps.variant_id = $2
            AND p.currency_code = 'usd'`,
        [value, variantId],
      );

      if (!rowCount) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: `No USD price found for variant: ${variantId}` });
      }
    }

    await client.query("COMMIT");
    res.json({ ok: true });
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    await client.end();
  }
}
