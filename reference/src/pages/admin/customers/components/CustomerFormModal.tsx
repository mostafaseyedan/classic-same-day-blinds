import { useState, useEffect, useMemo } from 'react';

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string;
  companyId: string;
  type: 'Retail' | 'Business' | 'Contractor' | 'Wholesale';
  status: 'Active' | 'Inactive' | 'VIP';
  street: string;
  city: string;
  state: string;
  zip: string;
  notes: string;
  createdAt: string;
  tags: string[];
}

interface CustomerFormModalProps {
  customer?: Customer | null;
  onClose: () => void;
  onSave: (customer: Customer) => void;
}

interface CompanyOption {
  id: string;
  name: string;
  type: string;
  tier: string;
}

function loadCompanyOptions(): CompanyOption[] {
  try {
    const stored = localStorage.getItem('admin_companies');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((c: any) => ({ id: c.id, name: c.name, type: c.type, tier: c.tier }));
    }
  } catch { /* ignore */ }
  return [];
}

const TYPES: Customer['type'][] = ['Retail', 'Business', 'Contractor', 'Wholesale'];
const STATUSES: Customer['status'][] = ['Active', 'Inactive', 'VIP'];

const tierColors: Record<string, string> = {
  Bronze: 'text-orange-700 bg-orange-100',
  Silver: 'text-slate-700 bg-slate-200',
  Gold: 'text-amber-700 bg-amber-100',
  Diamond: 'text-violet-700 bg-violet-100',
};

