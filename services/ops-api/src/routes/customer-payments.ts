import type { FastifyInstance, FastifyRequest } from "fastify";
import Stripe from "stripe";
import type {
  CustomerPaymentMethodsResponse,
  CustomerPaymentMethodSummary,
  CustomerPaymentSetupIntentResponse,
} from "@blinds/types";

import { opsApiEnv } from "../config.js";
import type { AuthenticatedCustomer, CustomerContext } from "../lib/customer-auth.js";
import { getCustomerContext } from "../lib/customer-auth.js";

let stripeClient: Stripe | null = null;

function getStripeClient() {
  if (!opsApiEnv.stripeSecretKey) {
    return null;
  }

  if (!stripeClient) {
    stripeClient = new Stripe(opsApiEnv.stripeSecretKey);
  }

  return stripeClient;
}

async function updateCustomerMetadata(
  context: CustomerContext,
  metadata: Record<string, unknown>,
) {
  if (!opsApiEnv.medusaPublishableKey) {
    return;
  }

  const response = await fetch(`${opsApiEnv.medusaBackendUrl}/store/customers/me`, {
    method: "POST",
    headers: {
      accept: "application/json",
      authorization: `Bearer ${context.token}`,
      "content-type": "application/json",
      "x-publishable-api-key": opsApiEnv.medusaPublishableKey,
    },
    body: JSON.stringify({
      metadata: {
        ...(context.customer.metadata ?? {}),
        ...metadata,
      },
    }),
  });

  if (response.ok) {
    const payload = (await response.json()) as {
      customer?: AuthenticatedCustomer;
    };

    if (payload.customer) {
      context.customer = payload.customer;
    }
  }
}

