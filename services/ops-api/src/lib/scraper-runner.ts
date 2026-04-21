import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  appendJobLog,
  completeJob,
  createJob,
  failJob,
  getSourceById,
  getSourceUrls,
} from "./scraper-store.js";
import { getOpsDbPool } from "./db.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MONOREPO_ROOT = resolve(__dirname, "../../../../");
const WEB_SCRAPING_DIR = resolve(MONOREPO_ROOT, "Web Scrapping");
const WORKERS_DIR = resolve(MONOREPO_ROOT, "services/workers");
const OPS_API_URL = process.env.OPS_API_BASE_URL ?? "http://localhost:4000";

// Cloud Run Jobs config — set when deployed on GCP
const GCP_PROJECT  = process.env.GOOGLE_CLOUD_PROJECT ?? "";
const GCP_REGION   = process.env.CLOUD_RUN_REGION ?? "us-central1";
const IS_CLOUD_RUN = Boolean(GCP_PROJECT && process.env.K_SERVICE); // K_SERVICE is set by Cloud Run

// Slugs that have a dedicated Cloud Run Job in production
const CLOUD_RUN_JOB_MAP: Record<string, string> = {
  "hd-supply":  "scraper-hd-supply",
  "blinds-com": "scraper-blinds-com",
};

const runningProcesses = new Map<string, ReturnType<typeof spawn>>();

export function listActiveJobIds(): string[] {
  return [...runningProcesses.keys()];
}

export function killJob(jobId: string): boolean {
  const proc = runningProcesses.get(jobId);
  if (!proc) return false;
  proc.kill("SIGTERM");
  return true;
}

// ── Cloud Run Jobs API ────────────────────────────────────────────────────────

async function getGcpAccessToken(): Promise<string> {
  const res = await fetch(
    "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token",
    { headers: { "Metadata-Flavor": "Google" } },
  );
  const { access_token } = await res.json() as { access_token: string };
  return access_token;
}

async function triggerCloudRunJob(
  jobName: string,
  argOverrides: string[],
): Promise<string> {
  const token = await getGcpAccessToken();
  const url = `https://run.googleapis.com/v2/projects/${GCP_PROJECT}/locations/${GCP_REGION}/jobs/${jobName}:run`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      overrides: { containerOverrides: [{ args: argOverrides }] },
    }),
  });
  if (!res.ok) throw new Error(`Cloud Run Jobs API ${res.status}: ${await res.text()}`);
  const data = await res.json() as { name: string };
  return data.name; // execution resource name
}

async function pollCloudRunExecution(
  executionName: string,
  jobId: string,
  timeoutMs = 600_000,
): Promise<void> {
  const token = await getGcpAccessToken();
  const url = `https://run.googleapis.com/v2/${executionName}`;
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 10_000));
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) continue;
    const exec = await res.json() as {
      conditions?: Array<{ type: string; state: string; message?: string }>;
    };
    const ready = exec.conditions?.find((c) => c.type === "Completed");
    if (!ready) continue;
    if (ready.state === "CONDITION_SUCCEEDED") return;
    if (ready.state === "CONDITION_FAILED") {
      throw new Error(`Cloud Run execution failed: ${ready.message ?? "unknown"}`);
    }
  }
  throw new Error("Cloud Run Job execution timed out");
}

async function runViaCloudRunJob(
  slug: string,
  argOverrides: string[],
  jobId: string,
): Promise<void> {
  const jobName = CLOUD_RUN_JOB_MAP[slug];
  if (!jobName) throw new Error(`No Cloud Run Job mapped for slug: ${slug}`);
  await appendJobLog(jobId, `[cloud-run] triggering ${jobName}…\n`);
  const executionName = await triggerCloudRunJob(jobName, argOverrides);
  await appendJobLog(jobId, `[cloud-run] execution: ${executionName}\n`);
  await pollCloudRunExecution(executionName, jobId);
  await appendJobLog(jobId, "[cloud-run] execution completed ✓\n");
}

