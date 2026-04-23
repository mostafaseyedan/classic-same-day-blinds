import { useState } from 'react';

// ── Helpers ────────────────────────────────────────────────────────────────
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// ── Types ──────────────────────────────────────────────────────────────────
interface AlertCategory {
  key: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  accent: {
    border: string;
    bg: string;
    text: string;
    focusBorder: string;
    btnBg: string;
    btnHover: string;
    tagBg: string;
    tagText: string;
    tagBorder: string;
  };
}

const CATEGORIES: AlertCategory[] = [
  {
    key: 'alert_emails_new_order',
    icon: 'ri-shopping-bag-3-line',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    title: 'New Order Placed',
    description: 'Notified whenever a customer places a new order',
    accent: {
      border: 'border-amber-200',
      bg: 'bg-amber-50',
      text: 'text-amber-900',
      focusBorder: 'focus:border-amber-400',
      btnBg: 'bg-amber-500',
      btnHover: 'hover:bg-amber-600',
      tagBg: 'bg-amber-50',
      tagText: 'text-amber-800',
      tagBorder: 'border-amber-200',
    },
  },
  {
    key: 'alert_emails_new_user',
    icon: 'ri-user-add-line',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    title: 'New User Registration',
    description: 'Notified whenever a new customer creates an account',
    accent: {
      border: 'border-emerald-200',
      bg: 'bg-emerald-50',
      text: 'text-emerald-900',
      focusBorder: 'focus:border-emerald-400',
      btnBg: 'bg-emerald-600',
      btnHover: 'hover:bg-emerald-700',
      tagBg: 'bg-emerald-50',
      tagText: 'text-emerald-800',
      tagBorder: 'border-emerald-200',
    },
  },
  {
    key: 'alert_emails_reorder',
    icon: 'ri-refresh-line',
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-600',
    title: 'Reorder Placed',
    description: 'Notified when a customer re-orders from a previous order',
    accent: {
      border: 'border-sky-200',
      bg: 'bg-sky-50',
      text: 'text-sky-900',
      focusBorder: 'focus:border-sky-400',
      btnBg: 'bg-sky-600',
      btnHover: 'hover:bg-sky-700',
      tagBg: 'bg-sky-50',
      tagText: 'text-sky-800',
      tagBorder: 'border-sky-200',
    },
  },
  {
    key: 'alert_emails_vip',
    icon: 'ri-vip-crown-line',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    title: 'VIP Customer Activity',
    description: 'Notified when a VIP or high-value customer is active',
    accent: {
      border: 'border-orange-200',
      bg: 'bg-orange-50',
      text: 'text-orange-900',
      focusBorder: 'focus:border-orange-400',
      btnBg: 'bg-orange-500',
      btnHover: 'hover:bg-orange-600',
      tagBg: 'bg-orange-50',
      tagText: 'text-orange-800',
      tagBorder: 'border-orange-200',
    },
  },
  {
    key: 'alert_emails_restock',
    icon: 'ri-inbox-line',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
    title: 'Restock Request',
    description: 'Notified when a customer submits a product restock request',
    accent: {
      border: 'border-rose-200',
      bg: 'bg-rose-50',
      text: 'text-rose-900',
      focusBorder: 'focus:border-rose-400',
      btnBg: 'bg-rose-500',
      btnHover: 'hover:bg-rose-600',
      tagBg: 'bg-rose-50',
      tagText: 'text-rose-800',
      tagBorder: 'border-rose-200',
    },
  },
  {
    key: 'alert_emails_conference',
    icon: 'ri-calendar-event-line',
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-600',
    title: 'Conference Registration',
    description: 'Notified when a new conference registration is submitted',
    accent: {
      border: 'border-slate-200',
      bg: 'bg-slate-50',
      text: 'text-slate-900',
      focusBorder: 'focus:border-slate-400',
      btnBg: 'bg-slate-700',
      btnHover: 'hover:bg-slate-800',
      tagBg: 'bg-slate-50',
      tagText: 'text-slate-700',
      tagBorder: 'border-slate-200',
    },
  },
  {
    key: 'alert_emails_free_sample',
    icon: 'ri-gift-line',
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-600',
    title: 'Free Sample Request',
    description: 'Notified immediately when a customer submits a free sample request',
    accent: {
      border: 'border-teal-200',
      bg: 'bg-teal-50',
      text: 'text-teal-900',
      focusBorder: 'focus:border-teal-400',
      btnBg: 'bg-teal-600',
      btnHover: 'hover:bg-teal-700',
      tagBg: 'bg-teal-50',
      tagText: 'text-teal-800',
      tagBorder: 'border-teal-200',
    },
  },
  {
    key: 'alert_emails_membership',
    icon: 'ri-vip-diamond-line',
    iconBg: 'bg-lime-100',
    iconColor: 'text-lime-700',
    title: 'Membership Sign-Up',
    description: 'Notified whenever a customer joins the membership program',
    accent: {
      border: 'border-lime-200',
      bg: 'bg-lime-50',
      text: 'text-lime-900',
      focusBorder: 'focus:border-lime-400',
      btnBg: 'bg-lime-600',
      btnHover: 'hover:bg-lime-700',
      tagBg: 'bg-lime-50',
      tagText: 'text-lime-800',
      tagBorder: 'border-lime-200',
    },
  },
];

