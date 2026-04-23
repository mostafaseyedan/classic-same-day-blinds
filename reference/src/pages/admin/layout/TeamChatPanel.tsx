import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../../utils/supabaseClient';

export interface ChatMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  sender_initial: string;
  avatar_color: string;
  text: string;
  reactions: Record<string, string[]>;
  created_at: string;
}

const EMOJIS = ['👍', '❤️', '😂', '🔥', '✅', '👀'];

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

function dayLabel(ts: string): string {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
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
function colorForId(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = id.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

const SEED_MESSAGES = [
  {
    sender_id: 'admin-seed-1',
    sender_name: 'Marisol',
    sender_role: 'admin',
    sender_initial: 'M',
    avatar_color: 'bg-emerald-600',
    text: 'Hey team! Just got a large hotel order in — 400 units of the 2" Faux Wood. Processing now.',
    reactions: { '🔥': ['admin-seed-2'], '👍': ['admin-seed-3'] },
  },
  {
    sender_id: 'admin-seed-2',
    sender_name: 'Eric',
    sender_role: 'admin',
    sender_initial: 'E',
    avatar_color: 'bg-sky-600',
    text: "Nice! I'll make sure inventory is updated. Do we need to restock after this one?",
    reactions: {},
  },
  {
    sender_id: 'admin-seed-3',
    sender_name: 'Holly',
    sender_role: 'super_admin',
    sender_initial: 'H',
    avatar_color: 'bg-amber-500',
    text: 'Also heads up — new Blinds.com pricing sheet just dropped. Check competitor pricing tab.',
    reactions: { '👀': ['admin-seed-1', 'admin-seed-2'] },
  },
];

async function seedIfEmpty() {
  const { count } = await supabase
    .from('team_messages')
    .select('*', { count: 'exact', head: true });
  if ((count ?? 0) === 0) {
    await supabase.from('team_messages').insert(SEED_MESSAGES);
  }
}

interface Props {
  onClose: () => void;
  onUnreadChange?: (count: number) => void;
}

export default function TeamChatPanel({ onClose, onUnreadChange }: Props) {
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [hoveredMsgId, setHoveredMsgId] = useState<string | null>(null);
  const [showEmojiFor, setShowEmojiFor] = useState<string | null>(null);
  const [adminInfo, setAdminInfo] = useState<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastReadRef = useRef<number>(Date.now());

  useEffect(() => {
    const info = getAdminInfo();
    setAdminInfo(info);
    requestAnimationFrame(() => setMounted(true));
  }, []);

  // Load messages
  const loadMessages = useCallback(async () => {
    setLoading(true);
    await seedIfEmpty();
    const { data } = await supabase
      .from('team_messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(200);
    setMessages((data ?? []) as ChatMessage[]);
    setLoading(false);
    lastReadRef.current = Date.now();
    onUnreadChange?.(0);
    localStorage.setItem('team_chat_last_read', String(Date.now()));
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'auto' }), 80);
  }, [onUnreadChange]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('team_messages_live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'team_messages' },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const msg = payload.new as ChatMessage;
            setMessages((prev) => {
              if (prev.find((m) => m.id === msg.id)) return prev;
              return [...prev, msg];
            });
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 60);
            onUnreadChange?.(0);
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as ChatMessage;
            setMessages((prev) => prev.map((m) => m.id === updated.id ? updated : m));
          } else if (payload.eventType === 'DELETE') {
            setMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [onUnreadChange]);

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

    await supabase.from('team_messages').insert({
      sender_id: adminInfo.id,
      sender_name: adminInfo.name,
      sender_role: adminInfo.role ?? 'admin',
      sender_initial: adminInfo.name.charAt(0).toUpperCase(),
      avatar_color: adminInfo.role === 'super_admin' ? 'bg-amber-500' : colorForId(adminInfo.id),
      text,
      reactions: {},
    });
  }, [input, adminInfo]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const toggleReaction = async (msgId: string, emoji: string) => {
    if (!adminInfo) return;
    const msg = messages.find((m) => m.id === msgId);
    if (!msg) return;
    const current = msg.reactions[emoji] ?? [];
    const alreadyReacted = current.includes(adminInfo.id);
    const newReactions = {
      ...msg.reactions,
      [emoji]: alreadyReacted
        ? current.filter((id) => id !== adminInfo.id)
        : [...current, adminInfo.id],
    };
    await supabase.from('team_messages').update({ reactions: newReactions }).eq('id', msgId);
    setShowEmojiFor(null);
  };

  const clearChat = async () => {
    if (!window.confirm('Clear all chat messages? This cannot be undone.')) return;
    await supabase.from('team_messages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    setMessages([]);
    await seedIfEmpty();
    loadMessages();
  };

  // Group by day
  const grouped: { dayLabel: string; msgs: ChatMessage[] }[] = [];
  let lastDay = '';
  messages.forEach((m) => {
    const dl = dayLabel(m.created_at);
    if (dl !== lastDay) { grouped.push({ dayLabel: dl, msgs: [m] }); lastDay = dl; }
    else grouped[grouped.length - 1].msgs.push(m);
  });

  const totalReactions = (m: ChatMessage) =>
    Object.values(m.reactions).reduce((s, arr) => s + arr.length, 0);

  return (
    <>
      <div
        className={`fixed inset-0 z-[60] bg-black/30 transition-opacity duration-300 ${mounted ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-slate-900 z-[70] flex flex-col transition-transform duration-300 ease-out ${mounted ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-700 rounded-xl flex items-center justify-center">
              <i className="ri-chat-3-line text-white text-base"></i>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Team Chat</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                <p className="text-[11px] text-slate-500">Live — synced across all devices</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={clearChat}
              title="Clear chat"
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-700 text-slate-500 hover:text-red-400 cursor-pointer transition-colors"
            >
              <i className="ri-delete-bin-line text-sm"></i>
            </button>
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer transition-colors"
            >
              <i className="ri-close-line text-lg"></i>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {loading ? (
            <div className="flex items-center justify-center h-full pb-16">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-slate-600 border-t-emerald-400 rounded-full animate-spin"></div>
                <p className="text-xs text-slate-500">Loading messages...</p>
              </div>
            </div>
          ) : (
            grouped.map(({ dayLabel: label, msgs }) => (
              <div key={label}>
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-slate-800"></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{label}</span>
                  <div className="flex-1 h-px bg-slate-800"></div>
                </div>

                {msgs.map((msg, i) => {
                  const isOwn = adminInfo && msg.sender_id === adminInfo.id;
                  const prev = i > 0 ? msgs[i - 1] : null;
                  const isSameGroup = prev && prev.sender_id === msg.sender_id
                    && (new Date(msg.created_at).getTime() - new Date(prev.created_at).getTime()) < 3 * 60 * 1000;
                  const hasReactions = totalReactions(msg) > 0;

                  return (
                    <div
                      key={msg.id}
                      className={`group relative flex gap-2.5 ${isOwn ? 'flex-row-reverse' : 'flex-row'} ${isSameGroup ? 'mt-0.5' : 'mt-3'}`}
                      onMouseEnter={() => setHoveredMsgId(msg.id)}
                      onMouseLeave={() => { setHoveredMsgId(null); setShowEmojiFor(null); }}
                    >
                      {!isSameGroup ? (
                        <div className={`w-8 h-8 ${msg.avatar_color} rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5`}>
                          {msg.sender_initial}
                        </div>
                      ) : <div className="w-8 shrink-0"></div>}

                      <div className={`flex flex-col gap-1 max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
                        {!isSameGroup && (
                          <div className={`flex items-center gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
                            <span className="text-[11px] font-bold text-slate-300">{msg.sender_name}</span>
                            {msg.sender_role === 'super_admin' && (
                              <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full">Owner</span>
                            )}
                            <span className="text-[10px] text-slate-600">{formatTime(msg.created_at)}</span>
                          </div>
                        )}

                        <div className="relative">
                          <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
                            isOwn ? 'bg-emerald-600 text-white rounded-tr-sm' : 'bg-slate-700 text-slate-100 rounded-tl-sm'
                          }`}>
                            {msg.text}
                          </div>

                          {hoveredMsgId === msg.id && (
                            <div className={`absolute top-0 ${isOwn ? 'left-0 -translate-x-full pr-1' : 'right-0 translate-x-full pl-1'} z-10`}>
                              <button
                                onClick={() => setShowEmojiFor(showEmojiFor === msg.id ? null : msg.id)}
                                className="w-7 h-7 flex items-center justify-center bg-slate-700 hover:bg-slate-600 rounded-full text-slate-400 hover:text-white cursor-pointer transition-colors"
                              >
                                <i className="ri-emotion-line text-sm"></i>
                              </button>
                            </div>
                          )}

                          {showEmojiFor === msg.id && (
                            <div className={`absolute top-8 ${isOwn ? 'right-0' : 'left-0'} z-20 bg-slate-800 border border-slate-700 rounded-2xl px-2 py-1.5 flex items-center gap-1`}>
                              {EMOJIS.map((emoji) => (
                                <button
                                  key={emoji}
                                  onClick={() => toggleReaction(msg.id, emoji)}
                                  className="w-8 h-8 flex items-center justify-center hover:bg-slate-700 rounded-lg text-lg cursor-pointer transition-colors"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {hasReactions && (
                          <div className={`flex flex-wrap gap-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                            {Object.entries(msg.reactions)
                              .filter(([, ids]) => ids.length > 0)
                              .map(([emoji, ids]) => (
                                <button
                                  key={emoji}
                                  onClick={() => toggleReaction(msg.id, emoji)}
                                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold cursor-pointer transition-colors border ${
                                    adminInfo && ids.includes(adminInfo.id)
                                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                                  }`}
                                >
                                  <span>{emoji}</span>
                                  <span>{ids.length}</span>
                                </button>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Who's in chat */}
        <div className="px-4 py-2 border-t border-slate-800 flex items-center gap-2">
          <div className="flex items-center -space-x-1.5">
            {['bg-amber-500','bg-emerald-600','bg-sky-600','bg-rose-500'].map((c, i) => (
              <div key={i} className={`w-5 h-5 ${c} rounded-full border-2 border-slate-900`}></div>
            ))}
          </div>
          <span className="text-[10px] text-slate-500">All admins · messages sync live</span>
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
              placeholder="Message the team..."
              rows={1}
              maxLength={1000}
              className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none resize-none leading-relaxed max-h-32 overflow-y-auto"
              style={{ minHeight: '24px' }}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = 'auto';
                el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
              }}
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
