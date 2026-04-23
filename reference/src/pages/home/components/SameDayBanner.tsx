import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';

export default function SameDayBanner() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const perks = language === 'en'
    ? [
        { icon: 'ri-flashlight-line', text: 'Same Day Pick-Up Available' },
        { icon: 'ri-map-pin-2-line', text: 'Dallas Fort Worth Area' },
        { icon: 'ri-time-line', text: 'Order Before 10AM' },
        { icon: 'ri-shield-check-line', text: 'No Extra Charge' },
      ]
    : [
        { icon: 'ri-flashlight-line', text: 'Recogida el Mismo Día' },
        { icon: 'ri-map-pin-2-line', text: 'Área Dallas Fort Worth' },
        { icon: 'ri-time-line', text: 'Ordena Antes de las 10AM' },
        { icon: 'ri-shield-check-line', text: 'Sin Cargo Extra' },
      ];

  return (
    <section className="relative overflow-hidden bg-gray-900">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img
          src="https://readdy.ai/api/search-image?query=Fast%20delivery%20truck%20on%20highway%20at%20golden%20hour%2C%20motion%20blur%2C%20speed%2C%20logistics%2C%20professional%20commercial%20photography%2C%20warm%20tones%2C%20dramatic%20sky&width=1440&height=320&seq=sameday-banner-001&orientation=landscape"
          alt="Same Day Delivery Service Dallas Fort Worth"
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/80 to-gray-900/60"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">

          {/* Left: Text content */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/40 text-green-400 text-xs font-bold px-3 py-1.5 rounded-full mb-4 uppercase tracking-widest">
              <i className="ri-flashlight-fill text-sm"></i>
              {language === 'en' ? 'DFW Exclusive' : 'Exclusivo DFW'}
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3 leading-tight">
              {language === 'en' ? (
                <>Need Blinds <span className="text-green-400">Today?</span></>
              ) : (
                <>¿Necesitas Persianas <span className="text-green-400">Hoy?</span></>
              )}
            </h2>
            <p className="text-gray-300 text-base max-w-xl leading-relaxed">
              {language === 'en'
                ? 'We offer same day delivery and pick-up for customers in the Dallas Fort Worth area. Order before 10am and get your blinds the same day — no waiting, no hassle.'
                : 'Ofrecemos entrega y recogida el mismo día para clientes en el área de Dallas Fort Worth. Ordena antes de las 10am y recibe tus persianas el mismo día.'}
            </p>

            {/* Perks row */}
            <div className="flex flex-wrap gap-4 mt-6 justify-center lg:justify-start">
              {perks.map((p) => (
                <div key={p.text} className="flex items-center gap-2 text-sm text-gray-200">
                  <div className="w-5 h-5 flex items-center justify-center text-green-400">
                    <i className={`${p.icon} text-base`}></i>
                  </div>
                  <span className="whitespace-nowrap font-medium">{p.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: CTA card */}
          <div className="shrink-0 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center w-full lg:w-72">
            <div className="flex justify-center gap-3 mb-4">
              <div className="w-14 h-14 flex items-center justify-center bg-green-500 rounded-full">
                <i className="ri-e-bike-2-line text-white text-2xl"></i>
              </div>
              <div className="w-14 h-14 flex items-center justify-center bg-white/20 rounded-full">
                <i className="ri-store-2-line text-white text-2xl"></i>
              </div>
            </div>
            <p className="text-white font-bold text-lg mb-1">
              {language === 'en' ? 'Delivery or Pick-Up' : 'Entrega o Recogida'}
            </p>
            <p className="text-gray-300 text-sm mb-3 leading-relaxed">
              {language === 'en'
                ? 'Get same day delivery — or pick up directly from our warehouse in Bedford!'
                : '¡Recibe entrega el mismo día o recoge directamente en nuestro almacén en Bedford!'}
            </p>
            <div className="flex items-center justify-center gap-1.5 text-green-400 text-xs font-semibold mb-4">
              <i className="ri-map-pin-2-fill text-sm"></i>
              <span>{language === 'en' ? 'Warehouse Pick-Up — Bedford, TX' : 'Recogida en Almacén — Bedford, TX'}</span>
            </div>
            <button
              onClick={() => navigate('/same-day-delivery')}
              className="w-full bg-green-500 hover:bg-green-400 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap text-sm"
            >
              {language === 'en' ? 'See Our Delivery Policy →' : 'Ver Política de Entrega →'}
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
