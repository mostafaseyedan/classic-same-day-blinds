import { useState, useMemo } from 'react';
import type { PurchaseOrder, POStatus, POPriority } from './types';
import PurchaseOrderFormModal from './components/PurchaseOrderFormModal';

const WORKFLOW_STAGES: { status: POStatus; icon: string; color: string; bg: string }[] = [
  { status: 'Draft',             icon: 'ri-draft-line',            color: 'text-slate-500',   bg: 'bg-slate-100' },
  { status: 'Pending Approval',  icon: 'ri-time-line',             color: 'text-amber-600',   bg: 'bg-amber-100' },
  { status: 'Approved',          icon: 'ri-checkbox-circle-line',  color: 'text-emerald-600', bg: 'bg-emerald-100' },
  { status: 'Sent to Supplier',  icon: 'ri-send-plane-line',       color: 'text-sky-600',     bg: 'bg-sky-100' },
  { status: 'Acknowledged',      icon: 'ri-chat-check-line',       color: 'text-teal-600',    bg: 'bg-teal-100' },
  { status: 'In Production',     icon: 'ri-tools-line',            color: 'text-violet-600',  bg: 'bg-violet-100' },
  { status: 'Shipped',           icon: 'ri-truck-line',            color: 'text-blue-600',    bg: 'bg-blue-100' },
  { status: 'Partially Received',icon: 'ri-inbox-unarchive-line',  color: 'text-orange-600',  bg: 'bg-orange-100' },
  { status: 'Received',          icon: 'ri-inbox-2-line',          color: 'text-green-700',   bg: 'bg-green-100' },
  { status: 'Cancelled',         icon: 'ri-close-circle-line',     color: 'text-red-500',     bg: 'bg-red-100' },
];

const PRIORITY_COLORS: Record<POPriority, string> = {
  Low: 'bg-slate-100 text-slate-600',
  Standard: 'bg-sky-100 text-sky-700',
  High: 'bg-orange-100 text-orange-700',
  Urgent: 'bg-red-100 text-red-700',
};

function getStageInfo(status: POStatus) {
  return WORKFLOW_STAGES.find((s) => s.status === status) ?? WORKFLOW_STAGES[0];
}

const NEXT_STATUS: Partial<Record<POStatus, POStatus>> = {
  'Draft': 'Pending Approval',
  'Pending Approval': 'Approved',
  'Approved': 'Sent to Supplier',
  'Sent to Supplier': 'Acknowledged',
  'Acknowledged': 'In Production',
  'In Production': 'Shipped',
  'Shipped': 'Partially Received',
  'Partially Received': 'Received',
};

