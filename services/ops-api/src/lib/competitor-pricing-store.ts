import { buildCompetitorAlerts, buildCompetitorRefreshRun, buildCompetitorSummary } from "@blinds/integrations";
import type {
  CompetitorPricingDashboardResponse,
  CompetitorProductMatch,
  CompetitorRefreshRun,
} from "@blinds/types";
import type { PoolClient } from "pg";

import { fetchMedusaProductsWithPrices } from "./medusa-admin-client.js";
import type { MedusaProductForSync } from "./medusa-admin-client.js";

import { getOpsDbPool } from "./db.js";
import { opsApiEnv } from "../config.js";

type MatchRow = {
  id: string;
  internal_sku: string;
  internal_product_name: string;
  internal_category: string;
  competitor: CompetitorProductMatch["competitor"];
  competitor_product_name: string;
  competitor_url: string;
  match_status: CompetitorProductMatch["matchStatus"];
  confidence: number;
  size_label: string;
  currency_code: string;
  internal_price: number;
  competitor_price: number;
  source_price: number | null;
  price_delta: number;
  last_checked_at: Date;
  last_success_at: Date;
  scrape_status: CompetitorProductMatch["scrapeStatus"];
  alert_severity: CompetitorProductMatch["alertSeverity"] | null;
  notes: string | null;
  medusa_product_id: string | null;
  medusa_variant_id: string | null;
  storefront_slug: string | null;
};

type RefreshRow = {
  id: string;
  started_at: Date;
  completed_at: Date;
  status: CompetitorRefreshRun["status"];
  matches_checked: number;
  alerts_raised: number;
  failures: number;
  notes: string[];
};

function mapMatchRow(row: MatchRow): CompetitorProductMatch {
  return {
    id: row.id,
    internalSku: row.internal_sku,
    internalProductName: row.internal_product_name,
    internalCategory: row.internal_category,
    competitor: row.competitor,
    competitorProductName: row.competitor_product_name,
    competitorUrl: row.competitor_url,
    matchStatus: row.match_status,
    confidence: Number(row.confidence),
    sizeLabel: row.size_label,
    currentPrice: {
      label: row.size_label,
      internalPrice: Number(row.internal_price),
      competitorPrice: Number(row.competitor_price),
      sourcePrice: row.source_price != null ? Number(row.source_price) : undefined,
      currencyCode: row.currency_code,
    },
    priceDelta: Number(row.price_delta),
    lastCheckedAt: row.last_checked_at.toISOString(),
    lastSuccessAt: row.last_success_at.toISOString(),
    scrapeStatus: row.scrape_status,
    alertSeverity: row.alert_severity ?? undefined,
    notes: row.notes ?? undefined,
    medusaProductId: row.medusa_product_id ?? undefined,
    medusaVariantId: row.medusa_variant_id ?? undefined,
    storefrontSlug: row.storefront_slug ?? undefined,
  };
}

function mapRefreshRow(row: RefreshRow): CompetitorRefreshRun {
  return {
    id: row.id,
    startedAt: row.started_at.toISOString(),
    completedAt: row.completed_at.toISOString(),
    status: row.status,
    matchesChecked: row.matches_checked,
    alertsRaised: row.alerts_raised,
    failures: row.failures,
    notes: row.notes,
  };
}

async function withClient<T>(handler: (client: PoolClient) => Promise<T>) {
  const pool = getOpsDbPool();
  const client = await pool.connect();

  try {
    return await handler(client);
  } finally {
    client.release();
  }
}

// ── Scraped catalog ───────────────────────────────────────────────────────────

export type ScrapedProduct = {
  competitor_product_id: string;
  product_name: string;
  brand: string | null;
  url: string;
  colors: string | null;
  color_count: number;
  width_min_in: number | null;
  width_max_in: number | null;
  height_min_in: number | null;
  height_max_in: number | null;
  fraction_options: string | null;
  displayed_price_usd: number | null;
  estimated_ship_date: string | null;
  image_urls: string | null;
  swatch_urls: string | null;
  anchor_prices: Record<string, number> | null;
  description: string | null;
  specs_text: string | null;
  mounting_text: string | null;
  scraped_at: string;
};


export async function clearScrapedCatalog(competitor = "blinds-com", productIds?: string[]): Promise<void> {
  return withClient(async (client) => {
    if (productIds?.length) {
      await client.query(
        `delete from ops.scraped_catalog where competitor = $1 and competitor_product_id = ANY($2::text[])`,
        [competitor, productIds],
      );
    } else {
      await client.query(`delete from ops.scraped_catalog where competitor = $1`, [competitor]);
    }
  });
}

