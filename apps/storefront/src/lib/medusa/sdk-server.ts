import "server-only";

import Medusa from "@medusajs/js-sdk";

import { getPlatformConfig } from "@/lib/platform-config";

function createClient(baseUrl: string, publishableKey: string) {
  return new Medusa({
    baseUrl,
    publishableKey,
    auth: {
      type: "jwt",
      jwtTokenStorageMethod: "memory",
      jwtTokenStorageKey: "blinds_storefront_customer_jwt",
    },
    debug: process.env.NODE_ENV === "development",
  });
}

export function getServerMedusaClient() {
  const config = getPlatformConfig();

  if (!config.commerceEnabled) {
    return null;
  }

  return createClient(config.medusaBaseUrl, config.medusaPublishableKey);
}
