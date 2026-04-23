import { Button } from "@blinds/ui";
import { Badge } from "@blinds/ui";
import { SectionPanel } from "@blinds/ui";
import Link from "next/link";

import { legacyContentBlocks } from "@/lib/legacy-reference";

const serviceHighlights = [
  "Same-day pick-up available",
  "Dallas-Fort Worth area coverage",
  "Order cutoff rules stay explicit",
  "Standard shipping fallback when route or stock is unavailable",
];

export function SameDayBanner() {
  return (
    <section className="px-6 py-16 md:px-10 lg:px-14">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-container bg-slate shadow-[0_30px_90px_rgba(17,25,34,0.24)]">
        <div className="relative">
          <img
            src="/images/home/sameday-banner.jpg"
            alt="Same-day blinds delivery in the Dallas Fort Worth area"
            className="absolute inset-0 h-full w-full object-cover object-center opacity-35"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(19,27,33,0.96)_0%,rgba(19,27,33,0.84)_52%,rgba(19,27,33,0.52)_100%)]" />

          <div className="relative grid gap-8 px-6 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-10">
            <div className="text-shell">
              <Badge variant="soft-light" className="border-brass/25 bg-brass/12 text-brass">
                DFW local advantage
              </Badge>
              <h2 className="mt-5 font-display text-4xl font-semibold tracking-tight md:text-5xl">
                Keep same-day delivery prominent and operationally honest.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-shell/76">
                {legacyContentBlocks.sameDayDelivery.summary}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {serviceHighlights.map((highlight) => (
                  <Badge key={highlight} variant="soft-light" className="text-sm font-semibold text-shell/88">
                    {highlight}
                  </Badge>
                ))}
              </div>
            </div>

            <SectionPanel className="bg-white/10 p-6 text-shell shadow-none backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brass/90">
                Service policy
              </p>
              <div className="mt-5 space-y-3">
                {legacyContentBlocks.sameDayDelivery.bullets.map((bullet) => (
                  <div key={bullet} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4">
                    <p className="text-sm leading-6 text-shell/82">{bullet}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild variant="accent" className="border-emerald-400 bg-emerald-400 hover:bg-emerald-300">
                  <Link href="/same-day-delivery">
                    View delivery policy
                  </Link>
                </Button>
                <Button asChild variant="secondary-light">
                  <Link href="/quote">Request a quote</Link>
                </Button>
              </div>

              <p className="mt-4 text-sm leading-6 text-shell/64">
                Local speed stays a differentiator, but it must be tied to real inventory, route,
                and cutoff rules rather than a marketing-only promise.
              </p>
            </SectionPanel>
          </div>
        </div>
      </div>
    </section>
  );
}
