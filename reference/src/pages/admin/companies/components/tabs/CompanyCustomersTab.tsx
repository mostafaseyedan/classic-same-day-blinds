import { useState } from 'react';
import type { Company } from '../../types';
import type { Customer } from '../../../../customers/components/CustomerFormModal';

interface Props {
  company: Company;
  customers: Customer[];
  onOpenCustomer: (c: Customer) => void;
}

function getStatusColor(status: Customer['status']) {
  if (status === 'VIP') return 'bg-amber-100 text-amber-700';
  if (status === 'Active') return 'bg-emerald-100 text-emerald-700';
  return 'bg-slate-100 text-slate-500';
}

function getTypeColor(type: Customer['type']) {
  if (type === 'Business') return 'bg-sky-100 text-sky-700';
  if (type === 'Contractor') return 'bg-orange-100 text-orange-700';
  if (type === 'Wholesale') return 'bg-violet-100 text-violet-700';
  return 'bg-slate-100 text-slate-700';
}

export default function CompanyCustomersTab({ company, customers, onOpenCustomer }: Props) {
  const [search, setSearch] = useState('');

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return !q || [c.firstName, c.lastName, c.email, c.phone].some((f) => f.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">Contacts at {company.name}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{customers.length} contacts linked to this company</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 min-w-[240px]">
            <div className="w-4 h-4 flex items-center justify-center text-slate-400"><i className="ri-search-line text-sm"></i></div>
            <input type="text" placeholder="Search contacts..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="flex-1 text-sm outline-none text-slate-700 placeholder-slate-400" />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <i className="ri-group-line text-slate-400 text-2xl"></i>
          </div>
          <p className="text-sm font-semibold text-slate-600">No contacts linked</p>
          <p className="text-xs text-slate-400 mt-1">Customers linked to this company will appear here</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact Info</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tags</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-slate-900 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-white text-xs font-bold">{customer.firstName.charAt(0)}{customer.lastName.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{customer.firstName} {customer.lastName}</p>
                        <p className="text-xs text-slate-400 font-mono">{customer.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-700">{customer.email}</p>
                    {customer.phone && <p className="text-xs text-slate-400 mt-0.5">{customer.phone}</p>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${getTypeColor(customer.type)}`}>{customer.type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(customer.status)}`}>
                      {customer.status === 'VIP' && <i className="ri-vip-crown-line text-xs"></i>}
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {customer.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full font-medium whitespace-nowrap">{tag}</span>
                      ))}
                      {customer.tags.length > 2 && <span className="px-2 py-0.5 bg-slate-100 text-slate-400 text-xs rounded-full font-medium">+{customer.tags.length - 2}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => onOpenCustomer(customer)}
                      className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-800 cursor-pointer whitespace-nowrap">
                      <i className="ri-layout-masonry-line"></i> Full View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary footer */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5">
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Contacts', value: customers.length, icon: 'ri-group-line', color: 'text-slate-600' },
            { label: 'Active', value: customers.filter((c) => c.status === 'Active').length, icon: 'ri-checkbox-circle-line', color: 'text-emerald-600' },
            { label: 'VIP', value: customers.filter((c) => c.status === 'VIP').length, icon: 'ri-vip-crown-line', color: 'text-amber-600' },
            { label: 'Inactive', value: customers.filter((c) => c.status === 'Inactive').length, icon: 'ri-pause-circle-line', color: 'text-slate-400' },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <div className={`w-8 h-8 flex items-center justify-center shrink-0 ${s.color}`}>
                <i className={`${s.icon} text-lg`}></i>
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
