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
    image: "/images/home/hero-editorial-residential.jpg",
    label: "Residential Homes",
    labelEs: "Hogares Residenciales",
    headline: "Premium Blinds for",
    headlineEs: "Premium Blinds para",
    accent: "Homes & Residences",
    accentEs: "Hogares y Residencias",
    description: "Trusted by hotels, casinos, resorts, and apartment complexes. Order 1 to 100,000+ units with bulk pricing. Hospitality-grade quality, free shipping on every order.",
    descriptionEs: "De confianza para hoteles, casinos, resorts y complejos de apartamentos. Ordena desde 1 hasta más de 100,000 unidades con precios por volumen. Calidad hotelera, envío gratis en cada pedido.",
  },
  {
    id: "apartments",
    image: "/images/home/hero-apartments-readdy.jpg",
    label: "Apartment Complexes",
    labelEs: "Complejos de Apartamentos",
    headline: "Premium Blinds for",
    headlineEs: "Premium Blinds para",
    accent: "Apartments & Condos",
    accentEs: "Apartamentos y Condos",
    description: "Trusted by hotels, casinos, resorts, and apartment complexes. Order 1 to 100,000+ units with bulk pricing. Hospitality-grade quality, free shipping on every order.",
    descriptionEs: "De confianza para hoteles, casinos, resorts y complejos de apartamentos. Ordena desde 1 hasta más de 100,000 unidades con precios por volumen. Calidad hotelera, envío gratis en cada pedido.",
  },
  {
    id: "hotels",
    image: "/images/home/hero-hotels-readdy.jpg",
    label: "Hotels & Resorts",
    labelEs: "Hoteles y Resorts",
    headline: "Premium Blinds for",
    headlineEs: "Premium Blinds para",
    accent: "Hotels & Hospitality",
    accentEs: "Hoteles y Hospitalidad",
    description: "Trusted by hotels, casinos, resorts, and apartment complexes. Order 1 to 100,000+ units with bulk pricing. Hospitality-grade quality, free shipping on every order.",
    descriptionEs: "De confianza para hoteles, casinos, resorts y complejos de apartamentos. Ordena desde 1 hasta más de 100,000 unidades con precios por volumen. Calidad hotelera, envío gratis en cada pedido.",
  },
  {
    id: "casinos",
    image: "/images/home/hero-casinos-readdy.jpg",
    label: "Casinos",
    labelEs: "Casinos",
    headline: "Premium Blinds for",
    headlineEs: "Premium Blinds para",
    accent: "Casinos & Gaming",
    accentEs: "Casinos y Juegos",
    description: "Trusted by hotels, casinos, resorts, and apartment complexes. Order 1 to 100,000+ units with bulk pricing. Hospitality-grade quality, free shipping on every order.",
    descriptionEs: "De confianza para hoteles, casinos, resorts y complejos de apartamentos. Ordena desde 1 hasta más de 100,000 unidades con precios por volumen. Calidad hotelera, envío gratis en cada pedido.",
  },
  {
    id: "resorts",
    image: "/images/home/hero-resorts-readdy.jpg",
    label: "Luxury Resorts",
    labelEs: "Resorts de Lujo",
    headline: "Premium Blinds for",
    headlineEs: "Premium Blinds para",
    accent: "Vacation Destinations",
    accentEs: "Destinos de Vacaciones",
    description: "Trusted by hotels, casinos, resorts, and apartment complexes. Order 1 to 100,000+ units with bulk pricing. Hospitality-grade quality, free shipping on every order.",
    descriptionEs: "De confianza para hoteles, casinos, resorts y complejos de apartamentos. Ordena desde 1 hasta más de 100,000 unidades con precios por volumen. Calidad hotelera, envío gratis en cada pedido.",
  },
  {
    id: "restaurants",
    image: "/images/home/hero-restaurants-readdy.jpg",
    label: "Restaurants & Cafés",
    labelEs: "Restaurantes y Cafés",
    headline: "Premium Blinds for",
    headlineEs: "Premium Blinds para",
    accent: "Dining & Hospitality",
    accentEs: "Cena y Hospitalidad",
    description: "Trusted by hotels, casinos, resorts, and apartment complexes. Order 1 to 100,000+ units with bulk pricing. Hospitality-grade quality, free shipping on every order.",
    descriptionEs: "De confianza para hoteles, casinos, resorts y complejos de apartamentos. Ordena desde 1 hasta más de 100,000 unidades con precios por volumen. Calidad hotelera, envío gratis en cada pedido.",
  },
  {
    id: "offices",
    image: "/images/home/hero-offices-readdy.jpg",
    label: "Offices & Commercial",
    labelEs: "Oficinas y Comercial",
    headline: "Premium Blinds for",
    headlineEs: "Premium Blinds para",
    accent: "Modern Workspaces",
    accentEs: "Espacios de Trabajo",
    description: "Trusted by hotels, casinos, resorts, and apartment complexes. Order 1 to 100,000+ units with bulk pricing. Hospitality-grade quality, free shipping on every order.",
    descriptionEs: "De confianza para hoteles, casinos, resorts y complejos de apartamentos. Ordena desde 1 hasta más de 100,000 unidades con precios por volumen. Calidad hotelera, envío gratis en cada pedido.",
  },
  {
    id: "hospitals",
    image: "/images/home/hero-hospital.jpg",
    label: "Hospitals & Healthcare",
    labelEs: "Hospitales y Salud",
    headline: "Premium Blinds for",
    headlineEs: "Premium Blinds para",
    accent: "Medical Facilities",
    accentEs: "Instalaciones Médicas",
    description: "Trusted by hotels, casinos, resorts, and apartment complexes. Order 1 to 100,000+ units with bulk pricing. Hospitality-grade quality, free shipping on every order.",
    descriptionEs: "De confianza para hoteles, casinos, resorts y complejos de apartamentos. Ordena desde 1 hasta más de 100,000 unidades con precios por volumen. Calidad hotelera, envío gratis en cada pedido.",
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
    <section className="relative min-h-[36rem] w-full bg-ink sm:min-h-[42rem] md:min-h-[44rem] xl:min-h-[48rem]">
      <div className="absolute inset-0 z-0 overflow-hidden">
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

      <div className="relative z-10 flex w-full flex-col px-6 pb-20 pt-16 sm:px-10 sm:pb-20 sm:pt-28 md:px-16 md:pt-32 lg:pl-[12vw] lg:pt-36 xl:pl-[14vw]">
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
            className="flex max-w-[42rem] flex-col items-start gap-3 sm:gap-5 lg:gap-6"
          >
            <motion.p
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.215, 0.61, 0.355, 1] } }
              }}
              className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/90 sm:gap-4 sm:tracking-[0.3em]"
            >
              <span className="block h-px w-10 bg-green-300/90" />
              {t(slide.label, slide.labelEs)}
            </motion.p>

            <motion.h1
              variants={{
                hidden: { opacity: 0, y: 15 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.215, 0.61, 0.355, 1] } }
              }}
              className="max-w-[15ch] font-display text-[2.35rem] font-medium leading-[1.06] tracking-tighter text-white [text-shadow:0_10px_40px_rgba(0,0,0,0.4),0_4px_12px_rgba(0,0,0,0.3)] sm:text-[3.25rem] md:text-[3.75rem] lg:text-[4.2rem] xl:text-[4.8rem]"
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
              className="font-display text-sm font-medium text-green-300/90 sm:text-base md:text-lg tracking-wide [text-shadow:0_2px_12px_rgba(0,0,0,0.5)]"
            >
              {t("Quality Blinds for Every Property.", "Calidad de Persianas para Cada Propiedad.")}
            </motion.p>

            <motion.p
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.215, 0.61, 0.355, 1] } }
              }}
              className="line-clamp-2 max-w-[32rem] text-base font-normal leading-7 text-white/85 [text-shadow:0_4px_16px_rgba(0,0,0,0.4)] sm:line-clamp-none sm:text-[1.125rem] sm:leading-relaxed"
            >
              {t(slide.description, slide.descriptionEs)}
            </motion.p>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.8, ease: [0.215, 0.61, 0.355, 1] } }
              }}
              className="flex flex-wrap gap-3 pt-1 sm:gap-5 sm:pt-2"
            >
              <Button asChild variant="accent">
                <Link href="/products">
                  {t("Shop Now", "Comprar Ahora")}
                </Link>
              </Button>
              <Button asChild variant="secondary-light" className="border-white/20 bg-white/5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] hover:border-brass hover:text-brass">
                <Link href="/free-sample">
                  {t("Free Samples", "Muestras Gratis")}
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </AnimatePresence>

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