function run(
  cmd: string,
  args: string[],
  cwd: string,
  jobId: string,
  extraEnv: Record<string, string> = {},
): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, { cwd, env: { ...process.env, ...extraEnv } });
    runningProcesses.set(jobId, proc);

    proc.stdout.on("data", (d: Buffer) => {
      void appendJobLog(jobId, d.toString());
    });
    proc.stderr.on("data", (d: Buffer) => {
      void appendJobLog(jobId, d.toString());
    });
    proc.on("close", (code, signal) => {
      runningProcesses.delete(jobId);
      if (code === 0) resolve();
      else reject(new Error(signal ? `Killed (${signal})` : `Process exited with code ${code}`));
    });
    proc.on("error", (err) => {
      runningProcesses.delete(jobId);
      reject(err);
    });
  });
}

const HD_SUPPLY_CATEGORY_URL =
  "https://hdsupplysolutions.com/c/window-coverings-00-10" +
  "/blinds-accessories-00-10-5/blinds-00-10-5-10" +
  "/horizontal-blinds-00-10-5-10-5/faux-wood-blinds-00-10-5-10-5-10";

function competitorFromSlug(slug: string): string {
  return slug;
}

async function loadAnchorSizes(handles: string[]): Promise<string> {
  const pool = getOpsDbPool();
  const client = await pool.connect();
  try {
    const { rows } = await client.query<{ size_key: string }>(
      `SELECT DISTINCT ov.value AS size_key
       FROM product_variant pv
       JOIN product p ON p.id = pv.product_id
       JOIN product_variant_option pvo ON pvo.variant_id = pv.id
       JOIN product_option_value ov ON ov.id = pvo.option_value_id
       JOIN product_option o ON o.id = ov.option_id
       WHERE p.handle = ANY($1) AND o.title = 'Size'
       ORDER BY ov.value`,
      [handles],
    );
    return rows.map((r) => r.size_key).join(",");
  } finally {
    client.release();
  }
}

function scraperCommandForSource(slug: string, urls: string[], anchorSizes = "") {
  // HD Supply: category-page scraper — no per-URL visits, headless Playwright
  if (slug === "hd-supply") {
    const outputDir = "output_hdsupply";
    const categoryUrl = urls[0] ?? HD_SUPPLY_CATEGORY_URL;
    const scriptArgs = [
      "hdsupply_scraper.py",
      "--category-url", categoryUrl,
      "--output", `${outputDir}/products.csv`,
      "--headless",
    ];
    if (anchorSizes) scriptArgs.push("--anchor-sizes", anchorSizes);
    return { cmd: "python3", args: scriptArgs, outputDir };
  }

  const outputDir = slug === "lowes" ? "output_lowes" : "output_v5";
  const script = slug === "lowes" ? "lowes_scraper.py" : "blinds_scraper_v5.py";
  const scriptArgs = [
    script,
    "--urls", urls.join(","),
    "--output", `${outputDir}/products.csv`,
  ];
  if (anchorSizes) scriptArgs.push("--anchor-sizes", anchorSizes);

  if (slug === "lowes") {
    return { cmd: "xvfb-run", args: ["-a", "python3", ...scriptArgs], outputDir };
  }
  return { cmd: "python3", args: scriptArgs, outputDir };
}

async function runCsvImport(
  csvPath: string,
  competitor: string,
  replace: boolean,
  jobId: string,
): Promise<void> {
  const args = [
    "-c",
    [
      "import csv, os, pipeline",
      "with open(os.environ['COMPETITOR_CSV_PATH'], newline='', encoding='utf-8') as f:",
      "    rows = list(csv.DictReader(f))",
      "pipeline.import_rows(",
      "    rows,",
      "    competitor=os.environ['COMPETITOR_SOURCE'],",
      "    ops_api_url=os.environ['OPS_API_URL'],",
      "    replace=os.environ.get('COMPETITOR_REPLACE', 'true').lower() == 'true',",
      ")",
    ].join("\n"),
  ];

  await run("python3", args, WEB_SCRAPING_DIR, jobId, {
    COMPETITOR_CSV_PATH: csvPath,
    COMPETITOR_SOURCE: competitor,
    COMPETITOR_REPLACE: replace ? "true" : "false",
    OPS_API_URL,
  });
}

function outputDirForSlug(slug: string): string {
  if (slug === "lowes") return "output_lowes";
  if (slug === "hd-supply") return "output_hdsupply";
  return "output_v5";
}

