import { useState, useMemo } from 'react';
import type { Supplier, SupplierStatus, SupplierCategory, SupplierTier } from './types';
import SupplierFormModal from './components/SupplierFormModal';
import SupplierEmailsModal from './components/SupplierEmailsModal';
import BulkEmailModal, { type BulkRecipient } from '../shared/components/BulkEmailModal';

const SEED_SUPPLIERS: Supplier[] = [
  {
    id: 'SUPP-001', name: 'Pacific Fabric Co.', category: 'Manufacturer', tier: 'Preferred', status: 'Active',
    website: 'https://pacificfabric.com', taxId: '82-4571923', paymentTerms: 'Net 30', currency: 'USD',
    primaryContact: { name: 'Michael Huang', title: 'Account Director', email: 'mhuang@pacificfabric.com', phone: '(213) 555-0101' },
    billingStreet: '1201 Industrial Way', billingCity: 'Los Angeles', billingState: 'CA', billingZip: '90021', billingCountry: 'USA',
    products: [
      { sku: 'PFC-FW-SLT', name: 'Faux Wood Slat Material', unitCost: 3.40, leadTimeDays: 12, minOrderQty: 500 },
      { sku: 'PFC-RL-FAB', name: 'Roller Shade Fabric Roll', unitCost: 7.80, leadTimeDays: 10, minOrderQty: 100 },
    ],
    notes: 'Primary raw material supplier. 5% volume discount above $100K/quarter.',
    tags: ['raw-materials', 'fabric', 'preferred', 'volume-discount'],
    rating: 5, totalOrders: 142, totalSpend: 1840000, onTimeDeliveryRate: 97.2, defectRate: 0.4,
    createdAt: new Date(Date.now() - 3 * 365 * 86400000).toISOString(),
    lastOrderAt: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    id: 'SUPP-002', name: 'Westin Hardware Supply', category: 'Distributor', tier: 'Preferred', status: 'Active',
    website: 'https://westinhardware.com', taxId: '56-7813205', paymentTerms: 'Net 45', currency: 'USD',
    primaryContact: { name: 'Dana Kowalski', title: 'Sales Rep', email: 'dkowalski@westinhardware.com', phone: '(312) 555-0220' },
    billingStreet: '400 N Michigan Ave', billingCity: 'Chicago', billingState: 'IL', billingZip: '60611', billingCountry: 'USA',
    products: [
      { sku: 'WH-CORD-HD', name: 'Lift Cord Hardware Set', unitCost: 1.25, leadTimeDays: 7, minOrderQty: 200 },
      { sku: 'WH-RAIL-ALU', name: 'Aluminum Head Rail', unitCost: 5.60, leadTimeDays: 10, minOrderQty: 100 },
      { sku: 'WH-BRKT-STD', name: 'Standard Mounting Bracket', unitCost: 0.80, leadTimeDays: 5, minOrderQty: 500 },
    ],
    notes: 'All mechanical hardware components. Fast fulfillment, stocked in Chicago warehouse.',
    tags: ['hardware', 'fast-ship', 'preferred'],
    rating: 4, totalOrders: 88, totalSpend: 312000, onTimeDeliveryRate: 94.5, defectRate: 1.1,
    createdAt: new Date(Date.now() - 2 * 365 * 86400000).toISOString(),
    lastOrderAt: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: 'SUPP-003', name: 'Coastal Packaging Solutions', category: 'Services', tier: 'Standard', status: 'Active',
    website: 'https://coastalpkg.com', taxId: '74-1029384', paymentTerms: 'Net 30', currency: 'USD',
    primaryContact: { name: 'Rosa Delgado', title: 'Key Accounts', email: 'rosa@coastalpkg.com', phone: '(619) 555-0317' },
    billingStreet: '3301 Harbor Dr', billingCity: 'San Diego', billingState: 'CA', billingZip: '92101', billingCountry: 'USA',
    products: [
      { sku: 'CP-BOX-STD', name: 'Standard Blind Shipping Box', unitCost: 0.95, leadTimeDays: 5, minOrderQty: 1000 },
      { sku: 'CP-WRAP-FOAM', name: 'Foam Wrap Roll', unitCost: 0.30, leadTimeDays: 3, minOrderQty: 500 },
    ],
    notes: 'Packaging supplier. Custom box sizes available on 3-week lead.',
    tags: ['packaging', 'custom-box'],
    rating: 4, totalOrders: 53, totalSpend: 96400, onTimeDeliveryRate: 91.8, defectRate: 0.6,
    createdAt: new Date(Date.now() - 18 * 30 * 86400000).toISOString(),
    lastOrderAt: new Date(Date.now() - 22 * 86400000).toISOString(),
  },
  {
    id: 'SUPP-004', name: 'MechaBlind Components Inc.', category: 'Manufacturer', tier: 'Standard', status: 'Active',
    website: 'https://mechablind.com', taxId: '93-2847561', paymentTerms: 'Net 30', currency: 'USD',
    primaryContact: { name: 'Tomas Reyes', title: 'Sales Director', email: 'treyes@mechablind.com', phone: '(909) 555-0444' },
    billingStreet: '7700 Cherry Ave', billingCity: 'Fontana', billingState: 'CA', billingZip: '92336', billingCountry: 'USA',
    products: [
      { sku: 'MB-MTR-DC24', name: 'DC 24V Motorized Tilt Unit', unitCost: 28.50, leadTimeDays: 20, minOrderQty: 50 },
      { sku: 'MB-CHAIN-PLT', name: 'Plastic Bead Chain', unitCost: 0.12, leadTimeDays: 7, minOrderQty: 1000 },
    ],
    notes: 'Motor components for motorized blinds. Lead times can extend 4–6 weeks during peak season.',
    tags: ['motorized', 'components', 'seasonal-delay'],
    rating: 3, totalOrders: 29, totalSpend: 215000, onTimeDeliveryRate: 82.7, defectRate: 2.3,
    createdAt: new Date(Date.now() - 14 * 30 * 86400000).toISOString(),
    lastOrderAt: new Date(Date.now() - 45 * 86400000).toISOString(),
  },
  {
    id: 'SUPP-005', name: 'Global Textiles Ltd.', category: 'Wholesaler', tier: 'Probationary', status: 'On Hold',
    website: 'https://globaltextiles.net', taxId: '48-9012365', paymentTerms: 'Due on Receipt', currency: 'USD',
    primaryContact: { name: 'Chen Wei', title: 'Export Manager', email: 'cwei@globaltextiles.net', phone: '+86 21 5555 7890' },
    billingStreet: '88 Nanjing East Rd', billingCity: 'Shanghai', billingState: '', billingZip: '200001', billingCountry: 'China',
    products: [
      { sku: 'GT-SHEER-WHT', name: 'Sheer Voile Fabric (White)', unitCost: 1.80, leadTimeDays: 45, minOrderQty: 2000 },
    ],
    notes: 'On hold pending quality audit results from last shipment. Defect rate exceeded threshold.',
    tags: ['international', 'on-hold', 'quality-review'],
    rating: 2, totalOrders: 8, totalSpend: 54300, onTimeDeliveryRate: 72.0, defectRate: 5.8,
    createdAt: new Date(Date.now() - 10 * 30 * 86400000).toISOString(),
    lastOrderAt: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
  {
    id: 'SUPP-006', name: 'TrustLock Shipping Co.', category: 'Services', tier: 'Preferred', status: 'Active',
    website: 'https://trustlock.com', taxId: '67-1234098', paymentTerms: 'Net 15', currency: 'USD',
    primaryContact: { name: 'Alicia Grant', title: 'Logistics Coordinator', email: 'agrant@trustlock.com', phone: '(800) 555-0600' },
    billingStreet: '2001 Commerce Dr', billingCity: 'Memphis', billingState: 'TN', billingZip: '38118', billingCountry: 'USA',
    products: [
      { sku: 'TS-SHPG-STD', name: 'Standard LTL Freight', unitCost: 185.00, leadTimeDays: 3, minOrderQty: 1 },
      { sku: 'TS-SHPG-WG', name: 'White Glove Delivery', unitCost: 340.00, leadTimeDays: 5, minOrderQty: 1 },
    ],
    notes: 'Preferred logistics partner for all outbound freight. White glove tier for luxury accounts.',
    tags: ['logistics', 'freight', 'white-glove'],
    rating: 5, totalOrders: 210, totalSpend: 498000, onTimeDeliveryRate: 98.5, defectRate: 0.1,
    createdAt: new Date(Date.now() - 4 * 365 * 86400000).toISOString(),
    lastOrderAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
];

function loadSuppliers(): Supplier[] {
  try {
    const stored = localStorage.getItem('admin_suppliers');
    if (stored) {
      const parsed: Supplier[] = JSON.parse(stored);
      if (parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  return SEED_SUPPLIERS;
}

function saveSuppliers(suppliers: Supplier[]) {
  localStorage.setItem('admin_suppliers', JSON.stringify(suppliers));
}

function getTierColor(tier: SupplierTier) {
  switch (tier) {
    case 'Preferred': return 'bg-emerald-100 text-emerald-700';
    case 'Standard': return 'bg-slate-100 text-slate-600';
    case 'Probationary': return 'bg-orange-100 text-orange-700';
  }
}

function getStatusColor(status: SupplierStatus) {
  switch (status) {
    case 'Active': return 'bg-emerald-100 text-emerald-700';
    case 'Inactive': return 'bg-slate-100 text-slate-500';
    case 'On Hold': return 'bg-amber-100 text-amber-700';
    case 'Pending': return 'bg-sky-100 text-sky-700';
  }
}

function formatCurrency(n: number) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <div key={s} className={`w-3 h-3 flex items-center justify-center ${s <= rating ? 'text-amber-400' : 'text-slate-200'}`}>
          <i className="ri-star-fill text-xs"></i>
        </div>
      ))}
    </div>
  );
}

