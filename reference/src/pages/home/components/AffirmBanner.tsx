import { useLanguage } from '../../../contexts/LanguageContext';

export default function AffirmBanner() {
  const { language } = useLanguage();

  const steps = language === 'en'
    ? [
        { icon: 'ri-shopping-cart-2-line', label: 'Shop & Choose' },
        { icon: 'ri-file-list-3-line', label: 'Apply at Checkout' },
        { icon: 'ri-check-double-line', label: 'Get Instant Decision' },
        { icon: 'ri-calendar-check-line', label: 'Pay Over Time' },
      ]
    : [
        { icon: 'ri-shopping-cart-2-line', label: 'Compra y Elige' },
        { icon: 'ri-file-list-3-line', label: 'Aplica al Pagar' },
        { icon: 'ri-check-double-line', label: 'Decisión Instantánea' },
        { icon: 'ri-calendar-check-line', label: 'Paga con el Tiempo' },
      ];

  return (
    <section className="py-14 bg-[#f5f0eb]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-white border border-stone-200 overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Left: Affirm branding + headline */}
            <div className="lg:w-1/2 bg-[#0fa0ea] p-10 flex flex-col justify-center relative overflow-hidden">
              {/* decorative circles */}
              <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-white/10"></div>
              <div className="absolute -bottom-20 -right-10 w-72 h-72 rounded-full bg-white/10"></div>

              <div className="relative z-10">
                {/* Affirm wordmark */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-white rounded-xl px-4 py-2 flex items-center gap-2">
                    <span className="text-[#0fa0ea] font-black text-2xl tracking-tight">affirm</span>
                  </div>
                  <span className="text-white/80 text-sm font-medium">
                    {language === 'en' ? 'Financing Partner' : 'Socio Financiero'}
                  </span>
                </div>

                <h2 className="text-3xl font-bold text-white leading-tight mb-3">
                  {language === 'en'
                    ? 'Buy Now, Pay Over Time'
                    : 'Compra Ahora, Paga con el Tiempo'}
                </h2>
                <p className="text-white/85 text-base leading-relaxed mb-6">
                  {language === 'en'
                    ? 'Qualified customers can split their purchase into easy monthly payments with Affirm — no hidden fees, no surprises. Rates from 0% APR.'
                    : 'Los clientes calificados pueden dividir su compra en cómodas cuotas mensuales con Affirm — sin cargos ocultos, sin sorpresas. Tasas desde 0% APR.'}
                </p>

                <a
                  href="https://www.affirm.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white text-[#0fa0ea] font-bold px-6 py-3 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer whitespace-nowrap text-sm"
                >
                  <i className="ri-external-link-line"></i>
                  {language === 'en' ? 'Learn More at Affirm.com' : 'Más Info en Affirm.com'}
                </a>
              </div>
            </div>

            {/* Right: How it works */}
            <div className="lg:w-1/2 p-10 flex flex-col justify-center">
              <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">
                {language === 'en' ? 'How It Works' : 'Cómo Funciona'}
              </p>
              <h3 className="text-xl font-bold text-gray-900 mb-8">
                {language === 'en'
                  ? 'Financing in 4 simple steps'
                  : 'Financiamiento en 4 pasos simples'}
              </h3>

              <div className="grid grid-cols-2 gap-5 mb-8">
                {steps.map((step, i) => (
                  <div key={step.label} className="flex items-start gap-3">
                    <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#e8f6fd] text-[#0fa0ea] flex-shrink-0">
                      <i className={`${step.icon} text-lg`}></i>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-stone-400 block mb-0.5">
                        {language === 'en' ? `Step ${i + 1}` : `Paso ${i + 1}`}
                      </span>
                      <span className="text-sm font-semibold text-gray-800">{step.label}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Example payment callout */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-green-100 text-green-700 flex-shrink-0">
                  <i className="ri-money-dollar-circle-line text-xl"></i>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {language === 'en'
                      ? 'Example: $600 order → as low as $50/mo'
                      : 'Ejemplo: Pedido de $600 → desde $50/mes'}
                  </p>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {language === 'en'
                      ? 'Subject to credit approval. Rates 0–36% APR. See Affirm for full terms.'
                      : 'Sujeto a aprobación de crédito. Tasas 0–36% APR. Ver Affirm para términos completos.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
