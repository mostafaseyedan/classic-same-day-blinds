import type { FastifyRequest } from "fastify";

import { opsApiEnv } from "../config.js";

export type AuthenticatedCustomer = {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type CustomerContext = {
  token: string;
  customer: AuthenticatedCustomer;
};

export function getBearerToken(request: FastifyRequest) {
  const header = request.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return null;
  }

  return header.slice("Bearer ".length).trim() || null;
}

export async function getAuthenticatedCustomer(
  request: FastifyRequest,
): Promise<AuthenticatedCustomer | null> {
  const token = getBearerToken(request);

  if (!token || !opsApiEnv.medusaPublishableKey) {
    return null;
  }

  const response = await fetch(`${opsApiEnv.medusaBackendUrl}/store/customers/me`, {
    headers: {
      accept: "application/json",
      authorization: `Bearer ${token}`,
      "x-publishable-api-key": opsApiEnv.medusaPublishableKey,
    },
  });

  if (response.status === 401 || response.status === 403) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Unable to validate customer session (${response.status})`);
  }

  const payload = (await response.json()) as {
    customer?: AuthenticatedCustomer;
  };

  return payload.customer?.email ? payload.customer : null;
}

export async function getCustomerContext(
  request: FastifyRequest,
): Promise<CustomerContext | null> {
  const token = getBearerToken(request);

  if (!token) {
    return null;
  }

  const customer = await getAuthenticatedCustomer(request);

  if (!customer) {
    return null;
  }

  return {
    token,
    customer,
  };
}
