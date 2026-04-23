import { useLanguage } from '../../../contexts/LanguageContext';

const tiers = [
  {
    nameEn: 'Bronze',
    nameEs: 'Bronce',
    icon: 'ri-medal-line',
    color: 'from-amber-700 to-amber-500',
    border: 'border-amber-300',
    bg: 'bg-amber-50',
    textColor: 'text-amber-800',
    multiplier: '1x',
    ptsEn: '500 – 2,999 pts',
    ptsEs: '500 – 2,999 pts',
    perks: [
      { en: 'Every $50 spent = $5 in rewards (50 pts)', es: 'Cada $50 gastados = $5 en recompensas (50 pts)' },
      { en: 'Early access to sales', es: 'Acceso anticipado a ventas' },
      { en: 'Rewards redeemable as promo codes', es: 'Recompensas canjeables como códigos promo' },
    ],
  },
  {
    nameEn: 'Silver',
    nameEs: 'Plata',
    icon: 'ri-medal-2-line',
    color: 'from-slate-500 to-slate-400',
    border: 'border-slate-300',
    bg: 'bg-slate-50',
    textColor: 'text-slate-700',
    multiplier: '1.25x',
    ptsEn: '3,000 – 9,999 pts',
    ptsEs: '3,000 – 9,999 pts',
    perks: [
      { en: '1.25x earn multiplier on every order', es: 'Multiplicador de ganancia 1.25x en cada pedido' },
      { en: 'Free expedited shipping', es: 'Envío exprés gratis' },
      { en: 'Priority customer support', es: 'Soporte al cliente prioritario' },
    ],
  },
  {
    nameEn: 'Gold',
    nameEs: 'Oro',
    icon: 'ri-vip-crown-line',
    color: 'from-yellow-500 to-amber-400',
    border: 'border-yellow-300',
    bg: 'bg-yellow-50',
    textColor: 'text-yellow-800',
    multiplier: '1.5x',
    ptsEn: '10,000 – 24,999 pts',
    ptsEs: '10,000 – 24,999 pts',
    perks: [
      { en: '1.5x earn multiplier on every order', es: 'Multiplicador de ganancia 1.5x en cada pedido' },
      { en: 'Free same-day shipping', es: 'Envío en el mismo día gratis' },
      { en: 'Dedicated account manager', es: 'Gerente de cuenta dedicado' },
      { en: 'Exclusive promotions', es: 'Promociones exclusivas' },
    ],
  },
  {
    nameEn: 'Platinum',
    nameEs: 'Platino',
    icon: 'ri-vip-diamond-line',
    color: 'from-purple-600 to-indigo-500',
    border: 'border-violet-300',
    bg: 'bg-violet-50',
    textColor: 'text-violet-800',
    multiplier: '2x',
    featured: true,
    ptsEn: '25,000+ pts',
    ptsEs: '25,000+ pts',
    perks: [
      { en: '2x earn multiplier — maximum rewards', es: 'Multiplicador 2x — máximas recompensas' },
      { en: 'Free same-day shipping on every order', es: 'Envío en el mismo día gratis en cada pedido' },
      { en: 'Dedicated account manager', es: 'Gerente de cuenta dedicado' },
      { en: 'VIP-only deals & early product access', es: 'Ofertas solo VIP y acceso anticipado a productos' },
      { en: 'Price match priority handling', es: 'Gestión prioritaria de igualación de precios' },
    ],
  },
];

