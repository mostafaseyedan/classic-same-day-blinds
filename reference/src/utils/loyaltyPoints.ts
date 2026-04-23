export const POINTS_PER_DOLLAR = 10;
export const POINTS_EXPIRY_MONTHS = 12;
export const EXPIRY_WARNING_DAYS = 30;

/** 100 points = $1 off at checkout */
export const POINTS_PER_REDEMPTION_DOLLAR = 100;
/** Minimum points that can be applied in a single checkout */
export const MIN_REDEMPTION_POINTS = 100;

export interface LoyaltyTier {
  name: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  min: number;
  max: number | null;
  color: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  multiplier: number;
  icon: string;
}

export const TIERS: LoyaltyTier[] = [
  {
    name: 'Bronze',
    min: 0,
    max: 999,
    color: '#CD7F32',
    bgClass: 'bg-amber-50',
    textClass: 'text-amber-700',
    borderClass: 'border-amber-200',
    multiplier: 1,
    icon: 'ri-medal-line',
  },
  {
    name: 'Silver',
    min: 1000,
    max: 2499,
    color: '#9CA3AF',
    bgClass: 'bg-gray-100',
    textClass: 'text-gray-600',
    borderClass: 'border-gray-300',
    multiplier: 1.25,
    icon: 'ri-medal-2-line',
  },
  {
    name: 'Gold',
    min: 2500,
    max: 4999,
    color: '#D97706',
    bgClass: 'bg-yellow-50',
    textClass: 'text-yellow-700',
    borderClass: 'border-yellow-300',
    multiplier: 1.5,
    icon: 'ri-vip-crown-line',
  },
  {
    name: 'Platinum',
    min: 5000,
    max: null,
    color: '#6B7280',
    bgClass: 'bg-slate-100',
    textClass: 'text-slate-700',
    borderClass: 'border-slate-300',
    multiplier: 2,
    icon: 'ri-vip-diamond-line',
  },
];

export interface RedemptionReward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  icon: string;
  value: string;
  minOrder?: number;
}

export const REWARDS: RedemptionReward[] = [
  {
    id: '5_off',
    title: '$5 Off',
    description: 'Instant $5 discount on your next order',
    pointsCost: 500,
    icon: 'ri-coupon-line',
    value: '$5.00 off',
  },
  {
    id: '10_pct',
    title: '10% Off',
    description: '10% off your entire cart',
    pointsCost: 1000,
    icon: 'ri-percent-line',
    value: '10% off',
  },
  {
    id: '15_off',
    title: '$15 Off',
    description: 'Save $15 on orders of $50 or more',
    pointsCost: 1500,
    icon: 'ri-coupon-3-line',
    value: '$15.00 off',
    minOrder: 50,
  },
  {
    id: '25_off',
    title: '$25 Off',
    description: 'Save $25 on orders of $100 or more',
    pointsCost: 2500,
    icon: 'ri-gift-line',
    value: '$25.00 off',
    minOrder: 100,
  },
];

export interface PointsHistoryEntry {
  id: string;
  orderId: string;
  orderTotal: number;
  pointsEarned: number;
  date: string;
  expiryDate: Date;
  isExpired: boolean;
  isExpiringSoon: boolean;
}

// ── Expiry helpers ────────────────────────────────────────────────────────────

export function getPointsExpiryDate(orderDate: string): Date {
  const d = new Date(orderDate);
  d.setMonth(d.getMonth() + POINTS_EXPIRY_MONTHS);
  return d;
}

export function isPointsExpired(orderDate: string): boolean {
  return getPointsExpiryDate(orderDate) <= new Date();
}

export function isPointsExpiringSoon(orderDate: string, withinDays = EXPIRY_WARNING_DAYS): boolean {
  const expiry = getPointsExpiryDate(orderDate);
  const now = new Date();
  const threshold = new Date(now);
  threshold.setDate(threshold.getDate() + withinDays);
  return expiry > now && expiry <= threshold;
}

export function calculatePointsFromOrders(orders: { id: string; total: number; date: string }[]): number {
  return orders
    .filter((o) => !isPointsExpired(o.date))
    .reduce((sum, o) => sum + Math.floor(o.total * POINTS_PER_DOLLAR), 0);
}

