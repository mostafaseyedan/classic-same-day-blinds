"use client";

import Link from "next/link";
import { CheckCircle, MinusCircle, XCircle } from "@phosphor-icons/react";
import { Button, Eyebrow, SectionCopy, SectionHeader, SectionTitle, cn } from "@blinds/ui";

import { useLanguage } from "@/lib/context/language-context";

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
    feature: "On-site consultation",
    featureEs: "Consulta en sitio",
    classic: "yes",
    online: "no",
    retail: "partial",
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
    feature: "Rewards toward future orders",
    featureEs: "Beneficios para pedidos futuros",
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
    return <CheckCircle className="h-5 w-5 text-[#1fb857]" weight="bold" />;
  }

  if (status === "partial") {
    return <MinusCircle className="h-5 w-5 text-[#7f94bd]" weight="bold" />;
  }

  return <XCircle className="h-5 w-5 text-[#ff5f5f]" weight="bold" />;
}

export function CompetitiveAdvantages() {
  const { t } = useLanguage();

  return (
    <section className="page-section border-t border-black/5 bg-white">
      <div className="content-shell">
        <SectionHeader>
          <div>
            <Eyebrow>{t("Why Teams Choose Us", "Por Qué Nos Eligen")}</Eyebrow>
            <SectionTitle className="max-w-3xl">
              {t(
                "A better fit for fast-turn projects, property teams, and hospitality installs.",
                "Una mejor opción para proyectos rápidos, equipos de propiedades e instalaciones de hospitalidad.",
              )}
            </SectionTitle>
            <SectionCopy className="max-w-2xl">
              {t(
                "The difference is not just product selection. It is speed, support, physical samples, and a team that can handle both single-room jobs and repeat property work.",
                "La diferencia no es solo la selección de productos. Es velocidad, soporte, muestras físicas y un equipo que puede atender tanto trabajos por habitación como proyectos repetidos de propiedad.",
              )}
            </SectionCopy>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="default">
              <Link href="/quote">{t("Request a Quote", "Solicitar Cotización")}</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/contact">{t("Talk to the Team", "Hablar con el Equipo")}</Link>
            </Button>
          </div>
        </SectionHeader>

        <div className="mt-8 overflow-hidden rounded-[1.4rem] border border-black/7 bg-white shadow-[0_18px_42px_-24px_rgba(23,35,43,0.12)]">
          <div className="overflow-x-auto">
            <table className="min-w-[42rem] w-full border-collapse">
              <thead>
                <tr className="border-b border-black/7 bg-shell/58 text-slate">
                  <th className="px-4 py-4 text-left text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-slate/56">
                    {t("Feature", "Característica")}
                  </th>
                  <th className="px-4 py-4 text-center text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-brass">
                    Classic Same Day
                  </th>
                  <th className="px-4 py-4 text-center text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-slate/54">
                    Blinds.com
                  </th>
                  <th className="px-4 py-4 text-center text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-slate/54">
                    Lowe&apos;s
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, index) => (
                  <tr
                    key={row.feature}
                    className={cn(
                      "border-t border-black/6",
                      index % 2 === 0 ? "bg-white" : "bg-shell/38",
                    )}
                  >
                    <td className="px-4 py-3.5 text-sm font-medium leading-6 text-slate">
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

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-black/6 bg-shell/34 px-4 py-3 text-[0.72rem] font-medium text-slate/66">
            <span className="inline-flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-[#1fb857]" weight="bold" />
              {t("Yes", "Sí")}
            </span>
            <span className="inline-flex items-center gap-2">
              <MinusCircle className="h-4 w-4 text-[#7f94bd]" weight="bold" />
              {t("Partial", "Parcial")}
            </span>
            <span className="inline-flex items-center gap-2">
              <XCircle className="h-4 w-4 text-[#ff5f5f]" weight="bold" />
              {t("No", "No")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
