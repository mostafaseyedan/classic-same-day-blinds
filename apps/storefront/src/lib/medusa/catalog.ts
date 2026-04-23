import "server-only";

import { cache } from "react";
import type { HttpTypes } from "@medusajs/types";

import { getServerMedusaClient } from "@/lib/medusa/sdk-server";

export type CatalogOptionGroup = {
  id: string;
  title: string;
  values: string[];
};

export type CatalogVariant = {
  id: string;
  title: string;
  sku: string | null;
  calculatedPrice: number;
  originalPrice: number | null;
  currencyCode: string;
  inventoryQuantity: number | null;
  manageInventory: boolean;
  options: Record<string, string>;
};

export type MedusaCategory = {
  id: string;
  handle: string;
  name: string;
  description: string | null;
  metadata: Record<string, unknown>;
};

export type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  categoryHandle: string | null;
  categoryLabel: string;
  description: string;
  story: string;
  price: number;
  originalPrice: number | null;
  currencyCode: string;
  image: string;
  images: string[];
  badge: string;
  leadTime: string;
  bestFor: string;
  highlights: string[];
  material: string | null;
  metadata: Record<string, unknown>;
  variants: CatalogVariant[];
  options: CatalogOptionGroup[];
};

const PRODUCT_FIELDS = "*variants.calculated_price,+variants.inventory_quantity,*categories,+metadata";

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

function resolveOriginalPrice(calculated: number | null, original: number | null) {
  if (original && calculated && original > calculated) {
    return original;
  }

  if (original && (!calculated || original > calculated)) {
    return original;
  }

  return null;
}

function collectImages(product: HttpTypes.StoreProduct): string[] {
  const images = new Set<string>();

  if (typeof product.thumbnail === "string" && product.thumbnail.length > 0) {
    images.add(product.thumbnail);
  }

  product.images?.forEach((image) => {
    if (typeof image?.url === "string" && image.url.length > 0) {
      images.add(image.url);
    }
  });

  return Array.from(images);
}

function normalizeVariantOptions(product: HttpTypes.StoreProduct, variant: HttpTypes.StoreProductVariant) {
  const titleById = new Map<string, string>();

  product.options?.forEach((option) => {
    if (option?.id && option?.title) {
      titleById.set(option.id, option.title);
    }
  });

  const normalized: Record<string, string> = {};

  variant.options?.forEach((option) => {
    const optionData = option as HttpTypes.StoreProductOptionValue & {
      option?: { title?: string };
      option_id?: string;
      title?: string;
      option_value?: { value?: string };
    };
    const optionId = optionData.option_id ?? optionData.id ?? "";
    const title =
      titleById.get(optionId) ?? optionData.option?.title ?? optionData.title ?? "Option";
    const value = optionData.value ?? optionData.option_value?.value ?? "";

    if (title && value) {
      normalized[title] = value;
    }
  });

  return normalized;
}

function normalizeOptions(product: HttpTypes.StoreProduct, variants: CatalogVariant[]): CatalogOptionGroup[] {
  return (product.options ?? []).map((option) => {
    const values = Array.from(
      new Set(
        variants
          .map((variant) => variant.options[option.title])
          .filter((value): value is string => Boolean(value)),
      ),
    );

    return {
      id: option.id,
      title: option.title,
      values,
    };
  });
}

function deriveCategoryLabel(product: HttpTypes.StoreProduct) {
  return (
    product.collection?.title ??
    product.categories?.[0]?.name ??
    product.type?.value ??
    ""
  );
}

function parseMetaStringArray(value: unknown): string[] | undefined {
  if (Array.isArray(value)) {
    const strings = value.filter((v): v is string => typeof v === "string");
    return strings.length > 0 ? strings : undefined;
  }
  if (typeof value === "string" && value.trim().startsWith("[")) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        const strings = parsed.filter((v): v is string => typeof v === "string");
        return strings.length > 0 ? strings : undefined;
      }
    } catch {
      // ignore parse errors
    }
  }
  return undefined;
}

