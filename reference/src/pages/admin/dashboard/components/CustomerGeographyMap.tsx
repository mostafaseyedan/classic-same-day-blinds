import { useState, useMemo } from 'react';

// ── Seed label recipient cities (mirrors admin orders shipping labels) ─────
const SEED_CITIES: CityEntry[] = [
  { city: 'West Hollywood', state: 'CA', zip: '90069', orders: 3, revenue: 354975 },
  { city: 'Los Angeles',    state: 'CA', zip: '90001', orders: 2, revenue: 454272 },
  { city: 'Los Angeles',    state: 'CA', zip: '90010', orders: 2, revenue: 397656 },
  { city: 'Los Angeles',    state: 'CA', zip: '90077', orders: 1, revenue: 198758 },
  { city: 'Los Angeles',    state: 'CA', zip: '90024', orders: 1, revenue: 198758 },
];

// ── Mock LA-metro city data for richer visualization ──────────────────────
const MOCK_CITIES: CityEntry[] = [
  { city: 'Los Angeles',    state: 'CA', zip: '90001', orders: 38, revenue: 1420500 },
  { city: 'Santa Monica',   state: 'CA', zip: '90401', orders: 21, revenue: 812300 },
  { city: 'Beverly Hills',  state: 'CA', zip: '90210', orders: 19, revenue: 745100 },
  { city: 'Burbank',        state: 'CA', zip: '91502', orders: 14, revenue: 531600 },
  { city: 'Long Beach',     state: 'CA', zip: '90802', orders: 13, revenue: 487900 },
  { city: 'Pasadena',       state: 'CA', zip: '91101', orders: 11, revenue: 398200 },
  { city: 'West Hollywood', state: 'CA', zip: '90069', orders: 10, revenue: 354975 },
  { city: 'Culver City',    state: 'CA', zip: '90230', orders: 9,  revenue: 312500 },
  { city: 'Glendale',       state: 'CA', zip: '91201', orders: 8,  revenue: 289400 },
  { city: 'El Segundo',     state: 'CA', zip: '90245', orders: 6,  revenue: 198300 },
  { city: 'Torrance',       state: 'CA', zip: '90501', orders: 5,  revenue: 167800 },
  { city: 'Inglewood',      state: 'CA', zip: '90301', orders: 4,  revenue: 134200 },
];

interface CityEntry {
  city: string;
  state: string;
  zip: string;
  orders: number;
  revenue: number;
}

// ── Load real city data from shipping labels in localStorage ──────────────
function loadCitiesFromLabels(): CityEntry[] {
  try {
    const stored = localStorage.getItem('shipping_labels');
    if (!stored) return [];
    const labels: any[] = JSON.parse(stored);
    const map: Record<string, CityEntry> = {};
    for (const label of labels) {
      if (label.status === 'Voided') continue;
      const addr = label.recipientAddress;
      if (!addr?.city) continue;
      const key = `${addr.city}-${addr.state}`;
      if (!map[key]) map[key] = { city: addr.city, state: addr.state, zip: addr.zip ?? '', orders: 0, revenue: 0 };
      map[key].orders += 1;
    }
    return Object.values(map);
  } catch {
    return [];
  }
}

function mergeCities(real: CityEntry[], mock: CityEntry[]): CityEntry[] {
  if (real.length === 0) return mock;
  // Merge real data over mock by city name
  const map: Record<string, CityEntry> = {};
  for (const m of mock) map[m.city.toLowerCase()] = { ...m };
  for (const r of real) {
    const k = r.city.toLowerCase();
    if (map[k]) {
      map[k].orders += r.orders;
      map[k].revenue += r.revenue;
    } else {
      map[k] = { ...r };
    }
  }
  return Object.values(map).sort((a, b) => b.orders - a.orders);
}

