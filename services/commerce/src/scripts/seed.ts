import type { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import {
  createApiKeysWorkflow,
  createProductsWorkflow,
  createServiceZonesWorkflow,
  createShippingOptionsWorkflow,
} from "@medusajs/medusa/core-flows";
import { randomUUID } from "node:crypto";
import { Client } from "pg";

import {
  aluminumBCSizePrices,
  fauxWoodSizePrices,
  productFamilyBlueprints,
  stockVerticalBlindSizes,
  verticalBlindPrices,
} from "../bootstrap/catalog-reference";

// Images are served by Medusa's file module (file-local in dev, GCS in prod).
// In dev: files sit in services/commerce/uploads/, served at /static/<filename>.
// In prod: files are in GCS, served at https://storage.googleapis.com/<bucket>/<filename>.
const BACKEND_URL = process.env.MEDUSA_BACKEND_URL ?? "http://localhost:9000";
function img(filename: string) { return `${BACKEND_URL}/static/${filename}`; }

type ProductSeedInput = {
  title: string;
  handle: string;
  description: string;
  subtitle: string;
  thumbnail: string;
  material: string;
  metadata: Record<string, unknown>;
  options: Array<{ title: string; values: string[] }>;
  variants: Array<{
    title: string;
    sku: string;
    manage_inventory: boolean;
    allow_backorder: boolean;
    options: Record<string, string>;
    prices: Array<{ amount: number; currency_code: string }>;
    metadata: Record<string, unknown>;
  }>;
};

type DimensionEntry = {
  width: number;
  height: number;
};

function getDimensionBounds(entries: DimensionEntry[]) {
  const widths = entries.map((entry) => entry.width);
  const heights = entries.map((entry) => entry.height);

  return {
    min_width_inches: Math.min(...widths),
    max_width_inches: Math.max(...widths),
    min_height_inches: Math.min(...heights),
    max_height_inches: Math.max(...heights),
  };
}

function buildCatalogSeed(): ProductSeedInput[] {
  return [
    {
      title: '2" Faux Wood Blinds',
      handle: "faux-wood-blinds-2-inch",
      subtitle: "Style-led wood-look category",
      description:
        "Moisture-resistant faux wood blinds with a warmer finish and stronger visual depth for remodels and premium rooms.",
      thumbnail: img("faux-wood-blinds-2-inch.jpg"),
      material: "Faux wood composite",
      metadata: {
        family_slug: "faux-wood-blinds",
        measurement_model: "custom-size",
        merchandising_label: "Top Rated",
        lead_time_label: "Ships in 4 to 6 business days",
        story:
          "A warmer wood-look blind with moisture tolerance and cordless convenience for remodel-driven rooms and everyday family spaces.",
        best_for:
          "Living rooms, kitchens, bathrooms, garages, and residential remodels that want wood style without the maintenance risk.",
        highlights: [
          '2" faux wood slats',
          "Cordless lift for a cleaner, safer profile",
          "Moisture-resistant PVC construction",
          "Painted, textured, and wood-look finish options",
        ],
        considerations: [
          "Some finishes are smooth and others are textured, so samples help confirm the right look.",
          "Heavier than real wood, making very large windows less ideal if you raise them frequently.",
          "Single-blind configurations use a left-side wand tilt.",
        ],
        install_time_label: "10 to 15 minutes",
        specs: {
          ...getDimensionBounds(fauxWoodSizePrices),
          slat_size_inches: 2,
          max_area_sq_ft: 48,
          inside_mount_deduction_inches: 0.375,
          minimum_inside_mount_depth_inches: 1.625,
          minimum_inside_mount_depth_flush_inches: 2.875,
          minimum_outside_mount_surface_per_side_inches: 2,
          standard_options: ["Cordless lift", "Hold downs"],
          upgrades: ['3 1/4" designer crown valance'],
          origin: "Imported",
        },
      },
      options: [
        { title: "Size", values: fauxWoodSizePrices.map((s) => `${s.width}x${s.height}`) },
      ],
      variants: fauxWoodSizePrices.map((size) => ({
        title: `${size.width}" × ${size.height}"`,
        sku: `FWB-2-${size.width}X${size.height}`,
        manage_inventory: false,
        allow_backorder: true,
        options: { Size: `${size.width}x${size.height}` },
        prices: [{ amount: size.price, currency_code: "usd" }],
        metadata: {
          width_inches: size.width,
          height_inches: size.height,
          base_price_label: `$${size.price}`,
        },
      })),
    },
    {
      title: '1" Aluminum Business Class Blinds',
      handle: "aluminum-business-class-blinds-1-inch",
      subtitle: "Heavy-gauge aluminum for commercial use",
      description:
        "Institutional-grade aluminum blinds built for high-use commercial environments, offices, and multi-unit properties.",
      thumbnail: img("aluminum-business-class-1-inch.jpg"),
      material: "Heavy-gauge aluminum slats",
      metadata: {
        family_slug: "aluminum-business-class-blinds",
        measurement_model: "custom-size",
        merchandising_label: "Commercial Grade",
        lead_time_label: "Ships in 3 to 5 business days",
        story:
          "Heavy-gauge 1-inch aluminum built for offices, multi-unit properties, and other higher-use windows that need repeatable performance.",
        best_for:
          "Offices, property turns, utility rooms, schools, and commercial installs where durability matters more than decorative warmth.",
        highlights: [
          '1" heavy-gauge aluminum slats',
          "Commercial-ready durability",
          "Clean low-profile light control",
          "Made-to-order sizing for repeatable installs",
        ],
        considerations: [
          "Slim metal slats can crease if mishandled.",
          "Expect a lighter, more audible operating feel than faux wood.",
          "Best positioned for commercial and utility-driven spaces.",
        ],
        specs: {
          ...getDimensionBounds(aluminumBCSizePrices),
          slat_size_inches: 1,
          construction: "Heavy-gauge aluminum slats",
          origin: "Imported",
        },
      },
      options: [
        { title: "Size", values: aluminumBCSizePrices.map((s) => `${s.width}x${s.height}`) },
      ],
      variants: aluminumBCSizePrices.map((size) => ({
        title: `${size.width}" × ${size.height}"`,
        sku: `ABCL-1-${size.width}X${size.height}`,
        manage_inventory: false,
        allow_backorder: true,
        options: { Size: `${size.width}x${size.height}` },
        prices: [{ amount: size.price, currency_code: "usd" }],
        metadata: {
          width_inches: size.width,
          height_inches: size.height,
          base_price_label: `$${size.price}`,
        },
      })),
    },
    {
      title: "Vertical Blinds / Made to Fit Any Size",
      handle: "vertical-blinds-made-to-fit",
      subtitle: "Large-opening and patio-door coverage",
      description:
        "Stock-size and large-opening-ready vertical blinds for patio doors, apartment turns, and commercial spans.",
      thumbnail: img("vertical-blinds-made-to-fit.jpg"),
      material: "PVC vanes",
      metadata: {
        family_slug: "vertical-blinds",
        measurement_model: "stock-size",
        merchandising_label: "In Stock",
        lead_time_label: "Same day in DFW when stock allows",
        story:
          "A stock-size vertical blind built for patio doors, wide glass, and fast replacement work where coverage and turn speed matter more than decorative complexity.",
        best_for:
          "Patio doors, sliding glass openings, apartment turns, and wide commercial spans that need quick, clean coverage.",
        highlights: [
          "Stock sizes for common wide openings",
          "White PVC vanes",
          "Same-day DFW candidate on stocked sizes",
          "Simple patio-door coverage",
        ],
        considerations: [
          "Plan the stack direction around your walk path and view.",
          "Vertical systems prioritize wide-opening coverage over the quieter feel of smaller horizontal blinds.",
        ],
        install_time_label: "20 to 25 minutes",
        specs: {
          ...getDimensionBounds(stockVerticalBlindSizes),
          vane_width_inches: 3.5,
          stack_options: ["Left", "Right", "Split"],
          origin: "Imported",
        },
      },
      options: [
        { title: "Size", values: stockVerticalBlindSizes.map((size) => `${size.width}x${size.height}`) },
        { title: "Color", values: ["White"] },
      ],
      variants: stockVerticalBlindSizes.map((size) => {
        const amount = verticalBlindPrices[`${size.width}x${size.height}`] ?? 25.00;
        return {
          title: `${size.width}" x ${size.height}" / White`,
          sku: `VB-STD-${size.width}X${size.height}`,
          manage_inventory: false,
          allow_backorder: false,
          options: {
            Size: `${size.width}x${size.height}`,
            Color: "White",
          },
          prices: [{ amount, currency_code: "usd" }],
          metadata: {
            stock_size: `${size.width}x${size.height}`,
            same_day_dfw_candidate: true,
          },
        };
      }),
    },
  ];
}

async function ensureShippingProfile(container: ExecArgs["container"]) {
  const fulfillmentModule = container.resolve(Modules.FULFILLMENT);
  const existingProfiles = await fulfillmentModule.listShippingProfiles({});
  const defaultProfile = existingProfiles.find((profile: { type?: string }) => profile.type === "default");

  if (defaultProfile) {
    return defaultProfile;
  }

  return fulfillmentModule.createShippingProfiles({
    name: "Default",
    type: "default",
  });
}

async function ensureStoreCurrencies(container: ExecArgs["container"]) {
  const storeModule = container.resolve(Modules.STORE);
  const stores = await storeModule.listStores({}, { relations: ["supported_currencies"] });
  if (!stores.length) return;

  const store = stores[0] as any;
  const existing: Array<{ currency_code: string; is_default?: boolean }> =
    store.supported_currencies ?? [];

  const hasUsd = existing.some((c) => c.currency_code === "usd");
  if (hasUsd) return;

  // Replace the full array — updateStores does not append, it replaces
  const updated = [
    { currency_code: "usd", is_default: true },
    ...existing
      .filter((c) => c.currency_code !== "usd")
      .map((c) => ({ currency_code: c.currency_code, is_default: false })),
  ];

  await storeModule.updateStores(store.id, { supported_currencies: updated });
}

async function ensureRegion(container: ExecArgs["container"], enableStripe: boolean) {
  const regionModule = container.resolve(Modules.REGION);
  const existingRegions = await regionModule.listRegions?.({}) ?? [];
  const desiredPaymentProviders = enableStripe
    ? ["pp_system_default", "pp_stripe_stripe"]
    : ["pp_system_default"];
  const usRegion = existingRegions.find(
    (region: { name?: string; currency_code?: string }) =>
      region.name === "United States" || region.currency_code === "usd",
  );

  if (usRegion) {
    if (enableStripe) {
      await regionModule.updateRegions(usRegion.id, {
        payment_providers: desiredPaymentProviders,
      } as any);

      return regionModule.retrieveRegion(usRegion.id);
    }

    return usRegion;
  }

  return regionModule.createRegions({
    name: "United States",
    currency_code: "usd",
    countries: ["us"],
    payment_providers: desiredPaymentProviders,
    automatic_taxes: false,
  });
}

async function ensurePublishableApiKey(container: ExecArgs["container"]) {
  const apiKeyModule = container.resolve(Modules.API_KEY);
  const existingKeys = await apiKeyModule.listApiKeys({ type: "publishable" });
  const storefrontKey = existingKeys.find((key: { title?: string }) => key.title === "Storefront");

  if (storefrontKey) {
    return storefrontKey;
  }

  const { result } = await createApiKeysWorkflow(container).run({
    input: {
      api_keys: [
        {
          title: "Storefront",
          type: "publishable",
          created_by: "seed-script",
        },
      ],
    },
  });

  return result[0];
}

async function ensureSalesChannel(container: ExecArgs["container"]) {
  const salesChannelModule = container.resolve(Modules.SALES_CHANNEL);
  const existingSalesChannels = await salesChannelModule.listSalesChannels?.({}) ?? [];
  const storefrontChannel = existingSalesChannels.find(
    (channel: { name?: string }) => channel.name === "Storefront",
  );

  if (storefrontChannel) {
    return storefrontChannel;
  }

  return salesChannelModule.createSalesChannels({
    name: "Storefront",
    description: "Primary DTC storefront channel",
    is_disabled: false,
  });
}

async function ensurePublishableKeySalesChannelLink(
  publishableKeyId: string,
  salesChannelId: string,
) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();
  await client.query(
    `
      INSERT INTO publishable_api_key_sales_channel
        (id, publishable_key_id, sales_channel_id, created_at, updated_at)
      VALUES
        ($1, $2, $3, NOW(), NOW())
      ON CONFLICT (publishable_key_id, sales_channel_id) DO NOTHING
    `,
    [`pksc_${randomUUID().replace(/-/g, "").slice(0, 26)}`, publishableKeyId, salesChannelId],
  );
  await client.end();
}