async function getSourceContext(sourceId: string) {
  const source = await getSourceById(sourceId);
  if (!source) throw new Error("Scraper source not found");

  const competitor = competitorFromSlug(source.slug);
  const outputDir = outputDirForSlug(source.slug);

  return {
    source,
    competitor,
    csvPath: resolve(WEB_SCRAPING_DIR, outputDir, "products.csv"),
    imagesDir: resolve(WEB_SCRAPING_DIR, outputDir, "images"),
  };
}

async function triggerPricingRefresh(): Promise<void> {
  const res = await fetch("http://localhost:4000/api/v1/competitor-pricing/refresh", {
    method: "POST",
  });
  if (!res.ok) throw new Error(`Refresh failed: ${res.status}`);
}

async function clearStaleData(sourceId: string): Promise<void> {
  const ctx = await getSourceContext(sourceId);
  const pool = getOpsDbPool();
  const client = await pool.connect();
  try {
    const { rows: urlRows } = await client.query(
      "SELECT url FROM ops.scraper_url WHERE source_id = $1",
      [sourceId],
    );
    if (!urlRows.length) return;
    const urls = urlRows.map((r) => r.url as string);

    // Extract product IDs from URLs (last path segment)
    const productIds = urls.map((u) => u.split("/").pop()).filter(Boolean);

    await client.query(
      "DELETE FROM ops.competitor_matches WHERE competitor = $1 AND competitor_url = ANY($2::text[])",
      [ctx.competitor, urls],
    );
    if (productIds.length) {
      await client.query(
        `DELETE FROM ops.scraped_catalog
         WHERE competitor = $1
           AND competitor_product_id = ANY($2::text[])`,
        [ctx.competitor, productIds],
      );
    }
  } finally {
    client.release();
  }
}

export async function runSingleUrlJob(sourceId: string, url: string, productHandle?: string | null): Promise<string> {
  const job = await createJob(sourceId, "pipeline");
  const ctx = await getSourceContext(sourceId);
  const handles = productHandle ? [productHandle] : [];
  const anchorSizes = handles.length ? await loadAnchorSizes(handles) : "";

  setImmediate(async () => {
    try {
      await appendJobLog(job.id, "── Step 1/2: Scraping URL + importing to pricing DB...\n");
      if (!anchorSizes) {
        await appendJobLog(job.id, "WARNING: URL has no product mapping — anchor sizes unavailable\n");
      }
      const scrape = scraperCommandForSource(ctx.source.slug, [url], anchorSizes);
      await run(scrape.cmd, [...scrape.args, "--ops-api-url", OPS_API_URL], WEB_SCRAPING_DIR, job.id);

      await appendJobLog(job.id, "\n── Step 2/2: Refreshing pricing matches...\n");
      await triggerPricingRefresh();
      await appendJobLog(job.id, "Pricing refresh triggered ✓\n");
      await appendJobLog(job.id, "Images downloaded locally — click '↑ Img' to upload to storefront.\n");

      await completeJob(job.id, 1);
    } catch (err) {
      await failJob(job.id, String(err));
    }
  });

  return job.id;
}

export async function runScrapeJob(sourceId: string): Promise<string> {
  const urls = await getSourceUrls(sourceId);
  if (!urls.length) throw new Error("No enabled URLs for this source");

  const job = await createJob(sourceId, "pipeline");
  const ctx = await getSourceContext(sourceId);
  const urlList = urls.map((u) => u.url);
  const handles = [...new Set(urls.map((u) => u.productHandle).filter((h): h is string => !!h))];
  const anchorSizes = handles.length ? await loadAnchorSizes(handles) : "";

  setImmediate(async () => {
    try {
      await appendJobLog(job.id, "── Step 1/2: Scraping all URLs + importing to pricing DB...\n");

      if (IS_CLOUD_RUN && CLOUD_RUN_JOB_MAP[ctx.source.slug]) {
        // Production: delegate to dedicated Cloud Run Job
        const scrape = scraperCommandForSource(ctx.source.slug, urlList, anchorSizes);
        await runViaCloudRunJob(ctx.source.slug, [...scrape.args, "--ops-api-url", OPS_API_URL], job.id);
      } else {
        const scrape = scraperCommandForSource(ctx.source.slug, urlList, anchorSizes);
        await run(scrape.cmd, [...scrape.args, "--ops-api-url", OPS_API_URL], WEB_SCRAPING_DIR, job.id);
      }

      await appendJobLog(job.id, "\n── Step 2/2: Refreshing pricing matches...\n");
      await triggerPricingRefresh();
      await appendJobLog(job.id, "Pricing refresh triggered ✓\n");
      await appendJobLog(job.id, "Images downloaded locally — click '↑ Img' to upload to storefront.\n");

      await completeJob(job.id, urls.length);
    } catch (err) {
      await failJob(job.id, String(err));
    }
  });

  return job.id;
}

