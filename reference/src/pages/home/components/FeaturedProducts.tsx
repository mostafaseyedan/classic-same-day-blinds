import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { products as mockProducts } from '../../../mocks/products';
import { loadProductsFromDB } from '../../../utils/productStorage';
import { useLanguage } from '../../../contexts/LanguageContext';

const FEATURED_IDS = [19, 21, 18, 20];

const editorialData: Record<number, {
  taglineEn: string;
  taglineEs: string;
  quoteEn: string;
  quoteEs: string;
  highlightsEn: string[];
  highlightsEs: string[];
  labelEn: string;
  labelEs: string;
}> = {
  19: {
    labelEn: '#1 Best Seller',
    labelEs: '#1 Más Vendido',
    taglineEn: 'The everyday classic — crisp, clean, and custom-sized',
    taglineEs: 'El clásico del día a día — limpio, elegante y a medida',
    quoteEn: '"Ordered for every window in the house — arrived fast and look great. Can\'t beat this price."',
    quoteEs: '"Las pedí para cada ventana de la casa — llegaron rápido y se ven geniales. Precio inmejorable."',
    highlightsEn: ['Custom widths & drops available', 'Easy wand tilt control', '15% less than Blinds.com'],
    highlightsEs: ['Anchos y caídas personalizados', 'Fácil control de inclinación con varilla', '15% menos que Blinds.com'],
  },
  21: {
    labelEn: 'Top Rated',
    labelEs: 'Más Valorado',
    taglineEn: 'Wood-look luxury — moisture-proof and warp-resistant',
    taglineEs: 'Lujo estilo madera — resistente a la humedad y deformación',
    quoteEn: '"These look just like real wood but hold up way better. I installed them in my kitchen and love them."',
    quoteEs: '"Se ven igual que madera real pero duran mucho más. Los instalé en la cocina y los adoro."',
    highlightsEn: ['Rich wood-grain texture', 'Moisture & warp resistant', 'Available in 6 finishes'],
    highlightsEs: ['Textura de veta de madera', 'Resistente a humedad y deformación', 'Disponible en 6 acabados'],
  },
  18: {
    labelEn: 'Custom Fit',
    labelEs: 'A Medida',
    taglineEn: 'Made to fit any window or patio door — any size',
    taglineEs: 'Diseñadas para cualquier ventana o puerta — cualquier medida',
    quoteEn: '"Perfect fit for our sliding door. The wand control is super smooth and child-safe."',
    quoteEs: '"Ajuste perfecto para nuestra puerta corrediza. El control de varilla es muy suave y seguro para niños."',
    highlightsEn: ['Full-width traverse control', 'No-cord wand operation', 'Cut to exact size'],
    highlightsEs: ['Control de travesía completa', 'Operación sin cordón', 'Cortada a medida exacta'],
  },
  20: {
    labelEn: 'Upgraded Pick',
    labelEs: 'Opción Premium',
    taglineEn: 'Reinforced headrail — smoother, longer-lasting',
    taglineEs: 'Riel de cabeza reforzado — más suave y duradera',
    quoteEn: '"Stepped up from the regular vinyl and the difference is noticeable. These operate so smoothly."',
    quoteEs: '"Subí del vinilo regular y la diferencia es notable. Funcionan muy suavemente."',
    highlightsEn: ['Reinforced headrail system', 'Moisture-resistant vinyl', 'Custom widths available'],
    highlightsEs: ['Sistema de riel reforzado', 'Vinilo resistente a la humedad', 'Anchos personalizados disponibles'],
  },
};

