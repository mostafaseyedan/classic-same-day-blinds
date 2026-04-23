import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { products as productCatalog } from '../../../mocks/products';
import { CartItem } from '../cartTypes';

interface RecentlyViewedInCartProps {
  cart: CartItem[];
  language: string;
  onAddToCart: (item: CartItem) => void;
}

const MXN_RATE = 17.5;

const badgeColors: Record<string, string> = {
  'Best Seller': 'bg-green-700 text-white',
  'Sale': 'bg-red-500 text-white',
  'Top Rated': 'bg-emerald-600 text-white',
  'New': 'bg-sky-500 text-white',
  'Best Value': 'bg-orange-500 text-white',
  'Customer Favorite': 'bg-rose-500 text-white',
};

export default function RecentlyViewedInCart({ cart, language, onAddToCart }: RecentlyViewedInCartProps) {
  const [recentProducts, setRecentProducts] = useState<typeof productCatalog>([]);
  const [addedId, setAddedId] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('recently_viewed');
    if (!stored) return;

    const cartIds = new Set(cart.map((item) => item.id));
    const viewedIds: number[] = JSON.parse(stored);

    const products = viewedIds
      .filter((id) => !cartIds.has(id))
      .map((id) => productCatalog.find((p) => p.id === id))
      .filter((p): p is typeof productCatalog[0] => p !== undefined)
      .slice(0, 4);

    setRecentProducts(products);
  }, [cart]);

  const handleAddToCart = (e: React.MouseEvent, product: typeof productCatalog[0]) => {
    e.preventDefault();
    e.stopPropagation();
    const item: CartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      category: product.category,
    };
    onAddToCart(item);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  if (recentProducts.length === 0) return null;

  return (
    <section className="mt-12 border-t border-gray-100 pt-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {language === 'es' ? 'Vistos Recientemente' : 'Recently Viewed'}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {language === 'es' ? 'Los últimos productos que exploraste' : 'The last products you browsed'}
          </p>
        </div>
        <Link
          to="/products"
          className="text-sm font-semibold text-green-700 hover:text-green-800 transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
        >
          {language === 'es' ? 'Ver Todo' : 'Browse All'}
          <i className="ri-arrow-right-line text-base"></i>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {recentProducts.map((product) => {
          const hasDiscount = product.price < product.originalPrice;
          const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
          const displayName = language === 'es' ? ((product as any).nameEs ?? product.name) : product.name;
          const isLowStock = product.inventory !== undefined && product.inventory > 0 && product.inventory < 10;
          const isAdded = addedId === product.id;

          return (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-green-200 transition-all cursor-pointer"
            >
              <div className="relative w-full h-44 overflow-hidden bg-gray-50">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                />
                {product.badge && (
                  <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded-full ${badgeColors[product.badge] ?? 'bg-gray-700 text-white'}`}>
                    {product.badge}
                  </span>
                )}
                {hasDiscount && (
                  <span className="absolute top-2 right-2 bg-white text-red-600 text-xs font-bold px-2 py-1 rounded-full">
                    -{discount}%
                  </span>
                )}
                <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/50 text-white text-[10px] font-semibold px-2 py-1 rounded-full">
                  <i className="ri-time-line text-xs"></i>
                  {language === 'es' ? 'Visto antes' : 'Viewed before'}
                </div>
              </div>
              <div className="p-3">
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1 capitalize">
                  {product.category.replace('-', ' ')}
                </p>
                <p className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug mb-2">
                  {displayName}
                </p>
                {isLowStock && (
                  <p className="text-xs font-semibold text-amber-600 mb-1 flex items-center gap-1">
                    <i className="ri-alarm-warning-line text-xs"></i>
                    {language === 'es' ? `Solo quedan ${product.inventory}` : `Only ${product.inventory} left`}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-base font-bold text-gray-900">${product.price.toFixed(2)}</span>
                    {hasDiscount && (
                      <span className="text-xs text-gray-400 line-through ml-1">${product.originalPrice.toFixed(2)}</span>
                    )}
                    {language === 'es' && (
                      <p className="text-xs font-semibold text-green-700 mt-0.5">
                        ${(product.price * MXN_RATE).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-star-fill text-green-600 text-xs"></i>
                    </div>
                    <span className="text-xs font-semibold text-gray-700">{product.rating}</span>
                  </div>
                </div>
              </div>
              <div className="px-3 pb-3">
                <button
                  onClick={(e) => handleAddToCart(e, product)}
                  className={`w-full text-center text-xs font-semibold py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 ${
                    isAdded
                      ? 'bg-green-700 text-white'
                      : 'text-green-700 bg-green-50 hover:bg-green-700 hover:text-white'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <i className="ri-check-line text-sm"></i>
                      {language === 'es' ? '¡Agregado!' : 'Added!'}
                    </>
                  ) : (
                    <>
                      <i className="ri-shopping-cart-add-line text-sm"></i>
                      {language === 'es' ? 'Agregar al Carrito' : 'Add to Cart'}
                    </>
                  )}
                </button>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}