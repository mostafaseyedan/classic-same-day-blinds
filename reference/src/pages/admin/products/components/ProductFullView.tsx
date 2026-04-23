import { useState } from 'react';
import type { Product, RestockEntry } from '../page';
import { badgeColors } from '../page';
import RestockHistoryTab from './RestockHistoryTab';

interface Props {
  product: Product;
  restockHistory: RestockEntry[];
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onRestock: (productId: number, qty: number, note: string) => void;
}

type Tab = 'overview' | 'photos' | 'pricing' | 'inventory' | 'history';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: 'ri-dashboard-line' },
  { id: 'photos', label: 'Photos', icon: 'ri-image-line' },
  { id: 'pricing', label: 'Pricing', icon: 'ri-price-tag-3-line' },
  { id: 'inventory', label: 'Inventory', icon: 'ri-stack-line' },
  { id: 'history', label: 'Restock History', icon: 'ri-history-line' },
];

function getStockStatus(product: Product): 'out' | 'low' | 'ok' {
  const threshold = product.lowStockThreshold ?? 10;
  if (product.inventory === 0) return 'out';
  if (product.inventory <= threshold) return 'low';
  return 'ok';
}

function getEffectivePrice(product: Product): number {
  if (product.discountType === 'percent' && product.discountValue > 0) {
    return parseFloat((product.originalPrice * (1 - product.discountValue / 100)).toFixed(2));
  }
  if (product.discountType === 'dollar' && product.discountValue > 0) {
    return parseFloat((product.originalPrice - product.discountValue).toFixed(2));
  }
  return product.price || product.originalPrice;
}

