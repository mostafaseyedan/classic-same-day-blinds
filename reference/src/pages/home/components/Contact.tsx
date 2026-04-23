import { useState } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';

export default function Contact() {
  const { language } = useLanguage();
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [charCount, setCharCount] = useState(0);

  const contactCards = [
    {
      icon: 'ri-phone-line',
      title: language === 'en' ? 'Call Us' : 'Llámanos',
      lines: [
        { label: '(817) 540-9300', sub: 'Local', href: 'tel:8175409300' },
        { label: '(800) 961-9867', sub: 'Toll Free', href: 'tel:8009619867' },
      ],
    },
    {
      icon: 'ri-mail-line',
      title: language === 'en' ? 'Email Us' : 'Escríbenos',
      lines: [
        { label: 'support@blindsshop.com', href: 'mailto:support@blindsshop.com' },
        { label: 'design@blindsshop.com', href: 'mailto:design@blindsshop.com' },
      ],
    },
    {
      icon: 'ri-map-pin-line',
      title: language === 'en' ? 'Visit Us' : 'Visítanos',
      lines: [
        { label: '2801 Brasher Ln, Bedford, TX 76021' },
      ],
      extra: (
        <a
          href="https://maps.google.com/?q=2801+Brasher+Ln,+Bedford,+TX+76021"
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="mt-2 inline-flex items-center gap-1.5 text-green-700 text-xs font-semibold hover:underline cursor-pointer whitespace-nowrap"
        >
          <i className="ri-navigation-line text-xs"></i>
          {language === 'en' ? 'Get Directions' : 'Cómo Llegar'}
        </a>
      ),
    },
    {
      icon: 'ri-time-line',
      title: language === 'en' ? 'Business Hours' : 'Horario',
      custom: (
        <div className="space-y-1.5 mt-1">
          <div className="flex justify-between gap-4">
            <span className="text-sm font-medium text-gray-700">Mon – Fri</span>
            <span className="text-sm text-gray-500">8:00 AM – 5:00 PM</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-sm font-medium text-gray-700">Sat – Sun</span>
            <span className="text-sm text-gray-500">Online orders only</span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed pt-1">Weekend orders ship Mon or Tue</p>
        </div>
      ),
    },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const messageField = form.querySelector<HTMLTextAreaElement>('textarea[name="message"]');
    if (messageField && messageField.value.length > 500) return;

    setFormStatus('sending');
    const data = new URLSearchParams();
    new FormData(form).forEach((value, key) => {
      data.append(key, value as string);
    });

    try {
      const res = await fetch('https://readdy.ai/api/form/d70a6vn9hgr6oot2qsj0', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: data.toString(),
      });
      if (res.ok) {
        setFormStatus('success');
        form.reset();
        setCharCount(0);
      } else {
        setFormStatus('error');
      }
    } catch {
      setFormStatus('error');
    }
  };

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-green-700 text-sm font-semibold uppercase tracking-widest mb-2">
            {language === 'en' ? "We're Here to Help" : 'Estamos Aquí para Ayudarte'}
          </p>
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            {language === 'en' ? 'Get in Touch' : 'Contáctanos'}
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            {language === 'en'
              ? 'Questions about measuring, styles, or your order? Our window treatment specialists are here 7 days a week.'
              : '¿Preguntas sobre medidas, estilos o tu pedido? Nuestros especialistas están disponibles 7 días a la semana.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

          {/* LEFT — contact info cards */}
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {contactCards.map((card) => (
                <div key={card.title} className="flex gap-4 p-5 bg-green-50 rounded-xl border border-green-100 hover:border-green-300 transition-colors">
                  <div className="w-11 h-11 flex items-center justify-center bg-green-700 text-white rounded-lg flex-shrink-0">
                    <i className={`${card.icon} text-xl`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 mb-2">{card.title}</h3>
                    {card.custom ?? (
                      <div className="space-y-1">
                        {card.lines?.map((line) => (
                          <p key={line.label} className="text-sm text-gray-600">
                            {line.href ? (
                              <a href={line.href} className="hover:text-green-700 transition-colors cursor-pointer">
                                {line.label}
                              </a>
                            ) : (
                              line.label
                            )}
                            {line.sub && <span className="ml-2 text-xs text-gray-400 font-medium">{line.sub}</span>}
                          </p>
                        ))}
                        {card.extra}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Family-owned badge */}
              <div className="sm:col-span-2 flex items-center gap-3 px-5 py-4 bg-green-700 rounded-xl">
                <div className="w-10 h-10 flex items-center justify-center bg-white/20 rounded-lg flex-shrink-0">
                  <i className="ri-home-heart-line text-white text-xl"></i>
                </div>
                <div>
                  <p className="text-white text-sm font-black uppercase tracking-wide">
                    {language === 'en' ? 'Family Owned & Operated' : 'Negocio Familiar'}
                  </p>
                  <p className="text-green-200 text-xs mt-0.5">
                    {language === 'en' ? 'Serving DFW for over 10 years' : 'Sirviendo DFW por más de 10 años'}
                  </p>
                </div>
              </div>
            </div>

            {/* Live chat CTA */}
            <div className="bg-gradient-to-br from-green-700 to-emerald-800 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 flex items-center justify-center bg-white/15 rounded-xl">
                  <i className="ri-chat-3-line text-xl text-white"></i>
                </div>
                <div>
                  <h3 className="text-base font-bold leading-tight">
                    {language === 'en' ? 'Prefer instant answers?' : '¿Prefieres respuestas instantáneas?'}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse"></span>
                    <span className="text-green-200 text-xs font-medium">
                      {language === 'en' ? 'Specialists online now' : 'Especialistas en línea'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  const chatBtn = document.querySelector<HTMLButtonElement>('[aria-label="Open live chat"]');
                  chatBtn?.click();
                }}
                className="w-full py-3 bg-white text-green-800 font-bold text-sm rounded-xl hover:bg-green-50 transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
              >
                <i className="ri-chat-3-fill text-base"></i>
                {language === 'en' ? 'Start Live Chat' : 'Iniciar Chat en Vivo'}
              </button>
            </div>
          </div>

          {/* RIGHT — Send a message form */}
          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 flex items-center justify-center bg-green-100 rounded-xl">
                <i className="ri-send-plane-2-line text-green-700 text-xl"></i>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {language === 'en' ? 'Send Us a Message' : 'Envíanos un Mensaje'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {language === 'en' ? "We'll get back to you within 1 business day" : 'Te responderemos en 1 día hábil'}
                </p>
              </div>
            </div>

            {formStatus === 'success' ? (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <div className="w-16 h-16 flex items-center justify-center bg-green-100 rounded-full mb-4">
                  <i className="ri-check-line text-green-600 text-3xl"></i>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  {language === 'en' ? 'Message Sent!' : '¡Mensaje Enviado!'}
                </h4>
                <p className="text-gray-500 text-sm max-w-xs">
                  {language === 'en'
                    ? "Thanks for reaching out! We'll reply to your email within 1 business day."
                    : 'Gracias por contactarnos. Te responderemos dentro de 1 día hábil.'}
                </p>
                <button
                  onClick={() => setFormStatus('idle')}
                  className="mt-6 px-5 py-2.5 bg-green-700 text-white text-sm font-semibold rounded-lg hover:bg-green-800 transition-colors cursor-pointer whitespace-nowrap"
                >
                  {language === 'en' ? 'Send Another' : 'Enviar Otro'}
                </button>
              </div>
            ) : (
              <form
                data-readdy-form
                id="contact-message-form"
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      {language === 'en' ? 'Full Name' : 'Nombre Completo'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder={language === 'en' ? 'Jane Smith' : 'Juan García'}
                      className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition placeholder-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      {language === 'en' ? 'Email Address' : 'Correo Electrónico'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="jane@example.com"
                      className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition placeholder-gray-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    {language === 'en' ? 'Phone Number' : 'Número de Teléfono'}
                    <span className="ml-1 text-gray-400 font-normal">({language === 'en' ? 'optional' : 'opcional'})</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="(817) 555-0100"
                    className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition placeholder-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    {language === 'en' ? 'Subject' : 'Asunto'} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="subject"
                    required
                    className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-gray-700 cursor-pointer"
                  >
                    <option value="">{language === 'en' ? 'Select a topic…' : 'Selecciona un tema…'}</option>
                    <option value="Pricing & Quote">{language === 'en' ? 'Pricing & Quote' : 'Precio y Cotización'}</option>
                    <option value="Order Support">{language === 'en' ? 'Order Support' : 'Soporte de Pedido'}</option>
                    <option value="Measuring Help">{language === 'en' ? 'Measuring Help' : 'Ayuda para Medir'}</option>
                    <option value="Installation">{language === 'en' ? 'Installation' : 'Instalación'}</option>
                    <option value="Product Question">{language === 'en' ? 'Product Question' : 'Pregunta de Producto'}</option>
                    <option value="Same-Day Delivery">{language === 'en' ? 'Same-Day Delivery' : 'Entrega el Mismo Día'}</option>
                    <option value="Returns & Warranty">{language === 'en' ? 'Returns & Warranty' : 'Devoluciones y Garantía'}</option>
                    <option value="Other">{language === 'en' ? 'Other' : 'Otro'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    {language === 'en' ? 'Message' : 'Mensaje'} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    maxLength={500}
                    placeholder={
                      language === 'en'
                        ? 'Tell us about your window, room size, or any specific questions…'
                        : 'Cuéntanos sobre tu ventana, el tamaño de la habitación o cualquier pregunta específica…'
                    }
                    onChange={(e) => setCharCount(e.target.value.length)}
                    className="w-full px-4 py-3 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition placeholder-gray-300 resize-none"
                  />
                  <div className="flex justify-between items-center mt-1">
                    <span className={`text-xs ${charCount > 480 ? 'text-red-500' : 'text-gray-400'}`}>
                      {charCount}/500 {language === 'en' ? 'characters' : 'caracteres'}
                    </span>
                    {charCount > 500 && (
                      <span className="text-xs text-red-500 font-medium">
                        {language === 'en' ? 'Too long — trim your message' : 'Demasiado largo'}
                      </span>
                    )}
                  </div>
                </div>

                {formStatus === 'error' && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg">
                    <div className="w-5 h-5 flex items-center justify-center shrink-0">
                      <i className="ri-error-warning-line text-red-500 text-base"></i>
                    </div>
                    <p className="text-xs text-red-600">
                      {language === 'en'
                        ? 'Something went wrong. Please try again or email us directly.'
                        : 'Algo salió mal. Por favor intenta de nuevo o escríbenos directamente.'}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={formStatus === 'sending' || charCount > 500}
                  className="w-full py-3.5 bg-green-700 text-white font-bold text-sm rounded-xl hover:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
                >
                  {formStatus === 'sending' ? (
                    <>
                      <i className="ri-loader-4-line animate-spin text-base"></i>
                      {language === 'en' ? 'Sending…' : 'Enviando…'}
                    </>
                  ) : (
                    <>
                      <i className="ri-send-plane-2-fill text-base"></i>
                      {language === 'en' ? 'Send Message' : 'Enviar Mensaje'}
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
