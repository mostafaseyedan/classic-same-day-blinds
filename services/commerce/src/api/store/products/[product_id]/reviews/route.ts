import type { AuthenticatedMedusaRequest, MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";

import { PRODUCT_REVIEW_MODULE } from "../../../../../modules/product-review";
import {
  buildReviewSummary,
  cleanText,
  normalizeRating,
  serializeReview,
  type ProductReviewRecord,
  type ProductReviewsPayload,
} from "../../../../../lib/product-reviews";

type ProductReviewService = {
  listProductReviews: (
    filters?: Record<string, unknown>,
    config?: Record<string, unknown>,
  ) => Promise<ProductReviewRecord[]>;
  createProductReviews: (data: Record<string, unknown>) => Promise<ProductReviewRecord>;
};

type CustomerService = {
  retrieveCustomer: (
    id: string,
    config?: Record<string, unknown>,
  ) => Promise<{
    id: string;
    email?: string | null;
    first_name?: string | null;
    last_name?: string | null;
  }>;
};

function getProductId(req: MedusaRequest) {
  return req.params.product_id?.trim();
}

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse<ProductReviewsPayload | { message: string }>,
) {
  const productId = getProductId(req);

  if (!productId) {
    return res.status(400).json({ message: "Product id is required." });
  }

  const reviewService = req.scope.resolve(PRODUCT_REVIEW_MODULE) as ProductReviewService;
  const reviews = await reviewService.listProductReviews(
    { product_id: productId, status: "published" },
    { order: { created_at: "DESC" } },
  );
  const serializedReviews = reviews.map(serializeReview);

  return res.json({
    reviews: serializedReviews,
    summary: buildReviewSummary(serializedReviews),
  });
}

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse<ProductReviewsPayload | { message: string }>,
) {
  const productId = getProductId(req);
  const customerId = req.auth_context?.actor_id?.trim();

  if (!productId) {
    return res.status(400).json({ message: "Product id is required." });
  }

  if (!customerId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const body = ((req as unknown as { validatedBody?: Record<string, unknown>; body?: Record<string, unknown> })
    .validatedBody ??
    (req as unknown as { body?: Record<string, unknown> }).body ??
    {}) as Record<string, unknown>;

  const rating = normalizeRating(body.rating);
  const title = cleanText(body.title, 120);
  const content = cleanText(body.content, 2000);

  if (!rating) {
    return res.status(400).json({ message: "Rating must be a whole number from 1 to 5." });
  }

  if (title.length < 2) {
    return res.status(400).json({ message: "Review title is required." });
  }

  if (content.length < 10) {
    return res.status(400).json({ message: "Review content must be at least 10 characters." });
  }

  const customerService = req.scope.resolve(Modules.CUSTOMER) as CustomerService;
  const customer = await customerService.retrieveCustomer(customerId, {
    select: ["id", "email", "first_name", "last_name"],
  });
  const authorName =
    [customer.first_name, customer.last_name].filter(Boolean).join(" ").trim() ||
    customer.email ||
    "Customer";

  const reviewService = req.scope.resolve(PRODUCT_REVIEW_MODULE) as ProductReviewService;
  await reviewService.createProductReviews({
    product_id: productId,
    customer_id: customer.id,
    customer_email: customer.email ?? null,
    author_name: authorName,
    rating,
    title,
    content,
    status: "published",
  });

  const reviews = await reviewService.listProductReviews(
    { product_id: productId, status: "published" },
    { order: { created_at: "DESC" } },
  );
  const serializedReviews = reviews.map(serializeReview);

  return res.status(201).json({
    reviews: serializedReviews,
    summary: buildReviewSummary(serializedReviews),
  });
}
