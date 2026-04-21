"use client";
import { Button } from "@blinds/ui";

import Link from "next/link";

import { useStorefront } from "@/components/storefront/storefront-provider";

export function CartLink() {
  const { cartQuantity } = useStorefront();

  return (
    <Button asChild variant="secondary"><Link
      href="/cart"
      className="relative px-4"
    >
      Cart
      <span className="ml-2 inline-flex min-w-6 items-center justify-center rounded-xl bg-shell px-1.5 py-0.5 text-xs text-slate">
        {cartQuantity}
      </span>
    </Link></Button>
  );
}
