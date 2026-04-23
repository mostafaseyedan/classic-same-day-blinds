import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import GroupChatArea from './GroupChatArea';
import TeamChatPanel from './TeamChatPanel';
import DirectMessagePanel, { type RecipientInfo } from './DirectMessagePanel';

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

interface AdminMember {
  id: string;
  name: string;
  role: string;
  email: string;
  avatarColor?: string;
}

const GROUP_ICONS = ['ri-group-line','ri-shopping-bag-3-line','ri-store-2-line','ri-building-2-line','ri-truck-line','ri-star-line','ri-shield-line','ri-code-line','ri-megaphone-line','ri-lightbulb-line'];
const GROUP_COLORS = ['bg-emerald-500','bg-teal-500','bg-sky-500','bg-violet-500','bg-rose-500','bg-orange-500','bg-amber-500','bg-slate-500'];

function getAdminInfo(): AdminMember | null {
  try {
    const raw = localStorage.getItem('admin_user');
    if (!raw) return null;
    const user = JSON.parse(raw);
    const accounts = JSON.parse(localStorage.getItem('admin_accounts') ?? '[]');
    const acct = accounts.find((a: any) => a.id === user.id);
    return acct ?? user;
  } catch { return null; }
}

function getAdminAccounts(): AdminMember[] {
  try {
    return JSON.parse(localStorage.getItem('admin_accounts') ?? '[]');
  } catch { return []; }
}

