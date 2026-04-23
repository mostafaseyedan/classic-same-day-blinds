import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';
import { toggleCompare, getCompareIds, COMPARE_EVENT } from '../../../components/feature/CompareBar';
import QuickViewModal from '../../../components/feature/QuickViewModal';
import WishlistButton from '../../../components/feature/WishlistButton';
import { products as mockProducts } from '../../../mocks/products';

interface ColorOption {
  name: string;
  hex: string;
}

interface Product {
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

interface ProductCardProps {
  product: Product;
}

const badgeTranslations: Record<string, string> = {
  'Best Seller': 'Más Vendido',
  'Sale': 'Oferta',
  'Top Rated': 'Mejor Calificado',
  'New': 'Nuevo',
  'Smart Home': 'Hogar Inteligente',
  'Eco-Friendly': 'Ecológico',
  'Popular': 'Popular',
  'Light & Airy': 'Ligero y Aireado',
  'Outdoor': 'Exterior',
  'Value Pick': 'Mejor Precio',
  'Best Value': 'Mejor Valor',
  'Customer Favorite': 'Favorito de Clientes',
};

const categoryTranslations: Record<string, string> = {
  'wood-blinds': 'Persianas de Madera',
  'roller-shades': 'Cortinas Enrollables',
  'cellular-shades': 'Cortinas Celulares',
  'roman-shades': 'Cortinas Romanas',
  'motorized': 'Motorizadas',
  'mini-blinds': 'Persianas Mini',
  'aluminum-blinds': 'Persianas de Aluminio',
};

const MXN_RATE = 17.5;

export default function ProductCard({ product }: ProductCardProps) {
  const [added, setAdded] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [qty, setQty] = useState(1);
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);
  const [inCompare, setInCompare] = useState(false);
  const [compareMaxed, setCompareMaxed] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const navigate = useNavigate();
  const { language } = useLanguage();

  useEffect(() => {
    const update = () => {
      const ids = getCompareIds();
      setInCompare(ids.includes(product.id));
      setCompareMaxed(ids.length >= 3 && !ids.includes(product.id));
    };
    update();
    window.addEventListener(COMPARE_EVENT, update);
    return () => window.removeEventListener(COMPARE_EVENT, update);
  }, [product.id]);

