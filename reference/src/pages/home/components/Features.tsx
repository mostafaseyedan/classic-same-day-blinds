import { useLanguage } from '../../../contexts/LanguageContext';

export default function Features() {
  const { language } = useLanguage();

  const features = language === 'en'
    ? [
        { icon: 'ri-ruler-2-line', title: 'Custom Made to Order', description: 'Every blind and shade is cut to your exact window measurements for a perfect fit every time.' },
        { icon: 'ri-gift-line', title: 'Free Samples', description: 'Order up to 5 free fabric and material samples delivered right to your door before you buy.' },
        { icon: 'ri-truck-line', title: 'Free Shipping $99+', description: 'Enjoy free standard shipping on all orders over $99. Fast delivery in 5–7 business days.' },
        { icon: 'ri-shield-check-line', title: '3-Year Warranty', description: 'Every product is backed by our 3-year manufacturer warranty against defects.' },
        { icon: 'ri-tools-line', title: 'Easy DIY Install', description: 'Step-by-step instructions and all hardware included. Most installs take under 30 minutes.' },
        { icon: 'ri-customer-service-2-line', title: 'Expert Design Help', description: 'Our window treatment specialists are available 7 days a week to help you choose the right style.' },
      ]
    : [
        { icon: 'ri-ruler-2-line', title: 'Hecho a Medida', description: 'Cada persiana y cortina se corta a las medidas exactas de tu ventana para un ajuste perfecto.' },
        { icon: 'ri-gift-line', title: 'Muestras Gratis', description: 'Pide hasta 5 muestras gratis de telas y materiales entregadas en tu puerta antes de comprar.' },
        { icon: 'ri-truck-line', title: 'Envío Gratis $99+', description: 'Disfruta envío estándar gratis en todos los pedidos mayores a $99. Entrega rápida en 5–7 días hábiles.' },
        { icon: 'ri-shield-check-line', title: 'Garantía de 3 Años', description: 'Cada producto está respaldado por nuestra garantía de fabricante de 3 años contra defectos.' },
        { icon: 'ri-tools-line', title: 'Instalación Fácil', description: 'Instrucciones paso a paso y todo el hardware incluido. La mayoría de instalaciones toman menos de 30 minutos.' },
        { icon: 'ri-customer-service-2-line', title: 'Ayuda de Expertos', description: 'Nuestros especialistas en tratamientos de ventanas están disponibles 7 días a la semana.' },
      ];

  const topFeatures = [
    {
      icon: 'ri-remote-control-line',
      label: language === 'en' ? 'Motorized' : 'Motorizadas',
      categoryId: 'motorized',
      menuLabel: 'Motorized',
      image: 'https://readdy.ai/api/search-image?query=Smart%20motorized%20window%20blinds%20with%20smartphone%20app%20control%2C%20modern%20living%20room%2C%20technology%20lifestyle%2C%20clean%20interior%2C%20professional%20photography&width=300&height=200&seq=feat-motor-001&orientation=landscape',
    },
    {
      icon: 'ri-leaf-line',
      label: language === 'en' ? 'Eco' : 'Ecológicas',
      categoryId: 'wood-blinds',
      menuLabel: 'Blinds',
      image: 'https://readdy.ai/api/search-image?query=Eco-friendly%20natural%20bamboo%20window%20shades%2C%20sustainable%20materials%2C%20bright%20airy%20room%2C%20green%20plants%2C%20professional%20interior%20photography&width=300&height=200&seq=feat-eco-001&orientation=landscape',
    },
    {
      icon: 'ri-moon-line',
      label: language === 'en' ? 'Blackout' : 'Blackout',
      categoryId: 'roller-shades',
      menuLabel: 'Shades',
      image: 'https://readdy.ai/api/search-image?query=Blackout%20window%20shades%20in%20a%20dark%20cozy%20bedroom%2C%20complete%20light%20blocking%2C%20modern%20interior%2C%20professional%20photography%2C%20dark%20moody%20atmosphere&width=300&height=200&seq=feat-blackout-001&orientation=landscape',
    },
    {
      icon: 'ri-speed-line',
      label: language === 'en' ? 'Quick Ship' : 'Envío Rápido',
      categoryId: 'all',
      menuLabel: 'All Products',
      image: 'https://readdy.ai/api/search-image?query=Fast%20shipping%20delivery%20box%20with%20window%20blinds%2C%20modern%20home%2C%20professional%20product%20photography%2C%20clean%20background&width=300&height=200&seq=feat-ship-001&orientation=landscape',
    },
    {
      icon: 'ri-sun-line',
      label: language === 'en' ? 'Cordless' : 'Sin Cordón',
      categoryId: 'cellular-shades',
      menuLabel: 'Shades',
      image: 'https://readdy.ai/api/search-image?query=Cordless%20child-safe%20window%20blinds%20in%20a%20bright%20nursery%20room%2C%20soft%20pastel%20colors%2C%20safe%20home%20environment%2C%20professional%20interior%20photography&width=300&height=200&seq=feat-cord-001&orientation=landscape',
    },
  ];

  const handleFeatureClick = (categoryId: string, menuLabel: string) => {
    window.dispatchEvent(new CustomEvent('filterProducts', { detail: { categoryId, menuLabel } }));
    const el = document.getElementById('products');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-green-700 text-sm font-semibold uppercase tracking-widest mb-2">
            {language === 'en' ? 'Why BlindsShop' : 'Por Qué BlindsShop'}
          </p>
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            {language === 'en' ? 'Custom Blinds & Shades for Every Project' : 'Persianas y Cortinas Personalizadas para Cada Proyecto'}
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            {language === 'en'
              ? 'From expert guidance to custom styles made to fit, we make transforming your space feel just as good as it looks.'
              : 'Desde orientación experta hasta estilos personalizados a medida, hacemos que transformar tu espacio se sienta tan bien como se ve.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {features.map((f) => (
            <div key={f.title} className="flex gap-4 p-6 rounded-xl bg-green-50 border border-green-100 hover:border-green-300 transition-all duration-200">
              <div className="w-12 h-12 flex items-center justify-center bg-green-700 text-white rounded-xl flex-shrink-0">
                <i className={`${f.icon} text-2xl`}></i>
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-4">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            {language === 'en' ? 'Explore Top Features' : 'Explorar Características Principales'}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {topFeatures.map((f) => (
              <button
                key={f.label}
                onClick={() => handleFeatureClick(f.categoryId, f.menuLabel)}
                className="group cursor-pointer text-left focus:outline-none"
              >
                <div className="w-full h-36 rounded-xl overflow-hidden mb-3 relative">
                  <img src={f.image} alt={f.label} className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 rounded-xl"></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 flex items-center justify-center text-green-700">
                    <i className={`${f.icon} text-base`}></i>
                  </div>
                  <span className="text-sm font-semibold text-gray-800 group-hover:text-green-700 transition-colors">{f.label}</span>
                  <div className="w-4 h-4 flex items-center justify-center text-green-700 opacity-0 group-hover:opacity-100 transition-opacity">
                    <i className="ri-arrow-right-line text-xs"></i>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
