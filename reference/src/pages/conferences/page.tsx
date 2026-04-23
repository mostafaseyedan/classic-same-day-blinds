import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

const upcomingConferences = [
  {
    id: 2,
    title: 'Apartmentalize 2026 (NAA)',
    titleEs: 'Apartmentalize 2026 (NAA)',
    date: 'June 17–19, 2026',
    dateEs: '17–19 de Junio, 2026',
    location: 'Ernest N. Morial Convention Center, New Orleans, LA',
    locationEs: 'Centro de Convenciones Ernest N. Morial, Nueva Orleans, LA',
    topic: 'Multifamily Operations, Window Treatments & Resident Experience',
    topicEs: 'Operaciones Multifamily, Tratamientos de Ventanas y Experiencia del Residente',
    seats: 300,
    seatsLeft: 112,
    price: '$449',
    image: 'https://readdy.ai/api/search-image?query=Large%20apartment%20industry%20trade%20show%20in%20elegant%20convention%20center%2C%20professional%20exhibitors%20showcasing%20window%20blinds%20and%20shades%20for%20multifamily%20housing%2C%20modern%20expo%20hall%20with%20colorful%20booths%2C%20networking%20professionals%20in%20business%20attire%2C%20warm%20golden%20lighting%2C%20wide%20angle%20photography&width=600&height=380&seq=conf-upcoming-naa-2026&orientation=landscape',
    tag: 'Upcoming',
    tagEs: 'Próximo',
    tagColor: 'bg-green-100 text-green-700',
  },
  {
    id: 3,
    title: 'AIM Conference 2026',
    titleEs: 'Conferencia AIM 2026',
    date: 'May 3–6, 2026',
    dateEs: '3–6 de Mayo, 2026',
    location: 'Hyatt Regency Huntington Beach, Huntington Beach, CA',
    locationEs: 'Hyatt Regency Huntington Beach, Huntington Beach, CA',
    topic: 'Apartment Innovation — Smart Window Tech, PropTech & Resident Experience',
    topicEs: 'Innovación en Apartamentos — Tecnología Inteligente de Ventanas y PropTech',
    seats: 180,
    seatsLeft: 45,
    price: '$329',
    image: 'https://readdy.ai/api/search-image?query=Modern%20beachside%20hotel%20conference%20venue%20with%20apartment%20industry%20professionals%20networking%2C%20innovative%20technology%20displays%20for%20smart%20home%20window%20treatments%20and%20blinds%2C%20contemporary%20resort%20setting%20with%20ocean%20views%2C%20professional%20event%20photography%2C%20bright%20airy%20atmosphere&width=600&height=380&seq=conf-upcoming-aim-2026&orientation=landscape',
    tag: 'Early Bird',
    tagEs: 'Precio Anticipado',
    tagColor: 'bg-amber-100 text-amber-700',
  },
];

const pastConferences = [
  {
    id: 4,
    title: 'NMHC Annual Meeting 2025',
    titleEs: 'Reunión Anual NMHC 2025',
    date: 'January 2025',
    dateEs: 'Enero 2025',
    location: 'ARIA Resort & Casino, Las Vegas, NV',
    locationEs: 'ARIA Resort & Casino, Las Vegas, NV',
    attendees: 2800,
    highlight: 'Keynote: Multifamily Market Trends & Window Treatment Procurement Strategies',
    highlightEs: 'Conferencia Principal: Tendencias del Mercado Multifamiliar y Estrategias de Adquisición',
    image: 'https://readdy.ai/api/search-image?query=Professional%20business%20conference%20recap%20photo%20in%20luxury%20Las%20Vegas%20resort%20ballroom%2C%20large%20audience%20of%20apartment%20industry%20executives%2C%20speaker%20on%20stage%20with%20presentation%20slides%20about%20multifamily%20housing%20trends%2C%20professional%20event%20photography%2C%20warm%20stage%20lighting%2C%20elegant%20venue&width=600&height=340&seq=conf-past-nmhc-2025&orientation=landscape',
  },
  {
    id: 5,
    title: 'Apartmentalize 2025 (NAA)',
    titleEs: 'Apartmentalize 2025 (NAA)',
    date: 'June 2025',
    dateEs: 'Junio 2025',
    location: 'Philadelphia, PA',
    locationEs: 'Filadelfia, PA',
    attendees: 9500,
    highlight: 'Workshop: Bulk Window Treatment Solutions for Large Apartment Communities',
    highlightEs: 'Taller: Soluciones de Persianas al Por Mayor para Grandes Comunidades de Apartamentos',
    image: 'https://readdy.ai/api/search-image?query=Massive%20apartment%20industry%20trade%20show%20in%20Philadelphia%20convention%20center%2C%20thousands%20of%20multifamily%20housing%20professionals%20networking%2C%20large%20exhibition%20floor%20with%20window%20treatment%20and%20blinds%20displays%2C%20professional%20event%20photography%2C%20bright%20modern%20expo%20lighting&width=600&height=340&seq=conf-past-naa-2025&orientation=landscape',
  },
  {
    id: 6,
    title: 'NAHB International Builders\' Show 2025',
    titleEs: 'Feria Internacional de Constructores NAHB 2025',
    date: 'February 2025',
    dateEs: 'Febrero 2025',
    location: 'Las Vegas Convention Center, NV',
    locationEs: 'Centro de Convenciones de Las Vegas, NV',
    attendees: 70000,
    highlight: 'Panel: Custom Blinds & Shades for New Multifamily Construction Projects',
    highlightEs: 'Panel: Persianas y Cortinas Personalizadas para Nuevos Proyectos de Construcción Multifamiliar',
    image: 'https://readdy.ai/api/search-image?query=World%20largest%20construction%20trade%20show%20in%20Las%20Vegas%20convention%20center%2C%20massive%20exhibition%20hall%20with%20tens%20of%20thousands%20of%20builders%20and%20contractors%2C%20window%20and%20door%20product%20displays%2C%20professional%20trade%20show%20photography%2C%20bright%20modern%20lighting%2C%20impressive%20scale&width=600&height=340&seq=conf-past-ibs-2025&orientation=landscape',
  },
];

