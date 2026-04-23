import { useNavigate } from 'react-router-dom';
import { products as productCatalog } from '../../mocks/products';

interface CompareModalProps {
  productIds: number[];
  language: string;
  onClose: () => void;
}

const MXN_RATE = 17.5;

const featuresByCategory: Record<string, string[]> = {
  'mini-blinds':     ['Moisture resistant', 'Cordless option', 'Light filtering', 'Child-safe'],
  'aluminum-blinds': ['Rust proof aluminum', 'Commercial grade', 'Wipe clean', 'Cordless option'],
  'roller-shades':   ['Smooth chain operation', 'Blackout option', 'Custom sizing', 'Motorized option'],
  'vertical-blinds': ['Full-width control', 'Patio door ideal', 'PVC vanes', 'No-cord wand'],
  'cellular-shades': ['Honeycomb insulation', 'Energy Star', 'Top-down/bottom-up', 'Triple cell option'],
  'roman-shades':    ['Premium fabric', 'Multiple fold styles', 'Blackout lining', 'Custom sizing'],
  'motorized':       ['App control', 'Voice assistant', 'Quiet motor', 'Schedule automation'],
  'wood-blinds':     ['Real wood', 'Cordless option', 'Multiple stain colors', 'Moisture resistant'],
};

const getFeatures = (category: string) =>
  featuresByCategory[category] ?? ['Custom sizing', 'Child-safe options', '3-year warranty', 'Free samples'];

