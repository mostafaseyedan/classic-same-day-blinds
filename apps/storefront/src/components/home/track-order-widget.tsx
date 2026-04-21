"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function TrackOrderWidget() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const params = new URLSearchParams();
    if (orderNumber.trim()) {
      params.set("order", orderNumber.trim().toUpperCase());
    }
    if (email.trim()) {
      params.set("email", email.trim());
    }

    router.push(params.size ? `/track-order?${params.toString()}` : "/track-order");
  };

  return (
    <section className="bg-white/45 px-6 py-16 md:px-10 lg:px-14">
      <div className="mx-auto max-w-5xl rounded-[2rem] border border-black/6 bg-white px-6 py-10 shadow-[0_24px_70px_rgba(24,36,34,0.08)] md:px-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-olive">Track Order</p>
          <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight text-slate md:text-5xl">
            Give order tracking a real entry point on the homepage.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate/72">
            The legacy widget searched browser storage. This version routes customers into the new
            tracking page with the order number and email they provide, ready for real backend
            lookup when order status endpoints are available.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-4 md:grid-cols-[1.1fr_1.1fr_auto] md:items-end">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate">Order number</span>
            <input
              type="text"
              value={orderNumber}
              onChange={(event) => setOrderNumber(event.target.value)}
              placeholder="ORD-12345"
              className="rounded-2xl border border-black/8 bg-shell px-4 py-3 text-sm text-slate outline-none transition focus:border-brass"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="rounded-2xl border border-black/8 bg-shell px-4 py-3 text-sm text-slate outline-none transition focus:border-brass"
            />
          </label>

          <button
            type="submit"
            className="rounded-full bg-slate px-6 py-3 text-sm font-semibold text-shell transition hover:bg-olive"
          >
            Track order
          </button>
        </form>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Status visibility",
              copy: "Order lookup will eventually reflect fulfillment, shipment, and delivery milestones.",
            },
            {
              title: "Support escalation",
              copy: "When lookup fails, the tracking route can hand off cleanly to customer support.",
            },
            {
              title: "Account continuity",
              copy: "This becomes the lightweight public path beside the authenticated orders area.",
            },
          ].map((item) => (
            <article key={item.title} className="rounded-[1.5rem] border border-black/6 bg-shell px-5 py-5">
              <p className="text-sm font-semibold text-slate">{item.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate/70">{item.copy}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/track-order"
            className="rounded-full border border-black/10 px-5 py-3 text-sm font-semibold text-slate transition hover:border-brass hover:text-brass"
          >
            Open full tracking page
          </Link>
          <Link
            href="/orders"
            className="rounded-full border border-black/10 px-5 py-3 text-sm font-semibold text-slate transition hover:border-brass hover:text-brass"
          >
            View orders area
          </Link>
        </div>
      </div>
    </section>
  );
}
