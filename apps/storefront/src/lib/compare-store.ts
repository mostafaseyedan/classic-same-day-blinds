
import type { CatalogProduct } from "@/lib/medusa/catalog";

export const COMPARE_STORAGE_KEY = "blinds_compare_items";
export const COMPARE_EVENT = "compare-updated";

export type CompareItem = Pick<CatalogProduct, "id" | "slug" | "name" | "image" | "price" | "originalPrice" | "categoryLabel" | "badge" | "highlights">;

export const getCompareItems = (): CompareItem[] => {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(COMPARE_STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
};

export const toggleCompare = (product: CompareItem): void => {
  if (typeof window === "undefined") return;
  const current = getCompareItems();
  let updated: CompareItem[];
  
  if (current.some((i) => i.id === product.id)) {
    updated = current.filter((i) => i.id !== product.id);
  } else {
    if (current.length >= 3) return; // max 3
    const item: CompareItem = {
      id: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      price: product.price,
      originalPrice: product.originalPrice,
      categoryLabel: product.categoryLabel,
      badge: product.badge,
      highlights: product.highlights,
    };
    updated = [...current, item];
  }
  
  localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent(COMPARE_EVENT));
};

export const clearCompare = (): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(COMPARE_STORAGE_KEY, "[]");
  window.dispatchEvent(new CustomEvent(COMPARE_EVENT));
};
