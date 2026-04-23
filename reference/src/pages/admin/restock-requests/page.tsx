import { useState, useEffect } from 'react';
import { products as productCatalog } from '../../../mocks/products';

interface RestockRequest {
  id: string;
  addressId: string;
  productId: number;
  productName: string;
  quantity: number;
  urgency: 'low' | 'medium' | 'high';
  note: string;
  timestamp: number;
  status: 'pending' | 'approved' | 'fulfilled' | 'rejected';
  contactName?: string;
  email?: string;
  phone?: string;
  location?: string;
  preferredDate?: string;
}

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error';
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

interface AlertEmail {
  address: string;
  testStatus: 'idle' | 'sending' | 'sent';
}

function RestockAlertEmailsPanel() {
  const STORAGE_KEY = 'restock_request_alert_emails';
  const [isOpen, setIsOpen] = useState(false);
  const [emails, setEmails] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'); } catch { return []; }
  });
  const [alertMap, setAlertMap] = useState<Record<string, AlertEmail['testStatus']>>({});
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [savedFlash, setSavedFlash] = useState(false);

  function persist(list: string[]) {
    setEmails(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  }

  function handleAdd() {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (!isValidEmail(trimmed)) { setError('Please enter a valid email address.'); return; }
    if (emails.includes(trimmed)) { setError('This email is already added.'); return; }
    persist([...emails, trimmed]);
    setInput('');
    setError('');
  }

  function handleRemove(email: string) {
    persist(emails.filter(e => e !== email));
    setAlertMap(prev => { const n = { ...prev }; delete n[email]; return n; });
  }

  function handleTest(email: string) {
    setAlertMap(prev => ({ ...prev, [email]: 'sending' }));
    setTimeout(() => {
      setAlertMap(prev => ({ ...prev, [email]: 'sent' }));
      setTimeout(() => {
        setAlertMap(prev => { const n = { ...prev }; delete n[email]; return n; });
      }, 3000);
    }, 1500);
  }

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsOpen(o => !o)}
        className="w-full flex items-center justify-between bg-white border border-slate-200 rounded-xl px-5 py-4 hover:bg-slate-50 transition-colors cursor-pointer group"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
            <i className="ri-notification-3-line text-amber-600 text-base"></i>
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-slate-900">Restock Request Alert Emails</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {emails.length === 0
                ? 'No alert recipients configured — click to set up'
                : `${emails.length} recipient${emails.length > 1 ? 's' : ''} will be notified on new requests`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {emails.length > 0 && (
            <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-200">
              {emails.length} active
            </span>
          )}
          {savedFlash && (
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <i className="ri-check-line"></i> Saved
            </span>
          )}
          <i className={`ri-arrow-${isOpen ? 'up' : 'down'}-s-line text-slate-400 text-lg transition-transform`}></i>
        </div>
      </button>

      {isOpen && (
        <div className="bg-white border border-t-0 border-slate-200 rounded-b-xl px-5 py-5">
          <div className="mb-4">
            <p className="text-xs text-slate-500 leading-relaxed">
              Add staff email addresses below. All listed recipients will receive an instant alert whenever a customer submits a new restock request.
            </p>
          </div>

          {/* Email list */}
          {emails.length > 0 ? (
            <div className="flex flex-col gap-2 mb-4">
              {emails.map(email => {
                const status = alertMap[email];
                return (
                  <div key={email} className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    <div className="w-5 h-5 flex items-center justify-center shrink-0">
                      <i className="ri-mail-line text-amber-500 text-sm"></i>
                    </div>
                    <span className="text-sm font-semibold text-slate-800 flex-1 truncate">{email}</span>

                    {/* Test button */}
                    <button
                      onClick={() => handleTest(email)}
                      disabled={status === 'sending'}
                      title="Send test alert"
                      className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                        status === 'sent'
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          : status === 'sending'
                          ? 'bg-slate-100 text-slate-400 border border-slate-200'
                          : 'bg-white text-slate-600 border border-slate-200 hover:border-amber-400 hover:text-amber-700'
                      }`}
                    >
                      {status === 'sending' ? (
                        <><i className="ri-loader-4-line animate-spin text-xs"></i> Sending…</>
                      ) : status === 'sent' ? (
                        <><i className="ri-check-line text-xs"></i> Sent!</>
                      ) : (
                        <><i className="ri-send-plane-line text-xs"></i> Test</>
                      )}
                    </button>

                    {/* Remove button */}
                    <button
                      onClick={() => handleRemove(email)}
                      className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-100 hover:text-red-500 text-slate-400 transition-colors cursor-pointer shrink-0"
                      title="Remove"
                    >
                      <i className="ri-close-line text-sm"></i>
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-slate-50 border border-dashed border-slate-300 rounded-lg px-4 py-3 mb-4">
              <i className="ri-inbox-line text-slate-300 text-lg"></i>
              <span className="text-sm text-slate-400">No recipients yet — add one below</span>
            </div>
          )}

          {/* Add input */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <i className="ri-mail-add-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
              <input
                type="email"
                value={input}
                onChange={e => { setInput(e.target.value); setError(''); }}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAdd(); } }}
                placeholder="staff@example.com"
                className={`w-full pl-9 pr-4 py-2.5 text-sm border rounded-lg outline-none text-slate-700 placeholder-slate-400 ${
                  error ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-amber-400'
                }`}
              />
            </div>
            <button
              onClick={handleAdd}
              disabled={!input.trim()}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-add-line"></i> Add Email
            </button>
          </div>

          {error && (
            <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
              <i className="ri-error-warning-line"></i>{error}
            </p>
          )}
          <p className="text-xs text-slate-400 mt-2">Press Enter or click Add Email · Use Test to verify delivery before going live</p>
        </div>
      )}
    </div>
  );
}

const urgencyConfig = {
  low: { label: 'Low', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  medium: { label: 'Medium', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  high: { label: 'High', color: 'bg-red-100 text-red-700 border-red-200' },
};

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: 'ri-time-line' },
  approved: { label: 'Approved', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: 'ri-check-line' },
  fulfilled: { label: 'Fulfilled', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: 'ri-checkbox-circle-line' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700 border-red-200', icon: 'ri-close-line' },
};

export default function AdminRestockRequestsPage() {
  const [requests, setRequests] = useState<RestockRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<RestockRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | RestockRequest['status']>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<'all' | RestockRequest['urgency']>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [requests, statusFilter, urgencyFilter, searchQuery]);

  const loadRequests = () => {
    try {
      const stored = localStorage.getItem('user_restock_requests');
      if (stored) {
        const parsed = JSON.parse(stored);
        setRequests(parsed);
      }
    } catch {
      setRequests([]);
    }
  };

  const applyFilters = () => {
    let filtered = [...requests];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    if (urgencyFilter !== 'all') {
      filtered = filtered.filter(r => r.urgency === urgencyFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.productName.toLowerCase().includes(query) ||
        r.contactName?.toLowerCase().includes(query) ||
        r.email?.toLowerCase().includes(query)
      );
    }

    setFilteredRequests(filtered);
  };

  const updateRequestStatus = (id: string, newStatus: RestockRequest['status']) => {
    const updated = requests.map(r =>
      r.id === id ? { ...r, status: newStatus } : r
    );
    setRequests(updated);
    localStorage.setItem('user_restock_requests', JSON.stringify(updated));
    
    const statusLabel = statusConfig[newStatus].label;
    showToast(`Request ${statusLabel.toLowerCase()} successfully`, 'success');
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    const id = `toast_${Date.now()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const getProductImage = (productId: number) => {
    const product = productCatalog.find(p => p.id === productId);
    return product?.image ?? '';
  };

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    fulfilled: requests.filter(r => r.status === 'fulfilled').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  };

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Restock Requests</h1>
          <p className="text-sm text-slate-500 mt-1">Review and manage customer restock requests</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
            stats.pending > 0 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-slate-100 border-slate-200 text-slate-500'
          }`}>
            {stats.pending} pending
          </span>
        </div>
      </div>

      {/* Alert Email Panel */}
      <RestockAlertEmailsPanel />

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Total Requests</span>
            <i className="ri-inbox-line text-slate-400 text-lg"></i>
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-blue-600 uppercase">Pending</span>
            <i className="ri-time-line text-blue-400 text-lg"></i>
          </div>
          <p className="text-3xl font-bold text-blue-700">{stats.pending}</p>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-emerald-600 uppercase">Approved</span>
            <i className="ri-check-line text-emerald-400 text-lg"></i>
          </div>
          <p className="text-3xl font-bold text-emerald-700">{stats.approved}</p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-purple-600 uppercase">Fulfilled</span>
            <i className="ri-checkbox-circle-line text-purple-400 text-lg"></i>
          </div>
          <p className="text-3xl font-bold text-purple-700">{stats.fulfilled}</p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-red-600 uppercase">Rejected</span>
            <i className="ri-close-line text-red-400 text-lg"></i>
          </div>
          <p className="text-3xl font-bold text-red-700">{stats.rejected}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by product, customer name, or email..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Urgency Filter */}
          <div>
            <select
              value={urgencyFilter}
              onChange={e => setUrgencyFilter(e.target.value as typeof urgencyFilter)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white cursor-pointer"
            >
              <option value="all">All Urgency Levels</option>
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-inbox-line text-4xl text-slate-400"></i>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Requests Found</h3>
          <p className="text-sm text-slate-500">
            {searchQuery || statusFilter !== 'all' || urgencyFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Customer restock requests will appear here'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map(request => {
            const productImage = getProductImage(request.productId);
            const urgency = urgencyConfig[request.urgency];
            const status = statusConfig[request.status];

            return (
              <div
                key={request.id}
                className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-6">
                  {/* Product Image */}
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                    {productImage ? (
                      <img
                        src={productImage}
                        alt={request.productName}
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <i className="ri-image-line text-3xl text-slate-300"></i>
                      </div>
                    )}
                  </div>

                  {/* Request Details */}
                  <div className="flex-1 min-w-0">
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-slate-900 mb-1 truncate">
                          {request.productName}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${status.color} whitespace-nowrap`}>
                            <i className={`${status.icon}`}></i>
                            {status.label}
                          </span>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${urgency.color} whitespace-nowrap`}>
                            {urgency.label} Priority
                          </span>
                          <span className="text-xs text-slate-500">
                            {new Date(request.timestamp).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {request.status === 'pending' && (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => updateRequestStatus(request.id, 'approved')}
                            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors whitespace-nowrap cursor-pointer"
                          >
                            <i className="ri-check-line"></i>
                            Approve
                          </button>
                          <button
                            onClick={() => updateRequestStatus(request.id, 'rejected')}
                            className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors whitespace-nowrap cursor-pointer"
                          >
                            <i className="ri-close-line"></i>
                            Reject
                          </button>
                        </div>
                      )}

                      {request.status === 'approved' && (
                        <button
                          onClick={() => updateRequestStatus(request.id, 'fulfilled')}
                          className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors whitespace-nowrap cursor-pointer shrink-0"
                        >
                          <i className="ri-checkbox-circle-line"></i>
                          Mark Fulfilled
                        </button>
                      )}
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-slate-500 mb-0.5">Customer</p>
                        <p className="text-sm font-semibold text-slate-900">{request.contactName || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-0.5">Email</p>
                        <p className="text-sm font-semibold text-slate-900 truncate">{request.email || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-0.5">Phone</p>
                        <p className="text-sm font-semibold text-slate-900">{request.phone || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-0.5">Quantity</p>
                        <p className="text-sm font-semibold text-slate-900">{request.quantity} units</p>
                      </div>
                    </div>

                    {/* Additional Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {request.location && (
                        <div>
                          <p className="text-xs text-slate-500 mb-0.5">Delivery Location</p>
                          <p className="text-sm text-slate-700">{request.location}</p>
                        </div>
                      )}
                      {request.preferredDate && (
                        <div>
                          <p className="text-xs text-slate-500 mb-0.5">Preferred Date</p>
                          <p className="text-sm text-slate-700">
                            {new Date(request.preferredDate).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    {request.note && (
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                        <p className="text-xs font-semibold text-slate-600 mb-1">Customer Notes:</p>
                        <p className="text-sm text-slate-700">{request.note}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Toast Notifications */}
      <div className="fixed bottom-6 right-6 z-50 space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border ${
              toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-red-50 border-red-200 text-red-700'
            } animate-slide-in-right`}
          >
            <i className={`${toast.type === 'success' ? 'ri-check-line' : 'ri-error-warning-line'} text-lg`}></i>
            <p className="text-sm font-semibold whitespace-nowrap">{toast.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}