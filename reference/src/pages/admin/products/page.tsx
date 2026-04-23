import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { products as initialProducts, categories } from '../../../mocks/products';
import { logActivity } from '../../../utils/adminActivity';
import ProductFormModal from './components/ProductFormModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import LowStockAlertSettings from './components/LowStockAlertSettings';
import BulkRestockModal from './components/BulkRestockModal';
import ProductFullView from './components/ProductFullView';
import ProductDetailCard from './components/ProductDetailCard';
import ProductEnhancedCard from './components/ProductEnhancedCard';

type ViewMode = 'table' | 'detail' | 'enhanced';
import {
  loadProductsFromDB,
  saveProductsToDB,
  loadRestockFromDB,
  saveRestockToDB,
} from '../../../utils/productStorage';
import { useAllAutoPrices } from '../../../hooks/useAutoPrice';
import { isAutoTrackedProduct } from '../../../utils/pricingEngine';

export type Product = {
  id: number;
  name: string;
  nameEs: string;
  price: number;
  originalPrice: number;
  discountType: 'none' | 'percent' | 'dollar';
  discountValue: number;
  rating: number;
  reviews: number;
  category: string;
  badge: string | null;
  description: string;
  descriptionEs: string;
  images: string[];
  image: string;
  colorOptions: { name: string; hex: string }[];
  inventory: number;
  lowStockThreshold?: number;
  detailFeatures?: string[];
  measureSteps?: { title: string; desc: string }[];
  installSteps?: { title: string; desc: string }[];
};

export type RestockEntry = {
  id: string;
  productId: number;
  qty: number;
  note: string;
  timestamp: number;
};

function normalizeProducts(prods: Product[]): Product[] {
  return prods.map((p) => ({
    ...p,
    discountType: p.discountType ?? 'none',
    discountValue: p.discountValue ?? 0,
    images: p.images && p.images.length > 0 ? p.images : (p.image ? [p.image] : []),
    colorOptions: p.colorOptions ?? [],
    inventory: p.inventory ?? 0,
    lowStockThreshold: p.lowStockThreshold ?? 10,
  }));
}

async function loadProducts(): Promise<Product[]> {
  const stored = await loadProductsFromDB();
  if (stored && stored.length > 0) return stored as Product[];
  return normalizeProducts(initialProducts as Product[]);
}

async function saveProducts(prods: Product[]) {
  await saveProductsToDB(prods);
  window.dispatchEvent(new CustomEvent('productsUpdated', { detail: prods }));
}

async function loadRestockHistory(): Promise<RestockEntry[]> {
  const stored = await loadRestockFromDB();
  return (stored as RestockEntry[]) ?? [];
}

async function saveRestockHistory(entries: RestockEntry[]) {
  await saveRestockToDB(entries);
}

const BADGE_OPTIONS = [
  'Best Seller', 'Sale', 'Top Rated', 'New', 'Smart Home',
  'Eco-Friendly', 'Popular', 'Light & Airy', 'Outdoor', 'Value Pick',
  'Best Value', 'Customer Favorite',
];

const badgeColors: Record<string, string> = {
  'Best Seller': 'bg-green-100 text-green-800',
  'Sale': 'bg-red-100 text-red-700',
  'Top Rated': 'bg-emerald-100 text-emerald-800',
  'New': 'bg-sky-100 text-sky-700',
  'Smart Home': 'bg-indigo-100 text-indigo-700',
  'Eco-Friendly': 'bg-lime-100 text-lime-800',
  'Popular': 'bg-green-100 text-green-900',
  'Light & Airy': 'bg-teal-100 text-teal-700',
  'Outdoor': 'bg-stone-100 text-stone-700',
  'Value Pick': 'bg-gray-100 text-gray-700',
  'Best Value': 'bg-orange-100 text-orange-700',
  'Customer Favorite': 'bg-rose-100 text-rose-700',
};

export { BADGE_OPTIONS, badgeColors };

const ALERT_THRESHOLD = 100;

