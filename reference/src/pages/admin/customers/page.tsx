import { useState, useMemo } from 'react';
import CustomerFormModal, { type Customer } from './components/CustomerFormModal';
import { logActivity } from '../../../utils/adminActivity';
import CustomerDetailDrawer from './components/CustomerDetailDrawer';
import CustomerFullView from './components/CustomerFullView';
import BulkEmailModal from '../shared/components/BulkEmailModal';

// ── Seed Data ──────────────────────────────────────────────────────────────
const SEED_CUSTOMERS: Customer[] = [
  { id: 'CUST-00001', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.johnson@example.com', phone: '(424) 555-0183', companyName: 'Johnson Interiors', companyId: 'COMP-001', type: 'Business', status: 'VIP', street: '2200 Beverly Glen Blvd', city: 'Los Angeles', state: 'CA', zip: '90077', notes: 'Prefers email contact. Bulk buyer — always orders 1,000+ units. Offer 5% discount on orders over $50K.', createdAt: new Date(Date.now() - 365 * 86400000 * 2).toISOString(), tags: ['bulk-buyer', 'vip', 'repeat'] },
  { id: 'CUST-00002', firstName: 'David', lastName: 'Nguyen', email: 'david.nguyen@example.com', phone: '(323) 555-0147', companyName: 'Nguyen Design Co.', companyId: 'COMP-007', type: 'Business', status: 'Active', street: '4501 Wilshire Blvd', city: 'Los Angeles', state: 'CA', zip: '90010', notes: 'Interior designer. Prefers custom sizes. Always pays on net-30.', createdAt: new Date(Date.now() - 400 * 86400000).toISOString(), tags: ['interior-designer', 'net-30'] },
  { id: 'CUST-00003', firstName: 'Marcus', lastName: 'Rivera', email: 'marcus.rivera@example.com', phone: '(310) 555-0192', companyName: 'Rivera Renovations', companyId: 'COMP-003', type: 'Contractor', status: 'Active', street: '8820 Sunset Blvd', city: 'West Hollywood', state: 'CA', zip: '90069', notes: 'General contractor. Orders seasonally — heavy demand in spring. Referred by Sarah Johnson.', createdAt: new Date(Date.now() - 280 * 86400000).toISOString(), tags: ['contractor', 'referral'] },
  { id: 'CUST-00004', firstName: 'Priya', lastName: 'Patel', email: 'priya.patel@example.com', phone: '(213) 555-0031', companyName: 'Patel Home Solutions', companyId: 'COMP-010', type: 'Business', status: 'Active', street: '650 S Grand Ave', city: 'Los Angeles', state: 'CA', zip: '90017', notes: '', createdAt: new Date(Date.now() - 180 * 86400000).toISOString(), tags: [] },
  { id: 'CUST-00005', firstName: 'Emily', lastName: 'Chen', email: 'emily.chen@example.com', phone: '(310) 555-0261', companyName: 'Chen Window Works', companyId: 'COMP-006', type: 'Contractor', status: 'Active', street: '1100 Glendon Ave', city: 'Los Angeles', state: 'CA', zip: '90024', notes: 'Specializes in commercial window installations. Interested in volume pricing.', createdAt: new Date(Date.now() - 320 * 86400000).toISOString(), tags: ['commercial', 'volume-pricing'] },
  { id: 'CUST-00006', firstName: 'James', lastName: 'MacAllister', email: 'james.mac@designhaus.com', phone: '(617) 555-0090', companyName: 'DesignHaus Studio', companyId: 'COMP-002', type: 'Wholesale', status: 'VIP', street: '900 Commonwealth Ave', city: 'Boston', state: 'MA', zip: '02215', notes: 'Wholesale account — fixed 12% discount on all orders. Key account manager: Holly.', createdAt: new Date(Date.now() - 730 * 86400000).toISOString(), tags: ['wholesale', 'key-account', 'vip'] },
  { id: 'CUST-00007', firstName: 'Angela', lastName: 'Torres', email: 'angela.torres@gmail.com', phone: '(512) 555-0074', companyName: '', companyId: '', type: 'Retail', status: 'Active', street: '411 W 7th St', city: 'Austin', state: 'TX', zip: '78701', notes: '', createdAt: new Date(Date.now() - 45 * 86400000).toISOString(), tags: ['new-customer'] },
  { id: 'CUST-00008', firstName: 'Robert', lastName: 'Kim', email: 'robert.kim@kimarch.com', phone: '(206) 555-0118', companyName: 'Kim Architecture', companyId: 'COMP-008', type: 'Business', status: 'Inactive', street: '1000 2nd Ave', city: 'Seattle', state: 'WA', zip: '98104', notes: 'Went quiet after last project. Follow up Q2.', createdAt: new Date(Date.now() - 500 * 86400000).toISOString(), tags: ['follow-up', 'architect'] },
  { id: 'CUST-00009', firstName: 'Linda', lastName: 'Nakamura', email: 'linda.n@luxspaces.net', phone: '(808) 555-0055', companyName: 'LuxSpaces Hawaii', companyId: 'COMP-005', type: 'Wholesale', status: 'Active', street: '1600 Kapiolani Blvd', city: 'Honolulu', state: 'HI', zip: '96814', notes: 'Manages 3 luxury resorts. Special packaging required for all orders.', createdAt: new Date(Date.now() - 610 * 86400000).toISOString(), tags: ['hospitality', 'wholesale', 'special-packaging'] },
  { id: 'CUST-00010', firstName: 'Carlos', lastName: 'Espinoza', email: 'carlos@buildright.co', phone: '(305) 555-0203', companyName: 'BuildRight Contracting', companyId: 'COMP-004', type: 'Contractor', status: 'VIP', street: '101 Brickell Ave', city: 'Miami', state: 'FL', zip: '33131', notes: 'Top contractor customer in Florida. Refer other contractors our way. Always early payer.', createdAt: new Date(Date.now() - 900 * 86400000).toISOString(), tags: ['referrer', 'vip', 'early-payer'] },
  { id: 'CUST-00011', firstName: 'Natalie', lastName: 'Brooks', email: 'natalie.brooks@outlook.com', phone: '(404) 555-0177', companyName: '', companyId: '', type: 'Retail', status: 'Active', street: '250 Piedmont Ave NE', city: 'Atlanta', state: 'GA', zip: '30308', notes: '', createdAt: new Date(Date.now() - 22 * 86400000).toISOString(), tags: [] },
  { id: 'CUST-00012', firstName: 'Derek', lastName: 'Okonkwo', email: 'derek@okonkwo-design.com', phone: '(212) 555-0039', companyName: 'Okonkwo Design Group', companyId: 'COMP-009', type: 'Business', status: 'Active', street: '350 5th Ave', city: 'New York', state: 'NY', zip: '10118', notes: 'High-end residential projects in Manhattan and Brooklyn. Requires white-glove delivery.', createdAt: new Date(Date.now() - 130 * 86400000).toISOString(), tags: ['high-end', 'white-glove', 'nyc'] },
];

function loadCustomers(): Customer[] {
  try {
    const stored = localStorage.getItem('admin_customers');
    if (stored) {
      const parsed: Customer[] = JSON.parse(stored);
      // Migrate: if stored data is missing companyId, re-seed with fresh data
      if (parsed.length > 0 && parsed[0].companyId === undefined) {
        localStorage.setItem('admin_customers', JSON.stringify(SEED_CUSTOMERS));
        return SEED_CUSTOMERS;
      }
      if (parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  return SEED_CUSTOMERS;
}

function saveCustomers(customers: Customer[]) {
  localStorage.setItem('admin_customers', JSON.stringify(customers));
}

// ── Sync company ↔ customer links ─────────────────────────────────────────
function syncCompanyLink(savedCustomer: Customer, prevCustomer: Customer | null) {
  try {
    const rawCompanies = localStorage.getItem('admin_companies');
    if (!rawCompanies) return;
    let companies: any[] = JSON.parse(rawCompanies);

    const newCompanyId = savedCustomer.companyId ?? '';
    const oldCompanyId = prevCustomer?.companyId ?? '';

    // Remove from old company if changed
    if (oldCompanyId && oldCompanyId !== newCompanyId) {
      companies = companies.map((c: any) => {
        if (c.id === oldCompanyId) {
          return { ...c, customerIds: (c.customerIds ?? []).filter((id: string) => id !== savedCustomer.id) };
        }
        return c;
      });
    }

    // Add to new company
    if (newCompanyId) {
      companies = companies.map((c: any) => {
        if (c.id === newCompanyId) {
          const ids: string[] = c.customerIds ?? [];
          if (!ids.includes(savedCustomer.id)) {
            return { ...c, customerIds: [...ids, savedCustomer.id] };
          }
        }
        return c;
      });
    }

    localStorage.setItem('admin_companies', JSON.stringify(companies));
  } catch { /* ignore */ }
}

// ── Helpers ────────────────────────────────────────────────────────────────
function getStatusColor(status: Customer['status']) {
  switch (status) {
    case 'Active': return 'bg-emerald-100 text-emerald-700';
    case 'Inactive': return 'bg-slate-100 text-slate-500';
    case 'VIP': return 'bg-amber-100 text-amber-700';
  }
}

function getTypeColor(type: Customer['type']) {
  switch (type) {
    case 'Retail': return 'bg-slate-100 text-slate-700';
    case 'Business': return 'bg-sky-100 text-sky-700';
    case 'Contractor': return 'bg-orange-100 text-orange-700';
    case 'Wholesale': return 'bg-violet-100 text-violet-700';
  }
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(loadCustomers);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<Customer['type'] | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<Customer['status'] | 'All'>('All');
  const [companyFilter, setCompanyFilter] = useState<string>('All');

  const companyOptions = useMemo(() => {
    try {
      const raw = localStorage.getItem('admin_companies');
      if (raw) {
        const comps: any[] = JSON.parse(raw);
        return comps.map((c: any) => ({ id: c.id, name: c.name }));
      }
    } catch { /* ignore */ }
    return [];
  }, []);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [fullViewCustomer, setFullViewCustomer] = useState<Customer | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkEmail, setShowBulkEmail] = useState(false);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      const q = search.toLowerCase();
      const matchSearch = q === '' || [c.firstName, c.lastName, c.email, c.companyName, c.phone].some((f) => f.toLowerCase().includes(q));
      const matchType = typeFilter === 'All' || c.type === typeFilter;
      const matchStatus = statusFilter === 'All' || c.status === statusFilter;
      const matchCompany = companyFilter === 'All' || c.companyId === companyFilter || (companyFilter === '__none__' && !c.companyId);
      return matchSearch && matchType && matchStatus && matchCompany;
    });
  }, [customers, search, typeFilter, statusFilter, companyFilter]);

  const stats = {
    total: customers.length,
    active: customers.filter((c) => c.status === 'Active').length,
    vip: customers.filter((c) => c.status === 'VIP').length,
    newThisMonth: customers.filter((c) => {
      const d = new Date(c.createdAt);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length,
    business: customers.filter((c) => c.type === 'Business').length,
    contractor: customers.filter((c) => c.type === 'Contractor').length,
    wholesale: customers.filter((c) => c.type === 'Wholesale').length,
  };

  const handleSave = (customer: Customer) => {
    const existing = customers.find((c) => c.id === customer.id);
    let updated: Customer[];
    if (existing) {
      updated = customers.map((c) => (c.id === customer.id ? customer : c));
      showToast(`${customer.firstName} ${customer.lastName} updated successfully`);
    } else {
      updated = [customer, ...customers];
      showToast(`${customer.firstName} ${customer.lastName} added successfully`);
    }
    setCustomers(updated);
    saveCustomers(updated);
    syncCompanyLink(customer, existing ?? null);
    setShowFormModal(false);
    setEditingCustomer(null);
    if (viewingCustomer?.id === customer.id) setViewingCustomer(customer);
    try {
      const admin = JSON.parse(localStorage.getItem('admin_user') ?? '{}');
      logActivity({
        adminId: admin.id ?? 'unknown',
        adminName: admin.name ?? 'Admin',
        adminRole: admin.role ?? 'admin',
        action: existing
          ? `Customer updated: "${customer.firstName} ${customer.lastName}"`
          : `Customer added: "${customer.firstName} ${customer.lastName}"`,
        category: 'customers' as any,
        detail: existing
          ? `Updated ${customer.type} customer — ${customer.email}`
          : `New ${customer.type} customer (${customer.status}) — ${customer.email}`,
      });
    } catch { /* ignore */ }
  };

  const handleDelete = (id: string) => {
    const target = customers.find((c) => c.id === id);
    const updated = customers.filter((c) => c.id !== id);
    setCustomers(updated);
    saveCustomers(updated);
    setDeleteConfirmId(null);
    setViewingCustomer(null);
    showToast(`${target?.firstName} ${target?.lastName} deleted`, 'error');
    try {
      const admin = JSON.parse(localStorage.getItem('admin_user') ?? '{}');
      logActivity({
        adminId: admin.id ?? 'unknown',
        adminName: admin.name ?? 'Admin',
        adminRole: admin.role ?? 'admin',
        action: `Customer deleted: "${target?.firstName} ${target?.lastName}"`,
        category: 'customers' as any,
        detail: `Removed ${target?.type ?? ''} customer ${id} — ${target?.email ?? ''}`,
      });
    } catch { /* ignore */ }
  };

  const handleExportCSV = () => {
    const rows = [
      ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Company', 'Type', 'Status', 'Street', 'City', 'State', 'ZIP', 'Tags', 'Notes', 'Created At'],
      ...filtered.map((c) => [c.id, c.firstName, c.lastName, c.email, c.phone, c.companyName, c.type, c.status, c.street, c.city, c.state, c.zip, c.tags.join('; '), c.notes, formatDate(c.createdAt)]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openAdd = () => { setEditingCustomer(null); setShowFormModal(true); };
  const openEdit = (c: Customer) => { setEditingCustomer(c); setShowFormModal(true); };
  const openFullView = (c: Customer) => { setFullViewCustomer(c); setViewingCustomer(null); };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[70] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-white ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}>
          <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center">
            <i className={`${toast.type === 'success' ? 'ri-check-line' : 'ri-delete-bin-line'} text-sm`}></i>
          </div>
          <p className="text-sm font-semibold">{toast.msg}</p>
          <button onClick={() => setToast(null)} className="w-5 h-5 flex items-center justify-center text-white/70 hover:text-white">
            <i className="ri-close-line text-sm"></i>
          </button>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirmId(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-7" onClick={(e) => e.stopPropagation()}>
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-delete-bin-line text-red-500 text-2xl"></i>
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center mb-1">Delete Customer?</h3>
            <p className="text-sm text-slate-500 text-center mb-6">
              This will permanently remove <span className="font-semibold text-slate-900">{customers.find((c) => c.id === deleteConfirmId)?.firstName} {customers.find((c) => c.id === deleteConfirmId)?.lastName}</span> and all their data.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer whitespace-nowrap">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirmId)} className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg cursor-pointer whitespace-nowrap">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showFormModal && (
        <CustomerFormModal
          customer={editingCustomer}
          onClose={() => { setShowFormModal(false); setEditingCustomer(null); }}
          onSave={handleSave}
        />
      )}

      {/* Detail Drawer */}
      {viewingCustomer && !fullViewCustomer && (
        <CustomerDetailDrawer
          customer={viewingCustomer}
          onClose={() => setViewingCustomer(null)}
          onEdit={() => { setViewingCustomer(null); openEdit(viewingCustomer); }}
          onDelete={() => { setViewingCustomer(null); setDeleteConfirmId(viewingCustomer.id); }}
          onFullView={() => openFullView(viewingCustomer)}
        />
      )}

      {/* Full View */}
      {fullViewCustomer && (
        <CustomerFullView
          customer={fullViewCustomer}
          onClose={() => setFullViewCustomer(null)}
          onEdit={() => { setFullViewCustomer(null); openEdit(fullViewCustomer); }}
          onDelete={() => { setFullViewCustomer(null); setDeleteConfirmId(fullViewCustomer.id); }}
        />
      )}

      {/* Bulk Email Modal */}
      {showBulkEmail && (
        <BulkEmailModal
          recipients={filtered.filter((c) => selectedIds.has(c.id)).map((c) => ({ id: c.id, name: `${c.firstName} ${c.lastName}`, email: c.email, entityType: 'customer' as const }))}
          onClose={() => setShowBulkEmail(false)}
          onSent={() => { setShowBulkEmail(false); setSelectedIds(new Set()); showToast(`Emails sent to ${selectedIds.size} customers`); }}
        />
      )}

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your customer database</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <button onClick={() => setShowBulkEmail(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg cursor-pointer whitespace-nowrap transition-colors">
              <i className="ri-mail-send-line text-base"></i>
              Email {selectedIds.size} Selected
            </button>
          )}
          {selectedIds.size > 0 && (
            <button onClick={() => setSelectedIds(new Set())}
              className="flex items-center gap-2 px-3 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-600 text-sm font-semibold rounded-lg cursor-pointer whitespace-nowrap transition-colors">
              <i className="ri-close-line"></i> Clear
            </button>
          )}
          <button onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg cursor-pointer whitespace-nowrap">
            <i className="ri-download-2-line text-base"></i> Export CSV
          </button>
          <button onClick={openAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold rounded-lg cursor-pointer whitespace-nowrap">
            <i className="ri-user-add-line text-base"></i> Add Customer
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-7 gap-4 mb-6">
        {[
          { label: 'Total Customers', value: stats.total, icon: 'ri-group-line', color: 'text-slate-700' },
          { label: 'Active', value: stats.active, icon: 'ri-checkbox-circle-line', color: 'text-emerald-600' },
          { label: 'VIP', value: stats.vip, icon: 'ri-vip-crown-line', color: 'text-amber-600' },
          { label: 'New This Month', value: stats.newThisMonth, icon: 'ri-user-add-line', color: 'text-violet-600' },
          { label: 'Business', value: stats.business, icon: 'ri-building-2-line', color: 'text-sky-600' },
          { label: 'Contractors', value: stats.contractor, icon: 'ri-hammer-line', color: 'text-orange-600' },
          { label: 'Wholesale', value: stats.wholesale, icon: 'ri-store-3-line', color: 'text-teal-600' },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
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
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm mb-4 px-4 py-3 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-[220px]">
          <div className="w-4 h-4 flex items-center justify-center text-slate-400">
            <i className="ri-search-line text-sm"></i>
          </div>
          <input
            type="text"
            placeholder="Search by name, email, company, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm outline-none text-slate-700 placeholder-slate-400"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-700 cursor-pointer">
              <i className="ri-close-line text-sm"></i>
            </button>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          {(['All', 'Retail', 'Business', 'Contractor', 'Wholesale'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t as typeof typeFilter)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                typeFilter === t ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t}
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold ${typeFilter === t ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                {t === 'All' ? customers.length : customers.filter((c) => c.type === t).length}
              </span>
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          {(['All', 'Active', 'VIP', 'Inactive'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s as typeof statusFilter)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                statusFilter === s ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s === 'VIP' ? '⭐ VIP' : s}
            </button>
          ))}
        </div>

        {/* Company filter */}
        {companyOptions.length > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <div className="w-4 h-4 flex items-center justify-center text-slate-400 shrink-0">
              <i className="ri-building-2-line text-sm"></i>
            </div>
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className={`text-xs font-semibold border rounded-lg px-3 py-1.5 outline-none cursor-pointer transition-colors ${
                companyFilter !== 'All'
                  ? 'bg-teal-50 border-teal-300 text-teal-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <option value="All">All Companies</option>
              <option value="__none__">No Company</option>
              {companyOptions.map((co) => (
                <option key={co.id} value={co.id}>{co.name}</option>
              ))}
            </select>
            {companyFilter !== 'All' && (
              <button
                onClick={() => setCompanyFilter('All')}
                className="w-5 h-5 flex items-center justify-center rounded-full bg-teal-100 text-teal-600 hover:bg-teal-200 cursor-pointer transition-colors"
              >
                <i className="ri-close-line text-xs"></i>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" className="cursor-pointer accent-slate-800"
                    checked={filtered.length > 0 && filtered.every((c) => selectedIds.has(c.id))}
                    onChange={(e) => setSelectedIds(e.target.checked ? new Set(filtered.map((c) => c.id)) : new Set())} />
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tags</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Added</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((customer) => (
                <tr
                  key={customer.id}
                  className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  onClick={() => setViewingCustomer(customer)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-slate-900 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-white text-xs font-bold">
                          {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {customer.firstName} {customer.lastName}
                        </p>
                        <p className="text-xs text-slate-400 font-mono">{customer.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-slate-700">{customer.email}</p>
                    {customer.phone && <p className="text-xs text-slate-400 mt-0.5">{customer.phone}</p>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {customer.companyName ? (
                      <div className="flex items-center gap-1.5">
                        {customer.companyId && (
                          <div className="w-4 h-4 flex items-center justify-center text-teal-500 shrink-0">
                            <i className="ri-links-line text-sm"></i>
                          </div>
                        )}
                        <span className="text-sm text-slate-600">{customer.companyName}</span>
                      </div>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${getTypeColor(customer.type)}`}>
                      {customer.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(customer.status)}`}>
                      {customer.status === 'VIP' && <i className="ri-vip-crown-line text-xs"></i>}
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-[180px]">
                      {customer.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full font-medium whitespace-nowrap">
                          {tag}
                        </span>
                      ))}
                      {customer.tags.length > 3 && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-400 text-xs rounded-full font-medium">
                          +{customer.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-500">{formatDate(customer.createdAt)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openFullView(customer)}
                        className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-800 cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-layout-masonry-line"></i> Full View
                      </button>
                      <span className="text-slate-200">|</span>
                      <a
                        href={`/admin/customers/${customer.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 whitespace-nowrap"
                        title="Open in full page"
                      >
                        <i className="ri-external-link-line"></i> Open
                      </a>
                      <span className="text-slate-200">|</span>
                      <button
                        onClick={() => openEdit(customer)}
                        className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-edit-line"></i> Edit
                      </button>
                      <span className="text-slate-200">|</span>
                      <button
                        onClick={() => setDeleteConfirmId(customer.id)}
                        className="flex items-center gap-1 text-xs font-semibold text-red-400 hover:text-red-600 cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-delete-bin-line"></i> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center">
                        <i className="ri-user-search-line text-slate-400 text-2xl"></i>
                      </div>
                      <p className="text-sm font-semibold text-slate-600">No customers found</p>
                      <p className="text-xs text-slate-400">Try adjusting your search or filters</p>
                      <button onClick={openAdd} className="mt-1 flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold rounded-lg cursor-pointer whitespace-nowrap">
                        <i className="ri-user-add-line"></i> Add First Customer
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        {filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-slate-50 bg-slate-50/60 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Showing <span className="font-semibold text-slate-700">{filtered.length}</span> of{' '}
              <span className="font-semibold text-slate-700">{customers.length}</span> customers
            </p>
            <p className="text-xs text-slate-400">Click any row to view full profile</p>
          </div>
        )}
      </div>
    </div>
  );
}