export async function upsertScrapedProducts(products: ScrapedProduct[], competitor = "blinds-com"): Promise<number> {
  return withClient(async (client) => {
    let upserted = 0;
    for (const p of products) {
      await client.query(
        `
          insert into ops.scraped_catalog (
            competitor_product_id, competitor, product_name, brand, url,
            colors, color_count,
            width_min_in, width_max_in, height_min_in, height_max_in,
            fraction_options, displayed_price_usd, estimated_ship_date,
            image_urls, swatch_urls, anchor_prices,
            description, specs_text, mounting_text,
            scraped_at, updated_at
          )
          values ($1,$21,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,now())
          on conflict (competitor_product_id, competitor) do update set
            product_name        = excluded.product_name,
            brand               = excluded.brand,
            url                 = excluded.url,
            colors              = excluded.colors,
            color_count         = excluded.color_count,
            width_min_in        = excluded.width_min_in,
            width_max_in        = excluded.width_max_in,
            height_min_in       = excluded.height_min_in,
            height_max_in       = excluded.height_max_in,
            fraction_options    = excluded.fraction_options,
            displayed_price_usd = excluded.displayed_price_usd,
            estimated_ship_date = excluded.estimated_ship_date,
            image_urls          = excluded.image_urls,
            swatch_urls         = excluded.swatch_urls,
            anchor_prices       = excluded.anchor_prices,
            description         = excluded.description,
            specs_text          = excluded.specs_text,
            mounting_text       = excluded.mounting_text,
            scraped_at          = excluded.scraped_at,
            updated_at          = now()
        `,
        [
          p.competitor_product_id,
          p.product_name,
          p.brand ?? null,
          p.url,
          p.colors ?? null,
          p.color_count,
          p.width_min_in ?? null,
          p.width_max_in ?? null,
          p.height_min_in ?? null,
          p.height_max_in ?? null,
          p.fraction_options ?? null,
          p.displayed_price_usd ?? null,
          p.estimated_ship_date ?? null,
          p.image_urls ?? null,
          p.swatch_urls ?? null,
          p.anchor_prices ? JSON.stringify(p.anchor_prices) : null,
          p.description ?? null,
          p.specs_text ?? null,
          p.mounting_text ?? null,
          p.scraped_at,
          competitor,
        ],
      );
      upserted++;
    }
    return upserted;
  });
}

type PriceEntry = { width: number; height: number; price_usd: number };

type MatchCandidate = {
  matchId: string;
  sku: string;
  name: string;
  category: string;
  competitorProductName: string;
  competitorUrl: string;
  sizeLabel: string;
  internalPrice: number;
  competitorPrice: number;
  notes: string;
  medusaProductId?: string;
  storefrontSlug?: string;
};

type ScrapedCatalogRowForMatch = {
  competitor_product_id: string;
  product_name: string;
  url: string;
  displayed_price_usd: string | null;
  width_min_in: string | null;
  width_max_in: string | null;
  height_min_in: string | null;
  height_max_in: string | null;
  anchor_prices: string | null;
};

type ScraperMappingRow = {
  url: string;
  product_handle: string;
};

function parseSizeValue(value: string): { w: number; h: number } | null {
  const m = /^(\d+(?:\.\d+)?)\s*[Xx]\s*(\d+(?:\.\d+)?)$/.exec(value.trim());
  return m ? { w: parseFloat(m[1]), h: parseFloat(m[2]) } : null;
}

