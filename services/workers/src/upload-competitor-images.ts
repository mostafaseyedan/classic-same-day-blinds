/**
 * upload-competitor-images.ts
 *
 * Uploads scraped blinds.com product images to Medusa and appends them
 * to the corresponding storefront product galleries.
 *
 * Uses direct SQL to insert image records — avoids the Medusa admin API
 * product update which OOMs on products with many variants.
 *
 * Run:
 *   pnpm --filter @blinds/workers run upload:competitor-images
 */

import "./load-env.js";

import { readFileSync, readdirSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "pg";

const MEDUSA_URL = "http://localhost:9000";
const MEDUSA_EMAIL = "admin@blinds.com";
const MEDUSA_PASSWORD = "supersecret";
const DB_URL = "postgres://postgres:postgres@localhost:5432/blinds_commerce";

const __dirname = dirname(fileURLToPath(import.meta.url));
const COMPETITOR_SOURCE = process.env.COMPETITOR_SOURCE ?? "blinds-com";
const SCRAPER_SOURCE_ID = process.env.SCRAPER_SOURCE_ID ?? "";
const IMAGES_DIR = process.env.COMPETITOR_IMAGES_DIR
  ? resolve(process.env.COMPETITOR_IMAGES_DIR)
  : resolve(__dirname, "../../../Web Scrapping/output_v5/images");

function makeImageId(): string {
  return "img_" + randomBytes(16).toString("base64url").slice(0, 26).toUpperCase();
}

async function getJwt(): Promise<string> {
  const res = await fetch(`${MEDUSA_URL}/auth/user/emailpass`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: MEDUSA_EMAIL, password: MEDUSA_PASSWORD }),
  });
  if (!res.ok) throw new Error(`Auth failed: ${res.status} ${await res.text()}`);
  const data = await res.json() as { token: string };
  return data.token;
}

async function getProductId(db: Client, handle: string): Promise<string> {
  const { rows } = await db.query<{ id: string }>(
    "SELECT id FROM product WHERE handle = $1 AND deleted_at IS NULL",
    [handle],
  );
  if (!rows[0]) throw new Error(`Product not found in DB: ${handle}`);
  return rows[0].id;
}

async function getExistingImageUrls(db: Client, productId: string): Promise<Set<string>> {
  const { rows } = await db.query<{ url: string }>(
    "SELECT url FROM image WHERE product_id = $1 AND deleted_at IS NULL",
    [productId],
  );
  return new Set(rows.map((r) => r.url));
}

async function insertImageRow(db: Client, productId: string, url: string, rank: number): Promise<void> {
  await db.query(
    `INSERT INTO image (id, url, product_id, rank, created_at, updated_at)
     VALUES ($1, $2, $3, $4, NOW(), NOW())
     ON CONFLICT DO NOTHING`,
    [makeImageId(), url, productId, rank],
  );
}

async function uploadFile(jwt: string, filePath: string): Promise<string> {
  const filename = filePath.split("/").pop()!;
  const buffer = readFileSync(filePath);
  const form = new FormData();
  form.append("files", new Blob([buffer]), filename);

  const res = await fetch(`${MEDUSA_URL}/admin/uploads`, {
    method: "POST",
    headers: { authorization: `Bearer ${jwt}` },
    body: form,
  });
  if (!res.ok) throw new Error(`Upload failed for ${filename}: ${res.status} ${await res.text()}`);
  const data = await res.json() as { files: Array<{ url: string }> };
  const uploadedUrl = data.files[0]?.url;
  if (!uploadedUrl) {
    throw new Error(`Upload response missing file url for ${filename}`);
  }

  try {
    const parsed = new URL(uploadedUrl);
    if (!parsed.pathname.startsWith("/static/")) {
      parsed.pathname = `/static/${parsed.pathname.replace(/^\/+/, "")}`;
    }
    return parsed.toString();
  } catch {
    return `${MEDUSA_URL}/static/${filename}`;
  }
}

function extractCompetitorProductId(competitor: string, url: string): string | null {
  if (competitor === "lowes") {
    return /\/(\d+)(?:[/?#]|$)/.exec(url)?.[1] ?? null;
  }
  return /\/(\d+)(?:[/?#]|$)/.exec(url)?.[1] ?? null;
}

async function resolveImageDirectoryId(
  db: Client,
  competitor: string,
  url: string,
): Promise<string | null> {
  const { rows } = await db.query<{ competitor_product_id: string }>(
    `SELECT competitor_product_id
       FROM ops.scraped_catalog
      WHERE competitor = $1
        AND url = $2
      ORDER BY (image_urls IS NOT NULL) DESC, scraped_at DESC
      LIMIT 1`,
    [competitor, url],
  );

  if (rows[0]?.competitor_product_id) {
    return rows[0].competitor_product_id;
  }

  return extractCompetitorProductId(competitor, url);
}

async function run() {
  console.log("[upload] Connecting to DB and Medusa...");
  const db = new Client({ connectionString: DB_URL });
  await db.connect();

  const jwt = await getJwt();
  console.log("[upload] Authenticated ✓\n");

  try {
    const mappingRes = await db.query<{ url: string; product_handle: string | null }>(
      `SELECT url, product_handle
       FROM ops.scraper_url
       WHERE source_id = $1
         AND enabled = true
         AND product_handle IS NOT NULL`,
      [SCRAPER_SOURCE_ID],
    );

    for (const row of mappingRes.rows) {
      const handle = row.product_handle;
      const competitorId = await resolveImageDirectoryId(db, COMPETITOR_SOURCE, row.url);
      if (!handle || !competitorId) continue;

      console.log(`[upload] Processing ${handle} (competitor: ${competitorId})`);

      const productDir = resolve(IMAGES_DIR, competitorId);
      let files: string[];
      try {
        files = readdirSync(productDir)
          .filter((f) => f.startsWith("main_") && /\.(jpg|jpeg|png|webp)$/i.test(f))
          .sort()
          .map((f) => resolve(productDir, f));
      } catch {
        console.warn(`  No images directory at ${productDir}, skipping\n`);
        continue;
      }

      if (!files.length) {
        console.warn(`  No main_*.jpg images found, skipping\n`);
        continue;
      }

      console.log(`  Found ${files.length} images`);

      const productId = await getProductId(db, handle);
      const existingUrls = await getExistingImageUrls(db, productId);
      const startRank = existingUrls.size;

      let added = 0;
      for (let i = 0; i < files.length; i++) {
        const filePath = files[i];
        const filename = filePath.split("/").pop()!;
        try {
          const url = await uploadFile(jwt, filePath);
          if (!existingUrls.has(url)) {
            await insertImageRow(db, productId, url, startRank + added);
            added++;
            console.log(`  ✓ ${filename} → ${url}`);
          } else {
            console.log(`  ~ ${filename} already in DB, skipping`);
          }
        } catch (err) {
          console.error(`  ✗ ${filename}: ${err}`);
        }
      }

      console.log(`  Done: ${added} new images added (${existingUrls.size + added} total)\n`);
    }
  } finally {
    await db.end();
  }

  console.log("[upload] Done ✓");
}

run().catch((err) => {
  console.error("[upload] fatal:", err);
  process.exit(1);
});
