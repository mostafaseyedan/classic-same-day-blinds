import { useState, useEffect, useRef } from 'react';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  fromName?: string;
  replyTo?: string;
  cc?: string;
  bcc?: string;
}

const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: 'pending',
    name: 'Order Pending',
    subject: 'Order {{order_id}} Received - Classic Same Day Blinds',
    fromName: 'Classic Same Day Blinds',
    replyTo: '',
    cc: '',
    bcc: '',
    body: `Hi {{customer_name}},

Thank you for your order! We've received your order {{order_id}} and it's currently being processed.

Order Details:
• Order ID: {{order_id}}
• Order Total: {{order_total}}
• Status: {{status}}

We'll notify you once your order has been fulfilled and shipped.

If you have any questions, please don't hesitate to contact us.

Best regards,
Classic Same Day Blinds Team`,
  },
  {
    id: 'working_on_order',
    name: 'Working on Order',
    subject: 'We\'re Working on Your Order {{order_id}}!',
    fromName: 'Classic Same Day Blinds',
    replyTo: '',
    cc: '',
    bcc: '',
    body: `Hi {{customer_name}},

Great news — our team has started working on your order {{order_id}} and it\'s being actively prepared!

Order Details:
• Order ID: {{order_id}}
• Order Total: {{order_total}}
• Status: Working on Order

Our skilled team is carefully crafting your window treatments to ensure the highest quality. We\'ll keep you updated as your order progresses.

What happens next?
1. ✅ Order Received
2. 🔧 Working on Your Order  ← You are here
3. 📦 Fulfilled & Shipped
4. 🏠 Delivered

If you have any questions or special requests, please reach out to us right away so we can accommodate them before your order is completed.

Thank you for choosing Classic Same Day Blinds!

Best regards,
Classic Same Day Blinds Team`,
  },
  {
    id: 'pickup_ready',
    name: 'Ready for Pickup',
    subject: '🎉 Your Order {{order_id}} Is Ready for Pickup!',
    fromName: 'Classic Same Day Blinds',
    replyTo: '',
    cc: '',
    bcc: '',
    body: `Hi {{customer_name}},

Great news — your order {{order_id}} is ready and waiting for you to pick up!

Order Details:
• Order ID: {{order_id}}
• Order Total: {{order_total}}
• Status: Ready for Pickup

📍 Pickup Location:
{{pickup_location}}

⏰ Pickup Hours:
Monday – Friday: 8:00 AM – 6:00 PM
Saturday: 9:00 AM – 4:00 PM
Sunday: Closed

📋 What to Bring:
• Your order confirmation email or order ID
• A valid photo ID
• The card used for payment (if applicable)

Please pick up your order within 7 business days. If you need to arrange a different pickup time or have any questions, feel free to contact us.

We look forward to seeing you!

Best regards,
Classic Same Day Blinds Team`,
  },
  {
    id: 'fulfilled',
    name: 'Fulfilled & Shipped',
    subject: 'Order {{order_id}} Has Been Shipped! 🚚',
    fromName: 'Classic Same Day Blinds',
    replyTo: '',
    cc: '',
    bcc: '',
    body: `Hi {{customer_name}},

Great news! Your order {{order_id}} has been fulfilled and shipped.

Order Details:
• Order ID: {{order_id}}
• Order Total: {{order_total}}
• Status: {{status}}
• Tracking Number: {{tracking_number}}

You can track your shipment using the tracking number above. Your order should arrive soon!

Thank you for choosing Classic Same Day Blinds.

Best regards,
Classic Same Day Blinds Team`,
  },
  {
    id: 'delivered',
    name: 'Delivered',
    subject: 'Order {{order_id}} Delivered Successfully ✓',
    fromName: 'Classic Same Day Blinds',
    replyTo: '',
    cc: '',
    bcc: '',
    body: `Hi {{customer_name}},

Your order {{order_id}} has been successfully delivered!

Order Details:
• Order ID: {{order_id}}
• Order Total: {{order_total}}
• Status: {{status}}

We hope you're satisfied with your purchase. If you have any questions or concerns, please reach out to us.

Thank you for your business!

Best regards,
Classic Same Day Blinds Team`,
  },
  {
    id: 'cancelled',
    name: 'Cancelled',
    subject: 'Order {{order_id}} Has Been Cancelled',
    fromName: 'Classic Same Day Blinds',
    replyTo: '',
    cc: '',
    bcc: '',
    body: `Hi {{customer_name}},

We're writing to inform you that your order {{order_id}} has been cancelled.

Order Details:
• Order ID: {{order_id}}
• Order Total: {{order_total}}
• Status: {{status}}

If you have any questions about this cancellation or would like to place a new order, please contact us.

We apologize for any inconvenience.

Best regards,
Classic Same Day Blinds Team`,
  },
];