const steps = [
  {
    icon: 'ri-shopping-bag-3-line',
    titleEn: 'Shop & Earn',
    titleEs: 'Compra y Gana',
    descEn: 'For every $50 you spend, you earn $5 in rewards. Higher tiers earn bonus multipliers — up to 2x rewards for Platinum members.',
    descEs: 'Por cada $50 que gastas, ganas $5 en recompensas. Los niveles más altos ganan multiplicadores — hasta 2x para miembros Platino.',
    color: 'bg-green-100 text-green-700',
    step: '01',
  },
  {
    icon: 'ri-bar-chart-grouped-line',
    titleEn: 'Reach New Tiers',
    titleEs: 'Alcanza Nuevos Niveles',
    descEn: 'As your lifetime points grow, you unlock Silver, Gold, and Platinum status — each with higher earn multipliers and exclusive perks.',
    descEs: 'A medida que crecen tus puntos, desbloqueas niveles Silver, Gold y Platinum — cada uno con mejores multiplicadores y beneficios exclusivos.',
    color: 'bg-amber-100 text-amber-700',
    step: '02',
  },
  {
    icon: 'ri-coupon-3-line',
    titleEn: 'Redeem Rewards',
    titleEs: 'Canjea Recompensas',
    descEn: 'Trade your available points for discounts and savings. Redeemed rewards appear as promo codes at checkout.',
    descEs: 'Cambia tus puntos disponibles por descuentos. Las recompensas canjeadas aparecen como códigos promo en el pago.',
    color: 'bg-emerald-100 text-emerald-700',
    step: '03',
  },
];

const details = [
  {
    icon: 'ri-coins-line',
    titleEn: 'Earning Rate',
    titleEs: 'Tasa de Ganancia',
    bodyEn: 'Every $50 spent = $5 in rewards (50 pts)\nSilver: 1.25x · Gold: 1.5x · Platinum: 2x multiplier',
    bodyEs: 'Cada $50 gastados = $5 en recompensas (50 pts)\nPlata: 1.25x · Oro: 1.5x · Platino: 2x multiplicador',
    color: 'bg-amber-50 border-amber-200 text-amber-700',
    iconBg: 'bg-amber-100',
  },
  {
    icon: 'ri-bar-chart-2-line',
    titleEn: 'Tier Thresholds',
    titleEs: 'Umbrales de Nivel',
    bodyEn: 'Bronze: 500 pts · Silver: 3,000 pts\nGold: 10,000 pts · Platinum: 25,000 pts',
    bodyEs: 'Bronce: 500 pts · Plata: 3,000 pts\nOro: 10,000 pts · Platino: 25,000 pts',
    color: 'bg-green-50 border-green-200 text-green-700',
    iconBg: 'bg-green-100',
  },
  {
    icon: 'ri-time-line',
    titleEn: 'Points Expiry Policy',
    titleEs: 'Política de Expiración',
    bodyEn: 'Points expire 12 months after the order they were earned on. You\'ll receive an expiry warning 30 days in advance — make sure to redeem in time!',
    bodyEs: 'Los puntos expiran 12 meses después del pedido en que se ganaron. Recibirás un aviso 30 días antes — ¡asegúrate de canjearlos a tiempo!',
    color: 'bg-slate-50 border-slate-200 text-slate-700',
    iconBg: 'bg-slate-100',
  },
];

