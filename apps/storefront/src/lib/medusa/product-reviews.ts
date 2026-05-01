import "server-only";

import { getPlatformConfig } from "@/lib/platform-config";
import { emptyProductReviews, type ProductReviewsPayload } from "@/lib/product-reviews";

export async function getProductReviews(productId: string): Promise<ProductReviewsPayload> {
  const config = getPlatformConfig();

  if (!config.commerceEnabled || !productId) {
    return emptyProductReviews;
  }

  try {
    const response = await fetch(
      `${config.medusaBaseUrl}/store/products/${encodeURIComponent(productId)}/reviews`,
      {
        headers: {
          "x-publishable-api-key": config.medusaPublishableKey,
        },
        next: { revalidate: 60 },
      },
    );

    if (!response.ok) {
      return emptyProductReviews;
    }

    return (await response.json()) as ProductReviewsPayload;
  } catch {
    return emptyProductReviews;
  }
}