function PerformanceBar({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="w-20 bg-slate-100 rounded-full h-1.5">
      <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }}></div>
    </div>
  );
}

export default function AdminSuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(loadSuppliers);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<SupplierCategory | 'All'>('All');
  const [tierFilter, setTierFilter] = useState<SupplierTier | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<SupplierStatus | 'All'>('All');
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [emailSupplierId, setEmailSupplierId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkEmail, setShowBulkEmail] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const toggleSelect = (id: string) => setSelectedIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = useMemo(() => {
    return suppliers.filter((s) => {
      const q = search.toLowerCase();
      const matchSearch = q === '' || [s.name, s.category, s.primaryContact.name, s.primaryContact.email, s.taxId].some((f) => f.toLowerCase().includes(q));
      const matchCat = categoryFilter === 'All' || s.category === categoryFilter;
      const matchTier = tierFilter === 'All' || s.tier === tierFilter;
      const matchStatus = statusFilter === 'All' || s.status === statusFilter;
      return matchSearch && matchCat && matchTier && matchStatus;
    });
  }, [suppliers, search, categoryFilter, tierFilter, statusFilter]);

  const toggleSelectAll = () => setSelectedIds(selectedIds.size === filtered.length ? new Set() : new Set(filtered.map((s) => s.id)));
  const bulkRecipients: BulkRecipient[] = filtered.filter((s) => selectedIds.has(s.id)).map((s) => ({ id: s.id, name: s.name, email: s.primaryContact.email, entityType: 'supplier' as const }));

  const stats = {
    total: suppliers.length,
    active: suppliers.filter((s) => s.status === 'Active').length,
    preferred: suppliers.filter((s) => s.tier === 'Preferred').length,
    onHold: suppliers.filter((s) => s.status === 'On Hold').length,
    totalSpend: suppliers.reduce((sum, s) => sum + s.totalSpend, 0),
    avgRating: suppliers.length ? (suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length).toFixed(1) : '0',
  };

  const handleSave = (supplier: Supplier) => {
    const existing = suppliers.find((s) => s.id === supplier.id);
    let updated: Supplier[];
    if (existing) {
      updated = suppliers.map((s) => (s.id === supplier.id ? supplier : s));
      showToast(`${supplier.name} updated`);
    } else {
      updated = [supplier, ...suppliers];
      showToast(`${supplier.name} added`);
    }
    setSuppliers(updated);
    saveSuppliers(updated);
    setShowForm(false);
    setEditingSupplier(null);
  };

  const handleDelete = (id: string) => {
    const target = suppliers.find((s) => s.id === id);
    const updated = suppliers.filter((s) => s.id !== id);
    setSuppliers(updated);
    saveSuppliers(updated);
    setDeleteId(null);
    showToast(`${target?.name} deleted`, 'error');
  };

  const openEdit = (s: Supplier) => { setEditingSupplier(s); setShowForm(true); };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[70] flex items-center gap-3 px-5 py-3.5 rounded-xl text-white ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}>
          <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center">
            <i className={`${toast.type === 'success' ? 'ri-check-line' : 'ri-delete-bin-line'} text-sm`}></i>
          </div>
          <p className="text-sm font-semibold">{toast.msg}</p>
          <button onClick={() => setToast(null)} className="w-5 h-5 flex items-center justify-center text-white/70 hover:text-white cursor-pointer">
            <i className="ri-close-line text-sm"></i>
          </button>
        </div>
      )}

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDeleteId(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-7" onClick={(e) => e.stopPropagation()}>
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-delete-bin-line text-red-500 text-2xl"></i>
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center mb-1">Delete Supplier?</h3>
            <p className="text-sm text-slate-500 text-center mb-6">
              Removing <span className="font-semibold text-slate-900">{suppliers.find((s) => s.id === deleteId)?.name}</span> cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer whitespace-nowrap">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg cursor-pointer whitespace-nowrap">Delete</button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <SupplierFormModal
          supplier={editingSupplier}
          onClose={() => { setShowForm(false); setEditingSupplier(null); }}
          onSave={handleSave}
        />
      )}

      {emailSupplierId && (() => {
        const s = suppliers.find((sup) => sup.id === emailSupplierId);
        return s ? <SupplierEmailsModal supplier={s} onClose={() => setEmailSupplierId(null)} /> : null;
      })()}

      {/* Header */}
      {showBulkEmail && bulkRecipients.length > 0 && (
        <BulkEmailModal recipients={bulkRecipients} onClose={() => setShowBulkEmail(false)} onSent={() => { setShowBulkEmail(false); setSelectedIds(new Set()); showToast(`Emailed ${bulkRecipients.length} supplier${bulkRecipients.length !== 1 ? 's' : ''}`); }} />
      )}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Suppliers & Vendors</h1>
          <p className="text-sm text-slate-500 mt-1">Manage procurement partners and vendor catalog</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <button onClick={() => setShowBulkEmail(true)} className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg cursor-pointer whitespace-nowrap">
              <i className="ri-mail-send-line text-base"></i>
              Email {selectedIds.size} Selected
            </button>
          )}
          <button onClick={() => { setEditingSupplier(null); setShowForm(true); }} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg cursor-pointer whitespace-nowrap">
            <i className="ri-truck-line text-base"></i>
            Add Supplier
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-6 gap-4 mb-6">
        {[
          { label: 'Total Suppliers', value: stats.total, icon: 'ri-truck-line', color: 'text-slate-700' },
          { label: 'Active', value: stats.active, icon: 'ri-checkbox-circle-line', color: 'text-emerald-600' },
          { label: 'Preferred', value: stats.preferred, icon: 'ri-vip-crown-line', color: 'text-amber-600' },
          { label: 'On Hold', value: stats.onHold, icon: 'ri-pause-circle-line', color: 'text-orange-600' },
          { label: 'Total Spend', value: formatCurrency(stats.totalSpend), icon: 'ri-money-dollar-circle-line', color: 'text-violet-600' },
          { label: 'Avg Rating', value: `${stats.avgRating}/5`, icon: 'ri-star-line', color: 'text-indigo-600' },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-slate-100 p-4">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-5 h-5 flex items-center justify-center ${card.color}`}>
                <i className={`${card.icon} text-base`}></i>
              </div>
              <span className="text-xs text-slate-500 font-medium truncate">{card.label}</span>
            </div>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-100 mb-4 px-4 py-3 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-[220px]">
          <div className="w-4 h-4 flex items-center justify-center text-slate-400">
            <i className="ri-search-line text-sm"></i>
          </div>
          <input type="text" placeholder="Search suppliers..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 text-sm outline-none text-slate-700 placeholder-slate-400" />
          {search && <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-700 cursor-pointer"><i className="ri-close-line text-sm"></i></button>}
        </div>

        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as typeof categoryFilter)} className="text-xs font-semibold border border-slate-200 rounded-lg px-3 py-1.5 outline-none cursor-pointer text-slate-600">
          <option value="All">All Categories</option>
          {(['Manufacturer', 'Distributor', 'Wholesaler', 'Raw Materials', 'Services'] as const).map((c) => <option key={c}>{c}</option>)}
        </select>

        <div className="flex gap-1.5">
          {(['All', 'Preferred', 'Standard', 'Probationary'] as const).map((t) => (
            <button key={t} onClick={() => setTierFilter(t as typeof tierFilter)} className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors ${tierFilter === t ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{t}</button>
          ))}
        </div>

        <div className="flex gap-1.5">
          {(['All', 'Active', 'On Hold', 'Inactive', 'Pending'] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s as typeof statusFilter)} className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors ${statusFilter === s ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{s}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-4 py-3 w-10"><input type="checkbox" checked={filtered.length > 0 && selectedIds.size === filtered.length} onChange={toggleSelectAll} className="rounded cursor-pointer" /></th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Supplier</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category / Tier</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Performance</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Spend</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((s) => (
                <>
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors cursor-pointer group" onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}>
                    <td className="px-4 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={selectedIds.has(s.id)} onChange={() => toggleSelect(s.id)} className="rounded cursor-pointer" /></td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                          <span className="text-white text-xs font-bold">{s.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">{s.name}</p>
                          <p className="text-xs text-slate-400 font-mono">{s.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-slate-700">{s.primaryContact.name}</p>
                      <p className="text-xs text-slate-400">{s.primaryContact.email}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-xs font-semibold text-slate-600 mb-1">{s.category}</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${getTierColor(s.tier)}`}>{s.tier}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 w-20">On-time</span>
                          <PerformanceBar value={s.onTimeDeliveryRate} color="bg-emerald-400" />
                          <span className="text-xs font-semibold text-slate-700">{s.onTimeDeliveryRate}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 w-20">Defect</span>
                          <PerformanceBar value={s.defectRate} max={10} color="bg-rose-400" />
                          <span className="text-xs font-semibold text-slate-700">{s.defectRate}%</span>
                        </div>
                        <RatingStars rating={s.rating} />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-bold text-slate-800">{formatCurrency(s.totalSpend)}</p>
                      <p className="text-xs text-slate-400">{s.totalOrders} orders</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(s.status)}`}>{s.status}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setExpandedId(expandedId === s.id ? null : s.id)} className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer whitespace-nowrap">
                          <i className={`ri-arrow-${expandedId === s.id ? 'up' : 'down'}-s-line`}></i>
                          {expandedId === s.id ? 'Collapse' : 'Details'}
                        </button>
                        <span className="text-slate-200">|</span>
                        <button onClick={() => setEmailSupplierId(s.id)} className="flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-800 cursor-pointer whitespace-nowrap">
                          <i className="ri-mail-line"></i> Emails
                        </button>
                        <span className="text-slate-200">|</span>
                        <button onClick={() => openEdit(s)} className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer whitespace-nowrap">
                          <i className="ri-edit-line"></i> Edit
                        </button>
                        <span className="text-slate-200">|</span>
                        <button onClick={() => setDeleteId(s.id)} className="flex items-center gap-1 text-xs font-semibold text-red-400 hover:text-red-600 cursor-pointer whitespace-nowrap">
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedId === s.id && (
                    <tr key={`${s.id}-expanded`}>
                      <td colSpan={8} className="px-6 py-5 bg-slate-50 border-b border-slate-100">
                        <div className="grid grid-cols-3 gap-6">
                          {/* Company Info */}
                          <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Company Details</p>
                            <div className="space-y-2">
                              {s.website && (
                                <a href={s.website} target="_blank" rel="nofollow noreferrer" className="flex items-center gap-2 text-xs text-indigo-600 hover:underline">
                                  <i className="ri-global-line"></i> {s.website}
                                </a>
                              )}
                              {s.taxId && <p className="text-xs text-slate-600"><span className="font-semibold">Tax ID:</span> {s.taxId}</p>}
                              <p className="text-xs text-slate-600"><span className="font-semibold">Terms:</span> {s.paymentTerms}</p>
                              {s.billingStreet && (
                                <p className="text-xs text-slate-500">{s.billingStreet}, {s.billingCity}, {s.billingState} {s.billingZip}</p>
                              )}
                              {s.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {s.tags.map((tag) => <span key={tag} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs rounded-full font-medium">{tag}</span>)}
                                </div>
                              )}
                            </div>
                          </div>
                          {/* Contact */}
                          <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Primary Contact</p>
                            <div className="space-y-1.5">
                              <p className="text-sm font-semibold text-slate-800">{s.primaryContact.name}</p>
                              <p className="text-xs text-slate-500">{s.primaryContact.title}</p>
                              <a href={`mailto:${s.primaryContact.email}`} className="flex items-center gap-1.5 text-xs text-indigo-600 hover:underline">
                                <i className="ri-mail-line"></i> {s.primaryContact.email}
                              </a>
                              <p className="flex items-center gap-1.5 text-xs text-slate-600"><i className="ri-phone-line"></i> {s.primaryContact.phone}</p>
                            </div>
                          </div>
                          {/* Products */}
                          <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Product Catalog ({s.products.length})</p>
                            {s.products.length === 0 ? (
                              <p className="text-xs text-slate-400">No products listed</p>
                            ) : (
                              <div className="space-y-2">
                                {s.products.map((p) => (
                                  <div key={p.sku} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-slate-100">
                                    <div>
                                      <p className="text-xs font-semibold text-slate-700">{p.name}</p>
                                      <p className="text-xs text-slate-400 font-mono">{p.sku}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs font-bold text-slate-800">${p.unitCost.toFixed(2)}</p>
                                      <p className="text-xs text-slate-400">{p.leadTimeDays}d lead</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            {s.notes && <p className="text-xs text-slate-500 italic mt-3 border-t border-slate-100 pt-2">{s.notes}</p>}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <i className="ri-truck-line text-slate-400 text-2xl"></i>
                    </div>
                    <p className="text-sm font-semibold text-slate-600">No suppliers found</p>
                    <p className="text-xs text-slate-400 mt-1">Adjust your filters or add a new supplier</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-slate-50 bg-slate-50/60">
            <p className="text-xs text-slate-500">Showing <span className="font-semibold text-slate-700">{filtered.length}</span> of <span className="font-semibold text-slate-700">{suppliers.length}</span> suppliers</p>
          </div>
        )}
      </div>
    </div>
  );
}
