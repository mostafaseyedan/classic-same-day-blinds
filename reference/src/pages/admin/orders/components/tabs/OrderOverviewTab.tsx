import type { Order } from '../../types';

interface Props {
  order: Order;
  onStatusChange: (status: string) => void;
  statusSaved: boolean;
}

const PIPELINE_STAGES = [
  { key: 'placed', label: 'Order Placed', icon: 'ri-file-add-line', statuses: ['Pending'] },
  { key: 'processing', label: 'Processing', icon: 'ri-settings-3-line', statuses: ['Working on Order'] },
  { key: 'manufactured', label: 'Manufactured', icon: 'ri-tools-line', statuses: [] },
  { key: 'quality', label: 'Quality Check', icon: 'ri-shield-check-line', statuses: ['Ready for Pickup'] },
  { key: 'shipped', label: 'Shipped', icon: 'ri-truck-line', statuses: ['Fulfilled & Shipped'] },
  { key: 'delivered', label: 'Delivered', icon: 'ri-checkbox-circle-line', statuses: ['Delivered'] },
];

const STATUS_OPTIONS = ['Pending', 'Working on Order', 'Ready for Pickup', 'Fulfilled & Shipped', 'Delivered', 'Cancelled', 'Refunded'];

function getPipelineIndex(status: string): number {
  if (status === 'Delivered') return 5;
  if (status === 'Fulfilled & Shipped') return 4;
  if (status === 'Ready for Pickup') return 3;
  if (status === 'Working on Order') return 1;
  if (status === 'Pending') return 0;
  return -1;
}

