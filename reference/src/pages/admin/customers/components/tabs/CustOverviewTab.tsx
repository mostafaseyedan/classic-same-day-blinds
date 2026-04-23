import { useState } from 'react';
import type { Customer } from '../CustomerFormModal';
import SendEmailModal from '../SendEmailModal';
import LogCallModal from '../LogCallModal';
import AddNoteModal from '../AddNoteModal';
import CreateOrderModal from '../CreateOrderModal';

interface Props {
  customer: Customer;
  orders: any[];
  onEdit: () => void;
  onActivityAdded?: () => void;
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

function getHealthScore(orders: any[], status: Customer['status']): { score: number; label: string; color: string } {
  let score = 40;
  if (status === 'VIP') score += 30;
  else if (status === 'Active') score += 15;
  if (orders.length > 5) score += 15;
  if (orders.some((o) => o.status === 'Delivered')) score += 10;
  const recent = orders.filter((o) => new Date(o.date) > new Date(Date.now() - 90 * 86400000));
  if (recent.length > 0) score += 5;
  score = Math.min(score, 100);
  if (score >= 80) return { score, label: 'Excellent', color: 'text-emerald-600' };
  if (score >= 60) return { score, label: 'Good', color: 'text-teal-600' };
  if (score >= 40) return { score, label: 'Fair', color: 'text-amber-600' };
  return { score, label: 'At Risk', color: 'text-red-500' };
}

const QUICK_ACTIONS = [
  { id: 'email', label: 'Send Email', icon: 'ri-mail-send-line', color: 'bg-slate-900 text-white hover:bg-slate-700' },
  { id: 'note', label: 'Add Note', icon: 'ri-sticky-note-add-line', color: 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200' },
  { id: 'call', label: 'Log Call', icon: 'ri-phone-line', color: 'bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200' },
  { id: 'order', label: 'Create Order', icon: 'ri-file-add-line', color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200' },
];

export default function CustOverviewTab({ customer, orders, onEdit, onActivityAdded }: Props) {
  const [activeModal, setActiveModal] = useState<'email' | 'note' | 'call' | 'order' | null>(null);

  const totalSpent = orders.reduce((s: number, o: any) => s + (o.total || 0), 0);
  const avgOrder = orders.length > 0 ? totalSpent / orders.length : 0;
  const deliveredCount = orders.filter((o: any) => o.status === 'Delivered').length;
  const health = getHealthScore(orders, customer.status);
  const lastOrder = orders.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  const daysSinceLast = lastOrder ? Math.floor((Date.now() - new Date(lastOrder.date).getTime()) / 86400000) : null;
  const memberDays = Math.floor((Date.now() - new Date(customer.createdAt).getTime()) / 86400000);

  const handleActionDone = () => {
    setActiveModal(null);
    onActivityAdded?.();
  };

  const kpis = [
    { label: 'Total Orders', value: orders.length.toString(), icon: 'ri-file-list-3-line', sub: deliveredCount + ' delivered', bg: 'bg-slate-50', val: 'text-slate-900' },
    { label: 'Total Revenue', value: formatCurrency(totalSpent), icon: 'ri-money-dollar-circle-line', sub: `Avg ${formatCurrency(avgOrder)}`, bg: 'bg-emerald-50', val: 'text-emerald-700' },
    { label: 'Customer Since', value: memberDays + 'd', icon: 'ri-calendar-check-line', sub: new Date(customer.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), bg: 'bg-sky-50', val: 'text-sky-700' },
    { label: 'Last Order', value: daysSinceLast !== null ? daysSinceLast + 'd ago' : 'None', icon: 'ri-time-line', sub: lastOrder ? lastOrder.id : '—', bg: 'bg-amber-50', val: 'text-amber-700' },
  ];

  return (
    <>
      {/* Modals */}
      {activeModal === 'email' && (
        <SendEmailModal customer={customer} onClose={() => setActiveModal(null)} onSent={handleActionDone} />
      )}
      {activeModal === 'call' && (
        <LogCallModal customer={customer} onClose={() => setActiveModal(null)} onLogged={handleActionDone} />
      )}
      {activeModal === 'note' && (
        <AddNoteModal customer={customer} onClose={() => setActiveModal(null)} onAdded={handleActionDone} />
      )}
      {activeModal === 'order' && (
        <CreateOrderModal customer={customer} onClose={() => setActiveModal(null)} onCreated={handleActionDone} />
      )}

      <div className="space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          {kpis.map((k) => (
            <div key={k.label} className={`${k.bg} rounded-xl p-5`}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-7 h-7 flex items-center justify-center ${k.val}`}>
                  <i className={`${k.icon} text-lg`}></i>
                </div>
                <span className="text-xs font-semibold text-slate-500">{k.label}</span>
              </div>
              <p className={`text-2xl font-bold ${k.val}`}>{k.value}</p>
              <p className="text-xs text-slate-400 mt-1">{k.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Health Score */}
          <div className="bg-white border border-slate-100 rounded-xl p-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Relationship Health</p>
            <div className="flex items-end gap-3 mb-3">
              <span className={`text-5xl font-bold ${health.color}`}>{health.score}</span>
              <div className="mb-1">
                <span className={`text-sm font-bold ${health.color}`}>{health.label}</span>
                <p className="text-xs text-slate-400">out of 100</p>
              </div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mb-4">
              <div
                className={`h-2 rounded-full transition-all ${health.score >= 80 ? 'bg-emerald-500' : health.score >= 60 ? 'bg-teal-500' : health.score >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${health.score}%` }}
              />
            </div>
            <div className="space-y-2">
              {[
                { label: 'Order Frequency', val: orders.length > 3 ? 'High' : orders.length > 1 ? 'Medium' : 'Low', good: orders.length > 3 },
                { label: 'Payment History', val: 'On Time', good: true },
                { label: 'Active Status', val: customer.status, good: customer.status !== 'Inactive' },
                { label: 'Recent Activity', val: daysSinceLast !== null && daysSinceLast < 60 ? 'Recent' : 'Inactive', good: daysSinceLast !== null && daysSinceLast < 60 },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">{row.label}</span>
                  <span className={`font-semibold ${row.good ? 'text-emerald-600' : 'text-amber-600'}`}>{row.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Card */}
          <div className="bg-white border border-slate-100 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact & Profile</p>
              <button onClick={onEdit} className="text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer flex items-center gap-1">
                <i className="ri-edit-line text-xs"></i> Edit
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                  <i className="ri-mail-line text-slate-500 text-sm"></i>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-400">Email</p>
                  <a href={`mailto:${customer.email}`} className="text-sm font-medium text-slate-800 hover:text-emerald-700 truncate block">{customer.email}</a>
                </div>
              </div>
              {customer.phone && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                    <i className="ri-phone-line text-slate-500 text-sm"></i>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Phone</p>
                    <p className="text-sm font-medium text-slate-800">{customer.phone}</p>
                  </div>
                </div>
              )}
              {customer.companyName && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                    <i className="ri-building-2-line text-slate-500 text-sm"></i>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Company</p>
                    <p className="text-sm font-medium text-slate-800">{customer.companyName}</p>
                  </div>
                </div>
              )}
              {(customer.city || customer.state) && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                    <i className="ri-map-pin-line text-slate-500 text-sm"></i>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Location</p>
                    <p className="text-sm font-medium text-slate-800">{[customer.city, customer.state].filter(Boolean).join(', ')}</p>
                  </div>
                </div>
              )}
              {customer.tags.length > 0 && (
                <div className="pt-1 flex flex-wrap gap-1.5">
                  {customer.tags.map((tag) => (
                    <span key={tag} className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-slate-100 rounded-xl p-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Quick Actions</p>
            <div className="space-y-2">
              {QUICK_ACTIONS.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setActiveModal(a.id as typeof activeModal)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-colors ${a.color}`}
                >
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className={`${a.icon} text-base`}></i>
                  </div>
                  {a.label}
                  <i className="ri-arrow-right-line text-xs ml-auto opacity-50"></i>
                </button>
              ))}
            </div>
            {customer.notes && (
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs font-bold text-amber-700 mb-1 flex items-center gap-1"><i className="ri-sticky-note-line"></i> Note</p>
                <p className="text-xs text-slate-700 line-clamp-3">{customer.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders Mini */}
        {orders.length > 0 && (
          <div className="bg-white border border-slate-100 rounded-xl p-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Recent Orders</p>
            <div className="divide-y divide-slate-50">
              {orders.slice(0, 4).map((o: any) => (
                <div key={o.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center">
                      <i className="ri-file-list-3-line text-slate-400 text-sm"></i>
                    </div>
                    <div>
                      <p className="text-sm font-mono font-bold text-slate-900">{o.id}</p>
                      <p className="text-xs text-slate-400">{new Date(o.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">{formatCurrency(o.total)}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${o.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' : o.status === 'Cancelled' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}>{o.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
