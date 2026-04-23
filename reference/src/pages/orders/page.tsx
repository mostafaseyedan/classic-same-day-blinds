import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category?: string;
  color?: string;
  mount?: string;
  width?: string;
  height?: string;
  size?: string;
}

interface CustomerInfo {
  firstName: string;
  lastName: string;
  fullName: string;
  companyName?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  notes?: string;
}

interface Order {
  id: string;
  customerName?: string;
  email?: string;
  customer?: CustomerInfo;
  date: string;
  total: number;
  subtotal?: number;
  shipping?: number;
  tax?: number;
  promoDiscount?: number;
  promoCode?: string;
  paymentMethod?: 'stripe' | 'cash' | 'in-person';
  stripeSessionId?: string;
  status: 'Pending' | 'Fulfilled & Shipped' | 'Delivered' | 'Cancelled';
  fulfilledAt?: string;
  trackingNumber?: string;
  items: OrderItem[];
}

interface Review {
  orderId: string;
  itemId: number;
  itemName: string;
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: string; label: string }> = {
  'Pending': { color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200', icon: 'ri-time-line', label: 'Pending' },
  'Working on Order': { color: 'text-sky-700', bg: 'bg-sky-50 border-sky-200', icon: 'ri-tools-line', label: 'Working on Order' },
  'Fulfilled & Shipped': { color: 'text-teal-700', bg: 'bg-teal-50 border-teal-200', icon: 'ri-truck-line', label: 'Shipped' },
  'Delivered': { color: 'text-green-700', bg: 'bg-green-50 border-green-200', icon: 'ri-checkbox-circle-fill', label: 'Delivered' },
  'Cancelled': { color: 'text-red-700', bg: 'bg-red-50 border-red-200', icon: 'ri-close-circle-line', label: 'Cancelled' },
};

const STEPS = ['Order Placed', 'Processing', 'Working on Order', 'Shipped', 'Delivered'];

function getStepIndex(status: string): number {
  switch (status) {
    case 'Pending': return 1;
    case 'Working on Order': return 2;
    case 'Fulfilled & Shipped': return 3;
    case 'Delivered': return 4;
    case 'Cancelled': return -1;
    default: return 0;
  }
}

function OrderProgressBar({ status }: { status: string }) {
  const step = getStepIndex(status);
  if (status === 'Cancelled') {
    return (
      <div className="flex items-center gap-2 mt-3">
        <div className="flex items-center gap-1.5 text-red-600">
          <i className="ri-close-circle-fill text-base"></i>
          <span className="text-xs font-semibold">Order Cancelled</span>
        </div>
      </div>
    );
  }
  return (
    <div className="mt-4">
      <div className="flex items-center gap-0">
        {STEPS.map((label, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  done ? 'bg-green-600 border-green-600 text-white'
                  : active ? 'bg-white border-green-600 text-green-700'
                  : 'bg-white border-gray-200 text-gray-400'
                }`}>
                  {done ? <i className="ri-check-line text-sm"></i> : <span>{i + 1}</span>}
                </div>
                <span className={`text-xs mt-1 font-medium whitespace-nowrap ${
                  done || active ? 'text-gray-700' : 'text-gray-400'
                }`}>{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 mb-4 rounded-full ${done ? 'bg-green-500' : 'bg-gray-200'}`}></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ReorderToast({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  useEffect(() => {
    if (visible) {
      const t = setTimeout(onClose, 3500);
      return () => clearTimeout(t);
    }
  }, [visible, onClose]);

  if (!visible) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-gray-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl animate-fade-in">
      <div className="w-7 h-7 flex items-center justify-center bg-emerald-500 rounded-full flex-shrink-0">
        <i className="ri-shopping-cart-2-fill text-sm"></i>
      </div>
      <div>
        <p className="text-sm font-bold">Items added to cart!</p>
        <p className="text-xs text-gray-400">Your cart has been updated with this order's items.</p>
      </div>
      <Link
        to="/cart"
        className="ml-2 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer"
      >
        View Cart
      </Link>
      <button onClick={onClose} className="ml-1 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white cursor-pointer">
        <i className="ri-close-line text-base"></i>
      </button>
    </div>
  );
}

function StarRating({ rating, onChange }: { rating: number; onChange?: (r: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHovered(star)}
          onMouseLeave={() => onChange && setHovered(0)}
          className={`text-2xl transition-colors ${onChange ? 'cursor-pointer' : 'cursor-default'} ${
            star <= (hovered || rating) ? 'text-amber-400' : 'text-gray-300'
          }`}
        >
          <i className="ri-star-fill"></i>
        </button>
      ))}
    </div>
  );
}

function ReviewModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const { currentUser } = useAuth();
  const [ratings, setRatings] = useState<Record<number, number>>({});
  const [comments, setComments] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    const existing: Review[] = JSON.parse(localStorage.getItem('productReviews') ?? '[]');
    const newReviews: Review[] = order.items.map((item) => ({
      orderId: order.id,
      itemId: item.id,
      itemName: item.name,
      rating: ratings[item.id] ?? 5,
      comment: comments[item.id] ?? '',
      date: new Date().toISOString(),
      reviewerName: currentUser?.displayName ?? order.customer?.fullName ?? 'Customer',
    }));
    // Remove old reviews for same order to avoid duplicates
    const filtered = existing.filter((r) => r.orderId !== order.id);
    localStorage.setItem('productReviews', JSON.stringify([...filtered, ...newReviews]));
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Write a Review</h2>
            <p className="text-xs text-gray-500 mt-0.5">Order {order.id}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>

        {submitted ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <i className="ri-checkbox-circle-fill text-3xl text-green-600"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Thank you for your feedback!</h3>
            <p className="text-sm text-gray-500 mb-6">Your review helps other customers make better decisions.</p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer whitespace-nowrap"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {order.items.map((item) => (
                <div key={item.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover object-top" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{item.name}</p>
                      {item.color && <p className="text-xs text-gray-500">Color: {item.color}</p>}
                    </div>
                  </div>
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-600 mb-1.5">Your Rating</p>
                    <StarRating
                      rating={ratings[item.id] ?? 0}
                      onChange={(r) => setRatings((prev) => ({ ...prev, [item.id]: r }))}
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1.5">Your Review <span className="text-gray-400 font-normal">(optional)</span></p>
                    <textarea
                      rows={3}
                      maxLength={500}
                      placeholder="Share your experience with this product..."
                      value={comments[item.id] ?? ''}
                      onChange={(e) => setComments((prev) => ({ ...prev, [item.id]: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none bg-white"
                    />
                    <p className="text-xs text-gray-400 text-right mt-1">{(comments[item.id] ?? '').length}/500</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={order.items.some((item) => !ratings[item.id])}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-send-plane-line text-sm"></i>
                Submit Review
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function OrderCard({ order, onExpand, expanded, onReorder, onReview }: { order: Order; onExpand: () => void; expanded: boolean; onReorder: (order: Order) => void; onReview: (order: Order) => void }) {
  const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG['Pending'];
  const customerEmail = order.customer?.email ?? order.email ?? '';
  const isDelivered = order.status === 'Delivered';
  const isPaidStripe = order.paymentMethod === 'stripe';

  // Check if already reviewed
  const existingReviews: Review[] = JSON.parse(localStorage.getItem('productReviews') ?? '[]');
  const alreadyReviewed = existingReviews.some((r) => r.orderId === order.id);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
      {/* Card Header */}
      <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${cfg.bg} flex-shrink-0`}>
            <i className={`${cfg.icon} text-lg ${cfg.color}`}></i>
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-base font-bold text-gray-900">{order.id}</h3>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.color}`}>
                <i className={cfg.icon}></i>
                {order.status}
              </span>
              {isPaidStripe && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700">
                  <i className="ri-secure-payment-line text-xs"></i>
                  Paid via Stripe
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              Placed on {new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            {customerEmail && (
              <p className="text-xs text-gray-400 mt-0.5">{customerEmail}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 sm:flex-col sm:items-end">
          <div className="text-right">
            <p className="text-xs text-gray-400 font-medium">Order Total</p>
            <p className="text-xl font-bold text-gray-900">${order.total.toFixed(2)}</p>
            {isPaidStripe && (
              <p className="text-xs text-emerald-600 font-semibold mt-0.5 flex items-center justify-end gap-1">
                <i className="ri-checkbox-circle-fill text-xs"></i> Payment confirmed
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {isDelivered && (
              <button
                onClick={() => onReview(order)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                title={alreadyReviewed ? 'Update your review' : 'Leave a product review'}
              >
                <i className={`${alreadyReviewed ? 'ri-star-fill' : 'ri-star-line'} text-sm`}></i>
                {alreadyReviewed ? 'Edit Review' : 'Write a Review'}
              </button>
            )}
            <button
              onClick={() => onReorder(order)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-refresh-line text-sm"></i>
              Reorder
            </button>
            <button
              onClick={onExpand}
              className="flex items-center gap-1.5 text-sm font-semibold text-green-700 hover:text-green-900 transition-colors cursor-pointer whitespace-nowrap"
            >
              {expanded ? (
                <><i className="ri-arrow-up-s-line text-base"></i> Hide Details</>
              ) : (
                <><i className="ri-arrow-down-s-line text-base"></i> View Details</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
        <OrderProgressBar status={order.status} />
        {order.status === 'Fulfilled & Shipped' && order.trackingNumber && (
          <div className="mt-3 inline-flex items-center gap-2 bg-white border border-teal-200 rounded-lg px-3 py-1.5">
            <i className="ri-barcode-line text-teal-600 text-sm"></i>
            <span className="text-xs font-semibold text-gray-600">Tracking:</span>
            <span className="text-xs font-mono font-bold text-teal-700">{order.trackingNumber}</span>
          </div>
        )}
        {order.status === 'Fulfilled & Shipped' && order.fulfilledAt && (
          <p className="text-xs text-teal-600 mt-2 font-medium">
            <i className="ri-truck-line mr-1"></i>
            Shipped on {new Date(order.fulfilledAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        )}
        {isDelivered && !alreadyReviewed && (
          <div className="mt-3 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <i className="ri-star-line text-amber-500 text-sm"></i>
            <span className="text-xs text-amber-700 font-medium">Your order was delivered! Share your experience.</span>
            <button
              onClick={() => onReview(order)}
              className="ml-auto text-xs font-bold text-amber-700 hover:text-amber-900 underline cursor-pointer whitespace-nowrap"
            >
              Write a Review
            </button>
          </div>
        )}
      </div>

      {/* Items Preview */}
      <div className="px-6 py-4">
        <div className="flex items-center gap-3 flex-wrap">
          {order.items.slice(0, 3).map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover object-top" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-800 leading-tight">{item.name}</p>
                <p className="text-xs text-gray-400">\u00d7{item.quantity}</p>
              </div>
            </div>
          ))}
          {order.items.length > 3 && (
            <span className="text-xs text-gray-400 font-medium">+{order.items.length - 3} more</span>
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-gray-100">
          {/* Full Items List */}
          <div className="px-6 py-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <i className="ri-shopping-bag-3-line text-green-600"></i>
                Items Ordered
              </h4>
              <button
                onClick={() => onReorder(order)}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-shopping-cart-2-line text-sm"></i>
                Add All to Cart
              </button>
            </div>
            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover object-top" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900">{item.name}</p>
                    {item.category && (
                      <p className="text-xs text-green-700 font-semibold uppercase tracking-wide mt-0.5 capitalize">
                        {item.category.replace('-', ' ')}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
                      {item.color && <span className="text-xs text-gray-500"><span className="font-semibold text-gray-700">Color:</span> {item.color}</span>}
                      {item.mount && <span className="text-xs text-gray-500"><span className="font-semibold text-gray-700">Mount:</span> {item.mount}</span>}
                      {item.width && item.height && <span className="text-xs text-gray-500"><span className="font-semibold text-gray-700">Size:</span> {item.width}&quot; \u00d7 {item.height}&quot;</span>}
                      {item.size && !item.width && <span className="text-xs text-gray-500"><span className="font-semibold text-gray-700">Size:</span> {item.size}</span>}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">${item.price.toFixed(2)} \u00d7 {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price Breakdown + Payment + Shipping */}
          <div className="px-6 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Shipping Address */}
            {order.customer?.address && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <i className="ri-map-pin-2-line text-green-600"></i>
                  Shipping Address
                </h4>
                <p className="text-sm font-semibold text-gray-900">{order.customer.fullName}</p>
                {order.customer.companyName && <p className="text-sm text-gray-600">{order.customer.companyName}</p>}
                <p className="text-sm text-gray-600 mt-1">{order.customer.address}</p>
                <p className="text-sm text-gray-600">{order.customer.city}, {order.customer.state} {order.customer.zip}</p>
              </div>
            )}

            {/* Price Breakdown */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <i className="ri-receipt-line text-green-600"></i>
                Price Breakdown
              </h4>
              <div className="space-y-2">
                {order.subtotal !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-medium text-gray-800">${order.subtotal.toFixed(2)}</span>
                  </div>
                )}
                {order.promoDiscount !== undefined && order.promoDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-600">
                      Discount{order.promoCode ? ` (${order.promoCode})` : ''}
                    </span>
                    <span className="font-medium text-emerald-600">-${order.promoDiscount.toFixed(2)}</span>
                  </div>
                )}
                {order.shipping !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Shipping</span>
                    <span className={`font-medium ${order.shipping === 0 ? 'text-green-600' : 'text-gray-800'}`}>
                      {order.shipping === 0 ? 'FREE' : `$${order.shipping.toFixed(2)}`}
                    </span>
                  </div>
                )}
                {order.tax !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tax (8.25%)</span>
                    <span className="font-medium text-gray-800">${order.tax.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-sm font-bold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-gray-900">${order.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment method row */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-semibold">Payment</span>
                  {isPaidStripe ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                      <i className="ri-secure-payment-line"></i>
                      Paid via Stripe
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 border border-gray-200 text-gray-600 text-xs font-semibold">
                      <i className="ri-money-dollar-circle-line"></i>
                      {order.paymentMethod === 'in-person' ? 'Pay in Person' : 'Manual / Invoice'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.customer?.notes && (
            <div className="px-6 pb-5">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                  <i className="ri-sticky-note-line"></i>
                  Order Notes
                </h4>
                <p className="text-sm text-amber-900">{order.customer.notes}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function OrderHistoryPage() {
  const { currentUser, isLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showReorderToast, setShowReorderToast] = useState(false);
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!isLoading && !currentUser) {
      navigate('/auth?returnUrl=/orders');
    }
  }, [currentUser, isLoading, navigate]);

  useEffect(() => {
    try {
      const stored: Order[] = JSON.parse(localStorage.getItem('orders') ?? '[]');
      // Apply any admin status overrides
      const overrides: Record<string, string> = JSON.parse(
        localStorage.getItem('order_status_overrides') ?? '{}'
      );
      const withOverrides = stored.map((o) =>
        overrides[o.id] ? { ...o, status: overrides[o.id] as Order['status'] } : o
      );
      const userEmail = currentUser?.email?.toLowerCase() ?? '';
      const userOrders = withOverrides.filter((o) => {
        const orderEmail = (o.customer?.email ?? o.email ?? '').toLowerCase();
        return userEmail && orderEmail === userEmail;
      });
      setOrders(userOrders.length > 0 ? userOrders : withOverrides);
    } catch {
      setOrders([]);
    }
  }, [currentUser]);

  const handleReorder = useCallback((order: Order) => {
    const newOrderId = `ORD-${Date.now().toString().slice(-8)}`;
    const now = new Date().toISOString();

    const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = parseFloat((subtotal * 0.0825).toFixed(2));
    const total = parseFloat((subtotal + tax).toFixed(2));

    const confirmationData = {
      orderId: newOrderId,
      orderDate: now,
      deliveryMethod: 'delivery',
      customerEmail: currentUser?.email ?? order.customer?.email ?? order.email ?? 'customer@example.com',
      items: order.items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.quantity,
        category: item.category ?? 'Window Treatments',
        color: item.color ?? '',
        mount: item.mount ?? '',
        width: item.width ?? '',
        height: item.height ?? '',
      })),
      subtotal,
      shipping: 0,
      tax,
      total,
      isReorder: true,
      originalOrderId: order.id,
    };

    // Save new order to localStorage — mark as reorder so admin Reorders tab picks it up
    const existingOrders: any[] = JSON.parse(localStorage.getItem('orders') ?? '[]');
    existingOrders.unshift({
      id: newOrderId,
      date: now,
      status: 'Working on Order',
      total,
      subtotal,
      shipping: 0,
      tax,
      isReorder: true,
      originalOrderId: order.id,
      customer: {
        fullName: currentUser?.name ?? order.customer?.fullName ?? 'Customer',
        firstName: order.customer?.firstName ?? (currentUser?.name ?? '').split(' ')[0] ?? '',
        lastName: order.customer?.lastName ?? (currentUser?.name ?? '').split(' ').slice(1).join(' ') ?? '',
        email: currentUser?.email ?? order.customer?.email ?? order.email ?? '',
        companyName: order.customer?.companyName ?? '',
        phone: order.customer?.phone ?? '',
        address: order.customer?.address ?? '',
        city: order.customer?.city ?? '',
        state: order.customer?.state ?? '',
        zip: order.customer?.zip ?? '',
      },
      items: confirmationData.items,
    });
    localStorage.setItem('orders', JSON.stringify(existingOrders));

    navigate('/order-confirmation', { state: confirmationData });
  }, [currentUser, navigate]);

  const filtered = orders.filter((o) => {
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchSearch =
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.customer?.fullName ?? o.customerName ?? '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'Pending' || o.status === 'Working on Order').length,
    shipped: orders.filter((o) => o.status === 'Fulfilled & Shipped').length,
    delivered: orders.filter((o) => o.status === 'Delivered').length,
    paidOnline: orders.filter((o) => o.paymentMethod === 'stripe').length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <i className="ri-loader-4-line text-4xl text-emerald-600 animate-spin"></i>
          <p className="mt-4 text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/account" className="flex items-center gap-2 text-gray-700 hover:text-emerald-600 transition-colors cursor-pointer">
              <i className="ri-arrow-left-line text-xl"></i>
              <span className="font-semibold text-sm">My Account</span>
            </Link>
            <Link to="/" className="text-base font-bold text-gray-900">Classic Same Day Blinds</Link>
            <Link to="/cart" className="flex items-center gap-1.5 text-gray-600 hover:text-emerald-600 transition-colors cursor-pointer">
              <i className="ri-shopping-cart-line text-xl"></i>
              <span className="text-sm font-medium hidden sm:inline">Cart</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Order History</h1>
          <p className="text-gray-500 text-sm">Track and review all your past and current orders</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Orders', val: stats.total, icon: 'ri-shopping-bag-3-line', color: 'text-gray-600', bg: 'bg-gray-100' },
            { label: 'In Progress', val: stats.pending, icon: 'ri-time-line', color: 'text-yellow-600', bg: 'bg-yellow-50' },
            { label: 'Shipped', val: stats.shipped, icon: 'ri-truck-line', color: 'text-teal-600', bg: 'bg-teal-50' },
            { label: 'Paid Online', val: stats.paidOnline, icon: 'ri-secure-payment-line', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.bg} flex-shrink-0`}>
                <i className={`${s.icon} text-lg ${s.color}`}></i>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{s.val}</p>
                <p className="text-xs text-gray-500 font-medium">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <i className="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base"></i>
            <input
              type="text"
              placeholder="Search by order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'Pending', 'Working on Order', 'Fulfilled & Shipped', 'Delivered', 'Cancelled'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === s
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                {s === 'all' ? 'All Orders' : s}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <i className="ri-shopping-bag-line text-4xl text-gray-400"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {orders.length === 0 ? 'No orders yet' : 'No orders match your filter'}
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              {orders.length === 0
                ? 'Once you place an order, it will appear here with live status updates.'
                : 'Try changing your filter or search term.'}
            </p>
            {orders.length === 0 && (
              <Link
                to="/#products"
                className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors whitespace-nowrap cursor-pointer"
              >
                <i className="ri-store-2-line"></i>
                Browse Products
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {filtered.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                expanded={expandedId === order.id}
                onExpand={() => setExpandedId(expandedId === order.id ? null : order.id)}
                onReorder={handleReorder}
                onReview={setReviewOrder}
              />
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        {orders.length > 0 && (
          <div className="mt-10 bg-white rounded-2xl border border-gray-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-gray-900">Need help with an order?</p>
              <p className="text-xs text-gray-500 mt-0.5">Our team is ready to assist you with any questions.</p>
            </div>
            <div className="flex gap-3">
              <a
                href="tel:18005051905"
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl text-sm transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-phone-line"></i>
                1-800-505-1905
              </a>
              <Link
                to="/#products"
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-add-circle-line"></i>
                New Order
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Reorder Toast */}
      <ReorderToast visible={showReorderToast} onClose={() => setShowReorderToast(false)} />

      {/* Review Modal */}
      {reviewOrder && (
        <ReviewModal order={reviewOrder} onClose={() => setReviewOrder(null)} />
      )}
    </div>
  );
}
