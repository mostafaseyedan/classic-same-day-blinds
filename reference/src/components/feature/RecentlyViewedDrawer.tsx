import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  rating: number;
  category: string;
  badge: string | null;
  image: string;
}

interface RecentlyViewedDrawerProps {
  allProducts: Product[];
  currentProductId: number;
  language?: string;
}

const badgeColors: Record<string, string> = {
  'Best Seller': 'bg-green-700 text-white',
  'Sale': 'bg-red-500 text-white',
  'Top Rated': 'bg-emerald-600 text-white',
  'New': 'bg-sky-500 text-white',
  'Smart Home': 'bg-indigo-500 text-white',
  'Eco-Friendly': 'bg-green-600 text-white',
  'Popular': 'bg-green-800 text-white',
  'Light & Airy': 'bg-teal-500 text-white',
  'Outdoor': 'bg-stone-600 text-white',
  'Value Pick': 'bg-gray-600 text-white',
  'Best Value': 'bg-orange-500 text-white',
  'Customer Favorite': 'bg-rose-500 text-white',
};

export default function RecentlyViewedDrawer({ allProducts, currentProductId, language = 'en' }: RecentlyViewedDrawerProps) {
  const [recentIds, setRecentIds] = useState<number[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const load = () => {
      const stored = localStorage.getItem('recently_viewed');
      const ids: number[] = stored ? JSON.parse(stored) : [];
      const filtered = ids.filter((id) => id !== currentProductId).slice(0, 8);
      setRecentIds(filtered);
      if (filtered.length > 0 && !isDismissed) {
        // Slide in after a short delay
        const timer = setTimeout(() => setIsOpen(true), 1200);
        return () => clearTimeout(timer);
      }
    };
    load();
  }, [currentProductId, isDismissed]);

  const recentProducts = recentIds
    .map((id) => allProducts.find((p) => p.id === id))
    .filter((p): p is Product => p !== undefined);

  if (recentProducts.length === 0 || isDismissed) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 transition-transform duration-500 ease-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
    >
      {/* Collapsed tab when manually closed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-semibold px-4 py-2 rounded-t-lg flex items-center gap-2 cursor-pointer whitespace-nowrap hover:bg-gray-800 transition-colors"
        >
          <i className="ri-history-line"></i>
          {language === 'es' ? `${recentProducts.length} Vistos Recientemente` : `${recentProducts.length} Recently Viewed`}
          <i className="ri-arrow-up-line"></i>
        </button>
      )}

      <div className="bg-white border-t border-gray-200 shadow-2xl">
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 flex items-center justify-center text-green-700">
              <i className="ri-history-line text-base"></i>
            </div>
            <span className="text-sm font-bold text-gray-900">
              {language === 'es' ? 'Vistos Recientemente' : 'Recently Viewed'}
            </span>
            <span className="text-xs text-gray-400 font-normal">
              ({recentProducts.length})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1 cursor-pointer transition-colors"
              title="Collapse"
            >
              <i className="ri-arrow-down-line text-sm"></i>
              {language === 'es' ? 'Minimizar' : 'Minimize'}
            </button>
            <button
              onClick={() => { setIsDismissed(true); setIsOpen(false); }}
              className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-full cursor-pointer transition-colors ml-1"
              title="Close"
            >
              <i className="ri-close-line text-base"></i>
            </button>
          </div>
        </div>

        {/* Products row */}
        <div className="flex items-start gap-3 px-6 py-4 overflow-x-auto scrollbar-hide">
          {recentProducts.map((product) => {
            const hasDiscount = product.price < product.originalPrice;
            return (
              <button
                key={product.id}
                onClick={() => navigate(`/product/${product.id}`)}
                className="flex-shrink-0 w-36 text-left group cursor-pointer"
              >
                <div className="relative w-36 h-24 rounded-lg overflow-hidden bg-gray-50 mb-2 border border-gray-100 group-hover:border-green-300 transition-colors">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.badge && (
                    <span className={`absolute top-1.5 left-1.5 text-xs font-bold px-1.5 py-0.5 rounded-full text-[10px] ${badgeColors[product.badge] ?? 'bg-gray-700 text-white'}`}>
                      {product.badge}
                    </span>
                  )}
                  {hasDiscount && (
                    <span className="absolute top-1.5 right-1.5 bg-white text-red-500 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                    </span>
                  )}
                </div>
                <p className="text-xs text-green-700 font-semibold uppercase tracking-wide mb-0.5 capitalize truncate">
                  {product.category.replace('-', ' ')}
                </p>
                <p className="text-xs font-bold text-gray-900 leading-snug line-clamp-2 mb-1 group-hover:text-green-700 transition-colors">
                  {product.name}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-bold text-gray-900">${product.price.toFixed(2)}</span>
                  {hasDiscount && (
                    <span className="text-[10px] text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
                  )}
                </div>
                <div className="flex items-center gap-0.5 mt-0.5">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-3 h-3 flex items-center justify-center">
                      <i className={`ri-star-${i < Math.floor(product.rating) ? 'fill' : 'line'} text-green-600 text-[9px]`}></i>
                    </div>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
