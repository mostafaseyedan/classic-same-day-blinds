import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';

interface Slide {
  id: string;
  image: string;
  labelEn: string;
  labelEs: string;
  accentEn: string;
  accentEs: string;
  icon: string;
}

const SLIDES: Slide[] = [
  {
    id: 'homes',
    image: 'https://public.readdy.ai/ai/img_res/edited_39992fefd254200a953273c98b850111_60f0f88a.jpg',
    labelEn: 'Residential Homes',
    labelEs: 'Hogares Residenciales',
    accentEn: 'Homes & Residences',
    accentEs: 'Hogares y Residencias',
    icon: 'ri-home-4-line',
  },
  {
    id: 'apartments',
    image: 'https://readdy.ai/api/search-image?query=Modern%20luxury%20apartment%20complex%20lobby%20interior%20corridor%20with%20elegant%20crisp%20white%20horizontal%20blinds%20installed%20on%20large%20floor-to-ceiling%20windows%2C%20contemporary%20minimalist%20residential%20design%2C%20polished%20light%20marble%20floors%2C%20bright%20diffused%20natural%20light%20streaming%20through%20pristine%20white%20blinds%2C%20upscale%20high-rise%20residential%20building%20hallway%2C%20professional%20architectural%20interior%20photography%2C%20clean%20neutral%20tones%2C%20sophisticated%20and%20welcoming%20residential%20ambiance&width=1440&height=900&seq=hero-apartments&orientation=landscape',
    labelEn: 'Apartment Complexes',
    labelEs: 'Complejos de Apartamentos',
    accentEn: 'Apartments & Condos',
    accentEs: 'Apartamentos y Condos',
    icon: 'ri-building-2-line',
  },
  {
    id: 'hotels',
    image: 'https://readdy.ai/api/search-image?query=Luxury%20five-star%20hotel%20room%20interior%20with%20premium%20white%20blackout%20roller%20blinds%20and%20sheer%20curtains%20on%20panoramic%20floor-to-ceiling%20windows%20overlooking%20a%20city%20skyline%20at%20golden%20hour%2C%20king-sized%20bed%20with%20crisp%20white%20linens%20and%20plush%20pillows%2C%20elegant%20contemporary%20furniture%2C%20warm%20amber%20ambient%20lighting%2C%20professional%20hospitality%20interior%20photography%2C%20sophisticated%20neutral%20palette%2C%20perfectly%20fitted%20window%20treatments%20providing%20soft%20diffused%20light&width=1440&height=900&seq=hero-hotels&orientation=landscape',
    labelEn: 'Hotels',
    labelEs: 'Hoteles',
    accentEn: 'Hotels & Hospitality',
    accentEs: 'Hoteles y Hospitalidad',
    icon: 'ri-hotel-line',
  },
  {
    id: 'casinos',
    image: 'https://readdy.ai/api/search-image?query=Grand%20opulent%20casino%20interior%20with%20sophisticated%20window%20blind%20treatments%20on%20tall%20arched%20windows%20providing%20perfect%20dramatic%20ambient%20light%20control%2C%20luxurious%20high-ceiling%20gaming%20hall%20with%20elegant%20chandeliers%20casting%20warm%20gold%20light%2C%20rich%20dark%20walnut%20wood%20panels%20and%20gold%20accents%2C%20velvet%20seating%20areas%2C%20professional%20architectural%20photography%2C%20controlled%20mysterious%20casino%20atmosphere%2C%20dramatic%20and%20upscale%20environment%2C%20premium%20commercial%20window%20coverings&width=1440&height=900&seq=hero-casinos&orientation=landscape',
    labelEn: 'Casinos',
    labelEs: 'Casinos',
    accentEn: 'Casinos & Entertainment',
    accentEs: 'Casinos y Entretenimiento',
    icon: 'ri-sparkling-line',
  },
  {
    id: 'resorts',
    image: 'https://readdy.ai/api/search-image?query=Breathtaking%20luxury%20tropical%20beach%20resort%20villa%20suite%20interior%20with%20premium%20sheer%20white%20linen%20blinds%20on%20panoramic%20floor-to-ceiling%20sliding%20glass%20doors%20opening%20to%20an%20infinity%20pool%20and%20turquoise%20ocean%20view%2C%20elegant%20natural%20rattan%20and%20light%20wood%20furniture%2C%20warm%20golden%20sunset%20light%20softly%20filtered%20through%20translucent%20white%20blinds%2C%20professional%20resort%20interior%20photography%2C%20serene%20and%20sophisticated%20coastal%20luxury%20atmosphere%2C%20calm%20and%20aspirational&width=1440&height=900&seq=hero-resorts&orientation=landscape',
    labelEn: 'Resorts & Spas',
    labelEs: 'Resorts y Spas',
    accentEn: 'Resorts, Spas & Retreats',
    accentEs: 'Resorts, Spas y Retiros',
    icon: 'ri-sun-line',
  },
  {
    id: 'restaurants',
    image: 'https://readdy.ai/api/search-image?query=Sophisticated%20upscale%20restaurant%20dining%20room%20with%20elegant%20warm-toned%20faux%20wood%202-inch%20horizontal%20blinds%20on%20large%20street-facing%20windows%20filtering%20beautiful%20soft%20golden%20afternoon%20sunlight%2C%20intimate%20round%20dining%20tables%20with%20white%20linen%20tablecloths%2C%20contemporary%20refined%20interior%20design%2C%20glowing%20pendant%20lights%2C%20rich%20dark%20wood%20tones%2C%20professional%20hospitality%20photography%2C%20inviting%20and%20luxurious%20dining%20atmosphere%2C%20polished%20hardwood%20floors&width=1440&height=900&seq=hero-restaurants&orientation=landscape',
    labelEn: 'Restaurants',
    labelEs: 'Restaurantes',
    accentEn: 'Restaurants & Cafés',
    accentEs: 'Restaurantes y Cafés',
    icon: 'ri-restaurant-line',
  },
  {
    id: 'offices',
    image: 'https://readdy.ai/api/search-image?query=Modern%20sleek%20corporate%20office%20building%20interior%20with%20premium%20floor-to-ceiling%20commercial%20aluminum%20blinds%20providing%20precise%20even%20light%20control%20across%20a%20panoramic%20open-plan%20workspace%2C%20clean%20minimalist%20design%20with%20polished%20concrete%20floors%20and%20exposed%20ceilings%2C%20ergonomic%20workstations%2C%20crisp%20white%20walls%20with%20large%20windows%20fitted%20with%20professional%20commercial%20grade%20window%20treatments%2C%20bright%20evenly%20lit%20professional%20work%20environment%2C%20contemporary%20business%20architecture%20photography&width=1440&height=900&seq=hero-offices&orientation=landscape',
    labelEn: 'Office Buildings',
    labelEs: 'Edificios de Oficinas',
    accentEn: 'Offices & Commercial',
    accentEs: 'Oficinas y Comercial',
    icon: 'ri-building-4-line',
  },
];

