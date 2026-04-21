import { Input } from "@blinds/ui";
import { Button } from "@blinds/ui";
import { Breadcrumbs } from "@blinds/ui";
import { Label } from "@blinds/ui";
import { SectionPanel, SurfaceMuted } from "@blinds/ui";
import { Eyebrow, PageCopy, TaskPageTitle } from "@blinds/ui";
import Link from "next/link";

import { getStoreOrderById } from "@/lib/medusa/orders";

type TrackOrderPageProps = {
  searchParams?: Promise<{
    order?: string;
    email?: string;
  }>;
};

function formatDate(value: string | Date | null | undefined) {
  if (!value) {
    return null;
  }

  return new Date(value).toLocaleString();
}

export default async function TrackOrderPage({ searchParams }: TrackOrderPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const orderId = params?.order ?? "";
  const email = params?.email ?? "";
  const order =
    orderId.trim().length > 0 && email.trim().length > 0
      ? await getStoreOrderById(orderId, { email })
      : null;
  const fulfillment = order?.fulfillments?.[0];
  const shippedAt = formatDate(fulfillment?.shipped_at);
  const deliveredAt = formatDate(fulfillment?.delivered_at);

  return (
    <main className="page-section pb-20 pt-10">
      <div className="content-shell max-w-6xl">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Support", href: "/contact" },
            { label: "Track Order" },
          ]}
        />
        <SectionPanel as="section" className="px-6 py-10 md:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
            <div>
              <Eyebrow>Track Order</Eyebrow>
              <TaskPageTitle>
                Check the latest shipping and delivery updates.
              </TaskPageTitle>
              <PageCopy className="max-w-[34rem]">
                Enter your order number and the email used at checkout to view the latest status for
                your shipment.
              </PageCopy>

              <div className="mt-8 border-t border-black/6 pt-6">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-brass">
                  You can view
                </p>
                <div className="mt-4 grid gap-4">
                  {[
                    "Current order and payment status.",
                    "Shipping progress and delivery updates.",
                    "Whether the order has shipped or been delivered yet.",
                  ].map((item) => (
                    <div key={item} className="border-t border-black/6 pt-4 first:border-t-0 first:pt-0">
                      <p className="text-sm leading-6 text-slate/76">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <SurfaceMuted className="px-6 py-6">
              <form className="grid gap-4" action="/track-order">
                <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
                  <label className="grid gap-2">
                    <Label as="span" variant="default">Order number</Label>
                    <Input
                      type="text"
                      name="order"
                      defaultValue={orderId}
                      placeholder="order_..."
                    />
                  </label>
                  <label className="grid gap-2">
                    <Label as="span" variant="default">Email</Label>
                    <Input
                      type="email"
                      name="email"
                      defaultValue={email}
                      placeholder="you@example.com"
                    />
                  </label>
                </div>
                <Button variant="default" type="submit" className="w-full justify-center">
                  Check status
                </Button>
              </form>

              <div className="mt-8 border-t border-black/6 pt-6">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-brass">
                  {order ? "Order status" : "Tracking details"}
                </p>
                {order ? (
                  <div className="mt-4 grid gap-5 text-sm leading-6 text-slate/72">
                    <div className="grid gap-1">
                      <p className="font-semibold text-slate">
                        Order {order.display_id ? `#${order.display_id}` : order.id}
                      </p>
                      <p>Status: {String(order.status).replaceAll("_", " ")}</p>
                      <p>Payment: {String(order.payment_status).replaceAll("_", " ")}</p>
                      <p>Fulfillment: {String(order.fulfillment_status).replaceAll("_", " ")}</p>
                    </div>

                    <div className="grid gap-1 border-t border-black/6 pt-4">
                      <p className="font-semibold text-slate">Shipment activity</p>
                      <p>Shipped: {shippedAt ?? "Not shipped yet"}</p>
                      <p>Delivered: {deliveredAt ?? "Not delivered yet"}</p>
                    </div>
                  </div>
                ) : orderId || email ? (
                  <p className="mt-3 text-sm leading-6 text-slate/70">
                    We could not find an order that matches that order number and email address.
                  </p>
                ) : (
                  <p className="mt-3 text-sm leading-6 text-slate/70">
                    Enter your details above to view the latest shipment and delivery information.
                  </p>
                )}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild variant="default"><Link href="/orders">
                  View orders
                </Link></Button>
                <Button asChild variant="secondary"><Link href="/contact">
                  Contact support
                </Link></Button>
              </div>
            </SurfaceMuted>
          </div>
        </SectionPanel>
      </div>
    </main>
  );
}