const VARIABLES = [
  { key: '{{customer_name}}', description: "Customer's full name" },
  { key: '{{order_id}}', description: 'Order ID number' },
  { key: '{{order_total}}', description: 'Order total amount' },
  { key: '{{tracking_number}}', description: 'Shipping tracking number' },
  { key: '{{status}}', description: 'Current order status' },
  { key: '{{pickup_location}}', description: 'Store pickup address' },
];

const SAMPLE_DATA = {
  customer_name: 'Sarah Johnson',
  order_id: 'ORD-10001',
  order_total: '$454,272.00',
  tracking_number: 'TRK-9982341',
  status: 'Fulfilled & Shipped',
  pickup_location: '2801 Brasher Ln, Bedford, TX 76021',
};

function replaceVariables(text: string, data: Record<string, string>): string {
  let result = text;
  Object.entries(data).forEach(([key, value]) => {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  });
  return result;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// ── Reusable Alert Email Block ────────────────────────────────────────────────
interface AlertEmailBlockProps {
  storageKey: string;
  title: string;
  description: string;
  icon: string;
  color: string; // tailwind color name e.g. "emerald" | "teal"
}

function AlertEmailBlock({ storageKey, title, description, icon, color }: AlertEmailBlockProps) {
  const [emails, setEmails] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) ?? '[]'); } catch { return []; }
  });
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [testingEmail, setTestingEmail] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, 'success' | 'fail'>>({});

  function persist(list: string[]) {
    setEmails(list);
    localStorage.setItem(storageKey, JSON.stringify(list));
  }

  function handleAdd() {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (!isValidEmail(trimmed)) { setError('Please enter a valid email address.'); return; }
    if (emails.includes(trimmed)) { setError('This email is already in the list.'); return; }
    persist([...emails, trimmed]);
    setInput('');
    setError('');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleRemove(email: string) {
    persist(emails.filter((e) => e !== email));
    const updated = { ...testResults };
    delete updated[email];
    setTestResults(updated);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { e.preventDefault(); handleAdd(); }
  }

  function handleTestEmail(email: string) {
    setTestingEmail(email);
    // Simulate sending a test email (1.5s delay)
    setTimeout(() => {
      setTestingEmail(null);
      setTestResults((prev) => ({ ...prev, [email]: 'success' }));
      setTimeout(() => {
        setTestResults((prev) => {
          const next = { ...prev };
          delete next[email];
          return next;
        });
      }, 3000);
    }, 1500);
  }

  const colorMap: Record<string, { bg: string; border: string; text: string; iconBg: string; iconText: string; tag: string; tagBorder: string; tagText: string; btn: string; btnHover: string }> = {
    emerald: {
      bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600',
      iconBg: 'bg-emerald-100', iconText: 'text-emerald-600',
      tag: 'bg-emerald-50', tagBorder: 'border-emerald-200', tagText: 'text-emerald-800',
      btn: 'bg-emerald-600', btnHover: 'hover:bg-emerald-700',
    },
    teal: {
      bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-600',
      iconBg: 'bg-teal-100', iconText: 'text-teal-600',
      tag: 'bg-teal-50', tagBorder: 'border-teal-200', tagText: 'text-teal-800',
      btn: 'bg-teal-600', btnHover: 'hover:bg-teal-700',
    },
  };
  const c = colorMap[color] ?? colorMap.emerald;

  return (
    <div className={`mt-5 ${c.bg} border ${c.border} rounded-xl p-4`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-6 h-6 ${c.iconBg} rounded-lg flex items-center justify-center shrink-0`}>
          <i className={`${icon} ${c.iconText} text-xs`}></i>
        </div>
        <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">{title}</p>
        {saved && (
          <span className={`ml-auto flex items-center gap-1 text-xs font-semibold ${c.text}`}>
            <i className="ri-check-line"></i> Saved
          </span>
        )}
      </div>
      <p className="text-xs text-slate-500 mb-3 leading-relaxed">{description}</p>

      {emails.length > 0 ? (
        <div className="flex flex-col gap-1.5 mb-3">
          {emails.map((email) => (
            <div key={email} className={`flex items-center gap-2 ${c.tag} border ${c.tagBorder} rounded-lg px-2.5 py-1.5`}>
              <i className={`ri-mail-line ${c.text} text-xs shrink-0`}></i>
              <span className={`text-xs font-semibold ${c.tagText} flex-1 truncate`}>{email}</span>

              {/* Test button */}
              <button
                onClick={() => handleTestEmail(email)}
                disabled={testingEmail === email}
                title="Send test email"
                className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer whitespace-nowrap
                  ${testResults[email] === 'success'
                    ? 'bg-green-100 text-green-700'
                    : testingEmail === email
                    ? 'bg-slate-100 text-slate-400'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-400'}`}
              >
                {testingEmail === email ? (
                  <><i className="ri-loader-4-line animate-spin text-xs"></i> Sending…</>
                ) : testResults[email] === 'success' ? (
                  <><i className="ri-check-line text-xs"></i> Sent!</>
                ) : (
                  <><i className="ri-send-plane-line text-xs"></i> Test</>
                )}
              </button>

              {/* Remove button */}
              <button
                onClick={() => handleRemove(email)}
                className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-red-100 hover:text-red-500 text-slate-400 transition-colors cursor-pointer shrink-0"
                title="Remove"
              >
                <i className="ri-close-line text-xs"></i>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 bg-white border border-dashed border-slate-300 rounded-lg px-3 py-2 mb-3">
          <i className="ri-inbox-line text-slate-300 text-base"></i>
          <span className="text-xs text-slate-400">No recipients yet</span>
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="email"
          value={input}
          onChange={(e) => { setInput(e.target.value); setError(''); }}
          onKeyDown={handleKeyDown}
          placeholder="name@example.com"
          className={`flex-1 text-xs border rounded-lg px-3 py-2 outline-none text-slate-700 placeholder-slate-400 min-w-0 ${
            error ? 'border-red-300 focus:border-red-400' : `border-slate-200 focus:${c.border}`
          }`}
        />
        <button
          onClick={handleAdd}
          disabled={!input.trim()}
          className={`flex items-center justify-center w-8 h-8 ${c.btn} ${c.btnHover} disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg shrink-0 transition-colors cursor-pointer`}
          title="Add email"
        >
          <i className="ri-add-line text-sm"></i>
        </button>
      </div>
      {error && (
        <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
          <i className="ri-error-warning-line"></i>{error}
        </p>
      )}
      <p className="text-xs text-slate-400 mt-1.5">Press Enter or click + to add · Click Test to verify</p>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface EmailTemplateEditorProps {
  onClose: () => void;
  pickupLocation?: string;
}

export default function EmailTemplateEditor({ onClose, pickupLocation }: EmailTemplateEditorProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>(() => {
    const saved = localStorage.getItem('email_templates');
    if (saved) {
      const parsed: EmailTemplate[] = JSON.parse(saved);
      const hasPickup = parsed.some((t) => t.id === 'pickup_ready');
      if (!hasPickup) {
        const pickupTemplate = DEFAULT_TEMPLATES.find((t) => t.id === 'pickup_ready')!;
        const fulfilledIdx = parsed.findIndex((t) => t.id === 'fulfilled');
        const insertAt = fulfilledIdx >= 0 ? fulfilledIdx : 1;
        parsed.splice(insertAt, 0, pickupTemplate);
      }
      const hasWorking = parsed.some((t) => t.id === 'working_on_order');
      if (!hasWorking) {
        const workingTemplate = DEFAULT_TEMPLATES.find((t) => t.id === 'working_on_order')!;
        const pendingIdx = parsed.findIndex((t) => t.id === 'pending');
        const insertAt = pendingIdx >= 0 ? pendingIdx + 1 : 1;
        parsed.splice(insertAt, 0, workingTemplate);
      }
      return parsed.map((t) => ({ fromName: 'Classic Same Day Blinds', replyTo: '', cc: '', bcc: '', ...t }));
    }
    return DEFAULT_TEMPLATES;
  });

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('working_on_order');
  const [editingSubject, setEditingSubject] = useState('');
  const [editingBody, setEditingBody] = useState('');
  const [editingFromName, setEditingFromName] = useState('');
  const [editingReplyTo, setEditingReplyTo] = useState('');
  const [editingCc, setEditingCc] = useState('');
  const [editingBcc, setEditingBcc] = useState('');
  const [showPreview, setShowPreview] = useState(true);
  const [saveToast, setSaveToast] = useState(false);
  const [replyToError, setReplyToError] = useState('');
  const [ccError, setCcError] = useState('');
  const [bccError, setBccError] = useState('');

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) ?? templates[0];

  useEffect(() => {
    if (selectedTemplate) {
      setEditingSubject(selectedTemplate.subject);
      setEditingBody(selectedTemplate.body);
      setEditingFromName(selectedTemplate.fromName ?? 'Classic Same Day Blinds');
      setEditingReplyTo(selectedTemplate.replyTo ?? '');
      setEditingCc(selectedTemplate.cc ?? '');
      setEditingBcc(selectedTemplate.bcc ?? '');
      setReplyToError('');
      setCcError('');
      setBccError('');
    }
  }, [selectedTemplate]);

  function validateEmailList(value: string): boolean {
    if (!value.trim()) return true;
    return value.split(',').every((e) => isValidEmail(e));
  }

  const handleSave = () => {
    const replyToValid = !editingReplyTo.trim() || isValidEmail(editingReplyTo.trim());
    const ccValid = validateEmailList(editingCc);
    const bccValid = validateEmailList(editingBcc);
    if (!replyToValid) { setReplyToError('Please enter a valid Reply-To email address.'); return; }
    if (!ccValid) { setCcError('One or more CC addresses are invalid.'); return; }
    if (!bccValid) { setBccError('One or more BCC addresses are invalid.'); return; }

    const updated = templates.map((t) =>
      t.id === selectedTemplateId
        ? { ...t, subject: editingSubject, body: editingBody, fromName: editingFromName, replyTo: editingReplyTo, cc: editingCc, bcc: editingBcc }
        : t
    );
    setTemplates(updated);
    localStorage.setItem('email_templates', JSON.stringify(updated));
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handleReset = () => {
    const defaultTemplate = DEFAULT_TEMPLATES.find((t) => t.id === selectedTemplateId);
    if (defaultTemplate) {
      setEditingSubject(defaultTemplate.subject);
      setEditingBody(defaultTemplate.body);
      setEditingFromName(defaultTemplate.fromName ?? 'Classic Same Day Blinds');
      setEditingReplyTo('');
      setEditingCc('');
      setEditingBcc('');
      setReplyToError('');
      setCcError('');
      setBccError('');
    }
  };

  const sampleData = {
    ...SAMPLE_DATA,
    pickup_location: pickupLocation ?? SAMPLE_DATA.pickup_location,
  };

  const previewSubject = replaceVariables(editingSubject, sampleData);
  const previewBody = replaceVariables(editingBody, sampleData);

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
              <i className="ri-mail-settings-line text-emerald-600 text-xl"></i>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Email Notification Templates</h2>
              <p className="text-sm text-slate-500 mt-0.5">Customize emails sent to customers on status changes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 cursor-pointer transition-colors"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        {/* Save Toast */}
        {saveToast && (
          <div className="absolute top-20 right-8 z-10 flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg shadow-xl">
            <i className="ri-check-line text-lg"></i>
            <span className="text-sm font-semibold">Template saved successfully!</span>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Sidebar */}
          <div className="w-72 border-r border-slate-100 bg-slate-50 p-4 overflow-y-auto shrink-0">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Templates</p>
            <div className="space-y-2">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplateId(template.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
                    selectedTemplateId === template.id
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <i className={`${template.id === 'pickup_ready' ? 'ri-store-2-line' : 'ri-mail-line'} text-base ${
                      selectedTemplateId === template.id ? 'text-white' : template.id === 'pickup_ready' ? 'text-orange-400' : 'text-slate-400'
                    }`}></i>
                    <span>{template.name}</span>
                    {template.id === 'pickup_ready' && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${selectedTemplateId === template.id ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-600'}`}>
                        Auto
                      </span>
                    )}
                    {/* CC/BCC indicator */}
                    {(template.cc || template.bcc) && (
                      <span className={`ml-auto text-xs px-1.5 py-0.5 rounded-full font-bold ${selectedTemplateId === template.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        CC
                      </span>
                    )}
                  </div>
                  <p className={`text-xs ${selectedTemplateId === template.id ? 'text-slate-300' : 'text-slate-400'} truncate`}>
                    {template.subject}
                  </p>
                </button>
              ))}
            </div>

            {/* ── New Order Alert Emails ── */}
            <AlertEmailBlock
              storageKey="new_order_alert_emails"
              title="New Order Alert Emails"
              description="Staff notified whenever a brand-new order is placed."
              icon="ri-shopping-bag-line"
              color="teal"
            />

            {/* ── Reorder Alert Emails ── */}
            <AlertEmailBlock
              storageKey="reorder_alert_emails"
              title="Reorder Alert Emails"
              description="Staff notified whenever a customer places a reorder."
              icon="ri-refresh-line"
              color="emerald"
            />

            {/* Pickup Location Info */}
            {pickupLocation && (
              <div className="mt-4 bg-orange-50 border border-orange-200 rounded-xl p-3">
                <p className="text-xs font-bold text-orange-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <i className="ri-map-pin-line"></i> Pickup Location
                </p>
                <p className="text-xs text-orange-800 whitespace-pre-line leading-relaxed">{pickupLocation}</p>
                <p className="text-xs text-orange-500 mt-1.5">Auto-fills in pickup email</p>
              </div>
            )}

            {/* Variable Legend */}
            <div className="mt-4 bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <i className="ri-code-s-slash-line"></i>
                Available Variables
              </p>
              <div className="space-y-2">
                {VARIABLES.map((v) => (
                  <div key={v.key} className="text-xs">
                    <code className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-semibold">{v.key}</code>
                    <p className="text-slate-500 mt-0.5 ml-1">{v.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {/* Toggle Preview/Edit */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                  <button
                    onClick={() => setShowPreview(false)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      !showPreview ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    <i className="ri-edit-line mr-1.5"></i>Edit Template
                  </button>
                  <button
                    onClick={() => setShowPreview(true)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      showPreview ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    <i className="ri-eye-line mr-1.5"></i>Live Preview
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold cursor-pointer whitespace-nowrap transition-colors"
                  >
                    <i className="ri-restart-line"></i>Reset to Default
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold cursor-pointer whitespace-nowrap transition-colors"
                  >
                    <i className="ri-save-line"></i>Save Template
                  </button>
                </div>
              </div>

              {/* Editor View */}
              {!showPreview && (
                <div className="space-y-5">
                  {/* From Name + Reply-To */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        <i className="ri-user-smile-line text-slate-400 mr-1.5"></i>From Name
                        <span className="ml-1.5 text-xs font-normal text-slate-400">(displayed to customer)</span>
                      </label>
                      <input
                        type="text"
                        value={editingFromName}
                        onChange={(e) => setEditingFromName(e.target.value)}
                        placeholder="e.g. Classic Same Day Blinds"
                        className="w-full text-sm border border-slate-200 focus:border-slate-400 rounded-lg px-4 py-3 outline-none text-slate-700 placeholder-slate-400"
                      />
                      <p className="text-xs text-slate-400 mt-1">The name customers see in their inbox</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        <i className="ri-reply-line text-slate-400 mr-1.5"></i>Reply-To
                        <span className="ml-1.5 text-xs font-normal text-slate-400">(optional)</span>
                      </label>
                      <input
                        type="email"
                        value={editingReplyTo}
                        onChange={(e) => { setEditingReplyTo(e.target.value); setReplyToError(''); }}
                        placeholder="support@yourdomain.com"
                        className={`w-full text-sm border rounded-lg px-4 py-3 outline-none text-slate-700 placeholder-slate-400 ${
                          replyToError ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-slate-400'
                        }`}
                      />
                      {replyToError && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><i className="ri-error-warning-line"></i>{replyToError}</p>}
                      <p className="text-xs text-slate-400 mt-1">Customer replies go directly to this inbox</p>
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      <i className="ri-text text-slate-400 mr-1.5"></i>Subject Line
                    </label>
                    <input
                      type="text"
                      value={editingSubject}
                      onChange={(e) => setEditingSubject(e.target.value)}
                      placeholder="Enter email subject..."
                      className="w-full text-sm border border-slate-200 focus:border-slate-400 rounded-lg px-4 py-3 outline-none text-slate-700 placeholder-slate-400"
                    />
                    <p className="text-xs text-slate-400 mt-1.5">Use variables like {'{{customer_name}}'} or {'{{order_id}}'} to personalize</p>
                  </div>

                  {/* CC / BCC */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        <i className="ri-user-add-line text-slate-400 mr-1.5"></i>CC
                        <span className="ml-1.5 text-xs font-normal text-slate-400">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={editingCc}
                        onChange={(e) => { setEditingCc(e.target.value); setCcError(''); }}
                        placeholder="cc@example.com, another@example.com"
                        className={`w-full text-sm border rounded-lg px-4 py-3 outline-none text-slate-700 placeholder-slate-400 ${
                          ccError ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-slate-400'
                        }`}
                      />
                      {ccError && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><i className="ri-error-warning-line"></i>{ccError}</p>}
                      <p className="text-xs text-slate-400 mt-1">Separate multiple addresses with commas</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        <i className="ri-eye-off-line text-slate-400 mr-1.5"></i>BCC
                        <span className="ml-1.5 text-xs font-normal text-slate-400">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={editingBcc}
                        onChange={(e) => { setEditingBcc(e.target.value); setBccError(''); }}
                        placeholder="bcc@example.com, another@example.com"
                        className={`w-full text-sm border rounded-lg px-4 py-3 outline-none text-slate-700 placeholder-slate-400 ${
                          bccError ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-slate-400'
                        }`}
                      />
                      {bccError && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><i className="ri-error-warning-line"></i>{bccError}</p>}
                      <p className="text-xs text-slate-400 mt-1">Hidden from other recipients</p>
                    </div>
                  </div>

                  {/* Body */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      <i className="ri-file-text-line text-slate-400 mr-1.5"></i>Email Body
                    </label>
                    <textarea
                      value={editingBody}
                      onChange={(e) => setEditingBody(e.target.value)}
                      placeholder="Enter email body content..."
                      rows={16}
                      className="w-full text-sm border border-slate-200 focus:border-slate-400 rounded-lg px-4 py-3 outline-none text-slate-700 placeholder-slate-400 resize-none font-mono leading-relaxed"
                    />
                    <p className="text-xs text-slate-400 mt-1.5">Write your message using plain text. Variables will be replaced automatically.</p>
                  </div>
                </div>
              )}

              {/* Preview View */}
              {showPreview && (
                <div className="space-y-5">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-start gap-3">
                    <i className="ri-information-line text-amber-600 text-lg mt-0.5"></i>
                    <div>
                      <p className="text-sm font-semibold text-amber-900">Live Preview with Sample Data</p>
                      <p className="text-xs text-amber-700 mt-0.5">Variables are replaced with sample values to show how the email will look.</p>
                    </div>
                  </div>

                  {/* Email Preview Card */}
                  <div className="border-2 border-slate-200 rounded-xl overflow-hidden shadow-lg">
                    <div className="bg-slate-900 px-6 py-4 flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center shrink-0">
                        <i className="ri-mail-line text-white text-lg"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-sm">{editingFromName || 'Classic Same Day Blinds'}</p>
                        <p className="text-slate-300 text-xs">noreply@classicsamedayblinds.com</p>
                      </div>
                      {editingReplyTo && (
                        <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5 shrink-0">
                          <i className="ri-reply-line text-emerald-400 text-xs"></i>
                          <span className="text-xs text-slate-300">Replies → <span className="text-emerald-300 font-semibold">{editingReplyTo}</span></span>
                        </div>
                      )}
                    </div>

                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 space-y-2">
                      <div>
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Subject</p>
                        <p className="text-base font-bold text-slate-900">{previewSubject}</p>
                      </div>
                      {(editingCc || editingBcc) && (
                        <div className="flex flex-wrap gap-4 pt-1 border-t border-slate-200">
                          {editingCc && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                              <span className="font-semibold text-slate-600">CC:</span>
                              <span>{editingCc}</span>
                            </div>
                          )}
                          {editingBcc && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                              <span className="font-semibold text-slate-600">BCC:</span>
                              <span>{editingBcc}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="bg-white px-6 py-6">
                      <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 leading-relaxed">{previewBody}</pre>
                    </div>

                    <div className="bg-slate-50 border-t border-slate-200 px-6 py-4">
                      <p className="text-xs text-slate-400 text-center">This is an automated email from Classic Same Day Blinds</p>
                    </div>
                  </div>

                  {/* Sample Data Used */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sample Data Used in Preview</p>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(sampleData).map(([key, value]) => (
                        <div key={key} className="flex items-start gap-2 text-xs">
                          <code className="bg-white text-slate-700 px-2 py-1 rounded font-mono font-semibold border border-slate-200 shrink-0">
                            {'{{' + key + '}}'}
                          </code>
                          <span className="text-slate-500">→</span>
                          <span className={`font-medium break-all ${key === 'pickup_location' ? 'text-orange-700' : 'text-slate-700'}`}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