function formatRevenue(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${n.toFixed(0)}`;
}

function formatFull(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

const DOT_SIZES = ['w-5 h-5 text-xs', 'w-4 h-4 text-[10px]', 'w-3.5 h-3.5', 'w-3 h-3', 'w-2.5 h-2.5'];
const DOT_COLORS = ['bg-slate-900', 'bg-slate-700', 'bg-slate-500', 'bg-slate-400', 'bg-slate-300'];

type SortMode = 'orders' | 'revenue';

export default function CustomerGeographyMap() {
  const [sortMode, setSortMode] = useState<SortMode>('orders');
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);

  const cities = useMemo(() => {
    const real = loadCitiesFromLabels();
    return mergeCities(real, MOCK_CITIES);
  }, []);

  const sorted = useMemo(
    () => [...cities].sort((a, b) => sortMode === 'orders' ? b.orders - a.orders : b.revenue - a.revenue),
    [cities, sortMode]
  );

  const totalOrders  = cities.reduce((s, c) => s + c.orders, 0);
  const totalRevenue = cities.reduce((s, c) => s + c.revenue, 0);
  const topCity      = sorted[0];
  const uniqueStates = [...new Set(cities.map(c => c.state))];

  const maxVal = Math.max(...sorted.map(c => sortMode === 'orders' ? c.orders : c.revenue), 1);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between px-6 pt-6 pb-4 flex-wrap gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Customer Geography</h3>
          <p className="text-xs text-slate-400 mt-0.5">Where your orders are shipping to · {cities.length} cities across {uniqueStates.length} state{uniqueStates.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          {(['orders', 'revenue'] as SortMode[]).map(m => (
            <button
              key={m}
              onClick={() => setSortMode(m)}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                sortMode === m ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {m === 'orders' ? 'By Orders' : 'By Revenue'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-3 px-6 mb-5">
        {[
          { label: 'Cities Reached',    value: cities.length.toString(),     icon: 'ri-map-pin-line',               bg: 'bg-slate-50',    text: 'text-slate-700' },
          { label: 'Total Deliveries',  value: totalOrders.toString(),        icon: 'ri-truck-line',                 bg: 'bg-teal-50',     text: 'text-teal-700' },
          { label: 'Total Revenue',     value: formatRevenue(totalRevenue),   icon: 'ri-money-dollar-circle-line',   bg: 'bg-emerald-50',  text: 'text-emerald-700' },
          { label: 'Top City',          value: topCity?.city ?? '—',          icon: 'ri-trophy-line',                bg: 'bg-amber-50',    text: 'text-amber-700' },
        ].map(k => (
          <div key={k.label} className={`${k.bg} rounded-xl px-4 py-3`}>
            <div className={`flex items-center gap-1.5 mb-1 ${k.text}`}>
              <div className="w-4 h-4 flex items-center justify-center shrink-0">
                <i className={`${k.icon} text-sm`}></i>
              </div>
              <span className="text-xs font-semibold">{k.label}</span>
            </div>
            <p className={`text-base font-bold ${k.text}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Main body: map + city list */}
      <div className="flex gap-0 border-t border-slate-100">
        {/* ── Google Map embed ── */}
        <div className="flex-1 relative" style={{ minHeight: '420px' }}>
          <iframe
            title="Customer Geography Map"
            src="https://maps.google.com/maps?q=Los+Angeles,CA&t=m&z=10&output=embed&iwloc=near"
            className="w-full h-full border-0"
            style={{ minHeight: '420px' }}
            loading="lazy"
            allowFullScreen
          />
          {/* Overlay legend */}
          <div className="absolute bottom-4 left-4 bg-white/95 rounded-xl px-3 py-2.5 shadow-lg border border-slate-100">
            <p className="text-[11px] font-bold text-slate-600 mb-2 uppercase tracking-wide">Order Volume</p>
            <div className="flex flex-col gap-1.5">
              {[
                { label: 'High (20+ orders)',  dot: 'bg-slate-900' },
                { label: 'Mid (10–19)',        dot: 'bg-slate-600' },
                { label: 'Low (&lt;10)',       dot: 'bg-slate-300' },
              ].map(row => (
                <div key={row.label} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full shrink-0 ${row.dot}`}></div>
                  <span
                    className="text-[11px] text-slate-500"
                    dangerouslySetInnerHTML={{ __html: row.label }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── City rankings panel ── */}
        <div className="w-80 shrink-0 border-l border-slate-100 flex flex-col" style={{ maxHeight: '420px' }}>
          {/* Panel header */}
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 shrink-0">
            <p className="text-xs font-bold text-slate-700">
              Top Cities — {sortMode === 'orders' ? 'by deliveries' : 'by revenue'}
            </p>
          </div>

          {/* Scrollable city list */}
          <div className="overflow-y-auto flex-1">
            {sorted.map((city, idx) => {
              const val    = sortMode === 'orders' ? city.orders : city.revenue;
              const barPct = (val / maxVal) * 100;
              const dotSize  = DOT_SIZES[Math.min(idx, DOT_SIZES.length - 1)];
              const dotColor = DOT_COLORS[Math.min(idx, DOT_COLORS.length - 1)];
              const isHovered = hoveredCity === `${city.city}-${city.state}`;

              return (
                <div
                  key={`${city.city}-${city.state}-${idx}`}
                  onMouseEnter={() => setHoveredCity(`${city.city}-${city.state}`)}
                  onMouseLeave={() => setHoveredCity(null)}
                  className={`px-4 py-3 border-b border-slate-50 transition-colors cursor-default ${isHovered ? 'bg-slate-50' : ''}`}
                >
                  <div className="flex items-center gap-2.5 mb-1.5">
                    {/* Rank dot */}
                    <div className={`rounded-full ${dotSize} ${dotColor} flex items-center justify-center shrink-0 font-bold text-white`}>
                      {idx < 3 ? (
                        <span>{idx + 1}</span>
                      ) : null}
                    </div>

                    {/* City name + state */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-slate-900 truncate">{city.city}</p>
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">{city.state}</span>
                        {city.zip && (
                          <span className="text-[10px] text-slate-400 shrink-0">{city.zip}</span>
                        )}
                      </div>
                    </div>

                    {/* Value */}
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-slate-900">
                        {sortMode === 'orders' ? city.orders : formatRevenue(city.revenue)}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {sortMode === 'orders'
                          ? `${((city.orders / totalOrders) * 100).toFixed(0)}% of total`
                          : `${city.orders} orders`}
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="ml-7 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${dotColor}`}
                      style={{ width: `${Math.max(barPct, 2)}%` }}
                    ></div>
                  </div>

                  {/* Hover detail */}
                  {isHovered && (
                    <div className="ml-7 mt-1.5 flex items-center gap-3 flex-wrap">
                      <span className="text-[11px] text-slate-500">
                        <i className="ri-truck-line mr-0.5"></i>{city.orders} deliveries
                      </span>
                      <span className="text-[11px] text-slate-500">
                        <i className="ri-money-dollar-circle-line mr-0.5"></i>{formatFull(city.revenue)}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer total */}
          <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-semibold">Total</span>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-900">{totalOrders} deliveries</p>
                <p className="text-[11px] text-slate-400">{formatRevenue(totalRevenue)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
