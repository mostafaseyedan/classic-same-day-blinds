"use client";
import { Badge } from "@blinds/ui";
import { Button } from "@blinds/ui";
import { Breadcrumbs } from "@blinds/ui";
import {
  SectionPanel,
  SurfaceCard,
  SurfaceInset,
  SurfaceInsetMuted,
  SurfaceMuted,
} from "@blinds/ui";
import { Eyebrow, EyebrowAccent, PageTitle } from "@blinds/ui";

import Link from "next/link";
import { ArrowRight, CheckCircle, DownloadSimple, Phone } from "@phosphor-icons/react";

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

const mountGuide = [
  {
    label: "Inside Mount",
    rule: "Order the exact measured opening. Factory deductions are applied automatically.",
    note: 'Minimum depth: ½" for standard blinds, 1¾" for larger headrails.',
    accent: "olive",
  },
  {
    label: "Outside Mount",
    rule: 'Add 2–3" to width and height beyond the frame for better light coverage.',
    note: 'Mount roughly 2" above the frame for a taller visual line.',
    accent: "brass",
  },
] as const;

const visualChecklist = [
  "See the full six-step process at a glance",
  "Compare inside mount vs. outside mount quickly",
  "Keep one visual reference open while you measure",
] as const;

function MountDiagram() {
  return (
    <SurfaceCard className="h-fit self-start p-5">
      <EyebrowAccent>Quick Diagram</EyebrowAccent>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <SurfaceInsetMuted className="p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-olive">Inside Mount</p>
          <svg viewBox="0 0 180 132" className="mt-3 w-full text-slate" aria-hidden="true">
            <rect x="32" y="18" width="116" height="106" rx="6" fill="#f7f2e7" stroke="#17232b" strokeWidth="3" />
            <rect x="61" y="36" width="58" height="70" rx="4" fill="#cfd9d3" stroke="#285846" strokeWidth="3" />
            <line x1="61" y1="26" x2="119" y2="26" stroke="#b07d42" strokeWidth="3" />
            <polygon points="61,26 69,22 69,30" fill="#b07d42" />
            <polygon points="119,26 111,22 111,30" fill="#b07d42" />
            <line x1="44" y1="36" x2="44" y2="106" stroke="#b07d42" strokeWidth="3" />
            <polygon points="44,36 40,44 48,44" fill="#b07d42" />
            <polygon points="44,106 40,98 48,98" fill="#b07d42" />
          </svg>
          <div className="mt-3 flex justify-center">
            <Badge variant="pill-light" className="px-4 py-2 text-slate/78">
              Blind sits inside frame
            </Badge>
          </div>
        </SurfaceInsetMuted>

        <SurfaceInset className="p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brass">Outside Mount</p>
          <svg viewBox="0 0 180 132" className="mt-3 w-full text-slate" aria-hidden="true">
            <rect x="44" y="26" width="92" height="88" rx="6" fill="#f7f2e7" stroke="#17232b" strokeWidth="3" />
            <rect x="26" y="16" width="128" height="108" rx="6" fill="none" stroke="#b07d42" strokeWidth="3" strokeDasharray="6 6" />
            <line x1="26" y1="10" x2="154" y2="10" stroke="#285846" strokeWidth="3" />
            <polygon points="26,10 34,6 34,14" fill="#285846" />
            <polygon points="154,10 146,6 146,14" fill="#285846" />
            <line x1="20" y1="16" x2="20" y2="124" stroke="#285846" strokeWidth="3" />
            <polygon points="20,16 16,24 24,24" fill="#285846" />
            <polygon points="20,124 16,116 24,116" fill="#285846" />
          </svg>
          <div className="mt-3 flex justify-center">
            <Badge variant="pill" className="px-4 py-2 text-slate/78">
              Blind overlaps frame edges
            </Badge>
          </div>
        </SurfaceInset>
      </div>
    </SurfaceCard>
  );
}

