/**
 * Internal routes — called by other services (e.g. Medusa subscribers).
 * Not exposed to the storefront or admin UI.
 */
import type { FastifyInstance } from "fastify";
import { z } from "zod";

import {
  buildOrderConfirmationAdminEmail,
  buildOrderConfirmationCustomerEmail,
} from "../lib/notification-templates.js";
import { enqueueNotification } from "../lib/notifications-store.js";
import { opsApiEnv } from "../config.js";

const orderConfirmedSchema = z.object({
  orderId: z.string().min(1),
  displayId: z.number().int().positive().optional(),
  customerEmail: z.string().email(),
  customerName: z.string().default(""),
  total: z.number().nonnegative(),
  shippingTotal: z.number().nonnegative().optional(),
  currencyCode: z.string().length(3),
  items: z
    .array(
      z.object({
        title: z.string(),
        quantity: z.number().int().positive(),
        unitPrice: z.number().nonnegative(),
      }),
    )
    .default([]),
});

export async function registerInternalRoutes(app: FastifyInstance) {
  app.post("/api/v1/internal/order-confirmed", async (request, reply) => {
    const secret = opsApiEnv.internalApiSecret;
    if (secret) {
      const authHeader = request.headers["authorization"] ?? "";
      const provided = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
      if (provided !== secret) {
        return reply.status(401).send({ error: "Unauthorized" });
      }
    }

    const parsed = orderConfirmedSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({ error: "Invalid payload", details: parsed.error.flatten() });
    }

    const order = parsed.data;

    const customerEmail = buildOrderConfirmationCustomerEmail(order);
    await enqueueNotification({
      id: `order-confirm:${order.orderId}:customer`,
      kind: "order-confirmation-customer",
      toEmail: order.customerEmail,
      subject: customerEmail.subject,
      html: customerEmail.html,
    });

    const adminEmail = buildOrderConfirmationAdminEmail(order);
    for (const recipient of opsApiEnv.emailAdminRecipients) {
      await enqueueNotification({
        id: `order-confirm:${order.orderId}:admin:${recipient}`,
        kind: "order-confirmation-admin",
        toEmail: recipient,
        subject: adminEmail.subject,
        html: adminEmail.html,
      });
    }

    return reply.status(202).send({ accepted: true, orderId: order.orderId });
  });
}