const AUTO_INTERVAL = 5500;

export default function Hero() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((idx: number) => {
    if (transitioning) return;
    setTransitioning(true);
    setTimeout(() => {
      setCurrent(idx);
      setTransitioning(false);
    }, 350);
  }, [transitioning]);

  const next = useCallback(() => {
    goTo((current + 1) % SLIDES.length);
  }, [current, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + SLIDES.length) % SLIDES.length);
  }, [current, goTo]);

  // Auto-rotate
  useEffect(() => {
    timerRef.current = setInterval(next, AUTO_INTERVAL);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [next]);

  // Reset timer on manual navigation
  const manualGoTo = (idx: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    goTo(idx);
    timerRef.current = setInterval(next, AUTO_INTERVAL);
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const slide = SLIDES[current];
  const lang = language === 'es';

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">

      {/* ── Background images (all preloaded, cross-fade) ── */}
      {SLIDES.map((s, i) => (
        <div
          key={s.id}
          className="absolute inset-0 transition-opacity duration-700 ease-in-out"
          style={{ opacity: i === current && !transitioning ? 1 : 0, zIndex: 0 }}
        >
          <img
            src={s.image}
            alt={lang ? s.labelEs : s.labelEn}
            className="w-full h-full object-cover object-center"
          />
        </div>
      ))}

      {/* ── Overlay ── */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/20" style={{ zIndex: 1 }}></div>

      {/* ── Slide label badge (top left) ── */}
      <div className="absolute top-28 sm:top-36 left-4 sm:left-8 lg:left-16 z-10 transition-all duration-500" style={{ opacity: transitioning ? 0 : 1 }}>
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/25 rounded-full px-3 sm:px-4 py-1.5">
          <div className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-green-400">
            <i className={`${slide.icon} text-xs sm:text-sm`}></i>
          </div>
          <span className="text-white/90 text-xs font-bold uppercase tracking-widest whitespace-nowrap">
            {lang ? slide.labelEs : slide.labelEn}
          </span>
        </div>
      </div>

      {/* ── Main content ── */}
      <div
        className="relative z-10 w-full px-4 sm:px-6 lg:px-8 pt-40 sm:pt-52 transition-all duration-500"
        style={{ opacity: transitioning ? 0 : 1, transform: transitioning ? 'translateY(8px)' : 'translateY(0)' }}
      >
        <div className="max-w-3xl mx-auto flex flex-col items-center text-center">

          <p className="text-white text-xs sm:text-base font-extrabold tracking-[0.2em] sm:tracking-[0.3em] uppercase mb-3 sm:mb-5 flex items-center gap-2 sm:gap-3">
            <span className="w-6 sm:w-10 h-px bg-green-400/60 block"></span>
            Classic Same Day <span className="text-green-400 ml-1">Blinds</span>
            <span className="w-6 sm:w-10 h-px bg-green-400/60 block"></span>
          </p>

          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-3 sm:mb-4 leading-tight">
            {lang ? (
              <>Premium Blinds para<br />
                <span className="text-green-400">{slide.accentEs}</span>
              </>
            ) : (
              <>Premium Blinds for<br />
                <span className="text-green-400">{slide.accentEn}</span>
              </>
            )}
          </h1>

          <p className="text-base sm:text-xl md:text-2xl font-semibold text-green-300 mb-4 sm:mb-6 tracking-wide">
            {lang ? 'Calidad de Persianas para Cada Propiedad.' : 'Quality Blinds for Every Property.'}
          </p>

          <p className="text-sm sm:text-lg text-white/85 mb-6 sm:mb-8 max-w-2xl leading-relaxed px-2 sm:px-0">
            {lang
              ? 'De confianza para hoteles, casinos, resorts y complejos de apartamentos. Ordena desde 1 hasta más de 100,000 unidades con precios por volumen. Calidad hotelera, envío gratis en cada pedido.'
              : 'Trusted by hotels, casinos, resorts, and apartment complexes. Order 1 to 100,000+ units with bulk pricing. Hospitality-grade quality, free shipping on every order.'}
          </p>

          {/* B2B callout */}
          <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm border border-white/25 rounded-xl px-4 sm:px-5 py-3 sm:py-4 max-w-2xl w-full mb-6 sm:mb-8">
            <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-green-400 shrink-0 mt-0.5">
              <i className="ri-building-2-line text-lg sm:text-xl"></i>
            </div>
            <p className="text-white/90 text-xs sm:text-sm leading-relaxed text-left">
              {lang ? '¿Comprando al por mayor?' : 'Buying in bulk?'}{' '}
              <button
                onClick={() => navigate('/membership')}
                className="text-green-300 font-bold underline underline-offset-2 hover:text-green-200 transition-colors cursor-pointer whitespace-nowrap"
              >
                {lang ? 'Mira nuestras opciones de membresía →' : 'Take a look at our membership options →'}
              </button>
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-3 sm:gap-4 justify-center w-full px-2 sm:px-0">
            <button
              onClick={() => navigate('/products')}
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold px-6 sm:px-8 py-3 sm:py-3.5 rounded-full transition-all duration-200 whitespace-nowrap text-sm sm:text-base cursor-pointer"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-store-2-line text-lg"></i>
              </div>
              {lang ? 'Comprar Ahora' : 'Shop Now'}
            </button>
            <button
              onClick={() => navigate('/free-sample')}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/40 text-white font-bold px-6 sm:px-8 py-3 sm:py-3.5 rounded-full transition-all duration-200 whitespace-nowrap text-sm sm:text-base cursor-pointer"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-gift-line text-lg"></i>
              </div>
              {lang ? 'Muestras Gratis' : 'Free Samples'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Prev / Next arrows ── */}
      <button
        onClick={() => manualGoTo((current - 1 + SLIDES.length) % SLIDES.length)}
        className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center bg-white/10 hover:bg-white/25 backdrop-blur-sm border border-white/25 rounded-full text-white transition-all duration-200 cursor-pointer"
        aria-label="Previous slide"
      >
        <i className="ri-arrow-left-s-line text-xl"></i>
      </button>
      <button
        onClick={() => manualGoTo((current + 1) % SLIDES.length)}
        className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center bg-white/10 hover:bg-white/25 backdrop-blur-sm border border-white/25 rounded-full text-white transition-all duration-200 cursor-pointer"
        aria-label="Next slide"
      >
        <i className="ri-arrow-right-s-line text-xl"></i>
      </button>

      {/* ── Slide indicators + client type icons ── */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => manualGoTo(i)}
            className="group relative flex flex-col items-center gap-1.5 cursor-pointer"
            aria-label={lang ? s.labelEs : s.labelEn}
          >
            {/* Tooltip */}
            <span className="absolute bottom-full mb-2 bg-black/70 text-white text-[10px] font-semibold px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              {lang ? s.labelEs : s.labelEn}
            </span>
            {/* Dot */}
            <span
              className={`block rounded-full transition-all duration-400 ${
                i === current
                  ? 'w-8 h-2 bg-green-400'
                  : 'w-2 h-2 bg-white/40 hover:bg-white/70'
              }`}
            ></span>
          </button>
        ))}
      </div>

      {/* ── Scroll down cue ── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-20">
        <button onClick={() => scrollToSection('categories')} className="w-10 h-10 flex items-center justify-center text-white/60 cursor-pointer">
          <i className="ri-arrow-down-line text-2xl"></i>
        </button>
      </div>
    </section>
  );
}
