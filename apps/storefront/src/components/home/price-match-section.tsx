import { Button } from "@blinds/ui";
import { SectionPanel, SurfaceInset } from "@blinds/ui";
import Link from "next/link";

type PriceMatchSectionProps = {
  opsReady: boolean;
};

const benefits = [
  "We match any verifiable competitor price — no haggling required",
  "Faster turnaround on bulk and commercial quote requests",
  "Price-matched orders confirmed within one business day",
];

export function PriceMatchSection({ opsReady }: PriceMatchSectionProps) {
  return (
    <section className="px-6 py-16 md:px-10 lg:px-14">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl bg-slate shadow-[0_32px_90px_rgba(17,25,34,0.18)]">
        <div className="grid gap-8 px-6 py-10 lg:grid-cols-[0.95fr_1.05fr] lg:px-10">
          <div className="text-shell">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brass/90">
              Price Match
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight md:text-5xl">
              We'll match any competitor's price.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-shell/76">
              Found the same blind for less? Share your quote and we'll beat it. Submit a request
              and our team will respond with a price-matched order within one business day.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="accent">
                <Link href="/quote">
                  Submit a Quote Request
                </Link>
              </Button>
              <Button asChild variant="secondary-light">
                <Link href="/contact">Talk to Sales</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {benefits.map((benefit) => (
              <SurfaceInset key={benefit} className="px-5 py-5">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brass">
                  Price Match Guarantee
                </p>
                <p className="mt-3 text-lg font-semibold text-slate">{benefit}</p>
              </SurfaceInset>
            ))}
            <SectionPanel className="bg-white/6 px-5 py-5 text-shell shadow-none">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brass/90">
                How It Works
              </p>
              <p className="mt-3 text-sm leading-6 text-shell/78">
                {opsReady
                  ? "Submit your competitor quote and our team will contact you with a price-matched order confirmation."
                  : "Submit your competitor quote below. We review every request and respond with a confirmed price match within one business day."}
              </p>
            </SectionPanel>
          </div>
        </div>
      </div>
    </section>
  );
}
