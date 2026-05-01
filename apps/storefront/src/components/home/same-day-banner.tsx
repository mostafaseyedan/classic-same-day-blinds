import { Badge, Button } from "@blinds/ui";
import { Clock, MapPin, Package, Truck } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { legacyContentBlocks } from "@/lib/legacy-reference";

const serviceHighlights = [
  "Same-day pick-up available",
  "Dallas-Fort Worth area coverage",
  "Order before 10 AM",
  "Free standard shipping nationwide",
];

const deliveryModes = [
  { icon: Truck, title: "DFW same-day", copy: "Local delivery and pickup on qualifying in-stock orders." },
  { icon: Package, title: "Nationwide shipping", copy: "Most U.S. orders arrive in 2-4 business days from Bedford." },
  { icon: Clock, title: "Clear cutoffs", copy: "Weekday, weekend, and stock timing stay visible before checkout." },
];

export function SameDayBanner() {
  return (
    <section className="page-section border-y border-black/5 bg-white">
      <div className="content-shell">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div>
            <p className="group flex items-center gap-4 text-xs font-bold uppercase tracking-[0.35em] text-olive">
              <span className="block h-px w-10 bg-olive transition-all duration-300 group-hover:w-16" />
              DFW local advantage
            </p>
            <h2 className="mt-5 font-display text-4xl font-semibold tracking-tight text-slate md:text-5xl">
              Keep same-day delivery prominent and operationally honest.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate/70">
              {legacyContentBlocks.sameDayDelivery.summary}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {serviceHighlights.map((highlight) => (
                <Badge key={highlight} variant="soft-brass" className="text-sm font-semibold">
                  {highlight}
                </Badge>
              ))}
            </div>
          </div>

          <div className="border-t border-black/10 pt-8 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
            <div className="grid gap-5">
              {deliveryModes.map((mode) => (
                <div key={mode.title} className="flex gap-4 border-b border-black/8 pb-5 last:border-b-0 last:pb-0">
                  <mode.icon className="mt-1 h-5 w-5 shrink-0 text-brass" weight="fill" />
                  <div>
                    <h3 className="text-base font-semibold text-slate">{mode.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate/65">{mode.copy}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="accent">
                <Link href="/same-day-delivery">View delivery policy</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/quote">Request a quote</Link>
              </Button>
            </div>

            <p className="mt-5 flex items-center gap-2 text-sm font-semibold text-slate/62">
              <MapPin className="h-4 w-4 text-olive" weight="fill" />
              Bedford warehouse dispatch: 2801 Brasher Ln, Bedford, TX 76021
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
