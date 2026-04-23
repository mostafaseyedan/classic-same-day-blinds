import { Link } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';

export default function About() {
  const { language } = useLanguage();

  const stats = language === 'en'
    ? [
        { value: '30+', label: 'Years in Business' },
        { value: '2M+', label: 'Happy Customers' },
        { value: '50K+', label: 'Products Available' },
      ]
    : [
        { value: '30+', label: 'Años en el Negocio' },
        { value: '2M+', label: 'Clientes Satisfechos' },
        { value: '50K+', label: 'Productos Disponibles' },
      ];

  const badges = language === 'en'
    ? ['Free Samples Program', 'Expert Design Consultants', '3-Year Warranty', 'Child-Safe Options']
    : ['Programa de Muestras Gratis', 'Consultores Expertos en Diseño', 'Garantía de 3 Años', 'Opciones Seguras para Niños'];

  const reviews = language === 'en'
    ? [
        {
          name: 'Cathy L.',
          location: 'Wimberley, TX',
          rating: 5,
          text: 'Absolutely love my new cellular shades! The quality is outstanding and they fit perfectly. The free sample program helped me choose the right color. Installation was a breeze.',
          product: 'Cordless Cellular Shades',
        },
        {
          name: 'Cruz Fuentes',
          location: 'Vero Beach, FL',
          rating: 5,
          text: 'I was nervous about ordering custom blinds online but BlindsShop made it so easy. The measuring guide was clear, the blinds arrived quickly, and they look amazing in my living room.',
          product: 'Designer Roller Shades',
        },
        {
          name: 'Margaret T.',
          location: 'Austin, TX',
          rating: 5,
          text: 'The motorized blinds are a game changer! I can control them from my phone or with Alexa. The quality is top-notch and the customer service team was incredibly helpful.',
          product: 'Motorized Smart Blinds',
        },
      ]
    : [
        {
          name: 'Cathy L.',
          location: 'Wimberley, TX',
          rating: 5,
          text: '¡Me encantan mis nuevas cortinas celulares! La calidad es excepcional y encajan perfectamente. El programa de muestras gratis me ayudó a elegir el color correcto. La instalación fue muy fácil.',
          product: 'Cortinas Celulares sin Cordón',
        },
        {
          name: 'Cruz Fuentes',
          location: 'Vero Beach, FL',
          rating: 5,
          text: 'Estaba nervioso por pedir persianas personalizadas en línea, pero BlindsShop lo hizo muy fácil. La guía de medición fue clara, las persianas llegaron rápido y se ven increíbles en mi sala.',
          product: 'Cortinas Enrollables de Diseño',
        },
        {
          name: 'Margaret T.',
          location: 'Austin, TX',
          rating: 5,
          text: '¡Las persianas motorizadas son un cambio total! Puedo controlarlas desde mi teléfono o con Alexa. La calidad es excelente y el equipo de servicio al cliente fue increíblemente útil.',
          product: 'Persianas Inteligentes Motorizadas',
        },
      ];

  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <p className="text-green-700 text-sm font-semibold uppercase tracking-widest mb-3">
              {language === 'en' ? 'Our Story' : 'Nuestra Historia'}
            </p>
            <h2 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
              {language === 'en'
                ? <>America's #1 Online<br />blinds sales</>
                : <>La Tienda #1 en Línea<br />de Tratamientos para Ventanas</>}
            </h2>
            <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl px-5 py-4 mb-5">
              <div className="w-9 h-9 flex items-center justify-center text-green-700 shrink-0 mt-0.5">
                <i className="ri-award-line text-2xl"></i>
              </div>
              <div>
                <p className="text-green-800 font-bold text-sm">
                  {language === 'en'
                    ? 'Experience in the Blind Industry Since 1986'
                    : 'Experiencia en la Industria de Persianas Desde 1986'}
                </p>
                <p className="text-green-700 text-sm mt-1 leading-relaxed">
                  {language === 'en'
                    ? 'Why should you trust Classic Same Day Blinds with your window needs? Our founder has been in the business since 1986. We know everything there is to know about the blind industry. No matter what kind of blinds you are looking for, we will always know how to help!'
                    : '¿Por qué confiar en Classic Same Day Blinds para tus ventanas? Nuestro fundador lleva en el negocio desde 1986. Sabemos todo lo que hay que saber sobre la industria de persianas. Sin importar qué tipo de persianas busques, ¡siempre sabremos cómo ayudarte!'}
                </p>
              </div>
            </div>
            <p className="text-gray-600 mb-5 leading-relaxed">
              {language === 'en'
                ? 'For over 30 years, Classic Same Day Blinds has been helping homeowners, commercial properties, and maintenance teams find the perfect window treatments. We believe every window deserves a beautiful, custom-fitted solution — and we make that easy, reliable, and affordable.'
                : 'Durante más de 30 años, Classic Same Day Blinds ha ayudado a propietarios, propiedades comerciales y equipos de mantenimiento a encontrar los tratamientos de ventanas perfectos. Creemos que cada ventana merece una solución hermosa y a medida — y lo hacemos fácil, confiable y asequible.'}
            </p>
            <p className="text-gray-600 mb-5 leading-relaxed">
              {language === 'en'
                ? 'From our free sample program to our expert design consultants available 7 days a week, we\'re committed to making your window treatment experience seamless from start to finish.'
                : 'Desde nuestro programa de muestras gratis hasta nuestros consultores expertos disponibles 7 días a la semana, estamos comprometidos a hacer que tu experiencia sea perfecta de principio a fin.'}
            </p>
            <p className="text-gray-600 mb-8 leading-relaxed">
              {language === 'en'
                ? 'Every blind and shade is custom made to your exact measurements, ensuring a perfect fit for residential homes, property managers, maintenance teams, and commercial buildings alike.'
                : 'Cada persiana y cortina se fabrica a medida exacta, garantizando un ajuste perfecto para hogares residenciales, administradores de propiedades, equipos de mantenimiento y edificios comerciales.'}
            </p>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="text-2xl font-bold text-green-700 mb-1">{stat.value}</div>
                  <div className="text-xs text-gray-500 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              {badges.map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-gray-700 bg-white px-4 py-2 rounded-full border border-gray-200">
                  <div className="w-4 h-4 flex items-center justify-center text-green-700">
                    <i className="ri-check-line font-bold"></i>
                  </div>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="w-full h-72 rounded-xl overflow-hidden">
              <img
                src="https://readdy.ai/api/search-image?query=Professional%20interior%20designer%20measuring%20windows%20for%20custom%20blinds%20installation%2C%20modern%20home%2C%20natural%20light%2C%20professional%20photography%2C%20warm%20tones%2C%20elegant%20living%20room&width=400&height=600&seq=about-img-001&orientation=portrait"
                alt="Expert Design Help"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="w-full h-72 rounded-xl overflow-hidden mt-8">
              <img
                src="https://readdy.ai/api/search-image?query=Beautiful%20custom%20window%20blinds%20installation%20in%20a%20luxury%20home%2C%20warm%20sunlight%20through%20elegant%20white%20blinds%2C%20professional%20interior%20photography%2C%20upscale%20home%20decor%2C%20bright%20airy%20room&width=400&height=600&seq=about-img-002&orientation=portrait"
                alt="Beautiful Installations"
                className="w-full h-full object-cover object-top"
              />
            </div>
          </div>
        </div>

        {/* How to Measure Section */}
        <div className="mb-20">
          <div className="max-w-3xl mx-auto rounded-2xl overflow-hidden border border-gray-100">
            <img
              src="https://static.readdy.ai/image/10fa40ccc8b6597759995e1d60c86977/bb915d3c9894dc0bab167ca7161ff7f7.png"
              alt="How to Measure Your Windows for Blinds - Classic Blind Limited Guide"
              className="w-full h-auto object-contain object-top"
            />
          </div>
          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-5 px-1">
            <p className="text-sm text-gray-500">
              {language === 'en'
                ? 'Save or print this guide before you start measuring.'
                : 'Guarda o imprime esta guía antes de empezar a medir.'}
            </p>
            <div className="flex items-center gap-3 shrink-0">
              <a
                href="https://static.readdy.ai/image/10fa40ccc8b6597759995e1d60c86977/bb915d3c9894dc0bab167ca7161ff7f7.png"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 border border-green-700 text-green-700 text-sm font-semibold rounded-lg hover:bg-green-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-download-line"></i>
                </div>
                {language === 'en' ? 'Download Guide' : 'Descargar Guía'}
              </a>
              <Link
                to="/how-to-measure"
                className="flex items-center gap-2 px-4 py-2.5 bg-green-700 text-white text-sm font-semibold rounded-lg hover:bg-green-800 transition-colors cursor-pointer whitespace-nowrap"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-external-link-line"></i>
                </div>
                {language === 'en' ? 'View Full Guide' : 'Ver Guía Completa'}
              </Link>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            {language === 'en' ? 'What Our Customers Say' : 'Lo Que Dicen Nuestros Clientes'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <div key={review.name} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(review.rating)].map((_, i) => (
                    <div key={i} className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-star-fill text-green-600 text-sm"></i>
                    </div>
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">"{review.text}"</p>
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-sm font-bold text-gray-900">{review.name}</p>
                  <p className="text-xs text-gray-500">{review.location}</p>
                  <p className="text-xs text-green-700 mt-1 font-medium">{review.product}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
