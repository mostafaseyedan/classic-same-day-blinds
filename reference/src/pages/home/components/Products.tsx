import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard';
import { products as mockProducts, categories } from '../../../mocks/products';
import { useLanguage } from '../../../contexts/LanguageContext';
import { loadProductsFromDB } from '../../../utils/productStorage';

const menuCategoriesEn = [
  { label: 'All Products', icon: 'ri-layout-grid-line', categoryId: 'all' },
  { label: 'Blinds', icon: 'ri-layout-column-line', categoryId: 'wood-blinds' },
  { label: 'Mini Blinds', icon: 'ri-lines-line', categoryId: 'mini-blinds' },
  { label: 'Aluminum', icon: 'ri-building-line', categoryId: 'aluminum-blinds' },
  { label: 'Vertical', icon: 'ri-layout-column-fill', categoryId: 'vertical-blinds' },
  { label: 'Shades', icon: 'ri-layout-right-line', categoryId: 'roller-shades' },
  { label: 'Shutters', icon: 'ri-home-2-line', categoryId: 'roman-shades' },
  { label: 'Motorized', icon: 'ri-remote-control-line', categoryId: 'motorized' },
  { label: 'Commercial', icon: 'ri-building-2-line', categoryId: 'cellular-shades' },
];

const menuCategoriesEs = [
  { label: 'Todos los Productos', icon: 'ri-layout-grid-line', categoryId: 'all' },
  { label: 'Persianas', icon: 'ri-layout-column-line', categoryId: 'wood-blinds' },
  { label: 'Persianas Mini', icon: 'ri-lines-line', categoryId: 'mini-blinds' },
  { label: 'Aluminio', icon: 'ri-building-line', categoryId: 'aluminum-blinds' },
  { label: 'Verticales', icon: 'ri-layout-column-fill', categoryId: 'vertical-blinds' },
  { label: 'Cortinas', icon: 'ri-layout-right-line', categoryId: 'roller-shades' },
  { label: 'Postigos', icon: 'ri-home-2-line', categoryId: 'roman-shades' },
  { label: 'Motorizadas', icon: 'ri-remote-control-line', categoryId: 'motorized' },
  { label: 'Comercial', icon: 'ri-building-2-line', categoryId: 'cellular-shades' },
];

const categoriesEs = [
  { id: 'all', label: 'Todos los Productos', icon: 'ri-layout-grid-line' },
  { id: 'wood-blinds', label: 'Persianas de Madera', icon: 'ri-layout-column-line' },
  { id: 'mini-blinds', label: 'Persianas Mini', icon: 'ri-lines-line' },
  { id: 'aluminum-blinds', label: 'Persianas de Aluminio', icon: 'ri-building-line' },
  { id: 'vertical-blinds', label: 'Persianas Verticales', icon: 'ri-layout-column-fill' },
  { id: 'roller-shades', label: 'Cortinas Enrollables', icon: 'ri-layout-right-line' },
  { id: 'cellular-shades', label: 'Cortinas Celulares', icon: 'ri-grid-line' },
  { id: 'roman-shades', label: 'Cortinas Romanas', icon: 'ri-layout-top-line' },
  { id: 'motorized', label: 'Motorizadas', icon: 'ri-remote-control-line' },
];

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeMenuCategory, setActiveMenuCategory] = useState('all');
  const [liveProducts, setLiveProducts] = useState<typeof mockProducts>(mockProducts);
  const { language } = useLanguage();
  const navigate = useNavigate();

  const menuCategories = language === 'en' ? menuCategoriesEn : menuCategoriesEs;
  const displayCategories = language === 'en' ? categories : categoriesEs;

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
      const { categoryId } = (e as CustomEvent).detail;
      if (categoryId) setSelectedCategory(categoryId);
      setActiveMenuCategory(categoryId || 'all');
    };
    window.addEventListener('filterProducts', handler);
    return () => window.removeEventListener('filterProducts', handler);
  }, []);

  // Listen for admin product updates
  useEffect(() => {
    const handler = (e: Event) => {
      setLiveProducts((e as CustomEvent).detail);
    };
    window.addEventListener('productsUpdated', handler);
    return () => window.removeEventListener('productsUpdated', handler);
  }, []);

  const handleMenuCategory = (cat: typeof menuCategories[0]) => {
    setActiveMenuCategory(cat.categoryId);
    setSelectedCategory(cat.categoryId);
  };

  const filteredProducts = selectedCategory === 'all'
    ? liveProducts
    : liveProducts.filter((p: { category: string }) => p.category === selectedCategory);

  return (
    <section id="products" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 gap-4">
          <div className="text-center md:text-left">
            <p className="text-green-700 text-sm font-semibold uppercase tracking-widest mb-2">
              {language === 'en' ? "Today's Deals" : 'Ofertas de Hoy'}
            </p>
            <h2 className="text-4xl font-bold text-gray-900 mb-3">
              {language === 'en' ? 'Shop Our Blinds & Shades' : 'Compra Nuestras Persianas y Cortinas'}
            </h2>
            <p className="text-gray-500 max-w-xl text-base">
              {language === 'en'
                ? 'Custom-made to your exact measurements. Free samples available on every style.'
                : 'Hechas a medida exacta. Muestras gratis disponibles en cada estilo.'}
            </p>
          </div>
          <button
            onClick={() => navigate('/products')}
            className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 border-2 border-green-700 text-green-700 text-sm font-bold rounded-md hover:bg-green-700 hover:text-white transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0"
          >
            {language === 'en' ? 'View Full Catalog' : 'Ver Catálogo Completo'}
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-arrow-right-line"></i>
            </div>
          </button>
        </div>

        {/* Main menu category tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {menuCategories.map((cat) => (
            <button
              key={cat.categoryId + cat.label}
              onClick={() => handleMenuCategory(cat)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap border ${
                activeMenuCategory === cat.categoryId
                  ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400 hover:text-gray-900'
              }`}
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className={`${cat.icon} text-sm`}></i>
              </div>
              {cat.label}
            </button>
          ))}
        </div>

        <div className="border-t border-gray-200 mb-6"></div>

        {/* Category filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {displayCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setActiveMenuCategory(cat.id);
              }}
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

        {/* Products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-product-shop>
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm mb-4">
            {language === 'en' ? "Can't find what you're looking for?" : '¿No encuentras lo que buscas?'}
          </p>
          <button
            onClick={() => {
              const el = document.getElementById('contact');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-green-700 text-green-700 font-semibold rounded-md hover:bg-green-700 hover:text-white transition-all duration-200 cursor-pointer whitespace-nowrap"
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-customer-service-2-line"></i>
            </div>
            {language === 'en' ? 'Talk to a Design Expert' : 'Habla con un Experto en Diseño'}
          </button>
        </div>
      </div>
    </section>
  );
}
