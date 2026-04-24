import { ExecArgs } from "@medusajs/framework/types";
import { Client } from "pg";

export default async function scanLocalhostUrls(_args: ExecArgs) {
  const db = new Client({ connectionString: process.env.DATABASE_URL });
  await db.connect();

  try {
    // Get all text/varchar/json columns in public schema
    const { rows: cols } = await db.query<{ table_name: string; column_name: string; data_type: string }>(`
      SELECT c.table_name, c.column_name, c.data_type
      FROM information_schema.columns c
      JOIN information_schema.tables t
        ON t.table_name = c.table_name AND t.table_schema = c.table_schema
      WHERE c.table_schema = 'public'
        AND t.table_type = 'BASE TABLE'
        AND c.data_type IN ('text', 'character varying', 'json', 'jsonb')
      ORDER BY c.table_name, c.column_name
    `);

    const findings: { table: string; column: string; count: number; samples: string[] }[] = [];

    for (const col of cols) {
      try {
        let query: string;
        if (col.data_type === 'jsonb' || col.data_type === 'json') {
          query = `SELECT COUNT(*) AS cnt FROM "${col.table_name}" WHERE "${col.column_name}"::text LIKE '%localhost%'`;
        } else {
          query = `SELECT COUNT(*) AS cnt FROM "${col.table_name}" WHERE "${col.column_name}" LIKE '%localhost%'`;
        }

        const { rows: [{ cnt }] } = await db.query<{ cnt: string }>(query);
        if (parseInt(cnt) > 0) {
          let sampleQuery: string;
          if (col.data_type === 'jsonb' || col.data_type === 'json') {
            sampleQuery = `SELECT "${col.column_name}"::text AS val FROM "${col.table_name}" WHERE "${col.column_name}"::text LIKE '%localhost%' LIMIT 2`;
          } else {
            sampleQuery = `SELECT "${col.column_name}" AS val FROM "${col.table_name}" WHERE "${col.column_name}" LIKE '%localhost%' LIMIT 2`;
          }
          const { rows: samples } = await db.query<{ val: string }>(sampleQuery);
          findings.push({
            table: col.table_name,
            column: col.column_name,
            count: parseInt(cnt),
            samples: samples.map(r => String(r.val).substring(0, 100)),
          });
        }
      } catch {
        // skip columns that fail (e.g. array types)
      }
    }

    if (findings.length === 0) {
      console.log("✓ No localhost URLs found in any table.");
    } else {
      console.log(`Found localhost URLs in ${findings.length} column(s):\n`);
      for (const f of findings) {
        console.log(`  ${f.table}.${f.column}  (${f.count} rows)`);
        for (const s of f.samples) {
          console.log(`    → ${s}`);
        }
      }
    }
  } finally {
    await db.end();
  }
}
