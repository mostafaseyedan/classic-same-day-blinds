import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';

export default function Categories() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const en = language === 'en';

  const scrollAndFilter = (categoryId: string) => {
    window.dispatchEvent(new CustomEvent('filterProducts', { detail: { categoryId } }));
    const element = document.getElementById('products');
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  const categories = [
    {
      id: 'mini-blinds',
      nameEn: 'Vinyl Blinds',
      nameEs: 'Persianas de Vinilo',
      descEn: '1" standard & plus — custom sizes available',
      descEs: '1" estándar y plus — tallas personalizadas',
      countEn: '4 styles · from $13.68',
      countEs: '4 estilos · desde $13.68',
      image: 'https://readdy.ai/api/search-image?query=Crisp%20white%201%20inch%20vinyl%20horizontal%20window%20blinds%20installed%20in%20a%20bright%20clean%20residential%20living%20room%2C%20smooth%20slats%20in%20closed%20position%2C%20warm%20natural%20light%2C%20minimalist%20interior%2C%20white%20walls%2C%20neutral%20flooring%2C%20professional%20product%20shot%2C%20simple%20and%20elegant&width=600&height=420&seq=catv2-vinyl-001&orientation=landscape',
    },
    {
      id: 'aluminum-blinds',
      nameEn: 'Aluminum Blinds',
      nameEs: 'Persianas de Aluminio',
      descEn: 'Rust-proof · moisture-resistant · commercial grade',
      descEs: 'Resistente a óxido · grado comercial',
      countEn: '3 styles · from $11.81',
      countEs: '3 estilos · desde $11.81',
      image: 'https://readdy.ai/api/search-image?query=Sleek%20silver%20aluminum%20horizontal%20window%20blinds%20installed%20in%20a%20modern%20office%20or%20bathroom%2C%20polished%20metal%20slats%20reflecting%20light%2C%20clean%20contemporary%20interior%20with%20white%20walls%2C%20professional%20product%20photography%2C%20commercial%20and%20residential%20use%2C%20crisp%20and%20functional%20look&width=600&height=420&seq=catv2-alum-001&orientation=landscape',
    },
    {
      id: 'wood-blinds',
      nameEn: '2" Faux Wood Blinds',
      nameEs: 'Persianas Faux Wood 2"',
      descEn: 'Real wood look · warp-resistant · 6 finishes',
      descEs: 'Estilo madera · anti-deformación · 6 acabados',
      countEn: '6 finishes · from $27.10',
      countEs: '6 acabados · desde $27.10',
      image: 'https://readdy.ai/api/search-image?query=Elegant%202%20inch%20faux%20wood%20horizontal%20blinds%20in%20warm%20natural%20honey%20oak%20wood%20grain%20finish%20installed%20in%20a%20stylish%20living%20room%2C%20wide%20realistic%20wood-look%20slats%2C%20warm%20cozy%20interior%20with%20light%20floors%20and%20neutral%20walls%2C%20afternoon%20golden%20light%2C%20upscale%20residential%20interior%20photography&width=600&height=420&seq=catv2-wood-001&orientation=landscape',
    },
    {
      id: 'vertical-blinds',
      nameEn: 'Vertical Blinds',
      nameEs: 'Persianas Verticales',
      descEn: 'Sliding doors & wide windows · stock & custom',
      descEs: 'Puertas corredizas · stock y a medida',
      countEn: '7 sizes · from $18.78',
      countEs: '7 tamaños · desde $18.78',
      image: 'https://readdy.ai/api/search-image?query=White%20PVC%20vertical%20blinds%20installed%20on%20a%20large%20sliding%20glass%20patio%20door%20in%20a%20bright%20modern%20living%20room%2C%20vertical%20fabric%20vanes%20hanging%20evenly%2C%20clean%20contemporary%20interior%20with%20warm%20wood%20floors%2C%20natural%20light%20filtering%20through%20open%20slats%2C%20professional%20interior%20product%20photography%2C%20spacious%20airy%20feel&width=600&height=420&seq=catv2-vert-001&orientation=landscape',
    },
  ];

  return (
    <section id="categories" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-4">
          <div>
            <p className="text-green-700 text-sm font-bold uppercase tracking-widest mb-2">
              {en ? 'What We Carry' : 'Lo Que Tenemos'}
            </p>
            <h2 className="text-4xl font-bold text-gray-900">
              {en ? 'All Blind Categories' : 'Todas las Categorías'}
            </h2>
            <p className="text-gray-500 text-base mt-2 max-w-lg">
              {en
                ? 'Every style custom-cut to your measurements. All 15% below Blinds.com pricing — guaranteed.'
                : 'Cada estilo cortado a tus medidas. Todo 15% menos que Blinds.com — garantizado.'}
            </p>
          </div>
          <button
            onClick={() => navigate('/products')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-700 text-white text-sm font-bold rounded-md hover:bg-green-800 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-layout-grid-line text-sm"></i>
            </div>
            {en ? 'Shop All Products' : 'Ver Todo el Catálogo'}
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-arrow-right-line text-sm"></i>
            </div>
          </button>
        </div>

        {/* Category grid — 2×2 on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => scrollAndFilter(cat.id)}
              className="group relative rounded-xl overflow-hidden cursor-pointer text-left focus:outline-none border border-stone-200 hover:border-green-400 transition-all duration-300"
            >
              {/* Image */}
              <div className="w-full h-44 overflow-hidden bg-stone-100">
                <img
                  src={cat.image}
                  alt={en ? cat.nameEn : cat.nameEs}
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-108"
                />
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent"></div>

              {/* Text */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-bold text-base leading-tight">
                  {en ? cat.nameEn : cat.nameEs}
                </h3>
                <p className="text-white/75 text-xs mt-1 leading-snug">
                  {en ? cat.descEn : cat.descEs}
                </p>
                <div className="flex items-center justify-between mt-2.5">
                  <span className="text-green-300 text-xs font-bold">
                    {en ? cat.countEn : cat.countEs}
                  </span>
                  <span className="flex items-center gap-1 text-white/80 text-xs font-semibold group-hover:text-green-300 transition-colors">
                    {en ? 'Shop' : 'Ver'}
                    <div className="w-3.5 h-3.5 flex items-center justify-center">
                      <i className="ri-arrow-right-line text-xs group-hover:translate-x-0.5 transition-transform"></i>
                    </div>
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Bottom strip — quick links row */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 pt-6 border-t border-stone-100">
          {[
            { labelEn: 'All Products', labelEs: 'Todos los Productos', id: 'all' },
            { labelEn: 'Vinyl Blinds', labelEs: 'Vinilo', id: 'mini-blinds' },
            { labelEn: 'Aluminum Blinds', labelEs: 'Aluminio', id: 'aluminum-blinds' },
            { labelEn: 'Faux Wood Blinds', labelEs: 'Faux Wood', id: 'wood-blinds' },
            { labelEn: 'Vertical Blinds', labelEs: 'Verticales', id: 'vertical-blinds' },
          ].map((link) => (
            <button
              key={link.id}
              onClick={() => scrollAndFilter(link.id)}
              className="px-4 py-2 rounded-full bg-stone-100 text-gray-700 text-sm font-medium hover:bg-green-700 hover:text-white transition-all duration-200 cursor-pointer whitespace-nowrap"
            >
              {en ? link.labelEn : link.labelEs}
            </button>
          ))}
          <button
            onClick={() => navigate('/products')}
            className="px-4 py-2 rounded-full border-2 border-green-700 text-green-700 text-sm font-bold hover:bg-green-700 hover:text-white transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-1.5"
          >
            {en ? 'Full Catalog →' : 'Catálogo Completo →'}
          </button>
        </div>
      </div>
    </section>
  );
}
