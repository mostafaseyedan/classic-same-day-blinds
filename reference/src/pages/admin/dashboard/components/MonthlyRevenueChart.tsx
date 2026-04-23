import { useState, useMemo, useEffect, useRef } from 'react';

// ── Seed orders (mirrors admin orders page seed) ───────────────────────────
const SEED_ORDERS = [
  { id: 'ORD-10001', date: new Date(Date.now() - 1 * 86400000).toISOString(), total: 454272, status: 'Delivered' },
  { id: 'ORD-10002', date: new Date(Date.now() - 3 * 86400000).toISOString(), total: 397656, status: 'Delivered' },
  { id: 'ORD-10003', date: new Date(Date.now() - 5 * 86400000).toISOString(), total: 354975, status: 'Fulfilled & Shipped' },
  { id: 'ORD-10004', date: new Date(Date.now() - 10 * 86400000).toISOString(), total: 298089, status: 'Pending' },
  { id: 'ORD-10005', date: new Date(Date.now() - 12 * 86400000).toISOString(), total: 198758, status: 'Delivered' },
  { id: 'ORD-10006', date: new Date(Date.now() - 20 * 86400000).toISOString(), total: 283920, status: 'Delivered' },
  { id: 'ORD-10007', date: new Date(Date.now() - 35 * 86400000).toISOString(), total: 170352, status: 'Delivered' },
  { id: 'ORD-10008', date: new Date(Date.now() - 15 * 86400000).toISOString(), total: 340776, status: 'Fulfilled & Shipped' },
];

// ── Historical monthly baseline (USD) for realistic gaps ──────────────────
// Index 0 = 11 months ago, index 11 = current month (filled from real data)
const MONTHLY_BASELINE = [
  412000, 389000, 445000, 502000, 478000, 531000,
  488000, 560000, 612000, 575000, 643000, 0,
];

interface MonthlyData {
  key: string;
  label: string;
  year: number;
  revenue: number;
  orders: number;
  isCurrent: boolean;
  isPast: boolean;
}

type ViewMode = 'revenue' | 'orders';