function getStatusColor(status: string) {
  switch (status) {
    case 'Delivered': return 'bg-emerald-100 text-emerald-700';
    case 'Fulfilled & Shipped': return 'bg-teal-100 text-teal-700';
    case 'Ready for Pickup': return 'bg-orange-100 text-orange-700';
    case 'Working on Order': return 'bg-sky-100 text-sky-700';
    case 'Pending': return 'bg-amber-100 text-amber-700';
    case 'Cancelled': return 'bg-red-100 text-red-700';
    case 'Refunded': return 'bg-rose-100 text-rose-700';
    default: return 'bg-slate-100 text-slate-600';
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'Delivered': return 'ri-checkbox-circle-line';
    case 'Fulfilled & Shipped': return 'ri-truck-line';
    case 'Ready for Pickup': return 'ri-store-2-line';
    case 'Working on Order': return 'ri-tools-line';
    case 'Pending': return 'ri-time-line';
    case 'Cancelled': return 'ri-close-circle-line';
    case 'Refunded': return 'ri-arrow-go-back-line';
    default: return 'ri-question-line';
  }
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

function getCustomerName(order: Order) {
  const f = order.customer?.firstName ?? '';
  const l = order.customer?.lastName ?? '';
  return `${f} ${l}`.trim() || '—';
}

export default function OrderOverviewTab({ order, onStatusChange, statusSaved }: Props) {
  const pipelineIdx = getPipelineIndex(order.status);
  const isCancelled = order.status === 'Cancelled' || order.status === 'Refunded';
  const totalUnits = order.items.reduce((s, i) => s + i.quantity, 0);
  const orderDate = new Date(order.date);
  const ageMs = Date.now() - orderDate.getTime();
  const ageDays = Math.floor(ageMs / 86400000);
  const estimatedDelivery = new Date(orderDate.getTime() + 7 * 86400000);

  return (
    <div className="space-y-6">
      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Order Total', value: formatCurrency(order.total), icon: 'ri-money-dollar-circle-line', bg: 'bg-emerald-50', color: 'text-emerald-700' },
          { label: 'Total Units', value: totalUnits.toLocaleString(), icon: 'ri-stack-line', bg: 'bg-slate-50', color: 'text-slate-700' },
          { label: 'Order Age', value: `${ageDays}d`, icon: 'ri-time-line', bg: 'bg-amber-50', color: 'text-amber-700' },
          { label: 'Est. Delivery', value: estimatedDelivery.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), icon: 'ri-calendar-check-line', bg: 'bg-teal-50', color: 'text-teal-700' },
        ].map((k) => (
          <div key={k.label} className={`${k.bg} rounded-xl p-5`}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-7 h-7 flex items-center justify-center ${k.color}`}><i className={`${k.icon} text-lg`}></i></div>
              <span className="text-xs font-semibold text-slate-500">{k.label}</span>
            </div>
            <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Supply Chain Pipeline */}
      <div className="bg-white border border-slate-100 rounded-xl p-6">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5">Supply Chain Pipeline</p>
        {isCancelled ? (
          <div className="flex items-center gap-3 px-5 py-4 bg-red-50 rounded-xl border border-red-200">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center"><i className="ri-close-circle-line text-red-500 text-lg"></i></div>
            <div>
              <p className="text-sm font-bold text-red-700">Order {order.status}</p>
              <p className="text-xs text-red-500">This order has been {order.status.toLowerCase()} and is no longer active.</p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-0">
            {PIPELINE_STAGES.map((stage, i) => {
              const done = i <= pipelineIdx;
              const active = i === pipelineIdx;
              return (
                <div key={stage.key} className="flex items-start flex-1 min-w-0">
                  <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${active ? 'bg-slate-900 text-white ring-4 ring-slate-200' : done ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      <i className={`${stage.icon} text-base`}></i>
                    </div>
                    <p className={`text-xs font-semibold text-center leading-tight px-1 ${active ? 'text-slate-900' : done ? 'text-emerald-600' : 'text-slate-400'}`}>{stage.label}</p>
                    {active && (
                      <span className="text-xs px-2 py-0.5 bg-slate-900 text-white rounded-full font-bold whitespace-nowrap">Current</span>
                    )}
                    {done && !active && (
                      <span className="text-xs text-emerald-500 font-semibold flex items-center gap-0.5"><i className="ri-check-line text-xs"></i>Done</span>
                    )}
                  </div>
                  {i < PIPELINE_STAGES.length - 1 && (
                    <div className={`h-0.5 flex-shrink-0 w-6 mt-5 ${i < pipelineIdx ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Customer Info */}
        <div className="bg-white border border-slate-100 rounded-xl p-5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Customer</p>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">{getCustomerName(order).charAt(0)}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{getCustomerName(order)}</p>
              {order.customer?.companyName && <p className="text-xs text-slate-400 truncate">{order.customer.companyName}</p>}
            </div>
          </div>
          <div className="space-y-2">
            {order.customer?.email && (
              <div className="flex items-center gap-2 text-xs">
                <div className="w-6 h-6 bg-slate-50 rounded-lg flex items-center justify-center"><i className="ri-mail-line text-slate-400 text-xs"></i></div>
                <a href={`mailto:${order.customer.email}`} className="text-slate-600 hover:text-slate-900 truncate">{order.customer.email}</a>
              </div>
            )}
            {order.customer?.salesRep && (
              <div className="flex items-center gap-2 text-xs">
                <div className="w-6 h-6 bg-emerald-50 rounded-lg flex items-center justify-center"><i className="ri-user-star-line text-emerald-600 text-xs"></i></div>
                <span className="text-emerald-700 font-semibold">Rep: {order.customer.salesRep}</span>
              </div>
            )}
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white border border-slate-100 rounded-xl p-5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Order Details</p>
          <div className="space-y-3">
            {[
              { label: 'Order ID', val: order.id, mono: true },
              { label: 'Date Placed', val: new Date(order.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), mono: false },
              { label: 'Tracking #', val: order.trackingNumber ?? '—', mono: true },
              { label: 'Fulfilled', val: order.fulfilledAt ? new Date(order.fulfilledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—', mono: false },
            ].map((r) => (
              <div key={r.label} className="flex justify-between items-start gap-3 text-xs">
                <span className="text-slate-400">{r.label}</span>
                <span className={`font-semibold text-slate-800 text-right ${r.mono ? 'font-mono' : ''}`}>{r.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status Control */}
        <div className="bg-white border border-slate-100 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Update Status</p>
            {statusSaved && <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1"><i className="ri-check-line"></i> Saved</span>}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {STATUS_OPTIONS.map((s) => {
              const active = order.status === s;
              return (
                <button
                  key={s}
                  onClick={() => !active && onStatusChange(s)}
                  className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all border-2 text-left whitespace-nowrap ${
                    active ? `${getStatusColor(s)} border-current` : 'border-transparent bg-slate-50 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <i className={`${getStatusIcon(s)} text-xs shrink-0`}></i>
                  <span className="truncate">{s}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Items mini preview */}
      <div className="bg-white border border-slate-100 rounded-xl p-5">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Line Items</p>
        <div className="divide-y divide-slate-50">
          {order.items.map((item) => (
            <div key={item.id} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center">
                  <i className="ri-product-hunt-line text-slate-400 text-sm"></i>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                  <p className="text-xs text-slate-400">Size: {item.size} &bull; Qty: {item.quantity.toLocaleString()}</p>
                </div>
              </div>
              <p className="text-sm font-bold text-slate-900">{formatCurrency(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>
        <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
          <span className="text-sm font-bold text-slate-700">Order Total</span>
          <span className="text-base font-bold text-emerald-700">{formatCurrency(order.total)}</span>
        </div>
      </div>
    </div>
  );
}
