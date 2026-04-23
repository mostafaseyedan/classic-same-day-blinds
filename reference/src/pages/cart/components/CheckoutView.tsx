import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CartItem, CheckoutForm, PickupForm } from '../cartTypes';
import { US_STATES, PICKUP_TIME_SLOTS, getTodayStr } from '../cartConstants';
import {
  calculatePointsFromOrders,
  getSpentPoints,
  POINTS_PER_DOLLAR,
  getTier,
  getNextTier,
  POINTS_PER_REDEMPTION_DOLLAR,
  MIN_REDEMPTION_POINTS,
  pointsToDiscount,
  clampRedemption,
} from '../../../utils/loyaltyPoints';
import { mockOrders } from '../../../mocks/orders';

interface CheckoutViewProps {
  cart: CartItem[];
  form: CheckoutForm;
  setForm: (f: CheckoutForm) => void;
  formErrors: Partial<CheckoutForm>;
  deliveryMethod: 'delivery' | 'pickup';
  setDeliveryMethod: (m: 'delivery' | 'pickup') => void;
  pickupDetails: PickupForm;
  setPickupDetails: (p: PickupForm) => void;
  pickupErrors: Partial<PickupForm>;
  showPromoInput: boolean;
  setShowPromoInput: (v: boolean) => void;
  promoCode: string;
  setPromoCode: (v: string) => void;
  promoLoading: boolean;
  promoError: string;
  appliedPromo: { code: string; discount: number } | null;
  subtotal: number;
  promoDiscount: number;
  pointsDiscount: number;
  appliedPoints: number;
  onApplyPoints: (points: number) => void;
  onRemovePoints: () => void;
  tax: number;
  total: number;
  isProcessing: boolean;
  processingError: string;
  handleApplyPromo: () => void;
  handleRemovePromo: () => void;
  handlePlaceOrder: () => void;
  onBackToCart: () => void;
}