const AVATAR_COLORS = ['bg-emerald-600','bg-sky-600','bg-violet-600','bg-rose-500','bg-teal-600','bg-orange-500'];
function colorForId(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = id.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

// ── Create Group Modal ──────────────────────────────────────────────────────
interface CreateGroupModalProps {
  members: AdminMember[];
  onClose: () => void;
  onCreate: (group: Omit<ChatGroup, 'id' | 'created_at'>) => void;
  adminInfo: AdminMember | null;
}

function CreateGroupModal({ members, onClose, onCreate, adminInfo }: CreateGroupModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState(GROUP_ICONS[0]);
  const [color, setColor] = useState(GROUP_COLORS[0]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>(adminInfo ? [adminInfo.id] : []);

  const toggleMember = (id: string) => {
    if (id === adminInfo?.id) return; // can't deselect yourself
    setSelectedMembers((prev) => prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate({
      name: name.trim(),
      description: description.trim(),
      icon,
      color,
      created_by: adminInfo?.id ?? 'system',
      member_ids: selectedMembers,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[95] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white">Create Group</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Set up a new messaging channel</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-700 text-slate-400 cursor-pointer">
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Preview */}
          <div className="flex items-center gap-3 bg-slate-800 rounded-xl p-3">
            <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center shrink-0`}>
              <i className={`${icon} text-white text-lg`}></i>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">{name || 'Group name'}</p>
              <p className="text-[11px] text-slate-500 truncate">{description || 'Description...'}</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Group Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Operations, Sales, Dev Team..."
              required maxLength={40}
              className="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Description</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's this group for?"
              maxLength={100}
              className="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors" />
          </div>

          {/* Icon picker */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Icon</label>
            <div className="flex flex-wrap gap-2">
              {GROUP_ICONS.map((ic) => (
                <button key={ic} type="button" onClick={() => setIcon(ic)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-base transition-colors cursor-pointer ${icon === ic ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                  <i className={ic}></i>
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Color</label>
            <div className="flex flex-wrap gap-2">
              {GROUP_COLORS.map((c) => (
                <button key={c} type="button" onClick={() => setColor(c)}
                  className={`w-7 h-7 ${c} rounded-full cursor-pointer transition-transform ${color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'hover:scale-110'}`}></button>
              ))}
            </div>
          </div>

          {/* Member selection */}
          {members.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Members</label>
              <div className="space-y-1 max-h-36 overflow-y-auto">
                {members.map((m) => {
                  const isMe = m.id === adminInfo?.id;
                  const isSelected = selectedMembers.includes(m.id);
                  const bg = m.role === 'super_admin' ? 'bg-amber-500' : colorForId(m.id);
                  return (
                    <div key={m.id} onClick={() => toggleMember(m.id)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition-colors ${isSelected ? 'bg-emerald-500/15 border border-emerald-500/30' : 'bg-slate-800 border border-transparent hover:border-slate-600'}`}>
                      <div className={`w-6 h-6 ${bg} rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>
                        {m.name.charAt(0)}
                      </div>
                      <span className="text-sm text-slate-200 flex-1">{m.name}</span>
                      {isMe && <span className="text-[10px] text-slate-500">You</span>}
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'}`}>
                        {isSelected && <i className="ri-check-line text-white text-[10px]"></i>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 text-sm font-semibold text-slate-400 bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer transition-colors">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl cursor-pointer transition-colors">
              <i className="ri-add-line"></i> Create Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main MessagingHub ───────────────────────────────────────────────────────
type ConvType = 'team' | 'group' | 'dm';

interface Props {
  onClose: () => void;
  onUnreadChange?: (count: number) => void;
}

export default function MessagingHub({ onClose, onUnreadChange }: Props) {
  const [mounted, setMounted] = useState(false);
  const [groups, setGroups] = useState<ChatGroup[]>([]);
  const [dmMembers, setDmMembers] = useState<AdminMember[]>([]);
  const [selected, setSelected] = useState<{ type: ConvType; id?: string }>({ type: 'team' });
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showTeamChatInline, setShowTeamChatInline] = useState(false);
  const [showDmPanel, setShowDmPanel] = useState(false);
  const [dmRecipient, setDmRecipient] = useState<RecipientInfo | null>(null);
  const adminInfo = getAdminInfo();

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
    loadGroups();
    const accounts = getAdminAccounts();
    setDmMembers(accounts.filter((a) => a.id !== adminInfo?.id));
  }, []);

  const loadGroups = async () => {
    const { data } = await supabase.from('chat_groups').select('*').order('created_at', { ascending: true });
    setGroups((data ?? []) as ChatGroup[]);
  };

  useEffect(() => {
    const channel = supabase.channel('chat_groups_live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_groups' }, loadGroups)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleCreateGroup = async (groupData: Omit<ChatGroup, 'id' | 'created_at'>) => {
    await supabase.from('chat_groups').insert(groupData);
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!window.confirm('Delete this group? All messages will be lost.')) return;
    await supabase.from('chat_groups').delete().eq('id', groupId);
    if (selected.id === groupId) setSelected({ type: 'team' });
  };

  const handleClose = () => {
    setMounted(false);
    setTimeout(onClose, 280);
  };

  const selectedGroup = groups.find((g) => g.id === selected.id);

  const isSuperAdmin = adminInfo?.role === 'super_admin';

  return (
    <>
      <div className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 ${mounted ? 'opacity-100' : 'opacity-0'}`} onClick={handleClose} />
      <div className={`fixed top-0 right-0 h-full w-[760px] bg-slate-900 z-[70] flex flex-col transition-transform duration-300 ease-out ${mounted ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-600 rounded-xl flex items-center justify-center">
              <i className="ri-chat-smile-2-line text-white text-sm"></i>
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Messaging</h2>
              <p className="text-[11px] text-slate-500">Team chat · groups · direct messages</p>
            </div>
          </div>
          <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer transition-colors">
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>

        {/* ── Body: sidebar + chat ─────────────────────────────────────── */}
        <div className="flex-1 flex min-h-0">

          {/* Sidebar */}
          <div className="w-52 shrink-0 border-r border-slate-800 flex flex-col overflow-y-auto">

            {/* Team Chat */}
            <div className="px-3 pt-4 pb-2">
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider px-2 mb-1.5">Channels</p>
              <button
                onClick={() => { setSelected({ type: 'team' }); setShowDmPanel(false); }}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors cursor-pointer ${selected.type === 'team' ? 'bg-emerald-500/15 text-emerald-400' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
              >
                <div className="w-5 h-5 flex items-center justify-center shrink-0"><i className="ri-hashtag text-base"></i></div>
                <span className="font-medium text-sm">team-all</span>
              </button>
            </div>

            {/* Groups */}
            <div className="px-3 pt-2 pb-2 flex-1">
              <div className="flex items-center justify-between px-2 mb-1.5">
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Groups</p>
                <button onClick={() => setShowCreateGroup(true)}
                  className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-emerald-400 cursor-pointer transition-colors rounded">
                  <i className="ri-add-line text-sm"></i>
                </button>
              </div>
              <div className="space-y-0.5">
                {groups.map((group) => (
                  <div key={group.id} className="relative group/item">
                    <button
                      onClick={() => { setSelected({ type: 'group', id: group.id }); setShowDmPanel(false); }}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors cursor-pointer ${selected.id === group.id ? 'bg-emerald-500/15 text-emerald-400' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
                    >
                      <div className={`w-5 h-5 ${group.color} rounded flex items-center justify-center shrink-0`}>
                        <i className={`${group.icon} text-white text-[10px]`}></i>
                      </div>
                      <span className="font-medium text-sm truncate flex-1 text-left">{group.name}</span>
                    </button>
                    {isSuperAdmin && (
                      <button onClick={() => handleDeleteGroup(group.id)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-slate-600 hover:text-red-400 opacity-0 group-hover/item:opacity-100 cursor-pointer transition-all rounded">
                        <i className="ri-delete-bin-line text-xs"></i>
                      </button>
                    )}
                  </div>
                ))}
                {groups.length === 0 && (
                  <p className="text-[11px] text-slate-600 px-2 py-2">No groups yet. Create one!</p>
                )}
              </div>
            </div>

            {/* Direct Messages */}
            <div className="px-3 pt-2 pb-4 border-t border-slate-800">
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider px-2 mb-1.5">Direct Messages</p>
              <div className="space-y-0.5">
                {dmMembers.map((member, idx) => {
                  const bg = member.role === 'super_admin' ? 'bg-amber-500' : colorForId(member.id);
                  const isActive = selected.type === 'dm' && selected.id === member.id;
                  return (
                    <button
                      key={member.id}
                      onClick={() => {
                        setSelected({ type: 'dm', id: member.id });
                        setDmRecipient({ id: member.id, name: member.name, role: member.role, email: member.email, avatarColor: bg });
                        setShowDmPanel(true);
                      }}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors cursor-pointer ${isActive ? 'bg-emerald-500/15 text-emerald-400' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
                    >
                      <div className={`w-5 h-5 ${bg} rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0`}>
                        {member.name.charAt(0)}
                      </div>
                      <span className="font-medium text-sm truncate">{member.name}</span>
                    </button>
                  );
                })}
                {dmMembers.length === 0 && (
                  <p className="text-[11px] text-slate-600 px-2 py-2">No other team members.</p>
                )}
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col min-w-0 min-h-0">
            {selected.type === 'team' && (
              <TeamChatPanelInline onUnreadChange={onUnreadChange} />
            )}
            {selected.type === 'group' && selectedGroup && (
              <GroupChatArea group={selectedGroup} />
            )}
            {selected.type === 'dm' && dmRecipient && (
              <DirectMessageInline recipient={dmRecipient} />
            )}
            {selected.type === 'group' && !selectedGroup && (
              <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                Select a group to start messaging
              </div>
            )}
          </div>
        </div>
      </div>

      {showCreateGroup && (
        <CreateGroupModal
          members={[adminInfo!, ...dmMembers].filter(Boolean)}
          onClose={() => setShowCreateGroup(false)}
          onCreate={handleCreateGroup}
          adminInfo={adminInfo}
        />
      )}
    </>
  );
}

// ── Inline Team Chat (no slide-in, no backdrop) ───────────────────────────
function TeamChatPanelInline({ onUnreadChange }: { onUnreadChange?: (n: number) => void }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [hoveredMsgId, setHoveredMsgId] = useState<string | null>(null);
  const [showEmojiFor, setShowEmojiFor] = useState<string | null>(null);
  const adminInfo = getAdminInfo();
  const bottomRef = useRef<HTMLDivElement>(null);
  const EMOJIS_LIST = ['👍', '❤️', '😂', '🔥', '✅', '👀'];

  const load = useCallback(async () => {
    const { count } = await supabase.from('team_messages').select('*', { count: 'exact', head: true });
    if ((count ?? 0) === 0) {
      await supabase.from('team_messages').insert([
        { sender_id: 'admin-seed-1', sender_name: 'Marisol', sender_role: 'admin', sender_initial: 'M', avatar_color: 'bg-emerald-600', text: 'Hey team! Just got a large hotel order in — 400 units of the 2" Faux Wood. Processing now.', reactions: { '🔥': ['admin-seed-2'] } },
        { sender_id: 'admin-seed-2', sender_name: 'Eric', sender_role: 'admin', sender_initial: 'E', avatar_color: 'bg-sky-600', text: "Nice! I'll make sure inventory is updated. Do we need to restock after this one?", reactions: {} },
      ]);
    }
    const { data } = await supabase.from('team_messages').select('*').order('created_at', { ascending: true }).limit(200);
    setMessages(data ?? []);
    setLoading(false);
    onUnreadChange?.(0);
    localStorage.setItem('team_chat_last_read', String(Date.now()));
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'auto' }), 80);
  }, [onUnreadChange]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const ch = supabase.channel('team_inline').on('postgres_changes', { event: '*', schema: 'public', table: 'team_messages' }, (p) => {
      if (p.eventType === 'INSERT') setMessages((prev) => prev.find((m) => m.id === p.new.id) ? prev : [...prev, p.new]);
      else if (p.eventType === 'UPDATE') setMessages((prev) => prev.map((m) => m.id === p.new.id ? p.new : m));
      else if (p.eventType === 'DELETE') setMessages((prev) => prev.filter((m) => m.id !== p.old.id));
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 60);
    }).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || !adminInfo) return;
    setInput('');
    await supabase.from('team_messages').insert({ sender_id: adminInfo.id, sender_name: adminInfo.name, sender_role: adminInfo.role ?? 'admin', sender_initial: adminInfo.name.charAt(0).toUpperCase(), avatar_color: adminInfo.role === 'super_admin' ? 'bg-amber-500' : colorForId(adminInfo.id), text, reactions: {} });
  }, [input, adminInfo]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };

  const toggleReaction = async (msgId: string, emoji: string) => {
    if (!adminInfo) return;
    const msg = messages.find((m) => m.id === msgId);
    if (!msg) return;
    const cur = msg.reactions?.[emoji] ?? [];
    const already = cur.includes(adminInfo.id);
    const newR = { ...(msg.reactions ?? {}), [emoji]: already ? cur.filter((id: string) => id !== adminInfo.id) : [...cur, adminInfo.id] };
    await supabase.from('team_messages').update({ reactions: newR }).eq('id', msgId);
    setShowEmojiFor(null);
  };

  function fmtTime(ts: string) {
    const diff = Date.now() - new Date(ts).getTime();
    if (diff < 60_000) return 'just now';
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
    const d = new Date(ts);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-3.5 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-slate-700 rounded-lg flex items-center justify-center">
            <i className="ri-hashtag text-white text-sm"></i>
          </div>
          <div>
            <p className="text-sm font-bold text-white">team-all</p>
            <p className="text-[11px] text-slate-500">All admins · synced live</p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-0.5">
        {loading ? (
          <div className="flex items-center justify-center h-full"><div className="w-6 h-6 border-2 border-slate-600 border-t-emerald-400 rounded-full animate-spin"></div></div>
        ) : messages.map((msg: any, i: number) => {
          const isOwn = adminInfo && msg.sender_id === adminInfo.id;
          const prev = i > 0 ? messages[i - 1] : null;
          const grp = prev && prev.sender_id === msg.sender_id && (new Date(msg.created_at).getTime() - new Date(prev.created_at).getTime()) < 3 * 60 * 1000;
          const totalR = Object.values(msg.reactions ?? {}).reduce((s: number, a: any) => s + a.length, 0);
          return (
            <div key={msg.id} className={`group flex gap-2.5 ${isOwn ? 'flex-row-reverse' : ''} ${grp ? 'mt-0.5' : 'mt-3'}`}
              onMouseEnter={() => setHoveredMsgId(msg.id)} onMouseLeave={() => { setHoveredMsgId(null); setShowEmojiFor(null); }}>
              {!grp ? <div className={`w-7 h-7 ${msg.avatar_color} rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5`}>{msg.sender_initial}</div> : <div className="w-7 shrink-0"></div>}
              <div className={`flex flex-col max-w-[80%] ${isOwn ? 'items-end' : 'items-start'}`}>
                {!grp && <div className={`flex items-center gap-2 mb-0.5 ${isOwn ? 'flex-row-reverse' : ''}`}><span className="text-[11px] font-bold text-slate-300">{msg.sender_name}</span><span className="text-[10px] text-slate-600">{fmtTime(msg.created_at)}</span></div>}
                <div className="relative">
                  <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed break-words ${isOwn ? 'bg-emerald-600 text-white rounded-tr-sm' : 'bg-slate-700 text-slate-100 rounded-tl-sm'}`}>{msg.text}</div>
                  {hoveredMsgId === msg.id && (
                    <div className={`absolute top-0 ${isOwn ? 'left-0 -translate-x-full pr-1' : 'right-0 translate-x-full pl-1'} z-10`}>
                      <button onClick={() => setShowEmojiFor(showEmojiFor === msg.id ? null : msg.id)} className="w-6 h-6 flex items-center justify-center bg-slate-700 hover:bg-slate-600 rounded-full text-slate-400 hover:text-white cursor-pointer">
                        <i className="ri-emotion-line text-xs"></i>
                      </button>
                    </div>
                  )}
                  {showEmojiFor === msg.id && (
                    <div className={`absolute top-7 ${isOwn ? 'right-0' : 'left-0'} z-20 bg-slate-800 border border-slate-700 rounded-2xl px-2 py-1.5 flex items-center gap-1`}>
                      {EMOJIS_LIST.map((e) => <button key={e} onClick={() => toggleReaction(msg.id, e)} className="w-7 h-7 flex items-center justify-center hover:bg-slate-700 rounded-lg text-base cursor-pointer">{e}</button>)}
                    </div>
                  )}
                </div>
                {(totalR as number) > 0 && (
                  <div className={`flex flex-wrap gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    {Object.entries(msg.reactions ?? {}).filter(([, ids]: any) => ids.length > 0).map(([em, ids]: any) => (
                      <button key={em} onClick={() => toggleReaction(msg.id, em)} className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-bold cursor-pointer border ${adminInfo && ids.includes(adminInfo.id) ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'bg-slate-800 border-slate-700 text-slate-400'}`}><span>{em}</span><span>{ids.length}</span></button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div className="px-4 pb-4 pt-2 border-t border-slate-800 shrink-0">
        <div className="flex items-end gap-2 bg-slate-800 border border-slate-700 rounded-2xl px-3 py-2 focus-within:border-slate-500 transition-colors">
          {adminInfo && <div className={`w-6 h-6 ${adminInfo.role === 'super_admin' ? 'bg-amber-500' : colorForId(adminInfo.id)} rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 mb-0.5`}>{adminInfo.name.charAt(0).toUpperCase()}</div>}
          <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Message the team..." rows={1} maxLength={1000}
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none resize-none leading-relaxed max-h-28 overflow-y-auto"
            style={{ minHeight: '22px' }}
            onInput={(e) => { const el = e.currentTarget; el.style.height = 'auto'; el.style.height = `${Math.min(el.scrollHeight, 112)}px`; }} />
          <button onClick={send} disabled={!input.trim()} className="w-7 h-7 flex items-center justify-center bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl cursor-pointer disabled:cursor-not-allowed transition-colors shrink-0 mb-0.5">
            <i className="ri-send-plane-fill text-xs"></i>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Inline DM (no slide-in) ────────────────────────────────────────────────
function DirectMessageInline({ recipient }: { recipient: RecipientInfo }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const adminInfo = getAdminInfo();
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    if (!adminInfo) return;
    setLoading(true);
    const { data } = await supabase.from('direct_messages').select('*')
      .or(`and(sender_id.eq.${adminInfo.id},recipient_id.eq.${recipient.id}),and(sender_id.eq.${recipient.id},recipient_id.eq.${adminInfo.id})`)
      .order('created_at', { ascending: true }).limit(300);
    setMessages(data ?? []);
    setLoading(false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'auto' }), 60);
    const unreadIds = (data ?? []).filter((m: any) => m.sender_id === recipient.id && !m.read).map((m: any) => m.id);
    if (unreadIds.length > 0) await supabase.from('direct_messages').update({ read: true }).in('id', unreadIds);
  }, [adminInfo, recipient.id]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!adminInfo) return;
    const ch = supabase.channel(`dm_inline_${[adminInfo.id, recipient.id].sort().join('_')}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'direct_messages' }, (p) => {
        const msg = p.new as any;
        const relevant = (msg.sender_id === adminInfo.id && msg.recipient_id === recipient.id) || (msg.sender_id === recipient.id && msg.recipient_id === adminInfo.id);
        if (!relevant) return;
        setMessages((prev) => prev.find((m) => m.id === msg.id) ? prev : [...prev, msg]);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 60);
        if (msg.sender_id === recipient.id) supabase.from('direct_messages').update({ read: true }).eq('id', msg.id);
      }).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [adminInfo, recipient.id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || !adminInfo) return;
    setInput('');
    await supabase.from('direct_messages').insert({ sender_id: adminInfo.id, sender_name: adminInfo.name, sender_initial: adminInfo.name.charAt(0).toUpperCase(), avatar_color: adminInfo.role === 'super_admin' ? 'bg-amber-500' : colorForId(adminInfo.id), recipient_id: recipient.id, text, read: false });
  }, [input, adminInfo, recipient.id]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };
  const recipColor = recipient.avatarColor ?? colorForId(recipient.id);

  function fmtTime(ts: string) {
    const diff = Date.now() - new Date(ts).getTime();
    if (diff < 60_000) return 'just now';
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
    return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-3.5 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 ${recipColor} rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0`}>{recipient.name.charAt(0)}</div>
          <div>
            <p className="text-sm font-bold text-white">{recipient.name}</p>
            <p className="text-[11px] text-slate-500">{recipient.role === 'super_admin' ? 'Super Admin' : 'Admin'} · {recipient.email}</p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-0.5">
        {loading ? <div className="flex items-center justify-center h-full"><div className="w-6 h-6 border-2 border-slate-600 border-t-emerald-400 rounded-full animate-spin"></div></div>
          : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 pb-8">
              <div className={`w-12 h-12 ${recipColor} rounded-full flex items-center justify-center text-white text-xl font-bold`}>{recipient.name.charAt(0)}</div>
              <div className="text-center">
                <p className="text-sm font-bold text-slate-300">{recipient.name}</p>
                <p className="text-xs text-slate-500 mt-1">Start a direct message</p>
              </div>
              <div className="flex flex-col gap-2 w-48">
                {[`Hi ${recipient.name.split(' ')[0]}! 👋`, 'Quick question...', 'Can you check this?'].map((s) => (
                  <button key={s} onClick={() => setInput(s)} className="text-left px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-400 rounded-xl cursor-pointer">{s}</button>
                ))}
              </div>
            </div>
          ) : messages.map((msg: any, i: number) => {
            const isOwn = adminInfo && msg.sender_id === adminInfo.id;
            const prev = i > 0 ? messages[i - 1] : null;
            const grp = prev && prev.sender_id === msg.sender_id && (new Date(msg.created_at).getTime() - new Date(prev.created_at).getTime()) < 3 * 60 * 1000;
            return (
              <div key={msg.id} className={`flex gap-2.5 ${isOwn ? 'flex-row-reverse' : ''} ${grp ? 'mt-0.5' : 'mt-3'}`}>
                {!grp ? <div className={`w-7 h-7 ${msg.avatar_color} rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5`}>{msg.sender_initial}</div> : <div className="w-7 shrink-0"></div>}
                <div className={`max-w-[80%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                  {!grp && <div className={`flex items-center gap-2 mb-0.5 ${isOwn ? 'flex-row-reverse' : ''}`}><span className="text-[11px] font-bold text-slate-300">{msg.sender_name}</span><span className="text-[10px] text-slate-600">{fmtTime(msg.created_at)}</span></div>}
                  <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed break-words ${isOwn ? 'bg-emerald-600 text-white rounded-tr-sm' : 'bg-slate-700 text-slate-100 rounded-tl-sm'}`}>{msg.text}</div>
                  {isOwn && i === messages.length - 1 && <span className={`text-[10px] flex items-center gap-1 mt-0.5 ${msg.read ? 'text-emerald-400' : 'text-slate-600'}`}><i className={msg.read ? 'ri-check-double-line' : 'ri-check-line'}></i>{msg.read ? 'Read' : 'Delivered'}</span>}
                </div>
              </div>
            );
          })
        }
        <div ref={bottomRef} />
      </div>
      <div className="px-4 pb-4 pt-2 border-t border-slate-800 shrink-0">
        <div className="flex items-end gap-2 bg-slate-800 border border-slate-700 rounded-2xl px-3 py-2 focus-within:border-slate-500 transition-colors">
          {adminInfo && <div className={`w-6 h-6 ${adminInfo.role === 'super_admin' ? 'bg-amber-500' : colorForId(adminInfo.id)} rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 mb-0.5`}>{adminInfo.name.charAt(0).toUpperCase()}</div>}
          <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder={`Message ${recipient.name.split(' ')[0]}...`} rows={1} maxLength={1000}
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none resize-none leading-relaxed max-h-28 overflow-y-auto"
            style={{ minHeight: '22px' }}
            onInput={(e) => { const el = e.currentTarget; el.style.height = 'auto'; el.style.height = `${Math.min(el.scrollHeight, 112)}px`; }} />
          <button onClick={send} disabled={!input.trim()} className="w-7 h-7 flex items-center justify-center bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl cursor-pointer disabled:cursor-not-allowed transition-colors shrink-0 mb-0.5">
            <i className="ri-send-plane-fill text-xs"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
