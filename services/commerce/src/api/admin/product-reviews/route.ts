import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Client } from "pg";

import { PRODUCT_REVIEW_MODULE } from "../../../modules/product-review";
import {
  buildReviewSummary,
  serializeReview,
  type ProductReviewRecord,
  type ProductReviewStatus,
} from "../../../lib/product-reviews";

type ProductReviewService = {
  listProductReviews: (
    filters?: Record<string, unknown>,
    config?: Record<string, unknown>,
  ) => Promise<ProductReviewRecord[]>;
  listAndCountProductReviews: (
    filters?: Record<string, unknown>,
    config?: Record<string, unknown>,
  ) => Promise<[ProductReviewRecord[], number]>;
};

type AdminProductReviewsResponse = {
  product_reviews: ProductReviewRecord[];
  count: number;
  limit: number;
  offset: number;
  summary: ReturnType<typeof buildReviewSummary>;
  product_tabs: Array<{
    product_id: string;
    product_title: string;
    review_count: number;
  }>;
};

function readInt(value: unknown, fallback: number) {
  const parsed = typeof value === "string" ? Number.parseInt(value, 10) : Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

async function listProductTabs(status: ProductReviewStatus | null) {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    const statusFilter = status ? "AND pr.status = $1" : "";
    const params = status ? [status] : [];
    const { rows } = await client.query<{
      product_id: string;
      product_title: string;
      review_count: string;
    }>(
      `SELECT p.id AS product_id,
              p.title AS product_title,
              count(pr.id)::text AS review_count
         FROM product p
         LEFT JOIN product_review pr
           ON pr.product_id = p.id
          AND pr.deleted_at IS NULL
          ${statusFilter}
        WHERE p.deleted_at IS NULL
        GROUP BY p.id, p.title
        ORDER BY p.title ASC`,
      params,
    );

    return rows.map((row) => ({
      product_id: row.product_id,
      product_title: row.product_title,
      review_count: Number.parseInt(row.review_count, 10),
    }));
  } finally {
    await client.end();
  }
}

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse<AdminProductReviewsResponse>,
) {
  const productId = typeof req.query.product_id === "string" ? req.query.product_id.trim() : "";
  const status = typeof req.query.status === "string" ? req.query.status.trim() : "";
  const limit = Math.min(readInt(req.query.limit, 20), 100);
  const offset = readInt(req.query.offset, 0);
  const filters: Record<string, unknown> = {};

  if (productId) {
    filters.product_id = productId;
  }

  if (status === "published" || status === "hidden") {
    filters.status = status as ProductReviewStatus;
  }

  let tabStatus: ProductReviewStatus | null = null;
  if (filters.status) {
    tabStatus = filters.status as ProductReviewStatus;
  }

  const reviewService = req.scope.resolve(PRODUCT_REVIEW_MODULE) as ProductReviewService;
  const [reviews, count] = await reviewService.listAndCountProductReviews(filters, {
    skip: offset,
    take: limit,
    order: { created_at: "DESC" },
  });
  const allMatchingReviews = await reviewService.listProductReviews(filters, {
    order: { created_at: "DESC" },
  });
  const serializedReviews = reviews.map(serializeReview);
  const serializedMatchingReviews = allMatchingReviews.map(serializeReview);
  const productTabs = await listProductTabs(tabStatus);

  return res.json({
    product_reviews: serializedReviews,
    count,
    limit,
    offset,
    summary: buildReviewSummary(serializedMatchingReviews),
    product_tabs: productTabs,
  });
}