const SEED_POS: PurchaseOrder[] = [
  {
    id: 'PO-2026001', supplierId: 'SUPP-001', supplierName: 'Pacific Fabric Co.', companyId: 'COMP-001', companyName: 'Johnson Interiors',
    requestedBy: 'Sarah Johnson', status: 'In Production', priority: 'High',
    lineItems: [
      { id: 'LI-001', sku: 'PFC-FW-SLT', name: 'Faux Wood Slat Material', description: 'White, 2" slat', quantity: 2000, unitCost: 3.40, totalCost: 6800 },
      { id: 'LI-002', sku: 'PFC-RL-FAB', name: 'Roller Shade Fabric Roll', description: 'Blackout ivory', quantity: 150, unitCost: 7.80, totalCost: 1170 },
    ],
    subtotal: 7970, taxRate: 8.5, taxAmount: 677.45, shippingCost: 285, total: 8932.45, currency: 'USD',
    paymentTerms: 'Net 30', expectedDelivery: new Date(Date.now() + 18 * 86400000).toISOString().slice(0, 10),
    deliveryAddress: '2200 Beverly Glen Blvd, Los Angeles, CA 90077',
    notes: 'Match existing shade color spec #FW-2B-WHT. Urgent — client deadline April 15.',
    internalNotes: 'Linked to bulk order from Johnson Interiors. Rush fee approved.',
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString(), updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    approvedBy: 'Admin', approvedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'PO-2026002', supplierId: 'SUPP-002', supplierName: 'Westin Hardware Supply', companyId: 'COMP-004', companyName: 'BuildRight Contracting',
    requestedBy: 'Carlos Espinoza', status: 'Approved', priority: 'Standard',
    lineItems: [
      { id: 'LI-003', sku: 'WH-CORD-HD', name: 'Lift Cord Hardware Set', description: 'Standard 3/8" cord', quantity: 1000, unitCost: 1.25, totalCost: 1250 },
      { id: 'LI-004', sku: 'WH-RAIL-ALU', name: 'Aluminum Head Rail', description: '2" profile, white', quantity: 200, unitCost: 5.60, totalCost: 1120 },
      { id: 'LI-005', sku: 'WH-BRKT-STD', name: 'Standard Mounting Bracket', description: 'Inside/outside mount combo', quantity: 500, unitCost: 0.80, totalCost: 400 },
    ],
    subtotal: 2770, taxRate: 8.5, taxAmount: 235.45, shippingCost: 120, total: 3125.45, currency: 'USD',
    paymentTerms: 'Net 45', expectedDelivery: new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10),
    deliveryAddress: '101 Brickell Ave, Miami, FL 33131',
    notes: 'Ship to Miami warehouse. Coordinate with receiving team.',
    internalNotes: 'BuildRight Q2 project supply. Standard fulfillment.',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(), updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    approvedBy: 'Admin', approvedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'PO-2026003', supplierId: 'SUPP-003', supplierName: 'Coastal Packaging Solutions', companyId: '', companyName: '',
    requestedBy: 'Operations Team', status: 'Pending Approval', priority: 'Standard',
    lineItems: [
      { id: 'LI-006', sku: 'CP-BOX-STD', name: 'Standard Blind Shipping Box', description: '2\\" x 6\\" x 72\\" max dims', quantity: 5000, unitCost: 0.95, totalCost: 4750 },
      { id: 'LI-007', sku: 'CP-WRAP-FOAM', name: 'Foam Wrap Roll', description: '1/4\\" foam, 48\\" wide', quantity: 2000, unitCost: 0.30, totalCost: 600 },
    ],
    subtotal: 5350, taxRate: 8.5, taxAmount: 454.75, shippingCost: 200, total: 6004.75, currency: 'USD',
    paymentTerms: 'Net 30', expectedDelivery: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    deliveryAddress: '1201 Industrial Way, Los Angeles, CA 90021',
    notes: 'Q2 packaging restock. Include custom print specs in shipment.',
    internalNotes: 'Routine quarterly restock. Approve promptly.',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'PO-2026004', supplierId: 'SUPP-004', supplierName: 'MechaBlind Components Inc.', companyId: 'COMP-002', companyName: 'DesignHaus Studio',
    requestedBy: 'James MacAllister', status: 'Sent to Supplier', priority: 'Urgent',
    lineItems: [
      { id: 'LI-008', sku: 'MB-MTR-DC24', name: 'DC 24V Motorized Tilt Unit', description: 'Compatible with 2\\" wood blinds', quantity: 80, unitCost: 28.50, totalCost: 2280 },
    ],
    subtotal: 2280, taxRate: 8.5, taxAmount: 193.80, shippingCost: 95, total: 2568.80, currency: 'USD',
    paymentTerms: 'Net 30', expectedDelivery: new Date(Date.now() + 25 * 86400000).toISOString().slice(0, 10),
    deliveryAddress: '900 Commonwealth Ave, Boston, MA 02215',
    notes: 'Urgent for DesignHaus motorized blind project. Check with factory on production schedule.',
    internalNotes: 'Key account. Priority processing.',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(), updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    approvedBy: 'Admin', approvedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'PO-2026005', supplierId: 'SUPP-001', supplierName: 'Pacific Fabric Co.', companyId: 'COMP-005', companyName: 'LuxSpaces Hawaii',
    requestedBy: 'Linda Nakamura', status: 'Received', priority: 'Standard',
    lineItems: [
      { id: 'LI-009', sku: 'PFC-RL-FAB', name: 'Roller Shade Fabric Roll', description: 'Natural linen, solar screen', quantity: 300, unitCost: 7.80, totalCost: 2340 },
    ],
    subtotal: 2340, taxRate: 0, taxAmount: 0, shippingCost: 180, total: 2520, currency: 'USD',
    paymentTerms: 'Net 30', expectedDelivery: new Date(Date.now() - 5 * 86400000).toISOString().slice(0, 10),
    deliveryAddress: '1600 Kapiolani Blvd, Honolulu, HI 96814',
    notes: 'Tax-exempt per Hawaii certificate HI-TE-2024-4499.',
    internalNotes: 'Luxury resort order. Fully received and quality checked.',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(), updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    approvedBy: 'Admin', approvedAt: new Date(Date.now() - 28 * 86400000).toISOString(),
    shipment: { carrier: 'FedEx Freight', trackingNumber: 'FX7814903251', estimatedDelivery: new Date(Date.now() - 5 * 86400000).toISOString().slice(0, 10), receivedQty: 300, shippedAt: new Date(Date.now() - 8 * 86400000).toISOString() },
  },
];