export default function AdminProductsPage() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [restockHistory, setRestockHistory] = useState<RestockEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStock, setFilterStock] = useState<'all' | 'in-stock' | 'low' | 'out'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [quickEditId, setQuickEditId] = useState<number | null>(null);
  const [quickEditValue, setQuickEditValue] = useState<string>('');
  const [showAlertSettings, setShowAlertSettings] = useState(false);
  const [alertBannerDismissed, setAlertBannerDismissed] = useState(false);
  const [showBulkRestock, setShowBulkRestock] = useState(false);
  const [recentlySavedId, setRecentlySavedId] = useState<number | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [quickRestockId, setQuickRestockId] = useState<number | null>(null);
  const [quickRestockQty, setQuickRestockQty] = useState<string>('');
  const [quickRestockNote, setQuickRestockNote] = useState<string>('');
  const [quickRestockSuccess, setQuickRestockSuccess] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // ── Auto-pricing engine — called before any early returns (React rules) ──
  const allAutoPrices = useAllAutoPrices();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [prods, history] = await Promise.all([loadProducts(), loadRestockHistory()]);
      if (!cancelled) {
        setProducts(prods);
        setRestockHistory(history);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const stockParam = searchParams.get('stock');
    if (stockParam === 'out') setFilterStock('out');
    else if (stockParam === 'low') setFilterStock('low');
    else if (stockParam === 'in-stock') setFilterStock('in-stock');
  }, [searchParams]);

  const handleQuickRestock = (productId: number) => {
    const qty = parseInt(quickRestockQty, 10);
    if (isNaN(qty) || qty <= 0) return;
    handleAddRestock(productId, qty, quickRestockNote.trim());
    setQuickRestockSuccess(productId);
    setQuickRestockId(null);
    setQuickRestockQty('');
    setQuickRestockNote('');
    setTimeout(() => setQuickRestockSuccess(null), 2500);
  };

  const openQuickRestock = (productId: number) => {
    setQuickRestockId(productId);
    setQuickRestockQty('');
    setQuickRestockNote('');
    setQuickEditId(null);
  };

  const lowStockAlertProducts = products.filter(p => p.inventory < ALERT_THRESHOLD);

  const getStockStatus = (p: Product) => {
    const threshold = p.lowStockThreshold ?? 10;
    if (p.inventory === 0) return 'out';
    if (p.inventory <= threshold) return 'low';
    return 'in-stock';
  };

  const filtered = products.filter((p) => {
    const matchCat = filterCategory === 'all' || p.category === filterCategory;
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    const status = getStockStatus(p);
    const matchStock = filterStock === 'all' || filterStock === status;
    return matchCat && matchSearch && matchStock;
  });

  const handleSave = async (product: Product) => {
    const isNew = product.id === 0;
    let updated: Product[];
    if (isNew) {
      const newId = Math.max(...products.map((p) => p.id), 0) + 1;
      updated = [...products, { ...product, id: newId }];
    } else {
      updated = products.map((p) => (p.id === product.id ? product : p));
    }
    setProducts(updated);
    await saveProducts(updated);
    setShowForm(false);
    setEditProduct(null);
    setRecentlySavedId(isNew ? Math.max(...updated.map((p) => p.id)) : product.id);
    setTimeout(() => setRecentlySavedId(null), 4000);
    try {
      const admin = JSON.parse(localStorage.getItem('admin_user') ?? '{}');
      logActivity({
        adminId: admin.id ?? 'unknown',
        adminName: admin.name ?? 'Admin',
        adminRole: admin.role ?? 'admin',
        action: isNew ? `Product added: "${product.name}"` : `Product updated: "${product.name}"`,
        category: 'products',
        detail: isNew
          ? `Created new product in ${product.category} at $${product.price}`
          : `Updated product details, price $${product.price}, inventory ${product.inventory}`,
      });
    } catch { /* ignore */ }
  };

  const handleAddRestock = async (productId: number, qty: number, note: string) => {
    const updatedProducts = products.map((p) =>
      p.id === productId ? { ...p, inventory: p.inventory + qty } : p
    );
    setProducts(updatedProducts);
    await saveProducts(updatedProducts);
    const entry: RestockEntry = {
      id: `${productId}-${Date.now()}`,
      productId,
      qty,
      note,
      timestamp: Date.now(),
    };
    const updatedHistory = [entry, ...restockHistory];
    setRestockHistory(updatedHistory);
    await saveRestockHistory(updatedHistory);
    setEditProduct((prev) => prev ? { ...prev, inventory: prev.inventory + qty } : prev);
  };

  const handleDelete = async (product: Product) => {
    const updated = products.filter((p) => p.id !== product.id);
    setProducts(updated);
    await saveProducts(updated);
    setDeleteTarget(null);
    try {
      const admin = JSON.parse(localStorage.getItem('admin_user') ?? '{}');
      logActivity({
        adminId: admin.id ?? 'unknown',
        adminName: admin.name ?? 'Admin',
        adminRole: admin.role ?? 'admin',
        action: `Product deleted: "${product.name}"`,
        category: 'products',
        detail: `Permanently removed product (ID: ${product.id}) from ${product.category}`,
      });
    } catch { /* ignore */ }
  };

  const handleQuickInventorySave = async (productId: number) => {
    const val = parseInt(quickEditValue, 10);
    if (isNaN(val) || val < 0) { setQuickEditId(null); return; }
    const updated = products.map((p) => p.id === productId ? { ...p, inventory: val } : p);
    setProducts(updated);
    await saveProducts(updated);
    setQuickEditId(null);
  };

  const handleBulkRestock = async (entries: { productId: number; qty: number; note: string }[]) => {
    let updatedProducts = [...products];
    const newEntries: RestockEntry[] = [];
    entries.forEach(({ productId, qty, note }) => {
      updatedProducts = updatedProducts.map((p) =>
        p.id === productId ? { ...p, inventory: p.inventory + qty } : p
      );
      newEntries.push({
        id: `${productId}-${Date.now()}-${Math.random()}`,
        productId,
        qty,
        note,
        timestamp: Date.now(),
      });
    });
    setProducts(updatedProducts);
    await saveProducts(updatedProducts);
    const updatedHistory = [...newEntries, ...restockHistory];
    setRestockHistory(updatedHistory);
    await saveRestockHistory(updatedHistory);
  };

  const openAdd = () => { setEditProduct(null); setShowForm(true); };
  const openEdit = (p: Product) => { setEditProduct(p); setShowForm(true); };

  const outOfStock = products.filter((p) => p.inventory === 0).length;
  const lowStock = products.filter((p) => p.inventory > 0 && p.inventory <= (p.lowStockThreshold ?? 10)).length;
  const totalInventory = products.reduce((s, p) => s + p.inventory, 0);

  // Close dropdown on outside click
  useEffect(() => {
    if (openDropdownId === null) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdownId(null);
      }
    };
    setTimeout(() => document.addEventListener('mousedown', handler), 10);
    return () => document.removeEventListener('mousedown', handler);
  }, [openDropdownId]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-8 h-8 flex items-center justify-center animate-spin">
            <i className="ri-loader-4-line text-2xl"></i>
          </div>
          <p className="text-sm">Loading products…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Low Stock Alert Banner */}
      {!alertBannerDismissed && lowStockAlertProducts.length > 0 && (
        <div className="mb-6 flex items-center justify-between gap-4 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center bg-amber-100 rounded-lg shrink-0">
              <i className="ri-alert-line text-amber-600 text-lg"></i>
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-900">
                {lowStockAlertProducts.length} product{lowStockAlertProducts.length !== 1 ? 's' : ''} below {ALERT_THRESHOLD} units
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                {products.filter(p => p.inventory === 0).length} out of stock ·{' '}
                {products.filter(p => p.inventory > 0 && p.inventory <= (p.lowStockThreshold ?? 10)).length} running low
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowAlertSettings(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-mail-send-line"></i>
              Send Email Alert
            </button>
            <button
              onClick={() => setAlertBannerDismissed(true)}
              className="w-7 h-7 flex items-center justify-center text-amber-500 hover:text-amber-800 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer"
            >
              <i className="ri-close-line"></i>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Products</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {products.length} total · {Object.keys(allAutoPrices).length} auto-priced vs Blinds.com
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAlertSettings(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-mail-send-line"></i></div>
            Email Alerts
            {lowStockAlertProducts.length > 0 && (
              <span className="ml-0.5 bg-amber-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {lowStockAlertProducts.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setShowBulkRestock(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-teal-700 bg-teal-50 border border-teal-200 hover:bg-teal-100 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-stack-line"></i></div>
            Bulk Restock
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-green-700 text-white text-sm font-semibold rounded-lg hover:bg-green-800 transition-colors cursor-pointer whitespace-nowrap"
          >
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line"></i></div>
            Add Product
          </button>
        </div>
      </div>

      {/* Auto-pricing info banner */}
      {Object.keys(allAutoPrices).length > 0 && (
        <div className="mb-6 flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl px-5 py-3">
          <div className="w-7 h-7 flex items-center justify-center bg-orange-100 rounded-lg shrink-0">
            <i className="ri-refresh-line text-orange-600 text-base"></i>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-orange-800">
              Auto-pricing active for {Object.keys(allAutoPrices).length} products
            </p>
            <p className="text-xs text-orange-600 mt-0.5">
              Prices marked <span className="font-bold">AUTO</span> are automatically set 15% below Blinds.com every month. Current month: <span className="font-bold">{Object.values(allAutoPrices)[0]?.monthLabel}</span>
            </p>
          </div>
          <a
            href="/admin/competitor-pricing"
            className="text-xs font-semibold text-orange-700 hover:text-orange-900 underline underline-offset-2 whitespace-nowrap cursor-pointer"
          >
            View Price Watch →
          </a>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Products', value: products.length, icon: 'ri-store-2-line', color: 'text-slate-700', bg: 'bg-slate-50' },
          { label: 'Total Inventory', value: totalInventory.toLocaleString(), icon: 'ri-stack-line', color: 'text-green-700', bg: 'bg-green-50' },
          { label: 'Low Stock', value: lowStock, icon: 'ri-alert-line', color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Out of Stock', value: outOfStock, icon: 'ri-close-circle-line', color: 'text-red-600', bg: 'bg-red-50' },
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
            placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 bg-white"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 bg-white text-slate-700 cursor-pointer"
        >
          <option value="all">All Categories</option>
          {categories.filter((c) => c.id !== 'all').map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
        <select
          value={filterStock}
          onChange={(e) => setFilterStock(e.target.value as typeof filterStock)}
          className="px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 bg-white text-slate-700 cursor-pointer"
        >
          <option value="all">All Stock Levels</option>
          <option value="in-stock">In Stock</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </select>

        {/* View mode toggle */}
        <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 gap-0.5">
          {([
            { id: 'table', icon: 'ri-table-line', label: 'Table' },
            { id: 'detail', icon: 'ri-layout-row-line', label: 'Detail' },
            { id: 'enhanced', icon: 'ri-layout-masonry-line', label: 'Enhanced' },
          ] as { id: ViewMode; icon: string; label: string }[]).map(m => (
            <button
              key={m.id}
              onClick={() => setViewMode(m.id)}
              title={`${m.label} View`}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                viewMode === m.id
                  ? 'bg-green-700 text-white'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="w-3.5 h-3.5 flex items-center justify-center"><i className={`${m.icon} text-sm`}></i></div>
              {m.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 px-4 py-2 bg-white border border-slate-200 rounded-lg">
          <span className="text-xs text-slate-400 font-medium">Legend:</span>
          <span className="flex items-center gap-1.5 text-xs text-red-700">
            <span className="w-3 h-3 rounded-sm bg-red-100 border border-red-300 inline-block"></span>Out of stock
          </span>
          <span className="flex items-center gap-1.5 text-xs text-amber-700">
            <span className="w-3 h-3 rounded-sm bg-amber-100 border border-amber-300 inline-block"></span>Below threshold
          </span>
          <span className="flex items-center gap-1.5 text-xs text-orange-600 font-semibold">
            <i className="ri-refresh-line text-xs"></i>AUTO = auto-priced
          </span>
        </div>
      </div>

      {/* ── DETAIL VIEW ── */}
      {viewMode === 'detail' && (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-slate-200 text-slate-400">
              <div className="w-10 h-10 flex items-center justify-center mb-2"><i className="ri-inbox-line text-3xl"></i></div>
              No products found
            </div>
          ) : (
            filtered.map(product => {
              const isRecentlySaved = recentlySavedId === product.id;
              const autoData = isAutoTrackedProduct(product.id) ? allAutoPrices[product.id] : null;
              return (
                <ProductDetailCard
                  key={product.id}
                  product={product}
                  restockHistory={restockHistory}
                  autoPrice={autoData ?? null}
                  recentlySaved={isRecentlySaved}
                  quickRestockId={quickRestockId}
                  quickRestockQty={quickRestockQty}
                  quickRestockNote={quickRestockNote}
                  quickRestockSuccess={quickRestockSuccess}
                  onView={() => setViewingProduct(product)}
                  onEdit={() => openEdit(product)}
                  onDelete={() => setDeleteTarget(product)}
                  onOpenQuickRestock={openQuickRestock}
                  onCloseQuickRestock={() => setQuickRestockId(null)}
                  onQuickRestockQtyChange={setQuickRestockQty}
                  onQuickRestockNoteChange={setQuickRestockNote}
                  onConfirmQuickRestock={handleQuickRestock}
                />
              );
            })
          )}
          {filtered.length > 0 && (
            <div className="px-5 py-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-500 flex items-center justify-between">
              <span>Showing {filtered.length} of {products.length} products</span>
              <div className="flex items-center gap-4">
                {outOfStock > 0 && <span className="flex items-center gap-1 text-red-600 font-medium"><i className="ri-close-circle-fill text-xs"></i>{outOfStock} out of stock</span>}
                {lowStock > 0 && <span className="flex items-center gap-1 text-amber-600 font-medium"><i className="ri-alert-fill text-xs"></i>{lowStock} below threshold</span>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── ENHANCED DETAIL VIEW ── */}
      {viewMode === 'enhanced' && (
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-slate-200 text-slate-400">
              <div className="w-10 h-10 flex items-center justify-center mb-2"><i className="ri-inbox-line text-3xl"></i></div>
              No products found
            </div>
          ) : (
            filtered.map(product => {
              const isRecentlySaved = recentlySavedId === product.id;
              const autoData = isAutoTrackedProduct(product.id) ? allAutoPrices[product.id] : null;
              return (
                <ProductEnhancedCard
                  key={product.id}
                  product={product}
                  restockHistory={restockHistory}
                  autoPrice={autoData ?? null}
                  recentlySaved={isRecentlySaved}
                  quickRestockId={quickRestockId}
                  quickRestockQty={quickRestockQty}
                  quickRestockNote={quickRestockNote}
                  quickRestockSuccess={quickRestockSuccess}
                  onView={() => setViewingProduct(product)}
                  onEdit={() => openEdit(product)}
                  onDelete={() => setDeleteTarget(product)}
                  onOpenQuickRestock={openQuickRestock}
                  onCloseQuickRestock={() => setQuickRestockId(null)}
                  onQuickRestockQtyChange={setQuickRestockQty}
                  onQuickRestockNoteChange={setQuickRestockNote}
                  onConfirmQuickRestock={handleQuickRestock}
                />
              );
            })
          )}
          {filtered.length > 0 && (
            <div className="px-5 py-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-500 flex items-center justify-between">
              <span>Showing {filtered.length} of {products.length} products</span>
              <div className="flex items-center gap-4">
                {outOfStock > 0 && <span className="flex items-center gap-1 text-red-600 font-medium"><i className="ri-close-circle-fill text-xs"></i>{outOfStock} out of stock</span>}
                {lowStock > 0 && <span className="flex items-center gap-1 text-amber-600 font-medium"><i className="ri-alert-fill text-xs"></i>{lowStock} below threshold</span>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TABLE VIEW ── */}
      {viewMode === 'table' && (
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Product</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Price</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  <div className="flex items-center gap-1.5">
                    Est. Sales
                    <span className="text-[10px] font-normal text-slate-400 normal-case">(vol · rev/unit)</span>
                  </div>
                </th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Rating</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  <div className="flex items-center gap-1.5">
                    Inventory
                    <span className="text-[10px] font-normal text-slate-400 normal-case">(per-product threshold)</span>
                  </div>
                </th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-400">
                    <div className="w-10 h-10 flex items-center justify-center mx-auto mb-2">
                      <i className="ri-inbox-line text-3xl"></i>
                    </div>
                    No products found
                  </td>
                </tr>
              ) : (
                filtered.map((product) => {
                  const status = getStockStatus(product);
                  const threshold = product.lowStockThreshold ?? 10;
                  const isRecentlySaved = recentlySavedId === product.id;
                  const autoData = isAutoTrackedProduct(product.id) ? allAutoPrices[product.id] : null;

                  const rowBg = isRecentlySaved
                    ? 'bg-green-50 hover:bg-green-50'
                    : status === 'out' ? 'bg-red-50 hover:bg-red-100/60'
                    : status === 'low' ? 'bg-amber-50 hover:bg-amber-100/60'
                    : 'hover:bg-slate-50';

                  const rowBorder = isRecentlySaved
                    ? 'border-l-4 border-l-green-500'
                    : status === 'out' ? 'border-l-4 border-l-red-400'
                    : status === 'low' ? 'border-l-4 border-l-amber-400'
                    : autoData ? 'border-l-4 border-l-orange-300'
                    : 'border-l-4 border-l-transparent';

                  const stockBadge = status === 'out'
                    ? { label: 'Out of Stock', cls: 'bg-red-100 text-red-700 border border-red-200' }
                    : status === 'low'
                    ? { label: `Low — ${product.inventory} left`, cls: 'bg-amber-100 text-amber-700 border border-amber-200' }
                    : { label: `${product.inventory} in stock`, cls: 'bg-green-100 text-green-700 border border-green-200' };

                  const maxBar = threshold * 2;
                  const barPct = Math.min(100, Math.round((product.inventory / maxBar) * 100));
                  const barColor = status === 'out' ? 'bg-red-400' : status === 'low' ? 'bg-amber-400' : 'bg-green-500';
                  const productRestocks = restockHistory.filter((e) => e.productId === product.id).length;

                  return (
                    <tr key={product.id} className={`transition-colors ${rowBg} ${rowBorder}`}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-lg overflow-hidden shrink-0 ${
                            isRecentlySaved ? 'ring-2 ring-green-400' :
                            status === 'out' ? 'ring-2 ring-red-300' :
                            status === 'low' ? 'ring-2 ring-amber-300' : 'bg-slate-100'
                          }`}>
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover object-top" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <button
                                onClick={() => navigate(`/admin/products/${product.id}`)}
                                className="font-semibold text-slate-900 leading-tight hover:text-green-700 hover:underline underline-offset-2 transition-colors cursor-pointer text-left"
                              >
                                {product.name}
                              </button>
                              {isRecentlySaved && (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-100 border border-green-200 px-2 py-0.5 rounded-full">
                                  <i className="ri-checkbox-circle-fill text-[10px]"></i>LIVE
                                </span>
                              )}
                              {status === 'out' && !isRecentlySaved && (
                                <span className="w-4 h-4 flex items-center justify-center text-red-500">
                                  <i className="ri-close-circle-fill text-sm"></i>
                                </span>
                              )}
                              {status === 'low' && !isRecentlySaved && (
                                <span className="w-4 h-4 flex items-center justify-center text-amber-500">
                                  <i className="ri-alert-fill text-sm"></i>
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => navigate(`/admin/products/${product.id}`)}
                              className="text-[11px] text-slate-400 hover:text-green-600 hover:underline underline-offset-2 transition-colors cursor-pointer mt-0.5 font-mono"
                            >
                              #{product.id}
                            </button>
                            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 max-w-[200px]">{product.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="capitalize text-slate-600 text-xs font-medium bg-slate-100 px-2.5 py-1 rounded-full">
                          {product.category.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {autoData ? (
                          <div>
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <p className="font-bold text-slate-900">${autoData.ourPrice.toFixed(2)}</p>
                              <span className="flex items-center gap-0.5 text-[10px] font-bold bg-orange-100 text-orange-700 border border-orange-200 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                                <i className="ri-refresh-line text-[9px]"></i>AUTO
                              </span>
                            </div>
                            <p className="text-[10px] text-red-400 line-through">
                              Blinds.com: ${autoData.competitorPrice.toFixed(2)}
                            </p>
                            <p className="text-[10px] text-orange-600 font-semibold flex items-center gap-0.5 mt-0.5">
                              <i className="ri-arrow-down-line text-[9px]"></i>
                              −15% · {autoData.monthShort}{autoData.hasSale ? ` · ${autoData.saleLabel}` : ''}
                            </p>
                          </div>
                        ) : (
                          <div>
                            <p className="font-bold text-slate-900">${product.price.toFixed(2)}</p>
                            <p className="text-xs text-slate-400 line-through">${product.originalPrice.toFixed(2)}</p>
                          </div>
                        )}
                      </td>
                      {/* Est. Sales column */}
                      {(() => {
                        const estUnits = Math.round(product.reviews * 2.4);
                        const revPerUnit = autoData ? autoData.ourPrice : product.price;
                        const estRevenue = estUnits * revPerUnit;
                        const avgUnitsThreshold = 2000;
                        const avgPriceThreshold = 160;
                        const isHighVol = estUnits >= avgUnitsThreshold;
                        const isHighVal = revPerUnit >= avgPriceThreshold;
                        return (
                          <td className="px-4 py-4 min-w-[140px]">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="text-sm font-bold text-slate-800">
                                ~{estUnits >= 1000 ? `${(estUnits / 1000).toFixed(1)}k` : estUnits}
                              </span>
                              <span className="text-xs text-slate-400">units</span>
                            </div>
                            <p className="text-xs text-slate-500 mb-1.5">
                              <span className="font-semibold text-emerald-700">${revPerUnit.toFixed(2)}</span>
                              <span className="text-slate-400"> / unit</span>
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {isHighVol && (
                                <span className="flex items-center gap-0.5 text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                                  <i className="ri-fire-line text-[9px]"></i>High Vol
                                </span>
                              )}
                              {isHighVal && (
                                <span className="flex items-center gap-0.5 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                                  <i className="ri-gem-line text-[9px]"></i>High Value
                                </span>
                              )}
                              {!isHighVol && !isHighVal && (
                                <span className="text-[10px] text-slate-400 font-medium">
                                  ~${(estRevenue / 1000).toFixed(1)}k est. rev
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })()}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          <div className="w-4 h-4 flex items-center justify-center text-green-600">
                            <i className="ri-star-fill text-xs"></i>
                          </div>
                          <span className="text-slate-700 font-medium">{product.rating}</span>
                          <span className="text-slate-400 text-xs">({product.reviews.toLocaleString()})</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 min-w-[200px]">
                        {quickEditId === product.id ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="0"
                              value={quickEditValue}
                              onChange={(e) => setQuickEditValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleQuickInventorySave(product.id);
                                if (e.key === 'Escape') setQuickEditId(null);
                              }}
                              autoFocus
                              className="w-20 px-2 py-1 text-sm border border-green-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                            />
                            <button
                              onClick={() => handleQuickInventorySave(product.id)}
                              className="w-6 h-6 flex items-center justify-center bg-green-600 text-white rounded cursor-pointer hover:bg-green-700"
                            >
                              <i className="ri-check-line text-xs"></i>
                            </button>
                            <button
                              onClick={() => setQuickEditId(null)}
                              className="w-6 h-6 flex items-center justify-center bg-slate-200 text-slate-600 rounded cursor-pointer hover:bg-slate-300"
                            >
                              <i className="ri-close-line text-xs"></i>
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${stockBadge.cls}`}>
                                {stockBadge.label}
                              </span>
                              <button
                                onClick={() => { setQuickEditId(product.id); setQuickEditValue(String(product.inventory)); }}
                                className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-green-700 hover:bg-green-50 rounded cursor-pointer transition-colors"
                                title="Quick edit inventory"
                              >
                                <i className="ri-edit-line text-xs"></i>
                              </button>
                              {productRestocks > 0 && (
                                <span className="flex items-center gap-0.5 text-[10px] font-semibold text-slate-400 cursor-default">
                                  <i className="ri-history-line text-xs"></i>{productRestocks}
                                </span>
                              )}
                            </div>
                            <div className="w-full max-w-[160px]">
                              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                                  style={{ width: `${barPct}%` }}
                                ></div>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                Threshold: <span className={`font-semibold ${status === 'low' || status === 'out' ? 'text-amber-600' : 'text-slate-500'}`}>{threshold} units</span>
                              </p>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div
                          className="relative flex items-center justify-end"
                          ref={openDropdownId === product.id ? dropdownRef : undefined}
                        >
                          {/* ... Actions Dropdown */}
                          <button
                            onClick={() => setOpenDropdownId(openDropdownId === product.id ? null : product.id)}
                            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Actions"
                          >
                            <i className="ri-more-2-fill text-base"></i>
                          </button>

                          {openDropdownId === product.id && (
                            <div className="absolute right-0 top-full mt-1 z-30 bg-white border border-slate-200 rounded-xl w-48 overflow-hidden">
                              <div className="py-1">
                                <button
                                  onClick={() => { setViewingProduct(product); setOpenDropdownId(null); }}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap text-left"
                                >
                                  <div className="w-4 h-4 flex items-center justify-center text-slate-400"><i className="ri-fullscreen-line"></i></div>
                                  View Full
                                </button>
                                <button
                                  onClick={() => { navigate(`/admin/products/${product.id}`); setOpenDropdownId(null); }}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap text-left"
                                >
                                  <div className="w-4 h-4 flex items-center justify-center text-slate-400"><i className="ri-external-link-line"></i></div>
                                  Open Page
                                </button>
                                <button
                                  onClick={() => { openEdit(product); setOpenDropdownId(null); }}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap text-left"
                                >
                                  <div className="w-4 h-4 flex items-center justify-center text-slate-400"><i className="ri-edit-line"></i></div>
                                  Edit
                                </button>
                                <button
                                  onClick={() => { openQuickRestock(product.id); setOpenDropdownId(null); }}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-green-700 hover:bg-green-50 transition-colors cursor-pointer whitespace-nowrap text-left"
                                >
                                  <div className="w-4 h-4 flex items-center justify-center text-green-500"><i className="ri-add-box-line"></i></div>
                                  Quick Restock
                                </button>
                                <div className="mx-3 my-1 border-t border-slate-100"></div>
                                <button
                                  onClick={() => { setDeleteTarget(product); setOpenDropdownId(null); }}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer whitespace-nowrap text-left"
                                >
                                  <div className="w-4 h-4 flex items-center justify-center text-red-400"><i className="ri-delete-bin-line"></i></div>
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Quick Restock Panel */}
                          {quickRestockId === product.id && (
                            <div className="absolute right-0 top-full mt-1 z-40 bg-white border border-green-200 rounded-xl p-3 w-64">
                              <p className="text-xs font-bold text-green-800 mb-2 flex items-center gap-1.5">
                                <span className="w-4 h-4 flex items-center justify-center">
                                  <i className="ri-add-box-line text-green-700"></i>
                                </span>
                                Quick Restock — {product.name.length > 18 ? product.name.slice(0, 18) + '…' : product.name}
                              </p>
                              <div className="space-y-2">
                                <div>
                                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">Units to Add <span className="text-red-500">*</span></label>
                                  <input
                                    type="number"
                                    min="1"
                                    autoFocus
                                    value={quickRestockQty}
                                    onChange={(e) => setQuickRestockQty(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleQuickRestock(product.id);
                                      if (e.key === 'Escape') setQuickRestockId(null);
                                    }}
                                    placeholder="e.g. 50"
                                    className="w-full px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">Note <span className="text-slate-400 font-normal">(optional)</span></label>
                                  <input
                                    type="text"
                                    value={quickRestockNote}
                                    onChange={(e) => setQuickRestockNote(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleQuickRestock(product.id);
                                      if (e.key === 'Escape') setQuickRestockId(null);
                                    }}
                                    placeholder="e.g. Supplier delivery"
                                    maxLength={80}
                                    className="w-full px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                  />
                                </div>
                                <div className="flex gap-2 pt-1">
                                  <button
                                    onClick={() => handleQuickRestock(product.id)}
                                    disabled={!quickRestockQty || parseInt(quickRestockQty, 10) <= 0}
                                    className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-green-700 text-white text-xs font-semibold rounded-lg hover:bg-green-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
                                  >
                                    <i className="ri-check-line"></i>Confirm
                                  </button>
                                  <button
                                    onClick={() => setQuickRestockId(null)}
                                    className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-500 flex items-center justify-between">
            <span>Showing {filtered.length} of {products.length} products</span>
            <div className="flex items-center gap-4">
              {outOfStock > 0 && (
                <span className="flex items-center gap-1 text-red-600 font-medium">
                  <i className="ri-close-circle-fill text-xs"></i>{outOfStock} out of stock
                </span>
              )}
              {lowStock > 0 && (
                <span className="flex items-center gap-1 text-amber-600 font-medium">
                  <i className="ri-alert-fill text-xs"></i>{lowStock} below threshold
                </span>
              )}
            </div>
          </div>
        )}
      </div>
      )}

      {/* Modals */}
      {viewingProduct && (
        <ProductFullView
          product={viewingProduct}
          restockHistory={restockHistory}
          onClose={() => setViewingProduct(null)}
          onEdit={() => { openEdit(viewingProduct); setViewingProduct(null); }}
          onDelete={() => { setDeleteTarget(viewingProduct); setViewingProduct(null); }}
          onRestock={handleAddRestock}
        />
      )}
      {showForm && (
        <ProductFormModal
          product={editProduct}
          restockHistory={restockHistory}
          onSave={handleSave}
          onRestock={handleAddRestock}
          onClose={() => { setShowForm(false); setEditProduct(null); }}
        />
      )}
      {deleteTarget && (
        <DeleteConfirmModal
          product={deleteTarget}
          onConfirm={() => handleDelete(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
        />
      )}
      {showAlertSettings && (
        <LowStockAlertSettings
          products={products}
          onClose={() => setShowAlertSettings(false)}
        />
      )}
      {showBulkRestock && (
        <BulkRestockModal
          products={products}
          onConfirm={(entries) => { handleBulkRestock(entries); }}
          onClose={() => setShowBulkRestock(false)}
        />
      )}
    </div>
  );
}
