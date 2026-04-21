import type { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa";
import { Modules } from "@medusajs/framework/utils";

const OPS_API_BASE_URL = process.env.OPS_API_BASE_URL ?? "http://localhost:4000";

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderId = data.id;

  try {
    const orderModule = container.resolve(Modules.ORDER);
    const order = await orderModule.retrieveOrder(orderId, {
      relations: ["items", "shipping_address"],
    });

    const customerEmail: string =
      (order as { email?: string }).email ?? "";

    const customerName: string = (() => {
      const addr = (order as { shipping_address?: { first_name?: string; last_name?: string } })
        .shipping_address;
      if (addr?.first_name || addr?.last_name) {
        return [addr.first_name, addr.last_name].filter(Boolean).join(" ");
      }
      return "";
    })();

    const items = ((order as { items?: Array<{ title?: string; quantity?: number; unit_price?: number }> }).items ?? []).map(
      (item) => ({
        title: item.title ?? "Item",
        quantity: item.quantity ?? 1,
        unitPrice: item.unit_price ?? 0,
      }),
    );

    const total = (order as { total?: number }).total ?? 0;
    const shippingTotal = (order as { shipping_total?: number }).shipping_total ?? 0;
    const displayId = (order as { display_id?: number }).display_id;
    const currencyCode = (order as { currency_code?: string }).currency_code ?? "usd";

    const internalSecret = process.env.INTERNAL_API_SECRET;
    const res = await fetch(`${OPS_API_BASE_URL}/api/v1/internal/order-confirmed`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(internalSecret ? { Authorization: `Bearer ${internalSecret}` } : {}),
      },
      body: JSON.stringify({ orderId, displayId, customerEmail, customerName, total, shippingTotal, currencyCode, items }),
    });

    if (!res.ok) {
      throw new Error(`ops-api responded ${res.status} for order ${orderId}`);
    }
  } catch (err) {
    // Log but don't crash Medusa — email failure should not fail order placement
    console.error("[order-placed subscriber] Failed to send confirmation email:", err);
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
};
