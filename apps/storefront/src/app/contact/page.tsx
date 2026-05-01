import { Contact } from "@/components/home/contact";
import { Breadcrumbs } from "@blinds/ui";

export default function ContactPage() {
  return (
    <main className="page-section pb-20 pt-10">
      <div className="content-shell max-w-6xl">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
        <div className="[&>section]:pt-0">
          <Contact />
        </div>
      </div>
    </main>
  );
}
