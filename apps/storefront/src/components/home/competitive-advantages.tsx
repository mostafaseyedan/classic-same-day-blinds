"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckCircle, MinusCircle, XCircle } from "@phosphor-icons/react";
import { Button, SectionCopy, SectionHeader, SectionTitle, cn } from "@blinds/ui";

import { useLanguage } from "@/lib/context/language-context";
import { useInView } from "@/hooks/use-in-view";

type ComparisonStatus = "yes" | "partial" | "no";

const comparisonRows = [
  {
    feature: "Hospitality-grade quality",
    featureEs: "Calidad apta para hospitalidad",
    classic: "yes",
    online: "no",
    retail: "partial",
  },
  {
    feature: "Same-day to 4-day shipping",
    featureEs: "Envío el mismo día a 4 días",
    classic: "yes",
    online: "partial",
    retail: "no",
  },
  {
    feature: "No minimum order",
    featureEs: "Sin pedido mínimo",
    classic: "yes",
    online: "yes",
    retail: "yes",
  },
  {
    feature: "Bulk discount tiers",
    featureEs: "Escalas de descuento por volumen",
    classic: "yes",
    online: "partial",
    retail: "no",
  },
  {
    feature: "Custom sizing available",
    featureEs: "Tamaños personalizados disponibles",
    classic: "yes",
    online: "yes",
    retail: "partial",
  },
  {
    feature: "Dedicated account support",
    featureEs: "Soporte dedicado de cuenta",
    classic: "yes",
    online: "no",
    retail: "no",
  },
  {
    feature: "Free physical samples",
    featureEs: "Muestras físicas gratuitas",
    classic: "yes",
    online: "yes",
    retail: "no",
  },
  {
    feature: "Bulk order fulfillment",
    featureEs: "Cumplimiento de pedidos por volumen",
    classic: "yes",
    online: "partial",
    retail: "no",
  },
  {
    feature: "Project-side hospitality support",
    featureEs: "Soporte para proyectos de hospitalidad",
    classic: "yes",
    online: "no",
    retail: "no",
  },
  {
    feature: "Match-or-beat pricing review",
    featureEs: "Revisión para igualar o mejorar precio",
    classic: "yes",
    online: "partial",
    retail: "no",
  },
] as const satisfies ReadonlyArray<{
  feature: string;
  featureEs: string;
  classic: ComparisonStatus;
  online: ComparisonStatus;
  retail: ComparisonStatus;
}>;

function StatusMark({ status }: { status: ComparisonStatus }) {
  if (status === "yes") {
    return <CheckCircle className="h-5 w-5 text-green-400" weight="bold" />;
  }

  if (status === "partial") {
    return <MinusCircle className="h-5 w-5 text-white/40" weight="bold" />;
  }

  return <XCircle className="h-5 w-5 text-red-400" weight="bold" />;
}

