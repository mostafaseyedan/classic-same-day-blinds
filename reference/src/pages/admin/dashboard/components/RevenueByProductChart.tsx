import { useState, useMemo, useEffect } from 'react';

// ── Seed orders (matches admin orders page) ────────────────────────────────
const SEED_ORDERS = [
  {
    id: 'ORD-10001',
    date: new Date(Date.now() - 1 * 86400000).toISOString(),
    items: [{ name: 'Faux Wood Blinds', price: 141.96, quantity: 3200, size: '36" x 60"' }],
  },
  {
    id: 'ORD-10002',
    date: new Date(Date.now() - 3 * 86400000).toISOString(),
    items: [{ name: 'Cellular Shades', price: 141.99, quantity: 2800, size: '48" x 64"' }],
  },
  {
    id: 'ORD-10003',
    date: new Date(Date.now() - 5 * 86400000).toISOString(),
    items: [{ name: 'Roller Shades', price: 141.99, quantity: 2500, size: '42" x 72"' }],
  },
  {
    id: 'ORD-10004',
    date: new Date(Date.now() - 10 * 86400000).toISOString(),
    items: [{ name: 'Roman Shades', price: 141.95, quantity: 2100, size: '36" x 68"' }],
  },
  {
    id: 'ORD-10005',
    date: new Date(Date.now() - 12 * 86400000).toISOString(),
    items: [{ name: 'Vertical Blinds', price: 141.97, quantity: 1400, size: '60" x 84"' }],
  },
  {
    id: 'ORD-10006',
    date: new Date(Date.now() - 20 * 86400000).toISOString(),
    items: [{ name: 'Cellular Shades', price: 141.96, quantity: 2000, size: '48" x 64"' }],
  },
  {
    id: 'ORD-10007',
    date: new Date(Date.now() - 35 * 86400000).toISOString(),
    items: [{ name: 'Roman Shades', price: 141.96, quantity: 1200, size: '36" x 68"' }],
  },
  {
    id: 'ORD-10008',
    date: new Date(Date.now() - 15 * 86400000).toISOString(),
    items: [{ name: 'Roller Shades', price: 141.99, quantity: 2400, size: '42" x 72"' }],
  },
];

// ── Product image map (fuzzy keyword → image) ─────────────────────────────
const PRODUCT_IMAGES: Record<string, string> = {
  'roller shades': 'https://static.readdy.ai/image/10fa40ccc8b6597759995e1d60c86977/571489ad5b2b4059cc114cfa8bb17af6.jpeg',
  'cellular shades': 'https://readdy.ai/api/search-image?query=premium%20honeycomb%20cellular%20window%20shades%20soft%20white%20color%20clean%20white%20background%20product%20photography%20professional%20lighting%20minimalist%20setting&width=80&height=80&seq=rev-prod-cellular&orientation=squarish',
  'roman shades': 'https://readdy.ai/api/search-image?query=elegant%20roman%20shades%20fabric%20window%20treatment%20neutral%20tone%20clean%20white%20background%20product%20photography%20professional%20lighting%20minimalist&width=80&height=80&seq=rev-prod-roman&orientation=squarish',
  'faux wood': 'https://readdy.ai/api/search-image?query=faux%20wood%20venetian%20blinds%20white%20horizontal%20slats%20clean%20white%20background%20product%20photography%20professional%20lighting%20minimalist&width=80&height=80&seq=rev-prod-fauxwood&orientation=squarish',
  'wood blinds': 'https://readdy.ai/api/search-image?query=real%20wood%20venetian%20blinds%20warm%20oak%20tone%20clean%20white%20background%20product%20photography%20professional%20lighting%20minimalist%20setting&width=80&height=80&seq=rev-prod-wood&orientation=squarish',
  'vertical blinds': 'https://readdy.ai/api/search-image?query=vertical%20window%20blinds%20white%20fabric%20louvers%20clean%20white%20background%20product%20photography%20professional%20lighting%20minimalist%20setting&width=80&height=80&seq=rev-prod-vertical&orientation=squarish',
  'aluminum blinds': 'https://readdy.ai/api/search-image?query=aluminum%20mini%20blinds%20silver%20horizontal%20slats%20clean%20white%20background%20product%20photography%20professional%20lighting%20minimalist&width=80&height=80&seq=rev-prod-alum&orientation=squarish',
  'vinyl blind': 'https://readdy.ai/api/search-image?query=vinyl%20mini%20blinds%20white%20color%20horizontal%20slats%20clean%20white%20background%20product%20photography%20professional%20lighting%20minimalist&width=80&height=80&seq=rev-prod-vinyl&orientation=squarish',
  default: 'https://readdy.ai/api/search-image?query=window%20blinds%20product%20clean%20white%20background%20professional%20product%20photography%20minimalist%20style&width=80&height=80&seq=rev-prod-default&orientation=squarish',
};

