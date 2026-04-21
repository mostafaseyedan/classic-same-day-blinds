"use client";
import { Badge } from "@blinds/ui";
import { Breadcrumbs } from "@blinds/ui";
import { Button } from "@blinds/ui";
import { Input } from "@blinds/ui";
import { Label } from "@blinds/ui";
import { SectionPanel, SurfaceInset, SurfaceMuted } from "@blinds/ui";
import { PageCopy, PageTitle } from "@blinds/ui";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { CustomerPaymentMethodSummary, CustomerPaymentMethodsResponse } from "@blinds/types";

import { PaymentMethodSetupForm } from "@/components/customer/payment-method-setup-form";
import { useCustomer } from "@/components/customer/customer-provider";
import { getPublicRuntimeConfig } from "@/lib/platform-config";

type PlatformCapabilities = {
  stripeConfigured: boolean;
  resendConfigured: boolean;
  savedPaymentMethodsEnabled: boolean;
  emailNotificationsEnabled: boolean;
};

const initialAddress = {
  first_name: "",
  last_name: "",
  address_1: "",
  company: "",
  city: "",
  province: "",
  postal_code: "",
  country_code: "us",
  phone: "",
};

const CUSTOMER_JWT_STORAGE_KEY = "blinds_storefront_customer_jwt";

