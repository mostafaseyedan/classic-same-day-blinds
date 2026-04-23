import { useState, useMemo } from 'react';
import {
  competitorProducts,
  competitorSummary,
  lowesProducts,
  lowesSummary,
  type CompetitorProduct,
} from '../../../mocks/competitorPricing';
import CompetitorAlertModal from './components/CompetitorAlertModal';
import SizeBreakdownTable from './components/SizeBreakdownTable';
import ClaudeMatchAgent from './components/ClaudeMatchAgent';
import ExportMenu from './components/ExportMenu';

// ── Types ──────────────────────────────────────────────────────────────────
interface PriceOverride {
  competitorPrice: number;
  updatedAt: string;
}

// ── Mini bar chart ─────────────────────────────────────────────────────────
function PriceHistoryChart({ product, competitorName }: { product: CompetitorProduct; competitorName: string }) {
  const maxPrice = Math.max(...product.monthlyHistory.map((m) => m.competitorPrice));
  const minPrice = Math.min(...product.monthlyHistory.map((m) => m.ourPrice));
  const range = maxPrice - minPrice || 1;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-red-400/60"></span> {competitorName}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-emerald-500"></span> Our Price
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-amber-400/70"></span> Sale Month
        </span>
      </div>

      <div className="flex items-end gap-1.5 h-32">
        {product.monthlyHistory.map((m) => {
          const compH = ((m.competitorPrice - minPrice) / range) * 80 + 10;
          const ourH  = ((m.ourPrice - minPrice) / range) * 80 + 10;
          return (
            <div key={m.monthShort} className="flex-1 flex flex-col items-center gap-0.5 group relative">
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] rounded-lg px-2.5 py-1.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                <p className="font-bold">{m.monthShort}</p>
                {m.hasSale && <p className="text-amber-300">{m.saleLabel}</p>}
                <p>{competitorName}: <span className="text-red-300">${m.competitorPrice.toFixed(2)}</span></p>
                <p>Ours: <span className="text-emerald-300">${m.ourPrice.toFixed(2)}</span></p>
                <p className="text-slate-400">Save: ${(m.competitorPrice - m.ourPrice).toFixed(2)}</p>
              </div>
              <div className="w-full flex gap-0.5 items-end" style={{ height: '100px' }}>
                <div
                  className={`flex-1 rounded-t ${m.hasSale ? 'bg-amber-400/70' : 'bg-red-400/60'} transition-all`}
                  style={{ height: `${compH}%` }}
                ></div>
                <div
                  className="flex-1 rounded-t bg-emerald-500 transition-all"
                  style={{ height: `${ourH}%` }}
                ></div>
              </div>
              <span className="text-[9px] text-slate-400 font-medium">{m.monthShort}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Monthly price table ────────────────────────────────────────────────────
function MonthlyTable({ product, competitorName }: { product: CompetitorProduct; competitorName: string }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-100">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50">
            <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Month</th>
            <th className="text-right px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">{competitorName}</th>
            <th className="text-right px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Our Price</th>
            <th className="text-right px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">You Save</th>
            <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Event</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {product.monthlyHistory.map((m) => {
            const savings = m.competitorPrice - m.ourPrice;
            const savePct = ((savings / m.competitorPrice) * 100).toFixed(0);
            return (
              <tr key={m.month} className={`hover:bg-slate-50/80 transition-colors ${m.hasSale ? 'bg-amber-50/30' : ''}`}>
                <td className="px-4 py-3 text-slate-700 font-medium text-sm">{m.month}</td>
                <td className="px-4 py-3 text-right font-semibold text-red-600">${m.competitorPrice.toFixed(2)}</td>
                <td className="px-4 py-3 text-right font-bold text-emerald-600">${m.ourPrice.toFixed(2)}</td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    ${savings.toFixed(2)} ({savePct}%)
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {m.hasSale ? (
                    <span className="inline-block bg-amber-100 text-amber-700 text-[11px] font-bold px-2 py-0.5 rounded-full">
                      {m.saleLabel}
                    </span>
                  ) : (
                    <span className="text-slate-300 text-xs">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function AdminCompetitorPricingPage() {
  const [pageMode, setPageMode] = useState<'pricewatch' | 'aiagent'>('pricewatch');
  const [competitorTab, setCompetitorTab] = useState<'blinds' | 'lowes'>('blinds');
  const [selectedProductId, setSelectedProductId] = useState<string>(competitorProducts[0].id);
  const [viewMode, setViewMode] = useState<'chart' | 'table' | 'sizes'>('sizes');
  const [showAlertSettings, setShowAlertSettings] = useState(false);

  // ── Price override state ────────────────────────────────────────────────
  const [priceOverrides, setPriceOverrides] = useState<Record<string, PriceOverride>>(() => {
    try { return JSON.parse(localStorage.getItem('competitor_price_overrides') ?? '{}'); }
    catch { return {}; }
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState<string>('');
  const [alertQueue, setAlertQueue] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('competitor_price_alerts_queue') ?? '[]'); }
    catch { return []; }
  });
  const [justSaved, setJustSaved] = useState<string | null>(null);

  // ── Helpers ─────────────────────────────────────────────────────────────
  const getEffectiveCompetitorPrice = (p: CompetitorProduct) =>
    priceOverrides[p.id]?.competitorPrice ?? p.currentCompetitorPrice;

  const getEffectiveOurPrice = (p: CompetitorProduct) =>
    Math.round(getEffectiveCompetitorPrice(p) * 0.85 * 100) / 100;

  const hasAlert = (id: string) => alertQueue.some((a) => a.productId === id && !a.dismissed);

  const unreadAlertCount = alertQueue.filter((a) => !a.dismissed).length;

  const alertEnabled = localStorage.getItem('competitor_alert_enabled') === 'true'
    && !!localStorage.getItem('competitor_alert_email');

  const handlePriceUpdate = (p: CompetitorProduct) => {
    const newPrice = parseFloat(editingPrice);
    if (isNaN(newPrice) || newPrice <= 0) { setEditingId(null); return; }

    // Save override
    const newOverrides: Record<string, PriceOverride> = {
      ...priceOverrides,
      [p.id]: { competitorPrice: newPrice, updatedAt: new Date().toISOString() },
    };
    setPriceOverrides(newOverrides);
    localStorage.setItem('competitor_price_overrides', JSON.stringify(newOverrides));

    // Check threshold — alert if competitor is within threshold% of our price
    const threshold = Number(localStorage.getItem('competitor_alert_threshold') ?? '5');
    const baseOurPrice = p.ourPrice; // keep original baseline price
    const alertZone = baseOurPrice * (1 + threshold / 100);

    if (newPrice <= alertZone) {
      const alert = {
        id: `alert-${p.id}-${Date.now()}`,
        productId: p.id,
        productName: p.name,
        competitor: p.competitorName,
        newPrice,
        ourPrice: baseOurPrice,
        timestamp: new Date().toISOString(),
        notified: false,
        dismissed: false,
      };
      const existing: any[] = JSON.parse(localStorage.getItem('competitor_price_alerts_queue') ?? '[]');
      const updated = [alert, ...existing];
      localStorage.setItem('competitor_price_alerts_queue', JSON.stringify(updated));
      setAlertQueue(updated);
    }

    setJustSaved(p.id);
    setTimeout(() => setJustSaved(null), 2000);
    setEditingId(null);
    setEditingPrice('');
  };

  const handleDismissAlert = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = alertQueue.map((a) =>
      a.productId === productId ? { ...a, dismissed: true } : a
    );
    setAlertQueue(updated);
    localStorage.setItem('competitor_price_alerts_queue', JSON.stringify(updated));
  };

  const handleCancelEdit = () => { setEditingId(null); setEditingPrice(''); };

  // ── Derived data ────────────────────────────────────────────────────────
  const activeProducts = competitorTab === 'blinds' ? competitorProducts : lowesProducts;
  const activeSummary  = competitorTab === 'blinds' ? competitorSummary  : lowesSummary;
  const competitorLabel = competitorTab === 'blinds' ? 'Blinds.com' : "Lowe's";
  const competitorUrl   = competitorTab === 'blinds'
    ? 'https://www.blinds.com'
    : 'https://www.lowes.com/search?searchTerm=blinds';

  const resolvedSelectedId = useMemo(() => {
    const exists = activeProducts.find((p) => p.id === selectedProductId);
    return exists ? selectedProductId : activeProducts[0].id;
  }, [competitorTab, activeProducts, selectedProductId]);

  const selectedProduct = activeProducts.find((p) => p.id === resolvedSelectedId)!;

  const totalCompetitorAvg =
    activeProducts.reduce((s, p) => s + getEffectiveCompetitorPrice(p), 0) / activeProducts.length;
  const totalOurAvg =
    activeProducts.reduce((s, p) => s + getEffectiveOurPrice(p), 0) / activeProducts.length;
  const totalSavings = totalCompetitorAvg - totalOurAvg;

  return (
    <div className="p-8 space-y-8">

      {showAlertSettings && (
        <CompetitorAlertModal onClose={() => setShowAlertSettings(false)} />
      )}

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <i className="ri-price-tag-3-line text-emerald-600 text-xl"></i>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Competitor Price Watch</h2>
              <p className="text-sm text-slate-500">We are always 15% cheaper than the competition</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Price Alert Settings button */}
          <button
            onClick={() => setShowAlertSettings(true)}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border cursor-pointer whitespace-nowrap transition-colors ${
              alertEnabled
                ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <i className="ri-alarm-warning-line text-base"></i>
            {alertEnabled ? 'Price Alerts ON' : 'Set Up Price Alerts'}
            {alertEnabled && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
            {unreadAlertCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
                {unreadAlertCount}
              </span>
            )}
          </button>

          <a
            href={competitorUrl}
            target="_blank"
            rel="nofollow noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-external-link-line"></i> Visit {competitorLabel}
          </a>

          <ExportMenu
            products={activeProducts}
            selectedProduct={selectedProduct}
            priceOverrides={priceOverrides}
            competitorLabel={competitorLabel}
          />
          <div className="text-right">
            <p className="text-xs text-slate-400">Last checked</p>
            <p className="text-sm font-semibold text-slate-700">March 18, 2026</p>
          </div>
        </div>
      </div>

      {/* ── Active alert banner ── */}
      {unreadAlertCount > 0 && (
        <div className="flex items-center gap-4 bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
            <i className="ri-alarm-warning-line text-red-600 text-xl"></i>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-red-800">
              {unreadAlertCount} price alert{unreadAlertCount > 1 ? 's' : ''} require your attention
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              A competitor has dropped their price into your warning zone. Review the highlighted products below.
            </p>
          </div>
          <button
            onClick={() => {
              const updated = alertQueue.map((a) => ({ ...a, dismissed: true }));
              setAlertQueue(updated);
              localStorage.setItem('competitor_price_alerts_queue', JSON.stringify(updated));
            }}
            className="text-xs font-semibold text-red-600 hover:text-red-800 underline cursor-pointer whitespace-nowrap"
          >
            Dismiss all
          </button>
        </div>
      )}

      {/* ── Page Mode Toggle ── */}
      <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        <button
          onClick={() => setPageMode('pricewatch')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors cursor-pointer whitespace-nowrap ${
            pageMode === 'pricewatch'
              ? 'bg-white text-slate-900'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-price-tag-3-line"></i></div>
          Price Watch
        </button>
        <button
          onClick={() => setPageMode('aiagent')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors cursor-pointer whitespace-nowrap ${
            pageMode === 'aiagent'
              ? 'bg-white text-slate-900'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-sparkling-2-fill"></i></div>
          AI Match Agent
          <span className="inline-flex items-center bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">Claude</span>
        </button>
      </div>

      {/* ── AI Match Agent Panel ── */}
      {pageMode === 'aiagent' && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <ClaudeMatchAgent competitor={competitorTab} />
        </div>
      )}

      {/* ── Price Watch Content ── */}
      {pageMode === 'pricewatch' && (<>

      {/* ── Competitor Tab Toggle ── */}
      <div className="flex items-center gap-3">
        <p className="text-sm font-semibold text-slate-500">Viewing competitor:</p>
        <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
          <button
            onClick={() => setCompetitorTab('blinds')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors cursor-pointer whitespace-nowrap ${
              competitorTab === 'blinds'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-store-2-line"></i></div>
            Blinds.com
          </button>
          <button
            onClick={() => setCompetitorTab('lowes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors cursor-pointer whitespace-nowrap ${
              competitorTab === 'lowes'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-building-4-line"></i></div>
            Lowe's
          </button>
        </div>
        <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">
          {activeProducts.length} products tracked
        </span>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
              <i className="ri-store-2-line text-slate-600"></i>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Products Tracked</p>
          </div>
          <p className="text-3xl font-bold text-slate-900">{activeSummary.productsTracked}</p>
          <p className="text-xs text-slate-500 mt-1">From {competitorLabel} catalog</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
              <i className="ri-price-tag-2-line text-red-500"></i>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Their Avg. Price</p>
          </div>
          <p className="text-3xl font-bold text-red-600">${totalCompetitorAvg.toFixed(2)}</p>
          <p className="text-xs text-slate-500 mt-1">{competitorLabel} current average</p>
        </div>

        <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
              <i className="ri-price-tag-3-line text-emerald-600"></i>
            </div>
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Our Avg. Price</p>
          </div>
          <p className="text-3xl font-bold text-emerald-700">${totalOurAvg.toFixed(2)}</p>
          <p className="text-xs text-emerald-600 mt-1">Always 15% less</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
              <i className="ri-money-dollar-circle-line text-amber-600"></i>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg. Customer Savings</p>
          </div>
          <p className="text-3xl font-bold text-amber-600">${totalSavings.toFixed(2)}</p>
          <p className="text-xs text-slate-500 mt-1">Per product vs {competitorLabel}</p>
        </div>
      </div>

      {/* ── Current Price Comparison Table ── */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">Current Price Comparison</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click <i className="ri-pencil-line"></i> on any competitor price to update it — alerts fire automatically
            </p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold text-emerald-700">Prices current as of Mar 2026</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Product</th>
                <th className="text-left pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Category</th>
                <th className="text-right pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {competitorLabel} Price <span className="normal-case font-normal text-slate-300">(click to update)</span>
                </th>
                <th className="text-right pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Our Price</th>
                <th className="text-right pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Savings</th>
                <th className="text-left pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider pl-6">Competitor Product</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {activeProducts.map((p) => {
                const effComp = getEffectiveCompetitorPrice(p);
                const effOur  = getEffectiveOurPrice(p);
                const savings = effComp - effOur;
                const savePct = savings > 0 ? ((savings / effComp) * 100).toFixed(0) : '0';
                const isAlert = hasAlert(p.id);
                const isEditing = editingId === p.id;
                const isOverridden = !!priceOverrides[p.id];
                const isSaved = justSaved === p.id;
                const isPriceThreat = savings <= 0;

                return (
                  <tr
                    key={p.id}
                    onClick={() => !isEditing && setSelectedProductId(p.id)}
                    className={`cursor-pointer transition-colors ${
                      isAlert
                        ? 'bg-red-50/60'
                        : resolvedSelectedId === p.id
                          ? 'bg-emerald-50/60'
                          : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Product name */}
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-2.5">
                        {isAlert && (
                          <div className="w-5 h-5 flex items-center justify-center shrink-0">
                            <i className="ri-alarm-warning-line text-red-500 text-sm animate-pulse"></i>
                          </div>
                        )}
                        {!isAlert && resolvedSelectedId === p.id && (
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0"></div>
                        )}
                        <div>
                          <span className="font-bold text-slate-900">{p.name}</span>
                          {isOverridden && (
                            <span className="ml-2 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
                              Updated
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 pr-4">
                      <span className="bg-slate-100 text-slate-600 text-xs font-medium px-2.5 py-1 rounded-full">
                        {p.category}
                      </span>
                    </td>

                    {/* Competitor price — editable */}
                    <td className="py-4 pr-4 text-right" onClick={(e) => e.stopPropagation()}>
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-slate-400 text-sm">$</span>
                          <input
                            type="number"
                            value={editingPrice}
                            onChange={(e) => setEditingPrice(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handlePriceUpdate(p); if (e.key === 'Escape') handleCancelEdit(); }}
                            className="w-20 text-sm text-right border border-slate-300 focus:border-emerald-400 rounded-lg px-2 py-1 outline-none"
                            step="0.01"
                            min="0"
                            autoFocus
                          />
                          <button
                            onClick={() => handlePriceUpdate(p)}
                            className="w-6 h-6 flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white rounded cursor-pointer transition-colors"
                          >
                            <i className="ri-check-line text-xs"></i>
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="w-6 h-6 flex items-center justify-center bg-slate-200 hover:bg-slate-300 text-slate-600 rounded cursor-pointer transition-colors"
                          >
                            <i className="ri-close-line text-xs"></i>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2 group">
                          <div className="flex items-center gap-1.5">
                            {isSaved && (
                              <span className="text-[10px] font-bold text-emerald-600">
                                <i className="ri-check-line"></i> Saved
                              </span>
                            )}
                            <span className={`font-semibold text-base ${isPriceThreat ? 'text-red-700 font-black' : 'text-red-600'}`}>
                              ${effComp.toFixed(2)}
                            </span>
                          </div>
                          <button
                            onClick={() => { setEditingId(p.id); setEditingPrice(effComp.toFixed(2)); }}
                            className="w-5 h-5 flex items-center justify-center rounded text-slate-300 hover:text-slate-600 opacity-0 group-hover:opacity-100 cursor-pointer transition-all"
                            title="Update price"
                          >
                            <i className="ri-pencil-line text-xs"></i>
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Our price */}
                    <td className="py-4 pr-4 text-right">
                      <span className={`font-bold text-base ${isPriceThreat ? 'text-slate-500 line-through' : 'text-emerald-600'}`}>
                        ${effOur.toFixed(2)}
                      </span>
                      {isPriceThreat && (
                        <p className="text-[10px] text-red-600 font-bold mt-0.5">They beat us!</p>
                      )}
                    </td>

                    {/* Savings */}
                    <td className="py-4 pr-4 text-right">
                      {savings > 0 ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">
                          <i className="ri-arrow-down-line text-xs"></i>
                          ${savings.toFixed(2)} ({savePct}% less)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-red-50 border border-red-200 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full">
                          <i className="ri-alarm-warning-line text-xs"></i>
                          Price threat!
                        </span>
                      )}
                    </td>

                    {/* Competitor product + alert dismiss */}
                    <td className="py-4 pl-6">
                      <div className="max-w-xs">
                        <p className="text-xs text-slate-600 truncate">{p.competitorProductName}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <a
                            href={p.competitorUrl}
                            target="_blank"
                            rel="nofollow noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[11px] text-slate-400 hover:text-slate-600 underline underline-offset-2 transition-colors"
                          >
                            View on {competitorLabel} →
                          </a>
                          {isAlert && (
                            <button
                              onClick={(e) => handleDismissAlert(p.id, e)}
                              className="text-[11px] text-red-400 hover:text-red-600 font-semibold cursor-pointer whitespace-nowrap transition-colors"
                            >
                              Dismiss alert
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Update price tip */}
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
          <i className="ri-information-line text-slate-300"></i>
          Hover any competitor price and click the pencil icon to update it. If the new price is within your alert threshold, an alert fires automatically.
        </div>
      </div>

      {/* ── Price History Section ── */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {viewMode === 'sizes' ? 'Size & Price Breakdown' : 'Price History'} — {selectedProduct.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {viewMode === 'sizes'
                ? `${selectedProduct.sizes.length} standard sizes · prices from ${competitorLabel} vs ours`
                : '12-month trend · click a product above to switch'}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode('sizes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                viewMode === 'sizes' ? 'bg-white text-slate-900' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <i className="ri-ruler-line mr-1"></i>Sizes
            </button>
            <button
              onClick={() => setViewMode('chart')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                viewMode === 'chart' ? 'bg-white text-slate-900' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <i className="ri-bar-chart-2-line mr-1"></i>Chart
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                viewMode === 'table' ? 'bg-white text-slate-900' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <i className="ri-table-line mr-1"></i>History
            </button>
          </div>
        </div>

        {/* Product pill selector */}
        <div className="flex items-center gap-2 flex-wrap mb-6">
          {activeProducts.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedProductId(p.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap border ${
                resolvedSelectedId === p.id
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
              }`}
            >
              {p.name}
              {hasAlert(p.id) && <i className="ri-alarm-warning-line text-red-400 ml-1.5"></i>}
            </button>
          ))}
        </div>

        {selectedProduct.notes && viewMode !== 'sizes' && (
          <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-5 text-sm text-amber-800">
            <i className="ri-information-line text-amber-500 shrink-0 mt-0.5"></i>
            <p>{selectedProduct.notes}</p>
          </div>
        )}

        {viewMode === 'sizes' && (
          <SizeBreakdownTable product={selectedProduct} competitorName={competitorLabel} />
        )}

        {viewMode === 'chart' && (
          <PriceHistoryChart product={selectedProduct} competitorName={competitorLabel} />
        )}

        {viewMode === 'table' && (
          <MonthlyTable product={selectedProduct} competitorName={competitorLabel} />
        )}

        {/* Sale season guide — only for chart/table */}
        {viewMode !== 'sizes' && (
          <div className="mt-6 grid grid-cols-4 gap-3">
            {[
              { label: 'Spring Sale',            months: 'Mar – Apr', color: 'bg-green-50 border-green-100 text-green-700' },
              { label: 'Summer Deal',            months: 'Jun – Jul', color: 'bg-yellow-50 border-yellow-100 text-yellow-700' },
              { label: 'Fall Event',             months: 'Sep – Oct', color: 'bg-orange-50 border-orange-100 text-orange-700' },
              { label: 'Black Friday / Holiday', months: 'Nov – Dec', color: 'bg-red-50 border-red-100 text-red-700' },
            ].map((s) => (
              <div key={s.label} className={`rounded-xl border px-4 py-3 ${s.color}`}>
                <p className="text-xs font-bold">{s.label}</p>
                <p className="text-[11px] mt-0.5 opacity-75">{s.months} · {competitorLabel} drops prices</p>
                <p className="text-[11px] mt-0.5 font-semibold">We stay 15% cheaper</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Pricing Strategy Box ── */}
      <div className="bg-slate-900 rounded-2xl p-6 flex items-start gap-6">
        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
          <i className="ri-shield-check-line text-white text-2xl"></i>
        </div>
        <div className="flex-1">
          <h3 className="text-base font-bold text-white mb-1">Our Pricing Strategy</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            We monitor {competitorLabel} prices across all tracked product categories and automatically set our prices
            <strong className="text-emerald-400"> 15% below their current pricing</strong> — including during their
            seasonal sale events. Use the <strong className="text-white">Update Price</strong> button on any product
            to record a new competitor price. If it drops into your alert zone, you&apos;ll get notified instantly.
          </p>
        </div>
        <div className="shrink-0 text-center bg-white/10 rounded-xl px-5 py-3">
          <p className="text-3xl font-black text-emerald-400">15%</p>
          <p className="text-xs text-slate-400 mt-0.5 whitespace-nowrap">Always cheaper</p>
        </div>
      </div>

      </>)}

    </div>
  );
}