function getProductImage(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, url] of Object.entries(PRODUCT_IMAGES)) {
    if (key !== 'default' && lower.includes(key)) return url;
  }
  return PRODUCT_IMAGES.default;
}

// ── Bar colors by rank ─────────────────────────────────────────────────────
const BAR_COLORS = [
  'bg-slate-900',
  'bg-slate-700',
  'bg-slate-500',
  'bg-slate-400',
  'bg-slate-300',
];

const RANK_COLORS = [
  'bg-amber-400 text-white',
  'bg-slate-300 text-slate-700',
  'bg-amber-700 text-white',
  'bg-slate-100 text-slate-600',
  'bg-slate-100 text-slate-600',
];

// ── Data loading ───────────────────────────────────────────────────────────
interface RawOrderItem {
  name: string;
  price: number;
  quantity: number;
}

interface RawOrder {
  id: string;
  date: string;
  items: RawOrderItem[];
}

function loadOrders(): RawOrder[] {
  try {
    const stored: any[] = JSON.parse(localStorage.getItem('orders') ?? '[]');
    const storedIds = new Set(stored.map((o: any) => o.id));
    const filteredSeed = SEED_ORDERS.filter((o) => !storedIds.has(o.id));
    return [...stored, ...filteredSeed] as RawOrder[];
  } catch {
    return SEED_ORDERS as RawOrder[];
  }
}

interface ProductRevenue {
  name: string;
  revenue: number;
  units: number;
  orders: number;
  image: string;
  pct: number;
  prevRevenue: number;
  prevUnits: number;
}

function getMonthBounds(offset: 0 | -1): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

