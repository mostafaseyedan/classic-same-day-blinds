"use client";

import { ArrowRight } from "@phosphor-icons/react";
import { Button, SectionCopy, SectionTitle } from "@blinds/ui";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/lib/context/language-context";
import { useInView } from "@/hooks/use-in-view";

export function RoomVisualizerTeaser() {
  const { t } = useLanguage();
  const contentRef = useInView<HTMLDivElement>();

  return (
    <section className="border-b border-black/5 bg-white pb-20 sm:pb-24 md:pb-28">
      <div ref={contentRef} data-animate className="content-shell">
        <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div>
            <SectionTitle className="max-w-3xl">
              {t("See it in your room before you buy.", "Véalo en su habitación antes de comprar.")}
            </SectionTitle>
            <SectionCopy className="max-w-2xl">
              {t(
                "Upload a room photo and preview blind styles, colors, and textures in the actual space before you order.",
                "Sube una foto de tu habitación y previsualiza estilos, colores y texturas antes de comprar."
              )}
            </SectionCopy>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="accent">
                <Link href="/room-visualizer" className="flex items-center gap-2">
                  <span>{t("Launch Room Visualizer", "Lanzar Visualizador")}</span>
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/how-to-measure" className="flex items-center gap-2">
                  <span>{t("Measuring Guide", "Guía de Medición")}</span>
                  <ArrowRight size={16} />
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative aspect-[16/10] overflow-hidden rounded-media bg-shell">
            <Image
              src="/images/home/viz-room-1.jpg"
              alt="Room visualizer preview"
              fill
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_42%,rgba(17,25,34,0.45)_100%)]" />
          </div>
        </div>
      </div>
    </section>
  );
}
