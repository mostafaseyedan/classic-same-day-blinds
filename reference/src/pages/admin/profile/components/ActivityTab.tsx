import { useState, useMemo, useCallback } from 'react';
import type { ActivityEntry } from '../../../../utils/adminActivity';

interface Props {
  activityLog: ActivityEntry[];
  onClear: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  navigation: 'bg-sky-100 text-sky-700',
  orders:     'bg-emerald-100 text-emerald-700',
  products:   'bg-violet-100 text-violet-700',
  users:      'bg-orange-100 text-orange-700',
  settings:   'bg-slate-100 text-slate-600',
  auth:       'bg-rose-100 text-rose-700',
  admin:      'bg-amber-100 text-amber-700',
  alerts:     'bg-red-100 text-red-700',
  reviews:    'bg-teal-100 text-teal-700',
  customers:  'bg-cyan-100 text-cyan-700',
};

const CATEGORY_ICONS: Record<string, string> = {
  navigation: 'ri-compass-3-line',
  orders:     'ri-shopping-bag-3-line',
  products:   'ri-store-2-line',
  users:      'ri-group-line',
  settings:   'ri-settings-4-line',
  auth:       'ri-login-box-line',
  admin:      'ri-shield-user-line',
  alerts:     'ri-alarm-warning-line',
  reviews:    'ri-star-line',
  customers:  'ri-user-3-line',
};

const CATEGORY_BG: Record<string, string> = {
  navigation: 'bg-sky-500',
  orders:     'bg-emerald-500',
  products:   'bg-violet-500',
  users:      'bg-orange-500',
  settings:   'bg-slate-500',
  auth:       'bg-rose-500',
  admin:      'bg-amber-500',
  alerts:     'bg-red-500',
  reviews:    'bg-teal-500',
  customers:  'bg-cyan-500',
};

type DateRange = 'today' | '7d' | '30d' | 'all';

function timeAgo(ts: string): string {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 7 * 86400) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatGroupDate(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function getDateKey(ts: string): string {
  return new Date(ts).toISOString().slice(0, 10);
}

// Build a 13-week heatmap grid
function buildHeatmap(entries: ActivityEntry[]): { weeks: { days: { date: string; count: number; level: number }[] }[] } {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const start = new Date(today);
  start.setDate(start.getDate() - 90); // 13 weeks
  start.setHours(0, 0, 0, 0);

  const countByDay: Record<string, number> = {};
  entries.forEach((e) => {
    const key = getDateKey(e.timestamp);
    countByDay[key] = (countByDay[key] ?? 0) + 1;
  });

  const allDays: { date: string; count: number; level: number }[] = [];
  const cur = new Date(start);
  while (cur <= today) {
    const key = cur.toISOString().slice(0, 10);
    const count = countByDay[key] ?? 0;
    const level = count === 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : count <= 10 ? 3 : 4;
    allDays.push({ date: key, count, level });
    cur.setDate(cur.getDate() + 1);
  }

  // Pad the first partial week
  const firstDow = new Date(allDays[0].date).getDay();
  const padded = [
    ...Array.from({ length: firstDow }, (_, i) => ({ date: `pad-${i}`, count: -1, level: -1 })),
    ...allDays,
  ];

  const weeks: { days: { date: string; count: number; level: number }[] }[] = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push({ days: padded.slice(i, i + 7) });
  }
  return { weeks };
}

const LEVEL_COLORS = [
  'bg-slate-100',
  'bg-emerald-200',
  'bg-emerald-400',
  'bg-emerald-500',
  'bg-emerald-700',
];

