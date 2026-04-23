import type { Product, RestockEntry } from '../page';
import { badgeColors } from '../page';
import { isAutoTrackedProduct } from '../../../../utils/pricingEngine';

interface Props {
  product: Product;
  restockHistory: RestockEntry[];
  autoPrice?: { ourPrice: number; competitorPrice: number; monthShort: string } | null;
  recentlySaved: boolean;
  quickRestockId: number | null;
  quickRestockQty: string;
  quickRestockNote: string;
  quickRestockSuccess: number | null;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onOpenQuickRestock: (id: number) => void;
  onCloseQuickRestock: () => void;
  onQuickRestockQtyChange: (v: string) => void;
  onQuickRestockNoteChange: (v: string) => void;
  onConfirmQuickRestock: (id: number) => void;
}

function getStockStatus(p: Product): 'out' | 'low' | 'in-stock' {
  const threshold = p.lowStockThreshold ?? 10;
  if (p.inventory === 0) return 'out';
  if (p.inventory <= threshold) return 'low';
  return 'in-stock';
}

function getEffectivePrice(p: Product): number {
  if (p.discountType === 'percent' && p.discountValue > 0)
    return parseFloat((p.originalPrice * (1 - p.discountValue / 100)).toFixed(2));
  if (p.discountType === 'dollar' && p.discountValue > 0)
    return parseFloat((p.originalPrice - p.discountValue).toFixed(2));
  return p.price || p.originalPrice;
}

