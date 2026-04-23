import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';
import { useLanguage } from '../../contexts/LanguageContext';

const steps = [
  {
    icon: 'ri-shopping-cart-2-line',
    titleEn: 'Place Your Order',
    titleEs: 'Realiza tu Pedido',
    descEn: 'Browse our full inventory online or call us. Select your blinds, confirm measurements, and complete checkout before the daily cutoff time.',
    descEs: 'Navega nuestro inventario en línea o llámanos. Selecciona tus persianas, confirma medidas y completa el pago antes del horario límite.',
  },
  {
    icon: 'ri-scissors-cut-line',
    titleEn: 'We Cut & Prepare',
    titleEs: 'Cortamos y Preparamos',
    descEn: 'Our Bedford, TX warehouse team immediately pulls your order from our massive in-stock inventory and custom-cuts each blind to your exact specifications.',
    descEs: 'Nuestro equipo en Bedford, TX toma tu pedido de nuestro enorme inventario y corta cada persiana a tus especificaciones exactas.',
  },
  {
    icon: 'ri-truck-line',
    titleEn: 'Same-Day Dispatch',
    titleEs: 'Envío el Mismo Día',
    descEn: 'Your order is packaged and dispatched the same day. DFW customers receive delivery or can pick up in Bedford. Outside DFW? We ship it out immediately.',
    descEs: 'Tu pedido se empaca y despacha el mismo día. Clientes del DFW reciben entrega o pueden recoger en Bedford. ¿Fuera del DFW? Lo enviamos de inmediato.',
  },
  {
    icon: 'ri-home-smile-line',
    titleEn: 'Enjoy Your Blinds',
    titleEs: 'Disfruta tus Persianas',
    descEn: 'DFW customers get their blinds the same day. Outside DFW, standard shipping applies. Every order includes our easy installation guide.',
    descEs: 'Clientes del DFW reciben sus persianas el mismo día. Fuera del DFW aplica envío estándar. Cada pedido incluye nuestra guía de instalación.',
  },
];

const coverageZones = [
  { city: 'Bedford', county: 'Tarrant County', time: 'Same Day', badge: 'bg-green-100 text-green-800', icon: 'ri-map-pin-2-fill' },
  { city: 'Fort Worth', county: 'Tarrant County', time: 'Same Day', badge: 'bg-green-100 text-green-800', icon: 'ri-map-pin-2-fill' },
  { city: 'Arlington', county: 'Tarrant County', time: 'Same Day', badge: 'bg-green-100 text-green-800', icon: 'ri-map-pin-2-fill' },
  { city: 'Dallas', county: 'Dallas County', time: 'Same Day', badge: 'bg-green-100 text-green-800', icon: 'ri-map-pin-2-fill' },
  { city: 'Irving', county: 'Dallas County', time: 'Same Day', badge: 'bg-green-100 text-green-800', icon: 'ri-map-pin-2-fill' },
  { city: 'Grapevine', county: 'Tarrant County', time: 'Same Day', badge: 'bg-green-100 text-green-800', icon: 'ri-map-pin-2-fill' },
  { city: 'Southlake', county: 'Tarrant County', time: 'Same Day', badge: 'bg-green-100 text-green-800', icon: 'ri-map-pin-2-fill' },
  { city: 'Colleyville', county: 'Tarrant County', time: 'Same Day', badge: 'bg-green-100 text-green-800', icon: 'ri-map-pin-2-fill' },
  { city: 'Hurst', county: 'Tarrant County', time: 'Same Day', badge: 'bg-green-100 text-green-800', icon: 'ri-map-pin-2-fill' },
  { city: 'Euless', county: 'Tarrant County', time: 'Same Day', badge: 'bg-green-100 text-green-800', icon: 'ri-map-pin-2-fill' },
  { city: 'North Richland Hills', county: 'Tarrant County', time: 'Same Day', badge: 'bg-green-100 text-green-800', icon: 'ri-map-pin-2-fill' },
  { city: 'Keller', county: 'Tarrant County', time: 'Same Day', badge: 'bg-green-100 text-green-800', icon: 'ri-map-pin-2-fill' },
  { city: 'Plano', county: 'Collin County', time: 'Same Day', badge: 'bg-green-100 text-green-800', icon: 'ri-map-pin-2-fill' },
  { city: 'Frisco', county: 'Collin County', time: 'Same Day', badge: 'bg-green-100 text-green-800', icon: 'ri-map-pin-2-fill' },
  { city: 'McKinney', county: 'Collin County', time: 'Same Day', badge: 'bg-green-100 text-green-800', icon: 'ri-map-pin-2-fill' },
  { city: 'Garland', county: 'Dallas County', time: 'Same Day', badge: 'bg-green-100 text-green-800', icon: 'ri-map-pin-2-fill' },
  { city: 'Mesquite', county: 'Dallas County', time: 'Same Day', badge: 'bg-green-100 text-green-800', icon: 'ri-map-pin-2-fill' },
  { city: 'Denton', county: 'Denton County', time: 'Same Day', badge: 'bg-green-100 text-green-800', icon: 'ri-map-pin-2-fill' },
  { city: 'Lewisville', county: 'Denton County', time: 'Same Day', badge: 'bg-green-100 text-green-800', icon: 'ri-map-pin-2-fill' },
  { city: 'Flower Mound', county: 'Denton County', time: 'Same Day', badge: 'bg-green-100 text-green-800', icon: 'ri-map-pin-2-fill' },
  { city: 'Carrollton', county: 'Dallas County', time: 'Same Day', badge: 'bg-green-100 text-green-800', icon: 'ri-map-pin-2-fill' },
  { city: 'Richardson', county: 'Dallas County', time: 'Same Day', badge: 'bg-green-100 text-green-800', icon: 'ri-map-pin-2-fill' },
  { city: 'Outside DFW', county: 'All other areas', time: 'Standard Shipping', badge: 'bg-amber-100 text-amber-800', icon: 'ri-map-pin-line' },
];

