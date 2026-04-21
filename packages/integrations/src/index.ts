export const integrationTargets = {
  email: "resend",
  payments: "stripe",
  analytics: "posthog",
  llm: "vertex-ai",
  accounting: "xero",
} as const;

export * from "./competitor-pricing.js";