async function ensureProductSalesChannelLinks(
  salesChannelId: string,
  productIds: string[],
) {
  if (!productIds.length) {
    return;
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();

  for (const productId of productIds) {
    await client.query(
      `
        INSERT INTO product_sales_channel
          (id, product_id, sales_channel_id, created_at, updated_at)
        VALUES
          ($1, $2, $3, NOW(), NOW())
        ON CONFLICT (product_id, sales_channel_id) DO NOTHING
      `,
      [`prodsc_${randomUUID().replace(/-/g, "").slice(0, 24)}`, productId, salesChannelId],
    );
  }

  await client.end();
}

async function ensureShippingInfrastructure(
  container: ExecArgs["container"],
  salesChannelId: string,
) {
  const fulfillmentModule = container.resolve(Modules.FULFILLMENT);
  const stockLocationModule = container.resolve(Modules.STOCK_LOCATION);

  // ── 1. Stock location ──────────────────────────────────────────────────────
  const existingLocations = await stockLocationModule.listStockLocations({});
  const existingLocation = (existingLocations as Array<{ id: string; name: string }>).find(
    (sl) => sl.name === "Bedford TX Warehouse",
  );

  const stockLocationId: string = existingLocation
    ? existingLocation.id
    : (
        (await stockLocationModule.createStockLocations([
          {
            name: "Bedford TX Warehouse",
            address: {
              address_1: "2100 Airport Freeway",
              city: "Bedford",
              country_code: "us",
              province: "TX",
              postal_code: "76021",
            },
          },
        ] as unknown as Parameters<typeof stockLocationModule.createStockLocations>[0])
        ) as unknown as Array<{ id: string }>
      )[0].id;

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    // ── 2. Fulfillment set (linked to stock location) ──────────────────────
    const { rows: fsRows } = await client.query<{ fulfillment_set_id: string }>(
      "SELECT fulfillment_set_id FROM location_fulfillment_set WHERE stock_location_id = $1 LIMIT 1",
      [stockLocationId],
    );

    let fulfillmentSetId: string;

    if (fsRows.length > 0) {
      fulfillmentSetId = fsRows[0].fulfillment_set_id;
    } else {
      const [fs] = await fulfillmentModule.createFulfillmentSets([
        { name: "Bedford TX Fulfillment", type: "shipping" },
      ]);
      fulfillmentSetId = (fs as { id: string }).id;

      await client.query(
        `INSERT INTO location_fulfillment_set (id, stock_location_id, fulfillment_set_id, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW()) ON CONFLICT DO NOTHING`,
        [`locfs_${randomUUID().replace(/-/g, "").slice(0, 26)}`, stockLocationId, fulfillmentSetId],
      );

      // ── 3. Enable manual_manual provider ────────────────────────────────
      await client.query(
        `INSERT INTO location_fulfillment_provider (id, stock_location_id, fulfillment_provider_id, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW()) ON CONFLICT DO NOTHING`,
        [
          `locfp_${randomUUID().replace(/-/g, "").slice(0, 26)}`,
          stockLocationId,
          "manual_manual",
        ],
      );

      // ── 4. Service zone (US country) ─────────────────────────────────────
      const szResult = await createServiceZonesWorkflow(container).run({
        input: {
          data: [
            {
              name: "United States",
              fulfillment_set_id: fulfillmentSetId,
              geo_zones: [{ type: "country", country_code: "us" }],
            },
          ],
        },
      });
      const sz = (szResult.result as Array<{ id: string }>)[0];

      // ── 5. Shipping options ───────────────────────────────────────────────
      const shippingProfile = await ensureShippingProfile(container);

      await createShippingOptionsWorkflow(container).run({
        input: [
          {
            name: "Free Shipping",
            service_zone_id: sz.id,
            shipping_profile_id: shippingProfile.id,
            provider_id: "manual_manual",
            type: { label: "Standard", description: "Free shipping on all orders", code: "standard" },
            price_type: "flat",
            prices: [{ amount: 0, currency_code: "usd" }],
          },
          {
            name: "Standard Shipping",
            service_zone_id: sz.id,
            shipping_profile_id: shippingProfile.id,
            provider_id: "manual_manual",
            type: { label: "Standard", description: "Standard ground shipping", code: "standard" },
            price_type: "flat",
            prices: [{ amount: 9.95, currency_code: "usd" }],
          },
        ],
      });
    }

    // ── 6. Link stock location → sales channel ───────────────────────────────
    await client.query(
      `INSERT INTO sales_channel_stock_location (id, sales_channel_id, stock_location_id, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW()) ON CONFLICT DO NOTHING`,
      [
        `scsl_${randomUUID().replace(/-/g, "").slice(0, 26)}`,
        salesChannelId,
        stockLocationId,
      ],
    );
  } finally {
    await client.end();
  }
}

