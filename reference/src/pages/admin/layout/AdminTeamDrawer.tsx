import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatLastActive, lastActiveColor } from '../../../utils/adminActivity';
import DirectMessagePanel, { type RecipientInfo } from './DirectMessagePanel';

interface AdminAccount {
  id: string;
  name: string;
  email: string;
  username: string;
  role: 'super_admin' | 'admin';
  status: 'active' | 'pending';
  createdAt: string;
  lastLogin?: string;
  lastActive?: string;
}

interface Props {
  onClose: () => void;
  currentAdminId?: string;
}

function getAdmins(): AdminAccount[] {
  try {
    return JSON.parse(localStorage.getItem('admin_accounts') ?? '[]');
  } catch {
    return [];
  }
}

function formatDate(iso?: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatJoined(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

const INITIALS_COLORS = [
  'bg-amber-500',
  'bg-emerald-600',
  'bg-sky-600',
  'bg-rose-500',
  'bg-violet-600',
  'bg-teal-600',
];

function avatarColor(index: number, isSuperAdmin: boolean): string {
  if (isSuperAdmin) return 'bg-amber-500';
  return INITIALS_COLORS[(index % (INITIALS_COLORS.length - 1)) + 1];
}

export default function AdminTeamDrawer({ onClose, currentAdminId }: Props) {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [mounted, setMounted] = useState(false);
  const [dmRecipient, setDmRecipient] = useState<RecipientInfo | null>(null);

  useEffect(() => {
    setAdmins(getAdmins());
    // animate in
    requestAnimationFrame(() => setMounted(true));
  }, []);

  const handleClose = () => {
    setMounted(false);
    setTimeout(onClose, 280);
  };

  const superAdmin = admins.find((a) => a.role === 'super_admin');
  const regularAdmins = admins.filter((a) => a.role !== 'super_admin');

  const onlineThreshold = 10 * 60 * 1000; // 10 min
  const isOnline = (lastActive?: string) =>
    lastActive ? Date.now() - new Date(lastActive).getTime() < onlineThreshold : false;

  const openDM = (admin: AdminAccount) => {
    setDmRecipient({
      id: admin.id,
      name: admin.name,
      role: admin.role,
      email: admin.email,
      avatarColor: admin.role === 'super_admin' ? 'bg-amber-500' : undefined,
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 ${mounted ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-slate-900 z-[70] flex flex-col transition-transform duration-300 ease-out ${
          mounted ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center">
              <i className="ri-team-line text-slate-300 text-base"></i>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Backend Team</h3>
              <p className="text-[11px] text-slate-500">{admins.length} admin{admins.length !== 1 ? 's' : ''} with access</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer transition-colors"
          >
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 px-4">
          {/* Super Admin */}
          {superAdmin && (
            <div className="mb-4">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">Super Admin</p>
              <AdminCard
                admin={superAdmin}
                index={0}
                isOnline={isOnline(superAdmin.lastActive)}
                isCurrentUser={superAdmin.id === currentAdminId}
                onMessage={() => openDM(superAdmin)}
              />
            </div>
          )}

          {/* Regular admins */}
          {regularAdmins.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">Admins</p>
              <div className="space-y-2">
                {regularAdmins.map((admin, i) => (
                  <AdminCard
                    key={admin.id}
                    admin={admin}
                    index={i + 1}
                    isOnline={isOnline(admin.lastActive)}
                    isCurrentUser={admin.id === currentAdminId}
                    onMessage={() => openDM(admin)}
                  />
                ))}
              </div>
            </div>
          )}

          {admins.length === 0 && (
            <div className="text-center py-16">
              <i className="ri-team-line text-slate-600 text-3xl mb-3 block"></i>
              <p className="text-slate-500 text-sm">No admins found</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 pb-5 pt-3 border-t border-slate-800 space-y-2">
          <button
            onClick={() => { handleClose(); navigate('/admin/admins'); }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-lg cursor-pointer whitespace-nowrap transition-colors"
          >
            <i className="ri-settings-3-line"></i>
            Manage Admin Accounts
          </button>
        </div>
      </div>

      {/* DM Panel — renders on top of drawer */}
      {dmRecipient && (
        <DirectMessagePanel
          recipient={dmRecipient}
          onClose={() => setDmRecipient(null)}
        />
      )}
    </>
  );
}

interface AdminCardProps {
  admin: AdminAccount;
  index: number;
  isOnline: boolean;
  isCurrentUser: boolean;
  onMessage: () => void;
}

function AdminCard({ admin, index, isOnline, isCurrentUser, onMessage }: AdminCardProps) {
  const isSuperAdmin = admin.role === 'super_admin';
  const bgColor = avatarColor(index, isSuperAdmin);

  return (
    <div className={`rounded-xl border p-3.5 transition-colors ${
      isCurrentUser
        ? 'bg-slate-700/80 border-slate-600'
        : 'bg-slate-800 border-slate-700'
    }`}>
      {/* Top row: avatar + name + badges */}
      <div className="flex items-start gap-3">
        {/* Avatar with online dot */}
        <div className="relative shrink-0">
          <div className={`w-10 h-10 ${bgColor} rounded-full flex items-center justify-center text-white font-bold text-base`}>
            {admin.name.charAt(0)}
          </div>
          {isOnline && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-800"></span>
          )}
        </div>

        {/* Name + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-white truncate">{admin.name}</p>
            {isCurrentUser && (
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full whitespace-nowrap">You</span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 truncate">{admin.email}</p>
        </div>
      </div>

      {/* Role badge */}
      <div className="mt-2.5 flex items-center gap-2">
        {isSuperAdmin ? (
          <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full whitespace-nowrap">
            <i className="ri-shield-star-line text-xs"></i> Super Admin
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-700 px-2 py-0.5 rounded-full whitespace-nowrap">
            <i className="ri-admin-line text-xs"></i> Admin
          </span>
        )}
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${
          isOnline ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-500 bg-slate-700/50'
        }`}>
          {isOnline ? 'Online now' : 'Offline'}
        </span>
      </div>

      {/* Stats row */}
      <div className="mt-2.5 grid grid-cols-2 gap-2">
        <div className="bg-slate-900/50 rounded-lg px-2.5 py-1.5">
          <p className="text-[10px] text-slate-500 font-medium">Last active</p>
          <p className={`text-[11px] font-bold ${lastActiveColor(admin.lastActive)}`}>
            {formatLastActive(admin.lastActive)}
          </p>
        </div>
        <div className="bg-slate-900/50 rounded-lg px-2.5 py-1.5">
          <p className="text-[10px] text-slate-500 font-medium">Joined</p>
          <p className="text-[11px] font-bold text-slate-300">{formatJoined(admin.createdAt)}</p>
        </div>
      </div>

      {/* Username + Message button */}
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <i className="ri-at-line text-[11px] text-slate-600 shrink-0"></i>
          <span className="text-[11px] font-mono text-slate-500 truncate">{admin.username}</span>
        </div>
        {!isCurrentUser && (
          <button
            onClick={onMessage}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-lg cursor-pointer whitespace-nowrap transition-colors shrink-0"
          >
            <i className="ri-chat-1-line text-xs"></i>
            Message
          </button>
        )}
      </div>
    </div>
  );
}
