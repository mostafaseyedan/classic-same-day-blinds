import type { Customer } from './CustomerFormModal';

interface Order {
  id: string;
  date: string;
  status: string;
  total: number;
  items: { name: string; quantity: number; size: string; price: number }[];
}

interface CustomerDetailDrawerProps {
  customer: Customer;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onFullView?: () => void;
}

function getStatusColor(status: string) {
  switch (status) {
    case 'Active': return 'bg-emerald-100 text-emerald-700';
    case 'Inactive': return 'bg-slate-100 text-slate-500';
    case 'VIP': return 'bg-amber-100 text-amber-700';
    default: return 'bg-slate-100 text-slate-600';
  }
}

function getTypeColor(type: string) {
  switch (type) {
    case 'Retail': return 'bg-slate-100 text-slate-700';
    case 'Business': return 'bg-sky-100 text-sky-700';
    case 'Contractor': return 'bg-orange-100 text-orange-700';
    case 'Wholesale': return 'bg-violet-100 text-violet-700';
    default: return 'bg-slate-100 text-slate-600';
  }
}

function getOrderStatusColor(status: string) {
  switch (status) {
    case 'Delivered': return 'bg-emerald-100 text-emerald-700';
    case 'Fulfilled & Shipped': return 'bg-teal-100 text-teal-700';
    case 'Pending': return 'bg-amber-100 text-amber-700';
    case 'Working on Order': return 'bg-sky-100 text-sky-700';
    case 'Cancelled': return 'bg-red-100 text-red-700';
    default: return 'bg-slate-100 text-slate-600';
  }
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

function getCustomerOrders(email: string): Order[] {
  try {
    const stored: any[] = JSON.parse(localStorage.getItem('orders') ?? '[]');
    const seedOrders: any[] = [
      { id: 'ORD-10001', date: new Date(Date.now() - 86400000).toISOString(), status: 'Delivered', total: 454272, customer: { email: 'sarah.johnson@example.com' }, items: [{ name: 'Faux Wood Blinds', quantity: 3200, size: '36" x 60"', price: 141.96 }] },
      { id: 'ORD-10002', date: new Date(Date.now() - 259200000).toISOString(), status: 'Delivered', total: 397656, customer: { email: 'david.nguyen@example.com' }, items: [{ name: 'Cellular Shades', quantity: 2800, size: '48" x 64"', price: 141.99 }] },
    ];
    const all = [...stored, ...seedOrders.filter((s) => !stored.find((o) => o.id === s.id))];
    return all
      .filter((o) => (o.customer?.email ?? '') === email)
      .map((o) => ({
        id: o.id,
        date: o.date,
        status: o.status === 'placed' || o.status === 'Processing' ? 'Working on Order' : (o.status ?? 'Working on Order'),
        total: o.total ?? 0,
        items: (o.items ?? []).map((i: any) => ({ name: i.name, quantity: i.quantity, size: i.size ?? '', price: i.price })),
      }));
  } catch {
    return [];
  }
}

export default function CustomerDetailDrawer({ customer, onClose, onEdit, onDelete, onFullView }: CustomerDetailDrawerProps) {
  const orders = getCustomerOrders(customer.email);
  const totalSpent = orders.reduce((s, o) => s + o.total, 0);
  const deliveredCount = orders.filter((o) => o.status === 'Delivered').length;
  const avgOrder = orders.length > 0 ? totalSpent / orders.length : 0;
  const hasAddress = customer.street || customer.city;
  const memberSince = new Date(customer.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-end" onClick={onClose}>
      <div
        className="bg-white h-full w-full max-w-lg flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-7 py-5 border-b border-slate-100 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-xl">{customer.firstName.charAt(0)}{customer.lastName.charAt(0)}</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{customer.firstName} {customer.lastName}</h2>
                {customer.companyName && (
                  <p className="text-sm text-slate-500 mt-0.5">
                    <i className="ri-building-2-line mr-1 text-slate-400"></i>
                    {customer.companyName}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusColor(customer.status)}`}>
                    {customer.status === 'VIP' && <i className="ri-vip-crown-line text-xs"></i>}
                    {customer.status}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${getTypeColor(customer.type)}`}>
                    {customer.type}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {onFullView && (
                <button onClick={onFullView} className="flex items-center gap-1.5 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg cursor-pointer whitespace-nowrap">
                  <i className="ri-layout-masonry-line"></i> Full View
                </button>
              )}
              <button onClick={onEdit} className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg cursor-pointer whitespace-nowrap">
                <i className="ri-edit-line"></i> Edit
              </button>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 cursor-pointer">
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-7 py-5 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Orders', value: orders.length.toString(), icon: 'ri-file-list-3-line', bg: 'bg-slate-50', color: 'text-slate-900' },
              { label: 'Total Spent', value: formatCurrency(totalSpent), icon: 'ri-money-dollar-circle-line', bg: 'bg-emerald-50', color: 'text-emerald-700' },
              { label: 'Avg Order', value: formatCurrency(avgOrder), icon: 'ri-bar-chart-line', bg: 'bg-amber-50', color: 'text-amber-700' },
              { label: 'Delivered', value: deliveredCount.toString(), icon: 'ri-checkbox-circle-line', bg: 'bg-teal-50', color: 'text-teal-700' },
            ].map((s) => (
              <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
                <div className={`w-6 h-6 mx-auto mb-1 flex items-center justify-center ${s.color}`}>
                  <i className={`${s.icon} text-sm`}></i>
                </div>
                <p className={`text-base font-bold ${s.color} leading-tight`}>{s.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Contact Info</p>
            <div className="flex items-center gap-3 text-sm text-slate-700">
              <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shrink-0"><i className="ri-mail-line text-slate-500 text-sm"></i></div>
              <a href={`mailto:${customer.email}`} className="hover:text-emerald-700 transition-colors">{customer.email}</a>
            </div>
            {customer.phone && (
              <div className="flex items-center gap-3 text-sm text-slate-700">
                <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shrink-0"><i className="ri-phone-line text-slate-500 text-sm"></i></div>
                <span>{customer.phone}</span>
              </div>
            )}
            {hasAddress && (
              <div className="flex items-start gap-3 text-sm text-slate-700">
                <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shrink-0 mt-0.5"><i className="ri-map-pin-line text-slate-500 text-sm"></i></div>
                <div>
                  {customer.street && <p>{customer.street}</p>}
                  {(customer.city || customer.state || customer.zip) && (
                    <p className="text-slate-500">{[customer.city, customer.state, customer.zip].filter(Boolean).join(', ')}</p>
                  )}
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shrink-0"><i className="ri-calendar-line text-slate-400 text-sm"></i></div>
              <span>Customer since {memberSince}</span>
            </div>
          </div>

          {/* Tags */}
          {customer.tags.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {customer.tags.map((tag) => (
                  <span key={tag} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {customer.notes && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <i className="ri-sticky-note-line"></i> Internal Notes
              </p>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{customer.notes}</p>
            </div>
          )}

          {/* Order History */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Order History
              <span className="ml-2 px-1.5 py-0.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">{orders.length}</span>
            </p>
            {orders.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-sm bg-slate-50 rounded-xl">No orders found for this customer.</div>
            ) : (
              <div className="space-y-2">
                {orders.slice(0, 8).map((order) => (
                  <div key={order.id} className="border border-slate-100 rounded-xl px-4 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-mono font-bold text-slate-900">{order.id}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${getOrderStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span className="font-bold text-slate-900">{formatCurrency(order.total)}</span>
                    </div>
                    {order.items.length > 0 && (
                      <p className="text-xs text-slate-400 mt-1 truncate">
                        {order.items.map((i) => `${i.name} ×${i.quantity}`).join(', ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-7 py-4 border-t border-slate-100 shrink-0 flex items-center justify-between">
          <button
            onClick={onDelete}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-lg cursor-pointer whitespace-nowrap transition-colors"
          >
            <i className="ri-delete-bin-line"></i>
            Delete Customer
          </button>
          <button onClick={onEdit} className="flex items-center gap-2 px-5 py-2 bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold rounded-lg cursor-pointer whitespace-nowrap">
            <i className="ri-edit-line"></i>
            Edit Customer
          </button>
        </div>
      </div>
    </div>
  );
}