function buildMonthlyData(): MonthlyData[] {
  // Load all orders (localStorage + seed, deduplicated)
  let allOrders: Array<{ id: string; date: string; total: number; status: string }> = [];
  try {
    const stored: any[] = JSON.parse(localStorage.getItem('orders') ?? '[]');
    const storedNorm = stored.map((o) => ({
      id: o.id,
      date: o.date,
      total: o.total ?? 0,
      status: o.status ?? '',
    }));
    const storedIds = new Set(storedNorm.map((o) => o.id));
    const filteredSeed = SEED_ORDERS.filter((o) => !storedIds.has(o.id));
    allOrders = [...storedNorm, ...filteredSeed];
  } catch {
    allOrders = [...SEED_ORDERS];
  }

  // Build revenue map keyed by "YYYY-MM"
  const revenueMap: Record<string, { revenue: number; orders: number }> = {};
  for (const o of allOrders) {
    try {
      const d = new Date(o.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!revenueMap[key]) revenueMap[key] = { revenue: 0, orders: 0 };
      revenueMap[key].revenue += o.total;
      revenueMap[key].orders += 1;
    } catch {
      // skip
    }
  }

  const now = new Date();
  const months: MonthlyData[] = [];

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const isCurrent = i === 0;
    const label = d.toLocaleDateString('en-US', { month: 'short' });
    const fromMap = revenueMap[key];

    // Use real data if available, otherwise fall back to baseline
    const baselineIdx = 11 - i;
    const revenue = fromMap ? fromMap.revenue : MONTHLY_BASELINE[baselineIdx] ?? 0;
    const orders = fromMap ? fromMap.orders : Math.round(revenue / 45000);

    months.push({
      key,
      label,
      year: d.getFullYear(),
      revenue,
      orders,
      isCurrent,
      isPast: !isCurrent,
    });
  }

  return months;
}

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${n.toFixed(0)}`;
}

function formatFull(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

export default function MonthlyRevenueChart() {
  const [mode, setMode] = useState<ViewMode>('revenue');
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [animated, setAnimated] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const data = useMemo(() => buildMonthlyData(), []);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 80);
    return () => clearTimeout(timer);
  }, []);

  const values = data.map((d) => (mode === 'revenue' ? d.revenue : d.orders));
  const maxVal = Math.max(...values, 1);

  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = data.reduce((s, d) => s + d.orders, 0);

  // MoM change: current vs previous month
  const currentMonth = data[data.length - 1];
  const prevMonth = data[data.length - 2];
  const currentVal = mode === 'revenue' ? currentMonth.revenue : currentMonth.orders;
  const prevVal = mode === 'revenue' ? prevMonth.revenue : prevMonth.orders;
  const momPct = prevVal > 0 ? ((currentVal - prevVal) / prevVal) * 100 : 0;
  const momUp = momPct >= 0;

  // YTD = sum of current year
  const currentYear = new Date().getFullYear();
  const ytdRevenue = data.filter((d) => d.year === currentYear).reduce((s, d) => s + d.revenue, 0);

  // Best month
  const bestMonth = [...data].sort((a, b) => b.revenue - a.revenue)[0];

  const hoveredItem = hoveredKey ? data.find((d) => d.key === hoveredKey) : null;

  // Y-axis labels (5 ticks)
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => {
    const val = maxVal * t;
    return mode === 'revenue' ? formatCurrency(val) : val === 0 ? '0' : val >= 1000 ? `${(val / 1000).toFixed(0)}k` : String(Math.round(val));
  });

  return (
    <div ref={containerRef} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Monthly Revenue Breakdown</h3>
          <p className="text-xs text-slate-400 mt-0.5">Last 12 months · orders pulled from live data</p>
        </div>

        {/* Mode toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          {(['revenue', 'orders'] as ViewMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                mode === m ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {m === 'revenue' ? 'Revenue' : 'Order Count'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-4 mb-7">
        {[
          {
            label: 'YTD Revenue',
            value: formatFull(ytdRevenue),
            icon: 'ri-calendar-line',
            color: 'text-slate-700',
            bg: 'bg-slate-50',
          },
          {
            label: 'Total 12-Month Revenue',
            value: formatFull(totalRevenue),
            icon: 'ri-money-dollar-circle-line',
            color: 'text-emerald-700',
            bg: 'bg-emerald-50',
          },
          {
            label: `${currentMonth.label} vs ${prevMonth.label}`,
            value: `${momUp ? '+' : ''}${momPct.toFixed(1)}%`,
            icon: momUp ? 'ri-arrow-up-line' : 'ri-arrow-down-line',
            color: momUp ? 'text-emerald-700' : 'text-red-600',
            bg: momUp ? 'bg-emerald-50' : 'bg-red-50',
          },
          {
            label: 'Best Month',
            value: `${bestMonth.label} ${bestMonth.year}`,
            icon: 'ri-trophy-line',
            color: 'text-amber-700',
            bg: 'bg-amber-50',
          },
        ].map((kpi) => (
          <div key={kpi.label} className={`${kpi.bg} rounded-xl px-4 py-3`}>
            <div className={`flex items-center gap-1.5 mb-1 ${kpi.color}`}>
              <div className="w-4 h-4 flex items-center justify-center">
                <i className={`${kpi.icon} text-sm`}></i>
              </div>
              <span className="text-xs font-semibold">{kpi.label}</span>
            </div>
            <p className={`text-base font-bold ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Chart area */}
      <div className="relative">
        {/* Y-axis grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8">
          {[...yTicks].reverse().map((tick, i) => (
            <div key={i} className="flex items-center gap-2 w-full">
              <span className="text-[10px] text-slate-400 w-10 text-right shrink-0">{tick}</span>
              <div className="flex-1 border-t border-dashed border-slate-100"></div>
            </div>
          ))}
        </div>

        {/* Bars */}
        <div className="flex items-end gap-1.5 h-52 pl-12 pb-8 relative">
          {data.map((d, idx) => {
            const val = mode === 'revenue' ? d.revenue : d.orders;
            const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
            const isHovered = hoveredKey === d.key;
            const isCurrent = d.isCurrent;
            const isBest = d.key === bestMonth.key && mode === 'revenue';

            return (
              <div
                key={d.key}
                className="flex-1 flex flex-col items-center gap-1 group cursor-pointer relative"
                onMouseEnter={() => setHoveredKey(d.key)}
                onMouseLeave={() => setHoveredKey(null)}
              >
                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white rounded-xl px-3 py-2.5 z-20 whitespace-nowrap shadow-2xl pointer-events-none">
                    <p className="text-xs font-bold text-white">
                      {d.label} {d.year}
                    </p>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {mode === 'revenue' ? formatFull(d.revenue) : `${d.orders} orders`}
                    </p>
                    {mode === 'revenue' && (
                      <p className="text-[11px] text-slate-400 mt-0.5">{d.orders} orders</p>
                    )}
                    {/* Tooltip arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-900"></div>
                  </div>
                )}

                {/* Bar */}
                <div className="w-full relative flex items-end" style={{ height: '144px' }}>
                  <div
                    className={`w-full rounded-t-md transition-all duration-500 ease-out ${
                      isCurrent
                        ? 'bg-slate-900'
                        : isBest && !isHovered
                        ? 'bg-amber-400'
                        : isHovered
                        ? 'bg-slate-700'
                        : 'bg-slate-200'
                    }`}
                    style={{
                      height: animated ? `${Math.max(pct, 2)}%` : '2%',
                      transitionDelay: `${idx * 40}ms`,
                    }}
                  ></div>
                </div>

                {/* Month label */}
                <span
                  className={`text-[10px] font-medium leading-none ${
                    isCurrent ? 'text-slate-900 font-bold' : 'text-slate-400'
                  }`}
                >
                  {d.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Hover overlay value */}
        {hoveredItem && (
          <div className="mt-3 pl-12 flex items-center gap-2">
            <span className="text-xs text-slate-500">
              {hoveredItem.label} {hoveredItem.year}:
            </span>
            <span className="text-sm font-bold text-slate-900">
              {mode === 'revenue' ? formatFull(hoveredItem.revenue) : `${hoveredItem.orders} orders`}
            </span>
            {mode === 'revenue' && (
              <span className="text-xs text-slate-400">· {hoveredItem.orders} orders</span>
            )}
          </div>
        )}
      </div>

      {/* Footer legend */}
      <div className="flex items-center gap-5 mt-4 pl-12 flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-slate-900"></div>
          <span className="text-[11px] text-slate-500 font-medium">Current month</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-amber-400"></div>
          <span className="text-[11px] text-slate-500 font-medium">Best month</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-slate-200"></div>
          <span className="text-[11px] text-slate-500 font-medium">Past months</span>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-xs text-slate-400">
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-information-line text-sm"></i>
          </div>
          Total {totalOrders} orders · hover bars for detail
        </div>
      </div>
    </div>
  );
}
