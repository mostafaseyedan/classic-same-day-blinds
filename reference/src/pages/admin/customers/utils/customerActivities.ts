export interface CustomerActivity {
  id: string;
  type: 'order' | 'shipment' | 'call' | 'email' | 'note' | 'promotion' | 'status_change' | 'restock';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  color: string;
  meta?: string;
}

const key = (customerId: string) => `customer_activities_${customerId}`;

export function loadActivities(customerId: string): CustomerActivity[] {
  try {
    const raw = localStorage.getItem(key(customerId));
    if (raw) return JSON.parse(raw) as CustomerActivity[];
  } catch { /* ignore */ }
  return [];
}

export function saveActivity(customerId: string, activity: CustomerActivity): void {
  const existing = loadActivities(customerId);
  const updated = [activity, ...existing];
  localStorage.setItem(key(customerId), JSON.stringify(updated));
}

export function clearActivities(customerId: string): void {
  localStorage.removeItem(key(customerId));
}