function normalizeProduct(product: HttpTypes.StoreProduct): CatalogProduct {
  const slug = product.handle || product.id;
  const images = collectImages(product);

  const variants: CatalogVariant[] = (product.variants ?? []).map((variant) => {
    const calculated = asNumber(
      variant.calculated_price?.calculated_amount ??
        variant.calculated_price?.calculated_amount_without_tax,
    );
    const original = asNumber(variant.calculated_price?.original_amount);
    const resolvedOriginal = resolveOriginalPrice(calculated, original);
    const currencyCode =
      variant.calculated_price?.currency_code?.toUpperCase() ??
      product.variants?.[0]?.calculated_price?.currency_code?.toUpperCase() ??
      "USD";

    return {
      id: variant.id,
      title: variant.title || "",
      sku: variant.sku ?? null,
      calculatedPrice: calculated ?? 0,
      originalPrice: resolvedOriginal,
      currencyCode,
      inventoryQuantity: asNumber(variant.inventory_quantity),
      manageInventory: variant.manage_inventory ?? false,
      options: normalizeVariantOptions(product, variant),
    };
  });

  // Derive lowest price across all variants so cards always show the minimum
  const minPriceVariant = variants.length > 0
    ? variants.reduce((min, v) => v.calculatedPrice < min.calculatedPrice ? v : min, variants[0])
    : null;
  const options = normalizeOptions(product, variants);
  const meta = (product.metadata ?? {}) as Record<string, unknown>;

  const metaBadge = typeof meta.badge === "string" ? meta.badge : (typeof meta.merchandising_label === "string" ? meta.merchandising_label : undefined);
  const metaLeadTime = typeof meta.lead_time === "string" ? meta.lead_time : (typeof meta.lead_time_label === "string" ? meta.lead_time_label : undefined);
  const metaBestFor = typeof meta.best_for === "string" ? meta.best_for : undefined;
  const metaStory = typeof meta.story === "string" ? meta.story : undefined;
  const metaHighlights = parseMetaStringArray(meta.highlights);
  const highlights = metaHighlights ?? [];
  const description = product.description?.trim() || "";

  const categoryHandle = (product.categories as MedusaCategory[] | undefined)?.[0]?.handle ?? null;

  return {
    id: product.id,
    slug,
    name: product.title || "",
    categoryHandle,
    categoryLabel: deriveCategoryLabel(product),
    description,
    story: metaStory ?? "",
    price: minPriceVariant?.calculatedPrice ?? 0,
    originalPrice: minPriceVariant?.originalPrice ?? null,
    currencyCode: minPriceVariant?.currencyCode ?? "USD",
    image: images[0] ?? "",
    images,
    badge: metaBadge ?? "",
    leadTime: metaLeadTime ?? "",
    bestFor: metaBestFor ?? "",
    highlights,
    material: product.material ?? null,
    metadata: meta,
    variants,
    options,
  };
}

export const getDefaultRegion = cache(async () => {
  const sdk = getServerMedusaClient();

  if (!sdk) {
    return null;
  }

  try {
    const { regions } = await sdk.store.region.list({
      limit: 10,
    });

    return regions[0] ?? null;
  } catch (error) {
    console.error("Failed to load Medusa region", error);
    return null;
  }
});

export const getCatalogProducts = cache(async (): Promise<CatalogProduct[]> => {
  const sdk = getServerMedusaClient();

  if (!sdk) {
    return [];
  }

  try {
    const region = await getDefaultRegion();

    const { products } = await sdk.store.product.list({
      limit: 24,
      region_id: region?.id,
      fields: PRODUCT_FIELDS,
    });

    if (!products || products.length === 0) {
      return [];
    }

    return products.map((product: HttpTypes.StoreProduct) => normalizeProduct(product));
  } catch (error) {
    console.error("Failed to load Medusa products", error);
    return [];
  }
});

export async function getFeaturedCatalogProducts(limit = 4) {
  const products = await getCatalogProducts();
  return products.slice(0, limit);
}

export async function getCatalogProductBySlug(slug: string): Promise<CatalogProduct | null> {
  const products = await getCatalogProducts();
  return products.find((product) => product.slug === slug) ?? null;
}

export const getCatalogCategories = cache(async (): Promise<MedusaCategory[]> => {
  const sdk = getServerMedusaClient();

  if (!sdk) {
    return [];
  }

  try {
    const { product_categories } = await sdk.store.category.list({ limit: 50 });

    type RawCategory = { id: string; handle: string; name: string; description?: string; metadata?: Record<string, unknown> };
    const cats = (product_categories ?? []) as unknown as RawCategory[];
    return cats.map((c) => ({
      id: c.id,
      handle: c.handle,
      name: c.name,
      description: c.description ?? null,
      metadata: c.metadata ?? {},
    }));
  } catch (error) {
    console.error("Failed to load Medusa categories", error);
    return [];
  }
});
