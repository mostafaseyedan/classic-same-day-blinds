import { defineRouteConfig } from "@medusajs/admin-sdk";
import {
  ArrowLeft,
  BellAlert,
  ChatBubbleLeftRight,
  MagnifyingGlass,
  MapPin,
  ReceiptPercent,
  Users,
} from "@medusajs/icons";
import { Badge, Button, Container, Heading, Text } from "@medusajs/ui";
import { useEffect, useRef, useState } from "react";

import type {
  CustomerAccountAdminAddress,
  CustomerAccountAdminOrder,
  CustomerAccountAdminResponse,
  CustomerOpsRequestRecord,
  NotificationRecord,
} from "@blinds/types";

type MedusaCustomerListItem = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  company_name: string | null;
  phone: string | null;
  has_account: boolean;
  created_at: string;
};

type MedusaCustomerListResponse = {
  customers: MedusaCustomerListItem[];
  count: number;
  offset: number;
  limit: number;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatMoney(value: number, currencyCode: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode.toUpperCase(),
  }).format(value);
}

function fullName(firstName?: string | null, lastName?: string | null) {
  return [firstName, lastName].filter(Boolean).join(" ") || "No name";
}

function statusClass(status: string): string {
  if (status === "completed" || status === "sent") return "text-green-500";
  if (status === "approved") return "text-blue-500";
  if (status === "reviewed" || status === "pending") return "text-orange-500";
  if (status === "failed") return "text-red-500";
  return "text-ui-fg-subtle";
}

function AddressLine({ address }: { address: CustomerAccountAdminAddress }) {
  const street = [address.address1, address.address2].filter(Boolean).join(", ");
  const region = [address.city, address.province, address.postalCode].filter(Boolean).join(", ");

  return (
    <div className="rounded border border-ui-border-base bg-ui-bg-base p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Text weight="plus">{fullName(address.firstName, address.lastName)}</Text>
          {address.company ? <Text size="small" className="text-ui-fg-subtle">{address.company}</Text> : null}
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          {address.isDefaultShipping ? <span className="text-xs font-medium text-blue-500">Default shipping</span> : null}
          {address.isDefaultBilling ? <span className="text-xs font-medium text-green-500">Default billing</span> : null}
        </div>
      </div>
      <Text size="small" className="mt-3 text-ui-fg-subtle">{street}</Text>
      <Text size="small" className="text-ui-fg-subtle">
        {[region, address.countryCode?.toUpperCase()].filter(Boolean).join(" ")}
      </Text>
      {address.phone ? <Text size="small" className="mt-2 text-ui-fg-subtle">{address.phone}</Text> : null}
    </div>
  );
}

function OrderLine({ order }: { order: CustomerAccountAdminOrder }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-ui-border-base py-4 first:border-t-0 first:pt-0">
      <div>
        <Text weight="plus">Order {order.displayId ? `#${order.displayId}` : order.id}</Text>
        <div className="mt-1 flex items-center gap-2">
          <Text size="small" className="text-ui-fg-subtle">{formatDate(order.createdAt)}</Text>
          <span className="text-ui-fg-subtle text-xs">·</span>
          <span className={`text-xs font-medium ${statusClass(order.status)}`}>{order.status}</span>
        </div>
      </div>
      <div className="shrink-0 text-right">
        <Text weight="plus">{formatMoney(order.total, order.currencyCode)}</Text>
        <Text size="small" className="text-ui-fg-subtle">{order.itemCount} item{order.itemCount === 1 ? "" : "s"}</Text>
      </div>
    </div>
  );
}

function RequestLine({ request }: { request: CustomerOpsRequestRecord }) {
  return (
    <div className="border-t border-ui-border-base py-4 first:border-t-0 first:pt-0">
      <div>
        <a href="/app/quotes" className="font-semibold text-ui-fg-base hover:text-ui-fg-interactive hover:underline">
          {request.type === "invoice" ? "Invoice request" : "Quote request"}
        </a>
        <div className="mt-1 flex items-center gap-2">
          <Text size="small" className="text-ui-fg-subtle">{formatDate(request.submittedAt)}</Text>
          <span className="text-xs text-ui-fg-subtle">·</span>
          <span className={`text-xs font-medium ${statusClass(request.status)}`}>{request.status}</span>
        </div>
      </div>
      <div className="mt-3 grid gap-1 text-sm text-ui-fg-subtle md:grid-cols-2">
        {request.customerName ? <span>Customer: {request.customerName}</span> : null}
        {request.companyName ? <span>Company: {request.companyName}</span> : null}
        {request.purchaseOrderNumber ? <span>PO: {request.purchaseOrderNumber}</span> : null}
        {request.orderId ? <span>Order: {request.orderId}</span> : null}
        {request.cartId ? <span>Cart: {request.cartId}</span> : null}
      </div>
      {request.notes ? <Text size="small" className="mt-3 text-ui-fg-subtle">{request.notes}</Text> : null}
    </div>
  );
}

