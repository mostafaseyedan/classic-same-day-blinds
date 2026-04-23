import { useState } from 'react';
import type { Order } from '../../types';

interface Props {
  order: Order;
}

interface CommEvent {
  id: string;
  type: 'email_sent' | 'status_change' | 'note' | 'tracking' | 'label';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  color: string;
  meta?: string;
}

function getCustomerName(order: Order) {
  return `${order.customer?.firstName ?? ''} ${order.customer?.lastName ?? ''}`.trim() || '—';
}

function buildCommunicationLog(order: Order): CommEvent[] {
  const name = getCustomerName(order);
  const events: CommEvent[] = [];
  const base = new Date(order.date);

  events.push({
    id: 'order-placed',
    type: 'email_sent',
    title: 'Order confirmation email sent',
    description: `Automated confirmation sent to ${order.customer?.email ?? name}. Order details, item list, and estimated timeline included.`,
    timestamp: new Date(base.getTime() + 5 * 60000).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    icon: 'ri-mail-check-line',
    color: 'bg-emerald-500',
    meta: 'Delivered',
  });

  events.push({
    id: 'status-working',
    type: 'status_change',
    title: 'Status updated to "Working on Order"',
    description: `Order moved to production. Email notification dispatched to ${name} with expected timeline.`,
    timestamp: new Date(base.getTime() + 2 * 3600000).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    icon: 'ri-settings-3-line',
    color: 'bg-sky-500',
    meta: 'Auto-email',
  });

  if (order.status === 'Ready for Pickup' || order.status === 'Fulfilled & Shipped' || order.status === 'Delivered') {
    events.push({
      id: 'status-ready',
      type: 'email_sent',
      title: 'Fulfillment email dispatched',
      description: `${order.status === 'Ready for Pickup' ? 'Ready for Pickup notification with store address' : 'Shipping notification with carrier info and tracking number'} sent to ${order.customer?.email ?? name}.`,
      timestamp: new Date(base.getTime() + 1.5 * 86400000).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      icon: 'ri-truck-line',
      color: 'bg-teal-500',
      meta: 'Delivered',
    });
  }

  if (order.status === 'Delivered') {
    events.push({
      id: 'delivered-email',
      type: 'email_sent',
      title: 'Delivery confirmation sent',
      description: `Delivery confirmation with review request sent to ${order.customer?.email ?? name}. Customer satisfaction survey attached.`,
      timestamp: new Date(base.getTime() + 6 * 86400000).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      icon: 'ri-checkbox-circle-line',
      color: 'bg-emerald-600',
      meta: 'Delivered',
    });
  }

  if (order.trackingNumber) {
    events.push({
      id: 'tracking-added',
      type: 'tracking',
      title: 'Tracking number assigned',
      description: `Tracking number ${order.trackingNumber} linked to order. Auto-notified customer with live tracking link.`,
      timestamp: new Date(base.getTime() + 1 * 86400000).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      icon: 'ri-map-pin-line',
      color: 'bg-orange-500',
      meta: order.trackingNumber,
    });
  }

  events.push({
    id: 'label-created',
    type: 'label',
    title: 'Shipping label generated',
    description: 'Shipping label printed and attached to outbound package. Weight and dimensions verified against order specs.',
    timestamp: new Date(base.getTime() + 23 * 3600000).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    icon: 'ri-printer-line',
    color: 'bg-slate-700',
    meta: 'Printed',
  });

  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

const TYPE_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'email_sent', label: 'Emails' },
  { key: 'status_change', label: 'Status Changes' },
  { key: 'tracking', label: 'Tracking' },
  { key: 'label', label: 'Labels' },
  { key: 'note', label: 'Notes' },
];

export default function OrderCommunicationsTab({ order }: Props) {
  const [typeFilter, setTypeFilter] = useState('all');
  const [noteText, setNoteText] = useState('');
  const [localNotes, setLocalNotes] = useState<CommEvent[]>([]);
  const allEvents = [...buildCommunicationLog(order), ...localNotes];
  const filtered = typeFilter === 'all' ? allEvents : allEvents.filter((e) => e.type === typeFilter);

  const addNote = () => {
    if (!noteText.trim()) return;
    setLocalNotes((prev) => [
      {
        id: `note-${Date.now()}`,
        type: 'note',
        title: 'Internal note added',
        description: noteText.trim(),
        timestamp: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        icon: 'ri-sticky-note-line',
        color: 'bg-amber-500',
        meta: 'Note',
      },
      ...prev,
    ]);
    setNoteText('');
  };

  return (
    <div className="space-y-5">
      {/* Email Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Emails Sent', value: allEvents.filter((e) => e.type === 'email_sent').length, icon: 'ri-mail-send-line', bg: 'bg-emerald-50', color: 'text-emerald-700' },
          { label: 'Status Updates', value: allEvents.filter((e) => e.type === 'status_change').length, icon: 'ri-refresh-line', bg: 'bg-sky-50', color: 'text-sky-700' },
          { label: 'Total Events', value: allEvents.length, icon: 'ri-time-line', bg: 'bg-slate-50', color: 'text-slate-700' },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4 flex items-center gap-3`}>
            <div className={`w-9 h-9 bg-white rounded-xl flex items-center justify-center ${s.color}`}>
              <i className={`${s.icon} text-base`}></i>
            </div>
            <div>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Add Note */}
      <div className="bg-white border border-slate-100 rounded-xl p-5">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Add Internal Note</p>
        <div className="flex gap-3">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value.slice(0, 500))}
            placeholder="Log a call, internal memo, or follow-up note for this order..."
            rows={2}
            className="flex-1 text-sm border border-slate-200 focus:border-slate-400 rounded-xl px-4 py-3 outline-none text-slate-700 placeholder-slate-400 resize-none"
          />
          <button
            onClick={addNote}
            disabled={!noteText.trim()}
            className="px-5 py-3 bg-slate-900 hover:bg-slate-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-semibold rounded-xl cursor-pointer whitespace-nowrap"
          >
            <i className="ri-add-line mr-1.5"></i>Log
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        {TYPE_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setTypeFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors ${typeFilter === f.key ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {f.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-400">{filtered.length} event{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-100"></div>
        <div className="space-y-1">
          {filtered.map((event) => (
            <div key={event.id} className="flex items-start gap-4 pl-1">
              <div className={`w-10 h-10 ${event.color} rounded-xl flex items-center justify-center shrink-0 z-10 mt-1`}>
                <i className={`${event.icon} text-white text-sm`}></i>
              </div>
              <div className="flex-1 bg-white border border-slate-100 rounded-xl px-4 py-3 mb-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-slate-900">{event.title}</p>
                      {event.meta && (
                        <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-semibold">{event.meta}</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{event.description}</p>
                  </div>
                  <span className="text-xs text-slate-400 shrink-0 mt-0.5 whitespace-nowrap">{event.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-sm bg-slate-50 rounded-xl">No events for this filter</div>
          )}
        </div>
      </div>
    </div>
  );
}
