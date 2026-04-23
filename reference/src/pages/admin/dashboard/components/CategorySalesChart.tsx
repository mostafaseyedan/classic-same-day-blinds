import { useState } from 'react';

interface CategoryEntry {
  id: string;
  label: string;
  units: number;
  revenue: number;
  color: string;
  dotColor: string;
}

const CATEGORY_DATA: CategoryEntry[] = [
  { id: 'cellular', label: 'Cellular Shades', units: 5200, revenue: 114400, color: 'bg-teal-500', dotColor: '#14b8a6' },
  { id: 'roller', label: 'Roller Shades', units: 2789, revenue: 55780, color: 'bg-emerald-500', dotColor: '#10b981' },
  { id: 'faux-wood', label: 'Faux Wood Blinds', units: 2341, revenue: 42138, color: 'bg-slate-500', dotColor: '#64748b' },
  { id: 'roman', label: 'Roman Shades', units: 1850, revenue: 46250, color: 'bg-amber-400', dotColor: '#fbbf24' },
  { id: 'bamboo', label: 'Bamboo / Woven', units: 1423, revenue: 28460, color: 'bg-lime-500', dotColor: '#84cc16' },
  { id: 'motorized', label: 'Motorized / Smart', units: 654, revenue: 39240, color: 'bg-orange-400', dotColor: '#fb923c' },
  { id: 'vertical', label: 'Vertical Blinds', units: 1120, revenue: 16800, color: 'bg-rose-400', dotColor: '#fb7185' },
  { id: 'aluminum', label: 'Aluminum Blinds', units: 870, revenue: 11310, color: 'bg-violet-400', dotColor: '#a78bfa' },
];

type Metric = 'units' | 'revenue';

function fmt(n: number, metric: Metric) {
  if (metric === 'revenue') {
    return n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n}`;
  }
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

export default function CategorySalesChart() {
  const [metric, setMetric] = useState<Metric>('units');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const sorted = [...CATEGORY_DATA].sort((a, b) => b[metric] - a[metric]);
  const maxVal = sorted[0][metric];

  const totalUnits = CATEGORY_DATA.reduce((s, c) => s + c.units, 0);
  const totalRevenue = CATEGORY_DATA.reduce((s, c) => s + c.revenue, 0);
  const topCatUnits = sorted[0];
  const topCatRevenue = [...CATEGORY_DATA].sort((a, b) => b.revenue - a.revenue)[0];
  const highValue = [...CATEGORY_DATA].sort((a, b) => b.revenue / b.units - a.revenue / a.units)[0];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">Sales by Category</h3>
          <p className="text-xs text-slate-400 mt-0.5">Units sold &amp; revenue breakdown by product type</p>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setMetric('units')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${metric === 'units' ? 'bg-white text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <i className="ri-stack-line mr-1"></i>Units Sold
          </button>
          <button
            onClick={() => setMetric('revenue')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${metric === 'revenue' ? 'bg-white text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <i className="ri-money-dollar-circle-line mr-1"></i>Revenue
          </button>
        </div>
      </div>

      {/* Summary pills */}
      <div className="flex flex-wrap gap-3 mb-6">
        {[
          { label: 'Top Volume', value: topCatUnits.label, sub: `${topCatUnits.units.toLocaleString()} units`, icon: 'ri-fire-line', color: 'text-teal-700', bg: 'bg-teal-50' },
          { label: 'Top Revenue', value: topCatRevenue.label, sub: `$${topCatRevenue.revenue.toLocaleString()}`, icon: 'ri-money-dollar-circle-line', color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'Highest Rev/Unit', value: highValue.label, sub: `$${(highValue.revenue / highValue.units).toFixed(2)} / unit`, icon: 'ri-gem-line', color: 'text-amber-700', bg: 'bg-amber-50' },
          { label: 'Total Units Sold', value: totalUnits.toLocaleString(), sub: `${CATEGORY_DATA.length} categories`, icon: 'ri-stack-line', color: 'text-slate-700', bg: 'bg-slate-50' },
        ].map((pill) => (
          <div key={pill.label} className={`flex-1 min-w-[160px] ${pill.bg} rounded-xl px-4 py-3`}>
            <div className={`flex items-center gap-1.5 mb-0.5 ${pill.color}`}>
              <div className="w-4 h-4 flex items-center justify-center">
                <i className={`${pill.icon} text-sm`}></i>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wide">{pill.label}</span>
            </div>
            <p className={`text-sm font-bold ${pill.color} truncate`}>{pill.value}</p>
            <p className={`text-[11px] ${pill.color} opacity-70 mt-0.5`}>{pill.sub}</p>
          </div>
        ))}
      </div>

      {/* Horizontal bar chart */}
      <div className="space-y-3">
        {sorted.map((cat) => {
          const val = cat[metric];
          const pct = (val / maxVal) * 100;
          const revPerUnit = cat.revenue / cat.units;
          const isHov = hoveredId === cat.id;
          const totalShare = metric === 'units'
            ? ((cat.units / totalUnits) * 100).toFixed(1)
            : ((cat.revenue / totalRevenue) * 100).toFixed(1);

          return (
            <div
              key={cat.id}
              className={`rounded-xl p-3 transition-colors cursor-default ${isHov ? 'bg-slate-50' : ''}`}
              onMouseEnter={() => setHoveredId(cat.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: cat.dotColor }}
                ></div>
                <span className="text-sm font-semibold text-slate-800 flex-1 min-w-0 truncate">
                  {cat.label}
                </span>
                <span className="text-sm font-bold text-slate-900 shrink-0">
                  {fmt(val, metric)}
                </span>
                <span className="text-xs text-slate-400 shrink-0 w-12 text-right">
                  {totalShare}%
                </span>
              </div>

              {/* Bar */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${cat.color}`}
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>
              </div>

              {/* Hover detail row */}
              {isHov && (
                <div className="flex items-center gap-4 mt-2 pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1 text-[11px] text-teal-600 font-semibold">
                    <i className="ri-stack-line text-xs"></i>
                    {cat.units.toLocaleString()} units
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                    <i className="ri-money-dollar-circle-line text-xs"></i>
                    ${cat.revenue.toLocaleString()} revenue
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-amber-600 font-semibold ml-auto">
                    <i className="ri-gem-line text-xs"></i>
                    ${revPerUnit.toFixed(2)} / unit
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer totals */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>
          <strong className="text-slate-800">{totalUnits.toLocaleString()}</strong> total units ·{' '}
          <strong className="text-slate-800">${totalRevenue.toLocaleString()}</strong> total revenue
        </span>
        <span className="flex items-center gap-1 text-[11px] text-slate-400">
          <i className="ri-information-line"></i>
          Hover a row for full breakdown
        </span>
      </div>
    </div>
  );
}
