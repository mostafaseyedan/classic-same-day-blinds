"use client";

import { Button, CloseButton, Input, cn } from "@blinds/ui";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { Check, Copy, Phone, Ticket } from "@phosphor-icons/react";
import { useEffect, useMemo, useRef, useState } from "react";

import { useStorefront } from "@/components/storefront/storefront-provider";
import { formatPrice } from "@/lib/format-price";
import {
  getSignupPromotion,
  issueSignupPromotionLead,
  type SignupPromotion,
} from "@/lib/medusa/signup-promo";

const PROMO_PLACEMENT = "discount-signup-modal";
const OPEN_DELAY_MS = 4500;
const DISMISS_COOLDOWN_MS = 1000 * 60 * 60 * 24 * 7;
const DISMISS_KEY_PREFIX = "blinds_signup_promo_dismissed_until";
const CLAIMED_KEY_PREFIX = "blinds_signup_promo_claimed";
const EXCLUDED_PATH_PREFIXES = [
  "/account",
  "/auth",
  "/checkout",
  "/forgot-password",
  "/order-confirmation",
  "/orders",
  "/reset-password",
  "/track-order",
];

function getDismissKey(code: string) {
  return `${DISMISS_KEY_PREFIX}:${code}`;
}

function getClaimedKey(code: string) {
  return `${CLAIMED_KEY_PREFIX}:${code}`;
}

function readTimestamp(key: string) {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(key);

  if (!rawValue) {
    return null;
  }

  const parsed = Number(rawValue);
  return Number.isFinite(parsed) ? parsed : null;
}

function rememberDismissal(code: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(getDismissKey(code), String(Date.now() + DISMISS_COOLDOWN_MS));
}

function rememberClaim(code: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(getClaimedKey(code), "true");
  window.localStorage.removeItem(getDismissKey(code));
}