const faqs = [
  {
    q: 'What is the cutoff time for same-day delivery?',
    a: 'Orders placed before 10:00 AM CST Monday–Friday qualify for same-day delivery or pick-up within the DFW area. Orders placed after 10:00 AM will be processed and dispatched the following business day.',
  },
  {
    q: 'Can I pick up my order instead of having it delivered?',
    a: 'Absolutely! Our Bedford, TX location at 2801 Brasher Ln is open Monday–Friday 8:00 AM–5:00 PM. Place your order before 10:00 AM and your blinds will be ready for pick-up the same afternoon.',
  },
  {
    q: 'What if my blinds are not in stock?',
    a: 'Our Bedford warehouse carries one of the largest blind inventories in the DFW area. If your specific selection is not immediately available, we will order it right away and notify you with an updated delivery estimate.',
  },
  {
    q: 'Do you deliver on weekends?',
    a: 'Saturday orders are online only — your blinds will be delivered or shipped on Monday. Sunday orders are online only — delivery or shipping goes out Monday or Tuesday. You can still place orders online 7 days a week.',
  },
  {
    q: 'Is there an extra charge for same-day delivery?',
    a: 'Same-day delivery within the DFW area is included at no extra cost on qualifying orders. All orders also enjoy free standard shipping with no minimum order requirement.',
  },
  {
    q: 'What areas outside DFW do you ship to?',
    a: 'We ship nationwide! If you are outside the DFW metro area, your order will be shipped via standard carrier. Most orders arrive within 3–5 business days depending on your location.',
  },
  {
    q: 'Can I track my same-day delivery?',
    a: 'Yes. Once your order is dispatched you will receive a confirmation with tracking details. For same-day DFW deliveries, our team will also call or text you with an estimated arrival window.',
  },
  {
    q: 'What if I need blinds for multiple rooms?',
    a: 'No problem! We handle bulk and multi-room orders regularly. As long as all items are in stock and the order is placed before the cutoff, everything ships together the same day.',
  },
];

