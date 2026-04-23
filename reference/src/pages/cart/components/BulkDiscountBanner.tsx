import { Link } from 'react-router-dom';

interface BulkDiscountBannerProps {
  totalItems: number;
  bulkDiscount: number;
  language: string;
}

const TIERS = [
  { minItems: 3, discount: 0.05, label: '5%' },
  { minItems: 5, discount: 0.10, label: '10%' },
];

export const getBulkDiscount = (totalItems: number): number => {
  if (totalItems >= 5) return 0.10;
  if (totalItems >= 3) return 0.05;
  return 0;
};

export default function BulkDiscountBanner({ totalItems, bulkDiscount, language }: BulkDiscountBannerProps) {
  const activeTier = TIERS.slice().reverse().find((t) => totalItems >= t.minItems);
  const nextTier = TIERS.find((t) => totalItems < t.minItems);
  const itemsToNextTier = nextTier ? nextTier.minItems - totalItems : 0;

  // Progress bar: 0→3 items = first tier, 3→5 items = second tier
  const progressMax = 5;
  const progressPct = Math.min((totalItems / progressMax) * 100, 100);

  if (totalItems === 0) return null;

  return (
    <div className={`rounded-xl border p-4 mb-4 ${
      bulkDiscount > 0
        ? 'bg-green-50 border-green-200'
        : 'bg-gray-50 border-gray-200'
    }`}>
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 flex items-center justify-center rounded-lg ${
            bulkDiscount > 0 ? 'bg-green-700 text-white' : 'bg-gray-300 text-white'
          }`}>
            <i className="ri-stack-line text-sm"></i>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">
              {language === 'es' ? 'Descuentos por Cantidad' : 'Bulk Discount'}
            </p>
            <p className="text-xs text-gray-500">
              {bulkDiscount > 0
                ? (language === 'es' ? `¡${(bulkDiscount * 100).toFixed(0)}% de descuento aplicado!` : `${(bulkDiscount * 100).toFixed(0)}% off applied!`)
                : (language === 'es' ? 'Agrega más artículos para ahorrar' : 'Add more items to save')}
            </p>
          </div>
        </div>
        {bulkDiscount > 0 && (
          <span className="text-xs font-bold bg-green-700 text-white px-2.5 py-1 rounded-full whitespace-nowrap">
            -{(bulkDiscount * 100).toFixed(0)}% {language === 'es' ? 'ACTIVO' : 'ACTIVE'}
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="relative h-2.5 bg-gray-200 rounded-full overflow-visible">
          <div
            className="h-full bg-green-600 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          ></div>
          {/* Tier markers */}
          {TIERS.map((tier) => {
            const pos = (tier.minItems / progressMax) * 100;
            const reached = totalItems >= tier.minItems;
            return (
              <div
                key={tier.minItems}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                style={{ left: `${pos}%` }}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  reached
                    ? 'bg-green-700 border-green-700'
                    : 'bg-white border-gray-300'
                }`}>
                  {reached && <i className="ri-check-line text-white text-[8px]"></i>}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-xs text-gray-400">{language === 'es' ? '1 artículo' : '1 item'}</span>
          {TIERS.map((tier) => (
            <span
              key={tier.minItems}
              className={`text-xs font-semibold ${totalItems >= tier.minItems ? 'text-green-700' : 'text-gray-400'}`}
            >
              {tier.minItems}+ = {tier.label}
            </span>
          ))}
        </div>
      </div>

      {/* Current status */}
      <div className="flex items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-4 flex-wrap">
          {TIERS.map((tier) => (
            <div key={tier.minItems} className={`flex items-center gap-1.5 ${
              totalItems >= tier.minItems ? 'text-green-700' : 'text-gray-400'
            }`}>
              <div className="w-4 h-4 flex items-center justify-center">
                <i className={`${totalItems >= tier.minItems ? 'ri-checkbox-circle-fill' : 'ri-checkbox-blank-circle-line'} text-sm`}></i>
              </div>
              <span className="text-xs font-semibold whitespace-nowrap">
                {tier.minItems}+ {language === 'es' ? 'artículos' : 'items'} = {tier.label} {language === 'es' ? 'desc.' : 'off'}
              </span>
            </div>
          ))}
        </div>
        {nextTier && (
          <Link
            to="/products"
            className="text-xs font-bold text-green-700 hover:text-green-800 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 shrink-0"
          >
            <i className="ri-add-circle-line"></i>
            {language === 'es'
              ? `+${itemsToNextTier} para ${nextTier.label} desc.`
              : `+${itemsToNextTier} more for ${nextTier.label} off`}
          </Link>
        )}
      </div>
    </div>
  );
}
