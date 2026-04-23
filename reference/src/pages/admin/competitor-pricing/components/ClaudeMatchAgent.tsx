import { useState, useEffect } from 'react';
import { competitorProducts, lowesProducts, type CompetitorProduct } from '../../../../mocks/competitorPricing';
import { products as ourProducts } from '../../../../mocks/products';

const EDGE_URL = 'https://xvxylzvkdljvgunvotqv.supabase.co/functions/v1/claude-product-matcher';
const STORAGE_KEY = 'claude_product_matches';

type Competitor = 'blinds' | 'lowes';

interface AltMatch {
  name: string;
  url: string;
  price: number;
}

interface AIMatchResult {
  competitorProductName: string;
  competitorUrl: string;
  estimatedPrice: number;
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
  matchNotes: string;
  alternativeMatches?: AltMatch[];
}

type MatchStatus = 'idle' | 'running' | 'done' | 'error' | 'accepted' | 'rejected';

interface ProductMatchState {
  productId: string;
  productName: string;
  category: string;
  ourPrice: number;
  competitor: Competitor;
  currentMatch: { name: string; url: string; price: number } | null;
  status: MatchStatus;
  aiResult: AIMatchResult | null;
  errorMsg: string | null;
  acceptedAt?: string;
  rejectedAt?: string;
}

const SUPABASE_URL = import.meta.env.VITE_PUBLIC_SUPABASE_URL ?? '';

