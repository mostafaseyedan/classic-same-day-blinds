import { WhoWeWorkWith } from "@/components/home/who-we-work-with";
import { Breadcrumbs } from "@blinds/ui";

export default function WhoWeWorkWithPage() {
  return (
    <main className="page-section pb-0 pt-10">
      <div className="content-shell">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Who We Work With" }]} />
      </div>
      <WhoWeWorkWith />
    </main>
  );
}
