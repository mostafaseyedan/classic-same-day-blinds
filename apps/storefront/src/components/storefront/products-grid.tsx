"use client";
import { Button } from "@blinds/ui";
import { Select } from "@blinds/ui";

import { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal } from "@phosphor-icons/react";

import { ProductCard } from "@/components/storefront/product-card";
import type { CatalogProduct, MedusaCategory } from "@/lib/medusa/catalog";

type SortOption = "featured" | "price-asc" | "price-desc";

type ProductsGridProps = {
  products: CatalogProduct[];
  categories: MedusaCategory[];
  initialCategory?: string;
};

export function ProductsGrid({ products, categories, initialCategory }: ProductsGridProps) {
  const resolvedInitialCategory =
    initialCategory && categories.some((category) => category.handle === initialCategory)
      ? initialCategory
      : "all";

  const [activeCategory, setActiveCategory] = useState<string>(resolvedInitialCategory);
  const [sort, setSort] = useState<SortOption>("featured");

  useEffect(() => {
    setActiveCategory(resolvedInitialCategory);
  }, [resolvedInitialCategory]);

  const filtered = useMemo(() => {
    let result =
      activeCategory === "all"
        ? products
        : products.filter((p) => p.categoryHandle === activeCategory);

    if (sort === "price-asc") result = [...result].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") result = [...result].sort((a, b) => b.price - a.price);

    return result;
  }, [products, activeCategory, sort]);

  const activeCategoryMeta = categories.find((c) => c.handle === activeCategory);

  return (
    <div>
      <div className="mb-3 flex flex-col gap-3 border-b border-black/6 pb-3 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={() => setActiveCategory("all")}
            variant={activeCategory === "all" ? "chip-active" : "chip"}
            size="compact"
            className="px-4 py-2 text-[0.68rem] tracking-[0.12em]"
          >
            All
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.handle}
              type="button"
              onClick={() => setActiveCategory(cat.handle)}
              variant={activeCategory === cat.handle ? "chip-active" : "chip"}
              size="compact"
              className="px-4 py-2 text-[0.68rem] tracking-[0.12em]"
            >
              {cat.name}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <SlidersHorizontal className="h-3.5 w-3.5 text-slate/36" />
          <Select
            size="compact"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="min-w-[12rem] border-black/10 shadow-none"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </Select>
        </div>
      </div>

      <p className="mb-4 text-[0.76rem] uppercase tracking-[0.12em] text-slate/46">
        {filtered.length} {filtered.length === 1 ? "product" : "products"}
        {activeCategoryMeta ? ` in ${activeCategoryMeta.name}` : ""}
      </p>

      {filtered.length > 0 ? (
        <div className="grid gap-x-5 gap-y-8 md:grid-cols-2 xl:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <p className="font-display text-[2rem] font-medium text-slate">No products found</p>
          <p className="text-sm leading-6 text-slate/58">Try a different category or clear your filters.</p>
          <Button variant="default"
            onClick={() => setActiveCategory("all")}

          >
            Show all products
          </Button>
        </div>
      )}
    </div>
  );
}
