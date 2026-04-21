import { getCatalogProducts, getCatalogCategories } from "@/lib/medusa/catalog";
import { ProductsGrid } from "@/components/storefront/products-grid";

type ProductsPageProps = {
  searchParams?: Promise<{
    category?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const [products, categories] = await Promise.all([
    getCatalogProducts(),
    getCatalogCategories(),
  ]);

  return (
    <main className="px-5 pb-20 pt-8 md:px-10 lg:px-14">
      <div className="mx-auto max-w-[82rem]">
        <div className="mb-5 md:mb-7">
          <p className="catalog-kicker">
            Custom Window Treatments
          </p>
          <h1 className="catalog-title">
            Every blind, every window size.
          </h1>
          <p className="catalog-copy">
            Cut-to-order from our Bedford, Texas warehouse. Same-day shipping on in-stock sizes —
            custom cuts ship in 2 to 5 business days.
          </p>
        </div>

        <ProductsGrid
          products={products}
          categories={categories}
          initialCategory={params?.category}
        />
      </div>
    </main>
  );
}
