import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { products as mockProducts } from '../../mocks/products';
import { getWishlistIds, removeFromWishlist, WISHLIST_EVENT } from '../../utils/wishlist';
import { useLanguage } from '../../contexts/LanguageContext';
import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';
import WishlistButton from '../../components/feature/WishlistButton';

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

export default function WishlistPage() {
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [addedIds, setAddedIds] = useState<number[]>([]);
  const navigate = useNavigate();
  const { language } = useLanguage();

  useEffect(() => {
    setWishlistIds(getWishlistIds());
    const handler = () => setWishlistIds(getWishlistIds());
    window.addEventListener(WISHLIST_EVENT, handler);
    return () => window.removeEventListener(WISHLIST_EVENT, handler);
  }, []);

  const wishlistProducts = wishlistIds
    .map((id) => mockProducts.find((p) => p.id === id))
    .filter((p): p is typeof mockProducts[0] => p !== undefined);

  const handleAddToCart = (product: typeof mockProducts[0]) => {
    const existing = JSON.parse(localStorage.getItem('cart') ?? '[]');
    const idx = existing.findIndex((i: { id: number }) => i.id === product.id);
    if (idx >= 0) {
      existing[idx].quantity += 1;
    } else {
      existing.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        quantity: 1,
      });
    }
    localStorage.setItem('cart', JSON.stringify(existing));
    localStorage.setItem('cart_updated_at', Date.now().toString());
    window.dispatchEvent(new CustomEvent('cart-updated'));
    setAddedIds((prev) => [...prev, product.id]);
    setTimeout(() => setAddedIds((prev) => prev.filter((id) => id !== product.id)), 1500);
  };

  const handleClearAll = () => {
    wishlistIds.forEach((id) => removeFromWishlist(id));
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar scrolled={false} />
      <div className="h-[calc(1.75rem+3.5rem+2.75rem)]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {language === 'es' ? 'Mis Favoritos' : 'My Wishlist'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {wishlistProducts.length === 0
                ? (language === 'es' ? 'No tienes productos guardados aún' : 'No saved products yet')
                : (language === 'es'
                  ? `${wishlistProducts.length} ${wishlistProducts.length === 1 ? 'producto guardado' : 'productos guardados'}`
                  : `${wishlistProducts.length} saved ${wishlistProducts.length === 1 ? 'product' : 'products'}`)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {wishlistProducts.length > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1.5 px-4 py-2 border border-red-200 text-red-500 text-sm font-semibold rounded-lg hover:bg-red-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-delete-bin-line"></i>
                {language === 'es' ? 'Limpiar Todo' : 'Clear All'}
              </button>
            )}
            <Link
              to="/products"
              className="flex items-center gap-1.5 px-4 py-2 bg-green-700 text-white text-sm font-semibold rounded-lg hover:bg-green-800 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-store-2-line"></i>
              {language === 'es' ? 'Ver Productos' : 'Browse Products'}
            </Link>
          </div>
        </div>

        {wishlistProducts.length === 0 ? (
          /* Empty state */
          <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
            <div className="w-20 h-20 flex items-center justify-center bg-red-50 rounded-full mx-auto mb-6">
              <i className="ri-heart-line text-4xl text-red-400"></i>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              {language === 'es' ? 'Tu lista de favoritos está vacía' : 'Your wishlist is empty'}
            </h2>
            <p className="text-gray-500 text-sm mb-8 max-w-sm mx-auto leading-relaxed">
              {language === 'es'
                ? 'Guarda productos que te gusten haciendo clic en el ícono de corazón en cualquier producto.'
                : 'Save products you love by clicking the heart icon on any product card.'}
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-3 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-800 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-store-2-line"></i>
              {language === 'es' ? 'Explorar Productos' : 'Explore Products'}
            </Link>
          </div>
        ) : (
          <>
            {/* Add All to Cart banner */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-green-700 rounded-lg shrink-0">
                  <i className="ri-shopping-cart-2-line text-white text-lg"></i>
                </div>
                <div>
                  <p className="text-sm font-bold text-green-900">
                    {language === 'es' ? `Tienes ${wishlistProducts.length} productos guardados` : `You have ${wishlistProducts.length} saved products`}
                  </p>
                  <p className="text-xs text-green-700">
                    {language === 'es' ? 'Agrega todos al carrito de una vez' : 'Add them all to cart at once'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => wishlistProducts.forEach(handleAddToCart)}
                className="px-5 py-2.5 bg-green-700 text-white text-sm font-bold rounded-lg hover:bg-green-800 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2"
              >
                <i className="ri-shopping-cart-2-line"></i>
                {language === 'es' ? 'Agregar Todo al Carrito' : 'Add All to Cart'}
              </button>
            </div>

            {/* Product grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {wishlistProducts.map((product) => {
                const hasDiscount = product.price < product.originalPrice;
                const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
                const isAdded = addedIds.includes(product.id);

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-green-200 transition-all group"
                  >
                    {/* Image */}
                    <div
                      className="relative w-full h-52 overflow-hidden bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                      />
                      {product.badge && (
                        <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full ${badgeColors[product.badge] ?? 'bg-gray-700 text-white'}`}>
                          {product.badge}
                        </span>
                      )}
                      {hasDiscount && (
                        <span className="absolute top-3 right-3 bg-white text-red-600 text-xs font-bold px-2 py-1 rounded-full">
                          -{discount}%
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <p className="text-xs text-green-700 font-semibold uppercase tracking-wide mb-1 capitalize">
                        {product.category.replace('-', ' ')}
                      </p>
                      <h3
                        className="text-sm font-bold text-gray-900 mb-2 line-clamp-2 leading-snug cursor-pointer hover:text-green-700 transition-colors"
                        onClick={() => navigate(`/product/${product.id}`)}
                      >
                        {product.name}
                      </h3>

                      {/* Rating */}
                      <div className="flex items-center gap-1.5 mb-3">
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className="w-3 h-3 flex items-center justify-center">
                              <i className={`ri-star-${i < Math.floor(product.rating) ? 'fill' : 'line'} text-green-600 text-xs`}></i>
                            </div>
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">({product.reviews.toLocaleString()})</span>
                      </div>

                      {/* Price */}
                      <div className="flex items-baseline gap-1.5 mb-4">
                        <span className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</span>
                        {hasDiscount && (
                          <span className="text-xs text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAddToCart(product)}
                          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 ${
                            isAdded
                              ? 'bg-emerald-600 text-white'
                              : 'bg-green-700 text-white hover:bg-green-800'
                          }`}
                        >
                          <i className={isAdded ? 'ri-check-line' : 'ri-shopping-cart-line'}></i>
                          {isAdded
                            ? (language === 'es' ? '¡Agregado!' : 'Added!')
                            : (language === 'es' ? 'Al Carrito' : 'Add to Cart')}
                        </button>
                        <WishlistButton productId={product.id} size="sm" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
