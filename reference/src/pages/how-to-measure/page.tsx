import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

export default function HowToMeasurePage() {
  const { language } = useLanguage();

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = 'https://static.readdy.ai/image/10fa40ccc8b6597759995e1d60c86977/bb915d3c9894dc0bab167ca7161ff7f7.png';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.click();
  };

  const tips = language === 'en'
    ? [
        {
          icon: 'ri-ruler-line',
          title: 'Use a Steel Tape Measure',
          desc: 'A steel tape measure is the only accurate tool for measuring windows. Cloth or plastic tapes can stretch and give inaccurate readings.',
        },
        {
          icon: 'ri-arrow-left-right-line',
          title: 'Measure Width First',
          desc: 'Always measure width (horizontal) before length (vertical). Measure in three places — top, middle, and bottom — and use the narrowest measurement.',
        },
        {
          icon: 'ri-arrow-up-down-line',
          title: 'Measure Length in Three Places',
          desc: 'Measure length on the left, center, and right side. For horizontal blinds, use the longest measurement. For vertical blinds, use the shortest.',
        },
        {
          icon: 'ri-focus-3-line',
          title: 'Measure to the Nearest 1/8"',
          desc: 'Always record your measurements to the nearest 1/8 inch. Do not round up or down — precision matters for a perfect fit.',
        },
        {
          icon: 'ri-home-4-line',
          title: 'Inside vs Outside Mount',
          desc: 'Inside mount fits inside the window frame for a clean look. Outside mount overlaps the frame — add at least 1.5" on each side for proper coverage.',
        },
        {
          icon: 'ri-error-warning-line',
          title: 'Do NOT Deduct for Inside Mount',
          desc: 'Inside mount blinds have a factory deduction already built in. Measure the exact opening and we handle the rest — never subtract anything yourself.',
        },
      ]
    : [
        {
          icon: 'ri-ruler-line',
          title: 'Usa una Cinta Métrica de Acero',
          desc: 'Una cinta métrica de acero es la única herramienta precisa para medir ventanas. Las cintas de tela o plástico pueden estirarse y dar lecturas inexactas.',
        },
        {
          icon: 'ri-arrow-left-right-line',
          title: 'Mide el Ancho Primero',
          desc: 'Siempre mide el ancho (horizontal) antes que el largo (vertical). Mide en tres puntos — arriba, en el medio y abajo — y usa la medida más angosta.',
        },
        {
          icon: 'ri-arrow-up-down-line',
          title: 'Mide el Largo en Tres Puntos',
          desc: 'Mide el largo en el lado izquierdo, centro y derecho. Para persianas horizontales, usa la medida más larga. Para verticales, usa la más corta.',
        },
        {
          icon: 'ri-focus-3-line',
          title: 'Mide al 1/8" más cercano',
          desc: 'Siempre registra tus medidas al 1/8 de pulgada más cercano. No redondees hacia arriba ni hacia abajo — la precisión es clave para un ajuste perfecto.',
        },
        {
          icon: 'ri-home-4-line',
          title: 'Montaje Interior vs Exterior',
          desc: 'El montaje interior cabe dentro del marco de la ventana para un look limpio. El exterior superpone el marco — agrega al menos 1.5" en cada lado.',
        },
        {
          icon: 'ri-error-warning-line',
          title: 'NO Restes para Montaje Interior',
          desc: 'Las persianas de montaje interior ya tienen una deducción de fábrica incorporada. Mide la apertura exacta y nosotros nos encargamos del resto.',
        },
      ];

  return (
    <div className="min-h-screen bg-white">
      {/* Page Header */}
      <div className="bg-gray-50 border-b border-gray-200 pt-48 pb-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link to="/" className="hover:text-green-700 transition-colors cursor-pointer">
              {language === 'en' ? 'Home' : 'Inicio'}
            </Link>
            <i className="ri-arrow-right-s-line"></i>
            <span className="text-gray-700 font-medium">
              {language === 'en' ? 'How to Measure' : 'Cómo Medir'}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {language === 'en' ? 'How to Measure Your Windows' : 'Cómo Medir Sus Ventanas'}
              </h1>
              <p className="text-gray-500 text-sm">
                {language === 'en'
                  ? 'Follow this guide to get a perfect fit every time — inside or outside mount.'
                  : 'Sigue esta guía para lograr un ajuste perfecto en cada ocasión — montaje interior o exterior.'}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0 print:hidden">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2.5 border border-green-700 text-green-700 text-sm font-semibold rounded-lg hover:bg-green-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-download-line"></i>
                </div>
                {language === 'en' ? 'Download Guide' : 'Descargar Guía'}
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2.5 bg-green-700 text-white text-sm font-semibold rounded-lg hover:bg-green-800 transition-colors cursor-pointer whitespace-nowrap"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-printer-line"></i>
                </div>
                {language === 'en' ? 'Print Guide' : 'Imprimir Guía'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Guide Image */}
        <div className="mb-14 rounded-2xl overflow-hidden border border-gray-100">
          <img
            src="https://static.readdy.ai/image/10fa40ccc8b6597759995e1d60c86977/bb915d3c9894dc0bab167ca7161ff7f7.png"
            alt="How to Measure Your Windows for Blinds - Classic Blind Limited Guide"
            className="w-full h-auto object-contain"
          />
        </div>

        {/* Quick Tips Grid */}
        <div className="mb-14">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {language === 'en' ? 'Quick Measuring Tips' : 'Consejos Rápidos de Medición'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tips.map((tip) => (
              <div key={tip.title} className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 flex items-center justify-center bg-green-100 text-green-700 rounded-lg shrink-0">
                    <i className={`${tip.icon} text-lg`}></i>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-1">{tip.title}</h4>
                    <p className="text-xs text-gray-600 leading-relaxed">{tip.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {language === 'en' ? 'Ready to Order?' : '¿Listo para Ordenar?'}
            </h3>
            <p className="text-sm text-gray-600">
              {language === 'en'
                ? 'Once you have your measurements, browse our full product catalog and order custom-made blinds.'
                : 'Una vez que tengas tus medidas, explora nuestro catálogo completo y ordena persianas hechas a medida.'}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="tel:18005051905"
              className="flex items-center gap-2 px-4 py-2.5 border border-green-700 text-green-700 text-sm font-semibold rounded-lg hover:bg-green-100 transition-colors cursor-pointer whitespace-nowrap"
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-phone-line"></i>
              </div>
              1-800-505-1905
            </a>
            <Link
              to="/products"
              className="flex items-center gap-2 px-5 py-2.5 bg-green-700 text-white text-sm font-semibold rounded-lg hover:bg-green-800 transition-colors cursor-pointer whitespace-nowrap"
            >
              {language === 'en' ? 'Shop Now' : 'Comprar Ahora'}
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-arrow-right-line"></i>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
