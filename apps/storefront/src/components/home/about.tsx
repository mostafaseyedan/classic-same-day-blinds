"use client";

import Image from "next/image";
import { Trophy, MapPin, Scissors } from "@phosphor-icons/react/ssr";
import { useInView } from "@/hooks/use-in-view";
import { EyebrowAccent, SectionTitle } from "@blinds/ui";
import type { GooglePlaceData } from "@/lib/google-reviews";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/context/language-context";

const storyProof = [
  {
    Icon: Trophy,
    title: "Since 1986",
    copy: "The business started in window coverings long before the current storefront existed.",
    accent: "brass" as const,
  },
  {
    Icon: Scissors,
    title: "Custom-fit by default",
    copy: "The catalog is built around made-to-measure ordering, not off-the-shelf compromise.",
    accent: undefined,
  },
  {
    Icon: MapPin,
    title: "Bedford warehouse",
    copy: "Local homeowners and property teams still have a real place to get help before ordering.",
    accent: undefined,
  },
] as const;

export function About({ googlePlace }: { googlePlace: GooglePlaceData | null }) {
  const { t } = useLanguage();
  const contentRef = useInView<HTMLDivElement>();
  void googlePlace;

  const stats = [
    {
      value: "30+",
      unit: "Years",
      label: "in business — since 1986",
    },
    {
      value: "2M+",
      unit: "Happy",
      label: "customers served across the nation",
    },
    {
      value: "Same-Day",
      unit: "DFW",
      label: "fulfillment on eligible stock items",
    },
  ] as const;

  return (
    <section id="about" className="page-section border-t border-black/5 bg-white">
      <div ref={contentRef} data-animate className="content-shell">

        {/* Section intro */}
        <div className="flex flex-col gap-3">
          <p className="group flex items-center gap-4 text-xs font-bold uppercase tracking-[0.35em] text-olive">
            <span className="block h-px w-10 bg-olive transition-all duration-300 group-hover:w-16" />
            {t("Our Story", "Nuestra Historia")}
          </p>
          <SectionTitle className="max-w-3xl">
            {t("America's #1 Online blinds sales", "La Tienda #1 en Línea de Persianas")}
          </SectionTitle>
        </div>

        {/* Large typographic stat block */}
        <div className="mt-10 grid grid-cols-1 divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0 divide-black/8 border-y border-black/8 py-2">
          {stats.map((stat) => (
            <div
              key={stat.value}
              className="flex flex-col gap-1 py-8 sm:py-6 sm:px-10 first:pl-0 last:pr-0"
            >
              <p className="font-display text-[3rem] font-medium leading-none tracking-tighter text-slate">
                {stat.value}
              </p>
              <p className="mt-1.5 text-[0.7rem] font-bold uppercase tracking-[0.2em] text-brass">
                {stat.unit}
              </p>
              <p className="mt-1 text-[0.85rem] leading-5 text-slate/60">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Story grid */}
        <div className="mt-10 grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div>
            <EyebrowAccent>Our Story</EyebrowAccent>
            <div className="mt-6 space-y-5 text-sm leading-6 text-slate/70 sm:text-base sm:leading-7">
              <p>
                {t(
                  "For over 30 years, Classic Same Day Blinds has been helping homeowners, commercial properties, and maintenance teams find the perfect window treatments. We believe every window deserves a beautiful, custom-fitted solution — and we make that easy, reliable, and affordable.",
                  "Durante más de 30 años, Classic Same Day Blinds ha estado ayudando a propietarios y empresas a encontrar los tratamientos de ventana perfectos."
                )}
              </p>
              <p>
                {t(
                  "From our free sample program to our expert design consultants available 7 days a week, we're committed to making your window treatment experience seamless from start to finish.",
                  "Desde nuestro programa de muestras gratis hasta nuestros consultores expertos, estamos comprometidos con su experiencia."
                )}
              </p>
              <p>
                {t(
                  "Every blind and shade is custom made to your exact measurements, ensuring a perfect fit for residential homes, property managers, maintenance teams, and commercial buildings alike.",
                  "Cada persiana se fabrica a medida, garantizando un ajuste perfecto para hogares y edificios comerciales por igual."
                )}
              </p>
            </div>

            <div className="mt-10">
              <div className="space-y-7 border-t border-black/10 pt-7 lg:space-y-8">
                {storyProof.map(({ Icon, title, copy, accent }) => (
                  <article key={title} className="flex items-start gap-5 sm:gap-6">
                    <div className={cn("mt-1", accent === "brass" ? "text-brass" : "text-olive")}>
                      <Icon className="h-6 w-6 stroke-[1.25]" />
                    </div>
                    <div>
                      {accent === "brass" ? (
                        <EyebrowAccent as="h3" className="mt-0">{title}</EyebrowAccent>
                      ) : (
                        <h3 className="font-display text-xl font-medium tracking-tight text-slate lg:text-2xl">{title}</h3>
                      )}
                      <p className="mt-2 text-sm leading-[1.7] text-slate/70 sm:text-base">{copy}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="grid gap-4 sm:grid-cols-[1.06fr_0.94fr]">
              <div className="relative aspect-[4/4.8] overflow-hidden rounded-media bg-shell">
                <Image
                  src="/images/home/about-consultation.png"
                  alt="Window treatment consultation"
                  fill
                  className="object-cover object-center"
                />
              </div>
              <div className="flex flex-col gap-4 sm:pt-12">
                <div className="relative aspect-[4/3.7] overflow-hidden rounded-media bg-shell">
                  <Image
                    src="/images/home/about-blinds.png"
                    alt="Installed residential blinds"
                    fill
                    className="object-cover object-center"
                  />
                </div>

              </div>
            </div>
            <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-olive/10 blur-3xl sm:h-36 sm:w-36" />
          </div>
        </div>
      </div>
    </section>
  );
}
