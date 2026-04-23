import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "@phosphor-icons/react/ssr";
import { Badge } from "@blinds/ui";
import { Breadcrumbs } from "@blinds/ui";

import { FrequentlyBoughtTogether } from "@/components/product/frequently-bought-together";
import { ProductAccordion } from "@/components/product/product-accordion";
import { ProductImageGallery } from "@/components/product/product-image-gallery";
import { AddToCartPanel } from "@/components/storefront/add-to-cart-panel";
import { RecentlyViewedTracker } from "@/components/storefront/recently-viewed-tracker";
import { getCatalogProductBySlug, getCatalogProducts } from "@/lib/medusa/catalog";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

const SPEC_LABELS: Record<string, string> = {
  min_width_inches: "Minimum width",
  max_width_inches: "Maximum width",
  min_height_inches: "Minimum height",
  max_height_inches: "Maximum height",
  slat_size_inches: "Slat size",
  vane_width_inches: "Vane width",
  max_area_sq_ft: "Max size",
  inside_mount_deduction_inches: "Inside mount deduction",
  minimum_inside_mount_depth_inches: "Minimum inside mount depth",
  minimum_inside_mount_depth_flush_inches: "Minimum inside mount depth (fully recessed)",
  minimum_outside_mount_surface_per_side_inches: "Minimum outside mount surface per side",
  minimum_outside_mount_surface_inches: "Minimum outside mount surface",
  standard_options: "Standard options",
  upgrades: "Upgrades",
  stack_options: "Stack options",
  construction: "Construction",
  origin: "Origin of production",
};

const SPEC_ORDER = [
  "min_width_inches",
  "max_width_inches",
  "min_height_inches",
  "max_height_inches",
  "slat_size_inches",
  "vane_width_inches",
  "max_area_sq_ft",
  "inside_mount_deduction_inches",
  "minimum_inside_mount_depth_inches",
  "minimum_inside_mount_depth_flush_inches",
  "minimum_outside_mount_surface_per_side_inches",
  "minimum_outside_mount_surface_inches",
  "standard_options",
  "upgrades",
  "stack_options",
  "construction",
  "origin",
];

function readMetaString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function readMetaStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0);
  }

  if (typeof value === "string" && value.trim().startsWith("[")) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0);
      }
    } catch {
      return [];
    }
  }

  return [];
}

function readMetaRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  if (typeof value === "string" && value.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      return null;
    }
  }

  return null;
}

