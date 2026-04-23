import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { products as mockProducts, categories } from '../../mocks/products';
import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';
import ProductCard from '../home/components/ProductCard';
import { useLanguage } from '../../contexts/LanguageContext';
import { loadProductsFromDB } from '../../utils/productStorage';
import CompareBar from '../../components/feature/CompareBar';

const categoriesEs = [
  { id: 'all', label: 'Todos los Productos', icon: 'ri-layout-grid-line' },
  { id: 'mini-blinds', label: 'Persianas de Vinilo', icon: 'ri-lines-line' },
  { id: 'aluminum-blinds', label: 'Persianas de Aluminio', icon: 'ri-building-line' },
  { id: 'wood-blinds', label: 'Persianas Faux Wood', icon: 'ri-layout-column-line' },
  { id: 'vertical-blinds', label: 'Persianas Verticales', icon: 'ri-layout-column-fill' },
];

const sortOptions = [
  { value: 'default', labelEn: 'Featured', labelEs: 'Destacados' },
  { value: 'price-asc', labelEn: 'Price: Low to High', labelEs: 'Precio: Menor a Mayor' },
  { value: 'price-desc', labelEn: 'Price: High to Low', labelEs: 'Precio: Mayor a Menor' },
  { value: 'rating', labelEn: 'Top Rated', labelEs: 'Mejor Valorados' },
  { value: 'reviews', labelEn: 'Most Reviewed', labelEs: 'Más Reseñados' },
];

export default function ProductsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { language } = useLanguage();

  const initialCategory = searchParams.get('category') ?? 'all';
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState('default');
  const [liveProducts, setLiveProducts] = useState<typeof mockProducts>(mockProducts);
  const [scrolled] = useState(false);

  const displayCategories = language === 'es' ? categoriesEs : categories.map(c => ({ id: c.id, label: c.label, icon: c.icon }));

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Load products from IndexedDB on mount
  useEffect(() => {
    let cancelled = false;
    loadProductsFromDB().then((stored) => {
      if (!cancelled && stored && stored.length > 0) {
        setLiveProducts(stored as typeof mockProducts);
      }
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      setLiveProducts((e as CustomEvent).detail);
    };
    window.addEventListener('productsUpdated', handler);
    return () => window.removeEventListener('productsUpdated', handler);
  }, []);

  const filteredProducts = selectedCategory === 'all'
    ? liveProducts
    : liveProducts.filter((p: { category: string }) => p.category === selectedCategory);

  const sortedProducts = [...filteredProducts].sort((a: any, b: any) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'reviews') return b.reviews - a.reviews;
    return 0;
  });

  const currentCategoryLabel = displayCategories.find(c => c.id === selectedCategory)?.label
    ?? (language === 'es' ? 'Todos los Productos' : 'All Products');

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar scrolled={scrolled} />

      {/* Spacer: announcement bar (2.75rem) + utility bar (1.75rem) + logo bar (3.5rem) + category nav (2.75rem) */}
      <div className="h-[calc(2.25rem+1.75rem+3.5rem+2.75rem)] sm:h-[calc(2.75rem+1.75rem+3.5rem+2.75rem)]"></div>

      {/* Page Header */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-700 transition-colors cursor-pointer mb-2"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-arrow-left-line"></i>
                </div>
                {language === 'es' ? 'Volver al Inicio' : 'Back to Home'}
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                {language === 'es' ? 'Tienda de Persianas y Cortinas' : 'Shop Blinds & Shades'}
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                {language === 'es'
                  ? `${sortedProducts.length} productos disponibles`
                  : `${sortedProducts.length} products available`}
              </p>
            </div>
            {/* Sort */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 whitespace-nowrap">
                {language === 'es' ? 'Ordenar:' : 'Sort by:'}
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-600 cursor-pointer"
              >
                {sortOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {language === 'es' ? opt.labelEs : opt.labelEn}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {displayCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-green-700 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-green-600 hover:text-green-700'
              }`}
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className={`${cat.icon} text-sm`}></i>
              </div>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Active filter label */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm font-semibold text-gray-700">
            {currentCategoryLabel}
            <span className="ml-2 text-gray-400 font-normal">
              ({sortedProducts.length})
            </span>
          </p>
          {selectedCategory !== 'all' && (
            <button
              onClick={() => setSelectedCategory('all')}
              className="text-xs text-green-700 hover:underline cursor-pointer flex items-center gap-1"
            >
              <i className="ri-close-line"></i>
              {language === 'es' ? 'Limpiar filtro' : 'Clear filter'}
            </button>
          )}
        </div>

        {/* Products Grid */}
        {sortedProducts.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4 bg-gray-100 rounded-full">
              <i className="ri-search-line text-3xl text-gray-400"></i>
            </div>
            <p className="text-lg font-semibold text-gray-700 mb-2">
              {language === 'es' ? 'No se encontraron productos' : 'No products found'}
            </p>
            <button
              onClick={() => setSelectedCategory('all')}
              className="mt-4 px-5 py-2 bg-green-700 text-white text-sm font-semibold rounded-md hover:bg-green-800 transition-colors cursor-pointer whitespace-nowrap"
            >
              {language === 'es' ? 'Ver todos los productos' : 'View all products'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-product-shop>
            {sortedProducts.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-16 text-center bg-green-50 rounded-2xl border border-green-100 py-10 px-6">
          <div className="w-12 h-12 flex items-center justify-center mx-auto mb-4 bg-green-700 text-white rounded-xl">
            <i className="ri-customer-service-2-line text-2xl"></i>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {language === 'es' ? '¿Necesitas ayuda para elegir?' : "Need help choosing?"}
          </h3>
          <p className="text-gray-500 text-sm mb-5 max-w-md mx-auto">
            {language === 'es'
              ? 'Nuestros expertos en diseño están disponibles 7 días a la semana para ayudarte a encontrar la persiana perfecta.'
              : 'Our design experts are available 7 days a week to help you find the perfect blind or shade.'}
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={() => navigate('/free-sample')}
              className="px-5 py-2.5 bg-green-700 text-white text-sm font-bold rounded-md hover:bg-green-800 transition-colors cursor-pointer whitespace-nowrap"
            >
              {language === 'es' ? 'Pedir Muestra Gratis' : 'Get Free Samples'}
            </button>
            <button
              onClick={() => {
                navigate('/');
                setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 200);
              }}
              className="px-5 py-2.5 border-2 border-green-700 text-green-700 text-sm font-bold rounded-md hover:bg-green-700 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              {language === 'es' ? 'Hablar con un Experto' : 'Talk to an Expert'}
            </button>
          </div>
        </div>
      </div>

      <Footer />
      <CompareBar language={language} />
    </div>
  );
}
