"use client";

import { useEffect, useRef } from "react";
import { loadStripe } from "@stripe/stripe-js";
import type { StripePaymentMethodMessagingElement } from "@stripe/stripe-js";
import { getPublicRuntimeConfig } from "@/lib/platform-config";

// Affirm requires a minimum of $50 USD
const AFFIRM_MIN_USD = 50;

type AffirmMessagingProps = {
  /** Price in dollars (major unit, as used throughout the storefront) */
  amountInDollars: number;
};

export function AffirmMessaging({ amountInDollars }: AffirmMessagingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const elementRef = useRef<StripePaymentMethodMessagingElement | null>(null);
  const stripePromiseRef = useRef(loadStripe(getPublicRuntimeConfig().stripePublishableKey));

  const amountInCents = Math.round(amountInDollars * 100);
  const eligible = amountInDollars >= AFFIRM_MIN_USD;

  // Mount once
  useEffect(() => {
    if (!eligible) return;

    let cancelled = false;

    async function mount() {
      const stripe = await stripePromiseRef.current;
      if (cancelled || !stripe || !containerRef.current) return;

      const elements = stripe.elements();
      const el = elements.create("paymentMethodMessaging", {
        amount: amountInCents,
        currency: "USD",
        paymentMethodTypes: ["affirm"],
        countryCode: "US",
      });

      el.mount(containerRef.current);
      elementRef.current = el;
    }

    void mount();

    return () => {
      cancelled = true;
      elementRef.current?.unmount();
      elementRef.current = null;
    };
    // Only re-mount when eligibility flips (not on every price change — handled by update below)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eligible]);

  // Update amount without remounting
  useEffect(() => {
    if (!elementRef.current || !eligible) return;
    elementRef.current.update({ amount: amountInCents });
  }, [amountInCents, eligible]);

  if (!eligible) return null;

  return <div ref={containerRef} className="mt-1" />;
}
