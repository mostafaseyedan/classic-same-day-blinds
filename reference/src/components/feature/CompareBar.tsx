import { useState, useEffect } from 'react';
import { products as productCatalog } from '../../mocks/products';
import CompareModal from './CompareModal';

export const COMPARE_STORAGE_KEY = 'compare_ids';
export const COMPARE_EVENT = 'compare-updated';

export const getCompareIds = (): number[] => {
  try {
    return JSON.parse(localStorage.getItem(COMPARE_STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
};

export const toggleCompare = (id: number): void => {
  const current = getCompareIds();
  let updated: number[];
  if (current.includes(id)) {
    updated = current.filter((i) => i !== id);
  } else {
    if (current.length >= 3) return; // max 3
    updated = [...current, id];
  }
  localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent(COMPARE_EVENT));
};

export const clearCompare = (): void => {
  localStorage.setItem(COMPARE_STORAGE_KEY, '[]');
  window.dispatchEvent(new CustomEvent(COMPARE_EVENT));
};

export default function CompareBar({ language }: { language: string }) {
  const [ids, setIds] = useState<number[]>([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setIds(getCompareIds());
    const handler = () => setIds(getCompareIds());
    window.addEventListener(COMPARE_EVENT, handler);
    return () => window.removeEventListener(COMPARE_EVENT, handler);
  }, []);

  if (ids.length === 0) return null;

  const selected = ids.map((id) => productCatalog.find((p) => p.id === id)).filter(Boolean) as typeof productCatalog;

  return (
    <>
      {/* Fixed compare bar at bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white" style={{ boxShadow: '0 -4px 24px rgba(0,0,0,0.10)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-4">
          {/* Label */}
          <div className="shrink-0 hidden sm:block">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              {language === 'es' ? 'Comparar' : 'Comparing'}
            </p>
            <p className="text-xs text-gray-400">{ids.length}/3 {language === 'es' ? 'seleccionados' : 'selected'}</p>
          </div>

          {/* Product slots */}
          <div className="flex items-center gap-3 flex-1">
            {[0, 1, 2].map((slot) => {
              const product = selected[slot];
              return (
                <div
                  key={slot}
                  className={`flex items-center gap-2 h-12 flex-1 rounded-lg border transition-all ${
                    product
                      ? 'bg-white border-green-200'
                      : 'bg-gray-50 border-dashed border-gray-200'
                  }`}
                >
                  {product ? (
                    <>
                      <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 shrink-0 ml-1">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover object-top" />
                      </div>
                      <p className="text-xs font-semibold text-gray-800 flex-1 min-w-0 truncate pr-1">{product.name}</p>
                      <button
                        onClick={() => toggleCompare(product.id)}
                        className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors cursor-pointer shrink-0 mr-1"
                      >
                        <i className="ri-close-line text-base"></i>
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3">
                      <div className="w-5 h-5 flex items-center justify-center text-gray-300">
                        <i className="ri-add-line text-base"></i>
                      </div>
                      <p className="text-xs text-gray-300">
                        {language === 'es' ? 'Agregar producto' : 'Add product'}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowModal(true)}
              disabled={ids.length < 2}
              className="px-5 py-2.5 bg-green-700 hover:bg-green-800 text-white text-sm font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {language === 'es' ? 'Comparar' : 'Compare'}
              {ids.length >= 2 && <i className="ri-arrow-right-line ml-1.5"></i>}
            </button>
            <button
              onClick={clearCompare}
              className="px-3 py-2.5 text-gray-400 hover:text-gray-700 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              {language === 'es' ? 'Limpiar' : 'Clear'}
            </button>
          </div>
        </div>
      </div>

      {/* Spacer so content isn't hidden behind bar */}
      <div className="h-20"></div>

      {showModal && (
        <CompareModal
          productIds={ids}
          language={language}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
