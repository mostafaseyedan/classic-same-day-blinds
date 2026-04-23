import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { products as mockProducts } from '../../mocks/products';
import { productReviews } from '../../mocks/reviews';
import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';
import { useLanguage } from '../../contexts/LanguageContext';
import { loadProductsFromDB } from '../../utils/productStorage';
import DimensionSelector from './components/DimensionSelector';
import RestockNotification from './components/RestockNotification';
import FrequentlyBoughtTogether from './components/FrequentlyBoughtTogether';
import AffirmFinancingCalculator from './components/AffirmFinancingCalculator';
import RecentlyViewedDrawer from '../../components/feature/RecentlyViewedDrawer';
import WishlistButton from '../../components/feature/WishlistButton';

const MXN_RATE = 17.5;

const featuresByCategory: Record<string, { en: string; es: string }[]> = {
  'vertical-blinds': [
    { en: 'Durable PVC or fabric vanes', es: 'Lamas de PVC o tela duraderas' },
    { en: 'Full-width traverse & tilt control', es: 'Control de travesía e inclinación de ancho completo' },
    { en: 'Ideal for sliding doors & large windows', es: 'Ideal para puertas corredizas y ventanas grandes' },
    { en: 'Child-safe wand operation — no cords', es: 'Operación con varilla segura para niños — sin cordones' },
    { en: 'Custom width & drop, cut to your exact size', es: 'Ancho y caída personalizados, cortados a tu medida exacta' },
    { en: 'Available in light filtering & room-darkening', es: 'Disponible en filtrado de luz y oscurecimiento de habitación' },
  ],
  'wood-blinds': [
    { en: 'Real wood or faux wood construction', es: 'Construcción de madera real o madera sintética' },
    { en: 'Moisture-resistant finish', es: 'Acabado resistente a la humedad' },
    { en: 'Cordless lift option', es: 'Opción de elevación sin cordón' },
    { en: 'Multiple slat sizes: 2" or 2.5"', es: 'Múltiples tamaños de lamas: 2" o 2.5"' },
    { en: 'Custom stain & paint colors', es: 'Colores de tintura y pintura personalizados' },
  ],
  'roller-shades': [
    { en: 'Light filtering or blackout fabric', es: 'Tela filtrante de luz o blackout' },
    { en: 'Smooth chain or cordless operation', es: 'Operación suave con cadena o sin cordón' },
    { en: 'Wipe-clean surface', es: 'Superficie de fácil limpieza' },
    { en: 'Custom width & drop', es: 'Ancho y caída personalizados' },
    { en: 'Optional motorization', es: 'Motorización opcional' },
  ],
  'cellular-shades': [
    { en: 'Honeycomb cell insulation', es: 'Aislamiento de celda en panal de abeja' },
    { en: 'Single, double, or triple cell', es: 'Celda simple, doble o triple' },
    { en: 'Top-down/bottom-up option', es: 'Opción de arriba hacia abajo / abajo hacia arriba' },
    { en: 'Energy Star certified', es: 'Certificado Energy Star' },
    { en: 'Cordless or motorized', es: 'Sin cordón o motorizado' },
  ],
  'roman-shades': [
    { en: 'Premium fabric options', es: 'Opciones de tela premium' },
    { en: 'Flat, hobbled, or relaxed fold', es: 'Pliegue plano, escalonado o relajado' },
    { en: 'Blackout lining available', es: 'Forro blackout disponible' },
    { en: 'Custom sizing', es: 'Tamaño personalizado' },
    { en: 'Cordless lift', es: 'Elevación sin cordón' },
  ],
  'motorized': [
    { en: 'App & voice control', es: 'Control por app y voz' },
    { en: 'Alexa, Google & HomeKit compatible', es: 'Compatible con Alexa, Google y HomeKit' },
    { en: 'Rechargeable battery or hardwired', es: 'Batería recargable o cableado fijo' },
    { en: 'Quiet motor technology', es: 'Tecnología de motor silencioso' },
    { en: 'Schedule & automation', es: 'Programación y automatización' },
  ],
};

const defaultFeatures: { en: string; es: string }[] = [
  { en: 'Custom made to order', es: 'Fabricado a medida bajo pedido' },
  { en: 'Free samples available', es: 'Muestras gratuitas disponibles' },
  { en: 'Expert installation support', es: 'Soporte experto de instalación' },
  { en: 'Child-safe cordless options', es: 'Opciones sin cordón seguras para niños' },
  { en: '3-year warranty', es: 'Garantía de 3 años' },
];

const colorOptions = ['White', 'Ivory', 'Gray', 'Beige', 'Espresso', 'Natural'];
const mountOptions = ['Inside Mount', 'Outside Mount'];

const colorImages: Record<string, string> = {
  White:    'https://readdy.ai/api/search-image?query=Window%20blinds%20in%20crisp%20pure%20white%20color%2C%20clean%20modern%20interior%2C%20bright%20natural%20light%2C%20minimalist%20room%2C%20professional%20product%20photography%2C%20white%20walls%2C%20simple%20elegant%20decor&width=400&height=500&seq=color-white-blind&orientation=portrait',
  Ivory:    'https://readdy.ai/api/search-image?query=Window%20blinds%20in%20warm%20ivory%20cream%20color%2C%20cozy%20living%20room%2C%20soft%20warm%20lighting%2C%20elegant%20interior%2C%20professional%20product%20photography%2C%20neutral%20tones%2C%20classic%20home%20decor&width=400&height=500&seq=color-ivory-blind&orientation=portrait',
  Gray:     'https://readdy.ai/api/search-image?query=Window%20blinds%20in%20modern%20cool%20gray%20color%2C%20contemporary%20bedroom%2C%20sleek%20minimal%20interior%2C%20professional%20product%20photography%2C%20gray%20tones%2C%20modern%20home%20design&width=400&height=500&seq=color-gray-blind&orientation=portrait',
  Beige:    'https://readdy.ai/api/search-image?query=Window%20blinds%20in%20soft%20sandy%20beige%20color%2C%20warm%20neutral%20living%20space%2C%20natural%20light%2C%20professional%20interior%20photography%2C%20earthy%20tones%2C%20comfortable%20home%20atmosphere&width=400&height=500&seq=color-beige-blind&orientation=portrait',
  Espresso: 'https://readdy.ai/api/search-image?query=Window%20blinds%20in%20rich%20dark%20espresso%20brown%20color%2C%20sophisticated%20study%20or%20office%2C%20warm%20wood%20tones%2C%20professional%20interior%20photography%2C%20dark%20elegant%20decor%2C%20luxury%20home&width=400&height=500&seq=color-espresso-blind&orientation=portrait',
  Natural:  'https://readdy.ai/api/search-image?query=Window%20blinds%20in%20natural%20wood%20grain%20tan%20color%2C%20organic%20bohemian%20living%20room%2C%20warm%20earthy%20tones%2C%20natural%20materials%2C%20professional%20interior%20photography%2C%20plants%20and%20rattan%20decor&width=400&height=500&seq=color-natural-blind&orientation=portrait',
};

