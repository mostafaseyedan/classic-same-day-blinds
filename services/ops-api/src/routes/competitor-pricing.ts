import type { FastifyInstance } from "fastify";
import { z } from "zod";

import {
  buildMatchesFromScrapedCatalog,
  clearScrapedCatalog,
  getCompetitorPricingDashboard,
  getMatchCompetitorPrice,
  runCompetitorRefreshPreview,
  updateCompetitorMatchState,
  upsertScrapedProducts,
  type ScrapedProduct,
} from "../lib/competitor-pricing-store.js";
import { type PriceModifier } from "../lib/medusa-admin-client.js";

const matchActionSchema = z.object({
  notes: z.string().trim().min(1).optional(),
});

const priceModifierSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("pct_off"),     value: z.number().positive().max(100) }),
  z.object({ type: z.literal("fixed_off"),   value: z.number().positive() }),
  z.object({ type: z.literal("fixed_price"), value: z.number().positive() }),
]).optional();

function applyModifier(competitorPrice: number, modifier: PriceModifier): number {
  switch (modifier.type) {
    case "pct_off":     return Math.max(0, competitorPrice * (1 - modifier.value / 100));
    case "fixed_off":   return Math.max(0, competitorPrice - modifier.value);
    case "fixed_price": return modifier.value;
  }
}

const approveBodySchema = z.object({
  notes: z.string().trim().min(1).optional(),
  price_modifier: priceModifierSchema,
});

const scrapedProductSchema = z.object({
  competitor_product_id: z.string(),
  product_name: z.string(),
  brand: z.string().nullable().optional(),
  url: z.string().url(),
  colors: z.string().nullable().optional(),
  color_count: z.number().int().default(0),
  width_min_in: z.number().nullable().optional(),
  width_max_in: z.number().nullable().optional(),
  height_min_in: z.number().nullable().optional(),
  height_max_in: z.number().nullable().optional(),
  fraction_options: z.string().nullable().optional(),
  displayed_price_usd: z.number().nullable().optional(),
  estimated_ship_date: z.string().nullable().optional(),
  image_urls: z.string().nullable().optional(),
  swatch_urls: z.string().nullable().optional(),
  anchor_prices: z.record(z.number()).nullable().optional(),
  description: z.string().nullable().optional(),
  specs_text: z.string().nullable().optional(),
  mounting_text: z.string().nullable().optional(),
  scraped_at: z.string(),
});

const importPayloadSchema = z.object({
  competitor: z.string().min(1).default("blinds-com"),
  products: z.array(scrapedProductSchema).min(1),
  buildMatches: z.boolean().default(true),
  replace: z.boolean().default(false),
  ourProducts: z.array(z.object({
    sku: z.string(),
    name: z.string(),
    category: z.string(),
    basePrice: z.number(),
    keywords: z.array(z.string()),
    priceEntries: z.array(z.object({
      width: z.number(),
      height: z.number(),
      price_usd: z.number(),
    })).optional(),
  })).optional(),
});

type MatchActionParams = {
  Params: {
    id: string;
  };
};

export async function registerCompetitorPricingRoutes(app: FastifyInstance) {
  app.get("/api/v1/competitor-pricing", async () => {
    return getCompetitorPricingDashboard();
  });

  app.get("/api/v1/competitor-pricing/summary", async () => {
    const dashboard = await getCompetitorPricingDashboard();

    return {
      workstream: dashboard.workstream,
      summary: dashboard.summary,
      refresh: dashboard.refresh,
    };
  });

  app.get("/api/v1/competitor-pricing/alerts", async () => {
    return {
      alerts: (await getCompetitorPricingDashboard()).alerts,
    };
  });

  app.get("/api/v1/competitor-pricing/matches", async () => {
    return {
      matches: (await getCompetitorPricingDashboard()).matches,
    };
  });

  app.post("/api/v1/competitor-pricing/import-scraped", async (request, reply) => {
    const parsed = importPayloadSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: "Invalid import payload",
        details: parsed.error.flatten(),
      });
    }

    const { competitor, products, buildMatches, replace, ourProducts } = parsed.data;
    if (replace) {
      const incomingIds = (products as ScrapedProduct[]).map((p) => p.competitor_product_id);
      await clearScrapedCatalog(competitor, incomingIds);
    }
    const upserted = await upsertScrapedProducts(products as ScrapedProduct[], competitor);

    let matchesCreated = 0;
    if (buildMatches && ourProducts?.length) {
      matchesCreated = await buildMatchesFromScrapedCatalog(ourProducts, competitor);
    }

    return reply.status(200).send({
      accepted: true,
      upserted,
      matchesCreated,
      message: `Imported ${upserted} scraped products from ${competitor}. Created/updated ${matchesCreated} competitor matches.`,
    });
  });

  app.post("/api/v1/competitor-pricing/refresh", async (request, reply) => {
    const dashboard = await runCompetitorRefreshPreview();

    return reply.status(202).send({
      accepted: true,
      queue: "competitor-refresh",
      workstream: dashboard.workstream,
      refresh: dashboard.refresh,
      alerts: dashboard.alerts,
      message:
        "Preview refresh queued. Replace the seeded competitor module with live scraping jobs before production.",
    });
  });

  app.post<MatchActionParams>("/api/v1/competitor-pricing/matches/:id/approve", async (request, reply) => {
    const parsed = approveBodySchema.safeParse(request.body ?? {});

    if (!parsed.success) {
      return reply.status(400).send({
        error: "Invalid approve payload",
        details: parsed.error.flatten(),
      });
    }

    // If a price modifier was supplied, compute the new internal price from
    // the match's current competitor price.
    let internalPrice: number | undefined;
    if (parsed.data.price_modifier) {
      const competitorPrice = await getMatchCompetitorPrice(request.params.id);
      if (competitorPrice != null) {
        internalPrice = applyModifier(competitorPrice, parsed.data.price_modifier as PriceModifier);
      }
    }

    const match = await updateCompetitorMatchState(request.params.id, {
      matchStatus: "matched",
      alertSeverity: undefined,
      notes: parsed.data.notes,
      internalPrice,
    });

    if (!match) {
      return reply.status(404).send({ error: "Match not found" });
    }

    return {
      updated: true,
      match,
    };
  });

  app.post<MatchActionParams>("/api/v1/competitor-pricing/matches/:id/suppress-alert", async (request, reply) => {
    const parsed = matchActionSchema.safeParse(request.body ?? {});

    if (!parsed.success) {
      return reply.status(400).send({
        error: "Invalid suppress payload",
        details: parsed.error.flatten(),
      });
    }

    const match = await updateCompetitorMatchState(request.params.id, {
      alertSeverity: undefined,
      notes: parsed.data.notes,
    });

    if (!match) {
      return reply.status(404).send({ error: "Match not found" });
    }

    return {
      updated: true,
      match,
    };
  });

  app.post<MatchActionParams>("/api/v1/competitor-pricing/matches/:id/ignore", async (request, reply) => {
    const parsed = matchActionSchema.safeParse(request.body ?? {});

    if (!parsed.success) {
      return reply.status(400).send({
        error: "Invalid ignore payload",
        details: parsed.error.flatten(),
      });
    }

    const match = await updateCompetitorMatchState(request.params.id, {
      matchStatus: "ignored",
      alertSeverity: undefined,
      notes: parsed.data.notes,
    });

    if (!match) {
      return reply.status(404).send({ error: "Match not found" });
    }

    return {
      updated: true,
      match,
    };
  });
}
