import { useState, useMemo, useEffect, useRef } from 'react';

const MONTHLY_BASELINE: number[] = [
  412000, 389000, 445000, 502000, 478000, 531000,
  488000, 560000, 612000, 575000, 643000, 0,
];
const AVG_UNIT_PRICE = 118;
const SEED_ORDERS = [
  { id: 'ORD-10001', date: new Date(Date.now() - 1 * 86400000).toISOString(), total: 454272 },
  { id: 'ORD-10002', date: new Date(Date.now() - 3 * 86400000).toISOString(), total: 397656 },
  { id: 'ORD-10003', date: new Date(Date.now() - 5 * 86400000).toISOString(), total: 354975 },
  { id: 'ORD-10004', date: new Date(Date.now() - 10 * 86400000).toISOString(), total: 298089 },
  { id: 'ORD-10005', date: new Date(Date.now() - 12 * 86400000).toISOString(), total: 198758 },
  { id: 'ORD-10006', date: new Date(Date.now() - 20 * 86400000).toISOString(), total: 283920 },
  { id: 'ORD-10007', date: new Date(Date.now() - 35 * 86400000).toISOString(), total: 170352 },
  { id: 'ORD-10008', date: new Date(Date.now() - 15 * 86400000).toISOString(), total: 340776 },
];

interface MonthPoint {
  label: string;
  year: number;
  revenue: number;
  units: number;
  isCurrent: boolean;
}

function buildData(): MonthPoint[] {
  const monthRevMap: Record<string, number> = {};
  try {
    const stored: Array<{ id: string; date: string; total: number }> =
      JSON.parse(localStorage.getItem('orders') ?? '[]');
    const storedIds = new Set(stored.map((o) => o.id));
    const all = [...stored, ...SEED_ORDERS.filter((o) => !storedIds.has(o.id))];
    for (const o of all) {
      const d = new Date(o.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthRevMap[key] = (monthRevMap[key] ?? 0) + (o.total ?? 0);
    }
  } catch {
    // ignore
  }
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const revenue = monthRevMap[key] ?? MONTHLY_BASELINE[i] ?? 0;
    const units = revenue > 0 ? Math.round(revenue / AVG_UNIT_PRICE) : 0;
    return {
      label: d.toLocaleDateString('en-US', { month: 'short' }),
      year: d.getFullYear(),
      revenue,
      units,
      isCurrent: i === 11,
    };
  });
}

