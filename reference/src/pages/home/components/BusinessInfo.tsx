import { useLanguage } from '../../../contexts/LanguageContext';

export default function BusinessInfo() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <section className="bg-white border-b border-gray-100 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">

          {/* Business Name & Address */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="w-10 h-10 flex items-center justify-center bg-green-50 rounded-full mb-3">
              <i className="ri-map-pin-2-line text-green-700 text-xl"></i>
            </div>
            <h2 className="text-xl font-extrabold text-gray-900 mb-1">Classic Same Day Blinds</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              2801 Brasher Ln<br />
              Bedford, TX 76021
            </p>
            <a
              href="https://maps.google.com/?q=2801+Brasher+Ln,+Bedford,+TX+76021"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-green-700 text-xs font-semibold hover:underline cursor-pointer whitespace-nowrap"
            >
              <i className="ri-navigation-line text-xs"></i>
              {language === 'en' ? 'Get Directions' : 'Cómo Llegar'}
            </a>
          </div>

          {/* Phone Numbers */}
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 flex items-center justify-center bg-green-50 rounded-full mb-3">
              <i className="ri-phone-line text-green-700 text-xl"></i>
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-2">
              {language === 'en' ? 'Call Us' : 'Llámanos'}
            </h3>
            <a
              href="tel:8175409300"
              className="text-gray-700 text-sm font-semibold hover:text-green-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-phone-fill text-green-600 mr-1"></i>
              (817) 540-9300
            </a>
            <p className="text-gray-400 text-xs mt-0.5 mb-1">
              {language === 'en' ? 'Local' : 'Local'}
            </p>
            <a
              href="tel:18009619867"
              className="text-gray-700 text-sm font-semibold hover:text-green-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-phone-fill text-green-600 mr-1"></i>
              (800) 961-9867
            </a>
            <p className="text-gray-400 text-xs mt-0.5">
              {language === 'en' ? 'Toll Free' : 'Línea Gratuita'}
            </p>
          </div>

          {/* Business Hours */}
          <div className="flex flex-col items-center md:items-end text-center md:text-right">
            <div className="w-10 h-10 flex items-center justify-center bg-green-50 rounded-full mb-3">
              <i className="ri-time-line text-green-700 text-xl"></i>
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-2">
              {language === 'en' ? 'Business Hours' : 'Horario de Atención'}
            </h3>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-3 justify-center md:justify-end">
                <span className="font-semibold text-gray-800 whitespace-nowrap">
                  {language === 'en' ? 'Mon – Fri' : 'Lun – Vie'}
                </span>
                <span className="whitespace-nowrap">8:00 am – 5:00 pm</span>
              </div>
              <div className="flex flex-col items-center md:items-end">
                <div className="flex items-center gap-3 justify-center md:justify-end">
                  <span className="font-semibold text-gray-800 whitespace-nowrap">
                    {language === 'en' ? 'Sat – Sun' : 'Sáb – Dom'}
                  </span>
                  <span className="whitespace-nowrap">
                    {language === 'en' ? 'Online orders only' : 'Solo pedidos en línea'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {language === 'en'
                    ? 'Delivered Mon or Tue of the following week'
                    : 'Entrega el Lun o Mar de la semana siguiente'}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Order Online 7 Days a Week */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center bg-green-700 rounded-full">
            <i className="ri-calendar-check-line text-white text-base"></i>
          </div>
          <p className="text-green-700 text-base font-black tracking-wide uppercase">
            {language === 'en' ? 'Order Online 7 Days a Week' : 'Ordena en Línea 7 Días a la Semana'}
          </p>
        </div>

        {/* Promotional Info Block */}
        <div className="mt-6 bg-green-50 border border-green-100 rounded-xl px-6 py-5 text-center">
          <p className="text-gray-700 text-sm leading-relaxed max-w-3xl mx-auto">
            {language === 'en' ? (
              <>
                <strong className="text-gray-900">In need of new blinds right away?</strong> Look no further than Classic Same Day Blinds. If you are located in the <strong className="text-green-700">Dallas Fort Worth area</strong>, we offer convenient <strong>same day delivery and pick-up</strong> options with certain orders. Are you located outside of this area? Don't worry, we'd still love to help! You can still place an order online for your convenience for delivery.
                <br /><br />
                Our location in <strong className="text-green-700">Bedford, TX</strong> has a huge inventory of blinds. If we don't have your selected blinds in stock, please reach out to us in the{' '}
                <a
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-green-700 font-bold underline underline-offset-2 hover:text-green-800 cursor-pointer"
                >
                  contact us
                </a>
                {' '}section — we will order them right away! Rest assured that we will get your blinds delivered as soon as possible.
              </>
            ) : (
              <>
                <strong className="text-gray-900">¿Necesitas persianas nuevas de inmediato?</strong> No busques más que Classic Same Day Blinds. Si estás ubicado en el área de <strong className="text-green-700">Dallas Fort Worth</strong>, ofrecemos convenientes opciones de <strong>entrega y recogida el mismo día</strong> con ciertos pedidos. ¿Estás fuera de esta área? ¡No te preocupes, aún nos encantaría ayudarte! Puedes hacer un pedido en línea para tu comodidad.
                <br /><br />
                Nuestra ubicación en <strong className="text-green-700">Bedford, TX</strong> tiene un enorme inventario de persianas. Si no tenemos tus persianas seleccionadas en stock, por favor contáctanos en la{' '}
                <a
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-green-700 font-bold underline underline-offset-2 hover:text-green-800 cursor-pointer"
                >
                  sección de contáctenos
                </a>
                {' '}— ¡las pedimos de inmediato! Ten la seguridad de que te entregaremos tus persianas lo antes posible.
              </>
            )}
          </p>

          {/* Quick Inquiry Button */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-600 text-white text-sm font-bold px-5 py-2.5 rounded-full transition-all duration-200 cursor-pointer whitespace-nowrap shadow-sm"
            >
              <i className="ri-mail-send-line text-base"></i>
              {language === 'en' ? 'Send Us a Quick Inquiry' : 'Envíanos una Consulta Rápida'}
            </a>
          </div>
        </div>

        {/* Spanish Language Banner + Language Toggle */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-amber-50 border border-amber-200 rounded-xl px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🇲🇽</span>
            <p className="text-amber-800 text-sm font-medium">
              ¿No hablas inglés? Visita nuestro sitio web en español
            </p>
          </div>
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-900 text-sm font-bold px-4 py-2 rounded-full transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0"
          >
            <span className="text-base">{language === 'en' ? '🇲🇽' : '🇺🇸'}</span>
            <span>{language === 'en' ? 'Ver en Español' : 'View in English'}</span>
          </button>
        </div>

      </div>
    </section>
  );
}