const speakers = [
  {
    name: 'James K. Tobin',
    role: 'CEO, National Multifamily Housing Council',
    roleEs: 'CEO, Consejo Nacional de Vivienda Multifamiliar',
    company: 'NMHC',
    avatar: 'https://readdy.ai/api/search-image?query=Professional%20male%20executive%20CEO%20headshot%2C%20confident%20authoritative%20smile%2C%20dark%20business%20suit%2C%20clean%20neutral%20studio%20background%2C%20corporate%20portrait%20photography%2C%20polished%20leadership%20appearance&width=120&height=120&seq=speaker-tobin-2026&orientation=squarish',
  },
  {
    name: 'Dr. Patricia Holloway',
    role: 'Interior Design & Window Treatment Expert',
    roleEs: 'Experta en Diseño de Interiores y Tratamientos de Ventanas',
    company: 'Holloway Design Group',
    avatar: 'https://readdy.ai/api/search-image?query=Professional%20female%20interior%20design%20expert%20headshot%2C%20confident%20warm%20smile%2C%20business%20attire%2C%20neutral%20studio%20background%2C%20corporate%20portrait%20photography%2C%20polished%20appearance&width=120&height=120&seq=speaker-holloway-2026&orientation=squarish',
  },
  {
    name: 'Marcus J. Reeves',
    role: 'Smart Home & Motorized Blinds Specialist',
    roleEs: 'Especialista en Hogar Inteligente y Persianas Motorizadas',
    company: 'AutoShade Technologies',
    avatar: 'https://readdy.ai/api/search-image?query=Professional%20male%20smart%20home%20technology%20executive%20headshot%2C%20confident%20smile%2C%20modern%20business%20attire%2C%20clean%20neutral%20background%2C%20corporate%20portrait%20photography&width=120&height=120&seq=speaker-reeves-2026&orientation=squarish',
  },
  {
    name: 'Linda Castillo',
    role: 'Multifamily Procurement Director',
    roleEs: 'Directora de Adquisiciones Multifamiliares',
    company: 'Grand Resorts International',
    avatar: 'https://readdy.ai/api/search-image?query=Professional%20Latina%20female%20procurement%20director%20headshot%2C%20warm%20professional%20smile%2C%20elegant%20business%20attire%2C%20neutral%20background%2C%20corporate%20portrait%20photography&width=120&height=120&seq=speaker-castillo-2026&orientation=squarish',
  },
];

