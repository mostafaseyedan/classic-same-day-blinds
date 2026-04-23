import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../../utils/supabaseClient';

interface GroupMessage {
  id: string;
  group_id: string;
  sender_id: string;
  sender_name: string;
  sender_initial: string;
  avatar_color: string;
  text: string;
  reactions: Record<string, string[]>;
  created_at: string;
}

interface ChatGroup {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  created_by: string;
  member_ids: string[];
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

const AVATAR_COLORS = ['bg-emerald-600', 'bg-sky-600', 'bg-violet-600', 'bg-rose-500', 'bg-teal-600', 'bg-orange-500'];
function colorForId(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = id.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

interface Props {
  group: ChatGroup;
}

export default function GroupChatArea({ group }: Props) {
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [hoveredMsgId, setHoveredMsgId] = useState<string | null>(null);
  const [showEmojiFor, setShowEmojiFor] = useState<string | null>(null);
  const [adminInfo] = useState(() => getAdminInfo());
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('group_messages')
      .select('*')
      .eq('group_id', group.id)
      .order('created_at', { ascending: true })
      .limit(200);
    setMessages((data ?? []) as GroupMessage[]);
    setLoading(false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'auto' }), 60);
  }, [group.id]);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  useEffect(() => {
    const channel = supabase
      .channel(`group_${group.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'group_messages', filter: `group_id=eq.${group.id}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMessages((prev) => {
              if (prev.find((m) => m.id === payload.new.id)) return prev;
              return [...prev, payload.new as GroupMessage];
            });
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 60);
          } else if (payload.eventType === 'UPDATE') {
            setMessages((prev) => prev.map((m) => m.id === payload.new.id ? payload.new as GroupMessage : m));
          }
        }
      ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [group.id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || !adminInfo) return;
    setInput('');
    await supabase.from('group_messages').insert({
      group_id: group.id,
      sender_id: adminInfo.id,
      sender_name: adminInfo.name,
      sender_initial: adminInfo.name.charAt(0).toUpperCase(),
      avatar_color: adminInfo.role === 'super_admin' ? 'bg-amber-500' : colorForId(adminInfo.id),
      text,
      reactions: {},
    });
  }, [input, adminInfo, group.id]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const toggleReaction = async (msgId: string, emoji: string) => {
    if (!adminInfo) return;
    const msg = messages.find((m) => m.id === msgId);
    if (!msg) return;
    const current = msg.reactions[emoji] ?? [];
    const already = current.includes(adminInfo.id);
    const newReactions = { ...msg.reactions, [emoji]: already ? current.filter((id) => id !== adminInfo.id) : [...current, adminInfo.id] };
    await supabase.from('group_messages').update({ reactions: newReactions }).eq('id', msgId);
    setShowEmojiFor(null);
  };

  // Group messages by day
  const grouped: { label: string; msgs: GroupMessage[] }[] = [];
  let lastDay = '';
  messages.forEach((m) => {
    const dl = dayLabel(m.created_at);
    if (dl !== lastDay) { grouped.push({ label: dl, msgs: [m] }); lastDay = dl; }
    else grouped[grouped.length - 1].msgs.push(m);
  });

  return (
    <div className="flex flex-col h-full">
      {/* Channel header */}
      <div className="px-5 py-3.5 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 ${group.color} rounded-lg flex items-center justify-center shrink-0`}>
            <i className={`${group.icon} text-white text-sm`}></i>
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">{group.name}</p>
            {group.description && <p className="text-[11px] text-slate-500 leading-tight">{group.description}</p>}
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] text-slate-500">{group.member_ids.length} members</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-0.5">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-slate-600 border-t-emerald-400 rounded-full animate-spin"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 pb-8">
            <div className={`w-14 h-14 ${group.color} rounded-2xl flex items-center justify-center`}>
              <i className={`${group.icon} text-white text-2xl`}></i>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-slate-300">{group.name}</p>
              <p className="text-xs text-slate-500 mt-1">{group.description || 'Start a conversation in this group.'}</p>
            </div>
          </div>
        ) : (
          grouped.map(({ label, msgs }) => (
            <div key={label}>
              <div className="flex items-center gap-3 my-3">
                <div className="flex-1 h-px bg-slate-800"></div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{label}</span>
                <div className="flex-1 h-px bg-slate-800"></div>
              </div>
              {msgs.map((msg, i) => {
                const isOwn = adminInfo && msg.sender_id === adminInfo.id;
                const prev = i > 0 ? msgs[i - 1] : null;
                const grouped = prev && prev.sender_id === msg.sender_id
                  && (new Date(msg.created_at).getTime() - new Date(prev.created_at).getTime()) < 3 * 60 * 1000;
                const totalReactions = Object.values(msg.reactions).reduce((s, a) => s + a.length, 0);

                return (
                  <div
                    key={msg.id}
                    className={`group flex gap-2.5 ${isOwn ? 'flex-row-reverse' : ''} ${grouped ? 'mt-0.5' : 'mt-3'}`}
                    onMouseEnter={() => setHoveredMsgId(msg.id)}
                    onMouseLeave={() => { setHoveredMsgId(null); setShowEmojiFor(null); }}
                  >
                    {!grouped ? (
                      <div className={`w-7 h-7 ${msg.avatar_color} rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5`}>
                        {msg.sender_initial}
                      </div>
                    ) : <div className="w-7 shrink-0"></div>}

                    <div className={`flex flex-col max-w-[80%] ${isOwn ? 'items-end' : 'items-start'}`}>
                      {!grouped && (
                        <div className={`flex items-center gap-2 mb-0.5 ${isOwn ? 'flex-row-reverse' : ''}`}>
                          <span className="text-[11px] font-bold text-slate-300">{msg.sender_name}</span>
                          <span className="text-[10px] text-slate-600">{formatTime(msg.created_at)}</span>
                        </div>
                      )}
                      <div className="relative">
                        <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed break-words ${isOwn ? 'bg-emerald-600 text-white rounded-tr-sm' : 'bg-slate-700 text-slate-100 rounded-tl-sm'}`}>
                          {msg.text}
                        </div>
                        {hoveredMsgId === msg.id && (
                          <div className={`absolute top-0 ${isOwn ? 'left-0 -translate-x-full pr-1' : 'right-0 translate-x-full pl-1'} z-10`}>
                            <button onClick={() => setShowEmojiFor(showEmojiFor === msg.id ? null : msg.id)}
                              className="w-6 h-6 flex items-center justify-center bg-slate-700 hover:bg-slate-600 rounded-full text-slate-400 hover:text-white cursor-pointer transition-colors">
                              <i className="ri-emotion-line text-xs"></i>
                            </button>
                          </div>
                        )}
                        {showEmojiFor === msg.id && (
                          <div className={`absolute top-7 ${isOwn ? 'right-0' : 'left-0'} z-20 bg-slate-800 border border-slate-700 rounded-2xl px-2 py-1.5 flex items-center gap-1`}>
                            {EMOJIS.map((emoji) => (
                              <button key={emoji} onClick={() => toggleReaction(msg.id, emoji)}
                                className="w-7 h-7 flex items-center justify-center hover:bg-slate-700 rounded-lg text-base cursor-pointer">{emoji}</button>
                            ))}
                          </div>
                        )}
                      </div>
                      {totalReactions > 0 && (
                        <div className={`flex flex-wrap gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          {Object.entries(msg.reactions).filter(([, ids]) => ids.length > 0).map(([emoji, ids]) => (
                            <button key={emoji} onClick={() => toggleReaction(msg.id, emoji)}
                              className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-bold cursor-pointer border ${adminInfo && ids.includes(adminInfo.id) ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                              <span>{emoji}</span><span>{ids.length}</span>
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

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-slate-800 shrink-0">
        <div className="flex items-end gap-2 bg-slate-800 border border-slate-700 rounded-2xl px-3 py-2 focus-within:border-slate-500 transition-colors">
          {adminInfo && (
            <div className={`w-6 h-6 ${adminInfo.role === 'super_admin' ? 'bg-amber-500' : colorForId(adminInfo.id)} rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 mb-0.5`}>
              {adminInfo.name.charAt(0).toUpperCase()}
            </div>
          )}
          <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
            placeholder={`Message #${group.name}...`} rows={1} maxLength={1000}
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none resize-none leading-relaxed max-h-28 overflow-y-auto"
            style={{ minHeight: '22px' }}
            onInput={(e) => { const el = e.currentTarget; el.style.height = 'auto'; el.style.height = `${Math.min(el.scrollHeight, 112)}px`; }}
          />
          <button onClick={sendMessage} disabled={!input.trim()}
            className="w-7 h-7 flex items-center justify-center bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl cursor-pointer disabled:cursor-not-allowed transition-colors shrink-0 mb-0.5">
            <i className="ri-send-plane-fill text-xs"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