export default function ProductFullView({ product, restockHistory, onClose, onEdit, onDelete, onRestock }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [selectedImg, setSelectedImg] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const status = getStockStatus(product);
  const effectivePrice = getEffectivePrice(product);
  const discountPct = product.originalPrice > 0
    ? Math.round(((product.originalPrice - effectivePrice) / product.originalPrice) * 100)
    : 0;
  const allImages = product.images?.length > 0 ? product.images : product.image ? [product.image] : [];
  const productHistory = restockHistory.filter((e) => e.productId === product.id);
  const totalRestocked = productHistory.reduce((s, e) => s + e.qty, 0);

  const stockBadge = status === 'out'
    ? { label: 'Out of Stock', cls: 'bg-red-100 text-red-700 border border-red-200' }
    : status === 'low'
    ? { label: 'Low Stock', cls: 'bg-amber-100 text-amber-700 border border-amber-200' }
    : { label: 'In Stock', cls: 'bg-emerald-100 text-emerald-700 border border-emerald-200' };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-hidden" onClick={onClose}>
      <div className="bg-slate-50 w-full h-full flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>

        {/* Delete Confirm */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={() => setShowDeleteConfirm(false)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-7" onClick={(e) => e.stopPropagation()}>
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-delete-bin-line text-red-500 text-2xl"></i>
              </div>
              <h3 className="text-lg font-bold text-slate-900 text-center mb-1">Delete Product?</h3>
              <p className="text-sm text-slate-500 text-center mb-6">
                Permanently remove <span className="font-semibold text-slate-900">{product.name}</span>? This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer whitespace-nowrap">Cancel</button>
                <button onClick={() => { setShowDeleteConfirm(false); onDelete(); }} className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg cursor-pointer whitespace-nowrap">Delete</button>
              </div>
            </div>
          </div>
        )}

        {/* Top Bar */}
        <div className="bg-white border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-5 px-8 py-4">
            <button onClick={onClose} className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 cursor-pointer transition-colors whitespace-nowrap">
              <i className="ri-arrow-left-line text-lg"></i>
              Back to Products
            </button>
            <div className="w-px h-8 bg-slate-100"></div>
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {allImages[0] && (
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                  <img src={allImages[0]} alt={product.name} className="w-full h-full object-cover object-top" />
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-lg font-bold text-slate-900 whitespace-nowrap">{product.name}</h1>
                  <span className="text-sm text-slate-400 capitalize">{product.category.replace(/-/g, ' ')}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${stockBadge.cls}`}>{stockBadge.label}</span>
                  {product.badge && (
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${badgeColors[product.badge] ?? 'bg-slate-100 text-slate-600'}`}>{product.badge}</span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  ID #{product.id} &bull; ${effectivePrice.toFixed(2)}{discountPct > 0 ? ` · ${discountPct}% off` : ''} &bull; {product.inventory} units in stock
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={onEdit} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg cursor-pointer whitespace-nowrap transition-colors">
                <i className="ri-edit-line"></i> Edit
              </button>
              <button onClick={() => setShowDeleteConfirm(true)} className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 hover:bg-red-50 text-red-500 text-sm font-semibold rounded-lg cursor-pointer whitespace-nowrap transition-colors">
                <i className="ri-delete-bin-line"></i> Delete
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 px-8 overflow-x-auto">
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 cursor-pointer whitespace-nowrap transition-colors ${
                    active ? 'border-green-700 text-green-700' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200'
                  }`}>
                  <div className="w-4 h-4 flex items-center justify-center"><i className={`${tab.icon} text-sm`}></i></div>
                  {tab.label}
                  {tab.id === 'photos' && allImages.length > 0 && (
                    <span className={`px-1.5 py-0.5 text-xs font-bold rounded-full ${active ? 'bg-green-700 text-white' : 'bg-slate-100 text-slate-600'}`}>{allImages.length}</span>
                  )}
                  {tab.id === 'history' && productHistory.length > 0 && (
                    <span className={`px-1.5 py-0.5 text-xs font-bold rounded-full ${active ? 'bg-green-700 text-white' : 'bg-slate-100 text-slate-600'}`}>{productHistory.length}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-8 py-6">

            {/* ── OVERVIEW TAB ── */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-5 gap-6">
                {/* Left: Image + colors */}
                <div className="col-span-2 space-y-4">
                  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    <div className="w-full h-72 bg-slate-50">
                      {allImages[selectedImg] ? (
                        <img src={allImages[selectedImg]} alt={product.name} className="w-full h-full object-cover object-top" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <i className="ri-image-line text-5xl"></i>
                        </div>
                      )}
                    </div>
                    {allImages.length > 1 && (
                      <div className="flex gap-2 p-3 flex-wrap">
                        {allImages.map((img, i) => (
                          <div key={i} onClick={() => setSelectedImg(i)}
                            className={`w-14 h-14 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${selectedImg === i ? 'border-green-700' : 'border-slate-200 hover:border-green-400'}`}>
                            <img src={img} alt="" className="w-full h-full object-cover object-top" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Color options */}
                  {product.colorOptions && product.colorOptions.length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-100 p-5">
                      <h3 className="text-sm font-bold text-slate-900 mb-3">Color Options ({product.colorOptions.length})</h3>
                      <div className="flex flex-wrap gap-2">
                        {product.colorOptions.map((c) => (
                          <div key={c.name} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700">
                            <span className="w-4 h-4 rounded-full border border-slate-300 shrink-0" style={{ backgroundColor: c.hex }}></span>
                            {c.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Details */}
                <div className="col-span-3 space-y-4">
                  {/* KPI row */}
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { label: 'Sale Price', value: `$${effectivePrice.toFixed(2)}`, icon: 'ri-price-tag-3-line', color: 'text-green-700 bg-green-50' },
                      { label: 'Original Price', value: `$${product.originalPrice.toFixed(2)}`, icon: 'ri-money-dollar-circle-line', color: 'text-slate-600 bg-slate-50' },
                      { label: 'In Stock', value: product.inventory, icon: 'ri-stack-line', color: status === 'out' ? 'text-red-600 bg-red-50' : status === 'low' ? 'text-amber-600 bg-amber-50' : 'text-emerald-600 bg-emerald-50' },
                      { label: 'Reviews', value: product.reviews.toLocaleString(), icon: 'ri-star-line', color: 'text-amber-600 bg-amber-50' },
                    ].map((k) => (
                      <div key={k.label} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${k.color}`}>
                          <i className={`${k.icon} text-base`}></i>
                        </div>
                        <div>
                          <p className="text-base font-bold text-slate-900">{k.value}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{k.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Description */}
                  <div className="bg-white rounded-2xl border border-slate-100 p-6">
                    <h3 className="text-sm font-bold text-slate-900 mb-3">Product Details</h3>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {[
                        { label: 'Category', value: product.category.replace(/-/g, ' '), cap: true },
                        { label: 'Badge', value: product.badge ?? 'None' },
                        { label: 'Rating', value: `${product.rating} / 5.0` },
                        { label: 'Low Stock Alert', value: `${product.lowStockThreshold ?? 10} units` },
                        { label: 'Discount', value: discountPct > 0 ? `${discountPct}% off` : 'No discount' },
                        { label: 'Restock Events', value: productHistory.length > 0 ? `${productHistory.length} (${totalRestocked} units total)` : '—' },
                      ].map((item) => (
                        <div key={item.label} className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 mb-0.5">{item.label}</p>
                          <p className={`text-sm font-semibold text-slate-900 ${item.cap ? 'capitalize' : ''}`}>{item.value}</p>
                        </div>
                      ))}
                    </div>
                    {product.description && (
                      <>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Description</p>
                        <p className="text-sm text-slate-700 leading-relaxed">{product.description}</p>
                      </>
                    )}
                  </div>

                  {/* Inventory status bar */}
                  <div className="bg-white rounded-2xl border border-slate-100 p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-slate-900">Stock Level</h3>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${stockBadge.cls}`}>{stockBadge.label}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-3 rounded-full transition-all ${status === 'out' ? 'bg-red-400' : status === 'low' ? 'bg-amber-400' : 'bg-green-500'}`}
                            style={{ width: `${Math.min(100, (product.inventory / Math.max(product.inventory, (product.lowStockThreshold ?? 10) * 3)) * 100)}%` }} />
                        </div>
                        <div className="flex justify-between text-xs text-slate-400 mt-1">
                          <span>0</span>
                          <span>Alert: {product.lowStockThreshold ?? 10}</span>
                          <span>{product.inventory}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-2xl font-black text-slate-900">{product.inventory}</p>
                        <p className="text-xs text-slate-400">units</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── PHOTOS TAB ── */}
            {activeTab === 'photos' && (
              <div className="space-y-6">
                {allImages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-100 text-slate-300">
                    <i className="ri-image-line text-6xl mb-4"></i>
                    <p className="text-lg font-semibold">No photos yet</p>
                    <p className="text-sm mt-1">Edit the product to add images</p>
                  </div>
                ) : (
                  <>
                    {/* Main preview */}
                    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                      <div className="w-full h-[420px] bg-slate-50">
                        <img src={allImages[selectedImg]} alt={product.name} className="w-full h-full object-contain object-center" />
                      </div>
                      <div className="p-4 flex items-center justify-between border-t border-slate-100">
                        <span className="text-xs text-slate-500 font-medium">
                          Photo {selectedImg + 1} of {allImages.length} &bull; {selectedImg === 0 ? 'Main image' : 'Gallery image'}
                        </span>
                        <div className="flex gap-2">
                          <button onClick={() => setSelectedImg((i) => Math.max(0, i - 1))} disabled={selectedImg === 0}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 cursor-pointer transition-colors">
                            <i className="ri-arrow-left-s-line"></i>
                          </button>
                          <button onClick={() => setSelectedImg((i) => Math.min(allImages.length - 1, i + 1))} disabled={selectedImg === allImages.length - 1}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 cursor-pointer transition-colors">
                            <i className="ri-arrow-right-s-line"></i>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Thumbnail grid */}
                    <div className="grid grid-cols-6 gap-3">
                      {allImages.map((img, i) => (
                        <div key={i} onClick={() => setSelectedImg(i)}
                          className={`relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${selectedImg === i ? 'border-green-700 shadow-md' : 'border-slate-200 hover:border-green-400'}`}>
                          <img src={img} alt="" className="w-full h-full object-cover object-top" />
                          {i === 0 && (
                            <div className="absolute bottom-0 left-0 right-0 bg-green-700/80 text-white text-[9px] font-bold text-center py-0.5">MAIN</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── PRICING TAB ── */}
            {activeTab === 'pricing' && (
              <div className="max-w-2xl space-y-5">
                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                  <h3 className="text-sm font-bold text-slate-900 mb-5">Pricing Breakdown</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Original Price', value: `$${product.originalPrice.toFixed(2)}`, mono: true },
                      { label: 'Discount Type', value: product.discountType === 'none' ? 'No discount' : product.discountType === 'percent' ? `Percentage (${product.discountValue}%)` : `Dollar ($${product.discountValue})`, mono: false },
                      ...(discountPct > 0 ? [{ label: 'Discount Amount', value: `-$${(product.originalPrice - effectivePrice).toFixed(2)} (${discountPct}% off)`, mono: true }] : []),
                    ].map((row) => (
                      <div key={row.label} className="flex items-center justify-between py-3 border-b border-slate-50">
                        <span className="text-sm text-slate-500">{row.label}</span>
                        <span className={`text-sm font-semibold text-slate-900 ${row.mono ? 'font-mono' : ''}`}>{row.value}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between py-3 pt-4">
                      <span className="text-base font-bold text-slate-900">Customer Pays</span>
                      <span className="text-2xl font-black text-green-700">${effectivePrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {discountPct > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-5">
                    <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center shrink-0">
                      <span className="text-white text-lg font-black">{discountPct}%</span>
                    </div>
                    <div>
                      <p className="text-base font-bold text-red-800">Active Discount</p>
                      <p className="text-sm text-red-600 mt-0.5">Customer saves ${(product.originalPrice - effectivePrice).toFixed(2)} per unit</p>
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                  <h3 className="text-sm font-bold text-slate-900 mb-4">Estimated Revenue</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'Per Unit', value: `$${effectivePrice.toFixed(2)}` },
                      { label: 'Est. Units Sold', value: `~${Math.round(product.reviews * 2.4).toLocaleString()}` },
                      { label: 'Est. Total Revenue', value: `$${(Math.round(product.reviews * 2.4) * effectivePrice / 1000).toFixed(1)}K` },
                    ].map((k) => (
                      <div key={k.label} className="bg-slate-50 rounded-xl p-4 text-center">
                        <p className="text-xl font-bold text-slate-900">{k.value}</p>
                        <p className="text-xs text-slate-500 mt-1">{k.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── INVENTORY TAB ── */}
            {activeTab === 'inventory' && (
              <div className="max-w-2xl space-y-5">
                {/* Status card */}
                <div className={`rounded-2xl border p-6 flex items-center gap-5 ${status === 'out' ? 'bg-red-50 border-red-200' : status === 'low' ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${status === 'out' ? 'bg-red-100 text-red-600' : status === 'low' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    <i className={`text-2xl ${status === 'out' ? 'ri-close-circle-line' : status === 'low' ? 'ri-alert-line' : 'ri-checkbox-circle-line'}`}></i>
                  </div>
                  <div>
                    <p className={`text-xl font-black ${status === 'out' ? 'text-red-700' : status === 'low' ? 'text-amber-700' : 'text-emerald-700'}`}>
                      {status === 'out' ? 'Out of Stock' : status === 'low' ? 'Low Stock Warning' : 'In Stock'}
                    </p>
                    <p className={`text-sm mt-0.5 ${status === 'out' ? 'text-red-500' : status === 'low' ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {product.inventory} units available &bull; Alert threshold: {product.lowStockThreshold ?? 10} units
                    </p>
                  </div>
                </div>

                {/* Inventory stats */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Current Stock', value: product.inventory, icon: 'ri-stack-line', color: 'text-slate-700 bg-slate-50' },
                    { label: 'Low Stock Alert', value: `≤ ${product.lowStockThreshold ?? 10}`, icon: 'ri-alert-line', color: 'text-amber-600 bg-amber-50' },
                    { label: 'Total Restocked', value: totalRestocked > 0 ? `+${totalRestocked}` : '—', icon: 'ri-add-box-line', color: 'text-green-700 bg-green-50' },
                  ].map((k) => (
                    <div key={k.label} className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${k.color}`}>
                        <i className={`${k.icon} text-lg`}></i>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-slate-900">{k.value}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{k.label}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Stock bar */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-900">Stock Visualization</h3>
                    <span className="text-sm font-semibold text-slate-600">{product.inventory} / {Math.max(product.inventory, (product.lowStockThreshold ?? 10) * 3)} units</span>
                  </div>
                  <div className="h-4 bg-slate-100 rounded-full overflow-hidden mb-2">
                    <div className={`h-4 rounded-full transition-all ${status === 'out' ? 'bg-red-400' : status === 'low' ? 'bg-amber-400' : 'bg-green-500'}`}
                      style={{ width: `${Math.min(100, (product.inventory / Math.max(product.inventory, (product.lowStockThreshold ?? 10) * 3)) * 100)}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>0 (Out of Stock)</span>
                    <span className="text-amber-600 font-semibold">Alert: {product.lowStockThreshold ?? 10}</span>
                    <span>{product.inventory} (Current)</span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-center gap-4">
                  <i className="ri-information-line text-slate-400 text-xl shrink-0"></i>
                  <p className="text-sm text-slate-600">
                    To update inventory or log a restock, click <strong>Edit</strong> at the top or switch to the <strong>Restock History</strong> tab to log directly.
                  </p>
                </div>
              </div>
            )}

            {/* ── HISTORY TAB ── */}
            {activeTab === 'history' && (
              <div className="max-w-3xl">
                <RestockHistoryTab
                  productId={product.id}
                  productName={product.name}
                  currentInventory={product.inventory}
                  history={restockHistory}
                  onRestock={(qty, note) => onRestock(product.id, qty, note)}
                />
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
