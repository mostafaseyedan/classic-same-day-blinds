"use client";

import { CloseButton, cn } from "@blinds/ui";
import Link from "next/link";
import { useState } from "react";
import { Wrench, Truck, Package } from "@phosphor-icons/react";

import { useCustomer } from "@/components/customer/customer-provider";

const STATUS_CONFIG: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; label: string; bg: string; text: string; border: string }
> = {
  pending: {
    icon: Wrench,
    label: "Being Prepared",
    bg: "bg-brass/8",
    text: "text-[#7a5628]",
    border: "border-brass/30",
  },
  processing: {
    icon: Wrench,
    label: "In Production",
    bg: "bg-brass/8",
    text: "text-[#7a5628]",
    border: "border-brass/30",
  },
  shipped: {
    icon: Truck,
    label: "Shipped",
    bg: "bg-mist/60",
    text: "text-olive",
    border: "border-olive/25",
  },
  delivered: {
    icon: Package,
    label: "Delivered",
    bg: "bg-mist/60",
    text: "text-olive",
    border: "border-olive/25",
  },
};

const DISMISSED_KEY = "blinds_dismissed_order_banners";

function readDismissed(): Set<string> {
  try {
    const raw = sessionStorage.getItem(DISMISSED_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function writeDismissed(ids: Set<string>) {
  try {
    sessionStorage.setItem(DISMISSED_KEY, JSON.stringify([...ids]));
  } catch {
    // sessionStorage unavailable — silent fail
  }
}

export function OrderStatusBanner() {
  const { isAuthenticated, orders } = useCustomer();
  const [dismissed, setDismissed] = useState<Set<string>>(() => readDismissed());

  if (!isAuthenticated || !orders || orders.length === 0) return null;

  const activeOrders = orders.filter((order) => {
    const status = order.status?.toLowerCase() ?? "";
    return (
      ["pending", "processing", "shipped"].includes(status) &&
      !dismissed.has(order.id)
    );
  });

  if (activeOrders.length === 0) return null;

  const order = activeOrders[0];
  const status = order.status?.toLowerCase() ?? "pending";
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const Icon = config.icon;

  return (
    <div className={`relative z-40 border-b ${config.border} ${config.bg} px-4 py-3`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${config.border} bg-white`}>
            <Icon className={`h-4 w-4 ${config.text}`} />
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className={`text-sm font-semibold ${config.text}`}>
              Order Update
            </span>
            <span className={`rounded-full border ${config.border} bg-white px-2 py-0.5 text-xs font-semibold ${config.text}`}>
              {config.label}
            </span>
            <span className={`text-xs ${config.text} opacity-75`}>
              #{order.displayId ?? order.id.slice(0, 8).toUpperCase()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/orders"
            className={`hidden text-xs font-semibold underline underline-offset-2 sm:block ${config.text}`}
          >
            Track Order
          </Link>
          <CloseButton
            onClick={() => setDismissed((prev) => {
              const next = new Set([...prev, ...activeOrders.map((o) => o.id)]);
              writeDismissed(next);
              return next;
            })}
            variant="ghost"
            size="sm"
            className={cn("opacity-60 hover:opacity-100", config.text)}
            aria-label="Dismiss"
          />
        </div>
      </div>
    </div>
  );
}