function medusaProductToOurProduct(product: MedusaProductForSync) {
  const sizeOption = product.options.find(
    (opt) => opt.values.length > 0 && opt.values.every((v) => parseSizeValue(v.value) !== null),
  );

  const priceEntries: PriceEntry[] = [];
  let basePrice = Infinity;

  for (const variant of product.variants) {
    const price = variant.calculated_price?.calculated_amount;
    if (price == null) continue;
    if (price < basePrice) basePrice = price;

    if (sizeOption) {
      const sizeVal = variant.options.find((o) => o.option_id === sizeOption.id)?.value;
      const size = sizeVal ? parseSizeValue(sizeVal) : null;
      if (size) {
        priceEntries.push({ width: size.w, height: size.h, price_usd: price });
      }
    }
  }

  const keywords = product.title
    .toLowerCase()
    .replace(/['"]/g, "")
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2);

  return {
    sku: product.handle,
    name: product.title,
    category: product.categories?.[0]?.name ?? product.title,
    basePrice: basePrice === Infinity ? 0 : basePrice,
    keywords,
    priceEntries: priceEntries.length > 0 ? priceEntries : undefined,
    medusaProductId: product.id,
    storefrontSlug: product.handle,
  };
}

function lookupClosestPrice(targetW: number, targetH: number, entries: PriceEntry[]): number | null {
  let best: PriceEntry | null = null;
  let bestDist = Infinity;
  for (const e of entries) {
    const dist = (e.width - targetW) ** 2 + (e.height - targetH) ** 2;
    if (dist < bestDist) {
      bestDist = dist;
      best = e;
    }
  }
  return best?.price_usd ?? null;
}

function normalizeCompetitorUrl(url: string): string {
  return url.trim().replace(/[?#].*$/, "").replace(/\/+$/, "");
}

async function loadPriceEntriesForHandle(client: PoolClient, handle: string): Promise<PriceEntry[]> {
  const { rows: variantRows } = await client.query<{ size_key: string; amount: string }>(
    `SELECT ov.value AS size_key, pr.amount
     FROM product_variant pv
     JOIN product p ON p.id = pv.product_id
     JOIN product_variant_option pvo ON pvo.variant_id = pv.id
     JOIN product_option_value ov ON ov.id = pvo.option_value_id
     JOIN product_option o ON o.id = ov.option_id
     LEFT JOIN product_variant_price_set pvps ON pvps.variant_id = pv.id
     LEFT JOIN price pr ON pr.price_set_id = pvps.price_set_id
                         AND pr.currency_code = 'usd'
                         AND pr.deleted_at IS NULL
     WHERE p.handle = $1 AND o.title = 'Size' AND pr.amount IS NOT NULL`,
    [handle],
  );

  return variantRows
    .map((r) => {
      const parts = r.size_key.split("x").map(Number);
      if (parts.length !== 2 || parts.some(isNaN)) return null;
      return { width: parts[0], height: parts[1], price_usd: parseFloat(r.amount) };
    })
    .filter((e): e is PriceEntry => e !== null);
}

async function listConfiguredScraperMappings(
  client: PoolClient,
  competitor: string,
): Promise<Map<string, ScraperMappingRow>> {
  const { rows } = await client.query<ScraperMappingRow>(
    `SELECT su.url, su.product_handle
     FROM ops.scraper_source ss
     JOIN ops.scraper_url su ON su.source_id = ss.id
     WHERE ss.slug = $1
       AND ss.enabled = true
       AND su.enabled = true
       AND su.product_handle IS NOT NULL
     ORDER BY su.created_at`,
    [competitor],
  );

  const mappings = new Map<string, ScraperMappingRow>();
  for (const row of rows) {
    const key = normalizeCompetitorUrl(row.url);
    if (!key || mappings.has(key)) continue;
    mappings.set(key, row);
  }
  return mappings;
}

async function listScrapedRowsForCompetitor(
  client: PoolClient,
  competitor: string,
): Promise<Map<string, ScrapedCatalogRowForMatch>> {
  const { rows } = await client.query<ScrapedCatalogRowForMatch>(
    `SELECT competitor_product_id, product_name, url,
            displayed_price_usd, width_min_in, width_max_in,
            height_min_in, height_max_in, anchor_prices
     FROM ops.scraped_catalog
     WHERE competitor = $1
       AND displayed_price_usd IS NOT NULL
     ORDER BY scraped_at DESC, id DESC`,
    [competitor],
  );

  const scraped = new Map<string, ScrapedCatalogRowForMatch>();
  for (const row of rows) {
    const key = normalizeCompetitorUrl(row.url);
    if (!key || scraped.has(key)) continue;
    scraped.set(key, row);
  }
  return scraped;
}

export async function buildMatchesFromScrapedCatalog(ourProducts: Array<{
  sku: string;
  name: string;
  category: string;
  basePrice: number;
  keywords: string[];
  priceEntries?: PriceEntry[];
  medusaProductId?: string;
  storefrontSlug?: string;
}>, competitor = "blinds-com"): Promise<number> {
  return withClient(async (client) => {
    // Enrich products missing Medusa IDs by looking up product.product by handle
    const handles = ourProducts
      .filter((p) => !p.medusaProductId || !p.storefrontSlug)
      .map((p) => p.sku);
    const medusaLookup = new Map<string, { id: string; handle: string }>();
    if (handles.length > 0) {
      const { rows } = await client.query<{ id: string; handle: string }>(
        `SELECT id, handle FROM product WHERE handle = ANY($1::text[])`,
        [handles],
      );
      for (const row of rows) medusaLookup.set(row.handle, row);
    }
    const enrichedProducts = ourProducts.map((p) => {
      const medusa = medusaLookup.get(p.sku);
      return {
        ...p,
        medusaProductId: p.medusaProductId ?? medusa?.id,
        storefrontSlug:  p.storefrontSlug  ?? medusa?.handle,
      };
    });

    const mappedUrls = await listConfiguredScraperMappings(client, competitor);
    const scrapedRows = await listScrapedRowsForCompetitor(client, competitor);
    const ourProductsByHandle = new Map(
      enrichedProducts.map((product) => [product.sku, { ...product, priceEntries: product.priceEntries ?? [] }]),
    );
    const priceEntriesCache = new Map<string, PriceEntry[]>();
    const generatedMatchIds = new Set<string>();
    const cheapestMatchByInternalVariant = new Map<string, MatchCandidate>();
    const keepCheapestMatchPerInternalVariant = competitor === "hd-supply";
    let created = 0;
    const now = new Date().toISOString();

    const upsertMatch = async (params: MatchCandidate) => {
      const priceDelta = params.internalPrice - params.competitorPrice;
      const alertSeverity = priceDelta < 0 ? "critical" : priceDelta < 5 ? "warning" : null;

      generatedMatchIds.add(params.matchId);
      await client.query(
        `
          insert into ops.competitor_matches (
            id, internal_sku, internal_product_name, internal_category,
            competitor, competitor_product_name, competitor_url,
            match_status, confidence, size_label, currency_code,
            internal_price, competitor_price, price_delta,
            last_checked_at, last_success_at, scrape_status, alert_severity, notes,
            medusa_product_id, storefront_slug
          )
          values ($1,$2,$3,$4,$16,$5,$6,'needs-review',1,$7,'usd',$8,$9,$10,$11,$11,'healthy',$12,$13,$14,$15)
          on conflict (id) do update set
            competitor_product_name = excluded.competitor_product_name,
            competitor_url          = excluded.competitor_url,
            confidence              = excluded.confidence,
            size_label              = excluded.size_label,
            internal_price          = excluded.internal_price,
            competitor_price        = excluded.competitor_price,
            price_delta             = excluded.price_delta,
            last_checked_at         = excluded.last_checked_at,
            last_success_at         = excluded.last_success_at,
            alert_severity          = excluded.alert_severity,
            notes                   = excluded.notes,
            medusa_product_id       = excluded.medusa_product_id,
            storefront_slug         = excluded.storefront_slug,
            updated_at              = now()
        `,
        [
          params.matchId,
          params.sku,
          params.name,
          params.category,
          params.competitorProductName,
          params.competitorUrl,
          params.sizeLabel,
          params.internalPrice,
          params.competitorPrice,
          priceDelta,
          now,
          alertSeverity,
          params.notes,
          params.medusaProductId ?? null,
          params.storefrontSlug ?? null,
          competitor,
        ],
      );
    };

    const recordMatch = async (params: MatchCandidate) => {
      if (!keepCheapestMatchPerInternalVariant) {
        await upsertMatch(params);
        created++;
        return;
      }

      const key = `${params.sku}__${params.sizeLabel}`;
      const current = cheapestMatchByInternalVariant.get(key);
      if (!current || params.competitorPrice < current.competitorPrice) {
        cheapestMatchByInternalVariant.set(key, params);
      }
    };

    for (const [normalizedUrl, mapping] of mappedUrls.entries()) {
      const row = scrapedRows.get(normalizedUrl);
      if (!row) continue;

      const our = ourProductsByHandle.get(mapping.product_handle);
      if (!our) continue;

      let priceEntries = priceEntriesCache.get(our.sku) ?? our.priceEntries;
      if (!priceEntries.length) {
        priceEntries = await loadPriceEntriesForHandle(client, our.sku);
        priceEntriesCache.set(our.sku, priceEntries);
      }

      const competitorPrice = parseFloat(row.displayed_price_usd ?? "0");
      if (!competitorPrice) continue;

      const competitorKey = row.competitor_product_id.toLowerCase().replace(/[^a-z0-9]/g, "_");
      const skuSlug = our.sku.toLowerCase().replace(/[^a-z0-9]/g, "_");
      const baseNote = `Matched from configured scraper URL mapping for ${competitor}.`;
      const anchorPrices: Record<string, number> | null = row.anchor_prices
        ? JSON.parse(row.anchor_prices)
        : null;

      if (priceEntries.length > 0 && anchorPrices && Object.keys(anchorPrices).length > 0) {
        const anchorEntries: PriceEntry[] = Object.entries(anchorPrices)
          .map(([key, price]) => {
            const parts = key.split("x").map(Number);
            if (parts.length !== 2 || parts.some(isNaN)) return null;
            return { width: parts[0], height: parts[1], price_usd: price };
          })
          .filter((entry): entry is PriceEntry => entry !== null);

        const widMin = row.width_min_in ? parseFloat(row.width_min_in) : null;
        const widMax = row.width_max_in ? parseFloat(row.width_max_in) : null;
        const hgtMin = row.height_min_in ? parseFloat(row.height_min_in) : null;
        const hgtMax = row.height_max_in ? parseFloat(row.height_max_in) : null;

        if (anchorEntries.length > 0) {
          for (const entry of priceEntries) {
            const w = entry.width;
            const h = entry.height;
            // Skip sizes outside the competitor product's offered range
            if (widMin != null && w < widMin) continue;
            if (widMax != null && w > widMax) continue;
            if (hgtMin != null && h < hgtMin) continue;
            if (hgtMax != null && h > hgtMax) continue;
            const sizeKey = `${w}x${h}`;
            const closestPrice = lookupClosestPrice(w, h, anchorEntries);
            if (closestPrice == null) continue;

            const closest = anchorEntries.reduce((best, candidate) => {
              const candidateDistance = (candidate.width - w) ** 2 + (candidate.height - h) ** 2;
              const bestDistance = (best.width - w) ** 2 + (best.height - h) ** 2;
              return candidateDistance < bestDistance ? candidate : best;
            });
            const exact = closest.width === w && closest.height === h;
            const anchorNote = exact
              ? `Exact size match at ${w}"×${h}".`
              : `Competitor price estimated from nearest anchor (${closest.width}"×${closest.height}").`;

            await recordMatch({
              matchId: `cmp_${competitor.replace(/[^a-z0-9]/g, "_")}_${skuSlug}_${competitorKey}_${sizeKey}`,
              sku: our.sku,
              name: our.name,
              category: our.category,
              competitorProductName: row.product_name,
              competitorUrl: row.url,
              sizeLabel: `${w}" W × ${h}" H`,
              internalPrice: entry.price_usd,
              competitorPrice: closestPrice,
              notes: `${baseNote} ${anchorNote}`,
              medusaProductId: our.medusaProductId,
              storefrontSlug: our.storefrontSlug,
            });
          }
          continue;
        }
      }

      const widMin = row.width_min_in ? parseFloat(row.width_min_in) : null;
      const widMax = row.width_max_in ? parseFloat(row.width_max_in) : null;
      const hgtMin = row.height_min_in ? parseFloat(row.height_min_in) : null;
      const hgtMax = row.height_max_in ? parseFloat(row.height_max_in) : null;
      const sizeLabel = (widMin != null && widMax != null && hgtMin != null && hgtMax != null)
        ? `${widMin}"–${widMax}" W × ${hgtMin}"–${hgtMax}" H`
        : "Standard size";

      let internalPrice: number;
      if (our.basePrice) {
        internalPrice = our.basePrice;
      } else if (priceEntries.length) {
        const targetW = widMin != null && widMax != null ? (widMin + widMax) / 2 : widMin ?? widMax ?? 24;
        const targetH = hgtMin != null && hgtMax != null ? (hgtMin + hgtMax) / 2 : hgtMin ?? hgtMax ?? 36;
        internalPrice = lookupClosestPrice(targetW, targetH, priceEntries)
          ?? Math.round(competitorPrice * 0.85 * 100) / 100;
      } else {
        internalPrice = Math.round(competitorPrice * 0.85 * 100) / 100;
      }

      await recordMatch({
        matchId: `cmp_${competitor.replace(/[^a-z0-9]/g, "_")}_${skuSlug}_${competitorKey}`,
        sku: our.sku,
        name: our.name,
        category: our.category,
        competitorProductName: row.product_name,
        competitorUrl: row.url,
        sizeLabel,
        internalPrice,
        competitorPrice,
        notes: baseNote,
        medusaProductId: our.medusaProductId,
        storefrontSlug: our.storefrontSlug,
      });
    }

    // ── Second pass: keyword-based matching ───────────────────────────────────
    // Handles category-URL scrapers (e.g. HD Supply) where individual product
    // URLs are not in ops.scraper_url — the URL-mapping loop above produces 0
    // matches for those products.
    const urlMappedKeys = new Set(
      [...mappedUrls.keys()].filter((k) => scrapedRows.has(k)),
    );

    for (const [rowKey, row] of scrapedRows.entries()) {
      if (urlMappedKeys.has(rowKey)) continue; // already handled above

      const competitorPrice = parseFloat(row.displayed_price_usd ?? "0");
      if (!competitorPrice) continue;

      // Score each of our products by keyword overlap with the competitor name
      const nameLower = (row.product_name ?? "").toLowerCase();
      let best: (typeof enrichedProducts)[0] | null = null;
      let bestScore = 0;
      for (const our of enrichedProducts) {
        const score = (our.keywords ?? []).filter((kw) =>
          nameLower.includes(kw.toLowerCase()),
        ).length;
        if (score > bestScore) { bestScore = score; best = our; }
      }
      if (!best || bestScore < 1) continue;

      const our = { ...best, priceEntries: best.priceEntries ?? [] };
      let priceEntries = priceEntriesCache.get(our.sku) ?? our.priceEntries;
      if (!priceEntries.length) {
        priceEntries = await loadPriceEntriesForHandle(client, our.sku);
        priceEntriesCache.set(our.sku, priceEntries);
      }

      const competitorKey = row.competitor_product_id.toLowerCase().replace(/[^a-z0-9]/g, "_");
      const skuSlug = our.sku.toLowerCase().replace(/[^a-z0-9]/g, "_");
      const baseNote = `Keyword match (score ${bestScore}) for ${competitor}.`;
      const anchorPrices: Record<string, number> | null = row.anchor_prices
        ? JSON.parse(row.anchor_prices)
        : null;

      if (priceEntries.length > 0 && anchorPrices && Object.keys(anchorPrices).length > 0) {
        const anchorEntries: PriceEntry[] = Object.entries(anchorPrices)
          .map(([key, price]) => {
            const parts = key.split("x").map(Number);
            if (parts.length !== 2 || parts.some(isNaN)) return null;
            return { width: parts[0], height: parts[1], price_usd: price };
          })
          .filter((e): e is PriceEntry => e !== null);

        const widMin = row.width_min_in ? parseFloat(row.width_min_in) : null;
        const widMax = row.width_max_in ? parseFloat(row.width_max_in) : null;
        const hgtMin = row.height_min_in ? parseFloat(row.height_min_in) : null;
        const hgtMax = row.height_max_in ? parseFloat(row.height_max_in) : null;

        if (anchorEntries.length > 0) {
          for (const entry of priceEntries) {
            const w = entry.width;
            const h = entry.height;
            if (widMin != null && w < widMin) continue;
            if (widMax != null && w > widMax) continue;
            if (hgtMin != null && h < hgtMin) continue;
            if (hgtMax != null && h > hgtMax) continue;
            const closestPrice = lookupClosestPrice(w, h, anchorEntries);
            if (closestPrice == null) continue;
            const closest = anchorEntries.reduce((b, c) =>
              (c.width - w) ** 2 + (c.height - h) ** 2 < (b.width - w) ** 2 + (b.height - h) ** 2 ? c : b,
            );
            const exact = closest.width === w && closest.height === h;
            const anchorNote = exact
              ? `Exact size match at ${w}"×${h}".`
              : `Competitor price estimated from nearest anchor (${closest.width}"×${closest.height}").`;
            const sizeKey = `${w}x${h}`;
            await recordMatch({
              matchId: `cmp_${competitor.replace(/[^a-z0-9]/g, "_")}_${skuSlug}_${competitorKey}_${sizeKey}`,
              sku: our.sku, name: our.name, category: our.category,
              competitorProductName: row.product_name,
              competitorUrl: row.url,
              sizeLabel: `${w}" W × ${h}" H`,
              internalPrice: entry.price_usd,
              competitorPrice: closestPrice,
              notes: `${baseNote} ${anchorNote}`,
              medusaProductId: our.medusaProductId,
              storefrontSlug: our.storefrontSlug,
            });
          }
          continue;
        }
      }

      // Fallback: no anchor prices — one match per scraped product
      const widMin = row.width_min_in ? parseFloat(row.width_min_in) : null;
      const widMax = row.width_max_in ? parseFloat(row.width_max_in) : null;
      const hgtMin = row.height_min_in ? parseFloat(row.height_min_in) : null;
      const hgtMax = row.height_max_in ? parseFloat(row.height_max_in) : null;
      const sizeLabel = (widMin != null && widMax != null && hgtMin != null && hgtMax != null)
        ? `${widMin}"–${widMax}" W × ${hgtMin}"–${hgtMax}" H`
        : "Standard size";
      let internalPrice: number;
      if (our.basePrice) {
        internalPrice = our.basePrice;
      } else if (priceEntries.length) {
        const targetW = widMin != null && widMax != null ? (widMin + widMax) / 2 : widMin ?? widMax ?? 24;
        const targetH = hgtMin != null && hgtMax != null ? (hgtMin + hgtMax) / 2 : hgtMin ?? hgtMax ?? 36;
        internalPrice = lookupClosestPrice(targetW, targetH, priceEntries)
          ?? Math.round(competitorPrice * 0.85 * 100) / 100;
      } else {
        internalPrice = Math.round(competitorPrice * 0.85 * 100) / 100;
      }
      await recordMatch({
        matchId: `cmp_${competitor.replace(/[^a-z0-9]/g, "_")}_${skuSlug}_${competitorKey}`,
        sku: our.sku, name: our.name, category: our.category,
        competitorProductName: row.product_name,
        competitorUrl: row.url,
        sizeLabel, internalPrice, competitorPrice,
        notes: baseNote,
        medusaProductId: our.medusaProductId,
        storefrontSlug: our.storefrontSlug,
      });
    }

    for (const match of cheapestMatchByInternalVariant.values()) {
      await upsertMatch(match);
      created++;
    }

    if (generatedMatchIds.size > 0) {
      await client.query(
        `DELETE FROM ops.competitor_matches
         WHERE competitor = $1
           AND NOT (id = ANY($2::text[]))`,
        [competitor, [...generatedMatchIds]],
      );
    } else {
      await client.query("DELETE FROM ops.competitor_matches WHERE competitor = $1", [competitor]);
    }

    return created;
  });
}

async function deleteStaleMatches(currentProductIds: string[]): Promise<number> {
  if (currentProductIds.length === 0) return 0;
  return withClient(async (client) => {
    // Delete matches where medusa_product_id is missing (old manually-seeded matches)
    // OR where the product no longer exists in Medusa.
    const result = await client.query(
      `DELETE FROM ops.competitor_matches
       WHERE medusa_product_id IS NULL
          OR NOT (medusa_product_id = ANY($1))`,
      [currentProductIds],
    );
    return result.rowCount ?? 0;
  });
}

// ─────────────────────────────────────────────────────────────────────────────

export async function initCompetitorPricingStore() {
  return withClient(async (client) => {
    await client.query(`
      create schema if not exists ops;

      create table if not exists ops.scraped_catalog (
        id                   bigserial primary key,
        competitor_product_id text not null,
        competitor           text not null,
        product_name         text not null,
        brand                text null,
        url                  text not null,
        colors               text null,
        color_count          integer not null default 0,
        width_min_in         numeric(8,2) null,
        width_max_in         numeric(8,2) null,
        height_min_in        numeric(8,2) null,
        height_max_in        numeric(8,2) null,
        fraction_options     text null,
        displayed_price_usd  numeric(12,2) null,
        estimated_ship_date  text null,
        image_urls           text null,
        swatch_urls          text null,
        medusa_product_id    text null,
        scraped_at           timestamptz not null,
        created_at           timestamptz not null default now(),
        updated_at           timestamptz not null default now(),
        unique (competitor_product_id, competitor)
      );

      -- Migrate existing tables that may be missing newer columns
      alter table if exists ops.scraped_catalog
        add column if not exists medusa_product_id text null;
      alter table if exists ops.scraped_catalog
        add column if not exists anchor_prices text null;
      alter table if exists ops.scraped_catalog
        add column if not exists description text null;
      alter table if exists ops.scraped_catalog
        add column if not exists specs_text text null;
      alter table if exists ops.scraped_catalog
        add column if not exists mounting_text text null;

      alter table if exists ops.competitor_matches
        add column if not exists medusa_product_id text null;
      alter table if exists ops.competitor_matches
        add column if not exists storefront_slug text null;

      create table if not exists ops.competitor_matches (
        id text primary key,
        internal_sku text not null,
        internal_product_name text not null,
        internal_category text not null,
        competitor text not null,
        competitor_product_name text not null,
        competitor_url text not null,
        match_status text not null,
        confidence double precision not null,
        size_label text not null,
        currency_code text not null,
        internal_price numeric(12, 2) not null,
        competitor_price numeric(12, 2) not null,
        price_delta numeric(12, 2) not null,
        last_checked_at timestamptz not null,
        last_success_at timestamptz not null,
        scrape_status text not null,
        alert_severity text null,
        notes text null,
        medusa_product_id text null,
        storefront_slug text null,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      );

      create table if not exists ops.competitor_refresh_runs (
        id text primary key,
        started_at timestamptz not null,
        completed_at timestamptz not null,
        status text not null,
        matches_checked integer not null,
        alerts_raised integer not null,
        failures integer not null,
        notes text[] not null default '{}',
        created_at timestamptz not null default now()
      );
    `);

  });
}


async function insertRefreshRun(client: PoolClient, refresh: CompetitorRefreshRun) {
  await client.query(
    `
      insert into ops.competitor_refresh_runs (
        id,
        started_at,
        completed_at,
        status,
        matches_checked,
        alerts_raised,
        failures,
        notes
      )
      values ($1,$2,$3,$4,$5,$6,$7,$8)
      on conflict (id) do nothing
    `,
    [
      refresh.id,
      refresh.startedAt,
      refresh.completedAt,
      refresh.status,
      refresh.matchesChecked,
      refresh.alertsRaised,
      refresh.failures,
      refresh.notes,
    ],
  );
}

export async function getCompetitorPricingDashboard(): Promise<CompetitorPricingDashboardResponse> {
  return withClient(async (client) => {
    const matchResult = await client.query<MatchRow>(
      `
        select
          m.id,
          m.internal_sku,
          m.internal_product_name,
          m.internal_category,
          m.competitor,
          m.competitor_product_name,
          m.competitor_url,
          m.match_status,
          m.confidence,
          m.size_label,
          m.currency_code,
          coalesce(mv.store_price, m.internal_price) as internal_price,
          m.competitor_price,
          (p.metadata->'cost_prices'->>m.size_label)::numeric as source_price,
          coalesce(mv.store_price, m.internal_price) - m.competitor_price as price_delta,
          m.last_checked_at,
          m.last_success_at,
          m.scrape_status,
          m.alert_severity,
          m.notes,
          m.medusa_product_id,
          mv.medusa_variant_id,
          m.storefront_slug
        from ops.competitor_matches m
        left join product p on p.handle = m.internal_sku
        left join lateral (
          select
            pv.id as medusa_variant_id,
            prc.amount::numeric as store_price
          from product_variant pv
          join product_variant_option pvo on pvo.variant_id = pv.id
          join product_option_value ov on ov.id = pvo.option_value_id
          join product_option o on o.id = ov.option_id
          left join product_variant_price_set pvps on pvps.variant_id = pv.id
          left join price prc on prc.price_set_id = pvps.price_set_id
            and prc.currency_code = m.currency_code
            and prc.deleted_at is null
          where pv.product_id = p.id
            and o.title = 'Size'
            and ov.value ~* '^\\s*\\d+(\\.\\d+)?\\s*x\\s*\\d+(\\.\\d+)?\\s*$'
            and concat(
              (split_part(lower(ov.value), 'x', 1)::numeric)::text,
              '" W × ',
              (split_part(lower(ov.value), 'x', 2)::numeric)::text,
              '" H'
            ) = m.size_label
          limit 1
        ) mv on true
        order by
          case when coalesce(mv.store_price, m.internal_price) - m.competitor_price > 0 then 0 else 1 end,
          m.last_checked_at desc
      `,
    );

    const matches = matchResult.rows.map(mapMatchRow);
    const alerts = buildCompetitorAlerts(matches);
    const summary = buildCompetitorSummary(matches, alerts);

    const refreshResult = await client.query<RefreshRow>(
      `
        select
          id,
          started_at,
          completed_at,
          status,
          matches_checked,
          alerts_raised,
          failures,
          notes
        from ops.competitor_refresh_runs
        order by completed_at desc
        limit 1
      `,
    );

    const refresh =
      refreshResult.rows[0] ? mapRefreshRow(refreshResult.rows[0]) : buildCompetitorRefreshRun(matches, alerts);

    return {
      workstream: "competitor-pricing",
      summary,
      refresh,
      alerts,
      matches,
    };
  });
}

export async function runCompetitorRefreshPreview() {
  const { medusaBackendUrl, medusaPublishableKey } = opsApiEnv;

  // Step 1 — rebuild matches from current Medusa product catalogue
  const currentProductIds: string[] = [];
  if (medusaPublishableKey) {
    try {
      const products = await fetchMedusaProductsWithPrices(medusaBackendUrl, medusaPublishableKey);
      const ourProducts = products.map(medusaProductToOurProduct);
      currentProductIds.push(
        ...ourProducts.map((p) => p.medusaProductId).filter((id): id is string => Boolean(id)),
      );
      await withClient(async (client) => {
        const { rows } = await client.query<{ slug: string }>(
          `SELECT slug
           FROM ops.scraper_source
           WHERE enabled = true
           ORDER BY created_at`,
        );
        for (const row of rows) {
          await buildMatchesFromScrapedCatalog(ourProducts, row.slug);
        }
      });
    } catch (err) {
      console.error("[competitor-pricing] failed to sync with Medusa products:", err);
    }
  }

  // Step 2 — remove matches for products deleted from Medusa
  if (currentProductIds.length > 0) {
    const pruned = await deleteStaleMatches(currentProductIds);
    if (pruned > 0) {
      console.log(`[competitor-pricing] pruned ${pruned} stale matches for removed products`);
    }
  }

  // Step 3 — record the refresh run from the dashboard shape operators see.
  const dashboard = await getCompetitorPricingDashboard();
  const refresh = buildCompetitorRefreshRun(dashboard.matches, dashboard.alerts);

  return withClient(async (client) => {
    await client.query("begin");
    try {
      await insertRefreshRun(client, { ...refresh, id: `refresh_${Date.now()}` });
      await client.query("commit");
    } catch (error) {
      await client.query("rollback");
      throw error;
    }

    return getCompetitorPricingDashboard();
  });
}

export async function getMatchCompetitorPrice(matchId: string): Promise<number | null> {
  return withClient(async (client) => {
    const res = await client.query<{ competitor_price: string }>(
      `select competitor_price from ops.competitor_matches where id = $1`,
      [matchId],
    );
    const row = res.rows[0];
    return row ? parseFloat(row.competitor_price) : null;
  });
}

export async function updateCompetitorMatchState(
  matchId: string,
  update: Partial<Pick<CompetitorProductMatch, "matchStatus" | "alertSeverity" | "notes">> & {
    internalPrice?: number;
  },
) {
  return withClient(async (client) => {
    await client.query("begin");
    try {
      if (update.internalPrice != null) {
        const priceResult = await client.query<{ updated_count: number }>(
          `
            with target_variant as (
              select pv.id as variant_id
              from ops.competitor_matches m
              join product p on p.handle = m.internal_sku
              join product_variant pv on pv.product_id = p.id
              join product_variant_option pvo on pvo.variant_id = pv.id
              join product_option_value ov on ov.id = pvo.option_value_id
              join product_option o on o.id = ov.option_id
              where m.id = $1
                and o.title = 'Size'
                and ov.value ~* '^\\s*\\d+(\\.\\d+)?\\s*x\\s*\\d+(\\.\\d+)?\\s*$'
                and concat(
                  (split_part(lower(ov.value), 'x', 1)::numeric)::text,
                  '" W × ',
                  (split_part(lower(ov.value), 'x', 2)::numeric)::text,
                  '" H'
                ) = m.size_label
              limit 1
            ),
            updated_price as (
              update price p
                 set amount = $2,
                     updated_at = now()
                from price_set ps
                join product_variant_price_set pvps on pvps.price_set_id = ps.id
                join target_variant tv on tv.variant_id = pvps.variant_id
               where p.price_set_id = ps.id
                 and p.currency_code = 'usd'
               returning p.id
            )
            select count(*)::int as updated_count from updated_price
          `,
          [matchId, update.internalPrice],
        );

        if (!priceResult.rows[0]?.updated_count) {
          throw new Error(`No Medusa USD price found for competitor match: ${matchId}`);
        }
      }

      await client.query(
        `
          update ops.competitor_matches
          set
            match_status   = coalesce($2, match_status),
            alert_severity = $3,
            notes          = coalesce($4, notes),
            internal_price = coalesce($5, internal_price),
            price_delta    = case when $5 is not null then $5 - competitor_price else price_delta end,
            updated_at     = now()
          where id = $1
        `,
        [
          matchId,
          update.matchStatus ?? null,
          update.alertSeverity ?? null,
          update.notes ?? null,
          update.internalPrice ?? null,
        ],
      );

      const result = await client.query<MatchRow>(
        `
          select
            m.id,
            m.internal_sku,
            m.internal_product_name,
            m.internal_category,
            m.competitor,
            m.competitor_product_name,
            m.competitor_url,
            m.match_status,
            m.confidence,
            m.size_label,
            m.currency_code,
            coalesce(mv.store_price, m.internal_price) as internal_price,
            m.competitor_price,
            (p.metadata->'cost_prices'->>m.size_label)::numeric as source_price,
            coalesce(mv.store_price, m.internal_price) - m.competitor_price as price_delta,
            m.last_checked_at,
            m.last_success_at,
            m.scrape_status,
            m.alert_severity,
            m.notes,
            m.medusa_product_id,
            mv.medusa_variant_id,
            m.storefront_slug
          from ops.competitor_matches m
          left join product p on p.handle = m.internal_sku
          left join lateral (
            select
              pv.id as medusa_variant_id,
              prc.amount::numeric as store_price
            from product_variant pv
            join product_variant_option pvo on pvo.variant_id = pv.id
            join product_option_value ov on ov.id = pvo.option_value_id
            join product_option o on o.id = ov.option_id
            left join product_variant_price_set pvps on pvps.variant_id = pv.id
            left join price prc on prc.price_set_id = pvps.price_set_id
              and prc.currency_code = m.currency_code
              and prc.deleted_at is null
            where pv.product_id = p.id
              and o.title = 'Size'
              and ov.value ~* '^\\s*\\d+(\\.\\d+)?\\s*x\\s*\\d+(\\.\\d+)?\\s*$'
              and concat(
                (split_part(lower(ov.value), 'x', 1)::numeric)::text,
                '" W × ',
                (split_part(lower(ov.value), 'x', 2)::numeric)::text,
                '" H'
              ) = m.size_label
            limit 1
          ) mv on true
          where m.id = $1
        `,
        [matchId],
      );

      await client.query("commit");
      return result.rows[0] ? mapMatchRow(result.rows[0]) : null;
    } catch (error) {
      await client.query("rollback");
      throw error;
    }
  });
}
