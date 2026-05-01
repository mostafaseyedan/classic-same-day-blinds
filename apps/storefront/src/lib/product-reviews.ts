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
  created_at: string;
  updated_at: string;
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

export const emptyProductReviews: ProductReviewsPayload = {
  reviews: [],
  summary: {
    averageRating: 0,
    reviewCount: 0,
    ratingCounts: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    },
  },
};
