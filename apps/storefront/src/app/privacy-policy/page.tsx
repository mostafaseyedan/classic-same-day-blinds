import { SectionPanel } from "@blinds/ui";
import { Eyebrow, PageTitle } from "@blinds/ui";

export default function PrivacyPolicyPage() {
  return (
    <main className="px-6 pb-20 pt-10 md:px-10 lg:px-14">
      <div className="mx-auto max-w-4xl">
        <SectionPanel as="section" className="border border-black/5 px-6 py-10 shadow-[0_24px_70px_rgba(24,36,34,0.08)] md:px-8">
          <Eyebrow>Privacy Policy</Eyebrow>
          <PageTitle>
            Policy content no longer depends on the archived demo.
          </PageTitle>
          <div className="mt-6 space-y-5 text-sm leading-7 text-slate/72">
            <p>
              This route is the new storefront location for privacy policy content. The final legal
              copy should be reviewed before launch and versioned as part of the production site.
            </p>
            <p>
              Customer information, addresses, and payment references will only be surfaced from
              real backend systems. Browser-only storage patterns from the old demo are not part of
              the production privacy model.
            </p>
            <p>
              Once the final policy text is approved, this page should be replaced with the
              reviewed legal document and linked from checkout, account, and quote workflows.
            </p>
          </div>
        </SectionPanel>
      </div>
    </main>
  );
}
