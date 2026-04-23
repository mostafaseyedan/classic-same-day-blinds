import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface ColorOption {
  name: string;
  hex: string;
}

interface QuickViewProduct {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  category: string;
  badge: string | null;
  description: string;
  image: string;
  colorOptions?: ColorOption[];
  inventory?: number;
}

interface QuickViewModalProps {
  product: QuickViewProduct | null;
  onClose: () => void;
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

export default function QuickViewModal({ product, onClose, language = 'en' }: QuickViewModalProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (product?.colorOptions && product.colorOptions.length > 0) {
      setSelectedColor(product.colorOptions[0].name);
    } else {
      setSelectedColor(null);
    }
    setQuantity(1);
    setAdded(false);
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [product, onClose]);

  if (!product) return null;

  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  const hasDiscount = product.price > 0 && product.price < product.originalPrice;
  const isLowStock = product.inventory !== undefined && product.inventory > 0 && product.inventory < 10;
  const isOutOfStock = product.inventory !== undefined && product.inventory === 0;
  const maxQty = isLowStock ? product.inventory! : 99;

  const handleAddToCart = () => {
    const existing = JSON.parse(localStorage.getItem('cart') ?? '[]');
    const idx = existing.findIndex((i: { id: number }) => i.id === product.id);
    const colorObj = product.colorOptions?.find(c => c.name === selectedColor);
    if (idx >= 0) {
      existing[idx].quantity += quantity;
    } else {
      existing.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        quantity,
        color: selectedColor ?? undefined,
      });
    }
    localStorage.setItem('cart', JSON.stringify(existing));
    localStorage.setItem('cart_updated_at', Date.now().toString());
    window.dispatchEvent(new CustomEvent('cart-updated'));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleViewFull = () => {
    onClose();
    navigate(`/product/${product.id}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:max-h-[600px] relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center bg-white/90 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <i className="ri-close-line text-xl"></i>
        </button>

        {/* Image panel */}
        <div className="w-full md:w-[45%] shrink-0 bg-gray-50 relative overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-64 md:h-full object-cover object-top"
          />
          {product.badge && (
            <span className={`absolute top-4 left-4 text-xs font-bold px-2.5 py-1 rounded-full ${badgeColors[product.badge] ?? 'bg-gray-700 text-white'}`}>
              {product.badge}
            </span>
          )}
          {hasDiscount && (
            <span className="absolute top-4 right-12 bg-white text-red-600 text-xs font-bold px-2.5 py-1 rounded-full">
              -{discount}%
            </span>
          )}
        </div>

        {/* Info panel */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {/* Category + title */}
          <div>
            <p className="text-xs text-green-700 font-bold uppercase tracking-wide mb-1 capitalize">
              {product.category.replace('-', ' ')}
            </p>
            <h2 className="text-xl font-bold text-gray-900 leading-snug">{product.name}</h2>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-4 h-4 flex items-center justify-center">
                  <i className={`ri-star-${i < Math.floor(product.rating) ? 'fill' : 'line'} text-green-600 text-sm`}></i>
                </div>
              ))}
            </div>
            <span className="text-sm font-semibold text-gray-700">{product.rating}</span>
            <span className="text-xs text-gray-400">({product.reviews.toLocaleString()} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
            {hasDiscount && (
              <span className="text-sm text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
            )}
            {hasDiscount && (
              <span className="text-xs bg-red-50 text-red-600 font-semibold px-2 py-0.5 rounded-full">Save ${(product.originalPrice - product.price).toFixed(2)}</span>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{product.description}</p>

          {/* Stock status */}
          {isOutOfStock && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <i className="ri-close-circle-line text-red-500"></i>
              <span className="text-xs font-semibold text-red-600">Out of stock</span>
            </div>
          )}
          {isLowStock && !isOutOfStock && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <i className="ri-alarm-warning-line text-amber-500"></i>
              <span className="text-xs font-semibold text-amber-600">Only {product.inventory} left — order soon!</span>
            </div>
          )}

          {/* Color options */}
          {product.colorOptions && product.colorOptions.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2">
                Color: <span className="font-bold text-gray-900">{selectedColor}</span>
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                {product.colorOptions.map((color) => (
                  <button
                    key={color.name}
                    title={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer ${
                      selectedColor === color.name
                        ? 'border-green-600 scale-110'
                        : 'border-gray-200 hover:border-green-400'
                    }`}
                    style={{ backgroundColor: color.hex }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Quantity + Add to Cart */}
          <div className="flex items-center gap-3 mt-auto pt-2">
            <div className="flex items-center gap-1 border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                <i className="ri-subtract-line text-sm"></i>
              </button>
              <span className="w-8 text-center text-sm font-bold text-gray-900">{quantity}</span>
              <button
                onClick={() => setQuantity(q => Math.min(maxQty, q + 1))}
                className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 cursor-pointer"
                disabled={isOutOfStock}
              >
                <i className="ri-add-line text-sm"></i>
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex-1 py-2.5 font-bold rounded-lg text-sm transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 ${
                added
                  ? 'bg-emerald-600 text-white'
                  : isOutOfStock
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-green-700 text-white hover:bg-green-800'
              }`}
            >
              <i className={added ? 'ri-check-line' : 'ri-shopping-cart-line'}></i>
              {added ? 'Added to Cart!' : language === 'es' ? 'Agregar al Carrito' : 'Add to Cart'}
            </button>

            <button
              onClick={handleViewFull}
              className="px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 hover:border-green-500 hover:text-green-700 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5"
            >
              <i className="ri-external-link-line text-sm"></i>
              {language === 'es' ? 'Ver Completo' : 'Full Details'}
            </button>
          </div>

          {/* Trust badges */}
          <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
            {[
              { icon: 'ri-shield-check-line', text: '3-Year Warranty' },
              { icon: 'ri-truck-line', text: 'Free Shipping' },
              { icon: 'ri-refresh-line', text: '30-Day Returns' },
            ].map(b => (
              <div key={b.text} className="flex items-center gap-1 text-xs text-gray-500">
                <div className="w-4 h-4 flex items-center justify-center text-green-600 shrink-0">
                  <i className={b.icon}></i>
                </div>
                {b.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
