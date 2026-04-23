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
  const reviewCount = googlePlace?.user_ratings_total;
  const rating = googlePlace?.rating;

  const stats = [
    {
      value: "37",
      unit: "Years",
      label: "in window coverings — since 1986",
    },
    {
      value: reviewCount ? `${reviewCount}+` : "1,200+",
      unit: rating ? `${rating}-star` : "5-star",
      label: "Google reviews from homeowners and property teams",
    },
    {
      value: "Same-Day",
      unit: "DFW",
      label: "fulfillment on eligible stock items",
    },
  ] as const;

  return (
    <section id="about" className="page-section border-t border-black/5 bg-white">
      <AnimateOnScroll className="content-shell">

        {/* Section intro */}
        <div className="flex flex-col gap-3">
          <Eyebrow>Homeowner Stories</Eyebrow>
          <SectionTitle className="max-w-3xl">
            Trusted by homeowners and property teams across DFW for over three decades.
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
        <div className="mt-14 grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div>
            <EyebrowAccent>Our Story</EyebrowAccent>
            <p className="mt-4 max-w-[52ch] text-sm leading-6 text-slate/70 sm:text-base sm:leading-7">
              Classic Same Day Blinds grew out of hands-on product knowledge, local measuring help,
              and the practical reality that most customers do not want to become experts just to buy
              the right window treatment.
            </p>

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
