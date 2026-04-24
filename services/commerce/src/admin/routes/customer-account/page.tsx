import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Badge, Button, Container, Heading, Text } from "@medusajs/ui";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";

import type {
  CustomerAccountAdminAddress,
  CustomerAccountAdminOrder,
  CustomerAccountAdminResponse,
  CustomerOpsRequestRecord,
  NotificationRecord,
} from "@blinds/types";

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

function fullName(firstName?: string, lastName?: string) {
  return [firstName, lastName].filter(Boolean).join(" ") || "No name";
}

function statusColor(status: string): "green" | "orange" | "grey" | "blue" | "red" {
  if (status === "completed" || status === "sent") return "green";
  if (status === "approved") return "blue";
  if (status === "reviewed" || status === "pending") return "orange";
  if (status === "failed") return "red";
  return "grey";
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
          {address.isDefaultShipping ? <Badge color="blue">Default shipping</Badge> : null}
          {address.isDefaultBilling ? <Badge color="green">Default billing</Badge> : null}
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
    <div className="grid gap-3 border-t border-ui-border-base py-4 first:border-t-0 first:pt-0 md:grid-cols-[1fr_auto_auto] md:items-center">
      <div>
        <Text weight="plus">Order {order.displayId ? `#${order.displayId}` : order.id}</Text>
        <Text size="small" className="mt-1 text-ui-fg-subtle">{formatDate(order.createdAt)}</Text>
      </div>
      <Badge color={statusColor(order.status)}>{order.status}</Badge>
      <div className="text-left md:text-right">
        <Text weight="plus">{formatMoney(order.total, order.currencyCode)}</Text>
        <Text size="small" className="text-ui-fg-subtle">{order.itemCount} item{order.itemCount === 1 ? "" : "s"}</Text>
      </div>
    </div>
  );
}

function RequestLine({ request }: { request: CustomerOpsRequestRecord }) {
  return (
    <div className="border-t border-ui-border-base py-4 first:border-t-0 first:pt-0">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Text weight="plus">{request.type === "invoice" ? "Invoice request" : "Quote request"}</Text>
          <Text size="small" className="mt-1 text-ui-fg-subtle">{formatDate(request.submittedAt)}</Text>
        </div>
        <Badge color={statusColor(request.status)}>{request.status}</Badge>
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
      <div className="flex items-start justify-between gap-3">
        <div>
          <Text weight="plus">{notification.subject}</Text>
          <Text size="small" className="mt-1 text-ui-fg-subtle">{notification.kind}</Text>
        </div>
        <Badge color={statusColor(notification.status)}>{notification.status}</Badge>
      </div>
      <Text size="small" className="mt-2 text-ui-fg-subtle">{formatDate(notification.createdAt)}</Text>
      {notification.failureReason ? (
        <Text size="small" className="mt-2 text-ui-fg-error">{notification.failureReason}</Text>
      ) : null}
    </div>
  );
}

export default function CustomerAccountPage() {
  const [email, setEmail] = useState("");
  const [account, setAccount] = useState<CustomerAccountAdminResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchAccount(params: URLSearchParams) {
    setLoading(true);
    setError(null);
    setAccount(null);

    try {
      const response = await fetch(`/admin/customer-account?${params.toString()}`);

      if (!response.ok) {
        throw new Error(response.status === 404 ? "Customer not found." : `Unable to load customer (${response.status})`);
      }

      const payload = (await response.json()) as CustomerAccountAdminResponse;
      setAccount(payload);
      setEmail(payload.customer.email);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load customer.");
    } finally {
      setLoading(false);
    }
  }

  async function loadAccount(event?: FormEvent<HTMLFormElement>, customerId?: string) {
    event?.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedCustomerId = customerId?.trim() ?? "";

    if (!trimmedEmail && !trimmedCustomerId) {
      setError("Enter a customer email.");
      return;
    }

    const params = new URLSearchParams();
    if (trimmedCustomerId) {
      params.set("customer_id", trimmedCustomerId);
    } else {
      params.set("email", trimmedEmail);
    }

    await fetchAccount(params);
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const customerId = params.get("customer_id");
    const initialEmail = params.get("email");

    if (initialEmail) {
      setEmail(initialEmail);
    }

    if (customerId) {
      void loadAccount(undefined, customerId);
    } else if (initialEmail) {
      const query = new URLSearchParams({ email: initialEmail });
      void fetchAccount(query);
    }
  }, []);

  const customer = account?.customer;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Heading level="h1">Customer Account</Heading>
          <Text className="mt-1 text-ui-fg-subtle">
            Medusa-backed customer profile, orders, requests, and notification activity.
          </Text>
        </div>
        <form onSubmit={(event) => void loadAccount(event)} className="flex w-full max-w-xl gap-2">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="customer@example.com"
            className="h-8 min-w-0 flex-1 rounded border border-ui-border-base bg-ui-bg-base px-3 text-sm text-ui-fg-base outline-none focus:border-ui-border-interactive"
          />
          <Button type="submit" size="small" disabled={loading}>
            {loading ? "Loading..." : "Load"}
          </Button>
        </form>
      </div>

      {error ? (
        <Container className="border-ui-border-error bg-ui-bg-base p-4">
          <Text className="text-ui-fg-error">{error}</Text>
        </Container>
      ) : null}

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
                <Badge color={customer.hasAccount ? "green" : "grey"}>{customer.hasAccount ? "Registered" : "Guest"}</Badge>
                <Text size="small" className="text-ui-fg-subtle">Created {formatDate(customer.createdAt)}</Text>
                <Text size="small" className="text-ui-fg-subtle">Updated {formatDate(customer.updatedAt)}</Text>
              </div>
            </div>
          </Container>

          <div className="grid gap-6 xl:grid-cols-2">
            <Container className="p-6">
              <div className="flex items-center justify-between gap-3">
                <Heading level="h2">Orders</Heading>
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
                <Heading level="h2">Saved Addresses</Heading>
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
                <Heading level="h2">Requests</Heading>
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
                <Heading level="h2">Notifications</Heading>
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
});
