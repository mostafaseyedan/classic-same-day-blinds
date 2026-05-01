import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";

import { PRODUCT_REVIEW_MODULE } from "../../../../modules/product-review";
import {
  cleanText,
  normalizeRating,
  serializeReview,
  type ProductReviewRecord,
} from "../../../../lib/product-reviews";

type ProductReviewService = {
  updateProductReviews: (data: Record<string, unknown>) => Promise<ProductReviewRecord>;
  deleteProductReviews: (ids: string | string[]) => Promise<void>;
};

type ProductReviewResponse = {
  product_review: ProductReviewRecord;
};

function getReviewId(req: AuthenticatedMedusaRequest) {
  return req.params.id?.trim();
}

export async function PATCH(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse<ProductReviewResponse | { message: string }>,
) {
  const reviewId = getReviewId(req);

  if (!reviewId) {
    return res.status(400).json({ message: "Review id is required." });
  }

  const body = ((req as unknown as { validatedBody?: Record<string, unknown>; body?: Record<string, unknown> })
    .validatedBody ??
    (req as unknown as { body?: Record<string, unknown> }).body ??
    {}) as Record<string, unknown>;
  const patch: Record<string, unknown> = { id: reviewId };

  if (body.status === "published" || body.status === "hidden") {
    patch.status = body.status;
  }

  if (body.rating !== undefined) {
    const rating = normalizeRating(body.rating);
    if (!rating) {
      return res.status(400).json({ message: "Rating must be a whole number from 1 to 5." });
    }
    patch.rating = rating;
  }

  if (body.title !== undefined) {
    const title = cleanText(body.title, 120);
    if (title.length < 2) {
      return res.status(400).json({ message: "Review title is required." });
    }
    patch.title = title;
  }

  if (body.content !== undefined) {
    const content = cleanText(body.content, 2000);
    if (content.length < 10) {
      return res.status(400).json({ message: "Review content must be at least 10 characters." });
    }
    patch.content = content;
  }

  const merchantReplyValue = body.merchant_reply ?? body.merchantReply;
  if (merchantReplyValue !== undefined) {
    const merchantReply = cleanText(merchantReplyValue, 2000);
    patch.merchant_reply = merchantReply.length > 0 ? merchantReply : null;
  }

  if (Object.keys(patch).length === 1) {
    return res.status(400).json({ message: "No supported review fields were provided." });
  }

  const reviewService = req.scope.resolve(PRODUCT_REVIEW_MODULE) as ProductReviewService;
  const review = await reviewService.updateProductReviews(patch);

  return res.json({ product_review: serializeReview(review) });
}

export async function DELETE(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse<{ id: string; object: "product_review"; deleted: true } | { message: string }>,
) {
  const reviewId = getReviewId(req);

  if (!reviewId) {
    return res.status(400).json({ message: "Review id is required." });
  }

  const reviewService = req.scope.resolve(PRODUCT_REVIEW_MODULE) as ProductReviewService;
  await reviewService.deleteProductReviews(reviewId);

  return res.json({
    id: reviewId,
    object: "product_review",
    deleted: true,
  });
}
