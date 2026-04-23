import { useState, useMemo } from 'react';
import type { Product, RestockEntry } from '../page';

interface BulkRestockRow {
  productId: number;
  qty: string;
  note: string;
  selected: boolean;
}

interface Props {
  products: Product[];
  onConfirm: (entries: { productId: number; qty: number; note: string }[]) => void;
  onClose: () => void;
}

export default function BulkRestockModal({ products, onConfirm, onClose }: Props) {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [globalNote, setGlobalNote] = useState('');
  const [applyGlobalNote, setApplyGlobalNote] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [rows, setRows] = useState<BulkRestockRow[]>(() =>
    products.map((p) => ({
      productId: p.id,
      qty: '',
      note: '',
      selected: false,
    }))
  );

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category)));
    return cats;
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCategory === 'all' || p.category === filterCategory;
      return matchSearch && matchCat;
    });
  }, [products, search, filterCategory]);

  const getRow = (productId: number) => rows.find((r) => r.productId === productId)!;

  const updateRow = (productId: number, patch: Partial<BulkRestockRow>) => {
    setRows((prev) =>
      prev.map((r) => (r.productId === productId ? { ...r, ...patch } : r))
    );
  };

  const toggleSelect = (productId: number) => {
    const row = getRow(productId);
    updateRow(productId, { selected: !row.selected });
  };

  const selectAll = () => {
    const allIds = filteredProducts.map((p) => p.id);
    const allSelected = allIds.every((id) => getRow(id).selected);
    setRows((prev) =>
      prev.map((r) =>
        allIds.includes(r.productId) ? { ...r, selected: !allSelected } : r
      )
    );
  };

  const selectedRows = rows.filter((r) => r.selected);
  const validRows = selectedRows.filter((r) => {
    const qty = parseInt(r.qty, 10);
    return !isNaN(qty) && qty > 0;
  });

  const allFilteredSelected =
    filteredProducts.length > 0 &&
    filteredProducts.every((p) => getRow(p.id).selected);

  const handleQtyChange = (productId: number, value: string) => {
    updateRow(productId, { qty: value, selected: value.trim() !== '' && parseInt(value, 10) > 0 });
  };

  const handleApplyGlobalNote = () => {
    if (!globalNote.trim()) return;
    setRows((prev) =>
      prev.map((r) => (r.selected ? { ...r, note: globalNote } : r))
    );
  };

  const handleSubmit = () => {
    if (validRows.length === 0) return;
    const entries = validRows.map((r) => ({
      productId: r.productId,
      qty: parseInt(r.qty, 10),
      note: applyGlobalNote ? globalNote : r.note,
    }));
    onConfirm(entries);
    setSubmitted(true);
  };

  const getStockBadge = (p: Product) => {
    const threshold = p.lowStockThreshold ?? 10;
    if (p.inventory === 0) return { label: 'Out', cls: 'bg-red-100 text-red-700' };
    if (p.inventory <= threshold) return { label: `${p.inventory}`, cls: 'bg-amber-100 text-amber-700' };
    return { label: `${p.inventory}`, cls: 'bg-green-100 text-green-700' };
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl p-10 flex flex-col items-center gap-4 max-w-sm w-full mx-4">
          <div className="w-16 h-16 flex items-center justify-center bg-green-100 rounded-full">
            <i className="ri-checkbox-circle-line text-green-600 text-4xl"></i>
          </div>
          <h3 className="text-xl font-bold text-slate-900">Restock Complete!</h3>
          <p className="text-sm text-slate-500 text-center">
            Successfully updated inventory for <strong>{validRows.length}</strong> product{validRows.length !== 1 ? 's' : ''}.
          </p>
          <button
            onClick={onClose}
            className="mt-2 px-8 py-2.5 bg-green-700 text-white text-sm font-semibold rounded-lg hover:bg-green-800 transition-colors cursor-pointer whitespace-nowrap"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Bulk Restock</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter quantities for multiple products and update inventory all at once
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0 space-y-3">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-slate-400">
                <i className="ri-search-line text-sm"></i>
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 bg-white"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 bg-white text-slate-700 cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c.replace(/-/g, ' ')}</option>
              ))}
            </select>
          </div>

          {/* Global note bar */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 shrink-0">
              <input
                type="checkbox"
                id="applyGlobalNote"
                checked={applyGlobalNote}
                onChange={(e) => setApplyGlobalNote(e.target.checked)}
                className="w-4 h-4 accent-green-700 cursor-pointer"
              />
              <label htmlFor="applyGlobalNote" className="text-xs font-medium text-slate-600 cursor-pointer whitespace-nowrap">
                Apply one note to all
              </label>
            </div>
            <input
              type="text"
              value={globalNote}
              onChange={(e) => setGlobalNote(e.target.value)}
              disabled={!applyGlobalNote}
              placeholder="e.g. Supplier delivery — PO #1042"
              className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 bg-white disabled:bg-slate-100 disabled:text-slate-400"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-5 py-3 text-left w-10">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={selectAll}
                    className="w-4 h-4 accent-green-700 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Product</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide w-24">Stock</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide w-32">Add Qty</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400 text-sm">
                    No products match your search
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const row = getRow(product.id);
                  const badge = getStockBadge(product);
                  const qtyNum = parseInt(row.qty, 10);
                  const hasValidQty = !isNaN(qtyNum) && qtyNum > 0;
                  const newStock = hasValidQty ? product.inventory + qtyNum : null;

                  return (
                    <tr
                      key={product.id}
                      className={`transition-colors ${row.selected ? 'bg-green-50/60' : 'hover:bg-slate-50'}`}
                    >
                      <td className="px-5 py-3">
                        <input
                          type="checkbox"
                          checked={row.selected}
                          onChange={() => toggleSelect(product.id)}
                          className="w-4 h-4 accent-green-700 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover object-top"
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 text-sm leading-tight">{product.name}</p>
                            <p className="text-xs text-slate-400 capitalize mt-0.5">{product.category.replace(/-/g, ' ')}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full w-fit ${badge.cls}`}>
                            {badge.label} units
                          </span>
                          {newStock !== null && (
                            <span className="text-[11px] text-green-700 font-medium">
                              → {newStock.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="1"
                          value={row.qty}
                          onChange={(e) => handleQtyChange(product.id, e.target.value)}
                          placeholder="0"
                          className={`w-24 px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition-colors ${
                            hasValidQty
                              ? 'border-green-400 bg-green-50'
                              : 'border-slate-200 bg-white'
                          }`}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={applyGlobalNote ? globalNote : row.note}
                          onChange={(e) => !applyGlobalNote && updateRow(product.id, { note: e.target.value })}
                          disabled={applyGlobalNote}
                          placeholder="Optional note..."
                          className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 bg-white disabled:bg-slate-100 disabled:text-slate-400"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 shrink-0 flex items-center justify-between gap-4">
          <div className="text-sm text-slate-600">
            {validRows.length > 0 ? (
              <span className="font-semibold text-green-700">
                {validRows.length} product{validRows.length !== 1 ? 's' : ''} ready to restock
                {' '}·{' '}
                +{validRows.reduce((s, r) => s + parseInt(r.qty, 10), 0).toLocaleString()} units total
              </span>
            ) : (
              <span className="text-slate-400">Enter quantities to get started</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={validRows.length === 0}
              className="flex items-center gap-2 px-6 py-2.5 bg-green-700 text-white text-sm font-semibold rounded-lg hover:bg-green-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-stack-line"></i>
              </div>
              Restock {validRows.length > 0 ? `${validRows.length} Product${validRows.length !== 1 ? 's' : ''}` : 'Products'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
