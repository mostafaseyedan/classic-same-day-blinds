import type { FastifyInstance } from "fastify";
import type {
  CustomerAccountActivityResponse,
  ConferenceInterestRequest,
  CustomerOpsRequestRecord,
  CustomerOpsRequestStatus,
  InvoiceRequest,
  MembershipInquiryRequest,
  QuoteRequest,
  RestockAlertRequest,
  SampleRequest,
} from "@blinds/types";
import { z } from "zod";

import { buildAcceptedResponse } from "../lib/intake.js";
import {
  createCustomerOpsRequest,
  listAllCustomerOpsRequests,
  listCustomerOpsRequests,
  updateCustomerOpsRequestStatus,
} from "../lib/customer-requests-store.js";
import {
  buildAccountDeletionAdminEmail,
  buildInvoiceAdminEmail,
  buildInvoiceCustomerEmail,
  buildQuoteAdminEmail,
  buildQuoteCustomerEmail,
  buildRestockAdminEmail,
} from "../lib/notification-templates.js";
import { enqueueNotification } from "../lib/notifications-store.js";
import { listNotificationsByEmail } from "../lib/notifications-store.js";
import { opsApiEnv } from "../config.js";
import { getAuthenticatedCustomer } from "../lib/customer-auth.js";

const quoteRequestSchema: z.ZodType<QuoteRequest> = z.object({
  customerName: z.string().min(1),
  companyName: z.string().optional(),
  purchaseOrderNumber: z.string().trim().min(1).optional(),
  email: z.string().email(),
  notes: z.string().optional(),
});

const restockAlertSchema: z.ZodType<RestockAlertRequest> = z.object({
  customerName: z.string().optional(),
  email: z.string().email(),
  productId: z.string().min(1),
  productName: z.string().min(1),
});

const invoiceRequestSchema: z.ZodType<InvoiceRequest> = z.object({
  customerName: z.string().min(1),
  email: z.string().email(),
  companyName: z.string().optional(),
  purchaseOrderNumber: z.string().trim().min(1).optional(),
  orderId: z.string().optional(),
  cartId: z.string().optional(),
  notes: z.string().optional(),
});

const sampleRequestSchema: z.ZodType<SampleRequest> = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zip: z.string().min(1),
  productType: z.string().min(1),
  preferredColor: z.string().min(1),
  notes: z.string().optional(),
});

const conferenceInterestSchema: z.ZodType<ConferenceInterestRequest> = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  conference: z.string().min(1),
  message: z.string().optional(),
});

const membershipInquirySchema: z.ZodType<MembershipInquiryRequest> = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  tier: z.string().min(1),
  message: z.string().optional(),
});

const customerRequestStatuses: [
  CustomerOpsRequestStatus,
  CustomerOpsRequestStatus,
  CustomerOpsRequestStatus,
  CustomerOpsRequestStatus,
] = ["received", "reviewed", "approved", "completed"];

const customerRequestTypes: [
  CustomerOpsRequestRecord["type"],
  CustomerOpsRequestRecord["type"],
  CustomerOpsRequestRecord["type"],
  CustomerOpsRequestRecord["type"],
] = ["quote", "invoice", "restock", "account_deletion"];

