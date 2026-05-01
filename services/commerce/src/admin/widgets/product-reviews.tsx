import { defineWidgetConfig } from "@medusajs/admin-sdk";
import type { AdminProduct, DetailWidgetProps } from "@medusajs/types";
import { Badge, Button, Container, Heading, Text } from "@medusajs/ui";
import { useEffect, useState } from "react";

import {
  formatReviewDate,
  stars,
  statusColor,
  type ProductReviewRecord,
  type ProductReviewStatus,
  type ProductReviewsAdminResponse,
} from "../lib/product-reviews";

const LIMIT = 3;

const ProductReviewsWidget = ({ data: product }: DetailWidgetProps<AdminProduct>) => {
  const [reviews, setReviews] = useState<ProductReviewRecord[]>([]);
  const [count, setCount] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadReviews() {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        product_id: product.id,
        limit: String(LIMIT),
      });
      const res = await fetch(`/admin/product-reviews?${params.toString()}`);

      if (!res.ok) {
        throw new Error(`Failed to load reviews (${res.status})`);
      }

      const data = (await res.json()) as ProductReviewsAdminResponse;
      setReviews(data.product_reviews);
      setCount(data.count);
      setAverageRating(data.summary.averageRating);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load product reviews.");
    } finally {
      setLoading(false);
    }
  }

  async function setStatus(reviewId: string, status: ProductReviewStatus) {
    setActingId(reviewId);
    setError(null);

    try {
      const res = await fetch(`/admin/product-reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        throw new Error(`Failed to update review (${res.status})`);
      }

      await loadReviews();
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : "Unable to update review.");
    } finally {
      setActingId(null);
    }
  }

  useEffect(() => {
    void loadReviews();
  }, [product.id]);

  return (
    <Container className="p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Heading level="h2">Product Reviews</Heading>
          <Text size="small" className="mt-2 text-ui-fg-subtle">
            {loading
              ? "Loading reviews..."
              : count > 0
                ? `${averageRating.toFixed(1)} average from ${count} review${count === 1 ? "" : "s"}`
                : "No reviews yet"}
          </Text>
        </div>
        <Button asChild size="small" variant="secondary">
          <a href={`/app/product-reviews?product_id=${encodeURIComponent(product.id)}`}>Open</a>
        </Button>
      </div>

      {error ? (
        <Text size="small" className="mt-4 text-ui-tag-red-text">
          {error}
        </Text>
      ) : null}

      <div className="mt-5 grid gap-3">
        {reviews.map((review) => {
          const nextStatus = review.status === "published" ? "hidden" : "published";
          return (
            <div key={review.id} className="rounded-lg border border-ui-border-base p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Text size="small" weight="plus">
                      {stars(review.rating)}
                    </Text>
                    <Badge size="2xsmall" color={statusColor(review.status)}>
                      {review.status}
                    </Badge>
                  </div>
                  <Text size="small" weight="plus" className="mt-2">
                    {review.title}
                  </Text>
                  <Text size="xsmall" className="mt-1 text-ui-fg-muted">
                    {review.author_name ?? "Customer"} · {formatReviewDate(review.created_at)}
                  </Text>
                </div>
                <Button
                  size="small"
                  variant="secondary"
                  disabled={actingId === review.id}
                  onClick={() => void setStatus(review.id, nextStatus)}
                >
                  {nextStatus === "hidden" ? "Hide" : "Publish"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "product.details.side.after",
});

export default ProductReviewsWidget;
