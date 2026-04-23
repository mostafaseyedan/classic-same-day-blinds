import { useState, useCallback } from 'react';
import type { EntityType, EmailRecord } from '../utils/emailStorage';
import { loadEmailsForEntity, deleteEmail, markEmailRead } from '../utils/emailStorage';
import ComposeEmailModal from './ComposeEmailModal';

interface Props {
  entityType: EntityType;
  entityId: string;
  entityName: string;
  entityEmail: string;
}

type FilterType = 'all' | 'outbound' | 'inbound';

function timeLabel(ts: string): string {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 7 * 86400) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function fullDateLabel(ts: string): string {
  return new Date(ts).toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function EmailListItem({ email, selected, onClick }: { email: EmailRecord; selected: boolean; onClick: () => void }) {
  const isUnread = email.direction === 'inbound' && !email.readAt;
  const preview = email.body.replace(/\n/g, ' ').slice(0, 100);

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-4 border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer ${selected ? 'bg-slate-50 border-l-2 border-l-slate-900' : ''}`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
          email.direction === 'outbound' ? 'bg-sky-100' : 'bg-emerald-100'
        }`}>
          <i className={`text-sm ${email.direction === 'outbound' ? 'ri-arrow-up-line text-sky-600' : 'ri-arrow-down-line text-emerald-600'}`}></i>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <p className={`text-sm truncate ${isUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
              {email.subject}
            </p>
            <span className="text-xs text-slate-400 shrink-0">{timeLabel(email.sentAt)}</span>
          </div>
          <p className="text-xs text-slate-500 truncate leading-relaxed">{preview}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
              email.direction === 'outbound' ? 'bg-sky-50 text-sky-600' : 'bg-emerald-50 text-emerald-600'
            }`}>
              {email.direction === 'outbound' ? 'Sent' : 'Received'}
            </span>
            {isUnread && (
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

export default function EmailsTab({ entityType, entityId, entityName, entityEmail }: Props) {
  const [tick, setTick] = useState(0);
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const refresh = useCallback(() => setTick((t) => t + 1), []);
  void tick;

  const allEmails = loadEmailsForEntity(entityType, entityId, entityName, entityEmail);

  const filtered = allEmails.filter((e) => {
    const matchDir = filter === 'all' || e.direction === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || e.subject.toLowerCase().includes(q) || e.body.toLowerCase().includes(q);
    return matchDir && matchSearch;
  });

  const selected = filtered.find((e) => e.id === selectedId) ?? filtered[0] ?? null;
  const unreadCount = allEmails.filter((e) => e.direction === 'inbound' && !e.readAt).length;

  const handleSelect = (email: EmailRecord) => {
    setSelectedId(email.id);
    if (email.direction === 'inbound' && !email.readAt) {
      markEmailRead(email.id);
      refresh();
    }
  };

  const handleDelete = (id: string) => {
    deleteEmail(id);
    if (selectedId === id) setSelectedId(null);
    setDeleteConfirmId(null);
    refresh();
  };

  const stats = {
    total: allEmails.length,
    outbound: allEmails.filter((e) => e.direction === 'outbound').length,
    inbound: allEmails.filter((e) => e.direction === 'inbound').length,
  };

  return (
    <div className="h-full flex flex-col">
      {/* Compose Modal */}
      {showCompose && (
        <ComposeEmailModal
          entityType={entityType}
          entityId={entityId}
          entityName={entityName}
          entityEmail={entityEmail}
          onClose={() => setShowCompose(false)}
          onSent={() => { refresh(); setShowCompose(false); }}
        />
      )}

      {/* Delete Confirm */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4" onClick={() => setDeleteConfirmId(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-7" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-delete-bin-line text-red-500 text-xl"></i>
            </div>
            <h3 className="text-base font-bold text-slate-900 text-center mb-1.5">Delete this email?</h3>
            <p className="text-sm text-slate-500 text-center mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer whitespace-nowrap">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirmId)} className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg cursor-pointer whitespace-nowrap">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Stats + Actions bar */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5">
            <div className="w-5 h-5 flex items-center justify-center text-slate-500">
              <i className="ri-mail-line text-sm"></i>
            </div>
            <span className="text-sm font-bold text-slate-900">{stats.total}</span>
            <span className="text-xs text-slate-500">Total emails</span>
          </div>
          <div className="flex items-center gap-2 bg-sky-50 border border-sky-200 rounded-xl px-4 py-2.5">
            <div className="w-5 h-5 flex items-center justify-center text-sky-500">
              <i className="ri-arrow-up-line text-sm"></i>
            </div>
            <span className="text-sm font-bold text-sky-700">{stats.outbound}</span>
            <span className="text-xs text-sky-600">Sent</span>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">
            <div className="w-5 h-5 flex items-center justify-center text-emerald-500">
              <i className="ri-arrow-down-line text-sm"></i>
            </div>
            <span className="text-sm font-bold text-emerald-700">{stats.inbound}</span>
            <span className="text-xs text-emerald-600">Received</span>
            {unreadCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-emerald-500 text-white text-xs font-bold rounded-full">{unreadCount}</span>
            )}
          </div>
        </div>

        <button
          onClick={() => setShowCompose(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold rounded-xl cursor-pointer whitespace-nowrap transition-colors"
        >
          <i className="ri-edit-box-line"></i>
          Compose Email
        </button>
      </div>

      {/* Main split panel */}
      <div className="flex-1 bg-white border border-slate-200 rounded-2xl overflow-hidden flex min-h-0" style={{ minHeight: 520 }}>
        {/* Left: Email list */}
        <div className="w-80 border-r border-slate-100 flex flex-col shrink-0">
          {/* Search + filter */}
          <div className="p-3 border-b border-slate-100 space-y-2">
            <div className="relative">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search emails..."
                className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-slate-400 text-slate-700 placeholder-slate-400"
              />
            </div>
            <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
              {([
                { key: 'all', label: 'All' },
                { key: 'outbound', label: 'Sent' },
                { key: 'inbound', label: 'Received' },
              ] as const).map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md cursor-pointer whitespace-nowrap transition-colors ${filter === f.key ? 'bg-white text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Email list */}
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-10 px-4 text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                  <i className="ri-mail-line text-slate-400 text-xl"></i>
                </div>
                <p className="text-sm font-semibold text-slate-500">No emails found</p>
                <p className="text-xs text-slate-400 mt-1">Try adjusting the filter or compose a new email</p>
              </div>
            ) : (
              filtered.map((email) => (
                <EmailListItem
                  key={email.id}
                  email={email}
                  selected={selected?.id === email.id}
                  onClick={() => handleSelect(email)}
                />
              ))
            )}
          </div>
        </div>

        {/* Right: Email detail */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selected ? (
            <>
              {/* Email header */}
              <div className="px-7 py-5 border-b border-slate-100">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h2 className="text-lg font-bold text-slate-900 leading-tight">{selected.subject}</h2>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setShowCompose(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer whitespace-nowrap transition-colors"
                    >
                      <i className="ri-reply-line text-sm"></i> Reply
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(selected.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-100 text-slate-400 hover:text-red-500 cursor-pointer transition-colors"
                    >
                      <i className="ri-delete-bin-line text-sm"></i>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${selected.direction === 'outbound' ? 'bg-sky-100' : 'bg-emerald-100'}`}>
                      <i className={`text-xs ${selected.direction === 'outbound' ? 'ri-arrow-up-line text-sky-600' : 'ri-arrow-down-line text-emerald-600'}`}></i>
                    </div>
                    <span className="font-semibold text-slate-700">
                      {selected.direction === 'outbound' ? `To: ${entityName}` : `From: ${entityName}`}
                    </span>
                  </div>
                  <span className="text-slate-300">·</span>
                  <span>{entityEmail}</span>
                  <span className="text-slate-300">·</span>
                  <span>{fullDateLabel(selected.sentAt)}</span>
                  {selected.direction === 'inbound' && selected.readAt && (
                    <>
                      <span className="text-slate-300">·</span>
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <i className="ri-eye-line text-xs"></i> Read
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Email body */}
              <div className="flex-1 overflow-y-auto px-7 py-6">
                <div className="max-w-2xl">
                  <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-['Inter',_sans-serif]">
                    {selected.body}
                  </div>
                </div>
              </div>

              {/* Email footer */}
              <div className="px-7 py-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold capitalize ${
                    selected.entityType === 'customer' ? 'bg-sky-100 text-sky-700' :
                    selected.entityType === 'company' ? 'bg-teal-100 text-teal-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>{selected.entityType}</span>
                  {selected.template && selected.template !== 'blank' && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 font-medium capitalize">{selected.template} template</span>
                  )}
                </div>
                <button
                  onClick={() => setShowCompose(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold rounded-lg cursor-pointer whitespace-nowrap transition-colors"
                >
                  <i className="ri-mail-send-line text-sm"></i>
                  Send Follow-Up
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                <i className="ri-mail-open-line text-slate-400 text-2xl"></i>
              </div>
              <p className="text-base font-bold text-slate-600 mb-1">Select an email to read</p>
              <p className="text-sm text-slate-400 max-w-xs">Choose an email from the list on the left, or compose a new message to {entityName}.</p>
              <button
                onClick={() => setShowCompose(true)}
                className="mt-5 flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold rounded-xl cursor-pointer whitespace-nowrap transition-colors"
              >
                <i className="ri-edit-box-line"></i>
                Compose Email
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
