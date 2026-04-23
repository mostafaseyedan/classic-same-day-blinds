export interface CompanyActivity {
  id: string;
  type: 'order' | 'shipment' | 'call' | 'email' | 'note' | 'tier' | 'contract';
  title: string;
  detail: string;
  time: string;
  icon: string;
  color: string;
}

const storageKey = (companyId: string) => `company_activities_${companyId}`;

export function loadCompanyActivities(companyId: string): CompanyActivity[] {
  try {
    const stored = localStorage.getItem(storageKey(companyId));
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return [];
}

export function saveCompanyActivity(companyId: string, activity: CompanyActivity): void {
  const existing = loadCompanyActivities(companyId);
  localStorage.setItem(storageKey(companyId), JSON.stringify([activity, ...existing]));
}
