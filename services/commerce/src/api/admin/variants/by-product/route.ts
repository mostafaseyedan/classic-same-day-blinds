import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Client } from "pg";

/**
 * GET /admin/variants/by-product?handles=handle1,handle2,...
 *
 * Returns all variants for the given product handles, with their current USD price.
 * Used to match competitor rows to specific variant IDs for price editing.
 *
 * Response: { variants: { [handle]: Array<{ id, title, price_usd }> } }
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const raw = req.query.handles as string | undefined;
  const handles = raw ? raw.split(",").map((s) => s.trim()).filter(Boolean) : [];

  if (!handles.length) {
    return res.json({ variants: {} });
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    const { rows } = await client.query<{
      handle: string;
      variant_id: string;
      title: string;
      price_usd: string | null;
    }>(
      `SELECT pr.handle,
              pv.id   AS variant_id,
              pv.title,
              (
                SELECT p.amount
                  FROM price p
                  JOIN price_set ps       ON ps.id  = p.price_set_id
                  JOIN product_variant_price_set pvps ON pvps.price_set_id = ps.id
                 WHERE pvps.variant_id   = pv.id
                   AND p.currency_code  = 'usd'
                 LIMIT 1
              ) AS price_usd
         FROM product_variant pv
         JOIN product pr ON pr.id = pv.product_id
        WHERE pr.handle = ANY($1::text[])
        ORDER BY pr.handle, pv.title`,
      [handles],
    );

    const variants: Record<string, Array<{ id: string; title: string; price_usd: number | null }>> = {};
    for (const h of handles) variants[h] = [];

    for (const row of rows) {
      variants[row.handle].push({
        id: row.variant_id,
        title: row.title,
        price_usd: row.price_usd != null ? parseFloat(row.price_usd) : null,
      });
    }

    res.json({ variants });
  } finally {
    await client.end();
  }
}
