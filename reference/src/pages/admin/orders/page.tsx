import { useState, useMemo, useEffect, useRef } from 'react';
import { logActivity } from '../../../utils/adminActivity';
import EmailTemplateEditor from './components/EmailTemplateEditor';
import ShippingLabelModal from './components/ShippingLabelModal';
import OrderFullView from './components/OrderFullView';
import type { Order, ShippingLabel } from './types';

interface OrderItem {
  id: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size: string;
}

const seedOrders: Order[] = [
  {
    id: 'ORD-10001',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Delivered',
    total: 454272.0,
    period: 'today',
    customer: { firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.johnson@example.com', companyName: 'Johnson Interiors' },
    items: [{ id: 1, name: 'Faux Wood Blinds', image: '', price: 141.96, quantity: 3200, size: '36" x 60"' }],
  },
  {
    id: 'ORD-10002',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Delivered',
    total: 397656.0,
    period: 'thisWeek',
    customer: { firstName: 'David', lastName: 'Nguyen', email: 'david.nguyen@example.com', companyName: 'Nguyen Design Co.' },
    items: [{ id: 2, name: 'Cellular Shades', image: '', price: 141.99, quantity: 2800, size: '48" x 64"' }],
  },
  {
    id: 'ORD-10003',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Fulfilled & Shipped',
    total: 354975.0,
    period: 'thisWeek',
    customer: { firstName: 'Marcus', lastName: 'Rivera', email: 'marcus.rivera@example.com', companyName: 'Rivera Renovations' },
    items: [{ id: 3, name: 'Roller Shades', image: '', price: 141.99, quantity: 2500, size: '42" x 72"' }],
    trackingNumber: 'TRK-9982341',
    fulfilledAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ORD-10004',
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Pending',
    total: 298089.0,
    period: 'lastWeek',
    customer: { firstName: 'Priya', lastName: 'Patel', email: 'priya.patel@example.com', companyName: 'Patel Home Solutions' },
    items: [{ id: 4, name: 'Roman Shades', image: '', price: 141.95, quantity: 2100, size: '36" x 68"' }],
  },
  {
    id: 'ORD-10005',
    date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Delivered',
    total: 198758.0,
    period: 'lastWeek',
    customer: { firstName: 'Emily', lastName: 'Chen', email: 'emily.chen@example.com', companyName: 'Chen Window Works' },
    items: [{ id: 5, name: 'Vertical Blinds', image: '', price: 141.97, quantity: 1400, size: '60" x 84"' }],
  },
  {
    id: 'ORD-10006',
    date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Delivered',
    total: 283920.0,
    period: 'lastWeek',
    customer: { firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.johnson@example.com', companyName: 'Johnson Interiors' },
    items: [{ id: 6, name: 'Cellular Shades', image: '', price: 141.96, quantity: 2000, size: '48" x 64"' }],
  },
  {
    id: 'ORD-10007',
    date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Delivered',
    total: 170352.0,
    period: 'lastWeek',
    customer: { firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.johnson@example.com', companyName: 'Johnson Interiors' },
    items: [{ id: 7, name: 'Roman Shades', image: '', price: 141.96, quantity: 1200, size: '36" x 68"' }],
  },
  {
    id: 'ORD-10008',
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Fulfilled & Shipped',
    total: 340776.0,
    period: 'lastWeek',
    customer: { firstName: 'David', lastName: 'Nguyen', email: 'david.nguyen@example.com', companyName: 'Nguyen Design Co.' },
    items: [{ id: 8, name: 'Roller Shades', image: '', price: 141.99, quantity: 2400, size: '42" x 72"' }],
    trackingNumber: 'TRK-1123456',
    fulfilledAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ── Normalize a raw localStorage order into the admin Order shape ──────────
function normalizeStoredOrder(o: any): Order & { isReorder?: boolean; originalOrderId?: string } {
  const firstName = o.customer?.firstName ?? o.customer?.fullName?.split(' ')[0] ?? '';
  const lastName = o.customer?.lastName ?? o.customer?.fullName?.split(' ').slice(1).join(' ') ?? '';
  const email = o.customer?.email ?? o.email ?? '';
  const companyName = o.customer?.companyName ?? '';

  // Determine period label based on age
  const ageMs = Date.now() - new Date(o.date).getTime();
  const ageDays = ageMs / 86400000;
  let period = 'lastWeek';
  if (ageDays < 1) period = 'today';
  else if (ageDays < 7) period = 'thisWeek';

  return {
    id: o.id,
    date: o.date,
    status: o.status === 'placed' || o.status === 'Processing' ? 'Working on Order' : (o.status ?? 'Working on Order'),
    total: o.total ?? 0,
    period,
    customer: { firstName, lastName, email, companyName, salesRep: o.customer?.salesRep ?? undefined },
    items: (o.items ?? []).map((item: any) => ({
      id: item.id,
      name: item.name,
      image: item.image ?? '',
      price: item.price,
      quantity: item.quantity,
      size: item.size ?? (item.width && item.height ? `${item.width}" x ${item.height}"` : ''),
    })),
    trackingNumber: o.trackingNumber,
    fulfilledAt: o.fulfilledAt,
    isReorder: o.isReorder === true,
    originalOrderId: o.originalOrderId,
  } as any;
}

// ── Load all orders from localStorage, merged with seed data ──────────────
function loadAllOrdersFromStorage(): { regular: Order[]; reorders: Order[] } {
  try {
    const stored: any[] = JSON.parse(localStorage.getItem('orders') ?? '[]');
    const normalized = stored.map(normalizeStoredOrder);

    const storedReorders = normalized.filter((o: any) => o.isReorder === true);
    const storedRegular = normalized.filter((o: any) => !o.isReorder);

    // Merge stored regular orders with seed (avoid duplicates)
    const storedIds = new Set(storedRegular.map((o) => o.id));
    const filteredSeed = seedOrders.filter((o) => !storedIds.has(o.id));
    const regular = [...storedRegular, ...filteredSeed];

    return { regular, reorders: storedReorders };
  } catch (_e) {
    return { regular: seedOrders, reorders: [] };
  }
}

const STATUS_OPTIONS = ['Pending', 'Working on Order', 'Ready for Pickup', 'Fulfilled & Shipped', 'Delivered', 'Cancelled', 'Refunded'];

const SUPABASE_URL = import.meta.env.VITE_PUBLIC_SUPABASE_URL as string;

// ── Helpers ────────────────────────────────────────────────────────────────
function getStatusColor(status: string) {
  switch (status) {
    case 'Delivered':
      return 'bg-emerald-100 text-emerald-700';
    case 'Fulfilled & Shipped':
      return 'bg-teal-100 text-teal-700';
    case 'Ready for Pickup':
      return 'bg-orange-100 text-orange-700';
    case 'Working on Order':
      return 'bg-sky-100 text-sky-700';
    case 'Pending':
      return 'bg-amber-100 text-amber-700';
    case 'Cancelled':
      return 'bg-red-100 text-red-700';
    case 'Refunded':
      return 'bg-rose-100 text-rose-700';
    default:
      return 'bg-slate-100 text-slate-600';
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'Delivered':
      return 'ri-checkbox-circle-line';
    case 'Fulfilled & Shipped':
      return 'ri-truck-line';
    case 'Ready for Pickup':
      return 'ri-store-2-line';
    case 'Working on Order':
      return 'ri-tools-line';
    case 'Pending':
      return 'ri-time-line';
    case 'Cancelled':
      return 'ri-close-circle-line';
    case 'Refunded':
      return 'ri-arrow-go-back-line';
    default:
      return 'ri-question-line';
  }
}

function getPeriodLabel(order: Order) {
  const p = order.period ?? 'lastWeek';
  switch (p) {
    case 'today':
      return { label: 'Today / New', icon: 'ri-star-line', classes: 'bg-violet-100 text-violet-700' };
    case 'thisWeek':
      return { label: 'This Week', icon: 'ri-calendar-line', classes: 'bg-sky-100 text-sky-700' };
    case 'lastWeek':
      return { label: 'Last Week', icon: 'ri-history-line', classes: 'bg-slate-100 text-slate-600' };
    case 'pending':
      return { label: 'Pending', icon: 'ri-time-line', classes: 'bg-amber-100 text-amber-700' };
    default:
      return { label: 'Last Week', icon: 'ri-history-line', classes: 'bg-slate-100 text-slate-600' };
  }
}

function getCustomerName(order: Order) {
  if (order.customer?.firstName || order.customer?.lastName) {
    return `${order.customer.firstName ?? ''} ${order.customer.lastName ?? ''}`.trim();
  }
  return '—';
}

function getCustomerEmail(order: Order) {
  return order.customer?.email ?? '—';
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ── Build Admin Invoice HTML ─────────────────────────────────────────────
function buildAdminInvoiceHTML(order: Order): string {
  const customerName = getCustomerName(order);
  const customerEmail = getCustomerEmail(order);
  const companyName = order.customer?.companyName ?? '';
  const orderDate = new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const itemsHTML = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px 8px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #1e293b;">${item.name}</td>
      <td style="padding: 12px 8px; border-bottom: 1px solid #e2e8f0; text-align: center; font-size: 14px; color: #64748b;">${item.size}</td>
      <td style="padding: 12px 8px; border-bottom: 1px solid #e2e8f0; text-align: center; font-size: 14px; font-weight: 600; color: #1e293b;">${item.quantity.toLocaleString()}</td>
      <td style="padding: 12px 8px; border-bottom: 1px solid #e2e8f0; text-align: right; font-size: 14px; color: #64748b;">$${item.price.toFixed(2)}</td>
      <td style="padding: 12px 8px; border-bottom: 1px solid #e2e8f0; text-align: right; font-size: 14px; font-weight: 600; color: #1e293b;">$${(item.price * item.quantity).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}</td>
    </tr>
  `
    )
    .join('');

  const statusBadgeColor =
    order.status === 'Delivered'
      ? '#10b981'
      : order.status === 'Fulfilled & Shipped'
      ? '#14b8a6'
      : order.status === 'Pending'
      ? '#f59e0b'
      : '#ef4444';

  const trackingHTML = order.trackingNumber
    ? `
    <div style="background: #f0fdfa; border: 1px solid #99f6e4; border-radius: 8px; padding: 12px 16px; margin-top: 20px; display: flex; align-items: center; gap: 8px;">
      <span style="color: #14b8a6; font-size: 16px;">🚚</span>
      <span style="font-size: 14px; color: #0f766e; font-weight: 500;">Tracking:</span>
      <span style="font-size: 14px; font-family: 'Courier New', monospace; font-weight: 700; color: #115e59;">${order.trackingNumber}</span>
    </div>
  `
    : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Invoice - ${order.id}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; background: #ffffff; color: #1e293b; }
        .container { max-width: 800px; margin: 0 auto; }
        .header { border-bottom: 3px solid #10b981; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { font-size: 28px; color: #1e293b; font-weight: 700; margin-bottom: 4px; }
        .header p { font-size: 14px; color: #64748b; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
        .info-box { background: #f8fafc; border-radius: 8px; padding: 16px; }
        .info-box h3 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; font-weight: 600; margin-bottom: 8px; }
        .info-box p { font-size: 14px; color: #1e293b; line-height: 1.6; }
        .status-badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; color: white; background: ${statusBadgeColor}; margin-top: 8px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        thead th { background: #f1f5f9; padding: 12px 8px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; font-weight: 600; border-bottom: 2px solid #e2e8f0; }
        tfoot td { padding: 16px 8px; border-top: 2px solid #cbd5e1; font-size: 16px; font-weight: 700; color: #1e293b; }
        @media print {
          body { padding: 20px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Classic Same Day Blinds</h1>
          <p>Order Invoice</p>
        </div>

        <div class="info-grid">
          <div class="info-box">
            <h3>Order Information</h3>
            <p><strong>Order ID:</strong> ${order.id}</p>
            <p><strong>Date:</strong> ${orderDate}</p>
            <div class="status-badge">${order.status}</div>
          </div>
          <div class="info-box">
            <h3>Customer Information</h3>
            <p><strong>${customerName}</strong></p>
            ${companyName ? `<p>${companyName}</p>` : ''}
            <p>${customerEmail}</p>
          </div>
        </div>

        ${trackingHTML}

        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th style="text-align: center;">Size</th>
              <th style="text-align: center;">Quantity</th>
              <th style="text-align: right;">Unit Price</th>
              <th style="text-align: right;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4" style="text-align: right; padding-right: 16px;">Order Total</td>
              <td style="text-align: right; color: #10b981;">$${order.total.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </body>
    </html>
  `;
}

// ── Send Email Modal ───────────────────────────────────────────────────────
interface SendEmailModalProps {
  email: string;
  customerName: string;
  onClose: () => void;
}

function SendEmailModal({ email, customerName, onClose }: SendEmailModalProps) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSend = () => {
    if (!subject.trim() || !message.trim()) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
              <i className="ri-mail-send-line text-emerald-600 text-lg"></i>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Send Email</h3>
              <p className="text-xs text-slate-500">
                To: {customerName} &lt;{email}&gt;
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500">
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>

        {sent ? (
          <div className="px-6 py-12 flex flex-col items-center gap-3 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
              <i className="ri-checkbox-circle-line text-emerald-600 text-3xl"></i>
            </div>
            <p className="text-lg font-bold text-slate-900">Email Sent!</p>
            <p className="text-sm text-slate-500">
              Your message has been sent to{' '}
              <span className="font-semibold text-slate-700">{customerName}</span>.
            </p>
            <button onClick={onClose} className="mt-2 px-6 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-700">
              Close
            </button>
          </div>
        ) : (
          <div className="px-6 py-5 space-y-4">
            {/* To field */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                To
              </label>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5">
                <div className="w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{customerName.charAt(0)}</span>
                </div>
                <span className="text-sm text-slate-700 font-medium">{customerName}</span>
                <span className="text-sm text-slate-400">&lt;{email}&gt;</span>
              </div>
            </div>
            {/* Subject */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Your order update, Special offer..."
                className="w-full text-sm border border-slate-200 focus:border-slate-400 rounded-lg px-3 py-2.5 outline-none text-slate-700 placeholder-slate-400"
              />
            </div>
            {/* Message */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 500))}
                placeholder={`Hi ${customerName},\n\nWrite your message here...`}
                rows={5}
                className="w-full text-sm border border-slate-200 focus:border-slate-400 rounded-lg px-3 py-2.5 outline-none text-slate-700 placeholder-slate-400 resize-none"
              />
              <p className="text-xs text-slate-400 text-right mt-1">{message.length}/500</p>
            </div>
            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-1">
              <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg whitespace-nowrap">
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={!subject.trim() || !message.trim() || sending}
                className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg text-sm font-semibold"
              >
                {sending ? (
                  <>
                    <i className="ri-loader-4-line animate-spin"></i> Sending...
                  </>
                ) : (
                  <>
                    <i className="ri-send-plane-line"></i> Send Email
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Client Profile Modal ───────────────────────────────────────────────────
interface ClientProfileModalProps {
  email: string;
  orders: Order[];
  onClose: () => void;
}

function ClientProfileModal({ email, orders, onClose }: ClientProfileModalProps) {
  const clientOrders = orders.filter((o) => o.customer?.email === email);
  const firstOrder = clientOrders[0];
  const customerName = firstOrder ? getCustomerName(firstOrder) : email;
  const companyName = firstOrder?.customer?.companyName ?? '';

  const totalSpent = clientOrders.reduce((s, o) => s + o.total, 0);
  const totalUnits = clientOrders.reduce((s, o) => s + o.items.reduce((si, i) => si + i.quantity, 0), 0);
  const deliveredCount = clientOrders.filter((o) => o.status === 'Delivered').length;
  const avgOrder = clientOrders.length > 0 ? totalSpent / clientOrders.length : 0;

  const [selectedOrderId, setSelectedOrderId] = useState<string>(clientOrders[0]?.id ?? '');
  const selectedOrder = clientOrders.find((o) => o.id === selectedOrderId) ?? clientOrders[0];

  const notesKey = `client_notes_${email}`;
  const [note, setNote] = useState(() => localStorage.getItem(notesKey) ?? '');
  const [noteEditing, setNoteEditing] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  const handleSaveNote = () => {
    localStorage.setItem(notesKey, note);
    setNoteSaved(true);
    setNoteEditing(false);
    setTimeout(() => setNoteSaved(false), 2500);
  };

  const handleExportCSV = () => {
    const rows = [
      ['Order ID', 'Date', 'Status', 'Items', 'Units', 'Total'],
      ...clientOrders.map((o) => [
        o.id,
        formatDate(o.date),
        o.status,
        o.items.map((i) => `${i.name} x${i.quantity}`).join('; '),
        o.items.reduce((s, i) => s + i.quantity, 0).toString(),
        o.total.toFixed(2),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${customerName.replace(/\s+/g, '_')}_orders.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {showEmailModal && (
        <SendEmailModal email={email} customerName={customerName} onClose={() => setShowEmailModal(false)} />
      )}
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">{customerName.charAt(0)}</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{customerName}</h2>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  {companyName && (
                    <span className="flex items-center gap-1 text-sm text-slate-500">
                      <i className="ri-building-2-line text-slate-400"></i>
                      {companyName}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-sm text-slate-500">
                    <i className="ri-mail-line text-slate-400"></i>
                    {email}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Send Email Button */}
              <button
                onClick={() => setShowEmailModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-700 text-white rounded-lg text-sm font-semibold"
              >
                <i className="ri-mail-send-line"></i>
                Send Email
              </button>
              <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold">
                <i className="ri-download-2-line"></i>
                Export CSV
              </button>
              <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-red-50 hover:text-red-500 text-slate-400">
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
          </div>

          {/* Scrollable body */}
          <div className="overflow-y-auto flex-1 px-8 py-6 space-y-6">
            {/* Stats row */}
            <div className="grid grid-cols-5 gap-3">
              {[
                { label: 'Total Orders', value: clientOrders.length.toString(), icon: 'ri-file-list-3-line', bg: 'bg-slate-50', text: 'text-slate-900' },
                { label: 'Total Spent', value: formatCurrency(totalSpent), icon: 'ri-money-dollar-circle-line', bg: 'bg-emerald-50', text: 'text-emerald-700' },
                { label: 'Avg Order', value: formatCurrency(avgOrder), icon: 'ri-bar-chart-line', bg: 'bg-amber-50', text: 'text-amber-700' },
                { label: 'Delivered', value: deliveredCount.toString(), icon: 'ri-checkbox-circle-line', bg: 'bg-teal-50', text: 'text-teal-700' },
                { label: 'Total Units', value: totalUnits.toLocaleString(), icon: 'ri-stack-line', bg: 'bg-slate-50', text: 'text-slate-700' },
              ].map((stat) => (
                <div key={stat.label} className={`${stat.bg} rounded-xl p-4 text-center`}>
                  <div className={`w-8 h-8 flex items-center justify-center mx-auto mb-1 ${stat.text}`}>
                    <i className={`${stat.icon} text-lg`}></i>
                  </div>
                  <p className={`text-lg font-bold ${stat.text}`}>{stat.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Internal Notes */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center">
                    <i className="ri-sticky-note-line text-amber-600 text-sm"></i>
                  </div>
                  <p className="text-sm font-bold text-slate-900">Internal Notes</p>
                  <span className="text-xs text-slate-400">— admin only</span>
                </div>
                <div className="flex items-center gap-2">
                  {noteSaved && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                      <i className="ri-check-line"></i> Saved
                    </span>
                  )}
                  {note && !noteEditing && (
                    <button onClick={() => setNoteEditing(true)} className="text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
                      <i className="ri-edit-line mr-1"></i>Edit
                    </button>
                  )}
                  {note && (
                    <button
                      onClick={() => {
                        setNote('');
                        localStorage.removeItem(notesKey);
                        setNoteEditing(false);
                      }}
                      className="text-xs font-medium text-red-500 hover:text-red-700 bg-white border border-red-100 px-3 py-1.5 rounded-lg"
                    >
                      <i className="ri-delete-bin-line mr-1"></i>Clear
                    </button>
                  )}
                </div>
              </div>
              {note && !noteEditing ? (
                <div
                  onClick={() => setNoteEditing(true)}
                  className="w-full min-h-[72px] bg-white border border-amber-200 rounded-lg px-4 py-3 text-sm text-slate-700 leading-relaxed cursor-text whitespace-pre-wrap"
                >
                  {note}
                </div>
              ) : (
                <div>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    onFocus={() => setNoteEditing(true)}
                    placeholder="Add internal notes about this client — e.g. preferred contact, special pricing, follow-up reminders..."
                    maxLength={500}
                    rows={3}
                    className="w-full bg-white border border-amber-200 focus:border-amber-400 rounded-lg px-4 py-3 text-sm text-slate-700 placeholder-slate-400 outline-none resize-none"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-slate-400">{note.length}/500</span>
                    <div className="flex gap-2">
                      {noteEditing && note && (
                        <button onClick={() => setNoteEditing(false)} className="px-3 py-1.5 text-xs text-slate-500 bg-white border border-slate-200 rounded-lg">
                          Cancel
                        </button>
                      )}
                      <button onClick={handleSaveNote} disabled={!note.trim()} className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg">
                        <i className="ri-save-line"></i> Save Note
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Order History */}
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Order History ({clientOrders.length} orders)
              </p>
              {clientOrders.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">No orders found for this client.</div>
              ) : (
                <div className="space-y-2 mb-5">
                  {clientOrders.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => setSelectedOrderId(o.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 text-sm font-semibold cursor-pointer transition-all ${
                        selectedOrderId === o.id
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`font-mono text-sm font-semibold ${selectedOrderId === o.id ? 'text-white' : 'text-slate-900'}`}>{o.id}</span>
                        <span className={`text-xs ${selectedOrderId === o.id ? 'text-slate-300' : 'text-slate-500'}`}>{formatDate(o.date)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                            selectedOrderId === o.id
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          <i className="ri-time-line"></i>
                          {o.status}
                        </span>
                        <span className={`text-sm font-bold ${selectedOrderId === o.id ? 'text-white' : 'text-slate-900'}`}>{formatCurrency(o.total)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Order Detail */}
            {selectedOrder && (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-900">
                    <i className="ri-file-text-line mr-1.5 text-slate-500"></i>
                    Order Detail — <span className="font-mono">{selectedOrder.id}</span>
                  </p>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(selectedOrder.status)}`}>
                    <i className={getStatusIcon(selectedOrder.status)}></i>
                    {selectedOrder.status}
                  </span>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-1">Order Date</p>
                      <p className="text-sm font-bold text-slate-900">{formatDate(selectedOrder.date)}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-1">Total Units</p>
                      <p className="text-sm font-bold text-slate-900">{selectedOrder.items.reduce((sum, item) => sum + item.quantity, 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-1">Order Total</p>
                      <p className="text-sm font-bold text-emerald-700">{formatCurrency(selectedOrder.total)}</p>
                    </div>
                  </div>
                  {selectedOrder.trackingNumber && (
                    <div className="bg-teal-50 border border-teal-200 rounded-lg px-4 py-2.5 flex items-center gap-2">
                      <i className="ri-truck-line text-teal-600"></i>
                      <span className="text-sm text-teal-700 font-medium">Tracking: </span>
                      <span className="text-sm font-mono font-bold text-teal-800">{selectedOrder.trackingNumber}</span>
                      {selectedOrder.fulfilledAt && (
                        <span className="text-xs text-teal-500 ml-auto">Shipped {formatDate(selectedOrder.fulfilledAt)}</span>
                      )}
                    </div>
                  )}
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left pb-2 text-xs font-bold text-slate-400 uppercase tracking-wide">Product</th>
                        <th className="text-center pb-2 text-xs font-bold text-slate-400 uppercase tracking-wide">Size</th>
                        <th className="text-center pb-2 text-xs font-bold text-slate-400 uppercase tracking-wide">Qty</th>
                        <th className="text-right pb-2 text-xs font-bold text-slate-400 uppercase tracking-wide">Unit Price</th>
                        <th className="text-right pb-2 text-xs font-bold text-slate-400 uppercase tracking-wide">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item, idx) => (
                        <tr key={item.id} className={idx !== selectedOrder.items.length - 1 ? 'border-b border-slate-50' : ''}>
                          <td className="py-3 text-sm font-semibold text-slate-900">{item.name}</td>
                          <td className="py-3 text-center text-sm text-slate-500">{item.size}</td>
                          <td className="py-3 text-center text-sm font-bold text-slate-900">{item.quantity.toLocaleString()}</td>
                          <td className="py-3 text-right text-sm text-slate-600">{formatCurrency(item.price)}</td>
                          <td className="py-3 text-right text-sm font-bold text-slate-900">{formatCurrency(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-200">
                        <td colSpan={4} className="pt-3 text-sm font-bold text-slate-700 text-right pr-4">
                          Order Total
                        </td>
                        <td className="pt-3 text-right text-base font-bold text-slate-900">{formatCurrency(selectedOrder.total)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Label Status Helpers ───────────────────────────────────────────────────
function getLabelStatusColor(status: string) {
  switch (status) {
    case 'Printed':
      return 'bg-emerald-100 text-emerald-700';
    case 'Pending':
      return 'bg-amber-100 text-amber-700';
    case 'Voided':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-slate-100 text-slate-600';
  }
}

function getLabelStatusIcon(status: string) {
  switch (status) {
    case 'Printed':
      return 'ri-printer-fill';
    case 'Pending':
      return 'ri-time-line';
    case 'Voided':
      return 'ri-close-circle-line';
    default:
      return 'ri-question-line';
  }
}

// ── Label Viewer Modal ─────────────────────────────────────────────────────
interface LabelViewerModalProps {
  label: ShippingLabel;
  onClose: () => void;
  onPrint: (label: ShippingLabel) => void;
  onRestore?: (labelId: string, status: 'Pending' | 'Printed') => void;
}

function LabelViewerModal({ label, onClose, onPrint, onRestore }: LabelViewerModalProps) {
  const isVoided = label.status === 'Voided';

  return (
    <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isVoided ? 'bg-red-100' : 'bg-teal-100'}`}>
              <i className={`ri-printer-line text-lg ${isVoided ? 'text-red-500' : 'text-teal-600'}`}></i>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Shipping Label — {label.id}</h3>
              <p className="text-xs text-slate-500">Order: {label.orderId} · {label.customerName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isVoided ? (
              <>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                  <i className="ri-close-circle-line"></i> Voided
                </span>
                {onRestore && (
                  <>
                    <button
                      onClick={() => onRestore(label.id, 'Pending')}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-semibold whitespace-nowrap"
                    >
                      <i className="ri-time-line"></i>
                      Restore as Pending
                    </button>
                    <button
                      onClick={() => onRestore(label.id, 'Printed')}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold whitespace-nowrap"
                    >
                      <i className="ri-printer-fill"></i>
                      Restore as Printed
                    </button>
                  </>
                )}
              </>
            ) : (
              <button
                onClick={() => onPrint(label)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-700 text-white rounded-lg text-sm font-semibold"
              >
                <i className="ri-printer-line"></i>
                Print / Reprint
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"
            >
              <i className="ri-close-line text-lg"></i>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Voided Banner */}
          {isVoided && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                <i className="ri-close-circle-line text-red-500 text-base"></i>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-red-700">This label has been voided</p>
                <p className="text-xs text-red-500 mt-0.5">Use the restore buttons above to bring it back to Pending or Printed status.</p>
              </div>
            </div>
          )}

          {/* Status & Meta */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${getLabelStatusColor(label.status ?? 'Pending')}`}>
              <i className={`${getLabelStatusIcon(label.status ?? 'Pending')} text-xs`}></i>
              {label.status ?? 'Pending'}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">
              <i className="ri-truck-line"></i>
              {label.carrier} — {label.service}
            </span>
            <span className="text-xs text-slate-400">
              Created {new Date(label.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          {/* Label Preview Card */}
          <div className={`border-4 rounded-xl p-5 bg-white mx-auto ${isVoided ? 'border-red-300 opacity-60' : 'border-slate-900'}`} style={{ maxWidth: '420px' }}>
            {/* Carrier Badge */}
            <div className={`text-white text-center py-2.5 rounded-lg mb-4 ${isVoided ? 'bg-red-400' : 'bg-slate-900'}`}>
              <p className="text-lg font-bold tracking-wide">{label.carrier} — {label.service}</p>
            </div>

            {/* FROM */}
            <div className="mb-4">
              <div className="bg-slate-900 text-white text-xs font-bold uppercase px-2 py-1 mb-2 rounded">FROM</div>
              <div className="text-sm leading-relaxed pl-1">
                <p className="font-bold text-slate-900">{label.senderAddress.name}</p>
                {label.senderAddress.company && <p className="text-slate-600">{label.senderAddress.company}</p>}
                <p className="text-slate-700">{label.senderAddress.street}</p>
                <p className="text-slate-700">{label.senderAddress.city}, {label.senderAddress.state} {label.senderAddress.zip}</p>
                <p className="text-slate-500">{label.senderAddress.phone}</p>
              </div>
            </div>

            {/* TO */}
            <div className="mb-4">
              <div className="bg-slate-900 text-white text-xs font-bold uppercase px-2 py-1 mb-2 rounded">TO</div>
              <div className="text-sm leading-relaxed pl-1">
                <p className="font-bold text-slate-900">{label.recipientAddress.name}</p>
                {label.recipientAddress.company && <p className="text-slate-600">{label.recipientAddress.company}</p>}
                <p className="text-slate-700">{label.recipientAddress.street}</p>
                <p className="text-slate-700">{label.recipientAddress.city}, {label.recipientAddress.state} {label.recipientAddress.zip}</p>
                <p className="text-slate-500">{label.recipientAddress.phone}</p>
              </div>
            </div>

            {/* Barcode */}
            <div className="border-2 border-slate-900 text-center py-3 mb-2 rounded">
              <p className="font-mono text-2xl font-bold tracking-widest">*{label.orderId}*</p>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-2 mt-3">
              {[
                { label: 'Order ID', value: label.orderId },
                { label: 'Label ID', value: label.id },
                { label: 'Weight', value: label.weight },
                { label: 'Dimensions', value: label.service },
              ].map((item) => (
                <div key={item.label} className="border border-slate-300 rounded p-2">
                  <p className="text-xs font-bold uppercase text-slate-400">{item.label}</p>
                  <p className="text-sm font-bold text-slate-900 font-mono">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Internal Notes */}
            {(label as any).notes && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <i className="ri-sticky-note-line text-amber-600"></i>
                  Internal Notes / Memo
                </p>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{(label as any).notes}</p>
                <p className="text-xs text-amber-500 mt-2 flex items-center gap-1">
                  <i className="ri-lock-line"></i>
                  Visible to staff only — not printed on label
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Bulk Label Print Modal ─────────────────────────────────────────────────
interface BulkLabelModalProps {
  orders: Order[];
  onClose: () => void;
  onSaveAll: (labels: ShippingLabel[]) => void;
}

function BulkLabelModal({ orders, onClose, onSaveAll }: BulkLabelModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});

  const handleTrackingChange = (orderId: string, value: string) => {
    setTrackingInputs((prev) => ({ ...prev, [orderId]: value }));
  };

  const allSelectedHaveTracking = Array.from(selectedIds).every(
    (id) => (trackingInputs[id] ?? '').trim().length > 0
  );

  return (
    <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center">
              <i className="ri-printer-line text-2xl text-white"></i>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Bulk Print Labels</h3>
              <p className="text-xs text-slate-500">Select orders and enter tracking numbers</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500">
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Orders Selection */}
          <div className="space-y-3">
            <p className="text-sm font-bold text-slate-700">Select Orders</p>
            {orders.map((order) => (
              <button
                key={order.id}
                onClick={() => setSelectedIds((prev) => {
                  const next = new Set(prev);
                  next.has(order.id) ? next.delete(order.id) : next.add(order.id);
                  return next;
                })}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 text-sm font-semibold cursor-pointer transition-all ${
                  selectedIds.has(order.id)
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`font-mono text-sm font-semibold ${selectedIds.has(order.id) ? 'text-white' : 'text-slate-900'}`}>{order.id}</span>
                  <span className={`text-xs ${selectedIds.has(order.id) ? 'text-slate-300' : 'text-slate-500'}`}>{getCustomerName(order)}</span>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                  <i className={getStatusIcon(order.status)}></i>
                  {order.status}
                </span>
              </button>
            ))}
          </div>

          {/* Tracking Numbers for selected orders */}
          {selectedIds.size > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-bold text-slate-700">Enter Tracking Numbers</p>
              {Array.from(selectedIds).map((orderId) => (
                <div key={orderId} className="flex items-center gap-3">
                  <span className="font-mono text-sm font-semibold text-slate-900 w-28 shrink-0">{orderId}</span>
                  <input
                    type="text"
                    value={trackingInputs[orderId] ?? ''}
                    onChange={(e) => handleTrackingChange(orderId, e.target.value)}
                    placeholder="Tracking number"
                    className="flex-1 text-sm border border-slate-200 focus:border-slate-400 rounded-lg px-3 py-2.5 outline-none text-slate-700 placeholder-slate-400"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg whitespace-nowrap">
              Cancel
            </button>
            <button
              onClick={() => onSaveAll(Array.from(selectedIds) as any)}
              disabled={selectedIds.size === 0 || !allSelectedHaveTracking}
              className="flex items-center gap-2 px-5 py-2 bg-slate-900 hover:bg-slate-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg text-sm font-semibold whitespace-nowrap"
            >
              <i className="ri-printer-line"></i>
              Print {selectedIds.size > 0 ? `${selectedIds.size} ` : ''}Selected
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Export Orders to CSV ───────────────────────────────────────────────────
function exportOrdersToCSV(exportOrders: Order[], filename: string) {
  const rows = [
    ['Order ID', 'Date', 'Period', 'Status', 'Customer First Name', 'Customer Last Name', 'Company', 'Email', 'Items', 'Total Units', 'Order Total (USD)', 'Tracking Number', 'Fulfilled At'],
    ...exportOrders.map((o) => {
      const itemsSummary = o.items
        .map((i) => `${i.name} (${i.size}) x${i.quantity} @ $${i.price.toFixed(2)}`)
        .join(' | ');
      const totalUnitsRow = o.items.reduce((s, i) => s + i.quantity, 0);
      return [
        o.id,
        formatDate(o.date),
        o.period ?? '',
        o.status,
        o.customer?.firstName ?? '',
        o.customer?.lastName ?? '',
        o.customer?.companyName ?? '',
        o.customer?.email ?? '',
        itemsSummary,
        totalUnitsRow.toString(),
        o.total.toFixed(2),
        o.trackingNumber ?? '',
        o.fulfilledAt ? formatDate(o.fulfilledAt) : '',
      ];
    }),
  ];

  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function AdminOrdersPage() {
  const { regular: initialRegular, reorders: initialReorders } = loadAllOrdersFromStorage();
  const [orders, setOrders] = useState<Order[]>(initialRegular);
  const [activeTab, setActiveTab] = useState<'all' | 'reorders' | 'labels'>('all');
  const [reorderOrders, setReorderOrders] = useState<Order[]>(initialReorders);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [fullViewOrder, setFullViewOrder] = useState<Order | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [trackingInput, setTrackingInput] = useState('');
  const [clientProfileEmail, setClientProfileEmail] = useState<string | null>(null);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [reorderToast, setReorderToast] = useState<string | null>(null);
  const [statusSaved, setStatusSaved] = useState(false);
  const [showEmailTemplateEditor, setShowEmailTemplateEditor] = useState(false);
  const [emailNotificationToast, setEmailNotificationToast] = useState<string | null>(null);
  const [showPickupSettings, setShowPickupSettings] = useState(false);
  const [pickupLocation, setPickupLocation] = useState<string>(
    () => localStorage.getItem('pickup_location') ?? '2801 Brasher Ln\nBedford, TX 76021'
  );
  const [pickupLocationDraft, setPickupLocationDraft] = useState(pickupLocation);
  const [pickupSaved, setPickupSaved] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [newOrderToast, setNewOrderToast] = useState<string | null>(null);
  const [shippingLabels, setShippingLabels] = useState<ShippingLabel[]>([]);
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [labelModalOrder, setLabelModalOrder] = useState<Order | null>(null);
  const [labelToast, setLabelToast] = useState<string | null>(null);
  const [viewingLabel, setViewingLabel] = useState<ShippingLabel | null>(null);
  const prevOrderCountRef = useRef<number>(initialRegular.length);
  const [showBulkLabelModal, setShowBulkLabelModal] = useState(false);
  const [pendingShippedConfirm, setPendingShippedConfirm] = useState(false);
  const [shippingTrackingDraft, setShippingTrackingDraft] = useState('');
  const [refundNotes, setRefundNotes] = useState('');
  const [refundNotesSaved, setRefundNotesSaved] = useState(false);

  // Load shipping labels from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('shipping_labels');
      if (stored) {
        const parsed: ShippingLabel[] = JSON.parse(stored);
        if (parsed.length > 0) {
          setShippingLabels(parsed);
          return;
        }
      }
    } catch (_e) {
      // ignore parse errors
    }
    // Seed example labels so the tab is never empty
    const exampleLabels: ShippingLabel[] = [
      {
        id: 'LBL-00100001',
        orderId: 'ORD-10003',
        customerName: 'Marcus Rivera',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        carrier: 'UPS',
        service: 'Ground',
        weight: '42 lbs',
        dimensions: '72" × 12" × 8"',
        status: 'Printed',
        senderAddress: {
          name: 'Classic Same Day Blinds',
          company: 'Classic Same Day Blinds',
          street: '1234 Blinds Ave, Suite 100',
          city: 'Los Angeles',
          state: 'CA',
          zip: '90001',
          phone: '(800) 555-2453',
        },
        recipientAddress: {
          name: 'Marcus Rivera',
          company: 'Rivera Renovations',
          street: '8820 Sunset Blvd',
          city: 'West Hollywood',
          state: 'CA',
          zip: '90069',
          phone: '(310) 555-0192',
        },
      },
      {
        id: 'LBL-00100002',
        orderId: 'ORD-10008',
        customerName: 'David Nguyen',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        carrier: 'FedEx',
        service: '2Day',
        weight: '58 lbs',
        dimensions: '84" × 14" × 10"',
        status: 'Printed',
        senderAddress: {
          name: 'Classic Same Day Blinds',
          company: 'Classic Same Day Blinds',
          street: '1234 Blinds Ave, Suite 100',
          city: 'Los Angeles',
          state: 'CA',
          zip: '90001',
          phone: '(800) 555-2453',
        },
        recipientAddress: {
          name: 'David Nguyen',
          company: 'Nguyen Design Co.',
          street: '4501 Wilshire Blvd',
          city: 'Los Angeles',
          state: 'CA',
          zip: '90010',
          phone: '(323) 555-0147',
        },
      },
      {
        id: 'LBL-00100003',
        orderId: 'ORD-10001',
        customerName: 'Sarah Johnson',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        carrier: 'USPS',
        service: 'Priority Mail',
        weight: '35 lbs',
        dimensions: '60" × 10" × 6"',
        status: 'Pending',
        senderAddress: {
          name: 'Classic Same Day Blinds',
          company: 'Classic Same Day Blinds',
          street: '1234 Blinds Ave, Suite 100',
          city: 'Los Angeles',
          state: 'CA',
          zip: '90001',
          phone: '(800) 555-2453',
        },
        recipientAddress: {
          name: 'Sarah Johnson',
          company: 'Johnson Interiors',
          street: '2200 Beverly Glen Blvd',
          city: 'Los Angeles',
          state: 'CA',
          zip: '90077',
          phone: '(424) 555-0183',
        },
      },
      {
        id: 'LBL-00100004',
        orderId: 'ORD-10002',
        customerName: 'David Nguyen',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        carrier: 'DHL',
        service: 'Express Worldwide',
        weight: '67 lbs',
        dimensions: '96" × 16" × 12"',
        status: 'Voided',
        senderAddress: {
          name: 'Classic Same Day Blinds',
          company: 'Classic Same Day Blinds',
          street: '1234 Blinds Ave, Suite 100',
          city: 'Los Angeles',
          state: 'CA',
          zip: '90001',
          phone: '(800) 555-2453',
        },
        recipientAddress: {
          name: 'David Nguyen',
          company: 'Nguyen Design Co.',
          street: '4501 Wilshire Blvd',
          city: 'Los Angeles',
          state: 'CA',
          zip: '90010',
          phone: '(323) 555-0147',
        },
      },
      {
        id: 'LBL-00100005',
        orderId: 'ORD-10005',
        customerName: 'Emily Chen',
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        carrier: 'UPS',
        service: 'Next Day Air',
        weight: '29 lbs',
        dimensions: '48" × 10" × 8"',
        status: 'Pending',
        senderAddress: {
          name: 'Classic Same Day Blinds',
          company: 'Classic Same Day Blinds',
          street: '1234 Blinds Ave, Suite 100',
          city: 'Los Angeles',
          state: 'CA',
          zip: '90001',
          phone: '(800) 555-2453',
        },
        recipientAddress: {
          name: 'Emily Chen',
          company: 'Chen Window Works',
          street: '1100 Glendon Ave',
          city: 'Los Angeles',
          state: 'CA',
          zip: '90024',
          phone: '(310) 555-0261',
        },
      },
    ];
    setShippingLabels(exampleLabels);
  }, []);

  // Reload live orders from localStorage
  const refreshOrders = (showSpinner = false) => {
    if (showSpinner) {
      setIsRefreshing(true);
      setTimeout(() => {
        const { regular, reorders } = loadAllOrdersFromStorage();

        const newOrderCount = regular.length;
        const prevCount = prevOrderCountRef.current;

        if (newOrderCount > prevCount && activeTab === 'all') {
          const newOrders = regular.slice(0, newOrderCount - prevCount);
          const newOrderIds = newOrders.map((o) => o.id).join(', ');
          setNewOrderToast(`🎉 New order received: ${newOrderIds}`);
          setTimeout(() => setNewOrderToast(null), 5000);
        }

        prevOrderCountRef.current = newOrderCount;
        setOrders(regular);
        setReorderOrders(reorders);
        setLastRefreshed(new Date());
        setIsRefreshing(false);
      }, 700);
    } else {
      const { regular, reorders } = loadAllOrdersFromStorage();

      const newOrderCount = regular.length;
      const prevCount = prevOrderCountRef.current;

      if (newOrderCount > prevCount && activeTab === 'all') {
        const newOrders = regular.slice(0, newOrderCount - prevCount);
        const newOrderIds = newOrders.map((o) => o.id).join(', ');
        setNewOrderToast(`🎉 New order received: ${newOrderIds}`);
        setTimeout(() => setNewOrderToast(null), 5000);
      }

      prevOrderCountRef.current = newOrderCount;
      setOrders(regular);
      setReorderOrders(reorders);
      setLastRefreshed(new Date());
    }
  };

  // Auto-poll every 10 seconds to detect new customer orders
  useEffect(() => {
    const interval = setInterval(() => {
      refreshOrders(false);
    }, 10000);
    return () => clearInterval(interval);
  }, [activeTab]);

  // Load on mount
  useEffect(() => {
    refreshOrders();
  }, []);

  const handleTabChange = (tab: 'all' | 'reorders' | 'labels') => {
    setActiveTab(tab);
    if (tab !== 'labels') {
      refreshOrders();
    }
  };

  const totalUnits = orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingCount = orders.filter((o) => o.status === 'Pending').length;
  const shippedCount = orders.filter((o) => o.status === 'Fulfilled & Shipped').length;
  const deliveredCount = orders.filter((o) => o.status === 'Delivered').length;
  const refundedCount = orders.filter((o) => o.status === 'Refunded').length;

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        search === '' ||
        order.id.toLowerCase().includes(search.toLowerCase()) ||
        getCustomerName(order).toLowerCase().includes(search.toLowerCase()) ||
        getCustomerEmail(order).toLowerCase().includes(search.toLowerCase()) ||
        (order.customer?.companyName ?? '').toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter, orders]);

  const filteredReorders = useMemo(() => {
    return reorderOrders.filter((order) => {
      return (
        search === '' ||
        order.id.toLowerCase().includes(search.toLowerCase()) ||
        getCustomerName(order).toLowerCase().includes(search.toLowerCase()) ||
        getCustomerEmail(order).toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [search, reorderOrders]);

  function toggleSelectOrder(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === filteredOrders.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredOrders.map((o) => o.id)));
    }
  }

  function handleSavePickupLocation() {
    localStorage.setItem('pickup_location', pickupLocationDraft);
    setPickupLocation(pickupLocationDraft);
    setPickupSaved(true);
    setTimeout(() => setPickupSaved(false), 2500);
  }

  function handleStatusChange(newStatus: string, trackingOverride?: string) {
    if (!selectedOrder) return;
    const updated = orders.map((o) => (o.id === selectedOrder.id ? { ...o, status: newStatus } : o));
    setOrders(updated);
    setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : prev));
    setStatusDropdownOpen(false);
    setPendingShippedConfirm(false);
    try {
      const admin = JSON.parse(localStorage.getItem('admin_user') ?? '{}');
      logActivity({
        adminId: admin.id ?? 'unknown',
        adminName: admin.name ?? 'Admin',
        adminRole: admin.role ?? 'admin',
        action: `Order status updated: ${selectedOrder.id}`,
        category: 'orders',
        detail: `Changed status to "${newStatus}" for order ${selectedOrder.id}`,
      });
    } catch { /* ignore */ }
    setShippingTrackingDraft('');
    setStatusSaved(true);
    setTimeout(() => setStatusSaved(false), 2500);

    try {
      const overrides: Record<string, string> = JSON.parse(localStorage.getItem('order_status_overrides') ?? '{}');
      overrides[selectedOrder.id] = newStatus;
      localStorage.setItem('order_status_overrides', JSON.stringify(overrides));

      const storedOrders: any[] = JSON.parse(localStorage.getItem('orders') ?? '[]');
      const updatedStored = storedOrders.map((o) => (o.id === selectedOrder.id ? { ...o, status: newStatus } : o));
      localStorage.setItem('orders', JSON.stringify(updatedStored));
    } catch (_e) {
      // ignore errors
    }

    // ── Fire real email via Resend ────────────────────────────────────────
    const customerEmail = getCustomerEmail(selectedOrder);
    const customerName = getCustomerName(selectedOrder);
    const resolvedTracking = trackingOverride || trackingInput || selectedOrder.trackingNumber || undefined;
    if (customerEmail && customerEmail !== '—') {
      fetch(`${SUPABASE_URL}/functions/v1/send-order-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'status_update',
          orderId: selectedOrder.id,
          customerName,
          customerEmail,
          newStatus,
          trackingNumber: resolvedTracking,
          pickupLocation: newStatus === 'Ready for Pickup' ? pickupLocation : undefined,
          orderTotal: selectedOrder.total,
          items: selectedOrder.items,
        }),
      }).catch(() => {});
    }

    // ── Show toast ────────────────────────────────────────────────────────
    if (newStatus === 'Ready for Pickup') {
      setEmailNotificationToast(`📍 Pickup notification emailed to ${customerName}`);
    } else if (newStatus === 'Working on Order') {
      setEmailNotificationToast(`🔧 "Working on Order" email sent to ${customerName}`);
    } else if (newStatus === 'Fulfilled & Shipped') {
      setEmailNotificationToast(`🚚 Shipping notification${resolvedTracking ? ` with tracking ${resolvedTracking}` : ''} emailed to ${customerName}`);
    } else if (newStatus === 'Delivered') {
      setEmailNotificationToast(`✅ Delivery confirmation emailed to ${customerName}`);
    } else if (newStatus === 'Cancelled') {
      setEmailNotificationToast(`❌ Cancellation email sent to ${customerName}`);
    } else if (newStatus === 'Refunded') {
      setEmailNotificationToast(`↩️ Order marked as Refunded — refund email was sent via Stripe`);
    } else {
      setEmailNotificationToast(`📧 Status update email sent to ${customerName}`);
    }
    setTimeout(() => setEmailNotificationToast(null), 3500);
  }

  function handleSaveTracking() {
    if (!selectedOrder) return;
    const updated = orders.map((o) => (o.id === selectedOrder.id ? { ...o, trackingNumber: trackingInput } : o));
    setOrders(updated);
    setSelectedOrder(null);
  }

  function handleSaveRefundNotes() {
    if (!selectedOrder) return;
    localStorage.setItem(`refund_notes_${selectedOrder.id}`, refundNotes);
    setRefundNotesSaved(true);
    setTimeout(() => setRefundNotesSaved(false), 2500);
  }

  function handleReorder(order: Order) {
    const newId = `ORD-${Date.now().toString().slice(-5)}`;
    const duplicate: Order = {
      ...order,
      id: newId,
      date: new Date().toISOString(),
      status: 'Working on Order',
      period: 'today',
      trackingNumber: undefined,
      fulfilledAt: undefined,
    };
    setOrders((prev) => [duplicate, ...prev]);
    setSelectedOrder(null);
    setReorderToast(`New order ${newId} created for ${getCustomerName(order)}`);
    setTimeout(() => setReorderToast(null), 3500);
  }

  function handlePrintPDF(order: Order) {
    const htmlContent = buildAdminInvoiceHTML(order);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  }

  function handleSaveLabel(label: ShippingLabel) {
    const labelWithStatus: ShippingLabel = { ...label, status: label.status ?? 'Pending' };
    setShippingLabels((prev) => [labelWithStatus, ...prev]);
    setLabelToast(`Shipping label ${label.id} created successfully`);
    setTimeout(() => setLabelToast(null), 3500);
  }

  function handleUpdateLabelStatus(labelId: string, newStatus: 'Pending' | 'Printed' | 'Voided') {
    setShippingLabels((prev) => prev.map((l) => (l.id === labelId ? { ...l, status: newStatus } : l)));
  }

  function handleDeleteLabel(labelId: string) {
    setShippingLabels((prev) => prev.filter((l) => l.id !== labelId));
    setLabelToast('Label deleted successfully');
    setTimeout(() => setLabelToast(null), 3000);
  }

  function handleReprintLabel(label: ShippingLabel) {
    const barcode = `*${label.orderId}*`;
    const trackingNumber = `1Z${Math.random().toString().slice(2, 18)}`;

    const labelHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Shipping Label - ${label.orderId}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; padding: 20px; background: #fff; }
    .label { width: 4in; border: 2px solid #000; padding: 16px; background: #fff; }
    .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 12px; }
    .header h1 { font-size: 18px; font-weight: 700; margin-bottom: 2px; }
    .header p { font-size: 10px; }
    .section { margin-bottom: 12px; }
    .section-title { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; background: #000; color: #fff; padding: 2px 4px; }
    .address { font-size: 11px; line-height: 1.4; }
    .address strong { font-size: 12px; }
    .barcode { text-align: center; font-family: 'Courier New', monospace; font-size: 24px; font-weight: 700; letter-spacing: 2px; padding: 8px 0; border: 1px solid #000; margin: 8px 0; background: #fff; }
    .tracking { text-align: center; font-family: 'Courier New', monospace; font-size: 14px; font-weight: 700; margin: 6px 0; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px; }
    .info-box { border: 1px solid #000; padding: 4px; }
    .info-label { font-size: 8px; font-weight: 700; text-transform: uppercase; }
    .info-value { font-size: 11px; font-weight: 700; }
    .carrier-badge { text-align: center; background: #000; color: #fff; padding: 6px; font-size: 16px; font-weight: 700; margin-bottom: 8px; }
    @media print {
      body { padding: 0; }
      @page { size: 4in 6in; margin: 0; }
    }
  </style>
</head>
<body>
  <div class="label">
    <div class="carrier-badge">${label.carrier} - ${label.service}</div>
    <div class="section">
      <div class="section-title">FROM</div>
      <div class="address">
        <strong>${label.senderAddress.name}</strong><br>
        ${label.senderAddress.company ? `${label.senderAddress.company}<br>` : ''}
        ${label.senderAddress.street}<br>
        ${label.senderAddress.city}, ${label.senderAddress.state} ${label.senderAddress.zip}<br>
        ${label.senderAddress.phone}
      </div>
    </div>
    <div class="section">
      <div class="section-title">TO</div>
      <div class="address">
        <strong>${label.recipientAddress.name}</strong><br>
        ${label.recipientAddress.company ? `${label.recipientAddress.company}<br>` : ''}
        ${label.recipientAddress.street}<br>
        ${label.recipientAddress.city}, ${label.recipientAddress.state} ${label.recipientAddress.zip}<br>
        ${label.recipientAddress.phone}
      </div>
    </div>
    <div class="barcode">${barcode}</div>
    <div class="tracking">${trackingNumber}</div>
    <div class="info-grid">
      <div class="info-box">
        <div class="info-label">Order ID</div>
        <div class="info-value">${label.orderId}</div>
      </div>
      <div class="info-box">
        <div class="info-label">Date</div>
        <div class="info-value">${new Date(label.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
      </div>
      <div class="info-box">
        <div class="info-label">Weight</div>
        <div class="info-value">${label.weight}</div>
      </div>
      <div class="info-box">
        <div class="info-label">Dimensions</div>
        <div class="info-value">${label.dimensions}</div>
      </div>
    </div>
  </div>
</body>
</html>`;

    const printWindow = window.open('', '_blank', 'width=800,height=1000');
    if (printWindow) {
      printWindow.document.write(labelHTML);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 300);
    }
  }

  function handleCreateLabelFromOrder(order: Order) {
    setLabelModalOrder(order);
    setShowLabelModal(true);
  }

  function handleViewLabel(label: ShippingLabel) {
    setViewingLabel(label);
  }

  function handleBulkLabelsSaved(labels: ShippingLabel[]) {
    setShippingLabels((prev) => [...labels, ...prev]);
    setShowBulkLabelModal(false);
    setLabelToast(`${labels.length} shipping label${labels.length !== 1 ? 's' : ''} created successfully`);
    setTimeout(() => setLabelToast(null), 3500);
  }

  // ── Reorders Table ──────────────────────────────────────────────────────
  function ReordersTable() {
    const formatLastRefreshed = (date: Date) => {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    return (
      <div className="space-y-3">
        {/* Reorders toolbar */}
        <div className="flex items-center justify-between bg-white rounded-xl border border-slate-100 shadow-sm px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
              <i className="ri-refresh-line text-emerald-600 text-base"></i>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700">
                {filteredReorders.length} Reorder{filteredReorders.length !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-slate-400">
                Last refreshed:{' '}
                <span className="font-semibold text-slate-500">{formatLastRefreshed(lastRefreshed)}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => refreshOrders(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-sm font-semibold rounded-lg"
          >
            <i className={`ri-refresh-line text-base ${isRefreshing ? 'animate-spin' : ''}`}></i>
            {isRefreshing ? 'Refreshing...' : 'Refresh Reorders'}
          </button>
        </div>

        {filteredReorders.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                <i className="ri-refresh-line text-emerald-500 text-3xl"></i>
              </div>
              <p className="text-base font-bold text-slate-700 mb-1">No reorders yet</p>
              <p className="text-sm text-slate-400">
                When customers place reorders, they&apos;ll appear here automatically.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Reorder ID</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Original Order</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Items</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredReorders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => setFullViewOrder(order)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono font-semibold text-slate-900">{order.id}</span>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full whitespace-nowrap animate-pulse">
                            <i className="ri-refresh-line text-xs"></i> Reorder
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono font-semibold text-emerald-700">
                          {(order as any).originalOrderId ?? '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-slate-800 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{getCustomerName(order).charAt(0) || '?'}</span>
                          </div>
                          <div className="flex flex-col items-start">
                            <span className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors underline-offset-2 group-hover:underline">
                              {getCustomerName(order)}
                            </span>
                            {order.customer?.salesRep && (
                              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                                <i className="ri-user-star-line text-xs"></i>
                                {order.customer.salesRep}
                              </span>
                            )}
                          </div>
                          <div className="w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-emerald-600">
                            <i className="ri-external-link-line text-xs"></i>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-600">{getCustomerEmail(order) || '—'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-600">
                          {new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          {order.items.slice(0, 2).map((item, i) => (
                            <p key={i} className="text-xs text-slate-600 truncate max-w-[160px]">
                              {item.name} <span className="text-slate-400">×{item.quantity}</span>
                            </p>
                          ))}
                          {order.items.length > 2 && (
                            <p className="text-xs text-slate-400">+{order.items.length - 2} more</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-slate-900">
                          ${order.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${getStatusColor(order.status)}`}>
                          <i className={getStatusIcon(order.status)}></i>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCreateLabelFromOrder(order);
                            }}
                            className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-900"
                          >
                            <i className="ri-price-tag-3-line"></i>
                            Create Label
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Shipping Labels Table ───────────────────────────────────────────────
  function ShippingLabelsTable() {
    const [statusDropdownId, setStatusDropdownId] = useState<string | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [labelStatusFilter, setLabelStatusFilter] = useState<'All' | 'Pending' | 'Printed' | 'Voided'>('All');
    const [labelSearch, setLabelSearch] = useState('');

    const filteredLabels = useMemo(() => {
      return shippingLabels.filter((label) => {
        const q = labelSearch.toLowerCase();
        const matchesSearch =
          q === '' ||
          label.orderId.toLowerCase().includes(q) ||
          label.customerName.toLowerCase().includes(q) ||
          label.carrier.toLowerCase().includes(q) ||
          label.id.toLowerCase().includes(q) ||
          label.service.toLowerCase().includes(q);
        const matchesStatus =
          labelStatusFilter === 'All' || (label.status ?? 'Pending') === labelStatusFilter;
        return matchesSearch && matchesStatus;
      });
    }, [labelSearch, labelStatusFilter]);

    const labelStatusOptions: Array<'Pending' | 'Printed' | 'Voided'> = ['Pending', 'Printed', 'Voided'];

    function handleExportLabelsCSV() {
      const rows = [
        ['Label ID', 'Order ID', 'Customer', 'Carrier', 'Service', 'Weight', 'Dimensions', 'Status', 'Created',
          'From Name', 'From Company', 'From Street', 'From City', 'From State', 'From ZIP', 'From Phone',
          'To Name', 'To Company', 'To Street', 'To City', 'To State', 'To ZIP', 'To Phone'],
        ...filteredLabels.map((l) => [
          l.id, l.orderId, l.customerName, l.carrier, l.service, l.weight, l.dimensions,
          l.status ?? 'Pending',
          new Date(l.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
          l.senderAddress.name, l.senderAddress.company ?? '', l.senderAddress.street,
          l.senderAddress.city, l.senderAddress.state, l.senderAddress.zip, l.senderAddress.phone,
          l.recipientAddress.name, l.recipientAddress.company ?? '', l.recipientAddress.street,
          l.recipientAddress.city, l.recipientAddress.state, l.recipientAddress.zip, l.recipientAddress.phone,
        ]),
      ];
      const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const dateStr = new Date().toISOString().slice(0, 10);
      a.download = `shipping_labels_${dateStr}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }

    return (
      <div className="space-y-3">
        {/* Toolbar */}
        <div className="flex items-center justify-between bg-white rounded-xl border border-slate-100 shadow-sm px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center">
              <i className="ri-printer-line text-teal-600 text-base"></i>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                {filteredLabels.length} Shipping Label{filteredLabels.length !== 1 ? 's' : ''}
                {(labelStatusFilter !== 'All' || labelSearch !== '') && (
                  <span className="ml-1.5 text-xs font-semibold text-slate-400">
                    (filtered from {shippingLabels.length} total)
                  </span>
                )}
              </p>
              <p className="text-xs text-slate-400">Create and manage shipping labels for orders</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {(['Pending', 'Printed', 'Voided'] as const).map((s) => (
              <span key={s} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${getLabelStatusColor(s)}`}>
                <i className={`${getLabelStatusIcon(s)} text-xs`}></i>
                {s}
              </span>
            ))}
            <button
              onClick={handleExportLabelsCSV}
              disabled={filteredLabels.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-semibold rounded-lg"
            >
              <i className="ri-download-2-line text-base"></i>
              Export CSV
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center">
            <i className="ri-search-line text-slate-400 text-base"></i>
          </div>
          <input
            type="text"
            value={labelSearch}
            onChange={(e) => setLabelSearch(e.target.value)}
            placeholder="Search by label ID, order ID, customer name, or carrier..."
            className="flex-1 text-sm outline-none text-slate-700 placeholder-slate-400"
          />
          {labelSearch && (
            <button
              onClick={() => setLabelSearch('')}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700"
            >
              <i className="ri-close-line text-base"></i>
              Clear
            </button>
          )}
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-5 py-3 flex items-center gap-3 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            {(['All', 'Pending', 'Printed', 'Voided'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setLabelStatusFilter(s)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                  labelStatusFilter === s
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${getLabelStatusColor(s)}`}>
                  <i className={`${getLabelStatusIcon(s)} text-xs`}></i>
                  {s}
                </span>
                <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-xs font-bold ${
                  labelStatusFilter === s ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {s === 'All' ? shippingLabels.length : shippingLabels.filter((l) => (l.status ?? 'Pending') === s).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {filteredLabels.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mb-4">
                <i className="ri-printer-line text-teal-500 text-3xl"></i>
              </div>
              <p className="text-base font-bold text-slate-700 mb-1">No shipping labels yet</p>
              <p className="text-sm text-slate-400 mb-4">Create your first shipping label from the All Orders tab.</p>
              <button
                onClick={() => setActiveTab('all')}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg"
              >
                <i className="ri-arrow-left-line"></i>
                Go to All Orders
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Label ID</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Carrier</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Service</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Weight</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Dimensions</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredLabels.map((label) => (
                    <tr key={label.id} className={`hover:bg-slate-50 transition-colors ${label.status === 'Voided' ? 'opacity-60' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono font-semibold text-slate-900">{label.id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-teal-700 font-semibold">{label.orderId}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-slate-900">{label.customerName}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
                          <i className="ri-truck-line"></i>
                          {label.carrier}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-600">{label.service}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-600">{label.weight}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-600">{label.dimensions}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-600">
                          {new Date(label.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </td>
                      {/* Status column with dropdown */}
                      <td className="px-6 py-4 whitespace-nowrap relative">
                        <button
                          onClick={() => setStatusDropdownId((prev) => (prev === label.id ? null : label.id))}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all ${getLabelStatusColor(label.status ?? 'Pending')}`}
                        >
                          <i className={`${getLabelStatusIcon(label.status ?? 'Pending')} text-xs`}></i>
                          {label.status ?? 'Pending'}
                          <i className="ri-arrow-down-s-line text-xs ml-0.5"></i>
                        </button>
                        {statusDropdownId === label.id && (
                          <div className="absolute top-full left-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden min-w-[130px]">
                            {labelStatusOptions.map((s) => (
                              <button
                                key={s}
                                onClick={() => {
                                  handleUpdateLabelStatus(label.id, s);
                                  setStatusDropdownId(null);
                                }}
                                className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50 cursor-pointer transition-colors ${
                                  (label.status ?? 'Pending') === s ? 'bg-slate-50' : ''
                                }`}
                              >
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${getLabelStatusColor(s)}`}>
                                  <i className={`${getLabelStatusIcon(s)} text-xs`}></i>
                                  {s}
                                </span>
                                {(label.status ?? 'Pending') === s && (
                                  <i className="ri-check-line text-slate-400 ml-auto"></i>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </td>
                      {/* Actions column */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewLabel(label)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-teal-300 hover:bg-teal-100 text-teal-700 rounded-lg text-xs font-semibold shrink-0"
                          >
                            <i className="ri-eye-line"></i>
                            View / Reprint
                          </button>
                          {deleteConfirmId === label.id ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-slate-500 font-medium">Sure?</span>
                              <button
                                onClick={() => {
                                  handleDeleteLabel(label.id);
                                  setDeleteConfirmId(null);
                                }}
                                className="text-xs font-bold text-red-500 hover:text-red-700"
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="text-xs font-bold text-slate-500 hover:text-slate-700"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(label.id)}
                              className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-700"
                            >
                              <i className="ri-delete-bin-line text-base"></i>
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Shipping Label Modal */}
      {showLabelModal && labelModalOrder && (
        <ShippingLabelModal
          order={labelModalOrder}
          onClose={() => { setShowLabelModal(false); setLabelModalOrder(null); }}
          onSave={(label) => {
            handleSaveLabel(label);
            setShowLabelModal(false);
            setLabelModalOrder(null);
          }}
        />
      )}
      {/* Bulk Label Modal */}
      {showBulkLabelModal && (
        <BulkLabelModal
          orders={orders}
          onClose={() => setShowBulkLabelModal(false)}
          onSaveAll={handleBulkLabelsSaved}
        />
      )}
      {/* Label Viewer Modal */}
      {viewingLabel && (
        <LabelViewerModal
          label={viewingLabel}
          onClose={() => setViewingLabel(null)}
          onPrint={(lbl) => { handleReprintLabel(lbl); }}
          onRestore={(labelId, status) => {
            handleUpdateLabelStatus(labelId, status);
            setViewingLabel((prev) => (prev ? { ...prev, status } : prev));
          }}
        />
      )}
      {/* Label Toast */}
      {labelToast && (
        <div className="fixed top-6 right-6 z-[70] flex items-center gap-3 bg-teal-600 text-white px-5 py-3.5 rounded-xl shadow-2xl animate-fade-in">
          <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center">
            <i className="ri-checkbox-circle-line text-white text-sm"></i>
          </div>
          <p className="text-sm font-semibold">{labelToast}</p>
          <button onClick={() => setLabelToast(null)} className="w-5 h-5 flex items-center justify-center text-white/70 hover:text-white">
            <i className="ri-close-line text-sm"></i>
          </button>
        </div>
      )}
      {/* Email Template Editor Modal */}
      {showEmailTemplateEditor && (
        <EmailTemplateEditor onClose={() => setShowEmailTemplateEditor(false)} pickupLocation={pickupLocation} />
      )}
      {/* Pickup Location Settings Modal */}
      {showPickupSettings && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={() => setShowPickupSettings(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <i className="ri-store-2-line text-orange-600 text-lg"></i>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Pickup Location</h3>
                  <p className="text-xs text-slate-500">Auto-fills in the &quot;Ready for Pickup&quot; email</p>
                </div>
              </div>
              <button onClick={() => setShowPickupSettings(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500">
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Store Address</label>
                <textarea
                  value={pickupLocationDraft}
                  onChange={(e) => setPickupLocationDraft(e.target.value)}
                  rows={4}
                  placeholder="e.g. 2801 Brasher Ln&#10;Bedford, TX 76021&#10;(817) 555-0100"
                  className="w-full text-sm border border-slate-200 focus:border-orange-400 rounded-xl px-4 py-3 outline-none text-slate-700 placeholder-slate-400 resize-none"
                />
              </div>
              {pickupLocation && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
                  <p className="text-xs font-bold text-orange-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <i className="ri-map-pin-line"></i> Currently Saved
                  </p>
                  <p className="text-sm text-orange-900 whitespace-pre-line">{pickupLocation}</p>
                </div>
              )}
              <div className="flex items-center justify-end gap-3 pt-1">
                <button onClick={() => setShowPickupSettings(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg">
                  Cancel
                </button>
                <button onClick={handleSavePickupLocation} className="flex items-center gap-2 px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg">
                  {pickupSaved ? (
                    <><i className="ri-check-line"></i> Saved!</>
                  ) : (
                    <><i className="ri-save-line"></i> Save Location</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* New Order Toast */}
      {newOrderToast && (
        <div className="fixed top-6 right-6 z-[70] flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-4 rounded-xl shadow-2xl animate-fade-in border-2 border-emerald-400">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
            <i className="ri-notification-3-line text-white text-xl"></i>
          </div>
          <div>
            <p className="text-sm font-bold">New Order Alert</p>
            <p className="text-xs text-emerald-100">{newOrderToast}</p>
          </div>
          <button onClick={() => setNewOrderToast(null)} className="w-6 h-6 flex items-center justify-center text-white/70 hover:text-white">
            <i className="ri-close-line text-base"></i>
          </button>
        </div>
      )}
      {/* Email Notification Toast */}
      {emailNotificationToast && (
        <div className="fixed top-6 right-6 z-[70] flex items-center gap-3 bg-emerald-600 text-white px-5 py-3.5 rounded-xl shadow-2xl animate-fade-in">
          <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center">
            <i className="ri-mail-check-line text-white text-sm"></i>
          </div>
          <p className="text-sm font-semibold">{emailNotificationToast}</p>
          <button onClick={() => setEmailNotificationToast(null)} className="w-5 h-5 flex items-center justify-center text-white/70 hover:text-white">
            <i className="ri-close-line text-sm"></i>
          </button>
        </div>
      )}
      {/* Reorder Toast */}
      {reorderToast && (
        <div className="fixed top-6 right-6 z-[70] flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl animate-fade-in">
          <div className="w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center">
            <i className="ri-checkbox-circle-line text-white text-sm"></i>
          </div>
          <p className="text-sm font-semibold">{reorderToast}</p>
          <button onClick={() => setReorderToast(null)} className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white">
            <i className="ri-close-line text-sm"></i>
          </button>
        </div>
      )}
      {/* Full View */}
      {fullViewOrder && (
        <OrderFullView
          order={fullViewOrder}
          onClose={() => setFullViewOrder(null)}
          onStatusChange={(orderId, status) => {
            const updated = orders.map((o) => o.id === orderId ? { ...o, status } : o);
            setOrders(updated);
            setFullViewOrder((prev) => prev ? { ...prev, status } : prev);
            try {
              const overrides: Record<string, string> = JSON.parse(localStorage.getItem('order_status_overrides') ?? '{}');
              overrides[orderId] = status;
              localStorage.setItem('order_status_overrides', JSON.stringify(overrides));
            } catch { /* ignore */ }
            const target = orders.find((o) => o.id === orderId);
            if (target?.customer?.email) {
              fetch(`${SUPABASE_URL}/functions/v1/send-order-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'status_update', orderId, customerName: getCustomerName(target), customerEmail: target.customer?.email, newStatus: status }),
              }).catch(() => {});
            }
          }}
          onSaveTracking={(orderId, tracking) => {
            const updated = orders.map((o) => o.id === orderId ? { ...o, trackingNumber: tracking } : o);
            setOrders(updated);
            setFullViewOrder((prev) => prev ? { ...prev, trackingNumber: tracking } : prev);
          }}
          onPrintInvoice={(ord) => handlePrintPDF(ord)}
          onCreateLabel={(ord) => { setLabelModalOrder(ord); setShowLabelModal(true); setFullViewOrder(null); }}
        />
      )}
      {/* Client Profile Modal */}
      {clientProfileEmail && (
        <ClientProfileModal email={clientProfileEmail} orders={orders} onClose={() => setClientProfileEmail(null)} />
      )}
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and track all customer orders</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setPickupLocationDraft(pickupLocation); setShowPickupSettings(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-700 text-white rounded-lg text-sm font-semibold whitespace-nowrap"
          >
            <i className="ri-store-2-line"></i>
            Pickup Location
          </button>
          <button
            onClick={() => setShowEmailTemplateEditor(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-700 text-white rounded-lg text-sm font-semibold whitespace-nowrap"
          >
            <i className="ri-mail-settings-line"></i>
            Email Templates
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
        {[
          { label: 'Total Orders', value: orders.length.toLocaleString(), icon: 'ri-file-list-3-line', color: 'text-slate-700' },
          { label: 'Pending', value: pendingCount.toLocaleString(), icon: 'ri-time-line', color: 'text-amber-600' },
          { label: 'Fulfilled & Shipped', value: shippedCount.toLocaleString(), icon: 'ri-truck-line', color: 'text-teal-600' },
          { label: 'Delivered', value: deliveredCount.toLocaleString(), icon: 'ri-checkbox-circle-line', color: 'text-emerald-600' },
          { label: 'Refunded', value: refundedCount.toLocaleString(), icon: 'ri-arrow-go-back-line', color: 'text-rose-600' },
          { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: 'ri-money-dollar-circle-line', color: 'text-green-700' },
          { label: 'Reorders', value: reorderOrders.length.toLocaleString(), icon: 'ri-refresh-line', color: 'text-violet-600' },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-5 h-5 flex items-center justify-center ${card.color}`}>
                <i className={`${card.icon} text-base`}></i>
              </div>
              <span className="text-xs text-slate-500 font-medium">{card.label}</span>
            </div>
            <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl mb-4 w-fit">
        {([
          { key: 'all', label: 'All Orders', icon: 'ri-file-list-3-line', count: orders.length, countClass: 'bg-slate-200 text-slate-700' },
          { key: 'reorders', label: 'Reorders', icon: 'ri-refresh-line', count: reorderOrders.length, countClass: 'bg-emerald-100 text-emerald-700' },
          { key: 'labels', label: 'Shipping Labels', icon: 'ri-printer-line', count: shippingLabels.length, countClass: 'bg-teal-100 text-teal-700' },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
              activeTab === tab.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <i className={tab.icon}></i>
            {tab.label}
            {tab.count > 0 && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${tab.countClass}`}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm mb-4 px-4 py-3 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <div className="w-4 h-4 flex items-center justify-center text-slate-400">
            <i className="ri-search-line text-sm"></i>
          </div>
          <input
            type="text"
            placeholder={activeTab === 'reorders' ? 'Search reorders, customers...' : 'Search orders, customers...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm outline-none text-slate-700 placeholder-slate-400"
          />
        </div>
        {activeTab === 'all' && (
          <>
            <div className="flex gap-2 flex-wrap">
              {['All', 'Pending', 'Working on Order', 'Ready for Pickup', 'Fulfilled & Shipped', 'Delivered', 'Cancelled', 'Refunded'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                    statusFilter === s ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <i className="ri-list-check text-xs"></i>
                  {s}
                  <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-xs font-bold ${
                    statusFilter === s ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {s === 'All' ? orders.length : orders.filter((o) => o.status === s).length}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => {
                  const dateStr = new Date().toISOString().slice(0, 10);
                  const label = statusFilter !== 'All' ? `_${statusFilter.replace(/\s+/g, '_').toLowerCase()}` : '';
                  exportOrdersToCSV(filteredOrders, `orders${label}_${dateStr}.csv`);
                }}
                disabled={filteredOrders.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-semibold rounded-lg whitespace-nowrap"
              >
                <i className="ri-download-2-line text-base"></i>
                Export CSV
                {filteredOrders.length > 0 && (
                  <span className="bg-white/20 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {filteredOrders.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => refreshOrders(true)}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-700 disabled:bg-slate-400 text-white text-sm font-semibold rounded-lg whitespace-nowrap"
              >
                <i className={`ri-refresh-line text-base ${isRefreshing ? 'animate-spin' : ''}`}></i>
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Live Order Monitoring Bar */}
      {activeTab === 'all' && (
        <div className="mb-4 flex items-center justify-between bg-white rounded-xl border border-slate-100 shadow-sm px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
              <i className="ri-time-line text-emerald-600 text-base"></i>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Live Order Monitoring</p>
              <p className="text-xs text-slate-400">
                Last updated:{' '}
                <span className="font-semibold text-slate-500">
                  {lastRefreshed.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                <span className="text-slate-300 mx-1.5">·</span>
                Auto-refreshes every 10 seconds
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-semibold text-emerald-600">Live</span>
          </div>
        </div>
      )}

      {/* Table — All Orders */}
      {activeTab === 'all' && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === filteredOrders.length && filteredOrders.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 accent-slate-900 cursor-pointer"
                    />
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Period</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Units</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Fulfillment</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredOrders.map((order) => {
                  const period = getPeriodLabel(order);
                  const isNew = period.label === 'Today / New';
                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-slate-50 transition-colors cursor-pointer ${selectedIds.has(order.id) ? 'bg-green-50' : ''} ${isNew ? 'bg-violet-50/30' : ''}`}
                      onClick={() => setFullViewOrder(order)}
                    >
                      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(order.id)}
                          onClick={(e) => toggleSelectOrder(order.id, e)}
                          className="w-4 h-4 rounded border-slate-300 accent-slate-900 cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono font-semibold text-slate-900">{order.id}</span>
                          {isNew && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-100 text-violet-700 text-xs font-bold rounded-full whitespace-nowrap animate-pulse">
                              <i className="ri-star-fill text-xs"></i> NEW
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${period.classes}`}>
                          <i className={`${period.icon} text-xs`}></i>
                          {period.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setClientProfileEmail(order.customer?.email ?? null)}
                          className="flex items-center gap-1.5 group cursor-pointer"
                        >
                          <div className="w-7 h-7 bg-slate-800 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{getCustomerName(order).charAt(0) || '?'}</span>
                          </div>
                          <div className="flex flex-col items-start">
                            <span className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors underline-offset-2 group-hover:underline">
                              {getCustomerName(order)}
                            </span>
                            {order.customer?.salesRep && (
                              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                                <i className="ri-user-star-line text-xs"></i>
                                {order.customer.salesRep}
                              </span>
                            )}
                          </div>
                          <div className="w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-emerald-600">
                            <i className="ri-external-link-line text-xs"></i>
                          </div>
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-600">
                          {order.customer?.companyName || <span className="text-slate-300">—</span>}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-600">{getCustomerEmail(order) || '—'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-600">
                          {new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-slate-700">
                          {order.items.reduce((sum, item) => sum + item.quantity, 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-slate-900">
                          ${order.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${getStatusColor(order.status)}`}>
                          <i className={getStatusIcon(order.status)}></i>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {order.status === 'Fulfilled & Shipped' ? (
                          <div>
                            <div className="flex items-center gap-1 text-teal-700">
                              <i className="ri-truck-line text-sm"></i>
                              <span className="text-xs font-semibold">Shipped</span>
                            </div>
                            {order.fulfilledAt && (
                              <p className="text-xs text-teal-600 mt-0.5">
                                {new Date(order.fulfilledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                            )}
                            {order.trackingNumber && (
                              <p className="text-xs text-slate-500 font-mono mt-0.5">{order.trackingNumber}</p>
                            )}
                          </div>
                        ) : order.status === 'Ready for Pickup' ? (
                          <div className="flex items-center gap-1 text-orange-600">
                            <i className="ri-store-2-line text-sm"></i>
                            <span className="text-xs font-semibold">Awaiting Pickup</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); setFullViewOrder(order); }}
                            className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-800 whitespace-nowrap"
                          >
                            <i className="ri-layout-masonry-line"></i>
                            Full View
                          </button>
                          <span className="text-slate-200">|</span>
                          <a
                            href={`/admin/orders/${order.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 whitespace-nowrap"
                            title="Open in full page"
                          >
                            <i className="ri-external-link-line"></i>
                            Open
                          </a>
                          <span className="text-slate-200">|</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); handlePrintPDF(order); }}
                            className="flex items-center gap-1 text-xs font-semibold text-green-700 hover:text-green-900 whitespace-nowrap"
                          >
                            <i className="ri-printer-line"></i>
                            Print / PDF
                          </button>
                          {(() => {
                            const existingLabel = shippingLabels.find((l) => l.orderId === order.id && l.status !== 'Voided');
                            return existingLabel ? (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleViewLabel(existingLabel); }}
                                className="flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-900 whitespace-nowrap"
                              >
                                <i className="ri-eye-line"></i>
                                View Label
                              </button>
                            ) : (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleCreateLabelFromOrder(order); }}
                                className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 whitespace-nowrap"
                              >
                                <i className="ri-price-tag-3-line"></i>
                                Label
                              </button>
                            );
                          })()}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={12} className="px-6 py-12 text-center text-slate-400 text-sm">
                      No orders found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Table — Reorders */}
      {activeTab === 'reorders' && <ReordersTable />}

      {/* Table — Shipping Labels */}
      {activeTab === 'labels' && <ShippingLabelsTable />}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => { setSelectedOrder(null); setStatusDropdownOpen(false); }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">{selectedOrder.id}</h2>
                  {(selectedOrder as any).isReorder && (
                    <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">
                      <i className="ri-refresh-line text-xs"></i> Reorder
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {new Date(selectedOrder.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
                {(selectedOrder as any).originalOrderId && (
                  <p className="text-xs text-emerald-600 mt-0.5 font-semibold">
                    Based on: {(selectedOrder as any).originalOrderId}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setFullViewOrder(selectedOrder); setSelectedOrder(null); setStatusDropdownOpen(false); }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold whitespace-nowrap"
                >
                  <i className="ri-fullscreen-line"></i>
                  Full View
                </button>
                <button
                  onClick={() => handleCreateLabelFromOrder(selectedOrder)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold whitespace-nowrap"
                >
                  <i className="ri-price-tag-3-line"></i>
                  Create Label
                </button>
                <button
                  onClick={() => { setSelectedOrder(null); setStatusDropdownOpen(false); }}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 hover:text-red-500 text-slate-400"
                >
                  <i className="ri-close-line"></i>
                </button>
              </div>
            </div>

            <div className="px-6 py-4 space-y-4">
              {/* Customer */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Customer</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{getCustomerName(selectedOrder)}</p>
                    {selectedOrder.customer?.companyName && <p className="text-sm text-slate-600">{selectedOrder.customer.companyName}</p>}
                    <p className="text-sm text-slate-500">{getCustomerEmail(selectedOrder)}</p>
                    {selectedOrder.customer?.salesRep && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="text-xs text-slate-400">Assisted by:</span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-full">
                          <i className="ri-user-star-line text-emerald-600 text-xs"></i>
                          {selectedOrder.customer.salesRep}
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => { setSelectedOrder(null); setClientProfileEmail(selectedOrder.customer?.email ?? null); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold whitespace-nowrap"
                  >
                    <i className="ri-user-line"></i> View Profile
                  </button>
                </div>
              </div>

              {/* Items */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Items</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.size} · Qty: {item.quantity.toLocaleString()}</p>
                      </div>
                      <p className="text-sm font-bold text-slate-900">
                        ${(item.price * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-sm font-semibold text-slate-700">Order Total</span>
                <span className="text-base font-bold text-slate-900">
                  ${selectedOrder.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Shipping Labels for this Order */}
              {(() => {
                const orderLabels = shippingLabels.filter((l) => l.orderId === selectedOrder.id);
                return (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Shipping Labels
                      {orderLabels.length > 0 && (
                        <span className="ml-2 px-1.5 py-0.5 bg-teal-100 text-teal-700 text-xs font-bold rounded-full">
                          {orderLabels.length}
                        </span>
                      )}
                    </p>
                    {orderLabels.length === 0 ? (
                      <div className="flex items-center justify-between bg-slate-50 border border-dashed border-slate-300 rounded-xl px-4 py-3">
                        <div className="flex items-center gap-2 text-slate-400">
                          <i className="ri-printer-line text-base"></i>
                          <span className="text-sm">No shipping label created yet</span>
                        </div>
                        <button
                          onClick={() => handleCreateLabelFromOrder(selectedOrder)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold whitespace-nowrap"
                        >
                          <i className="ri-add-line"></i>
                          Create Label
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {orderLabels.map((label) => (
                          <div
                            key={label.id}
                            className={`border rounded-xl px-4 py-3 ${label.status === 'Voided' ? 'bg-red-50 border-red-200 opacity-70' : 'bg-teal-50 border-teal-200'}`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${label.status === 'Voided' ? 'bg-red-100' : 'bg-teal-100'}`}>
                                  <i className={`ri-printer-line text-sm ${label.status === 'Voided' ? 'text-red-500' : 'text-teal-600'}`}></i>
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-mono font-bold text-slate-900">{label.id}</span>
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${getLabelStatusColor(label.status ?? 'Pending')}`}>
                                      <i className={`${getLabelStatusIcon(label.status ?? 'Pending')} text-xs`}></i>
                                      {label.status ?? 'Pending'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                                    <span className="text-xs text-slate-600 font-semibold">
                                      <i className="ri-truck-line mr-1"></i>
                                      {label.carrier} {label.service}
                                    </span>
                                    <span className="text-xs text-slate-500">{label.weight}</span>
                                    <span className="text-xs text-slate-500">{label.dimensions}</span>
                                  </div>
                                  <p className="text-xs text-slate-400 mt-0.5">
                                    Created {new Date(label.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleViewLabel(label)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-teal-300 hover:bg-teal-100 text-teal-700 rounded-xl text-xs font-semibold shrink-0 whitespace-nowrap"
                              >
                                <i className="ri-eye-line"></i>
                                View / Reprint
                              </button>
                            </div>
                            <div className="mt-3 grid grid-cols-2 gap-2 pt-3 border-t border-teal-200">
                              <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">From</p>
                                <p className="text-xs text-slate-700 leading-relaxed">
                                  {label.senderAddress.name}<br />
                                  {label.senderAddress.street}<br />
                                  {label.senderAddress.city}, {label.senderAddress.state} {label.senderAddress.zip}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">To</p>
                                <p className="text-xs text-slate-700 leading-relaxed">
                                  {label.recipientAddress.name}<br />
                                  {label.recipientAddress.street}<br />
                                  {label.recipientAddress.city}, {label.recipientAddress.state} {label.recipientAddress.zip}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                        <button
                          onClick={() => handleCreateLabelFromOrder(selectedOrder)}
                          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-dashed border-teal-300 hover:bg-teal-50 text-teal-600 rounded-xl text-xs font-semibold whitespace-nowrap"
                        >
                          <i className="ri-add-line"></i>
                          Create Another Label
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Status Change */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Order Status</p>
                <div className="relative">
                  <button
                    onClick={() => setStatusDropdownOpen((prev) => !prev)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border-2 text-sm font-semibold cursor-pointer transition-all ${getStatusColor(selectedOrder.status)}`}
                  >
                    <span className="flex items-center gap-2">
                      <i className={getStatusIcon(selectedOrder.status)}></i>
                      {selectedOrder.status}
                    </span>
                    <i className={`ri-arrow-${statusDropdownOpen ? 'up' : 'down'}-s-line text-base`}></i>
                  </button>
                  {statusDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-10 overflow-hidden">
                      {STATUS_OPTIONS.map((s) => (
                        <button
                          key={s}
                          onClick={() => {
                            if (s === 'Fulfilled & Shipped') {
                              setStatusDropdownOpen(false);
                              setPendingShippedConfirm(true);
                              setShippingTrackingDraft('');
                            } else {
                              handleStatusChange(s);
                            }
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-left hover:bg-slate-50 cursor-pointer transition-colors ${
                            selectedOrder.status === s ? 'bg-slate-50' : ''
                          }`}
                        >
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(s)}`}>
                            <i className={getStatusIcon(s)}></i>
                            {s}
                          </span>
                          {s === 'Fulfilled & Shipped' && (
                            <span className="ml-auto flex items-center gap-1 text-xs text-teal-600 font-semibold bg-teal-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                              <i className="ri-truck-line text-xs"></i> Needs tracking #
                            </span>
                          )}
                          {s === 'Ready for Pickup' && (
                            <span className="ml-auto flex items-center gap-1 text-xs text-orange-500 font-semibold bg-orange-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                              <i className="ri-mail-send-line text-xs"></i> Auto-notifies
                            </span>
                          )}
                          {s === 'Working on Order' && (
                            <span className="ml-auto flex items-center gap-1 text-xs text-sky-600 font-semibold bg-sky-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                              <i className="ri-mail-send-line text-xs"></i> Auto-notifies
                            </span>
                          )}
                          {selectedOrder.status === s && s !== 'Ready for Pickup' && s !== 'Working on Order' && s !== 'Fulfilled & Shipped' && (
                            <span className="ml-auto text-xs text-slate-400 font-normal">Current</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── Inline Tracking Confirmation for Fulfilled & Shipped ── */}
                {pendingShippedConfirm && (
                  <div className="mt-3 bg-teal-50 border-2 border-teal-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 bg-teal-100 rounded-lg flex items-center justify-center">
                        <i className="ri-truck-line text-teal-600 text-sm"></i>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-teal-800">Confirm Shipment</p>
                        <p className="text-xs text-teal-600">Enter a tracking number — it goes directly in the customer email</p>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={shippingTrackingDraft}
                      onChange={(e) => setShippingTrackingDraft(e.target.value)}
                      placeholder="e.g. 1Z999AA10123456784, 9400111899223397846246..."
                      autoFocus
                      className="w-full text-sm font-mono border-2 border-teal-300 focus:border-teal-500 rounded-lg px-3 py-2.5 outline-none text-slate-800 placeholder-teal-300 bg-white mb-3"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatusChange('Fulfilled & Shipped', shippingTrackingDraft || undefined)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-bold whitespace-nowrap"
                      >
                        <i className="ri-mail-send-line"></i>
                        {shippingTrackingDraft.trim() ? 'Ship & Send Email with Tracking' : 'Ship & Send Email (no tracking)'}
                      </button>
                      <button
                        onClick={() => { setPendingShippedConfirm(false); setShippingTrackingDraft(''); }}
                        className="px-3 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-sm font-semibold whitespace-nowrap"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {statusSaved && (
                  <p className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold mt-2">
                    <i className="ri-check-line"></i> Status updated successfully
                  </p>
                )}
              </div>

              {/* Tracking */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Tracking Number</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    placeholder="Enter tracking number..."
                    className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-slate-400 text-slate-700"
                  />
                  <button
                    onClick={handleSaveTracking}
                    className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-700 whitespace-nowrap"
                  >
                    Save
                  </button>
                </div>
              </div>

              {/* Refund Notes */}
              <div className={`rounded-xl p-4 border-2 ${selectedOrder.status === 'Refunded' ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center ${selectedOrder.status === 'Refunded' ? 'bg-rose-100' : 'bg-slate-200'}`}>
                      <i className={`ri-sticky-note-line text-xs ${selectedOrder.status === 'Refunded' ? 'text-rose-600' : 'text-slate-500'}`}></i>
                    </div>
                    <p className={`text-xs font-bold uppercase tracking-wider ${selectedOrder.status === 'Refunded' ? 'text-rose-700' : 'text-slate-500'}`}>
                      Refund Notes
                    </p>
                    <span className="text-xs text-slate-400 font-normal">— admin only</span>
                  </div>
                  {selectedOrder.status === 'Refunded' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-100 text-rose-600 text-xs font-bold rounded-full">
                      <i className="ri-arrow-go-back-line text-xs"></i> Refunded
                    </span>
                  )}
                </div>
                <textarea
                  value={refundNotes}
                  onChange={(e) => setRefundNotes(e.target.value.slice(0, 500))}
                  placeholder="e.g. Damaged on arrival, Wrong size ordered, Customer changed mind, Duplicate order..."
                  rows={3}
                  className={`w-full text-sm border rounded-lg px-3 py-2.5 outline-none resize-none text-slate-700 placeholder-slate-400 ${
                    selectedOrder.status === 'Refunded'
                      ? 'border-rose-200 focus:border-rose-400 bg-white'
                      : 'border-slate-200 focus:border-slate-400 bg-white'
                  }`}
                />
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-xs text-slate-400">{refundNotes.length}/500</span>
                  <button
                    onClick={handleSaveRefundNotes}
                    disabled={!refundNotes.trim() && !localStorage.getItem(`refund_notes_${selectedOrder.id}`)}
                    className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                      refundNotesSaved
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-900 hover:bg-slate-700 disabled:bg-slate-200 disabled:text-slate-400 text-white'
                    }`}
                  >
                    {refundNotesSaved ? <><i className="ri-check-line"></i> Saved!</> : <><i className="ri-save-line"></i> Save Notes</>}
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pt-1 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Quick Actions</p>
                <button
                  onClick={() => handleReorder(selectedOrder)}
                  className="w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-semibold whitespace-nowrap"
                >
                  <i className="ri-file-copy-line text-base"></i>
                  Duplicate / Reorder — Same Client &amp; Items
                </button>
                <p className="text-xs text-slate-400 text-center mt-2">Creates a new Pending order with the same items for this client</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}