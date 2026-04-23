import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../utils/supabaseClient';

export interface AdminNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  link?: string;
  metadata: Record<string, any>;
  read_by: string[];
  created_at: string;
}

const TYPE_CONFIG: Record<string, { icon: string; bg: string; color: string }> = {
  direct_message:   { icon: 'ri-chat-1-line',            bg: 'bg-emerald-100',  color: 'text-emerald-700' },
  new_order:        { icon: 'ri-shopping-bag-3-line',     bg: 'bg-sky-100',      color: 'text-sky-700' },
  reorder:          { icon: 'ri-refresh-line',            bg: 'bg-teal-100',     color: 'text-teal-700' },
  competitor_alert: { icon: 'ri-alarm-warning-line',      bg: 'bg-red-100',      color: 'text-red-600' },
  low_stock:        { icon: 'ri-archive-line',            bg: 'bg-amber-100',    color: 'text-amber-700' },
  system:           { icon: 'ri-information-line',        bg: 'bg-slate-100',    color: 'text-slate-600' },
  team_chat:        { icon: 'ri-chat-3-line',             bg: 'bg-violet-100',   color: 'text-violet-700' },
};

function getTypeConfig(type: string) {
  return TYPE_CONFIG[type] ?? TYPE_CONFIG.system;
}

function formatTime(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  if (diff < 604_800_000) return `${Math.floor(diff / 86_400_000)}d ago`;
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getAdminId(): string | null {
  try {
    const raw = localStorage.getItem('admin_user');
    if (!raw) return null;
    return JSON.parse(raw).id;
  } catch { return null; }
}

// ─── Exported helper to push a notification ───────────────────────────────
export async function pushNotification(
  type: string,
  title: string,
  body: string,
  link?: string,
  metadata?: Record<string, any>
) {
  await supabase.from('admin_notifications').insert({
    type,
    title,
    body,
    link: link ?? null,
    metadata: metadata ?? {},
    read_by: [],
  });
}

// ─── Unread count hook (for badge in header) ──────────────────────────────
export function useUnreadNotifications(): number {
  const [count, setCount] = useState(0);
  const adminId = getAdminId();

  const fetch = useCallback(async () => {
    if (!adminId) return;
    const { count: c } = await supabase
      .from('admin_notifications')
      .select('*', { count: 'exact', head: true })
      .not('read_by', 'cs', `{"${adminId}"}`);
    setCount(c ?? 0);
  }, [adminId]);

  useEffect(() => {
    fetch();
    const channel = supabase
      .channel('notif_badge')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'admin_notifications' }, fetch)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'admin_notifications' }, fetch)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetch]);

  return count;
}

// ─── Notifications Dropdown Panel ─────────────────────────────────────────
interface Props {
  onClose: () => void;
}

export default function NotificationsPanel({ onClose }: Props) {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const adminId = getAdminId();
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('admin_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    setNotifications((data ?? []) as AdminNotification[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadNotifications();
    const channel = supabase
      .channel('notif_panel_live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'admin_notifications' }, (p) => {
        setNotifications((prev) => [p.new as AdminNotification, ...prev].slice(0, 50));
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'admin_notifications' }, (p) => {
        setNotifications((prev) => prev.map((n) => n.id === p.new.id ? p.new as AdminNotification : n));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadNotifications]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    };
    setTimeout(() => document.addEventListener('mousedown', handler), 50);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const markRead = async (notif: AdminNotification) => {
    if (!adminId || notif.read_by.includes(adminId)) return;
    const newReadBy = [...notif.read_by, adminId];
    await supabase.from('admin_notifications').update({ read_by: newReadBy }).eq('id', notif.id);
    if (notif.link) { navigate(notif.link); onClose(); }
  };

  const markAllRead = async () => {
    if (!adminId) return;
    const unread = notifications.filter((n) => !n.read_by.includes(adminId));
    for (const n of unread) {
      await supabase.from('admin_notifications').update({ read_by: [...n.read_by, adminId] }).eq('id', n.id);
    }
    loadNotifications();
  };

  const clearAll = async () => {
    if (!window.confirm('Clear all notifications?')) return;
    await supabase.from('admin_notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    setNotifications([]);
  };

  const isUnread = (n: AdminNotification) => !adminId || !n.read_by.includes(adminId);

  const displayed = filter === 'unread'
    ? notifications.filter(isUnread)
    : notifications;

  const unreadCount = notifications.filter(isUnread).length;

  return (
    <div
      ref={panelRef}
      className="absolute top-full right-0 mt-2 w-96 bg-white border border-slate-200 rounded-2xl z-[90] overflow-hidden"
      style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.12)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer whitespace-nowrap transition-colors"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={clearAll}
            className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
          >
            <i className="ri-delete-bin-line text-sm"></i>
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 px-4 pt-3 pb-1">
        {(['all', 'unread'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer whitespace-nowrap capitalize ${
              filter === f ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            {f === 'all' ? 'All' : `Unread ${unreadCount > 0 ? `(${unreadCount})` : ''}`}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="overflow-y-auto max-h-[420px]">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-slate-200 border-t-emerald-500 rounded-full animate-spin"></div>
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
              <i className="ri-notification-off-line text-slate-400 text-xl"></i>
            </div>
            <p className="text-sm text-slate-400 font-medium">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {displayed.map((notif) => {
              const cfg = getTypeConfig(notif.type);
              const unread = isUnread(notif);
              return (
                <button
                  key={notif.id}
                  onClick={() => markRead(notif)}
                  className={`w-full flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors text-left cursor-pointer ${unread ? 'bg-emerald-50/30' : ''}`}
                >
                  <div className={`w-9 h-9 ${cfg.bg} rounded-xl flex items-center justify-center shrink-0 mt-0.5`}>
                    <i className={`${cfg.icon} ${cfg.color} text-base`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-bold leading-tight ${unread ? 'text-slate-900' : 'text-slate-700'}`}>
                        {notif.title}
                      </p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">{formatTime(notif.created_at)}</span>
                        {unread && <span className="w-2 h-2 bg-emerald-500 rounded-full shrink-0"></span>}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2">{notif.body}</p>
                    {notif.link && (
                      <span className="text-[10px] font-bold text-emerald-600 mt-1 inline-flex items-center gap-1">
                        View details <i className="ri-arrow-right-line"></i>
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-100 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
          <span className="text-[10px] text-slate-400">Live — updates in real time</span>
        </div>
        <span className="text-[10px] text-slate-400">{notifications.length} total</span>
      </div>
    </div>
  );
}
