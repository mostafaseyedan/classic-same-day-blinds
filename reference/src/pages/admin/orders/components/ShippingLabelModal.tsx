import { useState, useEffect } from 'react';
import type { Order, ShippingLabel } from '../types';

interface Props {
  order: Order;
  onClose: () => void;
  onSave: (label: ShippingLabel) => void;
}

const CARRIERS = ['UPS', 'FedEx', 'USPS', 'DHL'];
const SERVICES: Record<string, string[]> = {
  UPS: ['Ground', 'Next Day Air', '2nd Day Air', '3 Day Select'],
  FedEx: ['Ground', 'Express Saver', '2Day', 'Standard Overnight'],
  USPS: ['Priority Mail', 'Priority Mail Express', 'First-Class Package', 'Parcel Select'],
  DHL: ['Express Worldwide', 'Express 12:00', 'Express 9:00', 'Economy Select'],
};

export default function ShippingLabelModal({ order, onClose, onSave }: Props) {
  const customerName = `${order.customer?.firstName ?? ''} ${order.customer?.lastName ?? ''}`.trim() || 'Customer';
  
  // Load saved sender address from localStorage
  const loadSenderAddress = () => {
    try {
      const saved = localStorage.getItem('shipping_sender_address');
      if (saved) return JSON.parse(saved);
    } catch (_e) {
      // ignore parse errors
    }
    return {
      name: 'Classic Same Day Blinds',
      company: 'Classic Same Day Blinds',
      street: '2801 Brasher Ln',
      city: 'Bedford',
      state: 'TX',
      zip: '76021',
      phone: '(817) 555-0100',
    };
  };

  const [carrier, setCarrier] = useState('UPS');
  const [service, setService] = useState('Ground');
  const [weight, setWeight] = useState('');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [notes, setNotes] = useState('');
  
  const [senderAddress, setSenderAddress] = useState(loadSenderAddress());
  const [recipientAddress, setRecipientAddress] = useState({
    name: customerName,
    company: order.customer?.companyName ?? '',
    street: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
  });

  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Update service when carrier changes
  useEffect(() => {
    setService(SERVICES[carrier][0]);
  }, [carrier]);

  const handleSaveSenderAddress = () => {
    localStorage.setItem('shipping_sender_address', JSON.stringify(senderAddress));
  };

  const handleGenerateLabel = () => {
    setShowPreview(true);
    // Immediately open print/PDF dialog
    setTimeout(() => {
      const labelHTML = buildLabelHTML();
      const printWindow = window.open('', '_blank', 'width=800,height=1000');
      if (printWindow) {
        printWindow.document.write(labelHTML);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 400);
      }
    }, 100);
  };

  const handlePrintLabel = () => {
    const labelHTML = buildLabelHTML();
    const printWindow = window.open('', '_blank', 'width=800,height=1000');
    if (printWindow) {
      printWindow.document.write(labelHTML);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 300);
    }
  };

  const handleSaveLabel = () => {
    setIsSaving(true);
    handleSaveSenderAddress();
    
    const label: ShippingLabel = {
      id: `LBL-${Date.now().toString().slice(-8)}`,
      orderId: order.id,
      customerName,
      createdAt: new Date().toISOString(),
      carrier,
      service,
      weight: `${weight} lbs`,
      dimensions: `${length}" × ${width}" × ${height}"`,
      notes: notes.trim() || undefined,
      senderAddress,
      recipientAddress,
    };

    // Save to localStorage
    try {
      const existing: ShippingLabel[] = JSON.parse(localStorage.getItem('shipping_labels') ?? '[]');
      existing.unshift(label);
      localStorage.setItem('shipping_labels', JSON.stringify(existing));
    } catch (_e) {
      // ignore storage errors
    }

    setTimeout(() => {
      setIsSaving(false);
      onSave(label);
      onClose();
    }, 800);
  };

  const buildLabelHTML = () => {
    const barcode = `*${order.id}*`;
    const trackingNumber = `1Z${Math.random().toString().slice(2, 18)}`;
    
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Shipping Label - ${order.id}</title>
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
    <div class="carrier-badge">${carrier} - ${service}</div>
    
    <div class="section">
      <div class="section-title">FROM</div>
      <div class="address">
        <strong>${senderAddress.name}</strong><br>
        ${senderAddress.company ? `${senderAddress.company}<br>` : ''}
        ${senderAddress.street}<br>
        ${senderAddress.city}, ${senderAddress.state} ${senderAddress.zip}<br>
        ${senderAddress.phone}
      </div>
    </div>

    <div class="section">
      <div class="section-title">TO</div>
      <div class="address">
        <strong>${recipientAddress.name}</strong><br>
        ${recipientAddress.company ? `${recipientAddress.company}<br>` : ''}
        ${recipientAddress.street}<br>
        ${recipientAddress.city}, ${recipientAddress.state} ${recipientAddress.zip}<br>
        ${recipientAddress.phone}
      </div>
    </div>

    <div class="barcode">${barcode}</div>
    <div class="tracking">${trackingNumber}</div>

    <div class="info-grid">
      <div class="info-box">
        <div class="info-label">Order ID</div>
        <div class="info-value">${order.id}</div>
      </div>
      <div class="info-box">
        <div class="info-label">Date</div>
        <div class="info-value">${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
      </div>
      <div class="info-box">
        <div class="info-label">Weight</div>
        <div class="info-value">${weight} lbs</div>
      </div>
      <div class="info-box">
        <div class="info-label">Dimensions</div>
        <div class="info-value">${length}"×${width}"×${height}"</div>
      </div>
    </div>
  </div>
</body>
</html>`;
  };

  const isFormValid = () => {
    return (
      carrier &&
      service &&
      weight &&
      length &&
      width &&
      height &&
      senderAddress.name &&
      senderAddress.street &&
      senderAddress.city &&
      senderAddress.state &&
      senderAddress.zip &&
      recipientAddress.name &&
      recipientAddress.street &&
      recipientAddress.city &&
      recipientAddress.state &&
      recipientAddress.zip
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
              <i className="ri-printer-line text-blue-600 text-lg"></i>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Create Shipping Label</h3>
              <p className="text-xs text-slate-500">Order: {order.id} — {customerName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 cursor-pointer transition-colors"
          >
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {!showPreview ? (
            <div className="grid grid-cols-2 gap-6">
              {/* Left Column - Sender & Carrier */}
              <div className="space-y-5">
                {/* Carrier Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Carrier <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {CARRIERS.map(c => (
                      <button
                        key={c}
                        onClick={() => setCarrier(c)}
                        className={`px-4 py-2.5 rounded-lg text-sm font-semibold border-2 transition-all cursor-pointer whitespace-nowrap ${
                          carrier === c
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Service Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Service Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={service}
                    onChange={e => setService(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400 text-slate-700 cursor-pointer"
                  >
                    {SERVICES[carrier].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Package Details */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Package Weight <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={weight}
                      onChange={e => setWeight(e.target.value)}
                      placeholder="e.g. 15"
                      min="0"
                      step="0.1"
                      className="w-full px-3 py-2.5 pr-12 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400 text-slate-700"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">lbs</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Package Dimensions <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="relative">
                      <input
                        type="number"
                        value={length}
                        onChange={e => setLength(e.target.value)}
                        placeholder="L"
                        min="0"
                        className="w-full px-3 py-2.5 pr-7 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400 text-slate-700"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">"</span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        value={width}
                        onChange={e => setWidth(e.target.value)}
                        placeholder="W"
                        min="0"
                        className="w-full px-3 py-2.5 pr-7 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400 text-slate-700"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">"</span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        value={height}
                        onChange={e => setHeight(e.target.value)}
                        placeholder="H"
                        min="0"
                        className="w-full px-3 py-2.5 pr-7 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400 text-slate-700"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">"</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Length × Width × Height (inches)</p>
                </div>

                {/* Sender Address */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <i className="ri-building-line text-blue-600"></i>
                    Sender Address (Your Business)
                  </p>
                  <div className="space-y-2.5">
                    <input
                      type="text"
                      value={senderAddress.name}
                      onChange={e => setSenderAddress({ ...senderAddress, name: e.target.value })}
                      placeholder="Contact Name"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400 text-slate-700 bg-white"
                    />
                    <input
                      type="text"
                      value={senderAddress.company}
                      onChange={e => setSenderAddress({ ...senderAddress, company: e.target.value })}
                      placeholder="Company Name"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400 text-slate-700 bg-white"
                    />
                    <input
                      type="text"
                      value={senderAddress.street}
                      onChange={e => setSenderAddress({ ...senderAddress, street: e.target.value })}
                      placeholder="Street Address"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400 text-slate-700 bg-white"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={senderAddress.city}
                        onChange={e => setSenderAddress({ ...senderAddress, city: e.target.value })}
                        placeholder="City"
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400 text-slate-700 bg-white"
                      />
                      <input
                        type="text"
                        value={senderAddress.state}
                        onChange={e => setSenderAddress({ ...senderAddress, state: e.target.value })}
                        placeholder="State"
                        maxLength={2}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400 text-slate-700 bg-white uppercase"
                      />
                      <input
                        type="text"
                        value={senderAddress.zip}
                        onChange={e => setSenderAddress({ ...senderAddress, zip: e.target.value })}
                        placeholder="ZIP"
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400 text-slate-700 bg-white"
                      />
                    </div>
                    <input
                      type="tel"
                      value={senderAddress.phone}
                      onChange={e => setSenderAddress({ ...senderAddress, phone: e.target.value })}
                      placeholder="Phone Number"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400 text-slate-700 bg-white"
                    />
                  </div>
                  <button
                    onClick={handleSaveSenderAddress}
                    className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-save-line"></i>
                    Save as Default Sender
                  </button>
                </div>
              </div>

              {/* Right Column - Recipient */}
              <div className="space-y-5">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <i className="ri-user-location-line text-blue-600"></i>
                    Recipient Address (Customer)
                  </p>
                  <div className="space-y-2.5">
                    <input
                      type="text"
                      value={recipientAddress.name}
                      onChange={e => setRecipientAddress({ ...recipientAddress, name: e.target.value })}
                      placeholder="Customer Name"
                      className="w-full px-3 py-2 text-sm border border-blue-200 rounded-lg outline-none focus:border-blue-400 text-slate-700 bg-white"
                    />
                    <input
                      type="text"
                      value={recipientAddress.company}
                      onChange={e => setRecipientAddress({ ...recipientAddress, company: e.target.value })}
                      placeholder="Company Name (optional)"
                      className="w-full px-3 py-2 text-sm border border-blue-200 rounded-lg outline-none focus:border-blue-400 text-slate-700 bg-white"
                    />
                    <input
                      type="text"
                      value={recipientAddress.street}
                      onChange={e => setRecipientAddress({ ...recipientAddress, street: e.target.value })}
                      placeholder="Street Address"
                      className="w-full px-3 py-2 text-sm border border-blue-200 rounded-lg outline-none focus:border-blue-400 text-slate-700 bg-white"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={recipientAddress.city}
                        onChange={e => setRecipientAddress({ ...recipientAddress, city: e.target.value })}
                        placeholder="City"
                        className="w-full px-3 py-2 text-sm border border-blue-200 rounded-lg outline-none focus:border-blue-400 text-slate-700 bg-white"
                      />
                      <input
                        type="text"
                        value={recipientAddress.state}
                        onChange={e => setRecipientAddress({ ...recipientAddress, state: e.target.value })}
                        placeholder="State"
                        maxLength={2}
                        className="w-full px-3 py-2 text-sm border border-blue-200 rounded-lg outline-none focus:border-blue-400 text-slate-700 bg-white uppercase"
                      />
                      <input
                        type="text"
                        value={recipientAddress.zip}
                        onChange={e => setRecipientAddress({ ...recipientAddress, zip: e.target.value })}
                        placeholder="ZIP"
                        className="w-full px-3 py-2 text-sm border border-blue-200 rounded-lg outline-none focus:border-blue-400 text-slate-700 bg-white"
                      />
                    </div>
                    <input
                      type="tel"
                      value={recipientAddress.phone}
                      onChange={e => setRecipientAddress({ ...recipientAddress, phone: e.target.value })}
                      placeholder="Phone Number"
                      className="w-full px-3 py-2 text-sm border border-blue-200 rounded-lg outline-none focus:border-blue-400 text-slate-700 bg-white"
                    />
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Order Summary</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Order ID:</span>
                      <span className="font-mono font-semibold text-slate-900">{order.id}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Items:</span>
                      <span className="font-semibold text-slate-900">{order.items.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Total Units:</span>
                      <span className="font-semibold text-slate-900">
                        {order.items.reduce((s, i) => s + i.quantity, 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-slate-200">
                      <span className="text-slate-600">Order Total:</span>
                      <span className="font-bold text-slate-900">${order.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>

                {/* Internal Notes / Memo */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <label className="block text-xs font-bold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <i className="ri-sticky-note-line text-amber-600"></i>
                    Internal Notes / Memo
                    <span className="ml-auto text-amber-500 font-normal normal-case tracking-normal">Optional</span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Add internal comments about this shipment — e.g. fragile items, special handling, warehouse notes..."
                    rows={4}
                    maxLength={500}
                    className="w-full px-3 py-2.5 text-sm border border-amber-200 rounded-lg outline-none focus:border-amber-400 text-slate-700 bg-white resize-none leading-relaxed"
                  />
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-xs text-amber-600">
                      <i className="ri-lock-line mr-1"></i>
                      Visible to staff only — not printed on label
                    </p>
                    <span className={`text-xs font-medium ${notes.length > 450 ? 'text-red-500' : 'text-slate-400'}`}>
                      {notes.length}/500
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Label Preview */
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                    <i className="ri-checkbox-circle-line text-emerald-600"></i>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Label Preview</p>
                    <p className="text-xs text-slate-500">Review before printing</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-arrow-left-line"></i>
                  Back to Edit
                </button>
              </div>

              <div className="flex gap-6 justify-center items-start">
                <div className="border-4 border-slate-900 rounded-lg p-6 bg-white" style={{ width: '4in' }}>
                  {/* Carrier Badge */}
                  <div className="bg-slate-900 text-white text-center py-2 rounded-lg mb-4">
                    <p className="text-lg font-bold">{carrier} - {service}</p>
                  </div>

                  {/* FROM */}
                  <div className="mb-4">
                    <div className="bg-slate-900 text-white text-xs font-bold uppercase px-2 py-1 mb-2">FROM</div>
                    <div className="text-sm leading-relaxed">
                      <p className="font-bold">{senderAddress.name}</p>
                      {senderAddress.company && <p>{senderAddress.company}</p>}
                      <p>{senderAddress.street}</p>
                      <p>{senderAddress.city}, {senderAddress.state} {senderAddress.zip}</p>
                      <p>{senderAddress.phone}</p>
                    </div>
                  </div>

                  {/* TO */}
                  <div className="mb-4">
                    <div className="bg-slate-900 text-white text-xs font-bold uppercase px-2 py-1 mb-2">TO</div>
                    <div className="text-sm leading-relaxed">
                      <p className="font-bold">{recipientAddress.name}</p>
                      {recipientAddress.company && <p>{recipientAddress.company}</p>}
                      <p>{recipientAddress.street}</p>
                      <p>{recipientAddress.city}, {recipientAddress.state} {recipientAddress.zip}</p>
                      <p>{recipientAddress.phone}</p>
                    </div>
                  </div>

                  {/* Barcode */}
                  <div className="border-2 border-slate-900 text-center py-3 mb-2">
                    <p className="font-mono text-2xl font-bold tracking-wider">*{order.id}*</p>
                  </div>

                  {/* Tracking */}
                  <div className="text-center mb-3">
                    <p className="font-mono text-base font-bold">1Z{Math.random().toString().slice(2, 18)}</p>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="border border-slate-900 p-2">
                      <p className="text-xs font-bold uppercase">Order ID</p>
                      <p className="text-sm font-bold">{order.id}</p>
                    </div>
                    <div className="border border-slate-900 p-2">
                      <p className="text-xs font-bold uppercase">Date</p>
                      <p className="text-sm font-bold">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <div className="border border-slate-900 p-2">
                      <p className="text-xs font-bold uppercase">Weight</p>
                      <p className="text-sm font-bold">{weight} lbs</p>
                    </div>
                    <div className="border border-slate-900 p-2">
                      <p className="text-xs font-bold uppercase">Dimensions</p>
                      <p className="text-sm font-bold">{length}"×{width}"×{height}"</p>
                    </div>
                  </div>
                </div>

                {/* Notes panel shown in preview if notes exist */}
                {notes.trim() && (
                  <div className="w-64 bg-amber-50 border border-amber-200 rounded-xl p-4 self-start">
                    <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <i className="ri-sticky-note-line text-amber-600"></i>
                      Internal Notes
                    </p>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{notes.trim()}</p>
                    <p className="text-xs text-amber-500 mt-3 flex items-center gap-1">
                      <i className="ri-lock-line"></i>
                      Not printed on label
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer whitespace-nowrap transition-colors"
          >
            Cancel
          </button>
          {!showPreview ? (
            <button
              onClick={handleGenerateLabel}
              disabled={!isFormValid()}
              className="flex items-center gap-2 px-5 py-2 bg-slate-900 hover:bg-slate-700 disabled:bg-slate-300 disabled:text-slate-500 text-white text-sm font-semibold rounded-lg cursor-pointer whitespace-nowrap transition-colors"
            >
              <i className="ri-printer-line"></i>
              Generate &amp; Print / PDF
            </button>
          ) : (
            <>
              <button
                onClick={() => setShowPreview(false)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg cursor-pointer whitespace-nowrap transition-colors"
              >
                <i className="ri-arrow-left-line"></i>
                Back to Edit
              </button>
              <button
                onClick={handlePrintLabel}
                className="flex items-center gap-2 px-5 py-2 bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold rounded-lg cursor-pointer whitespace-nowrap transition-colors"
              >
                <i className="ri-printer-line"></i>
                Print / PDF Again
              </button>
              <button
                onClick={handleSaveLabel}
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-sm font-semibold rounded-lg cursor-pointer whitespace-nowrap transition-colors"
              >
                {isSaving ? (
                  <><i className="ri-loader-4-line animate-spin"></i> Saving...</>
                ) : (
                  <><i className="ri-save-line"></i> Save &amp; Close</>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}