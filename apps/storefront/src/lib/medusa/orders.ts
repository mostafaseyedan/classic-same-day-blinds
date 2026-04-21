import "server-only";

import type { HttpTypes } from "@medusajs/types";

import { getServerMedusaClient } from "@/lib/medusa/sdk-server";

const ORDER_FIELDS = [
  "id",
  "display_id",
  "email",
  "status",
  "payment_status",
  "fulfillment_status",
  "created_at",
  "currency_code",
  "total",
  "*items",
  "*shipping_methods",
  "*shipping_address",
  "*fulfillments",
].join(",");

export async function getStoreOrderById(
  orderId: string,
  options?: { email?: string },
): Promise<HttpTypes.StoreOrder | null> {
  const sdk = getServerMedusaClient();

  if (!sdk || orderId.trim().length === 0) {
    return null;
  }

  try {
    const { order } = await sdk.store.order.retrieve(orderId, {
      fields: ORDER_FIELDS,
    });

    if (
      options?.email &&
      order.email &&
      order.email.trim().toLowerCase() !== options.email.trim().toLowerCase()
    ) {
      return null;
    }

    return order;
  } catch (error) {
    console.error("Failed to load store order", error);
    return null;
  }
}