export async function registerIntakeRoutes(app: FastifyInstance) {
  app.post("/api/v1/quotes", async (request, reply) => {
    const parsed = quoteRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: "Invalid quote payload",
        details: parsed.error.flatten(),
      });
    }

    const accepted = buildAcceptedResponse("quote-review", parsed.data);
    await createCustomerOpsRequest({
      id: accepted.referenceId,
      type: "quote",
      email: parsed.data.email,
      status: "received",
      submittedAt: accepted.receivedAt,
      customerName: parsed.data.customerName,
      companyName: parsed.data.companyName,
      purchaseOrderNumber: parsed.data.purchaseOrderNumber,
      notes: parsed.data.notes,
    });
    const customerEmail = buildQuoteCustomerEmail(parsed.data.customerName);
    await enqueueNotification({
      id: `${accepted.referenceId}:customer`,
      kind: "quote-received-customer",
      toEmail: parsed.data.email,
      subject: customerEmail.subject,
      html: customerEmail.html,
    });
    const adminEmail = buildQuoteAdminEmail(
      parsed.data.customerName,
      parsed.data.email,
      parsed.data.notes,
    );
    for (const recipient of opsApiEnv.emailAdminRecipients) {
      await enqueueNotification({
        id: `${accepted.referenceId}:admin:${recipient}`,
        kind: "quote-received-admin",
        toEmail: recipient,
        subject: adminEmail.subject,
        html: adminEmail.html,
      });
    }

    return reply.status(202).send(accepted);
  });

  app.post("/api/v1/restock-alerts", async (request, reply) => {
    const parsed = restockAlertSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: "Invalid restock alert payload",
        details: parsed.error.flatten(),
      });
    }

    const accepted = buildAcceptedResponse("inventory-watch", parsed.data);
    await createCustomerOpsRequest({
      id: accepted.referenceId,
      type: "restock",
      email: parsed.data.email,
      status: "received",
      submittedAt: accepted.receivedAt,
      customerName: parsed.data.customerName,
      productId: parsed.data.productId,
      productName: parsed.data.productName,
      notes: `Restock notification requested for ${parsed.data.productName}.`,
    });
    const adminEmail = buildRestockAdminEmail(parsed.data.productName, parsed.data.email);

    for (const recipient of opsApiEnv.emailAdminRecipients) {
      await enqueueNotification({
        id: `${accepted.referenceId}:admin:${recipient}`,
        kind: "restock-alert-admin",
        toEmail: recipient,
        subject: adminEmail.subject,
        html: adminEmail.html,
      });
    }

    return reply.status(202).send(accepted);
  });

  app.post("/api/v1/sample-requests", async (request, reply) => {
    const parsed = sampleRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: "Invalid sample request payload",
        details: parsed.error.flatten(),
      });
    }

    return reply.status(202).send(buildAcceptedResponse("sample-fulfillment", parsed.data));
  });

  app.post("/api/v1/invoice-requests", async (request, reply) => {
    const parsed = invoiceRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: "Invalid invoice request payload",
        details: parsed.error.flatten(),
      });
    }

    const accepted = buildAcceptedResponse("quote-review", parsed.data);
    await createCustomerOpsRequest({
      id: accepted.referenceId,
      type: "invoice",
      email: parsed.data.email,
      status: "received",
      submittedAt: accepted.receivedAt,
      customerName: parsed.data.customerName,
      companyName: parsed.data.companyName,
      purchaseOrderNumber: parsed.data.purchaseOrderNumber,
      cartId: parsed.data.cartId,
      orderId: parsed.data.orderId,
      notes: parsed.data.notes,
    });
    const customerEmail = buildInvoiceCustomerEmail(parsed.data.customerName);
    await enqueueNotification({
      id: `${accepted.referenceId}:customer`,
      kind: "invoice-received-customer",
      toEmail: parsed.data.email,
      subject: customerEmail.subject,
      html: customerEmail.html,
    });
    const adminEmail = buildInvoiceAdminEmail(
      parsed.data.customerName,
      parsed.data.email,
      parsed.data.notes,
    );
    for (const recipient of opsApiEnv.emailAdminRecipients) {
      await enqueueNotification({
        id: `${accepted.referenceId}:admin:${recipient}`,
        kind: "invoice-received-admin",
        toEmail: recipient,
        subject: adminEmail.subject,
        html: adminEmail.html,
      });
    }

    return reply.status(202).send(accepted);
  });

  app.post("/api/v1/conference-interest", async (request, reply) => {
    const parsed = conferenceInterestSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: "Invalid conference interest payload",
        details: parsed.error.flatten(),
      });
    }

    return reply.status(202).send(buildAcceptedResponse("business-development", parsed.data));
  });

  app.post("/api/v1/membership-inquiries", async (request, reply) => {
    const parsed = membershipInquirySchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: "Invalid membership inquiry payload",
        details: parsed.error.flatten(),
      });
    }

    return reply.status(202).send(buildAcceptedResponse("membership-review", parsed.data));
  });

  app.get("/api/v1/customer-requests", async (request, reply) => {
    const customer = await getAuthenticatedCustomer(request);

    if (!customer) {
      return reply.status(401).send({ error: "Customer authentication required" });
    }

    const requests = await listCustomerOpsRequests(customer.email);

    return {
      requests,
    };
  });

  app.get("/api/v1/customer/activity", async (request, reply) => {
    const customer = await getAuthenticatedCustomer(request);

    if (!customer) {
      return reply.status(401).send({ error: "Customer authentication required" });
    }

    const [requests, notifications] = await Promise.all([
      listCustomerOpsRequests(customer.email),
      listNotificationsByEmail(customer.email),
    ]);

    return {
      requests,
      notifications,
    } satisfies CustomerAccountActivityResponse;
  });

  // Admin: list all requests (used by Medusa admin extension)
  app.get("/api/v1/admin/requests", async (request, reply) => {
    const querySchema = z.object({
      type: z.enum(customerRequestTypes).optional(),
      status: z.string().optional(),
      limit: z.coerce.number().int().positive().max(100).default(50),
      offset: z.coerce.number().int().min(0).default(0),
    });

    const parsed = querySchema.safeParse(request.query);

    if (!parsed.success) {
      return reply.status(400).send({ error: "Invalid query", details: parsed.error.flatten() });
    }

    const result = await listAllCustomerOpsRequests(parsed.data);

    return result;
  });

  app.patch("/api/v1/admin/requests/:id/status", async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().min(1),
    });
    const bodySchema = z.object({
      status: z.enum(customerRequestStatuses),
    });

    const parsedParams = paramsSchema.safeParse(request.params);
    const parsedBody = bodySchema.safeParse(request.body);

    if (!parsedParams.success || !parsedBody.success) {
      return reply.status(400).send({
        error: "Invalid request update payload",
        details: {
          params: parsedParams.success ? undefined : parsedParams.error.flatten(),
          body: parsedBody.success ? undefined : parsedBody.error.flatten(),
        },
      });
    }

    const record = await updateCustomerOpsRequestStatus(
      parsedParams.data.id,
      parsedBody.data.status,
    );

    if (!record) {
      return reply.status(404).send({ error: "Request not found" });
    }

    return {
      updated: true,
      record,
    };
  });

  app.post("/api/v1/account/delete-request", async (request, reply) => {
    const customer = await getAuthenticatedCustomer(request);

    if (!customer) {
      return reply.status(401).send({ error: "Customer authentication required" });
    }

    const referenceId = `del_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await createCustomerOpsRequest({
      id: referenceId,
      type: "account_deletion",
      email: customer.email,
      status: "received",
      submittedAt: new Date().toISOString(),
      customerName: [customer.first_name, customer.last_name].filter(Boolean).join(" ") || undefined,
      customerId: customer.id,
      notes: "Customer requested account deletion.",
    });

    const adminEmail = buildAccountDeletionAdminEmail(customer.email, customer.id);

    for (const recipient of opsApiEnv.emailAdminRecipients) {
      await enqueueNotification({
        id: `${referenceId}:admin:${recipient}`,
        kind: "account-deletion-admin",
        toEmail: recipient,
        subject: adminEmail.subject,
        html: adminEmail.html,
      });
    }

    return reply.status(202).send({
      accepted: true,
      referenceId,
      message: "Your account deletion request has been submitted. We will process it within 48 hours.",
    });
  });
}
