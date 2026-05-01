"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SectionPanel } from "@blinds/ui";
import { Eyebrow } from "@blinds/ui";

import { getBrowserMedusaClient } from "@/lib/medusa/sdk-browser";
import { useStorefront } from "@/components/storefront/storefront-provider";

type ReturnState =
  | { phase: "loading" }
  | { phase: "error"; message: string }
  | { phase: "already_completed" }
  | { phase: "redirecting" };

function ReturnStatusPanel({
  eyebrow,
  children,
}: {
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <main className="page-section pb-20 pt-10">
      <div className="content-shell max-w-3xl">
        <SectionPanel className="px-6 py-10">
          <Eyebrow>{eyebrow}</Eyebrow>
          {children}
        </SectionPanel>
      </div>
    </main>
  );
}

function CheckoutReturnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useStorefront();
  const [state, setState] = useState<ReturnState>({ phase: "loading" });
  // Guard against React StrictMode double-invoke in development
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    async function handleReturn() {
      const cartId = searchParams.get("cart_id");
      const redirectStatus = searchParams.get("redirect_status");

      // Stripe signals a failed or cancelled payment
      if (
        redirectStatus &&
        redirectStatus !== "succeeded" &&
        redirectStatus !== "processing"
      ) {
        setState({
          phase: "error",
          message:
            redirectStatus === "failed"
              ? "Your payment was declined. Please go back and try a different payment method."
              : "The payment could not be completed. Please return to checkout and try again.",
        });
        return;
      }

      if (!cartId) {
        setState({
          phase: "error",
          message: "Missing cart reference. Please return to checkout.",
        });
        return;
      }

      const sdk = getBrowserMedusaClient();

      if (!sdk) {
        setState({
          phase: "error",
          message: "Commerce is not configured in this environment.",
        });
        return;
      }

      try {
        const result = await sdk.store.cart.complete(cartId);

        if (result.type === "cart") {
          const errorMessage = result.error?.message ?? "";
          // Idempotent double-visit: cart was already completed on a previous attempt
          if (
            errorMessage.toLowerCase().includes("already") ||
            errorMessage.toLowerCase().includes("completed")
          ) {
            setState({ phase: "already_completed" });
            return;
          }

          setState({
            phase: "error",
            message:
              errorMessage ||
              "Your payment was received but the order could not be created. Please contact support — do not pay again.",
          });
          return;
        }

        // Success — clear local cart state and navigate to confirmation
        const order = result.order;
        clearCart();

        const confirmParams = new URLSearchParams({
          order_id: order.id,
          email: order.email ?? "",
          total: String(order.total ?? 0),
          currency: (order.currency_code ?? "usd").toUpperCase(),
        });

        setState({ phase: "redirecting" });
        router.replace(`/order-confirmation?${confirmParams.toString()}`);
      } catch (err) {
        setState({
          phase: "error",
          message:
            err instanceof Error
              ? err.message
              : "An unexpected error occurred. If you were charged, please contact support.",
        });
      }
    }

    void handleReturn();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (state.phase === "loading" || state.phase === "redirecting") {
    return (
      <ReturnStatusPanel eyebrow="Processing payment">
        <p className="mt-4 text-base leading-7 text-slate/72">
          Confirming your payment and creating your order. Please do not close this tab.
        </p>
        <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-black/8">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-brass" />
        </div>
      </ReturnStatusPanel>
    );
  }

  if (state.phase === "already_completed") {
    return (
      <ReturnStatusPanel eyebrow="Order already placed">
        <p className="mt-4 text-base leading-7 text-slate/72">
          This order has already been confirmed. Check your email for your order confirmation.
        </p>
      </ReturnStatusPanel>
    );
  }

  // phase === "error"
  return (
    <ReturnStatusPanel eyebrow="Payment issue">
      <p className="mt-4 text-base font-semibold text-slate">Something went wrong.</p>
      <p className="mt-2 text-base leading-7 text-slate/72">{state.message}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href="/checkout"
          className="inline-flex items-center rounded-lg bg-slate px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate/90"
        >
          Return to checkout
        </a>
        <a
          href="/contact"
          className="inline-flex items-center rounded-lg border border-black/12 bg-white px-5 py-2.5 text-sm font-semibold text-slate transition hover:bg-shell"
        >
          Contact support
        </a>
      </div>
    </ReturnStatusPanel>
  );
}

export default function CheckoutReturnPage() {
  return (
    <Suspense
      fallback={
        <ReturnStatusPanel eyebrow="Processing payment">
          <p className="mt-4 text-base leading-7 text-slate/72">
            Confirming your payment and creating your order. Please do not close this tab.
          </p>
          <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-black/8">
            <div className="h-full w-1/3 animate-pulse rounded-full bg-brass" />
          </div>
        </ReturnStatusPanel>
      }
    >
      <CheckoutReturnContent />
    </Suspense>
  );
}
