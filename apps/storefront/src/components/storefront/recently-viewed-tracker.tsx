"use client";

import { useEffect } from "react";
import { addRecentlyViewed, type RecentProduct } from "@/lib/recently-viewed";

export function RecentlyViewedTracker({ product }: { product: RecentProduct }) {
  useEffect(() => {
    addRecentlyViewed(product);
  }, [product.slug]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
