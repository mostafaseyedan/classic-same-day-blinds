import { useState, useMemo } from 'react';
import type { Company, CompanyType, CompanyTier, CompanyStatus } from './types';
import { SEED_COMPANIES } from './types';
import CompanyFormModal from './components/CompanyFormModal';
import CompanyFullView from './components/CompanyFullView';

function loadCompanies(): Company[] {
  try {
    const stored = localStorage.getItem('admin_companies');
    if (stored) {
      const parsed: Company[] = JSON.parse(stored);
      if (parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  return SEED_COMPANIES;
}

function saveCompanies(companies: Company[]) {
  localStorage.setItem('admin_companies', JSON.stringify(companies));
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const tierColors: Record<CompanyTier, string> = {
  Bronze: 'bg-orange-100 text-orange-700',
  Silver: 'bg-slate-200 text-slate-700',
  Gold: 'bg-amber-100 text-amber-700',
  Diamond: 'bg-violet-100 text-violet-700',
};

const statusColors: Record<CompanyStatus, string> = {
  Active: 'bg-emerald-100 text-emerald-700',
  Inactive: 'bg-slate-100 text-slate-500',
  Prospect: 'bg-sky-100 text-sky-700',
};

const typeColors: Record<CompanyType, string> = {
  Business: 'bg-sky-100 text-sky-700',
  Wholesale: 'bg-violet-100 text-violet-700',
  Contractor: 'bg-orange-100 text-orange-700',
  Retail: 'bg-slate-100 text-slate-700',
};

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>(loadCompanies);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<CompanyType | 'All'>('All');
  const [tierFilter, setTierFilter] = useState<CompanyTier | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<CompanyStatus | 'All'>('All');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [fullViewCompany, setFullViewCompany] = useState<Company | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = useMemo(() => companies.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = !q || [c.name, c.primaryContact, c.email, c.city, c.industry].some((f) => f.toLowerCase().includes(q));
    const matchType = typeFilter === 'All' || c.type === typeFilter;
    const matchTier = tierFilter === 'All' || c.tier === tierFilter;
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchSearch && matchType && matchTier && matchStatus;
  }), [companies, search, typeFilter, tierFilter, statusFilter]);

  const stats = {
    total: companies.length,
    active: companies.filter((c) => c.status === 'Active').length,
    prospects: companies.filter((c) => c.status === 'Prospect').length,
    diamond: companies.filter((c) => c.tier === 'Diamond').length,
    gold: companies.filter((c) => c.tier === 'Gold').length,
    totalRevenue: companies.reduce((s, c) => s + c.annualRevenue, 0),
    taxExempt: companies.filter((c) => c.taxExempt).length,
  };

  const handleSave = (company: Company) => {
    const existing = companies.find((c) => c.id === company.id);
    let updated: Company[];
    if (existing) {
      updated = companies.map((c) => c.id === company.id ? company : c);
      showToast(`${company.name} updated successfully`);
    } else {
      updated = [company, ...companies];
      showToast(`${company.name} added successfully`);
    }
    setCompanies(updated);
    saveCompanies(updated);
    setShowFormModal(false);
    setEditingCompany(null);
    if (fullViewCompany?.id === company.id) setFullViewCompany(company);
  };

  const handleDelete = (id: string) => {
    const target = companies.find((c) => c.id === id);
    const updated = companies.filter((c) => c.id !== id);
    setCompanies(updated);
    saveCompanies(updated);
    setDeleteConfirmId(null);
    setFullViewCompany(null);
    showToast(`${target?.name} deleted`, 'error');
  };

  const handleExportCSV = () => {
    const rows = [
      ['ID', 'Name', 'Industry', 'Type', 'Tier', 'Status', 'Primary Contact', 'Email', 'Phone', 'City', 'State', 'Credit Terms', 'Credit Limit', 'Discount', 'Annual Revenue'],
      ...filtered.map((c) => [c.id, c.name, c.industry, c.type, c.tier, c.status, c.primaryContact, c.email, c.phone, c.city, c.state, c.creditTerms, c.creditLimit, `${c.discount}%`, c.annualRevenue]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `companies_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const openAdd = () => { setEditingCompany(null); setShowFormModal(true); };
  const openEdit = (c: Company) => { setEditingCompany(c); setShowFormModal(true); };
  const openFullView = (c: Company) => setFullViewCompany(c);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[70] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-white ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}>
          <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center">
            <i className={`${toast.type === 'success' ? 'ri-check-line' : 'ri-delete-bin-line'} text-sm`}></i>
          </div>
          <p className="text-sm font-semibold">{toast.msg}</p>
          <button onClick={() => setToast(null)} className="ml-1 w-5 h-5 flex items-center justify-center text-white/70 hover:text-white">
            <i className="ri-close-line text-sm"></i>
          </button>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirmId(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-7" onClick={(e) => e.stopPropagation()}>
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-delete-bin-line text-red-500 text-2xl"></i>
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center mb-1">Delete Company?</h3>
            <p className="text-sm text-slate-500 text-center mb-6">
              This will permanently remove <span className="font-semibold text-slate-900">{companies.find((c) => c.id === deleteConfirmId)?.name}</span>.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer whitespace-nowrap">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirmId)} className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg cursor-pointer whitespace-nowrap">Delete</button>
            </div>
          </div>
        </div>
      )}

      {showFormModal && (
        <CompanyFormModal company={editingCompany} onClose={() => { setShowFormModal(false); setEditingCompany(null); }} onSave={handleSave} />
      )}

      {fullViewCompany && (
        <CompanyFullView
          company={fullViewCompany}
          onClose={() => setFullViewCompany(null)}
          onEdit={() => { setFullViewCompany(null); openEdit(fullViewCompany); }}
          onDelete={() => { setFullViewCompany(null); setDeleteConfirmId(fullViewCompany.id); }}
        />
      )}

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Companies</h1>
          <p className="text-sm text-slate-500 mt-1">Manage company accounts and SCM relationships</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg cursor-pointer whitespace-nowrap">
            <i className="ri-download-2-line text-base"></i> Export CSV
          </button>
          <button onClick={openAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold rounded-lg cursor-pointer whitespace-nowrap">
            <i className="ri-building-2-line text-base"></i> Add Company
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-7 gap-4 mb-6">
        {[
          { label: 'Total Companies', value: stats.total, icon: 'ri-building-2-line', color: 'text-slate-700' },
          { label: 'Active', value: stats.active, icon: 'ri-checkbox-circle-line', color: 'text-emerald-600' },
          { label: 'Prospects', value: stats.prospects, icon: 'ri-user-search-line', color: 'text-sky-600' },
          { label: 'Diamond Tier', value: stats.diamond, icon: 'ri-gem-line', color: 'text-violet-600' },
          { label: 'Gold Tier', value: stats.gold, icon: 'ri-vip-crown-line', color: 'text-amber-600' },
          { label: 'Annual Revenue', value: `$${(stats.totalRevenue / 1000000).toFixed(1)}M`, icon: 'ri-money-dollar-circle-line', color: 'text-emerald-600' },
          { label: 'Tax Exempt', value: stats.taxExempt, icon: 'ri-shield-check-line', color: 'text-teal-600' },
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
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <div className="w-4 h-4 flex items-center justify-center text-slate-400">
            <i className="ri-search-line text-sm"></i>
          </div>
          <input type="text" placeholder="Search by name, contact, email, city..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm outline-none text-slate-700 placeholder-slate-400" />
          {search && (
            <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-700 cursor-pointer">
              <i className="ri-close-line text-sm"></i>
            </button>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          {(['All', 'Business', 'Wholesale', 'Contractor', 'Retail'] as const).map((t) => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${typeFilter === t ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {t}
            </button>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap">
          {(['All', 'Bronze', 'Silver', 'Gold', 'Diamond'] as const).map((t) => (
            <button key={t} onClick={() => setTierFilter(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${tierFilter === t ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {t}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          {(['All', 'Active', 'Prospect', 'Inactive'] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${statusFilter === s ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tier</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Credit Terms</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Discount</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Annual Rev.</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Added</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((company) => (
                <tr key={company.id} className="hover:bg-slate-50 transition-colors cursor-pointer group" onClick={() => openFullView(company)}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                        <i className="ri-building-2-line text-slate-600 text-base"></i>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">{company.name}</p>
                        <p className="text-xs text-slate-400 truncate max-w-[140px]">{company.industry || company.city}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-slate-700">{company.primaryContact}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{company.email}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${typeColors[company.type]}`}>{company.type}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${tierColors[company.tier]}`}>{company.tier}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${statusColors[company.status]}`}>{company.status}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-slate-700">{company.creditTerms}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-emerald-600">{company.discount}%</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <p className="text-sm font-bold text-slate-900">${company.annualRevenue.toLocaleString()}</p>
                    {company.taxExempt && <p className="text-[11px] text-emerald-600 font-semibold">Tax Exempt</p>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-500">{formatDate(company.createdAt)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => openFullView(company)}
                        className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-800 cursor-pointer whitespace-nowrap">
                        <i className="ri-layout-masonry-line"></i> View
                      </button>
                      <span className="text-slate-200">|</span>
                      <a
                        href={`/admin/companies/${company.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 whitespace-nowrap"
                        title="Open in full page"
                      >
                        <i className="ri-external-link-line"></i> Open
                      </a>
                      <span className="text-slate-200">|</span>
                      <button onClick={() => openEdit(company)}
                        className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer whitespace-nowrap">
                        <i className="ri-edit-line"></i> Edit
                      </button>
                      <span className="text-slate-200">|</span>
                      <button onClick={() => setDeleteConfirmId(company.id)}
                        className="flex items-center gap-1 text-xs font-semibold text-red-400 hover:text-red-600 cursor-pointer whitespace-nowrap">
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center">
                        <i className="ri-building-2-line text-slate-400 text-2xl"></i>
                      </div>
                      <p className="text-sm font-semibold text-slate-600">No companies found</p>
                      <p className="text-xs text-slate-400">Try adjusting your search or filters</p>
                      <button onClick={openAdd} className="mt-1 flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold rounded-lg cursor-pointer whitespace-nowrap">
                        <i className="ri-building-2-line"></i> Add Company
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-slate-50 bg-slate-50/60 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Showing <span className="font-semibold text-slate-700">{filtered.length}</span> of <span className="font-semibold text-slate-700">{companies.length}</span> companies
            </p>
            <p className="text-xs text-slate-400">Click any row to open full view</p>
          </div>
        )}
      </div>
    </div>
  );
}
