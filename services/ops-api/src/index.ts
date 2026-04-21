import "./load-env.js";

import { opsApiEnv } from "./config.js";
import { createOpsApiApp } from "./app.js";
import { initCompetitorPricingStore } from "./lib/competitor-pricing-store.js";
import { initCustomerRequestsStore } from "./lib/customer-requests-store.js";
import { initNotificationsStore } from "./lib/notifications-store.js";
import { cleanupOrphanedJobs, initScraperStore } from "./lib/scraper-store.js";

async function bootstrap() {
  await initCompetitorPricingStore();
  await initCustomerRequestsStore();
  await initNotificationsStore();
  await initScraperStore();
  await cleanupOrphanedJobs([], "Job marked failed automatically because ops-api restarted before it completed.");

  const app = createOpsApiApp();

  await app.listen({ port: opsApiEnv.port, host: opsApiEnv.host });
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