function NotificationLine({ notification }: { notification: NotificationRecord }) {
  return (
    <div className="border-t border-ui-border-base py-4 first:border-t-0 first:pt-0">
      <div>
        <Text weight="plus">{notification.subject}</Text>
        <div className="mt-1 flex items-center gap-2">
          <Text size="small" className="text-ui-fg-subtle">{notification.kind}</Text>
          <span className="text-xs text-ui-fg-subtle">·</span>
          <span className={`text-xs font-medium ${statusClass(notification.status)}`}>{notification.status}</span>
        </div>
        <Text size="small" className="mt-1 text-ui-fg-subtle">{formatDate(notification.createdAt)}</Text>
      </div>
      {notification.failureReason ? (
        <Text size="small" className="mt-2 text-ui-fg-error">{notification.failureReason}</Text>
      ) : null}
    </div>
  );
}

function CustomerListRow({
  customer,
  onSelect,
}: {
  customer: MedusaCustomerListItem;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(customer.id)}
      className="w-full border-t border-ui-border-base px-4 py-3 text-left transition-colors hover:bg-ui-bg-base-hover first:border-t-0"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <Text weight="plus" className="truncate">{fullName(customer.first_name, customer.last_name)}</Text>
          <Text size="small" className="truncate text-ui-fg-subtle">{customer.email}</Text>
          {customer.company_name ? (
            <Text size="small" className="truncate text-ui-fg-muted">{customer.company_name}</Text>
          ) : null}
        </div>
        <div className="shrink-0 text-right">
          <span className={`text-xs font-medium ${customer.has_account ? "text-green-500" : "text-ui-fg-subtle"}`}>
            {customer.has_account ? "Registered" : "Guest"}
          </span>
          <Text size="small" className="mt-1 block text-ui-fg-muted">{formatDate(customer.created_at)}</Text>
        </div>
      </div>
    </button>
  );
}

