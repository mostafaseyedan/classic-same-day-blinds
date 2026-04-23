import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ActivityTab from './components/ActivityTab';

interface AdminAccount {
  id: string;
  name: string;
  email: string;
  username: string;
  role: 'super_admin' | 'admin' | 'order_manager' | 'product_manager';
  status: string;
  createdAt: string;
  lastActive?: string;
  avatarColor?: string;
  avatarImage?: string;
  bio?: string;
  phone?: string;
  department?: string;
  location?: string;
  timezone?: string;
  notifReorders?: boolean;
  notifCompetitor?: boolean;
  notifLowStock?: boolean;
  notifTeamChat?: boolean;
  sidebarCollapsed?: boolean;
  densityMode?: 'compact' | 'default' | 'comfortable';
}

interface ActivityEntry {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  category: string;
  detail?: string;
  timestamp: string;
}

const AVATAR_COLORS = [
  { cls: 'bg-amber-500',    hex: '#f59e0b', label: 'Amber'   },
  { cls: 'bg-emerald-500',  hex: '#10b981', label: 'Emerald' },
  { cls: 'bg-rose-500',     hex: '#f43f5e', label: 'Rose'    },
  { cls: 'bg-teal-500',     hex: '#14b8a6', label: 'Teal'    },
  { cls: 'bg-orange-500',   hex: '#f97316', label: 'Orange'  },
  { cls: 'bg-red-600',      hex: '#dc2626', label: 'Red'     },
  { cls: 'bg-pink-500',     hex: '#ec4899', label: 'Pink'    },
  { cls: 'bg-slate-700',    hex: '#334155', label: 'Slate'   },
  { cls: 'bg-stone-500',    hex: '#78716c', label: 'Stone'   },
  { cls: 'bg-lime-600',     hex: '#65a30d', label: 'Lime'    },
  { cls: 'bg-cyan-600',     hex: '#0891b2', label: 'Cyan'    },
  { cls: 'bg-fuchsia-600',  hex: '#c026d3', label: 'Fuchsia' },
];

const TIMEZONES = [
  'America/Los_Angeles', 'America/Denver', 'America/Chicago', 'America/New_York',
  'America/Honolulu', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Asia/Singapore', 'Australia/Sydney',
];

const CATEGORY_COLORS: Record<string, string> = {
  navigation: 'bg-sky-100 text-sky-700',
  orders: 'bg-emerald-100 text-emerald-700',
  products: 'bg-violet-100 text-violet-700',
  users: 'bg-orange-100 text-orange-700',
  settings: 'bg-slate-100 text-slate-600',
  auth: 'bg-rose-100 text-rose-700',
  admin: 'bg-amber-100 text-amber-700',
  alerts: 'bg-red-100 text-red-700',
  reviews: 'bg-teal-100 text-teal-700',
};

const CATEGORY_ICONS: Record<string, string> = {
  navigation: 'ri-compass-3-line',
  orders: 'ri-shopping-bag-3-line',
  products: 'ri-store-2-line',
  users: 'ri-group-line',
  settings: 'ri-settings-4-line',
  auth: 'ri-login-box-line',
  admin: 'ri-shield-user-line',
  alerts: 'ri-alarm-warning-line',
  reviews: 'ri-star-line',
};

