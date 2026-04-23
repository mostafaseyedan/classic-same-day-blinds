import { useState, useEffect, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';
import type { RestockEntry } from '../products/page';
import { products as mockProducts } from '../../../mocks/products';
import { loadProductsFromDB, loadRestockFromDB } from '../../../utils/productStorage';

interface Product {
  id: number;
  name: string;
  image: string;
  inventory: number;
  category: string;
}

function normalizeProducts(prods: any[]): Product[] {
  return prods.map((p) => ({
    id: p.id,
    name: p.name,
    image: p.image,
    inventory: p.inventory ?? 0,
    category: p.category,
  }));
}

const CATEGORY_LABELS: Record<string, string> = {
  'wood-blinds': 'Wood Blinds',
  'roller-shades': 'Roller Shades',
  'cellular-shades': 'Cellular Shades',
  'roman-shades': 'Roman Shades',
  'motorized': 'Motorized',
};

export default function AdminRestockHistoryPage() {
  const [search, setSearch] = useState('');
  const [filterProduct, setFilterProduct] = useState<string>('all');
  const [filterRange, setFilterRange] = useState<'all' | '7d' | '30d' | '90d'>('all');
  const [chartView, setChartView] = useState<'weekly' | 'monthly'>('weekly');
  const [chartType, setChartType] = useState<'bar' | 'area'>('bar');
  const [products, setProducts] = useState<Product[]>(normalizeProducts(mockProducts));
  const [history, setHistory] = useState<RestockEntry[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [storedProds, storedHistory] = await Promise.all([
        loadProductsFromDB(),
        loadRestockFromDB(),
      ]);
      if (!cancelled) {
        if (storedProds && storedProds.length > 0) setProducts(normalizeProducts(storedProds));
        if (storedHistory && storedHistory.length > 0) setHistory(storedHistory as RestockEntry[]);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Also listen for live updates from the products admin page
  useEffect(() => {
    const handler = (e: Event) => {
      setProducts(normalizeProducts((e as CustomEvent).detail));
    };
    window.addEventListener('productsUpdated', handler);
    return () => window.removeEventListener('productsUpdated', handler);
  }, []);

  const productMap = useMemo(() => {
    const map: Record<number, Product> = {};
    products.forEach((p) => { map[p.id] = p; });
    return map;
  }, [products]);

  const now = Date.now();
  const rangeMs: Record<string, number> = {
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
    '90d': 90 * 24 * 60 * 60 * 1000,
  };

  const filtered = useMemo(() => {
    return history
      .filter((e) => {
        const prod = productMap[e.productId];
        const prodName = prod?.name ?? '';
        const matchSearch =
          prodName.toLowerCase().includes(search.toLowerCase()) ||
          (e.note ?? '').toLowerCase().includes(search.toLowerCase());
        const matchProduct = filterProduct === 'all' || String(e.productId) === filterProduct;
        const matchRange =
          filterRange === 'all' || now - e.timestamp <= rangeMs[filterRange];
        return matchSearch && matchProduct && matchRange;
      })
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [history, search, filterProduct, filterRange, productMap, now]);

  // Stats
  const totalUnits = filtered.reduce((s, e) => s + e.qty, 0);
  const uniqueProducts = new Set(filtered.map((e) => e.productId)).size;
  const avgUnits = filtered.length > 0 ? Math.round(totalUnits / filtered.length) : 0;

  // Group by date
  const grouped = useMemo(() => {
    const groups: Record<string, RestockEntry[]> = {};
    filtered.forEach((e) => {
      const dateKey = new Date(e.timestamp).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(e);
    });
    return groups;
  }, [filtered]);

  const groupKeys = Object.keys(grouped);

  // --- Chart data builders ---
  const weeklyChartData = useMemo(() => {
    const buckets: Record<string, { label: string; units: number; restocks: number; weekStart: number }> = {};
    const allEntries = [...history].sort((a, b) => a.timestamp - b.timestamp);
    if (allEntries.length === 0) return [];

    allEntries.forEach((e) => {
      const d = new Date(e.timestamp);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d);
      monday.setDate(diff);
      monday.setHours(0, 0, 0, 0);
      const key = monday.getTime().toString();
      if (!buckets[key]) {
        const label = monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        buckets[key] = { label, units: 0, restocks: 0, weekStart: monday.getTime() };
      }
      buckets[key].units += e.qty;
      buckets[key].restocks += 1;
    });

    return Object.values(buckets)
      .sort((a, b) => a.weekStart - b.weekStart)
      .slice(-16);
  }, [history]);

  const monthlyChartData = useMemo(() => {
    const buckets: Record<string, { label: string; units: number; restocks: number; sortKey: string }> = {};
    history.forEach((e) => {
      const d = new Date(e.timestamp);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!buckets[key]) {
        const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        buckets[key] = { label, units: 0, restocks: 0, sortKey: key };
      }
      buckets[key].units += e.qty;
      buckets[key].restocks += 1;
    });

    return Object.values(buckets)
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .slice(-12);
  }, [history]);

  const chartData = chartView === 'weekly' ? weeklyChartData : monthlyChartData;
  const totalChartUnits = chartData.reduce((s, d) => s + d.units, 0);
  const peakEntry = chartData.reduce((max, d) => (d.units > (max?.units ?? 0) ? d : max), chartData[0]);
  const avgChartUnits = chartData.length > 0 ? Math.round(totalChartUnits / chartData.length) : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-sm">
          <p className="font-bold text-slate-800 mb-1">{label}</p>
          <p className="text-green-700 font-semibold">+{payload[0]?.value?.toLocaleString()} units</p>
          {payload[1] && (
            <p className="text-slate-500">{payload[1]?.value} restock{payload[1]?.value !== 1 ? 's' : ''}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Restock History</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Full timeline of every inventory restock across all products
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-100 px-4 py-2 rounded-lg">
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-history-line text-slate-500"></i>
          </div>
          <span>{history.length} total entries</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Filtered Restocks', value: filtered.length, icon: 'ri-history-line', color: 'text-slate-700', bg: 'bg-slate-50' },
          { label: 'Total Units Added', value: totalUnits.toLocaleString(), icon: 'ri-stack-line', color: 'text-green-700', bg: 'bg-green-50' },
          { label: 'Products Restocked', value: uniqueProducts, icon: 'ri-store-2-line', color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Avg Units / Restock', value: avgUnits.toLocaleString(), icon: 'ri-bar-chart-line', color: 'text-teal-600', bg: 'bg-teal-50' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
            <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${stat.bg} ${stat.color}`}>
              <i className={`${stat.icon} text-xl`}></i>
            </div>
            <div>
              <p className="text-xs text-slate-500">{stat.label}</p>
              <p className="text-xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Restock Trends Chart ── */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        {/* Chart header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Restock Trends</h3>
            <p className="text-xs text-slate-500 mt-0.5">Units added over time across all products</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Weekly / Monthly toggle */}
            <div className="flex items-center gap-1 bg-slate-100 rounded-full px-1 py-1">
              {(['weekly', 'monthly'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setChartView(v)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors cursor-pointer whitespace-nowrap ${
                    chartView === v ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {v === 'weekly' ? 'Weekly' : 'Monthly'}
                </button>
              ))}
            </div>

            {/* Bar / Area toggle */}
            <div className="flex items-center gap-1 bg-slate-100 rounded-full px-1 py-1">
              <button
                onClick={() => setChartType('bar')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  chartType === 'bar' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <i className="ri-bar-chart-2-line"></i> Bar
              </button>
              <button
                onClick={() => setChartType('area')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  chartType === 'area' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <i className="ri-line-chart-line"></i> Area
              </button>
            </div>
          </div>
        </div>

        {/* Mini stat strip */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-50 rounded-lg px-4 py-3">
            <p className="text-[11px] text-slate-500 mb-0.5">
              Total ({chartView === 'weekly' ? `${chartData.length}w` : `${chartData.length}mo`})
            </p>
            <p className="text-lg font-extrabold text-slate-900">+{totalChartUnits.toLocaleString()}</p>
          </div>
          <div className="bg-green-50 rounded-lg px-4 py-3">
            <p className="text-[11px] text-slate-500 mb-0.5">Peak {chartView === 'weekly' ? 'Week' : 'Month'}</p>
            <p className="text-lg font-extrabold text-green-700">
              {peakEntry ? `+${peakEntry.units.toLocaleString()}` : '—'}
              {peakEntry && <span className="text-xs font-normal text-slate-500 ml-1">({peakEntry.label})</span>}
            </p>
          </div>
          <div className="bg-teal-50 rounded-lg px-4 py-3">
            <p className="text-[11px] text-slate-500 mb-0.5">Avg / {chartView === 'weekly' ? 'Week' : 'Month'}</p>
            <p className="text-lg font-extrabold text-teal-700">+{avgChartUnits.toLocaleString()}</p>
          </div>
        </div>

        {/* Chart */}
        {chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400">
            <div className="w-10 h-10 flex items-center justify-center mb-2">
              <i className="ri-bar-chart-2-line text-3xl"></i>
            </div>
            <p className="text-sm font-medium">No data yet</p>
            <p className="text-xs mt-1">Log restocks to see trends appear here</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            {chartType === 'bar' ? (
              <BarChart data={chartData} barSize={chartView === 'weekly' ? 18 : 28} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => v.toLocaleString()}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="units" fill="#15803d" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="unitsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#15803d" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#15803d" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => v.toLocaleString()}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="units"
                  stroke="#15803d"
                  strokeWidth={2.5}
                  fill="url(#unitsGradient)"
                  dot={{ r: 3, fill: '#15803d', strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#15803d' }}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[220px]">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-slate-400">
            <i className="ri-search-line text-sm"></i>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product or note..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 bg-white"
          />
        </div>

        <select
          value={filterProduct}
          onChange={(e) => setFilterProduct(e.target.value)}
          className="px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 bg-white text-slate-700 cursor-pointer"
        >
          <option value="all">All Products</option>
          {products.map((p) => (
            <option key={p.id} value={String(p.id)}>{p.name}</option>
          ))}
        </select>

        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-1 py-1">
          {(['all', '7d', '30d', '90d'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setFilterRange(r)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors cursor-pointer whitespace-nowrap ${
                filterRange === r
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {r === 'all' ? 'All Time' : r === '7d' ? 'Last 7 Days' : r === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      {groupKeys.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
          <div className="w-12 h-12 flex items-center justify-center mb-3">
            <i className="ri-history-line text-4xl"></i>
          </div>
          <p className="text-base font-semibold">No restock entries found</p>
          <p className="text-sm mt-1">
            {history.length === 0
              ? 'Log your first restock from the Products page'
              : 'Try adjusting your filters'}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {groupKeys.map((dateKey) => {
            const entries = grouped[dateKey];
            const dayTotal = entries.reduce((s, e) => s + e.qty, 0);
            return (
              <div key={dateKey}>
                {/* Date header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 flex items-center justify-center bg-slate-900 text-white rounded-lg shrink-0">
                      <i className="ri-calendar-line text-sm"></i>
                    </div>
                    <span className="text-sm font-bold text-slate-800">{dateKey}</span>
                  </div>
                  <div className="flex-1 h-px bg-slate-200"></div>
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full whitespace-nowrap">
                    {entries.length} restock{entries.length !== 1 ? 's' : ''} · +{dayTotal.toLocaleString()} units
                  </span>
                </div>

                {/* Entries */}
                <div className="space-y-3 pl-4 border-l-2 border-slate-200 ml-4">
                  {entries.map((entry, idx) => {
                    const prod = productMap[entry.productId];
                    const time = new Date(entry.timestamp).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                    const isFirst = idx === 0 && dateKey === groupKeys[0];

                    return (
                      <div
                        key={entry.id}
                        className={`relative bg-white rounded-xl border transition-all ${
                          isFirst ? 'border-green-200 shadow-sm' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {/* Timeline connector dot */}
                        <div className={`absolute -left-[21px] top-5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                          isFirst ? 'bg-green-600' : 'bg-slate-400'
                        }`}>
                          <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                        </div>

                        <div className="flex items-center gap-4 p-4">
                          {/* Product image */}
                          {prod && (
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                              <img
                                src={(prod as any).image}
                                alt={prod.name}
                                className="w-full h-full object-cover object-top"
                              />
                            </div>
                          )}

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-slate-900 truncate">
                                {prod?.name ?? `Product #${entry.productId}`}
                              </span>
                              {isFirst && (
                                <span className="text-[10px] font-bold bg-green-700 text-white px-2 py-0.5 rounded-full whitespace-nowrap">
                                  Latest
                                </span>
                              )}
                              {prod && (
                                <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full capitalize whitespace-nowrap">
                                  {CATEGORY_LABELS[prod.category] ?? prod.category}
                                </span>
                              )}
                            </div>
                            {entry.note ? (
                              <p className="text-xs text-slate-500 mt-0.5 truncate">
                                <span className="w-3 h-3 inline-flex items-center justify-center mr-1">
                                  <i className="ri-file-text-line"></i>
                                </span>
                                {entry.note}
                              </p>
                            ) : (
                              <p className="text-xs text-slate-400 mt-0.5 italic">No note</p>
                            )}
                            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                              <span className="w-3 h-3 inline-flex items-center justify-center">
                                <i className="ri-time-line"></i>
                              </span>
                              {time}
                              {prod && (
                                <>
                                  <span className="mx-1">·</span>
                                  <span className="w-3 h-3 inline-flex items-center justify-center">
                                    <i className="ri-stack-line"></i>
                                  </span>
                                  {prod.inventory} units now in stock
                                </>
                              )}
                            </p>
                          </div>

                          {/* Units badge */}
                          <div className={`shrink-0 text-center px-4 py-2 rounded-xl ${
                            isFirst ? 'bg-green-50 border border-green-200' : 'bg-slate-50 border border-slate-200'
                          }`}>
                            <p className={`text-lg font-extrabold ${isFirst ? 'text-green-700' : 'text-slate-700'}`}>
                              +{entry.qty.toLocaleString()}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium">units</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
