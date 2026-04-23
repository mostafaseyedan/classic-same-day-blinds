import { useState } from 'react';
import type { CompetitorProduct } from '../../../../mocks/competitorPricing';

interface Props {
  product: CompetitorProduct;
  competitorName: string;
}

export default function SizeBreakdownTable({ product, competitorName }: Props) {
  const allWidths = Array.from(new Set(product.sizes.map(s => s.width))).sort(
    (a, b) => parseInt(a) - parseInt(b)
  );
  const allHeights = Array.from(new Set(product.sizes.map(s => s.height))).sort(
    (a, b) => parseInt(a) - parseInt(b)
  );

  const [activeWidth, setActiveWidth] = useState<string | null>(null);
  const [activeHeight, setActiveHeight] = useState<string | null>(null);

  const filteredSizes = product.sizes.filter(s => {
    const widthMatch = activeWidth ? s.width === activeWidth : true;
    const heightMatch = activeHeight ? s.height === activeHeight : true;
    return widthMatch && heightMatch;
  });

  const totalSizes = product.sizes.length;
  const cheapestSize = product.sizes.reduce((a, b) => a.competitorPrice < b.competitorPrice ? a : b);
  const pricestSize = product.sizes.reduce((a, b) => a.competitorPrice > b.competitorPrice ? a : b);

  const isFiltered = activeWidth !== null || activeHeight !== null;

  return (
    <div className="space-y-4">
      {/* Quick stats bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-50 rounded-xl px-4 py-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Sizes Available</p>
          <p className="text-2xl font-black text-slate-900">{totalSizes}</p>
          <p className="text-xs text-slate-500 mt-0.5">Standard dimensions</p>
        </div>
        <div className="bg-emerald-50 rounded-xl px-4 py-3">
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Starting From</p>
          <p className="text-2xl font-black text-emerald-700">${cheapestSize.ourPrice.toFixed(2)}</p>
          <p className="text-xs text-emerald-600 mt-0.5">Our price · {cheapestSize.label}</p>
        </div>
        <div className="bg-red-50 rounded-xl px-4 py-3">
          <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-1">Largest Size Up To</p>
          <p className="text-2xl font-black text-red-700">${pricestSize.competitorPrice.toFixed(2)}</p>
          <p className="text-xs text-red-500 mt-0.5">{competitorName} · {pricestSize.label}</p>
        </div>
      </div>

      {/* Filters row */}
      <div className="space-y-3">
        {/* Width filter */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Filter by Width</p>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setActiveWidth(null)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full cursor-pointer whitespace-nowrap transition-colors ${
                activeWidth === null
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              All widths
            </button>
            {allWidths.map(w => {
              const count = product.sizes.filter(s => s.width === w && (activeHeight ? s.height === activeHeight : true)).length;
              return (
                <button
                  key={w}
                  onClick={() => setActiveWidth(activeWidth === w ? null : w)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full cursor-pointer whitespace-nowrap transition-colors ${
                    activeWidth === w
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {w} <span className="opacity-60">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Height filter */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Filter by Height</p>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setActiveHeight(null)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full cursor-pointer whitespace-nowrap transition-colors ${
                activeHeight === null
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              All heights
            </button>
            {allHeights.map(h => {
              const count = product.sizes.filter(s => s.height === h && (activeWidth ? s.width === activeWidth : true)).length;
              return (
                <button
                  key={h}
                  onClick={() => setActiveHeight(activeHeight === h ? null : h)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full cursor-pointer whitespace-nowrap transition-colors ${
                    activeHeight === h
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {h} <span className="opacity-60">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active filter summary + clear */}
        {isFiltered && (
          <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
            <p className="text-xs text-slate-600">
              Showing <span className="font-bold text-slate-900">{filteredSizes.length}</span> of {totalSizes} sizes
              {activeWidth && <span> · width <span className="font-semibold text-slate-800">{activeWidth}</span></span>}
              {activeHeight && <span> · height <span className="font-semibold text-slate-800">{activeHeight}</span></span>}
            </p>
            <button
              onClick={() => { setActiveWidth(null); setActiveHeight(null); }}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer transition-colors flex items-center gap-1 whitespace-nowrap"
            >
              <i className="ri-close-line"></i>
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Size table — scrollable */}
      <div className="rounded-xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="max-h-[420px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="bg-slate-50">
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Size (W × H)
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Width
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Height
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {competitorName} Price
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Our Price
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    You Save
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredSizes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">
                      No sizes match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredSizes.map((size, idx) => {
                    const savings = size.competitorPrice - size.ourPrice;
                    const savePct = ((savings / size.competitorPrice) * 100).toFixed(0);
                    const isBase = size.competitorPrice === product.currentCompetitorPrice;

                    return (
                      <tr
                        key={idx}
                        className={`transition-colors hover:bg-slate-50/80 ${isBase ? 'bg-emerald-50/40' : ''}`}
                      >
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{size.label}</span>
                            {isBase && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                                Base size
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <span className={`inline-flex items-center justify-center text-xs font-semibold px-2.5 py-1 rounded-full w-16 ${
                            activeWidth === size.width ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {size.width}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <span className={`inline-flex items-center justify-center text-xs font-semibold px-2.5 py-1 rounded-full w-16 ${
                            activeHeight === size.height ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {size.height}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <span className="font-semibold text-red-600">${size.competitorPrice.toFixed(2)}</span>
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <span className="font-bold text-emerald-600">${size.ourPrice.toFixed(2)}</span>
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
                            <i className="ri-arrow-down-line text-xs"></i>
                            ${savings.toFixed(2)} ({savePct}%)
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-400 flex items-center gap-1.5">
        <i className="ri-information-line text-slate-300"></i>
        All sizes listed are standard catalog dimensions from {competitorName}. Our price is always 15% below their current pricing for each size.
      </p>
    </div>
  );
}
