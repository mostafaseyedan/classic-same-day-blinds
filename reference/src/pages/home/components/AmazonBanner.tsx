import { useLanguage } from '../../../contexts/LanguageContext';

export default function AmazonBanner() {
  const { t } = useLanguage();

  const badges = [
    { icon: 'ri-truck-line', en: 'Fast Prime Shipping', es: 'Envío Prime Rápido' },
    { icon: 'ri-shield-check-line', en: 'Amazon Buyer Protection', es: 'Protección al Comprador' },
    { icon: 'ri-star-fill', en: 'Thousands of Reviews', es: 'Miles de Reseñas' },
    { icon: 'ri-refresh-line', en: 'Easy Returns', es: 'Devoluciones Fáciles' },
  ];

  const products = [
    { en: 'Cordless Roller Shades', es: 'Persianas de Rodillo sin Cordón' },
    { en: 'Faux Wood Blinds', es: 'Persianas de Madera Sintética' },
    { en: 'Cellular Shades', es: 'Persianas Celulares' },
    { en: 'Motorized Blinds', es: 'Persianas Motorizadas' },
  ];

  return (
    <section className="relative py-16 overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)' }}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)',
          backgroundSize: '20px 20px'
        }}></div>
      </div>

      {/* Glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10">

          {/* Left: Text content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold px-4 py-1.5 rounded-full mb-5 uppercase tracking-widest">
              <i className="ri-amazon-fill text-sm"></i>
              {t('Now Available on Amazon', 'Ahora Disponible en Amazon')}
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight">
              {t('Find Our Products', 'Encuentra Nuestros Productos')}<br />
              <span className="text-amber-400">{t('on Amazon!', '¡en Amazon!')}</span>
            </h2>

            <p className="text-gray-300 text-lg md:text-xl max-w-xl mb-8 leading-relaxed">
              {t(
                "Shop our full collection of premium blinds, shades, and shutters directly on Amazon. Same great quality — with Amazon's trusted fast shipping and easy returns.",
                'Compra nuestra colección completa de persianas y postigos premium directamente en Amazon. La misma gran calidad — con el envío rápido y las devoluciones fáciles de Amazon.'
              )}
            </p>

            <div className="flex flex-wrap gap-4 justify-center lg:justify-start mb-8">
              {badges.map((item) => (
                <div key={item.en} className="flex items-center gap-2 text-gray-300 text-sm">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className={`${item.icon} text-amber-400`}></i>
                  </div>
                  <span>{t(item.en, item.es)}</span>
                </div>
              ))}
            </div>

            <a
              href="https://www.amazon.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-lg px-10 py-4 rounded-lg transition-all duration-300 shadow-2xl shadow-amber-500/30 hover:shadow-amber-400/50 hover:scale-105 cursor-pointer whitespace-nowrap"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <i className="ri-amazon-fill text-2xl"></i>
              </div>
              {t('Shop Now on Amazon', 'Comprar Ahora en Amazon')}
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-arrow-right-line text-lg"></i>
              </div>
            </a>
          </div>

          {/* Right: Visual card */}
          <div className="shrink-0 w-full max-w-sm lg:max-w-xs">
            <div className="relative bg-white rounded-2xl p-6 shadow-2xl">
              {/* Amazon logo area */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 flex items-center justify-center bg-amber-400 rounded-full">
                  <i className="ri-amazon-fill text-black text-lg"></i>
                </div>
                <span className="text-gray-900 font-extrabold text-xl tracking-tight">amazon</span>
                <span className="ml-auto bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {t('Official Store', 'Tienda Oficial')}
                </span>
              </div>

              <div className="w-full h-40 rounded-xl overflow-hidden mb-4">
                <img
                  src="https://readdy.ai/api/search-image?query=Premium%20custom%20window%20blinds%20and%20shades%20product%20display%20on%20clean%20white%20background%2C%20elegant%20roller%20shades%20and%20wood%20blinds%20arranged%20beautifully%2C%20professional%20product%20photography%2C%20soft%20studio%20lighting%2C%20minimalist%20style%2C%20high-end%20window%20treatment%20products&width=400&height=300&seq=amazon-banner-product-001&orientation=landscape"
                  alt="Our Products on Amazon"
                  className="w-full h-full object-cover object-top"
                />
              </div>

              <div className="space-y-2 mb-4">
                {products.map((product) => (
                  <div key={product.en} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <div className="w-4 h-4 flex items-center justify-center">
                        <i className="ri-checkbox-circle-fill text-amber-500 text-xs"></i>
                      </div>
                      {t(product.en, product.es)}
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="w-3 h-3 flex items-center justify-center">
                          <i className="ri-star-fill text-amber-400 text-xs"></i>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                <span className="text-xs text-gray-500">{t('Trusted by 50,000+ buyers', 'Confiado por más de 50,000 compradores')}</span>
                <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                  <div className="w-3 h-3 flex items-center justify-center">
                    <i className="ri-star-fill text-xs"></i>
                  </div>
                  4.8 / 5
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
