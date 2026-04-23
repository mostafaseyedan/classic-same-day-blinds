import { Link } from 'react-router-dom';
import { CartItem } from '../cartTypes';

interface SavedForLaterProps {
  savedItems: CartItem[];
  language: string;
  onMoveToCart: (item: CartItem) => void;
  onRemove: (id: number) => void;
}

const MXN_RATE = 17.5;

export default function SavedForLater({ savedItems, language, onMoveToCart, onRemove }: SavedForLaterProps) {
  if (savedItems.length === 0) return null;

  return (
    <div className="mt-10 border-t border-gray-200 pt-8">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-6 h-6 flex items-center justify-center text-amber-600">
          <i className="ri-bookmark-3-line text-lg"></i>
        </div>
        <h2 className="text-base font-bold text-gray-900">
          {language === 'es' ? 'Guardado para Después' : 'Saved for Later'}
        </h2>
        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
          {savedItems.length}
        </span>
      </div>

      <div className="space-y-3">
        {savedItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-4 group hover:border-amber-200 transition-colors"
          >
            {/* Image */}
            <Link to={`/product/${item.id}`} className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-50 cursor-pointer">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover object-top" />
            </Link>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-amber-600 font-semibold uppercase mb-0.5 capitalize">
                {item.category.replace('-', ' ')}
              </p>
              <Link to={`/product/${item.id}`} className="text-sm font-bold text-gray-900 hover:text-green-700 transition-colors truncate block cursor-pointer">
                {item.name}
              </Link>
              {(item.color || item.mount) && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {item.color}{item.color && item.mount && ' · '}{item.mount}
                  {item.width && item.height && ` · ${item.width} × ${item.height}`}
                </p>
              )}
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-sm font-bold text-gray-900">${item.price.toFixed(2)}</span>
                {language === 'es' && (
                  <span className="text-xs font-semibold text-green-700">
                    ${(item.price * MXN_RATE).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 items-end shrink-0">
              <button
                onClick={() => onMoveToCart(item)}
                className="flex items-center gap-1.5 px-3 py-2 bg-green-700 hover:bg-green-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-shopping-cart-line text-sm"></i>
                {language === 'es' ? 'Mover al carrito' : 'Move to cart'}
              </button>
              <button
                onClick={() => onRemove(item.id)}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors cursor-pointer flex items-center gap-1"
              >
                <i className="ri-delete-bin-line text-xs"></i>
                {language === 'es' ? 'Eliminar' : 'Remove'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
