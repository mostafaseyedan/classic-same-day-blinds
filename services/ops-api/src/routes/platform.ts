import type { FastifyInstance } from "fastify";
import type { OpsWorkstream, PlatformCapabilities } from "@blinds/types";

import { opsApiEnv } from "../config.js";

const activeWorkstreams: OpsWorkstream[] = [
  "competitor-pricing",
  "quotes",
  "reviews",
  "crm",
  "inventory-alerts",
  "samples",
  "conferences",
  "memberships",
];

export async function registerPlatformRoutes(app: FastifyInstance) {
  app.get("/api/v1/phase1", async () => {
    return {
      service: "ops-api",
      activeWorkstreams,
    };
  });

  app.get("/api/v1/platform/capabilities", async () => {
    const capabilities: PlatformCapabilities = {
      stripeConfigured: Boolean(opsApiEnv.stripeSecretKey),
      resendConfigured: Boolean(opsApiEnv.resendApiKey),
      savedPaymentMethodsEnabled: Boolean(
        opsApiEnv.stripeSecretKey && opsApiEnv.medusaPublishableKey,
      ),
      emailNotificationsEnabled: true,
    };

    return capabilities;
  });
}
