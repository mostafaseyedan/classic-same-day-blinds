import { useState, useEffect } from 'react';
import type { Company, CompanyType, CompanyTier, CompanyStatus, CreditTerms } from '../types';

interface Props {
  company?: Company | null;
  onClose: () => void;
  onSave: (company: Company) => void;
}

const TYPES: CompanyType[] = ['Business', 'Wholesale', 'Contractor', 'Retail'];
const TIERS: CompanyTier[] = ['Bronze', 'Silver', 'Gold', 'Diamond'];
const STATUSES: CompanyStatus[] = ['Active', 'Inactive', 'Prospect'];
const CREDIT_TERMS: CreditTerms[] = ['Net-15', 'Net-30', 'Net-45', 'Net-60', 'Prepay', 'COD'];
const INDUSTRIES = ['Interior Design', 'Architecture & Design', 'General Contracting', 'Commercial Construction', 'Hospitality', 'Window Installation', 'Home Improvement', 'Architecture', 'Luxury Residential', 'Real Estate', 'Retail', 'Other'];
const ACCOUNT_MANAGERS = ['Holly Price', 'Tom Ward', 'Maria Santos', 'Kevin Lee'];

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

type FormState = Omit<Company, 'id' | 'createdAt'>;

const DEFAULT_FORM: FormState = {
  name: '', industry: '', type: 'Business', tier: 'Bronze', status: 'Active',
  primaryContact: '', email: '', phone: '', website: '',
  street: '', city: '', state: '', zip: '', country: 'US',
  creditTerms: 'Net-30', creditLimit: 50000, outstandingBalance: 0,
  discount: 0, taxExempt: false, taxExemptId: '',
  accountManager: 'Tom Ward', notes: '', tags: [], customerIds: [], annualRevenue: 0,
};

