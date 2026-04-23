import { useLanguage } from '../../../contexts/LanguageContext';

const rooms = [
  {
    name: 'Living Room',
    nameEs: 'Sala de Estar',
    description: 'Create the perfect ambiance with light-filtering shades & elegant drapes',
    descriptionEs: 'Crea el ambiente perfecto con cortinas filtradoras de luz y elegantes visillos',
    icon: 'ri-sofa-line',
    categoryId: 'roller-shades',
    menuLabel: 'Shades',
    tag: 'Most Popular',
    tagEs: 'Más Popular',
    accent: 'from-amber-800/70 to-amber-900/80',
    image: 'https://readdy.ai/api/search-image?query=Bright%20and%20airy%20living%20room%20with%20large%20windows%20dressed%20in%20elegant%20light%20filtering%20roller%20shades%20in%20warm%20ivory%2C%20modern%20minimalist%20interior%20design%2C%20plush%20sofa%2C%20natural%20wood%20accents%2C%20soft%20afternoon%20sunlight%20streaming%20through%2C%20professional%20interior%20photography%2C%20warm%20neutral%20palette%2C%20cozy%20upscale%20atmosphere&width=600&height=700&seq=room-living-001&orientation=portrait',
  },
  {
    name: 'Bedroom',
    nameEs: 'Dormitorio',
    description: 'Blackout shades & cellular blinds for the perfect night\'s sleep',
    descriptionEs: 'Cortinas opacas y celulares para el sueño perfecto',
    icon: 'ri-hotel-bed-line',
    categoryId: 'cellular-shades',
    menuLabel: 'Shades',
    tag: 'Best for Sleep',
    tagEs: 'Mejor para Dormir',
    accent: 'from-indigo-900/70 to-slate-900/80',
    image: 'https://readdy.ai/api/search-image?query=Serene%20master%20bedroom%20with%20blackout%20cellular%20honeycomb%20shades%20in%20soft%20dove%20gray%2C%20king%20size%20bed%20with%20white%20linen%20bedding%2C%20warm%20bedside%20lamps%2C%20calm%20and%20restful%20atmosphere%2C%20professional%20interior%20photography%2C%20neutral%20tones%2C%20modern%20elegant%20bedroom%20design%2C%20cozy%20sanctuary%20feel&width=600&height=700&seq=room-bedroom-001&orientation=portrait',
  },
  {
    name: 'Kitchen',
    nameEs: 'Cocina',
    description: 'Moisture-resistant faux wood blinds built for busy kitchens',
    descriptionEs: 'Persianas de madera sintética resistentes a la humedad para cocinas activas',
    icon: 'ri-knife-line',
    categoryId: 'wood-blinds',
    menuLabel: 'Blinds',
    tag: 'Easy to Clean',
    tagEs: 'Fácil de Limpiar',
    accent: 'from-green-800/70 to-emerald-900/80',
    image: 'https://readdy.ai/api/search-image?query=Modern%20bright%20kitchen%20with%20faux%20wood%20horizontal%20blinds%20in%20crisp%20white%20installed%20above%20sink%20window%2C%20clean%20contemporary%20kitchen%20design%2C%20marble%20countertops%2C%20stainless%20steel%20appliances%2C%20natural%20light%2C%20professional%20interior%20photography%2C%20fresh%20and%20clean%20aesthetic%2C%20white%20cabinetry&width=600&height=700&seq=room-kitchen-001&orientation=portrait',
  },
  {
    name: 'Home Office',
    nameEs: 'Oficina en Casa',
    description: 'Reduce glare & boost focus with smart motorized shades',
    descriptionEs: 'Reduce el deslumbramiento y mejora la concentración con cortinas motorizadas',
    icon: 'ri-computer-line',
    categoryId: 'motorized',
    menuLabel: 'Motorized',
    tag: 'Smart Home',
    tagEs: 'Hogar Inteligente',
    accent: 'from-gray-800/70 to-zinc-900/80',
    image: 'https://readdy.ai/api/search-image?query=Sleek%20modern%20home%20office%20with%20motorized%20smart%20roller%20shades%20in%20charcoal%20gray%2C%20large%20desk%20with%20dual%20monitors%2C%20ergonomic%20chair%2C%20controlled%20diffused%20natural%20light%2C%20professional%20interior%20photography%2C%20contemporary%20workspace%20design%2C%20clean%20minimal%20aesthetic%2C%20productivity%20focused%20environment&width=600&height=700&seq=room-office-001&orientation=portrait',
  },
  {
    name: 'Dining Room',
    nameEs: 'Comedor',
    description: 'Elegant Roman shades & drapes to set the perfect dining mood',
    descriptionEs: 'Elegantes cortinas romanas y visillos para el ambiente perfecto al cenar',
    icon: 'ri-restaurant-line',
    categoryId: 'roman-shades',
    menuLabel: 'Drapes',
    tag: 'Elegant Style',
    tagEs: 'Estilo Elegante',
    accent: 'from-rose-900/70 to-red-900/80',
    image: 'https://readdy.ai/api/search-image?query=Sophisticated%20dining%20room%20with%20luxurious%20Roman%20shades%20in%20rich%20cream%20linen%20fabric%2C%20elegant%20dining%20table%20with%20upholstered%20chairs%2C%20warm%20pendant%20lighting%2C%20beautiful%20fabric%20folds%2C%20professional%20interior%20photography%2C%20upscale%20home%20decor%2C%20warm%20inviting%20atmosphere%2C%20formal%20dining%20setting&width=600&height=700&seq=room-dining-001&orientation=portrait',
  },
  {
    name: 'Patio & Doors',
    nameEs: 'Patio y Puertas',
    description: 'Vertical blinds & sliding panel tracks for large glass doors',
    descriptionEs: 'Persianas verticales y paneles deslizantes para grandes puertas de vidrio',
    icon: 'ri-door-open-line',
    categoryId: 'wood-blinds',
    menuLabel: 'Blinds',
    tag: 'Sliding Doors',
    tagEs: 'Puertas Corredizas',
    accent: 'from-teal-800/70 to-cyan-900/80',
    image: 'https://readdy.ai/api/search-image?query=Bright%20open%20plan%20living%20area%20with%20large%20sliding%20glass%20patio%20doors%20dressed%20in%20elegant%20white%20vertical%20blinds%2C%20view%20of%20lush%20green%20backyard%2C%20modern%20contemporary%20interior%2C%20clean%20lines%2C%20professional%20interior%20photography%2C%20indoor%20outdoor%20living%2C%20natural%20light%2C%20spacious%20airy%20feel&width=600&height=700&seq=room-patio-001&orientation=portrait',
  },
];