// Map of product handle → category handle for the 3 CSV products.
const PRODUCT_CATEGORY_MAP: Record<string, string> = {
  "faux-wood-blinds-2-inch": "faux-wood-blinds",
  "vertical-blinds-made-to-fit": "vertical-blinds",
  "aluminum-business-class-blinds-1-inch": "aluminum-blinds",
};

async function ensureProductCategoryLinks() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    for (const [productHandle, categoryHandle] of Object.entries(PRODUCT_CATEGORY_MAP)) {
      const prodRes = await client.query(
        `SELECT id FROM product WHERE handle = $1 LIMIT 1`,
        [productHandle],
      );
      const catRes = await client.query(
        `SELECT id FROM product_category WHERE handle = $1 LIMIT 1`,
        [categoryHandle],
      );
      if (!prodRes.rows.length || !catRes.rows.length) continue;
      await client.query(
        `INSERT INTO product_category_product (product_id, product_category_id)
         VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [prodRes.rows[0].id, catRes.rows[0].id],
      );
    }
  } finally {
    await client.end();
  }
}

async function syncExistingProductContent(products: ProductSeedInput[]) {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    let updated = 0;

    for (const product of products) {
      const result = await client.query(
        `
          UPDATE product
          SET
            title = $2,
            description = $3,
            subtitle = $4,
            thumbnail = $5,
            material = $6,
            metadata = $7::jsonb,
            updated_at = NOW()
          WHERE handle = $1
        `,
        [
          product.handle,
          product.title,
          product.description,
          product.subtitle,
          product.thumbnail,
          product.material,
          JSON.stringify(product.metadata),
        ],
      );

      updated += result.rowCount ?? 0;
    }

    return updated;
  } finally {
    await client.end();
  }
}

async function seedProducts(container: ExecArgs["container"], salesChannelId: string) {
  const productModule = container.resolve(Modules.PRODUCT);
  const shippingProfile = await ensureShippingProfile(container);
  const desiredProducts = buildCatalogSeed();
  const existingProducts = await productModule.listProducts({
    handle: desiredProducts.map((product) => product.handle),
  });
  const existingHandles = new Set(
    existingProducts.map((product: { handle: string }) => String(product.handle)),
  );

  const productsToCreate = desiredProducts
    .filter((product) => !existingHandles.has(product.handle))
    .map((product) => ({
      ...product,
      status: "published" as const,
      shipping_profile_id: shippingProfile.id,
    }));

  const syncProductSalesChannels = async () => {
    const allProducts = await productModule.listProducts({
      handle: desiredProducts.map((product) => product.handle),
    });

    await ensureProductSalesChannelLinks(
      salesChannelId,
      allProducts.map((product: { id: string }) => product.id),
    );
  };

  if (!productsToCreate.length) {
    const updated = await syncExistingProductContent(desiredProducts);
    await syncProductSalesChannels();

    return {
      created: 0,
      skipped: desiredProducts.length,
      updated,
    };
  }

  await createProductsWorkflow(container).run({
    input: {
      products: productsToCreate,
    },
  });
  const updated = await syncExistingProductContent(desiredProducts);
  await syncProductSalesChannels();

  return {
    created: productsToCreate.length,
    skipped: desiredProducts.length - productsToCreate.length,
    updated,
  };
}

export default async function seedCommerce({ container, args }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const stripeEnabled = Boolean(process.env.STRIPE_SECRET_KEY);

  logger.info(`Seeding commerce foundation${args.length ? ` with args: ${args.join(" ")}` : ""}`);

  logger.info(
    `Catalog families in blueprint: ${productFamilyBlueprints.map((family) => family.slug).join(", ")}`,
  );

  await ensureStoreCurrencies(container);
  const region = await ensureRegion(container, stripeEnabled);
  const apiKey = await ensurePublishableApiKey(container);
  const salesChannel = await ensureSalesChannel(container);
  await ensurePublishableKeySalesChannelLink(apiKey.id, salesChannel.id);
  await ensureShippingInfrastructure(container, salesChannel.id);
  const productSeed = await seedProducts(container, salesChannel.id);
  await ensureProductCategoryLinks();

  logger.info(`Region ready: ${region.name} (${region.currency_code})`);
  logger.info(`Sales channel ready: ${salesChannel.name}`);
  logger.info(`Publishable API key ready: ${apiKey.token}`);
  logger.info("Shipping infrastructure ready (Bedford TX Warehouse, Free + Standard Shipping).");
  logger.info(
    `Product seeding complete. Created ${productSeed.created}, skipped ${productSeed.skipped}, updated ${productSeed.updated}.`,
  );

  if (stripeEnabled) {
    logger.info("Stripe provider enabled for the payment module.");
  } else {
    logger.warn(
      "STRIPE_SECRET_KEY is not set. Region was seeded with manual payment only; Stripe checkout will remain unavailable until the key is provided.",
    );
  }
}
