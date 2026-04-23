import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { products } from '../../../mocks/products';

interface FavoriteProduct {
  id: number;
  name: string;
  price: number;
  image: string;
  badge?: string;
  rating: number;
  category: string;
}

export default function FavoriteProducts() {
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [reorderFeedback, setReorderFeedback] = useState<number | null>(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = () => {
    try {
      const stored = localStorage.getItem('user_favorites');
      if (!stored) {
        // Seed with demo favorites on first load
        const demoIds = [1, 3, 5];
        const demoFavorites = products
          .filter(p => demoIds.includes(p.id))
          .map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            image: p.image,
            badge: p.badge ?? undefined,
            rating: p.rating,
            category: p.category,
          }));
        localStorage.setItem('user_favorites', JSON.stringify(demoFavorites));
        setFavorites(demoFavorites);
      } else {
        setFavorites(JSON.parse(stored));
      }
    } catch {
      setFavorites([]);
    }
  };

  const handleRemoveFavorite = (productId: number) => {
    const updated = favorites.filter(f => f.id !== productId);
    setFavorites(updated);
    localStorage.setItem('user_favorites', JSON.stringify(updated));
  };

  const handleQuickReorder = (product: FavoriteProduct) => {
    try {
      const existing: any[] = JSON.parse(localStorage.getItem('cart') ?? '[]');
      const cartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
        category: product.category,
        color: '',
        mount: '',
        width: '',
        height: '',
      };

      const idx = existing.findIndex(c => c.id === product.id);
      if (idx >= 0) {
        existing[idx] = { ...existing[idx], quantity: existing[idx].quantity + 1 };
      } else {
        existing.push(cartItem);
      }

      localStorage.setItem('cart', JSON.stringify(existing));
      setReorderFeedback(product.id);
      setTimeout(() => setReorderFeedback(null), 2500);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Favorite Products</h2>
          <p className="text-sm text-gray-500 mt-1">
            Save your most-used blinds for quick reordering
          </p>
        </div>
        {favorites.length > 0 && (
          <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-lg">
            <i className="ri-heart-fill text-emerald-600"></i>
            <span className="text-sm font-bold text-emerald-700">
              {favorites.length} Favorite{favorites.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Reorder success toast */}
      {reorderFeedback && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in">
          <div className="w-7 h-7 flex items-center justify-center bg-emerald-500 rounded-full shrink-0">
            <i className="ri-check-line text-sm"></i>
          </div>
          <div>
            <p className="text-sm font-bold">Added to cart!</p>
            <p className="text-xs text-gray-400">Product is ready in your cart.</p>
          </div>
          <Link
            to="/cart"
            className="ml-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 whitespace-nowrap cursor-pointer"
          >
            View Cart →
          </Link>
        </div>
      )}

      {favorites.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="ri-heart-line text-4xl text-emerald-500"></i>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No favorites yet</h3>
          <p className="text-base text-gray-500 mb-6">
            Browse products and save your favorites for quick reordering
          </p>
          <Link
            to="/#products"
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold text-base hover:bg-emerald-700 transition-colors whitespace-nowrap cursor-pointer"
          >
            <i className="ri-shopping-bag-line"></i>
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map(product => {
            const isReordering = reorderFeedback === product.id;
            return (
              <div
                key={product.id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all group"
              >
                {/* Product Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.badge && (
                    <div className="absolute top-3 left-3 bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                      {product.badge}
                    </div>
                  )}
                  <button
                    onClick={() => handleRemoveFavorite(product.id)}
                    className="absolute top-3 right-3 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-red-500 hover:text-red-600 transition-colors cursor-pointer shadow-md"
                    title="Remove from favorites"
                  >
                    <i className="ri-heart-fill text-lg"></i>
                  </button>
                </div>

                {/* Product Info */}
                <div className="p-5">
                  <Link
                    to={`/product/${product.id}`}
                    className="block mb-3 hover:text-emerald-600 transition-colors"
                  >
                    <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <i
                          key={i}
                          className={`${
                            i < Math.floor(product.rating)
                              ? 'ri-star-fill text-amber-400'
                              : 'ri-star-line text-gray-300'
                          } text-sm`}
                        ></i>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 font-medium">
                      {product.rating.toFixed(1)}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <p className="text-2xl font-bold text-gray-900">
                      ${product.price.toFixed(2)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuickReorder(product)}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors whitespace-nowrap cursor-pointer ${
                        isReordering
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-900 text-white hover:bg-gray-800'
                      }`}
                    >
                      <i className={isReordering ? 'ri-check-line' : 'ri-shopping-cart-line'}></i>
                      {isReordering ? 'Added!' : 'Quick Reorder'}
                    </button>
                    <Link
                      to={`/product/${product.id}`}
                      className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      title="View details"
                    >
                      <i className="ri-eye-line text-gray-600"></i>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}