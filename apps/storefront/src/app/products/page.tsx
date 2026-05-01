import { getCatalogProducts, getCatalogCategories } from "@/lib/medusa/catalog";
import { Breadcrumbs, PageTitle } from "@blinds/ui";
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

  const activeCategory = params?.category 
    ? categories.find(c => c.handle === params.category)
    : null;

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Products", href: activeCategory ? "/products" : undefined },
    ...(activeCategory ? [{ label: activeCategory.name }] : []),
  ];

  return (
    <main className="page-section pb-20 pt-10">
      <div className="mx-auto max-w-[82rem]">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="mb-5 md:mb-7">
          <PageTitle>
            Every blind, every window size.
          </PageTitle>
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
