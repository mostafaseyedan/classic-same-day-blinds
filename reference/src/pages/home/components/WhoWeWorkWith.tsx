import { useLanguage } from '../../../contexts/LanguageContext';

const clientTypes = [
  {
    icon: 'ri-home-4-line',
    labelEn: 'Homeowners',
    labelEs: 'Propietarios',
    descEn: 'Single-family homes & custom installs',
    descEs: 'Casas unifamiliares e instalaciones personalizadas',
    image: 'https://readdy.ai/api/search-image?query=beautiful%20modern%20single%20family%20home%20exterior%20with%20large%20windows%20and%20manicured%20lawn%20in%20suburban%20neighborhood%20warm%20sunny%20day%20clean%20white%20facade%20with%20green%20landscaping%20professional%20real%20estate%20photography&width=400&height=280&seq=wwww1&orientation=landscape',
    color: 'from-green-600/70 to-green-900/80',
  },
  {
    icon: 'ri-building-2-line',
    labelEn: 'Hotels',
    labelEs: 'Hoteles',
    descEn: 'Bulk orders for guest rooms & lobbies',
    descEs: 'Pedidos al por mayor para habitaciones y lobbies',
    image: 'https://readdy.ai/api/search-image?query=elegant%20luxury%20hotel%20lobby%20interior%20with%20large%20windows%20and%20modern%20window%20treatments%20blinds%20shades%20warm%20lighting%20marble%20floors%20sophisticated%20decor%20professional%20interior%20photography&width=400&height=280&seq=wwww2&orientation=landscape',
    color: 'from-emerald-600/70 to-emerald-900/80',
  },
  {
    icon: 'ri-dice-line',
    labelEn: 'Casinos',
    labelEs: 'Casinos',
    descEn: 'Blackout & light-control solutions for gaming floors',
    descEs: 'Soluciones de oscurecimiento y control de luz para pisos de juego',
    image: 'https://readdy.ai/api/search-image?query=luxurious%20casino%20interior%20with%20elegant%20chandeliers%20and%20sophisticated%20window%20treatments%20blackout%20shades%20on%20tall%20windows%20golden%20lighting%20gaming%20floor%20opulent%20decor%20dark%20rich%20ambiance%20professional%20interior%20photography&width=400&height=280&seq=wwwwcas1&orientation=landscape',
    color: 'from-yellow-700/70 to-yellow-950/80',
  },
  {
    icon: 'ri-community-line',
    labelEn: 'Apartment Complexes',
    labelEs: 'Complejos de Apartamentos',
    descEn: 'Multi-unit installs & property upgrades',
    descEs: 'Instalaciones en múltiples unidades y mejoras',
    image: 'https://readdy.ai/api/search-image?query=modern%20apartment%20complex%20building%20exterior%20with%20balconies%20and%20large%20windows%20contemporary%20architecture%20clean%20lines%20urban%20residential%20building%20professional%20real%20estate%20photography%20blue%20sky%20background&width=400&height=280&seq=wwww3&orientation=landscape',
    color: 'from-teal-600/70 to-teal-900/80',
  },
  {
    icon: 'ri-tools-line',
    labelEn: 'Maintenance Managers',
    labelEs: 'Gerentes de Mantenimiento',
    descEn: 'Fast replacements & service contracts',
    descEs: 'Reemplazos rápidos y contratos de servicio',
    image: 'https://readdy.ai/api/search-image?query=professional%20maintenance%20manager%20in%20uniform%20inspecting%20window%20blinds%20installation%20in%20modern%20office%20building%20interior%20bright%20clean%20workspace%20professional%20photography%20natural%20light&width=400&height=280&seq=wwww4&orientation=landscape',
    color: 'from-green-700/70 to-green-950/80',
  },
  {
    icon: 'ri-map-pin-user-line',
    labelEn: 'Regional Property Managers',
    labelEs: 'Gerentes Regionales',
    descEn: 'Coordinated orders across multiple sites',
    descEs: 'Pedidos coordinados en múltiples sitios',
    image: 'https://readdy.ai/api/search-image?query=confident%20property%20manager%20standing%20in%20front%20of%20multiple%20residential%20buildings%20professional%20attire%20modern%20apartment%20community%20aerial%20view%20green%20landscaping%20sunny%20day%20professional%20photography&width=400&height=280&seq=wwww5&orientation=landscape',
    color: 'from-emerald-700/70 to-emerald-950/80',
  },
  {
    icon: 'ri-building-line',
    labelEn: 'Apartment Builders',
    labelEs: 'Constructores de Apartamentos',
    descEn: 'New construction & developer packages',
    descEs: 'Nueva construcción y paquetes para desarrolladores',
    image: 'https://readdy.ai/api/search-image?query=new%20apartment%20construction%20site%20with%20modern%20building%20under%20development%20construction%20workers%20installing%20windows%20bright%20sunny%20day%20urban%20development%20professional%20architecture%20photography&width=400&height=280&seq=wwww6&orientation=landscape',
    color: 'from-teal-700/70 to-teal-950/80',
  },
  {
    icon: 'ri-graduation-cap-line',
    labelEn: 'College Campuses',
    labelEs: 'Universidades',
    descEn: 'Dorms, classrooms & campus-wide installs',
    descEs: 'Dormitorios, aulas e instalaciones en todo el campus',
    image: 'https://readdy.ai/api/search-image?query=beautiful%20college%20university%20campus%20building%20exterior%20with%20large%20windows%20bright%20sunny%20day%20green%20trees%20and%20lawn%20students%20walking%20classic%20brick%20architecture%20academic%20institution%20professional%20photography&width=400&height=280&seq=wwww7&orientation=landscape',
    color: 'from-green-600/70 to-green-900/80',
  },
  {
    icon: 'ri-hospital-line',
    labelEn: 'Hospitals',
    labelEs: 'Hospitales',
    descEn: 'Light-control solutions for patient care areas',
    descEs: 'Soluciones de control de luz para áreas de atención al paciente',
    image: 'https://readdy.ai/api/search-image?query=modern%20hospital%20building%20exterior%20with%20large%20clean%20windows%20bright%20sunny%20day%20professional%20healthcare%20facility%20contemporary%20architecture%20white%20facade%20green%20landscaping%20professional%20real%20estate%20photography&width=400&height=280&seq=wwww8&orientation=landscape',
    color: 'from-emerald-600/70 to-emerald-900/80',
  },
];

