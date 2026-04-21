import type { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa";

const OPS_API_BASE_URL = process.env.OPS_API_BASE_URL ?? "http://localhost:4000";

export default async function productDeletedHandler({
  event: { data },
}: SubscriberArgs<{ id: string }>) {
  const productId = data.id;

  try {
    await fetch(
      `${OPS_API_BASE_URL}/api/v1/competitor-pricing/catalog/by-medusa-product/${productId}`,
      { method: "DELETE" },
    );
  } catch (err) {
    // Non-fatal — the catalog entry will just remain linked until manually unlinked
    console.error("[product-deleted subscriber] Failed to unlink competitor catalog entry:", err);
  }
}

export const config: SubscriberConfig = {
  event: "product.deleted",
};
