import { RoomVisualizerStudio } from "@/components/visualizer/room-visualizer-studio";
import { getCatalogProducts } from "@/lib/medusa/catalog";
import { Breadcrumbs } from "@blinds/ui";
import { PageCopy, PageTitle } from "@blinds/ui";

export default async function RoomVisualizerPage() {
  const products = await getCatalogProducts();

  return (
    <main>
      <section className="page-section bg-shell pb-20 pt-10">
        <div className="mx-auto max-w-6xl">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Services" },
              { label: "Room Visualizer" },
            ]}
          />
          <PageTitle>
            The visualizer now lives in the new storefront.
          </PageTitle>
          <PageCopy className="mt-2 max-w-2xl">
            Preview products in a sample room or your own photo before moving into catalog selection.
          </PageCopy>
        </div>
      </section>

      <section className="bg-shell px-6 pb-16 md:px-10 lg:px-14">
        <div className="mx-auto max-w-7xl">
          <RoomVisualizerStudio products={products} />
        </div>
      </section>
    </main>
  );
}
