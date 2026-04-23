import { useState } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';

type Status = 'yes' | 'no' | 'partial';

interface ComparisonRow {
  feature: string;
  wbb: Status;
  blindsCom: Status;
  lowes: Status;
}

const rowsEn: ComparisonRow[] = [
  { feature: 'Hospitality-Grade Quality',               wbb: 'yes', blindsCom: 'no',      lowes: 'partial' },
  { feature: 'Same Day – 4 Day Shipping',               wbb: 'yes', blindsCom: 'no',      lowes: 'no'      },
  { feature: 'No Minimum Order',                        wbb: 'yes', blindsCom: 'yes',     lowes: 'yes'     },
  { feature: 'Bulk Discount Tiers',                     wbb: 'yes', blindsCom: 'partial', lowes: 'no'      },
  { feature: 'Custom Sizing Available',                 wbb: 'yes', blindsCom: 'yes',     lowes: 'partial' },
  { feature: 'Dedicated Account Manager',               wbb: 'yes', blindsCom: 'no',      lowes: 'no'      },
  { feature: 'Free Physical Samples',                   wbb: 'yes', blindsCom: 'yes',     lowes: 'no'      },
  { feature: 'On-Site Consultation',                    wbb: 'yes', blindsCom: 'no',      lowes: 'partial' },
  { feature: 'Bulk Order Fulfillment',                  wbb: 'yes', blindsCom: 'partial', lowes: 'no'      },
  { feature: 'Hospitality Project Support',             wbb: 'yes', blindsCom: 'no',      lowes: 'no'      },
  { feature: 'Rewards Toward Future Discounts',         wbb: 'yes', blindsCom: 'no',      lowes: 'no'      },
  { feature: 'Referral Discounts',                      wbb: 'yes', blindsCom: 'no',      lowes: 'no'      },
  { feature: 'Match or Beat Competitor Pricing',        wbb: 'yes', blindsCom: 'no',      lowes: 'no'      },
];

const rowsEs: ComparisonRow[] = [
  { feature: 'Calidad Grado Hotelero',                  wbb: 'yes', blindsCom: 'no',      lowes: 'partial' },
  { feature: 'Envío Mismo Día – 4 Días',                wbb: 'yes', blindsCom: 'no',      lowes: 'no'      },
  { feature: 'Sin Pedido Mínimo',                       wbb: 'yes', blindsCom: 'yes',     lowes: 'yes'     },
  { feature: 'Descuentos por Volumen',                  wbb: 'yes', blindsCom: 'partial', lowes: 'no'      },
  { feature: 'Medidas Personalizadas',                  wbb: 'yes', blindsCom: 'yes',     lowes: 'partial' },
  { feature: 'Gerente de Cuenta Dedicado',              wbb: 'yes', blindsCom: 'no',      lowes: 'no'      },
  { feature: 'Muestras Físicas Gratis',                 wbb: 'yes', blindsCom: 'yes',     lowes: 'no'      },
  { feature: 'Consulta en el Lugar',                    wbb: 'yes', blindsCom: 'no',      lowes: 'partial' },
  { feature: 'Cumplimiento de Pedidos Bulk',            wbb: 'yes', blindsCom: 'partial', lowes: 'no'      },
  { feature: 'Soporte para Proyectos Hoteleros',        wbb: 'yes', blindsCom: 'no',      lowes: 'no'      },
  { feature: 'Recompensas para Descuentos Futuros',     wbb: 'yes', blindsCom: 'no',      lowes: 'no'      },
  { feature: 'Descuentos por Referidos',                wbb: 'yes', blindsCom: 'no',      lowes: 'no'      },
  { feature: 'Igualar o Superar Precio Competidor',     wbb: 'yes', blindsCom: 'no',      lowes: 'no'      },
];

