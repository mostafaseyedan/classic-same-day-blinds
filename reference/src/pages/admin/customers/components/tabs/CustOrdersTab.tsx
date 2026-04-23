import { useState } from 'react';

interface Props {
  orders: any[];
}

const PIPELINE_STAGES = [
  { key: 'placed', label: 'Order Placed', icon: 'ri-file-add-line' },
  { key: 'processing', label: 'Processing', icon: 'ri-settings-3-line' },
  { key: 'manufactured', label: 'Manufactured', icon: 'ri-tools-line' },
  { key: 'quality', label: 'Quality Check', icon: 'ri-shield-check-line' },
  { key: 'shipped', label: 'Shipped', icon: 'ri-truck-line' },
  { key: 'delivered', label: 'Delivered', icon: 'ri-checkbox-circle-line' },
];

function getStageIndex(status: string): number {
  const s = status.toLowerCase();
  if (s.includes('delivered')) return 5;
  if (s.includes('shipped') || s.includes('fulfil')) return 4;
  if (s.includes('quality')) return 3;
  if (s.includes('manufactur')) return 2;
  if (s.includes('working') || s.includes('processing')) return 1;
  if (s.includes('cancel')) return -1;
  return 0;
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

function getStatusBadge(status: string) {
  if (status === 'Delivered') return 'bg-emerald-100 text-emerald-700';
  if (status === 'Cancelled') return 'bg-red-100 text-red-600';
  if (status.includes('Shipped') || status.includes('Fulfil')) return 'bg-teal-100 text-teal-700';
  return 'bg-amber-100 text-amber-700';
}

// Enrich seed orders with supply chain mock data
function enrichOrder(o: any, idx: number) {
  const stageIdx = getStageIndex(o.status);
  const carriers = ['FedEx Ground', 'UPS', 'USPS Priority', 'XPO Logistics', 'Estes Express'];
  const trackingNums = ['7489234789023', '1Z999AA10123456784', '9400111899223397987490', '300948093284', '071989000789'];
  return {
    ...o,
    carrier: carriers[idx % carriers.length],
    trackingNumber: trackingNums[idx % trackingNums.length],
    stageIndex: stageIdx,
    estimatedDelivery: new Date(new Date(o.date).getTime() + (7 + idx) * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    po: `PO-${20000 + idx}`,
    items: o.items || [{ name: 'Faux Wood Blinds', quantity: 10, size: '36" x 60"', price: 89.99 }],
  };
}

export default function CustOrdersTab({ orders }: Props) {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const enriched = orders.map(enrichOrder);

  const statuses = ['All', 'Delivered', 'Fulfilled & Shipped', 'Working on Order', 'Pending', 'Cancelled'];
  const filtered = statusFilter === 'All' ? enriched : enriched.filter((o) => o.status === statusFilter);
  const totalValue = orders.reduce((s, o) => s + (o.total || 0), 0);
  const avgValue = orders.length > 0 ? totalValue / orders.length : 0;

  return (
    <div className="space-y-5">
      {/* Summary bar */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: orders.length, icon: 'ri-file-list-3-line', color: 'text-slate-700', bg: 'bg-slate-50' },
          { label: 'Total Value', value: formatCurrency(totalValue), icon: 'ri-money-dollar-circle-line', color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'Avg Order Value', value: formatCurrency(avgValue), icon: 'ri-bar-chart-line', color: 'text-amber-700', bg: 'bg-amber-50' },
          { label: 'Delivered', value: orders.filter((o) => o.status === 'Delivered').length, icon: 'ri-checkbox-circle-line', color: 'text-teal-700', bg: 'bg-teal-50' },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4 flex items-center gap-3`}>
            <div className={`w-9 h-9 bg-white rounded-xl flex items-center justify-center ${s.color}`}>
              <i className={`${s.icon} text-lg`}></i>
            </div>
            <div>
              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors ${statusFilter === s ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Orders */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl text-slate-400 text-sm">No orders found</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const expanded = expandedOrder === order.id;
            return (
              <div key={order.id} className="bg-white border border-slate-100 rounded-xl overflow-hidden">
                {/* Header row */}
                <div
                  className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => setExpandedOrder(expanded ? null : order.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-sm font-mono font-bold text-slate-900">{order.id}</span>
                      <span className="text-xs text-slate-400">PO: {order.po}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getStatusBadge(order.status)}`}>{order.status}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {order.carrier && <span className="ml-3 text-slate-400"><i className="ri-truck-line mr-1"></i>{order.carrier}</span>}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-base font-bold text-slate-900">{formatCurrency(order.total)}</p>
                    <p className="text-xs text-slate-400">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="w-6 h-6 flex items-center justify-center text-slate-400 shrink-0">
                    <i className={`${expanded ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'} text-lg`}></i>
                  </div>
                </div>

                {/* Expanded */}
                {expanded && (
                  <div className="border-t border-slate-100 px-5 py-5 space-y-5 bg-slate-50/50">
                    {/* Pipeline */}
                    {order.stageIndex >= 0 && (
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Supply Chain Pipeline</p>
                        <div className="flex items-center gap-0">
                          {PIPELINE_STAGES.map((stage, i) => {
                            const done = i <= order.stageIndex;
                            const active = i === order.stageIndex;
                            return (
                              <div key={stage.key} className="flex items-center flex-1 min-w-0">
                                <div className="flex flex-col items-center gap-1.5 min-w-0 flex-1">
                                  <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${active ? 'bg-slate-900 text-white ring-4 ring-slate-200' : done ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                    <i className={`${stage.icon} text-sm`}></i>
                                  </div>
                                  <p className={`text-xs font-semibold text-center leading-tight ${active ? 'text-slate-900' : done ? 'text-emerald-600' : 'text-slate-400'}`}>{stage.label}</p>
                                </div>
                                {i < PIPELINE_STAGES.length - 1 && (
                                  <div className={`h-0.5 flex-shrink-0 w-4 mt-[-14px] ${i < order.stageIndex ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {order.stageIndex === -1 && (
                      <div className="flex items-center gap-2 px-4 py-3 bg-red-50 rounded-lg text-sm text-red-600 font-semibold">
                        <i className="ri-close-circle-line"></i> This order was cancelled
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-5">
                      {/* Items */}
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Line Items</p>
                        <div className="space-y-2">
                          {order.items.map((item: any, ii: number) => (
                            <div key={ii} className="flex items-center justify-between text-sm bg-white rounded-lg px-4 py-2.5 border border-slate-100">
                              <div>
                                <p className="font-semibold text-slate-800 text-xs">{item.name}</p>
                                <p className="text-xs text-slate-400">Size: {item.size} &bull; Qty: {item.quantity}</p>
                              </div>
                              <p className="font-bold text-slate-900 text-xs">{formatCurrency(item.price * item.quantity)}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Shipping details */}
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Shipping Info</p>
                          <div className="bg-white rounded-xl border border-slate-100 p-4 space-y-2.5">
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-500">Carrier</span>
                              <span className="font-semibold text-slate-800">{order.carrier}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-500">Tracking #</span>
                              <span className="font-mono font-semibold text-slate-800">{order.trackingNumber}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-500">Est. Delivery</span>
                              <span className="font-semibold text-slate-800">{order.estimatedDelivery}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-500">Order Total</span>
                              <span className="font-bold text-emerald-700">{formatCurrency(order.total)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