export default function HowToMeasurePage() {
  return (
    <main className="px-6 pb-24 pt-10 md:px-10 lg:px-14">
      <div className="content-shell max-w-6xl">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Support", href: "/contact" },
            { label: "How to Measure" },
          ]}
        />
        <div className="mb-10">
          <Eyebrow>Measuring Guide</Eyebrow>
          <PageTitle className="mt-3">
            How to measure your windows.
          </PageTitle>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate/70">
            One compact reference with the visual guide, six-step checklist, and mount rules in the
            same place.
          </p>
        </div>

        <SectionPanel as="section">
          <div className="grid gap-0 xl:grid-cols-[1.06fr_0.94fr]">
            <div className="border-b border-black/6 p-5 xl:border-b-0 xl:border-r xl:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Eyebrow>Visual Reference</Eyebrow>
                  <p className="mt-1 text-sm text-slate/62">
                    The original measuring sheet, kept as the fast-scan view.
                  </p>
                </div>
                <Button asChild variant="secondary"><Link href="/images/home/about-measuring-guide.png" target="_blank">
                  <DownloadSimple className="h-3.5 w-3.5" />
                  Open Guide
                </Link></Button>
              </div>

              <SurfaceCard className="mt-5 overflow-hidden">
                <img
                  src="/images/home/about-measuring-guide.png"
                  alt="Window measuring guide with width, height, inside mount, and outside mount instructions"
                  className="h-auto w-full object-contain"
                />
              </SurfaceCard>
            </div>

            <div className="p-5 xl:p-6">
              <SurfaceMuted className="p-5">
                <EyebrowAccent>Use This First</EyebrowAccent>
                <h2 className="mt-3 font-display text-3xl font-semibold text-slate">
                  Measure once with one clear reference.
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate/68">
                  This compact guide keeps the visual sheet, the written steps, and the mount rules
                  together so the customer does not need to jump between sections.
                </p>

                <div className="mt-5 space-y-3">
                  {visualChecklist.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-olive" />
                      <p className="text-sm leading-6 text-slate/75">{item}</p>
                    </div>
                  ))}
                </div>
              </SurfaceMuted>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {tips.map((tip, i) => (
                  <SurfaceCard key={tip.title} as="article" className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-shell text-sm font-display font-semibold text-olive">
                        {i + 1}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate">{tip.title}</h3>
                        <p className="mt-1 text-sm leading-6 text-slate/66">{tip.body}</p>
                      </div>
                    </div>
                  </SurfaceCard>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-5 border-t border-black/6 p-5 xl:items-start xl:grid-cols-[0.92fr_1.08fr] xl:p-6">
            <MountDiagram />

            <div className="grid gap-4 md:grid-cols-2">
              {mountGuide.map((item) => (
                <SurfaceCard key={item.label} as="article" className="p-5">
                  {item.accent === "olive" ? (
                    <Eyebrow>{item.label}</Eyebrow>
                  ) : (
                    <EyebrowAccent>{item.label}</EyebrowAccent>
                  )}
                  <p className="mt-3 text-sm leading-6 text-slate">{item.rule}</p>
                  <SurfaceInsetMuted className="mt-4 px-4 py-3 text-xs leading-5 text-slate/60">
                    {item.note}
                  </SurfaceInsetMuted>
                </SurfaceCard>
              ))}

              <SurfaceMuted as="article" className="p-5 md:col-span-2">
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <EyebrowAccent>Next Step</EyebrowAccent>
                    <p className="mt-2 font-display text-2xl font-semibold text-slate">
                      Ready to order?
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate/68">
                      Our team can double-check your measurements before you place the order.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button asChild variant="default"><Link href="/products">
                      Shop blinds
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link></Button>
                    <Button asChild variant="secondary"><a href="tel:+18174819468">
                      <Phone className="h-3.5 w-3.5" />
                      Call us
                    </a></Button>
                  </div>
                </div>
              </SurfaceMuted>
            </div>
          </div>
        </SectionPanel>
      </div>
    </main>
  );
}
