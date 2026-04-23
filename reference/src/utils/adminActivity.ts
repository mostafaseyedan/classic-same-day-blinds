export interface ActivityEntry {
  id: string;
  adminId: string;
  adminName: string;
  adminRole: string;
  action: string;
  category: 'navigation' | 'auth' | 'admin' | 'orders' | 'products' | 'users' | 'settings' | 'alerts' | 'reviews';
  detail?: string;
  timestamp: string;
}

const MAX_ENTRIES = 600;

export function logActivity(entry: Omit<ActivityEntry, 'id' | 'timestamp'>): void {
  try {
    const existing: ActivityEntry[] = JSON.parse(localStorage.getItem('admin_activity_log') ?? '[]');
    const newEntry: ActivityEntry = {
      ...entry,
      id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    const updated = [newEntry, ...existing].slice(0, MAX_ENTRIES);
    localStorage.setItem('admin_activity_log', JSON.stringify(updated));
  } catch {
    // silently ignore
  }
}

export function getActivityLog(): ActivityEntry[] {
  try {
    return JSON.parse(localStorage.getItem('admin_activity_log') ?? '[]');
  } catch {
    return [];
  }
}

export function updateAdminLastActive(adminId: string): void {
  try {
    const accounts: any[] = JSON.parse(localStorage.getItem('admin_accounts') ?? '[]');
    const updated = accounts.map((a) =>
      a.id === adminId ? { ...a, lastActive: new Date().toISOString() } : a
    );
    localStorage.setItem('admin_accounts', JSON.stringify(updated));
  } catch {
    // silently ignore
  }
}

/** Seed initial admin accounts if the list is empty */
export function seedInitialAdmins(): void {
  try {
    const SEED_VERSION = 'v3';
    const storedVersion = localStorage.getItem('admin_seed_version');
    if (storedVersion === SEED_VERSION) return; // already on latest seed

    // Clear old data so we re-seed with updated accounts
    localStorage.removeItem('admin_accounts');
    localStorage.removeItem('admin_activity_log');

    const now = new Date('2026-03-17T09:50:00Z');
    const mins = (m: number) => new Date(now.getTime() - m * 60 * 1000).toISOString();
    const hrs  = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000).toISOString();
    const days = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000).toISOString();

    const admins = [
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

    localStorage.setItem('admin_accounts', JSON.stringify(admins));
    localStorage.setItem('admin_seed_version', SEED_VERSION);
  } catch {
    // silently ignore
  }
}