function loadPOs(): PurchaseOrder[] {
  try {
    const stored = localStorage.getItem('admin_purchase_orders');
    if (stored) {
      const parsed: PurchaseOrder[] = JSON.parse(stored);
      if (parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  return SEED_POS;
}

function savePOs(pos: PurchaseOrder[]) {
  localStorage.setItem('admin_purchase_orders', JSON.stringify(pos));
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatMoney(n: number) {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function AdminPurchaseOrdersPage() {
  const [pos, setPos] = useState<PurchaseOrder[]>(loadPOs);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<POStatus | 'All'>('All');
  const [priorityFilter, setPriorityFilter] = useState<POPriority | 'All'>('All');
  const [showForm, setShowForm] = useState(false);
  const [editingPO, setEditingPO] = useState<PurchaseOrder | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'pipeline'>('table');

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = useMemo(() => {
    return pos.filter((p) => {
      const q = search.toLowerCase();
      const matchSearch = q === '' || [p.id, p.supplierName, p.companyName ?? '', p.requestedBy].some((f) => f.toLowerCase().includes(q));
      const matchStatus = statusFilter === 'All' || p.status === statusFilter;
      const matchPriority = priorityFilter === 'All' || p.priority === priorityFilter;
      return matchSearch && matchStatus && matchPriority;
    });
  }, [pos, search, statusFilter, priorityFilter]);

  const stats = {
    total: pos.length,
    pending: pos.filter((p) => p.status === 'Pending Approval').length,
    active: pos.filter((p) => ['Approved', 'Sent to Supplier', 'Acknowledged', 'In Production', 'Shipped', 'Partially Received'].includes(p.status)).length,
    totalValue: pos.filter((p) => p.status !== 'Cancelled').reduce((s, p) => s + p.total, 0),
    received: pos.filter((p) => p.status === 'Received').length,
    urgent: pos.filter((p) => p.priority === 'Urgent').length,
  };

  const handleSave = (po: PurchaseOrder) => {
    const existing = pos.find((p) => p.id === po.id);
    let updated: PurchaseOrder[];
    if (existing) {
      updated = pos.map((p) => (p.id === po.id ? po : p));
      showToast(`${po.id} updated`);
    } else {
      // Also create a linked order in admin orders pipeline
      try {
        const orders: any[] = JSON.parse(localStorage.getItem('orders') ?? '[]');
        const newOrder = {
          id: 'ORD-' + Date.now().toString().slice(-6),
          date: new Date().toISOString(),
          status: 'Processing',
          customer: { firstName: po.requestedBy.split(' ')[0] ?? 'Company', lastName: po.requestedBy.split(' ').slice(1).join(' ') ?? '', email: 'bulk@order.com', companyName: po.companyName ?? '' },
          items: po.lineItems.map((l) => ({ name: l.name, quantity: l.quantity, size: l.description, price: l.unitCost })),
          total: po.total,
          purchaseOrderId: po.id,
          isBulkOrder: true,
        };
        localStorage.setItem('orders', JSON.stringify([newOrder, ...orders]));
      } catch { /* ignore */ }
      updated = [po, ...pos];
      showToast(`${po.id} created and added to order pipeline`);
    }
    setPos(updated);
    savePOs(updated);
    setShowForm(false);
    setEditingPO(null);
  };

  const handleAdvanceStatus = (id: string) => {
    const po = pos.find((p) => p.id === id);
    if (!po) return;
    const next = NEXT_STATUS[po.status];
    if (!next) return;
    const updated = pos.map((p) => p.id === id ? { ...p, status: next, updatedAt: new Date().toISOString() } : p);
    setPos(updated);
    savePOs(updated);
    showToast(`${id} advanced to "${next}"`);
  };

  const handleDelete = (id: string) => {
    const updated = pos.filter((p) => p.id !== id);
    setPos(updated);
    savePOs(updated);
    setDeleteId(null);
    showToast(`${id} deleted`, 'error');
  };

  const pipelineGroups = useMemo(() => {
    const groups: Record<string, PurchaseOrder[]> = {};
    WORKFLOW_STAGES.forEach((s) => { groups[s.status] = []; });
    pos.forEach((p) => { if (groups[p.status]) groups[p.status].push(p); });
    return groups;
  }, [pos]);

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
            <h3 className="text-lg font-bold text-slate-900 text-center mb-1">Delete Purchase Order?</h3>
            <p className="text-sm text-slate-500 text-center mb-6">
              Permanently remove <span className="font-semibold text-slate-900">{deleteId}</span>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer whitespace-nowrap">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg cursor-pointer whitespace-nowrap">Delete</button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <PurchaseOrderFormModal
          po={editingPO}
          onClose={() => { setShowForm(false); setEditingPO(null); }}
          onSave={handleSave}
        />
      )}

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Purchase Orders</h1>
          <p className="text-sm text-slate-500 mt-1">Manage procurement requests and bulk order workflows</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1">
            <button onClick={() => setViewMode('table')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors ${viewMode === 'table' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-700'}`}>
              <i className="ri-table-line"></i> Table
            </button>
            <button onClick={() => setViewMode('pipeline')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors ${viewMode === 'pipeline' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-700'}`}>
              <i className="ri-kanban-view"></i> Pipeline
            </button>
          </div>
          <button
            onClick={() => { setEditingPO(null); setShowForm(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-lg cursor-pointer whitespace-nowrap"
          >
            <i className="ri-file-add-line text-base"></i>
            New PO
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-6 gap-4 mb-6">
        {[
          { label: 'Total POs', value: stats.total, icon: 'ri-file-list-3-line', color: 'text-slate-700' },
          { label: 'Pending Approval', value: stats.pending, icon: 'ri-time-line', color: 'text-amber-600' },
          { label: 'Active', value: stats.active, icon: 'ri-loader-4-line', color: 'text-violet-600' },
          { label: 'Received', value: stats.received, icon: 'ri-inbox-2-line', color: 'text-emerald-600' },
          { label: 'Total Value', value: `$${(stats.totalValue / 1000).toFixed(1)}K`, icon: 'ri-money-dollar-circle-line', color: 'text-indigo-600' },
          { label: 'Urgent', value: stats.urgent, icon: 'ri-alarm-warning-line', color: 'text-red-600' },
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

      {/* Workflow Stages Indicator */}
      <div className="bg-white rounded-xl border border-slate-100 p-4 mb-4 overflow-x-auto">
        <div className="flex items-center gap-0 min-w-max">
          {WORKFLOW_STAGES.filter((s) => s.status !== 'Cancelled').map((stage, idx, arr) => {
            const count = pos.filter((p) => p.status === stage.status).length;
            return (
              <div key={stage.status} className="flex items-center">
                <button
                  onClick={() => setStatusFilter(statusFilter === stage.status ? 'All' : stage.status)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all whitespace-nowrap ${
                    statusFilter === stage.status ? `${stage.bg} ${stage.color} ring-2 ring-offset-1 ring-current` : 'hover:bg-slate-50 text-slate-500'
                  }`}
                >
                  <div className={`w-5 h-5 flex items-center justify-center ${statusFilter === stage.status ? stage.color : 'text-slate-400'}`}>
                    <i className={`${stage.icon} text-sm`}></i>
                  </div>
                  <span>{stage.status}</span>
                  {count > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${statusFilter === stage.status ? 'bg-white/60' : 'bg-slate-100 text-slate-500'}`}>{count}</span>
                  )}
                </button>
                {idx < arr.length - 1 && <div className="w-5 h-px bg-slate-200 mx-1 shrink-0"></div>}
              </div>
            );
          })}
          <div className="flex items-center ml-2">
            <div className="w-5 h-px bg-slate-200 mx-1 shrink-0"></div>
            <button
              onClick={() => setStatusFilter(statusFilter === 'Cancelled' ? 'All' : 'Cancelled')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all whitespace-nowrap ${
                statusFilter === 'Cancelled' ? 'bg-red-100 text-red-500 ring-2 ring-offset-1 ring-red-300' : 'hover:bg-slate-50 text-slate-500'
              }`}
            >
              <div className="w-5 h-5 flex items-center justify-center text-red-400">
                <i className="ri-close-circle-line text-sm"></i>
              </div>
              Cancelled
              {pos.filter((p) => p.status === 'Cancelled').length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500">{pos.filter((p) => p.status === 'Cancelled').length}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'table' && (
        <>
          {/* Filters */}
          <div className="bg-white rounded-xl border border-slate-100 mb-4 px-4 py-3 flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <div className="w-4 h-4 flex items-center justify-center text-slate-400">
                <i className="ri-search-line text-sm"></i>
              </div>
              <input type="text" placeholder="Search by PO ID, supplier, company..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 text-sm outline-none text-slate-700 placeholder-slate-400" />
              {search && <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-700 cursor-pointer"><i className="ri-close-line text-sm"></i></button>}
            </div>
            <div className="flex gap-1.5">
              {(['All', 'Low', 'Standard', 'High', 'Urgent'] as const).map((p) => (
                <button key={p} onClick={() => setPriorityFilter(p as typeof priorityFilter)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors ${priorityFilter === p ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{p}</button>
              ))}
            </div>
            {(statusFilter !== 'All' || search || priorityFilter !== 'All') && (
              <button onClick={() => { setStatusFilter('All'); setSearch(''); setPriorityFilter('All'); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-500 rounded-full text-xs font-semibold cursor-pointer whitespace-nowrap hover:bg-red-100">
                <i className="ri-close-line"></i> Clear filters
              </button>
            )}
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">PO</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Supplier</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Company / Requester</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Expected</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((p) => {
                    const stage = getStageInfo(p.status);
                    const next = NEXT_STATUS[p.status];
                    const isOverdue = p.expectedDelivery && new Date(p.expectedDelivery) < new Date() && !['Received', 'Cancelled'].includes(p.status);
                    return (
                      <>
                        <tr key={p.id} className="hover:bg-slate-50 transition-colors cursor-pointer group" onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <p className="text-sm font-bold text-slate-900 font-mono group-hover:text-violet-700">{p.id}</p>
                              <p className="text-xs text-slate-400">{formatDate(p.createdAt)}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-sm font-semibold text-slate-700">{p.supplierName}</p>
                            <p className="text-xs text-slate-400">{p.lineItems.length} line item{p.lineItems.length !== 1 ? 's' : ''}</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {p.companyName ? (
                              <p className="text-sm text-slate-700 font-semibold">{p.companyName}</p>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Internal</span>
                            )}
                            <p className="text-xs text-slate-400">{p.requestedBy}</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${stage.bg} ${stage.color}`}>
                              <i className={`${stage.icon} text-xs`}></i>
                              {p.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${PRIORITY_COLORS[p.priority]}`}>{p.priority}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-sm font-bold text-slate-800">{formatMoney(p.total)}</p>
                            <p className="text-xs text-slate-400">{p.currency}</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {p.expectedDelivery ? (
                              <p className={`text-sm font-semibold ${isOverdue ? 'text-red-500' : 'text-slate-700'}`}>
                                {isOverdue && <i className="ri-alarm-warning-line mr-1 text-xs"></i>}
                                {formatDate(p.expectedDelivery)}
                              </p>
                            ) : <span className="text-slate-300">—</span>}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              {next && (
                                <button onClick={() => handleAdvanceStatus(p.id)} className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-800 cursor-pointer whitespace-nowrap">
                                  <i className="ri-arrow-right-circle-line"></i> Advance
                                </button>
                              )}
                              {next && <span className="text-slate-200">|</span>}
                              <button onClick={() => { setEditingPO(p); setShowForm(true); }} className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer whitespace-nowrap">
                                <i className="ri-edit-line"></i> Edit
                              </button>
                              <span className="text-slate-200">|</span>
                              <button onClick={() => setDeleteId(p.id)} className="flex items-center gap-1 text-xs font-semibold text-red-400 hover:text-red-600 cursor-pointer whitespace-nowrap">
                                <i className="ri-delete-bin-line"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                        {expandedId === p.id && (
                          <tr key={`${p.id}-exp`}>
                            <td colSpan={8} className="px-6 py-5 bg-violet-50/40 border-b border-violet-100">
                              <div className="grid grid-cols-3 gap-6">
                                {/* Line Items */}
                                <div className="col-span-2">
                                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Line Items</p>
                                  <table className="w-full text-left">
                                    <thead>
                                      <tr className="bg-white/70 rounded-lg">
                                        <th className="px-3 py-2 text-xs font-semibold text-slate-500">SKU</th>
                                        <th className="px-3 py-2 text-xs font-semibold text-slate-500">Product</th>
                                        <th className="px-3 py-2 text-xs font-semibold text-slate-500 text-right">Qty</th>
                                        <th className="px-3 py-2 text-xs font-semibold text-slate-500 text-right">Unit</th>
                                        <th className="px-3 py-2 text-xs font-semibold text-slate-500 text-right">Total</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {p.lineItems.map((li) => (
                                        <tr key={li.id} className="border-t border-slate-100">
                                          <td className="px-3 py-2 text-xs font-mono text-slate-500">{li.sku}</td>
                                          <td className="px-3 py-2">
                                            <p className="text-xs font-semibold text-slate-700">{li.name}</p>
                                            {li.description && <p className="text-xs text-slate-400">{li.description}</p>}
                                          </td>
                                          <td className="px-3 py-2 text-xs font-semibold text-slate-700 text-right">{li.quantity.toLocaleString()}</td>
                                          <td className="px-3 py-2 text-xs text-slate-500 text-right">{formatMoney(li.unitCost)}</td>
                                          <td className="px-3 py-2 text-xs font-bold text-slate-800 text-right">{formatMoney(li.totalCost)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                    <tfoot>
                                      <tr className="border-t-2 border-slate-200">
                                        <td colSpan={4} className="px-3 py-2 text-xs font-bold text-slate-700 text-right">Subtotal</td>
                                        <td className="px-3 py-2 text-xs font-bold text-slate-800 text-right">{formatMoney(p.subtotal)}</td>
                                      </tr>
                                      {p.taxAmount > 0 && (
                                        <tr>
                                          <td colSpan={4} className="px-3 py-1.5 text-xs text-slate-500 text-right">Tax ({p.taxRate}%)</td>
                                          <td className="px-3 py-1.5 text-xs text-slate-600 text-right">{formatMoney(p.taxAmount)}</td>
                                        </tr>
                                      )}
                                      <tr>
                                        <td colSpan={4} className="px-3 py-1.5 text-xs text-slate-500 text-right">Shipping</td>
                                        <td className="px-3 py-1.5 text-xs text-slate-600 text-right">{formatMoney(p.shippingCost)}</td>
                                      </tr>
                                      <tr className="border-t border-slate-200">
                                        <td colSpan={4} className="px-3 py-2 text-sm font-bold text-slate-800 text-right">Total</td>
                                        <td className="px-3 py-2 text-sm font-bold text-violet-700 text-right">{formatMoney(p.total)}</td>
                                      </tr>
                                    </tfoot>
                                  </table>
                                </div>
                                {/* Side Info */}
                                <div className="space-y-4">
                                  <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Order Details</p>
                                    <div className="space-y-1.5 text-xs">
                                      <div className="flex justify-between"><span className="text-slate-500">Payment Terms</span><span className="font-semibold text-slate-700">{p.paymentTerms}</span></div>
                                      {p.approvedBy && <div className="flex justify-between"><span className="text-slate-500">Approved By</span><span className="font-semibold text-slate-700">{p.approvedBy}</span></div>}
                                      {p.approvedAt && <div className="flex justify-between"><span className="text-slate-500">Approved</span><span className="font-semibold text-slate-700">{formatDate(p.approvedAt)}</span></div>}
                                      {p.deliveryAddress && <div><span className="text-slate-500">Ship To:</span><p className="text-slate-700 mt-0.5">{p.deliveryAddress}</p></div>}
                                    </div>
                                  </div>
                                  {p.shipment && (
                                    <div>
                                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Shipment</p>
                                      <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 space-y-1.5 text-xs">
                                        <div className="flex justify-between"><span className="text-slate-500">Carrier</span><span className="font-semibold text-slate-700">{p.shipment.carrier}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500">Tracking</span><span className="font-mono text-slate-700">{p.shipment.trackingNumber}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500">Received Qty</span><span className="font-bold text-emerald-700">{p.shipment.receivedQty}</span></div>
                                      </div>
                                    </div>
                                  )}
                                  {p.notes && (
                                    <div>
                                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Notes to Supplier</p>
                                      <p className="text-xs text-slate-600 italic">{p.notes}</p>
                                    </div>
                                  )}
                                  {p.internalNotes && (
                                    <div>
                                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Internal Notes</p>
                                      <p className="text-xs text-slate-600">{p.internalNotes}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-6 py-16 text-center">
                        <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <i className="ri-file-list-3-line text-slate-400 text-2xl"></i>
                        </div>
                        <p className="text-sm font-semibold text-slate-600">No purchase orders found</p>
                        <p className="text-xs text-slate-400 mt-1">Create your first PO to start tracking procurement</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {filtered.length > 0 && (
              <div className="px-6 py-3 border-t border-slate-50 bg-slate-50/60">
                <p className="text-xs text-slate-500">Showing <span className="font-semibold text-slate-700">{filtered.length}</span> of <span className="font-semibold text-slate-700">{pos.length}</span> purchase orders</p>
              </div>
            )}
          </div>
        </>
      )}

      {viewMode === 'pipeline' && (
        <div className="grid grid-cols-5 gap-4">
          {WORKFLOW_STAGES.filter((s) => s.status !== 'Cancelled').map((stage) => {
            const items = pipelineGroups[stage.status] ?? [];
            return (
              <div key={stage.status} className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                <div className={`px-4 py-3 ${stage.bg} flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 flex items-center justify-center ${stage.color}`}>
                      <i className={`${stage.icon} text-sm`}></i>
                    </div>
                    <span className={`text-xs font-bold ${stage.color}`}>{stage.status}</span>
                  </div>
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${items.length > 0 ? 'bg-white/70 ' + stage.color : 'bg-white/40 text-slate-400'}`}>{items.length}</span>
                </div>
                <div className="p-3 space-y-2 min-h-[80px]">
                  {items.map((po) => (
                    <div key={po.id} className="bg-slate-50 hover:bg-slate-100 rounded-lg p-3 cursor-pointer transition-colors group" onClick={() => { setEditingPO(po); setShowForm(true); }}>
                      <p className="text-xs font-bold text-slate-800 font-mono">{po.id}</p>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{po.supplierName}</p>
                      {po.companyName && <p className="text-xs text-slate-400 truncate">{po.companyName}</p>}
                      <div className="flex items-center justify-between mt-2">
                        <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${PRIORITY_COLORS[po.priority]}`}>{po.priority}</span>
                        <span className="text-xs font-bold text-slate-700">${(po.total / 1000).toFixed(1)}K</span>
                      </div>
                      {NEXT_STATUS[po.status] && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAdvanceStatus(po.id); }}
                          className="mt-2 w-full flex items-center justify-center gap-1 px-2 py-1 bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 text-xs font-semibold rounded-lg cursor-pointer whitespace-nowrap transition-colors"
                        >
                          <i className="ri-arrow-right-line text-xs"></i> Advance
                        </button>
                      )}
                    </div>
                  ))}
                  {items.length === 0 && (
                    <p className="text-xs text-slate-300 text-center py-4">No orders</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