export default function WhoWeWorkWith() {
  const { language } = useLanguage();

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block text-green-700 text-xs font-black uppercase tracking-widest mb-3 bg-green-50 px-4 py-1.5 rounded-full">
            {language === 'en' ? 'Our Clients' : 'Nuestros Clientes'}
          </span>
          <h2 className="text-4xl font-black text-gray-900 mb-4">
            {language === 'en' ? 'Who We Work With' : 'Con Quién Trabajamos'}
          </h2>
          <p className="text-gray-500 text-base max-w-xl mx-auto leading-relaxed">
            {language === 'en'
              ? 'From single homeowners to large property management companies — we deliver the right window solutions for every need.'
              : 'Desde propietarios individuales hasta grandes empresas de administración de propiedades, ofrecemos las soluciones de ventanas adecuadas para cada necesidad.'}
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {clientTypes.map((client) => (
            <div
              key={client.labelEn}
              className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
              style={{ height: '280px' }}
            >
              {/* Background Image */}
              <img
                src={client.image}
                alt={language === 'en' ? client.labelEn : client.labelEs}
                className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />

              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t ${client.color} transition-opacity duration-300`} />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                    <i className={`${client.icon} text-white text-lg`}></i>
                  </div>
                  <h3 className="text-white text-lg font-black leading-tight">
                    {language === 'en' ? client.labelEn : client.labelEs}
                  </h3>
                </div>
                <p className="text-white/80 text-sm leading-snug pl-12">
                  {language === 'en' ? client.descEn : client.descEs}
                </p>
              </div>

              {/* Hover shine */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/5 pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm mb-4">
            {language === 'en'
              ? "Don't see your category? We work with all types of residential and commercial clients."
              : '¿No ves tu categoría? Trabajamos con todo tipo de clientes residenciales y comerciales.'}
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white text-sm font-bold px-6 py-3 rounded-full transition-all duration-200 cursor-pointer whitespace-nowrap shadow-md hover:shadow-lg"
          >
            <i className="ri-chat-1-line"></i>
            {language === 'en' ? 'Get in Touch' : 'Contáctanos'}
          </a>
        </div>
      </div>
    </section>
  );
}
