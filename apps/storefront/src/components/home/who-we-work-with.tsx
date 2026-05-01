"use client";
import { Button } from "@blinds/ui";
import { SectionHeader } from "@blinds/ui";
import { SectionCopy, SectionTitle } from "@blinds/ui";

import Link from "next/link";
import Image from "next/image";
import {
  Buildings,
  FirstAid,
  GraduationCap,
  Hammer,
  House,
  PokerChip,
  UsersThree,
  Wrench,
} from "@phosphor-icons/react";
import { useInView } from "@/hooks/use-in-view";
import { useLanguage } from "@/lib/context/language-context";

const featuredSegments = [
  {
    label: "Homeowners",
    labelEs: "Propietarios",
    eyebrow: "Residential",
    eyebrowEs: "Residencial",
    Icon: House,
    image: "/images/home/wwww-1.jpg",
    color: "from-green-600/70 to-green-900/80",
    desc: "Single-family homes & custom installs",
    descEs: "Casas unifamiliares e instalaciones personalizadas",
  },
  {
    label: "Hotels",
    labelEs: "Hoteles",
    eyebrow: "Hospitality",
    eyebrowEs: "Hospitalidad",
    Icon: Buildings,
    image: "/images/home/wwww-2.jpg",
    color: "from-emerald-600/70 to-emerald-900/80",
    desc: "Bulk orders for guest rooms & lobbies",
    descEs: "Pedidos al por mayor para habitaciones y lobbies",
  },
  {
    label: "Casinos",
    labelEs: "Casinos",
    eyebrow: "Gaming",
    eyebrowEs: "Juego",
    Icon: PokerChip,
    image: "/images/home/wwww-casino.jpg",
    color: "from-yellow-700/70 to-yellow-950/80",
    desc: "Blackout & light-control for gaming floors",
    descEs: "Soluciones de oscurecimiento para pisos de juego",
  },
] as const;

const secondarySegments = [
  {
    Icon: Buildings,
    label: "Apartment Complexes",
    labelEs: "Complejos de Apartamentos",
    eyebrow: "Multi-Family",
    eyebrowEs: "Multifamiliar",
    image: "/images/home/wwww-3.jpg",
    color: "from-teal-600/70 to-teal-900/80",
    desc: "Multi-unit installs & property upgrades",
    descEs: "Instalaciones de múltiples unidades y mejoras",
  },
  {
    Icon: Wrench,
    label: "Maintenance Managers",
    labelEs: "Gerentes de Mantenimiento",
    eyebrow: "Operations",
    eyebrowEs: "Operaciones",
    image: "/images/home/wwww-4.jpg",
    color: "from-green-700/70 to-green-950/80",
    desc: "Fast replacements & service contracts",
    descEs: "Reemplazos rápidos y contratos de servicio",
  },
  {
    Icon: UsersThree,
    label: "Regional Property Managers",
    labelEs: "Gerentes Regionales",
    eyebrow: "Management",
    eyebrowEs: "Gestión",
    image: "/images/home/wwww-5.jpg",
    color: "from-emerald-700/70 to-emerald-950/80",
    desc: "Coordinated orders across multiple sites",
    descEs: "Pedidos coordinados en múltiples sitios",
  },
  {
    Icon: Hammer,
    label: "Apartment Builders",
    labelEs: "Constructores de Apartamentos",
    eyebrow: "Construction",
    eyebrowEs: "Construcción",
    image: "/images/home/wwww-6.jpg",
    color: "from-teal-700/70 to-teal-950/80",
    desc: "New construction & developer packages",
    descEs: "Nueva construcción y paquetes para desarrolladores",
  },
  {
    Icon: GraduationCap,
    label: "College Campuses",
    labelEs: "Universidades",
    eyebrow: "Education",
    eyebrowEs: "Educación",
    image: "/images/home/wwww-7.jpg",
    color: "from-green-600/70 to-green-900/80",
    desc: "Dorms, classrooms & campus-wide installs",
    descEs: "Dormitorios, aulas e instalaciones universitarias",
  },
  {
    Icon: FirstAid,
    label: "Hospitals",
    labelEs: "Hospitales",
    eyebrow: "Healthcare",
    eyebrowEs: "Salud",
    image: "/images/home/wwww-8.jpg",
    color: "from-emerald-600/70 to-emerald-900/80",
    desc: "Light-control for patient care areas",
    descEs: "Control de luz para áreas de atención al paciente",
  },
] as const;

