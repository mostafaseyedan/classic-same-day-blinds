import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface AdminAccount {
  id: string;
  name: string;
  email: string;
  username: string;
  password: string;
  role: string;
  accessLevel?: 'super_admin' | 'admin' | 'order_manager' | 'product_manager';
  status: 'active' | 'pending';
  createdAt: string;
  lastLogin?: string;
  lastActive?: string;
}

interface AdminInvite {
  id: string;
  code: string;
  name: string;
  email: string;
  role: string;
  accessLevel?: 'super_admin' | 'admin' | 'order_manager' | 'product_manager';
  createdAt: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'revoked';
}

function getAdminAccounts(): AdminAccount[] {
  try { return JSON.parse(localStorage.getItem('admin_accounts') ?? '[]'); } catch { return []; }
}

function getAdminInvites(): AdminInvite[] {
  try { return JSON.parse(localStorage.getItem('admin_invites') ?? '[]'); } catch { return []; }
}

function generateCode(): string {
  return Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
}

const ROLE_CONFIG: Record<string, { label: string; icon: string; color: string; bg: string; description: string; perms: string[] }> = {
  super_admin: {
    label: 'Super Admin',
    icon: 'ri-shield-star-line',
    color: 'text-amber-700',
    bg: 'bg-amber-100',
    description: 'Full access to everything including admin management',
    perms: ['All pages & settings', 'Manage & remove admins', 'Promote & demote roles', 'Reset any password'],
  },
  admin: {
    label: 'Admin',
    icon: 'ri-admin-line',
    color: 'text-slate-700',
    bg: 'bg-slate-100',
    description: 'Full access except the Admins management panel',
    perms: ['Dashboard, Orders, Products', 'Users, Reviews, Visitors', 'Restock & Competitor Pricing', 'Email Alerts'],
  },
  order_manager: {
    label: 'Order Manager',
    icon: 'ri-shopping-bag-3-line',
    color: 'text-emerald-700',
    bg: 'bg-emerald-100',
    description: 'Focused on order processing and customer management',
    perms: ['Dashboard & Orders', 'Users & Reviews', 'Email Alerts & Visitors', 'Own Profile only'],
  },
  product_manager: {
    label: 'Product Manager',
    icon: 'ri-store-2-line',
    color: 'text-violet-700',
    bg: 'bg-violet-100',
    description: 'Focused on inventory, products and pricing',
    perms: ['Dashboard & Products', 'Restock Requests & History', 'Competitor Pricing', 'Own Profile only'],
  },
};

// Helper: get display label for a role (custom or preset)
function getRoleDisplay(role: string): { label: string; icon: string; color: string; bg: string } {
  if (ROLE_CONFIG[role]) return ROLE_CONFIG[role];
  return { label: role, icon: 'ri-user-settings-line', color: 'text-teal-700', bg: 'bg-teal-100' };
}

// ── Invite Modal ───────────────────────────────────────────────────────────
interface InviteModalProps {
  onClose: () => void;
  onCreated: (invite: AdminInvite) => void;
}

