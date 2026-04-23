import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';

// ── Types ──────────────────────────────────────────────────────────────────
interface OrderItem {
  id: number | string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  width?: string;
  height?: string;
}

interface FoundOrder {
  id: string;
  date: string;
  status: string;
  total: number;
  items: OrderItem[];
  trackingNumber?: string;
  fulfilledAt?: string;
  customer: {
    firstName?: string;
    lastName?: string;
    email?: string;
    fullName?: string;
  };
  deliveryMethod?: 'delivery' | 'pickup';
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
}

// ── Status timeline configuration ─────────────────────────────────────────
const TIMELINE_STEPS = [
  {
    keys: ['Pending', 'Working on Order', 'Ready for Pickup', 'Fulfilled & Shipped', 'Delivered'],
    label: 'Order Placed',
    icon: 'ri-file-check-line',
  },
  {
    keys: ['Working on Order', 'Ready for Pickup', 'Fulfilled & Shipped', 'Delivered'],
    label: 'Being Prepared',
    icon: 'ri-tools-line',
  },
  {
    keys: ['Ready for Pickup', 'Fulfilled & Shipped', 'Delivered'],
    label: 'Shipped / Ready',
    icon: 'ri-truck-line',
  },
  {
    keys: ['Delivered'],
    label: 'Delivered',
    icon: 'ri-checkbox-circle-line',
  },
];

function getStepState(stepKeys: string[], currentStatus: string): 'completed' | 'active' | 'upcoming' {
  if (stepKeys.includes(currentStatus)) {
    if (stepKeys[0] === currentStatus || stepKeys.length === 1) return 'active';
    return 'completed';
  }
  // Check if current status is "after" this step
  const allStatuses = ['Pending', 'Working on Order', 'Ready for Pickup', 'Fulfilled & Shipped', 'Delivered'];
  const currentIdx = allStatuses.indexOf(currentStatus);
  const stepIdx = allStatuses.indexOf(stepKeys[stepKeys.length - 1]);
  if (currentIdx > stepIdx) return 'completed';
  return 'upcoming';
}