export function WhoWeWorkWith() {
  const [primarySegment, ...secondaryFeaturedSegments] = featuredSegments;
  const sectionRef = useInView<HTMLElement>();
  const { t } = useLanguage();

  return (
    <section ref={sectionRef} data-animate className="page-section border-t border-black/5 bg-shell">
      <div className="content-shell">
        <SectionHeader>
          <div>
            <p className="group flex items-center gap-4 text-xs font-bold uppercase tracking-[0.35em] text-olive">
              <span className="block h-px w-10 bg-olive transition-all duration-300 group-hover:w-16" />
              {t("Our Clients", "Nuestros Clientes")}
            </p>
            <SectionTitle className="max-w-3xl">
              {t("Who We Work With", "Con Quién Trabajamos")}
            </SectionTitle>
            <SectionCopy className="max-w-xl">
              {t(
                "From single homeowners to large property management companies — the same catalog, adapted to every context.",
                "Desde propietarios individuales hasta grandes empresas de administración de propiedades: el mismo catálogo, adaptado a cada contexto.",
              )}
            </SectionCopy>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="default"><Link href="/quote">
              {t("Request a Quote", "Solicitar Cotización")}
            </Link></Button>
            <Button asChild variant="secondary"><Link href="/contact">
              {t("Talk to the Team", "Hablar con el Equipo")}
            </Link></Button>
          </div>
        </SectionHeader>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="group relative min-h-[20rem] overflow-hidden rounded-media bg-slate sm:min-h-[25rem] lg:min-h-[30rem]">
            <Image
              src={primarySegment.image}
              alt={t(primarySegment.label, primarySegment.labelEs)}
              fill
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="object-cover object-center transition duration-500 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(23,35,43,0.1)_0%,rgba(23,35,43,0.35)_58%,rgba(23,35,43,0.82)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-7">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/65">
                {t(primarySegment.eyebrow, primarySegment.eyebrowEs)}
              </p>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm">
                  <primarySegment.Icon className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-display text-[1.6rem] font-semibold tracking-tight md:text-[1.8rem]">
                  {t(primarySegment.label, primarySegment.labelEs)}
                </h3>
              </div>
              <p className="mt-3 max-w-[28rem] text-sm leading-6 text-white/80">
                {t(
                  primarySegment.desc,
                  primarySegment.descEs,
                )}
              </p>
            </div>
          </article>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {secondaryFeaturedSegments.map(({ label, labelEs, eyebrow, eyebrowEs, Icon, image, desc, descEs }) => (
              <article
                key={label}
                className="group relative aspect-[4/3] overflow-hidden rounded-media bg-slate lg:aspect-auto lg:h-[14.5rem]"
              >
                <Image
                  src={image}
                  alt={t(label, labelEs)}
                  fill
                  sizes="(min-width: 1024px) 22vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover object-center transition duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate/90 via-slate/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/65">
                    {t(eyebrow, eyebrowEs)}
                  </p>
                  <div className="mt-2 flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm">
                      <Icon className="h-3.5 w-3.5 text-white" />
                    </div>
                    <h3 className="text-sm font-semibold leading-tight">{t(label, labelEs)}</h3>
                  </div>
                  <p className="mt-2 text-xs text-white/70 line-clamp-1">{t(desc, descEs)}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {secondarySegments.map(({ Icon, label, labelEs, eyebrow, eyebrowEs, image, desc, descEs }) => (
            <article
              key={label}
              className="group relative aspect-[4/3] overflow-hidden rounded-media bg-slate"
            >
              <Image
                src={image}
                alt={t(label, labelEs)}
                fill
                sizes="(min-width: 1280px) 22vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover object-center transition duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate/90 via-slate/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/65">
                  {t(eyebrow, eyebrowEs)}
                </p>
                <div className="mt-2 flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm">
                    <Icon className="h-3.5 w-3.5 text-white" />
                  </div>
                  <h3 className="text-base font-semibold leading-tight">{t(label, labelEs)}</h3>
                </div>
                <p className="mt-2 text-xs text-white/70">{t(desc, descEs || desc)}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
