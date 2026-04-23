import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../../utils/supabaseClient';

export interface RecipientInfo {
  id: string;
  name: string;
  role: string;
  email: string;
  avatarColor?: string;
}

interface DM {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_initial: string;
  avatar_color: string;
  recipient_id: string;
  text: string;
  read: boolean;
  created_at: string;
}

function formatTime(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  const d = new Date(ts);
  const today = new Date();
  if (d.toDateString() === today.toDateString())
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function getAdminInfo() {
  try {
    const raw = localStorage.getItem('admin_user');
    if (!raw) return null;
    const user = JSON.parse(raw);
    const accounts = JSON.parse(localStorage.getItem('admin_accounts') ?? '[]');
    const acct = accounts.find((a: any) => a.id === user.id);
    return acct ?? user;
  } catch { return null; }
}

const AVATAR_COLORS = ['bg-emerald-600','bg-sky-600','bg-violet-600','bg-rose-500','bg-teal-600','bg-orange-500'];
function colorForId(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = id.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

interface Props {
  recipient: RecipientInfo;
  onClose: () => void;
}

export default function DirectMessagePanel({ recipient, onClose }: Props) {
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<DM[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [adminInfo, setAdminInfo] = useState<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const recipColor = recipient.avatarColor ?? (recipient.role === 'super_admin' ? 'bg-amber-500' : colorForId(recipient.id));

  useEffect(() => {
    const me = getAdminInfo();
    setAdminInfo(me);
    requestAnimationFrame(() => setMounted(true));
  }, []);

  const loadMessages = useCallback(async () => {
    if (!adminInfo) return;
    setLoading(true);
    const { data } = await supabase
      .from('direct_messages')
      .select('*')
      .or(
        `and(sender_id.eq.${adminInfo.id},recipient_id.eq.${recipient.id}),and(sender_id.eq.${recipient.id},recipient_id.eq.${adminInfo.id})`
      )
      .order('created_at', { ascending: true })
      .limit(300);
    setMessages((data ?? []) as DM[]);
    setLoading(false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'auto' }), 80);

    // Mark incoming messages as read
    const unreadIds = (data ?? [])
      .filter((m: any) => m.sender_id === recipient.id && !m.read)
      .map((m: any) => m.id);
    if (unreadIds.length > 0) {
      await supabase.from('direct_messages').update({ read: true }).in('id', unreadIds);
    }
  }, [adminInfo, recipient.id]);

  useEffect(() => {
    if (adminInfo) loadMessages();
  }, [adminInfo, loadMessages]);

  // Realtime subscription
  useEffect(() => {
    if (!adminInfo) return;
    const channel = supabase
      .channel(`dm_${[adminInfo.id, recipient.id].sort().join('_')}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'direct_messages' },
        (payload) => {
          const msg = payload.new as DM;
          const isRelevant =
            (msg.sender_id === adminInfo.id && msg.recipient_id === recipient.id) ||
            (msg.sender_id === recipient.id && msg.recipient_id === adminInfo.id);
          if (!isRelevant) return;
          setMessages((prev) => {
            if (prev.find((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 60);
          // Mark as read if from recipient
          if (msg.sender_id === recipient.id) {
            supabase.from('direct_messages').update({ read: true }).eq('id', msg.id);
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [adminInfo, recipient.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleClose = () => {
    setMounted(false);
    setTimeout(onClose, 280);
  };

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || !adminInfo) return;
    setInput('');

    await supabase.from('direct_messages').insert({
      sender_id: adminInfo.id,
      sender_name: adminInfo.name,
      sender_initial: adminInfo.name.charAt(0).toUpperCase(),
      avatar_color: adminInfo.role === 'super_admin' ? 'bg-amber-500' : colorForId(adminInfo.id),
      recipient_id: recipient.id,
      text,
      read: false,
    });

    // Also push a notification to the recipient
    await supabase.from('admin_notifications').insert({
      type: 'direct_message',
      title: `Message from ${adminInfo.name}`,
      body: text.length > 80 ? text.slice(0, 80) + '...' : text,
      link: '/admin/settings',
      metadata: { sender_id: adminInfo.id, sender_name: adminInfo.name },
      read_by: [],
    });
  }, [input, adminInfo, recipient.id, recipient]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const isOnline = (role: string) => role === 'super_admin';
  const roleLabel = recipient.role === 'super_admin' ? 'Super Admin' : 'Admin';

  return (
    <>
      <div
        className={`fixed inset-0 z-[75] bg-black/20 transition-opacity duration-300 ${mounted ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />
      <div
        className={`fixed top-0 right-0 h-full w-[380px] bg-slate-900 z-[80] flex flex-col shadow-2xl transition-transform duration-300 ease-out ${mounted ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800">
          <div className="relative shrink-0">
            <div className={`w-10 h-10 ${recipColor} rounded-full flex items-center justify-center text-white font-bold text-base`}>
              {recipient.name.charAt(0)}
            </div>
            {isOnline(recipient.role) && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900"></span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-white truncate">{recipient.name}</p>
              {recipient.role === 'super_admin' && (
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full whitespace-nowrap">Owner</span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 truncate">{recipient.email} · {roleLabel}</p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer transition-colors shrink-0"
          >
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-full pb-16">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-slate-600 border-t-emerald-400 rounded-full animate-spin"></div>
                <p className="text-xs text-slate-500">Loading messages...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 pb-16">
              <div className={`w-16 h-16 ${recipColor} rounded-full flex items-center justify-center text-white text-2xl font-bold`}>
                {recipient.name.charAt(0)}
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-slate-300">{recipient.name}</p>
                <p className="text-xs text-slate-500 mt-1">{recipient.email}</p>
                <p className="text-xs text-slate-600 mt-3">This is the start of your direct message history with {recipient.name}.</p>
              </div>
              <div className="flex flex-col items-center gap-2 w-full max-w-[220px]">
                {[
                  `Hi ${recipient.name.split(' ')[0]}! 👋`,
                  'Can you check the latest orders?',
                  'Quick question about the system',
                ].map((s) => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    className="w-full text-left px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-400 hover:text-slate-200 rounded-xl cursor-pointer transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isOwn = adminInfo && msg.sender_id === adminInfo.id;
              const prev = i > 0 ? messages[i - 1] : null;
              const grouped = prev && prev.sender_id === msg.sender_id
                && (new Date(msg.created_at).getTime() - new Date(prev.created_at).getTime()) < 3 * 60 * 1000;

              return (
                <div key={msg.id} className={`flex gap-2.5 ${isOwn ? 'flex-row-reverse' : ''} ${grouped ? 'mt-0.5' : 'mt-3'}`}>
                  {!grouped ? (
                    <div className={`w-8 h-8 ${msg.avatar_color} rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5`}>
                      {msg.sender_initial}
                    </div>
                  ) : <div className="w-8 shrink-0"></div>}
                  <div className={`max-w-[75%] flex flex-col gap-1 ${isOwn ? 'items-end' : 'items-start'}`}>
                    {!grouped && (
                      <div className={`flex items-center gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
                        <span className="text-[11px] font-bold text-slate-300">{msg.sender_name}</span>
                        <span className="text-[10px] text-slate-600">{formatTime(msg.created_at)}</span>
                      </div>
                    )}
                    <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
                      isOwn ? 'bg-emerald-600 text-white rounded-tr-sm' : 'bg-slate-700 text-slate-100 rounded-tl-sm'
                    }`}>
                      {msg.text}
                    </div>
                    {isOwn && i === messages.length - 1 && (
                      <span className={`text-[10px] flex items-center gap-1 ${msg.read ? 'text-emerald-400' : 'text-slate-600'}`}>
                        <i className={msg.read ? 'ri-check-double-line' : 'ri-check-line'}></i>
                        {msg.read ? 'Read' : 'Delivered'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Status bar */}
        <div className="px-5 py-2 border-t border-slate-800 flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-[11px] text-slate-500">Messages sync live across devices</span>
        </div>

        {/* Input */}
        <div className="px-4 pb-5 pt-2 border-t border-slate-800">
          <div className="flex items-end gap-2 bg-slate-800 border border-slate-700 rounded-2xl px-3 py-2 focus-within:border-slate-500 transition-colors">
            {adminInfo && (
              <div className={`w-7 h-7 ${adminInfo.role === 'super_admin' ? 'bg-amber-500' : colorForId(adminInfo.id)} rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mb-0.5`}>
                {adminInfo.name.charAt(0).toUpperCase()}
              </div>
            )}
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${recipient.name.split(' ')[0]}...`}
              rows={1}
              maxLength={1000}
              className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none resize-none leading-relaxed max-h-32 overflow-y-auto"
              style={{ minHeight: '24px' }}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = 'auto';
                el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
              }}
              autoFocus
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="w-8 h-8 flex items-center justify-center bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl cursor-pointer disabled:cursor-not-allowed transition-colors shrink-0 mb-0.5"
            >
              <i className="ri-send-plane-fill text-sm"></i>
            </button>
          </div>
          <p className="text-[10px] text-slate-600 mt-1.5 text-center">Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </>
  );
}
