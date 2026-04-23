import { useState } from 'react';
import type { Company } from '../../types';

interface Props {
  company: Company;
  orders: any[];
}

const PIPELINE_STAGES = [
  { id: 'Order Placed', label: 'Order Placed', icon: 'ri-file-add-line' },
  { id: 'Processing', label: 'Processing', icon: 'ri-settings-3-line' },
  { id: 'Manufactured', label: 'Manufactured', icon: 'ri-tools-line' },
  { id: 'Quality Check', label: 'QC', icon: 'ri-shield-check-line' },
  { id: 'Shipped', label: 'Shipped', icon: 'ri-truck-line' },
  { id: 'Delivered', label: 'Delivered', icon: 'ri-checkbox-circle-line' },
];

function getStageIndex(status: string) {
  const s = status?.toLowerCase() ?? '';
  if (s.includes('deliver')) return 5;
  if (s.includes('ship') || s.includes('transit')) return 4;
  if (s.includes('quality') || s.includes('qc')) return 3;
  if (s.includes('manufactur') || s.includes('fulfill')) return 2;
  if (s.includes('process') || s.includes('working')) return 1;
  return 0;
}

function getStatusBadge(status: string) {
  const s = status?.toLowerCase() ?? '';
  if (s.includes('deliver')) return 'bg-emerald-100 text-emerald-700';
  if (s.includes('ship')) return 'bg-teal-100 text-teal-700';
  if (s.includes('process') || s.includes('working')) return 'bg-sky-100 text-sky-700';
  if (s.includes('manufactur')) return 'bg-violet-100 text-violet-700';
  return 'bg-slate-100 text-slate-600';
}

export default function CompanyOrdersTab({ company, orders }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [search, setSearch] = useState('');

  const stages = [...new Set(orders.map((o) => o.status ?? 'Unknown'))];
  const filterOptions = ['All', ...stages];

  const filtered = orders.filter((o) => {
    const matchStatus = statusFilter === 'All' || o.status === statusFilter;
    const matchSearch = !search || o.id.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalValue = orders.reduce((s, o) => s + (o.total ?? 0), 0);
  const avgValue = orders.length > 0 ? totalValue / orders.length : 0;

  const pipelineCounts = PIPELINE_STAGES.map((stage) => ({
    ...stage,
    count: orders.filter((o) => getStageIndex(o.status) === PIPELINE_STAGES.indexOf(stage)).length,
  }));

  return (
    <div className="space-y-6">
      {/* Pipeline overview */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Order Pipeline</h3>
        <div className="flex items-center gap-2">
          {pipelineCounts.map((stage, idx) => (
            <div key={stage.id} className="flex items-center gap-2 flex-1 min-w-0">
              <div className={`flex-1 rounded-xl p-3 text-center border-2 transition-all ${stage.count > 0 ? 'border-slate-900 bg-slate-50' : 'border-slate-100 bg-slate-50/50'}`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center mx-auto mb-1.5 ${stage.count > 0 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  <i className={`${stage.icon} text-sm`}></i>
                </div>
                <p className={`text-lg font-black ${stage.count > 0 ? 'text-slate-900' : 'text-slate-300'}`}>{stage.count}</p>
                <p className="text-[10px] font-semibold text-slate-500 mt-0.5 truncate">{stage.label}</p>
              </div>
              {idx < pipelineCounts.length - 1 && (
                <div className="w-5 h-5 flex items-center justify-center shrink-0 text-slate-300">
                  <i className="ri-arrow-right-line text-base"></i>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: orders.length, icon: 'ri-file-list-3-line', color: 'text-slate-600 bg-slate-100' },
          { label: 'Total Value', value: `$${totalValue.toLocaleString()}`, icon: 'ri-money-dollar-circle-line', color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Avg Order Value', value: `$${avgValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: 'ri-bar-chart-line', color: 'text-teal-600 bg-teal-50' },
          { label: 'Delivered', value: orders.filter((o) => (o.status ?? '').toLowerCase().includes('deliver')).length, icon: 'ri-checkbox-circle-line', color: 'text-emerald-600 bg-emerald-50' },
        ].map((k) => (
          <div key={k.label} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${k.color}`}>
              <i className={`${k.icon} text-base`}></i>
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">{k.value}</p>
              <p className="text-xs text-slate-500">{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 min-w-[200px]">
          <div className="w-4 h-4 flex items-center justify-center text-slate-400"><i className="ri-search-line text-sm"></i></div>
          <input type="text" placeholder="Search order ID..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm outline-none text-slate-700 placeholder-slate-400" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {filterOptions.map((f) => (
            <button key={f} onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors ${statusFilter === f ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Order table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="ri-file-list-3-line text-slate-400 text-xl"></i>
            </div>
            <p className="text-sm font-semibold text-slate-500">No orders found</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Stage</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Total</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((order) => {
                const stageIdx = getStageIndex(order.status);
                const isExpanded = expandedId === order.id;
                return (
                  <>
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : order.id)}>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-900 font-mono">{order.id}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-600">{new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusBadge(order.status)}`}>{order.status}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          {PIPELINE_STAGES.map((s, i) => (
                            <div key={s.id} className={`w-5 h-1.5 rounded-full ${i <= stageIdx ? 'bg-slate-900' : 'bg-slate-100'}`}></div>
                          ))}
                          <span className="text-xs text-slate-500 ml-1">{PIPELINE_STAGES[stageIdx]?.label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-sm font-bold text-slate-900">${(order.total ?? 0).toLocaleString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <i className={`ri-arrow-${isExpanded ? 'up' : 'down'}-s-line text-slate-400`}></i>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${order.id}-detail`}>
                        <td colSpan={6} className="px-6 pb-4 bg-slate-50">
                          <div className="space-y-2">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider pt-2">Line Items</p>
                            {(order.items ?? []).map((item: any, idx: number) => (
                              <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                                <div>
                                  <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                                  <p className="text-xs text-slate-400">{item.size} &bull; Qty: {item.quantity}</p>
                                </div>
                                <p className="text-sm font-bold text-slate-900">${((item.price ?? 0) * (item.quantity ?? 1)).toLocaleString()}</p>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
