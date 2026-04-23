import { useState, useCallback } from 'react';
import type { Customer } from '../CustomerFormModal';
import { loadActivities, saveActivity } from '../../utils/customerActivities';
import type { CustomerActivity } from '../../utils/customerActivities';

interface Props {
  customer: Customer;
  orders: any[];
  refreshKey?: number;
}

interface ActivityItem {
  id: string;
  type: 'order' | 'shipment' | 'call' | 'email' | 'note' | 'promotion' | 'status_change' | 'restock';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  color: string;
  meta?: string;
}

function buildActivityLog(customer: Customer, orders: any[]): ActivityItem[] {
  const items: ActivityItem[] = [];

  orders.slice(0, 5).forEach((o, i) => {
    items.push({
      id: `order-${i}`,
      type: 'order',
      title: `Order ${o.id} placed`,
      description: `${o.items?.length ?? 1} item(s) — total ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(o.total ?? 0)}`,
      timestamp: o.date,
      icon: 'ri-file-add-line',
      color: 'bg-slate-900',
      meta: o.status,
    });
    if (o.status === 'Delivered' || o.status?.includes('Shipped')) {
      items.push({
        id: `ship-${i}`,
        type: 'shipment',
        title: `Shipment dispatched for ${o.id}`,
        description: `Carrier assigned and tracking number generated`,
        timestamp: new Date(new Date(o.date).getTime() + 86400000).toISOString(),
        icon: 'ri-truck-line',
        color: 'bg-teal-600',
        meta: 'In Transit',
      });
    }
    if (o.status === 'Delivered') {
      items.push({
        id: `delivered-${i}`,
        type: 'shipment',
        title: `Order ${o.id} delivered`,
        description: `Package confirmed delivered to customer address`,
        timestamp: new Date(new Date(o.date).getTime() + 5 * 86400000).toISOString(),
        icon: 'ri-checkbox-circle-line',
        color: 'bg-emerald-600',
        meta: 'Delivered',
      });
    }
  });

  // Mock calls / emails / notes
  items.push({
    id: 'call-1',
    type: 'call',
    title: 'Phone call logged',
    description: 'Discussed Q2 bulk pricing options and upcoming promotions. Customer interested in volume deal.',
    timestamp: new Date(Date.now() - 14 * 86400000).toISOString(),
    icon: 'ri-phone-line',
    color: 'bg-amber-600',
    meta: '12 min',
  });
  items.push({
    id: 'email-1',
    type: 'email',
    title: 'Follow-up email sent',
    description: 'Sent Q2 catalog and updated pricing sheet. Attached custom quote for bulk order.',
    timestamp: new Date(Date.now() - 10 * 86400000).toISOString(),
    icon: 'ri-mail-send-line',
    color: 'bg-sky-600',
    meta: 'Sent',
  });
  items.push({
    id: 'promo-1',
    type: 'promotion',
    title: 'Promo code BULK5PCT applied',
    description: '5% volume discount applied to order — saved $249.00',
    timestamp: new Date(Date.now() - 180 * 86400000).toISOString(),
    icon: 'ri-coupon-3-line',
    color: 'bg-violet-600',
    meta: '-$249.00',
  });
  items.push({
    id: 'note-1',
    type: 'note',
    title: 'Internal note added',
    description: customer.notes || 'Prefers email contact. Schedule Q2 check-in call.',
    timestamp: new Date(Date.now() - 30 * 86400000).toISOString(),
    icon: 'ri-sticky-note-line',
    color: 'bg-amber-500',
    meta: 'Note',
  });
  items.push({
    id: 'restock-1',
    type: 'restock',
    title: 'Restock request submitted',
    description: 'Customer requested restock notification for Cellular Shades 48" × 64" — out of stock',
    timestamp: new Date(Date.now() - 7 * 86400000).toISOString(),
    icon: 'ri-inbox-archive-line',
    color: 'bg-orange-500',
    meta: 'Pending',
  });
  items.push({
    id: 'status-1',
    type: 'status_change',
    title: `Status changed to ${customer.status}`,
    description: `Account status updated based on purchase history and engagement`,
    timestamp: new Date(Date.now() - 60 * 86400000).toISOString(),
    icon: 'ri-user-settings-line',
    color: customer.status === 'VIP' ? 'bg-amber-500' : 'bg-slate-700',
    meta: customer.status,
  });

  return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

const TYPE_FILTERS = [
  { key: 'all', label: 'All Activity' },
  { key: 'order', label: 'Orders' },
  { key: 'shipment', label: 'Shipments' },
  { key: 'call', label: 'Calls' },
  { key: 'email', label: 'Emails' },
  { key: 'note', label: 'Notes' },
  { key: 'promotion', label: 'Promos' },
];

function timeAgo(ts: string): string {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 30 * 86400) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function CustActivityTab({ customer, orders, refreshKey = 0 }: Props) {
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [noteText, setNoteText] = useState('');
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  // Combine built-in log with persisted activities from localStorage
  const persistedActivities = loadActivities(customer.id);
  const builtIn = buildActivityLog(customer, orders);
  // Merge: persisted items are newer and override nothing; show persisted first, then built-in excluding duplicates
  const persistedIds = new Set(persistedActivities.map((a) => a.id));
  const allItems = [
    ...persistedActivities,
    ...builtIn.filter((i) => !persistedIds.has(i.id)),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const filtered = typeFilter === 'all' ? allItems : allItems.filter((i) => i.type === typeFilter);

  // Silence unused tick + refreshKey — they force re-render
  void tick;
  void refreshKey;

  const addNote = () => {
    if (!noteText.trim()) return;
    const activity: CustomerActivity = {
      id: `note-local-${Date.now()}`,
      type: 'note',
      title: 'Note added',
      description: noteText.trim(),
      timestamp: new Date().toISOString(),
      icon: 'ri-sticky-note-line',
      color: 'bg-amber-500',
      meta: 'Note',
    };
    saveActivity(customer.id, activity);
    setNoteText('');
    refresh();
  };

  return (
    <div className="space-y-5">
      {/* Add note */}
      <div className="bg-white border border-slate-100 rounded-xl p-5">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Add Activity Note</p>
        <div className="flex gap-3">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value.slice(0, 500))}
            placeholder="Log a call, add a note, record customer feedback..."
            rows={2}
            className="flex-1 text-sm border border-slate-200 focus:border-slate-400 rounded-xl px-4 py-3 outline-none text-slate-700 placeholder-slate-400 resize-none"
          />
          <button
            onClick={addNote}
            disabled={!noteText.trim()}
            className="px-5 py-3 bg-slate-900 hover:bg-slate-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-semibold rounded-xl cursor-pointer whitespace-nowrap transition-colors"
          >
            <i className="ri-add-line mr-1.5"></i>Log
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {TYPE_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setTypeFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors ${typeFilter === f.key ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {f.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-400">{filtered.length} event{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-100"></div>
        <div className="space-y-1">
          {filtered.map((item) => (
            <div key={item.id} className="flex items-start gap-4 pl-1 group">
              {/* Icon */}
              <div className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center shrink-0 z-10 mt-1`}>
                <i className={`${item.icon} text-white text-sm`}></i>
              </div>
              {/* Content */}
              <div className="flex-1 bg-white border border-slate-100 rounded-xl px-4 py-3 mb-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      {item.meta && (
                        <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-semibold">{item.meta}</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.description}</p>
                  </div>
                  <span className="text-xs text-slate-400 shrink-0 mt-0.5 whitespace-nowrap">{timeAgo(item.timestamp)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-10 text-slate-400 text-sm bg-slate-50 rounded-xl">
          No activity found for this filter
        </div>
      )}
    </div>
  );
}