const agendas = [
  {
    confId: 2,
    title: 'Apartmentalize 2026 (NAA)',
    titleEs: 'Apartmentalize 2026 (NAA)',
    date: 'June 17–19, 2026 · Ernest N. Morial Convention Center, New Orleans, LA',
    dateEs: '17–19 Jun, 2026 · Centro de Convenciones Ernest N. Morial, Nueva Orleans, LA',
    days: [
      {
        day: 'Day 1 — June 17',
        dayEs: 'Día 1 — 17 de Junio',
        sessions: [
          { time: '8:00 AM', timeEs: '8:00 AM', title: 'Registration & Continental Breakfast', titleEs: 'Registro y Desayuno Continental', type: 'break', speaker: '' },
          { time: '9:00 AM', timeEs: '9:00 AM', title: 'Opening Keynote: Multifamily Operations & Resident Satisfaction in 2026', titleEs: 'Conferencia Inaugural: Operaciones Multifamiliares y Satisfacción del Residente en 2026', type: 'keynote', speaker: 'James K. Tobin' },
          { time: '10:30 AM', timeEs: '10:30 AM', title: 'Coffee Break & 450+ Exhibitor Expo Floor Opens', titleEs: 'Descanso y Apertura del Piso de Exposición con 450+ Expositores', type: 'break', speaker: '' },
          { time: '11:00 AM', timeEs: '11:00 AM', title: 'Workshop: Window Treatment Upgrades That Boost Resident Retention', titleEs: 'Taller: Mejoras de Tratamientos de Ventanas que Aumentan la Retención de Residentes', type: 'workshop', speaker: 'Dr. Patricia Holloway' },
          { time: '12:30 PM', timeEs: '12:30 PM', title: 'Networking Lunch', titleEs: 'Almuerzo de Networking', type: 'break', speaker: '' },
          { time: '2:00 PM', timeEs: '2:00 PM', title: 'Panel: Procurement Best Practices — Blinds & Shades for 100+ Unit Properties', titleEs: 'Panel: Mejores Prácticas de Adquisición — Persianas para Propiedades de 100+ Unidades', type: 'panel', speaker: 'Linda Castillo · Marcus J. Reeves' },
          { time: '3:30 PM', timeEs: '3:30 PM', title: 'Live Demo: Same-Day Blind Installation for Apartment Turnovers', titleEs: 'Demo en Vivo: Instalación de Persianas el Mismo Día para Rotación de Apartamentos', type: 'demo', speaker: '' },
          { time: '5:30 PM', timeEs: '5:30 PM', title: 'Rooftop Networking Cocktail Hour', titleEs: 'Cóctel de Networking en la Azotea', type: 'break', speaker: '' },
        ],
      },
      {
        day: 'Day 2 — June 18',
        dayEs: 'Día 2 — 18 de Junio',
        sessions: [
          { time: '8:30 AM', timeEs: '8:30 AM', title: 'Morning Coffee & Expo Floor', titleEs: 'Café Matutino y Piso de Exposición', type: 'break', speaker: '' },
          { time: '9:00 AM', timeEs: '9:00 AM', title: 'Keynote: Smart Building Technology & Automated Window Treatments', titleEs: 'Conferencia: Tecnología de Edificios Inteligentes y Tratamientos de Ventanas Automatizados', type: 'keynote', speaker: 'Marcus J. Reeves' },
          { time: '10:30 AM', timeEs: '10:30 AM', title: 'Workshop: Negotiating Volume Discounts with Window Treatment Suppliers', titleEs: 'Taller: Negociación de Descuentos por Volumen con Proveedores de Tratamientos de Ventanas', type: 'workshop', speaker: 'Linda Castillo' },
          { time: '12:00 PM', timeEs: '12:00 PM', title: 'Lunch & Member Deals Showcase', titleEs: 'Almuerzo y Exhibición de Ofertas para Miembros', type: 'break', speaker: '' },
          { time: '1:30 PM', timeEs: '1:30 PM', title: 'CEU Session: Sustainable & Energy-Efficient Window Treatments for Multifamily', titleEs: 'Sesión CEU: Tratamientos de Ventanas Sostenibles y Eficientes para Multifamiliar', type: 'ceu', speaker: 'Dr. Patricia Holloway' },
          { time: '3:00 PM', timeEs: '3:00 PM', title: 'NAA Excellence Awards Ceremony', titleEs: 'Ceremonia de Premios de Excelencia NAA', type: 'award', speaker: '' },
          { time: '4:30 PM', timeEs: '4:30 PM', title: 'Closing Remarks & Farewell', titleEs: 'Palabras de Cierre y Despedida', type: 'break', speaker: '' },
        ],
      },
    ],
  },
  {
    confId: 3,
    title: 'AIM Conference 2026',
    titleEs: 'Conferencia AIM 2026',
    date: 'May 3–6, 2026 · Hyatt Regency Huntington Beach, CA',
    dateEs: '3–6 May, 2026 · Hyatt Regency Huntington Beach, CA',
    days: [
      {
        day: 'Day 1 — May 3',
        dayEs: 'Día 1 — 3 de Mayo',
        sessions: [
          { time: '8:00 AM', timeEs: '8:00 AM', title: 'Registration & Welcome Breakfast', titleEs: 'Registro y Desayuno de Bienvenida', type: 'break', speaker: '' },
          { time: '9:00 AM', timeEs: '9:00 AM', title: 'Opening Keynote: PropTech & AI Transforming the Apartment Industry', titleEs: 'Conferencia Inaugural: PropTech e IA Transformando la Industria de Apartamentos', type: 'keynote', speaker: 'James K. Tobin' },
          { time: '10:30 AM', timeEs: '10:30 AM', title: 'Coffee Break & Innovation Showcase', titleEs: 'Descanso y Exhibición de Innovación', type: 'break', speaker: '' },
          { time: '11:00 AM', timeEs: '11:00 AM', title: 'Workshop: Smart Window Treatments — Integrating Blinds with Building Automation', titleEs: 'Taller: Tratamientos de Ventanas Inteligentes — Integración con Automatización de Edificios', type: 'workshop', speaker: 'Marcus J. Reeves' },
          { time: '12:30 PM', timeEs: '12:30 PM', title: 'Networking Lunch', titleEs: 'Almuerzo de Networking', type: 'break', speaker: '' },
          { time: '2:00 PM', timeEs: '2:00 PM', title: 'Panel: Digital Marketing & Resident Experience — The Role of Interior Finishes', titleEs: 'Panel: Marketing Digital y Experiencia del Residente — El Rol de los Acabados Interiores', type: 'panel', speaker: 'Dr. Patricia Holloway · Linda Castillo' },
          { time: '3:30 PM', timeEs: '3:30 PM', title: 'Live Demo: App-Controlled Motorized Shades for Apartment Communities', titleEs: 'Demo en Vivo: Persianas Motorizadas Controladas por App para Comunidades de Apartamentos', type: 'demo', speaker: '' },
          { time: '5:00 PM', timeEs: '5:00 PM', title: 'Beachside Networking Reception', titleEs: 'Recepción de Networking en la Playa', type: 'break', speaker: '' },
        ],
      },
      {
        day: 'Day 2 — May 4',
        dayEs: 'Día 2 — 4 de Mayo',
        sessions: [
          { time: '8:30 AM', timeEs: '8:30 AM', title: 'Morning Coffee & Innovation Floor', titleEs: 'Café Matutino y Piso de Innovación', type: 'break', speaker: '' },
          { time: '9:00 AM', timeEs: '9:00 AM', title: 'Keynote: Data-Driven Design — What Residents Want in Window Treatments', titleEs: 'Conferencia: Diseño Basado en Datos — Lo que los Residentes Quieren en Tratamientos de Ventanas', type: 'keynote', speaker: 'Dr. Patricia Holloway' },
          { time: '10:30 AM', timeEs: '10:30 AM', title: 'Workshop: Streamlining Blind Installations Across Multiple Properties', titleEs: 'Taller: Optimización de Instalaciones de Persianas en Múltiples Propiedades', type: 'workshop', speaker: 'Marcus J. Reeves' },
          { time: '12:00 PM', timeEs: '12:00 PM', title: 'Lunch & Early Bird Member Deals', titleEs: 'Almuerzo y Ofertas para Miembros con Precio Anticipado', type: 'break', speaker: '' },
          { time: '1:30 PM', timeEs: '1:30 PM', title: 'CEU Session: Sustainable Materials & Green Building Standards for Window Treatments', titleEs: 'Sesión CEU: Materiales Sostenibles y Estándares de Construcción Verde para Tratamientos de Ventanas', type: 'ceu', speaker: 'Dr. Patricia Holloway' },
          { time: '3:00 PM', timeEs: '3:00 PM', title: 'AIM Innovation Awards', titleEs: 'Premios de Innovación AIM', type: 'award', speaker: '' },
          { time: '4:30 PM', timeEs: '4:30 PM', title: 'Closing Remarks & Farewell', titleEs: 'Palabras de Cierre y Despedida', type: 'break', speaker: '' },
        ],
      },
    ],
  },
];

