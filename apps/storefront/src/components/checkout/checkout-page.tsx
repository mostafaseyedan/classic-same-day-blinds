"use client";
import { Button, CloseButton, Input, Label, SectionPanel, Eyebrow, TaskPageTitle } from "@blinds/ui";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { HttpTypes } from "@medusajs/types";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

import { useStorefront } from "@/components/storefront/storefront-provider";
import { Tag } from "@phosphor-icons/react";
import { InvoiceRequestPanel } from "@/components/checkout/invoice-request-panel";
import { formatPrice } from "@/lib/format-price";
import { getBrowserMedusaClient } from "@/lib/medusa/sdk-browser";
import { getPublicRuntimeConfig } from "@/lib/platform-config";

// ── Stripe payment sub-form ───────────────────────────────────────────────────

type StripePaymentFormProps = {
  clientSecret: string;
  cartId: string;
  total: number;
  currencyCode: string;
  returnUrl: string;
  onSuccess: (orderId: string, email: string, total: number, currency: string) => void;
  onCancel: () => void;
  onSessionInvalid: () => void;
};

function StripePaymentForm({
  clientSecret,
  cartId,
  total,
  currencyCode,
  returnUrl,
  onSuccess,
  onCancel,
  onSessionInvalid,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const sdk = useMemo(() => getBrowserMedusaClient(), []);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay() {
    if (!stripe || !elements) return;

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message ?? "Please complete all payment fields.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const { error: stripeError } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: { return_url: returnUrl },
        // Cards, Apple Pay, Google Pay resolve in-page; BNPL/bank methods redirect.
        redirect: "if_required",
      });

      if (stripeError) {
        const message = stripeError.message ?? "Payment failed.";
        if (stripeError.type === "invalid_request_error") {
          onSessionInvalid();
        }
        setError(message);
        setSubmitting(false);
        return;
      }

      // No redirect occurred — payment confirmed in-page. Complete the Medusa cart.
      if (!sdk) { setError("Medusa SDK not available."); setSubmitting(false); return; }
      const result = await sdk.store.cart.complete(cartId);

      if (result.type === "cart") {
        setError(
          result.error?.message ?? "Cart could not be completed. Contact support if the charge went through.",
        );
        setSubmitting(false);
        return;
      }

      const order = result.order;
      onSuccess(order.id, order.email ?? "", order.total ?? total, order.currency_code ?? currencyCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment error.");
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-6 space-y-4">
      <PaymentElement />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <Button variant="default"
          type="button"
          onClick={() => void handlePay()}
          disabled={submitting || !stripe}

        >
          {submitting ? "Processing..." : `Pay ${formatPrice(total, currencyCode)}`}
        </Button>
        <Button variant="secondary"
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="disabled:opacity-50"
        >
          Back
        </Button>
      </div>
    </div>
  );
}

// ── Main checkout page ────────────────────────────────────────────────────────

type ShippingAddress = {
  first_name: string;
  last_name: string;
  address_1: string;
  city: string;
  province: string;
  postal_code: string;
  country_code: string;
  phone: string;
};

type ShippingOption = { id: string; name: string; amount: number; currency_code: string };
type RawShippingOption = {
  id: string;
  name: string;
  amount?: number | null;
  calculated_price?: { calculated_amount?: number | null; currency_code?: string | null } | null;
};