export default function CheckoutView({
  cart, form, setForm, formErrors,
  deliveryMethod, setDeliveryMethod,
  pickupDetails, setPickupDetails, pickupErrors,
  showPromoInput, setShowPromoInput,
  promoCode, setPromoCode, promoLoading, promoError,
  appliedPromo, subtotal, promoDiscount, pointsDiscount, appliedPoints,
  onApplyPoints, onRemovePoints,
  tax, total,
  isProcessing, processingError,
  handleApplyPromo, handleRemovePromo, handlePlaceOrder, onBackToCart,
}: CheckoutViewProps) {

  const [customPointsInput, setCustomPointsInput] = useState('');
  const [customPointsError, setCustomPointsError] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'affirm'>('stripe');

  const availablePoints = useMemo(() => {
    try {
      const stored: { id: string; total: number; date: string }[] = JSON.parse(localStorage.getItem('orders') ?? '[]');
      const storedIds = new Set(stored.map((o) => o.id));
      const filtered = mockOrders.filter((o) => !storedIds.has(o.id));
      const all = [...stored, ...filtered] as { id: string; total: number; date: string }[];
      const earned = calculatePointsFromOrders(all);
      const spent = getSpentPoints();
      return Math.max(0, earned - spent);
    } catch {
      return 0;
    }
  }, []);

  const maxRedeemablePoints = useMemo(() => {
    return clampRedemption(availablePoints, availablePoints, subtotal - promoDiscount);
  }, [availablePoints, subtotal, promoDiscount]);

  const presets = useMemo(() => {
    const steps: number[] = [];
    const increments = [500, 1000, 1500, 2000];
    for (const pts of increments) {
      if (pts <= maxRedeemablePoints) steps.push(pts);
    }
    if (maxRedeemablePoints > 0 && !steps.includes(maxRedeemablePoints)) {
      steps.push(maxRedeemablePoints);
    }
    return steps.slice(0, 4);
  }, [maxRedeemablePoints]);

  const subtotalAfterDiscount = subtotal - promoDiscount;
  const pendingPoints = Math.floor(subtotalAfterDiscount * POINTS_PER_DOLLAR);

  const tierAfterOrder = useMemo(() => {
    try {
      const stored: { id: string; total: number; date: string }[] = JSON.parse(localStorage.getItem('orders') ?? '[]');
      const storedIds = new Set(stored.map((o) => o.id));
      const filtered = mockOrders.filter((o) => !storedIds.has(o.id));
      const all = [...stored, ...filtered] as { id: string; total: number; date: string }[];
      const currentEarned = calculatePointsFromOrders(all);
      const currentNet = Math.max(0, currentEarned - getSpentPoints());
      const next = getNextTier(currentNet);
      if (!next) return null;
      const ptsToNext = next.min - currentNet;
      if (pendingPoints >= ptsToNext) return next;
      return null;
    } catch {
      return null;
    }
  }, [pendingPoints]);

  const handleApplyCustomPoints = () => {
    setCustomPointsError('');
    const raw = parseInt(customPointsInput, 10);
    if (isNaN(raw) || raw <= 0) {
      setCustomPointsError('Enter a valid number of points');
      return;
    }
    if (raw < MIN_REDEMPTION_POINTS) {
      setCustomPointsError(`Minimum is ${MIN_REDEMPTION_POINTS} pts`);
      return;
    }
    if (raw > availablePoints) {
      setCustomPointsError(`You only have ${availablePoints.toLocaleString()} pts available`);
      return;
    }
    const clamped = clampRedemption(
      Math.floor(raw / MIN_REDEMPTION_POINTS) * MIN_REDEMPTION_POINTS,
      availablePoints,
      subtotal - promoDiscount
    );
    onApplyPoints(clamped);
    setCustomPointsInput('');
    setShowCustomInput(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 cursor-pointer">
              <div className="flex flex-col gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-0.5 rounded-full bg-green-700" style={{ width: `${14 - i * 2}px` }}></div>
                ))}
              </div>
              <span className="text-xl font-bold text-gray-900">Classic Same Day Blinds</span>
            </Link>
            <h1 className="text-base font-semibold text-gray-700">Checkout</h1>
            <button
              onClick={onBackToCart}
              className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-arrow-left-line"></i>
              Back to Cart
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* LEFT: Form */}
          <div className="lg:col-span-3 space-y-6">

            {/* Step 1: Contact */}
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 flex items-center justify-center bg-green-700 text-white rounded-full text-xs font-bold">1</span>
                Contact Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">First Name *</label>
                  <input type="text" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })}
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 ${formErrors.firstName ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                    placeholder="John" />
                  {formErrors.firstName && <p className="text-xs text-red-500 mt-0.5">{formErrors.firstName}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Last Name *</label>
                  <input type="text" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })}
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 ${formErrors.lastName ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                    placeholder="Smith" />
                  {formErrors.lastName && <p className="text-xs text-red-500 mt-0.5">{formErrors.lastName}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Email *</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 ${formErrors.email ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                    placeholder="john@example.com" />
                  {formErrors.email && <p className="text-xs text-red-500 mt-0.5">{formErrors.email}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Phone *</label>
                  <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 ${formErrors.phone ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                    placeholder="(555) 000-0000" />
                  {formErrors.phone && <p className="text-xs text-red-500 mt-0.5">{formErrors.phone}</p>}
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Company <span className="font-normal text-gray-400">(optional)</span></label>
                  <input type="text" value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                    placeholder="Acme Property Management" />
                </div>
              </div>
            </div>

            {/* Sales Rep Reminder (if selected) */}
            {form.salesRep && (
              <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                <div className="w-8 h-8 flex items-center justify-center bg-green-600 rounded-full shrink-0">
                  <i className="ri-user-star-line text-white text-sm"></i>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-green-800">Assisted by <span className="text-green-700">{form.salesRep}</span></p>
                  <p className="text-xs text-green-600">Will be credited for this order</p>
                </div>
                <button
                  onClick={() => setForm({ ...form, salesRep: '' })}
                  className="text-xs text-green-600 hover:text-green-900 font-semibold cursor-pointer whitespace-nowrap underline underline-offset-2"
                >
                  Change
                </button>
              </div>
            )}

            {/* Step 2: Fulfillment */}
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 flex items-center justify-center bg-green-700 text-white rounded-full text-xs font-bold">2</span>
                Fulfillment Method
              </h2>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {(['delivery', 'pickup'] as const).map((m) => (
                  <button key={m} onClick={() => setDeliveryMethod(m)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer ${deliveryMethod === m ? 'border-green-700 bg-green-50' : 'border-gray-200 hover:border-green-300'}`}>
                    <div className="w-8 h-8 flex items-center justify-center">
                      <i className={`${m === 'delivery' ? 'ri-home-4-line' : 'ri-building-line'} text-2xl ${deliveryMethod === m ? 'text-green-700' : 'text-gray-400'}`}></i>
                    </div>
                    <span className={`text-sm font-bold ${deliveryMethod === m ? 'text-green-800' : 'text-gray-600'}`}>
                      {m === 'delivery' ? 'Property' : 'Warehouse Pickup'}
                    </span>
                    <span className="text-xs text-emerald-600 font-semibold">FREE</span>
                  </button>
                ))}
              </div>

              {deliveryMethod === 'delivery' && (
                <div className="space-y-3 pt-3 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Property Address</p>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Street Address *</label>
                    <input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                      className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 ${formErrors.address ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                      placeholder="123 Main St" />
                    {formErrors.address && <p className="text-xs text-red-500 mt-0.5">{formErrors.address}</p>}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1">
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">City *</label>
                      <input type="text" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}
                        className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 ${formErrors.city ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                        placeholder="Dallas" />
                      {formErrors.city && <p className="text-xs text-red-500 mt-0.5">{formErrors.city}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">State *</label>
                      <select value={form.state} onChange={e => setForm({ ...form, state: e.target.value })}
                        className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 bg-white cursor-pointer ${formErrors.state ? 'border-red-400' : 'border-gray-200'}`}>
                        <option value="">State</option>
                        {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      {formErrors.state && <p className="text-xs text-red-500 mt-0.5">{formErrors.state}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">ZIP *</label>
                      <input type="text" value={form.zip} onChange={e => setForm({ ...form, zip: e.target.value })}
                        className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 ${formErrors.zip ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                        placeholder="75201" />
                      {formErrors.zip && <p className="text-xs text-red-500 mt-0.5">{formErrors.zip}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Order Notes <span className="font-normal text-gray-400">(optional)</span></label>
                    <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                      rows={2} maxLength={500}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 resize-none"
                      placeholder="Special instructions..." />
                  </div>
                </div>
              )}

              {deliveryMethod === 'pickup' && (
                <div className="space-y-3 pt-3 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Warehouse Pickup Details</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">Pickup Person *</label>
                      <input type="text" value={pickupDetails.pickupName} onChange={e => setPickupDetails({ ...pickupDetails, pickupName: e.target.value })}
                        className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 ${pickupErrors.pickupName ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                        placeholder="John Smith" />
                      {pickupErrors.pickupName && <p className="text-xs text-red-500 mt-0.5">{pickupErrors.pickupName}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">Pickup Phone *</label>
                      <input type="tel" value={pickupDetails.pickupPhone} onChange={e => setPickupDetails({ ...pickupDetails, pickupPhone: e.target.value })}
                        className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 ${pickupErrors.pickupPhone ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                        placeholder="(555) 000-0000" />
                      {pickupErrors.pickupPhone && <p className="text-xs text-red-500 mt-0.5">{pickupErrors.pickupPhone}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">Pickup Date *</label>
                      <input type="date" value={pickupDetails.pickupDate} min={getTodayStr()}
                        onChange={e => setPickupDetails({ ...pickupDetails, pickupDate: e.target.value })}
                        className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 ${pickupErrors.pickupDate ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
                      {pickupErrors.pickupDate && <p className="text-xs text-red-500 mt-0.5">{pickupErrors.pickupDate}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">Pickup Time *</label>
                      <select value={pickupDetails.pickupTime} onChange={e => setPickupDetails({ ...pickupDetails, pickupTime: e.target.value })}
                        className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 bg-white cursor-pointer ${pickupErrors.pickupTime ? 'border-red-400' : 'border-gray-200'}`}>
                        <option value="">Select time</option>
                        {PICKUP_TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      {pickupErrors.pickupTime && <p className="text-xs text-red-500 mt-0.5">{pickupErrors.pickupTime}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Payment Method */}
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 flex items-center justify-center bg-green-700 text-white rounded-full text-xs font-bold">3</span>
                Payment Method
              </h2>

              {/* Payment method selector */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Stripe option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('stripe')}
                  className={`flex flex-col items-start gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer text-left ${
                    paymentMethod === 'stripe'
                      ? 'border-[#635bff] bg-[#f5f4ff]'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      paymentMethod === 'stripe' ? 'border-[#635bff] bg-[#635bff]' : 'border-gray-300'
                    }`}>
                      {paymentMethod === 'stripe' && <div className="w-2 h-2 rounded-full bg-white"></div>}
                    </div>
                    <span className="px-2 py-0.5 bg-[#635bff] rounded text-xs font-bold text-white tracking-wide">stripe</span>
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${paymentMethod === 'stripe' ? 'text-[#635bff]' : 'text-gray-700'}`}>
                      Pay by Card
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 leading-tight">
                      Visa, MC, Amex, Discover — secure Stripe checkout
                    </p>
                  </div>
                </button>

                {/* Affirm option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('affirm')}
                  className={`flex flex-col items-start gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer text-left ${
                    paymentMethod === 'affirm'
                      ? 'border-[#0FA0EA] bg-[#f0f9ff]'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      paymentMethod === 'affirm' ? 'border-[#0FA0EA] bg-[#0FA0EA]' : 'border-gray-300'
                    }`}>
                      {paymentMethod === 'affirm' && <div className="w-2 h-2 rounded-full bg-white"></div>}
                    </div>
                    <span className="px-2 py-0.5 bg-[#0FA0EA] rounded text-xs font-black text-white tracking-tight">affirm</span>
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${paymentMethod === 'affirm' ? 'text-[#0FA0EA]' : 'text-gray-700'}`}>
                      Pay Monthly
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 leading-tight">
                      Split into 3, 6, or 12 monthly payments
                    </p>
                  </div>
                </button>
              </div>

              {/* Stripe detail panel */}
              {paymentMethod === 'stripe' && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 flex items-center justify-center bg-[#635bff]/10 rounded-lg shrink-0">
                      <i className="ri-shield-check-line text-[#635bff] text-lg"></i>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Powered by Stripe</p>
                      <p className="text-xs text-gray-500">You'll be redirected to Stripe's secure checkout to complete payment</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Accepted Cards</p>
                    <div className="flex flex-wrap items-center gap-2">
                      {['VISA', 'MC', 'AMEX', 'DISCOVER'].map((brand) => (
                        <span key={brand} className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-bold text-gray-600 tracking-wide whitespace-nowrap">{brand}</span>
                      ))}
                      <span className="ml-auto flex items-center gap-1 text-xs text-green-700 font-semibold whitespace-nowrap">
                        <i className="ri-lock-fill text-sm"></i> 256-bit SSL
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Affirm detail panel */}
              {paymentMethod === 'affirm' && (
                <div className="bg-[#f0f9ff] rounded-xl p-4 border border-[#0FA0EA]/25 flex flex-col gap-4">
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 flex items-center justify-center bg-[#0FA0EA] rounded-lg shrink-0">
                      <i className="ri-calendar-check-line text-white text-lg"></i>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        Pay Monthly with <span className="text-[#0FA0EA] font-black">affirm</span>
                      </p>
                      <p className="text-xs text-gray-500">Split your ${total.toFixed(2)} order into easy monthly payments</p>
                    </div>
                  </div>

                  {/* Plan options */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Estimated monthly payments</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { months: 3,  apr: 0,    label: '0% APR' },
                        { months: 6,  apr: 0,    label: '0% APR' },
                        { months: 12, apr: 0.15, label: '10–30% APR' },
                      ].map((plan) => {
                        const r = plan.apr / 12;
                        const monthly = plan.apr === 0
                          ? total / plan.months
                          : (total * r * Math.pow(1 + r, plan.months)) / (Math.pow(1 + r, plan.months) - 1);
                        return (
                          <div key={plan.months} className="bg-white rounded-xl p-3 text-center border border-[#0FA0EA]/20">
                            <p className="text-xs text-gray-400 mb-1">{plan.months} months</p>
                            <p className="text-lg font-black text-gray-900">${monthly.toFixed(2)}</p>
                            <p className={`text-xs font-bold mt-0.5 ${plan.apr === 0 ? 'text-green-600' : 'text-amber-600'}`}>
                              {plan.label}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-1.5">
                    {[
                      { icon: 'ri-checkbox-circle-line', text: '0% APR available on 3 & 6 month plans' },
                      { icon: 'ri-shield-check-line',    text: 'No hidden fees — ever' },
                      { icon: 'ri-time-line',            text: 'Quick application — decision in seconds' },
                    ].map((b) => (
                      <div key={b.text} className="flex items-center gap-2 text-xs text-gray-600">
                        <div className="w-4 h-4 flex items-center justify-center text-[#0FA0EA] shrink-0">
                          <i className={b.icon}></i>
                        </div>
                        {b.text}
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <a
                    href="https://www.affirm.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-[#0FA0EA] hover:bg-[#0d8fd0] text-white font-bold text-sm transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <span>Apply with</span>
                    <span className="font-black tracking-tight text-base">affirm</span>
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-external-link-line text-sm"></i>
                    </div>
                  </a>
                  <p className="text-center text-xs text-gray-400 leading-relaxed -mt-1">
                    Subject to credit approval. Actual rates may vary. US residents only.
                  </p>
                </div>
              )}

              {processingError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 mt-3">
                  <div className="w-4 h-4 flex items-center justify-center text-red-500 shrink-0 mt-0.5">
                    <i className="ri-error-warning-line text-sm"></i>
                  </div>
                  <p className="text-xs text-red-700 font-medium">{processingError}</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-6 border border-gray-100 sticky top-6">
              <h2 className="text-base font-bold text-gray-900 mb-4">Order Summary</h2>

              {/* ── Loyalty Points Redemption Panel ── */}
              {availablePoints >= MIN_REDEMPTION_POINTS && (
                <div className={`mb-4 rounded-xl border-2 overflow-hidden transition-all ${appliedPoints > 0 ? 'border-emerald-400' : 'border-emerald-200'}`}>
                  {/* Panel header */}
                  <div className={`px-4 py-3 flex items-center gap-3 ${appliedPoints > 0 ? 'bg-emerald-500' : 'bg-emerald-50'}`}>
                    <div className={`w-8 h-8 flex items-center justify-center rounded-lg shrink-0 ${appliedPoints > 0 ? 'bg-white/20' : 'bg-emerald-100'}`}>
                      <i className={`ri-copper-coin-line text-lg ${appliedPoints > 0 ? 'text-white' : 'text-emerald-600'}`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold ${appliedPoints > 0 ? 'text-white' : 'text-emerald-800'}`}>
                        {appliedPoints > 0 ? (
                          <>{appliedPoints.toLocaleString()} pts applied — saving <span className="text-yellow-200">${pointsToDiscount(appliedPoints).toFixed(2)}</span></>
                        ) : (
                          <>You have <span className="text-emerald-700 font-extrabold">{availablePoints.toLocaleString()} pts</span> available</>
                        )}
                      </p>
                      <p className={`text-xs mt-0.5 ${appliedPoints > 0 ? 'text-emerald-100' : 'text-emerald-600'}`}>
                        {appliedPoints > 0
                          ? `${(availablePoints - appliedPoints).toLocaleString()} pts remaining after this order`
                          : `${POINTS_PER_REDEMPTION_DOLLAR} pts = $1.00 off · max $${pointsToDiscount(maxRedeemablePoints).toFixed(0)} off this order`}
                      </p>
                    </div>
                    {appliedPoints > 0 && (
                      <button
                        onClick={onRemovePoints}
                        className="shrink-0 px-2.5 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {/* Preset buttons (only when not yet applied) */}
                  {appliedPoints === 0 && (
                    <div className="px-4 py-3 bg-white space-y-3">
                      {/* Quick preset chips */}
                      {presets.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-400 font-semibold mb-2">Quick apply:</p>
                          <div className="flex flex-wrap gap-2">
                            {presets.map((pts) => (
                              <button
                                key={pts}
                                onClick={() => { onApplyPoints(pts); setShowCustomInput(false); }}
                                className="flex flex-col items-center px-3 py-2 bg-emerald-50 border-2 border-emerald-200 hover:border-emerald-500 hover:bg-emerald-100 rounded-xl text-emerald-800 transition-all cursor-pointer group"
                              >
                                <span className="text-xs font-extrabold group-hover:text-emerald-700">{pts.toLocaleString()} pts</span>
                                <span className="text-xs text-emerald-600 font-semibold">= ${pointsToDiscount(pts).toFixed(2)} off</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Custom amount input */}
                      {!showCustomInput ? (
                        <button
                          onClick={() => setShowCustomInput(true)}
                          className="text-xs text-emerald-700 font-semibold hover:text-emerald-900 underline underline-offset-2 cursor-pointer"
                        >
                          + Enter a custom amount
                        </button>
                      ) : (
                        <div className="space-y-1.5">
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={customPointsInput}
                              onChange={(e) => { setCustomPointsInput(e.target.value); setCustomPointsError(''); }}
                              onKeyDown={(e) => { if (e.key === 'Enter') handleApplyCustomPoints(); }}
                              min={MIN_REDEMPTION_POINTS}
                              max={maxRedeemablePoints}
                              step={MIN_REDEMPTION_POINTS}
                              placeholder={`${MIN_REDEMPTION_POINTS}–${maxRedeemablePoints}`}
                              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                            <button
                              onClick={handleApplyCustomPoints}
                              className="px-3 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 cursor-pointer whitespace-nowrap"
                            >
                              Apply
                            </button>
                            <button
                              onClick={() => { setShowCustomInput(false); setCustomPointsInput(''); setCustomPointsError(''); }}
                              className="px-2.5 py-2 bg-gray-100 text-gray-500 text-xs rounded-lg hover:bg-gray-200 cursor-pointer"
                            >
                              <i className="ri-close-line"></i>
                            </button>
                          </div>
                          {customPointsError && <p className="text-xs text-red-500">{customPointsError}</p>}
                          <p className="text-xs text-gray-400">Must be multiples of {MIN_REDEMPTION_POINTS}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-3 mb-5 max-h-56 overflow-y-auto pr-1">
                {cart.map(item => (
                  <div key={`${item.id}-${item.color}`} className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover object-top" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 line-clamp-1">{item.name}</p>
                      {(item.color || item.width) && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {item.color}{item.color && item.width && ' · '}{item.width && item.height && `${item.width}" × ${item.height}"`}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-bold text-gray-900 shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Promo */}
              <div className="border-t border-gray-100 pt-3 mb-4">
                {!showPromoInput && !appliedPromo && (
                  <button onClick={() => setShowPromoInput(true)} className="text-xs text-green-700 font-semibold hover:text-green-800 cursor-pointer">
                    + Add promo code
                  </button>
                )}
                {showPromoInput && !appliedPromo && (
                  <div className="flex gap-2">
                    <input type="text" value={promoCode} onChange={e => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="PROMO CODE"
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-600" />
                    <button onClick={handleApplyPromo} disabled={promoLoading}
                      className="px-3 py-2 bg-green-700 text-white text-xs font-bold rounded-lg hover:bg-green-800 cursor-pointer whitespace-nowrap disabled:opacity-60">
                      {promoLoading ? <i className="ri-loader-4-line animate-spin"></i> : 'Apply'}
                    </button>
                  </div>
                )}
                {promoError && <p className="text-xs text-red-500 mt-1">{promoError}</p>}
                {appliedPromo && (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <span className="text-xs font-bold text-green-700">{appliedPromo.code} — {Math.round(appliedPromo.discount * 100)}% off</span>
                    <button onClick={handleRemovePromo} className="text-xs text-red-500 hover:text-red-700 cursor-pointer">Remove</button>
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-2 border-t border-gray-100 pt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-700">Promo ({Math.round(appliedPromo.discount * 100)}% off)</span>
                    <span className="font-semibold text-green-700">-${promoDiscount.toFixed(2)}</span>
                  </div>
                )}
                {appliedPoints > 0 && (
                  <div className="flex justify-between text-sm items-center">
                    <span className="flex items-center gap-1.5 text-emerald-700">
                      <i className="ri-copper-coin-line text-xs"></i>
                      Points ({appliedPoints.toLocaleString()} pts)
                    </span>
                    <span className="font-bold text-emerald-700">-${pointsDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className="font-semibold text-emerald-600">FREE</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax (8.25%)</span>
                  <span className="font-semibold">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <span className="text-base font-bold text-gray-900">Total</span>
                  <div className="text-right">
                    <span className="text-xl font-bold text-gray-900">${total.toFixed(2)}</span>
                    {appliedPoints > 0 && (
                      <p className="text-xs text-emerald-600 font-semibold mt-0.5">
                        Saved ${pointsDiscount.toFixed(2)} with points!
                      </p>
                    )}
                  </div>
                </div>
                {pendingPoints > 0 && (
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 mt-1">
                    <div className="w-5 h-5 flex items-center justify-center shrink-0">
                      <i className="ri-copper-coin-line text-emerald-600 text-sm"></i>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-emerald-700">
                        Earn +{pendingPoints.toLocaleString()} pts with this order
                      </p>
                      {tierAfterOrder && (
                        <p className="text-xs text-emerald-600 mt-0.5">
                          This order unlocks <span className="font-bold">{tierAfterOrder.name}</span> tier!
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {paymentMethod === 'stripe' ? (
                <button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className="w-full mt-5 py-4 bg-green-700 text-white font-bold rounded-xl hover:bg-green-800 transition-colors cursor-pointer whitespace-nowrap text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <i className="ri-loader-4-line animate-spin text-base"></i>
                      Redirecting to Stripe...
                    </>
                  ) : (
                    <>
                      <i className="ri-lock-line"></i>
                      Pay Securely — ${total.toFixed(2)}
                    </>
                  )}
                </button>
              ) : (
                <a
                  href="https://www.affirm.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full mt-5 py-4 bg-[#0FA0EA] hover:bg-[#0d8fd0] text-white font-bold rounded-xl transition-colors cursor-pointer whitespace-nowrap text-sm flex items-center justify-center gap-2"
                >
                  <i className="ri-calendar-check-line text-base"></i>
                  Continue with <span className="font-black tracking-tight text-base">affirm</span>
                  <span className="font-normal opacity-80">— ${total.toFixed(2)}</span>
                </a>
              )}

              <div className="mt-4 space-y-2">
                {[
                  { icon: 'ri-lock-line', text: 'Secure & encrypted checkout via Stripe' },
                  { icon: 'ri-shield-check-line', text: '3-Year Warranty included' },
                  { icon: 'ri-refresh-line', text: '30-Day hassle-free returns' },
                ].map(b => (
                  <div key={b.text} className="flex items-center gap-2 text-xs text-gray-500">
                    <div className="w-4 h-4 flex items-center justify-center text-green-700 shrink-0"><i className={b.icon}></i></div>
                    {b.text}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}