function aggregateByProduct(orders: RawOrder[], start: Date, end: Date): ProductRevenue[] {
  const map: Record<string, { revenue: number; units: number; orders: number }> = {};
  for (const o of orders) {
    const d = new Date(o.date);
    if (d < start || d > end) continue;
    for (const item of o.items ?? []) {
      const key = item.name ?? 'Unknown';
      if (!map[key]) map[key] = { revenue: 0, units: 0, orders: 0 };
      map[key].revenue += (item.price ?? 0) * (item.quantity ?? 0);
      map[key].units += item.quantity ?? 0;
      map[key].orders += 1;
    }
  }
  return Object.entries(map).map(([name, v]) => ({
    name,
    revenue: v.revenue,
    units: v.units,
    orders: v.orders,
    image: getProductImage(name),
    pct: 0,
    prevRevenue: 0,
    prevUnits: 0,
  }));
}

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${n.toFixed(0)}`;
}

function formatFull(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

type ViewMode = 'revenue' | 'units';

// ── Component ──────────────────────────────────────────────────────────────
export default function RevenueByProductChart() {
  const [mode, setMode] = useState<ViewMode>('revenue');
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  const orders = useMemo(() => loadOrders(), []);

  const currentBounds = getMonthBounds(0);
  const prevBounds = getMonthBounds(-1);

  const currentProducts = useMemo(() => aggregateByProduct(orders, currentBounds.start, currentBounds.end), [orders]);
  const prevProducts = useMemo(() => aggregateByProduct(orders, prevBounds.start, prevBounds.end), [orders]);

  const prevMap = useMemo(() => {
    const m: Record<string, { revenue: number; units: number }> = {};
    prevProducts.forEach((p) => { m[p.name] = { revenue: p.revenue, units: p.units }; });
    return m;
  }, [prevProducts]);

  const enriched: ProductRevenue[] = useMemo(() => {
    const total = currentProducts.reduce((s, p) => s + p.revenue, 0);
    return currentProducts
      .map((p) => ({
        ...p,
        pct: total > 0 ? (p.revenue / total) * 100 : 0,
        prevRevenue: prevMap[p.name]?.revenue ?? 0,
        prevUnits: prevMap[p.name]?.units ?? 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [currentProducts, prevMap]);

  const totalRevenue = enriched.reduce((s, p) => s + p.revenue, 0);
  const totalUnits = enriched.reduce((s, p) => s + p.units, 0);
  const maxVal = Math.max(...enriched.map((p) => (mode === 'revenue' ? p.revenue : p.units)), 1);

  const currentMonthLabel = currentBounds.start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  if (enriched.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
          <i className="ri-bar-chart-grouped-line text-slate-400 text-3xl"></i>
        </div>
        <p className="text-sm font-semibold text-slate-600">No orders this month yet</p>
        <p className="text-xs text-slate-400 mt-1">Revenue breakdown will appear once orders come in.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Revenue by Product</h3>
          <p className="text-xs text-slate-400 mt-0.5">{currentMonthLabel} · based on line-item order data</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {(['revenue', 'units'] as ViewMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-4 py-1.5 rounded-md text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                  mode === m ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {m === 'revenue' ? 'Revenue' : 'Units Sold'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4 mb-7">
        <div className="bg-slate-50 rounded-xl px-4 py-3">
          <p className="text-xs font-semibold text-slate-500 mb-1">Total Revenue This Month</p>
          <p className="text-lg font-bold text-slate-900">{formatFull(totalRevenue)}</p>
        </div>
        <div className="bg-slate-50 rounded-xl px-4 py-3">
          <p className="text-xs font-semibold text-slate-500 mb-1">Total Units Sold</p>
          <p className="text-lg font-bold text-slate-900">{totalUnits.toLocaleString()}</p>
        </div>
        <div className="bg-slate-50 rounded-xl px-4 py-3">
          <p className="text-xs font-semibold text-slate-500 mb-1">Products Sold</p>
          <p className="text-lg font-bold text-slate-900">{enriched.length} product{enriched.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Product rows */}
      <div className="space-y-4">
        {enriched.map((product, idx) => {
          const val = mode === 'revenue' ? product.revenue : product.units;
          const barPct = (val / maxVal) * 100;
          const prevVal = mode === 'revenue' ? product.prevRevenue : product.prevUnits;
          const momPct = prevVal > 0 ? ((val - prevVal) / prevVal) * 100 : null;
          const momUp = momPct !== null && momPct >= 0;
          const barColor = BAR_COLORS[Math.min(idx, BAR_COLORS.length - 1)];
          const rankColor = RANK_COLORS[Math.min(idx, RANK_COLORS.length - 1)];

          return (
            <div key={product.name} className="group">
              {/* Row header */}
              <div className="flex items-center gap-3 mb-2">
                {/* Rank badge */}
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${rankColor}`}>
                  {idx + 1}
                </div>

                {/* Product image */}
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover object-top"
                    loading="lazy"
                  />
                </div>

                {/* Name + meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-slate-900 truncate">{product.name}</p>
                    {momPct !== null && (
                      <span className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                        momUp ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                      }`}>
                        <i className={`${momUp ? 'ri-arrow-up-line' : 'ri-arrow-down-line'} text-[10px]`}></i>
                        {Math.abs(momPct).toFixed(0)}% vs last mo.
                      </span>
                    )}
                    {idx === 0 && (
                      <span className="inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 whitespace-nowrap">
                        <i className="ri-trophy-line text-[10px]"></i> #1 This Month
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {product.units.toLocaleString()} units · {product.orders} order{product.orders !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Revenue */}
                <div className="text-right shrink-0 min-w-[100px]">
                  <p className="text-sm font-bold text-slate-900">
                    {mode === 'revenue' ? formatFull(product.revenue) : product.units.toLocaleString() + ' units'}
                  </p>
                  <p className="text-xs text-slate-400">{product.pct.toFixed(1)}% of total</p>
                </div>
              </div>

              {/* Horizontal bar */}
              <div className="flex items-center gap-3 pl-9">
                <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
                    style={{
                      width: animated ? `${Math.max(barPct, 1)}%` : '0%',
                      transitionDelay: `${idx * 80}ms`,
                    }}
                  ></div>
                </div>
                <span className="text-xs font-semibold text-slate-400 w-12 text-right shrink-0">
                  {mode === 'revenue' ? formatCurrency(product.revenue) : product.units.toLocaleString()}
                </span>
              </div>

              {/* Divider */}
              {idx < enriched.length - 1 && (
                <div className="mt-4 border-b border-slate-50"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {enriched.slice(0, 3).map((p, i) => (
            <div key={p.name} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-sm ${BAR_COLORS[i]}`}></div>
              <span className="text-[11px] text-slate-500 font-medium truncate max-w-[100px]">{p.name}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400">
          Top product accounts for <span className="font-semibold text-slate-600">{enriched[0]?.pct.toFixed(1)}%</span> of revenue
        </p>
      </div>
    </div>
  );
}
