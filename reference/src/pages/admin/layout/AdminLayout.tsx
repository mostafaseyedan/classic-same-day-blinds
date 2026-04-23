import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  logActivity,
  updateAdminLastActive,
  seedInitialAdmins,
  seedActivityLog,
  formatLastActive,
  lastActiveColor,
} from '../../../utils/adminActivity';
import AdminTeamDrawer from './AdminTeamDrawer';
import MessagingHub from './MessagingHub';
import NotificationsPanel, { useUnreadNotifications, pushNotification } from './NotificationsPanel';
import { supabase } from '../../../utils/supabaseClient';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  accessLevel?: string;
  username?: string;
  lastActive?: string;
  avatarColor?: string;
  avatarImage?: string;
}

function getReorderCount(): number {
  try {
    const stored: any[] = JSON.parse(localStorage.getItem('orders') ?? '[]');
    return stored.filter((o) => o.isReorder === true).length;
  } catch {
    return 0;
  }
}

function getLatestReorder(): any | null {
  try {
    const stored: any[] = JSON.parse(localStorage.getItem('orders') ?? '[]');
    const reorders = stored.filter((o) => o.isReorder === true);
    if (reorders.length === 0) return null;
    return reorders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  } catch {
    return null;
  }
}

function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const playTone = (freq: number, startTime: number, duration: number, gain: number) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };
    const now = ctx.currentTime;
    playTone(880, now, 0.25, 0.4);
    playTone(1100, now + 0.15, 0.25, 0.35);
    playTone(1320, now + 0.30, 0.4, 0.3);
  } catch {
    // silently ignore
  }
}

async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

function showBrowserNotification(title: string, body: string) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const n = new Notification(title, {
    body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'new-reorder',
  });
  setTimeout(() => n.close(), 6000);
}