function confidenceBadge(c: 'high' | 'medium' | 'low') {
  const map = {
    high:   { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',  icon: 'ri-checkbox-circle-fill',  label: 'High Confidence' },
    medium: { bg: 'bg-amber-50 text-amber-700 border-amber-200',        icon: 'ri-error-warning-fill',    label: 'Medium Confidence' },
    low:    { bg: 'bg-red-50 text-red-700 border-red-200',              icon: 'ri-question-fill',         label: 'Low Confidence' },
  };
  const { bg, icon, label } = map[c];
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${bg}`}>
      <i className={`${icon} text-xs`}></i>{label}
    </span>
  );
}

function loadSaved(): Record<string, ProductMatchState> {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}'); }
  catch { return {}; }
}

function buildInitialStates(competitor: Competitor): ProductMatchState[] {
  const saved = loadSaved();
  const compProducts = competitor === 'blinds' ? competitorProducts : lowesProducts;

  return ourProducts.map((p) => {
    const compMatch = compProducts.find(
      (cp) => cp.name.toLowerCase() === p.name.toLowerCase()
    );
    const key = `${competitor}::${p.id}`;
    const existing = saved[key];

    return existing
      ? existing
      : {
          productId: String(p.id),
          productName: p.name,
          category: p.category,
          ourPrice: p.price,
          competitor,
          currentMatch: compMatch
            ? {
                name: compMatch.competitorProductName,
                url: compMatch.competitorUrl,
                price: compMatch.currentCompetitorPrice,
              }
            : null,
          status: 'idle' as MatchStatus,
          aiResult: null,
          errorMsg: null,
        };
  });
}

export default function ClaudeMatchAgent({ competitor }: { competitor: Competitor }) {
  const [states, setStates] = useState<ProductMatchState[]>(() => buildInitialStates(competitor));
  const [runningAll, setRunningAll] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | MatchStatus>('all');

  // Re-init when competitor tab switches
  useEffect(() => {
    setStates(buildInitialStates(competitor));
    setExpandedId(null);
    setFilterStatus('all');
  }, [competitor]);

  const competitorLabel = competitor === 'blinds' ? 'Blinds.com' : "Lowe's";

  const saveState = (updated: ProductMatchState[], comp: Competitor) => {
    const saved = loadSaved();
    updated.forEach((s) => { saved[`${comp}::${s.productId}`] = s; });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  };

  const runMatch = async (productId: string) => {
    const idx = states.findIndex((s) => s.productId === productId);
    if (idx === -1) return;

    const updated = [...states];
    updated[idx] = { ...updated[idx], status: 'running', errorMsg: null, aiResult: null };
    setStates(updated);

    const s = updated[idx];
    try {
      const res = await fetch(EDGE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: s.productName,
          category: s.category,
          ourPrice: s.ourPrice,
          competitor,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        const errMsg = data.error ?? 'Unknown error';
        if (errMsg.includes('ANTHROPIC_API_KEY')) {
          setApiKeyMissing(true);
        }
        updated[idx] = { ...updated[idx], status: 'error', errorMsg: errMsg };
        setStates([...updated]);
        saveState(updated, competitor);
        return;
      }

      const final = [...updated];
      final[idx] = { ...updated[idx], status: 'done', aiResult: data.match };
      setStates(final);
      saveState(final, competitor);
      setExpandedId(productId);
    } catch (err) {
      const final = [...updated];
      final[idx] = { ...updated[idx], status: 'error', errorMsg: String(err) };
      setStates(final);
      saveState(final, competitor);
    }
  };

  const runAll = async () => {
    setRunningAll(true);
    const toRun = states.filter((s) => s.status !== 'accepted');
    for (const s of toRun) {
      await runMatch(s.productId);
      // Small delay to avoid rate limits
      await new Promise((r) => setTimeout(r, 800));
    }
    setRunningAll(false);
  };

  const acceptMatch = (productId: string) => {
    setStates((prev) => {
      const updated = prev.map((s) => {
        if (s.productId !== productId) return s;
        const accepted: ProductMatchState = {
          ...s,
          status: 'accepted',
          acceptedAt: new Date().toISOString(),
          currentMatch: s.aiResult
            ? { name: s.aiResult.competitorProductName, url: s.aiResult.competitorUrl, price: s.aiResult.estimatedPrice }
            : s.currentMatch,
        };
        return accepted;
      });
      saveState(updated, competitor);
      return updated;
    });
  };

  const rejectMatch = (productId: string) => {
    setStates((prev) => {
      const updated = prev.map((s) =>
        s.productId === productId
          ? { ...s, status: 'rejected' as MatchStatus, rejectedAt: new Date().toISOString() }
          : s
      );
      saveState(updated, competitor);
      return updated;
    });
  };

  const resetMatch = (productId: string) => {
    setStates((prev) => {
      const updated = prev.map((s) =>
        s.productId === productId
          ? { ...s, status: 'idle' as MatchStatus, aiResult: null, errorMsg: null }
          : s
      );
      saveState(updated, competitor);
      return updated;
    });
  };

  const counts = {
    all: states.length,
    idle: states.filter((s) => s.status === 'idle').length,
    done: states.filter((s) => s.status === 'done').length,
    accepted: states.filter((s) => s.status === 'accepted').length,
    rejected: states.filter((s) => s.status === 'rejected').length,
    error: states.filter((s) => s.status === 'error').length,
    running: states.filter((s) => s.status === 'running').length,
  };

  const filtered = filterStatus === 'all' ? states : states.filter((s) => s.status === filterStatus);

  const statusPill = (s: MatchStatus) => {
    const map: Record<string, string> = {
      idle:     'bg-slate-100 text-slate-500',
      running:  'bg-amber-50 text-amber-600 animate-pulse',
      done:     'bg-sky-50 text-sky-700',
      accepted: 'bg-emerald-50 text-emerald-700',
      rejected: 'bg-red-50 text-red-600',
      error:    'bg-red-50 text-red-700',
    };
    const label: Record<string, string> = {
      idle:     'Not run',
      running:  'Analyzing...',
      done:     'Review needed',
      accepted: 'Accepted',
      rejected: 'Rejected',
      error:    'Error',
    };
    return (
      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${map[s]}`}>
        {s === 'running' && <i className="ri-loader-4-line animate-spin text-xs"></i>}
        {s === 'accepted' && <i className="ri-check-line text-xs"></i>}
        {s === 'rejected' && <i className="ri-close-line text-xs"></i>}
        {s === 'error' && <i className="ri-error-warning-line text-xs"></i>}
        {s === 'done' && <i className="ri-sparkling-fill text-xs"></i>}
        {label[s]}
      </span>
    );
  };

  return (
    <div className="space-y-5">

      {/* API Key Missing Banner */}
      {apiKeyMissing && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
          <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
            <i className="ri-key-2-line text-amber-600 text-lg"></i>
          </div>
          <div>
            <p className="text-sm font-bold text-amber-900">Anthropic API Key Required</p>
            <p className="text-xs text-amber-700 mt-1">
              To use Claude product matching, add your Anthropic API key to Supabase Edge Function secrets:
            </p>
            <ol className="text-xs text-amber-700 mt-2 space-y-1 list-decimal list-inside">
              <li>Go to your Supabase Dashboard → Edge Functions → Secrets</li>
              <li>Add a secret named <code className="bg-amber-100 px-1 rounded font-mono">ANTHROPIC_API_KEY</code></li>
              <li>Paste your API key from <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="underline">console.anthropic.com</a></li>
            </ol>
          </div>
          <button onClick={() => setApiKeyMissing(false)} className="ml-auto shrink-0 text-amber-500 hover:text-amber-700 cursor-pointer">
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>
      )}

      {/* Header + Run All */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center">
              <i className="ri-sparkling-2-fill text-white text-base"></i>
            </div>
            <h3 className="text-base font-bold text-slate-900">Claude AI Product Match Agent</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1 ml-10">
            Claude analyzes each product and finds the exact matching item on {competitorLabel} with product URL, name, and price.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right text-xs text-slate-500">
            <span className="font-bold text-emerald-600">{counts.accepted}</span> accepted ·{' '}
            <span className="font-bold text-sky-600">{counts.done}</span> pending review
          </div>
          <button
            onClick={runAll}
            disabled={runningAll || counts.running > 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl cursor-pointer whitespace-nowrap transition-all"
          >
            {runningAll ? (
              <><i className="ri-loader-4-line animate-spin text-base"></i> Matching All...</>
            ) : (
              <><i className="ri-sparkling-2-fill text-base"></i> Run AI Match All</>
            )}
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: 'Total Products', value: counts.all, color: 'text-slate-700', bg: 'bg-slate-50 border-slate-100' },
          { label: 'AI Suggestions Ready', value: counts.done, color: 'text-sky-700', bg: 'bg-sky-50 border-sky-100' },
          { label: 'Accepted Matches', value: counts.accepted, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100' },
          { label: 'Rejected', value: counts.rejected, color: 'text-red-600', bg: 'bg-red-50 border-red-100' },
          { label: 'Errors', value: counts.error, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-100' },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-xl border p-3 ${stat.bg}`}>
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <p className="text-xs font-semibold text-slate-400">Filter:</p>
        {(['all', 'idle', 'done', 'accepted', 'rejected', 'error'] as const).map((f) => {
          const c = f === 'all' ? counts.all : counts[f as keyof typeof counts];
          return (
            <button
              key={f}
              onClick={() => setFilterStatus(f as 'all' | MatchStatus)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap border ${
                filterStatus === f
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
              }`}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)} ({c})
            </button>
          );
        })}
      </div>

      {/* Product rows */}
      <div className="space-y-2">
        {filtered.map((s) => {
          const isExpanded = expandedId === s.productId;
          return (
            <div key={s.productId} className={`rounded-xl border transition-all ${
              s.status === 'accepted' ? 'border-emerald-200 bg-emerald-50/30' :
              s.status === 'done'     ? 'border-sky-200 bg-sky-50/20' :
              s.status === 'error'    ? 'border-red-200 bg-red-50/20' :
              'border-slate-100 bg-white'
            }`}>
              {/* Row header */}
              <div className="flex items-center gap-3 px-4 py-3">
                {/* Product info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-900 truncate">{s.productName}</p>
                    {statusPill(s.status)}
                    {s.aiResult && s.status === 'done' && confidenceBadge(s.aiResult.confidence)}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-slate-400">Our price: <span className="font-semibold text-slate-600">${s.ourPrice.toFixed(2)}</span></span>
                    {s.currentMatch && (
                      <span className="text-xs text-slate-400">
                        Current match: <span className="font-medium text-slate-600 truncate">{s.currentMatch.name}</span>
                      </span>
                    )}
                    {!s.currentMatch && (
                      <span className="text-xs text-amber-600 font-semibold">No match yet</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {s.status === 'done' && (
                    <>
                      <button
                        onClick={() => acceptMatch(s.productId)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg cursor-pointer whitespace-nowrap transition-colors"
                      >
                        <i className="ri-check-line"></i> Accept
                      </button>
                      <button
                        onClick={() => rejectMatch(s.productId)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-lg cursor-pointer whitespace-nowrap transition-colors border border-red-200"
                      >
                        <i className="ri-close-line"></i> Reject
                      </button>
                    </>
                  )}

                  {(s.status === 'rejected' || s.status === 'error' || s.status === 'accepted') && (
                    <button
                      onClick={() => resetMatch(s.productId)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg cursor-pointer whitespace-nowrap transition-colors"
                    >
                      <i className="ri-refresh-line text-xs"></i> Re-run
                    </button>
                  )}

                  {(s.status === 'idle' || s.status === 'error') && (
                    <button
                      onClick={() => runMatch(s.productId)}
                      disabled={runningAll}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg cursor-pointer whitespace-nowrap transition-all"
                    >
                      <i className="ri-sparkling-fill text-xs"></i> Match
                    </button>
                  )}

                  {s.status === 'running' && (
                    <span className="flex items-center gap-1.5 text-xs text-violet-600 font-semibold px-3">
                      <i className="ri-loader-4-line animate-spin"></i> Analyzing...
                    </span>
                  )}

                  {/* Expand/collapse when there's result */}
                  {(s.status === 'done' || s.status === 'accepted') && (
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : s.productId)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
                    >
                      <i className={`ri-arrow-${isExpanded ? 'up' : 'down'}-s-line`}></i>
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded AI result */}
              {isExpanded && s.aiResult && (
                <div className="px-4 pb-4 border-t border-slate-100">
                  <div className="pt-4 space-y-4">
                    {/* Main match result */}
                    <div className="bg-gradient-to-r from-violet-50 to-fuchsia-50 border border-violet-100 rounded-xl p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <i className="ri-sparkling-2-fill text-violet-500"></i>
                            <p className="text-xs font-bold text-violet-700 uppercase tracking-wider">Claude&apos;s Best Match</p>
                            {confidenceBadge(s.aiResult.confidence)}
                          </div>
                          <p className="text-sm font-bold text-slate-900">{s.aiResult.competitorProductName}</p>
                          <a
                            href={s.aiResult.competitorUrl}
                            target="_blank"
                            rel="nofollow noopener noreferrer"
                            className="text-xs text-violet-600 hover:text-violet-800 underline underline-offset-2 mt-0.5 block truncate"
                          >
                            {s.aiResult.competitorUrl}
                          </a>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-slate-400">Starting price</p>
                          <p className="text-xl font-black text-red-600">${s.aiResult.estimatedPrice.toFixed(2)}</p>
                          <p className="text-xs text-emerald-600 font-semibold mt-0.5">
                            We charge ${s.ourPrice.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Reasoning + Notes */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          <i className="ri-chat-ai-line mr-1"></i>Claude&apos;s Reasoning
                        </p>
                        <p className="text-xs text-slate-700 leading-relaxed">{s.aiResult.reasoning}</p>
                      </div>
                      <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                        <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider mb-1.5">
                          <i className="ri-information-line mr-1"></i>Match Notes
                        </p>
                        <p className="text-xs text-amber-800 leading-relaxed">{s.aiResult.matchNotes}</p>
                      </div>
                    </div>

                    {/* Alternative matches */}
                    {s.aiResult.alternativeMatches && s.aiResult.alternativeMatches.length > 0 && (
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                          Alternative Matches
                        </p>
                        <div className="space-y-1.5">
                          {s.aiResult.alternativeMatches.map((alt, i) => (
                            <div key={i} className="flex items-center justify-between bg-white border border-slate-100 rounded-lg px-3 py-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-700 truncate">{alt.name}</p>
                                <a
                                  href={alt.url}
                                  target="_blank"
                                  rel="nofollow noopener noreferrer"
                                  className="text-[11px] text-slate-400 hover:text-slate-600 underline truncate block"
                                >
                                  {alt.url}
                                </a>
                              </div>
                              <span className="text-sm font-bold text-red-600 ml-3 shrink-0">${alt.price.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Compare: current vs AI */}
                    {s.currentMatch && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="border border-slate-200 rounded-xl p-3">
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                            Current Match (Manual)
                          </p>
                          <p className="text-xs font-semibold text-slate-700">{s.currentMatch.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">${s.currentMatch.price.toFixed(2)}</p>
                        </div>
                        <div className="border border-violet-200 bg-violet-50/30 rounded-xl p-3">
                          <p className="text-[11px] font-bold text-violet-500 uppercase tracking-wider mb-1.5">
                            AI Suggested Match
                          </p>
                          <p className="text-xs font-semibold text-slate-700">{s.aiResult.competitorProductName}</p>
                          <p className="text-xs text-slate-500 mt-0.5">${s.aiResult.estimatedPrice.toFixed(2)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Error state */}
              {s.status === 'error' && s.errorMsg && (
                <div className="px-4 pb-3 border-t border-red-100">
                  <p className="text-xs text-red-600 mt-2">
                    <i className="ri-error-warning-line mr-1"></i>
                    {s.errorMsg}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom note */}
      <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
        <i className="ri-information-line shrink-0"></i>
        <span>
          Claude uses its training knowledge of {competitorLabel}&apos;s product catalog to suggest the best match.
          Always verify the URL and price before accepting. Accepted matches are stored locally and used in price comparisons.
          Requires <code className="font-mono bg-slate-100 px-1 rounded">ANTHROPIC_API_KEY</code> in Supabase Edge Function secrets.
        </span>
      </div>
    </div>
  );
}