export function buildPointsHistory(
  orders: { id: string; total: number; date: string }[]
): PointsHistoryEntry[] {
  return orders.map((o) => {
    const expiryDate = getPointsExpiryDate(o.date);
    return {
      id: `ph_${o.id}`,
      orderId: o.id,
      orderTotal: o.total,
      pointsEarned: Math.floor(o.total * POINTS_PER_DOLLAR),
      date: o.date,
      expiryDate,
      isExpired: isPointsExpired(o.date),
      isExpiringSoon: isPointsExpiringSoon(o.date),
    };
  });
}

/** Returns total points that will expire within the next EXPIRY_WARNING_DAYS days */
export function getExpiringSoonPoints(orders: { id: string; total: number; date: string }[]): number {
  return orders
    .filter((o) => isPointsExpiringSoon(o.date))
    .reduce((sum, o) => sum + Math.floor(o.total * POINTS_PER_DOLLAR), 0);
}

export function getTier(points: number): LoyaltyTier {
  return [...TIERS].reverse().find((t) => points >= t.min) ?? TIERS[0];
}

export function getNextTier(points: number): LoyaltyTier | null {
  const current = getTier(points);
  const idx = TIERS.findIndex((t) => t.name === current.name);
  return TIERS[idx + 1] ?? null;
}

export function getTierProgress(points: number): number {
  const current = getTier(points);
  const next = getNextTier(points);
  if (!next) return 100;
  const range = next.min - current.min;
  const progress = points - current.min;
  return Math.min(Math.round((progress / range) * 100), 100);
}

export interface RedeemedItem {
  rewardId: string;
  timestamp: number;
  rewardTitle: string;
}

export function getRedeemedHistory(): RedeemedItem[] {
  try {
    return JSON.parse(localStorage.getItem('loyalty_redeemed') ?? '[]');
  } catch {
    return [];
  }
}

export function redeemReward(reward: RedemptionReward): void {
  const history = getRedeemedHistory();
  history.unshift({ rewardId: reward.id, timestamp: Date.now(), rewardTitle: reward.title });
  localStorage.setItem('loyalty_redeemed', JSON.stringify(history));
}

/** Convert points to dollar discount value */
export function pointsToDiscount(points: number): number {
  return points / POINTS_PER_REDEMPTION_DOLLAR;
}

/** Convert a dollar amount to the equivalent points cost (rounded up) */
export function discountToPoints(dollars: number): number {
  return Math.ceil(dollars * POINTS_PER_REDEMPTION_DOLLAR);
}

/** Clamp points to the maximum redeemable given available balance and order total */
export function clampRedemption(
  requested: number,
  availablePoints: number,
  orderTotal: number
): number {
  const maxByBalance = Math.floor(availablePoints / MIN_REDEMPTION_POINTS) * MIN_REDEMPTION_POINTS;
  const maxByOrder = Math.floor(orderTotal * POINTS_PER_REDEMPTION_DOLLAR / MIN_REDEMPTION_POINTS) * MIN_REDEMPTION_POINTS;
  return Math.min(requested, maxByBalance, maxByOrder);
}

// ── Checkout redemption tracking (separate from reward-redemptions) ───────────

export interface CheckoutRedemption {
  id: string;
  orderId: string;
  points: number;
  discount: number;
  timestamp: number;
}

export function getCheckoutRedemptions(): CheckoutRedemption[] {
  try {
    return JSON.parse(localStorage.getItem('checkout_redemptions') ?? '[]');
  } catch {
    return [];
  }
}

export function recordCheckoutRedemption(
  orderId: string,
  points: number,
  discount: number
): void {
  const history = getCheckoutRedemptions();
  history.unshift({ id: `cr_${Date.now()}`, orderId, points, discount, timestamp: Date.now() });
  localStorage.setItem('checkout_redemptions', JSON.stringify(history));
}

export function getTotalCheckoutSpentPoints(): number {
  return getCheckoutRedemptions().reduce((sum, r) => sum + r.points, 0);
}

export function getSpentPoints(): number {
  const rewardHistory = getRedeemedHistory();
  const rewardSpent = rewardHistory.reduce((sum, item) => {
    const r = REWARDS.find((rw) => rw.id === item.rewardId);
    return sum + (r?.pointsCost ?? 0);
  }, 0);
  const checkoutSpent = getTotalCheckoutSpentPoints();
  return rewardSpent + checkoutSpent;
}