function StatusIcon({ status }: { status: Status }) {
  if (status === 'yes') return (
    <div className="w-5 h-5 flex items-center justify-center mx-auto">
      <i className="ri-checkbox-circle-line text-lg text-green-500"></i>
    </div>
  );
  if (status === 'no') return (
    <div className="w-5 h-5 flex items-center justify-center mx-auto">
      <i className="ri-close-circle-line text-lg text-red-400"></i>
    </div>
  );
  return (
    <div className="w-5 h-5 flex items-center justify-center mx-auto">
      <i className="ri-indeterminate-circle-line text-lg text-gray-400"></i>
    </div>
  );
}

export default function ComparisonTable() {
  const [hovered, setHovered] = useState<number | null>(null);
  const { language } = useLanguage();

  const rows = language === 'en' ? rowsEn : rowsEs;

  return (
    <section id="compare" className="py-12 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <p className="text-amber-600 text-xs font-bold uppercase tracking-widest mb-1.5">
            {language === 'en' ? 'Why Us' : 'Por Qué Nosotros'}
          </p>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
            {language === 'en' ? 'How We Compare' : 'Cómo Nos Comparamos'}
          </h2>
          <p className="text-slate-500 max-w-lg mx-auto text-sm">
            {language === 'en'
              ? 'See why hospitality professionals choose Classic Same Day Blinds over the competition.'
              : 'Descubre por qué los profesionales de la hospitalidad eligen Classic Same Day Blinds sobre la competencia.'}
          </p>
        </div>

        <div className="rounded-xl overflow-hidden border border-slate-200">
          <div className="grid grid-cols-4 bg-slate-900 text-white">
            <div className="px-4 py-3 text-xs font-semibold text-slate-300">
              {language === 'en' ? 'Feature' : 'Característica'}
            </div>
            <div className="px-3 py-3 text-center">
              <span className="text-xs font-bold text-amber-400">Classic Same Day</span>
            </div>
            <div className="px-3 py-3 text-center">
              <span className="text-xs font-semibold text-slate-300">Blinds.com</span>
            </div>
            <div className="px-3 py-3 text-center">
              <span className="text-xs font-semibold text-slate-300">Lowe's</span>
            </div>
          </div>

          {rows.map((row, i) => (
            <div
              key={row.feature}
              className={`grid grid-cols-4 border-t border-slate-100 transition-colors duration-150 cursor-default ${
                hovered === i ? 'bg-green-50' : i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
              }`}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="px-4 py-2.5 text-xs font-medium text-slate-700 flex items-center">{row.feature}</div>
              <div className="px-3 py-2.5 flex items-center justify-center">
                <StatusIcon status={row.wbb} />
              </div>
              <div className="px-3 py-2.5 flex items-center justify-center">
                <StatusIcon status={row.blindsCom} />
              </div>
              <div className="px-3 py-2.5 flex items-center justify-center">
                <StatusIcon status={row.lowes} />
              </div>
            </div>
          ))}

          <div className="grid grid-cols-4 border-t border-slate-200 bg-slate-50 px-4 py-2.5">
            <div className="col-span-4 flex items-center gap-5">
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-checkbox-circle-line text-base text-green-500"></i>
                </div>
                <span className="text-xs text-slate-500">{language === 'en' ? 'Yes' : 'Sí'}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-close-circle-line text-base text-red-400"></i>
                </div>
                <span className="text-xs text-slate-500">No</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-indeterminate-circle-line text-base text-gray-400"></i>
                </div>
                <span className="text-xs text-slate-500">{language === 'en' ? 'Partial' : 'Parcial'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-7 text-center">
          <p className="text-slate-500 text-sm mb-3">
            {language === 'en'
              ? 'Ready to experience the Classic Same Day Blinds difference?'
              : '¿Listo para experimentar la diferencia de Classic Same Day Blinds?'}
          </p>
          <button
            onClick={() => {
              const el = document.getElementById('products');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-white font-semibold text-sm transition-all hover:opacity-90 whitespace-nowrap cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #228B22, #1a6b1a)' }}
          >
            <i className="ri-shopping-bag-3-line"></i>
            {language === 'en' ? 'Shop Now' : 'Comprar Ahora'}
          </button>
        </div>
      </div>
    </section>
  );
}
