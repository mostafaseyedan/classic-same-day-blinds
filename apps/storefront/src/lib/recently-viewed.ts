const KEY = "recently_viewed";
const MAX = 8;

export type RecentProduct = {
  slug: string;
  name: string;
  categoryLabel: string;
  price: number;
  originalPrice: number | null;
  image: string;
  badge: string;
};

export function addRecentlyViewed(product: RecentProduct): void {
  if (typeof window === "undefined") return;
  try {
    const existing: RecentProduct[] = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    const filtered = existing.filter((p) => p.slug !== product.slug);
    const updated = [product, ...filtered].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("recently-viewed-updated"));
  } catch {
    // ignore
  }
}

export function getRecentlyViewed(): RecentProduct[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}