export async function runImportJob(sourceId: string): Promise<string> {
  const job = await createJob(sourceId, "import");
  const ctx = await getSourceContext(sourceId);

  setImmediate(async () => {
    try {
      await appendJobLog(job.id, "Importing CSV audit log to pricing DB...\n");
      await runCsvImport(ctx.csvPath, ctx.competitor, true, job.id);
      await completeJob(job.id);
    } catch (err) {
      await failJob(job.id, String(err));
    }
  });

  return job.id;
}

export async function runUploadImagesJob(sourceId: string): Promise<string> {
  const job = await createJob(sourceId, "upload-images");
  const ctx = await getSourceContext(sourceId);

  setImmediate(async () => {
    try {
      await run("npm", ["run", "upload:competitor-images"], WORKERS_DIR, job.id, {
        SCRAPER_SOURCE_ID: sourceId,
        COMPETITOR_SOURCE: ctx.competitor,
        COMPETITOR_IMAGES_DIR: ctx.imagesDir,
      });
      await completeJob(job.id);
    } catch (err) {
      await failJob(job.id, String(err));
    }
  });

  return job.id;
}

export async function runPipelineJob(sourceId: string): Promise<string> {
  const urls = await getSourceUrls(sourceId);
  if (!urls.length) throw new Error("No enabled URLs for this source");

  const job = await createJob(sourceId, "pipeline");
  const ctx = await getSourceContext(sourceId);
  const urlList = urls.map((u) => u.url);
  const handles = [...new Set(urls.map((u) => u.productHandle).filter((h): h is string => !!h))];
  const anchorSizes = handles.length ? await loadAnchorSizes(handles) : "";

  setImmediate(async () => {
    try {
      await appendJobLog(job.id, "── Step 1/2: Scraping competitor URLs + importing to pricing DB...\n");

      if (IS_CLOUD_RUN && CLOUD_RUN_JOB_MAP[ctx.source.slug]) {
        const scrape = scraperCommandForSource(ctx.source.slug, urlList, anchorSizes);
        await runViaCloudRunJob(
          ctx.source.slug,
          [...scrape.args, "--ops-api-url", OPS_API_URL],
          job.id,
        );
      } else {
        const scrape = scraperCommandForSource(ctx.source.slug, urlList, anchorSizes);
        await run(
          scrape.cmd,
          [...scrape.args, "--no-images", "--ops-api-url", OPS_API_URL],
          WEB_SCRAPING_DIR,
          job.id,
        );
      }

      await appendJobLog(job.id, "\n── Step 2/2: Refreshing pricing matches...\n");
      await triggerPricingRefresh();
      await appendJobLog(job.id, "Pricing refresh triggered ✓\n");
      await appendJobLog(job.id, "Images downloaded locally — click '↑ Img' to upload to storefront.\n");

      await completeJob(job.id, urls.length);
    } catch (err) {
      await failJob(job.id, String(err));
    }
  });

  return job.id;
}

export async function runClearJob(sourceId: string): Promise<string> {
  const job = await createJob(sourceId, "clear");

  setImmediate(async () => {
    try {
      await appendJobLog(job.id, "Clearing stale data...\n");
      await clearStaleData(sourceId);
      await appendJobLog(job.id, "Done ✓\n");
      await completeJob(job.id);
    } catch (err) {
      await failJob(job.id, String(err));
    }
  });

  return job.id;
}
