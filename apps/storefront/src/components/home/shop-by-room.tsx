"use client";
import { Button } from "@blinds/ui";
import { SectionHeader } from "@blinds/ui";
import { Eyebrow, EyebrowAccent, SectionCopy, SectionTitle } from "@blinds/ui";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";

import { useLanguage } from "@/lib/context/language-context";
import { useInView } from "@/hooks/use-in-view";

const rooms = [
  {
    slug: "living-room",
    titleEn: "Living Room",
    titleEs: "Sala de Estar",
    descriptionEn:
      "Layered light control, warmer finishes, and a cleaner visual line for the most-seen room in the house.",
    descriptionEs:
      "Control de luz en capas, acabados más cálidos y una línea visual más limpia para la habitación más visible del hogar.",
    categorySlug: "faux-wood-blinds",
    categoryEn: "Faux Wood",
    categoryEs: "Madera Sintética",
    badgeEn: "Most requested",
    badgeEs: "Más solicitado",
    image: "/images/home/room-living-new.png",
  },
  {
    slug: "bedroom",
    titleEn: "Bedroom",
    titleEs: "Dormitorio",
    descriptionEn:
      "Privacy-first options with tighter light control and quieter operation for earlier nights and slower mornings.",
    descriptionEs:
      "Opciones pensadas para la privacidad con mejor control de luz y operación más silenciosa para noches más tranquilas.",
    categorySlug: "faux-wood-blinds",
    categoryEn: "Faux Wood",
    categoryEs: "Madera Sintética",
    badgeEn: "Privacy-led",
    badgeEs: "Enfoque en privacidad",
    image: "/images/home/room-bedroom-new.png",
  },
  {
    slug: "kitchen",
    titleEn: "Kitchen",
    titleEs: "Cocina",
    descriptionEn:
      "Moisture-tolerant materials and easy-clean finishes that stand up to steam, splashes, and daily use.",
    descriptionEs:
      "Materiales resistentes a la humedad y acabados fáciles de limpiar para vapor, salpicaduras y uso diario.",
    categorySlug: "faux-wood-blinds",
    categoryEn: "Faux Wood",
    categoryEs: "Madera Sintética",
    badgeEn: "Easy-clean pick",
    badgeEs: "Opción fácil de limpiar",
    image: "/images/home/room-kitchen.jpg",
  },
  {
    slug: "office",
    titleEn: "Office",
    titleEs: "Oficina",
    descriptionEn:
      "Reduce monitor glare and keep a crisp, professional look for work-from-home desks or higher-use offices.",
    descriptionEs:
      "Reduce el reflejo en pantallas y mantén una apariencia profesional para oficinas en casa o espacios de mayor uso.",
    categorySlug: "aluminum-blinds",
    categoryEn: "Aluminum",
    categoryEs: "Aluminio",
    badgeEn: "Commercial clean",
    badgeEs: "Acabado comercial",
    image: "/images/home/room-office-new.png",
  },
  {
    slug: "patio-doors",
    titleEn: "Patio Doors",
    titleEs: "Puertas de Patio",
    descriptionEn:
      "Wide-span coverage for sliders and larger glass openings without forcing a small-window product to do the job.",
    descriptionEs:
      "Cobertura para puertas corredizas y grandes paños de vidrio sin forzar un producto pensado para ventanas pequeñas.",
    categorySlug: "vertical-blinds",
    categoryEn: "Vertical Blinds",
    categoryEs: "Persianas Verticales",
    badgeEn: "Wide-span fit",
    badgeEs: "Para grandes aperturas",
    image: "/images/home/room-patio-new.png",
  },
  {
    slug: "property-turns",
    titleEn: "Property Turns",
    titleEs: "Reposición de Unidades",
    descriptionEn:
      "Fast, repeatable replacements for rentals, hospitality rooms, and maintenance teams managing multiple openings.",
    descriptionEs:
      "Reposiciones rápidas y repetibles para rentas, habitaciones de hotel y equipos que gestionan múltiples ventanas.",
    categorySlug: "faux-wood-blinds",
    categoryEn: "Faux Wood",
    categoryEs: "Madera Sintética",
    badgeEn: "Fast replenishment",
    badgeEs: "Reposición rápida",
    image: "/images/home/story-apartments-new.png",
  },
] as const;