function formatUsPhoneInput(value: string) {
  const digits = value.replace(/[^\d]/g, "").replace(/^1/, "").slice(0, 10);

  if (digits.length <= 3) {
    return digits;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  }

  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function getUsPhoneDigits(value: string) {
  return value.replace(/[^\d]/g, "").replace(/^1/, "").slice(0, 10);
}

function isExcludedPath(pathname: string) {
  return EXCLUDED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function getOfferValueLabel(promotion: SignupPromotion) {
  if (promotion.discountType === "percentage") {
    return `${promotion.discountValue}% off`;
  }

  return `${formatPrice(promotion.discountValue, promotion.currencyCode ?? "usd")} off`;
}

function getInitialHeadline(promotion: SignupPromotion, offerValueLabel: string) {
  const normalizedHeadline = promotion.headline.trim();

  if (!normalizedHeadline) {
    return `Get ${offerValueLabel} Your First Order`;
  }

  if (/discount/i.test(normalizedHeadline) || !/\d|%|\$/.test(normalizedHeadline)) {
    return `Get ${offerValueLabel} Your First Order`;
  }

  return normalizedHeadline;
}

export function SignupPromoPopup() {
  const pathname = usePathname();
  const {
    applyPromoCode,
    cart,
    commerceEnabled,
    isReady,
    updateCartEmail,
  } = useStorefront();
  const [mounted, setMounted] = useState(false);
  const [promotion, setPromotion] = useState<SignupPromotion | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [step, setStep] = useState<"email" | "phone" | "success">("email");
  const [copied, setCopied] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const previousBodyOverflowRef = useRef<string>("");

  const activePromoCodes = useMemo(
    () =>
    (((cart as { promotions?: Array<{ code?: string }> } | null)?.promotions ?? [])
      .map((promotionEntry) => promotionEntry.code?.trim())
      .filter((value): value is string => Boolean(value))),
    [cart],
  );

  const hasPromotionApplied = Boolean(
    promotion && activePromoCodes.includes(promotion.code),
  );
  const shouldSkipRoute = isExcludedPath(pathname);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!mounted || !commerceEnabled || shouldSkipRoute) {
      setPromotion(null);
      setIsOpen(false);
      return;
    }

    let cancelled = false;

    async function loadPromotion() {
      setIsFetching(true);

      try {
        const nextPromotion = await getSignupPromotion(PROMO_PLACEMENT);

        if (!cancelled) {
          setPromotion(nextPromotion);
        }
      } catch {
        if (!cancelled) {
          setPromotion(null);
        }
      } finally {
        if (!cancelled) {
          setIsFetching(false);
        }
      }
    }

    void loadPromotion();

    return () => {
      cancelled = true;
    };
  }, [commerceEnabled, mounted, shouldSkipRoute]);

  useEffect(() => {
    if (!mounted || !promotion || shouldSkipRoute || isFetching) {
      return;
    }

    if (hasPromotionApplied) {
      setIsOpen(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setIsOpen(true);
    }, OPEN_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [hasPromotionApplied, isFetching, mounted, promotion, shouldSkipRoute]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (promotion && !isSuccess) {
          rememberDismissal(promotion.code);
        }

        setIsOpen(false);
        setError(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    previousBodyOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousBodyOverflowRef.current;
    };
  }, [isOpen, isSuccess, promotion]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (step === "success") {
      closeButtonRef.current?.focus();
      return;
    }

    if (step === "phone") {
      phoneInputRef.current?.focus();
      return;
    }

    emailInputRef.current?.focus();
  }, [isOpen, step]);

  useEffect(() => {
    if (!promotion || !hasPromotionApplied) {
      return;
    }

    setIsOpen(false);
  }, [hasPromotionApplied, promotion]);

  function closePopup(shouldPersistDismissal = true) {
    if (promotion && shouldPersistDismissal && !isSuccess) {
      rememberDismissal(promotion.code);
    }

    setIsOpen(false);
    setError(null);
    setStep("email");
    setPhone("");
    setCopied(false);
  }

  async function handleEmailSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextEmail = email.trim();

    if (!nextEmail) {
      setError("Enter your email to continue.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(nextEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    setError(null);
    setStep("phone");
  }

  async function handlePhoneSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!promotion) {
      return;
    }

    const nextEmail = email.trim();
    const nextPhone = phone.trim();

    if (getUsPhoneDigits(nextPhone).length < 10) {
      setError("Enter a valid phone number.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await issueSignupPromotionLead(nextEmail, nextPhone);

      if (isReady) {
        await updateCartEmail(nextEmail);

        if (!activePromoCodes.includes(promotion.code)) {
          await applyPromoCode(promotion.code);
        }
      }

      rememberClaim(promotion.code);
      setIsSuccess(true);
      setStep("success");
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Unable to unlock the current offer.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCopyCode() {
    if (!promotion) {
      return;
    }

    try {
      await navigator.clipboard.writeText(promotion.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  if (!mounted || !promotion || !isOpen) {
    return null;
  }

  const offerValueLabel = getOfferValueLabel(promotion);
  const cartTotal =
    ((cart as { total?: number } | null)?.total ??
      (cart as { subtotal?: number } | null)?.subtotal ??
      0);
  const unlockedAmount =
    promotion.discountType === "percentage"
      ? cartTotal > 0
        ? (cartTotal * promotion.discountValue) / 100
        : null
      : promotion.discountValue;
  const unlockedHeadline =
    promotion.discountType === "percentage"
      ? unlockedAmount && unlockedAmount > 0
        ? `You've unlocked ${promotion.discountValue}% (${formatPrice(unlockedAmount, promotion.currencyCode ?? "usd")}) Off!`
        : `You've unlocked ${promotion.discountValue}% Off!`
      : `You've unlocked ${formatPrice(promotion.discountValue, promotion.currencyCode ?? "usd")} Off!`;
  const initialHeadline = getInitialHeadline(promotion, offerValueLabel);

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-[rgba(16,24,30,0.56)] backdrop-blur-[2px]"
        onClick={() => closePopup()}
        aria-label="Dismiss offer"
      />

      <div
        className="dialog-shell relative z-10 w-full max-w-[61rem] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="signup-promo-title"
      >
        <CloseButton
          ref={closeButtonRef}
          onClick={() => closePopup()}
          magnetic
          className="absolute right-4 top-4 z-20"
        />

        <div className="grid md:grid-cols-[1.02fr_0.98fr]">
          <div className="relative min-h-[15.5rem] overflow-hidden bg-bone md:min-h-[35rem]">
            <Image
              src="/images/products/faux-wood-blinds-2-inch.jpg"
              alt="Sunlit faux wood blinds in a bright room"
              fill
              sizes="(max-width: 767px) 100vw, 50vw"
              className="object-cover object-center"
              priority
            />
            <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(247,242,231,0.06),rgba(23,35,43,0.16))]" />
            <div className="absolute inset-x-4 bottom-4 sm:inset-x-6 sm:bottom-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/24 bg-[rgba(24,36,34,0.34)] px-3 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-md">
                <Ticket className="h-3.5 w-3.5" weight="bold" />
                {offerValueLabel}
              </div>
            </div>
          </div>

          <div className="bg-[linear-gradient(180deg,rgba(247,242,231,0.82),rgba(247,242,231,0.96))] px-6 py-8 sm:px-8 sm:py-9 md:px-10 md:py-12">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-brass">
              Classic Same Day Blinds
            </p>

            <h2
              id="signup-promo-title"
              className="mt-6 max-w-[13ch] font-display text-[2.55rem] font-semibold leading-[0.94] tracking-tight text-slate sm:text-[3rem]"
            >
              {step === "success" ? unlockedHeadline : initialHeadline}
            </h2>

            <p className="mt-6 max-w-[30rem] text-[0.97rem] leading-7 text-slate/70">
              {step === "success"
                ? hasPromotionApplied
                  ? "Your offer is unlocked and has been added to this cart. Keep the code handy for checkout if you switch devices."
                  : "Your offer is unlocked. Copy the code below and use it at checkout whenever you are ready."
                : step === "phone"
                  ? "One last step. Add your phone number so we can finish unlocking this offer."
                  : promotion.subcopy}
            </p>

            {step === "success" ? (
              <div className="mt-8 space-y-4">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="block w-full text-left"
                  aria-label={copied ? "Promo code copied" : "Copy promo code"}
                >
                  <div className="flex h-11 flex-1 items-center rounded-full border border-black/10 bg-white px-4 transition hover:border-brass hover:bg-white">
                    <span className={cn("shrink-0 transition-colors", copied ? "text-olive" : "text-slate/38")}>
                      {copied ? (
                        <Check className="h-4 w-4" weight="bold" />
                      ) : (
                        <Copy className="h-4 w-4" weight="regular" />
                      )}
                    </span>
                    <input
                      id="signup-promo-code"
                      readOnly
                      value={promotion.code}
                      className="w-full cursor-pointer bg-transparent px-3 text-center text-[0.98rem] font-semibold tracking-[0.08em] text-slate outline-none"
                    />
                    <span
                      className={cn(
                        "min-w-[3.4rem] shrink-0 text-right text-[0.72rem] font-semibold uppercase tracking-[0.14em] transition-colors",
                        copied ? "text-olive" : "text-slate/42",
                      )}
                    >
                      {copied ? "Copied" : "Copy"}
                    </span>
                  </div>
                </button>

                <p className="text-sm leading-6 text-slate/66">
                  {hasPromotionApplied
                    ? "This offer has already been attached to the current cart."
                    : "Use this code at checkout to redeem the unlocked savings."}
                </p>

                <Button
                  type="button"
                  variant="default"
                  className="w-full justify-center"
                  onClick={() => closePopup(false)}
                >
                  Keep shopping
                </Button>
              </div>
            ) : step === "phone" ? (
              <form className="mt-8" onSubmit={handlePhoneSubmit}>
                <label
                  htmlFor="signup-promo-phone"
                  className="block text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate/54"
                >
                  Phone number
                </label>
                <div className="relative mt-2">
                  <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate/38" />
                  <Input
                    ref={phoneInputRef}
                    id="signup-promo-phone"
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(formatUsPhoneInput(event.target.value))}
                    placeholder="(817) 555-0100"
                    autoComplete="tel-national"
                    inputMode="numeric"
                    maxLength={14}
                    error={error ?? undefined}
                    className={cn(
                      "h-12 rounded-full border-black/11 bg-white/92 pl-11 pr-4 text-[0.96rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]",
                      error ? "" : "focus:border-brass",
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  variant="default"
                  className="mt-4 w-full justify-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Unlocking offer..." : "Unlock My Discount"}
                </Button>

                <button
                  type="button"
                  className="mt-3 text-sm text-slate/58 transition hover:text-olive"
                  onClick={() => {
                    setError(null);
                    setStep("email");
                  }}
                >
                  Use a different email
                </button>
              </form>
            ) : (
              <form className="mt-14" onSubmit={handleEmailSubmit}>
                <label
                  htmlFor="signup-promo-email"
                  className="block text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate/54"
                >
                  Email address
                </label>
                <div className="mt-2">
                  <Input
                    ref={emailInputRef}
                    id="signup-promo-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    error={error ?? undefined}
                    className={cn(
                      "h-12 rounded-full border-black/11 bg-white/92 px-4 text-[0.96rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]",
                      error ? "" : "focus:border-brass",
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  variant="default"
                  className="mt-4 w-full justify-center"
                >
                  Continue
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
