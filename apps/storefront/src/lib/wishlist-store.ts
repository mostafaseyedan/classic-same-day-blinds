import type { CatalogProduct } from "@/lib/medusa/catalog";

const KEY = "blinds_wishlist";
const EVENT = "wishlist-updated";

export type WishlistItem = Pick<
  CatalogProduct,
  "id" | "slug" | "name" | "image" | "price" | "originalPrice" | "currencyCode" | "categoryLabel" | "badge" | "highlights"
>;

export function getWishlistItems(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function isInWishlist(id: string): boolean {
  return getWishlistItems().some((i) => i.id === id);
}

export function toggleWishlist(product: CatalogProduct): void {
  if (typeof window === "undefined") return;
  const current = getWishlistItems();
  let updated: WishlistItem[];

  if (current.some((i) => i.id === product.id)) {
    updated = current.filter((i) => i.id !== product.id);
  } else {
    const item: WishlistItem = {
      id: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      price: product.price,
      originalPrice: product.originalPrice,
      currencyCode: product.currencyCode,
      categoryLabel: product.categoryLabel,
      badge: product.badge,
      highlights: product.highlights,
    };
    updated = [item, ...current];
  }

  localStorage.setItem(KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function removeFromWishlist(id: string): void {
  if (typeof window === "undefined") return;
  const updated = getWishlistItems().filter((i) => i.id !== id);
  localStorage.setItem(KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent(EVENT));
}

export { EVENT as WISHLIST_EVENT };
