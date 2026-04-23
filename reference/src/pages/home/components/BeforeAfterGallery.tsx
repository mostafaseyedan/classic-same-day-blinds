import { useLanguage } from '../../../contexts/LanguageContext';

const galleryItems = [
  {
    id: 1,
    locationEn: 'Before & After Installation',
    locationEs: 'Antes y Después de la Instalación',
    src: 'https://storage.readdy-site.link/project_files/0f1e2c1b-eb20-4554-bb99-6e317514fabb/b4560415-006e-4b84-aaea-31f6807ce815_before-after-1.png?v=74985276c0eea35b0ed36481a9809ad2',
  },
  {
    id: 2,
    locationEn: 'Before & After Installation',
    locationEs: 'Antes y Después de la Instalación',
    src: 'https://storage.readdy-site.link/project_files/0f1e2c1b-eb20-4554-bb99-6e317514fabb/4ac523fe-8e6f-4f0c-b9df-45de178146e7_before-after-2.png?v=90f1d31963c8271572c457a0cf6134fd',
  },
  {
    id: 3,
    locationEn: 'Before & After Transformation',
    locationEs: 'Transformación Antes y Después',
    src: 'https://storage.readdy-site.link/project_files/0f1e2c1b-eb20-4554-bb99-6e317514fabb/73d38db5-3b56-4b00-8142-d7d91b336916_before-after.png?v=b405b94f832d5d798196cca9578126dd',
  },
  {
    id: 4,
    locationEn: 'Real Customer Installation',
    locationEs: 'Instalación Real de Cliente',
    src: 'https://storage.readdy-site.link/project_files/0f1e2c1b-eb20-4554-bb99-6e317514fabb/c06b63eb-56f2-4185-846e-5ab819870e1d_mini.png?v=3e3409a0b06566dd06f0db9b8fe52ea6',
  },
  {
    id: 5,
    locationEn: 'Real Customer Installation',
    locationEs: 'Instalación Real de Cliente',
    src: 'https://storage.readdy-site.link/project_files/0f1e2c1b-eb20-4554-bb99-6e317514fabb/5bda4b27-824d-4b8d-badc-53e48e7840c7_vertical.png?v=99e983e82593078ab47bd23c0748e0a4',
  },
];

export default function BeforeAfterGallery() {
  const { language } = useLanguage();

  const topRow = galleryItems.slice(0, 2);
  const bottomRow = galleryItems.slice(2);

  const stats = language === 'en'
    ? [
        { value: '2,540+', label: 'Units Installed' },
        { value: '180+', label: 'Hotel Projects' },
        { value: '98%', label: 'Client Satisfaction' },
        { value: '4.9★', label: 'Average Rating' },
      ]
    : [
        { value: '2,540+', label: 'Unidades Instaladas' },
        { value: '180+', label: 'Proyectos Hoteleros' },
        { value: '98%', label: 'Satisfacción del Cliente' },
        { value: '4.9★', label: 'Calificación Promedio' },
      ];

  return (
    <section id="gallery" className="py-20 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <p className="text-green-700 text-sm font-semibold uppercase tracking-widest mb-2">
              {language === 'en' ? 'Real Installations' : 'Instalaciones Reales'}
            </p>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">
              {language === 'en' ? 'Before & After Gallery' : 'Galería Antes y Después'}
            </h2>
            <p className="text-gray-500 text-base">
              {language === 'en' ? 'See the transformations our customers experience' : 'Mira las transformaciones que experimentan nuestros clientes'}
            </p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-stone-300 bg-white text-sm font-semibold text-gray-700 hover:border-green-600 hover:text-green-700 transition-all cursor-pointer whitespace-nowrap self-start md:self-auto">
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-upload-2-line text-base"></i>
            </div>
            {language === 'en' ? 'Submit Your Photos' : 'Enviar Tus Fotos'}
          </button>
        </div>

        {/* Top row — 2 photos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {topRow.map((item) => (
            <div key={item.id} className="rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 group cursor-pointer">
              <div className="w-full h-72 flex items-center justify-center bg-stone-100 overflow-hidden">
                <img
                  src={item.src}
                  alt={language === 'en' ? item.locationEn : item.locationEs}
                  className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="px-5 py-3 flex items-center justify-between bg-white">
                <p className="text-sm font-bold text-gray-800">{language === 'en' ? item.locationEn : item.locationEs}</p>
                <span className="text-xs bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full whitespace-nowrap">
                  {language === 'en' ? 'Before & After' : 'Antes y Después'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom row — 3 photos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {bottomRow.map((item) => (
            <div key={item.id} className="rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 group cursor-pointer">
              <div className="w-full h-64 flex items-center justify-center bg-stone-100 overflow-hidden">
                <img
                  src={item.src}
                  alt={language === 'en' ? item.locationEn : item.locationEs}
                  className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="px-4 py-3 flex items-center justify-between bg-white">
                <p className="text-sm font-bold text-gray-800">{language === 'en' ? item.locationEn : item.locationEs}</p>
                <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-1 rounded-full whitespace-nowrap">
                  {language === 'en' ? 'Real Install' : 'Instalación Real'}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center p-5 bg-white rounded-xl border border-stone-200">
              <p className="text-2xl font-bold text-green-700">{stat.value}</p>
              <p className="text-sm text-stone-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