function timeAgo(ts: string): string {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 7 * 86400) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function ProfileCompleteness({ account }: { account: AdminAccount }) {
  const fields = [
    { label: 'Name', done: !!account.name },
    { label: 'Email', done: !!account.email },
    { label: 'Bio', done: !!account.bio },
    { label: 'Phone', done: !!account.phone },
    { label: 'Department', done: !!account.department },
    { label: 'Location', done: !!account.location },
    { label: 'Avatar', done: !!account.avatarImage || (account.avatarColor !== 'bg-slate-700' && account.avatarColor !== undefined) },
  ];
  const done = fields.filter((f) => f.done).length;
  const pct = Math.round((done / fields.length) * 100);
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-800">Profile Completeness</h3>
        <span className={`text-sm font-bold ${pct === 100 ? 'text-emerald-600' : pct >= 60 ? 'text-amber-600' : 'text-slate-400'}`}>{pct}%</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2 mb-3">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${pct === 100 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-400' : 'bg-slate-400'}`}
          style={{ width: `${pct}%` }}
        ></div>
      </div>
      <div className="space-y-1.5">
        {fields.map((f) => (
          <div key={f.label} className="flex items-center gap-2">
            <div className={`w-4 h-4 flex items-center justify-center ${f.done ? 'text-emerald-500' : 'text-slate-300'}`}>
              <i className={`${f.done ? 'ri-checkbox-circle-fill' : 'ri-circle-line'} text-sm`}></i>
            </div>
            <span className={`text-xs ${f.done ? 'text-slate-600' : 'text-slate-400'}`}>{f.label}</span>
            {!f.done && <span className="ml-auto text-xs text-slate-300 italic">Missing</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminProfilePage() {
  const navigate = useNavigate();
  const [account, setAccount] = useState<AdminAccount | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'activity' | 'security' | 'preferences'>('profile');

  // Profile fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');
  const [timezone, setTimezone] = useState('America/Los_Angeles');
  const [avatarColor, setAvatarColor] = useState('bg-amber-500');
  const [avatarImage, setAvatarImage] = useState('');
  const [imgError, setImgError] = useState(false);

  // Preferences
  const [notifReorders, setNotifReorders] = useState(true);
  const [notifCompetitor, setNotifCompetitor] = useState(true);
  const [notifLowStock, setNotifLowStock] = useState(true);
  const [notifTeamChat, setNotifTeamChat] = useState(true);
  const [densityMode, setDensityMode] = useState<'compact' | 'default' | 'comfortable'>('default');

  // Security
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [activityLog, setActivityLog] = useState<ActivityEntry[]>([]);
  const [activityCategory, setActivityCategory] = useState<string>('All');

  useEffect(() => {
    const stored = localStorage.getItem('admin_user');
    if (!stored) { navigate('/admin/login'); return; }
    try {
      const user = JSON.parse(stored);
      const accounts: AdminAccount[] = JSON.parse(localStorage.getItem('admin_accounts') ?? '[]');
      const acct = accounts.find((a) => a.id === user.id);
      if (!acct) { navigate('/admin/login'); return; }
      setAccount(acct);
      setName(acct.name ?? '');
      setEmail(acct.email ?? '');
      setBio(acct.bio ?? '');
      setPhone(acct.phone ?? '');
      setDepartment(acct.department ?? '');
      setLocation(acct.location ?? '');
      setTimezone(acct.timezone ?? 'America/Los_Angeles');
      setAvatarColor(acct.avatarColor ?? 'bg-amber-500');
      setAvatarImage(acct.avatarImage ?? '');
      setNotifReorders(acct.notifReorders !== false);
      setNotifCompetitor(acct.notifCompetitor !== false);
      setNotifLowStock(acct.notifLowStock !== false);
      setNotifTeamChat(acct.notifTeamChat !== false);
      setDensityMode(acct.densityMode ?? 'default');

      // Load activity
      try {
        const log: ActivityEntry[] = JSON.parse(localStorage.getItem('admin_activity_log') ?? '[]');
        setActivityLog(log.filter((e) => e.adminId === acct.id).slice(0, 60));
      } catch { /* ignore */ }
    } catch {
      navigate('/admin/login');
    }
  }, [navigate]);

  const filteredActivity = useMemo(() => {
    if (activityCategory === 'All') return activityLog;
    return activityLog.filter((e) => e.category === activityCategory);
  }, [activityLog, activityCategory]);

  const activityStats = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const week = new Date(today); week.setDate(week.getDate() - 7);
    return {
      today: activityLog.filter((e) => new Date(e.timestamp) >= today).length,
      week: activityLog.filter((e) => new Date(e.timestamp) >= week).length,
      total: activityLog.length,
      categories: [...new Set(activityLog.map((e) => e.category))],
    };
  }, [activityLog]);

  const pwdStrength = useMemo(() => {
    if (!newPwd) return 0;
    let score = 0;
    if (newPwd.length >= 8) score++;
    if (newPwd.length >= 12) score++;
    if (/[A-Z]/.test(newPwd)) score++;
    if (/[0-9]/.test(newPwd)) score++;
    if (/[^A-Za-z0-9]/.test(newPwd)) score++;
    return score;
  }, [newPwd]);

  const pwdStrengthLabel = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'][pwdStrength] ?? '';
  const pwdStrengthColor = ['', 'bg-red-400', 'bg-orange-400', 'bg-amber-400', 'bg-emerald-400', 'bg-emerald-600'][pwdStrength] ?? '';

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Display name is required.';
    if (!email.trim()) errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = 'Enter a valid email.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const buildUpdatedAccount = (base: AdminAccount): AdminAccount => ({
    ...base,
    name: name.trim(), email: email.trim(), bio: bio.trim(), phone: phone.trim(),
    department: department.trim(), location: location.trim(), timezone,
    avatarColor, avatarImage: avatarImage.trim(),
    notifReorders, notifCompetitor, notifLowStock, notifTeamChat, densityMode,
  });

  const persistAccount = (updated: AdminAccount) => {
    const accounts: AdminAccount[] = JSON.parse(localStorage.getItem('admin_accounts') ?? '[]');
    const newAccounts = accounts.map((a) => a.id === updated.id ? updated : a);
    localStorage.setItem('admin_accounts', JSON.stringify(newAccounts));
    const user = JSON.parse(localStorage.getItem('admin_user') ?? '{}');
    localStorage.setItem('admin_user', JSON.stringify({ ...user, ...updated }));
    setAccount(updated);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !account) return;
    setIsSaving(true);
    setTimeout(() => {
      try {
        persistAccount(buildUpdatedAccount(account));
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3500);
      } catch { setSaveStatus('error'); setTimeout(() => setSaveStatus('idle'), 3500); }
      setIsSaving(false);
    }, 500);
  };

  const handleSavePreferences = () => {
    if (!account) return;
    persistAccount(buildUpdatedAccount(account));
    setSaveStatus('success');
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  const handleChangePwd = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');
    if (!currentPwd) { setPwdError('Enter your current password.'); return; }
    if (newPwd.length < 8) { setPwdError('New password must be at least 8 characters.'); return; }
    if (newPwd !== confirmPwd) { setPwdError('Passwords do not match.'); return; }
    setPwdSuccess(true);
    setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
    setTimeout(() => setPwdSuccess(false), 4000);
  };

  if (!account) return null;

  const displayInitial = (name.trim() || account.name).charAt(0).toUpperCase();
  const showImg = !!avatarImage && !imgError;
  const roleLabel = account.role === 'super_admin' ? 'Super Admin' : account.role === 'order_manager' ? 'Order Manager' : account.role === 'product_manager' ? 'Product Manager' : 'Admin';
  const roleColor = account.role === 'super_admin' ? 'text-amber-700 bg-amber-100' : account.role === 'order_manager' ? 'text-emerald-700 bg-emerald-100' : account.role === 'product_manager' ? 'text-violet-700 bg-violet-100' : 'text-slate-600 bg-slate-100';
  const roleIcon = account.role === 'super_admin' ? 'ri-shield-star-fill' : account.role === 'order_manager' ? 'ri-shopping-bag-3-line' : account.role === 'product_manager' ? 'ri-store-2-line' : 'ri-shield-user-line';

  const TABS = [
    { id: 'profile',      label: 'Profile',      icon: 'ri-user-3-line'        },
    { id: 'activity',     label: 'Activity',     icon: 'ri-history-line'       },
    { id: 'security',     label: 'Security',     icon: 'ri-shield-keyhole-line'},
    { id: 'preferences',  label: 'Preferences',  icon: 'ri-settings-4-line'    },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">

        {/* Hero card */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-6">
          {/* Cover strip */}
          <div className="h-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 relative">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
          </div>
          <div className="px-8 pb-6">
            <div className="flex items-end gap-5 -mt-8 mb-4">
              {showImg ? (
                <img src={avatarImage} alt={name} className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white shrink-0" onError={() => setImgError(true)} />
              ) : (
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white ring-4 ring-white shrink-0 ${avatarColor}`}>
                  {displayInitial}
                </div>
              )}
              <div className="pb-1 flex-1 flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">{name || account.name}</h1>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${roleColor}`}>
                      <i className={`${roleIcon} text-xs`}></i> {roleLabel}
                    </span>
                    {department && <span className="text-xs text-slate-500 font-medium">{department}</span>}
                    {location && (
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <i className="ri-map-pin-2-line text-xs"></i> {location}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Member since</p>
                    <p className="text-sm font-semibold text-slate-700">
                      {new Date(account.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Actions today</p>
                    <p className="text-sm font-semibold text-slate-700">{activityStats.today}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">This week</p>
                    <p className="text-sm font-semibold text-slate-700">{activityStats.week}</p>
                  </div>
                </div>
              </div>
            </div>
            {bio && <p className="text-sm text-slate-500 mb-4 max-w-2xl">{bio}</p>}
            {/* Tabs */}
            <div className="flex gap-1 border-b border-slate-100">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap -mb-px ${
                    activeTab === tab.id
                      ? 'border-slate-900 text-slate-900'
                      : 'border-transparent text-slate-400 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <i className={`${tab.icon} text-base`}></i>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Profile Tab ──────────────────────────────────────── */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-3 gap-6">
            {/* Left */}
            <div className="space-y-5">
              <ProfileCompleteness account={{ ...account, name, email, bio, phone, department, location, avatarColor, avatarImage }} />

              {/* Avatar color */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <h3 className="text-sm font-bold text-slate-800 mb-1">Avatar Color</h3>
                <p className="text-xs text-slate-400 mb-3">Shown across the admin portal.</p>
                <div className="grid grid-cols-6 gap-2">
                  {AVATAR_COLORS.map((c) => (
                    <button
                      key={c.cls} type="button"
                      onClick={() => { setAvatarColor(c.cls); setAvatarImage(''); setImgError(false); }}
                      title={c.label}
                      className="relative w-8 h-8 rounded-full cursor-pointer transition-transform hover:scale-110 flex items-center justify-center"
                      style={{ backgroundColor: c.hex }}
                    >
                      {avatarColor === c.cls && !showImg && <i className="ri-check-line text-white text-xs font-bold"></i>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <h3 className="text-sm font-bold text-slate-800 mb-1">Profile Photo</h3>
                <p className="text-xs text-slate-400 mb-3">Paste a direct image URL.</p>
                <input
                  type="url" value={avatarImage}
                  onChange={(e) => { setAvatarImage(e.target.value); setImgError(false); }}
                  placeholder="https://..."
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-slate-400 placeholder-slate-300"
                />
                {avatarImage && (
                  <button type="button" onClick={() => { setAvatarImage(''); setImgError(false); }}
                    className="mt-2 text-xs text-red-400 hover:text-red-600 cursor-pointer flex items-center gap-1">
                    <i className="ri-close-circle-line"></i> Remove photo
                  </button>
                )}
                {imgError && <p className="mt-2 text-xs text-red-500 flex items-center gap-1"><i className="ri-error-warning-line"></i> Could not load image.</p>}
              </div>
            </div>

            {/* Right — form */}
            <div className="col-span-2">
              <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Personal Information</h3>
                  <p className="text-sm text-slate-400 mt-0.5">Details shown across the admin portal and to team members.</p>
                </div>

                {/* Name + Email */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Display Name *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <i className="ri-user-line text-slate-400 text-sm"></i>
                      </div>
                      <input type="text" value={name} onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: '' })); }}
                        className={`w-full pl-9 pr-4 py-2.5 text-sm border rounded-xl outline-none transition-colors ${errors.name ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-slate-400'}`}
                        placeholder="Your full name" />
                    </div>
                    {errors.name && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><i className="ri-error-warning-line"></i>{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <i className="ri-mail-line text-slate-400 text-sm"></i>
                      </div>
                      <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })); }}
                        className={`w-full pl-9 pr-4 py-2.5 text-sm border rounded-xl outline-none transition-colors ${errors.email ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-slate-400'}`}
                        placeholder="your@email.com" />
                    </div>
                    {errors.email && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><i className="ri-error-warning-line"></i>{errors.email}</p>}
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Bio</label>
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={2} maxLength={280}
                    className="w-full text-sm border border-slate-200 focus:border-slate-400 rounded-xl px-4 py-2.5 outline-none resize-none transition-colors"
                    placeholder="A short description about yourself or your role..." />
                  <p className="text-right text-xs text-slate-300 mt-0.5">{bio.length}/280</p>
                </div>

                {/* Phone + Dept + Location */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phone</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <i className="ri-phone-line text-slate-400 text-sm"></i>
                      </div>
                      <input value={phone} onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 focus:border-slate-400 rounded-xl outline-none"
                        placeholder="(555) 000-0000" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Department</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <i className="ri-building-line text-slate-400 text-sm"></i>
                      </div>
                      <input value={department} onChange={(e) => setDepartment(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 focus:border-slate-400 rounded-xl outline-none"
                        placeholder="e.g. Operations" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Location</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <i className="ri-map-pin-2-line text-slate-400 text-sm"></i>
                      </div>
                      <input value={location} onChange={(e) => setLocation(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 focus:border-slate-400 rounded-xl outline-none"
                        placeholder="City, State" />
                    </div>
                  </div>
                </div>

                {/* Timezone */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Timezone</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <i className="ri-time-zone-line text-slate-400 text-sm"></i>
                    </div>
                    <select value={timezone} onChange={(e) => setTimezone(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 focus:border-slate-400 rounded-xl outline-none cursor-pointer appearance-none">
                      {TIMEZONES.map((tz) => <option key={tz}>{tz}</option>)}
                    </select>
                  </div>
                </div>

                {/* Read-only */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Role</label>
                    <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl ${roleColor.split(' ')[1] ? roleColor.split(' ')[1] : 'bg-slate-50'}`}>
                      <i className={`${roleIcon} text-sm ${roleColor.split(' ')[0]}`}></i>
                      <span className={`text-sm font-semibold ${roleColor.split(' ')[0]}`}>{roleLabel}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Username</label>
                    <div className="px-4 py-2.5 bg-slate-50 rounded-xl">
                      <span className="text-sm font-mono text-slate-600">{account.username}</span>
                    </div>
                  </div>
                </div>

                {/* Save */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div>
                    {saveStatus === 'success' && <p className="flex items-center gap-2 text-sm font-semibold text-emerald-600"><i className="ri-check-double-line"></i> Saved!</p>}
                    {saveStatus === 'error' && <p className="flex items-center gap-2 text-sm font-semibold text-red-500"><i className="ri-error-warning-line"></i> Something went wrong.</p>}
                  </div>
                  <button type="submit" disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-sm font-semibold rounded-xl cursor-pointer whitespace-nowrap transition-colors">
                    {isSaving ? <><i className="ri-loader-4-line animate-spin"></i> Saving...</> : <><i className="ri-save-line"></i> Save Changes</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Activity Tab ──────────────────────────────────────── */}
        {activeTab === 'activity' && (
          <ActivityTab
            activityLog={activityLog}
            onClear={() => {
              localStorage.removeItem('admin_activity_log');
              setActivityLog([]);
            }}
          />
        )}

        {/* ── Security Tab ──────────────────────────────────────── */}
        {activeTab === 'security' && (
          <div className="grid grid-cols-2 gap-6">
            {/* Change Password */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center shrink-0">
                  <i className="ri-lock-password-line text-rose-600 text-lg"></i>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Change Password</h3>
                  <p className="text-xs text-slate-400">Use a strong, unique password.</p>
                </div>
              </div>
              {pwdSuccess && (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-4">
                  <i className="ri-check-double-line text-emerald-600"></i>
                  <p className="text-sm font-semibold text-emerald-700">Password updated successfully!</p>
                </div>
              )}
              <form onSubmit={handleChangePwd} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Current Password</label>
                  <div className="relative">
                    <input type={showCurrentPwd ? 'text' : 'password'} value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)}
                      className="w-full pr-10 pl-4 py-2.5 text-sm border border-slate-200 focus:border-slate-400 rounded-xl outline-none"
                      placeholder="••••••••" />
                    <button type="button" onClick={() => setShowCurrentPwd((v) => !v)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer">
                      <i className={`${showCurrentPwd ? 'ri-eye-off-line' : 'ri-eye-line'} text-sm`}></i>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">New Password</label>
                  <div className="relative">
                    <input type={showNewPwd ? 'text' : 'password'} value={newPwd} onChange={(e) => setNewPwd(e.target.value)}
                      className="w-full pr-10 pl-4 py-2.5 text-sm border border-slate-200 focus:border-slate-400 rounded-xl outline-none"
                      placeholder="••••••••" />
                    <button type="button" onClick={() => setShowNewPwd((v) => !v)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer">
                      <i className={`${showNewPwd ? 'ri-eye-off-line' : 'ri-eye-line'} text-sm`}></i>
                    </button>
                  </div>
                  {newPwd.length > 0 && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <div key={s} className={`flex-1 h-1.5 rounded-full transition-colors ${s <= pwdStrength ? pwdStrengthColor : 'bg-slate-100'}`}></div>
                        ))}
                      </div>
                      <p className={`text-xs font-semibold ${pwdStrength >= 4 ? 'text-emerald-600' : pwdStrength >= 3 ? 'text-amber-600' : 'text-red-500'}`}>
                        {pwdStrengthLabel}
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Confirm New Password</label>
                  <div className="relative">
                    <input type={showConfirmPwd ? 'text' : 'password'} value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)}
                      className={`w-full pr-10 pl-4 py-2.5 text-sm border rounded-xl outline-none ${confirmPwd && confirmPwd !== newPwd ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-slate-400'}`}
                      placeholder="••••••••" />
                    <button type="button" onClick={() => setShowConfirmPwd((v) => !v)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer">
                      <i className={`${showConfirmPwd ? 'ri-eye-off-line' : 'ri-eye-line'} text-sm`}></i>
                    </button>
                  </div>
                  {confirmPwd && confirmPwd !== newPwd && <p className="mt-1 text-xs text-red-500">Passwords don&apos;t match</p>}
                </div>
                {pwdError && <p className="flex items-center gap-1.5 text-sm text-red-500 font-semibold"><i className="ri-error-warning-line"></i>{pwdError}</p>}
                <button type="submit" className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl cursor-pointer whitespace-nowrap transition-colors">
                  <i className="ri-lock-line"></i> Update Password
                </button>
              </form>
            </div>

            {/* Security overview */}
            <div className="space-y-5">
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                    <i className="ri-shield-check-line text-emerald-600 text-lg"></i>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Account Security</h3>
                    <p className="text-xs text-slate-400">Current session and access details.</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { icon: 'ri-mail-check-line', label: 'Email verified', value: account.email, status: 'ok' },
                    { icon: 'ri-login-circle-line', label: 'Last login', value: account.lastActive ? timeAgo(account.lastActive) : 'Current session', status: 'ok' },
                    { icon: 'ri-user-settings-line', label: 'Role', value: roleLabel, status: 'ok' },
                    { icon: 'ri-smartphone-line', label: 'Two-factor auth', value: 'Not enabled', status: 'warn' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
                      <div className={`w-8 h-8 flex items-center justify-center rounded-lg shrink-0 ${item.status === 'ok' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                        <i className={`${item.icon} text-sm`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-400">{item.label}</p>
                        <p className="text-sm font-semibold text-slate-700 truncate">{item.value}</p>
                      </div>
                      <div className={`w-2 h-2 rounded-full shrink-0 ${item.status === 'ok' ? 'bg-emerald-400' : 'bg-amber-400'}`}></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Danger zone */}
              <div className="bg-white rounded-2xl border border-red-100 p-5">
                <h3 className="text-sm font-bold text-red-700 mb-1 flex items-center gap-2">
                  <i className="ri-alarm-warning-line"></i> Danger Zone
                </h3>
                <p className="text-xs text-slate-400 mb-4">These actions are irreversible. Proceed with caution.</p>
                <div className="space-y-3">
                  <button
                    onClick={() => { localStorage.removeItem('admin_user'); navigate('/admin/login'); }}
                    className="w-full flex items-center gap-3 px-4 py-3 border border-red-200 hover:bg-red-50 rounded-xl cursor-pointer transition-colors group"
                  >
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                      <i className="ri-logout-box-line text-red-500 text-sm"></i>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-red-700">Sign Out</p>
                      <p className="text-xs text-slate-400">End this admin session now.</p>
                    </div>
                    <i className="ri-arrow-right-s-line text-slate-300 group-hover:text-red-400 ml-auto transition-colors"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Preferences Tab ──────────────────────────────────────── */}
        {activeTab === 'preferences' && (
          <div className="grid grid-cols-2 gap-6">
            {/* Notifications */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center shrink-0">
                  <i className="ri-notification-3-line text-sky-600 text-lg"></i>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Notifications</h3>
                  <p className="text-xs text-slate-400">Choose what alerts you want to receive.</p>
                </div>
              </div>
              <div className="space-y-1">
                {[
                  { label: 'Reorder alerts', sub: 'Notify when a customer places a reorder', val: notifReorders, set: setNotifReorders, color: 'bg-emerald-500' },
                  { label: 'Competitor price alerts', sub: 'When a competitor drops price near yours', val: notifCompetitor, set: setNotifCompetitor, color: 'bg-red-500' },
                  { label: 'Low stock alerts', sub: 'When product stock hits reorder threshold', val: notifLowStock, set: setNotifLowStock, color: 'bg-amber-500' },
                  { label: 'Team chat messages', sub: 'Unread message badge in the header', val: notifTeamChat, set: setNotifTeamChat, color: 'bg-violet-500' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-3.5 border-b border-slate-50 last:border-0">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{item.sub}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => item.set((v: boolean) => !v)}
                      className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 ml-4 ${item.val ? item.color : 'bg-slate-200'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${item.val ? 'translate-x-5' : 'translate-x-0'}`}></span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Display preferences */}
            <div className="space-y-5">
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center shrink-0">
                    <i className="ri-layout-4-line text-violet-600 text-lg"></i>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Display</h3>
                    <p className="text-xs text-slate-400">Table density and layout preferences.</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Table Density</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(['compact', 'default', 'comfortable'] as const).map((d) => (
                      <button key={d} type="button" onClick={() => setDensityMode(d)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          densityMode === d ? 'border-slate-900 bg-slate-50' : 'border-slate-100 hover:border-slate-200'
                        }`}>
                        <div className="w-full space-y-1">
                          {d === 'compact' && [4, 3, 4, 3].map((w, i) => <div key={i} className={`h-1 bg-slate-${densityMode === d ? '700' : '200'} rounded`} style={{ width: `${w * 20}%` }}></div>)}
                          {d === 'default' && [4, 3, 4].map((w, i) => <div key={i} className={`h-1.5 bg-slate-${densityMode === d ? '700' : '200'} rounded`} style={{ width: `${w * 20}%` }}></div>)}
                          {d === 'comfortable' && [4, 3].map((w, i) => <div key={i} className={`h-2.5 bg-slate-${densityMode === d ? '700' : '200'} rounded`} style={{ width: `${w * 20}%` }}></div>)}
                        </div>
                        <span className={`text-xs font-semibold capitalize ${densityMode === d ? 'text-slate-900' : 'text-slate-400'}`}>{d}</span>
                        {densityMode === d && <div className="w-4 h-4 bg-slate-900 rounded-full flex items-center justify-center"><i className="ri-check-line text-white text-xs"></i></div>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick links */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <h3 className="text-sm font-bold text-slate-800 mb-3">Quick Navigation</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Dashboard', icon: 'ri-dashboard-line', path: '/admin/dashboard' },
                    { label: 'Orders', icon: 'ri-shopping-bag-3-line', path: '/admin/orders' },
                    { label: 'Customers', icon: 'ri-group-line', path: '/admin/customers' },
                    { label: 'Products', icon: 'ri-store-2-line', path: '/admin/products' },
                    { label: 'Suppliers', icon: 'ri-truck-line', path: '/admin/suppliers' },
                    { label: 'Purchase Orders', icon: 'ri-file-list-3-line', path: '/admin/purchase-orders' },
                  ].map((link) => (
                    <button key={link.path} onClick={() => navigate(link.path)}
                      className="flex items-center gap-2.5 px-3 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors group text-left">
                      <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center border border-slate-200 group-hover:border-slate-300 shrink-0">
                        <i className={`${link.icon} text-slate-600 text-sm`}></i>
                      </div>
                      <span className="text-xs font-semibold text-slate-700">{link.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {saveStatus === 'success' && (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                  <i className="ri-check-double-line text-emerald-600"></i>
                  <p className="text-sm font-semibold text-emerald-700">Preferences saved!</p>
                </div>
              )}

              <button onClick={handleSavePreferences}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl cursor-pointer whitespace-nowrap transition-colors">
                <i className="ri-save-line"></i> Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
