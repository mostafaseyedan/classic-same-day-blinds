import Fastify from "fastify";

import { opsApiEnv } from "./config.js";
import { registerCors } from "./lib/cors.js";
import { registerCompetitorPricingRoutes } from "./routes/competitor-pricing.js";
import { registerCustomerPaymentRoutes } from "./routes/customer-payments.js";
import { registerHealthRoutes } from "./routes/health.js";
import { registerIntakeRoutes } from "./routes/intake.js";
import { registerScraperRoutes } from "./routes/scrapers.js";
import { registerInternalRoutes } from "./routes/internal.js";
import { registerNotificationRoutes } from "./routes/notifications.js";
import { registerPlatformRoutes } from "./routes/platform.js";

export function createOpsApiApp() {
  const app = Fastify({
    logger: true,
  });

  registerCors(app, opsApiEnv.allowedOrigins);

  app.get("/", async () => {
    return {
      service: "ops-api",
      status: "ready",
      routes: [
        "/health",
        "/api/v1/phase1",
        "/api/v1/competitor-pricing",
        "/api/v1/platform/capabilities",
        "/api/v1/customer/payment-methods",
        "/api/v1/customer/payment-methods/setup-intent",
        "/api/v1/notifications",
        "/api/v1/quotes",
        "/api/v1/invoice-requests",
        "/api/v1/customer-requests",
        "/api/v1/restock-alerts",
        "/api/v1/sample-requests",
        "/api/v1/conference-interest",
        "/api/v1/membership-inquiries",
        "/api/v1/admin/requests",
        "/api/v1/admin/requests/:id/status",
        "/api/v1/account/delete-request",
      ],
    };
  });

  void registerHealthRoutes(app);
  void registerPlatformRoutes(app);
  void registerInternalRoutes(app);
  void registerCustomerPaymentRoutes(app);
  void registerCompetitorPricingRoutes(app);
  void registerNotificationRoutes(app);
  void registerIntakeRoutes(app);
  void registerScraperRoutes(app);

  return app;
}
