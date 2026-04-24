"use client";
import { Button } from "@blinds/ui";

import { FormEvent, useMemo, useState } from "react";
import { CardElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import type { CustomerPaymentSetupIntentResponse } from "@blinds/types";

const CUSTOMER_JWT_STORAGE_KEY = "blinds_storefront_customer_jwt";

type PaymentMethodSetupFormProps = {
  opsApiBaseUrl: string;
  stripePublishableKey: string;
  customerEmail: string;
  enabled: boolean;
  onSaved: () => void;
  onError: (message: string | null) => void;
};

type PaymentMethodSetupFieldsProps = {
  opsApiBaseUrl: string;
  customerEmail: string;
  onSaved: () => void;
  onError: (message: string | null) => void;
};

const cardElementOptions = {
  style: {
    base: {
      color: "#182422",
      fontSize: "16px",
      fontFamily: "inherit",
      "::placeholder": {
        color: "rgba(24, 36, 34, 0.45)",
      },
    },
    invalid: {
      color: "#b45309",
    },
  },
};

async function createSetupIntent(
  opsApiBaseUrl: string,
  token: string,
): Promise<CustomerPaymentSetupIntentResponse> {
  const response = await fetch(`${opsApiBaseUrl}/api/v1/customer/payment-methods/setup-intent`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Unable to start card setup (${response.status})`);
  }

  return (await response.json()) as CustomerPaymentSetupIntentResponse;
}

function PaymentMethodSetupFields({
  opsApiBaseUrl,
  customerEmail,
  onSaved,
  onError,
}: PaymentMethodSetupFieldsProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onError(null);
    setStatusMessage(null);

    const token =
      typeof window === "undefined" ? null : window.localStorage.getItem(CUSTOMER_JWT_STORAGE_KEY);

    if (!token) {
      onError("Customer session token is missing for Stripe card setup.");
      return;
    }

    if (!stripe || !elements) {
      onError("Stripe Elements is not ready yet.");
      return;
    }

    const card = elements.getElement(CardElement);

    if (!card) {
      onError("Card form is not ready yet.");
      return;
    }

    setIsSubmitting(true);

    try {
      const setupIntent = await createSetupIntent(opsApiBaseUrl, token);

      if (!setupIntent.clientSecret) {
        throw new Error("Stripe setup intent did not return a client secret.");
      }

      const result = await stripe.confirmCardSetup(setupIntent.clientSecret, {
        payment_method: {
          card,
          billing_details: {
            email: customerEmail,
          },
        },
      });

      if (result.error) {
        throw new Error(result.error.message ?? "Card setup failed.");
      }

      setStatusMessage("Card saved successfully.");
      onSaved();
    } catch (error) {
      onError(error instanceof Error ? error.message : "Unable to save card.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 grid gap-4">
      <div className="min-h-11 rounded-full border border-black/12 bg-shell/78 px-4 py-[13px] text-[0.92rem] text-slate transition-colors focus-within:border-brass focus-within:bg-white">
        <div className="w-full">
          <CardElement options={cardElementOptions} />
        </div>
      </div>
      <Button
        variant="default"
        size="compact"
        type="submit"
        disabled={isSubmitting || !stripe || !elements}
        className="justify-self-start self-start disabled:opacity-60"
      >
        {isSubmitting ? "Saving card..." : "Add card"}
      </Button>
      {statusMessage ? <p className="text-sm leading-6 text-olive">{statusMessage}</p> : null}
    </form>
  );
}

export function PaymentMethodSetupForm({
  opsApiBaseUrl,
  stripePublishableKey,
  customerEmail,
  enabled,
  onSaved,
  onError,
}: PaymentMethodSetupFormProps) {
  const stripePromise = useMemo(() => loadStripe(stripePublishableKey), [stripePublishableKey]);

  if (!enabled) {
    return (
      <p className="mt-4 text-sm leading-6 text-slate/68">
        Add-card flow is disabled until the Stripe publishable key is available in the storefront
        environment.
      </p>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <PaymentMethodSetupFields
        opsApiBaseUrl={opsApiBaseUrl}
        customerEmail={customerEmail}
        onSaved={onSaved}
        onError={onError}
      />
    </Elements>
  );
}