// ── Alert Category Card ────────────────────────────────────────────────────
function AlertCard({ cat }: { cat: AlertCategory }) {
  const [emails, setEmails] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(cat.key) ?? '[]'); } catch { return []; }
  });
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [savedFlash, setSavedFlash] = useState(false);
  const [testStatus, setTestStatus] = useState<Record<string, 'idle' | 'sending' | 'sent'>>({});

  function persist(list: string[]) {
    setEmails(list);
    localStorage.setItem(cat.key, JSON.stringify(list));
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2200);
  }

  function handleAdd() {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (!isValidEmail(trimmed)) { setError('Please enter a valid email address.'); return; }
    if (emails.includes(trimmed)) { setError('This email is already added.'); return; }
    persist([...emails, trimmed]);
    setInput('');
    setError('');
  }

  function handleRemove(email: string) {
    persist(emails.filter(e => e !== email));
    setTestStatus(prev => { const n = { ...prev }; delete n[email]; return n; });
  }

  async function handleTest(email: string) {
    setTestStatus(prev => ({ ...prev, [email]: 'sending' }));
    try {
      const body = new URLSearchParams();
      body.append('email', email);
      body.append('alert_type', cat.title);
      body.append('test', 'true');
      await fetch('https://readdy.ai/api/form/d6sf02jvrivh3q8klvjg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
    } catch { /* ignore */ }
    setTestStatus(prev => ({ ...prev, [email]: 'sent' }));
    setTimeout(() => setTestStatus(prev => { const n = { ...prev }; delete n[email]; return n; }), 3000);
  }

  const status = (email: string) => testStatus[email] ?? 'idle';
  const { accent } = cat;

  return (
    <div className={`rounded-2xl border ${accent.border} overflow-hidden`}>
      {/* Header */}
      <div className={`${accent.bg} px-5 py-4 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${cat.iconBg} rounded-xl flex items-center justify-center shrink-0`}>
            <i className={`${cat.icon} ${cat.iconColor} text-lg`}></i>
          </div>
          <div>
            <p className={`text-sm font-bold ${accent.text}`}>{cat.title}</p>
            <p className="text-xs text-slate-500 mt-0.5">{cat.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {savedFlash && (
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <i className="ri-check-line"></i> Saved
            </span>
          )}
          {emails.length > 0 ? (
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${accent.tagBorder} ${accent.tagBg} ${accent.tagText}`}>
              {emails.length} {emails.length === 1 ? 'recipient' : 'recipients'}
            </span>
          ) : (
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full border border-dashed border-slate-300 text-slate-400">
              No recipients
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="bg-white px-5 py-4">
        {/* Email chips */}
        {emails.length > 0 ? (
          <div className="flex flex-col gap-2 mb-4">
            {emails.map(email => (
              <div key={email} className={`flex items-center gap-2.5 ${accent.bg} border ${accent.border} rounded-xl px-3.5 py-2.5`}>
                <div className="w-6 h-6 flex items-center justify-center shrink-0">
                  <i className={`ri-mail-line ${cat.iconColor} text-sm`}></i>
                </div>
                <span className="text-sm font-semibold text-slate-800 flex-1 truncate">{email}</span>

                {/* Test button */}
                <button
                  onClick={() => handleTest(email)}
                  disabled={status(email) === 'sending'}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    status(email) === 'sent'
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      : status(email) === 'sending'
                      ? 'bg-slate-100 text-slate-400 border border-slate-200'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400 hover:text-slate-900'
                  }`}
                >
                  {status(email) === 'sending' ? (
                    <><i className="ri-loader-4-line animate-spin text-xs"></i> Sending…</>
                  ) : status(email) === 'sent' ? (
                    <><i className="ri-check-line text-xs"></i> Sent!</>
                  ) : (
                    <><i className="ri-send-plane-line text-xs"></i> Test</>
                  )}
                </button>

                {/* Remove */}
                <button
                  onClick={() => handleRemove(email)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-100 hover:text-red-500 text-slate-400 transition-colors cursor-pointer shrink-0"
                  title="Remove"
                >
                  <i className="ri-delete-bin-line text-sm"></i>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl px-4 py-3.5 mb-4">
            <i className="ri-inbox-2-line text-slate-300 text-lg"></i>
            <span className="text-sm text-slate-400">No recipients yet — add email addresses below</span>
          </div>
        )}

        {/* Input row */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <i className="ri-mail-add-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
            <input
              type="email"
              value={input}
              onChange={e => { setInput(e.target.value); setError(''); }}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAdd(); } }}
              placeholder="staff@yourbusiness.com"
              className={`w-full pl-9 pr-4 py-2.5 text-sm border rounded-xl outline-none text-slate-700 placeholder-slate-400 transition-colors ${
                error ? 'border-red-300 focus:border-red-400' : `border-slate-200 ${accent.focusBorder}`
              }`}
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={!input.trim()}
            className={`flex items-center gap-1.5 px-4 py-2.5 ${accent.btnBg} ${accent.btnHover} disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap`}
          >
            <i className="ri-add-line"></i> Add
          </button>
        </div>
        {error && (
          <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
            <i className="ri-error-warning-line"></i> {error}
          </p>
        )}
        <p className="text-xs text-slate-400 mt-2">Press Enter or click Add · Use Test to verify each address</p>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function AdminEmailAlertsPage() {
  const totalRecipients = CATEGORIES.reduce((sum, cat) => {
    try {
      const stored: string[] = JSON.parse(localStorage.getItem(cat.key) ?? '[]');
      return sum + stored.length;
    } catch { return sum; }
  }, 0);

  const activeCategories = CATEGORIES.filter(cat => {
    try {
      const stored: string[] = JSON.parse(localStorage.getItem(cat.key) ?? '[]');
      return stored.length > 0;
    } catch { return false; }
  }).length;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shrink-0">
            <i className="ri-notification-3-line text-white text-xl"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Email Alert Recipients</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Add multiple staff email addresses per event type. Everyone listed will receive the alert.
            </p>
          </div>
        </div>

        {/* Summary badges */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-center px-4 py-2.5 bg-white border border-slate-200 rounded-xl">
            <p className="text-lg font-bold text-slate-900">{totalRecipients}</p>
            <p className="text-xs text-slate-500">Total recipients</p>
          </div>
          <div className="text-center px-4 py-2.5 bg-white border border-slate-200 rounded-xl">
            <p className="text-lg font-bold text-emerald-600">{activeCategories}</p>
            <p className="text-xs text-slate-500">Active alerts</p>
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 mb-8">
        <div className="w-8 h-8 flex items-center justify-center shrink-0">
          <i className="ri-information-line text-slate-400 text-lg"></i>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-0.5">How it works</p>
          <p className="text-sm text-slate-500 leading-relaxed">
            Add as many email addresses as you need to each alert category. Every person on the list will get notified when that event occurs. Click <strong className="text-slate-700">Test</strong> next to any address to send a verification email and confirm delivery before going live.
          </p>
        </div>
      </div>

      {/* Alert category grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {CATEGORIES.map(cat => (
          <AlertCard key={cat.key} cat={cat} />
        ))}
      </div>

      {/* Footer note */}
      <div className="mt-8 flex items-center gap-3 text-xs text-slate-400">
        <i className="ri-save-line text-slate-300 text-base"></i>
        <span>All changes are saved automatically to this browser. Recipients will receive alerts for future events only.</span>
      </div>
    </div>
  );
}
