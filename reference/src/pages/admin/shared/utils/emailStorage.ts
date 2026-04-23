export type EntityType = 'customer' | 'company' | 'supplier';

export interface EmailRecord {
  id: string;
  entityType: EntityType;
  entityId: string;
  entityName: string;
  entityEmail: string;
  subject: string;
  body: string;
  template?: string;
  sentAt: string;
  direction: 'outbound' | 'inbound';
  status: 'sent' | 'draft' | 'failed';
  readAt?: string;
}

const STORAGE_KEY = 'admin_email_records';

function seedEmailsForEntity(entityType: EntityType, entityId: string, entityName: string, entityEmail: string): EmailRecord[] {
  const firstName = entityName.split(' ')[0];
  const now = Date.now();
  return [
    {
      id: `seed-${entityId}-1`,
      entityType,
      entityId,
      entityName,
      entityEmail,
      subject: 'Welcome to our team — here\'s everything you need',
      body: `Hi ${firstName},\n\nWelcome aboard! We\'re thrilled to have you as part of our network. I wanted to take a moment to personally introduce myself and make sure you have everything you need to get started.\n\nFeel free to reach out at any time if you have questions about our products, pricing, or anything else.\n\nLooking forward to working with you!\n\nBest regards,\nThe Sales Team`,
      sentAt: new Date(now - 90 * 86400000).toISOString(),
      direction: 'outbound',
      status: 'sent',
      readAt: new Date(now - 89 * 86400000).toISOString(),
    },
    {
      id: `seed-${entityId}-2`,
      entityType,
      entityId,
      entityName,
      entityEmail,
      subject: 'Q1 Pricing Update & New Product Catalog',
      body: `Hi ${firstName},\n\nI hope this email finds you well. I wanted to share our updated Q1 pricing sheet and the new product catalog for this season.\n\nHighlights include:\n• New motorized blinds collection — now available in 3 new colorways\n• 8% across-the-board discount on cellular shades through March\n• Expanded size options for roller shades (up to 144" wide)\n\nPlease let me know if you\'d like to schedule a call to discuss any of these updates in more detail.\n\nBest,\nThe Team`,
      sentAt: new Date(now - 45 * 86400000).toISOString(),
      direction: 'outbound',
      status: 'sent',
      readAt: new Date(now - 44 * 86400000).toISOString(),
    },
    {
      id: `seed-${entityId}-3`,
      entityType,
      entityId,
      entityName,
      entityEmail,
      subject: `Re: Order inquiry — custom sizing available?`,
      body: `Hi Team,\n\nThank you for your quick response! I was wondering if you could provide custom sizing for the faux wood blinds in the following dimensions:\n• 52" wide × 72" tall (qty: 8)\n• 38" wide × 48" tall (qty: 4)\n\nAlso, do you have an ETA on when the Chestnut color will be back in stock? We\'ve had several clients asking about it specifically.\n\nLooking forward to your reply.\n\nThanks,\n${firstName}`,
      sentAt: new Date(now - 30 * 86400000).toISOString(),
      direction: 'inbound',
      status: 'sent',
      readAt: new Date(now - 30 * 86400000).toISOString(),
    },
    {
      id: `seed-${entityId}-4`,
      entityType,
      entityId,
      entityName,
      entityEmail,
      subject: 'Follow-up: Custom sizing confirmation + lead times',
      body: `Hi ${firstName},\n\nGreat news — we can definitely accommodate those custom sizes! Here\'s a quick summary:\n\n• 52" × 72" (qty: 8) — available, 10-12 business days lead time\n• 38" × 48" (qty: 4) — available, 8-10 business days lead time\n\nRegarding the Chestnut color: we\'re expecting a restock in approximately 3 weeks. I\'ll send you a notification as soon as it\'s back.\n\nShall I put together a formal quote for the custom sizes?\n\nBest,\nSales Team`,
      sentAt: new Date(now - 28 * 86400000).toISOString(),
      direction: 'outbound',
      status: 'sent',
      readAt: new Date(now - 27 * 86400000).toISOString(),
    },
    {
      id: `seed-${entityId}-5`,
      entityType,
      entityId,
      entityName,
      entityEmail,
      subject: 'Exclusive offer: 12% off your next bulk order',
      body: `Hi ${firstName},\n\nAs a valued customer, we want to reward your loyalty with an exclusive bulk order discount.\n\nFor your next order of 20+ units placed before the end of the month, you\'ll receive:\n• 12% off the total order value\n• Free priority shipping\n• Complimentary installation guide booklet\n\nThis offer expires in 7 days. Reply to this email or give us a call to take advantage.\n\nThank you for your continued business!\n\nWarm regards,\nThe Team`,
      sentAt: new Date(now - 7 * 86400000).toISOString(),
      direction: 'outbound',
      status: 'sent',
    },
  ];
}

export function loadAllEmails(): EmailRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as EmailRecord[];
  } catch { /* ignore */ }
  return [];
}

export function loadEmailsForEntity(entityType: EntityType, entityId: string, entityName: string, entityEmail: string): EmailRecord[] {
  const all = loadAllEmails();
  const existing = all.filter((e) => e.entityType === entityType && e.entityId === entityId);
  if (existing.length === 0) {
    const seeds = seedEmailsForEntity(entityType, entityId, entityName, entityEmail);
    const updated = [...seeds, ...all];
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
    return seeds;
  }
  return existing.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
}

export function saveEmail(record: EmailRecord): void {
  const all = loadAllEmails();
  const updated = [record, ...all.filter((e) => e.id !== record.id)];
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
}

export function markEmailRead(id: string): void {
  const all = loadAllEmails();
  const updated = all.map((e) => e.id === id && !e.readAt ? { ...e, readAt: new Date().toISOString() } : e);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
}

export function deleteEmail(id: string): void {
  const all = loadAllEmails().filter((e) => e.id !== id);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(all)); } catch { /* ignore */ }
}

export function getEntityEmailStats(entityType: EntityType, entityId: string): { total: number; unread: number } {
  const all = loadAllEmails();
  const entity = all.filter((e) => e.entityType === entityType && e.entityId === entityId);
  return {
    total: entity.length,
    unread: entity.filter((e) => e.direction === 'inbound' && !e.readAt).length,
  };
}
