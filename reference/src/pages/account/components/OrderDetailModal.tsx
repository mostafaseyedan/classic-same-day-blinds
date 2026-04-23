import { useRef, useState } from 'react';

interface OrderItem {
  id: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size: string;
}

interface Order {
  id: string;
  date: string;
  deliveredDate: string;
  status: string;
  total: number;
  items: OrderItem[];
  trackingNumber?: string;
  carrier?: string;
  shippingAddress?: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone: string;
  };
}

interface Props {
  order: Order;
  onClose: () => void;
}

type ModalTab = 'details' | 'email' | 'forward';

const DEFAULT_ADDRESS = {
  fullName: 'James Carter',
  street: '4820 Wilshire Blvd, Suite 310',
  city: 'Los Angeles',
  state: 'CA',
  zip: '90010',
  country: 'United States',
  phone: '(213) 555-0192',
};

export default function OrderDetailModal({ order, onClose }: Props) {
  const printRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<ModalTab>('details');
  const [isDownloading, setIsDownloading] = useState(false);
  const [forwardEmail, setForwardEmail] = useState('');
  const [forwardNote, setForwardNote] = useState('');
  const [forwardStatus, setForwardStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const subtotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal >= 99 ? 0 : 12.99;
  const tax = subtotal * 0.08;
  const addr = order.shippingAddress ?? DEFAULT_ADDRESS;

  const orderDateStr = new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const deliveredDateStr = new Date(order.deliveredDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const buildInvoiceHTML = () => {
    const addrHtml = `<p><strong>${addr.fullName}</strong></p>
       <p>${addr.street}</p>
       <p>${addr.city}, ${addr.state} ${addr.zip}</p>
       <p>${addr.country}</p>
       <p>${addr.phone}</p>`;

    const itemsHtml = order.items.map((item, idx) => `
      <tr style="border-bottom: ${idx !== order.items.length - 1 ? '1px solid #f3f4f6' : 'none'}">
        <td style="padding: 12px 14px;">
          <div style="display:flex; align-items:center; gap:12px;">
            <img src="${item.image}" alt="${item.name}"
              style="width:48px; height:48px; object-fit:cover; object-position:top; border-radius:8px; border:1px solid #e5e7eb;" />
            <span style="font-size:13px; font-weight:600; color:#111;">${item.name}</span>
          </div>
        </td>
        <td style="padding:12px 14px; text-align:center; font-size:13px; color:#6b7280;">${item.size}</td>
        <td style="padding:12px 14px; text-align:center; font-size:13px; font-weight:700; color:#111;">${item.quantity}</td>
        <td style="padding:12px 14px; text-align:right; font-size:13px; color:#374151;">$${item.price.toFixed(2)}</td>
        <td style="padding:12px 14px; text-align:right; font-size:13px; font-weight:700; color:#111;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    return `<!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${order.id} — Classic Same Day Blinds</title>
          <meta charset="UTF-8" />
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #111; background: #fff; padding: 48px 52px; font-size: 13px; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 28px; border-bottom: 2px solid #e5e7eb; margin-bottom: 32px; }
            .brand-name { font-size: 22px; font-weight: 800; color: #059669; letter-spacing: -0.5px; }
            .brand-tagline { font-size: 11px; color: #6b7280; margin-top: 3px; }
            .brand-contact { font-size: 11px; color: #9ca3af; margin-top: 2px; }
            .invoice-label { font-size: 30px; font-weight: 800; color: #111; text-align: right; letter-spacing: -1px; }
            .invoice-meta { font-size: 12px; color: #6b7280; text-align: right; margin-top: 4px; }
            .bill-to { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px 18px; margin-bottom: 24px; }
            .bill-to-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #6b7280; margin-bottom: 8px; }
            .bill-to p { font-size: 13px; color: #374151; margin-bottom: 2px; }
            .bill-to p strong { color: #111; }
            .status-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 24px; }
            .status-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px 16px; }
            .status-box.green { background: #f0fdf4; border-color: #bbf7d0; }
            .status-box-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #6b7280; margin-bottom: 5px; }
            .status-box.green .status-box-label { color: #059669; }
            .status-box-value { font-size: 13px; font-weight: 700; color: #111; }
            .status-box.green .status-box-value { color: #065f46; }
            .tracking-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 14px 18px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
            .tracking-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #059669; margin-bottom: 4px; }
            .tracking-number { font-size: 15px; font-weight: 700; color: #111; font-family: 'Courier New', monospace; }
            .carrier-label { font-size: 10px; color: #6b7280; text-align: right; margin-bottom: 3px; }
            .carrier-value { font-size: 13px; font-weight: 700; color: #374151; text-align: right; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 28px; }
            .info-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px 18px; }
            .info-box-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #6b7280; margin-bottom: 10px; }
            .info-box p { font-size: 13px; color: #374151; margin-bottom: 2px; }
            .info-box p strong { color: #111; }
            .payment-card { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
            .card-icon { width: 40px; height: 26px; background: #fff; border: 1px solid #e5e7eb; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #1a56db; letter-spacing: 1px; }
            .section-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #6b7280; margin-bottom: 10px; }
            .items-table { width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; margin-bottom: 28px; }
            .items-table thead tr { background: #f9fafb; border-bottom: 1px solid #e5e7eb; }
            .items-table th { padding: 10px 14px; text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #6b7280; }
            .items-table th:not(:first-child) { text-align: center; }
            .items-table th:last-child, .items-table th:nth-child(4) { text-align: right; }
            .totals-wrapper { display: flex; justify-content: flex-end; margin-bottom: 40px; }
            .totals-box { width: 280px; }
            .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; color: #374151; border-bottom: 1px solid #f3f4f6; }
            .totals-row:last-child { border-bottom: none; border-top: 2px solid #e5e7eb; padding-top: 12px; margin-top: 4px; font-size: 15px; font-weight: 800; color: #111; }
            .totals-row span:last-child { font-weight: 600; }
            .totals-row:last-child span:last-child { font-weight: 800; }
            .free-shipping { color: #059669; font-weight: 700; }
            .footer { border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; }
            .footer p { font-size: 11px; color: #9ca3af; margin-bottom: 3px; }
            .footer .thank-you { font-size: 13px; font-weight: 700; color: #059669; margin-bottom: 6px; }
            @media print { body { padding: 32px 40px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand-name">Classic Same Day Blinds</div>
              <div class="brand-tagline">Premium Window Treatments — Same Day Service</div>
              <div class="brand-contact">support@classicsamedayblinds.com &nbsp;|&nbsp; (800) 555-2453</div>
            </div>
            <div>
              <div class="invoice-label">INVOICE</div>
              <div class="invoice-meta">Order: <strong>${order.id}</strong></div>
              <div class="invoice-meta">Date: ${orderDateStr}</div>
            </div>
          </div>
          <div class="bill-to">
            <div class="bill-to-label">&#128100; Bill To / Ship To</div>
            ${addrHtml}
          </div>
          <div class="status-grid">
            <div class="status-box">
              <div class="status-box-label">Order Date</div>
              <div class="status-box-value">${orderDateStr}</div>
            </div>
            <div class="status-box green">
              <div class="status-box-label">Delivered</div>
              <div class="status-box-value">${deliveredDateStr}</div>
            </div>
            <div class="status-box green">
              <div class="status-box-label">Status</div>
              <div class="status-box-value">&#10003; ${order.status}</div>
            </div>
          </div>
          <div class="tracking-box">
            <div>
              <div class="tracking-label">Tracking Number</div>
              <div class="tracking-number">${order.trackingNumber ?? '1Z999AA10123456784'}</div>
            </div>
            <div>
              <div class="carrier-label">Carrier</div>
              <div class="carrier-value">${order.carrier ?? 'UPS Ground'}</div>
            </div>
          </div>
          <div class="info-grid">
            <div class="info-box">
              <div class="info-box-title">&#128205; Shipping Address</div>
              ${addrHtml}
            </div>
            <div class="info-box">
              <div class="info-box-title">&#128179; Payment Method</div>
              <div class="payment-card">
                <div class="card-icon">VISA</div>
                <div>
                  <p><strong>Visa ending in 4821</strong></p>
                  <p style="font-size:11px; color:#6b7280;">Expires 09/2027</p>
                </div>
              </div>
              <p style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:#9ca3af; margin-top:8px; margin-bottom:3px;">Billing Address</p>
              <p>Same as shipping address</p>
            </div>
          </div>
          <div class="section-title">Items Ordered</div>
          <table class="items-table">
            <thead>
              <tr>
                <th>Product</th>
                <th style="text-align:center;">Size</th>
                <th style="text-align:center;">Qty</th>
                <th style="text-align:right;">Unit Price</th>
                <th style="text-align:right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <div class="totals-wrapper">
            <div class="totals-box">
              <div class="totals-row"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>
              <div class="totals-row"><span>Shipping</span><span class="${shipping === 0 ? 'free-shipping' : ''}">${shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span></div>
              <div class="totals-row"><span>Tax (8%)</span><span>$${tax.toFixed(2)}</span></div>
              <div class="totals-row"><span>Total</span><span>$${order.total.toFixed(2)}</span></div>
            </div>
          </div>
          <div class="footer">
            <p class="thank-you">Thank you for choosing Classic Same Day Blinds!</p>
            <p>Questions about your order? Contact us at support@classicsamedayblinds.com or call (800) 555-2453</p>
            <p style="margin-top:6px;">classicsamedayblinds.com</p>
          </div>
        </body>
      </html>`;
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=860,height=1000');
    if (!printWindow) return;
    printWindow.document.write(buildInvoiceHTML());
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const handleDownloadPDF = () => {
    setIsDownloading(true);
    const html = buildInvoiceHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    iframe.src = url;

    document.body.appendChild(iframe);

    iframe.onload = () => {
      setTimeout(() => {
        if (iframe.contentWindow) {
          const fileName = `Invoice-${order.id}.pdf`;
          // Set document title so the PDF save dialog defaults to the right filename
          if (iframe.contentDocument) {
            iframe.contentDocument.title = fileName;
          }
          iframe.contentWindow.print();
        }
        setTimeout(() => {
          document.body.removeChild(iframe);
          URL.revokeObjectURL(url);
          setIsDownloading(false);
        }, 1000);
      }, 600);
    };
  };

  const handleForwardEmail = () => {
    if (!forwardEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forwardEmail.trim())) {
      setForwardStatus('error');
      return;
    }
    setForwardStatus('sending');
    setTimeout(() => {
      setForwardStatus('sent');
      setTimeout(() => {
        setForwardStatus('idle');
      }, 4000);
    }, 1500);
  };

  // Status tracker
  const orderDate = new Date(order.date);
  const deliveredDate = new Date(order.deliveredDate);
  const totalDays = Math.round((deliveredDate.getTime() - orderDate.getTime()) / 86400000);
  const processingDate = new Date(orderDate);
  processingDate.setDate(processingDate.getDate() + Math.floor(totalDays * 0.2));
  const shippedDate = new Date(orderDate);
  shippedDate.setDate(shippedDate.getDate() + Math.floor(totalDays * 0.5));

  const steps = [
    { id: 'placed', label: 'Placed', icon: 'ri-file-list-3-line', date: orderDate, completed: true },
    { id: 'processing', label: 'Processing', icon: 'ri-settings-3-line', date: processingDate, completed: true },
    { id: 'shipped', label: 'Shipped', icon: 'ri-truck-line', date: shippedDate, completed: true },
    { id: 'delivered', label: 'Delivered', icon: 'ri-checkbox-circle-line', date: deliveredDate, completed: order.status === 'Delivered' }
  ];

  const currentStepIndex = steps.findIndex(s => !s.completed);
  const activeStepIndex = currentStepIndex === -1 ? steps.length - 1 : currentStepIndex;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 py-6"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Modal Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
            <p className="text-sm text-gray-500 mt-0.5">{order.id}</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Tab switcher */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1">
              <button
                onClick={() => setActiveTab('details')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'details' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className="ri-file-list-3-line"></i>
                Order Details
              </button>
              <button
                onClick={() => setActiveTab('email')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'email' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className="ri-mail-line"></i>
                Email Preview
              </button>
              <button
                onClick={() => setActiveTab('forward')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'forward' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className="ri-forward-end-line"></i>
                Forward
              </button>
            </div>
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              {isDownloading ? (
                <i className="ri-loader-4-line animate-spin"></i>
              ) : (
                <i className="ri-download-2-line"></i>
              )}
              {isDownloading ? 'Preparing...' : 'Download PDF'}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-printer-line"></i>
              Print Invoice
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-red-100 hover:text-red-600 text-gray-600 transition-colors cursor-pointer"
              title="Close"
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 px-8 py-6" ref={printRef}>

          {/* ── ORDER DETAILS TAB ── */}
          {activeTab === 'details' && (
            <>
              {/* Customer Info Banner */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-5 py-4 mb-6 flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                  <i className="ri-user-line text-emerald-600 text-lg"></i>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{addr.fullName}</p>
                  <p className="text-xs text-gray-500">{addr.street}, {addr.city}, {addr.state} {addr.zip} &nbsp;·&nbsp; {addr.phone}</p>
                </div>
              </div>

              {/* Order Status Tracker */}
              <div className="mb-8">
                <div className="relative">
                  <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200" style={{ marginLeft: '2rem', marginRight: '2rem' }}></div>
                  <div
                    className="absolute top-6 left-0 h-0.5 bg-emerald-500 transition-all duration-500"
                    style={{ marginLeft: '2rem', width: `calc(${(activeStepIndex / (steps.length - 1)) * 100}% - 4rem)` }}
                  ></div>
                  <div className="relative flex items-start justify-between">
                    {steps.map((step, index) => {
                      const isCompleted = index < activeStepIndex || (index === activeStepIndex && step.completed);
                      const isActive = index === activeStepIndex && !step.completed;
                      return (
                        <div key={step.id} className="flex flex-col items-center" style={{ width: '25%' }}>
                          <div className="relative mb-3">
                            {isActive && (
                              <div className="absolute inset-0 w-12 h-12 bg-emerald-500 rounded-full animate-ping opacity-20"></div>
                            )}
                            <div className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                              isCompleted
                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                : isActive
                                ? 'bg-emerald-100 text-emerald-600 ring-4 ring-emerald-500/20'
                                : 'bg-gray-100 text-gray-400'
                            }`}>
                              <i className={`${step.icon} text-xl`}></i>
                            </div>
                          </div>
                          <p className={`text-sm font-bold mb-1 ${isCompleted || isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                            {step.label}
                          </p>
                          <p className={`text-xs ${isCompleted || isActive ? 'text-gray-600' : 'text-gray-400'}`}>
                            {step.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Status + Dates */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Order Date</p>
                  <p className="text-sm font-bold text-gray-900">{orderDateStr}</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4">
                  <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wide mb-1">Delivered</p>
                  <p className="text-sm font-bold text-emerald-700">{deliveredDateStr}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Status</p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700">
                    <i className="ri-checkbox-circle-fill"></i>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Tracking */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                      <i className="ri-truck-line text-emerald-600 text-lg"></i>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-0.5">Tracking Number</p>
                      <p className="text-base font-bold text-gray-900 font-mono">{order.trackingNumber ?? '1Z999AA10123456784'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-0.5">Carrier</p>
                    <p className="text-sm font-bold text-gray-800">{order.carrier ?? 'UPS Ground'}</p>
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 rounded-xl p-5">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                    <i className="ri-map-pin-line text-emerald-600"></i>
                    Shipping Address
                  </p>
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-gray-900">{addr.fullName}</p>
                    <p className="text-sm text-gray-600">{addr.street}</p>
                    <p className="text-sm text-gray-600">{addr.city}, {addr.state} {addr.zip}</p>
                    <p className="text-sm text-gray-600">{addr.country}</p>
                    <p className="text-sm text-gray-500 mt-1">{addr.phone}</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-5">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                    <i className="ri-bank-card-line text-emerald-600"></i>
                    Payment Method
                  </p>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-7 bg-white border border-gray-200 rounded flex items-center justify-center">
                      <i className="ri-visa-line text-lg text-gray-700"></i>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Visa ending in 4821</p>
                      <p className="text-xs text-gray-500">Expires 09/2027</p>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 mt-3">Billing Address</p>
                  <p className="text-sm text-gray-600">Same as shipping address</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-6">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Items Ordered</p>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Product</th>
                        <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Size</th>
                        <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Qty</th>
                        <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Unit Price</th>
                        <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, idx) => (
                        <tr key={item.id} className={idx !== order.items.length - 1 ? 'border-b border-gray-100' : ''}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover object-top" />
                              </div>
                              <span className="text-sm font-semibold text-gray-900">{item.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-gray-600">{item.size}</td>
                          <td className="px-4 py-3 text-center text-sm font-bold text-gray-900">{item.quantity}</td>
                          <td className="px-4 py-3 text-right text-sm text-gray-700">${item.price.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="flex justify-end mb-2">
                <div className="w-72 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Shipping</span>
                    <span className={`font-semibold ${shipping === 0 ? 'text-emerald-600' : 'text-gray-900'}`}>
                      {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Tax (8%)</span>
                    <span className="font-semibold text-gray-900">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-gray-900 pt-3 border-t border-gray-200">
                    <span>Total</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── EMAIL PREVIEW TAB ── */}
          {activeTab === 'email' && (
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 flex items-center justify-center bg-emerald-100 rounded-lg shrink-0">
                  <i className="ri-mail-send-line text-emerald-600 text-lg"></i>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Order Confirmation Email Preview</p>
                  <p className="text-xs text-gray-500">This is what your receipt email looks like when sent to <strong>{addr.fullName}</strong></p>
                </div>
              </div>

              {/* Email Shell */}
              <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                {/* Email client header bar */}
                <div className="bg-white border-b border-gray-200 px-5 py-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-gray-500 w-10">From:</span>
                    <span className="text-xs text-gray-700">Classic Same Day Blinds &lt;orders@classicsamedayblinds.com&gt;</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-gray-500 w-10">To:</span>
                    <span className="text-xs text-gray-700">{addr.fullName} &lt;customer@email.com&gt;</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-500 w-10">Re:</span>
                    <span className="text-xs font-semibold text-gray-900">Your Order {order.id} is Confirmed ✓</span>
                  </div>
                </div>

                {/* Email Body */}
                <div className="bg-gray-100 p-4">
                  <div className="max-w-lg mx-auto bg-white rounded-xl overflow-hidden shadow-sm">

                    {/* Email Header */}
                    <div className="bg-emerald-600 px-8 py-7 text-center">
                      <p className="text-white text-xl font-bold tracking-tight">Classic Same Day Blinds</p>
                      <p className="text-emerald-200 text-xs mt-1">Premium Window Treatments — Same Day Service</p>
                    </div>

                    {/* Hero confirmation */}
                    <div className="px-8 pt-8 pb-6 text-center border-b border-gray-100">
                      <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="ri-checkbox-circle-fill text-emerald-600 text-3xl"></i>
                      </div>
                      <h2 className="text-lg font-bold text-gray-900 mb-1">Order Confirmed!</h2>
                      <p className="text-sm text-gray-500">Hi <strong>{addr.fullName}</strong>, thank you for your purchase.</p>
                      <p className="text-xs text-gray-400 mt-1">We've received your order and it's being prepared for same-day delivery.</p>
                      <div className="mt-4 inline-block bg-gray-50 border border-gray-200 rounded-lg px-5 py-2">
                        <p className="text-xs text-gray-500">Order Number</p>
                        <p className="text-base font-bold text-gray-900 font-mono">{order.id}</p>
                      </div>
                    </div>

                    {/* Shipping address */}
                    <div className="px-8 py-5 border-b border-gray-100">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Shipping To</p>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 flex items-center justify-center bg-emerald-50 rounded-lg shrink-0 mt-0.5">
                          <i className="ri-map-pin-2-line text-emerald-600 text-sm"></i>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{addr.fullName}</p>
                          <p className="text-xs text-gray-500">{addr.street}</p>
                          <p className="text-xs text-gray-500">{addr.city}, {addr.state} {addr.zip}</p>
                          <p className="text-xs text-gray-500">{addr.country}</p>
                        </div>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="px-8 py-5 border-b border-gray-100">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Items in Your Order</p>
                      <div className="space-y-4">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover object-top" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                              <p className="text-xs text-gray-500">Size: {item.size} &nbsp;·&nbsp; Qty: {item.quantity}</p>
                            </div>
                            <p className="text-sm font-bold text-gray-900 shrink-0">${(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Totals */}
                    <div className="px-8 py-5 border-b border-gray-100 bg-gray-50">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>Subtotal</span>
                          <span className="font-semibold">${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>Shipping</span>
                          <span className={`font-semibold ${shipping === 0 ? 'text-emerald-600' : ''}`}>
                            {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>Tax (8%)</span>
                          <span className="font-semibold">${tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-200">
                          <span>Order Total</span>
                          <span>${order.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Tracking */}
                    <div className="px-8 py-5 border-b border-gray-100">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Tracking Information</p>
                      <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-3 flex items-center justify-between">
                        <div>
                          <p className="text-xs text-emerald-700 font-semibold mb-0.5">Tracking Number</p>
                          <p className="text-sm font-bold text-gray-900 font-mono">{order.trackingNumber ?? '1Z999AA10123456784'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 mb-0.5">Carrier</p>
                          <p className="text-xs font-bold text-gray-700">{order.carrier ?? 'UPS Ground'}</p>
                        </div>
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="px-8 py-6 text-center">
                      <p className="text-xs text-gray-500 mb-4">Need help with your order? We're here for you.</p>
                      <div className="flex items-center justify-center gap-3">
                        <a href="mailto:support@classicsamedayblinds.com" className="inline-flex items-center gap-1.5 bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer whitespace-nowrap">
                          <i className="ri-customer-service-2-line"></i>
                          Contact Support
                        </a>
                        <a href="tel:8005552453" className="inline-flex items-center gap-1.5 border border-gray-200 text-gray-700 text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer whitespace-nowrap">
                          <i className="ri-phone-line"></i>
                          (800) 555-2453
                        </a>
                      </div>
                    </div>

                    {/* Email Footer */}
                    <div className="bg-gray-50 border-t border-gray-100 px-8 py-5 text-center">
                      <p className="text-xs font-bold text-emerald-600 mb-1">Thank you for choosing Classic Same Day Blinds!</p>
                      <p className="text-xs text-gray-400">classicsamedayblinds.com &nbsp;·&nbsp; support@classicsamedayblinds.com</p>
                      <p className="text-xs text-gray-300 mt-2">© 2024 Classic Same Day Blinds. All rights reserved.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── FORWARD TAB ── */}
          {activeTab === 'forward' && (
            <div>
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 flex items-center justify-center bg-emerald-100 rounded-xl shrink-0">
                  <i className="ri-send-plane-line text-emerald-600 text-lg"></i>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Forward Order Details</p>
                  <p className="text-xs text-gray-500">Send a copy of order <strong>{order.id}</strong> to another email address</p>
                </div>
              </div>

              {/* Success Banner */}
              {forwardStatus === 'sent' && (
                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4 mb-6">
                  <div className="w-8 h-8 flex items-center justify-center bg-emerald-100 rounded-full shrink-0">
                    <i className="ri-checkbox-circle-fill text-emerald-600 text-lg"></i>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-800">Email sent successfully!</p>
                    <p className="text-xs text-emerald-600">Order details have been forwarded to <strong>{forwardEmail}</strong></p>
                  </div>
                </div>
              )}

              {/* Form Card */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-6">
                {/* Recipient Email */}
                <div className="mb-5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                    Recipient Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400">
                      <i className="ri-mail-line text-base"></i>
                    </div>
                    <input
                      type="email"
                      value={forwardEmail}
                      onChange={(e) => { setForwardEmail(e.target.value); setForwardStatus('idle'); }}
                      placeholder="e.g. friend@example.com"
                      className={`w-full pl-9 pr-4 py-3 text-sm border rounded-xl bg-white focus:outline-none focus:ring-2 transition-all ${
                        forwardStatus === 'error' && !forwardEmail.trim()
                          ? 'border-red-300 focus:ring-red-200'
                          : 'border-gray-200 focus:ring-emerald-200 focus:border-emerald-400'
                      }`}
                    />
                  </div>
                  {forwardStatus === 'error' && !forwardEmail.trim() && (
                    <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                      <i className="ri-error-warning-line"></i>
                      Please enter a valid email address.
                    </p>
                  )}
                  {forwardStatus === 'error' && forwardEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forwardEmail.trim()) && (
                    <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                      <i className="ri-error-warning-line"></i>
                      Please enter a valid email address.
                    </p>
                  )}
                </div>

                {/* Personal Note */}
                <div className="mb-5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                    Personal Note <span className="text-gray-400 font-normal normal-case">(optional)</span>
                  </label>
                  <textarea
                    value={forwardNote}
                    onChange={(e) => setForwardNote(e.target.value.slice(0, 300))}
                    placeholder="Add a personal message to include with the order details..."
                    rows={3}
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition-all resize-none"
                  />
                  <p className="text-xs text-gray-400 text-right mt-1">{forwardNote.length}/300</p>
                </div>

                {/* What will be included */}
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                    <i className="ri-information-line text-emerald-600"></i>
                    What will be included
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { icon: 'ri-file-list-3-line', label: 'Order summary & items' },
                      { icon: 'ri-map-pin-line', label: 'Shipping address' },
                      { icon: 'ri-truck-line', label: 'Tracking information' },
                      { icon: 'ri-money-dollar-circle-line', label: 'Pricing & totals' },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-2 text-xs text-gray-600">
                        <div className="w-5 h-5 flex items-center justify-center text-emerald-500 shrink-0">
                          <i className={item.icon}></i>
                        </div>
                        {item.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Summary Preview */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Order Summary Preview</p>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{order.id}</p>
                    <p className="text-xs text-gray-500">{orderDateStr} &nbsp;·&nbsp; {order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                    <i className="ri-checkbox-circle-fill"></i>
                    {order.status}
                  </span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {order.items.map((item) => (
                    <div key={item.id} className="shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover object-top" />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500">Order Total</span>
                  <span className="text-sm font-bold text-gray-900">${order.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Send Button */}
              <button
                onClick={handleForwardEmail}
                disabled={forwardStatus === 'sending' || forwardStatus === 'sent'}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-xl text-sm font-bold transition-colors cursor-pointer whitespace-nowrap"
              >
                {forwardStatus === 'sending' ? (
                  <>
                    <i className="ri-loader-4-line animate-spin"></i>
                    Sending...
                  </>
                ) : forwardStatus === 'sent' ? (
                  <>
                    <i className="ri-checkbox-circle-fill"></i>
                    Sent Successfully!
                  </>
                ) : (
                  <>
                    <i className="ri-send-plane-fill"></i>
                    Forward Order Details
                  </>
                )}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