export default function ProductDetailCard({
  product, restockHistory, autoPrice, recentlySaved,
  quickRestockId, quickRestockQty, quickRestockNote, quickRestockSuccess,
  onView, onEdit, onDelete, onOpenQuickRestock, onCloseQuickRestock,
  onQuickRestockQtyChange, onQuickRestockNoteChange, onConfirmQuickRestock,
}: Props) {
  const status = getStockStatus(product);
  const effectivePrice = autoPrice ? autoPrice.ourPrice : getEffectivePrice(product);
  const discountPct = product.originalPrice > 0
    ? Math.round(((product.originalPrice - effectivePrice) / product.originalPrice) * 100)
    : 0;
  const productRestocks = restockHistory.filter(e => e.productId === product.id).length;
  const maxBar = (product.lowStockThreshold ?? 10) * 3;
  const barPct = Math.min(100, Math.round((product.inventory / Math.max(maxBar, 1)) * 100));
  const barColor = status === 'out' ? 'bg-red-400' : status === 'low' ? 'bg-amber-400' : 'bg-green-500';
  const allImages = product.images?.length > 0 ? product.images : product.image ? [product.image] : [];
  const isAutoProduct = isAutoTrackedProduct(product.id);

  const stockBadge = status === 'out'
    ? { label: 'Out of Stock', cls: 'bg-red-100 text-red-700 border border-red-200' }
    : status === 'low'
    ? { label: `Low — ${product.inventory} left`, cls: 'bg-amber-100 text-amber-700 border border-amber-200' }
    : { label: `${product.inventory} in stock`, cls: 'bg-emerald-100 text-emerald-700 border border-emerald-200' };

  const borderCls = recentlySaved
    ? 'border-green-400 ring-2 ring-green-200'
    : status === 'out' ? 'border-red-200'
    : status === 'low' ? 'border-amber-200'
    : 'border-slate-200';

  return (
    <div className={`bg-white rounded-xl border ${borderCls} overflow-hidden flex transition-all hover:shadow-md`}>
      {/* Image */}
      <div className="w-28 shrink-0 bg-slate-50 relative overflow-hidden">
        {allImages[0] ? (
          <img src={allImages[0]} alt={product.name} className="w-full h-full object-cover object-top" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <i className="ri-image-line text-3xl"></i>
          </div>
        )}
        {recentlySaved && (
          <div className="absolute top-2 left-2">
            <span className="flex items-center gap-0.5 text-[10px] font-bold text-white bg-green-600 px-1.5 py-0.5 rounded-full">
              <i className="ri-checkbox-circle-fill text-[9px]"></i>LIVE
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 min-w-0 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <h3 className="text-sm font-bold text-slate-900 leading-tight">{product.name}</h3>
              {product.badge && (
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${badgeColors[product.badge] ?? 'bg-slate-100 text-slate-600'}`}>{product.badge}</span>
              )}
              {isAutoProduct && (
                <span className="flex items-center gap-0.5 text-[10px] font-bold bg-orange-100 text-orange-700 border border-orange-200 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                  <i className="ri-refresh-line text-[9px]"></i>AUTO
                </span>
              )}
            </div>
            <span className="text-xs text-slate-400 capitalize">{product.category.replace(/-/g, ' ')}</span>
          </div>
          {/* Price block */}
          <div className="text-right shrink-0">
            <p className="text-base font-black text-slate-900">${effectivePrice.toFixed(2)}</p>
            {discountPct > 0 && (
              <p className="text-xs text-slate-400 line-through">${product.originalPrice.toFixed(2)}</p>
            )}
            {discountPct > 0 && (
              <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full">{discountPct}% off</span>
            )}
          </div>
        </div>

        {/* Stock + Rating row */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${stockBadge.cls}`}>{stockBadge.label}</span>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <div className="w-3.5 h-3.5 flex items-center justify-center text-amber-400">
              <i className="ri-star-fill text-xs"></i>
            </div>
            <span className="font-semibold text-slate-700">{product.rating}</span>
            <span className="text-slate-400">({product.reviews.toLocaleString()})</span>
          </div>
          {productRestocks > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-slate-400 font-medium">
              <i className="ri-history-line text-xs"></i>{productRestocks} restocks
            </span>
          )}
        </div>

        {/* Stock bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${barColor}`} style={{ width: `${barPct}%` }} />
          </div>
          <span className="text-[10px] text-slate-400 shrink-0">
            threshold: {product.lowStockThreshold ?? 10}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-wrap mt-auto pt-1">
          <div className="relative">
            {quickRestockId === product.id && (
              <div className="absolute left-0 bottom-full mb-1 z-20 bg-white border border-green-200 rounded-xl p-3 w-60">
                <p className="text-xs font-bold text-green-800 mb-2">Quick Restock</p>
                <div className="space-y-2">
                  <input type="number" min="1" autoFocus value={quickRestockQty}
                    onChange={e => onQuickRestockQtyChange(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') onConfirmQuickRestock(product.id); if (e.key === 'Escape') onCloseQuickRestock(); }}
                    placeholder="Units to add" className="w-full px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                  <input type="text" value={quickRestockNote}
                    onChange={e => onQuickRestockNoteChange(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') onConfirmQuickRestock(product.id); if (e.key === 'Escape') onCloseQuickRestock(); }}
                    placeholder="Note (optional)" maxLength={80}
                    className="w-full px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                  <div className="flex gap-2">
                    <button onClick={() => onConfirmQuickRestock(product.id)}
                      disabled={!quickRestockQty || parseInt(quickRestockQty, 10) <= 0}
                      className="flex-1 py-1.5 bg-green-700 text-white text-xs font-semibold rounded-lg hover:bg-green-800 disabled:opacity-40 cursor-pointer whitespace-nowrap">
                      Confirm
                    </button>
                    <button onClick={onCloseQuickRestock}
                      className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer whitespace-nowrap">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
            <button
              onClick={() => quickRestockId === product.id ? onCloseQuickRestock() : onOpenQuickRestock(product.id)}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg cursor-pointer whitespace-nowrap transition-colors ${
                quickRestockSuccess === product.id
                  ? 'text-green-700 bg-green-100'
                  : 'text-green-700 bg-green-50 hover:bg-green-100 border border-green-200'
              }`}>
              <div className="w-3.5 h-3.5 flex items-center justify-center">
                {quickRestockSuccess === product.id ? <i className="ri-checkbox-circle-fill"></i> : <i className="ri-add-box-line"></i>}
              </div>
              {quickRestockSuccess === product.id ? 'Restocked!' : 'Restock'}
            </button>
          </div>
          <button onClick={onView}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg cursor-pointer whitespace-nowrap transition-colors">
            <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-fullscreen-line"></i></div>
            View
          </button>
          <button onClick={onEdit}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer whitespace-nowrap transition-colors">
            <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-edit-line"></i></div>
            Edit
          </button>
          <button onClick={onDelete}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg cursor-pointer whitespace-nowrap transition-colors">
            <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-delete-bin-line"></i></div>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
