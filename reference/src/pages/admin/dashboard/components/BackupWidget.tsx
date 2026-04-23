import { useState, useEffect, useCallback } from 'react';
import {
  runBackup,
  fetchRecentBackups,
  shouldRunAutoBackup,
  formatBytes,
  type BackupRecord,
} from '../../../../utils/backupService';

export default function BackupWidget() {
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [expanded, setExpanded] = useState(false);

  const loadBackups = useCallback(async () => {
    const data = await fetchRecentBackups();
    setBackups(data);
    setLoading(false);
  }, []);

  // Auto-backup once per day
  useEffect(() => {
    (async () => {
      if (shouldRunAutoBackup()) {
        const result = await runBackup('auto');
        if (result.success) {
          await loadBackups();
        }
      } else {
        await loadBackups();
      }
    })();
  }, [loadBackups]);

  const handleManualBackup = async () => {
    setRunning(true);
    setToast(null);
    const result = await runBackup('manual');
    setRunning(false);
    if (result.success) {
      setToast({ type: 'success', msg: `Backup saved — ${result.recordCount ?? 0} records (${formatBytes(result.sizeBytes ?? 0)})` });
      await loadBackups();
    } else {
      setToast({ type: 'error', msg: result.error ?? 'Backup failed' });
    }
    setTimeout(() => setToast(null), 4000);
  };

  const latestBackup = backups[0];

  function formatRelativeDate(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  }

  function formatBackupDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  function formatBackupTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center">
            <i className="ri-cloud-line text-emerald-600 text-lg"></i>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Daily Backup</h3>
            <p className="text-xs text-slate-400">Products &amp; orders auto-saved to Supabase</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {latestBackup && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full whitespace-nowrap">
              <i className="ri-checkbox-circle-fill text-xs"></i>
              {formatRelativeDate(latestBackup.created_at)}
            </span>
          )}
          <button
            onClick={handleManualBackup}
            disabled={running}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-400 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className={`ri-save-line ${running ? 'animate-spin' : ''}`}></i>
            {running ? 'Backing up...' : 'Backup Now'}
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`mx-5 mt-4 flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
          toast.type === 'success'
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          <i className={toast.type === 'success' ? 'ri-checkbox-circle-line' : 'ri-error-warning-line'}></i>
          {toast.msg}
        </div>
      )}

      {/* Summary row */}
      <div className="px-5 py-4 grid grid-cols-3 gap-4 border-b border-slate-50">
        <div className="text-center">
          <p className="text-lg font-bold text-slate-900">{backups.length}</p>
          <p className="text-xs text-slate-400 mt-0.5">Total Backups</p>
        </div>
        <div className="text-center border-x border-slate-100">
          <p className="text-lg font-bold text-emerald-700">
            {latestBackup ? latestBackup.record_count.toLocaleString() : '—'}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Records (Latest)</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-slate-700">
            {latestBackup ? formatBytes(latestBackup.size_bytes) : '—'}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Size (Latest)</p>
        </div>
      </div>

      {/* Backup list */}
      <div className="px-5 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-6 text-slate-400">
            <i className="ri-loader-4-line animate-spin text-xl mr-2"></i>
            <span className="text-sm">Loading backup history…</span>
          </div>
        ) : backups.length === 0 ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-2">
              <i className="ri-cloud-off-line text-slate-300 text-2xl"></i>
            </div>
            <p className="text-sm text-slate-500 font-medium">No backups yet</p>
            <p className="text-xs text-slate-400 mt-0.5">Click &quot;Backup Now&quot; to create your first backup</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {(expanded ? backups : backups.slice(0, 4)).map((backup) => (
                <div
                  key={backup.id}
                  className="flex items-center justify-between bg-slate-50 rounded-lg px-3.5 py-2.5"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center shrink-0">
                      <i className={`text-sm ${
                        backup.status === 'completed'
                          ? 'ri-checkbox-circle-fill text-emerald-500'
                          : 'ri-error-warning-fill text-red-400'
                      }`}></i>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-slate-900">
                          {formatBackupDate(backup.backup_date)}
                        </p>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                          backup.triggered_by === 'auto'
                            ? 'bg-slate-100 text-slate-500'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {backup.triggered_by === 'auto' ? 'Auto' : 'Manual'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">
                        {formatBackupTime(backup.created_at)} · {backup.notes ?? `${backup.record_count} records`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="text-xs font-semibold text-slate-700">{formatBytes(backup.size_bytes)}</p>
                    <p className="text-xs text-slate-400">{backup.record_count.toLocaleString()} records</p>
                  </div>
                </div>
              ))}
            </div>
            {backups.length > 4 && (
              <button
                onClick={() => setExpanded((prev) => !prev)}
                className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 py-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
              >
                <i className={`ri-arrow-${expanded ? 'up' : 'down'}-s-line`}></i>
                {expanded ? 'Show less' : `Show ${backups.length - 4} more`}
              </button>
            )}
          </>
        )}
      </div>

      {/* Auto-backup info footer */}
      <div className="px-5 py-3 border-t border-slate-50 bg-slate-50/50 flex items-center gap-2">
        <div className="w-4 h-4 flex items-center justify-center">
          <i className="ri-time-line text-slate-400 text-xs"></i>
        </div>
        <p className="text-xs text-slate-400">
          Auto-backup runs once daily when you visit this dashboard. All backups are stored securely in Supabase.
        </p>
      </div>
    </div>
  );
}
