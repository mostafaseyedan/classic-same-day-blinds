import { useState } from 'react';
import type { Product, RestockEntry } from '../page';
import { badgeColors } from '../page';
import { isAutoTrackedProduct } from '../../../../utils/pricingEngine';

interface Props {
  product: Product;
  restockHistory: RestockEntry[];
  autoPrice?: { ourPrice: number; competitorPrice: number; monthShort: string; monthLabel: string; hasSale: boolean; saleLabel: string } | null;
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

export default function ProductEnhancedCard({
  product, restockHistory, autoPrice, recentlySaved,
  quickRestockId, quickRestockQty, quickRestockNote, quickRestockSuccess,
  onView, onEdit, onDelete, onOpenQuickRestock, onCloseQuickRestock,
  onQuickRestockQtyChange, onQuickRestockNoteChange, onConfirmQuickRestock,
}: Props) {
  const [selectedImg, setSelectedImg] = useState(0);

  const status = getStockStatus(product);
  const effectivePrice = autoPrice ? autoPrice.ourPrice : getEffectivePrice(product);
  const discountPct = product.originalPrice > 0
    ? Math.round(((product.originalPrice - effectivePrice) / product.originalPrice) * 100)
    : 0;
  const productHistory = restockHistory.filter(e => e.productId === product.id);
  const totalRestocked = productHistory.reduce((s, e) => s + e.qty, 0);
  const allImages = product.images?.length > 0 ? product.images : product.image ? [product.image] : [];
  const isAutoProduct = isAutoTrackedProduct(product.id);
  const maxBar = (product.lowStockThreshold ?? 10) * 3;
  const barPct = Math.min(100, Math.round((product.inventory / Math.max(maxBar, 1)) * 100));
  const estUnits = Math.round(product.reviews * 2.4);

  const stockMeta = status === 'out'
    ? { label: 'Out of Stock', cls: 'bg-red-100 text-red-700 border border-red-200', barCls: 'bg-red-400', iconCls: 'text-red-500', icon: 'ri-close-circle-fill' }
    : status === 'low'
    ? { label: 'Low Stock', cls: 'bg-amber-100 text-amber-700 border border-amber-200', barCls: 'bg-amber-400', iconCls: 'text-amber-500', icon: 'ri-alert-fill' }
    : { label: 'In Stock', cls: 'bg-emerald-100 text-emerald-700 border border-emerald-200', barCls: 'bg-green-500', iconCls: 'text-emerald-500', icon: 'ri-checkbox-circle-fill' };

  const borderCls = recentlySaved
    ? 'border-green-400 ring-2 ring-green-200'
    : status === 'out' ? 'border-red-200'
    : status === 'low' ? 'border-amber-200'
    : 'border-slate-200';

  return (
    <div className={`bg-white rounded-2xl border ${borderCls} overflow-hidden transition-all hover:shadow-lg`}>
      {/* Top: image + header info */}
      <div className="flex gap-0">
        {/* Image section */}
        <div className="relative w-52 shrink-0 bg-slate-50 flex flex-col">
          <div className="flex-1 overflow-hidden" style={{ minHeight: 180 }}>
            {allImages[selectedImg] ? (
              <img src={allImages[selectedImg]} alt={product.name}
                className="w-full h-full object-cover object-top" style={{ height: 180 }} />
            ) : (
              <div className="w-full flex items-center justify-center text-slate-300" style={{ height: 180 }}>
                <i className="ri-image-line text-5xl"></i>
              </div>
            )}
          </div>
          {allImages.length > 1 && (
            <div className="flex gap-1 p-2 border-t border-slate-100 overflow-x-auto">
              {allImages.slice(0, 5).map((img, i) => (
                <div key={i} onClick={() => setSelectedImg(i)}
                  className={`w-9 h-9 rounded-md overflow-hidden border-2 cursor-pointer shrink-0 transition-all ${
                    selectedImg === i ? 'border-green-600' : 'border-slate-200 hover:border-green-400'
                  }`}>
                  <img src={img} alt="" className="w-full h-full object-cover object-top" />
                </div>
              ))}
              {allImages.length > 5 && (
                <div className="w-9 h-9 rounded-md bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0 border-2 border-slate-200">
                  +{allImages.length - 5}
                </div>
              )}
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

        {/* Main content */}
        <div className="flex-1 p-5 min-w-0 flex flex-col gap-3">
          {/* Title row */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="text-base font-bold text-slate-900 leading-tight">{product.name}</h3>
                {product.badge && (
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${badgeColors[product.badge] ?? 'bg-slate-100 text-slate-600'}`}>
                    {product.badge}
                  </span>
                )}
                {isAutoProduct && (
                  <span className="flex items-center gap-0.5 text-[10px] font-bold bg-orange-100 text-orange-700 border border-orange-200 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                    <i className="ri-refresh-line text-[9px]"></i>AUTO
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-400 capitalize">{product.category.replace(/-/g, ' ')} · ID #{product.id}</span>
              {product.description && (
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2">{product.description}</p>
              )}
            </div>
          </div>

          {/* Pricing + stats grid */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-green-50 rounded-xl p-3">
              <p className="text-xs text-green-600 font-medium mb-0.5">Sale Price</p>
              <p className="text-lg font-black text-green-700">${effectivePrice.toFixed(2)}</p>
              {discountPct > 0 && (
                <p className="text-[10px] text-green-600 font-semibold">{discountPct}% off</p>
              )}
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-500 font-medium mb-0.5">Original</p>
              <p className={`text-base font-bold text-slate-700 ${discountPct > 0 ? 'line-through text-slate-400' : ''}`}>${product.originalPrice.toFixed(2)}</p>
              {discountPct > 0 && (
                <p className="text-[10px] text-red-500 font-semibold">-${(product.originalPrice - effectivePrice).toFixed(2)}</p>
              )}
            </div>
            <div className={`rounded-xl p-3 ${status === 'out' ? 'bg-red-50' : status === 'low' ? 'bg-amber-50' : 'bg-emerald-50'}`}>
              <p className="text-xs text-slate-500 font-medium mb-0.5">Inventory</p>
              <div className="flex items-center gap-1">
                <div className={`w-3.5 h-3.5 flex items-center justify-center ${stockMeta.iconCls}`}>
                  <i className={`${stockMeta.icon} text-xs`}></i>
                </div>
                <p className={`text-base font-bold ${status === 'out' ? 'text-red-700' : status === 'low' ? 'text-amber-700' : 'text-emerald-700'}`}>{product.inventory}</p>
              </div>
              <p className="text-[10px] text-slate-400">threshold: {product.lowStockThreshold ?? 10}</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-3">
              <p className="text-xs text-amber-600 font-medium mb-0.5">Rating</p>
              <div className="flex items-center gap-1">
                <div className="w-3.5 h-3.5 flex items-center justify-center text-amber-400">
                  <i className="ri-star-fill text-xs"></i>
                </div>
                <p className="text-base font-bold text-amber-700">{product.rating}</p>
              </div>
              <p className="text-[10px] text-slate-400">{product.reviews.toLocaleString()} reviews</p>
            </div>
          </div>

          {/* Stock bar */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${stockMeta.cls}`}>{stockMeta.label}</span>
              <span className="text-[10px] text-slate-400">{product.inventory} / {Math.max(product.inventory, (product.lowStockThreshold ?? 10) * 3)}</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${stockMeta.barCls}`} style={{ width: `${barPct}%` }} />
            </div>
          </div>

          {/* Color options */}
          {product.colorOptions && product.colorOptions.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-500 font-medium">Colors:</span>
              {product.colorOptions.slice(0, 8).map(c => (
                <div key={c.name} title={c.name}
                  className="w-5 h-5 rounded-full border-2 border-white shadow-sm cursor-default"
                  style={{ backgroundColor: c.hex }} />
              ))}
              {product.colorOptions.length > 8 && (
                <span className="text-[10px] text-slate-400">+{product.colorOptions.length - 8} more</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom strip: est. revenue + restock info + actions */}
      <div className="border-t border-slate-100 px-5 py-3 flex items-center gap-4 bg-slate-50/60">
        {/* Est. revenue */}
        <div className="flex items-center gap-3 text-xs text-slate-500 flex-1">
          <span className="flex items-center gap-1">
            <div className="w-3.5 h-3.5 flex items-center justify-center text-teal-500">
              <i className="ri-bar-chart-line text-xs"></i>
            </div>
            <span>~{estUnits >= 1000 ? `${(estUnits / 1000).toFixed(1)}k` : estUnits} units sold</span>
          </span>
          <span className="text-slate-300">·</span>
          <span className="flex items-center gap-1">
            <div className="w-3.5 h-3.5 flex items-center justify-center text-green-600">
              <i className="ri-money-dollar-circle-line text-xs"></i>
            </div>
            <span className="font-semibold text-green-700">${(estUnits * effectivePrice / 1000).toFixed(1)}k</span>
            <span>est. rev.</span>
          </span>
          {productHistory.length > 0 && (
            <>
              <span className="text-slate-300">·</span>
              <span className="flex items-center gap-1">
                <div className="w-3.5 h-3.5 flex items-center justify-center text-slate-400">
                  <i className="ri-history-line text-xs"></i>
                </div>
                <span>{productHistory.length} restocks (+{totalRestocked} total)</span>
              </span>
            </>
          )}
          {autoPrice && (
            <>
              <span className="text-slate-300">·</span>
              <span className="text-orange-600 font-semibold">
                Blinds.com: ${autoPrice.competitorPrice.toFixed(2)} · auto −15%
              </span>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="relative">
            {quickRestockId === product.id && (
              <div className="absolute right-0 bottom-full mb-1 z-20 bg-white border border-green-200 rounded-xl p-3 w-60">
                <p className="text-xs font-bold text-green-800 mb-2">Quick Restock</p>
                <div className="space-y-2">
                  <input type="number" min="1" autoFocus value={quickRestockQty}
                    onChange={e => onQuickRestockQtyChange(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') onConfirmQuickRestock(product.id); if (e.key === 'Escape') onCloseQuickRestock(); }}
                    placeholder="Units to add"
                    className="w-full px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                  <input type="text" value={quickRestockNote}
                    onChange={e => onQuickRestockNoteChange(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') onConfirmQuickRestock(product.id); if (e.key === 'Escape') onCloseQuickRestock(); }}
                    placeholder="Note (optional)" maxLength={80}
                    className="w-full px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                  <div className="flex gap-2">
                    <button onClick={() => onConfirmQuickRestock(product.id)}
                      disabled={!quickRestockQty || parseInt(quickRestockQty, 10) <= 0}
                      className="flex-1 py-1.5 bg-green-700 text-white text-xs font-semibold rounded-lg hover:bg-green-800 disabled:opacity-40 cursor-pointer whitespace-nowrap">Confirm</button>
                    <button onClick={onCloseQuickRestock}
                      className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer whitespace-nowrap">Cancel</button>
                  </div>
                </div>
              </div>
            )}
            <button
              onClick={() => quickRestockId === product.id ? onCloseQuickRestock() : onOpenQuickRestock(product.id)}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer whitespace-nowrap transition-colors ${
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
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg cursor-pointer whitespace-nowrap transition-colors">
            <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-fullscreen-line"></i></div>
            Full View
          </button>
          <button onClick={onEdit}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer whitespace-nowrap transition-colors">
            <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-edit-line"></i></div>
            Edit
          </button>
          <button onClick={onDelete}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg cursor-pointer whitespace-nowrap transition-colors">
            <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-delete-bin-line"></i></div>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
