"use client";
import { Button } from "@blinds/ui";
import { SectionHeader } from "@blinds/ui";
import { SectionCopy, SectionTitle } from "@blinds/ui";

import Link from "next/link";

import type { CatalogProduct } from "@/lib/medusa/catalog";
import { ProductCard } from "@/components/storefront/product-card";
import { useLanguage } from "@/lib/context/language-context";
import { useInView } from "@/hooks/use-in-view";

export function FeaturedProducts({ products }: { products: CatalogProduct[] }) {
  const { t } = useLanguage();
  const sectionRef = useInView<HTMLElement>();
  const gridClassName =
    products.length >= 4
      ? "lg:grid-cols-2 xl:grid-cols-4"
      : products.length === 3
        ? "lg:grid-cols-2 xl:grid-cols-3"
        : products.length === 2
          ? "lg:grid-cols-2"
          : "mx-auto max-w-[22rem]";

  return (
    <section ref={sectionRef} data-animate className="page-section bg-shell">
      <div className="content-shell">
        <SectionHeader>
          <div>
            <p className="group flex items-center gap-4 text-xs font-bold uppercase tracking-[0.35em] text-olive">
              <span className="block h-px w-10 bg-olive transition-all duration-300 group-hover:w-16" />
              {t("Featured Products", "Productos Destacados")}
            </p>
            <SectionTitle className="max-w-4xl">
              {t(
                "Custom-made to your exact measurements.",
                "Hecho a medida según sus dimensiones exactas."
              )}
            </SectionTitle>
            <SectionCopy>
              {t(
                "Free samples available on every style.",
                "Muestras gratuitas disponibles en todos los estilos."
              )}
            </SectionCopy>
          </div>
          <Button asChild variant="default" className="self-start whitespace-nowrap"><Link href="/products">
            {t("View Full Catalog", "Ver Catálogo Completo")}
          </Link></Button>
        </SectionHeader>

        <div className={`mt-10 grid gap-6 ${gridClassName}`}>
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
