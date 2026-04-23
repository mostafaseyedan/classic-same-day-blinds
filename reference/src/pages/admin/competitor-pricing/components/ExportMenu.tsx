import { useState, useRef, useEffect } from 'react';
import type { CompetitorProduct } from '../../../../mocks/competitorPricing';
import {
  exportComparisonCSV,
  exportHistoryCSV,
  exportFullExcel,
  exportComparisonExcel,
  exportSelectedHistoryCSV,
} from '../../../../utils/competitorPricingExport';

interface PriceOverride {
  competitorPrice: number;
  updatedAt: string;
}

interface ExportMenuProps {
  products: CompetitorProduct[];
  selectedProduct: CompetitorProduct;
  priceOverrides: Record<string, PriceOverride>;
  competitorLabel: string;
}

export default function ExportMenu({ products, selectedProduct, priceOverrides, competitorLabel }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    setTimeout(() => document.addEventListener('mousedown', handler), 10);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const exportDate = new Date().toISOString().slice(0, 10);

  const opts = { products, selectedProduct, priceOverrides, competitorLabel, exportDate };

  const run = async (key: string, fn: () => void) => {
    setExporting(key);
    setOpen(false);
    await new Promise((r) => setTimeout(r, 80));
    fn();
    setTimeout(() => setExporting(null), 1200);
  };

  const groups: {
    label: string;
    items: { key: string; icon: string; label: string; sub: string; color?: string; fn: () => void }[];
  }[] = [
    {
      label: 'Comparison Table',
      items: [
        {
          key: 'comp-csv',
          icon: 'ri-file-text-line',
          label: 'CSV',
          sub: `${products.length} rows · all products`,
          fn: () => exportComparisonCSV(opts),
        },
        {
          key: 'comp-xlsx',
          icon: 'ri-file-excel-2-line',
          label: 'Excel (.xlsx)',
          sub: `${products.length} rows · single sheet`,
          color: 'text-green-700',
          fn: () => exportComparisonExcel(opts),
        },
      ],
    },
    {
      label: 'Price History',
      items: [
        {
          key: 'hist-csv',
          icon: 'ri-file-text-line',
          label: 'CSV — Selected Product',
          sub: `${selectedProduct.name} · ${selectedProduct.monthlyHistory.length} months`,
          fn: () => exportSelectedHistoryCSV(opts),
        },
        {
          key: 'hist-all-csv',
          icon: 'ri-file-text-line',
          label: 'CSV — All Products',
          sub: `${products.length * 12} rows · 12 months each`,
          fn: () => exportHistoryCSV(opts),
        },
      ],
    },
    {
      label: 'Full Report',
      items: [
        {
          key: 'full-xlsx',
          icon: 'ri-file-excel-2-line',
          label: 'Excel (.xlsx) — 3 Sheets',
          sub: 'Comparison · History · Sizes',
          color: 'text-green-700',
          fn: () => exportFullExcel(opts),
        },
      ],
    },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
          open
            ? 'bg-slate-900 text-white border-slate-900'
            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
        }`}
      >
        {exporting ? (
          <div className="w-4 h-4 flex items-center justify-center animate-spin">
            <i className="ri-loader-4-line text-sm"></i>
          </div>
        ) : (
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-download-2-line text-sm"></i>
          </div>
        )}
        {exporting ? 'Exporting…' : 'Export'}
        <div className="w-4 h-4 flex items-center justify-center">
          <i className={`ri-arrow-down-s-line text-sm transition-transform ${open ? 'rotate-180' : ''}`}></i>
        </div>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 bg-white border border-slate-200 rounded-2xl w-72 overflow-hidden">
          <div className="px-4 pt-3 pb-2 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Export Data</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {competitorLabel} · {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          {groups.map((group, gi) => (
            <div key={group.label}>
              {gi > 0 && <div className="mx-4 my-1 border-t border-slate-100"></div>}
              <div className="px-3 pt-2 pb-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1.5 mb-1">
                  {group.label}
                </p>
                {group.items.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => run(item.key, item.fn)}
                    className="w-full flex items-start gap-3 px-2 py-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer text-left group"
                  >
                    <div className={`w-7 h-7 flex items-center justify-center rounded-lg mt-0.5 shrink-0 ${
                      item.color ? 'bg-green-50' : 'bg-slate-100'
                    }`}>
                      <i className={`${item.icon} text-sm ${item.color ?? 'text-slate-500'}`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold leading-tight ${item.color ?? 'text-slate-800'}`}>
                        {item.label}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">{item.sub}</p>
                    </div>
                    <div className="w-4 h-4 flex items-center justify-center text-slate-300 group-hover:text-slate-500 shrink-0 mt-1">
                      <i className="ri-download-line text-xs"></i>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50">
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <i className="ri-information-line text-slate-300"></i>
              CSV files open in Excel, Numbers, or Google Sheets
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
