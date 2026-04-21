"use client";
import { Breadcrumbs } from "@blinds/ui";
import { Button } from "@blinds/ui";
import { SectionPanel, SurfaceMuted } from "@blinds/ui";
import { Eyebrow, PageCopy, TaskPageTitle } from "@blinds/ui";

import Link from "next/link";

import { formatPrice } from "@/lib/format-price";
import { useCustomer } from "@/components/customer/customer-provider";

export default function OrdersPage() {
  const { isLoading, isAuthenticated, orders, customer, error } = useCustomer();

  return (
    <main className="page-section pb-20 pt-10">
      <div className="content-shell max-w-5xl">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Account", href: "/account" },
            { label: "Orders" },
          ]}
        />
        <SectionPanel as="section" className="px-6 py-10 md:px-8">
          <Eyebrow>Orders</Eyebrow>
          <TaskPageTitle>
            Your order history
          </TaskPageTitle>
          <PageCopy className="max-w-[34rem]">
            All orders placed under your account are listed here. Each order shows current status,
            line items, and the total charged at checkout.
          </PageCopy>

          {isLoading ? (
            <SurfaceMuted className="mt-8 px-5 py-5 text-sm text-slate/72">
              Loading orders...
            </SurfaceMuted>
          ) : !isAuthenticated || !customer ? (
            <div className="mt-8 border-t border-black/6 pt-8 text-center">
              <p className="text-lg font-semibold text-slate">Sign in to view your orders.</p>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate/68">
                Order history is available once you sign in with the email used for your purchases.
              </p>
              <Button asChild variant="default"><Link
                href="/auth"
                className="mt-6"
              >
                Go to sign in
              </Link></Button>
            </div>
          ) : orders.length === 0 ? (
            <div className="mt-8 border-t border-black/6 pt-8 text-center">
              <p className="text-lg font-semibold text-slate">No orders yet.</p>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate/68">
                Once a checkout completes for {customer.email}, the order will appear here.
              </p>
              <Button asChild variant="secondary"><Link
                href="/products"
                className="mt-6"
              >
                Browse products
              </Link></Button>
            </div>
          ) : (
            <div className="mt-8 border-t border-black/6">
              {orders.map((order) => (
                <article
                  key={order.id}
                  className="border-t border-black/6 py-5 first:border-t-0 first:pt-0"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate">
                        Order {order.display_id ? `#${order.display_id}` : order.id}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate/72">
                        Placed {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-olive">
                        {order.status}
                      </p>
                      <p className="mt-2 text-lg font-semibold text-slate">
                        {formatPrice(order.total ?? 0, order.currency_code?.toUpperCase() ?? "USD")}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3">
                    {(order.items ?? []).map((item) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 border-t border-black/6 py-3 first:border-t-0 first:pt-0"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate">
                            {item.product_title ?? item.title ?? "Order item"}
                          </p>
                          <p className="mt-1 text-sm text-slate/68">Qty {item.quantity}</p>
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

          {error ? <p className="mt-6 text-sm leading-6 text-olive">{error}</p> : null}
        </SectionPanel>
      </div>
    </main>
  );
}
