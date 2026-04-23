import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const THRESHOLD_MINUTES = 10;

interface AbandonedCartBannerProps {
  language: string;
}

interface StoredCartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export default function AbandonedCartBanner({ language }: AbandonedCartBannerProps) {
  const [visible, setVisible] = useState(false);
  const [itemCount, setItemCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [firstItem, setFirstItem] = useState<StoredCartItem | null>(null);
  const [minutesAgo, setMinutesAgo] = useState(0);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('abandoned_cart_dismissed');
    if (dismissed) return;

    const cartData: StoredCartItem[] = JSON.parse(localStorage.getItem('cart') ?? '[]');
    if (cartData.length === 0) return;

    const updatedAt = parseInt(localStorage.getItem('cart_updated_at') ?? '0', 10);
    if (updatedAt === 0) return;

    const elapsed = (Date.now() - updatedAt) / (1000 * 60);
    if (elapsed < THRESHOLD_MINUTES) return;

    const count = cartData.reduce((sum, item) => sum + item.quantity, 0);
    const total = cartData.reduce((sum, item) => sum + item.price * item.quantity, 0);

    setItemCount(count);
    setCartTotal(total);
    setFirstItem(cartData[0]);
    setMinutesAgo(Math.round(elapsed));
    setVisible(true);
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem('abandoned_cart_dismissed', '1');
    setVisible(false);
  };

  if (!visible || itemCount === 0) return null;

  const timeLabel = minutesAgo >= 60
    ? `${Math.round(minutesAgo / 60)}h ago`
    : `${minutesAgo}m ago`;

  return (
    <div className="fixed bottom-6 right-6 z-40 max-w-sm w-full animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
        {/* Green accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-green-500 to-emerald-600"></div>

        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Product thumbnail */}
            {firstItem && (
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
                <img src={firstItem.image} alt={firstItem.name} className="w-full h-full object-cover object-top" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-0.5 flex items-center gap-1">
                    <i className="ri-time-line text-xs"></i>
                    {language === 'es' ? `Carrito abandonado hace ${timeLabel}` : `Cart left ${timeLabel}`}
                  </p>
                  <p className="text-sm font-bold text-gray-900 leading-snug">
                    {language === 'es'
                      ? `Tienes ${itemCount} artículo${itemCount !== 1 ? 's' : ''} esperándote`
                      : `You have ${itemCount} item${itemCount !== 1 ? 's' : ''} waiting`}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {language === 'es' ? 'Total estimado' : 'Est. total'}: <span className="font-semibold text-gray-800">${cartTotal.toFixed(2)}</span>
                  </p>
                </div>
                <button
                  onClick={handleDismiss}
                  className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer shrink-0 -mt-0.5 -mr-0.5"
                >
                  <i className="ri-close-line text-base"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mt-3">
            <Link
              to="/cart"
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-green-700 hover:bg-green-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-shopping-cart-line text-sm"></i>
              {language === 'es' ? 'Completar pedido' : 'Complete order'}
            </Link>
            <button
              onClick={handleDismiss}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              {language === 'es' ? 'Ahora no' : 'Not now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
