import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

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
}

const ROLE_LABELS: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  super_admin:     { label: 'Super Admin',     icon: 'ri-shield-star-line',    color: 'text-amber-700',  bg: 'bg-amber-100'  },
  admin:           { label: 'Admin',           icon: 'ri-admin-line',          color: 'text-slate-700',  bg: 'bg-slate-100'  },
  order_manager:   { label: 'Order Manager',   icon: 'ri-shopping-bag-3-line', color: 'text-emerald-700',bg: 'bg-emerald-100'},
  product_manager: { label: 'Product Manager', icon: 'ri-store-2-line',        color: 'text-violet-700', bg: 'bg-violet-100' },
};

function getRoleLabel(role: string): { label: string; icon: string; color: string; bg: string } {
  return ROLE_LABELS[role] ?? { label: role, icon: 'ri-user-settings-line', color: 'text-teal-700', bg: 'bg-teal-100' };
}

export default function AdminInvitePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get('code') ?? '';

  const [invite, setInvite] = useState<AdminInvite | null>(null);
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'expired' | 'used' | 'done'>('loading');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!code) { setStatus('invalid'); return; }

    const invites: AdminInvite[] = (() => {
      try { return JSON.parse(localStorage.getItem('admin_invites') ?? '[]'); } catch { return []; }
    })();

    const found = invites.find((i) => i.code === code);
    if (!found) { setStatus('invalid'); return; }
    if (found.status === 'accepted') { setStatus('used'); return; }
    if (found.status === 'revoked') { setStatus('invalid'); return; }
    if (new Date(found.expiresAt) < new Date()) { setStatus('expired'); return; }

    setInvite(found);
    setStatus('valid');
  }, [code]);

  const handleSetup = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
      setError('Username can only contain letters, numbers, and underscores.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const accounts: AdminAccount[] = (() => {
      try { return JSON.parse(localStorage.getItem('admin_accounts') ?? '[]'); } catch { return []; }
    })();

    if (accounts.some((a) => a.username.toLowerCase() === username.trim().toLowerCase())) {
      setError('That username is already taken. Please choose another.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newAccount: AdminAccount = {
        id: `admin_${Date.now()}`,
        name: invite!.name,
        email: invite!.email,
        username: username.trim().toLowerCase(),
        password,
        role: invite!.role ?? 'admin',
        accessLevel: invite!.accessLevel,
        status: 'active',
        createdAt: new Date().toISOString(),
      };

      const updatedAccounts = [...accounts, newAccount];
      localStorage.setItem('admin_accounts', JSON.stringify(updatedAccounts));

      const invites: AdminInvite[] = (() => {
        try { return JSON.parse(localStorage.getItem('admin_invites') ?? '[]'); } catch { return []; }
      })();
      const updatedInvites = invites.map((i) => i.code === code ? { ...i, status: 'accepted' as const } : i);
      localStorage.setItem('admin_invites', JSON.stringify(updatedInvites));

      setIsSubmitting(false);
      setStatus('done');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">

          {/* Loading */}
          {status === 'loading' && (
            <div className="text-center py-8">
              <i className="ri-loader-4-line text-4xl text-slate-400 animate-spin"></i>
              <p className="text-sm text-slate-500 mt-3">Verifying invite...</p>
            </div>
          )}

          {/* Invalid / Revoked */}
          {status === 'invalid' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-forbid-line text-red-500 text-2xl"></i>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Invalid Invite</h2>
              <p className="text-sm text-slate-500">This invite link is invalid or has been revoked. Please contact your Super Admin for a new one.</p>
              <button onClick={() => navigate('/admin/login')} className="mt-6 px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg cursor-pointer whitespace-nowrap hover:bg-slate-800 transition-colors">
                Go to Admin Login
              </button>
            </div>
          )}

          {/* Expired */}
          {status === 'expired' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-time-line text-amber-500 text-2xl"></i>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Invite Expired</h2>
              <p className="text-sm text-slate-500">This invite link has expired (links are valid for 7 days). Ask your Super Admin to send a new invite.</p>
              <button onClick={() => navigate('/admin/login')} className="mt-6 px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg cursor-pointer whitespace-nowrap hover:bg-slate-800 transition-colors">
                Go to Admin Login
              </button>
            </div>
          )}

          {/* Already used */}
          {status === 'used' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-check-double-line text-emerald-500 text-2xl"></i>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Already Set Up</h2>
              <p className="text-sm text-slate-500">This invite has already been used to create an account. You can log in with your credentials.</p>
              <button onClick={() => navigate('/admin/login')} className="mt-6 px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg cursor-pointer whitespace-nowrap hover:bg-slate-800 transition-colors">
                Go to Admin Login
              </button>
            </div>
          )}

          {/* Done */}
          {status === 'done' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-user-follow-line text-emerald-500 text-2xl"></i>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Account Created!</h2>
              <p className="text-sm text-slate-500">Your admin account is ready. You can now log in with your username and password.</p>
              <button onClick={() => navigate('/admin/login')} className="mt-6 flex items-center gap-2 mx-auto px-6 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg cursor-pointer whitespace-nowrap hover:bg-slate-800 transition-colors">
                <i className="ri-login-box-line"></i> Log In Now
              </button>
            </div>
          )}

          {/* Valid invite — setup form */}
          {status === 'valid' && invite && (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-slate-900 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <i className="ri-shield-keyhole-line text-3xl text-white"></i>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-1">Set Up Your Account</h1>
                <p className="text-sm text-slate-500">Welcome, <strong className="text-slate-700">{invite.name}</strong>! Create your login credentials below.</p>
              </div>

              {/* Pre-filled info */}
              <div className="bg-slate-50 rounded-xl px-4 py-3 mb-4 flex items-center gap-3">
                <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center shrink-0">
                  <i className="ri-mail-line text-slate-600 text-sm"></i>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500">Invited as</p>
                  <p className="text-sm font-semibold text-slate-800">{invite.email}</p>
                </div>
              </div>

              {/* Role badge */}
              {(() => {
                const roleCfg = getRoleLabel(invite.role ?? 'admin');
                const isCustom = !ROLE_LABELS[invite.role ?? 'admin'];
                return (
                  <div className={`flex items-center gap-2.5 rounded-xl px-4 py-3 mb-5 ${roleCfg.bg}`}>
                    <div className="w-8 h-8 bg-white/60 rounded-lg flex items-center justify-center shrink-0">
                      <i className={`${roleCfg.icon} ${roleCfg.color} text-sm`}></i>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">
                        {isCustom ? 'You\'re being invited with a custom role' : 'You\'re being invited as'}
                      </p>
                      <p className={`text-sm font-bold ${roleCfg.color}`}>{roleCfg.label}</p>
                      {isCustom && invite.accessLevel && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          Access level: {ROLE_LABELS[invite.accessLevel]?.label ?? invite.accessLevel}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })()}

              <form onSubmit={handleSetup} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Choose a Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-slate-400 text-sm font-medium">@</span>
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="yourname"
                      required
                      className="w-full pl-8 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all text-sm"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Letters, numbers, and underscores only</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="ri-lock-line text-slate-400"></i>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      required
                      className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all text-sm"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-slate-400 hover:text-slate-600">
                      <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="ri-lock-2-line text-slate-400"></i>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      required
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                    <i className="ri-error-warning-line text-lg shrink-0"></i>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-lg font-semibold text-sm hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {isSubmitting ? (
                    <><i className="ri-loader-4-line animate-spin"></i> Creating account...</>
                  ) : (
                    <><i className="ri-user-add-line"></i> Create My Account</>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