function getStatusMeta(status: string): { color: string; bg: string; border: string; icon: string; label: string; description: string } {
  switch (status) {
    case 'Pending':
      return { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: 'ri-time-line', label: 'Pending', description: 'Your order has been received and is in the queue.' };
    case 'Working on Order':
      return { color: 'text-sky-700', bg: 'bg-sky-50', border: 'border-sky-200', icon: 'ri-tools-line', label: 'Being Prepared', description: 'Our team is actively working on your order.' };
    case 'Ready for Pickup':
      return { color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', icon: 'ri-store-2-line', label: 'Ready for Pickup', description: 'Your order is ready and waiting at our store!' };
    case 'Fulfilled & Shipped':
      return { color: 'text-teal-700', bg: 'bg-teal-50', border: 'border-teal-200', icon: 'ri-truck-line', label: 'Shipped', description: 'Your order is on its way to you.' };
    case 'Delivered':
      return { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'ri-checkbox-circle-line', label: 'Delivered', description: 'Your order has been delivered. Enjoy your new blinds!' };
    case 'Cancelled':
      return { color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', icon: 'ri-close-circle-line', label: 'Cancelled', description: 'This order has been cancelled. Contact us if you have questions.' };
    case 'Refunded':
      return { color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200', icon: 'ri-arrow-go-back-line', label: 'Refunded', description: 'A refund has been processed. Please allow 5–10 business days for it to appear.' };
    default:
      return { color: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-200', icon: 'ri-question-line', label: status, description: 'Your order status has been updated.' };
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function TrackOrderPage() {
  const [searchParams] = useSearchParams();

  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState<FoundOrder | null>(null);
  const [searchState, setSearchState] = useState<'idle' | 'searching' | 'found' | 'not_found' | 'wrong_email'>('idle');

  // Pre-fill from URL
  useEffect(() => {
    const idFromUrl = searchParams.get('id');
    const emailFromUrl = searchParams.get('email');
    if (idFromUrl) setOrderId(idFromUrl);
    if (emailFromUrl) setEmail(emailFromUrl);
  }, [searchParams]);

  function handleSearch() {
    const trimmedId = orderId.trim();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedId || !trimmedEmail) return;

    setSearchState('searching');
    setOrder(null);

    setTimeout(() => {
      try {
        // Load orders from localStorage
        const stored: any[] = JSON.parse(localStorage.getItem('orders') ?? '[]');
        // Load admin status overrides
        const overrides: Record<string, string> = JSON.parse(localStorage.getItem('order_status_overrides') ?? '{}');

        const raw = stored.find((o) => o.id === trimmedId);

        if (!raw) {
          setSearchState('not_found');
          return;
        }

        // Verify email
        const orderEmail = (raw.customer?.email ?? raw.email ?? '').toLowerCase();
        if (orderEmail && orderEmail !== trimmedEmail) {
          setSearchState('wrong_email');
          return;
        }

        // Normalize
        const status = overrides[raw.id] ?? (raw.status === 'placed' || raw.status === 'Processing' ? 'Working on Order' : raw.status ?? 'Pending');
        const found: FoundOrder = {
          id: raw.id,
          date: raw.date,
          status,
          total: raw.total ?? 0,
          items: (raw.items ?? []).map((item: any) => ({
            id: item.id,
            name: item.name,
            image: item.image ?? '',
            price: item.price,
            quantity: item.quantity,
            size: item.size ?? (item.width && item.height ? `${item.width}" x ${item.height}"` : ''),
            color: item.color,
          })),
          trackingNumber: raw.trackingNumber,
          fulfilledAt: raw.fulfilledAt,
          customer: raw.customer ?? {},
          deliveryMethod: raw.deliveryMethod,
          address: raw.address,
          city: raw.city,
          state: raw.state,
          zip: raw.zip,
        };

        setOrder(found);
        setSearchState('found');
      } catch {
        setSearchState('not_found');
      }
    }, 900);
  }

  function handleReset() {
    setSearchState('idle');
    setOrder(null);
  }

  const isTerminal = order?.status === 'Cancelled' || order?.status === 'Refunded';
  const meta = order ? getStatusMeta(order.status) : null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 pt-[calc(2.25rem+1.75rem+3.5rem+2.75rem)] sm:pt-[calc(2.75rem+1.75rem+3.5rem+2.75rem)] pb-24">
        {/* ── Hero strip ── */}
        <div className="bg-gradient-to-br from-slate-900 to-emerald-900 py-16 px-4 text-center mb-12">
          <div className="max-w-2xl mx-auto">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <i className="ri-map-pin-2-line text-white text-3xl"></i>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">Track Your Order</h1>
            <p className="text-emerald-200 text-base">Enter your order ID and email to see your real-time order status, shipping updates, and tracking info.</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 space-y-6">

          {/* ── Search card ── */}
          {searchState !== 'found' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8">
              <h2 className="text-lg font-bold text-slate-900 mb-1">Look up your order</h2>
              <p className="text-sm text-slate-500 mb-6">Both fields are required to verify your identity and protect your order info.</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Order ID</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-slate-400">
                      <i className="ri-hashtag text-base"></i>
                    </div>
                    <input
                      type="text"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="e.g. ORD-10001"
                      className="w-full text-sm border border-slate-200 focus:border-emerald-500 rounded-xl pl-9 pr-4 py-3 outline-none text-slate-800 placeholder-slate-400 font-mono"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">Found in your order confirmation email</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Email Address</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-slate-400">
                      <i className="ri-mail-line text-base"></i>
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="The email used when placing the order"
                      className="w-full text-sm border border-slate-200 focus:border-emerald-500 rounded-xl pl-9 pr-4 py-3 outline-none text-slate-800 placeholder-slate-400"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSearch}
                  disabled={!orderId.trim() || !email.trim() || searchState === 'searching'}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-sm font-bold transition-colors whitespace-nowrap"
                >
                  {searchState === 'searching' ? (
                    <><i className="ri-loader-4-line animate-spin text-base"></i> Searching...</>
                  ) : (
                    <><i className="ri-search-line text-base"></i> Track My Order</>
                  )}
                </button>
              </div>

              {/* Error states */}
              {searchState === 'not_found' && (
                <div className="mt-5 bg-red-50 border border-red-200 rounded-xl px-4 py-3.5 flex items-start gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                    <i className="ri-error-warning-line text-red-600 text-base"></i>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-red-700">Order not found</p>
                    <p className="text-xs text-red-600 mt-0.5">We couldn't find an order with ID <strong className="font-mono">{orderId}</strong>. Please double-check and try again.</p>
                  </div>
                </div>
              )}

              {searchState === 'wrong_email' && (
                <div className="mt-5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3.5 flex items-start gap-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                    <i className="ri-shield-keyhole-line text-amber-600 text-base"></i>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-amber-700">Email doesn't match</p>
                    <p className="text-xs text-amber-600 mt-0.5">The email address you entered doesn't match what's on file for this order. Please use the email you checked out with.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Order found ── */}
          {searchState === 'found' && order && meta && (
            <div className="space-y-5">
              {/* Back button */}
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <i className="ri-arrow-left-line"></i>
                Search another order
              </button>

              {/* Status hero card */}
              <div className={`rounded-2xl border-2 ${meta.border} ${meta.bg} p-6`}>
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${meta.bg} border ${meta.border}`}>
                    <i className={`${meta.icon} text-2xl ${meta.color}`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${meta.bg} ${meta.border} ${meta.color}`}>
                        <i className={`${meta.icon} text-xs`}></i>
                        {meta.label}
                      </span>
                    </div>
                    <p className={`text-sm ${meta.color} font-medium leading-relaxed`}>{meta.description}</p>
                    <div className="flex items-center gap-4 mt-3 flex-wrap">
                      <span className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                        <i className="ri-hashtag text-slate-400"></i>
                        <span className="font-mono">{order.id}</span>
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-slate-500">
                        <i className="ri-calendar-line text-slate-400"></i>
                        Placed {formatDate(order.date)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Progress timeline (for non-terminal statuses) ── */}
              {!isTerminal && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">Order Progress</p>
                  <div className="relative">
                    {/* Connecting line */}
                    <div className="absolute top-6 left-6 right-6 h-0.5 bg-slate-100" style={{ zIndex: 0 }}></div>
                    <div className="flex justify-between relative">
                      {TIMELINE_STEPS.map((step, idx) => {
                        const state = getStepState(step.keys, order.status);
                        const isCompleted = state === 'completed';
                        const isActive = state === 'active';
                        return (
                          <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center z-10 border-2 transition-all ${
                                isCompleted
                                  ? 'bg-emerald-600 border-emerald-600 text-white'
                                  : isActive
                                  ? 'bg-white border-emerald-500 text-emerald-600'
                                  : 'bg-white border-slate-200 text-slate-400'
                              }`}
                            >
                              {isCompleted ? (
                                <i className="ri-check-line text-lg"></i>
                              ) : (
                                <i className={`${step.icon} text-lg`}></i>
                              )}
                            </div>
                            <p
                              className={`text-xs font-semibold text-center leading-tight ${
                                isActive ? 'text-emerald-700' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                              }`}
                            >
                              {step.label}
                              {isActive && (
                                <span className="block mt-0.5 text-emerald-500 font-bold">← Now</span>
                              )}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Tracking number card ── */}
              {order.trackingNumber && order.status === 'Fulfilled & Shipped' && (
                <div className="bg-teal-50 border-2 border-teal-200 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                      <i className="ri-truck-line text-teal-600 text-xl"></i>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-teal-800">Your package is on the way</p>
                      {order.fulfilledAt && <p className="text-xs text-teal-600">Shipped on {formatDate(order.fulfilledAt)}</p>}
                    </div>
                  </div>
                  <div className="bg-white border border-teal-200 rounded-xl px-5 py-4 text-center mb-4">
                    <p className="text-xs font-bold text-teal-700 uppercase tracking-widest mb-2">Tracking Number</p>
                    <p className="font-mono text-xl font-bold text-slate-900 tracking-widest">{order.trackingNumber}</p>
                  </div>
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(order.trackingNumber)}`}
                    target="_blank"
                    rel="nofollow noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-bold transition-colors whitespace-nowrap"
                  >
                    <i className="ri-external-link-line"></i>
                    Track Package Online →
                  </a>
                </div>
              )}

              {/* ── Delivery address (if delivery) ── */}
              {order.deliveryMethod === 'delivery' && order.address && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Shipping Address</p>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                      <i className="ri-map-pin-line text-slate-500 text-base"></i>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed font-medium">
                      {order.address}<br />
                      {order.city}, {order.state} {order.zip}
                    </p>
                  </div>
                </div>
              )}

              {/* ── Order items ── */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                  Order Items ({order.items.length})
                </p>
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={`${item.id}-${idx}`} className="flex items-center gap-4 py-3 border-b border-slate-50 last:border-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-14 h-14 rounded-lg object-cover object-top shrink-0 border border-slate-100"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                          <i className="ri-image-line text-slate-400 text-xl"></i>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{item.name}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          {item.size && <span className="text-xs text-slate-500">{item.size}</span>}
                          {item.color && <span className="text-xs text-slate-500">· {item.color}</span>}
                          <span className="text-xs text-slate-500">· Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-slate-900 shrink-0">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100">
                  <span className="text-sm font-semibold text-slate-600">Order Total</span>
                  <span className="text-lg font-bold text-emerald-700">
                    ${order.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* ── Help section ── */}
              <div className="bg-slate-900 rounded-2xl p-6 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-sm font-bold text-white mb-0.5">Questions about your order?</p>
                  <p className="text-xs text-slate-400">We're here to help — reach out anytime</p>
                </div>
                <Link
                  to="/#contact"
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold whitespace-nowrap transition-colors"
                >
                  <i className="ri-customer-service-2-line"></i>
                  Contact Support
                </Link>
              </div>
            </div>
          )}

          {/* ── Tips when idle ── */}
          {searchState === 'idle' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: 'ri-mail-check-line', title: 'Check your email', desc: 'Your order ID was sent to you in the confirmation email right after purchase.' },
                { icon: 'ri-shield-check-line', title: 'Secure lookup', desc: 'We verify your email to make sure only you can access your order details.' },
                { icon: 'ri-refresh-line', title: 'Real-time status', desc: 'Our team updates your order status as it moves through each stage of fulfillment.' },
              ].map((tip) => (
                <div key={tip.title} className="bg-white rounded-xl border border-slate-200 p-5 text-center">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <i className={`${tip.icon} text-emerald-600 text-xl`}></i>
                  </div>
                  <p className="text-sm font-bold text-slate-900 mb-1">{tip.title}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{tip.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
