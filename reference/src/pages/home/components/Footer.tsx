import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const { language } = useLanguage();
  const navigate = useNavigate();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('submitting');
    try {
      const formBody = new URLSearchParams();
      formBody.append('email', email);
      const response = await fetch('https://readdy.ai/api/form/d6ousn75ne2i7jjrvta0', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formBody.toString(),
      });
      if (response.ok) {
        setSubmitStatus('success');
        setEmail('');
        setTimeout(() => setSubmitStatus('idle'), 4000);
      } else {
        setSubmitStatus('error');
        setTimeout(() => setSubmitStatus('idle'), 4000);
      }
    } catch {
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 4000);
    }
  };

  const footerColumns = language === 'en'
    ? [
        {
          heading: 'Shop',
          items: [
            { label: 'Wood Blinds', id: 'products' }, { label: 'Faux Wood Blinds', id: 'products' },
            { label: 'Roller Shades', id: 'products' }, { label: 'Cellular Shades', id: 'products' },
            { label: 'Roman Shades', id: 'products' }, { label: 'Solar Shades', id: 'products' },
            { label: 'Plantation Shutters', id: 'products' }, { label: 'Vertical Blinds', id: 'products' },
            { label: 'Motorized Blinds', id: 'features' }, { label: 'Outdoor Shades', id: 'products' },
            { label: 'Drapes & Curtains', id: 'products' }, { label: 'Woven Wood Shades', id: 'products' },
          ],
        },
        {
          heading: 'Company',
          items: [
            { label: 'About Us', id: 'about' }, { label: 'Design Blog', id: 'about' },
            { label: 'Careers', id: 'contact' }, { label: 'Press & Media', id: 'contact' },
            { label: 'Affiliates', id: 'contact' }, { label: 'Trade Program', id: 'contact' },
            { label: 'Commercial Sales', id: 'about' }, { label: 'Sitemap', id: 'about' },
          ],
        },
        {
          heading: 'Help',
          items: [
            { label: 'How to Measure', id: 'faq' }, { label: 'Installation Guides', id: 'faq' },
            { label: 'Free Samples', id: 'products' }, { label: 'FAQ', id: 'faq' },
            { label: 'Contact Us', id: 'contact' }, { label: 'Track My Order', id: 'contact' },
            { label: 'Return Policy', id: 'faq' }, { label: 'Warranty Info', id: 'faq' },
            { label: 'Child Safety', id: 'faq' }, { label: 'Accessibility', id: 'contact' },
          ],
        },
        {
          heading: 'Services',
          items: [
            { label: 'Design Consultation', id: 'contact' }, { label: 'Measurement Service', id: 'contact' },
            { label: 'Professional Installation', id: 'contact' }, { label: 'Bulk & Commercial Orders', id: 'about' },
            { label: 'Property Managers', id: 'about' }, { label: 'Hospitality & Hotels', id: 'about' },
            { label: 'Healthcare Facilities', id: 'about' }, { label: 'Smart Home Integration', id: 'features' },
          ],
        },
      ]
    : [
        {
          heading: 'Tienda',
          items: [
            { label: 'Persianas de Madera', id: 'products' }, { label: 'Persianas Faux Wood', id: 'products' },
            { label: 'Cortinas Enrollables', id: 'products' }, { label: 'Cortinas Celulares', id: 'products' },
            { label: 'Cortinas Romanas', id: 'products' }, { label: 'Cortinas Solares', id: 'products' },
            { label: 'Postigos de Plantación', id: 'products' }, { label: 'Persianas Verticales', id: 'products' },
            { label: 'Persianas Motorizadas', id: 'features' }, { label: 'Cortinas Exteriores', id: 'products' },
            { label: 'Visillos y Cortinas', id: 'products' }, { label: 'Cortinas de Madera Tejida', id: 'products' },
          ],
        },
        {
          heading: 'Empresa',
          items: [
            { label: 'Nosotros', id: 'about' }, { label: 'Blog de Diseño', id: 'about' },
            { label: 'Empleos', id: 'contact' }, { label: 'Prensa y Medios', id: 'contact' },
            { label: 'Afiliados', id: 'contact' }, { label: 'Programa Comercial', id: 'contact' },
            { label: 'Ventas Comerciales', id: 'about' }, { label: 'Mapa del Sitio', id: 'about' },
          ],
        },
        {
          heading: 'Ayuda',
          items: [
            { label: 'Cómo Medir', id: 'faq' }, { label: 'Guías de Instalación', id: 'faq' },
            { label: 'Muestras Gratis', id: 'products' }, { label: 'Preguntas Frecuentes', id: 'faq' },
            { label: 'Contáctanos', id: 'contact' }, { label: 'Rastrear mi Pedido', id: 'contact' },
            { label: 'Política de Devoluciones', id: 'faq' }, { label: 'Información de Garantía', id: 'faq' },
            { label: 'Seguridad Infantil', id: 'faq' }, { label: 'Accesibilidad', id: 'contact' },
          ],
        },
        {
          heading: 'Servicios',
          items: [
            { label: 'Consulta de Diseño', id: 'contact' }, { label: 'Servicio de Medición', id: 'contact' },
            { label: 'Instalación Profesional', id: 'contact' }, { label: 'Pedidos Masivos y Comerciales', id: 'about' },
            { label: 'Administradores de Propiedades', id: 'about' }, { label: 'Hospitalidad y Hoteles', id: 'about' },
            { label: 'Instalaciones de Salud', id: 'about' }, { label: 'Integración Hogar Inteligente', id: 'features' },
          ],
        },
      ];

  const trustBadges = language === 'en'
    ? [
        { icon: 'ri-shield-check-line', text: '3-Year Warranty' },
        { icon: 'ri-truck-line', text: 'Free Shipping $99+' },
        { icon: 'ri-scissors-cut-line', text: 'Custom Made to Order' },
        { icon: 'ri-gift-line', text: 'Free Samples' },
        { icon: 'ri-lock-line', text: 'Secure Checkout' },
        { icon: 'ri-star-line', text: '30+ Years Experience' },
        { icon: 'ri-customer-service-2-line', text: 'Expert Help 7 Days' },
      ]
    : [
        { icon: 'ri-shield-check-line', text: 'Garantía de 3 Años' },
        { icon: 'ri-truck-line', text: 'Envío Gratis $99+' },
        { icon: 'ri-scissors-cut-line', text: 'Hecho a Medida' },
        { icon: 'ri-gift-line', text: 'Muestras Gratis' },
        { icon: 'ri-lock-line', text: 'Pago Seguro' },
        { icon: 'ri-star-line', text: '30+ Años de Experiencia' },
        { icon: 'ri-customer-service-2-line', text: 'Expertos 7 Días' },
      ];

  const legalLinks = language === 'en'
    ? [
        { label: 'Privacy Policy', path: '/privacy-policy' },
        { label: 'Terms of Service', path: null },
        { label: 'Accessibility', path: null },
        { label: 'Do Not Sell My Info', path: null },
        { label: 'Sitemap', path: null },
      ]
    : [
        { label: 'Política de Privacidad', path: '/privacy-policy' },
        { label: 'Términos de Servicio', path: null },
        { label: 'Accesibilidad', path: null },
        { label: 'No Vender Mi Info', path: null },
        { label: 'Mapa del Sitio', path: null },
      ];

  return (
    <footer className="bg-stone-800 text-stone-300">
      {/* Newsletter bar */}
      <div className="bg-green-700 py-7">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-white font-bold text-lg">
              {language === 'en' ? 'Sign Up & Save an Extra 10%' : 'Regístrate y Ahorra un 10% Extra'}
            </h3>
            <p className="text-white/80 text-sm mt-1">
              {language === 'en'
                ? 'Get exclusive deals, design tips, and new arrivals straight to your inbox.'
                : 'Recibe ofertas exclusivas, consejos de diseño y novedades directo a tu correo.'}
            </p>
          </div>
          <form id="newsletter-form" onSubmit={handleNewsletterSubmit} className="flex gap-2 w-full md:w-auto" data-readdy-form>
            <input
              type="email" name="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder={language === 'en' ? 'Enter your email' : 'Ingresa tu correo'}
              className="flex-1 md:w-64 px-4 py-2.5 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button type="submit" disabled={submitStatus === 'submitting'}
              className="px-5 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60">
              {submitStatus === 'submitting'
                ? (language === 'en' ? 'Subscribing...' : 'Suscribiendo...')
                : (language === 'en' ? 'Subscribe' : 'Suscribirse')}
            </button>
          </form>
          {submitStatus === 'success' && (
            <p className="text-white text-sm font-medium">
              {language === 'en' ? "🎉 You're subscribed!" : '🎉 ¡Estás suscrito!'}
            </p>
          )}
        </div>
      </div>

      {/* Main footer columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 mb-12">
          {/* Brand col */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex flex-col gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-0.5 rounded-full bg-green-400" style={{ width: `${14 - i * 2}px` }}></div>
                ))}
              </div>
              <div>
                <span className="text-xl font-bold text-white block">
                  {language === 'en' ? 'Classic Same Day Blinds' : 'Persianas Clásicas Mismo Día'}
                </span>
                <span className="text-xs text-stone-400 tracking-wide">
                  {language === 'en' ? 'since 1994' : 'desde 1994'}
                </span>
              </div>
            </div>
            <p className="text-sm text-stone-400 mb-5 leading-relaxed max-w-xs">
              {language === 'en'
                ? "America's #1 online destination for custom blinds, shades, and shutters. Custom made to order. Free samples. Expert guidance 7 days a week."
                : 'El destino #1 en línea para persianas, cortinas y postigos personalizados. Hechos a medida. Muestras gratis. Orientación experta 7 días a la semana.'}
            </p>
            <div className="flex gap-2 mb-5">
              {[
                { icon: 'ri-facebook-fill', href: 'https://facebook.com', label: 'Facebook' },
                { icon: 'ri-instagram-line', href: 'https://instagram.com', label: 'Instagram' },
                { icon: 'ri-pinterest-line', href: 'https://pinterest.com', label: 'Pinterest' },
                { icon: 'ri-youtube-line', href: 'https://youtube.com', label: 'YouTube' },
                { icon: 'ri-twitter-x-line', href: 'https://twitter.com', label: 'Twitter/X' },
              ].map((s) => (
                <a key={s.icon} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                  className="w-9 h-9 flex items-center justify-center bg-stone-700 hover:bg-green-700 text-stone-300 hover:text-white rounded-lg transition-all cursor-pointer">
                  <i className={`${s.icon} text-base`}></i>
                </a>
              ))}
            </div>
            <a href="https://www.amazon.com" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer">
              <i className="ri-amazon-fill text-base"></i>
              {language === 'en' ? 'Also on Amazon' : 'También en Amazon'}
            </a>
          </div>

          {/* Link columns */}
          {footerColumns.map((col) => (
            <div key={col.heading}>
              <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wide">{col.heading}</h4>
              <ul className="space-y-2">
                {col.items.map((item) => (
                  <li key={item.label}>
                    <button onClick={() => scrollToSection(item.id)}
                      className="text-sm text-stone-400 hover:text-green-400 transition-colors cursor-pointer text-left whitespace-nowrap">
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="border-t border-stone-700 pt-8 mb-8">
          <div className="flex flex-wrap justify-center gap-8">
            {trustBadges.map((badge) => (
              <div key={badge.text} className="flex items-center gap-2 text-stone-400 text-sm">
                <div className="w-5 h-5 flex items-center justify-center text-green-400">
                  <i className={badge.icon}></i>
                </div>
                {badge.text}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-stone-700 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-stone-500">
            {language === 'en'
              ? '© 2025 Classic Same Day Blinds. All rights reserved.'
              : '© 2025 Persianas Clásicas Mismo Día. Todos los derechos reservados.'}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {legalLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => link.path ? navigate(link.path) : undefined}
                className="text-xs text-stone-500 hover:text-green-400 transition-colors cursor-pointer whitespace-nowrap bg-transparent border-0"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
