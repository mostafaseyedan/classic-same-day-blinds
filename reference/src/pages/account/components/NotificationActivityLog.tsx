import { useState } from 'react';

type LogStatus = 'delivered' | 'opened' | 'clicked';
type LogCategory = 'order' | 'restock' | 'promo' | 'account';

interface LogEntry {
  id: string;
  category: LogCategory;
  subject: string;
  preview: string;
  sentAt: Date;
  status: LogStatus;
  orderId?: string;
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(Math.floor(Math.random() * 10) + 8, Math.floor(Math.random() * 59));
  return d;
}

const MOCK_LOG: LogEntry[] = [
  {
    id: 'log1',
    category: 'order',
    subject: 'Your order has been delivered!',
    preview: 'Your order #ORD-44821 containing Premium Cellular Shades has been delivered.',
    sentAt: daysAgo(0),
    status: 'opened',
    orderId: 'ORD-44821',
  },
  {
    id: 'log2',
    category: 'order',
    subject: 'Order out for delivery today',
    preview: 'Great news — your package is out for delivery and expected by end of day.',
    sentAt: daysAgo(1),
    status: 'clicked',
    orderId: 'ORD-44821',
  },
  {
    id: 'log3',
    category: 'order',
    subject: 'Your order has shipped',
    preview: 'Order #ORD-44821 is on its way. Track your shipment with FedEx: 7489203847.',
    sentAt: daysAgo(2),
    status: 'clicked',
    orderId: 'ORD-44821',
  },
  {
    id: 'log4',
    category: 'order',
    subject: 'Order confirmed — Thank you!',
    preview: 'We\'ve received your order for 2 items totaling $189.98. You\'ll receive updates as it ships.',
    sentAt: daysAgo(4),
    status: 'opened',
    orderId: 'ORD-44821',
  },
  {
    id: 'log5',
    category: 'restock',
    subject: 'Restock request approved',
    preview: 'Your restock request for 48 units of Blackout Roller Shade at Main Office has been approved.',
    sentAt: daysAgo(6),
    status: 'opened',
  },
  {
    id: 'log6',
    category: 'order',
    subject: 'Order confirmed — Thank you!',
    preview: 'We\'ve received your order for Motorized Smart Blinds totaling $342.50.',
    sentAt: daysAgo(14),
    status: 'delivered',
    orderId: 'ORD-39201',
  },
  {
    id: 'log7',
    category: 'restock',
    subject: 'Restock completed — Ready for delivery',
    preview: 'Your restocked items (36 units) at Warehouse B are ready and scheduled for delivery.',
    sentAt: daysAgo(18),
    status: 'opened',
  },
  {
    id: 'log8',
    category: 'promo',
    subject: 'Spring Sale: Up to 30% off window treatments',
    preview: 'This weekend only — our biggest sale of the season on premium cellular shades and roller blinds.',
    sentAt: daysAgo(22),
    status: 'delivered',
  },
  {
    id: 'log9',
    category: 'account',
    subject: 'Your profile has been updated',
    preview: 'Your account name was recently changed. If this wasn\'t you, please contact support.',
    sentAt: daysAgo(25),
    status: 'opened',
  },
  {
    id: 'log10',
    category: 'order',
    subject: 'Order delivered — How did we do?',
    preview: 'Your order #ORD-39201 has been delivered. We\'d love to hear your feedback!',
    sentAt: daysAgo(29),
    status: 'clicked',
    orderId: 'ORD-39201',
  },
];