export default function CompareModal({ productIds, language, onClose }: CompareModalProps) {
  const navigate = useNavigate();

  const products = productIds
    .map((id) => productCatalog.find((p) => p.id === id))
    .filter(Boolean) as typeof productCatalog;

  if (products.length < 2) return null;

  const rows: { label: string; labelEs: string; render: (p: typeof productCatalog[0]) => React.ReactNode }[] = [
    {
      label: 'Price',
      labelEs: 'Precio',
      render: (p) => (
        <div>
          <p className="text-lg font-bold text-gray-900">${p.price.toFixed(2)}</p>
          {language === 'es' && (
            <p className="text-xs text-green-700 font-semibold">
              ${(p.price * MXN_RATE).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
            </p>
          )}
          {p.price < p.originalPrice && (
            <p className="text-xs text-gray-400 line-through">${p.originalPrice.toFixed(2)}</p>
          )}
        </div>
      ),
    },
    {
      label: 'Rating',
      labelEs: 'Calificación',
      render: (p) => (
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-3.5 h-3.5 flex items-center justify-center">
                <i className={`ri-star-${i < Math.floor(p.rating) ? 'fill' : 'line'} text-green-600 text-xs`}></i>
              </div>
            ))}
          </div>
          <span className="text-sm font-bold text-gray-800">{p.rating}</span>
        </div>
      ),
    },
    {
      label: 'Reviews',
      labelEs: 'Reseñas',
      render: (p) => (
        <span className="text-sm font-semibold text-gray-700">{p.reviews.toLocaleString()}</span>
      ),
    },
    {
      label: 'Category',
      labelEs: 'Categoría',
      render: (p) => (
        <span className="text-sm text-gray-700 capitalize">{p.category.replace(/-/g, ' ')}</span>
      ),
    },
    {
      label: 'Stock',
      labelEs: 'Inventario',
      render: (p) => {
        const inv = p.inventory ?? 0;
        if (inv === 0) return <span className="text-xs font-bold text-red-600">{language === 'es' ? 'Sin stock' : 'Out of stock'}</span>;
        if (inv < 10) return <span className="text-xs font-bold text-amber-600">{language === 'es' ? `Solo ${inv}` : `Only ${inv} left`}</span>;
        return <span className="text-xs font-bold text-green-600">{language === 'es' ? 'En stock' : 'In stock'}</span>;
      },
    },
    {
      label: 'Badge',
      labelEs: 'Insignia',
      render: (p) => p.badge
        ? <span className="text-xs font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded-full">{p.badge}</span>
        : <span className="text-xs text-gray-300">—</span>,
    },
  ];

  // Get all unique features across selected products
  const allFeatureSets = products.map((p) => getFeatures(p.category));
  const maxFeatures = Math.max(...allFeatureSets.map((f) => f.length));

  // Winning values for price (lowest = best), rating (highest = best)
  const lowestPrice = Math.min(...products.map((p) => p.price));
  const highestRating = Math.max(...products.map((p) => p.rating));

  const colWidth = Math.floor(100 / products.length);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {language === 'es' ? 'Comparar Productos' : 'Compare Products'}
            </h2>
            <p className="text-xs text-gray-500">
              {products.length} {language === 'es' ? 'productos seleccionados' : 'products selected'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        <div className="p-6">
          {/* Product headers */}
          <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: `140px repeat(${products.length}, 1fr)` }}>
            <div></div>
            {products.map((p) => {
              const isCheapest = p.price === lowestPrice;
              const isTopRated = p.rating === highestRating;
              return (
                <div key={p.id} className="flex flex-col items-center gap-2 text-center">
                  <div className="relative w-full h-36 rounded-xl overflow-hidden bg-gray-50">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover object-top" />
                    {(isCheapest || isTopRated) && (
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {isCheapest && <span className="text-[9px] font-bold bg-green-700 text-white px-1.5 py-0.5 rounded-full whitespace-nowrap">{language === 'es' ? 'Mejor precio' : 'Best price'}</span>}
                        {isTopRated && <span className="text-[9px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded-full whitespace-nowrap">{language === 'es' ? 'Mejor calificado' : 'Top rated'}</span>}
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-bold text-gray-900 leading-snug">{p.name}</p>
                  <button
                    onClick={() => { onClose(); navigate(`/product/${p.id}`); }}
                    className="w-full py-2 bg-green-700 hover:bg-green-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {language === 'es' ? 'Ver producto' : 'View product'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Comparison rows */}
          <div className="space-y-0 border border-gray-100 rounded-xl overflow-hidden">
            {rows.map((row, idx) => (
              <div
                key={row.label}
                className={`grid gap-4 items-center py-3.5 px-4 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                style={{ gridTemplateColumns: `140px repeat(${products.length}, 1fr)` }}
              >
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  {language === 'es' ? row.labelEs : row.label}
                </p>
                {products.map((p) => (
                  <div key={p.id} className="flex justify-center">
                    {row.render(p)}
                  </div>
                ))}
              </div>
            ))}

            {/* Features section */}
            <div className="border-t border-gray-200">
              <div className={`grid gap-4 py-3.5 px-4 bg-gray-100`} style={{ gridTemplateColumns: `140px repeat(${products.length}, 1fr)` }}>
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                  {language === 'es' ? 'Características' : 'Features'}
                </p>
                {products.map((p) => (
                  <p key={p.id} className="text-xs font-bold text-gray-600 text-center capitalize">
                    {p.category.replace(/-/g, ' ')}
                  </p>
                ))}
              </div>
              {Array.from({ length: maxFeatures }).map((_, fi) => (
                <div
                  key={fi}
                  className={`grid gap-4 items-center py-2.5 px-4 ${fi % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  style={{ gridTemplateColumns: `140px repeat(${products.length}, 1fr)` }}
                >
                  <div></div>
                  {products.map((p) => {
                    const feats = getFeatures(p.category);
                    const feat = feats[fi];
                    return (
                      <div key={p.id} className="flex justify-center">
                        {feat ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-4 h-4 flex items-center justify-center shrink-0">
                              <i className="ri-check-line text-green-600 text-sm"></i>
                            </div>
                            <span className="text-xs text-gray-700">{feat}</span>
                          </div>
                        ) : (
                          <span className="text-gray-200 text-sm">—</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