const sessionTypeConfig: Record<string, { color: string; icon: string; label: string; labelEs: string }> = {
  keynote: { color: 'bg-green-100 text-green-800 border-green-200', icon: 'ri-mic-line', label: 'Keynote', labelEs: 'Conferencia' },
  workshop: { color: 'bg-amber-100 text-amber-800 border-amber-200', icon: 'ri-tools-line', label: 'Workshop', labelEs: 'Taller' },
  panel: { color: 'bg-sky-100 text-sky-800 border-sky-200', icon: 'ri-group-line', label: 'Panel', labelEs: 'Panel' },
  demo: { color: 'bg-violet-100 text-violet-800 border-violet-200', icon: 'ri-play-circle-line', label: 'Live Demo', labelEs: 'Demo en Vivo' },
  ceu: { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: 'ri-file-list-3-line', label: 'CEU Credit', labelEs: 'Crédito CEU' },
  award: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: 'ri-award-line', label: 'Awards', labelEs: 'Premios' },
  break: { color: 'bg-gray-100 text-gray-500 border-gray-200', icon: 'ri-cup-line', label: 'Break / Social', labelEs: 'Descanso / Social' },
};

export default function ConferencesPage() {
  const { language } = useLanguage();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', company: '', conference: '', message: '' });
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [activeAgendaConf, setActiveAgendaConf] = useState(0);
  const [activeAgendaDay, setActiveAgendaDay] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.message.length > 500) return;
    setSubmitStatus('submitting');
    try {
      const body = new URLSearchParams();
      Object.entries(formData).forEach(([k, v]) => body.append(k, v));
      const res = await fetch('https://readdy.ai/api/form/d6q69nkddmmni7ck8cn0', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
      if (res.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', phone: '', company: '', conference: '', message: '' });
        setTimeout(() => setSubmitStatus('idle'), 5000);
      } else {
        setSubmitStatus('error');
        setTimeout(() => setSubmitStatus('idle'), 4000);
      }
    } catch {
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 4000);
    }
  };

  const en = language === 'en';
  const currentAgenda = agendas[activeAgendaConf];
  const currentDay = currentAgenda.days[activeAgendaDay];

  return (
    <div className="min-h-screen bg-white">
      {/* Top Nav */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-green-700 hover:text-white text-gray-700 text-sm font-semibold rounded-md transition-all duration-200 cursor-pointer whitespace-nowrap"
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-arrow-left-line"></i>
              </div>
              {en ? 'Back to Home' : 'Volver al Inicio'}
            </Link>
            <Link to="/" className="text-base font-bold text-gray-900">
              {en ? 'Classic Same Day Blinds' : 'Persianas Clásicas Mismo Día'}
            </Link>
            <div className="w-36"></div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative bg-gray-900 overflow-hidden">
        <img
          src="https://readdy.ai/api/search-image?query=Grand%20professional%20conference%20center%20with%20large%20audience%2C%20impressive%20stage%20with%20dramatic%20lighting%2C%20window%20treatment%20industry%20expo%20with%20elegant%20displays%2C%20wide%20angle%20architectural%20photography%2C%20sophisticated%20event%20venue%20with%20warm%20amber%20and%20neutral%20tones%2C%20professional%20business%20gathering%20atmosphere&width=1920&height=560&seq=conf-hero-main-001&orientation=landscape"
          alt={en ? 'Classic Same Day Blinds Conferences' : 'Conferencias Persianas Clásicas Mismo Día'}
          className="w-full h-[420px] object-cover object-top opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 via-gray-900/50 to-gray-900/80"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <span className="inline-flex items-center gap-2 bg-green-700/30 border border-green-500/40 text-green-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-5">
            <i className="ri-calendar-event-line"></i>
            {en ? '2026 Industry Events & Education' : 'Eventos Educativos de la Industria 2026'}
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
            {en ? (
              <>2026 <span className="text-green-400">Conferences</span></>
            ) : (
              <>Conferencias <span className="text-green-400">2026</span></>
            )}
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mb-3">
            {en
              ? 'Join us at the top 2026 industry events for apartment builders and window & blind professionals across the United States.'
              : 'Únase a nosotros en los principales eventos de la industria 2026 para constructores de apartamentos y profesionales de persianas en los Estados Unidos.'}
          </p>
          <p className="text-base text-green-300 font-semibold max-w-xl mb-8">
            {en
              ? "We'll be there showcasing our products — and we'd love to meet you! Register below so we know you're coming."
              : 'Estaremos allí mostrando nuestros productos — ¡y nos encantaría conocerle! Regístrese abajo para que sepamos que viene.'}
          </p>
          <a
            href="#register"
            className="px-8 py-3.5 bg-green-700 text-white font-semibold rounded-md hover:bg-green-800 transition-all cursor-pointer whitespace-nowrap text-base"
          >
            {en ? "Register Now — Let Us Know You're Coming" : 'Regístrese Ahora — Háganos Saber que Viene'}
          </a>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-green-700 py-5">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '3', label: en ? 'Major 2026 Events' : 'Grandes Eventos 2026' },
            { value: '80,000+', label: en ? 'Industry Attendees' : 'Asistentes de la Industria' },
            { value: '450+', label: en ? 'Exhibitors Nationwide' : 'Expositores en EE.UU.' },
            { value: '4', label: en ? 'States Represented' : 'Estados Representados' },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-green-200 text-sm mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming Conferences */}
      <section id="upcoming" className="py-20 px-4 bg-stone-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              {en ? 'Upcoming 2026 Conferences' : 'Próximas Conferencias 2026'}
            </h2>
            <p className="text-gray-500 text-base max-w-xl mx-auto">
              {en
                ? 'Real industry events for apartment builders and window & blind professionals. Reserve your spot early.'
                : 'Eventos reales de la industria para constructores de apartamentos y profesionales de persianas. Reserve su lugar con anticipación.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {upcomingConferences.map((conf) => (
              <div key={conf.id} className="bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col">
                <div className="relative">
                  <img
                    src={conf.image}
                    alt={en ? conf.title : conf.titleEs}
                    className="w-full h-48 object-cover object-top"
                  />
                  <span className={`absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full ${conf.tagColor}`}>
                    {en ? conf.tag : conf.tagEs}
                  </span>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-bold text-gray-900 text-base mb-3 leading-snug">
                    {en ? conf.title : conf.titleEs}
                  </h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="w-4 h-4 flex items-center justify-center shrink-0">
                        <i className="ri-calendar-line text-green-600"></i>
                      </div>
                      {en ? conf.date : conf.dateEs}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="w-4 h-4 flex items-center justify-center shrink-0">
                        <i className="ri-map-pin-line text-green-600"></i>
                      </div>
                      {en ? conf.location : conf.locationEs}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="w-4 h-4 flex items-center justify-center shrink-0">
                        <i className="ri-discuss-line text-green-600"></i>
                      </div>
                      {en ? conf.topic : conf.topicEs}
                    </div>
                  </div>

                  <div className="mt-auto">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-gray-400">
                        {conf.seatsLeft} {en ? 'seats left' : 'lugares disponibles'}
                      </span>
                      <span className="text-lg font-bold text-gray-900">{conf.price}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4">
                      <div
                        className="bg-green-600 h-1.5 rounded-full"
                        style={{ width: `${((conf.seats - conf.seatsLeft) / conf.seats) * 100}%` }}
                      ></div>
                    </div>
                    <a
                      href="#register"
                      onClick={() => setFormData((p) => ({ ...p, conference: en ? conf.title : conf.titleEs }))}
                      className="block w-full text-center py-2.5 bg-green-700 text-white text-sm font-semibold rounded-lg hover:bg-green-800 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {en ? 'Register Now' : 'Registrarse Ahora'}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Speakers */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              {en ? 'Featured Speakers' : 'Ponentes Destacados'}
            </h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              {en
                ? 'Learn from top industry leaders in multifamily housing, apartment construction, and window treatment solutions.'
                : 'Aprenda de los principales líderes de la industria en vivienda multifamiliar, construcción de apartamentos y soluciones de tratamientos de ventanas.'}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {speakers.map((s) => (
              <div key={s.name} className="text-center">
                <img
                  src={s.avatar}
                  alt={s.name}
                  className="w-24 h-24 rounded-full object-cover object-top mx-auto mb-4 border-4 border-stone-100 shadow-sm"
                />
                <div className="font-bold text-gray-900 text-sm">{s.name}</div>
                <div className="text-green-700 text-xs font-semibold mt-0.5">{en ? s.role : s.roleEs}</div>
                <div className="text-gray-400 text-xs mt-0.5">{s.company}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Conference Agenda */}
      <section id="agenda" className="py-20 px-4 bg-stone-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-xs font-bold px-4 py-1.5 rounded-full mb-4">
              <i className="ri-time-line"></i>
              {en ? 'Full Schedule' : 'Programa Completo'}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              {en ? 'Conference Agenda' : 'Agenda de la Conferencia'}
            </h2>
            <p className="text-gray-500 text-base max-w-xl mx-auto">
              {en
                ? 'Browse the full session schedule for each 2026 event — plan your days in advance.'
                : 'Consulte el programa completo de sesiones para cada evento 2026 y planifique sus días con anticipación.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 justify-center mb-10">
            {agendas.map((ag, idx) => (
              <button
                key={ag.confId}
                onClick={() => { setActiveAgendaConf(idx); setActiveAgendaDay(0); }}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold border transition-all cursor-pointer whitespace-nowrap ${
                  activeAgendaConf === idx
                    ? 'bg-green-700 text-white border-green-700 shadow-md'
                    : 'bg-white text-gray-600 border-stone-200 hover:border-green-400 hover:text-green-700'
                }`}
              >
                {en ? ag.title : ag.titleEs}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="bg-green-700 px-8 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h3 className="text-white font-bold text-lg leading-snug">
                  {en ? currentAgenda.title : currentAgenda.titleEs}
                </h3>
                <div className="flex items-center gap-2 text-green-200 text-sm mt-1">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-map-pin-line"></i>
                  </div>
                  {en ? currentAgenda.date : currentAgenda.dateEs}
                </div>
              </div>
              <a
                href="#register"
                onClick={() => setFormData((p) => ({ ...p, conference: en ? currentAgenda.title : currentAgenda.titleEs }))}
                className="inline-flex items-center gap-2 px-5 py-2 bg-white text-green-700 text-sm font-bold rounded-lg hover:bg-green-50 transition-colors cursor-pointer whitespace-nowrap self-start md:self-auto"
              >
                <i className="ri-calendar-check-line"></i>
                {en ? 'Register for This Event' : 'Registrarse para Este Evento'}
              </a>
            </div>

            <div className="flex border-b border-stone-200 bg-stone-50">
              {currentAgenda.days.map((day, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveAgendaDay(idx)}
                  className={`flex-1 py-3.5 text-sm font-semibold transition-all cursor-pointer whitespace-nowrap border-b-2 ${
                    activeAgendaDay === idx
                      ? 'border-green-600 text-green-700 bg-white'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {en ? day.day : day.dayEs}
                </button>
              ))}
            </div>

            <div className="divide-y divide-stone-100">
              {currentDay.sessions.map((session, idx) => {
                const typeConf = sessionTypeConfig[session.type];
                return (
                  <div
                    key={idx}
                    className={`flex gap-5 px-8 py-5 hover:bg-stone-50 transition-colors ${session.type === 'break' ? 'opacity-70' : ''}`}
                  >
                    <div className="w-20 shrink-0 pt-0.5">
                      <span className="text-sm font-bold text-gray-700 whitespace-nowrap">
                        {en ? session.time : session.timeEs}
                      </span>
                    </div>
                    <div className={`w-1 rounded-full shrink-0 self-stretch min-h-[20px] ${
                      session.type === 'keynote' ? 'bg-green-500' :
                      session.type === 'workshop' ? 'bg-amber-400' :
                      session.type === 'panel' ? 'bg-sky-400' :
                      session.type === 'demo' ? 'bg-violet-400' :
                      session.type === 'ceu' ? 'bg-orange-400' :
                      session.type === 'award' ? 'bg-yellow-400' :
                      'bg-gray-300'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start gap-2 mb-1">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${typeConf.color}`}>
                          <i className={`${typeConf.icon} text-xs`}></i>
                          {en ? typeConf.label : typeConf.labelEs}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 leading-snug">
                        {en ? session.title : session.titleEs}
                      </p>
                      {session.speaker && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <div className="w-3.5 h-3.5 flex items-center justify-center">
                            <i className="ri-user-line text-green-600 text-xs"></i>
                          </div>
                          <span className="text-xs text-gray-500">{session.speaker}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="px-8 py-5 bg-stone-50 border-t border-stone-200">
              <p className="text-xs text-gray-400 font-semibold mb-3 uppercase tracking-wide">
                {en ? 'Session Types' : 'Tipos de Sesión'}
              </p>
              <div className="flex flex-wrap gap-3">
                {Object.entries(sessionTypeConfig).map(([key, cfg]) => (
                  <span key={key} className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${cfg.color}`}>
                    <i className={`${cfg.icon} text-xs`}></i>
                    {en ? cfg.label : cfg.labelEs}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              {en ? 'What to Expect' : '¿Qué Esperar?'}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: 'ri-presentation-line',
                title: en ? 'Expert Keynotes' : 'Conferencias de Expertos',
                desc: en
                  ? 'Hear from NMHC, NAA, and NAHB leaders on the latest trends in multifamily construction and window treatment procurement.'
                  : 'Escuche a líderes de NMHC, NAA y NAHB sobre las últimas tendencias en construcción multifamiliar y adquisición de tratamientos de ventanas.',
              },
              {
                icon: 'ri-tools-line',
                title: en ? 'Hands-On Workshops' : 'Talleres Prácticos',
                desc: en
                  ? 'Get hands-on with motorized systems, bulk installation techniques, and smart home integrations tailored for apartment communities.'
                  : 'Experimente de primera mano sistemas motorizados, técnicas de instalación masiva e integraciones de hogar inteligente para comunidades de apartamentos.',
              },
              {
                icon: 'ri-group-line',
                title: en ? 'Networking Events' : 'Eventos de Networking',
                desc: en
                  ? 'Connect with apartment developers, property managers, general contractors, and procurement directors from across the country.'
                  : 'Conéctese con desarrolladores de apartamentos, administradores de propiedades, contratistas generales y directores de adquisiciones de todo el país.',
              },
              {
                icon: 'ri-price-tag-3-line',
                title: en ? 'Exclusive Member Deals' : 'Ofertas Exclusivas para Miembros',
                desc: en
                  ? 'Conference attendees unlock special bulk pricing, early access to new collections, and member-only promotions on blinds and shades.'
                  : 'Los asistentes desbloquean precios especiales al por mayor, acceso anticipado a nuevas colecciones y promociones exclusivas en persianas y cortinas.',
              },
              {
                icon: 'ri-award-line',
                title: en ? 'Industry Awards' : 'Premios de la Industria',
                desc: en
                  ? 'Celebrate excellence with NAA, NAHB, and AIM awards recognizing the best multifamily projects and window treatment innovations.'
                  : 'Celebre la excelencia con los premios NAA, NAHB y AIM que reconocen los mejores proyectos multifamiliares e innovaciones en tratamientos de ventanas.',
              },
              {
                icon: 'ri-file-list-3-line',
                title: en ? 'CEU Credits Available' : 'Créditos CEU Disponibles',
                desc: en
                  ? 'Earn continuing education credits recognized by ASID, NCIDQ, NAHB, and other leading design and construction certification bodies.'
                  : 'Obtenga créditos de educación continua reconocidos por ASID, NCIDQ, NAHB y otros organismos líderes de certificación en diseño y construcción.',
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 p-6 bg-stone-50 rounded-xl border border-stone-100 hover:border-green-200 transition-colors">
                <div className="w-11 h-11 flex items-center justify-center bg-green-100 rounded-xl shrink-0">
                  <i className={`${item.icon} text-green-700 text-xl`}></i>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Past Conferences */}
      <section className="py-20 px-4 bg-stone-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              {en ? 'Past Conferences' : 'Conferencias Anteriores'}
            </h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              {en
                ? 'A look back at the major 2025 industry events we attended and exhibited at.'
                : 'Un vistazo a los principales eventos de la industria 2025 en los que participamos y exhibimos.'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pastConferences.map((conf) => (
              <div key={conf.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
                <img
                  src={conf.image}
                  alt={en ? conf.title : conf.titleEs}
                  className="w-full h-44 object-cover object-top"
                />
                <div className="p-5">
                  <span className="inline-block text-xs font-bold bg-gray-200 text-gray-600 px-2.5 py-0.5 rounded-full mb-3">
                    {en ? 'Past Event' : 'Evento Pasado'}
                  </span>
                  <h3 className="font-bold text-gray-900 text-sm mb-3 leading-snug">
                    {en ? conf.title : conf.titleEs}
                  </h3>
                  <div className="space-y-1.5 mb-3">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                        <i className="ri-calendar-line text-green-600"></i>
                      </div>
                      {en ? conf.date : conf.dateEs}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                        <i className="ri-map-pin-line text-green-600"></i>
                      </div>
                      {en ? conf.location : conf.locationEs}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                        <i className="ri-group-line text-green-600"></i>
                      </div>
                      {conf.attendees.toLocaleString()} {en ? 'attendees' : 'asistentes'}
                    </div>
                  </div>
                  <div className="bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                    <p className="text-xs text-green-800 font-medium">
                      <i className="ri-star-line mr-1"></i>
                      {en ? conf.highlight : conf.highlightEs}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section id="register" className="py-20 px-4 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-xs font-bold px-4 py-1.5 rounded-full mb-4">
              <i className="ri-hand-heart-line"></i>
              {en ? "We'd Love to Meet You!" : '¡Nos Encantaría Conocerle!'}
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              {en ? 'Register for a 2026 Conference' : 'Regístrese para una Conferencia 2026'}
            </h2>
            <p className="text-gray-600 text-sm max-w-lg mx-auto leading-relaxed">
              {en
                ? "We'll be at these events showcasing our latest blinds and window treatment products. Let us know which event you'll attend so we can connect with you there!"
                : 'Estaremos en estos eventos mostrando nuestros últimos productos de persianas y tratamientos de ventanas. ¡Háganos saber a qué evento asistirá para poder conectarnos con usted allí!'}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8">
            {submitStatus === 'success' ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 flex items-center justify-center bg-green-100 rounded-full mx-auto mb-4">
                  <i className="ri-checkbox-circle-fill text-green-600 text-3xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {en ? "We'll See You There!" : '¡Nos Vemos Allí!'}
                </h3>
                <p className="text-gray-500 text-sm">
                  {en
                    ? "Thanks for registering! Our team will reach out before the event to arrange a time to connect and show you our latest products."
                    : '¡Gracias por registrarse! Nuestro equipo se comunicará antes del evento para coordinar un momento de encuentro y mostrarle nuestros últimos productos.'}
                </p>
              </div>
            ) : (
              <form
                id="conference-registration-form"
                onSubmit={handleSubmit}
                data-readdy-form
                className="space-y-5"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      {en ? 'Full Name *' : 'Nombre Completo *'}
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                      placeholder={en ? 'John Smith' : 'Juan García'}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      {en ? 'Email Address *' : 'Correo Electrónico *'}
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                      placeholder="john@company.com"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      {en ? 'Phone Number' : 'Número de Teléfono'}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="(555) 000-0000"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      {en ? 'Company / Organization' : 'Empresa / Organización'}
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={(e) => setFormData((p) => ({ ...p, company: e.target.value }))}
                      placeholder={en ? 'Grand Palms Apartments' : 'Apartamentos Gran Palmas'}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    {en ? 'Select Conference *' : 'Seleccionar Conferencia *'}
                  </label>
                  <select
                    name="conference"
                    required
                    value={formData.conference}
                    onChange={(e) => setFormData((p) => ({ ...p, conference: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent cursor-pointer"
                  >
                    <option value="">{en ? 'Choose a 2026 conference...' : 'Elegir una conferencia 2026...'}</option>
                    <option value="AIM Conference 2026 — May 3-6, Huntington Beach, CA">
                      {en ? 'AIM Conference 2026 — May 3–6, Huntington Beach, CA' : 'Conferencia AIM 2026 — 3–6 May, Huntington Beach, CA'}
                    </option>
                    <option value="Apartmentalize 2026 (NAA) — Jun 17-19, New Orleans, LA">
                      {en ? 'Apartmentalize 2026 (NAA) — Jun 17–19, New Orleans, LA' : 'Apartmentalize 2026 (NAA) — 17–19 Jun, Nueva Orleans, LA'}
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    {en ? 'Message' : 'Mensaje'}{' '}
                    <span className="text-gray-400 font-normal">({formData.message.length}/500)</span>
                  </label>
                  <textarea
                    name="message"
                    rows={3}
                    maxLength={500}
                    value={formData.message}
                    onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
                    placeholder={en ? 'Any questions or special requests...' : 'Preguntas o solicitudes especiales...'}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent resize-none"
                  />
                  {formData.message.length > 500 && (
                    <p className="text-red-500 text-xs mt-1">
                      {en ? 'Message cannot exceed 500 characters.' : 'El mensaje no puede superar los 500 caracteres.'}
                    </p>
                  )}
                </div>

                {submitStatus === 'error' && (
                  <p className="text-red-500 text-sm text-center">
                    {en ? 'Something went wrong. Please try again.' : 'Algo salió mal. Por favor intente de nuevo.'}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitStatus === 'submitting' || formData.message.length > 500}
                  className="w-full py-3.5 bg-green-700 text-white font-bold rounded-lg hover:bg-green-800 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60 text-sm"
                >
                  {submitStatus === 'submitting'
                    ? (en ? 'Submitting...' : 'Enviando...')
                    : (en ? 'Submit Registration' : 'Enviar Registro')}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-14 px-4 bg-gray-900 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">
          {en ? 'Questions About Our 2026 Events?' : '¿Preguntas Sobre Nuestros Eventos 2026?'}
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          {en
            ? 'Our events team is available Mon–Fri 8am–9pm ET · Sat–Sun 9am–6pm ET'
            : 'Nuestro equipo de eventos está disponible Lun–Vie 8am–9pm ET · Sáb–Dom 9am–6pm ET'}
        </p>
        <a
          href="tel:18005051905"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-green-700 text-white font-bold rounded-md hover:bg-green-800 transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-phone-fill"></i>
          1-800-505-1905
        </a>
      </section>
    </div>
  );
}