export default function ShopByRoom() {
  const { language } = useLanguage();

  const handleRoomClick = (categoryId: string, menuLabel: string) => {
    window.dispatchEvent(new CustomEvent('filterProducts', { detail: { categoryId, menuLabel } }));
    const el = document.getElementById('products');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="shop-by-room" className="py-24 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-green-700 text-sm font-semibold uppercase tracking-widest mb-2">
            {language === 'en' ? 'Find Your Perfect Fit' : 'Encuentra tu Estilo Perfecto'}
          </p>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {language === 'en' ? 'Shop by Room' : 'Compra por Habitación'}
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-base leading-relaxed">
            {language === 'en'
              ? 'Every room has different needs. Browse our curated window treatment recommendations for each space in your home.'
              : 'Cada habitación tiene necesidades diferentes. Explora nuestras recomendaciones de tratamientos de ventanas para cada espacio de tu hogar.'}
          </p>
        </div>

        {/* Room Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {rooms.map((room, index) => (
            <button
              key={room.name}
              onClick={() => handleRoomClick(room.categoryId, room.menuLabel)}
              className={`group relative rounded-2xl overflow-hidden cursor-pointer text-left focus:outline-none shadow-md hover:shadow-xl transition-all duration-400 ${
                index === 0 ? 'md:col-span-1 md:row-span-2' : ''
              }`}
              style={{ minHeight: index === 0 ? '240px' : '200px' }}
            >
              {/* Background Image */}
              <div className="absolute inset-0 w-full h-full">
                <img
                  src={room.image}
                  alt={language === 'en' ? room.name : room.nameEs}
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                />
              </div>

              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t ${room.accent} opacity-60 group-hover:opacity-75 transition-opacity duration-400`}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

              {/* Tag Badge */}
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/30">
                  <div className="w-3 h-3 flex items-center justify-center">
                    <i className={`${room.icon} text-xs`}></i>
                  </div>
                  {language === 'en' ? room.tag : room.tagEs}
                </span>
              </div>

              {/* Arrow */}
              <div className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full border border-white/30 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                <i className="ri-arrow-right-up-line text-white text-sm"></i>
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className={`${room.icon} text-white/90 text-base`}></i>
                  </div>
                  <h3 className="text-white font-bold text-lg leading-tight">
                    {language === 'en' ? room.name : room.nameEs}
                  </h3>
                </div>
                <p className="text-white/75 text-xs leading-relaxed line-clamp-2">
                  {language === 'en' ? room.description : room.descriptionEs}
                </p>
                <div className="mt-3 flex items-center gap-1.5 text-white/90 text-xs font-semibold group-hover:gap-2.5 transition-all duration-300">
                  <span>{language === 'en' ? 'Shop Now' : 'Comprar Ahora'}</span>
                  <div className="w-3 h-3 flex items-center justify-center">
                    <i className="ri-arrow-right-line text-xs"></i>
                  </div>
                </div>
              </div>

              {/* Hover border glow */}
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-white/40 transition-all duration-300 pointer-events-none"></div>
            </button>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm mb-4">
            {language === 'en'
              ? 'Not sure which style fits your room? Our design experts are here to help.'
              : '¿No sabes qué estilo se adapta a tu habitación? Nuestros expertos en diseño están aquí para ayudarte.'}
          </p>
          <button
            onClick={() => {
              const el = document.getElementById('contact');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 px-7 py-3 bg-green-700 text-white font-semibold rounded-md hover:bg-green-800 transition-all duration-200 cursor-pointer whitespace-nowrap btn-glow"
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-customer-service-2-line"></i>
            </div>
            {language === 'en' ? 'Get a Free Design Consultation' : 'Obtén una Consulta de Diseño Gratis'}
          </button>
        </div>
      </div>
    </section>
  );
}
