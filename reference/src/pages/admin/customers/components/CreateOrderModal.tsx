import { useState } from 'react';
import type { Customer } from './CustomerFormModal';
import { saveActivity } from '../utils/customerActivities';

interface Props {
  customer: Customer;
  onClose: () => void;
  onCreated: () => void;
}

const PRODUCTS = [
  'Faux Wood Blinds',
  'Cellular Shades',
  'Roller Shades',
  'Roman Shades',
  'Wood Shutters',
  'Aluminum Blinds',
  'Solar Shades',
  'Woven Wood Shades',
  'Vertical Blinds',
  'Pleated Shades',
  'Custom Drapery',
  'Sheer Curtains',
];

const SIZES = [
  '24" x 36"', '24" x 48"', '24" x 60"', '24" x 72"',
  '30" x 48"', '30" x 60"', '30" x 72"',
  '36" x 48"', '36" x 60"', '36" x 72"',
  '48" x 60"', '48" x 64"', '48" x 72"',
  '60" x 72"', '60" x 84"', 'Custom',
];

interface OrderItem {
  id: string;
  product: string;
  size: string;
  quantity: number;
  price: number;
}

function genId() {
  return 'ORD-' + Math.floor(10000 + Math.random() * 90000);
}

export default function CreateOrderModal({ customer, onClose, onCreated }: Props) {
  const [items, setItems] = useState<OrderItem[]>([
    { id: '1', product: PRODUCTS[0], size: SIZES[4], quantity: 1, price: 149.99 },
  ]);
  const [shippingNote, setShippingNote] = useState('');
  const [priority, setPriority] = useState<'standard' | 'rush'>('standard');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [orderId] = useState(genId);

  const updateItem = (id: string, field: keyof OrderItem, value: string | number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { id: Date.now().toString(), product: PRODUCTS[0], size: SIZES[4], quantity: 1, price: 149.99 },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.price, 0);
  const shipping = priority === 'rush' ? 49.99 : subtotal > 500 ? 0 : 24.99;
  const total = subtotal + shipping;

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  const handleCreate = () => {
    setSaving(true);
    setTimeout(() => {
      // Save order to localStorage
      const order = {
        id: orderId,
        date: new Date().toISOString(),
        status: 'Working on Order',
        total,
        priority,
        shippingNote,
        customer: {
          id: customer.id,
          email: customer.email,
          name: `${customer.firstName} ${customer.lastName}`,
          phone: customer.phone,
          street: customer.street,
          city: customer.city,
          state: customer.state,
          zip: customer.zip,
        },
        items: items.map((i) => ({
          name: i.product,
          size: i.size,
          quantity: i.quantity,
          price: i.price,
          subtotal: i.quantity * i.price,
        })),
      };
      try {
        const existing: any[] = JSON.parse(localStorage.getItem('orders') ?? '[]');
        localStorage.setItem('orders', JSON.stringify([order, ...existing]));
      } catch { /* ignore */ }

      // Log to activity
      saveActivity(customer.id, {
        id: `order-${Date.now()}`,
        type: 'order',
        title: `Order ${orderId} created`,
        description: `${items.length} item(s) — ${items.map((i) => `${i.quantity}x ${i.product} (${i.size})`).join(', ')} — Total: ${fmt(total)}`,
        timestamp: new Date().toISOString(),
        icon: 'ri-file-add-line',
        color: 'bg-slate-900',
        meta: fmt(total),
      });

      setSaving(false);
      setSaved(true);
      setTimeout(() => {
        onCreated();
        onClose();
      }, 1200);
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <i className="ri-file-add-line text-emerald-600 text-lg"></i>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Create Order</h2>
              <p className="text-xs text-slate-500">
                {customer.firstName} {customer.lastName} &bull;
                <span className="font-mono ml-1 text-slate-400">{orderId}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors">
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Customer info */}
          <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center shrink-0">
              <span className="text-white text-sm font-bold">{customer.firstName.charAt(0)}{customer.lastName.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900">{customer.firstName} {customer.lastName}</p>
              <p className="text-xs text-slate-500">{customer.email} {customer.phone ? `· ${customer.phone}` : ''}</p>
              {(customer.street || customer.city) && (
                <p className="text-xs text-slate-400 mt-0.5">{[customer.street, customer.city, customer.state, customer.zip].filter(Boolean).join(', ')}</p>
              )}
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${customer.status === 'VIP' ? 'bg-amber-100 text-amber-700' : customer.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
              {customer.status}
            </span>
          </div>

          {/* Order items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Order Items</label>
              <button onClick={addItem} className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-800 cursor-pointer transition-colors">
                <i className="ri-add-circle-line text-sm"></i> Add Item
              </button>
            </div>
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={item.id} className="bg-slate-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Item {idx + 1}</span>
                    {items.length > 1 && (
                      <button onClick={() => removeItem(item.id)} className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-red-500 cursor-pointer transition-colors">
                        <i className="ri-close-line text-sm"></i>
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-500 block mb-1">Product</label>
                      <select
                        value={item.product}
                        onChange={(e) => updateItem(item.id, 'product', e.target.value)}
                        className="w-full border border-slate-200 focus:border-slate-400 rounded-lg px-3 py-2 text-sm outline-none bg-white text-slate-700 cursor-pointer"
                      >
                        {PRODUCTS.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 block mb-1">Size</label>
                      <select
                        value={item.size}
                        onChange={(e) => updateItem(item.id, 'size', e.target.value)}
                        className="w-full border border-slate-200 focus:border-slate-400 rounded-lg px-3 py-2 text-sm outline-none bg-white text-slate-700 cursor-pointer"
                      >
                        {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-500 block mb-1">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full border border-slate-200 focus:border-slate-400 rounded-lg px-3 py-2 text-sm outline-none text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 block mb-1">Unit Price ($)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                        className="w-full border border-slate-200 focus:border-slate-400 rounded-lg px-3 py-2 text-sm outline-none text-slate-700"
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-emerald-700">{fmt(item.quantity * item.price)}</span>
                    <span className="text-xs text-slate-400 ml-1">subtotal</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Fulfillment Priority</label>
            <div className="flex gap-2">
              {([
                { id: 'standard', label: 'Standard', icon: 'ri-truck-line', desc: 'Free over $500' },
                { id: 'rush', label: 'Rush (+$49.99)', icon: 'ri-flashlight-line', desc: 'Priority processing' },
              ] as const).map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPriority(p.id)}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold cursor-pointer whitespace-nowrap transition-all border flex-1 ${
                    priority === p.id
                      ? p.id === 'rush' ? 'bg-orange-50 text-orange-700 border-orange-300' : 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className={`${p.icon} text-sm`}></i>
                  </div>
                  <div className="text-left">
                    <p>{p.label}</p>
                    <p className={`text-xs font-normal ${priority === p.id && p.id !== 'rush' ? 'text-white/60' : 'text-slate-400'}`}>{p.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Shipping note */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1.5">Shipping / Special Instructions (optional)</label>
            <input
              type="text"
              value={shippingNote}
              onChange={(e) => setShippingNote(e.target.value)}
              placeholder="e.g. Call before delivery, Leave at gate, White-glove required..."
              className="w-full border border-slate-200 focus:border-slate-400 rounded-lg px-4 py-2.5 text-sm outline-none text-slate-700 placeholder-slate-400"
            />
          </div>

          {/* Order summary */}
          <div className="bg-emerald-50 rounded-xl p-4 space-y-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Order Summary</p>
            <div className="flex justify-between text-sm text-slate-600">
              <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} units)</span>
              <span className="font-semibold">{fmt(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-600">
              <span>Shipping {priority === 'rush' ? '(Rush)' : ''}</span>
              <span className="font-semibold">{shipping === 0 ? 'FREE' : fmt(shipping)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-emerald-100">
              <span>Total</span>
              <span className="text-emerald-700">{fmt(total)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 justify-end shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer whitespace-nowrap transition-colors">
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={saving || saved || items.every((i) => i.quantity < 1)}
            className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-lg cursor-pointer whitespace-nowrap transition-colors ${
              saved ? 'bg-emerald-500' : saving ? 'bg-emerald-400' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {saved ? (
              <><i className="ri-check-line text-base"></i> Order Created!</>
            ) : saving ? (
              <><i className="ri-loader-4-line text-base animate-spin"></i> Creating…</>
            ) : (
              <><i className="ri-file-add-line text-base"></i> Create Order</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