type Room = (typeof rooms)[number];

export function ShopByRoom() {
  const { t } = useLanguage();
  const [activeRoomSlug, setActiveRoomSlug] = useState<Room["slug"]>(rooms[0].slug);
  const sectionRef = useInView<HTMLElement>();

  const activeRoom = useMemo(
    () => rooms.find((room) => room.slug === activeRoomSlug) ?? rooms[0],
    [activeRoomSlug],
  );

  return (
    <section ref={sectionRef} data-animate className="page-section border-t border-black/5 bg-white">
      <div className="content-shell max-w-[72rem]">
        <SectionHeader>
          <div>
            <Eyebrow>{t("Shop By Room", "Comprar por Espacio")}</Eyebrow>
            <SectionTitle className="max-w-3xl">
              {t(
                "Start with the room, then narrow to the blind that belongs there.",
                "Empieza por el espacio y luego reduce a la persiana que realmente le corresponde.",
              )}
            </SectionTitle>
            <SectionCopy>
              {t(
                "This is the fastest way to understand the catalog: begin with the space, not the product taxonomy.",
                "Esta es la forma más rápida de entender el catálogo: empieza por el espacio, no por la taxonomía del producto.",
              )}
            </SectionCopy>
          </div>

          <Button asChild variant="secondary" className="self-start whitespace-nowrap"><Link href="/products">
            {t("Browse All Products", "Ver Todos los Productos")}
          </Link></Button>
        </SectionHeader>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <article className="relative overflow-hidden rounded-card bg-slate">
            <div className="relative aspect-[5/4] min-h-[22rem] md:min-h-[26rem]">
              <Image
                key={activeRoom.slug}
                src={activeRoom.image}
                alt={t(activeRoom.titleEn, activeRoom.titleEs)}
                fill
                sizes="(min-width: 1024px) 60vw, 100vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,30,0.12)_0%,rgba(15,23,30,0.28)_52%,rgba(15,23,30,0.78)_100%)]" />
            </div>

            <div className="absolute inset-x-0 bottom-0 z-10 p-5 text-white md:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
                {t("Recommended family", "Familia recomendada")}
              </p>
              <p className="mt-1 text-base font-semibold text-brass">
                {t(activeRoom.categoryEn, activeRoom.categoryEs)}
              </p>
              <h3 className="mt-2 font-display text-[1.7rem] font-semibold leading-[1.05] tracking-tight text-white md:text-[2.05rem]">
                {t(activeRoom.titleEn, activeRoom.titleEs)}
              </h3>
              <p className="mt-2 max-w-[26rem] text-sm leading-6 text-white/82">
                {t(activeRoom.descriptionEn, activeRoom.descriptionEs)}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brass/90">
                  {t(activeRoom.badgeEn, activeRoom.badgeEs)}
                </p>
              </div>
            </div>
          </article>

          <div>
            <EyebrowAccent>{t("Choose a space", "Elige un espacio")}</EyebrowAccent>
            <p className="mt-3 max-w-[30ch] text-sm leading-6 text-slate/62">
              {t(
                "Pick the room first. The catalog follows.",
                "Elige primero el espacio. El catálogo se ajusta.",
              )}
            </p>

            <div className="mt-5 flex flex-col gap-1">
              {rooms.map((room) => {
                const isActive = room.slug === activeRoom.slug;

                return (
                  <button
                    key={room.slug}
                    type="button"
                    onClick={() => setActiveRoomSlug(room.slug)}
                    className={`flex w-full items-start justify-between gap-4 rounded-media px-2 py-2.5 text-left transition ${
                      isActive
                        ? "bg-shell/70 text-slate"
                        : "text-slate/60 hover:bg-shell/40 hover:text-slate"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-semibold">{t(room.titleEn, room.titleEs)}</p>
                      <p className="mt-1 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-olive/70">
                        {t(room.categoryEn, room.categoryEs)}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-[0.12em] ${
                        isActive ? "text-brass" : "text-slate/40"
                      }`}
                    >
                      {t(room.badgeEn, room.badgeEs)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
