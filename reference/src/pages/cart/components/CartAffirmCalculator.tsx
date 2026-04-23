import { useState } from 'react';

interface CartAffirmCalculatorProps {
  total: number;
  language: string;
}

const PLANS = [
  { months: 3,  aprLabel: '0% APR',     apr: 0 },
  { months: 6,  aprLabel: '0% APR',     apr: 0 },
  { months: 12, aprLabel: '10–30% APR', apr: 0.15 },
];

function calcMonthly(amount: number, months: number, apr: number): number {
  if (apr === 0) return amount / months;
  const r = apr / 12;
  return (amount * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

export default function CartAffirmCalculator({ total, language }: CartAffirmCalculatorProps) {
  const [selectedMonths, setSelectedMonths] = useState(12);
  const [expanded, setExpanded] = useState(false);

  const isEs = language === 'es';
  const plan = PLANS.find((p) => p.months === selectedMonths) ?? PLANS[2];
  const monthly = calcMonthly(total, plan.months, plan.apr);
  const totalPaid = monthly * plan.months;
  const interest = totalPaid - total;

  if (total < 50) return null;

  return (
    <div className="rounded-xl border border-[#0FA0EA]/30 bg-gradient-to-br from-[#f0f9ff] to-[#e8f5fe] overflow-hidden mb-3">
      {/* Collapsed header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 cursor-pointer group"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 flex items-center justify-center bg-[#0FA0EA] rounded-lg shrink-0">
            <i className="ri-calculator-line text-white text-base"></i>
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-gray-900 leading-tight">
              {isEs ? 'Calculadora de Financiamiento' : 'Financing Calculator'}
            </p>
            <p className="text-xs text-[#0FA0EA] font-semibold">
              {isEs
                ? `Desde $${Math.ceil(total / 12)}/mes con `
                : `As low as $${Math.ceil(total / 12)}/mo with `}
              <span className="font-black tracking-tight">affirm</span>
            </p>
          </div>
        </div>
        <div className={`w-6 h-6 flex items-center justify-center text-[#0FA0EA] transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
          <i className="ri-arrow-down-s-line text-lg"></i>
        </div>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-[#0FA0EA]/20">
          {/* Plan toggle */}
          <div className="mt-3 mb-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {isEs ? 'Elige tu plan' : 'Choose your plan'}
            </p>
            <div className="flex gap-2">
              {PLANS.map((p) => (
                <button
                  key={p.months}
                  onClick={() => setSelectedMonths(p.months)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border-2 transition-all cursor-pointer whitespace-nowrap ${
                    selectedMonths === p.months
                      ? 'border-[#0FA0EA] bg-[#0FA0EA] text-white'
                      : 'border-[#0FA0EA]/30 bg-white text-gray-700 hover:border-[#0FA0EA]/60'
                  }`}
                >
                  {p.months} {isEs ? 'meses' : 'mo'}
                </button>
              ))}
            </div>
          </div>

          {/* Monthly amount */}
          <div className="bg-white rounded-xl p-3 mb-3 text-center border border-[#0FA0EA]/20">
            <p className="text-xs text-gray-500 mb-0.5">
              {isEs ? 'Pago mensual estimado' : 'Estimated monthly payment'}
            </p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-3xl font-black text-gray-900">${monthly.toFixed(2)}</span>
              <span className="text-sm text-gray-500 font-semibold">/{isEs ? 'mes' : 'mo'}</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <span className="text-xs text-gray-500">
                {isEs ? 'por' : 'for'} {plan.months} {isEs ? 'meses' : 'months'}
              </span>
              <span className="text-xs text-gray-300">·</span>
              <span className={`text-xs font-bold ${plan.apr === 0 ? 'text-green-600' : 'text-amber-600'}`}>
                {plan.aprLabel}
              </span>
            </div>
          </div>

          {/* Breakdown */}
          <div className="grid grid-cols-3 gap-1.5 mb-3">
            {[
              { label: isEs ? 'Total' : 'Cart Total', value: `$${total.toFixed(2)}`, color: 'text-gray-900' },
              { label: isEs ? 'Interés' : 'Interest', value: interest <= 0 ? (isEs ? '$0 Gratis' : '$0 Free') : `+$${interest.toFixed(2)}`, color: interest <= 0 ? 'text-green-600' : 'text-amber-600' },
              { label: isEs ? 'Pagas' : 'You Pay', value: `$${totalPaid.toFixed(2)}`, color: 'text-gray-900' },
            ].map((col) => (
              <div key={col.label} className="bg-white rounded-lg p-2 text-center border border-gray-100">
                <p className="text-xs text-gray-400 mb-0.5 leading-tight">{col.label}</p>
                <p className={`text-xs font-bold ${col.color}`}>{col.value}</p>
              </div>
            ))}
          </div>

          {/* 0% APR badge */}
          {plan.apr === 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200 mb-3">
              <div className="w-4 h-4 flex items-center justify-center text-green-600 shrink-0">
                <i className="ri-checkbox-circle-fill text-sm"></i>
              </div>
              <p className="text-xs font-semibold text-green-700">
                {isEs
                  ? `¡Sin intereses! Paga $${monthly.toFixed(2)}/mes y no pagas nada extra.`
                  : `No interest! Pay $${monthly.toFixed(2)}/mo — you pay nothing extra.`}
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
            <span className="font-black tracking-tight">affirm</span>
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-external-link-line text-sm"></i>
            </div>
          </a>

          <p className="text-center text-xs text-gray-400 mt-2 leading-relaxed">
            {isEs
              ? 'Sujeto a aprobación de crédito. Solo para residentes de EE.UU.'
              : 'Subject to credit approval. US residents only. Actual rates may vary.'}
          </p>
        </div>
      )}
    </div>
  );
}