export default function CompanyFormModal({ company, onClose, onSave }: Props) {
  const isEdit = !!company;
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeSection, setActiveSection] = useState<'basic' | 'classification' | 'financial' | 'address' | 'notes'>('basic');

  useEffect(() => {
    if (company) {
      const { id, createdAt, ...rest } = company;
      setForm(rest);
    }
  }, [company]);

  const set = <K extends keyof FormState>(field: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Required';
    if (!form.primaryContact.trim()) errs.primaryContact = 'Required';
    if (!form.email.trim()) errs.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave({
      ...form,
      id: company?.id ?? `COMP-${Date.now()}`,
      createdAt: company?.createdAt ?? new Date().toISOString(),
    });
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) set('tags', [...form.tags, t]);
    setTagInput('');
  };

  const sections = [
    { id: 'basic', label: 'Basic Info', icon: 'ri-building-2-line' },
    { id: 'classification', label: 'Classification', icon: 'ri-price-tag-3-line' },
    { id: 'financial', label: 'Financial', icon: 'ri-bank-line' },
    { id: 'address', label: 'Address', icon: 'ri-map-pin-2-line' },
    { id: 'notes', label: 'Notes & Tags', icon: 'ri-sticky-note-line' },
  ] as const;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[94vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shrink-0">
              <i className="ri-building-2-line text-white text-lg"></i>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{isEdit ? 'Edit Company' : 'Add New Company'}</h2>
              <p className="text-xs text-slate-500">{isEdit ? `Editing ${company!.name}` : 'Create a new company account'}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 cursor-pointer">
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        {/* Section nav */}
        <div className="flex border-b border-slate-100 px-7 gap-1 shrink-0 overflow-x-auto">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`flex items-center gap-1.5 px-3 py-3 text-xs font-semibold border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
                activeSection === s.id
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <i className={`${s.icon} text-sm`}></i>
              {s.label}
              {Object.keys(errors).some((k) => {
                const fieldMap: Record<string, string[]> = {
                  basic: ['name', 'primaryContact', 'email'],
                };
                return (fieldMap[s.id] ?? []).includes(k);
              }) && <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-7 py-6">
          {activeSection === 'basic' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Company Name <span className="text-red-500">*</span></label>
                  <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Johnson Interiors LLC"
                    className={`w-full text-sm border rounded-lg px-3 py-2.5 outline-none text-slate-700 placeholder-slate-400 ${errors.name ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-slate-400'}`} />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Primary Contact <span className="text-red-500">*</span></label>
                  <input type="text" value={form.primaryContact} onChange={(e) => set('primaryContact', e.target.value)} placeholder="Sarah Johnson"
                    className={`w-full text-sm border rounded-lg px-3 py-2.5 outline-none text-slate-700 placeholder-slate-400 ${errors.primaryContact ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-slate-400'}`} />
                  {errors.primaryContact && <p className="text-xs text-red-500 mt-1">{errors.primaryContact}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email <span className="text-red-500">*</span></label>
                  <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="contact@company.com"
                    className={`w-full text-sm border rounded-lg px-3 py-2.5 outline-none text-slate-700 placeholder-slate-400 ${errors.email ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-slate-400'}`} />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phone</label>
                  <input type="text" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="(424) 555-0183"
                    className="w-full text-sm border border-slate-200 focus:border-slate-400 rounded-lg px-3 py-2.5 outline-none text-slate-700 placeholder-slate-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Website</label>
                  <input type="text" value={form.website} onChange={(e) => set('website', e.target.value)} placeholder="www.company.com"
                    className="w-full text-sm border border-slate-200 focus:border-slate-400 rounded-lg px-3 py-2.5 outline-none text-slate-700 placeholder-slate-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Industry</label>
                  <select value={form.industry} onChange={(e) => set('industry', e.target.value)}
                    className="w-full text-sm border border-slate-200 focus:border-slate-400 rounded-lg px-3 py-2.5 outline-none text-slate-700 bg-white">
                    <option value="">Select industry...</option>
                    {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Account Manager</label>
                  <select value={form.accountManager} onChange={(e) => set('accountManager', e.target.value)}
                    className="w-full text-sm border border-slate-200 focus:border-slate-400 rounded-lg px-3 py-2.5 outline-none text-slate-700 bg-white">
                    {ACCOUNT_MANAGERS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'classification' && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">Company Type</label>
                <div className="flex gap-2 flex-wrap">
                  {TYPES.map((t) => (
                    <button key={t} type="button" onClick={() => set('type', t)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold cursor-pointer border-2 transition-all ${form.type === t ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-500 hover:border-slate-400'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">Tier</label>
                <div className="flex gap-2 flex-wrap">
                  {TIERS.map((t) => (
                    <button key={t} type="button" onClick={() => set('tier', t)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold cursor-pointer border-2 transition-all ${form.tier === t ? `${tierColors[t]} border-current` : 'border-slate-200 text-slate-500 hover:border-slate-400'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">Status</label>
                <div className="flex gap-2 flex-wrap">
                  {STATUSES.map((s) => (
                    <button key={s} type="button" onClick={() => set('status', s)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold cursor-pointer border-2 transition-all ${form.status === s ? `${statusColors[s]} border-current` : 'border-slate-200 text-slate-500 hover:border-slate-400'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'financial' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Credit Terms</label>
                  <select value={form.creditTerms} onChange={(e) => set('creditTerms', e.target.value as CreditTerms)}
                    className="w-full text-sm border border-slate-200 focus:border-slate-400 rounded-lg px-3 py-2.5 outline-none text-slate-700 bg-white">
                    {CREDIT_TERMS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Discount (%)</label>
                  <input type="number" min="0" max="50" value={form.discount} onChange={(e) => set('discount', Number(e.target.value))}
                    className="w-full text-sm border border-slate-200 focus:border-slate-400 rounded-lg px-3 py-2.5 outline-none text-slate-700" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Credit Limit ($)</label>
                  <input type="number" min="0" value={form.creditLimit} onChange={(e) => set('creditLimit', Number(e.target.value))}
                    className="w-full text-sm border border-slate-200 focus:border-slate-400 rounded-lg px-3 py-2.5 outline-none text-slate-700" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Annual Revenue ($)</label>
                  <input type="number" min="0" value={form.annualRevenue} onChange={(e) => set('annualRevenue', Number(e.target.value))}
                    className="w-full text-sm border border-slate-200 focus:border-slate-400 rounded-lg px-3 py-2.5 outline-none text-slate-700" />
                </div>
                <div className="col-span-2">
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                    <button type="button" onClick={() => set('taxExempt', !form.taxExempt)}
                      className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${form.taxExempt ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.taxExempt ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Tax Exempt</p>
                      <p className="text-xs text-slate-500">This company qualifies for tax-exempt purchasing</p>
                    </div>
                  </div>
                  {form.taxExempt && (
                    <input type="text" value={form.taxExemptId} onChange={(e) => set('taxExemptId', e.target.value)} placeholder="Tax Exempt ID (e.g. CA-EXEMPT-12345)"
                      className="mt-3 w-full text-sm border border-slate-200 focus:border-slate-400 rounded-lg px-3 py-2.5 outline-none text-slate-700 placeholder-slate-400" />
                  )}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'address' && (
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
          )}

          {activeSection === 'notes' && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Internal Notes</label>
                <textarea value={form.notes} onChange={(e) => set('notes', e.target.value.slice(0, 500))} rows={4} placeholder="Account notes, special requirements, relationship context..."
                  className="w-full text-sm border border-slate-200 focus:border-slate-400 rounded-lg px-3 py-2.5 outline-none text-slate-700 placeholder-slate-400 resize-none" />
                <p className="text-xs text-slate-400 text-right mt-1">{form.notes.length}/500</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">Tags</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {form.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">
                      {tag}
                      <button type="button" onClick={() => set('tags', form.tags.filter((t) => t !== tag))} className="w-3 h-3 flex items-center justify-center text-slate-400 hover:text-red-500 cursor-pointer">
                        <i className="ri-close-line text-xs"></i>
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                    placeholder="Add tag (e.g. wholesale, key-account)..."
                    className="flex-1 text-sm border border-slate-200 focus:border-slate-400 rounded-lg px-3 py-2 outline-none text-slate-700 placeholder-slate-400" />
                  <button type="button" onClick={addTag} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer whitespace-nowrap">Add</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-7 py-4 border-t border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            {sections.map((s, i) => (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                className={`w-2 h-2 rounded-full transition-colors cursor-pointer ${activeSection === s.id ? 'bg-slate-900' : 'bg-slate-200 hover:bg-slate-400'}`}
                title={s.label} />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer whitespace-nowrap">Cancel</button>
            <button onClick={handleSubmit} className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold rounded-lg cursor-pointer whitespace-nowrap">
              <i className={isEdit ? 'ri-save-line' : 'ri-building-2-line'}></i>
              {isEdit ? 'Save Changes' : 'Create Company'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
