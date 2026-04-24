"use client";
import { Badge } from "@blinds/ui";
import { Breadcrumbs } from "@blinds/ui";
import { Button } from "@blinds/ui";
import { Input } from "@blinds/ui";
import { Label } from "@blinds/ui";
import { SegmentedControl } from "@blinds/ui";
import { SurfaceMuted } from "@blinds/ui";
import { PageCopy, PageTitle } from "@blinds/ui";

import { useEffect, useState } from "react";
import type { CustomerPaymentMethodSummary, CustomerPaymentMethodsResponse } from "@blinds/types";

import { PaymentMethodSetupForm } from "@/components/customer/payment-method-setup-form";
import { useCustomer } from "@/components/customer/customer-provider";
import { formatPrice } from "@/lib/format-price";
import { getPublicRuntimeConfig } from "@/lib/platform-config";

type PlatformCapabilities = {
  stripeConfigured: boolean;
  resendConfigured: boolean;
  savedPaymentMethodsEnabled: boolean;
  emailNotificationsEnabled: boolean;
};

type AccountTab = "account" | "addresses" | "orders";

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
const FIELD_INPUT_CLASS_NAME =
  "border-black/12 bg-shell/78 text-slate focus:border-brass focus:bg-white";
const ITEM_PANEL_CLASS_NAME =
  "rounded-[1.5rem] border border-black/8 bg-shell/62 px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]";
const TAB_META: Record<AccountTab, { title: string; copy: string }> = {
  account: {
    title: "Profile and payment",
    copy: "Update the contact details and saved cards attached to this customer account.",
  },
  addresses: {
    title: "Saved addresses",
    copy: "Keep delivery details ready so checkout stays fast and support has one clean source of truth.",
  },
  orders: {
    title: "Order history",
    copy: "Review recent orders, totals, and line items without leaving the account workspace.",
  },
};

