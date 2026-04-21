import Medusa from "@medusajs/js-sdk";

import { getPublicRuntimeConfig } from "@/lib/platform-config";

function createClient(baseUrl: string, publishableKey: string) {
  return new Medusa({
    baseUrl,
    publishableKey,
    auth: {
      type: "jwt",
      jwtTokenStorageMethod: "local",
      jwtTokenStorageKey: "blinds_storefront_customer_jwt",
    },
    debug: process.env.NODE_ENV === "development",
  });
}

export function getBrowserMedusaClient() {
  const config = getPublicRuntimeConfig();

  if (!config.commerceEnabled) {
    return null;
  }

  return createClient(config.medusaBaseUrl, config.medusaPublishableKey);
}
