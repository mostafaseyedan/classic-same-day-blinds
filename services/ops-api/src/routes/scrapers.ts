import type { FastifyInstance } from "fastify";
import { z } from "zod";

import {
  addUrl,
  cleanupOrphanedJobs,
  createSource,
  deleteSource,
  deleteUrl,
  getJob,
  listSources,
  updateSource,
  updateUrl,
} from "../lib/scraper-store.js";
import {
  killJob,
  listActiveJobIds,
  runClearJob,
  runImportJob,
  runPipelineJob,
  runScrapeJob,
  runSingleUrlJob,
  runUploadImagesJob,
} from "../lib/scraper-runner.js";
import { failJob } from "../lib/scraper-store.js";

const createSourceSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
});

const updateSourceSchema = z.object({
  name: z.string().min(1).optional(),
  enabled: z.boolean().optional(),
});

const addUrlSchema = z.object({
  url: z.string().url(),
  productHandle: z.string().nullable().optional(),
  label: z.string().nullable().optional(),
});

const updateUrlSchema = z.object({
  url: z.string().url().optional(),
  productHandle: z.string().nullable().optional(),
  label: z.string().nullable().optional(),
  enabled: z.boolean().optional(),
});

export async function registerScraperRoutes(app: FastifyInstance) {
  // ── Sources ────────────────────────────────────────────────────────────────

  app.get("/api/v1/scrapers", async (_req, reply) => {
    await cleanupOrphanedJobs(listActiveJobIds());
    const sources = await listSources();
    return reply.send({ sources });
  });

  app.post("/api/v1/scrapers", async (req, reply) => {
    const parsed = createSourceSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: "Invalid payload", details: parsed.error.flatten() });
    }
    const source = await createSource(parsed.data.name, parsed.data.slug);
    return reply.status(201).send({ source });
  });

  app.patch("/api/v1/scrapers/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const parsed = updateSourceSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: "Invalid payload", details: parsed.error.flatten() });
    }
    await updateSource(id, parsed.data);
    return reply.send({ ok: true });
  });

  app.delete("/api/v1/scrapers/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    await deleteSource(id);
    return reply.send({ ok: true });
  });

  // ── URLs ───────────────────────────────────────────────────────────────────

  app.post("/api/v1/scrapers/:id/urls", async (req, reply) => {
    const { id } = req.params as { id: string };
    const parsed = addUrlSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: "Invalid payload", details: parsed.error.flatten() });
    }
    const url = await addUrl(id, parsed.data.url, parsed.data.productHandle ?? null, parsed.data.label ?? null);
    return reply.status(201).send({ url });
  });

  app.patch("/api/v1/scrapers/:id/urls/:urlId", async (req, reply) => {
    const { urlId } = req.params as { id: string; urlId: string };
    const parsed = updateUrlSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: "Invalid payload", details: parsed.error.flatten() });
    }
    await updateUrl(urlId, parsed.data);
    return reply.send({ ok: true });
  });

  app.delete("/api/v1/scrapers/:id/urls/:urlId", async (req, reply) => {
    const { urlId } = req.params as { id: string; urlId: string };
    await deleteUrl(urlId);
    return reply.send({ ok: true });
  });

  // ── Job triggers ───────────────────────────────────────────────────────────

  app.post("/api/v1/scrapers/:id/run", async (req, reply) => {
    const { id } = req.params as { id: string };
    const jobId = await runScrapeJob(id);
    return reply.status(202).send({ jobId });
  });

  app.post("/api/v1/scrapers/:id/urls/:urlId/upload-images", async (req, reply) => {
    const { id } = req.params as { id: string; urlId: string };
    const jobId = await runUploadImagesJob(id);
    return reply.status(202).send({ jobId });
  });

  app.post("/api/v1/scrapers/:id/urls/:urlId/run", async (req, reply) => {
    const { id, urlId } = req.params as { id: string; urlId: string };
    const { rows } = await (await import("../lib/db.js")).getOpsDbPool().query(
      "SELECT url, product_handle FROM ops.scraper_url WHERE id=$1 AND source_id=$2",
      [urlId, id],
    );
    if (!rows[0]) return reply.status(404).send({ error: "URL not found" });
    const jobId = await runSingleUrlJob(id, rows[0].url as string, rows[0].product_handle as string | null);
    return reply.status(202).send({ jobId });
  });

  app.post("/api/v1/scrapers/:id/import", async (req, reply) => {
    const { id } = req.params as { id: string };
    const jobId = await runImportJob(id);
    return reply.status(202).send({ jobId });
  });

  app.post("/api/v1/scrapers/:id/upload-images", async (req, reply) => {
    const { id } = req.params as { id: string };
    const jobId = await runUploadImagesJob(id);
    return reply.status(202).send({ jobId });
  });

  app.post("/api/v1/scrapers/:id/pipeline", async (req, reply) => {
    const { id } = req.params as { id: string };
    const jobId = await runPipelineJob(id);
    return reply.status(202).send({ jobId });
  });

  app.post("/api/v1/scrapers/:id/clear", async (req, reply) => {
    const { id } = req.params as { id: string };
    const jobId = await runClearJob(id);
    return reply.status(202).send({ jobId });
  });

  // ── Job status & control ───────────────────────────────────────────────────

  app.get("/api/v1/scrapers/jobs/:jobId", async (req, reply) => {
    const { jobId } = req.params as { jobId: string };
    await cleanupOrphanedJobs(listActiveJobIds());
    const job = await getJob(jobId);
    if (!job) return reply.status(404).send({ error: "Job not found" });
    return reply.send({ job });
  });

  app.post("/api/v1/scrapers/jobs/:jobId/cancel", async (req, reply) => {
    const { jobId } = req.params as { jobId: string };
    const job = await getJob(jobId);
    if (!job) return reply.status(404).send({ error: "Job not found" });
    if (job.status !== "running") return reply.status(409).send({ error: "Job is not running" });
    killJob(jobId);
    await failJob(jobId, "Cancelled by user");
    return reply.send({ ok: true });
  });
}
