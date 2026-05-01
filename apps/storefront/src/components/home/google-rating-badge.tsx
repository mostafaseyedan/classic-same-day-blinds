"use client";
import { Star } from "@phosphor-icons/react";
import { SurfaceMuted, Button } from "@blinds/ui";
import Image from "next/image";
import Link from "next/link";

export function GoogleRatingBadge({
  placeUrl,
  rating,
  reviewCount,
}: {
  placeUrl?: string;
  rating?: number;
  reviewCount?: number;
}) {
  if (typeof rating !== "number" || typeof reviewCount !== "number") {
    return null;
  }

  return (
    <SurfaceMuted className="flex flex-col items-center justify-between gap-6 rounded-2xl p-6 sm:flex-row sm:p-8">
      <div className="flex flex-col items-center gap-6 sm:flex-row">
        <div className="flex flex-col items-center gap-1 border-black/10 pr-0 sm:border-r sm:pr-8">
          <div className="flex items-center gap-1 text-brass">
            {[...Array(5)].map((_, i) => (
              <Star key={i} weight="fill" className="h-5 w-5" />
            ))}
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-slate">{rating.toFixed(1)}</span>
            <span className="text-sm font-medium text-slate/40">{reviewCount.toLocaleString()} ratings</span>
          </div>
        </div>

        <div className="flex flex-col text-center sm:text-left">
          <h4 className="font-display text-xl font-semibold tracking-tight text-slate">
            Rated {rating.toFixed(1)} Stars on Google
          </h4>
          <p className="mt-1 max-w-[32ch] text-[0.9rem] leading-snug text-slate/60">
            {reviewCount.toLocaleString()} Google ratings from customers who shared their experience.
          </p>
        </div>
      </div>

      {placeUrl && (
        <Button asChild variant="secondary" className="bg-white px-6 shadow-sm border-black/5 hover:bg-slate/5">
          <Link href={placeUrl} target="_blank" rel="noopener noreferrer nofollow" className="flex items-center gap-3">
            <div className="relative h-5 w-5 shrink-0">
               <Image 
                src="https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png" 
                alt="Google Logo" 
                fill
                className="object-contain"
              />
            </div>
            <span className="font-semibold text-slate">Review Us on Google</span>
          </Link>
        </Button>
      )}
    </SurfaceMuted>
  );
}
