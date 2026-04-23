import { useState } from 'react';
import type { Company, CompanyTier, CompanyStatus } from '../types';
import type { Customer } from '../../../customers/components/CustomerFormModal';
import CompanyOverviewTab from './tabs/CompanyOverviewTab';
import CompanyCustomersTab from './tabs/CompanyCustomersTab';
import CompanyOrdersTab from './tabs/CompanyOrdersTab';
import CompanyShipmentsTab from './tabs/CompanyShipmentsTab';
import CompanyContractsTab from './tabs/CompanyContractsTab';
import CompanyActivityTab from './tabs/CompanyActivityTab';
import EmailsTab from '../../shared/components/EmailsTab';
import ComposeEmailModal from '../../shared/components/ComposeEmailModal';
import CompanyLogCallModal from './CompanyLogCallModal';
import CompanyAddNoteModal from './CompanyAddNoteModal';
import { loadEmailsForEntity } from '../../shared/utils/emailStorage';

interface Props {
  company: Company;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const TABS = [
  { id: 'overview', label: 'Overview', icon: 'ri-dashboard-line' },
  { id: 'customers', label: 'Contacts', icon: 'ri-group-line' },
  { id: 'orders', label: 'Orders', icon: 'ri-file-list-3-line' },
  { id: 'emails', label: 'Emails', icon: 'ri-mail-line' },
  { id: 'shipments', label: 'Shipments', icon: 'ri-truck-line' },
  { id: 'contracts', label: 'Contracts', icon: 'ri-file-text-line' },
  { id: 'activity', label: 'Activity', icon: 'ri-time-line' },
];

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

function getAllCustomers(): Customer[] {
  try {
    const stored = localStorage.getItem('admin_customers');
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return [];
}

function getCompanyOrders(customers: Customer[]): any[] {
  try {
    const emails = new Set(customers.map((c) => c.email));
    const stored: any[] = JSON.parse(localStorage.getItem('orders') ?? '[]');
    const seeds: any[] = [
      { id: 'ORD-10001', date: new Date(Date.now() - 86400000).toISOString(), status: 'Delivered', total: 454272, customer: { email: 'sarah.johnson@example.com' }, items: [{ name: 'Faux Wood Blinds', quantity: 3200, size: '36" x 60"', price: 141.96 }] },
      { id: 'ORD-10002', date: new Date(Date.now() - 259200000).toISOString(), status: 'Delivered', total: 397656, customer: { email: 'david.nguyen@example.com' }, items: [{ name: 'Cellular Shades', quantity: 2800, size: '48" x 64"', price: 141.99 }] },
      { id: 'ORD-10003', date: new Date(Date.now() - 7 * 86400000).toISOString(), status: 'Fulfilled & Shipped', total: 120400, customer: { email: 'sarah.johnson@example.com' }, items: [{ name: 'Roller Shades', quantity: 800, size: '30" x 48"', price: 150.5 }] },
      { id: 'ORD-10004', date: new Date(Date.now() - 14 * 86400000).toISOString(), status: 'Working on Order', total: 87200, customer: { email: 'sarah.johnson@example.com' }, items: [{ name: 'Roman Shades', quantity: 400, size: '36" x 72"', price: 218.0 }] },
      { id: 'ORD-10005', date: new Date(Date.now() - 30 * 86400000).toISOString(), status: 'Delivered', total: 209000, customer: { email: 'carlos@buildright.co' }, items: [{ name: 'Wood Shutters', quantity: 1000, size: '24" x 60"', price: 209.0 }] },
      { id: 'ORD-10006', date: new Date(Date.now() - 45 * 86400000).toISOString(), status: 'Delivered', total: 320000, customer: { email: 'james.mac@designhaus.com' }, items: [{ name: 'Faux Wood Blinds', quantity: 2000, size: '48" x 72"', price: 160.0 }] },
    ];
    const all = [...stored, ...seeds.filter((s) => !stored.find((o) => o.id === s.id))];
    return all
      .filter((o) => emails.has(o.customer?.email ?? ''))
      .map((o) => ({
        id: o.id,
        date: o.date,
        status: o.status ?? 'Processing',
        total: o.total ?? 0,
        items: (o.items ?? []).map((i: any) => ({ name: i.name, quantity: i.quantity, size: i.size ?? '', price: i.price })),
        city: o.customer?.city ?? '',
      }));
  } catch {
    return [];
  }
}

export default function CompanyFullView({ company, onClose, onEdit, onDelete }: Props) {
  const [activeTab, setActiveTab] = useState('overview');
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [showComposeFromOverview, setShowComposeFromOverview] = useState(false);
  const [showLogCall, setShowLogCall] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);

  const allCustomers = getAllCustomers();
  const linkedCustomers = allCustomers.filter(
    (c) => (c as any).companyId === company.id || company.customerIds.includes(c.id) || c.companyName === company.name
  );
  const orders = getCompanyOrders(linkedCustomers);

  // Load emails to get badge count (seeds on first call)
  const emailList = loadEmailsForEntity('company', company.id, company.name, company.email);
  const emailUnread = emailList.filter((e) => e.direction === 'inbound' && !e.readAt).length;
  const emailTotal = emailList.length;

  const handleOpenCustomer = (c: Customer) => {
    setViewingCustomer(c);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-hidden" onClick={onClose}>
      <div className="bg-slate-50 w-full h-full flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>

        {/* Compose from Overview quick action */}
        {showComposeFromOverview && (
          <ComposeEmailModal
            entityType="company"
            entityId={company.id}
            entityName={company.name}
            entityEmail={company.email}
            onClose={() => setShowComposeFromOverview(false)}
            onSent={() => setShowComposeFromOverview(false)}
          />
        )}
        {showLogCall && (
          <CompanyLogCallModal
            company={company}
            onClose={() => setShowLogCall(false)}
            onLogged={() => { setShowLogCall(false); setActiveTab('activity'); }}
          />
        )}
        {showAddNote && (
          <CompanyAddNoteModal
            company={company}
            onClose={() => setShowAddNote(false)}
            onAdded={() => { setShowAddNote(false); setActiveTab('activity'); }}
          />
        )}
        {/* Top bar */}
        <div className="bg-white border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-5 px-8 py-4">
            <button onClick={onClose}
              className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 cursor-pointer transition-colors whitespace-nowrap">
              <i className="ri-arrow-left-line text-lg"></i>
              Back to Companies
            </button>

            <div className="w-px h-8 bg-slate-100"></div>

            {/* Company identity */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shrink-0">
                <i className="ri-building-2-line text-white text-lg"></i>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-lg font-bold text-slate-900 whitespace-nowrap">{company.name}</h1>
                  {company.industry && <span className="text-sm text-slate-400 truncate">{company.industry}</span>}
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusColors[company.status]}`}>{company.status}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${tierColors[company.tier]}`}>{company.tier}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{company.type}</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">{company.id} &bull; {company.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button onClick={onEdit}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg cursor-pointer whitespace-nowrap transition-colors">
                <i className="ri-edit-line"></i> Edit
              </button>
              <button onClick={onDelete}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 hover:bg-red-50 text-red-500 text-sm font-semibold rounded-lg cursor-pointer whitespace-nowrap transition-colors">
                <i className="ri-delete-bin-line"></i> Delete
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 px-8 overflow-x-auto">
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 cursor-pointer whitespace-nowrap transition-colors ${
                    active ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200'
                  }`}>
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className={`${tab.icon} text-sm`}></i>
                  </div>
                  {tab.label}
                  {tab.id === 'customers' && linkedCustomers.length > 0 && (
                    <span className={`px-1.5 py-0.5 text-xs font-bold rounded-full ${active ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>{linkedCustomers.length}</span>
                  )}
                  {tab.id === 'orders' && orders.length > 0 && (
                    <span className={`px-1.5 py-0.5 text-xs font-bold rounded-full ${active ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>{orders.length}</span>
                  )}
                  {tab.id === 'emails' && emailTotal > 0 && (
                    <span className={`px-1.5 py-0.5 text-xs font-bold rounded-full ${active ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>{emailTotal}</span>
                  )}
                  {tab.id === 'emails' && emailUnread > 0 && (
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-8 py-6">
            {activeTab === 'overview' && <CompanyOverviewTab company={company} customers={linkedCustomers} orders={orders} onComposeEmail={() => setShowComposeFromOverview(true)} onLogCall={() => setShowLogCall(true)} onAddNote={() => setShowAddNote(true)} />}
            {activeTab === 'customers' && <CompanyCustomersTab company={company} customers={linkedCustomers} onOpenCustomer={handleOpenCustomer} />}
            {activeTab === 'orders' && <CompanyOrdersTab company={company} orders={orders} />}
            {activeTab === 'emails' && (
              <EmailsTab
                entityType="company"
                entityId={company.id}
                entityName={company.name}
                entityEmail={company.email}
              />
            )}
            {activeTab === 'shipments' && <CompanyShipmentsTab company={company} orders={orders} />}
            {activeTab === 'contracts' && <CompanyContractsTab company={company} orders={orders} />}
            {activeTab === 'activity' && <CompanyActivityTab company={company} orders={orders} />}
          </div>
        </div>
      </div>
    </div>
  );
}
