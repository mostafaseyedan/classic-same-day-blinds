import { useState, useEffect } from 'react';
import type { Supplier, SupplierStatus, SupplierCategory, SupplierTier } from '../types';

interface Props {
  supplier: Supplier | null;
  onClose: () => void;
  onSave: (s: Supplier) => void;
}

function generateId() {
  return 'SUPP-' + String(Date.now()).slice(-6).padStart(6, '0');
}

const BLANK: Supplier = {
  id: '',
  name: '',
  category: 'Manufacturer',
  tier: 'Standard',
  status: 'Active',
  website: '',
  taxId: '',
  paymentTerms: 'Net 30',
  currency: 'USD',
  primaryContact: { name: '', title: '', email: '', phone: '' },
  billingStreet: '',
  billingCity: '',
  billingState: '',
  billingZip: '',
  billingCountry: 'USA',
  products: [],
  notes: '',
  tags: [],
  rating: 4,
  totalOrders: 0,
  totalSpend: 0,
  onTimeDeliveryRate: 95,
  defectRate: 1,
  createdAt: new Date().toISOString(),
  lastOrderAt: new Date().toISOString(),
};

export default function SupplierFormModal({ supplier, onClose, onSave }: Props) {
  const isEdit = !!supplier;
  const [form, setForm] = useState<Supplier>({ ...BLANK, id: generateId() });
  const [tagInput, setTagInput] = useState('');
  const [activeTab, setActiveTab] = useState<'info' | 'contact' | 'products' | 'metrics'>('info');

  useEffect(() => {
    if (supplier) setForm(supplier);
    else setForm({ ...BLANK, id: generateId(), createdAt: new Date().toISOString() });
  }, [supplier]);

  const set = (field: keyof Supplier, val: any) => setForm((f) => ({ ...f, [field]: val }));
  const setContact = (field: string, val: string) =>
    setForm((f) => ({ ...f, primaryContact: { ...f.primaryContact, [field]: val } }));

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (!t || form.tags.includes(t)) { setTagInput(''); return; }
    set('tags', [...form.tags, t]);
    setTagInput('');
  };
  const removeTag = (t: string) => set('tags', form.tags.filter((x) => x !== t));

  const addProduct = () => {
    const p = { id: Date.now().toString(), sku: '', name: '', unitCost: 0, leadTimeDays: 14, minOrderQty: 1 };
    set('products', [...form.products, p]);
  };
  const updateProduct = (idx: number, field: string, val: any) => {
    const updated = form.products.map((p, i) => i === idx ? { ...p, [field]: val } : p);
    set('products', updated);
  };
  const removeProduct = (idx: number) => set('products', form.products.filter((_, i) => i !== idx));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...form, updatedAt: new Date().toISOString() } as any);
  };

  const TABS = [
    { id: 'info', label: 'Company Info', icon: 'ri-building-2-line' },
    { id: 'contact', label: 'Contact', icon: 'ri-contacts-line' },
    { id: 'products', label: 'Products', icon: 'ri-box-3-line' },
    { id: 'metrics', label: 'Metrics', icon: 'ri-bar-chart-2-line' },
  ] as const;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <i className="ri-truck-line text-indigo-600 text-lg"></i>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{isEdit ? 'Edit Supplier' : 'Add New Supplier'}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{isEdit ? form.id : 'New vendor / supplier record'}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 cursor-pointer">
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-6 gap-1 shrink-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <i className={`${tab.icon} text-sm`}></i>
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 space-y-4">
            {/* ── Info Tab ── */}
            {activeTab === 'info' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Supplier Name *</label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => set('name', e.target.value)}
                      className="w-full text-sm border border-slate-200 focus:border-indigo-400 rounded-lg px-3 py-2.5 outline-none"
                      placeholder="e.g. Pacific Fabric Co."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Category</label>
                    <select value={form.category} onChange={(e) => set('category', e.target.value as SupplierCategory)} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 outline-none cursor-pointer">
                      {(['Manufacturer', 'Distributor', 'Wholesaler', 'Raw Materials', 'Services'] as const).map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tier</label>
                    <select value={form.tier} onChange={(e) => set('tier', e.target.value as SupplierTier)} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 outline-none cursor-pointer">
                      {(['Preferred', 'Standard', 'Probationary'] as const).map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Status</label>
                    <select value={form.status} onChange={(e) => set('status', e.target.value as SupplierStatus)} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 outline-none cursor-pointer">
                      {(['Active', 'Inactive', 'On Hold', 'Pending'] as const).map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Payment Terms</label>
                    <select value={form.paymentTerms} onChange={(e) => set('paymentTerms', e.target.value)} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 outline-none cursor-pointer">
                      {['Net 15', 'Net 30', 'Net 45', 'Net 60', 'Due on Receipt', '2/10 Net 30'].map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Website</label>
                    <input value={form.website} onChange={(e) => set('website', e.target.value)} className="w-full text-sm border border-slate-200 focus:border-indigo-400 rounded-lg px-3 py-2.5 outline-none" placeholder="https://" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tax ID / EIN</label>
                    <input value={form.taxId} onChange={(e) => set('taxId', e.target.value)} className="w-full text-sm border border-slate-200 focus:border-indigo-400 rounded-lg px-3 py-2.5 outline-none" placeholder="XX-XXXXXXX" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Billing Address</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <input value={form.billingStreet} onChange={(e) => set('billingStreet', e.target.value)} className="w-full text-sm border border-slate-200 focus:border-indigo-400 rounded-lg px-3 py-2.5 outline-none" placeholder="Street address" />
                    </div>
                    <input value={form.billingCity} onChange={(e) => set('billingCity', e.target.value)} className="text-sm border border-slate-200 focus:border-indigo-400 rounded-lg px-3 py-2.5 outline-none" placeholder="City" />
                    <div className="flex gap-2">
                      <input value={form.billingState} onChange={(e) => set('billingState', e.target.value)} className="w-20 text-sm border border-slate-200 focus:border-indigo-400 rounded-lg px-3 py-2.5 outline-none" placeholder="State" />
                      <input value={form.billingZip} onChange={(e) => set('billingZip', e.target.value)} className="flex-1 text-sm border border-slate-200 focus:border-indigo-400 rounded-lg px-3 py-2.5 outline-none" placeholder="ZIP" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tags</label>
                  <div className="flex gap-2 flex-wrap mb-2">
                    {form.tags.map((t) => (
                      <span key={t} className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold">
                        {t}
                        <button type="button" onClick={() => removeTag(t)} className="hover:text-red-500 cursor-pointer">
                          <i className="ri-close-line text-xs"></i>
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="flex-1 text-sm border border-slate-200 focus:border-indigo-400 rounded-lg px-3 py-2 outline-none"
                      placeholder="Add tag (press Enter)"
                    />
                    <button type="button" onClick={addTag} className="px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-semibold cursor-pointer hover:bg-indigo-100 whitespace-nowrap">
                      Add
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Notes</label>
                  <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={3} maxLength={500} className="w-full text-sm border border-slate-200 focus:border-indigo-400 rounded-lg px-3 py-2.5 outline-none resize-none" placeholder="General notes about this supplier..." />
                </div>
              </>
            )}

            {/* ── Contact Tab ── */}
            {activeTab === 'contact' && (
              <div className="space-y-4">
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                  <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-3">Primary Contact</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Full Name</label>
                      <input value={form.primaryContact.name} onChange={(e) => setContact('name', e.target.value)} className="w-full text-sm border border-slate-200 focus:border-indigo-400 rounded-lg px-3 py-2.5 outline-none" placeholder="Jane Smith" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Title</label>
                      <input value={form.primaryContact.title} onChange={(e) => setContact('title', e.target.value)} className="w-full text-sm border border-slate-200 focus:border-indigo-400 rounded-lg px-3 py-2.5 outline-none" placeholder="Account Manager" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Email</label>
                      <input type="email" value={form.primaryContact.email} onChange={(e) => setContact('email', e.target.value)} className="w-full text-sm border border-slate-200 focus:border-indigo-400 rounded-lg px-3 py-2.5 outline-none" placeholder="jane@supplier.com" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Phone</label>
                      <input value={form.primaryContact.phone} onChange={(e) => setContact('phone', e.target.value)} className="w-full text-sm border border-slate-200 focus:border-indigo-400 rounded-lg px-3 py-2.5 outline-none" placeholder="(555) 000-0000" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Products Tab ── */}
            {activeTab === 'products' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Catalog ({form.products.length} items)</p>
                  <button type="button" onClick={addProduct} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap">
                    <i className="ri-add-line"></i> Add Product
                  </button>
                </div>
                {form.products.length === 0 && (
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <i className="ri-box-3-line text-slate-400 text-xl"></i>
                    </div>
                    <p className="text-sm text-slate-500">No products yet. Add items from this supplier&apos;s catalog.</p>
                  </div>
                )}
                {form.products.map((p, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">Product #{idx + 1}</span>
                      <button type="button" onClick={() => removeProduct(idx)} className="w-6 h-6 flex items-center justify-center text-red-400 hover:text-red-600 cursor-pointer">
                        <i className="ri-delete-bin-line text-sm"></i>
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">SKU</label>
                        <input value={p.sku} onChange={(e) => updateProduct(idx, 'sku', e.target.value)} className="w-full text-sm border border-slate-200 focus:border-indigo-400 rounded-lg px-3 py-2 outline-none" placeholder="SKU-001" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Product Name</label>
                        <input value={p.name} onChange={(e) => updateProduct(idx, 'name', e.target.value)} className="w-full text-sm border border-slate-200 focus:border-indigo-400 rounded-lg px-3 py-2 outline-none" placeholder="e.g. Faux Wood Slat" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Unit Cost ($)</label>
                        <input type="number" min="0" step="0.01" value={p.unitCost} onChange={(e) => updateProduct(idx, 'unitCost', parseFloat(e.target.value) || 0)} className="w-full text-sm border border-slate-200 focus:border-indigo-400 rounded-lg px-3 py-2 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Lead Time (days)</label>
                        <input type="number" min="1" value={p.leadTimeDays} onChange={(e) => updateProduct(idx, 'leadTimeDays', parseInt(e.target.value) || 1)} className="w-full text-sm border border-slate-200 focus:border-indigo-400 rounded-lg px-3 py-2 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Min Order Qty</label>
                        <input type="number" min="1" value={p.minOrderQty} onChange={(e) => updateProduct(idx, 'minOrderQty', parseInt(e.target.value) || 1)} className="w-full text-sm border border-slate-200 focus:border-indigo-400 rounded-lg px-3 py-2 outline-none" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Metrics Tab ── */}
            {activeTab === 'metrics' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Rating (1–5)</label>
                    <div className="flex gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} type="button" onClick={() => set('rating', star)} className={`w-8 h-8 flex items-center justify-center text-lg cursor-pointer transition-colors ${star <= form.rating ? 'text-amber-400' : 'text-slate-200 hover:text-amber-200'}`}>
                          <i className="ri-star-fill"></i>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Total Orders</label>
                    <input type="number" min="0" value={form.totalOrders} onChange={(e) => set('totalOrders', parseInt(e.target.value) || 0)} className="w-full text-sm border border-slate-200 focus:border-indigo-400 rounded-lg px-3 py-2.5 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Total Spend ($)</label>
                    <input type="number" min="0" step="0.01" value={form.totalSpend} onChange={(e) => set('totalSpend', parseFloat(e.target.value) || 0)} className="w-full text-sm border border-slate-200 focus:border-indigo-400 rounded-lg px-3 py-2.5 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">On-Time Delivery %</label>
                    <input type="number" min="0" max="100" value={form.onTimeDeliveryRate} onChange={(e) => set('onTimeDeliveryRate', parseFloat(e.target.value) || 0)} className="w-full text-sm border border-slate-200 focus:border-indigo-400 rounded-lg px-3 py-2.5 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Defect Rate %</label>
                    <input type="number" min="0" max="100" step="0.1" value={form.defectRate} onChange={(e) => set('defectRate', parseFloat(e.target.value) || 0)} className="w-full text-sm border border-slate-200 focus:border-indigo-400 rounded-lg px-3 py-2.5 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Last Order Date</label>
                    <input type="date" value={form.lastOrderAt?.slice(0, 10) ?? ''} onChange={(e) => set('lastOrderAt', new Date(e.target.value).toISOString())} className="w-full text-sm border border-slate-200 focus:border-indigo-400 rounded-lg px-3 py-2.5 outline-none cursor-pointer" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/60">
            <div className="flex gap-1">
              {TABS.map((tab) => (
                <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                  className={`w-2 h-2 rounded-full cursor-pointer transition-colors ${activeTab === tab.id ? 'bg-indigo-600' : 'bg-slate-300 hover:bg-slate-400'}`}
                />
              ))}
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer whitespace-nowrap">
                Cancel
              </button>
              <button type="submit" className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg cursor-pointer whitespace-nowrap">
                <i className="ri-save-line"></i>
                {isEdit ? 'Save Changes' : 'Add Supplier'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
