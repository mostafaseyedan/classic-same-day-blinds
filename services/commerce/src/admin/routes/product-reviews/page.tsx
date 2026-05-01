import { defineRouteConfig } from "@medusajs/admin-sdk";
import {
  ArrowPath,
  ChatBubbleLeftRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeSlash,
  PencilSquare,
  StarSolid,
  Trash,
  XCircle,
} from "@medusajs/icons";
import { Badge, Button, Container, Heading, Text } from "@medusajs/ui";
import { useEffect, useState } from "react";

import {
  formatReviewDate,
  stars,
  statusColor,
  type ProductReviewRecord,
  type ProductReviewProductTab,
  type ProductReviewStatus,
  type ProductReviewsAdminResponse,
} from "../../lib/product-reviews";

const PAGE_SIZE = 25;

function ReviewCard({
  review,
  actingId,
  onSetStatus,
  onSaveReply,
  onDelete,
}: {
  review: ProductReviewRecord;
  actingId: string | null;
  onSetStatus: (reviewId: string, status: ProductReviewStatus) => void;
  onSaveReply: (reviewId: string, reply: string) => void;
  onDelete: (reviewId: string) => void;
}) {
  const nextStatus = review.status === "published" ? "hidden" : "published";
  const acting = actingId === review.id;
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyDraft, setReplyDraft] = useState(review.merchant_reply ?? "");

  useEffect(() => {
    setReplyDraft(review.merchant_reply ?? "");
  }, [review.id, review.merchant_reply]);

  return (
    <Container className="p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Text size="small" weight="plus">
              {stars(review.rating)}
            </Text>
            <Badge size="2xsmall" color={statusColor(review.status)}>
              {review.status}
            </Badge>
            <Text size="small" className="text-ui-fg-subtle">
              {formatReviewDate(review.created_at)}
            </Text>
          </div>

          <Heading level="h2" className="mt-2">
            {review.title}
          </Heading>
          <Text size="small" className="mt-2 text-ui-fg-subtle">
            {review.content}
          </Text>
          <div className="mt-3 grid gap-1">
            <Text size="xsmall" className="text-ui-fg-muted">
              Customer: {review.author_name ?? "Customer"} {review.customer_email ? `(${review.customer_email})` : ""}
            </Text>
          </div>
          {replyOpen ? (
            <div className="mt-4 grid gap-2">
              <Text size="xsmall" className="uppercase text-ui-fg-muted">
                Reply
              </Text>
              <textarea
                value={replyDraft}
                onChange={(event) => setReplyDraft(event.target.value)}
                rows={3}
                maxLength={2000}
                className="w-full rounded-md border border-ui-border-base bg-ui-bg-base px-3 py-2 text-sm text-ui-fg-base"
                placeholder="Write a response..."
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  size="small"
                  variant="secondary"
                  disabled={acting || replyDraft.trim() === (review.merchant_reply ?? "")}
                  onClick={() => onSaveReply(review.id, replyDraft)}
                >
                  <Check />
                  Save Reply
                </Button>
                {review.merchant_reply ? (
                  <Button
                    size="small"
                    variant="secondary"
                    disabled={acting}
                    onClick={() => {
                      setReplyDraft("");
                      onSaveReply(review.id, "");
                    }}
                  >
                    <Trash />
                    Clear Reply
                  </Button>
                ) : null}
                <Button
                  size="small"
                  variant="secondary"
                  onClick={() => {
                    setReplyDraft(review.merchant_reply ?? "");
                    setReplyOpen(false);
                  }}
                >
                  <XCircle />
                  Cancel
                </Button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 gap-2">
          <Button
            size="small"
            variant="secondary"
            disabled={acting}
            onClick={() => setReplyOpen((open) => !open)}
          >
            {review.merchant_reply ? <PencilSquare /> : <ChatBubbleLeftRight />}
            {review.merchant_reply ? "Edit Reply" : "Reply"}
          </Button>
          <Button
            size="small"
            variant="secondary"
            disabled={acting}
            onClick={() => onSetStatus(review.id, nextStatus)}
          >
            {nextStatus === "hidden" ? <EyeSlash /> : <Eye />}
            {nextStatus === "hidden" ? "Hide" : "Publish"}
          </Button>
          <Button
            size="small"
            variant="danger"
            disabled={acting}
            onClick={() => onDelete(review.id)}
          >
            <Trash />
            Delete
          </Button>
        </div>
      </div>
    </Container>
  );
}

export default function ProductReviewsPage() {
  const [records, setRecords] = useState<ProductReviewRecord[]>([]);
  const [count, setCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const [status, setStatus] = useState<"" | ProductReviewStatus>("");
  const [productId, setProductId] = useState("");
  const [productTabs, setProductTabs] = useState<ProductReviewProductTab[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  async function loadReviews(nextOffset = offset, nextStatus = status, nextProductId = productId) {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String(nextOffset),
      });

      if (nextStatus) params.set("status", nextStatus);
      if (nextProductId.trim()) params.set("product_id", nextProductId.trim());

      const res = await fetch(`/admin/product-reviews?${params.toString()}`);

      if (!res.ok) {
        throw new Error(`Failed to load reviews (${res.status})`);
      }

      const data = (await res.json()) as ProductReviewsAdminResponse;
      setRecords(data.product_reviews);
      setCount(data.count);
      setOffset(data.offset);
      setProductTabs(data.product_tabs);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load product reviews.");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(reviewId: string, nextStatus: ProductReviewStatus) {
    setActingId(reviewId);
    setError(null);

    try {
      const res = await fetch(`/admin/product-reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) {
        throw new Error(`Failed to update review (${res.status})`);
      }

      await loadReviews(offset);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Unable to update review.");
    } finally {
      setActingId(null);
    }
  }

  async function updateReply(reviewId: string, merchantReply: string) {
    setActingId(reviewId);
    setError(null);

    try {
      const res = await fetch(`/admin/product-reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ merchant_reply: merchantReply }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { message?: string } | null;
        throw new Error(body?.message ?? `Failed to save reply (${res.status})`);
      }

      await loadReviews(offset);
    } catch (replyError) {
      setError(replyError instanceof Error ? replyError.message : "Unable to save reply.");
    } finally {
      setActingId(null);
    }
  }

  async function deleteReview(reviewId: string) {
    setActingId(reviewId);
    setError(null);

    try {
      const res = await fetch(`/admin/product-reviews/${reviewId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error(`Failed to delete review (${res.status})`);
      }

      await loadReviews(offset);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete review.");
    } finally {
      setActingId(null);
    }
  }

  useEffect(() => {
    const initialProductId = new URLSearchParams(window.location.search).get("product_id") ?? "";

    if (initialProductId) {
      setProductId(initialProductId);
    }

    void loadReviews(0, status, initialProductId);
  }, []);

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
  const hasSelectedProductTab = productTabs.some((tab) => tab.product_id === productId);
  const visibleProductTabs =
    productId && !hasSelectedProductTab
      ? [{ product_id: productId, product_title: productId, review_count: count }, ...productTabs]
      : productTabs;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <Heading level="h1">Product Reviews</Heading>
          <Text className="mt-1 text-ui-fg-subtle">
            Review customer feedback, hide visible reviews, and restore hidden reviews.
          </Text>
        </div>
        <Button variant="secondary" size="small" onClick={() => void loadReviews(offset)}>
          <ArrowPath className={loading ? "animate-spin" : ""} />
          Refresh
        </Button>
      </div>

      <Container className="p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <label className="grid gap-1">
            <Text size="xsmall" className="uppercase text-ui-fg-muted">
              Status
            </Text>
            <select
              value={status}
              onChange={(event) => {
                const nextStatus = event.target.value as "" | ProductReviewStatus;
                setStatus(nextStatus);
                void loadReviews(0, nextStatus, productId);
              }}
              className="rounded-md border border-ui-border-base bg-ui-bg-base px-3 py-2 text-sm"
            >
              <option value="">All</option>
              <option value="published">Published</option>
              <option value="hidden">Hidden</option>
            </select>
          </label>
          <div className="grid min-w-0 flex-1 gap-1">
            <Text size="xsmall" className="uppercase text-ui-fg-muted">
              Product
            </Text>
            <div className="flex max-w-full gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Product reviews by product">
              <button
                type="button"
                className={`rounded-md px-3 py-1.5 text-sm whitespace-nowrap transition-colors ${
                  productId
                    ? "text-ui-fg-subtle hover:bg-ui-bg-base-hover hover:text-ui-fg-base"
                    : "bg-ui-bg-interactive text-ui-fg-on-color font-medium"
                }`}
                role="tab"
                aria-selected={!productId}
                onClick={() => {
                  setProductId("");
                  void loadReviews(0, status, "");
                }}
              >
                All products
              </button>
              {visibleProductTabs.map((tab) => (
                <button
                  key={tab.product_id}
                  type="button"
                  className={`rounded-md px-3 py-1.5 text-sm whitespace-nowrap transition-colors ${
                    productId === tab.product_id
                      ? "bg-ui-bg-interactive text-ui-fg-on-color font-medium"
                      : "text-ui-fg-subtle hover:bg-ui-bg-base-hover hover:text-ui-fg-base"
                  }`}
                  role="tab"
                  aria-selected={productId === tab.product_id}
                  onClick={() => {
                    setProductId(tab.product_id);
                    void loadReviews(0, status, tab.product_id);
                  }}
                >
                  {tab.product_title} ({tab.review_count})
                </button>
              ))}
            </div>
          </div>
        </div>
      </Container>

      {error ? (
        <Container className="border-ui-tag-red-border bg-ui-tag-red-bg p-4">
          <Text size="small" className="text-ui-tag-red-text">
            {error}
          </Text>
        </Container>
      ) : null}

      {loading ? (
        <Container className="p-6">
          <Text className="text-ui-fg-subtle">Loading product reviews...</Text>
        </Container>
      ) : records.length > 0 ? (
        <div className="grid gap-3">
          {records.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              actingId={actingId}
              onSetStatus={(reviewId, nextStatus) => void updateStatus(reviewId, nextStatus)}
              onSaveReply={(reviewId, merchantReply) => void updateReply(reviewId, merchantReply)}
              onDelete={(reviewId) => void deleteReview(reviewId)}
            />
          ))}
        </div>
      ) : (
        <Container className="p-6">
          <Text className="text-ui-fg-subtle">No product reviews match these filters.</Text>
        </Container>
      )}

      <div className="flex items-center justify-between">
        <Text size="small" className="text-ui-fg-subtle">
          Showing {records.length ? offset + 1 : 0}-{Math.min(offset + PAGE_SIZE, count)} of {count}
        </Text>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="small"
            disabled={offset === 0}
            onClick={() => void loadReviews(Math.max(0, offset - PAGE_SIZE))}
          >
            <ChevronLeft />
            Previous
          </Button>
          <Text size="small" className="text-ui-fg-subtle">
            Page {currentPage} of {totalPages}
          </Text>
          <Button
            variant="secondary"
            size="small"
            disabled={offset + PAGE_SIZE >= count}
            onClick={() => void loadReviews(offset + PAGE_SIZE)}
          >
            Next
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}

export const config = defineRouteConfig({
  label: "Product Reviews",
  icon: StarSolid,
  rank: 50,
});