function ActivityHeatmap({ entries }: { entries: ActivityEntry[] }) {
  const [tooltip, setTooltip] = useState<{ date: string; count: number; x: number; y: number } | null>(null);
  const { weeks } = useMemo(() => buildHeatmap(entries), [entries]);
  const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Get month labels (first occurrence of each month in the weeks)
  const monthLabels: { label: string; col: number }[] = [];
  let prevMonth = '';
  weeks.forEach((w, wi) => {
    w.days.forEach((d) => {
      if (d.level < 0) return;
      const m = new Date(d.date).toLocaleDateString('en-US', { month: 'short' });
      if (m !== prevMonth) {
        monthLabels.push({ label: m, col: wi });
        prevMonth = m;
      }
    });
  });

  return (
    <div className="bg-white border border-slate-100 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-800">Activity Heatmap</h3>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-400">Less</span>
          {LEVEL_COLORS.map((c, i) => (
            <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
          ))}
          <span className="text-xs text-slate-400">More</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-flex flex-col gap-1 min-w-max">
          {/* Month labels */}
          <div className="flex gap-1 pl-7">
            {weeks.map((_, wi) => {
              const ml = monthLabels.find((m) => m.col === wi);
              return (
                <div key={wi} className="w-3 text-[9px] text-slate-400 font-medium">
                  {ml ? ml.label : ''}
                </div>
              );
            })}
          </div>

          {/* Grid */}
          {[0, 1, 2, 3, 4, 5, 6].map((dow) => (
            <div key={dow} className="flex items-center gap-1">
              <span className="w-5 text-[9px] text-slate-400 text-right shrink-0">{DOW[dow]}</span>
              {weeks.map((week, wi) => {
                const day = week.days[dow];
                if (!day) return <div key={wi} className="w-3 h-3" />;
                if (day.level < 0) return <div key={wi} className="w-3 h-3" />;
                return (
                  <div
                    key={wi}
                    className={`w-3 h-3 rounded-sm cursor-default ${LEVEL_COLORS[day.level]} hover:ring-1 hover:ring-emerald-400 transition-all relative`}
                    onMouseEnter={(e) => {
                      const rect = (e.target as HTMLElement).getBoundingClientRect();
                      setTooltip({ date: day.date, count: day.count, x: rect.left, y: rect.top });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {tooltip && tooltip.count >= 0 && (
        <div
          className="fixed z-50 bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-lg pointer-events-none shadow-lg"
          style={{ left: tooltip.x + 8, top: tooltip.y - 40 }}
        >
          <p className="font-bold">{tooltip.count} action{tooltip.count !== 1 ? 's' : ''}</p>
          <p className="text-slate-300">{new Date(tooltip.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
        </div>
      )}
    </div>
  );
}

export default function ActivityTab({ activityLog, onClear }: Props) {
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const [category, setCategory] = useState('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const allCategories = useMemo(() => [...new Set(activityLog.map((e) => e.category))].sort(), [activityLog]);

  const filtered = useMemo(() => {
    const now = Date.now();
    const cutoffs: Record<DateRange, number> = {
      today: new Date().setHours(0, 0, 0, 0),
      '7d': now - 7 * 86400000,
      '30d': now - 30 * 86400000,
      all: 0,
    };
    const cutoff = cutoffs[dateRange];
    const q = search.toLowerCase();

    return activityLog.filter((e) => {
      const ts = new Date(e.timestamp).getTime();
      if (ts < cutoff) return false;
      if (category !== 'all' && e.category !== category) return false;
      if (q && !e.action.toLowerCase().includes(q) && !(e.detail ?? '').toLowerCase().includes(q)) return false;
      return true;
    });
  }, [activityLog, dateRange, category, search]);

  // Group by date
  const grouped = useMemo(() => {
    const groups: { dateKey: string; label: string; entries: ActivityEntry[] }[] = [];
    const map = new Map<string, ActivityEntry[]>();
    filtered.forEach((e) => {
      const key = getDateKey(e.timestamp);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    });
    map.forEach((entries, key) => {
      groups.push({ dateKey: key, label: formatGroupDate(key), entries });
    });
    return groups.sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  }, [filtered]);

  // Stats
  const stats = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const week = new Date(today); week.setDate(week.getDate() - 7);
    const todayCount = activityLog.filter((e) => new Date(e.timestamp) >= today).length;
    const weekCount = activityLog.filter((e) => new Date(e.timestamp) >= week).length;
    const catCounts: Record<string, number> = {};
    activityLog.forEach((e) => { catCounts[e.category] = (catCounts[e.category] ?? 0) + 1; });
    const topCat = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0];
    const activeDays = new Set(activityLog.map((e) => getDateKey(e.timestamp))).size;
    return { todayCount, weekCount, topCat: topCat?.[0] ?? '—', topCatCount: topCat?.[1] ?? 0, activeDays };
  }, [activityLog]);

  const exportCSV = useCallback(() => {
    const rows = [
      ['Timestamp', 'Action', 'Category', 'Detail', 'Admin'],
      ...filtered.map((e) => [
        new Date(e.timestamp).toLocaleString(),
        e.action,
        e.category,
        e.detail ?? '',
        e.adminName,
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity_log_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filtered]);

  const DATE_RANGE_OPTIONS: { id: DateRange; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: '7d', label: 'Last 7 days' },
    { id: '30d', label: 'Last 30 days' },
    { id: 'all', label: 'All time' },
  ];

  return (
    <div className="space-y-5">
      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Today', value: stats.todayCount, icon: 'ri-pulse-line', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'This Week', value: stats.weekCount, icon: 'ri-bar-chart-2-line', color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'All Time', value: activityLog.length, icon: 'ri-history-line', color: 'text-slate-700', bg: 'bg-slate-50' },
          { label: 'Active Days', value: stats.activeDays, icon: 'ri-calendar-check-line', color: 'text-teal-600', bg: 'bg-teal-50' },
        ].map((card) => (
          <div key={card.label} className={`${card.bg} rounded-xl p-4 flex items-center gap-3`}>
            <div className={`w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0`}>
              <i className={`${card.icon} ${card.color} text-lg`}></i>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">{card.label}</p>
              <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Top category banner */}
      {stats.topCat !== '—' && (
        <div className="bg-white border border-slate-100 rounded-xl px-5 py-3 flex items-center gap-3">
          <div className={`w-8 h-8 ${CATEGORY_BG[stats.topCat] ?? 'bg-slate-500'} rounded-lg flex items-center justify-center shrink-0`}>
            <i className={`${CATEGORY_ICONS[stats.topCat] ?? 'ri-question-line'} text-white text-sm`}></i>
          </div>
          <div>
            <p className="text-xs text-slate-400">Most active category</p>
            <p className="text-sm font-bold text-slate-900 capitalize">{stats.topCat} <span className="text-xs text-slate-400 font-normal">— {stats.topCatCount} actions</span></p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer whitespace-nowrap transition-colors"
            >
              <i className="ri-download-2-line text-sm"></i> Export CSV
            </button>
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 rounded-lg cursor-pointer whitespace-nowrap transition-colors"
            >
              <i className="ri-delete-bin-line text-sm"></i> Clear History
            </button>
          </div>
        </div>
      )}

      {/* Heatmap */}
      <ActivityHeatmap entries={activityLog} />

      {/* Filters */}
      <div className="bg-white border border-slate-100 rounded-xl px-4 py-3 flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <div className="w-4 h-4 flex items-center justify-center text-slate-400 shrink-0">
            <i className="ri-search-line text-sm"></i>
          </div>
          <input
            type="text"
            placeholder="Search actions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm outline-none text-slate-700 placeholder-slate-400"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-700 cursor-pointer">
              <i className="ri-close-line text-sm"></i>
            </button>
          )}
        </div>

        {/* Date range */}
        <div className="flex gap-1">
          {DATE_RANGE_OPTIONS.map((o) => (
            <button
              key={o.id}
              onClick={() => setDateRange(o.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors ${
                dateRange === o.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>

        {/* Category */}
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={() => setCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors ${
              category === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors ${
                category === cat
                  ? `${CATEGORY_BG[cat] ?? 'bg-slate-700'} text-white`
                  : `${CATEGORY_COLORS[cat] ?? 'bg-slate-100 text-slate-600'} hover:opacity-80`
              }`}
            >
              <i className={`${CATEGORY_ICONS[cat] ?? 'ri-question-line'} text-xs`}></i>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
              <span className="ml-0.5 opacity-70">
                {activityLog.filter((e) => e.category === cat).length}
              </span>
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-400 ml-auto whitespace-nowrap">
          {filtered.length} of {activityLog.length} entries
        </span>
      </div>

      {/* Grouped Timeline */}
      {grouped.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center">
            <i className="ri-history-line text-slate-400 text-2xl"></i>
          </div>
          <p className="text-sm font-semibold text-slate-500">No activity found</p>
          <p className="text-xs text-slate-400">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map((group) => (
            <div key={group.dateKey} className="bg-white border border-slate-100 rounded-xl overflow-hidden">
              {/* Date header */}
              <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{group.label}</span>
                </div>
                <span className="text-xs text-slate-400 font-medium">{group.entries.length} action{group.entries.length !== 1 ? 's' : ''}</span>
              </div>

              {/* Entries */}
              <div className="divide-y divide-slate-50">
                {group.entries.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-4 px-5 py-3.5 hover:bg-slate-50/60 transition-colors">
                    {/* Icon */}
                    <div className={`w-8 h-8 flex items-center justify-center rounded-xl shrink-0 mt-0.5 ${CATEGORY_BG[entry.category] ?? 'bg-slate-400'}`}>
                      <i className={`${CATEGORY_ICONS[entry.category] ?? 'ri-question-line'} text-white text-xs`}></i>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 leading-tight">{entry.action}</p>
                      {entry.detail && (
                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{entry.detail}</p>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${CATEGORY_COLORS[entry.category] ?? 'bg-slate-100 text-slate-500'}`}>
                        {entry.category}
                      </span>
                      <span className="text-xs text-slate-400 whitespace-nowrap w-16 text-right">
                        {new Date(entry.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Clear Confirm Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4" onClick={() => setShowClearConfirm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-7" onClick={(e) => e.stopPropagation()}>
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-delete-bin-line text-red-500 text-2xl"></i>
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center mb-1">Clear Activity History?</h3>
            <p className="text-sm text-slate-500 text-center mb-6">
              This will permanently remove all <strong>{activityLog.length}</strong> activity entries from your profile. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer whitespace-nowrap transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { onClear(); setShowClearConfirm(false); }}
                className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg cursor-pointer whitespace-nowrap transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
