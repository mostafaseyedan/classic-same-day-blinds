import Image from "next/image";
import { Trophy, MapPin, Scissors } from "@phosphor-icons/react/ssr";
import { AnimateOnScroll } from "@/components/animate-on-scroll";
import { SurfaceCard, SurfaceInset } from "@blinds/ui";
import { Eyebrow, EyebrowAccent, SectionTitle, SectionCopy } from "@blinds/ui";
import type { GooglePlaceData } from "@/lib/google-reviews";
import { cn } from "@/lib/utils";
import { GoogleReviewsCarousel } from "@/components/home/google-reviews-carousel";

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
    title: "Bedford showroom",
    copy: "Local homeowners and property teams still have a real place to get help before ordering.",
    accent: undefined,
  },
] as const;

export function About({ googlePlace }: { googlePlace: GooglePlaceData | null }) {
  const reviews = googlePlace?.reviews?.slice(0, 8) ?? [];

  return (
    <section id="about" className="page-section border-t border-black/5 bg-white">
      <AnimateOnScroll className="content-shell">
        <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div>
            <Eyebrow>Our Story</Eyebrow>
            <SectionTitle className="max-w-2xl">
              Thirty years of helping homes feel considered, finished, and easier to live in.
            </SectionTitle>
            <SectionCopy>
              Classic Same Day Blinds grew out of hands-on product knowledge, local measuring help,
              and the practical reality that most customers do not want to become experts just to buy
              the right window treatment.
            </SectionCopy>

            <div className="mt-12 lg:mt-16">
              <div className="space-y-8 border-t border-black/10 pt-8 lg:space-y-10 lg:pt-10">
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
              <div className="relative aspect-[4/4.8] overflow-hidden rounded-2xl bg-shell">
                <Image
                  src="/images/home/about-img-001.jpg"
                  alt="Window treatment consultation"
                  fill
                  className="object-cover object-center"
                />
              </div>
              <div className="flex flex-col gap-4 sm:pt-12">
                <div className="relative aspect-[4/3.7] overflow-hidden rounded-2xl bg-shell">
                  <Image
                    src="/images/home/about-img-002.jpg"
                    alt="Installed residential blinds"
                    fill
                    className="object-cover object-center"
                  />
                </div>
                <div className="border-t border-black/10 pt-4">
                  <EyebrowAccent>Why it still works</EyebrowAccent>
                  <p className="mt-3 text-lg font-semibold leading-7 text-slate">
                    Product guidance, samples, and local support all point toward the same outcome:
                    ordering the right blind once.
                  </p>
                </div>
              </div>
            </div>
            <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-olive/10 blur-3xl sm:h-36 sm:w-36" />
          </div>
        </div>

        {reviews.length > 0 ? (
          <GoogleReviewsCarousel
            reviews={reviews}
            rating={googlePlace?.rating}
            reviewCount={googlePlace?.user_ratings_total}
            placeUrl={googlePlace?.url}
          />
        ) : null}
      </AnimateOnScroll>
    </section>
  );
}
