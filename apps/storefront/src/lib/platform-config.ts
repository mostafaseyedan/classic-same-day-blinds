export type PlatformConfig = {
  medusaBaseUrl: string;
  medusaPublishableKey: string;
  stripePublishableKey: string;
  opsApiBaseUrl: string;
  chatServiceBaseUrl: string;
  commerceEnabled: boolean;
  opsApiEnabled: boolean;
  stripeEnabled: boolean;
  chatEnabled: boolean;
};

type PlatformConfigSource = {
  medusaBaseUrl?: string;
  medusaPublishableKey?: string;
  stripePublishableKey?: string;
  opsApiBaseUrl?: string;
  chatServiceBaseUrl?: string;
};

declare global {
  interface Window {
    __BLINDS_PUBLIC_CONFIG__?: PlatformConfigSource;
  }
}

function normalizeEnv(value: string | undefined): string {
  return value?.trim() ?? "";
}

function buildPlatformConfig(source: PlatformConfigSource): PlatformConfig {
  const medusaBaseUrl = normalizeEnv(source.medusaBaseUrl);
  const medusaPublishableKey = normalizeEnv(source.medusaPublishableKey);
  const stripePublishableKey = normalizeEnv(source.stripePublishableKey);
  const opsApiBaseUrl = normalizeEnv(source.opsApiBaseUrl);
  const chatServiceBaseUrl = normalizeEnv(source.chatServiceBaseUrl);

  return {
    medusaBaseUrl,
    medusaPublishableKey,
    stripePublishableKey,
    opsApiBaseUrl,
    chatServiceBaseUrl,
    commerceEnabled: Boolean(medusaBaseUrl && medusaPublishableKey),
    opsApiEnabled: Boolean(opsApiBaseUrl),
    stripeEnabled: Boolean(stripePublishableKey),
    chatEnabled: Boolean(chatServiceBaseUrl),
  };
}

function readEnvConfigSource(): PlatformConfigSource {
  return {
    medusaBaseUrl: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL,
    medusaPublishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
    stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    opsApiBaseUrl: process.env.NEXT_PUBLIC_OPS_API_URL,
    chatServiceBaseUrl: process.env.NEXT_PUBLIC_CHAT_SERVICE_URL,
  };
}

export function getPlatformConfig(): PlatformConfig {
  return buildPlatformConfig(readEnvConfigSource());
}

export function getPublicRuntimeConfig() {
  if (typeof window !== "undefined" && window.__BLINDS_PUBLIC_CONFIG__) {
    return buildPlatformConfig(window.__BLINDS_PUBLIC_CONFIG__);
  }

  return getPlatformConfig();
}

export function getSerializedPublicRuntimeConfig() {
  return JSON.stringify(readEnvConfigSource()).replace(/</g, "\\u003c");
}