export default function CustomerFormModal({ customer, onClose, onSave }: CustomerFormModalProps) {
  const isEdit = !!customer;
  const companies = useMemo(() => loadCompanyOptions(), []);
  const [companySearch, setCompanySearch] = useState('');
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);

  type FormState = Omit<Customer, 'id' | 'createdAt'>;

  const [form, setForm] = useState<FormState>({
    firstName: '', lastName: '', email: '', phone: '',
    companyName: '', companyId: '',
    type: 'Retail', status: 'Active',
    street: '', city: '', state: '', zip: '',
    notes: '', tags: [],
  });

  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (customer) {
      setForm({
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        companyName: customer.companyName,
        companyId: customer.companyId ?? '',
        type: customer.type,
        status: customer.status,
        street: customer.street,
        city: customer.city,
        state: customer.state,
        zip: customer.zip,
        notes: customer.notes,
        tags: [...customer.tags],
      });
      const linked = loadCompanyOptions().find((c) => c.id === (customer.companyId ?? ''));
      setCompanySearch(linked?.name ?? customer.companyName ?? '');
    }
  }, [customer]);

  const set = <K extends keyof FormState>(field: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const selectCompany = (opt: CompanyOption) => {
    setForm((prev) => ({ ...prev, companyId: opt.id, companyName: opt.name }));
    setCompanySearch(opt.name);
    setShowCompanyDropdown(false);
  };

  const clearCompany = () => {
    setForm((prev) => ({ ...prev, companyId: '', companyName: '' }));
    setCompanySearch('');
  };

  const filteredCompanies = companies.filter((c) =>
    !companySearch || c.name.toLowerCase().includes(companySearch.toLowerCase())
  );

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = 'Required';
    if (!form.lastName.trim()) errs.lastName = 'Required';
    if (!form.email.trim()) errs.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave({
      id: customer?.id ?? `CUST-${Date.now()}`,
      createdAt: customer?.createdAt ?? new Date().toISOString(),
      ...form,
    });
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) set('tags', [...form.tags, t]);
    setTagInput('');
  };

  const removeTag = (tag: string) =>
    set('tags', form.tags.filter((t) => t !== tag));

  const typeColors: Record<Customer['type'], string> = {
    Retail: 'bg-slate-100 text-slate-700',
    Business: 'bg-sky-100 text-sky-700',
    Contractor: 'bg-orange-100 text-orange-700',
    Wholesale: 'bg-violet-100 text-violet-700',
  };

  const statusColors: Record<Customer['status'], string> = {
    Active: 'bg-emerald-100 text-emerald-700',
    Inactive: 'bg-slate-100 text-slate-500',
    VIP: 'bg-amber-100 text-amber-700',
  };

  const selectedCompany = companies.find((c) => c.id === form.companyId);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
              <i className="ri-user-line text-white text-lg"></i>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{isEdit ? 'Edit Customer' : 'Add New Customer'}</h2>
              <p className="text-xs text-slate-500">{isEdit ? `Editing ${customer!.firstName} ${customer!.lastName}` : 'Fill in the details below'}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 cursor-pointer">
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-7 py-6 space-y-6">
          {/* Basic Info */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Basic Info</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">First Name <span className="text-red-500">*</span></label>
                <input type="text" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} placeholder="Sarah"
                  className={`w-full text-sm border rounded-lg px-3 py-2.5 outline-none text-slate-700 placeholder-slate-400 ${errors.firstName ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-slate-400'}`} />
                {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Last Name <span className="text-red-500">*</span></label>
                <input type="text" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} placeholder="Johnson"
                  className={`w-full text-sm border rounded-lg px-3 py-2.5 outline-none text-slate-700 placeholder-slate-400 ${errors.lastName ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-slate-400'}`} />
                {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Address <span className="text-red-500">*</span></label>
                <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="sarah@example.com"
                  className={`w-full text-sm border rounded-lg px-3 py-2.5 outline-none text-slate-700 placeholder-slate-400 ${errors.email ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-slate-400'}`} />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phone</label>
                <input type="text" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="(817) 555-0100"
                  className="w-full text-sm border border-slate-200 focus:border-slate-400 rounded-lg px-3 py-2.5 outline-none text-slate-700 placeholder-slate-400" />
              </div>

              {/* Company selector — full width */}
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Linked Company
                  <span className="ml-1 text-slate-400 font-normal">(optional — links this customer to a company account)</span>
                </label>

                {selectedCompany ? (
                  /* Selected state */
                  <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center shrink-0">
                      <i className="ri-building-2-line text-white text-sm"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{selectedCompany.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs text-slate-500">{selectedCompany.type}</span>
                        <span className="text-slate-300">·</span>
                        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${tierColors[selectedCompany.tier] ?? 'bg-slate-100 text-slate-600'}`}>{selectedCompany.tier}</span>
                      </div>
                    </div>
                    <button type="button" onClick={clearCompany}
                      className="text-slate-400 hover:text-red-500 cursor-pointer transition-colors">
                      <i className="ri-close-circle-line text-lg"></i>
                    </button>
                  </div>
                ) : (
                  /* Search / select */
                  <div className="relative">
                    <div className="flex items-center gap-2 border border-slate-200 focus-within:border-slate-400 rounded-lg px-3 py-2.5">
                      <i className="ri-building-2-line text-slate-400 text-sm shrink-0"></i>
                      <input
                        type="text"
                        value={companySearch}
                        onChange={(e) => { setCompanySearch(e.target.value); setShowCompanyDropdown(true); }}
                        onFocus={() => setShowCompanyDropdown(true)}
                        placeholder="Search companies..."
                        className="flex-1 text-sm outline-none text-slate-700 placeholder-slate-400"
                      />
                      {companySearch && (
                        <button type="button" onClick={() => { setCompanySearch(''); setShowCompanyDropdown(false); }}
                          className="text-slate-400 hover:text-slate-700 cursor-pointer">
                          <i className="ri-close-line text-sm"></i>
                        </button>
                      )}
                    </div>
                    {showCompanyDropdown && (
                      <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                        {filteredCompanies.length === 0 ? (
                          <div className="px-4 py-3 text-sm text-slate-400 text-center">No companies found</div>
                        ) : (
                          filteredCompanies.map((opt) => (
                            <button key={opt.id} type="button" onClick={() => selectCompany(opt)}
                              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors cursor-pointer text-left">
                              <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                                <i className="ri-building-2-line text-slate-600 text-sm"></i>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate">{opt.name}</p>
                                <p className="text-xs text-slate-400">{opt.type}</p>
                              </div>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${tierColors[opt.tier] ?? 'bg-slate-100 text-slate-600'}`}>{opt.tier}</span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Classification */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Classification</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">Customer Type</label>
                <div className="flex flex-wrap gap-2">
                  {TYPES.map((t) => (
                    <button key={t} type="button" onClick={() => set('type', t)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all border-2 ${form.type === t ? `${typeColors[t]} border-current` : 'border-transparent bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">Status</label>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map((s) => (
                    <button key={s} type="button" onClick={() => set('status', s)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all border-2 ${form.status === s ? `${statusColors[s]} border-current` : 'border-transparent bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                      {s === 'VIP' ? '⭐ VIP' : s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Address</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Street Address</label>
                <input type="text" value={form.street} onChange={(e) => set('street', e.target.value)} placeholder="2200 Beverly Glen Blvd"
                  className="w-full text-sm border border-slate-200 focus:border-slate-400 rounded-lg px-3 py-2.5 outline-none text-slate-700 placeholder-slate-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">City</label>
                <input type="text" value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="Los Angeles"
                  className="w-full text-sm border border-slate-200 focus:border-slate-400 rounded-lg px-3 py-2.5 outline-none text-slate-700 placeholder-slate-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">State</label>
                  <input type="text" value={form.state} onChange={(e) => set('state', e.target.value)} placeholder="CA"
                    className="w-full text-sm border border-slate-200 focus:border-slate-400 rounded-lg px-3 py-2.5 outline-none text-slate-700 placeholder-slate-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">ZIP</label>
                  <input type="text" value={form.zip} onChange={(e) => set('zip', e.target.value)} placeholder="90077"
                    className="w-full text-sm border border-slate-200 focus:border-slate-400 rounded-lg px-3 py-2.5 outline-none text-slate-700 placeholder-slate-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Tags</p>
            <div className="flex gap-2 mb-2 flex-wrap">
              {form.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="w-3 h-3 flex items-center justify-center text-slate-400 hover:text-red-500 cursor-pointer">
                    <i className="ri-close-line text-xs"></i>
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                placeholder="Add tag (e.g. repeat-buyer, referral)..."
                className="flex-1 text-sm border border-slate-200 focus:border-slate-400 rounded-lg px-3 py-2 outline-none text-slate-700 placeholder-slate-400" />
              <button type="button" onClick={addTag} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer whitespace-nowrap">Add</button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Internal Notes</p>
            <textarea value={form.notes} onChange={(e) => set('notes', e.target.value.slice(0, 500) as any)} rows={3}
              placeholder="Any notes about this customer — preferred contact method, special pricing, etc."
              className="w-full text-sm border border-slate-200 focus:border-slate-400 rounded-lg px-3 py-2.5 outline-none text-slate-700 placeholder-slate-400 resize-none" />
            <p className="text-xs text-slate-400 text-right mt-1">{form.notes.length}/500</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-7 py-4 border-t border-slate-100 shrink-0">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer whitespace-nowrap">Cancel</button>
          <button onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold rounded-lg cursor-pointer whitespace-nowrap">
            <i className={isEdit ? 'ri-save-line' : 'ri-user-add-line'}></i>
            {isEdit ? 'Save Changes' : 'Add Customer'}
          </button>
        </div>
      </div>
    </div>
  );
}
