import { useRef } from 'react';
import type { Order } from '../../types';

interface Props {
  order: Order;
  onPrintInvoice: () => void;
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

function getCustomerName(order: Order) {
  return `${order.customer?.firstName ?? ''} ${order.customer?.lastName ?? ''}`.trim() || '—';
}

export default function OrderItemsTab({ order, onPrintInvoice }: Props) {
  const subtotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax = subtotal * 0.0; // no tax for B2B
  const totalUnits = order.items.reduce((s, i) => s + i.quantity, 0);
  const avgUnitPrice = totalUnits > 0 ? subtotal / totalUnits : 0;

  return (
    <div className="space-y-5">
      {/* Summary Bar */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Line Items', value: order.items.length, icon: 'ri-list-check', color: 'text-slate-700', bg: 'bg-slate-50' },
          { label: 'Total Units', value: totalUnits.toLocaleString(), icon: 'ri-stack-line', color: 'text-sky-700', bg: 'bg-sky-50' },
          { label: 'Avg Unit Price', value: formatCurrency(avgUnitPrice), icon: 'ri-price-tag-3-line', color: 'text-amber-700', bg: 'bg-amber-50' },
          { label: 'Order Total', value: formatCurrency(order.total), icon: 'ri-money-dollar-circle-line', color: 'text-emerald-700', bg: 'bg-emerald-50' },
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

      {/* Invoice Header */}
      <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Invoice — {order.id}</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {new Date(order.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              &bull; {getCustomerName(order)}
              {order.customer?.companyName && ` — ${order.customer.companyName}`}
            </p>
          </div>
          <button
            onClick={onPrintInvoice}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold rounded-xl cursor-pointer whitespace-nowrap"
          >
            <i className="ri-printer-line text-base"></i>
            Print / PDF
          </button>
        </div>

        {/* Line Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Size</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Quantity</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Unit Price</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {order.items.map((item, idx) => (
                <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                        <i className="ri-product-hunt-line text-slate-500 text-base"></i>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-400">SKU: BLD-{String(item.id).padStart(5, '0')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm text-slate-600 font-medium">{item.size}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-bold text-slate-900">{item.quantity.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm text-slate-600">{formatCurrency(item.price)}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-bold text-slate-900">{formatCurrency(item.price * item.quantity)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="border-t border-slate-100 px-6 py-5">
          <div className="max-w-xs ml-auto space-y-2">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-400">
              <span>Tax (exempt)</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-400">
              <span>Shipping</span>
              <span>Calculated at fulfillment</span>
            </div>
            <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
              <span>Order Total</span>
              <span className="text-emerald-700">{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product breakdown chart */}
      <div className="bg-white border border-slate-100 rounded-xl p-5">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Value Breakdown by Product</p>
        <div className="space-y-3">
          {order.items.map((item) => {
            const itemTotal = item.price * item.quantity;
            const pct = subtotal > 0 ? (itemTotal / subtotal) * 100 : 0;
            return (
              <div key={item.id}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-700">{item.name} <span className="text-slate-400 font-normal">({item.size})</span></span>
                  <span className="text-slate-500">{formatCurrency(itemTotal)} ({pct.toFixed(0)}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="h-2 bg-slate-900 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
