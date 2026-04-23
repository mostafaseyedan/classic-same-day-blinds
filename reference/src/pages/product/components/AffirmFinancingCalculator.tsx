import { useState } from 'react';

interface AffirmFinancingCalculatorProps {
  price: number;
  language: string;
}

const PLANS = [
  { months: 3,  aprLabel: '0% APR',  apr: 0 },
  { months: 6,  aprLabel: '0% APR',  apr: 0 },
  { months: 12, aprLabel: '10–30% APR', apr: 0.15 },
];

function calcMonthly(price: number, months: number, apr: number): number {
  if (apr === 0) return price / months;
  const monthlyRate = apr / 12;
  return (price * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);
}

export default function AffirmFinancingCalculator({ price, language }: AffirmFinancingCalculatorProps) {
  const [selectedMonths, setSelectedMonths] = useState(12);
  const [expanded, setExpanded] = useState(false);

  const selectedPlan = PLANS.find((p) => p.months === selectedMonths) ?? PLANS[2];
  const monthly = calcMonthly(price, selectedPlan.months, selectedPlan.apr);
  const totalPaid = monthly * selectedPlan.months;
  const totalInterest = totalPaid - price;

  const isEs = language === 'es';

  return (
    <div className="rounded-xl border border-[#0FA0EA]/30 bg-gradient-to-br from-[#f0f9ff] to-[#e8f5fe] overflow-hidden">
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 cursor-pointer group"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 flex items-center justify-center bg-[#0FA0EA] rounded-lg shrink-0">
            <i className="ri-calculator-line text-white text-base"></i>
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-gray-900 leading-tight">
              {isEs ? 'Calculadora de Financiamiento' : 'Financing Calculator'}
            </p>
            <p className="text-xs text-[#0FA0EA] font-semibold">
              {isEs ? `Desde $${(price / 12).toFixed(2)}/mes con` : `As low as $${(price / 12).toFixed(2)}/mo with`}{' '}
              <span className="font-black tracking-tight">affirm</span>
            </p>
          </div>
        </div>
        <div className={`w-7 h-7 flex items-center justify-center text-[#0FA0EA] transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
          <i className="ri-arrow-down-s-line text-xl"></i>
        </div>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-[#0FA0EA]/20">
          {/* Plan toggle */}
          <div className="mt-3 mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {isEs ? 'Elige tu plan de pago' : 'Choose your payment plan'}
            </p>
            <div className="flex gap-2">
              {PLANS.map((plan) => (
                <button
                  key={plan.months}
                  onClick={() => setSelectedMonths(plan.months)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold border-2 transition-all cursor-pointer whitespace-nowrap ${
                    selectedMonths === plan.months
                      ? 'border-[#0FA0EA] bg-[#0FA0EA] text-white'
                      : 'border-[#0FA0EA]/30 bg-white text-gray-700 hover:border-[#0FA0EA]/60'
                  }`}
                >
                  {plan.months} {isEs ? 'meses' : 'mo'}
                </button>
              ))}
            </div>
          </div>

          {/* Monthly amount — big display */}
          <div className="bg-white rounded-xl p-4 mb-3 text-center border border-[#0FA0EA]/20">
            <p className="text-xs text-gray-500 mb-1">
              {isEs ? 'Pago mensual estimado' : 'Estimated monthly payment'}
            </p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-black text-gray-900">${monthly.toFixed(2)}</span>
              <span className="text-base text-gray-500 font-semibold">/{isEs ? 'mes' : 'mo'}</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 mt-1.5">
              <span className="text-xs text-gray-500">
                {isEs ? 'por' : 'for'} {selectedPlan.months} {isEs ? 'meses' : 'months'}
              </span>
              <span className="text-xs text-gray-300">·</span>
              <span className={`text-xs font-bold ${selectedPlan.apr === 0 ? 'text-green-600' : 'text-amber-600'}`}>
                {selectedPlan.aprLabel}
              </span>
            </div>
          </div>

          {/* Breakdown row */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-white rounded-lg p-2.5 text-center border border-gray-100">
              <p className="text-xs text-gray-400 mb-0.5">{isEs ? 'Precio' : 'Price'}</p>
              <p className="text-sm font-bold text-gray-900">${price.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-lg p-2.5 text-center border border-gray-100">
              <p className="text-xs text-gray-400 mb-0.5">{isEs ? 'Interés' : 'Interest'}</p>
              <p className={`text-sm font-bold ${totalInterest <= 0 ? 'text-green-600' : 'text-amber-600'}`}>
                {totalInterest <= 0 ? (isEs ? '$0 — ¡Gratis!' : '$0 — Free!') : `+$${totalInterest.toFixed(2)}`}
              </p>
            </div>
            <div className="bg-white rounded-lg p-2.5 text-center border border-gray-100">
              <p className="text-xs text-gray-400 mb-0.5">{isEs ? 'Total' : 'Total'}</p>
              <p className="text-sm font-bold text-gray-900">${totalPaid.toFixed(2)}</p>
            </div>
          </div>

          {/* 0% APR callout for 3 & 6 month */}
          {selectedPlan.apr === 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200 mb-3">
              <div className="w-4 h-4 flex items-center justify-center text-green-600 shrink-0">
                <i className="ri-checkbox-circle-fill text-sm"></i>
              </div>
              <p className="text-xs font-semibold text-green-700">
                {isEs
                  ? `¡Sin intereses! Paga $${monthly.toFixed(2)}/mes y no pagas nada extra.`
                  : `No interest! Pay $${monthly.toFixed(2)}/mo and you pay nothing extra.`}
              </p>
            </div>
          )}

          {/* CTA */}
          <a
            href="https://www.affirm.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-[#0FA0EA] hover:bg-[#0d8fd0] text-white font-bold text-sm transition-colors cursor-pointer whitespace-nowrap"
          >
            <span>{isEs ? 'Aplicar con' : 'Apply with'}</span>
            <span className="font-black tracking-tight text-base">affirm</span>
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-external-link-line text-sm"></i>
            </div>
          </a>

          {/* Fine print */}
          <p className="text-center text-xs text-gray-400 mt-2 leading-relaxed">
            {isEs
              ? 'Sujeto a aprobación de crédito. Las tasas reales pueden variar. Solo para residentes de EE.UU.'
              : 'Subject to credit approval. Actual rates may vary. US residents only.'}
          </p>
        </div>
      )}
    </div>
  );
}
