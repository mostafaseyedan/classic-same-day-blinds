"use client";

import Image from "next/image";
import Link from "next/link";
import { CaretLeft, CaretRight, Star } from "@phosphor-icons/react";
import { useMemo, useState } from "react";

import { Button } from "@blinds/ui";
import { SurfaceMuted } from "@blinds/ui";
import type { GoogleReview } from "@/lib/google-reviews";

type GoogleReviewsCarouselProps = {
  reviews: GoogleReview[];
  placeUrl?: string;
};

export function GoogleReviewsCarousel({
  reviews,
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
    <div className="mt-8">
      {/* Desktop grid */}
      <div className="hidden md:block">
        <div className="grid gap-4 md:grid-cols-2">
          {desktopReviews.map((review, i) => (
            <ReviewCard
              key={`${review.author_name}-${page}-${i}`}
              review={review}
              fallbackUrl={placeUrl}
            />
          ))}
        </div>

        {pageCount > 1 ? (
          <div className="mt-6 flex items-center justify-center gap-4">
            <Button
              type="button"
              variant="icon"
              size="icon"
              onClick={() => goToPage(page - 1)}
              disabled={page === 0}
              aria-label="Previous reviews"
              className="h-9 w-9"
            >
              <CaretLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-3">
              {Array.from({ length: pageCount }).map((_, idx) => (
                <div key={idx} className="group relative flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => goToPage(idx)}
                    className="flex h-9 w-9 items-center justify-center"
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
              className="h-9 w-9"
            >
              <CaretRight className="h-4 w-4" />
            </Button>
          </div>
        ) : null}
      </div>

      {/* Mobile horizontal scroll */}
      <div className="hide-scrollbar -mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-8 md:hidden">
        {reviews.map((review, i) => (
          <ReviewCard
            key={`${review.author_name}-${i}`}
            review={review}
            fallbackUrl={placeUrl}
            className="w-[85vw] shrink-0 snap-start"
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
      className="h-full rounded-card border border-black/6 bg-white p-5 shadow-[0_12px_34px_rgba(24,36,34,0.05)] transition-colors hover:bg-white"
    >
      <div className="flex items-center gap-1 text-brass">
        {[...Array(review.rating)].map((_, i) => (
          <Star key={i} weight="fill" className="h-3.5 w-3.5" />
        ))}
      </div>

      <blockquote className="mt-4">
        <p className="line-clamp-3 text-base font-normal leading-relaxed text-slate/80">
          &ldquo;{review.text}&rdquo;
        </p>
      </blockquote>

      <div className="mt-5 flex items-center justify-between gap-4 border-t border-black/5 pt-4">
        <div className="flex items-center gap-3">
          {review.profile_photo_url ? (
            <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-black/5">
              <Image
                src={review.profile_photo_url}
                alt={review.author_name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-olive/10 text-xs font-bold text-olive">
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
