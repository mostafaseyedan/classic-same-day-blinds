import type { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa";

const OPS_API_BASE_URL = process.env.OPS_API_BASE_URL ?? "http://localhost:4000";

type PasswordResetEventData = {
  entity_id: string;
  actor_type: string;
  token: string;
};

export default async function passwordResetHandler({
  event: { data },
}: SubscriberArgs<PasswordResetEventData>) {
  if (data.actor_type !== "customer") {
    return;
  }

  try {
    const internalSecret = process.env.INTERNAL_API_SECRET;
    const res = await fetch(`${OPS_API_BASE_URL}/api/v1/internal/password-reset-requested`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(internalSecret ? { Authorization: `Bearer ${internalSecret}` } : {}),
      },
      body: JSON.stringify({
        email: data.entity_id,
        token: data.token,
      }),
    });

    if (!res.ok) {
      throw new Error(`ops-api responded ${res.status} for password reset ${data.entity_id}`);
    }
  } catch (err) {
    // Email delivery should not fail the auth workflow.
    console.error("[password-reset subscriber] Failed to send reset email:", err);
  }
}

export const config: SubscriberConfig = {
  event: "auth.password_reset",
};
