import { useState } from 'react';
import { products as productCatalog } from '../../../mocks/products';

interface RestockFormData {
  productId: string;
  quantity: string;
  urgency: 'low' | 'medium' | 'high';
  location: string;
  preferredDate: string;
  note: string;
  email: string;
  contactName: string;
  phone: string;
}

interface Address {
  id: string;
  label: string;
  city: string;
  state: string;
}

function loadAddresses(): Address[] {
  try {
    const stored = localStorage.getItem('user_addresses');
    if (!stored) return [];
    const full = JSON.parse(stored);
    return full.map((a: any) => ({
      id: a.id,
      label: a.label,
      city: a.city,
      state: a.state,
    }));
  } catch {
    return [];
  }
}

const SUBMIT_URL = 'https://readdy.ai/api/form/d6r4dns4k19g20dvrgpg';

const urgencyOptions = [
  { value: 'low', label: 'Low — Within 2 weeks', icon: 'ri-time-line', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { value: 'medium', label: 'Medium — Within 1 week', icon: 'ri-alarm-line', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { value: 'high', label: 'High — ASAP', icon: 'ri-flashlight-line', color: 'text-red-600 bg-red-50 border-red-200' },
];

export default function RestockRequestForm() {
  const addresses = loadAddresses();

  const [form, setForm] = useState<RestockFormData>({
    productId: '',
    quantity: '',
    urgency: 'medium',
    location: addresses[0]?.id ?? '',
    preferredDate: '',
    note: '',
    email: '',
    contactName: '',
    phone: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof RestockFormData, string>>>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    email: string;
    productName: string;
    quantity: string;
    urgency: string;
    preferredDate: string;
    location: string;
  } | null>(null);

  const selectedProduct = productCatalog.find(p => String(p.id) === form.productId);
  const filteredProducts = productCatalog.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const validate = () => {
    const newErrors: Partial<Record<keyof RestockFormData, string>> = {};
    if (!form.productId) newErrors.productId = 'Please select a product';
    if (!form.quantity || parseInt(form.quantity, 10) <= 0) newErrors.quantity = 'Enter a valid quantity';
    if (!form.contactName.trim()) newErrors.contactName = 'Contact name is required';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Valid email is required';
    if (!form.phone.trim()) newErrors.phone = 'Phone number is required';
    if (form.note.length > 500) newErrors.note = 'Note must be 500 characters or less';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus('submitting');

    const selectedAddr = addresses.find(a => a.id === form.location);
    const productName = selectedProduct?.name ?? '';
    const locationLabel = selectedAddr ? `${selectedAddr.label} — ${selectedAddr.city}, ${selectedAddr.state}` : form.location;
    const urgencyLabel = urgencyOptions.find(u => u.value === form.urgency)?.label ?? form.urgency;

    const body = new URLSearchParams({
      contactName: form.contactName,
      email: form.email,
      phone: form.phone,
      product: productName,
      quantity: form.quantity,
      urgency: urgencyLabel,
      location: locationLabel,
      preferredDate: form.preferredDate,
      note: form.note,
    });

    try {
      const res = await fetch(SUBMIT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
      if (res.ok) {
        // Save locally too
        const existing: any[] = JSON.parse(localStorage.getItem('user_restock_requests') ?? '[]');
        const newReq = {
          id: `restock_${Date.now()}`,
          addressId: form.location,
          productId: parseInt(form.productId, 10),
          productName,
          quantity: parseInt(form.quantity, 10),
          urgency: form.urgency,
          note: form.note,
          timestamp: Date.now(),
          status: 'pending',
        };
        localStorage.setItem('user_restock_requests', JSON.stringify([newReq, ...existing]));
        
        // Store submitted data for success screen
        setSubmittedData({
          email: form.email,
          productName,
          quantity: form.quantity,
          urgency: urgencyLabel,
          preferredDate: form.preferredDate,
          location: locationLabel,
        });
        
        setStatus('success');
        setForm({
          productId: '',
          quantity: '',
          urgency: 'medium',
          location: addresses[0]?.id ?? '',
          preferredDate: '',
          note: '',
          email: '',
          contactName: '',
          phone: '',
        });
        setProductSearch('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const inputClass = (field: keyof RestockFormData) =>
    `w-full border ${errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'} rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-colors`;

  if (status === 'success' && submittedData) {
    return (
      <div className="max-w-3xl mx-auto">
        {/* Success Icon & Title */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="ri-checkbox-circle-fill text-5xl text-emerald-600"></i>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-3">Request Submitted Successfully!</h3>
          <p className="text-base text-gray-600 mb-2">Your restock request has been received and is being processed.</p>
        </div>

        {/* Email Confirmation Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
              <i className="ri-mail-check-line text-xl text-white"></i>
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold text-gray-900 mb-2">Confirmation Email Sent</h4>
              <p className="text-sm text-gray-700 mb-3">
                A confirmation email has been sent to <strong className="text-blue-700">{submittedData.email}</strong>
              </p>
              <p className="text-xs text-gray-600">
                Please check your inbox (and spam folder) for details about your restock request.
              </p>
            </div>
          </div>
        </div>

        {/* Request Summary Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
          <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <i className="ri-file-list-3-line text-emerald-600"></i>
            Request Summary
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Product</span>
              <span className="text-sm font-semibold text-gray-900">{submittedData.productName}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Quantity</span>
              <span className="text-sm font-semibold text-gray-900">{submittedData.quantity} units</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Urgency Level</span>
              <span className="text-sm font-semibold text-gray-900">{submittedData.urgency}</span>
            </div>
            {submittedData.preferredDate && (
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Preferred Date</span>
                <span className="text-sm font-semibold text-gray-900">
                  {new Date(submittedData.preferredDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Delivery Location</span>
              <span className="text-sm font-semibold text-gray-900 text-right">{submittedData.location}</span>
            </div>
          </div>
        </div>

        {/* What Happens Next Timeline */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-6 mb-8">
          <h4 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
            <i className="ri-roadmap-line text-emerald-600"></i>
            What Happens Next?
          </h4>
          <div className="space-y-4">
            {/* Step 1 */}
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center shrink-0 font-bold text-sm">
                <i className="ri-check-line"></i>
              </div>
              <div className="flex-1 pt-1">
                <h5 className="text-sm font-bold text-gray-900 mb-1">Request Received</h5>
                <p className="text-xs text-gray-600">Your restock request has been logged in our system</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-white border-2 border-emerald-600 text-emerald-600 rounded-full flex items-center justify-center shrink-0 font-bold text-sm">
                2
              </div>
              <div className="flex-1 pt-1">
                <h5 className="text-sm font-bold text-gray-900 mb-1">Team Review</h5>
                <p className="text-xs text-gray-600">Our team will review your request within <strong>1–2 business days</strong></p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-white border-2 border-gray-300 text-gray-400 rounded-full flex items-center justify-center shrink-0 font-bold text-sm">
                3
              </div>
              <div className="flex-1 pt-1">
                <h5 className="text-sm font-bold text-gray-900 mb-1">Email Notification</h5>
                <p className="text-xs text-gray-600">You'll receive an email with approval status and next steps</p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-white border-2 border-gray-300 text-gray-400 rounded-full flex items-center justify-center shrink-0 font-bold text-sm">
                4
              </div>
              <div className="flex-1 pt-1">
                <h5 className="text-sm font-bold text-gray-900 mb-1">Fulfillment Begins</h5>
                <p className="text-xs text-gray-600">Once approved, we'll process and ship your order</p>
              </div>
            </div>
          </div>

          {/* Response Time Note */}
          <div className="mt-6 pt-5 border-t border-emerald-200">
            <div className="flex items-center gap-3 text-sm">
              <i className="ri-time-line text-emerald-600 text-lg"></i>
              <p className="text-gray-700">
                <strong className="text-gray-900">Estimated Response Time:</strong> You'll hear from us within 1–2 business days
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => {
              setStatus('idle');
              setSubmittedData(null);
            }}
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors whitespace-nowrap cursor-pointer shadow-sm"
          >
            <i className="ri-add-line text-lg"></i>
            Submit Another Request
          </button>
          <button
            onClick={() => {
              const event = new CustomEvent('switchAccountTab', { detail: 'restock' });
              window.dispatchEvent(event);
            }}
            className="inline-flex items-center gap-2 bg-white border-2 border-gray-300 text-gray-700 px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer"
          >
            <i className="ri-history-line text-lg"></i>
            View My Requests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Request a Restock</h2>
        <p className="text-sm text-gray-500 mt-1">Fill out the form below and our team will process your restock request promptly.</p>
      </div>

      {status === 'error' && (
        <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4">
          <i className="ri-error-warning-line text-red-500 text-xl shrink-0"></i>
          <p className="text-sm text-red-700 font-medium">Something went wrong. Please try again.</p>
          <button onClick={() => setStatus('idle')} className="ml-auto text-red-400 hover:text-red-600 cursor-pointer">
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>
      )}

      <form
        data-readdy-form
        id="restock-request-form"
        onSubmit={handleSubmit}
        className="space-y-8"
      >
        {/* Section 1: Contact Info */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">1</div>
            <h3 className="text-base font-bold text-gray-900">Contact Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name <span className="text-red-400">*</span></label>
              <input
                name="contactName"
                type="text"
                value={form.contactName}
                onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))}
                placeholder="Jane Smith"
                className={inputClass('contactName')}
              />
              {errors.contactName && <p className="text-xs text-red-500 mt-1">{errors.contactName}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address <span className="text-red-400">*</span></label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="jane@example.com"
                className={inputClass('email')}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone Number <span className="text-red-400">*</span></label>
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="(555) 000-0000"
                className={inputClass('phone')}
              />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>
          </div>
        </div>

        {/* Section 2: Product & Quantity */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">2</div>
            <h3 className="text-base font-bold text-gray-900">Product Details</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Selector */}
            <div className="relative">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Product <span className="text-red-400">*</span></label>
              {selectedProduct ? (
                <div className="flex items-center gap-3 border border-emerald-300 bg-emerald-50 rounded-lg px-3 py-2.5">
                  <div className="w-10 h-10 rounded overflow-hidden shrink-0 bg-gray-100">
                    <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover object-top" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{selectedProduct.name}</p>
                    <p className="text-xs text-gray-500">${selectedProduct.price.toFixed(2)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setForm(f => ({ ...f, productId: '' })); setProductSearch(''); }}
                    className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-500 cursor-pointer shrink-0"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    value={productSearch}
                    onChange={e => { setProductSearch(e.target.value); setShowProductDropdown(true); }}
                    onFocus={() => setShowProductDropdown(true)}
                    onBlur={() => setTimeout(() => setShowProductDropdown(false), 150)}
                    placeholder="Search for a product..."
                    className={`${inputClass('productId')} pr-10`}
                  />
                  <i className="ri-search-line absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                  {showProductDropdown && (
                    <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-56 overflow-y-auto">
                      {filteredProducts.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-6">No products found</p>
                      ) : (
                        filteredProducts.map(p => (
                          <button
                            key={p.id}
                            type="button"
                            onMouseDown={() => {
                              setForm(f => ({ ...f, productId: String(p.id) }));
                              setProductSearch('');
                              setShowProductDropdown(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-emerald-50 transition-colors cursor-pointer text-left"
                          >
                            <div className="w-9 h-9 rounded overflow-hidden shrink-0 bg-gray-100">
                              <img src={p.image} alt={p.name} className="w-full h-full object-cover object-top" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                              <p className="text-xs text-gray-400">${p.price.toFixed(2)}</p>
                            </div>
                            {p.inventory === 0 && (
                              <span className="text-xs text-red-500 font-semibold shrink-0">Out of Stock</span>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
              {errors.productId && <p className="text-xs text-red-500 mt-1">{errors.productId}</p>}
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Quantity Needed <span className="text-red-400">*</span></label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, quantity: String(Math.max(1, parseInt(f.quantity || '1', 10) - 1)) }))}
                  className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer shrink-0"
                >
                  <i className="ri-subtract-line"></i>
                </button>
                <input
                  name="quantity"
                  type="number"
                  min="1"
                  value={form.quantity}
                  onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                  placeholder="0"
                  className={`${inputClass('quantity')} text-center font-bold text-lg`}
                />
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, quantity: String(parseInt(f.quantity || '0', 10) + 1) }))}
                  className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer shrink-0"
                >
                  <i className="ri-add-line"></i>
                </button>
              </div>
              {errors.quantity && <p className="text-xs text-red-500 mt-1">{errors.quantity}</p>}
            </div>
          </div>
        </div>

        {/* Section 3: Urgency & Location */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">3</div>
            <h3 className="text-base font-bold text-gray-900">Urgency & Delivery</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Urgency */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Urgency Level</label>
              <div className="space-y-2">
                {urgencyOptions.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, urgency: opt.value as RestockFormData['urgency'] }))}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      form.urgency === opt.value
                        ? opt.color + ' border-current'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <i className={`${opt.icon} text-base`}></i>
                    {opt.label}
                    {form.urgency === opt.value && (
                      <i className="ri-check-line ml-auto"></i>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Location & Date */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Delivery Location</label>
                {addresses.length > 0 ? (
                  <select
                    name="location"
                    value={form.location}
                    onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
                  >
                    {addresses.map(addr => (
                      <option key={addr.id} value={addr.id}>
                        {addr.label} — {addr.city}, {addr.state}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    name="location"
                    type="text"
                    value={form.location}
                    onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                    placeholder="Enter delivery address or location name"
                    className={inputClass('location')}
                  />
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Preferred Delivery Date</label>
                <input
                  name="preferredDate"
                  type="date"
                  value={form.preferredDate}
                  onChange={e => setForm(f => ({ ...f, preferredDate: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Notes */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">4</div>
            <h3 className="text-base font-bold text-gray-900">Additional Notes</h3>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Notes <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              name="note"
              value={form.note}
              onChange={e => {
                if (e.target.value.length <= 500) setForm(f => ({ ...f, note: e.target.value }));
              }}
              placeholder="Any special instructions, color preferences, size specifications, or other details..."
              rows={4}
              maxLength={500}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white resize-none"
            />
            <div className="flex items-center justify-between mt-1">
              {errors.note ? (
                <p className="text-xs text-red-500">{errors.note}</p>
              ) : <span />}
              <p className={`text-xs ${form.note.length >= 480 ? 'text-red-400' : 'text-gray-400'}`}>
                {form.note.length}/500
              </p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-gray-400 flex items-center gap-1.5">
            <i className="ri-shield-check-line text-emerald-500"></i>
            Your request is sent securely to our team
          </p>
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="flex items-center gap-2 bg-emerald-600 text-white px-10 py-3.5 rounded-xl font-bold text-sm hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap cursor-pointer shadow-sm"
          >
            {status === 'submitting' ? (
              <>
                <i className="ri-loader-4-line animate-spin"></i>
                Submitting...
              </>
            ) : (
              <>
                <i className="ri-send-plane-line"></i>
                Submit Restock Request
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}