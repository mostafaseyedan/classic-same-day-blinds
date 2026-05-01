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

      const { rows } = await client.query<{ updated_count: number }>(
        `WITH variant_context AS (
           SELECT pv.id AS variant_id,
                  pr.handle,
                  concat(
                    (split_part(lower(ov.value), 'x', 1)::numeric)::text,
                    '" W × ',
                    (split_part(lower(ov.value), 'x', 2)::numeric)::text,
                    '" H'
                  ) AS size_label
             FROM product_variant pv
             JOIN product pr ON pr.id = pv.product_id
             JOIN product_variant_option pvo ON pvo.variant_id = pv.id
             JOIN product_option_value ov ON ov.id = pvo.option_value_id
             JOIN product_option o ON o.id = ov.option_id
            WHERE pv.id = $2
              AND o.title = 'Size'
              AND ov.value ~* '^\\s*\\d+(\\.\\d+)?\\s*x\\s*\\d+(\\.\\d+)?\\s*$'
         ),
         updated_price AS (
           UPDATE price p
              SET amount = $1, updated_at = NOW()
             FROM price_set ps
             JOIN product_variant_price_set pvps ON pvps.price_set_id = ps.id
            WHERE p.price_set_id  = ps.id
              AND pvps.variant_id = $2
              AND p.currency_code = 'usd'
            RETURNING p.id
         ),
         updated_matches AS (
           UPDATE ops.competitor_matches m
              SET internal_price = $1,
                  price_delta = $1 - m.competitor_price,
                  alert_severity = CASE
                    WHEN $1 - m.competitor_price < 0 THEN 'critical'
                    WHEN $1 - m.competitor_price < 5 THEN 'warning'
                    ELSE NULL
                  END,
                  updated_at = NOW()
             FROM variant_context vc
            WHERE m.internal_sku = vc.handle
              AND m.size_label = vc.size_label
            RETURNING m.id
         )
         SELECT count(*)::int AS updated_count FROM updated_price`,
        [value, variantId],
      );

      if (!rows[0]?.updated_count) {
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