function formatSpecValue(key: string, value: unknown): string {
  if (Array.isArray(value)) {
    return value.filter(Boolean).join(", ");
  }

  if (typeof value === "number") {
    if (key.endsWith("_inches")) return `${value}"`;
    if (key.endsWith("_sq_ft")) return `${value} sq ft`;
    return `${value}`;
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return typeof value === "string" ? value : "";
}

export async function generateStaticParams() {
  const products = await getCatalogProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getCatalogProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: `${product.name} | Classic Same Day Blinds`,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getCatalogProductBySlug(slug);
  if (!product) notFound();

  const relatedProducts = (await getCatalogProducts())
    .filter((p) => p.slug !== product.slug && p.categoryLabel !== product.categoryLabel)
    .slice(0, 2);

  const measurementModel = (product.metadata?.measurement_model as string | undefined) ?? "custom-size";
  const isStock = measurementModel === "stock-size";
  const productStory = readMetaString(product.metadata?.story) ?? product.story;
  const installTimeLabel = readMetaString(product.metadata?.install_time_label);
  const considerations = readMetaStringArray(product.metadata?.considerations);
  const specsRecord = readMetaRecord(product.metadata?.specs);
  const specEntries = SPEC_ORDER
    .map((key) => {
      const raw = specsRecord?.[key];
      if (raw == null || raw === "" || (Array.isArray(raw) && raw.length === 0)) {
        return null;
      }

      const value = formatSpecValue(key, raw);
      if (!value) return null;

      return {
        key,
        label: SPEC_LABELS[key] ?? key.replaceAll("_", " "),
        value,
      };
    })
    .filter((entry): entry is { key: string; label: string; value: string } => Boolean(entry));

  return (
    <main className="px-5 pb-18 pt-8 md:px-10 lg:px-14">
      <RecentlyViewedTracker
        product={{
          slug: product.slug,
          name: product.name,
          categoryLabel: product.categoryLabel,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.image,
          badge: product.badge,
        }}
      />

      <div className="mx-auto max-w-[82rem]">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Products", href: "/products" },
            ...(product.categoryHandle
              ? [{ label: product.categoryLabel, href: `/products?category=${product.categoryHandle}` }]
              : []),
            { label: product.name },
          ]}
        />

        <div className="grid items-start gap-8 lg:grid-cols-[0.92fr_1.08fr] xl:gap-10">
          <ProductImageGallery images={product.images} name={product.name} />

          <div className="flex flex-col gap-5">
            <div className="rounded-card border border-black/8 bg-white px-4 py-4 md:px-5 md:py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-brass/95">
                    {product.categoryLabel}
                  </p>
                  <h1 className="mt-1.5 max-w-[16ch] font-display text-[1.78rem] font-medium leading-[1.02] tracking-tight text-slate md:text-[2.05rem]">
                    {product.name}
                  </h1>
                </div>
                {product.badge && (
                  <Badge variant="soft-brass" className="shrink-0">
                    {product.badge}
                  </Badge>
                )}
              </div>

              <div className="mt-2.5 max-w-[34rem] text-[0.9rem] leading-6 text-slate/68">
                {productStory || product.description}
              </div>

              <ProductAccordion
                items={[
                  ...((product.description || installTimeLabel || considerations.length > 0)
                    ? [{
                      key: "details",
                      label: "Product Details",
                      content: (
                        <div className="grid gap-4">
                          {product.description ? (
                            <p className="max-w-[42rem] text-[0.88rem] leading-6 text-slate/74">
                              {product.description}
                            </p>
                          ) : null}
                          {installTimeLabel ? (
                            <div className="text-[0.84rem] leading-6 text-slate/74">
                              <span className="font-semibold text-slate">Install time:</span>{" "}
                              <span>{installTimeLabel}</span>
                            </div>
                          ) : null}
                          {considerations.length > 0 ? (
                            <div>
                              <ul className="grid gap-2">
                                {considerations.map((item) => (
                                  <li key={item} className="flex items-start gap-2">
                                    <span className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-brass/70" />
                                    <span className="text-[0.86rem] leading-6 text-slate/72">{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : null}
                        </div>
                      ),
                    }]
                    : []),
                  ...(product.highlights.length > 0
                    ? [{
                      key: "features",
                      label: "Key Features",
                      content: (
                        <ul className="grid gap-2 sm:grid-cols-2">
                          {product.highlights.map((highlight) => (
                            <li key={highlight} className="flex items-start gap-2">
                              <Check className="mt-0.5 h-4 w-4 shrink-0 text-olive" />
                              <span className="text-[0.88rem] leading-6 text-slate/72">{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      ),
                    }]
                    : []),
                  ...(product.bestFor
                    ? [{
                      key: "ideal",
                      label: "Ideal For",
                      content: (
                        <p className="text-[0.84rem] leading-6 text-slate">{product.bestFor}</p>
                      ),
                    }]
                    : []),
                  {
                    key: "specs",
                    label: "Product Specifications",
                    content: (
                      <table className="w-full text-left text-[0.84rem] leading-6">
                        <tbody className="divide-y divide-black/6">
                          {product.leadTime && (
                            <tr>
                              <td className="py-2 pr-4 font-semibold text-slate">Lead time</td>
                              <td className="py-2 text-slate/74">{product.leadTime}</td>
                            </tr>
                          )}
                          <tr>
                            <td className="py-2 pr-4 font-semibold text-slate">Fulfillment</td>
                            <td className="py-2 text-slate/74">{isStock ? "Stock size" : "Made to order"}</td>
                          </tr>
                          {product.material && (
                            <tr>
                              <td className="py-2 pr-4 font-semibold text-slate">Material</td>
                              <td className="py-2 text-slate/74">{product.material}</td>
                            </tr>
                          )}
                          {specEntries.map((entry) => (
                            <tr key={entry.key}>
                              <td className="py-2 pr-4 font-semibold text-slate">{entry.label}</td>
                              <td className="py-2 text-slate/74">{entry.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ),
                  },
                ]}
              />

              <div className="mt-4 border-t border-black/6 pt-4">
                <AddToCartPanel product={product} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <FrequentlyBoughtTogether currentProduct={product} relatedProducts={relatedProducts} />
        </div>
      </div>
    </main>
  );
}
