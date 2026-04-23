import { useLanguage } from '../../../contexts/LanguageContext';

export default function YearsInBusiness() {
  const { t } = useLanguage();

  const stats = [
    { icon: 'ri-home-4-line', value: '2M+', en: 'Happy Customers', es: 'Clientes Felices' },
    { icon: 'ri-store-2-line', value: '50K+', en: 'Products Available', es: 'Productos Disponibles' },
    { icon: 'ri-star-fill', value: '4.9★', en: 'Average Rating', es: 'Calificación Promedio' },
    { icon: 'ri-shield-check-line', value: '3-Year', en: 'Warranty', es: 'Garantía' },
  ];

  return (
    <>
      <section className="py-8 bg-green-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, #fff 0, #fff 1px, transparent 0, transparent 40px), repeating-linear-gradient(90deg, #fff 0, #fff 1px, transparent 0, transparent 40px)',
          }}
        ></div>

        <div className="absolute left-0 top-0 w-60 h-60 bg-green-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute right-0 bottom-0 w-60 h-60 bg-green-500/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-green-200 text-xs font-bold px-4 py-1.5 rounded-full mb-3 uppercase tracking-widest">
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-award-fill text-yellow-300"></i>
            </div>
            {t('Established 1994', 'Fundada en 1994')}
          </div>

          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="h-px w-16 bg-white/20 hidden md:block"></div>
            <span
              className="text-white font-extrabold leading-none"
              style={{ fontSize: 'clamp(3rem, 10vw, 6rem)', lineHeight: 1 }}
            >
              30
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {t('Years in Business', 'Años en el Negocio')}
            </h2>
            <div className="h-px w-16 bg-white/20 hidden md:block"></div>
          </div>

          <p className="text-green-200 text-sm md:text-base max-w-2xl mx-auto mb-6 leading-relaxed">
            {t(
              "Since 1994, Classic Same Day Blinds has been America's trusted source for premium custom window treatments — serving millions of homeowners, property managers, and commercial clients nationwide.",
              'Desde 1994, Classic Same Day Blinds ha sido la fuente de confianza de América para tratamientos de ventanas personalizados premium — sirviendo a millones de propietarios, administradores de propiedades y clientes comerciales en todo el país.'
            )}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.en} className="bg-white/10 border border-white/15 rounded-xl p-4 backdrop-blur-sm">
                <div className="w-8 h-8 flex items-center justify-center bg-white/15 rounded-full mx-auto mb-2">
                  <i className={`${stat.icon} text-yellow-300 text-base`}></i>
                </div>
                <div className="text-2xl font-extrabold text-white mb-0.5">{stat.value}</div>
                <div className="text-green-200 text-xs font-medium">{t(stat.en, stat.es)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Google Review Banner */}
      <section className="py-10 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-200 shadow-sm px-8 py-7">
            <div className="flex items-center gap-5">
              <div className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-xl px-5 py-3 shadow-sm shrink-0">
                <div className="flex gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-5 h-5 flex items-center justify-center">
                      <i className="ri-star-fill text-yellow-400 text-lg"></i>
                    </div>
                  ))}
                </div>
                <span className="text-2xl font-extrabold text-gray-900 leading-none">4.9</span>
                <span className="text-xs text-gray-500 mt-0.5">{t('out of 5', 'de 5')}</span>
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900 mb-0.5">
                  {t('Rated 4.9 Stars on Google', 'Calificado con 4.9 Estrellas en Google')}
                </p>
                <p className="text-sm text-gray-500 max-w-sm">
                  {t(
                    "Hundreds of happy customers have shared their experience. See what they're saying — and leave your own review!",
                    'Cientos de clientes satisfechos han compartido su experiencia. ¡Mira lo que dicen y deja tu propia reseña!'
                  )}
                </p>
              </div>
            </div>

            <a
              href="https://www.google.com/maps/place/Classic+Same+Day+Blinds+LLC/@32.8507916,-97.1028828,15z/data=!4m7!3m6!1s0x0:0x41238e642717eaa!8m2!3d32.8507923!4d-97.1028851!9m1!1b1"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-white hover:bg-gray-50 text-gray-800 font-bold px-6 py-3.5 rounded-xl text-sm transition-all cursor-pointer border border-gray-200 shadow-md hover:shadow-lg whitespace-nowrap shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-6 h-6 shrink-0">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C6.51 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
              </svg>
              {t('Review Us on Google', 'Reseñanos en Google')}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