const CATEGORY_META: Record<LogCategory, { icon: string; color: string; bg: string; label: string }> = {
  order: { icon: 'ri-shopping-bag-line', color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Order' },
  restock: { icon: 'ri-refresh-line', color: 'text-teal-600', bg: 'bg-teal-50', label: 'Restock' },
  promo: { icon: 'ri-price-tag-3-line', color: 'text-amber-600', bg: 'bg-amber-50', label: 'Promo' },
  account: { icon: 'ri-user-line', color: 'text-gray-600', bg: 'bg-gray-100', label: 'Account' },
};

const STATUS_META: Record<LogStatus, { label: string; color: string; icon: string }> = {
  delivered: { label: 'Delivered', color: 'text-gray-500', icon: 'ri-mail-line' },
  opened: { label: 'Opened', color: 'text-teal-600', icon: 'ri-mail-open-line' },
  clicked: { label: 'Clicked', color: 'text-emerald-600', icon: 'ri-cursor-line' },
};

function formatRelative(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatFull(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) +
    ' at ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

type FilterCategory = LogCategory | 'all';

export default function NotificationActivityLog() {
  const [visibleCount, setVisibleCount] = useState(5);
  const [filter, setFilter] = useState<FilterCategory>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = filter === 'all' ? MOCK_LOG : MOCK_LOG.filter((e) => e.category === filter);
  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const filterTabs: { id: FilterCategory; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'order', label: 'Orders' },
    { id: 'restock', label: 'Restock' },
    { id: 'promo', label: 'Promos' },
    { id: 'account', label: 'Account' },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mt-8">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 shrink-0">
            <i className="ri-history-line text-xl text-gray-600"></i>
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Email Activity Log</h3>
            <p className="text-xs text-gray-500 mt-0.5">A record of emails sent to your account in the last 30 days.</p>
          </div>
        </div>
        <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full whitespace-nowrap">
          {MOCK_LOG.length} emails this month
        </span>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
        {[
          { label: 'Delivered', count: MOCK_LOG.filter((e) => e.status === 'delivered').length, icon: 'ri-mail-line', color: 'text-gray-500' },
          { label: 'Opened', count: MOCK_LOG.filter((e) => e.status === 'opened').length, icon: 'ri-mail-open-line', color: 'text-teal-600' },
          { label: 'Clicked', count: MOCK_LOG.filter((e) => e.status === 'clicked').length, icon: 'ri-cursor-line', color: 'text-emerald-600' },
        ].map((stat) => (
          <div key={stat.label} className="flex items-center justify-center gap-2.5 py-3 px-4">
            <div className="w-7 h-7 flex items-center justify-center">
              <i className={`${stat.icon} text-base ${stat.color}`}></i>
            </div>
            <div>
              <p className="text-base font-bold text-gray-900 leading-none">{stat.count}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 px-6 pt-4 pb-2">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setFilter(tab.id); setVisibleCount(5); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              filter === tab.id
                ? 'bg-gray-900 text-white'
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Log entries */}
      <div className="px-6 pb-2">
        {visible.length === 0 ? (
          <div className="py-10 text-center">
            <i className="ri-inbox-line text-3xl text-gray-300 block mb-2"></i>
            <p className="text-sm text-gray-400">No emails in this category</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {visible.map((entry) => {
              const cat = CATEGORY_META[entry.category];
              const stat = STATUS_META[entry.status];
              const isExpanded = expandedId === entry.id;

              return (
                <div key={entry.id} className="py-4">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                    className="w-full text-left cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      {/* Category icon */}
                      <div className={`w-9 h-9 flex items-center justify-center rounded-xl ${cat.bg} shrink-0 mt-0.5`}>
                        <i className={`${cat.icon} text-sm ${cat.color}`}></i>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cat.bg} ${cat.color}`}>
                                {cat.label}
                              </span>
                              {entry.orderId && (
                                <span className="text-xs text-gray-400 font-mono">{entry.orderId}</span>
                              )}
                            </div>
                            <p className="text-sm font-semibold text-gray-900 truncate">{entry.subject}</p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-xs text-gray-400 whitespace-nowrap">{formatRelative(entry.sentAt)}</p>
                            <span className={`flex items-center justify-end gap-1 text-xs font-medium mt-1 ${stat.color}`}>
                              <i className={`${stat.icon} text-xs`}></i>
                              {stat.label}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Expand chevron */}
                      <div className="w-5 h-5 flex items-center justify-center shrink-0 mt-1">
                        <i className={`ri-arrow-down-s-line text-gray-400 text-base transition-transform ${isExpanded ? 'rotate-180' : ''}`}></i>
                      </div>
                    </div>
                  </button>

                  {/* Expanded preview */}
                  {isExpanded && (
                    <div className="mt-3 ml-13 pl-4 border-l-2 border-gray-100">
                      <div className="bg-gray-50 rounded-xl px-4 py-3 ml-0">
                        <p className="text-xs text-gray-500 mb-2 font-medium">
                          Sent {formatFull(entry.sentAt)}
                        </p>
                        <p className="text-sm text-gray-700 leading-relaxed">{entry.preview}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Load more / Show less */}
      {(hasMore || visibleCount > 5) && (
        <div className="px-6 pb-5 flex gap-3">
          {hasMore && (
            <button
              onClick={() => setVisibleCount((c) => c + 5)}
              className="flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
            >
              <i className="ri-arrow-down-line text-sm"></i>
              Show more ({filtered.length - visibleCount} remaining)
            </button>
          )}
          {visibleCount > 5 && (
            <button
              onClick={() => setVisibleCount(5)}
              className="flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-gray-600 transition-colors cursor-pointer ml-auto"
            >
              <i className="ri-arrow-up-line text-sm"></i>
              Collapse
            </button>
          )}
        </div>
      )}
    </div>
  );
}