function InviteModal({ onClose, onCreated }: InviteModalProps) {
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'super_admin' | 'admin' | 'order_manager' | 'product_manager' | 'custom'>('admin');
  const [customRoleName, setCustomRoleName] = useState('');
  const [customAccessLevel, setCustomAccessLevel] = useState<'super_admin' | 'admin' | 'order_manager' | 'product_manager'>('admin');
  const [inviteError, setInviteError] = useState('');

  const isCustom = inviteRole === 'custom';

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError('');

    if (isCustom && !customRoleName.trim()) {
      setInviteError('Please enter a custom role name.');
      return;
    }

    const all = getAdminAccounts();
    const invites = getAdminInvites();

    if (all.some((a) => a.email === inviteEmail.trim())) {
      setInviteError('An admin with this email already exists.');
      return;
    }
    if (invites.some((i) => i.email === inviteEmail.trim() && i.status === 'pending')) {
      setInviteError('An invite has already been sent to this email.');
      return;
    }

    const code = generateCode();
    const now = new Date();
    const expires = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const newInvite: AdminInvite = {
      id: `invite_${Date.now()}`,
      code,
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      role: isCustom ? customRoleName.trim() : inviteRole,
      accessLevel: isCustom ? customAccessLevel : inviteRole as 'super_admin' | 'admin' | 'order_manager' | 'product_manager',
      createdAt: now.toISOString(),
      expiresAt: expires.toISOString(),
      status: 'pending',
    };
    const updated = [...invites, newInvite];
    localStorage.setItem('admin_invites', JSON.stringify(updated));
    onCreated(newInvite);
  };

  const presetRoles = Object.keys(ROLE_CONFIG) as Array<keyof typeof ROLE_CONFIG>;
  const selectedPresetCfg = !isCustom ? ROLE_CONFIG[inviteRole] : null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Invite a New Admin</h3>
            <p className="text-xs text-slate-500 mt-0.5">Choose a role to control what they can access</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer">
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>

        <form onSubmit={handleInvite} className="px-6 py-5 space-y-5">
          {/* Name + Email */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
              <input
                type="text"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="Jane Smith"
                required
                className="w-full text-sm border border-slate-200 focus:border-slate-400 rounded-lg px-3 py-2.5 outline-none text-slate-700 placeholder-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="jane@yourbusiness.com"
                required
                className="w-full text-sm border border-slate-200 focus:border-slate-400 rounded-lg px-3 py-2.5 outline-none text-slate-700 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Role selector — 4 presets + Custom */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Role</label>
            <div className="grid grid-cols-2 gap-2">
              {presetRoles.map((role) => {
                const cfg = ROLE_CONFIG[role];
                const isSelected = inviteRole === role;
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setInviteRole(role as typeof inviteRole)}
                    className={`flex items-start gap-3 px-3 py-3 rounded-xl border-2 text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'border-slate-900 bg-slate-50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className={`w-8 h-8 ${cfg.bg} rounded-lg flex items-center justify-center shrink-0 mt-0.5`}>
                      <i className={`${cfg.icon} ${cfg.color} text-sm`}></i>
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs font-bold ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>{cfg.label}</p>
                      <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{cfg.description}</p>
                    </div>
                    {isSelected && (
                      <div className="w-4 h-4 bg-slate-900 rounded-full flex items-center justify-center shrink-0 ml-auto mt-0.5">
                        <i className="ri-check-line text-white text-[10px]"></i>
                      </div>
                    )}
                  </button>
                );
              })}

              {/* Custom role card */}
              <button
                type="button"
                onClick={() => setInviteRole('custom')}
                className={`flex items-start gap-3 px-3 py-3 rounded-xl border-2 text-left cursor-pointer transition-all col-span-2 ${
                  isCustom ? 'border-teal-500 bg-teal-50' : 'border-dashed border-slate-300 hover:border-slate-400 bg-white'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${isCustom ? 'bg-teal-200' : 'bg-slate-100'}`}>
                  <i className={`ri-edit-line text-sm ${isCustom ? 'text-teal-700' : 'text-slate-400'}`}></i>
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-xs font-bold ${isCustom ? 'text-teal-800' : 'text-slate-600'}`}>Custom Role</p>
                  <p className="text-[10px] text-slate-500 leading-tight mt-0.5">Define your own role title (e.g. &quot;Sales Manager&quot;, &quot;Warehouse Staff&quot;)</p>
                </div>
                {isCustom && (
                  <div className="w-4 h-4 bg-teal-600 rounded-full flex items-center justify-center shrink-0 ml-auto mt-0.5">
                    <i className="ri-check-line text-white text-[10px]"></i>
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Custom role fields — shown only when Custom is selected */}
          {isCustom && (
            <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-teal-700 uppercase tracking-wider mb-1.5">
                  Custom Role Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={customRoleName}
                  onChange={(e) => setCustomRoleName(e.target.value)}
                  placeholder="e.g. Sales Manager, Warehouse Staff, Customer Service Rep..."
                  maxLength={40}
                  className="w-full text-sm border border-teal-300 focus:border-teal-500 rounded-lg px-3 py-2.5 outline-none text-slate-700 placeholder-slate-400 bg-white"
                />
                <p className="text-[10px] text-teal-600 mt-1">{customRoleName.length}/40 characters</p>
              </div>

              {/* Access level picker for custom role */}
              <div>
                <label className="block text-xs font-bold text-teal-700 uppercase tracking-wider mb-2">
                  Access Level <span className="text-xs font-normal normal-case text-teal-500 ml-1">— controls which pages they can see</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {presetRoles.map((role) => {
                    const cfg = ROLE_CONFIG[role];
                    const isSelected = customAccessLevel === role;
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setCustomAccessLevel(role as typeof customAccessLevel)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all text-left ${
                          isSelected
                            ? 'border-teal-500 bg-white'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className={`w-6 h-6 ${cfg.bg} rounded-md flex items-center justify-center shrink-0`}>
                          <i className={`${cfg.icon} ${cfg.color} text-[11px]`}></i>
                        </div>
                        <span className={`text-xs font-semibold ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>{cfg.label}</span>
                        {isSelected && <i className="ri-check-line text-teal-600 ml-auto text-xs"></i>}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-teal-600 mt-2 flex items-start gap-1">
                  <i className="ri-information-line shrink-0 mt-0.5"></i>
                  This person will have <strong className="mx-0.5">{ROLE_CONFIG[customAccessLevel]?.label}</strong> page access but will be displayed as &quot;{customRoleName.trim() || 'Custom Role'}&quot;.
                </p>
              </div>
            </div>
          )}

          {/* Permissions preview for preset roles */}
          {!isCustom && selectedPresetCfg && (
            <div className={`rounded-xl p-4 space-y-2 ${selectedPresetCfg.bg}`}>
              <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${selectedPresetCfg.color}`}>
                <i className={`${selectedPresetCfg.icon} mr-1.5`}></i>
                {selectedPresetCfg.label} — Can access:
              </p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                {selectedPresetCfg.perms.map((perm) => (
                  <div key={perm} className="flex items-center gap-1.5">
                    <i className={`ri-check-line text-xs ${selectedPresetCfg.color} shrink-0`}></i>
                    <span className={`text-xs ${selectedPresetCfg.color} opacity-80`}>{perm}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {inviteError && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
              <i className="ri-error-warning-line"></i> {inviteError}
            </div>
          )}

          <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600 flex items-start gap-2">
            <i className="ri-time-line text-slate-400 mt-0.5 shrink-0"></i>
            <span>Link expires in 7 days and is single-use. The invitee sets their own username &amp; password.</span>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer whitespace-nowrap transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg cursor-pointer whitespace-nowrap transition-colors">
              <i className="ri-user-add-line"></i> Generate Invite Link
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Invite Link Modal (shown after creation) ───────────────────────────────
interface InviteLinkModalProps {
  invite: AdminInvite;
  onClose: () => void;
}

function InviteLinkModal({ invite, onClose }: InviteLinkModalProps) {
  const [copied, setCopied] = useState(false);
  const link = `${window.location.origin}/admin/invite?code=${invite.code}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 pt-6 pb-4 text-center border-b border-slate-100">
          <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <i className="ri-links-line text-emerald-600 text-2xl"></i>
          </div>
          <h3 className="text-xl font-bold text-slate-900">Invite Link Ready!</h3>
          <p className="text-sm text-slate-500 mt-1">Share this link with <strong className="text-slate-700">{invite.name}</strong> to let them create their account</p>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Steps */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { step: '1', icon: 'ri-links-line', label: 'Copy the link below', color: 'bg-slate-100 text-slate-600' },
              { step: '2', icon: 'ri-send-plane-line', label: 'Send it to them', color: 'bg-amber-50 text-amber-600' },
              { step: '3', icon: 'ri-user-follow-line', label: 'They sign up', color: 'bg-emerald-50 text-emerald-600' },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                  <i className={`${s.icon} text-lg`}></i>
                </div>
                <p className="text-xs text-slate-600 font-medium">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Link box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Invite Link</span>
              <span className="text-xs text-slate-500 bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold whitespace-nowrap">
                Expires in 7 days
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-2.5">
              <i className="ri-link-m text-slate-400 shrink-0 text-sm"></i>
              <p className="text-xs text-slate-600 font-mono flex-1 truncate">{link}</p>
            </div>
            <button
              onClick={handleCopy}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg cursor-pointer whitespace-nowrap transition-colors ${
                copied
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              {copied
                ? <><i className="ri-check-line"></i> Copied to clipboard!</>
                : <><i className="ri-clipboard-line"></i> Copy Invite Link</>}
            </button>
          </div>

          {/* Invite details */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 rounded-lg px-3 py-2.5">
              <p className="text-slate-400 font-medium mb-0.5">Invited person</p>
              <p className="font-semibold text-slate-800">{invite.name}</p>
              <p className="text-slate-500">{invite.email}</p>
            </div>
            <div className="bg-slate-50 rounded-lg px-3 py-2.5">
              <p className="text-slate-400 font-medium mb-0.5">Link expires</p>
              <p className="font-semibold text-slate-800">
                {new Date(invite.expiresAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
              <p className="text-slate-500">Single-use only</p>
            </div>
          </div>
        </div>

        <div className="px-6 pb-5">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer whitespace-nowrap transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Change Password Modal ──────────────────────────────────────────────────
interface ChangePasswordModalProps {
  target: AdminAccount;
  currentAdmin: AdminAccount;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

function ChangePasswordModal({ target, currentAdmin, onClose, onSuccess }: ChangePasswordModalProps) {
  const isSelf = target.id === currentAdmin.id;
  const isAdminOverride = currentAdmin.role === 'super_admin' && !isSelf;

  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const strength = (() => {
    if (newPwd.length === 0) return 0;
    let s = 0;
    if (newPwd.length >= 8) s++;
    if (/[A-Z]/.test(newPwd)) s++;
    if (/[0-9]/.test(newPwd)) s++;
    if (/[^A-Za-z0-9]/.test(newPwd)) s++;
    return s;
  })();
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-yellow-400', 'bg-emerald-500'][strength];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!isAdminOverride) {
      if (currentPwd !== target.password) { setError('Current password is incorrect.'); return; }
    }
    if (newPwd.length < 6) { setError('New password must be at least 6 characters.'); return; }
    if (newPwd !== confirmPwd) { setError('Passwords don\'t match.'); return; }
    if (!isAdminOverride && newPwd === currentPwd) { setError('New password must be different from the current one.'); return; }

    setSaving(true);
    setTimeout(() => {
      const accounts = getAdminAccounts();
      const updated = accounts.map((a) => a.id === target.id ? { ...a, password: newPwd } : a);
      localStorage.setItem('admin_accounts', JSON.stringify(updated));
      setSaving(false);
      onSuccess(isSelf ? 'Password updated successfully!' : `Password reset for ${target.name}`);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shrink-0">
              <i className="ri-lock-password-line text-white text-lg"></i>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isSelf ? 'Change Your Password' : `Reset Password — ${target.name}`}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isAdminOverride ? 'Super admin override — no current password required' : 'Enter your current password to continue'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer">
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {isAdminOverride && (
            <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <div className="w-7 h-7 bg-amber-500 rounded-full flex items-center justify-center shrink-0">
                <i className="ri-shield-star-line text-white text-xs"></i>
              </div>
              <p className="text-xs text-amber-800 font-medium">
                You&apos;re resetting this admin&apos;s password as Super Admin. Their current password is not required.
              </p>
            </div>
          )}

          {!isAdminOverride && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Current Password</label>
              <div className="relative">
                <i className="ri-lock-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                <input type="password" value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} placeholder="Your current password" required className="w-full pl-9 pr-4 py-2.5 border border-slate-200 focus:border-slate-400 rounded-lg outline-none text-sm text-slate-700 placeholder-slate-400" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">New Password</label>
            <div className="relative">
              <i className="ri-lock-2-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
              <input type={showNew ? 'text' : 'password'} value={newPwd} onChange={(e) => setNewPwd(e.target.value)} placeholder="At least 6 characters" required className="w-full pl-9 pr-10 py-2.5 border border-slate-200 focus:border-slate-400 rounded-lg outline-none text-sm text-slate-700 placeholder-slate-400" />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                <i className={showNew ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
              </button>
            </div>
            {newPwd.length > 0 && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= strength ? strengthColor : 'bg-slate-200'}`}></div>
                  ))}
                </div>
                <p className={`text-xs font-semibold ${['','text-red-500','text-amber-500','text-yellow-600','text-emerald-600'][strength]}`}>{strengthLabel}</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Confirm New Password</label>
            <div className="relative">
              <i className="ri-lock-2-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
              <input type={showNew ? 'text' : 'password'} value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} placeholder="Re-enter new password" required className="w-full pl-9 pr-4 py-2.5 border border-slate-200 focus:border-slate-400 rounded-lg outline-none text-sm text-slate-700 placeholder-slate-400" />
              {confirmPwd.length > 0 && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  {confirmPwd === newPwd ? <i className="ri-check-line text-emerald-500"></i> : <i className="ri-close-line text-red-400"></i>}
                </span>
              )}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
              <i className="ri-error-warning-line text-lg shrink-0"></i> {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer whitespace-nowrap transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg cursor-pointer whitespace-nowrap transition-colors disabled:opacity-50">
              {saving ? <><i className="ri-loader-4-line animate-spin"></i> Saving...</> : <><i className="ri-lock-password-line"></i> Update Password</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Edit Role Title Modal ──────────────────────────────────────────────────
interface EditRoleTitleModalProps {
  target: AdminAccount;
  onClose: () => void;
  onSaved: (msg: string) => void;
}

function EditRoleTitleModal({ target, onClose, onSaved }: EditRoleTitleModalProps) {
  const [title, setTitle] = useState(target.role);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const accessLevelKey = target.accessLevel ?? 'admin';
  const accessCfg = ROLE_CONFIG[accessLevelKey] ?? ROLE_CONFIG.admin;
  const isUnchanged = title.trim() === target.role;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!title.trim()) { setError('Role title cannot be empty.'); return; }
    if (title.trim().length < 2) { setError('Role title must be at least 2 characters.'); return; }
    if (isUnchanged) { onClose(); return; }

    setSaving(true);
    setTimeout(() => {
      const accounts = getAdminAccounts();
      const updated = accounts.map((a) =>
        a.id === target.id ? { ...a, role: title.trim() } : a
      );
      localStorage.setItem('admin_accounts', JSON.stringify(updated));
      setSaving(false);
      onSaved(`Role title updated to "${title.trim()}"`);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center shrink-0">
              <i className="ri-edit-line text-teal-600 text-lg"></i>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Edit Role Title</h3>
              <p className="text-xs text-slate-500 mt-0.5">Change the display label for {target.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer">
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>

        <form onSubmit={handleSave} className="px-6 py-5 space-y-5">
          {/* Current admin info */}
          <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
            <div className="w-9 h-9 bg-teal-200 rounded-full flex items-center justify-center shrink-0 font-bold text-teal-800 text-sm">
              {target.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{target.name}</p>
              <p className="text-xs text-slate-500">{target.email}</p>
            </div>
          </div>

          {/* Access level — read-only, locked */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Access Level <span className="text-xs font-normal normal-case text-slate-400 ml-1">— unchanged</span>
            </label>
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${accessCfg.bg} border border-slate-200`}>
              <div className={`w-8 h-8 bg-white/60 rounded-lg flex items-center justify-center shrink-0`}>
                <i className={`${accessCfg.icon} ${accessCfg.color} text-sm`}></i>
              </div>
              <div className="flex-1">
                <p className={`text-sm font-bold ${accessCfg.color}`}>{accessCfg.label}</p>
                <p className="text-xs text-slate-500">Pages they can access won't change</p>
              </div>
              <div className="w-7 h-7 bg-white/50 rounded-lg flex items-center justify-center shrink-0">
                <i className="ri-lock-line text-slate-400 text-xs"></i>
              </div>
            </div>
          </div>

          {/* Title input */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Role Title <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <i className="ri-price-tag-3-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
              <input
                type="text"
                value={title}
                onChange={(e) => { setTitle(e.target.value); setError(''); }}
                placeholder="e.g. Sales Manager, Warehouse Staff..."
                maxLength={40}
                autoFocus
                className="w-full pl-9 pr-20 py-2.5 border border-slate-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 rounded-lg outline-none text-sm text-slate-700 placeholder-slate-400 transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                {title.length}/40
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1.5">This is only a display label — their page access stays the same.</p>
          </div>

          {/* Live preview badge */}
          {title.trim() && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Preview:</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full whitespace-nowrap bg-teal-100 text-teal-700">
                <i className="ri-user-settings-line text-xs"></i>
                {title.trim()}
              </span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2.5 rounded-lg">
              <i className="ri-error-warning-line shrink-0"></i> {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer whitespace-nowrap transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !title.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg cursor-pointer whitespace-nowrap transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving
                ? <><i className="ri-loader-4-line animate-spin"></i> Saving...</>
                : isUnchanged
                ? <><i className="ri-check-line"></i> No Changes</>
                : <><i className="ri-save-line"></i> Save Title</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Role Change Modal ──────────────────────────────────────────────────────
interface RoleChangeModalProps {
  target: AdminAccount;
  newRole: 'super_admin' | 'admin' | 'order_manager' | 'product_manager';
  onClose: () => void;
  onConfirm: () => void;
}

function RoleChangeModal({ target, newRole, onClose, onConfirm }: RoleChangeModalProps) {
  const from = ROLE_CONFIG[target.role] ?? ROLE_CONFIG.admin;
  const to = ROLE_CONFIG[newRole] ?? ROLE_CONFIG.admin;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
              <i className="ri-user-settings-line text-slate-600 text-lg"></i>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Change Role</h3>
              <p className="text-xs text-slate-500 mt-0.5">Update access level for {target.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer">
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Role transition visual */}
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <div className={`w-14 h-14 ${from.bg} rounded-full flex items-center justify-center mx-auto mb-2`}>
                <i className={`${from.icon} ${from.color} text-2xl`}></i>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${from.bg} ${from.color}`}>{from.label}</span>
            </div>
            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
              <i className="ri-arrow-right-line text-slate-500"></i>
            </div>
            <div className="text-center">
              <div className={`w-14 h-14 ${to.bg} rounded-full flex items-center justify-center mx-auto mb-2`}>
                <i className={`${to.icon} ${to.color} text-2xl`}></i>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${to.bg} ${to.color}`}>{to.label}</span>
            </div>
          </div>

          {/* New role permissions */}
          <div className={`${to.bg} rounded-xl px-4 py-3`}>
            <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${to.color}`}>
              {to.label} can access:
            </p>
            {to.perms.map((perm) => (
              <div key={perm} className="flex items-center gap-2 mb-1">
                <i className={`ri-check-line text-sm ${to.color} shrink-0`}></i>
                <span className={`text-xs ${to.color} opacity-80`}>{perm}</span>
              </div>
            ))}
          </div>

          <p className="text-sm text-slate-500 text-center">
            <strong className="text-slate-800">{target.name}</strong>&apos;s access will update immediately.
          </p>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer whitespace-nowrap transition-colors">
              Cancel
            </button>
            <button type="button" onClick={onConfirm} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg cursor-pointer whitespace-nowrap transition-colors">
              <i className="ri-check-line"></i> Confirm Change
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function AdminAdminsPage() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [invites, setInvites] = useState<AdminInvite[]>([]);
  const [currentAdmin, setCurrentAdmin] = useState<AdminAccount | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newInvite, setNewInvite] = useState<AdminInvite | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<AdminAccount | null>(null);
  const [changePasswordTarget, setChangePasswordTarget] = useState<AdminAccount | null>(null);
  const [roleChangeTarget, setRoleChangeTarget] = useState<{ admin: AdminAccount; newRole: 'super_admin' | 'admin' | 'order_manager' | 'product_manager' } | null>(null);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState<string | null>(null);
  const [editRoleTitleTarget, setEditRoleTitleTarget] = useState<AdminAccount | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('admin_user');
    if (stored) {
      const user = JSON.parse(stored);
      const all = getAdminAccounts();
      const found = all.find((a) => a.id === user.id);
      if (found) setCurrentAdmin(found);
    }
    refresh();
  }, []);

  const refresh = () => {
    setAccounts(getAdminAccounts());
    setInvites(getAdminInvites().filter((i) => i.status !== 'accepted'));
  };

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleDeleteAdmin = (admin: AdminAccount) => {
    const all = getAdminAccounts();
    const updated = all.filter((a) => a.id !== admin.id);
    localStorage.setItem('admin_accounts', JSON.stringify(updated));
    setShowDeleteModal(null);
    refresh();
    showToast(`${admin.name}'s account has been removed`);
  };

  const handleRevokeInvite = (invite: AdminInvite) => {
    const all = getAdminInvites();
    const updated = all.map((i) => i.id === invite.id ? { ...i, status: 'revoked' as const } : i);
    localStorage.setItem('admin_invites', JSON.stringify(updated));
    refresh();
    showToast('Invite revoked');
  };

  const handleRoleChange = () => {
    if (!roleChangeTarget) return;
    const all = getAdminAccounts();
    const updated = all.map((a) =>
      a.id === roleChangeTarget.admin.id ? { ...a, role: roleChangeTarget.newRole } : a
    );
    localStorage.setItem('admin_accounts', JSON.stringify(updated));
    setRoleChangeTarget(null);
    setRoleDropdownOpen(null);
    refresh();
    showToast(`${roleChangeTarget.admin.name} is now a ${getRoleDisplay(roleChangeTarget.newRole).label}`);
  };

  const copyInviteLink = (code: string) => {
    const link = `${window.location.origin}/admin/invite?code=${code}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2500);
    });
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const isSuperAdmin = currentAdmin?.role === 'super_admin';
  const pendingInvites = invites.filter((i) => i.status === 'pending');

  // ── Regular admin view ────────────────────────────────────────────────────
  if (currentAdmin && !isSuperAdmin) {
    return (
      <div className="p-8 max-w-lg">
        {toast && (
          <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-semibold ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
            <i className={`${toast.type === 'success' ? 'ri-check-line' : 'ri-error-warning-line'} text-lg`}></i>
            {toast.msg}
          </div>
        )}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">My Account</h2>
          <p className="text-sm text-slate-500 mt-1">Manage your admin credentials</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-slate-300 rounded-full flex items-center justify-center text-white font-bold text-xl">
              {currentAdmin.name.charAt(0)}
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">{currentAdmin.name}</p>
              <p className="text-sm text-slate-500">{currentAdmin.email}</p>
              <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full mt-1 whitespace-nowrap ${ROLE_CONFIG[currentAdmin.role]?.bg ?? 'bg-slate-100'} ${ROLE_CONFIG[currentAdmin.role]?.color ?? 'text-slate-600'}`}>
                <i className={`${ROLE_CONFIG[currentAdmin.role]?.icon ?? 'ri-admin-line'} text-xs`}></i>
                {ROLE_CONFIG[currentAdmin.role]?.label ?? 'Admin'}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <p className="text-xs text-slate-400 font-medium">Username</p>
              <p className="text-sm font-mono font-semibold text-slate-700">@{currentAdmin.username}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Member since</p>
              <p className="text-sm font-semibold text-slate-700">{formatDate(currentAdmin.createdAt)}</p>
            </div>
          </div>
          <button
            onClick={() => setChangePasswordTarget(currentAdmin)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg cursor-pointer whitespace-nowrap transition-colors"
          >
            <i className="ri-lock-password-line"></i> Change My Password
          </button>
        </div>

        {changePasswordTarget && (
          <ChangePasswordModal
            target={changePasswordTarget}
            currentAdmin={currentAdmin}
            onClose={() => setChangePasswordTarget(null)}
            onSuccess={(msg) => { showToast(msg); refresh(); }}
          />
        )}
      </div>
    );
  }

  // ── Super admin view ───────────────────────────────────────────────────────
  return (
    <div className="p-8 space-y-8">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-semibold ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
          <i className={`${toast.type === 'success' ? 'ri-check-line' : 'ri-error-warning-line'} text-lg`}></i>
          {toast.msg}
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Admin Accounts</h2>
          <p className="text-sm text-slate-500 mt-1">Manage who has access to the admin dashboard</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg cursor-pointer whitespace-nowrap transition-colors"
        >
          <i className="ri-user-add-line"></i>
          Invite Admin
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Admins', value: accounts.length, icon: 'ri-team-line', color: 'slate' },
          { label: 'Active', value: accounts.filter((a) => a.status === 'active').length, icon: 'ri-user-follow-line', color: 'emerald' },
          { label: 'Pending Invites', value: pendingInvites.length, icon: 'ri-mail-send-line', color: 'amber' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${stat.color === 'emerald' ? 'bg-emerald-100' : stat.color === 'amber' ? 'bg-amber-100' : 'bg-slate-100'} rounded-xl flex items-center justify-center shrink-0`}>
                <i className={`${stat.icon} text-lg ${stat.color === 'emerald' ? 'text-emerald-600' : stat.color === 'amber' ? 'text-amber-600' : 'text-slate-600'}`}></i>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Admin Accounts Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Admin Accounts</h3>
          <span className="text-xs text-slate-500">{accounts.length} account{accounts.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Admin</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Username</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Role</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Joined</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Last Login</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {accounts.map((admin) => {
                const roleCfg = getRoleDisplay(admin.role);
                return (
                  <tr key={admin.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                          admin.role === 'super_admin' ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {admin.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-slate-900">{admin.name}</p>
                            {admin.id === currentAdmin?.id && (
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full whitespace-nowrap">You</span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500">{admin.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-slate-700 bg-slate-100 px-2 py-1 rounded">@{admin.username}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full whitespace-nowrap ${roleCfg.bg} ${roleCfg.color}`}>
                        <i className={roleCfg.icon}></i> {roleCfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                        admin.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {admin.status === 'active' ? 'Active' : 'Pending Setup'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{formatDate(admin.createdAt)}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {admin.lastLogin ? formatDate(admin.lastLogin) : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 justify-end flex-wrap">
                        {/* Change / Reset Password */}
                        <button
                          onClick={() => setChangePasswordTarget(admin)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer whitespace-nowrap transition-colors"
                        >
                          <i className="ri-lock-password-line"></i>
                          {admin.id === currentAdmin?.id ? 'Change Password' : 'Reset Password'}
                        </button>

                        {/* Edit role title — only for custom roles */}
                        {!ROLE_CONFIG[admin.role] && (
                          <button
                            onClick={() => setEditRoleTitleTarget(admin)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg cursor-pointer whitespace-nowrap transition-colors"
                          >
                            <i className="ri-edit-line"></i> Edit Title
                          </button>
                        )}

                        {/* Role change dropdown — not for self */}
                        {admin.id !== currentAdmin?.id && (
                          <div className="relative">
                            <button
                              onClick={() => setRoleDropdownOpen(roleDropdownOpen === admin.id ? null : admin.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer whitespace-nowrap transition-colors"
                            >
                              <i className="ri-user-settings-line"></i> Change Role
                              <i className="ri-arrow-down-s-line"></i>
                            </button>
                            {roleDropdownOpen === admin.id && (
                              <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl overflow-hidden z-20 w-52">
                                {(Object.keys(ROLE_CONFIG) as Array<keyof typeof ROLE_CONFIG>).map((role) => {
                                  const cfg = ROLE_CONFIG[role];
                                  const isCurrent = admin.role === role;
                                  return (
                                    <button
                                      key={role}
                                      onClick={() => {
                                        if (!isCurrent) {
                                          setRoleChangeTarget({ admin, newRole: role as typeof admin.role });
                                        }
                                        setRoleDropdownOpen(null);
                                      }}
                                      disabled={isCurrent}
                                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs cursor-pointer transition-colors text-left ${
                                        isCurrent
                                          ? 'bg-slate-50 cursor-not-allowed'
                                          : 'hover:bg-slate-50'
                                      }`}
                                    >
                                      <div className={`w-7 h-7 ${cfg.bg} rounded-lg flex items-center justify-center shrink-0`}>
                                        <i className={`${cfg.icon} ${cfg.color} text-xs`}></i>
                                      </div>
                                      <div>
                                        <p className={`font-semibold ${isCurrent ? 'text-slate-400' : 'text-slate-800'}`}>{cfg.label}</p>
                                        {isCurrent && <p className="text-[10px] text-slate-400">Current role</p>}
                                      </div>
                                      {isCurrent && <i className="ri-check-line text-slate-400 ml-auto"></i>}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Remove — only for non-super admins, not self */}
                        {admin.role !== 'super_admin' && admin.id !== currentAdmin?.id && (
                          <button
                            onClick={() => setShowDeleteModal(admin)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg cursor-pointer whitespace-nowrap transition-colors"
                          >
                            <i className="ri-delete-bin-line"></i> Remove
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {accounts.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-sm">No admin accounts found</div>
          )}
        </div>
      </div>

      {/* Pending Invites */}
      {pendingInvites.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Pending Invites</h3>
              <p className="text-xs text-slate-500 mt-1">Share the link so they can create their account</p>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-full">{pendingInvites.length} pending</span>
          </div>

          {/* Table layout */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Person</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Assigned Role</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Invite Link</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Expires</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingInvites.map((invite) => {
                  const isExpired = new Date(invite.expiresAt) < new Date();
                  const link = `${window.location.origin}/admin/invite?code=${invite.code}`;
                  const roleCfg = getRoleDisplay(invite.role ?? 'admin');
                  return (
                    <tr key={invite.id} className="hover:bg-slate-50 transition-colors">
                      {/* Person */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center shrink-0 text-sm font-bold text-amber-700">
                            {invite.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{invite.name}</p>
                            <p className="text-xs text-slate-500">{invite.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role badge — the dedicated column */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full whitespace-nowrap ${roleCfg.bg} ${roleCfg.color}`}>
                          <i className={`${roleCfg.icon} text-sm`}></i>
                          {roleCfg.label}
                        </span>
                      </td>

                      {/* Link */}
                      <td className="px-6 py-4">
                        <p className="text-[11px] font-mono text-slate-400 truncate max-w-[200px]">{link}</p>
                      </td>

                      {/* Expiry */}
                      <td className="px-6 py-4">
                        {isExpired ? (
                          <span className="text-xs text-red-600 font-semibold bg-red-50 px-2.5 py-1 rounded-full whitespace-nowrap">Expired</span>
                        ) : (
                          <span className="text-xs text-amber-700 font-semibold bg-amber-50 px-2.5 py-1 rounded-full whitespace-nowrap">
                            {new Date(invite.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => copyInviteLink(invite.code)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white hover:bg-slate-700 rounded-lg cursor-pointer whitespace-nowrap transition-colors"
                          >
                            {copiedCode === invite.code ? (
                              <><i className="ri-check-line"></i> Copied!</>
                            ) : (
                              <><i className="ri-clipboard-line"></i> Copy</>
                            )}
                          </button>
                          <button
                            onClick={() => setNewInvite(invite)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer whitespace-nowrap transition-colors border border-slate-200"
                          >
                            <i className="ri-eye-line"></i> View
                          </button>
                          <button
                            onClick={() => handleRevokeInvite(invite)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg cursor-pointer whitespace-nowrap transition-colors border border-red-200"
                          >
                            <i className="ri-forbid-line"></i> Revoke
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {showInviteModal && (
        <InviteModal
          onClose={() => setShowInviteModal(false)}
          onCreated={(invite) => {
            setShowInviteModal(false);
            setNewInvite(invite);
            refresh();
            showToast(`Invite link created for ${invite.name} (${getRoleDisplay(invite.role).label})`);
          }}
        />
      )}

      {newInvite && (
        <InviteLinkModal
          invite={newInvite}
          onClose={() => setNewInvite(null)}
        />
      )}

      {changePasswordTarget && currentAdmin && (
        <ChangePasswordModal
          target={changePasswordTarget}
          currentAdmin={currentAdmin}
          onClose={() => setChangePasswordTarget(null)}
          onSuccess={(msg) => { showToast(msg); refresh(); }}
        />
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDeleteModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-delete-bin-line text-red-500 text-2xl"></i>
              </div>
              <h3 className="text-lg font-bold text-slate-900 text-center">Remove Admin</h3>
              <p className="text-sm text-slate-500 text-center mt-2">
                Are you sure you want to remove <strong className="text-slate-800">{showDeleteModal.name}</strong>? They will lose all access immediately.
              </p>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowDeleteModal(null)} className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer whitespace-nowrap transition-colors">
                  Cancel
                </button>
                <button onClick={() => handleDeleteAdmin(showDeleteModal)} className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer whitespace-nowrap transition-colors">
                  Yes, Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Role Title Modal */}
      {editRoleTitleTarget && (
        <EditRoleTitleModal
          target={editRoleTitleTarget}
          onClose={() => setEditRoleTitleTarget(null)}
          onSaved={(msg) => { showToast(msg); refresh(); }}
        />
      )}

      {roleChangeTarget && (
        <RoleChangeModal
          target={roleChangeTarget.admin}
          newRole={roleChangeTarget.newRole}
          onClose={() => setRoleChangeTarget(null)}
          onConfirm={handleRoleChange}
        />
      )}

      {/* Close role dropdown on outside click */}
      {roleDropdownOpen && (
        <div className="fixed inset-0 z-10" onClick={() => setRoleDropdownOpen(null)}></div>
      )}
    </div>
  );
}
