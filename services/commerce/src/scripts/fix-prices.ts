/**
 * fix-prices.ts
 *
 * One-shot script to correct product prices that were seeded with wrong values.
 * Prices in Medusa v2 are stored in the major currency unit (dollars for USD).
 * Run via:  cd services/commerce && npx medusa exec src/scripts/fix-prices.ts
 */

import { Client } from "pg";

// ── Correction map ────────────────────────────────────────────────────────────
// Key = exact SKU, Value = correct price in dollars (major currency unit)

const corrections: Record<string, number> = {
  // 1" Vinyl Blinds (custom-size)
  "VB-1-WHT-CL":  20.48,
  "VB-1-WHT-CDL": 24.48,
  "VB-1-IVY-CDL": 25.48,

  // 1" Vinyl Plus Blinds (custom-size)
  "VPB-1-WHT-CL":  41.73,
  "VPB-1-WHT-CDL": 45.73,

  // 2" Faux Wood Blinds (custom-size)
  "FWB-2-WHT-CL":  27.10,
  "FWB-2-NAT-CDL": 32.10,
  "FWB-2-ESP-CDL": 34.10,

  // 1" Aluminum Blinds (custom-size)
  "AB-1-WHT-CL":  11.81,
  "AB-1-WHT-CDL": 14.81,
  "AB-1-GRY-CL":  12.81,
  "AB-1-BRZ-CL":  12.81,

  // Aluminum Business Class (custom-size)
  "ABCL-1-WHT-CL":  23.03,
  "ABCL-1-WHT-CDL": 27.03,
  "ABCL-1-GRY-CL":  24.03,
  "ABCL-1-BLK-CL":  24.03,

  // Vertical Blinds (stock sizes)
  "VB-STD-54X84":  18.78,
  "VB-STD-66X84":  21.33,
  "VB-STD-78X84":  23.88,
  "VB-STD-102X84": 29.83,
  "VB-STD-104X84": 30.68,
  "VB-STD-110X84": 32.38,
};

// Stock mini blinds — uniform price per color across all sizes (dollars)
const VMB_COLORS: Record<string, number>  = { WHI: 13.68, IVO: 15.18 };
const VPMB_COLORS: Record<string, number> = { WHI: 36.71, IVO: 38.51, GRA: 40.31 };
const AMB_COLORS: Record<string, number>  = { WHI: 11.81, GRA: 13.31, BRO: 14.81 };

const stockSizes = ["23X64", "23X72", "27X64", "27X72", "31X64", "31X72", "35X64", "35X72", "46X64", "46X72"];

for (const sz of stockSizes) {
  for (const [col, amt] of Object.entries(VMB_COLORS))  corrections[`VMB-1-${sz}-${col}`]  = amt;
  for (const [col, amt] of Object.entries(VPMB_COLORS)) corrections[`VPMB-1-${sz}-${col}`] = amt;
  for (const [col, amt] of Object.entries(AMB_COLORS))  corrections[`AMB-1-${sz}-${col}`]  = amt;
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default async function fixPrices() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  let updated = 0;
  let skipped = 0;

  try {
    await client.query("BEGIN");

    for (const [sku, newAmount] of Object.entries(corrections)) {
      const { rowCount } = await client.query(
        `UPDATE price p
           SET amount = $1, updated_at = NOW()
           FROM product_variant pv
           JOIN product_variant_price_set pvps ON pvps.variant_id = pv.id
           JOIN price_set ps ON ps.id = pvps.price_set_id
          WHERE p.price_set_id = ps.id
            AND pv.sku = $2
            AND p.currency_code = 'usd'
            AND p.amount <> $1`,
        [newAmount, sku],
      );

      if ((rowCount ?? 0) > 0) {
        console.log(`  ✓ ${sku}: $${newAmount}`);
        updated++;
      } else {
        skipped++;
      }
    }

    await client.query("COMMIT");
    console.log(`\nDone — ${updated} prices updated, ${skipped} already correct or not found.`);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Price update failed, rolled back:", err);
    throw err;
  } finally {
    await client.end();
  }
}
