import { useState } from 'react';
import type { Order } from '../types';
import OrderOverviewTab from './tabs/OrderOverviewTab';
import OrderShipmentTab from './tabs/OrderShipmentTab';
import OrderItemsTab from './tabs/OrderItemsTab';
import OrderCommunicationsTab from './tabs/OrderCommunicationsTab';

interface Props {
  order: Order;
  onClose: () => void;
  onStatusChange: (orderId: string, status: string) => void;
  onSaveTracking: (orderId: string, tracking: string) => void;
  onPrintInvoice: (order: Order) => void;
  onCreateLabel: (order: Order) => void;
}

const TABS = [
  { id: 'overview', label: 'Overview', icon: 'ri-dashboard-line' },
  { id: 'shipment', label: 'Shipment Tracking', icon: 'ri-truck-line' },
  { id: 'items', label: 'Items & Invoice', icon: 'ri-file-list-3-line' },
  { id: 'communications', label: 'Communications', icon: 'ri-mail-line' },
];

function getStatusColor(status: string) {
  switch (status) {
    case 'Delivered': return 'bg-emerald-100 text-emerald-700';
    case 'Fulfilled & Shipped': return 'bg-teal-100 text-teal-700';
    case 'Ready for Pickup': return 'bg-orange-100 text-orange-700';
    case 'Working on Order': return 'bg-sky-100 text-sky-700';
    case 'Pending': return 'bg-amber-100 text-amber-700';
    case 'Cancelled': return 'bg-red-100 text-red-700';
    case 'Refunded': return 'bg-rose-100 text-rose-700';
    default: return 'bg-slate-100 text-slate-600';
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'Delivered': return 'ri-checkbox-circle-line';
    case 'Fulfilled & Shipped': return 'ri-truck-line';
    case 'Ready for Pickup': return 'ri-store-2-line';
    case 'Working on Order': return 'ri-tools-line';
    case 'Pending': return 'ri-time-line';
    case 'Cancelled': return 'ri-close-circle-line';
    case 'Refunded': return 'ri-arrow-go-back-line';
    default: return 'ri-question-line';
  }
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

function getCustomerName(order: Order) {
  return `${order.customer?.firstName ?? ''} ${order.customer?.lastName ?? ''}`.trim() || '—';
}

export default function OrderFullView({ order, onClose, onStatusChange, onSaveTracking, onPrintInvoice, onCreateLabel }: Props) {
  const [activeTab, setActiveTab] = useState('overview');
  const [currentOrder, setCurrentOrder] = useState<Order>(order);
  const [statusSaved, setStatusSaved] = useState(false);

  const handleStatusChange = (status: string) => {
    const updated = { ...currentOrder, status };
    setCurrentOrder(updated);
    onStatusChange(currentOrder.id, status);
    setStatusSaved(true);
    setTimeout(() => setStatusSaved(false), 2500);
  };

  const handleSaveTracking = (tracking: string) => {
    const updated = { ...currentOrder, trackingNumber: tracking };
    setCurrentOrder(updated);
    onSaveTracking(currentOrder.id, tracking);
  };

  const totalUnits = currentOrder.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="fixed inset-0 bg-slate-50 z-[100] flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-5 px-8 py-4">
          {/* Back */}
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 cursor-pointer transition-colors whitespace-nowrap"
          >
            <i className="ri-arrow-left-line text-lg"></i>
            Back to Orders
          </button>

          <div className="w-px h-8 bg-slate-100"></div>

          {/* Order Identity */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-11 h-11 bg-slate-900 rounded-xl flex items-center justify-center shrink-0">
              <i className="ri-file-list-3-line text-white text-base"></i>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-lg font-bold text-slate-900 font-mono whitespace-nowrap">{currentOrder.id}</h1>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(currentOrder.status)}`}>
                  <i className={`${getStatusIcon(currentOrder.status)} text-xs`}></i>
                  {currentOrder.status}
                </span>
                {(currentOrder as any).isReorder && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                    <i className="ri-refresh-line text-xs"></i> Reorder
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {getCustomerName(currentOrder)}
                {currentOrder.customer?.companyName && ` — ${currentOrder.customer.companyName}`}
                <span className="mx-1.5 text-slate-200">•</span>
                {new Date(currentOrder.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                <span className="mx-1.5 text-slate-200">•</span>
                {totalUnits.toLocaleString()} units
                <span className="mx-1.5 text-slate-200">•</span>
                {formatCurrency(currentOrder.total)}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onCreateLabel(currentOrder)}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl cursor-pointer whitespace-nowrap"
            >
              <i className="ri-price-tag-3-line text-base"></i>
              Create Label
            </button>
            <button
              onClick={() => onPrintInvoice(currentOrder)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl cursor-pointer whitespace-nowrap"
            >
              <i className="ri-printer-line text-base"></i>
              Print Invoice
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-8 overflow-x-auto">
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 cursor-pointer whitespace-nowrap transition-colors ${
                  active ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200'
                }`}
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className={`${tab.icon} text-sm`}></i>
                </div>
                {tab.label}
                {tab.id === 'shipment' && currentOrder.trackingNumber && (
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${active ? 'bg-slate-900 text-white' : 'bg-teal-100 text-teal-700'}`}>Live</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-8 py-6">
          {activeTab === 'overview' && (
            <OrderOverviewTab order={currentOrder} onStatusChange={handleStatusChange} statusSaved={statusSaved} />
          )}
          {activeTab === 'shipment' && (
            <OrderShipmentTab order={currentOrder} onSaveTracking={handleSaveTracking} />
          )}
          {activeTab === 'items' && (
            <OrderItemsTab order={currentOrder} onPrintInvoice={() => onPrintInvoice(currentOrder)} />
          )}
          {activeTab === 'communications' && (
            <OrderCommunicationsTab order={currentOrder} />
          )}
        </div>
      </div>
    </div>
  );
}
