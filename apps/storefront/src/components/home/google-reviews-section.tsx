"use client";

import { useInView } from "@/hooks/use-in-view";
import { SectionCopy, SectionTitle } from "@blinds/ui";
import { GoogleRatingBadge } from "@/components/home/google-rating-badge";
import { GoogleReviewsCarousel } from "@/components/home/google-reviews-carousel";
import type { GooglePlaceData } from "@/lib/google-reviews";

export function GoogleReviewsSection({ googlePlace }: { googlePlace: GooglePlaceData | null }) {
  const contentRef = useInView<HTMLDivElement>();

  return (
    <section id="reviews" className="page-section bg-shell">
      <div ref={contentRef} data-animate className="content-shell">
        <div className="max-w-3xl">
          <p className="group flex items-center gap-4 text-xs font-bold uppercase tracking-[0.35em] text-olive">
            <span className="block h-px w-10 bg-olive transition-all duration-300 group-hover:w-16" />
            Google Reviews
          </p>
          <SectionTitle>
            Customers trust the fit, service, and follow-through.
          </SectionTitle>
          <SectionCopy>
            Real feedback from shoppers who ordered samples, measured their windows, and finished
            the project with Classic Same Day Blinds.
          </SectionCopy>
        </div>
        <div className="mt-8">
          <GoogleRatingBadge
            placeUrl={googlePlace?.url}
            rating={googlePlace?.rating}
            reviewCount={googlePlace?.user_ratings_total}
          />
          <GoogleReviewsCarousel
            reviews={googlePlace?.reviews || []}
            placeUrl={googlePlace?.url}
          />
        </div>
      </div>
    </section>
  );
}
