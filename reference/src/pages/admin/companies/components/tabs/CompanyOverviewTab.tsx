import type { Company } from '../../types';
import type { Customer } from '../../../../customers/components/CustomerFormModal';

interface Props {
  company: Company;
  customers: Customer[];
  orders: any[];
  onComposeEmail?: () => void;
  onLogCall?: () => void;
  onAddNote?: () => void;
}

const tierConfig = {
  Bronze: { color: 'text-orange-700 bg-orange-100', icon: 'ri-award-line', next: 'Silver', progress: 35 },
  Silver: { color: 'text-slate-700 bg-slate-200', icon: 'ri-award-fill', next: 'Gold', progress: 60 },
  Gold: { color: 'text-amber-700 bg-amber-100', icon: 'ri-vip-crown-line', next: 'Diamond', progress: 80 },
  Diamond: { color: 'text-violet-700 bg-violet-100', icon: 'ri-gem-line', next: null, progress: 100 },
};

function getHealthScore(company: Company, orders: any[]) {
  let score = 60;
  if (company.status === 'Active') score += 10;
  if (orders.length >= 5) score += 10;
  if (orders.length >= 10) score += 5;
  const utilization = company.creditLimit > 0 ? (company.outstandingBalance / company.creditLimit) * 100 : 0;
  if (utilization < 50) score += 10;
  else if (utilization > 80) score -= 10;
  if (company.tier === 'Gold') score += 5;
  if (company.tier === 'Diamond') score += 10;
  return Math.min(100, Math.max(0, score));
}

function getHealthLabel(score: number) {
  if (score >= 85) return { label: 'Excellent', color: 'text-emerald-700 bg-emerald-100' };
  if (score >= 70) return { label: 'Good', color: 'text-teal-700 bg-teal-100' };
  if (score >= 50) return { label: 'Fair', color: 'text-amber-700 bg-amber-100' };
  return { label: 'At Risk', color: 'text-red-700 bg-red-100' };
}

