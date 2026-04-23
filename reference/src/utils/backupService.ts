import { loadProductsFromDB } from './productStorage';

const EDGE_FUNCTION_URL = 'https://xvxylzvkdljvgunvotqv.supabase.co/functions/v1/daily-backup';
const LAST_BACKUP_KEY = 'last_auto_backup_date';

export interface BackupRecord {
  id: string;
  backup_date: string;
  backup_type: string;
  record_count: number;
  size_bytes: number;
  status: string;
  triggered_by: string;
  notes: string | null;
  created_at: string;
}

export interface BackupResult {
  success: boolean;
  error?: string;
  recordCount?: number;
  sizeBytes?: number;
  message?: string;
}

function loadOrdersFromStorage(): any[] {
  try {
    return JSON.parse(localStorage.getItem('orders') ?? '[]');
  } catch {
    return [];
  }
}

function loadRestockFromStorage(): any[] {
  try {
    return JSON.parse(localStorage.getItem('restock_history') ?? '[]');
  } catch {
    return [];
  }
}

export async function runBackup(
  triggeredBy: 'auto' | 'manual' = 'manual',
): Promise<BackupResult> {
  try {
    const [products, orders, restockHistory] = await Promise.all([
      loadProductsFromDB(),
      Promise.resolve(loadOrdersFromStorage()),
      Promise.resolve(loadRestockFromStorage()),
    ]);

    const safeProducts = products ?? [];
    const safeOrders = orders ?? [];

    const backupData = {
      products: safeProducts,
      orders: safeOrders,
      restock_history: restockHistory,
      backup_timestamp: new Date().toISOString(),
      app_version: '1.0',
    };

    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        backup_type: 'full',
        data: backupData,
        triggered_by: triggeredBy,
        notes: `${safeProducts.length} products, ${safeOrders.length} orders`,
      }),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(errBody.error ?? `HTTP ${response.status}`);
    }

    const result = await response.json();

    if (triggeredBy === 'auto') {
      localStorage.setItem(LAST_BACKUP_KEY, new Date().toISOString());
    }

    return {
      success: true,
      recordCount: result.record_count,
      sizeBytes: result.size_bytes,
      message: result.message,
    };
  } catch (err: any) {
    return { success: false, error: err?.message ?? 'Unknown error' };
  }
}

export async function fetchRecentBackups(): Promise<BackupRecord[]> {
  try {
    const response = await fetch(EDGE_FUNCTION_URL, { method: 'GET' });
    if (!response.ok) return [];
    const result = await response.json();
    return result.backups ?? [];
  } catch {
    return [];
  }
}

export function getLastAutoBackupDate(): string | null {
  return localStorage.getItem(LAST_BACKUP_KEY);
}

export function shouldRunAutoBackup(): boolean {
  const last = getLastAutoBackupDate();
  if (!last) return true;
  return new Date(last).toDateString() !== new Date().toDateString();
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
