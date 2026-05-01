"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { Star } from "@phosphor-icons/react";
import { Button, Input, Label, Textarea } from "@blinds/ui";

import { useCustomer } from "@/components/customer/customer-provider";
import { getPublicRuntimeConfig } from "@/lib/platform-config";
import {
  emptyProductReviews,
  type ProductReviewRecord,
  type ProductReviewsPayload,
} from "@/lib/product-reviews";

const CUSTOMER_JWT_STORAGE_KEY = "blinds_storefront_customer_jwt";

type ProductReviewsSectionProps = {
  productId: string;
  productName: string;
  initialReviews: ProductReviewsPayload;
};

function formatReviewDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function EmptyStar({ size }: { size: string }) {
  return (
    <span className="relative inline-flex">
      <Star className={`${size} fill-white text-white`} weight="fill" />
      <Star className={`${size} absolute inset-0 text-brass/50`} weight="thin" />
    </span>
  );
}

function RatingStars({ rating, label }: { rating: number; label?: string }) {
  const rounded = Math.round(rating);

  return (
    <div className="flex items-center gap-1" aria-label={label ?? `${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((value) =>
        value <= rounded ? (
          <Star key={value} className="h-4 w-4 fill-brass text-brass" weight="fill" />
        ) : (
          <EmptyStar key={value} size="h-4 w-4" />
        ),
      )}
    </div>
  );
}

function RatingBreakdown({ reviews }: { reviews: ProductReviewsPayload }) {
  const { reviewCount, ratingCounts } = reviews.summary;

  return (
    <div className="grid gap-2">
      {[5, 4, 3, 2, 1].map((rating) => {
        const count = ratingCounts[rating as 1 | 2 | 3 | 4 | 5] ?? 0;
        const percent = reviewCount > 0 ? Math.round((count / reviewCount) * 100) : 0;

        return (
          <div key={rating} className="grid grid-cols-[2.5rem_1fr_2.5rem] items-center gap-3">
            <span className="text-xs font-semibold text-slate/62">{rating} star</span>
            <div className="h-1.5 overflow-hidden rounded-full bg-black/6">
              <div
                className="h-full rounded-full bg-olive"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="text-right text-xs text-slate/50">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

function ReviewForm({
  productId,
  onSubmitted,
}: {
  productId: string;
  onSubmitted: (reviews: ProductReviewsPayload) => void;
}) {
  const config = useMemo(() => getPublicRuntimeConfig(), []);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const token = window.localStorage.getItem(CUSTOMER_JWT_STORAGE_KEY);

      if (!token) {
        throw new Error("Please sign in before submitting a review.");
      }

      const response = await fetch(
        `${config.medusaBaseUrl}/store/products/${encodeURIComponent(productId)}/reviews`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-publishable-api-key": config.medusaPublishableKey,
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ rating, title, content }),
        },
      );

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(payload?.message ?? `Unable to submit review (${response.status}).`);
      }

      const payload = (await response.json()) as ProductReviewsPayload;
      onSubmitted(payload);
      setRating(5);
      setTitle("");
      setContent("");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to submit review.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submitReview} className="grid gap-4">
      <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-slate/50">
        Write a Review
      </p>
      <div className="-mt-1 flex gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setRating(value)}
            className="rounded-full p-1 text-brass transition hover:bg-brass/10"
            aria-label={`${value} star rating`}
          >
            {value <= rating
              ? <Star className="h-5 w-5 fill-brass text-brass" weight="fill" />
              : <EmptyStar size="h-5 w-5" />
            }
          </button>
        ))}
      </div>

      <label className="grid gap-2">
        <Label as="span" variant="utility">Title</Label>
        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={120}
          required
          placeholder="What should other customers know?"
        />
      </label>

      <label className="grid gap-2">
        <Label as="span" variant="utility">Review</Label>
        <Textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          minLength={10}
          maxLength={2000}
          required
          rows={5}
          placeholder="Share details about fit, finish, installation, or ordering."
        />
      </label>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <Button type="submit" variant="default" disabled={submitting}>
        {submitting ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
}

function AuthorAvatar({ name }: { name: string }) {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brass/10 text-xs font-bold text-brass">
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function ReviewCard({ review }: { review: ProductReviewRecord }) {
  const authorName = review.author_name ?? "Customer";

  return (
    <article className="py-5 first:pt-0">
      <div className="flex items-start gap-3">
        <AuthorAvatar name={authorName} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-semibold text-slate">{authorName}</p>
            <p className="shrink-0 text-xs text-slate/45">{formatReviewDate(review.created_at)}</p>
          </div>
          <div className="mt-1">
            <RatingStars rating={review.rating} />
          </div>
        </div>
      </div>
      <p className="mt-3 text-sm font-semibold text-slate">{review.title}</p>
      <p className="mt-1.5 line-clamp-5 text-sm leading-6 text-slate/72">{review.content}</p>
      {review.merchant_reply ? (
        <div className="mt-4 ml-1 grid grid-cols-[2px_1fr] gap-3">
          <span className="mt-1 block h-full rounded-full bg-olive/55" aria-hidden="true" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-olive">
                Luke
              </p>
              <span className="rounded-full border border-brass/18 bg-brass/8 px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-brass">
                Classic Same Day Blinds
              </span>
            </div>
            <p className="mt-1 text-sm leading-6 text-slate/68">{review.merchant_reply}</p>
          </div>
        </div>
      ) : null}
    </article>
  );
}

export function ProductReviewsSection({
  productId,
  productName,
  initialReviews,
}: ProductReviewsSectionProps) {
  const { isAuthenticated, isLoading } = useCustomer();
  const [reviewsPayload, setReviewsPayload] = useState<ProductReviewsPayload>(
    initialReviews ?? emptyProductReviews,
  );
  const { reviews, summary } = reviewsPayload;

  return (
    <section className="">
      <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
        <div>
          <p className="flex items-center gap-3 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-olive">
            <span className="block h-px w-6 bg-olive" />
            Customer Reviews
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-slate">
            Reviews for {productName}
          </h2>

          <div className="mt-5">
            {summary.reviewCount > 0 ? (
              <>
                <div className="flex items-end gap-3">
                  <span className="font-display text-4xl font-semibold leading-none text-slate">
                    {summary.averageRating.toFixed(1)}
                  </span>
                  <div className="pb-1">
                    <RatingStars rating={summary.averageRating} />
                    <p className="mt-1 text-sm text-slate/54">
                      {summary.reviewCount} review{summary.reviewCount === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
                <div className="mt-5">
                  <RatingBreakdown reviews={reviewsPayload} />
                </div>
              </>
            ) : (
              <div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <EmptyStar key={i} size="h-5 w-5" />
                  ))}
                </div>
                <p className="mt-3 text-base font-semibold text-slate">No reviews yet</p>
                <p className="mt-1 max-w-[28ch] text-sm leading-6 text-slate/55">
                  Be the first to share how this product worked in your space.
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 border-t border-black/8 pt-6">
            {isLoading ? (
              <p className="text-sm text-slate/50">Loading account status...</p>
            ) : isAuthenticated ? (
              <ReviewForm productId={productId} onSubmitted={setReviewsPayload} />
            ) : (
              <div className="flex items-center justify-between gap-4 rounded-card border border-olive/20 bg-olive/5 px-4 py-3.5">
                <p className="text-sm text-slate/72">Sign in to write a review.</p>
                <Button asChild variant="secondary" size="compact">
                  <Link href="/auth">Sign In</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="divide-y divide-black/8">
          {reviews.map((review) => <ReviewCard key={review.id} review={review} />)}
        </div>
      </div>
    </section>
  );
}