function getStripeCustomerId(metadata?: Record<string, unknown> | null) {
  const value = metadata?.stripe_customer_id;
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

async function findStripeCustomer(
  stripe: Stripe,
  customer: AuthenticatedCustomer,
): Promise<Stripe.Customer | null> {
  const metadataCustomerId = getStripeCustomerId(customer.metadata);

  if (metadataCustomerId) {
    const result = await stripe.customers.retrieve(metadataCustomerId);

    if (!("deleted" in result) && result.email?.toLowerCase() === customer.email.toLowerCase()) {
      return result;
    }
  }

  const candidates = await stripe.customers.list({
    email: customer.email,
    limit: 10,
  });

  return (
    candidates.data.find(
      (entry) => entry.email?.trim().toLowerCase() === customer.email.trim().toLowerCase(),
    ) ?? null
  );
}

async function ensureStripeCustomer(
  stripe: Stripe,
  context: CustomerContext,
): Promise<Stripe.Customer> {
  const existing = await findStripeCustomer(stripe, context.customer);

  if (existing) {
    if (getStripeCustomerId(context.customer.metadata) !== existing.id) {
      await updateCustomerMetadata(context, {
        stripe_customer_id: existing.id,
      });
    }

    return existing;
  }

  const created = await stripe.customers.create({
    email: context.customer.email,
    name: [context.customer.first_name, context.customer.last_name].filter(Boolean).join(" ") || undefined,
    metadata: {
      source: "blinds-storefront",
    },
  });

  await updateCustomerMetadata(context, {
    stripe_customer_id: created.id,
  });

  return created;
}

async function listPaymentMethods(
  stripe: Stripe,
  stripeCustomerId: string,
): Promise<CustomerPaymentMethodSummary[]> {
  const customer = await stripe.customers.retrieve(stripeCustomerId);
  const defaultPaymentMethodId =
    !("deleted" in customer) && typeof customer.invoice_settings.default_payment_method === "string"
      ? customer.invoice_settings.default_payment_method
      : null;

  const methods = await stripe.paymentMethods.list({
    customer: stripeCustomerId,
    type: "card",
  });

  return methods.data.flatMap((method) => {
    if (!method.card) {
      return [];
    }

    return [
      {
        id: method.id,
        brand: method.card.brand,
        last4: method.card.last4,
        expMonth: method.card.exp_month,
        expYear: method.card.exp_year,
        funding: method.card.funding ?? null,
        isDefault: method.id === defaultPaymentMethodId,
      } satisfies CustomerPaymentMethodSummary,
    ];
  });
}

async function buildPaymentMethodsResponse(
  request: FastifyRequest,
): Promise<CustomerPaymentMethodsResponse | null> {
  const stripe = getStripeClient();
  const context = await getCustomerContext(request);

  if (!stripe || !context) {
    return null;
  }

  const stripeCustomer = await findStripeCustomer(stripe, context.customer);

  if (!stripeCustomer) {
    return {
      enabled: true,
      customerEmail: context.customer.email,
      paymentMethods: [],
    };
  }

  const paymentMethods = await listPaymentMethods(stripe, stripeCustomer.id);

  return {
    enabled: true,
    customerEmail: context.customer.email,
    stripeCustomerId: stripeCustomer.id,
    paymentMethods,
  };
}

export async function registerCustomerPaymentRoutes(app: FastifyInstance) {
  app.get("/api/v1/customer/payment-methods", async (request, reply) => {
    if (!opsApiEnv.stripeSecretKey || !opsApiEnv.medusaPublishableKey) {
      return {
        enabled: false,
        paymentMethods: [],
      } satisfies CustomerPaymentMethodsResponse;
    }

    const response = await buildPaymentMethodsResponse(request);

    if (!response) {
      return reply.code(401).send({
        enabled: false,
        paymentMethods: [],
      } satisfies CustomerPaymentMethodsResponse);
    }

    return response;
  });

  app.post("/api/v1/customer/payment-methods/setup-intent", async (request, reply) => {
    const stripe = getStripeClient();

    if (!stripe || !opsApiEnv.medusaPublishableKey) {
      return reply.code(503).send({
        enabled: false,
      } satisfies CustomerPaymentSetupIntentResponse);
    }

    const context = await getCustomerContext(request);

    if (!context) {
      return reply.code(401).send({
        enabled: false,
      } satisfies CustomerPaymentSetupIntentResponse);
    }

    const stripeCustomer = await ensureStripeCustomer(stripe, context);
    const setupIntent = await stripe.setupIntents.create({
      customer: stripeCustomer.id,
      payment_method_types: ["card"],
      usage: "off_session",
    });

    return {
      enabled: true,
      customerEmail: context.customer.email,
      stripeCustomerId: stripeCustomer.id,
      clientSecret: setupIntent.client_secret ?? undefined,
    } satisfies CustomerPaymentSetupIntentResponse;
  });

  app.delete("/api/v1/customer/payment-methods/:paymentMethodId", async (request, reply) => {
    const stripe = getStripeClient();

    if (!stripe || !opsApiEnv.medusaPublishableKey) {
      return reply.code(503).send({
        enabled: false,
        paymentMethods: [],
      } satisfies CustomerPaymentMethodsResponse);
    }

    const response = await buildPaymentMethodsResponse(request);

    if (!response || !response.stripeCustomerId) {
      return reply.code(401).send({
        enabled: false,
        paymentMethods: [],
      } satisfies CustomerPaymentMethodsResponse);
    }

    const paymentMethodId = String(
      (request.params as { paymentMethodId?: string }).paymentMethodId ?? "",
    );
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
    const attachedCustomerId =
      typeof paymentMethod.customer === "string"
        ? paymentMethod.customer
        : paymentMethod.customer?.id ?? null;

    if (
      attachedCustomerId !== response.stripeCustomerId ||
      paymentMethod.type !== "card"
    ) {
      return reply.code(404).send({
        enabled: true,
        customerEmail: response.customerEmail,
        stripeCustomerId: response.stripeCustomerId,
        paymentMethods: response.paymentMethods,
      } satisfies CustomerPaymentMethodsResponse);
    }

    await stripe.paymentMethods.detach(paymentMethodId);

    const paymentMethods = await listPaymentMethods(stripe, response.stripeCustomerId);

    return {
      enabled: true,
      customerEmail: response.customerEmail,
      stripeCustomerId: response.stripeCustomerId,
      paymentMethods,
    } satisfies CustomerPaymentMethodsResponse;
  });
}
