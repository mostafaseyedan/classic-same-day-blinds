import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys, remoteQueryObjectFromString } from "@medusajs/framework/utils";

type SignupPromoResponse = {
  promotion: {
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
  } | null;
};

type PromotionRow = {
  id: string;
  code: string;
  status: string;
  is_automatic: boolean;
  metadata?: Record<string, unknown> | null;
  campaign?: {
    name?: string | null;
    description?: string | null;
    campaign_identifier?: string | null;
    starts_at?: string | null;
    ends_at?: string | null;
  } | null;
  application_method?: {
    type?: "percentage" | "fixed" | null;
    value?: number | null;
    currency_code?: string | null;
    target_type?: string | null;
  } | null;
};

function normalizeMetadata(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asBoolean(value: unknown) {
  return value === true || value === "true" || value === 1 || value === "1";
}

function asString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

function selectPromotion(
  promotions: PromotionRow[],
  placementIdentifier: string,
  preferredCode: string | null,
) {
  const activePromotions = promotions.filter((promotion) => promotion.status === "active" && !promotion.is_automatic);

  const exactByIdentifier = activePromotions.find(
    (promotion) => promotion.campaign?.campaign_identifier === placementIdentifier,
  );

  if (exactByIdentifier) {
    return exactByIdentifier;
  }

  const metadataEnabled = activePromotions.find((promotion) => {
    const metadata = normalizeMetadata(promotion.metadata);
    return asBoolean(metadata.popup_enabled);
  });

  if (metadataEnabled) {
    return metadataEnabled;
  }

  if (preferredCode) {
    const exactByCode = activePromotions.find((promotion) => promotion.code === preferredCode);
    if (exactByCode) {
      return exactByCode;
    }
  }

  return activePromotions[0] ?? null;
}

function mapPromotion(promotion: PromotionRow): SignupPromoResponse["promotion"] {
  const metadata = normalizeMetadata(promotion.metadata);
  const discountValue = asNumber(promotion.application_method?.value) ?? 0;
  const discountType = promotion.application_method?.type === "fixed" ? "fixed" : "percentage";

  return {
    id: promotion.id,
    code: promotion.code,
    headline:
      asString(metadata.headline) ??
      promotion.campaign?.name?.trim() ??
      `Get ${discountType === "percentage" ? `${discountValue}% Off` : "a Discount"} Your Order`,
    subcopy:
      asString(metadata.subcopy) ??
      promotion.campaign?.description?.trim() ??
      "Use this offer at checkout to save on your first order.",
    ctaLabel: asString(metadata.cta_label) ?? "Get My Discount",
    dismissLabel: asString(metadata.dismiss_label) ?? "No thanks",
    discountType,
    discountValue,
    currencyCode: promotion.application_method?.currency_code ?? null,
    startsAt: promotion.campaign?.starts_at ?? null,
    endsAt: promotion.campaign?.ends_at ?? null,
  };
}

export const GET = async (req: MedusaRequest, res: MedusaResponse<SignupPromoResponse>) => {
  const remoteQuery = req.scope.resolve(ContainerRegistrationKeys.REMOTE_QUERY);
  const placement =
    typeof req.query?.placement === "string" && req.query.placement.trim()
      ? req.query.placement.trim()
      : "discount-signup-modal";
  const preferredCode = process.env.SIGNUP_PROMOTION_CODE?.trim() || null;

  const queryObject = remoteQueryObjectFromString({
    entryPoint: "promotion",
    variables: {
      filters: {},
      take: 50,
    },
    fields: [
      "id",
      "code",
      "status",
      "is_automatic",
      "metadata",
      "campaign.id",
      "campaign.name",
      "campaign.description",
      "campaign.campaign_identifier",
      "campaign.starts_at",
      "campaign.ends_at",
      "application_method.type",
      "application_method.value",
      "application_method.currency_code",
      "application_method.target_type",
    ],
  });

  const result = await remoteQuery(queryObject);
  const promotions = Array.isArray(result)
    ? (result as PromotionRow[])
    : ((result as { rows?: PromotionRow[] }).rows ?? []);

  const selected = selectPromotion(promotions, placement, preferredCode);

  res.json({
    promotion: selected ? mapPromotion(selected) : null,
  });
};
