"use client";
import { Suspense } from "react";
import { Badge, Breadcrumbs, Eyebrow, EyebrowAccent, PageCopy, PageTitle, SectionPanel, SectionTitle, SurfaceMuted } from "@blinds/ui";
import { Button } from "@blinds/ui";
import { Input } from "@blinds/ui";
import { Label } from "@blinds/ui";
import { SegmentedControl } from "@blinds/ui";
import { Select } from "@blinds/ui";

import { CreditCardIcon, MapPinIcon, PackageIcon, MagnifyingGlassIcon, CircleNotchIcon } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type {
  CustomerAccountOrder,
  CustomerPaymentMethodSummary,
  CustomerPaymentMethodsResponse,
} from "@blinds/types";

import { PaymentMethodSetupForm } from "@/components/customer/payment-method-setup-form";
import { useCustomer } from "@/components/customer/customer-provider";
import { useStorefront } from "@/components/storefront/storefront-provider";
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
  "border-black/12 text-slate focus:border-brass";
const ORDER_STATUS_FILTERS = [
  { label: "All statuses", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Processing", value: "processing" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];
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

function getOrderStatusBadgeProps(status: string): {
  variant: "soft-olive" | "soft-brass" | "soft";
  className?: string;
} {
  const normalized = status.trim().toLowerCase();

  if (["fulfilled", "shipped", "out-for-delivery", "delivered"].includes(normalized)) {
    return { variant: "soft-olive" };
  }

  if (["pending", "processing", "working-on-order"].includes(normalized)) {
    return { variant: "soft-brass" };
  }

  if (["cancelled", "canceled"].includes(normalized)) {
    return { variant: "soft", className: "border-red-200 bg-red-50 text-red-600" };
  }

  return { variant: "soft" };
}

function getOrderLabel(order: CustomerAccountOrder) {
  return order.displayId ? `#${order.displayId}` : order.id;
}

function normalizeOrderStatus(status: string) {
  const normalized = status.trim().toLowerCase().replaceAll("_", "-");

  if (["fulfilled", "shipped", "out-for-delivery"].includes(normalized)) {
    return "shipped";
  }

  if (["completed", "delivered"].includes(normalized)) {
    return "delivered";
  }

  if (["canceled", "cancelled"].includes(normalized)) {
    return "cancelled";
  }

  if (["working-on-order", "processing"].includes(normalized)) {
    return "processing";
  }

  return normalized;
}

function orderMatchesSearch(order: CustomerAccountOrder, query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  const haystack = [
    order.id,
    String(order.displayId ?? ""),
    order.status,
    order.email,
    ...order.items.flatMap((item) => [
      item.id,
      item.title ?? "",
      item.productTitle ?? "",
      item.variantId ?? "",
    ]),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalizedQuery);
}

export default function AccountPage() {
  return (
    <Suspense>
      <AccountPageContent />
    </Suspense>
  );
}

function AccountPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
    logout,
    error,
  } = useCustomer();
  const { addToCart, isLoading: isCartLoading } = useStorefront();

  async function handleLogout() {
    await logout();
    router.push("/");
  }
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
  const initialTab = (searchParams.get("tab") as AccountTab | null) ?? "account";
  const [activeTab, setActiveTab] = useState<AccountTab>(
    ["account", "addresses", "orders"].includes(initialTab) ? initialTab : "account",
  );
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<CustomerAccountOrder | null>(null);
  const [reorderingOrderId, setReorderingOrderId] = useState<string | null>(null);

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
    } catch (deleteError) {
      setStatusMessage(
        deleteError instanceof Error ? deleteError.message : "Unable to delete address.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleReorder(order: CustomerAccountOrder) {
    const reorderableItems = order.items.filter((item) => item.variantId);

    if (reorderableItems.length === 0) {
      setStatusMessage("This order does not have reorderable variant details yet.");
      return;
    }

    setReorderingOrderId(order.id);
    setStatusMessage(null);

    try {
      for (const item of reorderableItems) {
        await addToCart(item.variantId!, item.quantity);
      }

      const skippedCount = order.items.length - reorderableItems.length;
      setStatusMessage(
        skippedCount > 0
          ? `Added ${reorderableItems.length} item${reorderableItems.length === 1 ? "" : "s"} to cart. ${skippedCount} item${skippedCount === 1 ? "" : "s"} could not be reordered.`
          : `Added ${reorderableItems.length} item${reorderableItems.length === 1 ? "" : "s"} to cart.`,
      );
    } catch (reorderError) {
      setStatusMessage(reorderError instanceof Error ? reorderError.message : "Unable to reorder.");
    } finally {
      setReorderingOrderId(null);
    }
  }

  const latestOrder = orders[0];
  const customerName =
    [customer?.first_name, customer?.last_name].filter(Boolean).join(" ") || customer?.email || "";
  const totalItemsBought = orders.reduce(
    (total, order) =>
      total + (order.items ?? []).reduce((itemTotal, item) => itemTotal + (item.quantity ?? 0), 0),
    0,
  );
  const totalSpent = orders.reduce((total, order) => total + (order.total ?? 0), 0);
  const accountCurrencyCode = latestOrder?.currencyCode?.toUpperCase() ?? "USD";
  const accountStatCards = [
    { label: "Total orders", value: String(orders.length) },
    { label: "Total items bought", value: totalItemsBought.toLocaleString() },
    { label: "Total spent", value: formatPrice(totalSpent, accountCurrencyCode) },
  ];
  const activeTabMeta = TAB_META[activeTab];
  const feedbackMessage = statusMessage ?? error;
  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      orderStatusFilter === "all" || normalizeOrderStatus(order.status) === orderStatusFilter;

    return matchesStatus && orderMatchesSearch(order, orderSearch);
  });

  return (
    <main className="page-section pb-20 pt-10">
      <div className="content-shell max-w-6xl">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Account" }]} />
        <section>
          <div>
            <header className="max-w-3xl">
              <PageTitle>
                Your account
              </PageTitle>
              <PageCopy className="max-w-3xl text-base leading-7 text-slate/68">
                Manage profile details, saved addresses, payment methods, and orders in one place.
              </PageCopy>
            </header>

            {isLoading ? (
              <SurfaceMuted className="mt-8 px-5 py-5 text-sm text-slate/68">
                Loading account...
              </SurfaceMuted>
            ) : !isAuthenticated || !customer ? (
              <SurfaceMuted className="mt-8 border-dashed px-5 py-6">
                <p className="text-sm font-semibold text-slate">No active customer session</p>
                <p className="mt-2 text-sm leading-6 text-slate/68">
                  Sign in to manage profile details, addresses, payment methods, and orders.
                </p>
              </SurfaceMuted>
            ) : (
              <>
              <div className="mt-8 grid gap-8 lg:grid-cols-[18.5rem_minmax(0,1fr)] xl:grid-cols-[19.5rem_minmax(0,1fr)]">
                <aside>
                  <SectionPanel className="px-6 py-6 border border-black/6">
                    <div className="flex items-center justify-between gap-3">
                      <EyebrowAccent>Signed in</EyebrowAccent>
                      <Button
                        type="button"
                        variant="secondary"
                        size="compact"
                        onClick={() => void handleLogout()}
                      >
                        Sign out
                      </Button>
                    </div>
                    <p className="mt-3 font-display text-2xl font-semibold leading-tight tracking-tight text-slate">
                      {customerName}
                    </p>
                    <p className="mt-1.5 text-sm leading-6 text-slate/68">{customer.email}</p>

                    <div className="mt-7 border-t border-black/8 pt-6">
                      <Eyebrow>Overview</Eyebrow>
                      <dl className="mt-4 space-y-3.5">
                        <div className="flex items-start justify-between gap-4">
                          <dt className="text-sm text-slate/68">Company</dt>
                          <dd className="text-right text-sm font-semibold text-slate">
                            {customer.company_name || "Not set"}
                          </dd>
                        </div>
                        <div className="flex items-start justify-between gap-4">
                          <dt className="text-sm text-slate/68">Phone</dt>
                          <dd className="text-right text-sm font-semibold text-slate">
                            {customer.phone || "Not set"}
                          </dd>
                        </div>
                        <div className="flex items-start justify-between gap-4">
                          <dt className="text-sm text-slate/68">Addresses</dt>
                          <dd className="text-right text-sm font-semibold text-slate">{addresses.length}</dd>
                        </div>
                        {accountStatCards.map((stat) => (
                          <div key={stat.label} className="flex items-start justify-between gap-4">
                            <dt className="text-sm text-slate/68">{stat.label}</dt>
                            <dd className="text-right text-sm font-semibold text-slate">{stat.value}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>

                    <DangerZone className="mt-7 border-t border-black/8 pt-6" />
                  </SectionPanel>
                </aside>

                <SectionPanel as="section" className="px-5 py-5 md:px-7 md:py-7 border border-black/6">
                  <div className="border-b border-black/8 pb-6">
                    <div>
                      <EyebrowAccent>Workspace</EyebrowAccent>
                      <SectionTitle as="h2" className="mt-3">
                        {activeTabMeta.title}
                      </SectionTitle>
                      <p className="mt-3 max-w-[38rem] text-sm leading-6 text-slate/68">
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
                    <SurfaceMuted className="mt-6 px-4 py-3 text-sm leading-6 text-slate/68">
                      {feedbackMessage}
                    </SurfaceMuted>
                  ) : null}

                  {activeTab === "account" ? (
                    <div className="grid gap-8 pt-8">
                      <form id="customer-profile-form" onSubmit={handleProfileSave} className="grid gap-6">
                        <div className="flex flex-col gap-1.5">
                          <Eyebrow>Profile details</Eyebrow>
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
                        <div className="flex flex-col gap-1.5">
                          <Eyebrow>Saved payment methods</Eyebrow>
                          <p className="max-w-[42rem] text-sm leading-6 text-slate/68">
                            Save a card for faster checkout. Card details stay within Stripe.
                          </p>
                        </div>

                        <div className="mt-6">
                          {!capabilities?.savedPaymentMethodsEnabled ? (
                            <div className="flex items-center gap-2 py-3 text-sm text-slate/50">
                              <CreditCardIcon className="h-4 w-4 shrink-0" />
                              Saved cards are not available yet.
                            </div>
                          ) : isLoadingPaymentMethods ? (
                            <div className="flex items-center gap-2 py-3 text-sm text-slate/50">
                              <CircleNotchIcon className="h-4 w-4 shrink-0 animate-spin" />
                              Loading saved cards…
                            </div>
                          ) : paymentMethods.length > 0 ? (
                            <div className="divide-y divide-black/8">
                              {paymentMethods.map((method) => (
                                <div
                                  key={method.id}
                                  className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between"
                                >
                                  <div>
                                    <p className="text-sm font-semibold text-slate">
                                      {method.brand.toUpperCase()} ending in {method.last4}
                                    </p>
                                    <p className="mt-2 text-sm leading-6 text-slate/68">
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
                              ))}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 py-3 text-sm text-slate/50">
                              <CreditCardIcon className="h-4 w-4 shrink-0" />
                              No saved cards yet.
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
                        <div className="flex flex-col gap-1.5 md:flex-row md:items-end md:justify-between">
                          <div>
                            <Eyebrow>Saved addresses</Eyebrow>
                            <p className="mt-1.5 max-w-[42rem] text-sm leading-6 text-slate/68">
                              Edit existing delivery details inline or add a new address below.
                            </p>
                          </div>
                          <p className="text-sm text-slate/60">{addresses.length} saved</p>
                        </div>

                        <div className="mt-6">
                          {addresses.length === 0 ? (
                            <div className="flex items-center gap-2 py-3 text-sm text-slate/50">
                              <MapPinIcon className="h-4 w-4 shrink-0" />
                              No saved addresses yet.
                            </div>
                          ) : (
                            <div className="divide-y divide-black/8">
                              {addresses.map((address) => (
                              <div key={address.id} className="py-4">
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
                                      <p className="mt-2 text-sm leading-6 text-slate/68">
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
                                        <p className="mt-2 text-sm leading-6 text-slate/68">
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
                              ))}
                            </div>
                          )}
                        </div>
                      </section>

                      <section className="border-t border-black/8 pt-8">
                        <div className="flex flex-col gap-1.5">
                          <Eyebrow>Add a new address</Eyebrow>
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
                      <div className="flex flex-col gap-1.5 md:flex-row md:items-end md:justify-between">
                        <div>
                          <Eyebrow>Orders</Eyebrow>
                          <p className="mt-1.5 max-w-[42rem] text-sm leading-6 text-slate/68">
                            Search, filter, track, and reorder from this customer account.
                          </p>
                        </div>
                        <p className="text-sm text-slate/60">
                          {filteredOrders.length} of {orders.length} total
                        </p>
                      </div>

                      <div className="mt-6 grid gap-3 md:grid-cols-[minmax(0,1fr)_14rem]">
                        <Label className="grid gap-2">
                          <span>Search orders</span>
                          <Input
                            type="search"
                            value={orderSearch}
                            onChange={(event) => setOrderSearch(event.target.value)}
                            placeholder="Order number, product, or SKU"
                            className={FIELD_INPUT_CLASS_NAME}
                          />
                        </Label>
                        <Label className="grid gap-2">
                          <span>Status</span>
                          <Select
                            size="compact"
                            value={orderStatusFilter}
                            onChange={(event) => setOrderStatusFilter(event.target.value)}
                          >
                            {ORDER_STATUS_FILTERS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </Select>
                        </Label>
                      </div>

                      {orders.length === 0 ? (
                        <div className="mt-6 flex items-center gap-2 py-3 text-sm text-slate/50">
                          <PackageIcon className="h-4 w-4 shrink-0" />
                          No orders yet.
                        </div>
                      ) : filteredOrders.length === 0 ? (
                        <div className="mt-6 flex items-center gap-2 py-3 text-sm text-slate/50">
                          <MagnifyingGlassIcon className="h-4 w-4 shrink-0" />
                          No orders match the current filter.
                        </div>
                      ) : (
                        <div className="mt-6">
                          {filteredOrders.map((order) => {
                            const orderLabel = getOrderLabel(order);
                            const trackHref = `/track-order?order=${encodeURIComponent(order.id)}&email=${encodeURIComponent(order.email)}`;
                            const canReorder = order.items.some((item) => item.variantId);

                            return (
                            <article key={order.id} className="border-b border-black/10 py-6 last:border-b-0">
                              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                <div>
                                  <p className="text-sm font-semibold text-slate">
                                    Order {orderLabel}
                                  </p>
                                  <p className="mt-2 text-sm leading-6 text-slate/68">
                                    Placed {new Date(order.createdAt).toLocaleString()}
                                  </p>
                                  <p className="mt-1 text-sm leading-6 text-slate/68">
                                    {order.items.length} item{order.items.length === 1 ? "" : "s"}
                                  </p>
                                </div>
                                <div className="text-left md:text-right">
                                  {(() => { const { variant, className } = getOrderStatusBadgeProps(order.status); return <Badge variant={variant} className={className}>{order.status}</Badge>; })()}
                                  <p className="mt-3 font-display text-2xl font-medium tracking-tight text-slate">
                                    {formatPrice(
                                      order.total ?? 0,
                                      order.currencyCode?.toUpperCase() ?? "USD",
                                    )}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-4 grid gap-3">
                                {(order.items ?? []).slice(0, 3).map((item) => (
                                  <div
                                    key={item.id}
                                    className="grid grid-cols-[minmax(0,1fr)_auto] gap-4"
                                  >
                                    <div className="min-w-0">
                                      <p className="text-sm font-semibold text-slate">
                                        {item.productTitle ?? item.title ?? "Order item"}
                                      </p>
                                      <p className="mt-1 text-sm text-slate/68">
                                        Qty {item.quantity}
                                      </p>
                                    </div>
                                    <p className="text-sm font-semibold text-slate">
                                      {formatPrice(
                                        item.total ?? 0,
                                        order.currencyCode?.toUpperCase() ?? "USD",
                                      )}
                                    </p>
                                  </div>
                                ))}
                                {order.items.length > 3 ? (
                                  <p className="text-sm text-slate/68">
                                    +{order.items.length - 3} more item{order.items.length - 3 === 1 ? "" : "s"}
                                  </p>
                                ) : null}
                              </div>

                              <div className="mt-4 flex flex-wrap gap-3">
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="compact"
                                  onClick={() => setSelectedOrder(order)}
                                >
                                  View details
                                </Button>
                                <Button asChild variant="secondary" size="compact">
                                  <Link href={trackHref}>Track order</Link>
                                </Button>
                                <Button
                                  type="button"
                                  variant="default"
                                  size="compact"
                                  disabled={!canReorder || isCartLoading || reorderingOrderId === order.id}
                                  onClick={() => void handleReorder(order)}
                                >
                                  {reorderingOrderId === order.id ? "Adding..." : "Buy again"}
                                </Button>
                              </div>
                            </article>
                          );
                          })}
                        </div>
                      )}
                    </section>
                  ) : null}
                </SectionPanel>
              </div>
              </>
            )}
          </div>
        </section>
      </div>
      {selectedOrder ? (
        <OrderDetailModal
          order={selectedOrder}
          isReordering={reorderingOrderId === selectedOrder.id}
          isCartLoading={isCartLoading}
          onClose={() => setSelectedOrder(null)}
          onReorder={() => void handleReorder(selectedOrder)}
        />
      ) : null}
    </main>
  );
}

function OrderDetailModal({
  order,
  isReordering,
  isCartLoading,
  onClose,
  onReorder,
}: {
  order: CustomerAccountOrder;
  isReordering: boolean;
  isCartLoading: boolean;
  onClose: () => void;
  onReorder: () => void;
}) {
  const orderLabel = getOrderLabel(order);
  const currencyCode = order.currencyCode?.toUpperCase() ?? "USD";
  const canReorder = order.items.some((item) => item.variantId);
  const trackHref = `/track-order?order=${encodeURIComponent(order.id)}&email=${encodeURIComponent(order.email)}`;
  const itemTotal = order.items.reduce((total, item) => total + (item.total ?? 0), 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate/45 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-detail-title"
    >
      <div className="dialog-shell max-h-[90vh] w-full max-w-3xl overflow-y-auto border border-black/8">
        <div className="flex items-start justify-between gap-4 border-b border-black/8 px-5 py-5 md:px-6">
          <div>
            <EyebrowAccent>Order details</EyebrowAccent>
            <h3 id="order-detail-title" className="mt-2 font-display text-3xl font-medium text-slate">
              Order {orderLabel}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate/68">
              Placed {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <Button type="button" variant="secondary" size="compact" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="grid gap-6 px-5 py-5 md:px-6">
          <div className="grid gap-6 border-t border-black/8 pt-6 md:grid-cols-3">
            <div>
              <EyebrowAccent>Status</EyebrowAccent>
              {(() => { const { variant, className } = getOrderStatusBadgeProps(order.status); return <Badge variant={variant} className={`mt-3 ${className ?? ""}`}>{order.status}</Badge>; })()}
            </div>
            <div>
              <EyebrowAccent>Total</EyebrowAccent>
              <p className="mt-3 font-display text-2xl font-medium text-slate">
                {formatPrice(order.total ?? 0, currencyCode)}
              </p>
            </div>
            <div>
              <EyebrowAccent>Email</EyebrowAccent>
              <p className="mt-3 break-all text-sm font-semibold leading-6 text-slate">
                {order.email}
              </p>
            </div>
          </div>

          <section className="border-t border-black/8 pt-6">
            <Eyebrow>Items</Eyebrow>
            <div className="mt-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[minmax(0,1fr)_auto_auto] gap-4 border-b border-black/8 py-4 text-sm"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-slate">
                      {item.productTitle ?? item.title ?? "Order item"}
                    </p>
                    <p className="mt-1 text-slate/68">
                      {item.variantId ? `Variant ${item.variantId}` : "Variant details unavailable"}
                    </p>
                  </div>
                  <p className="text-slate/68">Qty {item.quantity}</p>
                  <p className="font-semibold text-slate">
                    {formatPrice(item.total ?? 0, currencyCode)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-6 border-t border-black/8 pt-6 md:grid-cols-2">
            <div>
              <Eyebrow>Totals</Eyebrow>
              <dl className="mt-4 grid gap-2 text-sm text-slate/68">
                <div className="flex justify-between gap-4">
                  <dt>Items</dt>
                  <dd>{formatPrice(itemTotal, currencyCode)}</dd>
                </div>
                <div className="flex justify-between gap-4 border-t border-black/8 pt-2 font-semibold text-slate">
                  <dt>Order total</dt>
                  <dd>{formatPrice(order.total ?? 0, currencyCode)}</dd>
                </div>
              </dl>
            </div>
            <div>
              <Eyebrow>Tracking and payment</Eyebrow>
              <p className="mt-4 text-sm leading-6 text-slate/68">
                Open tracking to view the latest payment, fulfillment, shipment, and delivery status.
              </p>
            </div>
          </section>

          <div className="flex flex-wrap gap-3 border-t border-black/8 pt-5">
            <Button asChild variant="secondary">
              <Link href={trackHref}>Track order</Link>
            </Button>
            <Button
              type="button"
              variant="default"
              disabled={!canReorder || isCartLoading || isReordering}
              onClick={onReorder}
            >
              {isReordering ? "Adding..." : "Buy again"}
            </Button>
          </div>
        </div>
      </div>
    </div>
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
      <Eyebrow>Account deletion</Eyebrow>
      <p className="mt-3 text-sm leading-6 text-slate/68">
        Submit a deletion request. We will remove your account and all data within 48 hours.
      </p>

      <Button
        type="button"
        variant="secondary"
        size="compact"
        onClick={() => setOpen((v) => !v)}
        className="mt-4 border-red-300 text-red-700 hover:border-red-500 hover:text-red-800"
      >
        {open ? "Close" : "Delete account"}
      </Button>

      {open && (
        <SurfaceMuted className="mt-4 border border-red-100 bg-white/72 px-5 py-5">
          <p className="text-sm font-semibold text-slate">Delete account</p>
          <p className="mt-2 text-sm leading-6 text-slate/68">
            This action cannot be undone. Confirm to notify our team and begin the process.
          </p>

          {message ? (
            <p className="mt-4 text-sm leading-6 text-olive">{message}</p>
          ) : confirming ? (
            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                type="button"
                variant="secondary"
                size="compact"
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
              size="compact"
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
