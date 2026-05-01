import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  calculatePointsFromOrders,
  getTier,
  getSpentPoints,
  POINTS_PER_DOLLAR,
  LoyaltyTier,
  recordCheckoutRedemption,
} from '../../utils/loyaltyPoints';
import {
  getOrCreateReferralCode,
  buildReferralUrl,
  REFERRAL_BONUS_POINTS,
} from '../../utils/referralProgram';

const SUPABASE_URL = import.meta.env.VITE_PUBLIC_SUPABASE_URL as string;

interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  category: string;
  color?: string;
  mount?: string;
  width?: string;
  height?: string;
}

interface OrderData {
  orderId: string;
  orderDate: string;
  deliveryMethod: 'delivery' | 'pickup';
  pickupDetails?: {
    pickupName: string;
    pickupPhone: string;
    pickupDate: string;
    pickupTime: string;
  };
  customerEmail: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  isReorder?: boolean;
  originalOrderId?: string;
  salesRep?: string;
}

const MXN_RATE = 17.5;

function formatPrice(usd: number, language: string) {
  if (language === 'es') {
    const mxn = (usd * MXN_RATE).toFixed(2);
    return (
      <span className="flex flex-col items-end leading-tight">
        <span>${usd.toFixed(2)} <span className="text-xs font-normal text-gray-400">USD</span></span>
        <span className="text-xs text-green-700 font-semibold">$ {Number(mxn).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
      </span>
    );
  }
  return <span>${usd.toFixed(2)}</span>;
}

export default function OrderConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [pickupLocation, setPickupLocation] = useState<string>('');
  const [printed, setPrinted] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [tierUpgrade, setTierUpgrade] = useState<{ from: LoyaltyTier; to: LoyaltyTier } | null>(null);
  const [showTierCelebration, setShowTierCelebration] = useState(false);
  const [referralLinkCopied, setReferralLinkCopied] = useState(false);
  const [pointsRedeemed, setPointsRedeemed] = useState(0);

  // Derived referral info (computed once order is known)
  const referralCode = getOrCreateReferralCode(orderData?.customerEmail ?? 'guest');
  const referralUrl = buildReferralUrl(referralCode);

  function isReferralNudgeEnabled(): boolean {
    try {
      const prefs: Record<string, boolean> = JSON.parse(localStorage.getItem('notification_preferences') ?? '{}');
      return prefs['referral_post_order'] !== false; // default true
    } catch {
      return true;
    }
  }

  function sendReferralNudgeEmail(order: OrderData, code: string, url: string) {
    if (!isReferralNudgeEnabled()) return;
    const customerName = order.customerEmail.split('@')[0];
    fetch(`${SUPABASE_URL}/functions/v1/send-order-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'referral_nudge',
        customerName,
        customerEmail: order.customerEmail,
        orderId: order.orderId,
        referralCode: code,
        referralUrl: url,
        bonusPoints: REFERRAL_BONUS_POINTS,
      }),
    }).catch(() => {});
  }

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const orderId = searchParams.get('order_id');
    const savedLocation = localStorage.getItem('pickup_location') ??
      'Classic Same Day Blinds — DFW Area Warehouse\nPlease contact us for the exact address.';
    setPickupLocation(savedLocation);

    if (sessionId && orderId) {
      const raw = localStorage.getItem(`pending_order_${orderId}`);
      if (!raw) { navigate('/'); return; }

      const order = JSON.parse(raw);
      order.status = 'Working on Order';
      order.paymentMethod = 'stripe';
      order.stripeSessionId = sessionId;

      const existing: { id: string; total: number; date: string }[] = JSON.parse(localStorage.getItem('orders') ?? '[]');

      const prevEarned = calculatePointsFromOrders(existing);
      const prevNet = Math.max(0, prevEarned - getSpentPoints());
      const prevTier = getTier(prevNet);

      existing.unshift(order);
      localStorage.setItem('orders', JSON.stringify(existing));
      localStorage.setItem('cart', '[]');
      localStorage.removeItem(`pending_order_${orderId}`);

      // Record checkout points redemption if any were applied
      if (order.pointsRedeemed && order.pointsRedeemed > 0) {
        recordCheckoutRedemption(order.id, order.pointsRedeemed, order.pointsDiscount ?? 0);
        setPointsRedeemed(order.pointsRedeemed);
      }

      const newEarned = calculatePointsFromOrders(existing);
      const newNet = Math.max(0, newEarned - getSpentPoints());
      const newTier = getTier(newNet);

      const earned = Math.floor(order.total * POINTS_PER_DOLLAR);
      setPointsEarned(earned);

      if (newTier.name !== prevTier.name) {
        setTierUpgrade({ from: prevTier, to: newTier });
        setTimeout(() => setShowTierCelebration(true), 800);
      }

      const confirmed: OrderData = {
        orderId: order.id,
        orderDate: order.date,
        deliveryMethod: order.deliveryMethod,
        pickupDetails: order.pickupDetails ?? undefined,
        customerEmail: order.customer.email,
        items: order.items,
        subtotal: order.subtotal,
        shipping: order.shipping,
        tax: order.tax,
        total: order.total,
        salesRep: order.customer?.salesRep ?? undefined,
      };
      setOrderData(confirmed);

      const customerName = `${order.customer.firstName} ${order.customer.lastName}`.trim();
      const refCode = getOrCreateReferralCode(order.customer.email);
      const refUrl = buildReferralUrl(refCode);

      fetch(`${SUPABASE_URL}/functions/v1/send-order-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'order_confirmation',
          orderId: order.id,
          customerName,
          customerEmail: order.customer.email,
          deliveryMethod: order.deliveryMethod,
          address: order.customer.address,
          city: order.customer.city,
          state: order.customer.state,
          zip: order.customer.zip,
          items: order.items,
          subtotal: order.subtotal,
          tax: order.tax,
          shipping: order.shipping,
          total: order.total,
          stripeSessionId: sessionId,
        }),
      }).catch(() => {});

      // Send referral nudge email after a short delay
      setTimeout(() => {
        sendReferralNudgeEmail(confirmed, refCode, refUrl);
      }, 3000);

      return;
    }

    const data = location.state as OrderData | undefined;
    if (!data) { navigate('/'); return; }
    setOrderData(data);

    const earned = Math.floor(data.total * POINTS_PER_DOLLAR);
    setPointsEarned(earned);

    // Send referral nudge for navigate-state orders too
    const refCode = getOrCreateReferralCode(data.customerEmail);
    const refUrl = buildReferralUrl(refCode);
    setTimeout(() => {
      sendReferralNudgeEmail(data, refCode, refUrl);
    }, 3000);
  }, [location.state, searchParams, navigate]);

  if (!orderData) return null;

  const isReorder = orderData.isReorder === true;

  const formattedDate = orderData.pickupDetails?.pickupDate
    ? new Date(orderData.pickupDetails.pickupDate + 'T12:00:00').toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
    : '';

  const formattedOrderDate = new Date(orderData.orderDate).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });

  const handlePrint = () => {
    setPrinted(true);
    setTimeout(() => {
      window.print();
      setPrinted(false);
    }, 100);
  };

  const handleCopyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setReferralLinkCopied(true);
      setTimeout(() => setReferralLinkCopied(false), 2500);
    } catch {
      setReferralLinkCopied(false);
    }
  };

  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(`Hey! I just ordered custom blinds from Classic Same Day Blinds — same-day delivery in DFW! Use my link to get 10% off your first order: ${referralUrl}`)}`;
  const emailShareUrl = `mailto:?subject=${encodeURIComponent('Get 10% off custom blinds — Classic Same Day Blinds')}&body=${encodeURIComponent(`Hey!\n\nI just ordered custom window blinds from Classic Same Day Blinds and they're amazing. Use my referral link to get 10% off your first order:\n\n${referralUrl}\n\nThey even do same-day delivery in the DFW area!\n\nEnjoy!`)}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-100 print:hidden">
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
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 font-semibold rounded-lg text-sm hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-printer-line"></i>
                Print Receipt
              </button>
              <Link
                to="/orders"
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg text-sm hover:bg-emerald-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-file-list-3-line"></i>
                My Orders
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <div className={`text-white py-12 print:py-6 ${isReorder ? 'bg-gradient-to-br from-emerald-600 to-teal-700' : 'bg-gradient-to-br from-green-600 to-emerald-700'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 print:hidden">
            <i className={`text-white text-5xl ${isReorder ? 'ri-refresh-line' : 'ri-checkbox-circle-fill'}`}></i>
          </div>
          <h1 className="text-4xl font-bold mb-3">
            {isReorder ? 'Reorder Placed Successfully!' : (language === 'es' ? '¡Pedido Confirmado!' : 'Order Confirmed!')}
          </h1>
          <p className="text-green-100 text-lg mb-2">
            {isReorder
              ? `Reorder based on Order ${orderData.originalOrderId}`
              : (language === 'es' ? 'Gracias por tu pedido' : 'Thank you for your order')}
          </p>
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
            <span className="text-sm font-medium text-green-100">Order ID:</span>
            <span className="text-lg font-bold">{orderData.orderId}</span>
          </div>
          <p className="text-green-100 text-sm mt-3">{formattedOrderDate}</p>
          {pointsEarned > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/30 px-5 py-2.5 rounded-full">
              <i className="ri-copper-coin-line text-yellow-300 text-lg"></i>
              <span className="text-sm font-bold text-white">
                +{pointsEarned.toLocaleString()} pts earned from this order
              </span>
              <Link to="/account" className="ml-1 text-xs font-semibold text-yellow-200 underline underline-offset-2 hover:text-white transition-colors whitespace-nowrap cursor-pointer">
                View Rewards
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Tier Upgrade Celebration Banner */}
      {showTierCelebration && tierUpgrade && (
        <div className="print:hidden">
          <div className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 border-b-4 border-amber-500 px-4 py-5">
            <div className="max-w-4xl mx-auto flex items-center gap-5">
              <div className="relative shrink-0">
                <div className="w-16 h-16 flex items-center justify-center bg-white rounded-full shadow-sm">
                  <i className={`${tierUpgrade.to.icon} text-3xl text-amber-500`}></i>
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 flex items-center justify-center bg-emerald-500 rounded-full">
                  <i className="ri-arrow-up-line text-white text-xs font-bold"></i>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-amber-900 uppercase tracking-wide mb-0.5">Tier Upgrade!</p>
                <h3 className="text-xl font-bold text-amber-900">
                  Welcome to <span className="text-amber-700">{tierUpgrade.to.name}</span>!
                </h3>
                <p className="text-sm text-amber-800 mt-0.5">
                  You leveled up from <strong>{tierUpgrade.from.name}</strong> to <strong>{tierUpgrade.to.name}</strong> — enjoy{' '}
                  <strong>{tierUpgrade.to.multiplier}x</strong> points on every future order!
                </p>
              </div>
              <div className="shrink-0 flex flex-col items-end gap-2">
                <Link
                  to="/account"
                  className="px-4 py-2 bg-amber-700 text-white text-sm font-bold rounded-lg hover:bg-amber-800 transition-colors cursor-pointer whitespace-nowrap"
                >
                  View Rewards
                </Link>
                <button
                  onClick={() => setShowTierCelebration(false)}
                  className="text-xs text-amber-700 hover:text-amber-900 cursor-pointer font-semibold"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 print:py-4">

        {/* Reorder Banner */}
        {isReorder && (
          <div className="mb-8 bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-6 flex items-start gap-4">
            <div className="w-12 h-12 flex items-center justify-center bg-emerald-500 rounded-xl flex-shrink-0">
              <i className="ri-refresh-line text-white text-2xl"></i>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-emerald-900 mb-1">Reorder Confirmed</h2>
              <p className="text-sm text-emerald-800">
                Your reorder based on <strong>{orderData.originalOrderId}</strong> has been placed and is now being processed. You'll receive a confirmation email shortly.
              </p>
            </div>
          </div>
        )}

        {/* Invoice / Receipt Card */}
        <div className="mb-8 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Invoice Header */}
          <div className="bg-gray-50 border-b border-gray-200 px-8 py-6 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <i className="ri-file-text-line text-emerald-600 text-xl"></i>
                <h2 className="text-xl font-bold text-gray-900">{isReorder ? 'Purchase Receipt' : 'Order Invoice'}</h2>
              </div>
              <p className="text-sm text-gray-500">Classic Same Day Blinds · DFW Area, Texas</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Invoice #</p>
              <p className="text-lg font-bold text-gray-900">{orderData.orderId}</p>
              <p className="text-xs text-gray-500 mt-1">{new Date(orderData.orderDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>

          {/* Billed To + Order Info */}
          <div className="px-8 py-6 grid grid-cols-2 gap-8 border-b border-gray-100">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Billed To</p>
              <p className="text-sm font-semibold text-gray-900">{orderData.customerEmail}</p>
              <p className="text-sm text-gray-500 mt-1">
                {orderData.deliveryMethod === 'pickup' ? 'In-Store Pickup' : 'Standard Delivery'}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Order Details</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500 w-24">Order Date:</span>
                  <span className="font-semibold text-gray-800">{new Date(orderData.orderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500 w-24">Status:</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold rounded-full">
                    <i className="ri-time-line text-xs"></i> Processing
                  </span>
                </div>
                {isReorder && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500 w-24">Based On:</span>
                    <span className="font-semibold text-emerald-700">{orderData.originalOrderId}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500 w-24">Items:</span>
                  <span className="font-semibold text-gray-800">{orderData.items.reduce((s, i) => s + i.quantity, 0)} units</span>
                </div>
                {orderData.salesRep && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500 w-24">Assisted by:</span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 text-green-800 text-xs font-bold rounded-full">
                      <i className="ri-user-star-line text-green-600"></i>
                      {orderData.salesRep}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="px-8 py-6">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider pb-3">Product</th>
                  <th className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider pb-3">Qty</th>
                  <th className="text-right text-xs font-bold text-gray-400 uppercase tracking-wider pb-3">Unit Price</th>
                  <th className="text-right text-xs font-bold text-gray-400 uppercase tracking-wider pb-3">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orderData.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 print:hidden">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover object-top" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{item.name}</p>
                          <p className="text-xs text-emerald-700 font-medium uppercase">{item.category}</p>
                          {(item.color || item.mount || (item.width && item.height)) && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              {item.color && <span>{item.color}</span>}
                              {item.color && item.mount && <span> · </span>}
                              {item.mount && <span>{item.mount}</span>}
                              {item.width && item.height && <span> · {item.width}&quot; × {item.height}&quot;</span>}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-center">
                      <span className="text-sm font-bold text-gray-900">{item.quantity}</span>
                    </td>
                    <td className="py-4 text-right">
                      <span className="text-sm font-semibold text-gray-700">${item.price.toFixed(2)}</span>
                    </td>
                    <td className="py-4 text-right">
                      <span className="text-sm font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Price Totals */}
          <div className="px-8 pb-8">
            <div className="ml-auto w-72 space-y-2 border-t border-gray-200 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-semibold text-gray-800">${orderData.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span className="font-semibold text-emerald-600">FREE</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax (8.25%)</span>
                <span className="font-semibold text-gray-800">${orderData.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-300">
                <span className="text-base font-bold text-gray-900">Total Charged</span>
                <span className="text-2xl font-bold text-emerald-700">${orderData.total.toFixed(2)}</span>
              </div>
              {language === 'es' && (
                <div className="flex justify-between text-sm text-gray-500">
                  <span>MXN Equivalent</span>
                  <span className="font-semibold text-green-700">${(orderData.total * MXN_RATE).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
                </div>
              )}
              {pointsEarned > 0 && (
                <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mt-2">
                  <div className="w-8 h-8 flex items-center justify-center bg-emerald-100 rounded-lg shrink-0">
                    <i className="ri-copper-coin-line text-emerald-600 text-base"></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-emerald-800">
                      +{pointsEarned.toLocaleString()} reward points earned!
                    </p>
                    <p className="text-xs text-emerald-600 mt-0.5">
                      Added to your balance ·{' '}
                      <Link to="/account" className="underline underline-offset-1 hover:text-emerald-800 cursor-pointer">
                        View Rewards
                      </Link>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pickup Details */}
        {orderData.deliveryMethod === 'pickup' && orderData.pickupDetails && (
          <div className="mb-8 bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-300 rounded-2xl p-8 shadow-sm">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 flex items-center justify-center bg-orange-500 rounded-xl flex-shrink-0">
                <i className="ri-store-2-fill text-white text-2xl"></i>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Pickup Details</h2>
                <p className="text-sm text-orange-800">Your order will be ready for pickup at the selected date and time</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-orange-200">
                <p className="text-xs font-bold text-orange-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <i className="ri-user-line"></i> Pickup Person
                </p>
                <p className="text-lg font-bold text-gray-900 mb-1">{orderData.pickupDetails.pickupName}</p>
                <p className="text-sm text-gray-600 flex items-center gap-1.5">
                  <i className="ri-phone-line text-orange-600"></i>
                  {orderData.pickupDetails.pickupPhone}
                </p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-orange-200">
                <p className="text-xs font-bold text-orange-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <i className="ri-calendar-line"></i> Date &amp; Time
                </p>
                <p className="text-lg font-bold text-gray-900 mb-1">{formattedDate}</p>
                <p className="text-sm text-gray-600 flex items-center gap-1.5">
                  <i className="ri-time-line text-orange-600"></i>
                  {orderData.pickupDetails.pickupTime}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Pickup Location */}
        {orderData.deliveryMethod === 'pickup' && (
          <div className="mb-8 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 flex items-center justify-center bg-green-600 rounded-xl flex-shrink-0">
                <i className="ri-map-pin-fill text-white text-2xl"></i>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Pickup Location</h2>
                <p className="text-base text-gray-700 whitespace-pre-line leading-relaxed font-medium">{pickupLocation}</p>
              </div>
            </div>
          </div>
        )}

        {/* What to Bring */}
        {orderData.deliveryMethod === 'pickup' && (
          <div className="mb-8 bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 flex items-center justify-center bg-blue-100 rounded-xl flex-shrink-0">
                <i className="ri-checkbox-multiple-line text-blue-600 text-2xl"></i>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-1">What to Bring</h2>
                <p className="text-sm text-gray-600">Please bring the following items when picking up your order</p>
              </div>
            </div>
            <div className="space-y-4">
              {[
                { icon: 'ri-mail-line', title: 'Confirmation Email or Order ID', desc: `Show this email or mention your Order ID: ${orderData.orderId}` },
                { icon: 'ri-id-card-line', title: 'Valid Photo ID', desc: `ID must match the pickup name: ${orderData.pickupDetails?.pickupName}` },
                { icon: 'ri-bank-card-line', title: 'Payment Card (if applicable)', desc: 'The card used for payment, if verification is required' },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4 bg-gray-50 rounded-xl p-4">
                  <div className="w-10 h-10 flex items-center justify-center bg-green-100 rounded-lg flex-shrink-0">
                    <i className={`${item.icon} text-green-700 text-lg`}></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900 mb-1">{item.title}</p>
                    <p className="text-xs text-gray-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Important Note */}
        {orderData.deliveryMethod === 'pickup' && (
          <div className="mb-8 bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 flex items-start gap-4">
            <div className="w-10 h-10 flex items-center justify-center bg-yellow-400 rounded-lg flex-shrink-0">
              <i className="ri-alarm-warning-line text-yellow-900 text-xl"></i>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-yellow-900 mb-1">Important Note</p>
              <p className="text-sm text-yellow-800 leading-relaxed">
                Orders must be picked up within 7 business days. If you need to reschedule, please contact us as soon as possible.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap shadow-sm"
          >
            <i className="ri-printer-line text-xl"></i>
            Print / Save Receipt
          </button>
          {isReorder && (
            <Link
              to="/account"
              className="flex-1 inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer whitespace-nowrap shadow-sm"
            >
              <i className="ri-user-line text-xl"></i>
              My Account
            </Link>
          )}
          <Link
            to={`/track-order?id=${orderData.orderId}`}
            className="flex-1 inline-flex items-center justify-center gap-2 px-8 py-4 bg-green-700 text-white font-bold rounded-xl hover:bg-green-800 transition-colors cursor-pointer whitespace-nowrap shadow-sm"
          >
            <i className="ri-map-pin-line text-xl"></i>
            Track This Order
          </Link>
          <Link
            to="/"
            className="flex-1 inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-home-line text-xl"></i>
            Continue Shopping
          </Link>
        </div>

        {/* ── Share & Earn Referral Card ── */}
        <div className="mt-8 bg-gradient-to-br from-rose-50 via-white to-emerald-50 border-2 border-rose-100 rounded-2xl overflow-hidden print:hidden">
          {/* Card header */}
          <div className="bg-gradient-to-r from-rose-500 to-pink-500 px-8 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center bg-white/20 rounded-xl">
                <i className="ri-gift-line text-white text-xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Share & Earn Bonus Points</h3>
                <p className="text-rose-100 text-xs mt-0.5">Your order is confirmed — now invite a friend!</p>
              </div>
            </div>
            <div className="bg-white/20 border border-white/30 rounded-full px-4 py-1.5">
              <span className="text-white text-sm font-bold">+{REFERRAL_BONUS_POINTS} pts / friend</span>
            </div>
          </div>

          <div className="px-8 py-6">
            {/* Value props row */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { icon: 'ri-links-line', label: 'Share your link', sub: 'Copy or send directly' },
                { icon: 'ri-percent-line', label: 'They get 10% off', sub: 'On their first order' },
                { icon: 'ri-copper-coin-line', label: `You earn ${REFERRAL_BONUS_POINTS} pts`, sub: 'When they place an order' },
              ].map((v) => (
                <div key={v.label} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                  <div className="w-10 h-10 flex items-center justify-center bg-rose-50 rounded-lg mx-auto mb-2">
                    <i className={`${v.icon} text-rose-500 text-lg`}></i>
                  </div>
                  <p className="text-xs font-bold text-gray-800">{v.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{v.sub}</p>
                </div>
              ))}
            </div>

            {/* Referral code + copy */}
            <div className="bg-white border-2 border-dashed border-rose-200 rounded-xl p-5 mb-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 text-center">Your Referral Code</p>
              <p className="text-center font-mono text-2xl font-black text-gray-900 tracking-widest mb-3">{referralCode}</p>
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg border border-gray-200 px-4 py-2.5">
                <span className="flex-1 text-xs text-gray-600 font-mono truncate">{referralUrl}</span>
                <button
                  onClick={handleCopyReferralLink}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    referralLinkCopied
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-rose-500 text-white hover:bg-rose-600'
                  }`}
                >
                  <i className={referralLinkCopied ? 'ri-checkbox-circle-line' : 'ri-clipboard-line'}></i>
                  {referralLinkCopied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Share buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-1">Share via:</p>
              <a
                href={whatsappShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 bg-[#25d366] text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap"
              >
                <i className="ri-whatsapp-line text-base"></i>
                WhatsApp
              </a>
              <a
                href={emailShareUrl}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-700 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-mail-send-line text-base"></i>
                Email
              </a>
              <Link
                to="/account"
                className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-rose-200 text-rose-600 text-sm font-bold rounded-xl hover:bg-rose-50 transition-colors cursor-pointer whitespace-nowrap ml-auto"
              >
                <i className="ri-user-heart-line text-base"></i>
                View My Referrals
              </Link>
            </div>

            <p className="text-xs text-gray-400 mt-4 text-center">
              A referral reminder email has been sent to {orderData.customerEmail} ·{' '}
              <Link to="/account" className="text-gray-500 underline hover:text-gray-700 cursor-pointer">
                Manage notification preferences
              </Link>
            </p>
          </div>
        </div>

        {/* Email Confirmation Notice */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6 text-center print:hidden">
          <div className="w-12 h-12 flex items-center justify-center bg-blue-100 rounded-full mx-auto mb-3">
            <i className="ri-mail-check-line text-blue-600 text-2xl"></i>
          </div>
          <p className="text-sm text-blue-900 font-semibold mb-1">Confirmation Sent</p>
          <p className="text-xs text-blue-800">
            A confirmation email has been sent to <strong>{orderData.customerEmail}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}