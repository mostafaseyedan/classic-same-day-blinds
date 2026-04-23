"use client";
import { Button } from "@blinds/ui";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { useLanguage } from "@/lib/context/language-context";

type Slide = {
  id: string;
  image: string;
  label: string;
  labelEs: string;
  headline: string;
  headlineEs: string;
  accent: string;
  accentEs: string;
  description: string;
  descriptionEs: string;
};

const SLIDES: Slide[] = [
  {
    id: "residential",
    image: "/images/home/hero-v1-residential.jpg",
    label: "Private Sanctuaries",
    labelEs: "Santuarios Privados",
    headline: "Mastering the",
    headlineEs: "Dominando la",
    accent: "Atmospheric Light",
    accentEs: "Luz Atmosférica",
    description: "Transform your home into a curated sanctuary where meticulous engineering meets absolute privacy, allowing you to master the fine balance of natural light and internal shadow.",
    descriptionEs: "Transforme su hogar en un santuario seleccionado donde la ingeniería meticulosa se encuentra con la privacidad absoluta, permitiéndole dominar el fino equilibrio entre la luz natural y la sombra interna.",
  },
  {
    id: "commercial",
    image: "/images/home/hero-apartments.jpg",
    label: "Modern Habitats",
    labelEs: "Hábitats Modernos",
    headline: "Redefining the",
    headlineEs: "Redefiniendo el",
    accent: "Multi-Family Standard",
    accentEs: "Estándar Multifamiliar",
    description: "Architectural solutions for modern multi-family communities, ensuring that sophisticated design intent translates perfectly into day-one functionality and long-term durability.",
    descriptionEs: "Soluciones arquitectónicas para comunidades multifamiliares modernas, asegurando que la intención de diseño sofisticada se traduzca perfectamente en funcionalidad desde el primer día y durabilidad a largo plazo.",
  },
  {
    id: "property",
    image: "/images/home/hero-offices.jpg",
    label: "Strategic Assets",
    labelEs: "Activos Estratégicos",
    headline: "Scaling Style for",
    headlineEs: "Escalando el Estilo para",
    accent: "Property Management",
    accentEs: "Administración de Propiedades",
    description: "Precision-engineered for the rigorous demands of operational scale, providing property teams with a stable, high-fashion standard that remains consistent across every turn.",
    descriptionEs: "Ingeniería de precisión para las rigurosas exigencias de la escala operativa, brindando a los equipos de propiedad un estándar estable y de alta costura que se mantiene constante en cada rotación.",
  },
  {
    id: "hospitality",
    image: "/images/home/hero-v1-hospitality.jpg",
    label: "Global Destinations",
    labelEs: "Destinos Globales",
    headline: "Curating the",
    headlineEs: "Curando la",
    accent: "Guest Experience",
    accentEs: "Experiencia del Huésped",
    description: "Crafting unforgettable atmospheres in the world's most exclusive destinations through durable, bespoke window treatments formulated specifically for luxury hospitality suites.",
    descriptionEs: "Creación de atmósferas inolvidables en los destinos más exclusivos del mundo a través de tratamientos de ventanas duraderos y personalizados formulados específicamente para suites de hospitalidad de lujo.",
  },
];

const AUTO_INTERVAL = 5500;