export function CompetitiveAdvantages() {
  const { t } = useLanguage();
  const contentRef = useInView<HTMLDivElement>();

  return (
    <section className="page-section relative overflow-hidden">
      {/* Hero background with heavy dark overlay */}
      <Image
        src="/images/home/hero-v1-residential.jpg"
        alt=""
        fill
        className="object-cover object-center"
        aria-hidden
      />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(10,16,22,0.82)_0%,rgba(10,16,22,0.65)_100%)]" />

      <div ref={contentRef} data-animate className="relative z-10 content-shell">
        <SectionHeader>
          <div>
            <p className="group flex items-center gap-4 text-xs font-bold uppercase tracking-[0.35em] text-green-400">
              <span className="block h-px w-10 bg-green-400 transition-all duration-300 group-hover:w-16" />
              {t("Why Teams Choose Us", "Por Qué Nos Eligen")}
            </p>
            <SectionTitle className="max-w-3xl text-white">
              {t(
                "A better fit for fast-turn projects, property teams, and hospitality installs.",
                "Una mejor opción para proyectos rápidos, equipos de propiedades e instalaciones de hospitalidad.",
              )}
            </SectionTitle>
            <SectionCopy className="max-w-2xl text-white/68">
              {t(
                "The difference is not just product selection. It is speed, support, physical samples, and a team that can handle both single-room jobs and repeat property work.",
                "La diferencia no es solo la selección de productos. Es velocidad, soporte, muestras físicas y un equipo que puede atender tanto trabajos por habitación como proyectos repetidos de propiedad.",
              )}
            </SectionCopy>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="accent">
              <Link href="/quote">{t("Request a Quote", "Solicitar Cotización")}</Link>
            </Button>
            <Button asChild variant="secondary-light">
              <Link href="/contact">{t("Talk to the Team", "Hablar con el Equipo")}</Link>
            </Button>
          </div>
        </SectionHeader>

        {/* Glass table */}
        <div className="mt-8 overflow-hidden rounded-[1.4rem] border border-white/12 bg-[rgba(23,35,43,0.36)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_24px_56px_rgba(4,10,18,0.32)] backdrop-blur-2xl backdrop-saturate-[1.3]">
          <div className="overflow-x-auto">
            <table className="min-w-[42rem] w-full border-collapse">
              <thead>
                <tr className="border-b border-white/14">
                  <th className="px-4 py-4 text-left text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white/55">
                    {t("Feature", "Característica")}
                  </th>
                  {/* Our brand */}
                  <th className="px-4 py-5 text-center">
                    <div className="inline-flex items-center gap-3">
                      <div className="grid gap-1">
                        {[11, 17, 23].map((w) => (
                          <span key={w} className="rounded-full bg-olive" style={{ width: w, height: 4 }} />
                        ))}
                      </div>
                      <div className="grid gap-0.5 text-left">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brass">Classic Same Day</p>
                        <p className="font-display text-xl font-semibold leading-none text-white">Blinds</p>
                      </div>
                    </div>
                  </th>
                  {/* Blinds.com */}
                  <th className="px-4 py-5 text-center">
                    <div className="inline-flex items-center justify-center">
                      <div className="rounded-md bg-white px-2.5 py-1.5">
                        <Image
                          src="/images/blinds-dot-com-logo.png"
                          alt="Blinds.com"
                          width={90}
                          height={28}
                          className="h-6 w-auto object-contain"
                        />
                      </div>
                    </div>
                  </th>
                  {/* HD Supply */}
                  <th className="px-4 py-5 text-center">
                    <div className="inline-flex items-center justify-center">
                      <div className="rounded-md bg-white px-2.5 py-1.5">
                        <Image
                          src="/images/hd-supply-logo.png"
                          alt="HD Supply"
                          width={64}
                          height={28}
                          className="h-6 w-auto object-contain"
                        />
                      </div>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, index) => (
                  <tr
                    key={row.feature}
                    className={cn(
                      "border-t border-white/[0.09]",
                      index % 2 === 0 ? "bg-white/[0.04]" : "bg-white/[0.09]",
                    )}
                  >
                    <td className="px-4 py-3.5 text-sm font-medium leading-6 text-white">
                      {t(row.feature, row.featureEs)}
                    </td>
                    <td className="px-4 py-3.5 text-center align-middle">
                      <span className="inline-flex items-center justify-center">
                        <StatusMark status={row.classic} />
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center align-middle">
                      <span className="inline-flex items-center justify-center">
                        <StatusMark status={row.online} />
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center align-middle">
                      <span className="inline-flex items-center justify-center">
                        <StatusMark status={row.retail} />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/12 px-4 py-3 text-[0.72rem] font-medium text-white/55">
            <span className="inline-flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" weight="bold" />
              {t("Yes", "Sí")}
            </span>
            <span className="inline-flex items-center gap-2">
              <MinusCircle className="h-4 w-4 text-white/40" weight="bold" />
              {t("Partial", "Parcial")}
            </span>
            <span className="inline-flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-400" weight="bold" />
              {t("No", "No")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
