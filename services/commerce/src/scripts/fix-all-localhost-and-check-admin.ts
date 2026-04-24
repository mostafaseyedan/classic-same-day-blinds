import { ExecArgs } from "@medusajs/framework/types";
import { Client } from "pg";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const STATIC_DIR = path.join(process.cwd(), "static");
const LOCALHOST_PREFIX = "http://localhost:9000/static/";

function inferMimeType(f: string) {
  const e = path.extname(f).toLowerCase();
  return ({ ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" } as Record<string,string>)[e] ?? "image/jpeg";
}

export default async function fixAllLocalhostAndCheckAdmin(_args: ExecArgs) {
  const bucket = process.env.GCS_BUCKET_NAME!;
  const s3 = new S3Client({
    region: process.env.GCS_REGION ?? "us-central1",
    endpoint: "https://storage.googleapis.com",
    credentials: {
      accessKeyId: process.env.GCS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.GCS_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: true,
  });

  const db = new Client({ connectionString: process.env.DATABASE_URL });
  await db.connect();

  try {
    // --- Check admin users ---
    const { rows: users } = await db.query<{ email: string }>(
      `SELECT email FROM "user" WHERE deleted_at IS NULL`
    );
    console.log(`\nAdmin users in DB: ${users.length === 0 ? "NONE - needs creation" : users.map(u => u.email).join(", ")}`);

    // --- Upload helper ---
    const cache = new Map<string, string>();
    async function uploadToGcs(url: string): Promise<string> {
      if (cache.has(url)) return cache.get(url)!;
      const filename = url.replace(LOCALHOST_PREFIX, "");
      const localPath = path.join(STATIC_DIR, filename);
      if (!existsSync(localPath)) {
        console.warn(`  ⚠  not found locally: ${filename}`);
        return url;
      }
      const key = `products/${filename}`;
      await s3.send(new PutObjectCommand({
        Bucket: bucket, Key: key,
        Body: readFileSync(localPath),
        ContentType: inferMimeType(filename),
        ACL: "public-read",
      }));
      const newUrl = `https://storage.googleapis.com/${bucket}/${key}`;
      cache.set(url, newUrl);
      console.log(`  ✓  ${filename} → ${newUrl}`);
      return newUrl;
    }

    // --- product.thumbnail ---
    console.log("\n[product.thumbnail]");
    const { rows: products } = await db.query<{ id: string; thumbnail: string }>(
      `SELECT id, thumbnail FROM product WHERE thumbnail LIKE 'http://localhost%'`
    );
    for (const r of products) {
      const newUrl = await uploadToGcs(r.thumbnail);
      if (newUrl !== r.thumbnail) await db.query("UPDATE product SET thumbnail=$1 WHERE id=$2", [newUrl, r.id]);
    }

    // --- cart_line_item.thumbnail ---
    console.log("\n[cart_line_item.thumbnail]");
    const { rows: cartItems } = await db.query<{ id: string; thumbnail: string }>(
      `SELECT id, thumbnail FROM cart_line_item WHERE thumbnail LIKE 'http://localhost%'`
    );
    for (const r of cartItems) {
      const newUrl = await uploadToGcs(r.thumbnail);
      if (newUrl !== r.thumbnail) await db.query("UPDATE cart_line_item SET thumbnail=$1 WHERE id=$2", [newUrl, r.id]);
    }

    // --- order_line_item.thumbnail ---
    console.log("\n[order_line_item.thumbnail]");
    const { rows: orderItems } = await db.query<{ id: string; thumbnail: string }>(
      `SELECT id, thumbnail FROM order_line_item WHERE thumbnail LIKE 'http://localhost%'`
    );
    for (const r of orderItems) {
      const newUrl = await uploadToGcs(r.thumbnail);
      if (newUrl !== r.thumbnail) await db.query("UPDATE order_line_item SET thumbnail=$1 WHERE id=$2", [newUrl, r.id]);
    }

    // workflow_execution.context skipped — not user-facing, stale workflow state

    console.log(`\nDone. ${cache.size} unique files uploaded.`);
  } finally {
    await db.end();
  }
}
