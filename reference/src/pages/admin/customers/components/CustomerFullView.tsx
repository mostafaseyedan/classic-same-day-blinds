import { useState, useCallback, useMemo } from 'react';
import type { Customer } from './CustomerFormModal';
import CustOverviewTab from './tabs/CustOverviewTab';
import CustOrdersTab from './tabs/CustOrdersTab';
import CustShipmentsTab from './tabs/CustShipmentsTab';
import CustPromotionsTab from './tabs/CustPromotionsTab';
import CustLocationsTab from './tabs/CustLocationsTab';
import CustActivityTab from './tabs/CustActivityTab';
import EmailsTab from '../../shared/components/EmailsTab';
import { loadEmailsForEntity } from '../../shared/utils/emailStorage';

interface Props {
  customer: Customer;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

interface Order {
  id: string;
  date: string;
  status: string;
  total: number;
  items: { name: string; quantity: number; size: string; price: number }[];
}

function getCustomerOrders(email: string): Order[] {
  try {
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
      .filter((o) => (o.customer?.email ?? '') === email)
      .map((o) => ({
        id: o.id,
        date: o.date,
        status: o.status === 'placed' || o.status === 'Processing' ? 'Working on Order' : (o.status ?? 'Working on Order'),
        total: o.total ?? 0,
        items: (o.items ?? []).map((i: any) => ({ name: i.name, quantity: i.quantity, size: i.size ?? '', price: i.price })),
      }));
  } catch {
    return [];
  }
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

const TABS = [
  { id: 'overview', label: 'Overview', icon: 'ri-dashboard-line' },
  { id: 'orders', label: 'Orders', icon: 'ri-file-list-3-line' },
  { id: 'emails', label: 'Emails', icon: 'ri-mail-line' },
  { id: 'shipments', label: 'Shipments', icon: 'ri-truck-line' },
  { id: 'promotions', label: 'Promotions', icon: 'ri-coupon-3-line' },
  { id: 'locations', label: 'Locations', icon: 'ri-map-pin-2-line' },
  { id: 'activity', label: 'Activity', icon: 'ri-time-line' },
];

export default function CustomerFullView({ customer, onClose, onEdit, onDelete }: Props) {
  const [activeTab, setActiveTab] = useState('overview');
  const [activityRefreshKey, setActivityRefreshKey] = useState(0);
  const orders = getCustomerOrders(customer.email);

  const handleActivityAdded = useCallback(() => {
    setActivityRefreshKey((k) => k + 1);
  }, []);

  const emailList = useMemo(
    () => loadEmailsForEntity('customer', customer.id, `${customer.firstName} ${customer.lastName}`, customer.email),
    [customer.id, customer.firstName, customer.lastName, customer.email]
  );
  const emailTotal = emailList.length;
  const emailUnread = emailList.filter((e) => e.direction === 'inbound' && !e.readAt).length;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-hidden" onClick={onClose}>
      <div
        className="bg-slate-50 w-full h-full flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="bg-white border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-5 px-8 py-4">
            {/* Back button */}
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 cursor-pointer transition-colors whitespace-nowrap"
            >
              <i className="ri-arrow-left-line text-lg"></i>
              Back to Customers
            </button>

            <div className="w-px h-8 bg-slate-100"></div>

            {/* Customer identity */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-base">{customer.firstName.charAt(0)}{customer.lastName.charAt(0)}</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-lg font-bold text-slate-900 whitespace-nowrap">{customer.firstName} {customer.lastName}</h1>
                  {customer.companyName && <span className="text-sm text-slate-400 truncate">{customer.companyName}</span>}
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusColor(customer.status)}`}>
                    {customer.status === 'VIP' && <i className="ri-vip-crown-line mr-1 text-xs"></i>}
                    {customer.status}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getTypeColor(customer.type)}`}>{customer.type}</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">{customer.id} &bull; {customer.email}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onEdit}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg cursor-pointer whitespace-nowrap transition-colors"
              >
                <i className="ri-edit-line text-base"></i> Edit
              </button>
              <button
                onClick={onDelete}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 hover:bg-red-50 text-red-500 text-sm font-semibold rounded-lg cursor-pointer whitespace-nowrap transition-colors"
              >
                <i className="ri-delete-bin-line text-base"></i> Delete
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 px-8 overflow-x-auto scrollbar-hide">
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 cursor-pointer whitespace-nowrap transition-colors ${
                    active
                      ? 'border-slate-900 text-slate-900'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200'
                  }`}
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className={`${tab.icon} text-sm`}></i>
                  </div>
                  {tab.label}
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
            {activeTab === 'overview' && <CustOverviewTab customer={customer} orders={orders} onEdit={onEdit} onActivityAdded={handleActivityAdded} />}
            {activeTab === 'orders' && <CustOrdersTab orders={orders} />}
            {activeTab === 'emails' && (
              <EmailsTab
                entityType="customer"
                entityId={customer.id}
                entityName={`${customer.firstName} ${customer.lastName}`}
                entityEmail={customer.email}
              />
            )}
            {activeTab === 'shipments' && <CustShipmentsTab customer={customer} orders={orders} />}
            {activeTab === 'promotions' && <CustPromotionsTab customer={customer} orders={orders} />}
            {activeTab === 'locations' && <CustLocationsTab customer={customer} orders={orders} />}
            {activeTab === 'activity' && <CustActivityTab customer={customer} orders={orders} refreshKey={activityRefreshKey} />}
          </div>
        </div>
      </div>
    </div>
  );
}