export default function LoyaltyRewards() {
  const { language } = useLanguage();

  return (
    <section id="loyalty-rewards" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-1.5 text-green-700 text-xs font-black uppercase tracking-widest mb-3 bg-green-50 px-4 py-1.5 rounded-full">
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-vip-crown-fill text-yellow-500 text-sm"></i>
            </div>
            {language === 'en' ? 'Loyalty Program' : 'Programa de Lealtad'}
          </span>
          <h2 className="text-4xl font-black text-gray-900 mb-4">
            {language === 'en' ? 'Earn Rewards Every Time You Shop' : 'Gana Recompensas Cada Vez que Compres'}
          </h2>
          <p className="text-gray-500 text-base max-w-xl mx-auto leading-relaxed">
            {language === 'en'
              ? 'Our loyalty program rewards your continued trust. Earn points, unlock tiers, and save more with every order — plus earn extra when you refer a friend.'
              : 'Nuestro programa de lealtad recompensa tu confianza. Gana puntos, desbloquea niveles y ahorra más con cada pedido.'}
          </p>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h3 className="text-center text-lg font-extrabold text-gray-400 uppercase tracking-widest mb-10">
            {language === 'en' ? 'How the Rewards Program Works' : 'Cómo Funciona el Programa de Recompensas'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={step.titleEn} className="relative flex flex-col">
                {/* connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gray-200 z-0 -translate-y-1/2" style={{ width: 'calc(100% - 4rem)', left: '4rem' }}></div>
                )}
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    <div className={`w-16 h-16 flex items-center justify-center rounded-2xl ${step.color} relative z-10`}>
                      <i className={`${step.icon} text-2xl`}></i>
                    </div>
                    <div className="absolute -top-2 -left-2 w-6 h-6 flex items-center justify-center bg-gray-900 text-white text-xs font-extrabold rounded-full z-20">
                      {step.step}
                    </div>
                  </div>
                  <div className="pt-1">
                    <h3 className="text-base font-extrabold text-gray-900 mb-1.5">
                      {language === 'en' ? step.titleEn : step.titleEs}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      {language === 'en' ? step.descEn : step.descEs}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tier Cards */}
        <div className="mb-14">
          <h3 className="text-center text-xl font-extrabold text-gray-900 mb-2">
            {language === 'en' ? 'Membership Tiers' : 'Niveles de Membresía'}
          </h3>
          <p className="text-center text-gray-400 text-sm mb-8">
            {language === 'en' ? 'Your tier is based on lifetime points earned' : 'Tu nivel se basa en los puntos acumulados'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {tiers.map((tier) => (
              <div
                key={tier.nameEn}
                className={`relative rounded-2xl border-2 p-5 transition-all duration-200 hover:scale-[1.02] ${
                  tier.featured
                    ? 'border-violet-400 bg-gradient-to-br from-violet-50 to-indigo-50'
                    : `${tier.border} ${tier.bg}`
                }`}
              >
                {tier.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-violet-500 text-white text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wide whitespace-nowrap">
                      {language === 'en' ? 'Top Tier' : 'Nivel Máximo'}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-11 h-11 flex items-center justify-center rounded-xl bg-gradient-to-br ${tier.color} shrink-0`}>
                    <i className={`${tier.icon} text-white text-lg`}></i>
                  </div>
                  <div>
                    <p className={`text-sm font-extrabold ${tier.textColor}`}>
                      {language === 'en' ? tier.nameEn : tier.nameEs}
                    </p>
                    <p className="text-xs text-gray-500 font-medium">
                      {language === 'en' ? tier.ptsEn : tier.ptsEs}
                    </p>
                  </div>
                </div>

                <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold mb-3 ${
                  tier.featured ? 'bg-violet-100 text-violet-700' : 'bg-white border border-gray-200 text-gray-600'
                }`}>
                  <div className="w-3 h-3 flex items-center justify-center">
                    <i className="ri-flashlight-fill text-amber-400 text-xs"></i>
                  </div>
                  {tier.multiplier} {language === 'en' ? 'earn rate' : 'tasa de ganancia'}
                </div>

                <ul className="space-y-1.5">
                  {tier.perks.map((perk) => (
                    <li key={perk.en} className="flex items-start gap-2">
                      <div className="w-3.5 h-3.5 flex items-center justify-center mt-0.5 shrink-0">
                        <i className="ri-checkbox-circle-fill text-green-500 text-xs"></i>
                      </div>
                      <span className="text-gray-600 text-xs leading-snug">
                        {language === 'en' ? perk.en : perk.es}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Points & Tier Details */}
        <div className="mb-14">
          <h3 className="text-center text-xl font-extrabold text-gray-900 mb-8">
            {language === 'en' ? 'Points & Tier Details' : 'Detalles de Puntos y Niveles'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {details.map((d) => (
              <div key={d.titleEn} className={`rounded-2xl border p-6 ${d.color}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-9 h-9 flex items-center justify-center rounded-xl ${d.iconBg} shrink-0`}>
                    <i className={`${d.icon} text-base`}></i>
                  </div>
                  <h4 className="text-sm font-extrabold">
                    {language === 'en' ? d.titleEn : d.titleEs}
                  </h4>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-line opacity-80">
                  {language === 'en' ? d.bodyEn : d.bodyEs}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Referral Banner */}
        <div className="rounded-2xl overflow-hidden border border-green-100">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="bg-green-800 px-8 py-10 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 14px)' }}
              ></div>
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-green-200 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-widest">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-user-add-line text-green-300"></i>
                  </div>
                  {language === 'en' ? 'Referral Program' : 'Programa de Referidos'}
                </div>
                <h3 className="text-2xl font-extrabold text-white mb-3 leading-tight">
                  {language === 'en' ? 'Refer a Friend, Both Save' : 'Refiere a un Amigo, Ambos Ahorran'}
                </h3>
                <p className="text-green-200 text-sm leading-relaxed mb-6">
                  {language === 'en'
                    ? "Share your unique referral link. When they place their first order, you both get rewarded — it's that easy."
                    : 'Comparte tu enlace de referido único. Cuando hagan su primer pedido, ambos reciben recompensas.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-4 py-3">
                    <div className="w-9 h-9 flex items-center justify-center bg-white/15 rounded-full shrink-0">
                      <i className="ri-gift-2-line text-yellow-300 text-base"></i>
                    </div>
                    <div>
                      <p className="text-white font-extrabold text-base leading-none">$25 Off</p>
                      <p className="text-green-200 text-xs mt-0.5">{language === 'en' ? 'Your next order' : 'Tu próximo pedido'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-4 py-3">
                    <div className="w-9 h-9 flex items-center justify-center bg-white/15 rounded-full shrink-0">
                      <i className="ri-coupon-3-line text-yellow-300 text-base"></i>
                    </div>
                    <div>
                      <p className="text-white font-extrabold text-base leading-none">10% Off</p>
                      <p className="text-green-200 text-xs mt-0.5">{language === 'en' ? "Friend's first order" : 'Primer pedido del amigo'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white px-8 py-10 flex flex-col justify-center">
              <h4 className="text-base font-extrabold text-gray-900 mb-5">
                {language === 'en' ? 'How Referrals Work' : 'Cómo Funcionan los Referidos'}
              </h4>
              <ul className="space-y-4 mb-6">
                {[
                  { en: 'Create a free account to get your unique referral link', es: 'Crea una cuenta gratuita para obtener tu enlace de referido único', icon: 'ri-links-line', num: '1' },
                  { en: 'Share the link with anyone who needs window treatments', es: 'Comparte el enlace con quien necesite tratamientos de ventanas', icon: 'ri-share-forward-line', num: '2' },
                  { en: 'They place their first order using your link', es: 'Hacen su primer pedido usando tu enlace', icon: 'ri-shopping-cart-2-line', num: '3' },
                  { en: 'You both receive your rewards automatically', es: 'Ambos reciben sus recompensas automáticamente', icon: 'ri-star-smile-line', num: '4' },
                ].map((item) => (
                  <li key={item.num} className="flex items-start gap-3">
                    <div className="w-7 h-7 flex items-center justify-center rounded-full bg-green-100 text-green-700 font-extrabold text-xs shrink-0 mt-0.5">
                      {item.num}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 flex items-center justify-center shrink-0">
                        <i className={`${item.icon} text-gray-400 text-sm`}></i>
                      </div>
                      <span className="text-gray-600 text-sm leading-snug">
                        {language === 'en' ? item.en : item.es}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
              <a
                href="/account"
                className="inline-flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white text-sm font-bold px-6 py-3 rounded-full transition-all cursor-pointer whitespace-nowrap w-fit"
              >
                <i className="ri-user-add-line"></i>
                {language === 'en' ? 'Get Your Referral Link' : 'Obtén Tu Enlace de Referido'}
              </a>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 text-center">
          <p className="text-gray-400 text-sm mb-4">
            {language === 'en'
              ? 'Already a member? Sign in to check your points balance and tier status.'
              : '¿Ya eres miembro? Inicia sesión para ver tu saldo de puntos y nivel.'}
          </p>
          <a
            href="/account"
            className="inline-flex items-center gap-2 text-green-700 hover:text-green-800 font-bold text-sm border border-green-200 hover:border-green-400 px-5 py-2.5 rounded-full transition-all cursor-pointer whitespace-nowrap"
          >
            <i className="ri-login-box-line"></i>
            {language === 'en' ? 'Sign In to My Account' : 'Iniciar Sesión en Mi Cuenta'}
          </a>
        </div>

      </div>
    </section>
  );
}
