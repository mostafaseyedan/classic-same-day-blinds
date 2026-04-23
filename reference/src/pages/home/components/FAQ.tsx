import { useState } from 'react';
import { faqs } from '../../../mocks/faqs';
import { useLanguage } from '../../../contexts/LanguageContext';

const faqsEs = [
  {
    question: '¿Cómo mido mis ventanas para las persianas?',
    answer: 'Para montaje interior, mide el ancho y alto exactos de la abertura de la ventana en tres puntos (arriba, centro y abajo para el ancho; izquierda, centro y derecha para el alto) y usa la medida más pequeña. Para montaje exterior, mide el área que deseas cubrir y agrega 2–3 pulgadas a cada lado para mejor bloqueo de luz y cobertura.',
  },
  {
    question: '¿Cuál es la diferencia entre cortinas filtrantes de luz y blackout?',
    answer: 'Las cortinas filtrantes de luz permiten que pase luz natural suave y difusa mientras brindan privacidad durante el día. Las cortinas blackout bloquean el 99–100% de la luz, ideales para dormitorios, cuartos de bebés y salas de cine donde se desea oscuridad total.',
  },
  {
    question: '¿Sus persianas son seguras para niños y mascotas?',
    answer: '¡Sí! Todas nuestras opciones sin cordón y motorizadas están certificadas como seguras para niños y mascotas. Recomendamos ampliamente las persianas sin cordón o motorizadas para hogares con niños pequeños o mascotas. Nuestros sistemas sin cordón eliminan completamente los cordones colgantes.',
  },
  {
    question: '¿Ofrecen muestras gratis?',
    answer: '¡Por supuesto! Ofrecemos muestras gratis de telas y materiales para que puedas ver y sentir la calidad antes de ordenar. Simplemente selecciona hasta 5 muestras desde cualquier página de producto y te las enviamos sin costo, generalmente en 2–3 días hábiles.',
  },
  {
    question: '¿Cuánto tiempo tarda en llegar mi pedido de persianas personalizadas?',
    answer: 'La mayoría de las persianas y cortinas personalizadas se fabrican bajo pedido y se envían en 3–5 días hábiles. La entrega estándar toma 5–7 días hábiles después del envío. Hay opciones de envío exprés disponibles al momento del pago. Recibirás un número de seguimiento tan pronto como tu pedido sea enviado.',
  },
  {
    question: '¿Puedo instalar las persianas yo mismo?',
    answer: '¡Sí! Nuestras persianas incluyen instrucciones detalladas de instalación y todo el hardware necesario. La mayoría de las instalaciones toman menos de 30 minutos por ventana con herramientas básicas. También ofrecemos tutoriales en video en nuestro sitio web y nuestro equipo de soporte está disponible para guiarte.',
  },
  {
    question: '¿Cuál es su política de devoluciones y garantía?',
    answer: 'Ofrecemos una política de devolución de 30 días en todos los artículos en stock. Las persianas personalizadas no son retornables, pero están cubiertas por nuestra Garantía de Mejor Precio y una garantía de 3 años contra defectos de fabricación. Si tus persianas llegan dañadas o incorrectas, las reemplazamos sin costo.',
  },
  {
    question: '¿Ofrecen persianas motorizadas y compatibles con hogar inteligente?',
    answer: '¡Sí! Nuestras persianas motorizadas son compatibles con Amazon Alexa, Google Home y Apple HomeKit. Puedes controlarlas por app, comando de voz o programar horarios automáticos. Nuestras persianas inteligentes usan baterías recargables o pueden cablearse permanentemente.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { language } = useLanguage();

  const displayFaqs = language === 'en' ? faqs : faqsEs;

  return (
    <section id="faq" className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-green-700 text-sm font-semibold uppercase tracking-widest mb-2">
            {language === 'en' ? 'Got Questions?' : '¿Tienes Preguntas?'}
          </p>
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            {language === 'en' ? 'Frequently Asked Questions' : 'Preguntas Frecuentes'}
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            {language === 'en'
              ? 'Everything you need to know about ordering custom blinds and shades online.'
              : 'Todo lo que necesitas saber sobre cómo ordenar persianas y cortinas personalizadas en línea.'}
          </p>
        </div>

        <div className="space-y-3">
          {displayFaqs.map((faq, index) => (
            <div
              key={index}
              className={`bg-white rounded-xl overflow-hidden border transition-all duration-200 ${
                openIndex === index ? 'border-green-400 shadow-md' : 'border-gray-100 shadow-sm'
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left cursor-pointer hover:bg-green-50/50 transition-colors"
              >
                <span className="text-sm font-bold text-gray-900 pr-4 leading-snug">{faq.question}</span>
                <div className={`w-7 h-7 flex items-center justify-center rounded-full flex-shrink-0 transition-all duration-300 ${
                  openIndex === index ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  <i className={`ri-arrow-down-s-line text-lg transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}></i>
                </div>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-96' : 'max-h-0'}`}>
                <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center bg-green-50 border border-green-200 rounded-2xl p-8">
          <div className="w-12 h-12 flex items-center justify-center bg-green-700 text-white rounded-full mx-auto mb-4">
            <i className="ri-customer-service-2-line text-2xl"></i>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {language === 'en' ? 'Still have questions?' : '¿Aún tienes preguntas?'}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {language === 'en'
              ? 'Our window treatment experts are available 7 days a week to help.'
              : 'Nuestros expertos en tratamientos de ventanas están disponibles 7 días a la semana para ayudarte.'}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="tel:18005051905"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-700 text-white text-sm font-semibold rounded-lg hover:bg-green-800 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-phone-line"></i>
              1-800-505-1905
            </a>
            <button
              onClick={() => {
                const el = document.getElementById('contact');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-green-700 text-green-700 text-sm font-semibold rounded-lg hover:bg-green-700 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-chat-3-line"></i>
              {language === 'en' ? 'Send a Message' : 'Enviar un Mensaje'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
