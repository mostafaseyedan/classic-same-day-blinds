import { Breadcrumbs } from "@blinds/ui";
import { PageCopy, PageTitle } from "@blinds/ui";
import { MembershipInquiryForm } from "@/components/forms/membership-inquiry-form";
import { legacyContentBlocks } from "@/lib/legacy-reference";

const tiers = [
  {
    name: "Silver",
    description: "Entry tier for growing operational buyers that need discounts and account support.",
  },
  {
    name: "Gold",
    description: "For larger property teams that need faster service, stronger pricing, and more support coverage.",
  },
  {
    name: "Platinum",
    description: "Enterprise-style relationship tier for the most demanding commercial buyers.",
  },
];

export default function MembershipPage() {
  const block = legacyContentBlocks.membership;

  return (
    <main className="page-section pb-20 pt-10">
      <div className="content-shell max-w-6xl">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Commercial" },
            { label: "Trade Program" },
          ]}
        />
        <div className="mt-10 grid gap-16 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div className="grid gap-5">
            <div>
              <PageTitle>
                Ask about membership and buyer programs.
              </PageTitle>
              <PageCopy className="max-w-[35rem]">
                If you place recurring orders or manage multiple properties, a buyer program may be
                a better fit than standard one-off purchasing.
              </PageCopy>
            </div>
            <article className="border-t border-black/6 pt-6">
              <p className="text-base font-semibold text-slate">{block.title}</p>
              <p className="mt-3 text-sm leading-6 text-slate/70">
                Better pricing, stronger account support, and a cleaner repeat-order process for
                teams that buy on a regular basis.
              </p>
            </article>
            <div className="border-t border-black/6">
              {tiers.map((tier) => (
                <article
                  key={tier.name}
                  className="border-t border-black/6 py-5 first:border-t-0 first:pt-0"
                >
                  <p className="text-base font-semibold text-slate">{tier.name}</p>
                  <p className="mt-2 text-sm leading-6 text-slate/70">{tier.description}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="lg:pt-16">
            <MembershipInquiryForm />
          </div>
        </div>
      </div>
    </main>
  );
}
