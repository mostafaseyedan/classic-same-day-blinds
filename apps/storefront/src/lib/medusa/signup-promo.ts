import { getPlatformConfig } from "@/lib/platform-config";

export type SignupPromotion = {
  id: string;
  code: string;
  headline: string;
  subcopy: string;
  ctaLabel: string;
  dismissLabel: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  currencyCode: string | null;
  startsAt: string | null;
  endsAt: string | null;
};

type SignupPromoResponse = {
  promotion: SignupPromotion | null;
};

function getHeaders() {
  const config = getPlatformConfig();

  return {
    "Content-Type": "application/json",
    "x-publishable-api-key": config.medusaPublishableKey,
  };
}

export async function getSignupPromotion(placement = "discount-signup-modal") {
  const config = getPlatformConfig();

  if (!config.commerceEnabled) {
    return null;
  }

  const response = await fetch(
    `${config.medusaBaseUrl}/store/signup-promo?placement=${encodeURIComponent(placement)}`,
    {
      headers: getHeaders(),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to load signup promotion.");
  }

  const data = (await response.json()) as SignupPromoResponse;
  return data.promotion;
}

export async function issueSignupPromotion(email: string) {
  const config = getPlatformConfig();

  if (!config.commerceEnabled) {
    throw new Error("Commerce is not configured.");
  }

  const response = await fetch(`${config.medusaBaseUrl}/store/signup-promo/issue`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;
    throw new Error(errorBody?.message ?? "Failed to validate signup email.");
  }

  return (await response.json()) as { issued: true; email: string };
}

export async function issueSignupPromotionLead(email: string, phone: string) {
  const config = getPlatformConfig();

  if (!config.commerceEnabled) {
    throw new Error("Commerce is not configured.");
  }

  const response = await fetch(`${config.medusaBaseUrl}/store/signup-promo/issue`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ email, phone }),
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;
    throw new Error(errorBody?.message ?? "Failed to validate signup details.");
  }

  return (await response.json()) as { issued: true; email: string; phone: string };
}
