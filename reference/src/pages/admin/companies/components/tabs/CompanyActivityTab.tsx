import { useState, useEffect } from 'react';
import type { Company } from '../../types';
import { loadCompanyActivities, saveCompanyActivity, type CompanyActivity } from '../../utils/companyActivities';

interface Props {
  company: Company;
  orders: any[];
}

interface ActivityItem {
  id: string;
  type: 'order' | 'shipment' | 'call' | 'email' | 'note' | 'tier' | 'contract';
  title: string;
  detail: string;
  time: string;
  icon: string;
  color: string;
}
function buildActivity(company: Company, orders: any[]): ActivityItem[] {
  const items: ActivityItem[] = [];

  orders.forEach((o, i) => {
    items.push({
      id: `order-${i}`,
      type: 'order',
      title: `Order ${o.id} — ${o.status}`,
      detail: `$${(o.total ?? 0).toLocaleString()} · ${(o.items ?? []).length} item type(s)`,
      time: o.date,
      icon: 'ri-shopping-bag-3-line',
      color: 'bg-teal-100 text-teal-700',
    });
    if ((o.status ?? '').toLowerCase().includes('ship') || (o.status ?? '').toLowerCase().includes('deliver')) {
      items.push({
        id: `ship-${i}`,
        type: 'shipment',
        title: `Shipment dispatched for ${o.id}`,
        detail: 'Package picked up from origin facility',
        time: new Date(new Date(o.date).getTime() + 86400000).toISOString(),
        icon: 'ri-truck-line',
        color: 'bg-emerald-100 text-emerald-700',
      });
    }
  });

  // Mock calls & emails
  items.push({
    id: 'call-1',
    type: 'call',
    title: `Call with ${company.primaryContact}`,
    detail: 'Discussed upcoming seasonal order and pricing update',
    time: new Date(Date.now() - 7 * 86400000).toISOString(),
    icon: 'ri-phone-line',
    color: 'bg-slate-100 text-slate-700',
  });
  items.push({
    id: 'email-1',
    type: 'email',
    title: 'Quote sent',
    detail: `Sent Q2 pricing proposal to ${company.email}`,
    time: new Date(Date.now() - 14 * 86400000).toISOString(),
    icon: 'ri-mail-send-line',
    color: 'bg-sky-100 text-sky-700',
  });
  items.push({
    id: 'tier-1',
    type: 'tier',
    title: `Tier upgraded to ${company.tier}`,
    detail: `Account reached ${company.tier} tier threshold — discount updated to ${company.discount}%`,
    time: new Date(Date.now() - 90 * 86400000).toISOString(),
    icon: 'ri-vip-crown-line',
    color: 'bg-amber-100 text-amber-700',
  });
  items.push({
    id: 'contract-1',
    type: 'contract',
    title: 'Annual contract renewed',
    detail: `Contract v3.0 signed by ${company.primaryContact}`,
    time: new Date(Date.now() - 120 * 86400000).toISOString(),
    icon: 'ri-file-text-line',
    color: 'bg-violet-100 text-violet-700',
  });

  return items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
}

const TYPE_FILTERS = ['All', 'order', 'shipment', 'call', 'email', 'note', 'tier', 'contract'] as const;

export default function CompanyActivityTab({ company, orders }: Props) {
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [noteInput, setNoteInput] = useState('');
  const [savedActivities, setSavedActivities] = useState<CompanyActivity[]>(() => loadCompanyActivities(company.id));

  useEffect(() => {
    setSavedActivities(loadCompanyActivities(company.id));
  }, [company.id]);

  const baseActivity = buildActivity(company, orders);
  const allActivity = [...savedActivities, ...baseActivity].filter(
    (item, index, self) => self.findIndex((a) => a.id === item.id) === index
  );

  const filtered = allActivity.filter((a) => typeFilter === 'All' || a.type === typeFilter);

  const addNote = () => {
    if (!noteInput.trim()) return;
    const note: CompanyActivity = {
      id: `note-${Date.now()}`,
      type: 'note',
      title: 'Internal note added',
      detail: noteInput.trim(),
      time: new Date().toISOString(),
      icon: 'ri-sticky-note-line',
      color: 'bg-yellow-100 text-yellow-700',
    };
    saveCompanyActivity(company.id, note);
    setSavedActivities(loadCompanyActivities(company.id));
    setNoteInput('');
  };

  const formatTime = (t: string) => {
    const d = new Date(t);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-5">
      {/* Add note */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Add Internal Note</p>
        <div className="flex gap-3">
          <input type="text" value={noteInput} onChange={(e) => setNoteInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addNote()}
            placeholder={`Add a note about ${company.name}...`}
            className="flex-1 text-sm border border-slate-200 focus:border-slate-400 rounded-lg px-4 py-2.5 outline-none text-slate-700 placeholder-slate-400" />
          <button onClick={addNote} disabled={!noteInput.trim()}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-semibold rounded-lg cursor-pointer whitespace-nowrap transition-colors">
            <i className="ri-add-line"></i> Add Note
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {TYPE_FILTERS.map((f) => (
          <button key={f} onClick={() => setTypeFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer whitespace-nowrap capitalize transition-colors ${typeFilter === f ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="ri-time-line text-slate-400 text-xl"></i>
            </div>
            <p className="text-sm font-semibold text-slate-500">No activity yet</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-[19px] top-5 bottom-5 w-0.5 bg-slate-100"></div>
            <div className="space-y-4">
              {filtered.map((item) => (
                <div key={item.id} className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 z-10 ${item.color}`}>
                    <i className={`${item.icon} text-sm`}></i>
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.detail}</p>
                      </div>
                      <span className="text-xs text-slate-400 shrink-0 whitespace-nowrap">{formatTime(item.time)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
