import { useState } from 'react';
import type { RestockEntry } from '../page';

interface Props {
  productId: number;
  productName: string;
  currentInventory: number;
  history: RestockEntry[];
  onRestock: (qty: number, note: string) => void;
}

export default function RestockHistoryTab({
  productId,
  productName,
  currentInventory,
  history,
  onRestock,
}: Props) {
  const [qty, setQty] = useState<string>('');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleAdd = () => {
    const amount = parseInt(qty, 10);
    if (isNaN(amount) || amount <= 0) return;
    onRestock(amount, note.trim());
    setQty('');
    setNote('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2500);
  };

  const sortedHistory = [...history]
    .filter((e) => e.productId === productId)
    .sort((a, b) => b.timestamp - a.timestamp);

  const totalRestocked = sortedHistory.reduce((s, e) => s + e.qty, 0);

  return (
    <div className="space-y-6">
      {/* Add restock entry */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-5">
        <p className="text-sm font-bold text-green-800 mb-1 flex items-center gap-2">
          <span className="w-5 h-5 flex items-center justify-center">
            <i className="ri-add-box-line text-base"></i>
          </span>
          Log a Restock
        </p>
        <p className="text-xs text-green-600 mb-4">
          Current stock: <strong>{currentInventory} units</strong>
        </p>
        <div className="flex gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Units Added <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdd(); } }}
              placeholder="e.g. 50"
              className="w-28 px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 bg-white"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Note <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdd(); } }}
              placeholder="e.g. Supplier delivery, PO #1042"
              maxLength={120}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 bg-white"
            />
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!qty || parseInt(qty, 10) <= 0}
            className="px-5 py-2.5 bg-green-700 text-white text-sm font-semibold rounded-lg hover:bg-green-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
          >
            <span className="flex items-center gap-1.5">
              <i className="ri-add-line"></i>
              Add
            </span>
          </button>
        </div>
        {submitted && (
          <div className="mt-3 flex items-center gap-2 text-xs text-green-700 font-semibold">
            <span className="w-4 h-4 flex items-center justify-center">
              <i className="ri-checkbox-circle-fill text-green-600"></i>
            </span>
            Restock logged successfully!
          </div>
        )}
      </div>

      {/* Summary stats */}
      {sortedHistory.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Restocks', value: sortedHistory.length, icon: 'ri-history-line', color: 'text-slate-700', bg: 'bg-slate-50' },
            { label: 'Units Added (All Time)', value: totalRestocked.toLocaleString(), icon: 'ri-stack-line', color: 'text-green-700', bg: 'bg-green-50' },
            { label: 'Last Restock', value: sortedHistory[0] ? new Date(sortedHistory[0].timestamp).toLocaleDateString() : '—', icon: 'ri-calendar-check-line', color: 'text-amber-600', bg: 'bg-amber-50' },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-xl border border-slate-200 p-4 flex items-center gap-3`}>
              <div className={`w-8 h-8 flex items-center justify-center rounded-lg bg-white ${s.color}`}>
                <i className={`${s.icon} text-base`}></i>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 leading-tight">{s.label}</p>
                <p className="text-sm font-bold text-slate-900">{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* History list */}
      <div>
        <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-3">
          Restock History {sortedHistory.length > 0 && <span className="text-slate-400 font-normal normal-case">({sortedHistory.length} entries)</span>}
        </p>

        {sortedHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
            <div className="w-10 h-10 flex items-center justify-center mb-2">
              <i className="ri-history-line text-3xl"></i>
            </div>
            <p className="text-sm font-medium">No restock history yet</p>
            <p className="text-xs mt-1">Use the form above to log your first restock</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedHistory.map((entry, idx) => {
              const date = new Date(entry.timestamp);
              const isLatest = idx === 0;
              return (
                <div
                  key={entry.id}
                  className={`flex items-start gap-4 px-4 py-3.5 rounded-xl border transition-all ${
                    isLatest
                      ? 'border-green-200 bg-green-50/60'
                      : 'border-slate-100 bg-white hover:bg-slate-50'
                  }`}
                >
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center shrink-0 mt-0.5">
                    <div className={`w-7 h-7 flex items-center justify-center rounded-full ${isLatest ? 'bg-green-700 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <i className="ri-add-line text-xs"></i>
                    </div>
                    {idx < sortedHistory.length - 1 && (
                      <div className="w-px h-4 bg-slate-200 mt-1"></div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-bold ${isLatest ? 'text-green-800' : 'text-slate-800'}`}>
                        +{entry.qty} units
                      </span>
                      {isLatest && (
                        <span className="text-[10px] font-bold bg-green-700 text-white px-2 py-0.5 rounded-full">
                          Latest
                        </span>
                      )}
                    </div>
                    {entry.note && (
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{entry.note}</p>
                    )}
                    <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                      <span className="w-3 h-3 flex items-center justify-center">
                        <i className="ri-time-line"></i>
                      </span>
                      {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {' · '}
                      {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {/* Units badge */}
                  <div className={`shrink-0 text-right`}>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isLatest ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                      +{entry.qty}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