export default function MonthlyUnitsSoldChart() {
  const [animated, setAnimated] = useState(false);
  const [showLine, setShowLine] = useState(true);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const barsRef = useRef<HTMLDivElement>(null);
  const [barsWidth, setBarsWidth] = useState(720);

  const data = useMemo(() => buildData(), []);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const update = () => {
      if (barsRef.current) setBarsWidth(barsRef.current.clientWidth);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const CHART_H = 160;
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
  const maxUnits = Math.max(...data.map((d) => d.units), 1);

  const slotW = barsWidth / data.length;
  const dots = data.map((d, i) => ({
    x: (i + 0.5) * slotW,
    y: CHART_H - (d.units / maxUnits) * (CHART_H * 0.88) - CHART_H * 0.06,
    d,
  }));
  const polyline = dots.map((p) => `${p.x},${p.y}`).join(' ');

  const totalUnits = data.reduce((s, d) => s + d.units, 0);
  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);
  const avgUnits = Math.round(totalUnits / 12);
  const peakMonth = [...data].sort((a, b) => b.units - a.units)[0];
  const revPerUnit = totalUnits > 0 ? totalRevenue / totalUnits : 0;
  const momPct =
    data[10].units > 0
      ? ((data[11].units - data[10].units) / data[10].units) * 100
      : 0;

  const kpis = [
    { label: 'Total Units (12 mo)', value: totalUnits.toLocaleString(), icon: 'ri-stack-line', color: 'text-teal-700', bg: 'bg-teal-50' },
    { label: 'Avg Units / Month', value: avgUnits.toLocaleString(), icon: 'ri-bar-chart-line', color: 'text-slate-700', bg: 'bg-slate-50' },
    { label: 'Peak Month (units)', value: `${peakMonth.label} · ${(peakMonth.units / 1000).toFixed(1)}k`, icon: 'ri-trophy-line', color: 'text-amber-700', bg: 'bg-amber-50' },
    { label: 'Avg Rev / Unit', value: `$${revPerUnit.toFixed(2)}`, icon: 'ri-money-dollar-circle-line', color: 'text-emerald-700', bg: 'bg-emerald-50' },
  ];

  const yRevTicks = [1, 0.75, 0.5, 0.25, 0].map((t) => {
    const v = maxRevenue * t;
    return v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${Math.round(v)}`;
  });
  const yUnitTicks = [1, 0.75, 0.5, 0.25, 0].map((t) => {
    const v = maxUnits * t;
    return v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(Math.round(v));
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">Units Sold vs. Revenue</h3>
          <p className="text-xs text-slate-400 mt-0.5">Monthly correlation — last 12 months</p>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setShowLine(true)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${showLine ? 'bg-white text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Revenue + Units
          </button>
          <button
            onClick={() => setShowLine(false)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${!showLine ? 'bg-white text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Revenue Only
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {kpis.map((k) => (
          <div key={k.label} className={`${k.bg} rounded-xl px-4 py-3`}>
            <div className={`flex items-center gap-1.5 mb-1 ${k.color}`}>
              <div className="w-4 h-4 flex items-center justify-center">
                <i className={`${k.icon} text-sm`}></i>
              </div>
              <span className="text-xs font-semibold">{k.label}</span>
            </div>
            <p className={`text-base font-bold ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="flex gap-2">
        {/* Left y-axis (revenue) */}
        <div className="flex flex-col justify-between shrink-0" style={{ height: `${CHART_H}px`, width: '40px' }}>
          {yRevTicks.map((t, i) => (
            <span key={i} className="text-[9px] text-slate-400 text-right leading-none">{t}</span>
          ))}
        </div>

        {/* Bars + SVG */}
        <div className="flex-1 relative">
          {/* Grid */}
          <div className="absolute inset-0 pointer-events-none" style={{ height: `${CHART_H}px` }}>
            {[0, 25, 50, 75, 100].map((pct) => (
              <div
                key={pct}
                className="absolute w-full border-t border-dashed border-slate-100"
                style={{ top: `${(100 - pct) * CHART_H / 100}px` }}
              ></div>
            ))}
          </div>

          {/* Bars */}
          <div
            ref={barsRef}
            className="flex items-end gap-1"
            style={{ height: `${CHART_H}px` }}
          >
            {data.map((d, i) => {
              const pct = (d.revenue / maxRevenue) * 100;
              const isHov = hoveredIdx === i;
              return (
                <div
                  key={i}
                  className="flex-1 flex items-end h-full relative cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  {isHov && (
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white rounded-xl px-3 py-2 z-20 whitespace-nowrap pointer-events-none">
                      <p className="text-xs font-bold">{d.label} {d.year}</p>
                      <p className="text-[11px] text-emerald-400 mt-0.5">
                        ${(d.revenue / 1000).toFixed(1)}k revenue
                      </p>
                      <p className="text-[11px] text-teal-400">
                        {d.units.toLocaleString()} units sold
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        ${(d.revenue / Math.max(d.units, 1)).toFixed(2)} / unit
                      </p>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                    </div>
                  )}
                  <div
                    className={`w-full rounded-t-sm transition-all duration-500 ease-out ${
                      d.isCurrent ? 'bg-emerald-500' : isHov ? 'bg-slate-500' : 'bg-slate-200'
                    }`}
                    style={{
                      height: animated ? `${Math.max(pct, 2)}%` : '2%',
                      transitionDelay: `${i * 35}ms`,
                    }}
                  ></div>
                </div>
              );
            })}
          </div>

          {/* SVG units line */}
          {showLine && animated && (
            <svg
              className="absolute top-0 left-0 pointer-events-none"
              width={barsWidth}
              height={CHART_H}
              viewBox={`0 0 ${barsWidth} ${CHART_H}`}
            >
              <defs>
                <linearGradient id="unitLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#0d9488" />
                </linearGradient>
              </defs>
              <polyline
                points={polyline}
                fill="none"
                stroke="url(#unitLineGrad)"
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {dots.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={hoveredIdx === i ? 6 : p.d.isCurrent ? 5 : 3.5}
                  fill={p.d.isCurrent ? '#0f172a' : '#14b8a6'}
                  stroke="white"
                  strokeWidth="1.5"
                />
              ))}
            </svg>
          )}

          {/* Month labels */}
          <div className="flex mt-2 gap-1">
            {data.map((d, i) => (
              <div key={i} className="flex-1 text-center">
                <span className={`text-[9px] font-medium ${d.isCurrent ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                  {d.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right y-axis (units) — only when line shown */}
        {showLine && (
          <div className="flex flex-col justify-between shrink-0" style={{ height: `${CHART_H}px`, width: '36px' }}>
            {yUnitTicks.map((t, i) => (
              <span key={i} className="text-[9px] text-teal-500 text-left pl-1 leading-none">{t}</span>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-4 flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-emerald-500"></div>
          <span className="text-[11px] text-slate-500 font-medium">Revenue (left axis)</span>
        </div>
        {showLine && (
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 bg-teal-500 rounded-full"></div>
            <div className="w-2 h-2 rounded-full bg-teal-500 shrink-0"></div>
            <span className="text-[11px] text-slate-500 font-medium">Units sold (right axis)</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-slate-900"></div>
          <span className="text-[11px] text-slate-500 font-medium">Current month</span>
        </div>
        <div className="ml-auto text-xs text-slate-400 flex items-center gap-1">
          <div className="w-4 h-4 flex items-center justify-center">
            <i className={`text-xs ${momPct >= 0 ? 'ri-arrow-up-line text-emerald-500' : 'ri-arrow-down-line text-red-400'}`}></i>
          </div>
          MoM: {momPct >= 0 ? '+' : ''}{momPct.toFixed(1)}% units vs last month
        </div>
      </div>
    </div>
  );
}
