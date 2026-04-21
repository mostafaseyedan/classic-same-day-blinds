import { Button } from "@blinds/ui";
import { Badge } from "@blinds/ui";
import { Breadcrumbs } from "@blinds/ui";
import { Label } from "@blinds/ui";
import { FormShell, SectionPanel } from "@blinds/ui";
import { Eyebrow, PageCopy, TaskPageTitle } from "@blinds/ui";
import Link from "next/link";

const steps = [
  "Choose an in-stock product and enter a delivery address inside the current same-day coverage area.",
  "Place the order before the daily cutoff so the team can confirm routing and fulfillment timing.",
  "Orders outside the service area or after cutoff continue through the normal shipping path.",
];

const coverage = [
  "Bedford",
  "Fort Worth",
  "Arlington",
  "Dallas",
  "Irving",
  "Plano",
  "Frisco",
  "Grapevine",
  "Denton",
];

const details = [
  {
    label: "Service area",
    value: "DFW metro",
  },
  {
    label: "Operations base",
    value: "Bedford, Texas",
  },
  {
    label: "Fallback",
    value: "Standard shipping when same-day is unavailable",
  },
];

const faqs = [
  {
    question: "What is the cutoff time?",
    answer:
      "Cutoff timing depends on product availability, route demand, and operating capacity for that day.",
  },
  {
    question: "Does every product qualify?",
    answer:
      "No. Same-day service is limited to qualifying products, available inventory, and delivery areas inside the active route.",
  },
  {
    question: "Can I pick up the order instead?",
    answer:
      "Pickup can be arranged for qualifying orders. Contact the team if you need same-day collection instead of delivery.",
  },
];

export default function SameDayDeliveryPage() {
  return (
    <main className="page-section pb-20 pt-10">
      <div className="content-shell max-w-6xl">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Services" },
            { label: "Same-Day Delivery" },
          ]}
        />
        <SectionPanel as="section" className="px-6 py-10 md:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
            <div className="grid gap-8">
              <div>
                <Eyebrow>Same-Day Delivery</Eyebrow>
                <TaskPageTitle>Get qualifying blinds delivered the same day in DFW.</TaskPageTitle>
                <PageCopy className="max-w-[35rem]">
                  When an order qualifies, the local team can route it for same-day delivery across
                  the Dallas-Fort Worth service area. Orders outside coverage continue through the
                  regular shipping flow.
                </PageCopy>
              </div>

              <div className="border-t border-black/6 pt-6">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-brass">
                  How it works
                </p>
                <div className="mt-4 grid gap-4">
                  {steps.map((step, index) => (
                    <article
                      key={step}
                      className="border-t border-black/6 pt-4 first:border-t-0 first:pt-0"
                    >
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-brass">
                        Step {index + 1}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate/76">{step}</p>
                    </article>
                  ))}
                </div>
              </div>
            </div>

            <FormShell>
              <div className="grid gap-6">
                <div className="grid gap-4 border-b border-black/6 pb-6">
                  {details.map((item) => (
                    <div key={item.label} className="grid gap-1">
                      <Label as="p" variant="utility">{item.label}</Label>
                      <p className="text-sm leading-6 text-slate">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="border-b border-black/6 pb-6">
                  <Label as="p" variant="utility">Current coverage</Label>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {coverage.map((city) => (
                      <Badge key={city} variant="pill-light">
                        {city}
                      </Badge>
                    ))}
                    <Badge variant="pill">Outside DFW: standard shipping</Badge>
                  </div>
                </div>

                <div>
                  <Label as="p" variant="utility">Common questions</Label>
                  <div className="mt-4 grid gap-4">
                    {faqs.map((item) => (
                      <article
                        key={item.question}
                        className="border-t border-black/6 pt-4 first:border-t-0 first:pt-0"
                      >
                        <p className="text-sm font-semibold text-slate">{item.question}</p>
                        <p className="mt-2 text-sm leading-6 text-slate/72">{item.answer}</p>
                      </article>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 border-t border-black/6 pt-6">
                  <Button asChild variant="default"><Link href="/products">
                    Shop products
                  </Link></Button>
                  <Button asChild variant="secondary"><Link href="/contact">
                    Contact support
                  </Link></Button>
                </div>
              </div>
            </FormShell>
          </div>
        </SectionPanel>
      </div>
    </main>
  );
}
