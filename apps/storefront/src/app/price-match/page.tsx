import { PriceMatchSection } from "@/components/home/price-match-section";
import { Breadcrumbs } from "@blinds/ui";

export default function PriceMatchPage() {
  return (
    <main className="page-section pb-20 pt-10">
      <div className="content-shell">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Price Match" }]} />
        <PriceMatchSection opsReady={true} variant="page" />
      </div>
    </main>
  );
}
