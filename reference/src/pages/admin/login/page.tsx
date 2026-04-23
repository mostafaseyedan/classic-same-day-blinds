import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface AdminAccount {
  id: string;
  name: string;
  email: string;
  username: string;
  password: string;
  role: 'super_admin' | 'admin';
  status: 'active' | 'pending';
  createdAt: string;
  lastLogin?: string;
  lastActive?: string;
}

const SEED_VERSION = 'v3';

function initAdminAccounts(): AdminAccount[] {
  // Force re-seed if stored version is outdated
  const storedVersion = localStorage.getItem('admin_seed_version');
  if (storedVersion !== SEED_VERSION) {
    localStorage.removeItem('admin_accounts');
    localStorage.removeItem('admin_activity_log');
    localStorage.setItem('admin_seed_version', SEED_VERSION);
  }

  const existing: AdminAccount[] = (() => {
    try { return JSON.parse(localStorage.getItem('admin_accounts') ?? '[]'); } catch { return []; }
  })();

  if (existing.length === 0) {
    const now = new Date('2026-03-17T09:50:00Z');
    const mins = (m: number) => new Date(now.getTime() - m * 60 * 1000).toISOString();
    const hrs  = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000).toISOString();
    const days = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000).toISOString();

    const team: AdminAccount[] = [
      {
        id: 'admin_seed_1',
        name: 'Luke Thomas',
        email: 'lukethomas1721@gmail.com',
        username: 'lukethomas1721@gmail.com',
        password: 'Winner72!',
        role: 'super_admin',
        status: 'active',
        createdAt: new Date('2024-01-15T09:00:00Z').toISOString(),
        lastLogin: hrs(1),
        lastActive: mins(8),
      },
      {
        id: 'admin_seed_2',
        name: 'Sarah Chen',
        email: 'sarah@blindsco.com',
        username: 'schen',
        password: 'Admin@2026',
        role: 'admin',
        status: 'active',
        createdAt: new Date('2024-03-10T11:00:00Z').toISOString(),
        lastLogin: hrs(2),
        lastActive: mins(42),
      },
      {
        id: 'admin_seed_3',
        name: 'David Okafor',
        email: 'david@blindsco.com',
        username: 'dokafor',
        password: 'Admin@2026',
        role: 'admin',
        status: 'active',
        createdAt: new Date('2024-06-20T09:00:00Z').toISOString(),
        lastLogin: hrs(18),
        lastActive: hrs(18),
      },
      {
        id: 'admin_seed_4',
        name: 'Priya Patel',
        email: 'priya@blindsco.com',
        username: 'ppatel',
        password: 'Admin@2026',
        role: 'admin',
        status: 'active',
        createdAt: new Date('2025-01-05T10:00:00Z').toISOString(),
        lastLogin: days(2),
        lastActive: days(2),
      },
    ];
    localStorage.setItem('admin_accounts', JSON.stringify(team));
    return team;
  }
  return existing;
}

export default function AdminLoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    initAdminAccounts();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const accounts = initAdminAccounts();
      const found = accounts.find(
        (a) =>
          (a.username.toLowerCase() === identifier.trim().toLowerCase() ||
            a.email.toLowerCase() === identifier.trim().toLowerCase()) &&
          a.password === password &&
          a.status === 'active'
      );

      if (found) {
        const updated = accounts.map((a) =>
          a.id === found.id ? { ...a, lastLogin: new Date().toISOString() } : a
        );
        localStorage.setItem('admin_accounts', JSON.stringify(updated));

        const adminUser = {
          id: found.id,
          name: found.name,
          email: found.email,
          username: found.username,
          role: found.role,
          loginTime: new Date().toISOString(),
        };
        localStorage.setItem('admin_user', JSON.stringify(adminUser));
        navigate('/admin/orders');
      } else {
        setError('Invalid credentials. Please check your username/email and password.');
        setIsLoading(false);
      }
    }, 500);
  };

  const fillSuperAdmin = () => {
    setIdentifier('lukethomas1721@gmail.com');
    setPassword('Winner72!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-slate-900 rounded-xl flex items-center justify-center mx-auto mb-4">
              <i className="ri-shield-keyhole-line text-3xl text-white"></i>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Admin Portal</h1>
            <p className="text-sm text-slate-600">Sign in to access the dashboard</p>
          </div>

          {/* Quick-fill card for super admin */}
          <div
            onClick={fillSuperAdmin}
            className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 cursor-pointer hover:bg-amber-100 transition-colors group"
            title="Click to auto-fill super admin credentials"
          >
            <div className="w-9 h-9 bg-amber-500 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-sm">
              L
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-slate-900">Luke Thomas</p>
                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-200 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                  <i className="ri-shield-star-line text-xs"></i> Super Admin
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5 truncate">lukethomas1721@gmail.com &nbsp;·&nbsp; Winner72!</p>
            </div>
            <span className="text-xs font-semibold text-amber-600 group-hover:underline whitespace-nowrap">
              Use &rarr;
            </span>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-slate-700 mb-2">
                Username or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="ri-user-line text-slate-400"></i>
                </div>
                <input
                  type="text"
                  id="identifier"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all text-sm"
                  placeholder="lukethomas1721@gmail.com"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="ri-lock-line text-slate-400"></i>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all text-sm"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-slate-400 hover:text-slate-600"
                >
                  <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                <i className="ri-error-warning-line text-red-600 text-lg mt-0.5"></i>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <i className="ri-loader-4-line animate-spin"></i>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Other team members */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Other team accounts</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { name: 'Sarah Chen', username: 'schen', initial: 'S' },
                { name: 'David Okafor', username: 'dokafor', initial: 'D' },
                { name: 'Priya Patel', username: 'ppatel', initial: 'P' },
              ].map((m) => (
                <button
                  key={m.username}
                  type="button"
                  onClick={() => { setIdentifier(m.username); setPassword('Admin@2026'); }}
                  className="flex items-center gap-2 px-2.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="w-6 h-6 bg-slate-400 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {m.initial}
                  </div>
                  <span className="text-xs font-medium text-slate-600 truncate">{m.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 text-center mt-3">All accounts use password: <span className="font-mono font-semibold text-slate-500">Admin@2026</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