export default function AccountPage() {
  const {
    isLoading,
    isAuthenticated,
    customer,
    addresses,
    requests,
    updateProfile,
    addAddress,
    deleteAddress,
    error,
  } = useCustomer();
  const [profileForm, setProfileForm] = useState({
    first_name: customer?.first_name ?? "",
    last_name: customer?.last_name ?? "",
    phone: customer?.phone ?? "",
    company_name: String(customer?.metadata?.company_name ?? ""),
  });
  const [addressForm, setAddressForm] = useState(initialAddress);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [capabilities, setCapabilities] = useState<PlatformCapabilities | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<CustomerPaymentMethodSummary[]>([]);
  const [paymentMethodsError, setPaymentMethodsError] = useState<string | null>(null);
  const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] = useState(false);
  const [isRemovingPaymentMethod, setIsRemovingPaymentMethod] = useState<string | null>(null);
  const [paymentMethodsRefreshKey, setPaymentMethodsRefreshKey] = useState(0);

  useEffect(() => {
    const config = getPublicRuntimeConfig();

    if (!config.opsApiBaseUrl) {
      return;
    }

    void (async () => {
      try {
        const response = await fetch(`${config.opsApiBaseUrl}/api/v1/platform/capabilities`);

        if (!response.ok) {
          return;
        }

        setCapabilities((await response.json()) as PlatformCapabilities);
      } catch {
        // Keep account page usable even if capabilities endpoint is temporarily unavailable.
      }
    })();
  }, []);

  useEffect(() => {
    setProfileForm({
      first_name: customer?.first_name ?? "",
      last_name: customer?.last_name ?? "",
      phone: customer?.phone ?? "",
      company_name: String(customer?.metadata?.company_name ?? ""),
    });
  }, [customer]);

  useEffect(() => {
    const config = getPublicRuntimeConfig();

    async function loadPaymentMethods() {
      if (
        !config.opsApiBaseUrl ||
        !isAuthenticated ||
        !customer?.email ||
        !capabilities?.savedPaymentMethodsEnabled
      ) {
        setPaymentMethods([]);
        setPaymentMethodsError(null);
        return;
      }

      const token =
        typeof window === "undefined"
          ? null
          : window.localStorage.getItem(CUSTOMER_JWT_STORAGE_KEY);

      if (!token) {
        setPaymentMethods([]);
        setPaymentMethodsError("Customer session token is missing for saved-card lookup.");
        return;
      }

      setIsLoadingPaymentMethods(true);
      setPaymentMethodsError(null);

      try {
        const response = await fetch(`${config.opsApiBaseUrl}/api/v1/customer/payment-methods`, {
          headers: {
            authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Unable to load saved payment methods (${response.status})`);
        }

        const payload = (await response.json()) as CustomerPaymentMethodsResponse;
        setPaymentMethods(payload.paymentMethods ?? []);
      } catch (error) {
        setPaymentMethods([]);
        setPaymentMethodsError(
          error instanceof Error ? error.message : "Unable to load saved payment methods.",
        );
      } finally {
        setIsLoadingPaymentMethods(false);
      }
    }

    void loadPaymentMethods();
  }, [
    capabilities?.savedPaymentMethodsEnabled,
    customer?.email,
    isAuthenticated,
    paymentMethodsRefreshKey,
  ]);

  async function handleRemovePaymentMethod(paymentMethodId: string) {
    const config = getPublicRuntimeConfig();
    const token =
      typeof window === "undefined" ? null : window.localStorage.getItem(CUSTOMER_JWT_STORAGE_KEY);

    if (!config.opsApiBaseUrl || !token) {
      setPaymentMethodsError("Saved payment methods are not available in this environment.");
      return;
    }

    setIsRemovingPaymentMethod(paymentMethodId);
    setPaymentMethodsError(null);

    try {
      const response = await fetch(
        `${config.opsApiBaseUrl}/api/v1/customer/payment-methods/${encodeURIComponent(paymentMethodId)}`,
        {
          method: "DELETE",
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Unable to remove payment method (${response.status})`);
      }

      const payload = (await response.json()) as CustomerPaymentMethodsResponse;
      setPaymentMethods(payload.paymentMethods ?? []);
      setStatusMessage("Saved payment method removed.");
    } catch (error) {
      setPaymentMethodsError(
        error instanceof Error ? error.message : "Unable to remove payment method.",
      );
    } finally {
      setIsRemovingPaymentMethod(null);
    }
  }

  async function handleProfileSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    try {
      await updateProfile({
        first_name: profileForm.first_name,
        last_name: profileForm.last_name,
        phone: profileForm.phone,
        company_name: profileForm.company_name,
      });
      setStatusMessage("Customer profile updated.");
    } catch (saveError) {
      setStatusMessage(saveError instanceof Error ? saveError.message : "Unable to update profile.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAddressCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    try {
      await addAddress(addressForm);
      setAddressForm(initialAddress);
      setStatusMessage("Address saved to your customer account.");
    } catch (saveError) {
      setStatusMessage(saveError instanceof Error ? saveError.message : "Unable to save address.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteAddress(addressId: string) {
    setIsSaving(true);
    setStatusMessage(null);

    try {
      await deleteAddress(addressId);
      setStatusMessage("Address removed.");
    } catch (deleteError) {
      setStatusMessage(
        deleteError instanceof Error ? deleteError.message : "Unable to delete address.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="page-section pb-20 pt-10">
      <div className="content-shell max-w-6xl">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Account" },
          ]}
        />
        <SectionPanel as="section" className="px-6 py-10 md:px-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-olive">
                Customer Account
              </p>
              <PageTitle>
                Your account
              </PageTitle>
              <PageCopy className="max-w-3xl text-base leading-7 text-slate/72">
                Manage your profile, saved addresses, and payment methods. Quote and invoice requests
                submitted under your email are also tracked here.
              </PageCopy>
            </div>
            <Button asChild variant="default">
              <Link
                href={isAuthenticated ? "/orders" : "/auth"}
              >
                {isAuthenticated ? "View orders" : "Sign in"}
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <SurfaceMuted className="mt-8 px-5 py-5 text-sm text-slate/72">
              Loading account...
            </SurfaceMuted>
          ) : !isAuthenticated || !customer ? (
            <SurfaceMuted className="mt-8 border-dashed px-5 py-6">
              <p className="text-sm font-semibold text-slate">No active customer session</p>
              <p className="mt-2 text-sm leading-6 text-slate/72">
                Sign in to manage addresses, view orders, and submit invoice requests against your
                account.
              </p>
            </SurfaceMuted>
          ) : (
            <>
              <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
                <form
                  onSubmit={handleProfileSave}
                  className=""
                >
                  <SurfaceMuted className="px-5 py-5">
                  <p className="text-lg font-semibold text-slate">Profile</p>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <Label className="grid gap-2">
                      <span>First name</span>
                      <Input
                        type="text"
                        value={profileForm.first_name}
                        onChange={(event) =>
                          setProfileForm((current) => ({
                            ...current,
                            first_name: event.target.value,
                          }))
                        }
                      />
                    </Label>
                    <Label className="grid gap-2">
                      <span>Last name</span>
                      <Input
                        type="text"
                        value={profileForm.last_name}
                        onChange={(event) =>
                          setProfileForm((current) => ({
                            ...current,
                            last_name: event.target.value,
                          }))
                        }
                      />
                    </Label>
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <Label className="grid gap-2">
                      <span>Email</span>
                      <Input
                        type="email"
                        value={customer.email}
                        disabled
                        className="text-slate/60"
                      />
                    </Label>
                    <Label className="grid gap-2">
                      <span>Phone</span>
                      <Input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(event) =>
                          setProfileForm((current) => ({
                            ...current,
                            phone: event.target.value,
                          }))
                        }
                      />
                    </Label>
                  </div>
                  <Label className="mt-4 grid gap-2">
                    <span>Company</span>
                    <Input
                      type="text"
                      value={profileForm.company_name}
                      onChange={(event) =>
                        setProfileForm((current) => ({
                          ...current,
                          company_name: event.target.value,
                        }))
                      }
                    />
                  </Label>
                  <Button
                    type="submit"
                    disabled={isSaving}
                    variant="default"
                    className="mt-5"
                  >
                    {isSaving ? "Saving..." : "Save profile"}
                  </Button>
                  </SurfaceMuted>
                </form>

                <SurfaceMuted as="section" className="px-5 py-5">
                  <p className="text-lg font-semibold text-slate">Saved payment methods</p>
                  <p className="mt-3 text-sm leading-6 text-slate/72">
                    Payment methods are wired to backend capability state. No cards are stored in
                    the browser.
                  </p>
                  <SurfaceInset className="mt-5 px-4 py-4 text-sm text-slate/68">
                    {!capabilities?.savedPaymentMethodsEnabled ? (
                      "Stripe customer payment methods are not enabled in this environment yet."
                    ) : isLoadingPaymentMethods ? (
                      "Loading saved cards from Stripe..."
                    ) : paymentMethods.length > 0 ? (
                      <div className="grid gap-3">
                        {paymentMethods.map((method) => (
                          <SurfaceInset
                            key={method.id}
                            className="flex items-center justify-between gap-4 px-4 py-4"
                          >
                            <div>
                              <p className="text-sm font-semibold text-slate">
                                {method.brand.toUpperCase()} ending in {method.last4}
                              </p>
                              <p className="mt-1 text-xs text-slate/60">
                                Expires {String(method.expMonth).padStart(2, "0")}/{method.expYear}
                                {method.isDefault ? " · Default" : ""}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() => void handleRemovePaymentMethod(method.id)}
                              disabled={isRemovingPaymentMethod === method.id}
                              className="px-4 py-2 text-xs hover:border-red-400 hover:text-red-700"
                            >
                              {isRemovingPaymentMethod === method.id ? "Removing..." : "Remove"}
                            </Button>
                          </SurfaceInset>
                        ))}
                      </div>
                    ) : (
                      "No saved cards were found for this customer in Stripe yet."
                    )}
                  </SurfaceInset>
                  {capabilities?.savedPaymentMethodsEnabled && customer.email ? (
                    <PaymentMethodSetupForm
                      opsApiBaseUrl={getPublicRuntimeConfig().opsApiBaseUrl}
                      stripePublishableKey={getPublicRuntimeConfig().stripePublishableKey}
                      customerEmail={customer.email}
                      enabled={Boolean(getPublicRuntimeConfig().stripePublishableKey)}
                      onSaved={() => {
                        setStatusMessage("Saved payment method added.");
                        setPaymentMethodsRefreshKey((current) => current + 1);
                      }}
                      onError={setPaymentMethodsError}
                    />
                  ) : null}
                  <SurfaceInset className="mt-4 px-4 py-4 text-sm text-slate/68">
                    Email notifications:{" "}
                    {capabilities?.emailNotificationsEnabled
                      ? capabilities.resendConfigured
                        ? "delivery provider configured"
                        : "queue active, provider key still missing"
                      : "disabled"}
                  </SurfaceInset>
                  {paymentMethodsError ? (
                    <p className="mt-4 text-sm leading-6 text-olive">{paymentMethodsError}</p>
                  ) : null}
                </SurfaceMuted>
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <SurfaceMuted as="section" className="px-5 py-5">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-lg font-semibold text-slate">Saved addresses</p>
                    <span className="text-sm text-slate/60">{addresses.length} saved</span>
                  </div>

                  <div className="mt-4 grid gap-4">
                    {addresses.length === 0 ? (
                      <SurfaceInset className="px-4 py-4 text-sm text-slate/68">
                        No saved addresses yet.
                      </SurfaceInset>
                    ) : (
                      addresses.map((address) => (
                        <SurfaceInset key={address.id} className="px-4 py-4">
                          <p className="text-sm font-semibold text-slate">
                            {[address.first_name, address.last_name].filter(Boolean).join(" ")}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate/72">
                            {[address.address_1, address.address_2, address.city, address.province, address.postal_code]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => void handleDeleteAddress(address.id)}
                            className="mt-3 px-4 py-2 text-xs hover:border-red-400 hover:text-red-700"
                          >
                            Delete
                          </Button>
                        </SurfaceInset>
                      ))
                    )}
                  </div>

                  <form onSubmit={handleAddressCreate} className="mt-6 grid gap-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Label className="grid gap-2">
                        <span>First name</span>
                        <Input
                          value={addressForm.first_name}
                          onChange={(event) =>
                            setAddressForm((current) => ({
                              ...current,
                              first_name: event.target.value,
                            }))
                          }
                        />
                      </Label>
                      <Label className="grid gap-2">
                        <span>Last name</span>
                        <Input
                          value={addressForm.last_name}
                          onChange={(event) =>
                            setAddressForm((current) => ({
                              ...current,
                              last_name: event.target.value,
                            }))
                          }
                        />
                      </Label>
                    </div>
                    <Label className="grid gap-2">
                      <span>Street</span>
                      <Input
                        value={addressForm.address_1}
                        onChange={(event) =>
                          setAddressForm((current) => ({
                            ...current,
                            address_1: event.target.value,
                          }))
                        }
                        required
                      />
                    </Label>
                    <div className="grid gap-4 md:grid-cols-3">
                      <Label className="grid gap-2">
                        <span>City</span>
                        <Input
                          value={addressForm.city}
                          onChange={(event) =>
                            setAddressForm((current) => ({ ...current, city: event.target.value }))
                          }
                          required
                        />
                      </Label>
                      <Label className="grid gap-2">
                        <span>State</span>
                        <Input
                          value={addressForm.province}
                          onChange={(event) =>
                            setAddressForm((current) => ({
                              ...current,
                              province: event.target.value,
                            }))
                          }
                          required
                        />
                      </Label>
                      <Label className="grid gap-2">
                        <span>ZIP</span>
                        <Input
                          value={addressForm.postal_code}
                          onChange={(event) =>
                            setAddressForm((current) => ({
                              ...current,
                              postal_code: event.target.value,
                            }))
                          }
                          required
                        />
                      </Label>
                    </div>
                    <Button
                      type="submit"
                      disabled={isSaving}
                      variant="secondary"
                    >
                      {isSaving ? "Saving..." : "Add address"}
                    </Button>
                  </form>
                </SurfaceMuted>

                <SurfaceMuted as="section" className="px-5 py-5">
                  <p className="text-lg font-semibold text-slate">Quote and invoice requests</p>
                  <p className="mt-3 text-sm leading-6 text-slate/72">
                    These records come from the ops API and are tied to your account email.
                  </p>
                  <div className="mt-4 grid gap-4">
                    {requests.length === 0 ? (
                      <SurfaceInset className="px-4 py-4 text-sm text-slate/68">
                        No quote or invoice requests yet.
                      </SurfaceInset>
                    ) : (
                      requests.map((request) => (
                        <SurfaceInset key={request.id} className="px-4 py-4">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-slate">
                              {request.type === "invoice" ? "Invoice request" : "Quote request"}
                            </p>
                            <Badge variant="pill">
                              {request.status}
                            </Badge>
                          </div>
                          <p className="mt-2 text-sm text-slate/68">
                            Submitted {new Date(request.submittedAt).toLocaleString()}
                          </p>
                          {(request.companyName ||
                            request.purchaseOrderNumber ||
                            request.cartId ||
                            request.orderId) ? (
                            <div className="mt-3 grid gap-1 text-sm text-slate/68">
                              {request.companyName ? (
                                <p>Company: {request.companyName}</p>
                              ) : null}
                              {request.purchaseOrderNumber ? (
                                <p>PO: {request.purchaseOrderNumber}</p>
                              ) : null}
                              {request.cartId ? <p>Checkout cart: {request.cartId}</p> : null}
                              {request.orderId ? <p>Linked order: {request.orderId}</p> : null}
                            </div>
                          ) : null}
                          {request.notes ? (
                            <p className="mt-2 text-sm leading-6 text-slate/72">{request.notes}</p>
                          ) : null}
                        </SurfaceInset>
                      ))
                    )}
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button asChild variant="default">
                      <Link href="/quote">
                        New quote
                      </Link>
                    </Button>
                    <Button asChild variant="secondary">
                      <Link href="/checkout">
                        Request invoice from checkout
                      </Link>
                    </Button>
                  </div>
                </SurfaceMuted>
              </div>
            </>
          )}

          {statusMessage || error ? (
            <p className="mt-6 text-sm leading-6 text-olive">{statusMessage ?? error}</p>
          ) : null}

          {/* Danger Zone */}
          {isAuthenticated && <DangerZone />}
        </SectionPanel>
      </div>
    </main>
  );
}

