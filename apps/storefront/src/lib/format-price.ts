/** Monetary amounts from Medusa are in the major currency unit (dollars for USD). Format directly. */
export function formatPrice(amount: number, currencyCode = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode.toUpperCase(),
    maximumFractionDigits: 2,
  }).format(amount);
}
