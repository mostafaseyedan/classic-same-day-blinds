import { SampleRequestForm } from "@/components/forms/sample-request-form";
import { Breadcrumbs } from "@blinds/ui";
import { SectionPanel } from "@blinds/ui";
import { Eyebrow, PageCopy, TaskPageTitle } from "@blinds/ui";
import { legacyContentBlocks } from "@/lib/legacy-reference";

export default function FreeSamplePage() {
  const block = legacyContentBlocks.freeSample;
  const steps = [
    ...block.bullets,
    "Return to the storefront to place the final order once you decide on a finish.",
  ];

  return (
    <main className="page-section pb-20 pt-10">
      <div className="content-shell max-w-6xl">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Support", href: "/contact" },
            { label: "Free Sample" },
          ]}
        />
        <SectionPanel as="section" className="px-6 py-10 md:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div>
            <Eyebrow>Free Sample</Eyebrow>
            <TaskPageTitle>
              Request samples before placing the full order.
            </TaskPageTitle>
            <PageCopy className="max-w-[35rem]">
              Compare finishes, confirm material direction, and narrow down the right look for your
              space before you commit to custom sizing.
            </PageCopy>
            <div className="mt-8 border-t border-black/6 pt-6">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-brass">
                How it works
              </p>
              <div className="mt-4 grid gap-4">
              {steps.map((step, index) => (
                  <article key={step} className="border-t border-black/6 pt-4 first:border-t-0 first:pt-0">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-brass">
                    Step {index + 1}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate/72">{step}</p>
                  </article>
              ))}
              </div>
            </div>
          </div>

          <SampleRequestForm />
          </div>
        </SectionPanel>
      </div>
    </main>
  );
}