const sameDayTestimonials = [
  {
    name: 'Karen Holloway',
    location: 'Fort Worth, TX',
    rating: 5,
    date: 'March 2024',
    avatar: 'KH',
    color: 'bg-green-700',
    text: 'I ordered at 8:30 AM and had my blinds installed by 3:00 PM the same day. I was honestly shocked — I\'ve never experienced service like this. The blinds look amazing in my living room!',
    highlight: 'Ordered 8:30 AM · Delivered same afternoon',
  },
  {
    name: 'Marcus Webb',
    location: 'Southlake, TX',
    rating: 5,
    date: 'February 2024',
    avatar: 'MW',
    color: 'bg-stone-700',
    text: 'We had guests coming over and desperately needed blinds for our new home. Placed the order Monday morning and everything was ready for pick-up in Bedford by noon. Lifesavers!',
    highlight: 'Ready for pick-up by noon',
  },
  {
    name: 'Diane Castillo',
    location: 'Irving, TX',
    rating: 5,
    date: 'March 2024',
    avatar: 'DC',
    color: 'bg-green-800',
    text: 'The team called me with an ETA window and showed up right on time. Custom-cut blinds, same day, no hassle. I\'ve already recommended Classic Same Day Blinds to three of my neighbors.',
    highlight: 'Called with ETA · Arrived on time',
  },
  {
    name: 'Tyler Nguyen',
    location: 'Plano, TX',
    rating: 5,
    date: 'January 2024',
    avatar: 'TN',
    color: 'bg-teal-700',
    text: 'Ordered online before 10 AM, got a confirmation within minutes, and my blinds were at my door before dinner. The quality is top-notch and the price was very fair. Will definitely order again.',
    highlight: 'Confirmation in minutes · Delivered before dinner',
  },
  {
    name: 'Sandra Okafor',
    location: 'Arlington, TX',
    rating: 5,
    date: 'February 2024',
    avatar: 'SO',
    color: 'bg-green-700',
    text: 'I was skeptical about same-day delivery for custom blinds — but they delivered exactly as promised. Perfect fit, beautiful finish, and the driver was super professional.',
    highlight: 'Custom fit · Delivered as promised',
  },
  {
    name: 'Greg Patterson',
    location: 'Grapevine, TX',
    rating: 5,
    date: 'March 2024',
    avatar: 'GP',
    color: 'bg-stone-600',
    text: 'Picked up from the Bedford warehouse and the staff was incredibly helpful. They even helped me load everything into my truck. Fast, friendly, and the blinds are perfect.',
    highlight: 'Pick-up at Bedford warehouse',
  },
];

