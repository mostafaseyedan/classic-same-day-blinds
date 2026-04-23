export const WISHLIST_KEY = 'wishlist_ids';
export const WISHLIST_EVENT = 'wishlist-updated';

export function getWishlistIds(): number[] {
  try {
    const stored = localStorage.getItem(WISHLIST_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function isInWishlist(id: number): boolean {
  return getWishlistIds().includes(id);
}

export function toggleWishlist(id: number): boolean {
  const ids = getWishlistIds();
  let added = false;
  const updated = ids.includes(id) ? ids.filter((i) => i !== id) : (added = true, [...ids, id]);
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent(WISHLIST_EVENT, { detail: updated }));
  return added;
}

export function addToWishlist(id: number): void {
  const ids = getWishlistIds();
  if (!ids.includes(id)) {
    const updated = [...ids, id];
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(WISHLIST_EVENT, { detail: updated }));
  }
}

export function removeFromWishlist(id: number): void {
  const updated = getWishlistIds().filter((i) => i !== id);
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent(WISHLIST_EVENT, { detail: updated }));
}