export default function AccountPage() {
  const {
    isLoading,
    isAuthenticated,
    customer,
    orders,
    addresses,
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    error,
  } = useCustomer();
  const [profileForm, setProfileForm] = useState({
    first_name: customer?.first_name ?? "",
    last_name: customer?.last_name ?? "",
    phone: customer?.phone ?? "",
    company_name: customer?.company_name ?? "",
  });
  const [addressForm, setAddressForm] = useState(initialAddress);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [editingAddressForm, setEditingAddressForm] = useState(initialAddress);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [capabilities, setCapabilities] = useState<PlatformCapabilities | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<CustomerPaymentMethodSummary[]>([]);
  const [paymentMethodsError, setPaymentMethodsError] = useState<string | null>(null);
  const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] = useState(false);
  const [isRemovingPaymentMethod, setIsRemovingPaymentMethod] = useState<string | null>(null);
  const [paymentMethodsRefreshKey, setPaymentMethodsRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<AccountTab>("account");

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
      company_name: customer?.company_name ?? "",
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
        setPaymentMethodsError("Sign in again to load saved cards.");
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

  function startAddressEdit(address: (typeof addresses)[number]) {
    setEditingAddressId(address.id);
    setEditingAddressForm({
      first_name: address.first_name ?? "",
      last_name: address.last_name ?? "",
      address_1: address.address_1 ?? "",
      company: address.company ?? "",
      city: address.city ?? "",
      province: address.province ?? "",
      postal_code: address.postal_code ?? "",
      country_code: address.country_code ?? "us",
      phone: address.phone ?? "",
    });
    setStatusMessage(null);
  }

  async function handleAddressUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingAddressId) {
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);

    try {
      await updateAddress(editingAddressId, editingAddressForm);
      setEditingAddressId(null);
      setEditingAddressForm(initialAddress);
      setStatusMessage("Address updated.");
    } catch (saveError) {
      setStatusMessage(saveError instanceof Error ? saveError.message : "Unable to update address.");
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

  const latestOrder = orders[0];
  const customerName =
    [customer?.first_name, customer?.last_name].filter(Boolean).join(" ") || customer?.email || "";
  const activeTabMeta = TAB_META[activeTab];
  const feedbackMessage = statusMessage ?? error;

  return (
    <main className="page-section pb-20 pt-10">
      <div className="content-shell max-w-6xl">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Account" },
          ]}
        />
        <section className="mt-6">
          <div>
            <header className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-olive">
                Customer Account
              </p>
              <PageTitle>
                Your account
              </PageTitle>
              <PageCopy className="max-w-3xl text-base leading-7 text-slate/72">
                Manage profile details, saved addresses, payment methods, and orders in one place.
              </PageCopy>
            </header>

            {isLoading ? (
              <SurfaceMuted className="mt-8 px-5 py-5 text-sm text-slate/72">
                Loading account...
              </SurfaceMuted>
            ) : !isAuthenticated || !customer ? (
              <SurfaceMuted className="mt-8 border-dashed px-5 py-6">
                <p className="text-sm font-semibold text-slate">No active customer session</p>
                <p className="mt-2 text-sm leading-6 text-slate/72">
                  Sign in to manage profile details, addresses, payment methods, and orders.
                </p>
              </SurfaceMuted>
            ) : (
              <div className="mt-8 grid gap-8 lg:grid-cols-[18.5rem_minmax(0,1fr)] xl:grid-cols-[19.5rem_minmax(0,1fr)]">
                <aside>
                  <div className="overflow-hidden rounded-[2rem] border border-black/6 bg-white/92 px-6 py-6 shadow-[0_28px_80px_rgba(24,36,34,0.08)]">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-brass">
                      Signed in
                    </p>
                    <p className="mt-3 font-display text-[2rem] font-medium leading-[1.02] tracking-tight text-slate">
                      {customerName}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate/68">{customer.email}</p>

                    <div className="mt-8 border-t border-black/8 pt-6">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-olive">
                        Account overview
                      </p>
                      <dl className="mt-4 space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <dt className="text-sm text-slate/62">Company</dt>
                          <dd className="text-right text-sm font-semibold text-slate">
                            {customer.company_name || "Not set"}
                          </dd>
                        </div>
                        <div className="flex items-start justify-between gap-4">
                          <dt className="text-sm text-slate/62">Phone</dt>
                          <dd className="text-right text-sm font-semibold text-slate">
                            {customer.phone || "Not set"}
                          </dd>
                        </div>
                        <div className="flex items-start justify-between gap-4">
                          <dt className="text-sm text-slate/62">Addresses</dt>
                          <dd className="text-right text-sm font-semibold text-slate">
                            {addresses.length}
                          </dd>
                        </div>
                        <div className="flex items-start justify-between gap-4">
                          <dt className="text-sm text-slate/62">Orders</dt>
                          <dd className="text-right text-sm font-semibold text-slate">
                            {orders.length}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div className="mt-8 border-t border-black/8 pt-6">
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-olive">
                          Latest order
                        </p>
                        {latestOrder ? <Badge variant="pill">{latestOrder.status}</Badge> : null}
                      </div>

                      {latestOrder ? (
                        <div className="mt-4">
                          <p className="text-sm font-semibold text-slate">
                            {latestOrder.display_id ? `#${latestOrder.display_id}` : latestOrder.id}
                          </p>
                          <p className="mt-2 font-display text-2xl font-medium tracking-tight text-slate">
                            {formatPrice(
                              latestOrder.total ?? 0,
                              latestOrder.currency_code?.toUpperCase() ?? "USD",
                            )}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate/62">
                            Placed {new Date(latestOrder.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      ) : (
                        <p className="mt-4 text-sm leading-6 text-slate/62">
                          No orders have been placed yet.
                        </p>
                      )}
                    </div>

                    <DangerZone className="mt-8 border-t border-black/8 pt-6" />
                  </div>
                </aside>

                <section className="rounded-[2rem] border border-black/6 bg-white/92 px-5 py-5 shadow-[0_28px_80px_rgba(24,36,34,0.08)] md:px-7 md:py-7">
                  <div className="border-b border-black/8 pb-6">
                    <div>
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-brass">
                        Workspace
                      </p>
                      <h2 className="mt-3 font-display text-[2rem] font-medium leading-[1.04] tracking-tight text-slate">
                        {activeTabMeta.title}
                      </h2>
                      <p className="mt-3 max-w-[38rem] text-sm leading-6 text-slate/70">
                        {activeTabMeta.copy}
                      </p>
                    </div>

                    <SegmentedControl
                      className="mt-4 max-w-full self-start overflow-hidden bg-shell/88"
                      value={activeTab}
                      onValueChange={(value) => setActiveTab(value as AccountTab)}
                      items={[
                        { label: "Account", value: "account" },
                        { label: "Addresses", value: "addresses" },
                        { label: "Orders", value: "orders" },
                      ]}
                    />
                  </div>

                  {feedbackMessage ? (
                    <div className="mt-6 rounded-[1.35rem] border border-black/6 bg-shell/72 px-4 py-3 text-sm leading-6 text-slate/74">
                      {feedbackMessage}
                    </div>
                  ) : null}

                  {activeTab === "account" ? (
                    <div className="grid gap-8 pt-8">
                      <form id="customer-profile-form" onSubmit={handleProfileSave} className="grid gap-6">
                        <div className="flex flex-col gap-2">
                          <p className="text-lg font-semibold text-slate">Profile details</p>
                          <p className="max-w-[42rem] text-sm leading-6 text-slate/68">
                            These fields write directly to the Medusa customer record used across the storefront.
                          </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <Label className="grid gap-2">
                            <span>First name</span>
                            <Input
                              type="text"
                              value={profileForm.first_name}
                              className={FIELD_INPUT_CLASS_NAME}
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
                              className={FIELD_INPUT_CLASS_NAME}
                              onChange={(event) =>
                                setProfileForm((current) => ({
                                  ...current,
                                  last_name: event.target.value,
                                }))
                              }
                            />
                          </Label>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <Label className="grid gap-2">
                            <span>Email</span>
                            <Input
                              type="email"
                              value={customer.email}
                              disabled
                              className={`${FIELD_INPUT_CLASS_NAME} text-slate/60`}
                            />
                          </Label>
                          <Label className="grid gap-2">
                            <span>Phone</span>
                            <Input
                              type="tel"
                              value={profileForm.phone}
                              className={FIELD_INPUT_CLASS_NAME}
                              onChange={(event) =>
                                setProfileForm((current) => ({
                                  ...current,
                                  phone: event.target.value,
                                }))
                              }
                            />
                          </Label>
                        </div>

                        <Label className="grid gap-2">
                          <span>Company</span>
                          <Input
                            type="text"
                            value={profileForm.company_name}
                            className={FIELD_INPUT_CLASS_NAME}
                            onChange={(event) =>
                              setProfileForm((current) => ({
                                ...current,
                                company_name: event.target.value,
                              }))
                            }
                          />
                        </Label>

                      </form>

                      <section className="border-t border-black/8 pt-8">
                        <div className="flex flex-col gap-2">
                          <p className="text-lg font-semibold text-slate">Saved payment methods</p>
                          <p className="max-w-[42rem] text-sm leading-6 text-slate/68">
                            Save a card for faster checkout. Card details stay within Stripe.
                          </p>
                        </div>

                        <div className="mt-6 grid gap-3">
                          {!capabilities?.savedPaymentMethodsEnabled ? (
                            <div className={`${ITEM_PANEL_CLASS_NAME} text-sm leading-6 text-slate/68`}>
                              Saved cards are not available yet.
                            </div>
                          ) : isLoadingPaymentMethods ? (
                            <div className={`${ITEM_PANEL_CLASS_NAME} text-sm leading-6 text-slate/68`}>
                              Loading saved cards...
                            </div>
                          ) : paymentMethods.length > 0 ? (
                            paymentMethods.map((method) => (
                              <div
                                key={method.id}
                                className={`${ITEM_PANEL_CLASS_NAME} flex flex-col gap-4 md:flex-row md:items-center md:justify-between`}
                              >
                                <div>
                                  <p className="text-sm font-semibold text-slate">
                                    {method.brand.toUpperCase()} ending in {method.last4}
                                  </p>
                                  <p className="mt-2 text-sm leading-6 text-slate/62">
                                    Expires {String(method.expMonth).padStart(2, "0")}/{method.expYear}
                                    {method.isDefault ? " · Default" : ""}
                                  </p>
                                </div>
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="compact"
                                  onClick={() => void handleRemovePaymentMethod(method.id)}
                                  disabled={isRemovingPaymentMethod === method.id}
                                  className="hover:border-red-400 hover:text-red-700"
                                >
                                  {isRemovingPaymentMethod === method.id ? "Removing..." : "Remove"}
                                </Button>
                              </div>
                            ))
                          ) : (
                            <div className={`${ITEM_PANEL_CLASS_NAME} text-sm leading-6 text-slate/68`}>
                              No saved cards were found for this customer yet.
                            </div>
                          )}
                        </div>

                        {capabilities?.savedPaymentMethodsEnabled && customer.email ? (
                          <div className="mt-6 max-w-xl">
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
                          </div>
                        ) : null}

                        {paymentMethodsError ? (
                          <p className="mt-4 text-sm leading-6 text-olive">{paymentMethodsError}</p>
                        ) : null}
                      </section>

                      <div className="border-t border-black/8 pt-8">
                        <Button
                          type="submit"
                          form="customer-profile-form"
                          disabled={isSaving}
                          variant="secondary"
                        >
                          {isSaving ? "Saving..." : "Save profile"}
                        </Button>
                      </div>
                    </div>
                  ) : null}

                  {activeTab === "addresses" ? (
                    <div className="grid gap-8 pt-8">
                      <section>
                        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                          <div>
                            <p className="text-lg font-semibold text-slate">Saved addresses</p>
                            <p className="mt-2 max-w-[42rem] text-sm leading-6 text-slate/68">
                              Edit existing delivery details inline or add a new address below.
                            </p>
                          </div>
                          <p className="text-sm text-slate/60">{addresses.length} saved</p>
                        </div>

                        <div className="mt-6 grid gap-4">
                          {addresses.length === 0 ? (
                            <div className={`${ITEM_PANEL_CLASS_NAME} text-sm leading-6 text-slate/68`}>
                              No saved addresses yet.
                            </div>
                          ) : (
                            addresses.map((address) => (
                              <div key={address.id} className={ITEM_PANEL_CLASS_NAME}>
                                {editingAddressId === address.id ? (
                                  <form onSubmit={handleAddressUpdate} className="grid gap-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                      <Label className="grid gap-2">
                                        <span>First name</span>
                                        <Input
                                          value={editingAddressForm.first_name}
                                          className={FIELD_INPUT_CLASS_NAME}
                                          onChange={(event) =>
                                            setEditingAddressForm((current) => ({
                                              ...current,
                                              first_name: event.target.value,
                                            }))
                                          }
                                        />
                                      </Label>
                                      <Label className="grid gap-2">
                                        <span>Last name</span>
                                        <Input
                                          value={editingAddressForm.last_name}
                                          className={FIELD_INPUT_CLASS_NAME}
                                          onChange={(event) =>
                                            setEditingAddressForm((current) => ({
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
                                        value={editingAddressForm.address_1}
                                        className={FIELD_INPUT_CLASS_NAME}
                                        onChange={(event) =>
                                          setEditingAddressForm((current) => ({
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
                                          value={editingAddressForm.city}
                                          className={FIELD_INPUT_CLASS_NAME}
                                          onChange={(event) =>
                                            setEditingAddressForm((current) => ({
                                              ...current,
                                              city: event.target.value,
                                            }))
                                          }
                                          required
                                        />
                                      </Label>
                                      <Label className="grid gap-2">
                                        <span>State</span>
                                        <Input
                                          value={editingAddressForm.province}
                                          className={FIELD_INPUT_CLASS_NAME}
                                          onChange={(event) =>
                                            setEditingAddressForm((current) => ({
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
                                          value={editingAddressForm.postal_code}
                                          className={FIELD_INPUT_CLASS_NAME}
                                          onChange={(event) =>
                                            setEditingAddressForm((current) => ({
                                              ...current,
                                              postal_code: event.target.value,
                                            }))
                                          }
                                          required
                                        />
                                      </Label>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                      <Button
                                        type="submit"
                                        variant="default"
                                        size="compact"
                                        disabled={isSaving}
                                      >
                                        {isSaving ? "Saving..." : "Save address"}
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="secondary"
                                        size="compact"
                                        onClick={() => {
                                          setEditingAddressId(null);
                                          setEditingAddressForm(initialAddress);
                                        }}
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </form>
                                ) : (
                                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                    <div>
                                      <p className="text-sm font-semibold text-slate">
                                        {[address.first_name, address.last_name].filter(Boolean).join(" ") ||
                                          "Saved address"}
                                      </p>
                                      <p className="mt-2 text-sm leading-6 text-slate/72">
                                        {[
                                          address.address_1,
                                          address.address_2,
                                          address.city,
                                          address.province,
                                          address.postal_code,
                                        ]
                                          .filter(Boolean)
                                          .join(", ")}
                                      </p>
                                      {address.phone ? (
                                        <p className="mt-2 text-sm leading-6 text-slate/58">
                                          {address.phone}
                                        </p>
                                      ) : null}
                                    </div>
                                    <div className="flex shrink-0 flex-wrap gap-2">
                                      <Button
                                        type="button"
                                        variant="secondary"
                                        size="compact"
                                        onClick={() => startAddressEdit(address)}
                                      >
                                        Edit
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="secondary"
                                        size="compact"
                                        onClick={() => void handleDeleteAddress(address.id)}
                                        className="hover:border-red-400 hover:text-red-700"
                                      >
                                        Delete
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </section>

                      <section className="border-t border-black/8 pt-8">
                        <div className="flex flex-col gap-2">
                          <p className="text-lg font-semibold text-slate">Add a new address</p>
                          <p className="max-w-[42rem] text-sm leading-6 text-slate/68">
                            New addresses become available immediately across the storefront account flow.
                          </p>
                        </div>

                        <form onSubmit={handleAddressCreate} className="mt-6 grid gap-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <Label className="grid gap-2">
                              <span>First name</span>
                              <Input
                                value={addressForm.first_name}
                                className={FIELD_INPUT_CLASS_NAME}
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
                                className={FIELD_INPUT_CLASS_NAME}
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
                              className={FIELD_INPUT_CLASS_NAME}
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
                                className={FIELD_INPUT_CLASS_NAME}
                                onChange={(event) =>
                                  setAddressForm((current) => ({
                                    ...current,
                                    city: event.target.value,
                                  }))
                                }
                                required
                              />
                            </Label>
                            <Label className="grid gap-2">
                              <span>State</span>
                              <Input
                                value={addressForm.province}
                                className={FIELD_INPUT_CLASS_NAME}
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
                                className={FIELD_INPUT_CLASS_NAME}
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
                          <div className="flex justify-start">
                            <Button type="submit" disabled={isSaving} variant="secondary">
                              {isSaving ? "Saving..." : "Add address"}
                            </Button>
                          </div>
                        </form>
                      </section>
                    </div>
                  ) : null}

                  {activeTab === "orders" ? (
                    <section className="pt-8">
                      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                        <div>
                          <p className="text-lg font-semibold text-slate">Orders</p>
                          <p className="mt-2 max-w-[42rem] text-sm leading-6 text-slate/68">
                            Review recent orders, status, and line items for this customer account.
                          </p>
                        </div>
                        <p className="text-sm text-slate/60">{orders.length} total</p>
                      </div>

                      {orders.length === 0 ? (
                        <div className={`${ITEM_PANEL_CLASS_NAME} mt-6 text-sm leading-6 text-slate/68`}>
                          No orders yet.
                        </div>
                      ) : (
                        <div className="mt-6 grid gap-4">
                          {orders.map((order) => (
                            <article key={order.id} className={ITEM_PANEL_CLASS_NAME}>
                              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                <div>
                                  <p className="text-sm font-semibold text-slate">
                                    Order {order.display_id ? `#${order.display_id}` : order.id}
                                  </p>
                                  <p className="mt-2 text-sm leading-6 text-slate/72">
                                    Placed {new Date(order.created_at).toLocaleString()}
                                  </p>
                                </div>
                                <div className="text-left md:text-right">
                                  <Badge variant="pill">{order.status}</Badge>
                                  <p className="mt-3 font-display text-[1.65rem] font-medium tracking-tight text-slate">
                                    {formatPrice(
                                      order.total ?? 0,
                                      order.currency_code?.toUpperCase() ?? "USD",
                                    )}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-5 grid gap-3 border-t border-black/8 pt-5">
                                {(order.items ?? []).map((item) => (
                                  <div
                                    key={item.id}
                                    className="grid grid-cols-[minmax(0,1fr)_auto] gap-4"
                                  >
                                    <div className="min-w-0">
                                      <p className="text-sm font-semibold text-slate">
                                        {item.product_title ?? item.title ?? "Order item"}
                                      </p>
                                      <p className="mt-1 text-sm text-slate/68">
                                        Qty {item.quantity}
                                      </p>
                                    </div>
                                    <p className="text-sm font-semibold text-slate">
                                      {formatPrice(
                                        item.total ?? 0,
                                        order.currency_code?.toUpperCase() ?? "USD",
                                      )}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </article>
                          ))}
                        </div>
                      )}
                    </section>
                  ) : null}
                </section>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function DangerZone({ className }: { className?: string }) {
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
    <section className={className}>
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-olive">
        Account deletion
      </p>
      <p className="mt-3 text-sm leading-6 text-slate/68">
        Request a clean account removal. This submits a deletion request and the account is then removed from the system.
      </p>

      <Button
        type="button"
        variant="secondary"
        onClick={() => setOpen((v) => !v)}
        className="mt-4 border-red-300 text-red-700 hover:border-red-500 hover:text-red-800"
      >
        {open ? "Close account deletion panel" : "Delete account request"}
      </Button>

      {open && (
        <SurfaceMuted className="mt-4 border border-red-100 bg-white/72 px-5 py-5">
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
                variant="secondary"
                onClick={() => void handleDelete()}
                disabled={isSubmitting}
                className="border-red-300 text-red-700 hover:border-red-500 hover:text-red-800"
              >
                {isSubmitting ? "Submitting..." : "Yes, request deletion"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="compact"
                onClick={() => setConfirming(false)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="secondary"
              onClick={() => setConfirming(true)}
              className="mt-4 border-red-300 text-red-700 hover:border-red-500 hover:text-red-800"
            >
              Request account deletion
            </Button>
          )}
        </SurfaceMuted>
      )}
    </section>
  );
}
