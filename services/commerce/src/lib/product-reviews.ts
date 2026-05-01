export type ProductReviewStatus = "published" | "hidden";

export type ProductReviewRecord = {
  id: string;
  product_id: string;
  customer_id: string;
  customer_email: string | null;
  author_name: string | null;
  rating: number;
  title: string;
  content: string;
  merchant_reply: string | null;
  status: ProductReviewStatus;
  created_at: string | Date;
  updated_at: string | Date;
};

export type ProductReviewSummary = {
  averageRating: number;
  reviewCount: number;
  ratingCounts: Record<1 | 2 | 3 | 4 | 5, number>;
};

export type ProductReviewsPayload = {
  reviews: ProductReviewRecord[];
  summary: ProductReviewSummary;
};

export function normalizeRating(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);

  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 5) {
    return null;
  }

  return parsed;
}

export function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

export function serializeReview(review: ProductReviewRecord): ProductReviewRecord {
  return {
    ...review,
    created_at: new Date(review.created_at).toISOString(),
    updated_at: new Date(review.updated_at).toISOString(),
  };
}

export function buildReviewSummary(reviews: ProductReviewRecord[]): ProductReviewSummary {
  const ratingCounts: ProductReviewSummary["ratingCounts"] = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  let total = 0;

  for (const review of reviews) {
    const rating = normalizeRating(review.rating);
    if (!rating) {
      continue;
    }

    ratingCounts[rating as 1 | 2 | 3 | 4 | 5] += 1;
    total += rating;
  }

  const reviewCount = Object.values(ratingCounts).reduce((sum, count) => sum + count, 0);

  return {
    averageRating: reviewCount > 0 ? Math.round((total / reviewCount) * 10) / 10 : 0,
    reviewCount,
    ratingCounts,
  };
}