// Tax rate (applied to all products)
const TAX_RATE = 0.0825; // 8.25%

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();

  // Live product list — loads from IndexedDB first, falls back to mocks
  const [allProducts, setAllProducts] = useState<typeof mockProducts>(mockProducts);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    loadProductsFromDB().then((stored) => {
      if (!cancelled) {
        if (stored && stored.length > 0) {
          setAllProducts(stored as typeof mockProducts);
        }
        setProductsLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  // Keep in sync when admin saves changes
  useEffect(() => {
    const handler = (e: Event) => {
      setAllProducts((e as CustomEvent).detail);
    };
    window.addEventListener('productsUpdated', handler);
    return () => window.removeEventListener('productsUpdated', handler);
  }, []);

  // Show sticky cart bar when the main Add to Cart row scrolls out of view
  useEffect(() => {
    const el = cartButtonRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setShowStickyCart(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-80px 0px 0px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const product = allProducts.find((p) => p.id === Number(id));

  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
  const [selectedMount, setSelectedMount] = useState(mountOptions[0]);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [widthInches, setWidthInches] = useState(24);
  const [widthEighths, setWidthEighths] = useState('0/0');
  const [heightInches, setHeightInches] = useState(36);
  const [heightEighths, setHeightEighths] = useState('0/0');
  const [qty, setQty] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'measure' | 'install'>('details');
  const [scrolled] = useState(false);
  const [showStickyCart, setShowStickyCart] = useState(false);
  const cartButtonRef = useRef<HTMLDivElement>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxTab, setLightboxTab] = useState<'photos' | 'videos'>('photos');
  const [recentlyViewed, setRecentlyViewed] = useState<typeof mockProducts>([]);
  const [reviewSort, setReviewSort] = useState<'recent' | 'highest' | 'lowest'>('recent');
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewStarFilter, setReviewStarFilter] = useState<number | null>(null);

  // Auto pricing engine — resolves current month's price for tracked products
  const effectivePrice = product?.price ?? 0;
  const effectiveOriginalPrice = product?.originalPrice ?? 0;

  // Determine whether this product has admin-uploaded images
  const hasCustomImages = !!(product as any)?.images && (product as any).images.length > 0;
  const productImages: string[] = hasCustomImages
    ? (product as any).images
    : Object.values(colorImages);

  // Active main image
  const currentImage = hasCustomImages
    ? (productImages[selectedImageIdx] ?? productImages[0])
    : (colorImages[selectedColor] ?? product?.image ?? '');

  // Get reviews for this product
  const productReviewsList = productReviews.filter((r) => r.productId === `prod-${String(id).padStart(3, '0')}`);
  
  // Use the product's own reviews count (from mock data) as the authoritative number
  // Fall back to mock product reviews field if the loaded product has 0 or undefined
  const mockProductReviews = mockProducts.find((p) => p.id === Number(id))?.reviews ?? 0;
  const displayReviewCount = (product?.reviews && product.reviews > 0) ? product.reviews : mockProductReviews;

  // Calculate review statistics based on actual review objects
  const totalReviews = productReviewsList.length;
  const averageRating = totalReviews > 0 
    ? productReviewsList.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
    : (product?.rating ?? 0);
  
  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: productReviewsList.filter((r) => r.rating === star).length,
    percentage: totalReviews > 0 ? (productReviewsList.filter((r) => r.rating === star).length / totalReviews) * 100 : 0,
  }));

  // Sort reviews
  const sortedReviews = [...productReviewsList].sort((a, b) => {
    if (reviewSort === 'recent') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (reviewSort === 'highest') {
      return b.rating - a.rating;
    } else {
      return a.rating - b.rating;
    }
  });

  const filteredReviews = reviewStarFilter !== null
    ? sortedReviews.filter((r) => r.rating === reviewStarFilter)
    : sortedReviews;

  const REVIEWS_PER_PAGE = 10;
  const visibleReviews = filteredReviews.slice(0, reviewPage * REVIEWS_PER_PAGE);
  const hasMoreReviews = visibleReviews.length < filteredReviews.length;

  // Track recently viewed products
  useEffect(() => {
    if (!product) return;

    // Save last viewed product path for "Continue Shopping" in cart
    localStorage.setItem('last_viewed_product', `/product/${product.id}`);

    // Get existing recently viewed from localStorage
    const stored = localStorage.getItem('recently_viewed');
    let viewedIds: number[] = stored ? JSON.parse(stored) : [];

    // Remove current product if it exists
    viewedIds = viewedIds.filter((vid) => vid !== product.id);

    // Add current product to the beginning
    viewedIds.unshift(product.id);

    // Keep only the last 8
    viewedIds = viewedIds.slice(0, 8);

    // Save back to localStorage
    localStorage.setItem('recently_viewed', JSON.stringify(viewedIds));

    // Load recently viewed products (excluding current)
    const recentProducts = viewedIds
      .filter((vid) => vid !== product.id)
      .map((vid) => allProducts.find((p) => p.id === vid))
      .filter((p): p is typeof mockProducts[0] => p !== undefined);

    setRecentlyViewed(recentProducts);
  }, [product, allProducts]);

  useEffect(() => {
    setSelectedColor(colorOptions[0]);
    setSelectedMount(mountOptions[0]);
    setSelectedImageIdx(0);
    setWidthInches(24);
    setWidthEighths('0/0');
    setHeightInches(36);
    setHeightEighths('0/0');
    setQty(1);
    setAddedToCart(false);
    setActiveTab('details');
    setReviewPage(1);
    setReviewStarFilter(null);
    if ((location.state as any)?.scrollToReviews) {
      setTimeout(() => {
        document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 350);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [id]);

  // Show loader while IndexedDB is being read
  if (productsLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 flex items-center justify-center animate-spin text-green-700">
          <i className="ri-loader-4-line text-2xl"></i>
        </div>
        <p className="text-gray-500 text-sm">Loading product…</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-600 text-lg">
          {language === 'es' ? 'Producto no encontrado.' : 'Product not found.'}
        </p>
        <button onClick={() => navigate('/')} className="px-5 py-2 bg-green-700 text-white rounded-md cursor-pointer whitespace-nowrap">
          {language === 'es' ? 'Volver al Inicio' : 'Back to Home'}
        </button>
      </div>
    );
  }

  const discount = Math.round(((effectiveOriginalPrice - effectivePrice) / effectiveOriginalPrice) * 100);
  const hasDiscount = effectivePrice > 0 && effectivePrice < effectiveOriginalPrice;
  const rawFeatures = featuresByCategory[product.category] ?? defaultFeatures;
  const features = rawFeatures.map((f) => language === 'es' ? f.es : f.en);

  const displayName = language === 'es' ? ((product as any).nameEs ?? product.name) : product.name;
  const displayDescription = language === 'es' ? ((product as any).descriptionEs ?? product.description) : product.description;

  const relatedProducts = allProducts.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  const handleAddToCart = () => {
    if (product.inventory === 0) return;
    const widthDisplay = widthEighths === '0/0' ? `${widthInches}"` : `${widthInches} ${widthEighths}"`;
    const heightDisplay = heightEighths === '0/0' ? `${heightInches}"` : `${heightInches} ${heightEighths}"`;
    const existing = JSON.parse(localStorage.getItem('cart') ?? '[]');
    const existingIndex = existing.findIndex(
      (item: { id: number; color: string; mount: string }) =>
        item.id === product.id && item.color === selectedColor && item.mount === selectedMount
    );
    if (existingIndex >= 0) {
      existing[existingIndex].quantity += qty;
    } else {
      existing.push({
        id: product.id,
        name: product.name,
        price: effectivePrice,
        image: product.image,
        category: product.category,
        color: selectedColor,
        mount: selectedMount,
        width: widthDisplay,
        height: heightDisplay,
        quantity: qty,
      });
    }
    localStorage.setItem('cart', JSON.stringify(existing));
    setAddedToCart(true);
    setTimeout(() => {
      setAddedToCart(false);
      navigate('/cart');
    }, 800);
  };

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

  const badgeTranslations: Record<string, string> = {
    'Best Seller': 'Más Vendido',
    'Sale': 'Oferta',
    'Top Rated': 'Mejor Valorado',
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

  const colorTranslations: Record<string, string> = {
    'White': 'Blanco',
    'Ivory': 'Marfil',
    'Gray': 'Gris',
    'Beige': 'Beige',
    'Espresso': 'Espresso',
    'Natural': 'Natural',
  };

  const mountTranslations: Record<string, string> = {
    'Inside Mount': 'Montaje Interior',
    'Outside Mount': 'Montaje Exterior',
  };

  const measureSteps = language === 'es' ? [
    { step: '1', title: 'Elige Montaje Interior o Exterior', desc: 'El montaje interior encaja dentro del marco de la ventana. El montaje exterior cubre el marco y puede hacer que las ventanas parezcan más grandes.' },
    { step: '2', title: 'Mide el Ancho', desc: 'Para montaje interior, mide el ancho exacto en la parte superior, media e inferior. Usa la medida más estrecha. Para montaje exterior, agrega 3–4 pulgadas a cada lado.' },
    { step: '3', title: 'Mide la Altura', desc: 'Para montaje interior, mide desde la parte superior de la abertura hasta el alféizar. Para montaje exterior, agrega 3–4 inches above and below.' },
    { step: '4', title: 'Ingresa tus Medidas', desc: 'Ingresa tus medidas en los campos de arriba. Cortamos cada persiana a tus especificaciones exactas.' },
  ] : [
    { step: '1', title: 'Choose Inside or Outside Mount', desc: 'Inside mount fits within the window frame. Outside mount covers the frame and can make windows appear larger.' },
    { step: '2', title: 'Measure Width', desc: 'For inside mount, measure the exact width at the top, middle, and bottom. Use the narrowest measurement. For outside mount, add 3–4 inches on each side.' },
    { step: '3', title: 'Measure Height', desc: 'For inside mount, measure from the top of the opening to the sill. For outside mount, add 3–4 inches above and below.' },
    { step: '4', title: 'Enter Your Dimensions', desc: 'Enter your measurements in the fields above. We custom-cut every blind to your exact specifications.' },
  ];

  const installSteps = language === 'es' ? [
    { step: '1', title: 'Reúne tus Herramientas', desc: 'Necesitarás un taladro, nivel, cinta métrica y el hardware incluido. La mayoría de las instalaciones toman menos de 30 minutos.' },
    { step: '2', title: 'Marca las Posiciones de los Soportes', desc: 'Usa un lápiz y nivel para marcar dónde irán los soportes de montaje. Asegúrate de que estén espaciados uniformemente.' },
    { step: '3', title: 'Instala los Soportes', desc: 'Perfora agujeros guía y asegura los soportes con los tornillos incluidos. Verifica que estén nivelados.' },
    { step: '4', title: 'Snap in the Blind', desc: 'Slide or snap the headrail into the brackets. Test the operation before finishing.' },
  ] : [
    { step: '1', title: 'Gather Your Tools', desc: 'You\'ll need a drill, level, measuring tape, and the included hardware. Most installs take under 30 minutes.' },
    { step: '2', title: 'Mark Bracket Positions', desc: 'Use a pencil and level to mark where the mounting brackets will go. Ensure they are evenly spaced.' },
    { step: '3', title: 'Install Brackets', desc: 'Drill pilot holes and secure the brackets with the provided screws. Check that they are level.' },
    { step: '4', title: 'Snap in the Blind', desc: 'Slide or snap the headrail into the brackets. Test the operation before finishing.' },
  ];

  const trustBadges = language === 'es' ? [
    { icon: 'ri-truck-line', text: 'Envío Gratis +$99' },
    { icon: 'ri-scissors-cut-line', text: 'Hecho a Medida' },
    { icon: 'ri-shield-check-line', text: 'Garantía 3 Años' },
  ] : [
    { icon: 'ri-truck-line', text: 'Free Shipping $99+' },
    { icon: 'ri-scissors-cut-line', text: 'Custom Made' },
    { icon: 'ri-shield-check-line', text: '3-Year Warranty' },
  ];

  const displayBadge = product.badge
    ? (language === 'es' ? (badgeTranslations[product.badge] ?? product.badge) : product.badge)
    : null;

  const getStockStatus = (inventory: number) => {
    if (inventory === 0) return { label: language === 'es' ? 'Sin Stock' : 'Out of Stock', color: 'text-red-600 bg-red-50 border-red-200', dot: 'bg-red-500', icon: 'ri-close-circle-line' };
    if (inventory <= 10) return { label: language === 'es' ? `Solo quedan ${inventory}` : `Only ${inventory} left`, color: 'text-amber-700 bg-amber-50 border-amber-200', dot: 'bg-amber-500', icon: 'ri-error-warning-line' };
    if (inventory <= 25) return { label: language === 'es' ? `Stock bajo — ${inventory} disponibles` : `Low Stock — ${inventory} available`, color: 'text-amber-600 bg-amber-50 border-amber-200', dot: 'bg-amber-400', icon: 'ri-alert-line' };
    return { label: language === 'es' ? 'En Stock' : 'In Stock', color: 'text-green-700 bg-green-50 border-green-200', dot: 'bg-green-500', icon: 'ri-checkbox-circle-line' };
  };

  const stockStatus = getStockStatus(product.inventory ?? 0);
  const isOutOfStock = (product.inventory ?? 0) === 0;

  // Gallery images built from all color variants
  const galleryImages = productImages;

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxTab('photos');
    setLightboxOpen(true);
  };

  // Determine which color options to show
  const productColorOptions: { name: string; hex: string }[] =
    (product as any).colorOptions && (product as any).colorOptions.length > 0
      ? (product as any).colorOptions
      : [];

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar scrolled={scrolled} />

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-[#12172a] flex flex-col">
          {/* Top bar */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-white/10">
            <button
              className="w-9 h-9 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              onClick={() => setLightboxOpen(false)}
            >
              <i className="ri-close-line text-xl"></i>
            </button>
            <span className="text-white text-sm font-semibold tracking-widest">
              {lightboxIndex + 1} OF {galleryImages.length}
            </span>
            <div className="w-9" />
          </div>

          {/* Body */}
          <div className="flex flex-1 overflow-hidden">
            {/* Main image area */}
            <div className="flex-1 relative flex items-center justify-center bg-[#0e1220] px-8">
              <img
                src={galleryImages[lightboxIndex]}
                alt={`${product.name} photo ${lightboxIndex + 1}`}
                className="max-h-full max-w-full object-contain rounded-lg"
              />
              {/* Prev arrow */}
              {lightboxIndex > 0 && (
                <button
                  className="absolute left-4 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/25 text-white rounded-full transition-colors cursor-pointer"
                  onClick={() => setLightboxIndex((i) => i - 1)}
                >
                  <i className="ri-arrow-left-s-line text-2xl"></i>
                </button>
              )}
              {/* Next arrow */}
              {lightboxIndex < galleryImages.length - 1 && (
                <button
                  className="absolute right-4 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/25 text-white rounded-full transition-colors cursor-pointer"
                  onClick={() => setLightboxIndex((i) => i + 1)}
                >
                  <i className="ri-arrow-right-s-line text-2xl"></i>
                </button>
              )}
            </div>

            {/* Right panel */}
            <div className="w-64 flex flex-col border-l border-white/10 bg-[#12172a]">
              {/* Tabs */}
              <div className="flex flex-col gap-1 px-4 pt-5 pb-3">
                <button
                  onClick={() => setLightboxTab('photos')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${lightboxTab === 'photos' ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white hover:bg-white/10'}`}
                >
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className="ri-image-2-line text-base"></i>
                  </div>
                  Photos
                </button>
                <button
                  onClick={() => setLightboxTab('videos')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${lightboxTab === 'videos' ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white hover:bg-white/10'}`}
                >
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className="ri-film-line text-base"></i>
                  </div>
                  Videos
                </button>
              </div>

              {/* Thumbnail grid */}
              <div className="flex-1 overflow-y-auto px-3 pb-4">
                {lightboxTab === 'photos' ? (
                  <div className="grid grid-cols-2 gap-2">
                    {galleryImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setLightboxIndex(idx)}
                        className={`relative w-full aspect-square rounded-md overflow-hidden cursor-pointer transition-all ${lightboxIndex === idx ? 'ring-2 ring-white' : 'opacity-60 hover:opacity-100'}`}
                      >
                        <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover object-top" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 gap-3">
                    <div className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-full">
                      <i className="ri-video-off-line text-2xl text-white/40"></i>
                    </div>
                    <p className="text-white/40 text-sm text-center">No videos available for this product</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="h-[calc(2.25rem+1.75rem+3.5rem+2.75rem)] sm:h-[calc(2.75rem+1.75rem+3.5rem+2.75rem)]"></div>

      {/* Back to Home bar */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 text-white text-sm font-semibold rounded-md transition-all duration-200 cursor-pointer whitespace-nowrap"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-arrow-left-line"></i>
            </div>
            {language === 'es' ? 'Volver al Inicio' : 'Back to Home'}
          </button>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center gap-2 text-sm text-gray-500">
          <Link to="/" className="hover:text-green-700 transition-colors cursor-pointer">
            {language === 'es' ? 'Inicio' : 'Home'}
          </Link>
          <i className="ri-arrow-right-s-line text-gray-400"></i>
          <button
            onClick={() => { navigate('/'); setTimeout(() => { document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }); }, 100); }}
            className="hover:text-green-700 transition-colors cursor-pointer"
          >
            {language === 'es' ? 'Tienda de Persianas y Cortinas' : 'Shop Our Blinds & Shades'}
          </button>
          <i className="ri-arrow-right-s-line text-gray-400"></i>
          <span className="text-gray-800 font-medium truncate max-w-xs">{displayName}</span>
        </nav>
      </div>

      {/* Main product section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Left: Image */}
          <div className="relative">
            <div
              className="w-full h-64 sm:h-96 lg:h-[520px] rounded-2xl overflow-hidden bg-gray-50 shadow-sm cursor-zoom-in"
              onClick={() => openLightbox(hasCustomImages ? selectedImageIdx : Object.keys(colorImages).indexOf(selectedColor))}
            >
              <img
                src={currentImage}
                alt={`${product.name}`}
                className="w-full h-full object-contain transition-all duration-500 hover:scale-110"
              />
              <div className="absolute bottom-3 right-3 bg-black/40 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 pointer-events-none">
                <i className="ri-zoom-in-line text-sm"></i>
                <span>Click to enlarge</span>
              </div>
            </div>
            {displayBadge && (
              <span className={`absolute top-4 left-4 text-xs font-bold px-3 py-1.5 rounded-full shadow ${badgeColors[product.badge!] ?? 'bg-gray-700 text-white'}`}>
                {displayBadge}
              </span>
            )}
            {hasDiscount && (
              <span className="absolute top-4 right-4 bg-white text-red-600 text-sm font-bold px-3 py-1.5 rounded-full shadow">
                -{discount}% {language === 'es' ? 'DESC' : 'OFF'}
              </span>
            )}

            {/* Thumbnails — uploaded images or default color swatches */}
            {hasCustomImages ? (
              /* Custom uploaded image thumbnails */
              <div className="flex gap-2 sm:gap-3 mt-4 flex-wrap">
                {productImages.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`w-14 h-14 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${selectedImageIdx === idx ? 'border-green-700 ring-2 ring-green-300' : 'border-gray-200 hover:border-green-400'}`}
                  >
                    <img src={img} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover object-top" />
                  </div>
                ))}
              </div>
            ) : (
              /* Default color thumbnails */
              <div className="flex gap-2 sm:gap-3 mt-4 flex-wrap">
                {colorOptions.map((c) => (
                  <div
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`w-14 h-14 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${selectedColor === c ? 'border-green-700 ring-2 ring-green-300' : 'border-gray-200 hover:border-green-400'}`}
                  >
                    <img src={colorImages[c]} alt={c} className="w-full h-full object-cover object-top" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-green-700 text-xs font-bold uppercase tracking-widest mb-1 capitalize">
                {product.category.replace('-', ' ')}
              </p>
              <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-2">{displayName}</h1>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-4 h-4 flex items-center justify-center">
                      <i className={`ri-star-${i < Math.floor(product.rating) ? 'fill' : 'line'} text-green-600 text-sm`}></i>
                    </div>
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-800">{product.rating}</span>
                <span className="text-sm text-gray-500">({displayReviewCount.toLocaleString()} {language === 'es' ? 'reseñas' : 'reviews'})</span>
              </div>

              {/* Price block */}
              <div className="flex items-baseline gap-3 mb-1 flex-wrap">
                <span className="text-4xl font-bold text-gray-900">${effectivePrice.toFixed(2)}</span>
                {hasDiscount && (
                  <>
                    <span className="text-xl text-gray-400 line-through">${effectiveOriginalPrice.toFixed(2)}</span>
                    <span className="text-sm font-bold text-red-500">
                      {language === 'es' ? 'Ahorra' : 'Save'} ${(effectiveOriginalPrice - effectivePrice).toFixed(2)}
                    </span>
                  </>
                )}
              </div>

              {/* Tax line */}
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm text-gray-500">
                  {language === 'es' ? 'Impuesto est.' : 'Est. tax:'}{' '}
                  <span className="font-semibold text-gray-700">${(effectivePrice * TAX_RATE).toFixed(2)}</span>
                </span>
                <span className="text-xs text-gray-400">&middot;</span>
                <span className="text-sm font-bold text-gray-800">
                  {language === 'es' ? 'Total est.' : 'Est. total:'}{' '}
                  <span className="text-green-700">${(effectivePrice * (1 + TAX_RATE)).toFixed(2)}</span>
                </span>
              </div>

              {language === 'es' && (
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <span className="text-2xl font-bold text-green-700">
                    ${(effectivePrice * MXN_RATE).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                  </span>
                  {hasDiscount && (
                    <span className="text-base text-gray-400 line-through">
                      ${(effectiveOriginalPrice * MXN_RATE).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                    </span>
                  )}
                </div>
              )}
              {language === 'es' && (
                <p className="text-xs text-amber-600 font-medium mb-1">
                  Tipo de cambio aprox.: $1 USD = ${MXN_RATE} MXN
                </p>
              )}
              {language === 'es' && (
                <p className="text-xs text-gray-500 mb-4">
                  {language === 'es'
                    ? 'Precio inicial por persiana. El precio final se basa en tus medidas personalizadas.'
                    : 'Starting price per blind. Final price based on your custom dimensions.'}
                </p>
              )}

            </div>

            {/* Affirm Financing Calculator */}
            {effectivePrice >= 50 && (
              <AffirmFinancingCalculator price={effectivePrice} language={language} />
            )}

            <p className="text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">{displayDescription}</p>

            {/* Color options — admin-defined or default */}
            {productColorOptions.length > 0 ? (
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-2">
                  {language === 'es' ? 'Color disponible:' : 'Available Colors:'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {productColorOptions.map((c) => (
                    <div
                      key={c.name}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium border border-gray-200 text-gray-700 bg-white"
                    >
                      <span className="w-4 h-4 rounded-full border border-gray-300 shrink-0" style={{ backgroundColor: c.hex }}></span>
                      {c.name}
                    </div>
                  ))}
                </div>
              </div>
            ) : !hasCustomImages ? (
              /* Default color selector for built-in products */
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-2">
                  {language === 'es' ? 'Color: ' : 'Color: '}
                  <span className="font-normal text-gray-600">
                    {language === 'es' ? (colorTranslations[selectedColor] ?? selectedColor) : selectedColor}
                  </span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all cursor-pointer whitespace-nowrap ${selectedColor === c ? 'border-green-700 bg-green-50 text-green-800' : 'border-gray-200 text-gray-600 hover:border-green-400'}`}
                    >
                      {language === 'es' ? (colorTranslations[c] ?? c) : c}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Mount */}
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-2">
                {language === 'es' ? 'Tipo de Montaje' : 'Mount Type'}
              </p>
              <div className="flex gap-3">
                {mountOptions.map((m) => (
                  <button
                    key={m}
                    onClick={() => setSelectedMount(m)}
                    className={`flex-1 py-2 rounded-md text-sm font-medium border transition-all cursor-pointer whitespace-nowrap ${selectedMount === m ? 'border-green-700 bg-green-50 text-green-800' : 'border-gray-200 text-gray-600 hover:border-green-400'}`}
                  >
                    {language === 'es' ? (mountTranslations[m] ?? m) : m}
                  </button>
                ))}
              </div>
            </div>

            {/* Dimensions */}
            <DimensionSelector
              widthInches={widthInches}
              widthEighths={widthEighths}
              heightInches={heightInches}
              heightEighths={heightEighths}
              onWidthInchesChange={setWidthInches}
              onWidthEighthsChange={setWidthEighths}
              onHeightInchesChange={setHeightInches}
              onHeightEighthsChange={setHeightEighths}
            />

            {/* Qty + Add to Cart */}
            <div ref={cartButtonRef} className="flex items-center gap-3 pt-2">
              <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 cursor-pointer text-lg">−</button>
                <span className="w-10 text-center text-sm font-semibold text-gray-800">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 cursor-pointer text-lg">+</button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 py-3 font-bold rounded-md transition-colors cursor-pointer whitespace-nowrap text-sm flex items-center justify-center gap-2 ${isOutOfStock ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-green-700 text-white hover:bg-green-800'}`}
              >
                {isOutOfStock ? (
                  <><i className="ri-close-circle-line"></i> {language === 'es' ? 'Sin Stock' : 'Out of Stock'}</>
                ) : addedToCart ? (
                  <><i className="ri-check-line"></i> {language === 'es' ? '¡Agregado al Carrito!' : 'Added to Cart!'}</>
                ) : (
                  <><i className="ri-shopping-cart-line"></i> {language === 'es' ? 'Agregar al Carrito' : 'Add to Cart'}</>
                )}
              </button>
              <WishlistButton productId={product.id} size="lg" />
            </div>

            {/* Stock Status Badge */}
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-semibold ${stockStatus.color}`}>
              <span className={`w-2 h-2 rounded-full shrink-0 ${stockStatus.dot} ${isOutOfStock ? '' : 'animate-pulse'}`}></span>
              <div className="w-4 h-4 flex items-center justify-center shrink-0">
                <i className={`${stockStatus.icon} text-base`}></i>
              </div>
              <span>{stockStatus.label}</span>
              {!isOutOfStock && (product.inventory ?? 0) > 25 && (
                <span className="ml-auto text-xs font-normal opacity-70">
                  {language === 'es' ? `${product.inventory} unidades disponibles` : `${product.inventory} units available`}
                </span>
              )}
            </div>

            {/* Restock notification sign-up (out-of-stock only) */}
            {isOutOfStock && (
              <RestockNotification
                productId={product.id}
                productName={displayName}
                language={language}
              />
            )}

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-100">
              {trustBadges.map((b) => (
                <div key={b.text} className="flex flex-col items-center gap-1 text-center">
                  <div className="w-8 h-8 flex items-center justify-center text-green-700">
                    <i className={`${b.icon} text-xl`}></i>
                  </div>
                  <span className="text-xs text-gray-500 leading-tight">{b.text}</span>
                </div>
              ))}
            </div>

            {/* Same Day Delivery Banner */}
            <Link
              to="/same-day-delivery"
              className="group flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-green-700 to-emerald-600 hover:from-green-800 hover:to-emerald-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 flex items-center justify-center bg-white/20 rounded-lg shrink-0">
                  <i className="ri-flashlight-line text-white text-lg"></i>
                </div>
                <div>
                  <p className="text-xs font-bold text-green-100 uppercase tracking-widest leading-none mb-0.5">
                    {language === 'es' ? 'Entrega el Mismo Día' : 'Same Day Delivery Available'}
                  </p>
                  <p className="text-sm font-bold text-white whitespace-nowrap">
                    {language === 'es'
                      ? 'Haz clic aquí para ver nuestra política de entrega'
                      : 'Click here to see our same day delivery policy'}
                  </p>
                </div>
              </div>
              <div className="w-7 h-7 flex items-center justify-center text-green-600 shrink-0 group-hover:translate-x-1 transition-transform">
                <i className="ri-arrow-right-line text-xl"></i>
              </div>
            </Link>

          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16 border-b border-gray-200 overflow-x-auto">
          <div className="flex gap-0 min-w-max">
            {(['details', 'measure', 'install'] as const).map((tab) => {
              const tabLabel = tab === 'details'
                ? (language === 'es' ? 'Detalles del Producto' : 'Product Details')
                : tab === 'measure'
                ? (language === 'es' ? 'Cómo Medir' : 'How to Measure')
                : (language === 'es' ? 'Instalación' : 'Installation');
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${activeTab === tab ? 'border-green-700 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                >
                  {tabLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tabs content */}
        <div className="py-10 max-w-3xl">
          {activeTab === 'details' && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {language === 'es' ? 'Características Principales' : 'Key Features'}
              </h3>
              <ul className="space-y-3">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-gray-700">
                    <div className="w-5 h-5 flex items-center justify-center text-green-700 shrink-0 mt-0.5">
                      <i className="ri-check-double-line text-base"></i>
                    </div>
                    {f}
                  </li>
                ))}
              </ul>

              {/* Free Samples Clickable Banner */}
              <button
                onClick={() => navigate('/free-sample')}
                className="mt-8 w-full text-left group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-5 hover:from-green-100 hover:to-emerald-100 transition-all duration-300 hover:shadow-md hover:border-green-400">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 flex items-center justify-center bg-green-700 text-white rounded-xl shrink-0 group-hover:bg-green-800 transition-colors">
                        <i className="ri-gift-2-line text-2xl"></i>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-green-900 mb-0.5">
                          {language === 'es' ? '🎁 Muestras Gratuitas Disponibles' : '🎁 Free Samples Available'}
                        </p>
                        <p className="text-sm text-green-700 leading-relaxed">
                          {language === 'es'
                            ? 'Comparte tu experiencia con otros clientes' 
                            : 'Share your experience with other customers'}
                        </p>
                        <span className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-green-800 bg-green-200 px-3 py-1 rounded-full group-hover:bg-green-300 transition-colors whitespace-nowrap">
                          <i className="ri-arrow-right-circle-line"></i>
                          {language === 'es' ? 'Solicitar Muestra Gratis' : 'Request Your Free Sample'}
                        </span>
                      </div>
                    </div>
                    <div className="w-8 h-8 flex items-center justify-center text-green-600 shrink-0 group-hover:translate-x-1 transition-transform">
                      <i className="ri-arrow-right-line text-xl"></i>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          )}

          {activeTab === 'measure' && (
            <div className="space-y-5">
              <h3 className="text-lg font-bold text-gray-900">
                {language === 'es' ? 'Cómo Medir tu Ventana' : 'How to Measure Your Window'}
              </h3>
              {measureSteps.map((s) => (
                <div key={s.step} className="flex gap-4">
                  <div className="w-8 h-8 flex items-center justify-center bg-green-700 text-white text-sm font-bold rounded-full shrink-0">{s.step}</div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{s.title}</p>
                    <p className="text-sm text-gray-600 mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'install' && (
            <div className="space-y-5">
              <h3 className="text-lg font-bold text-gray-900">
                {language === 'es' ? 'Guía de Instalación' : 'Installation Guide'}
              </h3>
              {installSteps.map((s) => (
                <div key={s.step} className="flex gap-4">
                  <div className="w-8 h-8 flex items-center justify-center bg-green-700 text-white text-sm font-bold rounded-full shrink-0">{s.step}</div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{s.title}</p>
                    <p className="text-sm text-gray-600 mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
              <div className="p-5 bg-amber-50 rounded-xl border border-amber-100 mt-4">
                <p className="text-sm font-bold text-amber-800 mb-1">
                  {language === 'es' ? '¿Necesitas Instalación Profesional?' : 'Need Professional Installation?'}
                </p>
                <p className="text-sm text-amber-700">
                  {language === 'es'
                    ? 'Ofrecemos servicios de instalación profesional en la mayoría de las áreas. Contáctanos para programar una cita.'
                    : 'We offer professional installation services in most areas. Contact us to schedule.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Frequently Bought Together */}
        <FrequentlyBoughtTogether currentProduct={product} language={language} />

        {/* Reviews Section */}
        <div id="reviews" className="mt-16 border-t border-gray-100 pt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            {language === 'es' ? 'Reseñas de Clientes' : 'Customer Reviews'}
          </h2>

          {totalReviews === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4 bg-green-50 rounded-full">
                <i className="ri-star-fill text-3xl text-green-600"></i>
              </div>
              <div className="flex items-center justify-center gap-1.5 mb-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-5 h-5 flex items-center justify-center">
                    <i className={`ri-star-${i < Math.floor(product.rating) ? 'fill' : 'line'} text-green-600 text-lg`}></i>
                  </div>
                ))}
                <span className="text-lg font-bold text-gray-900 ml-1">{product.rating}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {displayReviewCount.toLocaleString()} {language === 'es' ? 'reseñas verificadas' : 'Verified Reviews'}
              </p>
              <p className="text-sm text-gray-500">
                {language === 'es' ? 'Comparte tu experiencia con otros clientes' : 'Share your experience with other customers'}
              </p>
            </div>
          ) : (
            <>
              {/* Review Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                {/* Average Rating */}
                <div className="flex flex-col items-center justify-center bg-green-50 rounded-xl p-6 border border-green-100">
                  <div className="text-5xl font-bold text-green-700 mb-2">
                    {product.rating.toFixed(1)}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-4 h-4 flex items-center justify-center">
                        <i className={`ri-star-${i < Math.floor(product.rating) ? 'fill' : 'line'} text-green-600 text-lg`}></i>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">
                    {language === 'es' 
                      ? `Basado en ${displayReviewCount.toLocaleString()} ${displayReviewCount === 1 ? 'Reseña' : 'Reseñas'}`
                      : `${displayReviewCount.toLocaleString()} ${displayReviewCount === 1 ? 'Review' : 'Reviews'}`
                    }
                  </p>
                </div>

                {/* Rating Distribution */}
                <div className="lg:col-span-2 space-y-3">
                  {ratingDistribution.map(({ star, count, percentage }) => (
                    <div key={star} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-16 shrink-0">
                        <span className="text-sm font-semibold text-gray-700">{star}</span>
                        <div className="w-4 h-4 flex items-center justify-center">
                          <i className="ri-star-fill text-green-600 text-sm"></i>
                        </div>
                      </div>
                      <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-600 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-800">
                  {reviewStarFilter !== null ? (
                    <>
                      {language === 'es'
                        ? `${filteredReviews.length} ${filteredReviews.length === 1 ? 'Reseña' : 'Reseñas'}`
                        : `${filteredReviews.length} ${filteredReviews.length === 1 ? 'Review' : 'Reviews'}`}
                      <span className="ml-2 text-xs font-normal text-green-700">
                        {language === 'es' ? `(filtrado: ${reviewStarFilter}★)` : `(filtered: ${reviewStarFilter}★)`}
                      </span>
                    </>
                  ) : (
                    language === 'es'
                      ? `${displayReviewCount.toLocaleString()} Reseñas`
                      : `${displayReviewCount.toLocaleString()} Reviews`
                  )}
                </p>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">
                    {language === 'es' ? 'Ordenar por:' : 'Sort by:'}
                  </label>
                  <select
                    value={reviewSort}
                    onChange={(e) => {
                      setReviewSort(e.target.value as 'recent' | 'highest' | 'lowest');
                      setReviewPage(1);
                    }}
                    className="text-sm border border-gray-200 rounded-md px-3 py-1.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-600 cursor-pointer"
                  >
                    <option value="recent">
                      {language === 'es' ? 'Más Recientes' : 'Most Recent'}
                    </option>
                    <option value="highest">
                      {language === 'es' ? 'Calificación Más Alta' : 'Highest Rated'}
                    </option>
                    <option value="lowest">
                      {language === 'es' ? 'Calificación Más Baja' : 'Lowest Rated'}
                    </option>
                  </select>
                </div>
              </div>

              {/* Star Filter Pills */}
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mr-1">
                  {language === 'es' ? 'Filtrar:' : 'Filter:'}
                </span>
                <button
                  onClick={() => { setReviewStarFilter(null); setReviewPage(1); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap ${reviewStarFilter === null ? 'bg-green-700 text-white border-green-700' : 'bg-white text-gray-600 border-gray-200 hover:border-green-400 hover:text-green-700'}`}
                >
                  {language === 'es' ? 'Todas' : 'All'}
                  <span className="ml-1 opacity-70">({displayReviewCount.toLocaleString()})</span>
                </button>
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = ratingDistribution.find((r) => r.star === star)?.count ?? 0;
                  if (count === 0) return null;
                  return (
                    <button
                      key={star}
                      onClick={() => { setReviewStarFilter(star); setReviewPage(1); }}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap ${reviewStarFilter === star ? 'bg-green-700 text-white border-green-700' : 'bg-white text-gray-600 border-gray-200 hover:border-green-400 hover:text-green-700'}`}
                    >
                      <div className="w-3 h-3 flex items-center justify-center">
                        <i className="ri-star-fill"></i>
                      </div>
                      {star}
                      <span className="opacity-70">({count})</span>
                    </button>
                  );
                })}
              </div>

              {/* Individual Reviews */}
              <div className="space-y-6">
                {visibleReviews.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3 bg-gray-100 rounded-full">
                      <i className="ri-star-line text-2xl text-gray-400"></i>
                    </div>
                    <p className="text-sm font-semibold text-gray-700">
                      {language === 'es' ? 'No hay reseñas con esta calificación' : 'No reviews for this rating'}
                    </p>
                  </div>
                ) : (
                  visibleReviews.map((review) => (
                    <div key={review.id} className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-sm font-bold text-gray-900 mb-1">{review.reviewerName}</p>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <div key={i} className="w-4 h-4 flex items-center justify-center">
                                  <i className={`ri-star-${i < review.rating ? 'fill' : 'line'} text-green-600 text-sm`}></i>
                                </div>
                              ))}
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(review.date).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full">
                          <div className="w-3 h-3 flex items-center justify-center">
                            <i className="ri-checkbox-circle-fill"></i>
                          </div>
                          {language === 'es' ? 'Verificado' : 'Verified'}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{review.comment}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Load More / Pagination */}
              <div className="mt-8 flex flex-col items-center gap-3">
                {visibleReviews.length > 0 && (
                  <p className="text-sm text-gray-500">
                    {language === 'es'
                      ? `Mostrando ${visibleReviews.length} de ${filteredReviews.length} reseñas`
                      : `Showing ${visibleReviews.length} of ${filteredReviews.length} reviews`}
                  </p>
                )}
                {hasMoreReviews && (
                  <button
                    onClick={() => setReviewPage((p) => p + 1)}
                    className="flex items-center gap-2 px-6 py-2.5 border border-green-700 text-green-700 font-semibold text-sm rounded-md hover:bg-green-50 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-arrow-down-line"></i>
                    {language === 'es' ? 'Ver más reseñas' : 'Load More Reviews'}
                  </button>
                )}
                {!hasMoreReviews && filteredReviews.length > REVIEWS_PER_PAGE && (
                  <button
                    onClick={() => setReviewPage(1)}
                    className="flex items-center gap-2 px-6 py-2.5 border border-gray-200 text-gray-500 font-semibold text-sm rounded-md hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-arrow-up-line"></i>
                    {language === 'es' ? 'Ver menos' : 'Show Less'}
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Recently Viewed Section — static grid for scroll-down view */}
        {recentlyViewed.length > 0 && (
          <div className="mt-8 border-t border-gray-100 pt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              {language === 'es' ? 'Vistos Recientemente' : 'Recently Viewed'}
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {recentlyViewed.map((rp) => {
                const rpDiscount = Math.round(((rp.originalPrice - rp.price) / rp.originalPrice) * 100);
                return (
                  <Link
                    key={rp.id}
                    to={`/product/${rp.id}`}
                    className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 group cursor-pointer"
                  >
                    <div className="relative w-full h-44 overflow-hidden bg-gray-50">
                      <img src={rp.image} alt={rp.name} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300" />
                      {rp.badge && (
                        <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded-full shadow ${badgeColors[rp.badge] ?? 'bg-gray-700 text-white'}`}>
                          {language === 'es' ? (badgeTranslations[rp.badge] ?? rp.badge) : rp.badge}
                        </span>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1 capitalize">{rp.category.replace('-', ' ')}</p>
                      <p className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug mb-2">
                        {language === 'es' ? ((rp as any).nameEs ?? rp.name) : rp.name}
                      </p>
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <div>
                          <span className="text-base font-bold text-gray-900">${rp.price.toFixed(2)}</span>
                          <span className="text-xs text-gray-400 line-through ml-1">${rp.originalPrice.toFixed(2)}</span>
                          {language === 'es' && (
                            <p className="text-xs font-semibold text-green-700 mt-0.5">
                              ${(rp.price * MXN_RATE).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-8 border-t border-gray-100 pt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              {language === 'es' ? 'También Te Puede Gustar' : 'You May Also Like'}
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedProducts.map((rp) => (
                <Link
                  key={rp.id}
                  to={`/product/${rp.id}`}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 group cursor-pointer"
                >
                  <div className="relative w-full h-44 overflow-hidden bg-gray-50">
                    <img src={rp.image} alt={rp.name} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300" />
                    {rp.badge && (
                      <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded-full shadow ${badgeColors[rp.badge] ?? 'bg-gray-700 text-white'}`}>
                        {language === 'es' ? (badgeTranslations[rp.badge] ?? rp.badge) : rp.badge}
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1 capitalize">{rp.category.replace('-', ' ')}</p>
                    <p className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug mb-2">
                      {language === 'es' ? ((rp as any).nameEs ?? rp.name) : rp.name}
                    </p>
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <div>
                        <span className="text-base font-bold text-gray-900">${rp.price.toFixed(2)}</span>
                        {rp.price < rp.originalPrice && (
                          <span className="text-xs text-gray-400 line-through ml-1">${rp.originalPrice.toFixed(2)}</span>
                        )}
                        {language === 'es' && (
                          <p className="text-xs font-semibold text-green-700 mt-0.5">
                            ${(rp.price * MXN_RATE).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Sticky Add to Cart Bar */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-4 py-3 transition-transform duration-300 ${showStickyCart ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          {/* Product thumbnail + name */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-stone-100 shrink-0">
              <img src={currentImage} alt={product.name} className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{displayName}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-base font-bold text-green-700">${effectivePrice.toFixed(2)}</p>
                {effectivePrice >= 50 && (
                  <a
                    href="https://www.affirm.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {language === 'es' ? 'Desde' : 'As low as'} ${(effectivePrice / 12).toFixed(2)}/mo
                    </span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded font-black text-xs tracking-tight bg-[#0FA0EA] text-white whitespace-nowrap">
                      affirm
                    </span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Qty stepper */}
          <div className="flex items-center border border-gray-200 rounded-md overflow-hidden shrink-0">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 cursor-pointer text-lg"
            >−</button>
            <span className="w-8 text-center text-sm font-semibold text-gray-800">{qty}</span>
            <button
              onClick={() => setQty(qty + 1)}
              className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 cursor-pointer text-lg"
            >+</button>
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex items-center gap-2 px-6 py-2.5 font-bold rounded-md text-sm transition-colors cursor-pointer whitespace-nowrap shrink-0 ${isOutOfStock ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-green-700 text-white hover:bg-green-800'}`}
          >
            {addedToCart ? (
              <><i className="ri-check-line"></i> {language === 'es' ? '¡Agregado!' : 'Added!'}</>
            ) : (
              <><i className="ri-shopping-cart-line"></i> {language === 'es' ? 'Agregar al Carrito' : 'Add to Cart'}</>
            )}
          </button>
        </div>
      </div>

      <Footer />
      {/* Floating recently viewed drawer */}
      <RecentlyViewedDrawer
        allProducts={allProducts}
        currentProductId={product.id}
        language={language}
      />
    </div>
  );
}