export default function FeaturedProducts() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [allProducts, setAllProducts] = useState<typeof mockProducts>(mockProducts);
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [addedIds, setAddedIds] = useState<Record<number, boolean>>({});
  const [cartOpenIds, setCartOpenIds] = useState<Record<number, boolean>>({});
  const [qtys, setQtys] = useState<Record<number, number>>({});

  const getQty = (id: number) => qtys[id] ?? 1;

  const handleAddToCart = (e: React.MouseEvent, product: typeof mockProducts[0]) => {
    e.stopPropagation();
    const q = getQty(product.id);
    const existing = JSON.parse(localStorage.getItem('cart') ?? '[]');
    const idx = existing.findIndex((item: { id: number }) => item.id === product.id);
    if (idx >= 0) {
      existing[idx].quantity += q;
    } else {
      existing.push({ id: product.id, name: product.name, price: product.price, image: product.image, category: product.category, quantity: q });
    }
    localStorage.setItem('cart', JSON.stringify(existing));
    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setCartOpenIds((prev) => ({ ...prev, [product.id]: false }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
      setQtys((prev) => ({ ...prev, [product.id]: 1 }));
      navigate('/cart');
    }, 900);
  };

  const CartButton = ({ product, size = 'sm' }: { product: typeof mockProducts[0]; size?: 'sm' | 'lg' }) => {
    const isAdded = addedIds[product.id];
    const isOpen = cartOpenIds[product.id];
    const q = getQty(product.id);
    const btnSm = size === 'sm';
    const lang = language === 'es';

    if (isAdded) {
      return (
        <div className={`absolute z-10 bottom-3 right-3 flex items-center gap-1.5 ${btnSm ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'} bg-emerald-600 text-white font-bold rounded-full shadow-md whitespace-nowrap`}>
          <i className="ri-check-line"></i>
          {lang ? '¡Listo!' : 'Added!'}
        </div>
      );
    }
    if (isOpen) {
      return (
        <div
          className="absolute z-10 bottom-3 right-3 flex items-center gap-0.5 bg-white rounded-full shadow-lg border border-gray-200 p-1"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setQtys((prev) => ({ ...prev, [product.id]: Math.max(1, q - 1) })); }}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-700 transition-colors cursor-pointer"
          >
            <i className="ri-subtract-line text-sm"></i>
          </button>
          <span className="min-w-[1.75rem] text-center text-sm font-bold text-gray-900 select-none">{q}</span>
          <button
            onClick={(e) => { e.stopPropagation(); setQtys((prev) => ({ ...prev, [product.id]: Math.min(99, q + 1) })); }}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-700 transition-colors cursor-pointer"
          >
            <i className="ri-add-line text-sm"></i>
          </button>
          <button
            onClick={(e) => handleAddToCart(e, product)}
            className="w-8 h-8 flex items-center justify-center bg-green-700 text-white rounded-full hover:bg-green-800 transition-colors cursor-pointer ml-0.5"
          >
            <i className="ri-shopping-cart-line text-sm"></i>
          </button>
        </div>
      );
    }
    return (
      <button
        onClick={(e) => { e.stopPropagation(); setCartOpenIds((prev) => ({ ...prev, [product.id]: true })); }}
        className={`absolute z-10 bottom-3 right-3 flex items-center gap-1.5 ${btnSm ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'} bg-green-700 text-white font-bold rounded-full shadow-md hover:bg-green-800 hover:scale-105 transition-all duration-200 cursor-pointer whitespace-nowrap`}
      >
        <i className="ri-shopping-cart-line"></i>
        {lang ? 'Al Carrito' : 'Add to Cart'}
      </button>
    );
  };

  useEffect(() => {
    let cancelled = false;
    loadProductsFromDB().then((stored) => {
      if (!cancelled && stored && stored.length > 0) {
        setAllProducts(stored as typeof mockProducts);
      }
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      setAllProducts((e as CustomEvent).detail);
    };
    window.addEventListener('productsUpdated', handler);
    return () => window.removeEventListener('productsUpdated', handler);
  }, []);

  // Intersection observer for entrance animations
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const featured = FEATURED_IDS
    .map((id) => allProducts.find((p) => p.id === id))
    .filter((p): p is typeof mockProducts[0] => p !== undefined);

  const [hero, ...rest] = featured;

  if (!hero) return null;

  const heroEd = editorialData[hero.id];
  const lang = language === 'es';

  return (
    <section ref={sectionRef} className="py-20 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className={`flex items-end justify-between mb-10 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-0.5 w-8 bg-green-700 block"></span>
              <span className="text-green-700 text-xs font-bold uppercase tracking-widest">
                {lang ? 'Los Más Vendidos' : "Top Sellers This Month"}
              </span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900">
              {lang ? 'Favoritos de Nuestros Clientes' : 'Customer Favorites'}
            </h2>
            <p className="text-gray-500 text-base mt-2 max-w-lg">
              {lang
                ? 'Los cuatro productos más pedidos este mes — probados por miles de hogares y negocios en Los Ángeles.'
                : 'The four most ordered products this month — proven across thousands of LA homes and businesses.'}
            </p>
          </div>
          <button
            onClick={() => navigate('/products')}
            className="hidden lg:flex items-center gap-2 px-5 py-2.5 border-2 border-green-700 text-green-700 text-sm font-bold rounded-md hover:bg-green-700 hover:text-white transition-all duration-200 cursor-pointer whitespace-nowrap"
          >
            {lang ? 'Ver Todo el Catálogo' : 'View Full Catalog'}
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-arrow-right-line"></i>
            </div>
          </button>
        </div>

        {/* Hero featured card */}
        {heroEd && (
          <div
            className={`group bg-white rounded-2xl overflow-hidden border border-stone-200 mb-6 cursor-pointer transition-all duration-700 delay-100 hover:border-green-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            onClick={() => navigate(`/product/${hero.id}`)}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Image */}
              <div className="relative h-80 lg:h-auto overflow-hidden bg-stone-100 flex items-center justify-center">
                <img
                  src={hero.image}
                  alt={hero.name}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
                />
                {/* Rank badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="bg-green-700 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                    {lang ? heroEd.labelEs : heroEd.labelEn}
                  </span>
                </div>
                {/* Discount bubble */}
                {hero.price < hero.originalPrice && (
                  <div className="absolute bottom-4 left-4 bg-white rounded-full px-3 py-1.5 text-xs font-bold text-red-600 border border-red-100">
                    {Math.round(((hero.originalPrice - hero.price) / hero.originalPrice) * 100)}% OFF
                  </div>
                )}
                {/* Permanent cart button */}
                <CartButton product={hero} size="lg" />
              </div>

              {/* Content */}
              <div className="p-8 lg:p-10 flex flex-col justify-center">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 capitalize">
                  {hero.category.replace('-', ' ')}
                </p>
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  {lang ? (hero as any).nameEs ?? hero.name : hero.name}
                </h3>
                <p className="text-green-700 font-semibold text-base mb-4">
                  {lang ? heroEd.taglineEs : heroEd.taglineEn}
                </p>

                {/* Stars */}
                <div className="flex items-center gap-2 mb-5">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-4 h-4 flex items-center justify-center">
                        <i className={`ri-star-${i < Math.floor(hero.rating) ? 'fill' : 'line'} text-green-600 text-sm`}></i>
                      </div>
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{hero.rating}</span>
                  <span className="text-sm text-gray-400">({(hero.reviews > 0 ? hero.reviews : (mockProducts.find(p => p.id === hero.id)?.reviews ?? 0)).toLocaleString()} {lang ? 'reseñas' : 'reviews'})</span>
                </div>

                {/* Customer quote */}
                <blockquote className="text-sm text-gray-500 italic border-l-4 border-green-200 pl-4 mb-6 leading-relaxed">
                  {lang ? heroEd.quoteEs : heroEd.quoteEn}
                </blockquote>

                {/* Feature bullets */}
                <ul className="space-y-2 mb-7">
                  {(lang ? heroEd.highlightsEs : heroEd.highlightsEn).map((h) => (
                    <li key={h} className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-4 h-4 flex items-center justify-center text-green-700 shrink-0">
                        <i className="ri-check-double-line text-sm"></i>
                      </div>
                      {h}
                    </li>
                  ))}
                </ul>

                {/* Price + CTA */}
                <div className="flex items-center gap-4 flex-wrap">
                  <div>
                    <span className="text-3xl font-bold text-gray-900">${hero.price.toFixed(2)}</span>
                    {hero.price < hero.originalPrice && (
                      <span className="text-base text-gray-400 line-through ml-2">${hero.originalPrice.toFixed(2)}</span>
                    )}
                  </div>
                  <button
                    className="flex items-center gap-2 px-6 py-3 bg-green-700 text-white text-sm font-bold rounded-md hover:bg-green-800 transition-colors cursor-pointer whitespace-nowrap"
                    onClick={(e) => { e.stopPropagation(); navigate(`/product/${hero.id}`); }}
                  >
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-shopping-cart-line"></i>
                    </div>
                    {lang ? 'Ver Producto' : 'Shop Now'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3 smaller cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {rest.map((product, idx) => {
            const ed = editorialData[product.id];
            const delay = (idx + 2) * 100;
            return (
              <div
                key={product.id}
                className={`group bg-white rounded-2xl overflow-hidden border border-stone-200 cursor-pointer hover:border-green-300 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${delay}ms` }}
                onClick={() => navigate(`/product/${product.id}`)}
              >
                {/* Image */}
                <div className="relative h-52 overflow-hidden bg-stone-100 flex items-center justify-center">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
                  />
                  {ed && (
                    <span className="absolute top-3 left-3 bg-gray-900 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      {lang ? ed.labelEs : ed.labelEn}
                    </span>
                  )}
                  {product.price < product.originalPrice && (
                    <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                    </span>
                  )}
                  {/* Permanent cart button */}
                  <CartButton product={product} size="sm" />
                </div>

                {/* Content */}
                <div className="p-5">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 capitalize">
                    {product.category.replace('-', ' ')}
                  </p>
                  <h4 className="text-base font-bold text-gray-900 mb-1 line-clamp-1">
                    {lang ? (product as any).nameEs ?? product.name : product.name}
                  </h4>
                  {ed && (
                    <p className="text-xs text-green-700 font-semibold mb-3 line-clamp-1">
                      {lang ? ed.taglineEs : ed.taglineEn}
                    </p>
                  )}

                  {/* Stars */}
                  <div className="flex items-center gap-1.5 mb-3">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="w-3.5 h-3.5 flex items-center justify-center">
                          <i className={`ri-star-${i < Math.floor(product.rating) ? 'fill' : 'line'} text-green-600 text-xs`}></i>
                        </div>
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-gray-700">{product.rating}</span>
                    <span className="text-xs text-gray-400">({(product.reviews > 0 ? product.reviews : (mockProducts.find(p => p.id === product.id)?.reviews ?? 0)).toLocaleString()})</span>
                  </div>

                  {/* Highlights */}
                  {ed && (
                    <ul className="space-y-1 mb-4">
                      {(lang ? ed.highlightsEs : ed.highlightsEn).slice(0, 2).map((h) => (
                        <li key={h} className="flex items-start gap-1.5 text-xs text-gray-600">
                          <div className="w-3.5 h-3.5 flex items-center justify-center text-green-700 shrink-0 mt-0.5">
                            <i className="ri-check-line text-xs"></i>
                          </div>
                          {h}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Price row */}
                  <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                    <div>
                      <span className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</span>
                      {product.price < product.originalPrice && (
                        <span className="text-xs text-gray-400 line-through ml-1.5">${product.originalPrice.toFixed(2)}</span>
                      )}
                    </div>
                    <span className="flex items-center gap-1 text-xs font-bold text-green-700 group-hover:gap-2 transition-all">
                      {lang ? 'Ver más' : 'Shop now'}
                      <div className="w-3.5 h-3.5 flex items-center justify-center">
                        <i className="ri-arrow-right-line text-xs"></i>
                      </div>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile CTA */}
        <div className="mt-8 text-center lg:hidden">
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-3 border-2 border-green-700 text-green-700 text-sm font-bold rounded-md hover:bg-green-700 hover:text-white transition-all duration-200 cursor-pointer whitespace-nowrap"
          >
            {lang ? 'Ver Todo el Catálogo' : 'View Full Catalog'}
          </button>
        </div>
      </div>
    </section>
  );
}
