import { useState, useEffect, useMemo } from 'react';
import type { PurchaseOrder, POStatus, POPriority, POLineItem } from '../types';

interface Props {
  po: PurchaseOrder | null;
  onClose: () => void;
  onSave: (po: PurchaseOrder) => void;
}

function genId() { return 'PO-' + Date.now().toString().slice(-7); }
function genLineId() { return 'LI-' + Math.random().toString(36).slice(2, 8).toUpperCase(); }

const BLANK_LINE: () => POLineItem = () => ({
  id: genLineId(), sku: '', name: '', description: '', quantity: 1, unitCost: 0, totalCost: 0,
});

const BLANK: PurchaseOrder = {
  id: '', supplierId: '', supplierName: '', companyId: '', companyName: '', requestedBy: '',
  status: 'Draft', priority: 'Standard', lineItems: [BLANK_LINE()],
  subtotal: 0, taxRate: 8.5, taxAmount: 0, shippingCost: 0, total: 0, currency: 'USD',
  paymentTerms: 'Net 30', expectedDelivery: '', deliveryAddress: '', notes: '', internalNotes: '',
  createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
};

export default function PurchaseOrderFormModal({ po, onClose, onSave }: Props) {
  const isEdit = !!po;
  const [form, setForm] = useState<PurchaseOrder>({ ...BLANK, id: genId() });

  const suppliers = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('admin_suppliers') ?? '[]'); } catch { return []; }
  }, []);
  const companies = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('admin_companies') ?? '[]'); } catch { return []; }
  }, []);

  useEffect(() => {
    if (po) setForm(po);
    else setForm({ ...BLANK, id: genId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }, [po]);

  const set = (field: keyof PurchaseOrder, val: any) => setForm((f) => ({ ...f, [field]: val }));

  const recalc = (items: POLineItem[], taxRate: number, shipping: number) => {
    const sub = items.reduce((s, i) => s + i.totalCost, 0);
    const tax = sub * (taxRate / 100);
    return { subtotal: sub, taxAmount: tax, total: sub + tax + shipping };
  };

  const updateLine = (idx: number, field: string, val: any) => {
    const updated = form.lineItems.map((l, i) => {
      if (i !== idx) return l;
      const next = { ...l, [field]: val };
      if (field === 'quantity' || field === 'unitCost') {
        next.totalCost = (field === 'quantity' ? val : l.quantity) * (field === 'unitCost' ? val : l.unitCost);
      }
      return next;
    });
    const totals = recalc(updated, form.taxRate, form.shippingCost);
    setForm((f) => ({ ...f, lineItems: updated, ...totals }));
  };

  const addLine = () => {
    const updated = [...form.lineItems, BLANK_LINE()];
    const totals = recalc(updated, form.taxRate, form.shippingCost);
    setForm((f) => ({ ...f, lineItems: updated, ...totals }));
  };

  const removeLine = (idx: number) => {
    const updated = form.lineItems.filter((_, i) => i !== idx);
    const totals = recalc(updated, form.taxRate, form.shippingCost);
    setForm((f) => ({ ...f, lineItems: updated, ...totals }));
  };

  const handleTaxChange = (val: number) => {
    const totals = recalc(form.lineItems, val, form.shippingCost);
    setForm((f) => ({ ...f, taxRate: val, ...totals }));
  };

  const handleShippingChange = (val: number) => {
    const totals = recalc(form.lineItems, form.taxRate, val);
    setForm((f) => ({ ...f, shippingCost: val, ...totals }));
  };

  const handleSupplierChange = (id: string) => {
    const supp = suppliers.find((s: any) => s.id === id);
    setForm((f) => ({ ...f, supplierId: id, supplierName: supp?.name ?? '' }));
  };

  const handleCompanyChange = (id: string) => {
    const co = companies.find((c: any) => c.id === id);
    setForm((f) => ({ ...f, companyId: id, companyName: co?.name ?? '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...form, updatedAt: new Date().toISOString() });
  };

  const PRIORITIES: POPriority[] = ['Low', 'Standard', 'High', 'Urgent'];
  const STATUSES: POStatus[] = ['Draft', 'Pending Approval', 'Approved', 'Sent to Supplier', 'Acknowledged', 'In Production', 'Shipped', 'Partially Received', 'Received', 'Cancelled'];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
              <i className="ri-file-list-3-line text-violet-600 text-lg"></i>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{isEdit ? `Edit PO — ${form.id}` : 'New Purchase Order'}</h2>
              <p className="text-xs text-slate-400">{isEdit ? 'Update purchase order details' : 'Create a new procurement request'}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 cursor-pointer">
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Meta */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Supplier *</label>
              <select required value={form.supplierId} onChange={(e) => handleSupplierChange(e.target.value)} className="w-full text-sm border border-slate-200 focus:border-violet-400 rounded-lg px-3 py-2.5 outline-none cursor-pointer">
                <option value="">Select supplier...</option>
                {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Requesting Company</label>
              <select value={form.companyId ?? ''} onChange={(e) => handleCompanyChange(e.target.value)} className="w-full text-sm border border-slate-200 focus:border-violet-400 rounded-lg px-3 py-2.5 outline-none cursor-pointer">
                <option value="">Internal / No company</option>
                {companies.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Requested By *</label>
              <input required value={form.requestedBy} onChange={(e) => set('requestedBy', e.target.value)} className="w-full text-sm border border-slate-200 focus:border-violet-400 rounded-lg px-3 py-2.5 outline-none" placeholder="e.g. Sarah Johnson" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Status</label>
              <select value={form.status} onChange={(e) => set('status', e.target.value as POStatus)} className="w-full text-sm border border-slate-200 focus:border-violet-400 rounded-lg px-3 py-2.5 outline-none cursor-pointer">
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Priority</label>
              <div className="flex gap-2">
                {PRIORITIES.map((p) => (
                  <button key={p} type="button" onClick={() => set('priority', p)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg cursor-pointer whitespace-nowrap transition-colors ${
                      form.priority === p
                        ? p === 'Urgent' ? 'bg-red-600 text-white' : p === 'High' ? 'bg-orange-500 text-white' : p === 'Standard' ? 'bg-violet-600 text-white' : 'bg-slate-600 text-white'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}>{p}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Payment Terms</label>
              <select value={form.paymentTerms} onChange={(e) => set('paymentTerms', e.target.value)} className="w-full text-sm border border-slate-200 focus:border-violet-400 rounded-lg px-3 py-2.5 outline-none cursor-pointer">
                {['Net 15', 'Net 30', 'Net 45', 'Net 60', 'Due on Receipt', '2/10 Net 30'].map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Expected Delivery</label>
              <input type="date" value={form.expectedDelivery?.slice(0, 10) ?? ''} onChange={(e) => set('expectedDelivery', e.target.value)} className="w-full text-sm border border-slate-200 focus:border-violet-400 rounded-lg px-3 py-2.5 outline-none cursor-pointer" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Delivery Address</label>
              <input value={form.deliveryAddress} onChange={(e) => set('deliveryAddress', e.target.value)} className="w-full text-sm border border-slate-200 focus:border-violet-400 rounded-lg px-3 py-2.5 outline-none" placeholder="Ship to address..." />
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Line Items</p>
              <button type="button" onClick={addLine} className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 text-violet-600 hover:bg-violet-100 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap">
                <i className="ri-add-line"></i> Add Line
              </button>
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-3 py-2.5 text-xs font-semibold text-slate-500">SKU</th>
                    <th className="px-3 py-2.5 text-xs font-semibold text-slate-500">Product Name</th>
                    <th className="px-3 py-2.5 text-xs font-semibold text-slate-500 w-20">Qty</th>
                    <th className="px-3 py-2.5 text-xs font-semibold text-slate-500 w-28">Unit Cost</th>
                    <th className="px-3 py-2.5 text-xs font-semibold text-slate-500 w-28">Total</th>
                    <th className="px-3 py-2.5 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {form.lineItems.map((line, idx) => (
                    <tr key={line.id}>
                      <td className="px-2 py-2"><input value={line.sku} onChange={(e) => updateLine(idx, 'sku', e.target.value)} className="w-24 text-xs border border-slate-200 focus:border-violet-400 rounded px-2 py-1.5 outline-none" placeholder="SKU" /></td>
                      <td className="px-2 py-2"><input value={line.name} onChange={(e) => updateLine(idx, 'name', e.target.value)} className="w-full text-xs border border-slate-200 focus:border-violet-400 rounded px-2 py-1.5 outline-none" placeholder="Product name..." /></td>
                      <td className="px-2 py-2"><input type="number" min="1" value={line.quantity} onChange={(e) => updateLine(idx, 'quantity', parseInt(e.target.value) || 1)} className="w-16 text-xs border border-slate-200 focus:border-violet-400 rounded px-2 py-1.5 outline-none" /></td>
                      <td className="px-2 py-2">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-slate-400">$</span>
                          <input type="number" min="0" step="0.01" value={line.unitCost} onChange={(e) => updateLine(idx, 'unitCost', parseFloat(e.target.value) || 0)} className="w-20 text-xs border border-slate-200 focus:border-violet-400 rounded px-2 py-1.5 outline-none" />
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span className="text-xs font-semibold text-slate-700">${line.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </td>
                      <td className="px-2 py-2">
                        <button type="button" onClick={() => removeLine(idx)} className="w-6 h-6 flex items-center justify-center text-red-400 hover:text-red-600 cursor-pointer">
                          <i className="ri-delete-bin-line text-xs"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mt-4">
              <div className="w-72 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-semibold text-slate-700">${form.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Tax</span>
                    <div className="flex items-center gap-1">
                      <input type="number" min="0" max="30" step="0.1" value={form.taxRate} onChange={(e) => handleTaxChange(parseFloat(e.target.value) || 0)} className="w-14 text-xs border border-slate-200 rounded px-1.5 py-1 outline-none text-center" />
                      <span className="text-xs text-slate-400">%</span>
                    </div>
                  </div>
                  <span className="font-semibold text-slate-700">${form.taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Shipping</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-slate-400">$</span>
                      <input type="number" min="0" step="0.01" value={form.shippingCost} onChange={(e) => handleShippingChange(parseFloat(e.target.value) || 0)} className="w-16 text-xs border border-slate-200 rounded px-1.5 py-1 outline-none" />
                    </div>
                  </div>
                  <span className="font-semibold text-slate-700">${form.shippingCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-base font-bold border-t border-slate-200 pt-2">
                  <span className="text-slate-800">Total</span>
                  <span className="text-violet-700">${form.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Notes to Supplier</label>
              <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={3} maxLength={500} className="w-full text-sm border border-slate-200 focus:border-violet-400 rounded-lg px-3 py-2.5 outline-none resize-none" placeholder="Delivery instructions, special requirements..." />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Internal Notes</label>
              <textarea value={form.internalNotes} onChange={(e) => set('internalNotes', e.target.value)} rows={3} maxLength={500} className="w-full text-sm border border-slate-200 focus:border-violet-400 rounded-lg px-3 py-2.5 outline-none resize-none" placeholder="Internal team notes, cost justification..." />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0 bg-slate-50/60">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer whitespace-nowrap">
            Cancel
          </button>
          <button
            onClick={handleSubmit as any}
            className="flex items-center gap-2 px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-lg cursor-pointer whitespace-nowrap"
          >
            <i className="ri-save-line"></i>
            {isEdit ? 'Save Changes' : 'Create PO'}
          </button>
        </div>
      </div>
    </div>
  );
}
