import { Button } from "@blinds/ui";
import { SectionHeader } from "@blinds/ui";
import { Eyebrow, EyebrowAccent, SectionCopy, SectionTitle } from "@blinds/ui";
import Link from "next/link";

import { getCatalogCategories } from "@/lib/medusa/catalog";

// Static image map keyed by category handle — images are local assets, not catalog data.
const CATEGORY_IMAGES: Record<string, string> = {
  "vinyl-blinds":     "/images/categories/vinyl-blinds.jpg",
  "aluminum-blinds":  "/images/categories/aluminum-blinds.jpg",
  "faux-wood-blinds": "/images/categories/faux-wood-blinds.jpg",
  "vertical-blinds":  "/images/categories/vertical-blinds.jpg",
};

export async function CategoryGrid() {
  const categories = await getCatalogCategories();

  return (
    <section className="page-section">
      <div className="content-shell">
        <SectionHeader>
          <div>
            <Eyebrow>Core Categories</Eyebrow>
            <SectionTitle>
              Four product families. Every window size, every budget.
            </SectionTitle>
            <SectionCopy>
              From everyday vinyl to moisture-resistant faux wood and wide-span verticals — each
              category is custom-cut and ships direct from our Bedford, Texas warehouse.
            </SectionCopy>
          </div>
          <Button asChild variant="secondary"><Link href="/products">
            Browse the Catalog
          </Link></Button>
        </SectionHeader>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {categories.map((category) => {
            const image = CATEGORY_IMAGES[category.handle] ?? "/images/categories/vinyl-blinds.jpg";
            const shortLabel = String(category.metadata?.short_label ?? category.name);
            const priceHint = String(category.metadata?.price_hint ?? "");

            return (
              <Link
                key={category.handle}
                href={`/products?category=${category.handle}`}
                className="group card-interactive"
              >
                <div className="aspect-[4/3] overflow-hidden bg-shell">
                  <img
                    src={image}
                    alt={category.name}
                    className="h-full w-full object-cover object-center"
                  />
                </div>
                <div className="px-5 py-5">
                  <EyebrowAccent>{shortLabel}</EyebrowAccent>
                  <h3 className="mt-2 text-xl font-semibold text-slate">{category.name}</h3>
                  {category.description ? (
                    <p className="mt-3 text-sm leading-6 text-slate/72">{category.description}</p>
                  ) : null}
                  <div className="mt-5 flex items-center justify-between text-sm">
                    {priceHint ? (
                      <span className="font-medium text-olive">{priceHint}</span>
                    ) : (
                      <span />
                    )}
                    <span className="font-semibold text-slate transition group-hover:text-brass">
                      Explore
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
