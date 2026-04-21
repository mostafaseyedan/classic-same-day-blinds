import { Trophy, Star, Truck } from "@phosphor-icons/react/ssr";
import { AnimateOnScroll } from "@/components/animate-on-scroll";
import type { GooglePlaceData } from "@/lib/google-reviews";

export function SocialProofStrip({ googlePlace }: { googlePlace: GooglePlaceData | null }) {
  const reviewCount = googlePlace?.user_ratings_total;
  const rating = googlePlace?.rating;

  const stats = [
    {
      Icon: Trophy,
      value: "37 Years",
      label: "in window coverings — since 1986",
    },
    {
      Icon: Star,
      value: reviewCount ? `${reviewCount}+` : "1,200+",
      label: rating
        ? `${rating}-star Google rating from homeowners and property teams`
        : "five-star reviews from homeowners and property teams",
    },
    {
      Icon: Truck,
      value: "Same-Day",
      label: "DFW fulfillment on eligible stock items",
    },
  ];
  return (
    <section className="relative z-30 w-full bg-slate py-4 sm:py-5">
      <AnimateOnScroll className="mx-auto max-w-7xl px-6 sm:px-10 md:px-12 lg:px-16">
        <div className="grid gap-x-12 gap-y-6 sm:grid-cols-3">
          {stats.map(({ Icon, value, label }) => (
            <div
              key={value}
              className="flex items-center gap-4 py-1 transition-opacity hover:opacity-80 sm:border-l sm:border-white/10 sm:pl-8 sm:first:border-l-0 sm:first:pl-0"
            >
              <div className="text-brass">
                <Icon className="h-5 w-5 stroke-[1.5]" />
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="font-display text-base font-semibold leading-tight text-shell md:text-lg">
                  {value}
                </p>
                <p className="text-[0.82rem] leading-tight text-shell/70 sm:text-[0.85rem]">
                  {label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </AnimateOnScroll>
    </section>
  );
}
