export const REFERRAL_BONUS_POINTS = 500;
export const REFEREE_FIRST_ORDER_DISCOUNT = 10; // 10% off for the new customer

export interface ReferralEntry {
  id: string;
  referrerCode: string;
  refereeHint?: string; // Masked email hint e.g. "sa***@example.com"
  orderId: string;
  timestamp: number;
  bonusPoints: number;
  status: 'pending' | 'credited';
}

// ── Code generation ──────────────────────────────────────────────────────────

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36).toUpperCase().padStart(8, '0').slice(0, 8);
}

export function generateReferralCode(identifier: string): string {
  return `REF${hashString(identifier)}`;
}

export function getOrCreateReferralCode(identifier: string): string {
  const key = `referral_code_${identifier}`;
  const stored = localStorage.getItem(key);
  if (stored) return stored;
  const code = generateReferralCode(identifier);
  localStorage.setItem(key, code);
  return code;
}

export function buildReferralUrl(code: string): string {
  return `${window.location.origin}/products?ref=${code}`;
}

// ── URL capture (run on app init) ────────────────────────────────────────────

export function captureReferralFromURL(search: string): void {
  const params = new URLSearchParams(search);
  const ref = params.get('ref');
  if (ref && ref.startsWith('REF') && !localStorage.getItem('pending_referral_code')) {
    localStorage.setItem('pending_referral_code', ref);
  }
}

export function hasPendingReferral(): boolean {
  return !!localStorage.getItem('pending_referral_code');
}

// ── Storage helpers ──────────────────────────────────────────────────────────

export function getAllReferralEntries(): ReferralEntry[] {
  try {
    return JSON.parse(localStorage.getItem('referral_entries') ?? '[]');
  } catch {
    return [];
  }
}

export function getReferralsByCode(code: string): ReferralEntry[] {
  return getAllReferralEntries().filter((e) => e.referrerCode === code);
}

export function getTotalReferralBonusPoints(code: string): number {
  return getReferralsByCode(code)
    .filter((e) => e.status === 'credited')
    .reduce((sum, e) => sum + e.bonusPoints, 0);
}

// ── Process a referral when a new customer places their first order ──────────

export function processPendingReferral(orderId: string): boolean {
  const pendingCode = localStorage.getItem('pending_referral_code');
  if (!pendingCode) return false;

  // Only applies to first-ever order
  const existingOrders: { id: string }[] = JSON.parse(localStorage.getItem('orders') ?? '[]');
  const priorOrders = existingOrders.filter((o) => o.id !== orderId);
  if (priorOrders.length > 0) {
    localStorage.removeItem('pending_referral_code');
    return false;
  }

  const entry: ReferralEntry = {
    id: `ref_${Date.now()}`,
    referrerCode: pendingCode,
    orderId,
    timestamp: Date.now(),
    bonusPoints: REFERRAL_BONUS_POINTS,
    status: 'credited',
  };

  const entries = getAllReferralEntries();
  entries.unshift(entry);
  localStorage.setItem('referral_entries', JSON.stringify(entries));
  localStorage.removeItem('pending_referral_code');
  return true;
}

// ── Demo seed (so the tab looks populated on first load) ─────────────────────

export function seedDemoReferrals(code: string): void {
  const key = `referral_seeded_${code}`;
  if (localStorage.getItem(key)) return;

  const existing = getAllReferralEntries();
  if (existing.some((e) => e.referrerCode === code)) {
    localStorage.setItem(key, '1');
    return;
  }

  const now = Date.now();
  const day = 86_400_000;
  const demos: ReferralEntry[] = [
    {
      id: 'ref_demo_1',
      referrerCode: code,
      refereeHint: 'sa***@gmail.com',
      orderId: 'ORD-DEMO-7412',
      timestamp: now - 12 * day,
      bonusPoints: REFERRAL_BONUS_POINTS,
      status: 'credited',
    },
    {
      id: 'ref_demo_2',
      referrerCode: code,
      refereeHint: 'ja***@outlook.com',
      orderId: 'ORD-DEMO-6198',
      timestamp: now - 38 * day,
      bonusPoints: REFERRAL_BONUS_POINTS,
      status: 'credited',
    },
  ];

  localStorage.setItem('referral_entries', JSON.stringify([...demos, ...existing]));
  localStorage.setItem(key, '1');
}
