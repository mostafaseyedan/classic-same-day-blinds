import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface AdminAccount {
  id: string;
  name: string;
  role: 'super_admin' | 'admin' | 'order_manager' | 'product_manager';
  status: 'active' | 'pending';
  lastLogin?: string;
}

interface AdminInvite {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'order_manager' | 'product_manager';
  status: 'pending' | 'accepted' | 'revoked';
  expiresAt: string;
}

const ROLE_CONFIGS = {
  super_admin:     { label: 'Super Admin',     icon: 'ri-shield-star-line',    color: 'text-amber-700',   bg: 'bg-amber-100',   bar: 'bg-amber-400',   light: 'bg-amber-50'   },
  admin:           { label: 'Admin',           icon: 'ri-admin-line',          color: 'text-slate-700',   bg: 'bg-slate-200',   bar: 'bg-slate-500',   light: 'bg-slate-50'   },
  order_manager:   { label: 'Order Manager',   icon: 'ri-shopping-bag-3-line', color: 'text-emerald-700', bg: 'bg-emerald-100', bar: 'bg-emerald-500', light: 'bg-emerald-50' },
  product_manager: { label: 'Product Manager', icon: 'ri-store-2-line',        color: 'text-violet-700',  bg: 'bg-violet-100',  bar: 'bg-violet-500',  light: 'bg-violet-50'  },
} as const;

export default function TeamRolesWidget() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [pendingInvites, setPendingInvites] = useState<AdminInvite[]>([]);

  useEffect(() => {
    try {
      const stored: AdminAccount[] = JSON.parse(localStorage.getItem('admin_accounts') ?? '[]');
      setAccounts(stored);
    } catch {
      setAccounts([]);
    }
    try {
      const invites: AdminInvite[] = JSON.parse(localStorage.getItem('admin_invites') ?? '[]');
      const now = new Date();
      setPendingInvites(
        invites.filter((i) => i.status === 'pending' && new Date(i.expiresAt) > now)
      );
    } catch {
      setPendingInvites([]);
    }
  }, []);

  const total = accounts.length;

  const roleCounts = (Object.keys(ROLE_CONFIGS) as Array<keyof typeof ROLE_CONFIGS>).map((role) => ({
    role,
    count: accounts.filter((a) => a.role === role).length,
    cfg: ROLE_CONFIGS[role],
  }));

  const activeCount = accounts.filter((a) => a.status === 'active').length;
  const recentLogins = accounts
    .filter((a) => a.lastLogin)
    .sort((a, b) => new Date(b.lastLogin!).getTime() - new Date(a.lastLogin!).getTime())
    .slice(0, 3);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">Admin Team Roles</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {total} admin{total !== 1 ? 's' : ''} &middot; {activeCount} active
            {pendingInvites.length > 0 && ` · ${pendingInvites.length} invite${pendingInvites.length !== 1 ? 's' : ''} pending`}
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/admins')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer whitespace-nowrap transition-colors"
        >
          Manage <i className="ri-arrow-right-line"></i>
        </button>
      </div>

      {total === 0 ? (
        <div className="py-8 text-center text-slate-400 text-sm">
          <i className="ri-team-line text-3xl mb-2 block"></i>
          No admin accounts yet
        </div>
      ) : (
        <>
          {/* Role breakdown bars */}
          <div className="space-y-3">
            {roleCounts.map(({ role, count, cfg }) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={role}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 ${cfg.bg} rounded-md flex items-center justify-center shrink-0`}>
                        <i className={`${cfg.icon} ${cfg.color} text-xs`}></i>
                      </div>
                      <span className="text-xs font-semibold text-slate-700">{cfg.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">{pct}%</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color} whitespace-nowrap`}>
                        {count} {count === 1 ? 'person' : 'people'}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${cfg.bar} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary cards row */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            {roleCounts.map(({ role, count, cfg }) => (
              <div key={role} className={`${cfg.light} rounded-xl px-3 py-3 text-center`}>
                <p className={`text-xl font-bold ${cfg.color}`}>{count}</p>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{cfg.label}</p>
              </div>
            ))}
          </div>

          {/* Pending invites callout */}
          {pendingInvites.length > 0 && (
            <div
              onClick={() => navigate('/admin/admins')}
              className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-amber-100 transition-colors"
            >
              <div className="w-8 h-8 bg-amber-200 rounded-lg flex items-center justify-center shrink-0">
                <i className="ri-mail-send-line text-amber-700 text-sm"></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-amber-800">
                  {pendingInvites.length} invite{pendingInvites.length !== 1 ? 's' : ''} waiting to be accepted
                </p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {pendingInvites.slice(0, 3).map((inv) => {
                    const rc = ROLE_CONFIGS[inv.role ?? 'admin'] ?? ROLE_CONFIGS.admin;
                    return (
                      <span key={inv.id} className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${rc.bg} ${rc.color} whitespace-nowrap`}>
                        {inv.name} · {rc.label}
                      </span>
                    );
                  })}
                  {pendingInvites.length > 3 && (
                    <span className="text-[10px] font-bold text-amber-600">+{pendingInvites.length - 3} more</span>
                  )}
                </div>
              </div>
              <i className="ri-arrow-right-s-line text-amber-500 shrink-0"></i>
            </div>
          )}

          {/* Recent logins */}
          {recentLogins.length > 0 && (
            <div className="pt-1 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Recent Logins</p>
              <div className="space-y-2">
                {recentLogins.map((a) => {
                  const rc = ROLE_CONFIGS[a.role] ?? ROLE_CONFIGS.admin;
                  return (
                    <div key={a.id} className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 ${rc.bg} rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${rc.color}`}>
                        {a.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">{a.name}</p>
                        <p className="text-[10px] text-slate-400">
                          {new Date(a.lastLogin!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap ${rc.bg} ${rc.color}`}>
                        {rc.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