/** Seed a rich sample activity log if the log is empty */
export function seedActivityLog(): void {
  try {
    const existing: any[] = JSON.parse(localStorage.getItem('admin_activity_log') ?? '[]');
    if (existing.length > 0) return;

    const now = new Date('2026-03-17T09:50:00Z');
    const mins = (m: number) => new Date(now.getTime() - m * 60 * 1000).toISOString();
    const hrs = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000).toISOString();
    const days = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000).toISOString();

    const entries: ActivityEntry[] = [
      { id: 'a1', adminId: 'admin_seed_1', adminName: 'Luke Thomas', adminRole: 'super_admin', action: 'Viewed Dashboard', category: 'navigation', detail: 'Opened the main dashboard', timestamp: mins(8) },
      { id: 'a2', adminId: 'admin_seed_1', adminName: 'Luke Thomas', adminRole: 'super_admin', action: 'Viewed Orders', category: 'orders', detail: 'Browsed the orders list', timestamp: mins(15) },
      { id: 'a3', adminId: 'admin_seed_2', adminName: 'Sarah Chen', adminRole: 'admin', action: 'Viewed Products', category: 'products', detail: 'Browsed the product catalog', timestamp: mins(40) },
      { id: 'a4', adminId: 'admin_seed_2', adminName: 'Sarah Chen', adminRole: 'admin', action: 'Viewed Restock Requests', category: 'products', detail: 'Checked pending restock requests', timestamp: mins(42) },
      { id: 'a5', adminId: 'admin_seed_1', adminName: 'Luke Thomas', adminRole: 'super_admin', action: 'Logged In', category: 'auth', detail: 'Signed in from admin portal', timestamp: hrs(1) + '' },
      { id: 'a6', adminId: 'admin_seed_2', adminName: 'Sarah Chen', adminRole: 'admin', action: 'Logged In', category: 'auth', detail: 'Signed in from admin portal', timestamp: hrs(2) + '' },
      { id: 'a7', adminId: 'admin_seed_1', adminName: 'Luke Thomas', adminRole: 'super_admin', action: 'Managed Admins', category: 'admin', detail: 'Visited admin accounts page', timestamp: hrs(3) },
      { id: 'a8', adminId: 'admin_seed_2', adminName: 'Sarah Chen', adminRole: 'admin', action: 'Viewed Email Alerts', category: 'alerts', detail: 'Checked email alert configuration', timestamp: hrs(4) },
      { id: 'a9', adminId: 'admin_seed_3', adminName: 'David Okafor', adminRole: 'admin', action: 'Logged In', category: 'auth', detail: 'Signed in from admin portal', timestamp: hrs(18) },
      { id: 'a10', adminId: 'admin_seed_3', adminName: 'David Okafor', adminRole: 'admin', action: 'Viewed Users', category: 'users', detail: 'Browsed the customer accounts list', timestamp: hrs(18) },
      { id: 'a11', adminId: 'admin_seed_3', adminName: 'David Okafor', adminRole: 'admin', action: 'Viewed Reviews', category: 'reviews', detail: 'Checked customer reviews', timestamp: hrs(19) },
      { id: 'a12', adminId: 'admin_seed_3', adminName: 'David Okafor', adminRole: 'admin', action: 'Logged Out', category: 'auth', detail: 'Signed out of admin portal', timestamp: hrs(20) },
      { id: 'a13', adminId: 'admin_seed_1', adminName: 'Luke Thomas', adminRole: 'super_admin', action: 'Logged In', category: 'auth', detail: 'Signed in from admin portal', timestamp: days(1) },
      { id: 'a14', adminId: 'admin_seed_1', adminName: 'Luke Thomas', adminRole: 'super_admin', action: 'Viewed Dashboard', category: 'navigation', detail: 'Reviewed daily metrics', timestamp: days(1) },
      { id: 'a15', adminId: 'admin_seed_4', adminName: 'Priya Patel', adminRole: 'admin', action: 'Logged In', category: 'auth', detail: 'Signed in from admin portal', timestamp: days(2) },
      { id: 'a16', adminId: 'admin_seed_4', adminName: 'Priya Patel', adminRole: 'admin', action: 'Viewed Orders', category: 'orders', detail: 'Checked new order queue', timestamp: days(2) },
      { id: 'a17', adminId: 'admin_seed_4', adminName: 'Priya Patel', adminRole: 'admin', action: 'Viewed Visitors', category: 'navigation', detail: 'Reviewed visitor analytics', timestamp: days(2) },
      { id: 'a18', adminId: 'admin_seed_4', adminName: 'Priya Patel', adminRole: 'admin', action: 'Logged Out', category: 'auth', detail: 'Signed out of admin portal', timestamp: days(2) },
      { id: 'a19', adminId: 'admin_seed_2', adminName: 'Sarah Chen', adminRole: 'admin', action: 'Logged In', category: 'auth', detail: 'Signed in from admin portal', timestamp: days(3) },
      { id: 'a20', adminId: 'admin_seed_2', adminName: 'Sarah Chen', adminRole: 'admin', action: 'Viewed Restock History', category: 'products', detail: 'Reviewed past restock entries', timestamp: days(3) },
    ];

    localStorage.setItem('admin_activity_log', JSON.stringify(entries));
  } catch {
    // silently ignore
  }
}

/** Format relative last-active time */
export function formatLastActive(iso: string | undefined): string {
  if (!iso) return 'Never';
  const diff = Date.now() - new Date(iso).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return 'Just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Get a colour class for freshness of last-active */
export function lastActiveColor(iso: string | undefined): string {
  if (!iso) return 'text-slate-500';
  const diff = Date.now() - new Date(iso).getTime();
  const hrs = diff / (1000 * 60 * 60);
  if (hrs < 1) return 'text-emerald-400';
  if (hrs < 8) return 'text-amber-400';
  return 'text-slate-500';
}
