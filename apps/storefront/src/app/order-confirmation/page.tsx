import { Button } from "@blinds/ui";
import { Breadcrumbs } from "@blinds/ui";
import { SectionPanel } from "@blinds/ui";
import { Eyebrow } from "@blinds/ui";
import Link from "next/link";

import { formatPrice } from "@/lib/format-price";
import { getStoreOrderById } from "@/lib/medusa/orders";

type OrderConfirmationPageProps = {
  searchParams: Promise<{
    order_id?: string;
    email?: string;
    total?: string;
    currency?: string;
  }>;
};

function formatDate(value: string | Date | undefined) {
  if (!value) {
    return "Pending timestamp";
  }

  return new Date(value).toLocaleString();
}

function getOrderLabel(orderId: string, displayId?: number) {
  return displayId ? `#${displayId}` : orderId;
}

function formatAddress(address: {
  first_name?: string | null;
  last_name?: string | null;
  company?: string | null;
  address_1?: string | null;
  address_2?: string | null;
  city?: string | null;
  province?: string | null;
  postal_code?: string | null;
  country_code?: string | null;
}) {
  return [
    [address.first_name, address.last_name].filter(Boolean).join(" "),
    address.company,
    [address.address_1, address.address_2].filter(Boolean).join(", "),
    [address.city, address.province, address.postal_code].filter(Boolean).join(", "),
    address.country_code?.toUpperCase(),
  ].filter((line): line is string => Boolean(line && line.trim().length > 0));
}

export default async function OrderConfirmationPage({
  searchParams,
}: OrderConfirmationPageProps) {
  const params = await searchParams;
  const fallbackOrderId = params.order_id ?? "pending";
  const fallbackEmail = params.email ?? "customer@example.com";
  const fallbackTotal = Number(params.total ?? "0");
  const fallbackCurrency = params.currency ?? "USD";
  const order = params.order_id
    ? await getStoreOrderById(params.order_id, {
        email: params.email,
      })
    : null;

  const orderId = order?.id ?? fallbackOrderId;
  const displayId = order?.display_id;
  const orderEmail = order?.email ?? fallbackEmail;
  const total = order?.total ?? fallbackTotal;
  const currency = order?.currency_code?.toUpperCase() ?? fallbackCurrency;
  const status = order?.status ?? "received";
  const paymentStatus = order?.payment_status ?? "pending";
  const fulfillmentStatus = order?.fulfillment_status ?? "not_fulfilled";
  const items = order?.items ?? [];
  const shippingMethods = order?.shipping_methods ?? [];
  const shippingAddressLines = order?.shipping_address ? formatAddress(order.shipping_address) : [];

  return (
    <main className="page-section pb-20 pt-12">
      <div className="content-shell max-w-5xl">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Orders", href: "/orders" },
            { label: "Order Confirmation" },
          ]}
        />
        <SectionPanel as="section" className="px-6 py-10 md:px-8">
          <div className="flex items-start gap-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-olive text-xl text-white">
              ✓
            </div>
            <div className="min-w-0">
              <div className="flex min-h-12 items-center">
                <Eyebrow>Order Confirmed</Eyebrow>
              </div>
              <h1 className="mt-5 font-display text-[2.5rem] font-semibold leading-[1.04] tracking-tight text-slate sm:text-[3rem] md:text-5xl">
                Thank you for your order.
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate/72">
                Your order has been placed and is being processed. You'll receive a confirmation email
                at <span className="font-semibold text-slate break-all">{orderEmail}</span> shortly.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-x-6 gap-y-4 border-t border-black/6 pt-6 md:grid-cols-2 xl:grid-cols-[0.75fr_1.35fr_0.8fr_1fr]">
            <div className="min-w-0">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-brass">
                Order
              </p>
              <p className="mt-2 text-xl font-semibold text-slate">
                {getOrderLabel(orderId, displayId)}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-brass">
                Confirmation Email
              </p>
              <p className="mt-2 break-all text-base font-semibold leading-6 text-slate">{orderEmail}</p>
            </div>
            <div className="min-w-0">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-brass">
                Order Total
              </p>
              <p className="mt-2 text-[1.75rem] font-semibold leading-none text-slate">
                {formatPrice(total, currency)}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-brass">
                Status
              </p>
              <p className="mt-2 text-base font-semibold capitalize text-slate">
                {String(status).replaceAll("_", " ")}
              </p>
              <div className="mt-2 space-y-1 text-sm text-slate/68">
                <p>Payment {String(paymentStatus).replaceAll("_", " ")}</p>
                <p>Fulfillment {String(fulfillmentStatus).replaceAll("_", " ")}</p>
              </div>
            </div>
          </div>

          <p className="mt-4 text-sm text-slate/62">
            Placed on {formatDate(order?.created_at)}
          </p>

          {items.length > 0 ? (
            <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <section>
                <p className="text-base font-semibold text-slate">Items</p>
                <div className="mt-4 border-t border-black/6">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] gap-4 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-brass">
                    <p>Product</p>
                    <p>Qty</p>
                    <p>Price</p>
                  </div>
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-[minmax(0,1fr)_auto_auto] gap-4 border-t border-black/6 py-4"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate">
                          {item.product_title ?? item.title ?? "Order item"}
                        </p>
                        <p className="mt-1 text-sm text-slate/68">
                          {item.variant_title ?? item.variant?.title ?? "Configured variant"}
                        </p>
                      </div>
                      <p className="text-sm text-slate/68">{item.quantity}</p>
                      <p className="text-sm font-semibold text-slate">
                        {formatPrice(item.total ?? 0, currency)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <p className="text-base font-semibold text-slate">Delivery</p>
                <div className="mt-4 border-t border-black/6 pt-4">
                  <div className="grid gap-5 text-sm leading-6 text-slate/72">
                    <div className="grid gap-1">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-brass">
                        Ship to
                      </p>
                      {shippingAddressLines.length > 0 ? (
                        shippingAddressLines.map((line, index) => (
                          <p
                            key={`${line}-${index}`}
                            className={index === 0 ? "font-semibold text-slate" : ""}
                          >
                            {line}
                          </p>
                        ))
                      ) : (
                        <p>Shipping address details are not available on this order yet.</p>
                      )}
                    </div>

                    <div className="grid gap-1 border-t border-black/6 pt-4">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-brass">
                        Method
                      </p>
                      {shippingMethods.length > 0 ? (
                        shippingMethods.map((method) => (
                          <p key={method.id}>
                            {method.name} · {formatPrice(method.amount ?? 0, currency)}
                          </p>
                        ))
                      ) : (
                        <p>No shipping method details returned for this order.</p>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          ) : null}

          <div className="mt-10 border-t border-black/6 pt-6">
            <p className="text-sm font-semibold text-slate">What happens next</p>
            <div className="mt-4 grid gap-3 text-sm leading-6 text-slate/72">
              <p>Our team in Bedford, TX will cut and prepare your order.</p>
              <p>You'll receive a shipping notification once your order is on its way.</p>
              <p>Custom-size orders typically ship within 2–6 business days depending on the product.</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="default"><Link
              href="/orders"
            >
              View orders
            </Link></Button>
            <Button asChild variant="secondary"><Link
              href={`/track-order?order=${encodeURIComponent(orderId)}&email=${encodeURIComponent(orderEmail)}`}
            >
              Track this order
            </Link></Button>
            <Button asChild variant="secondary"><Link
              href="/products"
            >
              Continue shopping
            </Link></Button>
          </div>
        </SectionPanel>
      </div>
    </main>
  );
}
