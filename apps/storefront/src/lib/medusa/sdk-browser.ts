import Medusa from "@medusajs/js-sdk";

import { getPublicRuntimeConfig } from "@/lib/platform-config";

let _client: Medusa | null = null;

export function getBrowserMedusaClient() {
  const config = getPublicRuntimeConfig();

  if (!config.commerceEnabled) {
    return null;
  }

  if (!_client) {
    _client = new Medusa({
      baseUrl: config.medusaBaseUrl,
      publishableKey: config.medusaPublishableKey,
      auth: {
        type: "jwt",
        jwtTokenStorageMethod: "local",
        jwtTokenStorageKey: "blinds_storefront_customer_jwt",
      },
    });
  }

  return _client;
}
