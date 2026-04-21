"use client";

import Image from "next/image";
import Link from "next/link";
import { CaretLeft, CaretRight, Star } from "@phosphor-icons/react";
import { useMemo, useState } from "react";

import { Button } from "@blinds/ui";
import { SurfaceMuted } from "@blinds/ui";
import { EyebrowAccent } from "@blinds/ui";
import type { GoogleReview } from "@/lib/google-reviews";

type GoogleReviewsCarouselProps = {
  reviews: GoogleReview[];
  rating?: number;
  reviewCount?: number;
  placeUrl?: string;
};

export function GoogleReviewsCarousel({
  reviews,
  rating,
  reviewCount,
  placeUrl,
}: GoogleReviewsCarouselProps) {
  const [page, setPage] = useState(0);

  const desktopPageSize = 2;
  const pageCount = Math.max(1, Math.ceil(reviews.length / desktopPageSize));
  const goToPage = (nextPage: number) => {
    setPage(Math.max(0, Math.min(pageCount - 1, nextPage)));
  };
  const desktopReviews = useMemo(() => {
    const start = page * desktopPageSize;
    return reviews.slice(start, start + desktopPageSize);
  }, [page, reviews]);

  if (reviews.length === 0) return null;

  return (
    <div className="mt-20 border-t border-black/5 pt-16">
      <div className="mb-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <EyebrowAccent>Social Proof</EyebrowAccent>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-slate md:text-3xl">
            Homeowner Stories
          </h2>
        </div>

        <div className="flex flex-col items-start gap-3 sm:items-end">
          <div className="flex items-center gap-1 text-brass">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-current" />
            ))}
            <span className="ml-2 text-sm font-bold text-slate">{rating || "4.9"} / 5</span>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate/50">
              Based on {reviewCount || "120"}+ Google Reviews
            </p>
            {placeUrl ? (
              <Button asChild variant="secondary" size="compact" className="hidden md:inline-flex">
                <Link href={placeUrl} target="_blank" rel="noopener noreferrer nofollow">
                  View on Google
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="hidden md:block">
        <div className="grid gap-5 md:grid-cols-2">
          {desktopReviews.map((review, i) => (
            <ReviewCard
              key={`${review.author_name}-${page}-${i}`}
              review={review}
              fallbackUrl={placeUrl}
            />
          ))}
        </div>

        {pageCount > 1 ? (
          <div className="mt-8 flex items-center justify-center gap-4">
            <Button
              type="button"
              variant="icon"
              size="icon"
              onClick={() => goToPage(page - 1)}
              disabled={page === 0}
              aria-label="Previous reviews"
              className="h-10 w-10"
            >
              <CaretLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-3">
              {Array.from({ length: pageCount }).map((_, idx) => (
                <div key={idx} className="group relative flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => goToPage(idx)}
                    className="flex h-10 w-10 items-center justify-center"
                    aria-label={`Go to review page ${idx + 1}`}
                    aria-current={idx === page ? "true" : undefined}
                  >
                    <span
                      className={`block rounded-full transition-all duration-500 ${
                        idx === page
                          ? "h-2 w-10 bg-brass"
                          : "h-2 w-2 bg-slate/20 group-hover:bg-slate/45"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="icon"
              size="icon"
              onClick={() => goToPage(page + 1)}
              disabled={page === pageCount - 1}
              aria-label="Next reviews"
              className="h-10 w-10"
            >
              <CaretRight className="h-4 w-4" />
            </Button>
          </div>
        ) : null}

      </div>

      <div className="hide-scrollbar -mx-6 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-8 md:hidden">
        {reviews.map((review, i) => (
          <ReviewCard
            key={`${review.author_name}-${i}`}
            review={review}
            fallbackUrl={placeUrl}
            className="w-[85vw] shrink-0 snap-start p-6"
          />
        ))}
      </div>

      <div className="flex justify-center text-[10px] font-semibold uppercase tracking-[0.2em] text-slate/30 md:hidden">
        Swipe to explore
      </div>
    </div>
  );
}

function ReviewCard({
  review,
  fallbackUrl,
  className,
}: {
  review: GoogleReview;
  fallbackUrl?: string;
  className?: string;
}) {
  const href = fallbackUrl;
  const card = (
    <SurfaceMuted
      as="article"
      className="h-full p-6 transition-colors hover:bg-shell md:p-8"
    >
      <div className="flex items-center gap-1.5 text-brass">
        {[...Array(review.rating)].map((_, i) => (
          <Star key={i} className="h-3.5 w-3.5 fill-current" />
        ))}
      </div>

      <blockquote className="mt-6">
        <p className="line-clamp-4 font-display text-lg font-medium leading-[1.6] tracking-tight text-slate md:text-xl md:leading-[1.5]">
          "{review.text}"
        </p>
      </blockquote>

      <div className="mt-8 flex items-center justify-between gap-4 border-t border-black/5 pt-6">
        <div className="flex items-center gap-3">
          {review.profile_photo_url ? (
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-black/5">
              <Image
                src={review.profile_photo_url}
                alt={review.author_name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-olive/10 text-xs font-bold text-olive">
              {review.author_name.charAt(0)}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-slate">{review.author_name}</p>
            <p className="text-[11px] font-medium tracking-[0.02em] text-slate/50">
              {review.relative_time_description}
            </p>
          </div>
        </div>
        <div className="hidden flex-col items-end sm:flex">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-olive">
            {href ? "Open" : "Verified"}
          </p>
          <p className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.14em] text-slate/40">
            Google Review
          </p>
        </div>
      </div>
    </SurfaceMuted>
  );

  if (!href) {
    return <div className={className}>{card}</div>;
  }

  return (
    <Link href={href} target="_blank" rel="noopener noreferrer nofollow" className={className}>
      {card}
    </Link>
  );
}
