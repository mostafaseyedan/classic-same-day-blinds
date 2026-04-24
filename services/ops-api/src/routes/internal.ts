/**
 * Internal routes — called by other services (e.g. Medusa subscribers).
 * Not exposed to the storefront or admin UI.
 */
import type { FastifyInstance, FastifyRequest } from "fastify";
import { createHash } from "node:crypto";
import { z } from "zod";

import {
  buildOrderConfirmationAdminEmail,
  buildOrderConfirmationCustomerEmail,
  buildPasswordResetCustomerEmail,
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
        subtitle: z.string().optional(),
        detail: z.string().optional(),
        quantity: z.number().int().positive(),
        unitPrice: z.number().nonnegative(),
      }),
    )
    .default([]),
});

const passwordResetSchema = z.object({
  email: z.string().email(),
  token: z.string().min(1),
});

function resetNotificationId(token: string) {
  const digest = createHash("sha256").update(token).digest("hex").slice(0, 24);
  return `password-reset:${digest}`;
}

function validateInternalSecret(request: FastifyRequest) {
  const secret = opsApiEnv.internalApiSecret;

  if (!secret) {
    return true;
  }

  const authHeader = request.headers["authorization"] ?? "";
  const provided = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  return provided === secret;
}

export async function registerInternalRoutes(app: FastifyInstance) {
  app.post("/api/v1/internal/order-confirmed", async (request, reply) => {
    if (!validateInternalSecret(request)) {
      return reply.status(401).send({ error: "Unauthorized" });
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

  app.post("/api/v1/internal/password-reset-requested", async (request, reply) => {
    if (!validateInternalSecret(request)) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    const parsed = passwordResetSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({ error: "Invalid payload", details: parsed.error.flatten() });
    }

    const resetEmail = buildPasswordResetCustomerEmail(parsed.data.email, parsed.data.token);
    await enqueueNotification({
      id: resetNotificationId(parsed.data.token),
      kind: "password-reset-customer",
      toEmail: parsed.data.email,
      subject: resetEmail.subject,
      html: resetEmail.html,
    });

    return reply.status(202).send({ accepted: true });
  });
}
