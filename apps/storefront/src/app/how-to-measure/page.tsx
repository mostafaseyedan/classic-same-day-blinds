"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle, DownloadSimple, Phone } from "@phosphor-icons/react";

import { Badge, Breadcrumbs, Button, Eyebrow, EyebrowAccent, PageCopy, PageTitle } from "@blinds/ui";

const tips = [
  {
    title: "Use a steel tape measure",
    body: "Cloth or plastic tapes stretch. Use metal only.",
  },
  {
    title: "Write width first",
    body: "Always record dimensions in W × H order.",
  },
  {
    title: "Measure width three times",
    body: "Top, middle, bottom. Record all three numbers.",
  },
  {
    title: "Measure height three times",
    body: "Left, center, right. Use the tallest for inside mount.",
  },
  {
    title: "Round to the nearest ⅛ inch",
    body: "That is the cleanest ordering format for production.",
  },
  {
    title: "Choose mount style",
    body: "Inside and outside mount follow different deduction rules.",
  },
] as const;


function MountDiagram() {
  return (
    <div className="grid gap-12 md:grid-cols-2">
      {/* Inside Mount */}
      <div className="flex flex-col gap-6">
        <Eyebrow>Inside Mount</Eyebrow>
        <div className="overflow-hidden rounded-media">
          <img 
            src="/images/how-to-measure/inside-mount.png" 
            alt="Inside mount wood blind example" 
            className="aspect-[4/3] w-full object-cover" 
          />
        </div>
        <div>
          <p className="text-sm leading-6 text-slate/70">Order the exact measured opening. Factory deductions are applied automatically.</p>
          <p className="mt-2 text-sm leading-relaxed text-slate/60">Minimum depth: ½&quot; for standard blinds, 1¾&quot; for larger headrails.</p>
        </div>
      </div>

      {/* Outside Mount */}
      <div className="flex flex-col gap-6">
        <EyebrowAccent>Outside Mount</EyebrowAccent>
        <div className="overflow-hidden rounded-media">
          <img 
            src="/images/how-to-measure/outside-mount.png" 
            alt="Outside mount wood blind example" 
            className="aspect-[4/3] w-full object-cover" 
          />
        </div>
        <div>
          <p className="text-sm leading-6 text-slate/70">Add 2–3&quot; to width and height beyond the frame for better light coverage.</p>
          <p className="mt-2 text-sm leading-relaxed text-slate/60">Mount roughly 2&quot; above the frame for a taller visual line.</p>
        </div>
      </div>
    </div>
  );
}

export default function HowToMeasurePage() {
  return (
    <main>
      {/* SECTION 1: Intro + Mount Rules (bg-shell) */}
      <section className="page-section bg-shell pb-24 pt-10">
        <div className="content-shell max-w-6xl">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Support", href: "/contact" },
              { label: "How to Measure" },
            ]}
          />
          <div className="mb-10 max-w-2xl">
            <PageTitle>How to measure your windows.</PageTitle>
            <PageCopy>
              One compact reference with the visual guide, six-step checklist, and mount rules in the same place.
            </PageCopy>
          </div>

          <MountDiagram />
        </div>
      </section>

      {/* SECTION 2: Visual Reference & Tips (bg-white) */}
      <section className="page-section bg-white pb-24 pt-12">
        <div className="content-shell max-w-6xl">
          <div className="grid gap-16 lg:grid-cols-[1fr_1fr]">
            {/* Left Column: Visual Reference */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <Eyebrow className="group flex items-center gap-4">
                    <span className="block h-px w-10 bg-olive transition-all duration-300 group-hover:w-16" />
                    Visual Reference
                  </Eyebrow>
                  <p className="mt-4 text-sm text-slate/60">The original measuring sheet.</p>
                </div>
                <Button asChild variant="secondary" size="compact" className="gap-1.5 shadow-none">
                  <Link href="/images/home/about-measuring-guide.png" target="_blank">
                    <DownloadSimple className="h-3.5 w-3.5" />
                    Open Guide
                  </Link>
                </Button>
              </div>
              <div className="overflow-hidden rounded-media">
                <img
                  src="/images/home/about-measuring-guide.png"
                  alt="Window measuring guide with width, height, inside mount, and outside mount instructions"
                  className="h-auto w-full object-contain mix-blend-multiply"
                />
              </div>
            </div>

            {/* Right Column: Instructions */}
            <div className="flex flex-col gap-12">
              {/* Tips Grid */}
              <div className="mt-16 grid gap-x-8 gap-y-10 sm:grid-cols-2">
                {tips.map((tip, i) => (
                  <div key={tip.title} className="flex flex-col gap-3">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-brass">
                      Step {i + 1}
                    </p>
                    <div>
                      <h3 className="text-sm font-semibold text-slate">{tip.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-slate/60">{tip.body}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild className="shadow-none">
                  <Link href="/products">Shop Blinds</Link>
                </Button>
                <Button asChild variant="secondary" className="shadow-none">
                  <a href="tel:18005051905">
                    <Phone className="mr-2 h-4 w-4" />
                    Call Us
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