export function Hero() {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { t } = useLanguage();

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(next, AUTO_INTERVAL);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [next]);

  const manualGoTo = (idx: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCurrent(idx);
    timerRef.current = setInterval(next, AUTO_INTERVAL);
  };

  const slide = SLIDES[current];

  return (
    <section className="relative aspect-[6/5] min-h-[27rem] w-full overflow-hidden bg-ink sm:aspect-[16/10.2] md:aspect-[16/7.6] xl:aspect-[16/6.9]">
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={slide.image}
              alt={t(slide.label, slide.labelEs)}
              fill
              sizes="100vw"
              priority
              className="object-cover object-center"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute inset-0 z-[1]">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(23,35,43,0.82)_0%,rgba(23,35,43,0.62)_30%,rgba(23,35,43,0.18)_68%,rgba(23,35,43,0.03)_100%)]" />
        <div className="absolute inset-y-0 left-0 w-[42%] bg-[radial-gradient(circle_at_left,rgba(247,242,231,0.14),transparent_68%)]" />
        <div className="grain-overlay pointer-events-none absolute inset-0" />
      </div>

      <div className="relative z-10 flex h-full w-full flex-col px-6 pb-20 pt-28 sm:px-10 sm:pt-32 md:px-16 md:pt-36 lg:pl-[12vw] lg:pt-40 xl:pl-[14vw]">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: 0.1,
                },
              },
              exit: {
                opacity: 0,
                transition: { duration: 0.3 }
              }
            }}
            className="flex max-w-[42rem] flex-col items-start space-y-9"
          >
            <motion.p
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.215, 0.61, 0.355, 1] } }
              }}
              className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.35em] text-white/90"
            >
              <span className="block h-px w-10 bg-brass" />
              {t(slide.label, slide.labelEs)}
            </motion.p>

            <motion.h1
              variants={{
                hidden: { opacity: 0, y: 15 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.215, 0.61, 0.355, 1] } }
              }}
              className="mt-4 max-w-[15ch] font-display text-[2.75rem] font-medium leading-[1.1] tracking-tighter text-white [text-shadow:0_10px_40px_rgba(0,0,0,0.4),0_4px_12px_rgba(0,0,0,0.3)] sm:text-[3.25rem] md:text-[3.75rem] lg:text-[4.2rem] xl:text-[4.8rem]"
            >
              {t(slide.headline, slide.headlineEs)}
              <br />
              <span className="text-brass tracking-tight">{t(slide.accent, slide.accentEs)}</span>
            </motion.h1>

            <motion.p
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.215, 0.61, 0.355, 1] } }
              }}
              className="max-w-[32rem] text-[1.125rem] font-normal leading-relaxed text-white/85 [text-shadow:0_4px_16px_rgba(0,0,0,0.4)]"
            >
              {t(slide.description, slide.descriptionEs)}
            </motion.p>
          </motion.div>
        </AnimatePresence>

        {/* Decoupled Action Zone */}
        <div className="absolute bottom-20 left-6 sm:left-10 md:left-16 lg:left-[12vw] xl:left-[14vw]">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    delay: 0.4, // Delays buttons until after text staggers in
                    duration: 0.8,
                    ease: [0.215, 0.61, 0.355, 1],
                  },
                },
                exit: { opacity: 0, transition: { duration: 0.3 } },
              }}
              className="flex flex-wrap gap-5"
            >
              <Button asChild variant="accent">
                <Link href="/products">
                  {t("Shop Products", "Comprar Ahora")}
                </Link>
              </Button>
              <Button asChild variant="secondary-light" className="border-white/20 bg-white/5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] hover:border-brass hover:text-brass">
                <Link href="/free-sample">
                  {t("Free Samples", "Muestras Gratis")}
                </Link>
              </Button>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <Button
        variant="icon-light"
        size="icon"
        onClick={prev}
        className="absolute left-3 top-1/2 z-20 h-10 w-10 -translate-y-1/2 bg-black/20 hover:bg-black/40 sm:left-4 md:left-6"
        aria-label="Previous slide"
      >
        <CaretLeft className="h-5 w-5" />
      </Button>
      <Button
        variant="icon-light"
        size="icon"
        onClick={next}
        className="absolute right-3 top-1/2 z-20 h-10 w-10 -translate-y-1/2 bg-black/20 hover:bg-black/40 sm:right-4 md:right-6"
        aria-label="Next slide"
      >
        <CaretRight className="h-5 w-5" />
      </Button>

      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3">
        {SLIDES.map((s, i) => (
          <div key={s.id} className="group relative flex flex-col items-center">
            <span className="pointer-events-none absolute bottom-full mb-2 whitespace-nowrap rounded bg-slate/90 px-2 py-1 text-[10px] font-semibold text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              {t(s.label, s.labelEs)}
            </span>
            <button
              onClick={() => manualGoTo(i)}
              className="flex h-10 w-10 items-center justify-center"
              aria-label={s.label}
            >
              <span
                className={`block rounded-full transition-all duration-500 ${i === current ? "h-2 w-10 bg-brass" : "h-2 w-2 bg-white/35 group-hover:bg-white/65"
                  }`}
              />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
