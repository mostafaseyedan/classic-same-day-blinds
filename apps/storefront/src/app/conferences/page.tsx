import { ConferenceInterestForm } from "@/components/forms/conference-interest-form";
import { Breadcrumbs } from "@blinds/ui";
import { PageCopy, PageTitle } from "@blinds/ui";
import { legacyContentBlocks } from "@/lib/legacy-reference";

const conferences = [
  {
    title: "Apartmentalize / NAA",
    focus: "Multifamily operations, resident experience, and bulk window-treatment workflows.",
  },
  {
    title: "AIM Conference",
    focus: "Apartment innovation, smart home capabilities, and modernization programs.",
  },
  {
    title: "NMHC Annual Meeting",
    focus: "Executive networking, procurement strategy, and operational partnerships.",
  },
];

export default function ConferencesPage() {
  const block = legacyContentBlocks.conferences;

  return (
    <main className="page-section pb-20 pt-10">
      <div className="content-shell max-w-6xl">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Commercial" },
            { label: "Conferences" },
          ]}
        />
        <div className="mt-10 grid gap-16 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div className="grid gap-5">
            <div>
              <PageTitle>
                Start a conference or partnership conversation.
              </PageTitle>
              <PageCopy className="max-w-[35rem]">
                Use this page for trade-show follow-up, multifamily partnerships, and larger
                business-development conversations that go beyond a standard product order.
              </PageCopy>
            </div>
            <article className="border-t border-black/6 pt-6">
              <p className="text-base font-semibold text-slate">{block.title}</p>
              <p className="mt-3 text-sm leading-6 text-slate/70">
                Reach out if you want to connect around conferences, regional programs, or broader
                operational partnerships.
              </p>
            </article>
            <div className="border-t border-black/6">
              {conferences.map((conference) => (
                <article
                  key={conference.title}
                  className="border-t border-black/6 py-5 first:border-t-0 first:pt-0"
                >
                  <p className="text-base font-semibold text-slate">{conference.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate/70">{conference.focus}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="lg:pt-16">
            <ConferenceInterestForm />
          </div>
        </div>
      </div>
    </main>
  );
}