  const handleCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleCompare(product.id);
  };

  const displayPrice = product.price;
  const displayOriginalPrice = product.originalPrice;

  // Use mock data reviews as fallback if stored product has 0 or missing reviews
  const mockReviews = mockProducts.find((p) => p.id === product.id)?.reviews ?? 0;
  const displayReviews = (product.reviews && product.reviews > 0) ? product.reviews : mockReviews;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    const existing = JSON.parse(localStorage.getItem('cart') ?? '[]');
    const existingIndex = existing.findIndex((item: { id: number }) => item.id === product.id);
    if (existingIndex >= 0) {
      existing[existingIndex].quantity += qty;
    } else {
      existing.push({ id: product.id, name: product.name, price: displayPrice, image: product.image, category: product.category, quantity: qty });
    }
    localStorage.setItem('cart', JSON.stringify(existing));
    setAdded(true);
    setCartOpen(false);
    setTimeout(() => { setAdded(false); setQty(1); navigate('/cart'); }, 900);
  };

  const discount = Math.round(((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100);
  const hasDiscount = displayPrice > 0 && displayPrice < displayOriginalPrice;

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

  const isBestValue = product.badge === 'Best Value';

  const displayBadge = product.badge
    ? (language === 'es' ? (badgeTranslations[product.badge] ?? product.badge) : product.badge)
    : null;

  const displayCategory = language === 'es'
    ? (categoryTranslations[product.category] ?? product.category.replace('-', ' '))
    : product.category.replace('-', ' ');

  return (
    <div
      className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group border border-gray-100 cursor-pointer"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className="relative w-full h-60 overflow-hidden bg-stone-100">
        <img src={product.image} alt={product.name} className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" />

        {/* Badge top-left */}
        {displayBadge && (
          <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full ${badgeColors[product.badge!] ?? 'bg-gray-700 text-white'}`}>
            {displayBadge}
          </span>
        )}

        {/* Financing Available ribbon — bottom-left of image, for products $50+ */}
        {displayPrice >= 50 && (
          <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1 bg-white/95 border border-[#0fa0ea]/30 text-[#0a7ab5] text-[10px] font-bold px-2 py-1 rounded-full shadow-sm backdrop-blur-sm">
            <div className="w-3 h-3 flex items-center justify-center">
              <i className="ri-bank-card-line text-[10px]"></i>
            </div>
            {language === 'en' ? 'Financing Available' : 'Financiamiento Disponible'}
          </div>
        )}

        {/* Discount top-right */}
        {hasDiscount && (
          <span className="absolute top-3 right-3 bg-white text-red-600 text-xs font-bold px-2 py-1 rounded-full border border-red-100">
            -{discount}%
          </span>
        )}

        {/* Wishlist top-right (below discount if present) */}
        <div className={`absolute ${hasDiscount ? 'top-10' : 'top-3'} right-3`} onClick={(e) => e.stopPropagation()}>
          <WishlistButton productId={product.id} size="sm" />
        </div>

        {/* Quick view — hover only */}
        <div className="absolute inset-0 bg-black/10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto">
          <button
            onClick={(e) => { e.stopPropagation(); setQuickViewOpen(true); }}
            className="px-5 py-2 bg-white text-green-800 text-xs font-bold rounded-full hover:bg-green-50 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 border border-gray-200"
          >
            <i className="ri-eye-line text-sm"></i>
            {language === 'en' ? 'Quick View' : 'Vista Rápida'}
          </button>
        </div>

        {/* Cart area — bottom-right of image, 3 states */}
        {added ? (
          <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white text-xs font-bold rounded-full shadow-md whitespace-nowrap">
            <i className="ri-check-line text-sm"></i>
            {language === 'en' ? 'Added!' : '¡Listo!'}
          </div>
        ) : cartOpen ? (
          <div
            className="absolute bottom-3 right-3 z-10 flex items-center gap-0.5 bg-white rounded-full shadow-lg border border-gray-200 p-1"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => { e.stopPropagation(); setQty((q) => Math.max(1, q - 1)); }}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-700 transition-colors cursor-pointer"
            >
              <i className="ri-subtract-line text-sm font-bold"></i>
            </button>
            <span className="min-w-[1.75rem] text-center text-sm font-bold text-gray-900 select-none">{qty}</span>
            <button
              onClick={(e) => { e.stopPropagation(); setQty((q) => Math.min(99, q + 1)); }}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-700 transition-colors cursor-pointer"
            >
              <i className="ri-add-line text-sm font-bold"></i>
            </button>
            <button
              onClick={handleAddToCart}
              className="w-8 h-8 flex items-center justify-center bg-green-700 text-white rounded-full hover:bg-green-800 transition-colors cursor-pointer ml-0.5"
              title={language === 'en' ? 'Confirm' : 'Confirmar'}
            >
              <i className="ri-shopping-cart-line text-sm"></i>
            </button>
          </div>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); setCartOpen(true); }}
            className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 px-3 py-2 bg-green-700 text-white text-xs font-bold rounded-full shadow-md hover:bg-green-800 hover:scale-105 transition-all duration-200 cursor-pointer whitespace-nowrap"
          >
            <i className="ri-shopping-cart-line text-sm"></i>
            {language === 'en' ? 'Add to Cart' : 'Al Carrito'}
          </button>
        )}
      </div>

      <div className="p-4">
        <p className="text-xs text-green-700 font-semibold uppercase tracking-wide mb-1 capitalize">
          {displayCategory}
        </p>
        <h3 className="text-sm font-bold text-gray-900 mb-1.5 line-clamp-2 leading-snug">{product.name}</h3>
        <div className="flex items-center gap-1.5 mb-2.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/product/${product.id}`, { state: { scrollToReviews: true } });
            }}
            className="flex items-center gap-1 cursor-pointer group/stars"
            title={language === 'en' ? 'Read reviews' : 'Leer reseñas'}
          >
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-3 h-3 flex items-center justify-center">
                  <i className={`ri-star-${i < Math.floor(product.rating) ? 'fill' : 'line'} text-green-600 text-xs group-hover/stars:text-green-800 transition-colors`}></i>
                </div>
              ))}
            </div>
            <span className="text-xs text-gray-500 group-hover/stars:text-green-700 group-hover/stars:underline transition-colors">
              ({displayReviews.toLocaleString()})
            </span>
          </button>
        </div>

        {/* Color swatches */}
        {product.colorOptions && product.colorOptions.length > 0 && (
          <div className="flex items-center gap-1.5 mb-3">
            {product.colorOptions.slice(0, 5).map((color) => (
              <div
                key={color.name}
                title={color.name}
                onMouseEnter={() => setHoveredColor(color.name)}
                onMouseLeave={() => setHoveredColor(null)}
                className="relative w-5 h-5 rounded-full border-2 border-gray-200 cursor-pointer transition-transform hover:scale-110 hover:border-green-500 flex-shrink-0"
                style={{ backgroundColor: color.hex }}
              />
            ))}
            {product.colorOptions.length > 5 && (
              <span className="text-xs text-gray-400 font-medium">+{product.colorOptions.length - 5}</span>
            )}
            {hoveredColor && (
              <span className="text-xs text-gray-500 ml-0.5 truncate">{hoveredColor}</span>
            )}
          </div>
        )}

        {/* Low stock nudge */}
        {product.inventory !== undefined && product.inventory > 0 && product.inventory < 10 && (
          <div className="flex items-center gap-1 mb-2.5">
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-alarm-warning-line text-amber-600 text-xs"></i>
            </div>
            <span className="text-xs font-semibold text-amber-600">
              {language === 'en' ? `Only ${product.inventory} left!` : `¡Solo quedan ${product.inventory}!`}
            </span>
          </div>
        )}

        {/* Price + actions */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-gray-900">${displayPrice.toFixed(2)}</span>
              {hasDiscount && (
                <span className="text-xs text-gray-400 line-through">${displayOriginalPrice.toFixed(2)}</span>
              )}
            </div>
            {language === 'es' && (
              <p className="text-xs font-semibold text-green-700 mt-0.5">
                ${(displayPrice * MXN_RATE).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
              </p>
            )}
            {displayPrice >= 50 && (
              <a
                href="https://www.affirm.com"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 mt-0.5 group/affirm"
                title="Learn about Affirm financing"
              >
                <span className="text-xs text-stone-500 group-hover/affirm:text-stone-700 transition-colors whitespace-nowrap">
                  {language === 'en'
                    ? `As low as $${Math.ceil(displayPrice / 12)}/mo with`
                    : `Desde $${Math.ceil(displayPrice / 12)}/mes con`}
                </span>
                <span className="text-xs font-black text-[#0fa0ea] tracking-tight group-hover/affirm:underline">affirm</span>
              </a>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); setQuickViewOpen(true); }}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-md hover:bg-green-50 hover:text-green-700 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1"
            >
              <i className="ri-eye-line text-xs"></i>
              {language === 'en' ? 'Quick View' : 'Vista'}
            </button>
            {!compareMaxed && (
              <button
                onClick={handleCompare}
                title={language === 'en' ? 'Compare' : 'Comparar'}
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer border ${
                  inCompare
                    ? 'bg-amber-500 border-amber-500 text-white'
                    : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-green-600 hover:text-green-700'
                }`}
              >
                <i className="ri-equalizer-line text-sm"></i>
              </button>
            )}
          </div>
        </div>

        {/* View details link */}
        <div
          className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between cursor-pointer group/link"
          onClick={() => navigate(`/product/${product.id}`)}
        >
          <span className="text-xs text-gray-400 font-medium">
            {language === 'en' ? 'See sizing, colors & specs' : 'Ver tallas, colores y especificaciones'}
          </span>
          <span className="flex items-center gap-1 text-xs font-bold text-green-700 group-hover/link:gap-1.5 transition-all">
            {language === 'en' ? 'View Details' : 'Ver Detalles'}
            <div className="w-3.5 h-3.5 flex items-center justify-center">
              <i className="ri-arrow-right-line text-xs"></i>
            </div>
          </span>
        </div>
      </div>

      <QuickViewModal
        product={quickViewOpen ? product : null}
        onClose={() => setQuickViewOpen(false)}
        language={language}
      />
    </div>
  );
}
