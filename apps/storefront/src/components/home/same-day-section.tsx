import { Button, Badge, SurfaceMuted, Eyebrow, SectionTitle, SectionCopy } from "@blinds/ui";
import Image from "next/image";
import Link from "next/link";
import { Truck, Clock, MapPin, ShoppingCart, Scissors, House, NavigationArrow, CaretDown } from "@phosphor-icons/react/dist/ssr";
import { AnimateOnScroll } from "@/components/animate-on-scroll";

const steps = [
  {
    title: "Place Your Order",
    description: "Browse online or call us. Confirm your measurements and checkout before the daily cutoff.",
    icon: ShoppingCart,
  },
  {
    title: "Cut & Prepare",
    description: "We pull from our in-stock inventory and custom-cut to your exact specifications in Bedford, TX.",
    icon: Scissors,
  },
  {
    title: "Same-Day Dispatch",
    description: "DFW orders are dispatched to our fleet or prepped for pick-up. Outside DFW? We ship immediately.",
    icon: Truck,
  },
  {
    title: "Enjoy Your Blinds",
    description: "Get your blinds the same day in DFW. Every order includes an easy installation guide.",
    icon: House,
  },
];

const coverage = [
  { city: "Bedford", county: "Tarrant" },
  { city: "Fort Worth", county: "Tarrant" },
  { city: "Arlington", county: "Tarrant" },
  { city: "Dallas", county: "Dallas" },
  { city: "Irving", county: "Dallas" },
  { city: "Plano", county: "Collin" },
  { city: "Frisco", county: "Collin" },
  { city: "Grapevine", county: "Tarrant" },
  { city: "Denton", county: "Denton" },
  { city: "Southlake", county: "Tarrant" },
  { city: "Keller", county: "Tarrant" },
  { city: "Euless", county: "Tarrant" },
];

