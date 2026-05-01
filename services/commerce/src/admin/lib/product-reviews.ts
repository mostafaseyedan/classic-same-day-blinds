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

export type ProductReviewProductTab = {
  product_id: string;
  product_title: string;
  review_count: number;
};

export type ProductReviewsAdminResponse = {
  product_reviews: ProductReviewRecord[];
  count: number;
  limit: number;
  offset: number;
  summary: ProductReviewSummary;
  product_tabs: ProductReviewProductTab[];
};

export function formatReviewDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function stars(rating: number) {
  return "★★★★★".slice(0, Math.round(rating)).padEnd(5, "☆");
}

export function statusColor(status: ProductReviewStatus): "green" | "grey" {
  return status === "published" ? "green" : "grey";
}
