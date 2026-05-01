"use client";

import { Button, EyebrowAccent, SurfaceMuted } from "@blinds/ui";
import Image from "next/image";
import Link from "next/link";
import { Truck, MapPin, ShoppingCart, Scissors, House, NavigationArrow } from "@phosphor-icons/react";
import { useInView } from "@/hooks/use-in-view";

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

const transitZones = [
  { label: "Texas & nearby states", days: "1-2" },
  { label: "Central & Southeast", days: "2-3" },
  { label: "Coasts & mountain states", days: "3-4" },
];

export function SameDaySection() {
  const heroContentRef = useInView<HTMLDivElement>();
  const coverageRef = useInView<HTMLDivElement>();

  return (
    <section className="w-full bg-shell">
      <div className="relative w-full overflow-hidden bg-slate shadow-xl">
        <Image
          src="/images/same-day-delivery/hero.jpg"
          alt="Same-Day Delivery truck in Dallas-Fort Worth"
          fill
          className="object-cover object-center opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate/95 via-slate/70 to-transparent" />

        <div ref={heroContentRef} data-animate className="content-shell relative z-10 py-16 sm:py-20 lg:py-28">
          <div className="max-w-3xl">
            <p className="group flex items-center gap-4 text-xs font-bold uppercase tracking-[0.35em] text-green-400">
              <span className="block h-px w-10 bg-green-400 transition-all duration-300 group-hover:w-16" />
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
              <MapPin className="h-5 w-5 text-brass shrink-0 mt-0.5 sm:mt-0" weight="regular" />
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
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Ribbon */}
      <section className="relative z-30 w-full bg-slate py-5 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 md:px-12 lg:px-16">
          <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, idx) => (
              <div key={step.title} className="flex items-center gap-4 border-white/10 py-1 transition-opacity hover:opacity-80 lg:border-l lg:pl-6 lg:first:border-l-0 lg:first:pl-0">
                <step.icon className="h-6 w-6 shrink-0 text-green-400" weight="light" />
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
      <div ref={coverageRef} data-animate className="page-section content-shell">
        <div className="max-w-3xl">
          <p className="group flex items-center gap-4 text-xs font-bold uppercase tracking-[0.35em] text-olive">
            <span className="block h-px w-10 bg-olive transition-all duration-300 group-hover:w-16" />
            Delivery Details
          </p>
          <h2 className="mt-6 font-display text-3xl font-semibold tracking-tight text-slate md:text-4xl">
            Same-day timing, pickup, and coverage.
          </h2>
        </div>

        <div className="mt-10 grid gap-6">
          <SurfaceMuted className="rounded-container p-7 md:p-8">
            <div>
              <EyebrowAccent as="h3" className="mt-0">
                When to Order for Same-Day
              </EyebrowAccent>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate/64">
                Place weekday orders before the local cutoff for same-day fulfillment.
              </p>
            </div>

            <div className="mt-7 grid gap-0">
              {[
                { day: "Mon – Fri", orderBy: "Before 5:00 PM", fulfillment: "Same Day" },
                { day: "Mon – Thu", orderBy: "After 5:00 PM", fulfillment: "Next Business Day" },
                { day: "Friday", orderBy: "After 5:00 PM", fulfillment: "Ships Monday" },
                { day: "Sat – Sun", orderBy: "Online only", fulfillment: "Mon / Tue" },
              ].map((row) => (
                <div key={`${row.day}-${row.orderBy}`} className="flex items-baseline justify-between gap-5 border-b border-black/8 py-4 first:pt-0 last:border-b-0">
                  <div>
                    <p className="text-sm font-semibold text-slate">{row.day}</p>
                    <p className="mt-1 text-xs font-medium text-slate/55">{row.orderBy}</p>
                  </div>
                  <span className="text-sm font-semibold text-olive">
                    {row.fulfillment}
                  </span>
                </div>
              ))}
            </div>
          </SurfaceMuted>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-stretch xl:grid-cols-[minmax(0,1fr)_25rem]">
            <div className="relative min-h-[14rem] overflow-hidden rounded-media border border-black/8 bg-white sm:min-h-[16rem] lg:h-full">
              <Image
                src="/images/same-day-delivery/dfw-coverage-graphic.jpg"
                alt="DFW same-day delivery coverage area"
                fill
                className="scale-125 object-cover object-center"
                sizes="(min-width: 1280px) 48rem, (min-width: 1024px) calc(100vw - 34rem), 100vw"
              />
            </div>

            <SurfaceMuted className="h-full rounded-container p-7 md:p-8">
              <div>
                <EyebrowAccent as="h3" className="mt-0">
                  Pickup Location
                </EyebrowAccent>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate/64">
                  Orders route from our Bedford warehouse for local pickup and eligible DFW delivery.
                </p>
              </div>

              <div className="mt-7 border-y border-black/8 py-4 text-sm leading-6 text-slate/70">
                <p className="font-semibold text-slate">Bedford, TX Warehouse</p>
                <p className="mt-1">2801 Brasher Ln, Bedford, TX 76021</p>
                <p>Mon-Fri: 8:00 AM - 5:00 PM</p>
              </div>
            </SurfaceMuted>
          </div>
        </div>

        <section className="mt-10">
          <SurfaceMuted className="rounded-container p-7 md:p-8">
            <div className="grid gap-8 lg:grid-cols-[0.68fr_1.32fr] lg:items-center">
              <div>
                <div>
                  <EyebrowAccent as="h3" className="mt-0">
                    Shipping Outside DFW
                  </EyebrowAccent>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate/64">
                    Outside the DFW route? In-stock blinds ship free from our Bedford warehouse. Most U.S.
                    deliveries arrive in 2-4 business days with tracking included.
                  </p>
                </div>

                <div className="mt-7 grid gap-0">
                  {transitZones.map((zone) => (
                    <div key={zone.label} className="flex items-baseline justify-between gap-5 border-b border-black/8 py-4 first:pt-0 last:border-b-0">
                      <span className="text-sm font-semibold text-slate">{zone.label}</span>
                      <span className="text-sm font-semibold text-olive">{zone.days} business days</span>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs leading-5 text-slate/55">
                  Estimates are for in-stock items after warehouse processing.
                </p>
              </div>

              <div className="overflow-hidden rounded-media border border-black/8 bg-white">
                <Image
                  src="/images/same-day-delivery/shipping-zones-map.jpg"
                  alt="Shipping speed zones from Bedford, Texas"
                  width={1200}
                  height={896}
                  className="h-auto w-full"
                  sizes="(min-width: 1280px) 56rem, (min-width: 1024px) 58vw, 100vw"
                />
              </div>
            </div>
          </SurfaceMuted>
        </section>
      </div>
    </section>
  );
}
