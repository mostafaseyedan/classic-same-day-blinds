import { QuoteRequestForm } from "@/components/quote/quote-request-form";
import { Breadcrumbs } from "@blinds/ui";
import { PageCopy, PageTitle } from "@blinds/ui";

export default function QuotePage() {
  return (
    <main className="page-section pb-20 pt-10">
      <div className="content-shell max-w-6xl">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Support", href: "/contact" },
            { label: "Quote Request" },
          ]}
        />
        <div className="mt-10 grid gap-16 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div>
            <PageTitle>
              Request a custom quote for your project.
            </PageTitle>
            <PageCopy className="max-w-[34rem]">
              Use this form for larger projects, commercial needs, or price-match questions. Share
              the basics and the team will follow up with the right next step.
            </PageCopy>
            <div className="mt-8 border-t border-black/6 pt-6">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-brass">
                Best for
              </p>
              <div className="mt-4 grid gap-4">
                {[
                  "Large residential or commercial blind orders.",
                  "Price comparisons that need human review.",
                  "Projects that need tailored product guidance before purchase.",
                ].map((item) => (
                  <div key={item} className="border-t border-black/6 pt-4 first:border-t-0 first:pt-0">
                    <p className="text-sm leading-6 text-slate/70">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <QuoteRequestForm />
        </div>
      </div>
    </main>
  );
}
