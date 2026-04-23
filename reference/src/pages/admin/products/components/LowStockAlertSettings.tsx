import { useState, useEffect } from 'react';

interface AlertSettings {
  email: string;
  threshold: number;
  enabled: boolean;
}

interface LowStockAlertSettingsProps {
  onClose: () => void;
  products: { id: number; name: string; inventory: number }[];
}

function loadAlertSettings(): AlertSettings {
  try {
    const stored = localStorage.getItem('low_stock_alert_settings');
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.warn('Could not load alert settings:', e);
  }
  return { email: '', threshold: 100, enabled: true };
}

function saveAlertSettings(settings: AlertSettings) {
  localStorage.setItem('low_stock_alert_settings', JSON.stringify(settings));
}

export default function LowStockAlertSettings({ onClose, products }: LowStockAlertSettingsProps) {
  const [settings, setSettings] = useState<AlertSettings>(loadAlertSettings);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const lowStockProducts = products.filter(p => p.inventory > 0 && p.inventory < settings.threshold);
  const outOfStockProducts = products.filter(p => p.inventory === 0);
  const alertProducts = [...outOfStockProducts, ...lowStockProducts];

  const handleSaveSettings = () => {
    saveAlertSettings(settings);
    window.dispatchEvent(new CustomEvent('alertSettingsUpdated', { detail: settings }));
  };

  const handleSendAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings.email) { setError('Please enter an email address.'); return; }
    if (alertProducts.length === 0) { setError('No products are currently below the threshold.'); return; }
    setError('');
    setSending(true);

    const productList = alertProducts
      .map(p => `${p.name} — ${p.inventory === 0 ? 'OUT OF STOCK' : `${p.inventory} units left`}`)
      .join('\n');

    const body = new URLSearchParams();
    body.append('email', settings.email);
    body.append('threshold', String(settings.threshold));
    body.append('alert_products', productList);
    body.append('total_alerts', String(alertProducts.length));
    body.append('sent_at', new Date().toLocaleString());

    try {
      await fetch('https://readdy.ai/api/form/d6r3fptsbgrc47fimdlg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
      handleSaveSettings();
      setSubmitted(true);

      // Log alert to history
      const alertLog = JSON.parse(localStorage.getItem('low_stock_alert_log') || '[]');
      alertLog.unshift({
        id: Date.now(),
        email: settings.email,
        threshold: settings.threshold,
        products: alertProducts.map(p => ({ name: p.name, inventory: p.inventory })),
        sentAt: Date.now(),
      });
      localStorage.setItem('low_stock_alert_log', JSON.stringify(alertLog.slice(0, 50)));
    } catch (err) {
      setError('Failed to send alert. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center bg-amber-50 rounded-lg">
              <i className="ri-mail-send-line text-amber-600 text-lg"></i>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Low Stock Email Alerts</h3>
              <p className="text-xs text-slate-500">Get notified when inventory drops below threshold</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>

        {submitted ? (
          <div className="px-6 py-10 text-center">
            <div className="w-14 h-14 flex items-center justify-center bg-green-50 rounded-full mx-auto mb-4">
              <i className="ri-checkbox-circle-line text-green-600 text-3xl"></i>
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-1">Alert Sent!</h4>
            <p className="text-sm text-slate-500 mb-1">
              A low stock alert was sent to <strong>{settings.email}</strong>
            </p>
            <p className="text-xs text-slate-400 mb-6">
              {alertProducts.length} product{alertProducts.length !== 1 ? 's' : ''} included in the alert
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
            >
              Done
            </button>
          </div>
        ) : (
          <form data-readdy-form onSubmit={handleSendAlert} className="px-6 py-5 space-y-5">
            {/* Alert threshold info */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 flex items-center justify-center text-amber-600 mt-0.5 shrink-0">
                  <i className="ri-alert-line"></i>
                </div>
                <div>
                  <p className="text-sm font-semibold text-amber-800">
                    {alertProducts.length} product{alertProducts.length !== 1 ? 's' : ''} need attention
                  </p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    {outOfStockProducts.length} out of stock · {lowStockProducts.length} below {settings.threshold} units
                  </p>
                </div>
              </div>
              {alertProducts.length > 0 && (
                <div className="mt-3 space-y-1.5 max-h-32 overflow-y-auto">
                  {alertProducts.map(p => (
                    <div key={p.id} className="flex items-center justify-between text-xs bg-white rounded-lg px-3 py-1.5 border border-amber-100">
                      <span className="text-slate-700 font-medium truncate max-w-[220px]">{p.name}</span>
                      <span className={`font-semibold whitespace-nowrap ml-2 ${p.inventory === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                        {p.inventory === 0 ? 'Out of stock' : `${p.inventory} left`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Email input */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Send alert to
              </label>
              <input
                type="email"
                name="email"
                value={settings.email}
                onChange={(e) => setSettings(s => ({ ...s, email: e.target.value }))}
                placeholder="your@email.com"
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                required
              />
            </div>

            {/* Threshold input */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Alert threshold (units)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  name="threshold"
                  min="1"
                  max="10000"
                  value={settings.threshold}
                  onChange={(e) => setSettings(s => ({ ...s, threshold: parseInt(e.target.value) || 100 }))}
                  className="w-32 px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                />
                <p className="text-xs text-slate-500">
                  Alert triggers when inventory drops below this number
                </p>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
                <i className="ri-error-warning-line"></i>
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => { handleSaveSettings(); onClose(); }}
                className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                Save Settings Only
              </button>
              <button
                type="submit"
                disabled={sending || alertProducts.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 text-white text-sm font-semibold rounded-lg hover:bg-amber-700 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <>
                    <i className="ri-loader-4-line animate-spin"></i>
                    Sending...
                  </>
                ) : (
                  <>
                    <i className="ri-mail-send-line"></i>
                    Send Alert Now
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
