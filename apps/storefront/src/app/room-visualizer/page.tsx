import { RoomVisualizerStudio } from "@/components/visualizer/room-visualizer-studio";
import { Breadcrumbs } from "@blinds/ui";
import { PageCopyLight, PageTitleLight } from "@blinds/ui";

export default function RoomVisualizerPage() {
  return (
    <main>
      <section className="bg-gradient-to-br from-slate to-olive px-6 py-16 text-shell md:px-10 lg:px-14">
        <div className="mx-auto max-w-6xl">
          <Breadcrumbs
            className="mb-6"
            tone="light"
            items={[
              { label: "Home", href: "/" },
              { label: "Services" },
              { label: "Room Visualizer" },
            ]}
          />
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brass/90">
            Room Visualizer
          </p>
          <PageTitleLight>
            The visualizer now lives in the new storefront.
          </PageTitleLight>
          <PageCopyLight className="mt-6 max-w-2xl text-base leading-8">
            This migrated version keeps the visualizer route and customer workflow in the production
            app. It is intentionally lighter than the legacy demo and ready to evolve toward real catalog integration.
          </PageCopyLight>
        </div>
      </section>

      <section className="px-6 py-16 md:px-10 lg:px-14">
        <div className="mx-auto max-w-7xl">
          <RoomVisualizerStudio />
        </div>
      </section>
    </main>
  );
}