export default function CustomerAccountPage() {
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState<MedusaCustomerListItem[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const [account, setAccount] = useState<CustomerAccountAdminResponse | null>(null);
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function fetchCustomers(q: string) {
    setListLoading(true);
    setListError(null);
    try {
      const params = new URLSearchParams({ limit: "25" });
      if (q.trim()) params.set("q", q.trim());
      const res = await fetch(`/admin/customers?${params.toString()}`);
      if (!res.ok) throw new Error(`Failed to load customers (${res.status})`);
      const data = (await res.json()) as MedusaCustomerListResponse;
      setCustomers(data.customers);
    } catch (err) {
      setListError(err instanceof Error ? err.message : "Unable to load customers.");
    } finally {
      setListLoading(false);
    }
  }

  async function fetchAccount(customerId: string) {
    setAccountLoading(true);
    setAccountError(null);
    setAccount(null);
    try {
      const res = await fetch(`/admin/customer-account?customer_id=${encodeURIComponent(customerId)}`);
      if (!res.ok) {
        throw new Error(res.status === 404 ? "Customer not found." : `Unable to load customer (${res.status})`);
      }
      const payload = (await res.json()) as CustomerAccountAdminResponse;
      setAccount(payload);
    } catch (err) {
      setAccountError(err instanceof Error ? err.message : "Unable to load customer.");
    } finally {
      setAccountLoading(false);
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const customerId = params.get("customer_id");
    if (customerId) {
      void fetchAccount(customerId);
    } else {
      void fetchCustomers("");
    }
  }, []);

  function handleSearch(value: string) {
    setSearch(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      void fetchCustomers(value);
    }, 300);
  }

  function handleSelectCustomer(customerId: string) {
    void fetchAccount(customerId);
  }

  function handleBack() {
    setAccount(null);
    setAccountError(null);
    void fetchCustomers(search);
  }

  const customer = account?.customer;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Heading level="h1">Customer Account</Heading>
          <Text className="mt-1 text-ui-fg-subtle">
            Medusa-backed customer profile, orders, requests, and notification activity.
          </Text>
        </div>
        {account ? (
          <Button size="small" variant="secondary" onClick={handleBack}>
            <ArrowLeft />
            All customers
          </Button>
        ) : null}
      </div>

      {/* Customer list view */}
      {!account && !accountLoading ? (
        <Container className="p-0">
          <div className="flex items-center gap-3 border-b border-ui-border-base px-4 py-3">
            <MagnifyingGlass className="text-ui-fg-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by name, email, or company…"
              className="h-8 min-w-0 flex-1 rounded border border-ui-border-base bg-ui-bg-base px-3 text-sm text-ui-fg-base outline-none focus:border-ui-border-interactive"
            />
          </div>

          {listError ? (
            <div className="p-4">
              <Text className="text-ui-fg-error">{listError}</Text>
            </div>
          ) : listLoading ? (
            <div className="p-6 text-center">
              <Text className="text-ui-fg-subtle">Loading customers…</Text>
            </div>
          ) : customers.length === 0 ? (
            <div className="p-6 text-center">
              <Text className="text-ui-fg-subtle">No customers found.</Text>
            </div>
          ) : (
            <div className="flex flex-col">
              {customers.map((c) => (
                <CustomerListRow key={c.id} customer={c} onSelect={handleSelectCustomer} />
              ))}
            </div>
          )}
        </Container>
      ) : null}

      {/* Loading state for account detail */}
      {accountLoading ? (
        <Container className="p-6 text-center">
          <Text className="text-ui-fg-subtle">Loading customer…</Text>
        </Container>
      ) : null}

      {/* Account detail error */}
      {accountError ? (
        <Container className="border-ui-border-error bg-ui-bg-base p-4">
          <Text className="text-ui-fg-error">{accountError}</Text>
        </Container>
      ) : null}

      {/* Account detail view */}
      {customer ? (
        <>
          <Container className="p-0">
            <div className="grid gap-6 p-6 md:grid-cols-[1fr_auto]">
              <div>
                <Text size="small" className="text-ui-fg-subtle">Customer</Text>
                <Heading level="h2" className="mt-1">{fullName(customer.firstName, customer.lastName)}</Heading>
                <Text className="mt-2 text-ui-fg-subtle">{customer.email}</Text>
                {customer.phone ? <Text className="text-ui-fg-subtle">{customer.phone}</Text> : null}
                {customer.companyName ? <Text className="text-ui-fg-subtle">{customer.companyName}</Text> : null}
              </div>
              <div className="grid gap-2 md:text-right">
                <span className={`text-sm font-medium ${customer.hasAccount ? "text-green-500" : "text-ui-fg-subtle"}`}>
                  {customer.hasAccount ? "Registered" : "Guest"}
                </span>
                <Text size="small" className="text-ui-fg-subtle">Created {formatDate(customer.createdAt)}</Text>
                <Text size="small" className="text-ui-fg-subtle">Updated {formatDate(customer.updatedAt)}</Text>
              </div>
            </div>
          </Container>

          <div className="grid gap-6 xl:grid-cols-2">
            <Container className="p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ReceiptPercent className="text-ui-fg-muted" />
                  <Heading level="h2">Orders</Heading>
                </div>
                <Badge color="grey">{account.orders.length}</Badge>
              </div>
              <div className="mt-5">
                {account.orders.length > 0 ? (
                  account.orders.map((order) => <OrderLine key={order.id} order={order} />)
                ) : (
                  <Text className="text-ui-fg-subtle">No orders for this customer.</Text>
                )}
              </div>
            </Container>

            <Container className="p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <MapPin className="text-ui-fg-muted" />
                  <Heading level="h2">Saved Addresses</Heading>
                </div>
                <Badge color="grey">{account.addresses.length}</Badge>
              </div>
              <div className="mt-5 grid gap-3">
                {account.addresses.length > 0 ? (
                  account.addresses.map((address) => <AddressLine key={address.id} address={address} />)
                ) : (
                  <Text className="text-ui-fg-subtle">No saved addresses for this customer.</Text>
                )}
              </div>
            </Container>

            <Container className="p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ChatBubbleLeftRight className="text-ui-fg-muted" />
                  <Heading level="h2">Requests</Heading>
                </div>
                <Badge color="grey">{account.requests.length}</Badge>
              </div>
              <div className="mt-5">
                {account.requests.length > 0 ? (
                  account.requests.map((request) => <RequestLine key={request.id} request={request} />)
                ) : (
                  <Text className="text-ui-fg-subtle">No quote or invoice requests for this customer.</Text>
                )}
              </div>
            </Container>

            <Container className="p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <BellAlert className="text-ui-fg-muted" />
                  <Heading level="h2">Notifications</Heading>
                </div>
                <Badge color="grey">{account.notifications.length}</Badge>
              </div>
              <div className="mt-5">
                {account.notifications.length > 0 ? (
                  account.notifications.map((notification) => (
                    <NotificationLine key={notification.id} notification={notification} />
                  ))
                ) : (
                  <Text className="text-ui-fg-subtle">No customer notification records.</Text>
                )}
              </div>
            </Container>
          </div>
        </>
      ) : null}
    </div>
  );
}

export const config = defineRouteConfig({
  label: "Customer Account",
  icon: Users,
  rank: 60,
});