export default function SameDayDeliveryPage() {
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [contactOpen, setContactOpen] = useState(false);
  const { language } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar scrolled={scrolled} />

      {/* Page offset for fixed navbar */}
      <div className="h-[calc(2.75rem+1.75rem+3.5rem+2.75rem)]" />

      {/* ── Back Button Bar ── */}
      <div className="bg-stone-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-800 transition-colors cursor-pointer group"
          >
            <div className="w-6 h-6 flex items-center justify-center bg-green-100 group-hover:bg-green-200 rounded-full transition-colors">
              <i className="ri-arrow-left-s-line text-base"></i>
            </div>
            <span>{language === 'en' ? 'Go Back' : 'Volver'}</span>
          </button>
        </div>
      </div>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gray-900 text-white">
        <img
          src="https://readdy.ai/api/search-image?query=modern%20delivery%20truck%20driving%20through%20Dallas%20Fort%20Worth%20Texas%20suburban%20neighborhood%20at%20golden%20hour%2C%20warm%20sunlight%2C%20clean%20streets%2C%20residential%20homes%2C%20cinematic%20wide%20angle%2C%20professional%20photography%2C%20vibrant%20colors%2C%20clear%20sky&width=1440&height=560&seq=sdd-hero-01&orientation=landscape"
          alt="Same Day Delivery DFW"
          className="absolute inset-0 w-full h-full object-cover object-top opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-900/50 to-gray-900/30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex flex-col items-start gap-6">
          <div className="inline-flex items-center gap-2 bg-green-700/90 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
            <i className="ri-flashlight-line"></i>
            {language === 'en' ? 'DFW Same Day Service' : 'Servicio Mismo Día DFW'}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight max-w-2xl">
            {language === 'en'
              ? <>Same Day Delivery &amp; Pick-Up <span className="text-green-400">in the DFW Area</span></>
              : <>Entrega y Recogida el Mismo Día <span className="text-green-400">en el Área DFW</span></>}
          </h1>
          <p className="text-lg text-gray-300 max-w-xl leading-relaxed">
            {language === 'en'
              ? 'Order before 10:00 AM and get your custom blinds delivered or ready for pick-up the same day — with certain orders — straight from our Bedford, TX warehouse.'
              : 'Ordena antes de las 10:00 AM y recibe tus persianas personalizadas entregadas o listas para recoger el mismo día — con ciertos pedidos — directo desde nuestro almacén en Bedford, TX.'}
          </p>
          <div className="flex flex-wrap gap-3 mt-2">
            <Link
              to="/products"
              className="px-6 py-3 bg-green-700 hover:bg-green-600 text-white font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap text-sm"
            >
              {language === 'en' ? 'Shop Now' : 'Comprar Ahora'}
            </Link>
            <a
              href="tel:8175409300"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap text-sm"
            >
              <i className="ri-phone-line mr-2"></i>
              {language === 'en' ? 'Call (817) 540-9300' : 'Llamar (817) 540-9300'}
            </a>
          </div>
        </div>
      </section>

      {/* ── Cutoff Time Banner ── */}
      <section className="bg-green-700 text-white py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-center gap-8 text-center">
          {[
            { icon: 'ri-time-line', label: language === 'en' ? 'Order Cutoff' : 'Hora Límite', value: '10:00 AM CST' },
            { icon: 'ri-calendar-line', label: language === 'en' ? 'Available' : 'Disponible', value: language === 'en' ? 'Mon – Fri' : 'Lun – Vie' },
            { icon: 'ri-map-pin-2-line', label: language === 'en' ? 'Coverage' : 'Cobertura', value: language === 'en' ? 'DFW Metro Area' : 'Área Metro DFW' },
            { icon: 'ri-store-2-line', label: language === 'en' ? 'Pick-Up Location' : 'Punto de Recogida', value: 'Bedford, TX' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div className="w-9 h-9 flex items-center justify-center bg-white/20 rounded-full">
                <i className={`${item.icon} text-lg`}></i>
              </div>
              <div className="text-left">
                <p className="text-xs text-green-200 font-medium uppercase tracking-wide">{item.label}</p>
                <p className="text-base font-extrabold">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-bold text-green-700 uppercase tracking-widest">
              {language === 'en' ? 'Simple Process' : 'Proceso Simple'}
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900 mt-2">
              {language === 'en' ? 'How Same-Day Delivery Works' : 'Cómo Funciona la Entrega el Mismo Día'}
            </h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto text-sm leading-relaxed">
              {language === 'en'
                ? 'From order to doorstep in hours — here\'s exactly what happens after you place your order.'
                : 'Del pedido a tu puerta en horas — esto es exactamente lo que sucede después de que realizas tu pedido.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-0.5 bg-green-100 z-0" />
            {steps.map((step, i) => (
              <div key={i} className="relative flex flex-col items-center text-center z-10">
                <div className="w-20 h-20 flex items-center justify-center bg-green-700 text-white rounded-2xl shadow-lg mb-5 text-3xl">
                  <i className={step.icon}></i>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center bg-gray-900 text-white text-xs font-bold rounded-full">
                  {i + 1}
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">
                  {language === 'en' ? step.titleEn : step.titleEs}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {language === 'en' ? step.descEn : step.descEs}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cutoff Times Detail ── */}
      <section className="py-20 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
            {/* Left: schedule table */}
            <div>
              <span className="text-xs font-bold text-green-700 uppercase tracking-widest">
                {language === 'en' ? 'Order Cutoff Times' : 'Horarios Límite de Pedido'}
              </span>
              <h2 className="text-3xl font-extrabold text-gray-900 mt-2 mb-6">
                {language === 'en' ? 'When to Order for Same-Day' : 'Cuándo Ordenar para el Mismo Día'}
              </h2>
              <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-900 text-white">
                      <th className="text-left px-5 py-3 font-semibold">
                        {language === 'en' ? 'Day' : 'Día'}
                      </th>
                      <th className="text-left px-5 py-3 font-semibold">
                        {language === 'en' ? 'Order By' : 'Ordenar Antes de'}
                      </th>
                      <th className="text-left px-5 py-3 font-semibold">
                        {language === 'en' ? 'Delivery / Pick-Up' : 'Entrega / Recogida'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { day: language === 'en' ? 'Monday' : 'Lunes', cutoff: '10:00 AM CST', delivery: language === 'en' ? 'Same Day (Mon)' : 'Mismo Día (Lun)', highlight: false },
                      { day: language === 'en' ? 'Tuesday' : 'Martes', cutoff: '10:00 AM CST', delivery: language === 'en' ? 'Same Day (Tue)' : 'Mismo Día (Mar)', highlight: false },
                      { day: language === 'en' ? 'Wednesday' : 'Miércoles', cutoff: '10:00 AM CST', delivery: language === 'en' ? 'Same Day (Wed)' : 'Mismo Día (Mié)', highlight: false },
                      { day: language === 'en' ? 'Thursday' : 'Jueves', cutoff: '10:00 AM CST', delivery: language === 'en' ? 'Same Day (Thu)' : 'Mismo Día (Jue)', highlight: false },
                      { day: language === 'en' ? 'Friday' : 'Viernes', cutoff: '10:00 AM CST', delivery: language === 'en' ? 'Same Day (Fri)' : 'Mismo Día (Vie)', highlight: false },
                      { day: language === 'en' ? 'Saturday' : 'Sábado', cutoff: language === 'en' ? 'Online orders only' : 'Solo pedidos en línea', delivery: language === 'en' ? 'Delivered or shipped Mon' : 'Entrega o envío Lun', highlight: true },
                      { day: language === 'en' ? 'Sunday' : 'Domingo', cutoff: language === 'en' ? 'Online orders only' : 'Solo pedidos en línea', delivery: language === 'en' ? 'Delivered or shipped Mon or Tue' : 'Entrega o envío Lun o Mar', highlight: true },
                    ].map((row, i) => (
                      <tr key={i} className={`border-t border-gray-100 ${row.highlight ? 'bg-amber-50' : i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                        <td className="px-5 py-3 font-semibold text-gray-800">{row.day}</td>
                        <td className="px-5 py-3 text-gray-600">{row.cutoff}</td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${row.highlight ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                            <i className={row.highlight ? 'ri-time-line' : 'ri-flashlight-line'}></i>
                            {row.delivery}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-400 mt-3 leading-relaxed">
                {language === 'en'
                  ? '* Cutoff times apply to DFW same-day delivery and pick-up only. Orders placed after cutoff are dispatched the next business day.'
                  : '* Los horarios límite aplican solo para entrega y recogida el mismo día en DFW. Los pedidos después del límite se despachan el siguiente día hábil.'}
              </p>
            </div>

            {/* Right: pick-up info + image */}
            <div className="flex flex-col gap-6">
              <div className="w-full h-56 rounded-xl overflow-hidden">
                <img
                  src="https://readdy.ai/api/search-image?query=large%20modern%20warehouse%20interior%20with%20rows%20of%20window%20blinds%20and%20shades%20neatly%20organized%20on%20shelves%2C%20bright%20lighting%2C%20clean%20industrial%20space%2C%20professional%20inventory%20storage%2C%20wide%20angle%20shot%2C%20neutral%20tones%2C%20high%20resolution&width=700&height=400&seq=sdd-warehouse-01&orientation=landscape"
                  alt="Bedford TX Warehouse"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 flex items-center justify-center bg-green-100 rounded-lg">
                    <i className="ri-store-2-line text-green-700 text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">
                      {language === 'en' ? 'Pick-Up Location' : 'Punto de Recogida'}
                    </h3>
                    <p className="text-xs text-gray-500">Bedford, TX Warehouse</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <i className="ri-map-pin-2-line text-green-700 mt-0.5"></i>
                    <span>2801 Brasher Ln, Bedford, TX 76021</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <i className="ri-time-line text-green-700 mt-0.5"></i>
                    <span>
                      {language === 'en' ? 'Mon–Fri: 8:00 AM – 5:00 PM' : 'Lun–Vie: 8:00 AM – 5:00 PM'}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <i className="ri-phone-line text-green-700 mt-0.5"></i>
                    <a href="tel:8175409300" className="hover:text-green-700 cursor-pointer">(817) 540-9300</a>
                  </div>
                </div>
                <a
                  href="https://maps.google.com/?q=2801+Brasher+Ln,+Bedford,+TX+76021"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-green-700 hover:underline cursor-pointer"
                >
                  <i className="ri-navigation-line"></i>
                  {language === 'en' ? 'Get Directions' : 'Cómo Llegar'}
                </a>
              </div>

              {/* Delivery vs Pick-up comparison */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    icon: 'ri-truck-line',
                    titleEn: 'Home Delivery',
                    titleEs: 'Entrega a Domicilio',
                    pointsEn: ['DFW area only', 'Same-day dispatch', 'Call for ETA window', 'No extra charge'],
                    pointsEs: ['Solo área DFW', 'Despacho mismo día', 'Llama para ventana ETA', 'Sin cargo extra'],
                  },
                  {
                    icon: 'ri-store-2-line',
                    titleEn: 'Pick-Up In Store',
                    titleEs: 'Recogida en Tienda',
                    pointsEn: ['Bedford, TX location', 'Ready same afternoon', 'Mon–Fri 8 AM–5 PM', 'No extra charge'],
                    pointsEs: ['Ubicación Bedford, TX', 'Listo misma tarde', 'Lun–Vie 8 AM–5 PM', 'Sin cargo extra'],
                  },
                ].map((opt) => (
                  <div key={opt.titleEn} className="bg-green-50 border border-green-100 rounded-xl p-4">
                    <div className="w-8 h-8 flex items-center justify-center bg-green-700 text-white rounded-lg mb-3">
                      <i className={`${opt.icon} text-base`}></i>
                    </div>
                    <h4 className="font-bold text-gray-900 text-sm mb-2">
                      {language === 'en' ? opt.titleEn : opt.titleEs}
                    </h4>
                    <ul className="space-y-1">
                      {(language === 'en' ? opt.pointsEn : opt.pointsEs).map((p) => (
                        <li key={p} className="flex items-center gap-1.5 text-xs text-gray-600">
                          <i className="ri-check-line text-green-600"></i>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Coverage Zones ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-green-700 uppercase tracking-widest">
              {language === 'en' ? 'Service Area' : 'Área de Servicio'}
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900 mt-2">
              {language === 'en' ? 'Same-Day Coverage Zones' : 'Zonas de Cobertura Mismo Día'}
            </h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto text-sm">
              {language === 'en'
                ? 'We cover the entire DFW metroplex. Don\'t see your city? Call us — we likely deliver there too.'
                : 'Cubrimos toda la metrópolis DFW. ¿No ves tu ciudad? Llámanos — probablemente también entregamos allí.'}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-10">
            {coverageZones.map((zone) => (
              <div
                key={zone.city}
                className="flex flex-col items-center text-center bg-white border border-gray-100 rounded-xl p-3 shadow-sm hover:shadow-md hover:border-green-200 transition-all"
              >
                <div className="w-7 h-7 flex items-center justify-center text-green-700 mb-1.5">
                  <i className={`${zone.icon} text-lg`}></i>
                </div>
                <p className="text-sm font-bold text-gray-900 leading-tight">{zone.city}</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-tight">{zone.county}</p>
                <span className={`mt-2 text-xs font-bold px-2 py-0.5 rounded-full ${zone.badge}`}>
                  {zone.time}
                </span>
              </div>
            ))}
          </div>

          {/* Map embed */}
          <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm h-80">
            <iframe
              title="Classic Same Day Blinds - Bedford TX"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d214.0!2d-97.1431!3d32.8440!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x864e7d0e0e0e0e0f%3A0x0!2s2801+Brasher+Ln%2C+Bedford%2C+TX+76021!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-bold text-green-700 uppercase tracking-widest">
              {language === 'en' ? 'Real DFW Customers' : 'Clientes Reales del DFW'}
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900 mt-2">
              {language === 'en' ? 'What Our Same-Day Customers Say' : 'Lo Que Dicen Nuestros Clientes del Mismo Día'}
            </h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto text-sm leading-relaxed">
              {language === 'en'
                ? 'Don\'t just take our word for it — here\'s what DFW homeowners experienced with our same-day service.'
                : 'No solo lo decimos nosotros — esto es lo que experimentaron los propietarios del DFW con nuestro servicio del mismo día.'}
            </p>
            {/* Star rating summary */}
            <div className="inline-flex items-center gap-3 mt-5 bg-white border border-gray-200 rounded-full px-5 py-2.5 shadow-sm">
              <div className="flex items-center gap-0.5">
                {[1,2,3,4,5].map(s => (
                  <div key={s} className="w-4 h-4 flex items-center justify-center text-amber-400">
                    <i className="ri-star-fill text-sm"></i>
                  </div>
                ))}
              </div>
              <span className="text-sm font-extrabold text-gray-900">5.0</span>
              <span className="text-sm text-gray-500">{language === 'en' ? 'Average from 200+ DFW reviews' : 'Promedio de 200+ reseñas DFW'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sameDayTestimonials.map((t, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col gap-4"
              >
                {/* Stars */}
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <div key={s} className="w-4 h-4 flex items-center justify-center text-amber-400">
                      <i className="ri-star-fill text-sm"></i>
                    </div>
                  ))}
                </div>

                {/* Quote */}
                <p className="text-sm text-gray-700 leading-relaxed flex-1">
                  &ldquo;{t.text}&rdquo;
                </p>

                {/* Highlight badge */}
                <div className="inline-flex items-center gap-1.5 bg-green-50 border border-green-100 text-green-800 text-xs font-semibold px-3 py-1.5 rounded-full w-fit">
                  <i className="ri-flashlight-line text-green-600"></i>
                  {t.highlight}
                </div>

                {/* Reviewer */}
                <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                  <div className={`w-10 h-10 flex items-center justify-center ${t.color} text-white text-sm font-bold rounded-full shrink-0`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{t.name}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <i className="ri-map-pin-2-line text-green-600"></i>
                      <span>{t.location}</span>
                      <span className="mx-1">·</span>
                      <span>{t.date}</span>
                    </div>
                  </div>
                  <div className="ml-auto w-6 h-6 flex items-center justify-center text-green-600">
                    <i className="ri-verified-badge-fill text-lg"></i>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom trust bar */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: 'ri-star-fill', value: '5.0 / 5.0', label: language === 'en' ? 'Average Rating' : 'Calificación Promedio', color: 'text-amber-500' },
              { icon: 'ri-user-smile-line', value: '200+', label: language === 'en' ? 'Happy DFW Customers' : 'Clientes DFW Felices', color: 'text-green-700' },
              { icon: 'ri-flashlight-line', value: '98%', label: language === 'en' ? 'On-Time Same-Day Rate' : 'Tasa Mismo Día a Tiempo', color: 'text-green-700' },
              { icon: 'ri-thumb-up-line', value: '100%', label: language === 'en' ? 'Would Recommend Us' : 'Nos Recomendarían', color: 'text-green-700' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white border border-gray-100 rounded-xl p-4 text-center shadow-sm">
                <div className={`w-8 h-8 flex items-center justify-center mx-auto mb-2 ${stat.color}`}>
                  <i className={`${stat.icon} text-xl`}></i>
                </div>
                <p className="text-xl font-extrabold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Outside DFW ── */}
      <section className="py-16 bg-amber-50 border-y border-amber-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="w-full md:w-1/2 h-64 rounded-xl overflow-hidden shrink-0">
              <img
                src="https://readdy.ai/api/search-image?query=UPS%20FedEx%20delivery%20boxes%20packages%20on%20doorstep%20of%20suburban%20American%20home%2C%20warm%20afternoon%20light%2C%20clean%20neighborhood%2C%20professional%20photo%2C%20inviting%20atmosphere%2C%20neutral%20tones%2C%20wide%20angle&width=700&height=450&seq=sdd-shipping-01&orientation=landscape"
                alt="Nationwide Shipping"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">
                {language === 'en' ? 'Outside DFW?' : '¿Fuera del DFW?'}
              </span>
              <h2 className="text-2xl font-extrabold text-gray-900 mt-2 mb-4">
                {language === 'en' ? "We Still Ship Nationwide — Don't Worry!" : '¡Enviamos a Todo el País — No te Preocupes!'}
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-5">
                {language === 'en'
                  ? "If you're located outside the Dallas Fort Worth area, we'd still love to help! Simply place your order online and we'll ship your custom blinds directly to your door. Our Bedford, TX warehouse has a massive inventory — if your selection is in stock, it ships the same day you order."
                  : 'Si estás fuera del área de Dallas Fort Worth, ¡aún nos encantaría ayudarte! Simplemente realiza tu pedido en línea y enviaremos tus persianas personalizadas directamente a tu puerta. Nuestro almacén en Bedford, TX tiene un enorme inventario — si tu selección está en stock, se envía el mismo día que ordenas.'}
              </p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { icon: 'ri-truck-line', textEn: 'Free shipping on every order', textEs: 'Envío gratis en cada pedido' },
                  { icon: 'ri-time-line', textEn: '2-4 business day delivery', textEs: 'Entrega en 2-4 días hábiles' },
                  { icon: 'ri-package-line', textEn: 'Carefully packaged blinds', textEs: 'Persianas cuidadosamente empacadas' },
                  { icon: 'ri-map-pin-line', textEn: 'Ships to all 50 states', textEs: 'Envíos a los 50 estados' },
                ].map((item) => (
                  <div key={item.textEn} className="flex items-center gap-2 text-sm text-gray-700">
                    <div className="w-6 h-6 flex items-center justify-center text-amber-600">
                      <i className={`${item.icon} text-base`}></i>
                    </div>
                    {language === 'en' ? item.textEn : item.textEs}
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/products"
                  className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-lg text-sm transition-colors cursor-pointer whitespace-nowrap"
                >
                  {language === 'en' ? 'Shop All Blinds' : 'Ver Todas las Persianas'}
                </Link>
                <a
                  href="tel:18009619867"
                  className="px-5 py-2.5 border border-gray-300 hover:border-gray-400 text-gray-700 font-bold rounded-lg text-sm transition-colors cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-phone-line mr-1.5"></i>
                  {language === 'en' ? 'Call Toll Free' : 'Llamada Gratuita'}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-green-700 uppercase tracking-widest">FAQ</span>
            <h2 className="text-3xl font-extrabold text-gray-900 mt-2">
              {language === 'en' ? 'Delivery Questions Answered' : 'Preguntas de Entrega Respondidas'}
            </h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <span className="text-sm font-semibold text-gray-900 pr-4">{faq.q}</span>
                  <div className="w-5 h-5 flex items-center justify-center shrink-0 text-green-700">
                    <i className={`${openFaq === i ? 'ri-subtract-line' : 'ri-add-line'} text-lg`}></i>
                  </div>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 bg-gray-50 border-t border-gray-100">
                    <p className="text-sm text-gray-600 leading-relaxed pt-3">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 bg-green-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <i className="ri-flashlight-line text-4xl text-green-300 mb-4 block"></i>
          <h2 className="text-3xl font-extrabold mb-3">
            {language === 'en' ? 'Ready for Same-Day Blinds?' : '¿Listo para Persianas el Mismo Día?'}
          </h2>
          <p className="text-green-100 text-base mb-8 max-w-xl mx-auto">
            {language === 'en'
              ? 'Order before 10:00 AM Monday–Friday and your custom blinds will be delivered or ready for pick-up the same day, with certain orders.'
              : 'Ordena antes de las 10:00 AM de lunes a viernes y tus persianas personalizadas serán entregadas o estarán listas para recoger el mismo día, con ciertos pedidos.'}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/products"
              className="px-8 py-3 bg-white text-green-800 font-extrabold rounded-lg hover:bg-green-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              {language === 'en' ? 'Shop Now' : 'Comprar Ahora'}
            </Link>
            <a
              href="tel:8175409300"
              className="px-8 py-3 bg-green-800 hover:bg-green-900 text-white font-extrabold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-phone-line mr-2"></i>
              (817) 540-9300
            </a>
          </div>
        </div>
      </section>

      <Footer />
      {/* ── Fixed Floating Contact Button ── */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-2">
        {/* Expanded options */}
        {contactOpen && (
          <div className="flex flex-col gap-2 mb-1 animate-fade-in">
            {/* Live Chat button */}
            <button
              onClick={() => {
                setContactOpen(false);
                const chatBtn = document.querySelector('#vapi-widget-floating-button') as HTMLElement;
                if (chatBtn) chatBtn.click();
              }}
              className="flex items-center gap-3 bg-white border border-gray-200 shadow-lg rounded-full pl-3 pr-5 py-2.5 text-sm font-bold text-gray-800 hover:bg-green-50 hover:border-green-300 transition-all cursor-pointer whitespace-nowrap group"
            >
              <div className="w-8 h-8 flex items-center justify-center bg-green-700 group-hover:bg-green-600 text-white rounded-full transition-colors shrink-0">
                <i className="ri-chat-3-fill text-sm"></i>
              </div>
              <span>{language === 'en' ? 'Live Chat' : 'Chat en Vivo'}</span>
            </button>
          </div>
        )}

        {/* Main toggle button */}
        <button
          onClick={() => setContactOpen(!contactOpen)}
          className={`flex items-center gap-2.5 shadow-xl rounded-full px-5 py-3 font-bold text-sm transition-all cursor-pointer whitespace-nowrap ${
            contactOpen
              ? 'bg-gray-800 text-white hover:bg-gray-700'
              : 'bg-green-700 text-white hover:bg-green-600'
          }`}
          aria-label="Contact us"
        >
          <div className="w-5 h-5 flex items-center justify-center">
            <i className={`${contactOpen ? 'ri-close-line' : 'ri-customer-service-2-line'} text-base`}></i>
          </div>
          <span>{contactOpen ? (language === 'en' ? 'Close' : 'Cerrar') : (language === 'en' ? 'Contact Us' : 'Contáctanos')}</span>
        </button>
      </div>
    </div>
  );
}
