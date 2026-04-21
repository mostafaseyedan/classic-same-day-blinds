import type { PoolClient } from "pg";
import { getOpsDbPool } from "./db.js";

async function withClient<T>(handler: (client: PoolClient) => Promise<T>): Promise<T> {
  const pool = getOpsDbPool();
  const client = await pool.connect();
  try {
    return await handler(client);
  } finally {
    client.release();
  }
}

export interface ScraperSource {
  id: string;
  name: string;
  slug: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  urls: ScraperUrl[];
  lastJob: ScraperJob | null;
}

export interface ScraperUrl {
  id: string;
  sourceId: string;
  url: string;
  productHandle: string | null;
  label: string | null;
  enabled: boolean;
}

export interface ScraperJob {
  id: string;
  sourceId: string;
  type: "scrape" | "import" | "pipeline" | "upload-images" | "clear";
  status: "running" | "completed" | "failed";
  startedAt: string;
  completedAt: string | null;
  rowsScraped: number | null;
  error: string | null;
  log: string | null;
}

const ORPHANED_JOB_ERROR = "Job marked failed automatically because the scraper process is no longer running.";

function makeId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export async function initScraperStore(): Promise<void> {
  return withClient(async (client) => {
    await client.query(`
      create schema if not exists ops;

      create table if not exists ops.scraper_source (
        id         text primary key,
        name       text not null,
        slug       text not null unique,
        enabled    boolean not null default true,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      );

      create table if not exists ops.scraper_url (
        id             text primary key,
        source_id      text not null references ops.scraper_source(id) on delete cascade,
        url            text not null,
        product_handle text null,
        label          text null,
        enabled        boolean not null default true,
        created_at     timestamptz not null default now(),
        updated_at     timestamptz not null default now()
      );

      create table if not exists ops.scraper_job (
        id           text primary key,
        source_id    text not null references ops.scraper_source(id) on delete cascade,
        type         text not null,
        status       text not null default 'running',
        started_at   timestamptz not null default now(),
        completed_at timestamptz null,
        rows_scraped integer null,
        error        text null,
        log          text null
      );
    `);

    // Seed blinds.com source if not exists
    const { rowCount } = await client.query(
      "SELECT 1 FROM ops.scraper_source WHERE slug = 'blinds-com'",
    );
    if (!rowCount) {
      const sourceId = "src_blinds_com";
      await client.query(
        `INSERT INTO ops.scraper_source (id, name, slug, enabled)
         VALUES ($1, 'Blinds.com', 'blinds-com', true)`,
        [sourceId],
      );
      const urls = [
        {
          url: "https://www.blinds.com/p/blindscom-cordless-2-inch-faux-wood-blinds/539901",
          handle: "faux-wood-blinds-2-inch",
          label: "Cordless 2\" Faux Wood Blinds",
        },
        {
          url: "https://www.blinds.com/p/bali-vinyl-vertical-blinds/505210",
          handle: "vertical-blinds-made-to-fit",
          label: "Bali Vinyl Vertical Blinds",
        },
        {
          url: "https://www.blinds.com/p/blindscom-no-drill-1-inch-aluminum-mini-blinds/706351",
          handle: "aluminum-business-class-blinds-1-inch",
          label: "No Drill 1\" Aluminum Mini Blinds",
        },
      ];
      for (const u of urls) {
        await client.query(
          `INSERT INTO ops.scraper_url (id, source_id, url, product_handle, label)
           VALUES ($1, $2, $3, $4, $5)`,
          [makeId("surl"), sourceId, u.url, u.handle, u.label],
        );
      }
    }

    // Seed HD Supply source if not exists
    const { rowCount: hdRowCount } = await client.query(
      "SELECT 1 FROM ops.scraper_source WHERE slug = 'hd-supply'",
    );
    if (!hdRowCount) {
      const hdSourceId = "src_hd_supply";
      await client.query(
        `INSERT INTO ops.scraper_source (id, name, slug, enabled)
         VALUES ($1, 'HD Supply', 'hd-supply', true)`,
        [hdSourceId],
      );
      await client.query(
        `INSERT INTO ops.scraper_url (id, source_id, url, product_handle, label)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          makeId("surl"),
          hdSourceId,
          "https://hdsupplysolutions.com/c/window-coverings-00-10/blinds-accessories-00-10-5/blinds-00-10-5-10/horizontal-blinds-00-10-5-10-5/faux-wood-blinds-00-10-5-10-5-10",
          "faux-wood-blinds-2-inch",
          "Faux Wood Blinds — category",
        ],
      );
    }
  });
}

export async function cleanupOrphanedJobs(activeJobIds: Iterable<string> = [], error = ORPHANED_JOB_ERROR): Promise<number> {
  const active = [...new Set(activeJobIds)];
  return withClient(async (client) => {
    let result;
    if (active.length) {
      result = await client.query(
        `UPDATE ops.scraper_job
         SET status = 'failed',
             completed_at = NOW(),
             error = $2,
             log = COALESCE(log, '') || CASE
               WHEN COALESCE(log, '') = '' THEN $3
               ELSE E'\n' || $3
             END
         WHERE status = 'running'
           AND NOT (id = ANY($1::text[]))`,
        [active, error.slice(0, 2000), `[ops-api] ${error}`],
      );
    } else {
      result = await client.query(
        `UPDATE ops.scraper_job
         SET status = 'failed',
             completed_at = NOW(),
             error = $1,
             log = COALESCE(log, '') || CASE
               WHEN COALESCE(log, '') = '' THEN $2
               ELSE E'\n' || $2
             END
         WHERE status = 'running'`,
        [error.slice(0, 2000), `[ops-api] ${error}`],
      );
    }
    return result.rowCount ?? 0;
  });
}

function mapJob(row: Record<string, unknown>): ScraperJob {
  return {
    id: row.id as string,
    sourceId: row.source_id as string,
    type: row.type as ScraperJob["type"],
    status: row.status as ScraperJob["status"],
    startedAt: (row.started_at as Date).toISOString(),
    completedAt: row.completed_at ? (row.completed_at as Date).toISOString() : null,
    rowsScraped: row.rows_scraped as number | null,
    error: row.error as string | null,
    log: row.log as string | null,
  };
}

export async function listSources(): Promise<ScraperSource[]> {
  return withClient(async (client) => {
    const { rows: sources } = await client.query(
      `SELECT * FROM ops.scraper_source ORDER BY created_at`,
    );
    const { rows: urls } = await client.query(
      `SELECT * FROM ops.scraper_url ORDER BY created_at`,
    );
    const { rows: jobs } = await client.query(
      `SELECT DISTINCT ON (source_id) * FROM ops.scraper_job
       ORDER BY source_id, started_at DESC`,
    );

    return sources.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      enabled: s.enabled,
      createdAt: s.created_at.toISOString(),
      updatedAt: s.updated_at.toISOString(),
      urls: urls
        .filter((u) => u.source_id === s.id)
        .map((u) => ({
          id: u.id,
          sourceId: u.source_id,
          url: u.url,
          productHandle: u.product_handle,
          label: u.label,
          enabled: u.enabled,
        })),
      lastJob: jobs.find((j) => j.source_id === s.id) ? mapJob(jobs.find((j) => j.source_id === s.id)!) : null,
    }));
  });
}

export async function createSource(name: string, slug: string): Promise<ScraperSource> {
  return withClient(async (client) => {
    const id = makeId("src");
    await client.query(
      `INSERT INTO ops.scraper_source (id, name, slug) VALUES ($1, $2, $3)`,
      [id, name, slug],
    );
    return { id, name, slug, enabled: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), urls: [], lastJob: null };
  });
}

export async function updateSource(id: string, patch: { name?: string; enabled?: boolean }): Promise<void> {
  return withClient(async (client) => {
    const sets: string[] = ["updated_at = NOW()"];
    const vals: unknown[] = [id];
    if (patch.name !== undefined) { sets.push(`name = $${vals.push(patch.name)}`); }
    if (patch.enabled !== undefined) { sets.push(`enabled = $${vals.push(patch.enabled)}`); }
    await client.query(`UPDATE ops.scraper_source SET ${sets.join(", ")} WHERE id = $1`, vals);
  });
}

export async function deleteSource(id: string): Promise<void> {
  return withClient(async (client) => {
    await client.query("DELETE FROM ops.scraper_source WHERE id = $1", [id]);
  });
}

export async function addUrl(sourceId: string, url: string, productHandle: string | null, label: string | null): Promise<ScraperUrl> {
  return withClient(async (client) => {
    const id = makeId("surl");
    await client.query(
      `INSERT INTO ops.scraper_url (id, source_id, url, product_handle, label) VALUES ($1,$2,$3,$4,$5)`,
      [id, sourceId, url, productHandle, label],
    );
    return { id, sourceId, url, productHandle, label, enabled: true };
  });
}

export async function updateUrl(id: string, patch: { url?: string; productHandle?: string | null; label?: string | null; enabled?: boolean }): Promise<void> {
  return withClient(async (client) => {
    const sets: string[] = ["updated_at = NOW()"];
    const vals: unknown[] = [id];
    if (patch.url !== undefined) { sets.push(`url = $${vals.push(patch.url)}`); }
    if (patch.productHandle !== undefined) { sets.push(`product_handle = $${vals.push(patch.productHandle)}`); }
    if (patch.label !== undefined) { sets.push(`label = $${vals.push(patch.label)}`); }
    if (patch.enabled !== undefined) { sets.push(`enabled = $${vals.push(patch.enabled)}`); }
    await client.query(`UPDATE ops.scraper_url SET ${sets.join(", ")} WHERE id = $1`, vals);
  });
}

export async function deleteUrl(id: string): Promise<void> {
  return withClient(async (client) => {
    await client.query("DELETE FROM ops.scraper_url WHERE id = $1", [id]);
  });
}

export async function createJob(sourceId: string, type: ScraperJob["type"]): Promise<ScraperJob> {
  return withClient(async (client) => {
    const id = makeId("job");
    await client.query(
      `INSERT INTO ops.scraper_job (id, source_id, type, status) VALUES ($1,$2,$3,'running')`,
      [id, sourceId, type],
    );
    return { id, sourceId, type, status: "running", startedAt: new Date().toISOString(), completedAt: null, rowsScraped: null, error: null, log: null };
  });
}

export async function appendJobLog(jobId: string, text: string): Promise<void> {
  return withClient(async (client) => {
    await client.query(
      `UPDATE ops.scraper_job
       SET log = CASE WHEN length(COALESCE(log,'')) > 49000 THEN log ELSE COALESCE(log,'') || $2 END
       WHERE id = $1`,
      [jobId, text],
    );
  });
}

export async function completeJob(jobId: string, rowsScraped?: number): Promise<void> {
  return withClient(async (client) => {
    await client.query(
      `UPDATE ops.scraper_job SET status='completed', completed_at=NOW(), rows_scraped=$2 WHERE id=$1`,
      [jobId, rowsScraped ?? null],
    );
  });
}

export async function failJob(jobId: string, error: string): Promise<void> {
  return withClient(async (client) => {
    await client.query(
      `UPDATE ops.scraper_job SET status='failed', completed_at=NOW(), error=$2 WHERE id=$1`,
      [jobId, error.slice(0, 2000)],
    );
  });
}

export async function getJob(jobId: string): Promise<ScraperJob | null> {
  return withClient(async (client) => {
    const { rows } = await client.query("SELECT * FROM ops.scraper_job WHERE id=$1", [jobId]);
    return rows[0] ? mapJob(rows[0]) : null;
  });
}

export async function getSourceUrls(sourceId: string): Promise<ScraperUrl[]> {
  return withClient(async (client) => {
    const { rows } = await client.query(
      "SELECT * FROM ops.scraper_url WHERE source_id=$1 AND enabled=true ORDER BY created_at",
      [sourceId],
    );
    return rows.map((u) => ({
      id: u.id, sourceId: u.source_id, url: u.url,
      productHandle: u.product_handle, label: u.label, enabled: u.enabled,
    }));
  });
}

export async function getSourceById(sourceId: string): Promise<ScraperSource | null> {
  return withClient(async (client) => {
    const { rows: sources } = await client.query(
      "SELECT * FROM ops.scraper_source WHERE id = $1",
      [sourceId],
    );
    const source = sources[0];
    if (!source) return null;

    const { rows: urls } = await client.query(
      "SELECT * FROM ops.scraper_url WHERE source_id = $1 ORDER BY created_at",
      [sourceId],
    );
    const { rows: jobs } = await client.query(
      `SELECT * FROM ops.scraper_job
       WHERE source_id = $1
       ORDER BY started_at DESC
       LIMIT 1`,
      [sourceId],
    );

    return {
      id: source.id,
      name: source.name,
      slug: source.slug,
      enabled: source.enabled,
      createdAt: source.created_at.toISOString(),
      updatedAt: source.updated_at.toISOString(),
      urls: urls.map((u) => ({
        id: u.id,
        sourceId: u.source_id,
        url: u.url,
        productHandle: u.product_handle,
        label: u.label,
        enabled: u.enabled,
      })),
      lastJob: jobs[0] ? mapJob(jobs[0]) : null,
    };
  });
}