export function CheckoutPage() {
  const router = useRouter();
  const sdk = useMemo(() => getBrowserMedusaClient(), []);
  const stripePromise = useMemo(
    () => loadStripe(getPublicRuntimeConfig().stripePublishableKey),
    [],
  );
  const { cart, commerceEnabled, updateCartEmail, applyPromoCode, removePromoCode, clearCart } = useStorefront();
  const [email, setEmail] = useState(cart?.email ?? "");
  const [address, setAddress] = useState<ShippingAddress>({
    first_name: "", last_name: "", address_1: "", city: "",
    province: "", postal_code: "", country_code: "us", phone: "",
  });
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [shippingLoading, setShippingLoading] = useState(true);
  const [selectedShippingOption, setSelectedShippingOption] = useState<string>("");
  const [providers, setProviders] = useState<HttpTypes.StorePaymentProvider[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const stripeSessionActive = stripeClientSecret !== null;

  useEffect(() => {
    setEmail(cart?.email ?? "");
  }, [cart?.email]);

  useEffect(() => {
    if (!stripeSessionActive) {
      return;
    }

    setStripeClientSecret(null);
    setStatusMessage("Payment details changed. Re-enter card details to continue.");
  }, [selectedShippingOption, cart?.id, cart?.updated_at]);

  useEffect(() => {
    async function loadProviders() {
      if (!sdk || !cart?.region_id) return;
      try {
        const response = await sdk.store.payment.listPaymentProviders({
          region_id: cart.region_id,
        });
        setProviders(response.payment_providers ?? []);
      } catch (error) {
        console.error("Unable to load payment providers", error);
      }
    }
    void loadProviders();
  }, [sdk, cart?.region_id]);

  useEffect(() => {
    async function loadShippingOptions() {
      if (!sdk || !cart?.id) return;
      setShippingLoading(true);
      try {
        const response = await sdk.store.fulfillment.listCartOptions({ cart_id: cart.id });
        const opts: ShippingOption[] = ((response.shipping_options ?? []) as RawShippingOption[]).map((o) => ({
          id: o.id,
          name: o.name,
          amount: o.calculated_price?.calculated_amount ?? o.amount ?? 0,
          currency_code: o.calculated_price?.currency_code ?? cart.currency_code ?? "usd",
        }));
        setShippingOptions(opts);
        if (opts.length > 0 && !selectedShippingOption) {
          setSelectedShippingOption(opts[0].id);
        }
      } catch (error) {
        console.error("Unable to load shipping options", error);
      } finally {
        setShippingLoading(false);
      }
    }
    void loadShippingOptions();
  }, [sdk, cart?.id]);

  async function handleApplyPromo() {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    setPromoLoading(true);
    setPromoError(null);
    try {
      await applyPromoCode(code);
      setPromoInput("");
    } catch {
      setPromoError("Invalid or expired promo code.");
    } finally {
      setPromoLoading(false);
    }
  }

  async function handleRemovePromo(code: string) {
    setPromoError(null);
    try {
      await removePromoCode(code);
    } catch {
      setPromoError("Failed to remove promo code.");
    }
  }

  async function handleCheckout(providerId: string) {
    if (!sdk || !cart) return;

    if (!selectedShippingOption) {
      setStatusMessage("Please select a shipping method.");
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      if (email.trim().length > 0 && email !== cart.email) {
        await updateCartEmail(email.trim());
      }

      // Set shipping address
      await sdk.store.cart.update(cart.id, {
        shipping_address: {
          first_name: address.first_name || "Customer",
          last_name: address.last_name || "Order",
          address_1: address.address_1 || "123 Main St",
          city: address.city || "Bedford",
          province: address.province || "TX",
          postal_code: address.postal_code || "76021",
          country_code: address.country_code || "us",
          phone: address.phone || "",
        },
      });

      // Add shipping method
      await sdk.store.cart.addShippingMethod(cart.id, {
        option_id: selectedShippingOption,
      });

      const sessionResponse = await sdk.store.payment.initiatePaymentSession(cart, {
        provider_id: providerId,
      });

      // Stripe: collect card info before completing the cart
      if (providerId === "pp_stripe_stripe") {
        const sessions = (sessionResponse as { payment_collection?: { payment_sessions?: Array<{ provider_id?: string; data?: { client_secret?: string } }> } }).payment_collection?.payment_sessions ?? [];
        const session = sessions.find((s) => s.provider_id === providerId);
        const clientSecret = session?.data?.client_secret;

        if (!clientSecret) {
          setStatusMessage("Stripe payment session could not be initialized. Check that Stripe keys are configured.");
          setIsSubmitting(false);
          return;
        }

        setStripeClientSecret(clientSecret);
        setIsSubmitting(false);
        return;
      }

      // Non-Stripe providers: complete immediately
      const result = await sdk.store.cart.complete(cart.id);

      if (result.type === "cart") {
        setStatusMessage(
          result.error?.message ?? "Cart could not be completed yet.",
        );
        return;
      }

      const order = result.order;
      clearCart();
      router.push(buildConfirmUrl(order.id, order.email || email.trim() || cart.email || "", order.total ?? cart.total ?? 0, order.currency_code ?? cart.currency_code ?? "usd"));
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Unable to initialize checkout.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleStripeSuccess(orderId: string, orderEmail: string, orderTotal: number, currency: string) {
    clearCart();
    router.push(buildConfirmUrl(orderId, orderEmail, orderTotal, currency));
  }

  function buildConfirmUrl(orderId: string, orderEmail: string, orderTotal: number, currency: string) {
    const params = new URLSearchParams({
      order_id: orderId,
      email: orderEmail,
      total: String(orderTotal),
      currency: currency.toUpperCase(),
    });
    return `/order-confirmation?${params.toString()}`;
  }

  if (!commerceEnabled) {
    return (
      <SectionPanel as="section" className="px-6 py-10">
        <p className="text-base leading-7 text-slate/72">
          Medusa is not configured in this environment, so checkout handoff cannot start yet.
        </p>
      </SectionPanel>
    );
  }

  if (!cart || (cart.items?.length ?? 0) === 0) {
    return (
      <SectionPanel as="section" className="px-6 py-10">
        <p className="text-base leading-7 text-slate/72">
          Your cart is empty. Add a product variant first to test the checkout handoff flow.
        </p>
      </SectionPanel>
    );
  }

  const total = cart.total ?? 0;
  const discountTotal = (cart as { discount_total?: number }).discount_total ?? 0;
  const subtotal = (cart as { subtotal?: number }).subtotal ?? 0;
  const currencyCode = cart.currency_code?.toUpperCase() ?? "USD";
  const appliedPromoCodes = (
    (cart as { promotions?: Array<{ code?: string }> }).promotions ?? []
  ).map((p) => p.code).filter((c): c is string => Boolean(c));

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
      <SectionPanel className="px-5 py-7 md:px-6">
        <Eyebrow>Checkout</Eyebrow>
        <TaskPageTitle>Complete your order</TaskPageTitle>

        <Label className="mt-7 grid gap-2">
          <span>Email</span>
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={stripeSessionActive}
          />
        </Label>

        <div className="mt-7">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-brass">
            Shipping Address
          </p>
          <div className="mt-3.5 grid gap-3 sm:grid-cols-2">
            <Label className="grid gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate/60">First Name</span>
              <Input type="text" value={address.first_name} onChange={(e) => setAddress((a) => ({ ...a, first_name: e.target.value }))} disabled={stripeSessionActive} />
            </Label>
            <Label className="grid gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate/60">Last Name</span>
              <Input type="text" value={address.last_name} onChange={(e) => setAddress((a) => ({ ...a, last_name: e.target.value }))} disabled={stripeSessionActive} />
            </Label>
            <Label className="grid gap-1.5 sm:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate/60">Street Address</span>
              <Input type="text" value={address.address_1} onChange={(e) => setAddress((a) => ({ ...a, address_1: e.target.value }))} disabled={stripeSessionActive} />
            </Label>
            <Label className="grid gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate/60">City</span>
              <Input type="text" value={address.city} onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))} disabled={stripeSessionActive} />
            </Label>
            <Label className="grid gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate/60">State</span>
              <Input type="text" value={address.province} onChange={(e) => setAddress((a) => ({ ...a, province: e.target.value }))} placeholder="TX" disabled={stripeSessionActive} />
            </Label>
            <Label className="grid gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate/60">ZIP Code</span>
              <Input type="text" value={address.postal_code} onChange={(e) => setAddress((a) => ({ ...a, postal_code: e.target.value }))} disabled={stripeSessionActive} />
            </Label>
            <Label className="grid gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate/60">Phone (optional)</span>
              <Input type="tel" value={address.phone} onChange={(e) => setAddress((a) => ({ ...a, phone: e.target.value }))} disabled={stripeSessionActive} />
            </Label>
          </div>
        </div>

        <div className="mt-7">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-brass">
            Shipping Method
          </p>
          <div className="mt-3.5 grid gap-2">
            {shippingLoading ? (
              <div className="py-3 text-sm text-slate/60">
                Loading shipping options…
              </div>
            ) : shippingOptions.length === 0 ? (
              <div className="py-3 text-sm leading-6 text-slate/60">
                No shipping methods are available for your region. Please configure at least one
                shipping option in Medusa admin under Settings → Locations &amp; Shipping.
              </div>
            ) : (
              shippingOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedShippingOption(opt.id)}
                  disabled={stripeSessionActive}
                  className={`grid grid-cols-[minmax(0,1fr)_5.5rem] items-center gap-4 rounded-media px-2 py-2.5 text-left transition ${selectedShippingOption === opt.id
                      ? "bg-shell/72"
                      : "bg-transparent"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-3.5 w-3.5 shrink-0 rounded-full border ${selectedShippingOption === opt.id ? "border-slate bg-slate" : "border-black/18"
                      }`} />
                    <div>
                      <p className={`text-[0.92rem] ${selectedShippingOption === opt.id ? "font-semibold text-slate" : "font-medium text-slate/86"}`}>
                        {opt.name}
                      </p>
                      <p className="mt-0.5 text-[0.74rem] leading-5 text-slate/52">
                        {opt.amount === 0 ? "Free shipping" : "Standard delivery"}
                      </p>
                    </div>
                  </div>
                  <p className={`text-right text-[0.9rem] ${selectedShippingOption === opt.id ? "font-semibold text-slate" : "font-medium text-slate/74"}`}>
                    {opt.amount === 0 ? "Free" : formatPrice(opt.amount, opt.currency_code)}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="mt-7">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-brass">
            Payment
          </p>
          <div className="mt-3.5 grid gap-2">
            {providers.length === 0 ? (
              <div className="py-4 text-sm leading-6 text-slate/72">
                No payment providers are available yet for this region. Once Stripe is configured in
                Medusa admin, it will appear here.
              </div>
            ) : (
              providers.filter((p) => p.id !== "pp_system_default").map((provider) => {
                const isStripe = provider.id === "pp_stripe_stripe";
                const label = isStripe ? "Pay by Card (Stripe)" : provider.id;

                return (
                  <div key={provider.id}>
                    <div
                      className={`rounded-media px-2 py-3 transition ${isSubmitting || stripeSessionActive
                          ? "opacity-50"
                          : ""
                        } ${stripeClientSecret && isStripe
                          ? "bg-shell/72"
                          : "bg-transparent"
                        }`}
                    >
                      <div className="flex w-full items-center justify-between gap-4">
                        <div>
                          <p className={`text-[0.92rem] ${stripeClientSecret && isStripe ? "font-semibold text-slate" : "font-medium text-slate/86"}`}>{label}</p>
                          <p className="mt-0.5 text-[0.78rem] leading-5 text-slate/56">
                            {isStripe ? "Secure card payment via Stripe" : "Initialize the payment session and attempt order completion."}
                          </p>
                        </div>
                        {!stripeClientSecret && (
                          <Button
                            variant="default"
                            type="button"
                            onClick={() => void handleCheckout(provider.id)}
                            disabled={isSubmitting || stripeSessionActive}
                          >
                            {isSubmitting ? "Working..." : isStripe ? "Enter Card" : "Complete Order"}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Stripe payment form — shown inline after session is initiated */}
                    {isStripe && stripeClientSecret && (
                      <div className="pb-4 pt-1">
                        <Elements
                          key={stripeClientSecret}
                          stripe={stripePromise}
                          options={{
                            clientSecret: stripeClientSecret,
                            appearance: {
                              theme: "stripe",
                              variables: {
                                colorPrimary: "#182422",
                                colorBackground: "#ffffff",
                                colorText: "#182422",
                                colorDanger: "#b45309",
                                fontFamily: "inherit",
                                borderRadius: "8px",
                              },
                            },
                          }}
                        >
                          <StripePaymentForm
                            clientSecret={stripeClientSecret}
                            cartId={cart.id}
                            total={total}
                            currencyCode={currencyCode}
                            returnUrl={`${window.location.origin}/checkout/return?cart_id=${encodeURIComponent(cart.id)}`}
                            onSuccess={handleStripeSuccess}
                            onCancel={() => setStripeClientSecret(null)}
                            onSessionInvalid={() => {
                              setStripeClientSecret(null);
                              setStatusMessage("Your payment session expired. Please enter your card details again.");
                            }}
                          />
                        </Elements>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {statusMessage ? <p className="mt-6 text-sm leading-6 text-olive">{statusMessage}</p> : null}

        <InvoiceRequestPanel cartId={cart.id} email={email.trim() || cart.email || ""} />
      </SectionPanel>

      <SectionPanel as="aside" className="px-5 py-7 md:px-6">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-brass">Order Summary</p>
        <div className="mt-5 divide-y divide-black/6">
          {cart.items?.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-slate">
                  {item.product_title ?? item.title ?? "Cart Item"}
                </p>
                <p className="mt-1 text-sm text-slate/68">Qty {item.quantity}</p>
              </div>
              <p className="text-sm font-semibold text-slate">
                {formatPrice(item.total ?? 0, currencyCode)}
              </p>
            </div>
          ))}
        </div>

        {/* Promo code input */}
        <div className="mt-6 pt-4">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-brass">Promo Code</p>

          {appliedPromoCodes.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {appliedPromoCodes.map((code) => (
                <span
                  key={code}
                  className="inline-flex items-center gap-1.5 rounded-media border border-olive/12 bg-olive/8 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-olive"
                >
                  <Tag className="h-3 w-3" />
                  {code}
                  <CloseButton
                    onClick={() => void handleRemovePromo(code)}
                    variant="ghost"
                    size="sm"
                    className="ml-0.5 text-olive/60"
                    aria-label={`Remove ${code}`}
                  />
                </span>
              ))}
            </div>
          )}

          <div className="mt-3 flex gap-2">
            <Input
              type="text"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") void handleApplyPromo(); }}
              placeholder="Enter code"
              disabled={stripeSessionActive}
            />
            <Button variant="default"
              onClick={() => void handleApplyPromo()}
              disabled={stripeSessionActive || promoLoading || !promoInput.trim()}
            >
              {promoLoading ? "..." : "Apply"}
            </Button>
          </div>

          {promoError && <p className="mt-2 text-xs text-red-600">{promoError}</p>}
        </div>

        {/* Totals */}
        <div className="mt-5 space-y-2 border-t border-black/6 pt-4">
          {subtotal > 0 && (
            <div className="flex items-center justify-between text-sm text-slate/68">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal, currencyCode)}</span>
            </div>
          )}
          {discountTotal > 0 && (
            <div className="flex items-center justify-between text-sm font-semibold text-olive">
              <span>Discount</span>
              <span>−{formatPrice(discountTotal, currencyCode)}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-lg font-semibold text-slate">
            <span>Total</span>
            <span>{formatPrice(total, currencyCode)}</span>
          </div>
        </div>
      </SectionPanel>
    </section>
  );
}