export default function CompanyOverviewTab({ company, customers, orders, onComposeEmail, onLogCall, onAddNote }: Props) {
  const totalRevenue = orders.reduce((s, o) => s + (o.total ?? 0), 0);
  const creditUtil = company.creditLimit > 0 ? (company.outstandingBalance / company.creditLimit) * 100 : 0;
  const tier = tierConfig[company.tier];
  const health = getHealthScore(company, orders);
  const healthLabel = getHealthLabel(health);

  const recentOrders = [...orders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4);

  const kpis = [
    { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: 'ri-money-dollar-circle-line', color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Total Orders', value: orders.length.toString(), icon: 'ri-file-list-3-line', color: 'text-teal-600 bg-teal-50' },
    { label: 'Contacts', value: customers.length.toString(), icon: 'ri-group-line', color: 'text-slate-600 bg-slate-100' },
    { label: 'Outstanding', value: `$${company.outstandingBalance.toLocaleString()}`, icon: 'ri-bank-line', color: creditUtil > 75 ? 'text-red-600 bg-red-50' : 'text-amber-600 bg-amber-50' },
  ];

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${k.color}`}>
              <i className={`${k.icon} text-lg`}></i>
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{k.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Left: Health + Credit */}
        <div className="col-span-2 space-y-4">
          {/* Relationship health */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Account Health</h3>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${healthLabel.color}`}>{healthLabel.label}</span>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-20 h-20 shrink-0">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.9" fill="none"
                    stroke={health >= 85 ? '#059669' : health >= 70 ? '#0d9488' : health >= 50 ? '#d97706' : '#dc2626'}
                    strokeWidth="3" strokeDasharray={`${health} ${100 - health}`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-black text-slate-900">{health}</span>
                </div>
              </div>
              <div className="flex-1 space-y-2">
                {[
                  { label: 'Payment History', val: company.outstandingBalance < company.creditLimit * 0.5 ? 95 : 72 },
                  { label: 'Order Frequency', val: Math.min(100, orders.length * 10) },
                  { label: 'Account Age', val: Math.min(100, Math.floor((Date.now() - new Date(company.createdAt).getTime()) / (365 * 86400000)) * 25) },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between mb-0.5">
                      <span className="text-xs text-slate-500">{item.label}</span>
                      <span className="text-xs font-semibold text-slate-700">{item.val}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full">
                      <div className="h-1.5 bg-emerald-400 rounded-full" style={{ width: `${item.val}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tier & Credit */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Tier & Credit</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tier.color}`}>
                <i className={`${tier.icon} text-lg`}></i>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{company.tier} Tier</p>
                <p className="text-xs text-slate-500">{company.discount}% standard discount</p>
              </div>
            </div>
            {tier.next && (
              <div className="mb-4">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Progress to {tier.next}</span>
                  <span>{tier.progress}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full">
                  <div className="h-2 bg-amber-400 rounded-full transition-all" style={{ width: `${tier.progress}%` }}></div>
                </div>
              </div>
            )}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Credit Limit</span>
                <span className="font-semibold text-slate-900">${company.creditLimit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Outstanding</span>
                <span className={`font-semibold ${creditUtil > 75 ? 'text-red-600' : 'text-slate-900'}`}>${company.outstandingBalance.toLocaleString()}</span>
              </div>
              <div>
                <div className="h-1.5 bg-slate-100 rounded-full mt-1">
                  <div className={`h-1.5 rounded-full ${creditUtil > 75 ? 'bg-red-400' : 'bg-emerald-400'}`} style={{ width: `${Math.min(100, creditUtil)}%` }}></div>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 text-right">{creditUtil.toFixed(0)}% utilized</p>
              </div>
            </div>
          </div>

          {/* Contact card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Primary Contact</h3>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-bold">{company.primaryContact.charAt(0)}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{company.primaryContact}</p>
                <p className="text-xs text-slate-500">{company.industry}</p>
              </div>
            </div>
            <div className="space-y-2">
              <a href={`mailto:${company.email}`} className="flex items-center gap-2 text-xs text-slate-600 hover:text-slate-900 cursor-pointer">
                <div className="w-4 h-4 flex items-center justify-center text-slate-400"><i className="ri-mail-line text-sm"></i></div>
                {company.email}
              </a>
              {company.phone && (
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <div className="w-4 h-4 flex items-center justify-center text-slate-400"><i className="ri-phone-line text-sm"></i></div>
                  {company.phone}
                </div>
              )}
              {company.website && (
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <div className="w-4 h-4 flex items-center justify-center text-slate-400"><i className="ri-global-line text-sm"></i></div>
                  {company.website}
                </div>
              )}
            </div>
            <div className="mt-4 flex flex-col gap-2">
              {onComposeEmail && (
                <button
                  onClick={onComposeEmail}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-900 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl cursor-pointer whitespace-nowrap transition-colors"
                >
                  <i className="ri-mail-send-line text-sm"></i>
                  Send Email
                </button>
              )}
              <div className="grid grid-cols-2 gap-2">
                {onLogCall && (
                  <button
                    onClick={onLogCall}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-semibold rounded-xl cursor-pointer whitespace-nowrap transition-colors border border-teal-200"
                  >
                    <i className="ri-phone-line text-sm"></i>
                    Log Call
                  </button>
                )}
                {onAddNote && (
                  <button
                    onClick={onAddNote}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold rounded-xl cursor-pointer whitespace-nowrap transition-colors border border-amber-200"
                  >
                    <i className="ri-sticky-note-add-line text-sm"></i>
                    Add Note
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Recent orders + details */}
        <div className="col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Company Details</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Account Manager', value: company.accountManager || '—' },
                { label: 'Credit Terms', value: company.creditTerms },
                { label: 'Tax Status', value: company.taxExempt ? `Exempt (${company.taxExemptId || 'ID pending'})` : 'Standard' },
                { label: 'Annual Revenue', value: `$${company.annualRevenue.toLocaleString()}` },
                { label: 'Address', value: company.street ? `${company.street}, ${company.city}, ${company.state} ${company.zip}` : '—' },
                { label: 'Member Since', value: new Date(company.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) },
              ].map((item) => (
                <div key={item.label} className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-500 mb-0.5">{item.label}</p>
                  <p className="text-sm font-semibold text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
            {company.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {company.tags.map((tag) => (
                  <span key={tag} className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs rounded-full font-medium">{tag}</span>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Recent Orders</h3>
            {recentOrders.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <i className="ri-file-list-3-line text-lg"></i>
                </div>
                <p className="text-sm">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{order.id}</p>
                      <p className="text-xs text-slate-400">{new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">${(order.total ?? 0).toLocaleString()}</p>
                      <span className="text-xs font-semibold text-teal-600">{order.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {company.notes && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <i className="ri-sticky-note-line text-amber-600"></i>
                <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Internal Notes</p>
              </div>
              <p className="text-sm text-amber-900 leading-relaxed">{company.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