export function SameDaySection() {
  return (
    <section className="w-full bg-shell">
      <AnimateOnScroll className="relative w-full overflow-hidden bg-slate shadow-xl">
        <Image
          src="/images/same-day-delivery/hero.jpg"
          alt="Same-Day Delivery truck in Dallas-Fort Worth"
          fill
          className="object-cover object-center opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate/95 via-slate/70 to-transparent" />

        <div className="content-shell relative z-10 py-16 sm:py-20 lg:py-28">
          <div className="max-w-3xl">
            <p className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.35em] text-brass">
              <span className="block h-px w-10 bg-brass" />
              Same-Day Service
            </p>
            
            <h2 className="mt-6 font-display text-4xl font-semibold tracking-tight text-white md:text-5xl lg:leading-[1.1]">
              Get it installed today in Dallas-Fort Worth.
            </h2>
            <p className="mt-6 text-lg leading-8 text-white/80">
              When your order qualifies, our local team routes it for same-day delivery across the
              DFW metro area. Skip the shipping wait and finish your project faster.
            </p>

            {/* Minimal Inline Location Data */}
            <div className="mt-10 flex items-start sm:items-center gap-3 border-l-2 border-brass/50 pl-4">
              <MapPin className="h-6 w-6 text-brass shrink-0 mt-0.5 sm:mt-0" weight="fill" />
              <div>
                <p className="font-semibold text-white text-sm">Local Fleet Dispatch</p>
                <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <p className="text-[0.82rem] font-medium text-white/60">2801 Brasher Ln, Bedford, TX</p>
                  <a
                    href="https://maps.google.com/?q=2801+Brasher+Ln,+Bedford,+TX+76021"
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex items-center gap-1 text-[0.82rem] font-semibold text-brass transition hover:text-white"
                  >
                    Get Directions <NavigationArrow className="h-3 w-3" weight="bold" />
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-12 flex flex-wrap gap-4">
              <Button asChild variant="accent">
                <Link href="/products">Shop eligible products</Link>
              </Button>
              <Button asChild variant="secondary-light">
                <Link href="#coverage">Check coverage area</Link>
              </Button>
            </div>
          </div>
        </div>
      </AnimateOnScroll>

      {/* How It Works Ribbon */}
      <section className="relative z-30 w-full bg-slate py-5 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 md:px-12 lg:px-16">
          <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, idx) => (
              <div key={step.title} className="flex items-center gap-4 border-white/10 py-1 transition-opacity hover:opacity-80 lg:border-l lg:pl-6 lg:first:border-l-0 lg:first:pl-0">
                <step.icon className="h-6 w-6 shrink-0 text-brass" weight="light" />
                <div className="flex flex-col">
                  <span className="text-[0.85rem] font-semibold text-white leading-[1.2]">
                    {idx + 1}. {step.title}
                  </span>
                  <span className="text-[0.8rem] text-white/70 leading-[1.2] mt-0.5">
                    {step.description}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div id="coverage" className="scroll-mt-24" />
      <AnimateOnScroll className="content-shell">
        <div className="mt-16 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-start">
            <SurfaceMuted className="rounded-container p-8 md:p-10">
              <div className="flex items-center gap-3 text-olive">
                <Clock className="h-6 w-6" weight="fill" />
                <h3 className="font-display text-xl font-semibold text-slate">
                  When to Order for Same-Day
                </h3>
              </div>
              <div className="mt-8 grid gap-4 text-[0.88rem]">
                <div className="grid grid-cols-3 border-b border-black/5 pb-2 font-semibold text-slate/50">
                  <span>Day</span>
                  <span>Order By</span>
                  <span>Fulfillment</span>
                </div>
                <div className="grid grid-cols-3 border-b border-black/5 pb-4 items-center">
                  <span className="font-medium text-slate">Mon - Fri</span>
                  <span className="font-semibold text-brass">10:00 AM CST</span>
                  <span className="inline-flex w-fit items-center gap-1 rounded-full bg-olive/10 px-2 py-0.5 text-xs font-bold text-olive">
                    <Truck className="h-3 w-3" /> Same Day
                  </span>
                </div>
                <div className="grid grid-cols-3 border-b border-black/5 pb-4 items-center">
                  <span className="font-medium text-slate">Saturday</span>
                  <span className="text-slate/60 text-xs">Online only</span>
                  <span className="inline-flex w-fit items-center gap-1 rounded-full bg-slate/5 px-2 py-0.5 text-xs font-bold text-slate/70">
                    <Clock className="h-3 w-3" /> Mon / Tue
                  </span>
                </div>
                <div className="grid grid-cols-3 pb-2 items-center">
                  <span className="font-medium text-slate">Sunday</span>
                  <span className="text-slate/60 text-xs">Online only</span>
                  <span className="inline-flex w-fit items-center gap-1 rounded-full bg-slate/5 px-2 py-0.5 text-xs font-bold text-slate/70">
                    <Clock className="h-3 w-3" /> Mon / Tue
                  </span>
                </div>
              </div>
            </SurfaceMuted>

            <div className="flex flex-col gap-6 h-full">
              <article className="relative h-full min-h-[14rem] w-full overflow-hidden rounded-media bg-slate">
                <div className="absolute inset-0">
                  <Image
                    src="/images/same-day-delivery/warehouse.jpg"
                    alt="Warehouse inventory"
                    fill
                    className="object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,30,0.12)_0%,rgba(15,23,30,0.28)_52%,rgba(15,23,30,0.78)_100%)]" />
                </div>
                <div className="absolute inset-x-0 bottom-0 z-10 p-6 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <House className="h-6 w-6 text-brass" weight="fill" />
                    <div>
                      <h3 className="font-bold text-white text-[0.95rem]">Pick-Up Location</h3>
                      <p className="text-xs text-white/70">Bedford, TX Warehouse</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-[0.82rem] text-white/80">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-brass shrink-0 mt-0.5" />
                      <span>2801 Brasher Ln, Bedford, TX 76021</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-brass shrink-0 mt-0.5" />
                      <span>Mon–Fri: 8:00 AM – 5:00 PM</span>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </div>
        {/* Coverage Areas */}
        <section className="mt-16 mb-8">

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-6">
            {coverage.map((loc) => (
              <div
                key={loc.city}
                className="group flex flex-col items-start transition-colors"
              >
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0 text-olive/80 transition-colors group-hover:text-olive" weight="fill" />
                    <span className="text-[0.95rem] font-semibold text-slate">{loc.city}</span>
                  </div>
                  <Badge variant="soft-brass" className="px-1.5 py-0 text-[0.55rem] tracking-wider opacity-0 transition-opacity group-hover:opacity-100">
                    SAME DAY
                  </Badge>
                </div>
                <p className="mt-1 pl-6 text-[0.75rem] text-slate/50">{loc.county} County</p>
              </div>
            ))}
          </div>
        </section>
      </AnimateOnScroll>
    </section>
  );
}