async function sendReorderSummaryEmail(adminEmail: string, reorder: any): Promise<boolean> {
  try {
    const customerName = reorder?.customer?.firstName
      ? `${reorder.customer.firstName} ${reorder.customer.lastName ?? ''}`.trim()
      : 'Unknown Customer';
    const customerEmail = reorder?.customer?.email ?? '—';
    const companyName = reorder?.customer?.companyName ?? '';
    const orderId = reorder?.id ?? '—';
    const orderDate = reorder?.date
      ? new Date(reorder.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : '—';
    const orderTotal = reorder?.total
      ? `$${Number(reorder.total).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : '—';
    const originalOrderId = reorder?.originalOrderId ?? '—';
    const itemsSummary = (reorder?.items ?? [])
      .map((item: any) => `${item.name} × ${item.quantity} (${item.size ?? ''})`)
      .join(', ') || '—';

    const body = new URLSearchParams();
    body.append('email', adminEmail);
    body.append('order_id', orderId);
    body.append('original_order_id', originalOrderId);
    body.append('customer_name', customerName);
    body.append('customer_email', customerEmail);
    body.append('company_name', companyName);
    body.append('order_date', orderDate);
    body.append('order_total', orderTotal);
    body.append('items_summary', itemsSummary);
    body.append('alert_type', 'New Reorder Received');

    const res = await fetch('https://readdy.ai/api/form/d6rnan4ddmmni7ck8vu0', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function sendCompetitorAlertEmail(adminEmail: string, alert: any): Promise<boolean> {
  try {
    const priceDiff = alert.ourPrice - alert.newPrice;
    const body = new URLSearchParams();
    body.append('email', adminEmail);
    body.append('product_name', alert.productName);
    body.append('competitor', alert.competitor);
    body.append('new_competitor_price', `$${Number(alert.newPrice).toFixed(2)}`);
    body.append('our_price', `$${Number(alert.ourPrice).toFixed(2)}`);
    body.append('price_difference', `${priceDiff >= 0 ? '-' : '+'}$${Math.abs(priceDiff).toFixed(2)}`);
    body.append('alert_type', alert.newPrice <= alert.ourPrice ? 'Competitor Price Below Ours' : 'Competitor Price In Warning Zone');
    body.append('detected_at', new Date(alert.timestamp).toLocaleString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
    }));
    const res = await fetch('https://readdy.ai/api/form/d6uf2tlt4s7j0tv5i36g', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ── Email Alert Settings Modal ─────────────────────────────────────────────
interface EmailAlertSettingsModalProps {
  onClose: () => void;
}

function EmailAlertSettingsModal({ onClose }: EmailAlertSettingsModalProps) {
  const [alertEmail, setAlertEmail] = useState<string>(
    () => localStorage.getItem('reorder_alert_email') ?? ''
  );
  const [enabled, setEnabled] = useState<boolean>(
    () => localStorage.getItem('reorder_alert_enabled') === 'true'
  );
  const [saved, setSaved] = useState(false);
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('reorder_alert_email', alertEmail.trim());
    localStorage.setItem('reorder_alert_enabled', enabled ? 'true' : 'false');
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleTestEmail = async () => {
    if (!alertEmail.trim()) return;
    setTestSending(true);
    setTestResult(null);
    const mockReorder = {
      id: 'ORD-TEST-001',
      originalOrderId: 'ORD-10001',
      date: new Date().toISOString(),
      total: 12450.00,
      customer: {
        firstName: 'Test',
        lastName: 'Customer',
        email: 'test@example.com',
        companyName: 'Test Company',
      },
      items: [
        { name: 'Faux Wood Blinds', quantity: 50, size: '36" x 60"' },
        { name: 'Roller Shades', quantity: 30, size: '42" x 72"' },
      ],
    };
    const ok = await sendReorderSummaryEmail(alertEmail.trim(), mockReorder);
    setTestSending(false);
    setTestResult(ok ? 'success' : 'error');
    setTimeout(() => setTestResult(null), 4000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[80] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
              <i className="ri-mail-settings-line text-emerald-600 text-lg"></i>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Reorder Email Alerts</h3>
              <p className="text-xs text-slate-500 mt-0.5">Get notified by email when a new reorder comes in</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 cursor-pointer transition-colors">
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>

        <form id="reorder-email-alert-form" data-readdy-form onSubmit={handleSave} className="px-6 py-5 space-y-5">
          <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Email Alerts</p>
              <p className="text-xs text-slate-500 mt-0.5">Send a summary email for every new reorder</p>
            </div>
            <button
              type="button"
              onClick={() => setEnabled((v) => !v)}
              className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${enabled ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Alert Email Address</label>
            <input
              type="email"
              name="email"
              value={alertEmail}
              onChange={(e) => setAlertEmail(e.target.value)}
              placeholder="you@yourbusiness.com"
              required
              className="w-full text-sm border border-slate-200 focus:border-emerald-400 rounded-lg px-3 py-2.5 outline-none text-slate-700 placeholder-slate-400"
            />
            <p className="text-xs text-slate-400 mt-1.5">A summary will be sent here each time a customer places a reorder.</p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 space-y-1.5">
            <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">Each alert includes:</p>
            {['Reorder ID & original order reference', 'Customer name, email & company', 'Full items list with quantities & sizes', 'Order total & date placed'].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <div className="w-4 h-4 flex items-center justify-center text-emerald-600 shrink-0">
                  <i className="ri-check-line text-sm"></i>
                </div>
                <span className="text-xs text-emerald-800">{item}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleTestEmail}
              disabled={!alertEmail.trim() || testSending}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 disabled:text-slate-300 text-slate-700 text-sm font-semibold rounded-lg cursor-pointer whitespace-nowrap transition-colors"
            >
              {testSending ? <><i className="ri-loader-4-line animate-spin"></i> Sending test...</> : <><i className="ri-send-plane-line"></i> Send Test Email</>}
            </button>
            {testResult === 'success' && <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600"><i className="ri-check-line"></i> Test sent!</span>}
            {testResult === 'error' && <span className="flex items-center gap-1 text-xs font-semibold text-red-500"><i className="ri-error-warning-line"></i> Failed to send</span>}
          </div>

          <div className="flex items-center justify-end gap-3 pt-1 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer whitespace-nowrap transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg cursor-pointer whitespace-nowrap transition-colors">
              {saved ? <><i className="ri-check-line"></i> Saved!</> : <><i className="ri-save-line"></i> Save Settings</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Role-based nav paths ───────────────────────────────────────────────────
const ROLE_NAV_PATHS: Record<string, string[]> = {
  super_admin: ['*'],
  admin: [
    '/admin/dashboard', '/admin/orders', '/admin/products',
    '/admin/restock-requests', '/admin/restock-history', '/admin/competitor-pricing',
    '/admin/customers', '/admin/companies', '/admin/suppliers', '/admin/purchase-orders',
    '/admin/users', '/admin/email-alerts', '/admin/visitors', '/admin/reviews', '/admin/profile', '/admin/settings',
  ],
  order_manager: [
    '/admin/dashboard', '/admin/orders', '/admin/customers', '/admin/companies',
    '/admin/suppliers', '/admin/purchase-orders',
    '/admin/users', '/admin/email-alerts', '/admin/visitors', '/admin/reviews', '/admin/profile',
  ],
  product_manager: [
    '/admin/dashboard', '/admin/products', '/admin/restock-requests',
    '/admin/restock-history', '/admin/competitor-pricing',
    '/admin/suppliers', '/admin/purchase-orders', '/admin/profile',
  ],
};

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { path: '/admin/dashboard', icon: 'ri-dashboard-3-line', label: 'Dashboard' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { path: '/admin/orders',          icon: 'ri-shopping-bag-3-line', label: 'Orders' },
      { path: '/admin/products',        icon: 'ri-store-2-line',        label: 'Products' },
      { path: '/admin/customers',       icon: 'ri-group-line',          label: 'Customers' },
      { path: '/admin/companies',       icon: 'ri-building-2-line',     label: 'Companies' },
      { path: '/admin/suppliers',       icon: 'ri-truck-line',          label: 'Suppliers' },
      { path: '/admin/purchase-orders', icon: 'ri-file-list-3-line',    label: 'Purchase Orders' },
    ],
  },
  {
    label: 'Inventory',
    items: [
      { path: '/admin/restock-requests',   icon: 'ri-inbox-archive-line',  label: 'Restock Requests' },
      { path: '/admin/restock-history',    icon: 'ri-history-line',         label: 'Restock History' },
      { path: '/admin/competitor-pricing', icon: 'ri-price-tag-3-line',     label: 'Competitor Pricing' },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { path: '/admin/visitors', icon: 'ri-line-chart-line', label: 'Visitors' },
      { path: '/admin/reviews',  icon: 'ri-star-line',       label: 'Reviews' },
    ],
  },
  {
    label: 'Admin',
    items: [
      { path: '/admin/users',        icon: 'ri-user-line',           label: 'Users' },
      { path: '/admin/email-alerts', icon: 'ri-notification-3-line', label: 'Email Alerts' },
      { path: '/admin/admins',       icon: 'ri-shield-user-line',    label: 'Admins' },
      { path: '/admin/settings',     icon: 'ri-settings-3-line',     label: 'System Settings' },
    ],
  },
  {
    label: 'Account',
    items: [
      { path: '/admin/profile', icon: 'ri-user-settings-line', label: 'My Profile' },
    ],
  },
];

// flat list for role filtering (keep backward compat)
const ALL_NAV_ITEMS = NAV_SECTIONS.flatMap((s) => s.items);

export default function AdminLayout() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [reorderCount, setReorderCount] = useState<number>(getReorderCount);
  const [notifPermission, setNotifPermission] = useState<'granted' | 'denied' | 'default'>(
    'Notification' in window ? (Notification.permission as 'granted' | 'denied' | 'default') : 'denied'
  );
  const [newReorderAlert, setNewReorderAlert] = useState<string | null>(null);
  const [showEmailAlertSettings, setShowEmailAlertSettings] = useState(false);
  const [sidebarAdmins, setSidebarAdmins] = useState<AdminUser[]>([]);
  const [showTeamDrawer, setShowTeamDrawer] = useState(false);
  const [headerAvatarError, setHeaderAvatarError] = useState(false);
  const [navSearch, setNavSearch] = useState('');
  const [tooltipItem, setTooltipItem] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  // ── Team Chat ────────────────────────────────────────────────────────────
  const [showChat, setShowChat] = useState(false);
  const [chatUnread, setChatUnread] = useState(0);

  // ── Supabase notification badge ──────────────────────────────────────────
  const notifUnreadCount = useUnreadNotifications();

  // ── DM unread count from Supabase ─────────────────────────────────────────
  const [dmUnreadCount, setDmUnreadCount] = useState(0);

  const prevReorderCountRef = useRef<number>(getReorderCount());

  const [competitorAlertToast, setCompetitorAlertToast] = useState<any | null>(null);
  const [competitorAlertBadge, setCompetitorAlertBadge] = useState<number>(0);
  const competitorAlertSeenRef = useRef<Set<string>>(new Set());

  const navigate = useNavigate();
  const location = useLocation();

  // ── Load DM unread count ────────────────────────────────────────────────
  const loadDmUnread = useCallback(async () => {
    const adminId = (() => {
      try {
        const raw = localStorage.getItem('admin_user');
        return raw ? JSON.parse(raw).id : null;
      } catch { return null; }
    })();
    if (!adminId) return;
    const { count } = await supabase
      .from('direct_messages')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', adminId)
      .eq('read', false);
    setDmUnreadCount(count ?? 0);
  }, []);

  useEffect(() => {
    loadDmUnread();
    const channel = supabase
      .channel('dm_unread_badge')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'direct_messages' }, loadDmUnread)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'direct_messages' }, loadDmUnread)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadDmUnread]);

  useEffect(() => {
    seedInitialAdmins();
    seedActivityLog();
  }, []);

  useEffect(() => {
    const storedAdmin = localStorage.getItem('admin_user');
    if (!storedAdmin) {
      navigate('/admin/login');
      return;
    }
    try {
      const parsed = JSON.parse(storedAdmin);
      const accounts: any[] = JSON.parse(localStorage.getItem('admin_accounts') ?? '[]');
      const acct = accounts.find((a: any) => a.id === parsed.id);
      if (acct) {
        parsed.avatarColor = acct.avatarColor;
        parsed.avatarImage = acct.avatarImage;
        parsed.name = acct.name;
        parsed.email = acct.email;
        parsed.role = acct.role;
        parsed.accessLevel = acct.accessLevel;
      }
      setAdminUser(parsed);
      setHeaderAvatarError(false);
      logActivity({
        adminId: parsed.id,
        adminName: parsed.name,
        adminRole: parsed.role,
        action: 'Logged In',
        category: 'auth',
        detail: 'Started admin session',
      });
    } catch {
      navigate('/admin/login');
    }
  }, [navigate]);

  useEffect(() => {
    const loadAdmins = () => {
      try {
        const accounts = JSON.parse(localStorage.getItem('admin_accounts') ?? '[]') as AdminUser[];
        setSidebarAdmins(accounts);
      } catch {
        setSidebarAdmins([]);
      }
    };
    loadAdmins();
  }, [location.pathname]);

  useEffect(() => {
    if (!adminUser) return;

    const pathToLabel: Record<string, { action: string; category: 'navigation' | 'auth' | 'admin' | 'orders' | 'products' | 'users' | 'settings' | 'alerts' | 'reviews' }> = {
      '/admin/dashboard':           { action: 'Viewed Dashboard',          category: 'navigation' },
      '/admin/orders':              { action: 'Viewed Orders',             category: 'orders' },
      '/admin/products':            { action: 'Viewed Products',           category: 'products' },
      '/admin/restock-requests':    { action: 'Viewed Restock Requests',   category: 'products' },
      '/admin/restock-history':     { action: 'Viewed Restock History',    category: 'products' },
      '/admin/users':               { action: 'Viewed Users',              category: 'users' },
      '/admin/email-alerts':        { action: 'Viewed Email Alerts',       category: 'alerts' },
      '/admin/visitors':            { action: 'Viewed Visitors',           category: 'navigation' },
      '/admin/reviews':             { action: 'Viewed Reviews',            category: 'reviews' },
      '/admin/admins':              { action: 'Managed Admins',            category: 'admin' },
      '/admin/profile':             { action: 'Viewed Profile Settings',   category: 'settings' },
      '/admin/competitor-pricing':  { action: 'Viewed Competitor Pricing', category: 'navigation' },
      '/admin/settings':            { action: 'Viewed System Settings',    category: 'settings' },
    };

    const entry = pathToLabel[location.pathname];
    if (entry) {
      logActivity({
        adminId: adminUser.id,
        adminName: adminUser.name,
        adminRole: adminUser.role,
        action: entry.action,
        category: entry.category,
      });
      updateAdminLastActive(adminUser.id);
    }
  }, [location.pathname, adminUser]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      requestNotificationPermission().then((granted) => {
        setNotifPermission(granted ? 'granted' : 'denied');
      });
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      const newCount = getReorderCount();
      setReorderCount(newCount);

      if (newCount > prevReorderCountRef.current) {
        const diff = newCount - prevReorderCountRef.current;
        const latest = getLatestReorder();
        const customerName = latest?.customer?.firstName
          ? `${latest.customer.firstName} ${latest.customer.lastName ?? ''}`.trim()
          : 'A customer';
        const alertMsg = `${diff} new reorder${diff > 1 ? 's' : ''} from ${customerName}`;

        playNotificationSound();
        showBrowserNotification(
          `New Reorder${diff > 1 ? 's' : ''} Received!`,
          `${customerName} just placed a reorder. Check the Reorders tab.`
        );
        setNewReorderAlert(alertMsg);
        setTimeout(() => setNewReorderAlert(null), 5000);

        // Push to Supabase notifications
        await pushNotification(
          'reorder',
          `New Reorder${diff > 1 ? 's' : ''} Received!`,
          `${customerName} placed a reorder — ${diff} new order${diff > 1 ? 's' : ''}.`,
          '/admin/orders',
          { customer: customerName, count: diff }
        );

        const alertEmail = localStorage.getItem('reorder_alert_email') ?? '';
        const alertEnabled = localStorage.getItem('reorder_alert_enabled') === 'true';
        if (alertEnabled && alertEmail && latest) {
          sendReorderSummaryEmail(alertEmail, latest);
        }
      }

      prevReorderCountRef.current = newCount;
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const newCount = getReorderCount();
    setReorderCount(newCount);
    prevReorderCountRef.current = newCount;
  }, [location.pathname]);

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotifPermission(granted ? 'granted' : 'denied');
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_user');
    navigate('/admin/login');
  };

  useEffect(() => {
    const checkCompetitorAlerts = async () => {
      const queue: any[] = JSON.parse(localStorage.getItem('competitor_price_alerts_queue') ?? '[]');
      const unread = queue.filter((a) => !a.notified && !a.dismissed);
      setCompetitorAlertBadge(queue.filter((a) => !a.dismissed).length);

      const alertEnabled = localStorage.getItem('competitor_alert_enabled') === 'true';
      if (!alertEnabled) return;

      const unseen = unread.filter((a) => !competitorAlertSeenRef.current.has(a.id));
      if (unseen.length === 0) return;

      unseen.forEach((a) => competitorAlertSeenRef.current.add(a.id));
      const updatedQueue = queue.map((a) => ({
        ...a,
        notified: unseen.some((u) => u.id === a.id) ? true : a.notified,
      }));
      localStorage.setItem('competitor_price_alerts_queue', JSON.stringify(updatedQueue));

      const latest = unseen[0];
      setCompetitorAlertToast(latest);
      playNotificationSound();

      // Push to Supabase
      await pushNotification(
        'competitor_alert',
        'Competitor Price Alert!',
        `${latest.competitor}: ${latest.productName} dropped to $${Number(latest.newPrice).toFixed(2)} — our price: $${Number(latest.ourPrice).toFixed(2)}`,
        '/admin/competitor-pricing',
        { competitor: latest.competitor, product: latest.productName }
      );

      const alertEmail = localStorage.getItem('competitor_alert_email') ?? '';
      if (alertEmail) sendCompetitorAlertEmail(alertEmail, latest);
      setTimeout(() => setCompetitorAlertToast(null), 8000);
    };

    checkCompetitorAlerts();
    const interval = setInterval(checkCompetitorAlerts, 15000);
    return () => clearInterval(interval);
  }, []);

  // ── Unread chat tracking (when panel is closed) ────────────────────────────
  useEffect(() => {
    if (showChat) return;
    const handler = (e: StorageEvent) => {
      if (e.key !== 'team_chat_messages') return;
      const lastRead = Number(localStorage.getItem('team_chat_last_read') ?? 0);
      try {
        const msgs: any[] = JSON.parse(e.newValue ?? '[]');
        const count = msgs.filter((m) => m.timestamp > lastRead && m.senderId !== 'system').length;
        setChatUnread(count);
      } catch { /* ignore */ }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [showChat]);

  useEffect(() => {
    const queue: any[] = JSON.parse(localStorage.getItem('competitor_price_alerts_queue') ?? '[]');
    setCompetitorAlertBadge(queue.filter((a) => !a.dismissed).length);
  }, [location.pathname]);

  // ── Role-filtered nav ──────────────────────────────────────────────────────
  const navRole = adminUser?.accessLevel ?? adminUser?.role ?? 'admin';
  const allowedPaths = ROLE_NAV_PATHS[navRole] ?? ROLE_NAV_PATHS.admin;

  const filteredSections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter(
      (item) => allowedPaths[0] === '*' || allowedPaths.includes(item.path)
    ),
  })).filter((section) => section.items.length > 0);

  const searchedSections = navSearch.trim()
    ? filteredSections.map((s) => ({
        ...s,
        items: s.items.filter((i) =>
          i.label.toLowerCase().includes(navSearch.toLowerCase())
        ),
      })).filter((s) => s.items.length > 0)
    : filteredSections;

  const navItems = ALL_NAV_ITEMS.filter(
    (item) => allowedPaths[0] === '*' || allowedPaths.includes(item.path)
  );

  const getPageTitle = () => {
    if (location.pathname === '/admin' || location.pathname === '/admin/') return 'Dashboard';
    const item = navItems.find((i) => location.pathname === i.path);
    return item ? item.label : 'Dashboard';
  };

  const isEmailAlertActive = localStorage.getItem('reorder_alert_enabled') === 'true'
    && !!localStorage.getItem('reorder_alert_email');

  const roleLabel = adminUser?.role === 'super_admin'
    ? 'Super Admin'
    : adminUser?.role === 'order_manager'
    ? 'Order Manager'
    : adminUser?.role === 'product_manager'
    ? 'Product Manager'
    : 'Admin';

  const roleColor = adminUser?.role === 'super_admin'
    ? 'text-amber-400'
    : adminUser?.role === 'order_manager'
    ? 'text-emerald-400'
    : adminUser?.role === 'product_manager'
    ? 'text-violet-400'
    : 'text-slate-400';

  if (!adminUser) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {showEmailAlertSettings && (
        <EmailAlertSettingsModal onClose={() => setShowEmailAlertSettings(false)} />
      )}

      {/* New Reorder Alert Toast */}
      {newReorderAlert && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl">
          <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center shrink-0">
            <i className="ri-refresh-line text-white text-lg"></i>
          </div>
          <div>
            <p className="text-sm font-bold">New Reorder Alert!</p>
            <p className="text-xs text-emerald-100">{newReorderAlert}</p>
          </div>
          <button
            onClick={() => { setNewReorderAlert(null); navigate('/admin/orders'); }}
            className="ml-2 flex items-center gap-1 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer whitespace-nowrap transition-colors"
          >
            View <i className="ri-arrow-right-line"></i>
          </button>
          <button onClick={() => setNewReorderAlert(null)} className="w-6 h-6 flex items-center justify-center text-white/70 hover:text-white cursor-pointer">
            <i className="ri-close-line text-sm"></i>
          </button>
        </div>
      )}

      {/* Competitor Price Alert Toast */}
      {competitorAlertToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 bg-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl">
          <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center shrink-0">
            <i className="ri-alarm-warning-line text-white text-lg"></i>
          </div>
          <div>
            <p className="text-sm font-bold">Competitor Price Alert!</p>
            <p className="text-xs text-red-100">
              {competitorAlertToast.competitor}: {competitorAlertToast.productName} dropped to ${Number(competitorAlertToast.newPrice).toFixed(2)} — within range of our ${Number(competitorAlertToast.ourPrice).toFixed(2)}
            </p>
          </div>
          <button
            onClick={() => { setCompetitorAlertToast(null); navigate('/admin/competitor-pricing'); }}
            className="ml-2 flex items-center gap-1 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer whitespace-nowrap transition-colors"
          >
            View <i className="ri-arrow-right-line"></i>
          </button>
          <button onClick={() => setCompetitorAlertToast(null)} className="w-6 h-6 flex items-center justify-center text-white/70 hover:text-white cursor-pointer">
            <i className="ri-close-line text-sm"></i>
          </button>
        </div>
      )}

      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <aside
        className={`${isSidebarOpen ? 'w-64' : 'w-[72px]'} shrink-0 flex flex-col transition-all duration-300 relative`}
        style={{ background: 'linear-gradient(180deg, #0f172a 0%, #111827 100%)' }}
      >
        {/* Subtle top accent line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />

        {/* ── Logo / Brand ──────────────────────────────────────────────── */}
        <div className={`h-16 flex items-center border-b border-white/5 shrink-0 ${isSidebarOpen ? 'px-5 gap-3' : 'justify-center'}`}>
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shrink-0">
            <i className="ri-dashboard-3-line text-white text-base"></i>
          </div>
          {isSidebarOpen && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-white text-sm leading-tight">AdminPanel</span>
              <span className="text-[10px] text-emerald-400 font-medium leading-tight">Control Center</span>
            </div>
          )}
        </div>

        {/* ── Search ────────────────────────────────────────────────────── */}
        {isSidebarOpen && (
          <div className="px-3 pt-4 pb-2 shrink-0">
            <div className="flex items-center gap-2 bg-white/5 border border-white/8 rounded-lg px-3 py-2 focus-within:border-emerald-500/40 transition-colors">
              <i className="ri-search-line text-slate-500 text-sm shrink-0"></i>
              <input
                type="text"
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                placeholder="Search menu..."
                className="flex-1 bg-transparent text-xs text-slate-300 placeholder-slate-600 outline-none"
              />
              {navSearch && (
                <button onClick={() => setNavSearch('')} className="w-4 h-4 flex items-center justify-center text-slate-600 hover:text-slate-400 cursor-pointer">
                  <i className="ri-close-line text-xs"></i>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Navigation ────────────────────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto py-2 space-y-0.5 px-2">
          {searchedSections.map((section, si) => (
            <div key={section.label} className={si > 0 ? 'pt-3' : ''}>
              {/* Section label */}
              {isSidebarOpen && (
                <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-600 select-none">
                  {section.label}
                </p>
              )}
              {!isSidebarOpen && si > 0 && (
                <div className="mx-3 my-2 h-px bg-white/5" />
              )}

              {section.items.map((item) => {
                const isActive = location.pathname === item.path;
                const isOrders = item.path === '/admin/orders';
                const isCompetitor = item.path === '/admin/competitor-pricing';
                const badge = isOrders && reorderCount > 0
                  ? reorderCount
                  : isCompetitor && competitorAlertBadge > 0
                  ? competitorAlertBadge
                  : 0;
                const badgeColor = isOrders ? 'bg-emerald-500' : 'bg-red-500';

                return (
                  <div
                    key={item.path}
                    className="relative"
                    onMouseEnter={() => !isSidebarOpen && setTooltipItem(item.path)}
                    onMouseLeave={() => setTooltipItem(null)}
                  >
                    <button
                      onClick={() => navigate(item.path)}
                      className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-150 whitespace-nowrap group cursor-pointer ${
                        isActive
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                      }`}
                    >
                      {/* Left active bar */}
                      <span
                        className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 rounded-r-full transition-all duration-200 ${
                          isActive ? 'h-5 bg-emerald-400' : 'h-0 bg-transparent'
                        }`}
                      />

                      {/* Icon */}
                      <div className={`relative w-5 h-5 flex items-center justify-center shrink-0 ${isActive ? 'text-emerald-400' : ''}`}>
                        <i className={`${item.icon} text-base`}></i>
                        {badge > 0 && !isSidebarOpen && (
                          <span className={`absolute -top-1.5 -right-1.5 min-w-[14px] h-3.5 ${badgeColor} text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none`}>
                            {badge > 99 ? '99+' : badge}
                          </span>
                        )}
                      </div>

                      {/* Label */}
                      {isSidebarOpen && (
                        <>
                          <span className="text-sm font-medium flex-1 text-left leading-none">{item.label}</span>
                          {badge > 0 && (
                            <span className={`${badgeColor} text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none whitespace-nowrap`}>
                              {badge > 99 ? '99+' : badge}
                            </span>
                          )}
                        </>
                      )}
                    </button>

                    {/* Tooltip (collapsed only) */}
                    {!isSidebarOpen && tooltipItem === item.path && (
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 pointer-events-none">
                        <div className="bg-slate-800 border border-white/10 text-slate-100 text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap">
                          {item.label}
                          {badge > 0 && (
                            <span className={`ml-2 ${badgeColor} text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full`}>
                              {badge}
                            </span>
                          )}
                        </div>
                        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-800" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </nav>

        {/* ── Team Access Panel ─────────────────────────────────────────── */}
        {isSidebarOpen && sidebarAdmins.length > 0 && (
          <div className="px-3 pb-2 shrink-0">
            <div
              className="border border-white/8 rounded-xl overflow-hidden cursor-pointer hover:border-white/15 transition-colors"
              onClick={() => setShowTeamDrawer(true)}
            >
              <div className="flex items-center justify-between px-3 py-2 bg-white/5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Backend Access</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-600">{sidebarAdmins.length}</span>
                  <i className="ri-arrow-right-s-line text-xs text-slate-700"></i>
                </div>
              </div>
              <div className="divide-y divide-white/5">
                {sidebarAdmins.slice(0, 3).map((admin) => (
                  <div key={admin.id} className="flex items-center gap-2.5 px-3 py-2 hover:bg-white/5 transition-colors">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${admin.role === 'super_admin' ? 'bg-amber-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                      {admin.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-slate-300 truncate leading-tight">{admin.name}</p>
                      <p className={`text-[10px] leading-tight ${lastActiveColor((admin as any).lastActive)}`}>
                        {formatLastActive((admin as any).lastActive)}
                      </p>
                    </div>
                    {admin.role === 'super_admin' && <i className="ri-shield-star-fill text-[10px] text-amber-400 shrink-0"></i>}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-1 py-1.5 text-[10px] font-bold text-slate-600 hover:text-slate-400 bg-white/3 transition-colors">
                <i className="ri-team-line text-xs"></i> View all admins
              </div>
            </div>
          </div>
        )}

        {/* Compact avatars when collapsed */}
        {!isSidebarOpen && sidebarAdmins.length > 0 && (
          <div className="pb-2 flex flex-col items-center gap-1.5 px-2">
            <div className="w-full h-px bg-white/5 mb-1"></div>
            {sidebarAdmins.slice(0, 3).map((admin) => (
              <div
                key={admin.id}
                title={`${admin.name} · ${formatLastActive((admin as any).lastActive)}`}
                onClick={() => setShowTeamDrawer(true)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer hover:opacity-80 transition-opacity ${admin.role === 'super_admin' ? 'bg-amber-500 text-white' : 'bg-slate-700 text-slate-300'}`}
              >
                {admin.name.charAt(0).toUpperCase()}
              </div>
            ))}
            {sidebarAdmins.length > 3 && (
              <div
                onClick={() => setShowTeamDrawer(true)}
                className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-[10px] font-bold text-slate-400 cursor-pointer hover:bg-slate-700 transition-colors"
              >
                +{sidebarAdmins.length - 3}
              </div>
            )}
          </div>
        )}

        {/* ── Notification / Email Status ───────────────────────────────── */}
        {isSidebarOpen && (
          <div className="px-3 pb-2 space-y-1.5 shrink-0">
            <button
              onClick={() => setShowEmailAlertSettings(true)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap transition-all border ${
                isEmailAlertActive
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                  : 'bg-white/5 border-white/8 text-slate-500 hover:bg-white/8 hover:text-slate-300'
              }`}
            >
              <i className={`ri-mail-${isEmailAlertActive ? 'check' : 'settings'}-line text-sm`}></i>
              <span>{isEmailAlertActive ? 'Email Alerts ON' : 'Set Up Email Alerts'}</span>
              {isEmailAlertActive && <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse ml-auto shrink-0"></div>}
            </button>

            {notifPermission === 'granted' && (
              <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/8 border border-emerald-500/15 rounded-lg">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shrink-0"></div>
                <span className="text-xs text-emerald-500 font-semibold">Push alerts enabled</span>
              </div>
            )}
            {notifPermission !== 'granted' && notifPermission !== 'denied' && (
              <button
                onClick={handleEnableNotifications}
                className="w-full flex items-center gap-2 px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors"
              >
                <i className="ri-notification-line text-sm"></i> Enable Notifications
              </button>
            )}
          </div>
        )}

        {/* ── User card ─────────────────────────────────────────────────── */}
        <div className={`border-t border-white/5 shrink-0 ${isSidebarOpen ? 'p-3' : 'py-3 px-2'}`}>
          {isSidebarOpen ? (
            <div
              className="flex items-center gap-3 px-3 py-2.5 bg-white/5 hover:bg-white/8 border border-white/8 rounded-xl cursor-pointer transition-colors group"
              onClick={() => navigate('/admin/profile')}
            >
              {adminUser.avatarImage && !headerAvatarError ? (
                <img
                  src={adminUser.avatarImage}
                  alt={adminUser.name}
                  className="w-8 h-8 rounded-full object-cover shrink-0"
                  onError={() => setHeaderAvatarError(true)}
                />
              ) : (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold text-white ${adminUser.avatarColor ?? (adminUser.role === 'super_admin' ? 'bg-amber-500' : 'bg-emerald-600')}`}>
                  {adminUser.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-200 truncate leading-tight">{adminUser.name}</p>
                <p className={`text-[10px] font-medium leading-tight ${roleColor}`}>{roleLabel}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); navigate('/admin/profile'); }}
                  className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-300 cursor-pointer transition-colors"
                >
                  <i className="ri-settings-4-line text-sm"></i>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleLogout(); }}
                  className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-red-400 cursor-pointer transition-colors"
                >
                  <i className="ri-logout-box-r-line text-sm"></i>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <div
                onClick={() => navigate('/admin/profile')}
                className="relative cursor-pointer"
                onMouseEnter={() => setTooltipItem('__user__')}
                onMouseLeave={() => setTooltipItem(null)}
              >
                {adminUser.avatarImage && !headerAvatarError ? (
                  <img
                    src={adminUser.avatarImage}
                    alt={adminUser.name}
                    className="w-9 h-9 rounded-full object-cover"
                    onError={() => setHeaderAvatarError(true)}
                  />
                ) : (
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white ${adminUser.avatarColor ?? (adminUser.role === 'super_admin' ? 'bg-amber-500' : 'bg-emerald-600')}`}>
                    {adminUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
                {tooltipItem === '__user__' && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 pointer-events-none">
                    <div className="bg-slate-800 border border-white/10 text-slate-100 text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap">
                      <p>{adminUser.name}</p>
                      <p className={`text-[10px] font-normal ${roleColor}`}>{roleLabel}</p>
                    </div>
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-800" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Collapse toggle ───────────────────────────────────────────── */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="h-10 flex items-center justify-center border-t border-white/5 hover:bg-white/5 transition-colors text-slate-600 hover:text-slate-300 shrink-0 cursor-pointer"
        >
          <i className={`${isSidebarOpen ? 'ri-arrow-left-double-line' : 'ri-arrow-right-double-line'} text-base`}></i>
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{getPageTitle()}</h1>
            <p className="text-xs text-slate-500">Manage your {getPageTitle().toLowerCase()}</p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowEmailAlertSettings(true)}
              className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                isEmailAlertActive ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              <i className={`ri-mail-${isEmailAlertActive ? 'check' : 'settings'}-line text-base`}></i>
              <span className="hidden lg:inline">Email Alerts</span>
              {isEmailAlertActive && <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>}
            </button>

            {/* ── Messaging Hub ──────────────────────────────────────────────── */}
            <button
              onClick={() => { setShowChat(true); setChatUnread(0); }}
              className="relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-chat-smile-2-line text-base"></i>
              </div>
              <span className="hidden lg:inline">Messaging</span>
              {(chatUnread + dmUnreadCount) > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                  {(chatUnread + dmUnreadCount) > 9 ? '9+' : chatUnread + dmUnreadCount}
                </span>
              )}
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications((v) => !v)}
                className={`relative w-9 h-9 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                  showNotifications ? 'bg-emerald-100 text-emerald-600' :
                  notifUnreadCount > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                }`}
              >
                <i className={`${notifUnreadCount > 0 ? 'ri-notification-4-line' : 'ri-notification-3-line'} text-lg`}></i>
                {notifUnreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
                    {notifUnreadCount > 99 ? '99+' : notifUnreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <NotificationsPanel onClose={() => setShowNotifications(false)} />
              )}
            </div>

            <button onClick={() => navigate('/')} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors whitespace-nowrap cursor-pointer">
              <i className="ri-home-line"></i>
              <span>View Site</span>
            </button>

            <div className="h-8 w-px bg-slate-200"></div>

            <button
              type="button"
              onClick={() => navigate('/admin/profile')}
              className="flex items-center gap-3 cursor-pointer hover:opacity-75 transition-opacity group"
            >
              <div className="text-right">
                <div className="flex items-center gap-1 justify-end">
                  <p className="text-sm font-medium text-slate-900">{adminUser.name}</p>
                  <i className="ri-settings-4-line text-xs text-slate-300 group-hover:text-slate-500 transition-colors"></i>
                </div>
                <p className="text-xs text-slate-500">
                  {adminUser.role === 'super_admin'
                    ? <span className="text-amber-600 font-semibold">Super Admin</span>
                    : adminUser.role === 'order_manager'
                    ? <span className="text-emerald-600 font-semibold">Order Manager</span>
                    : adminUser.role === 'product_manager'
                    ? <span className="text-violet-600 font-semibold">Product Manager</span>
                    : adminUser.email}
                </p>
              </div>
              {adminUser.avatarImage && !headerAvatarError ? (
                <img
                  src={adminUser.avatarImage}
                  alt={adminUser.name}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={() => setHeaderAvatarError(true)}
                />
              ) : (
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${adminUser.avatarColor ?? (adminUser.role === 'super_admin' ? 'bg-amber-500' : 'bg-slate-900')}`}>
                  <span className="text-white font-bold text-sm">{adminUser.name.charAt(0).toUpperCase()}</span>
                </div>
              )}
            </button>

            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap cursor-pointer">
              <i className="ri-logout-box-line"></i>
              <span>Logout</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>

      {showTeamDrawer && (
        <AdminTeamDrawer
          onClose={() => setShowTeamDrawer(false)}
          currentAdminId={adminUser?.id}
        />
      )}

      {showChat && (
        <MessagingHub
          onClose={() => setShowChat(false)}
          onUnreadChange={(n) => setChatUnread(n)}
        />
      )}
    </div>
  );
}
