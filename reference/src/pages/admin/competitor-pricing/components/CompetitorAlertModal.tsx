import { useState } from 'react';

interface Props {
  onClose: () => void;
}

async function sendTestAlert(email: string): Promise<boolean> {
  try {
    const body = new URLSearchParams();
    body.append('email', email);
    body.append('product_name', '2" Faux Wood Blinds (TEST)');
    body.append('competitor', 'Blinds.com');
    body.append('new_competitor_price', '$24.99');
    body.append('our_price', '$27.14');
    body.append('price_difference', '-$2.15');
    body.append('alert_type', 'TEST — Competitor Price Below Ours');
    body.append('detected_at', new Date().toLocaleString('en-US', {
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

export default function CompetitorAlertModal({ onClose }: Props) {
  const [email, setEmail] = useState(() => localStorage.getItem('competitor_alert_email') ?? '');
  const [enabled, setEnabled] = useState(() => localStorage.getItem('competitor_alert_enabled') === 'true');
  const [threshold, setThreshold] = useState(() => Number(localStorage.getItem('competitor_alert_threshold') ?? '5'));
  const [saved, setSaved] = useState(false);
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('competitor_alert_email', email.trim());
    localStorage.setItem('competitor_alert_enabled', enabled ? 'true' : 'false');
    localStorage.setItem('competitor_alert_threshold', threshold.toString());
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1500);
  };

  const handleTest = async () => {
    if (!email.trim()) return;
    setTestSending(true);
    setTestResult(null);
    const ok = await sendTestAlert(email.trim());
    setTestSending(false);
    setTestResult(ok ? 'success' : 'error');
    setTimeout(() => setTestResult(null), 4000);
  };

  const thresholdLabel =
    threshold === 0
      ? 'Only when they match or beat our price'
      : `When competitor is within ${threshold}% of our price (early warning)`;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[80] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
              <i className="ri-alarm-warning-line text-red-500 text-lg"></i>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Competitor Price Alerts</h3>
              <p className="text-xs text-slate-500 mt-0.5">Get notified when a competitor undercuts your price</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 cursor-pointer transition-colors"
          >
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>

        <form
          id="competitor-alert-settings-form"
          data-readdy-form
          onSubmit={handleSave}
          className="px-6 py-5 space-y-5"
        >
          {/* Enable toggle */}
          <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Price Drop Alerts</p>
              <p className="text-xs text-slate-500 mt-0.5">Notify me when a competitor threatens our pricing</p>
            </div>
            <button
              type="button"
              onClick={() => setEnabled((v) => !v)}
              className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${
                enabled ? 'bg-red-500' : 'bg-slate-300'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  enabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Alert Email Address
            </label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@yourbusiness.com"
              required
              className="w-full text-sm border border-slate-200 focus:border-red-400 rounded-lg px-3 py-2.5 outline-none text-slate-700 placeholder-slate-400"
            />
          </div>

          {/* Threshold slider */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Alert Sensitivity:{' '}
              <span className="text-red-600 font-black">
                {threshold === 0 ? 'Only when cheaper' : `Within ${threshold}% of our price`}
              </span>
            </label>
            <input
              type="range"
              min={0}
              max={20}
              step={1}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-red-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>Exact match only</span>
              <span>Early warning (20%)</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">{thresholdLabel}</p>
          </div>

          {/* Trigger conditions */}
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 space-y-2">
            <p className="text-xs font-bold text-red-800 uppercase tracking-wider">What triggers an alert:</p>
            {[
              'You update a competitor\'s price via the "Update Price" button',
              `Competitor\'s new price is within ${threshold}% of your listed price`,
              'Includes an email summary with product name, both prices, and the gap',
            ].map((item) => (
              <div key={item} className="flex items-start gap-2">
                <div className="w-4 h-4 flex items-center justify-center text-red-500 shrink-0 mt-0.5">
                  <i className="ri-error-warning-line text-sm"></i>
                </div>
                <span className="text-xs text-red-800">{item}</span>
              </div>
            ))}
          </div>

          {/* Test */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleTest}
              disabled={!email.trim() || testSending}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 disabled:text-slate-300 text-slate-700 text-sm font-semibold rounded-lg cursor-pointer whitespace-nowrap transition-colors"
            >
              {testSending ? (
                <><i className="ri-loader-4-line animate-spin"></i> Sending...</>
              ) : (
                <><i className="ri-send-plane-line"></i> Send Test Alert</>
              )}
            </button>
            {testResult === 'success' && (
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                <i className="ri-check-line"></i> Sent!
              </span>
            )}
            {testResult === 'error' && (
              <span className="flex items-center gap-1 text-xs font-semibold text-red-500">
                <i className="ri-error-warning-line"></i> Failed
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer whitespace-nowrap transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg cursor-pointer whitespace-nowrap transition-colors"
            >
              {saved ? (
                <><i className="ri-check-line"></i> Saved!</>
              ) : (
                <><i className="ri-save-line"></i> Save Settings</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
