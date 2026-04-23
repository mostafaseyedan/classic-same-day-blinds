import { ExecArgs } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { Client } from "pg";

const STATIC_DIR = path.join(process.cwd(), "static");
const LOCALHOST_PREFIX = "http://localhost:9000/static/";

function inferMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  return (
    ({ ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" } as Record<string, string>)[ext]
    ?? "image/jpeg"
  );
}

export default async function migrateImagesToGcs({ container }: ExecArgs) {
  const fileModule = container.resolve(Modules.FILE);

  const db = new Client({ connectionString: process.env.DATABASE_URL });
  await db.connect();

  try {
    const { rows } = await db.query<{ id: string; url: string }>(
      `SELECT id, url FROM image WHERE url LIKE 'http://localhost%'`
    );

    console.log(`Found ${rows.length} image(s) with localhost URLs`);

    let updated = 0;
    let skipped = 0;

    for (const row of rows) {
      const filename = row.url.replace(LOCALHOST_PREFIX, "");
      const localPath = path.join(STATIC_DIR, filename);

      if (!existsSync(localPath)) {
        console.warn(`  ⚠  not found locally, skipping: ${filename}`);
        skipped++;
        continue;
      }

      const content = readFileSync(localPath).toString("base64");

      const [uploaded] = await fileModule.createFiles([{
        filename,
        mimeType: inferMimeType(filename),
        content,
        access: "public" as const,
      }]);

      await db.query("UPDATE image SET url = $1 WHERE id = $2", [uploaded.url, row.id]);

      console.log(`  ✓  ${filename}`);
      console.log(`     → ${uploaded.url}`);
      updated++;
    }

    console.log(`\nMigration complete: ${updated} updated, ${skipped} skipped`);
  } finally {
    await db.end();
  }
}