function DangerZone() {
  const { requestAccountDeletion } = useCustomer();
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleDelete() {
    setIsSubmitting(true);
    setMessage(null);

    try {
      await requestAccountDeletion();
      setMessage(
        "Your deletion request has been submitted. We will process it within 48 hours and confirm by email.",
      );
      setConfirming(false);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Unable to submit deletion request.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mt-10 pt-6">
      <Button
        type="button"
        variant="ghost"
        size="compact"
        onClick={() => setOpen((v) => !v)}
        className="h-auto px-0 py-0 text-xs font-semibold uppercase tracking-[0.18em] text-red-400 hover:text-red-600"
      >
        {open ? "▲ Hide danger zone" : "▼ Danger zone"}
      </Button>

      {open && (
        <SurfaceMuted className="mt-4 px-6 py-6">
          <p className="text-sm font-semibold text-slate">Delete account</p>
          <p className="mt-2 text-sm leading-6 text-slate/72">
            Requesting account deletion will notify our team. We will delete your account and all
            associated data within 48 hours.
          </p>

          {message ? (
            <p className="mt-4 text-sm leading-6 text-olive">{message}</p>
          ) : confirming ? (
            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                type="button"
                variant="default"
                onClick={() => void handleDelete()}
                disabled={isSubmitting}
                className="text-sm"
              >
                {isSubmitting ? "Submitting..." : "Yes, request deletion"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setConfirming(false)}
                className="text-sm"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="secondary"
              onClick={() => setConfirming(true)}
              className="mt-4 text-sm"
            >
              Request account deletion
            </Button>
          )}
        </SurfaceMuted>
      )}
    </section>
  );
}
