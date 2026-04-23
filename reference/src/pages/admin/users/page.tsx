import { useState, useEffect, useRef } from 'react';
import { mockOrders } from '../../../mocks/orders';

// ── Email Validation ──────────────────────────────────────────────────────
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// ── Email Alert Category Component ───────────────────────────────────────
interface AlertCategoryProps {
  storageKey: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  accentBorder: string;
  accentBg: string;
  accentText: string;
  inputFocusBorder: string;
  addBtnBg: string;
  addBtnHover: string;
}

function AlertCategory({
  storageKey,
  icon,
  iconBg,
  iconColor,
  title,
  description,
  accentBorder,
  accentBg,
  accentText,
  inputFocusBorder,
  addBtnBg,
  addBtnHover,
}: AlertCategoryProps) {
  const [emails, setEmails] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) ?? '[]'); } catch { return []; }
  });
  const [testStatus, setTestStatus] = useState<Record<string, 'idle' | 'sending' | 'sent'>>({});
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [savedFlash, setSavedFlash] = useState(false);

  function persist(list: string[]) {
    setEmails(list);
    localStorage.setItem(storageKey, JSON.stringify(list));
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
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

  function handleTest(email: string) {
    setTestStatus(prev => ({ ...prev, [email]: 'sending' }));
    setTimeout(() => {
      setTestStatus(prev => ({ ...prev, [email]: 'sent' }));
      setTimeout(() => {
        setTestStatus(prev => { const n = { ...prev }; delete n[email]; return n; });
      }, 3000);
    }, 1400);
  }

  const status = (email: string) => testStatus[email] ?? 'idle';

  return (
    <div className={`rounded-xl border ${accentBorder} overflow-hidden`}>
      {/* Category Header */}
      <div className={`${accentBg} px-5 py-4 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 ${iconBg} rounded-lg flex items-center justify-center shrink-0`}>
            <i className={`${icon} ${iconColor} text-base`}></i>
          </div>
          <div>
            <p className={`text-sm font-bold ${accentText}`}>{title}</p>
            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
          </div>
        </div>
        {savedFlash && (
          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
            <i className="ri-check-line"></i> Saved
          </span>
        )}
        {emails.length > 0 && !savedFlash && (
          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${accentBorder} ${accentBg} ${accentText}`}>
            {emails.length} recipient{emails.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="bg-white px-5 py-4">
        {/* Email list */}
        {emails.length > 0 ? (
          <div className="flex flex-col gap-2 mb-4">
            {emails.map(email => (
              <div key={email} className={`flex items-center gap-2 ${accentBg} border ${accentBorder} rounded-lg px-3 py-2`}>
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <i className={`ri-mail-line ${iconColor} text-sm`}></i>
                </div>
                <span className="text-sm font-semibold text-slate-800 flex-1 truncate">{email}</span>

                <button
                  onClick={() => handleTest(email)}
                  disabled={status(email) === 'sending'}
                  title="Send test email"
                  className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    status(email) === 'sent'
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      : status(email) === 'sending'
                      ? 'bg-slate-100 text-slate-400 border border-slate-200'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400'
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

                <button
                  onClick={() => handleRemove(email)}
                  className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-100 hover:text-red-500 text-slate-400 transition-colors cursor-pointer shrink-0"
                  title="Remove"
                >
                  <i className="ri-close-line text-sm"></i>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-slate-50 border border-dashed border-slate-300 rounded-lg px-4 py-3 mb-4">
            <i className="ri-inbox-line text-slate-300 text-lg"></i>
            <span className="text-sm text-slate-400">No recipients yet — add one below</span>
          </div>
        )}

        {/* Add input */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <i className="ri-mail-add-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
            <input
              type="email"
              value={input}
              onChange={e => { setInput(e.target.value); setError(''); }}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAdd(); } }}
              placeholder="staff@example.com"
              className={`w-full pl-9 pr-4 py-2.5 text-sm border rounded-lg outline-none text-slate-700 placeholder-slate-400 ${
                error ? 'border-red-300 focus:border-red-400' : `border-slate-200 ${inputFocusBorder}`
              }`}
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={!input.trim()}
            className={`flex items-center gap-1.5 px-4 py-2.5 ${addBtnBg} ${addBtnHover} disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap`}
          >
            <i className="ri-add-line"></i> Add
          </button>
        </div>
        {error && (
          <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
            <i className="ri-error-warning-line"></i> {error}
          </p>
        )}
        <p className="text-xs text-slate-400 mt-2">Press Enter or click Add · Use Test to verify delivery</p>
      </div>
    </div>
  );
}

// ── Email Alerts Panel ────────────────────────────────────────────────────
function EmailAlertsPanel() {
  const categories = [
    {
      storageKey: 'alert_emails_new_user',
      icon: 'ri-user-add-line',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      title: 'New User Registration',
      description: 'Notified whenever a new customer creates an account',
      accentBorder: 'border-emerald-200',
      accentBg: 'bg-emerald-50',
      accentText: 'text-emerald-900',
      inputFocusBorder: 'focus:border-emerald-400',
      addBtnBg: 'bg-emerald-600',
      addBtnHover: 'hover:bg-emerald-700',
    },
    {
      storageKey: 'alert_emails_new_order',
      icon: 'ri-shopping-bag-3-line',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      title: 'New Order Placed',
      description: 'Notified whenever a customer places a new order',
      accentBorder: 'border-amber-200',
      accentBg: 'bg-amber-50',
      accentText: 'text-amber-900',
      inputFocusBorder: 'focus:border-amber-400',
      addBtnBg: 'bg-amber-500',
      addBtnHover: 'hover:bg-amber-600',
    },
    {
      storageKey: 'alert_emails_vip',
      icon: 'ri-vip-crown-line',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      title: 'VIP Customer Activity',
      description: 'Notified when a VIP or high-value customer is active',
      accentBorder: 'border-orange-200',
      accentBg: 'bg-orange-50',
      accentText: 'text-orange-900',
      inputFocusBorder: 'focus:border-orange-400',
      addBtnBg: 'bg-orange-500',
      addBtnHover: 'hover:bg-orange-600',
    },
    {
      storageKey: 'alert_emails_conference',
      icon: 'ri-calendar-event-line',
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-600',
      title: 'Conference Registration',
      description: 'Notified when a new conference registration is submitted',
      accentBorder: 'border-slate-200',
      accentBg: 'bg-slate-50',
      accentText: 'text-slate-900',
      inputFocusBorder: 'focus:border-slate-400',
      addBtnBg: 'bg-slate-700',
      addBtnHover: 'hover:bg-slate-800',
    },
  ];

  return (
    <div className="p-6">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shrink-0">
          <i className="ri-notification-3-line text-white text-base"></i>
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">Email Alert Recipients</h2>
          <p className="text-xs text-slate-500 mt-0.5">Add multiple staff email addresses per alert type. Use the Test button to verify each address before going live.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {categories.map(cat => (
          <AlertCategory key={cat.storageKey} {...cat} />
        ))}
      </div>

      {/* Info footer */}
      <div className="mt-6 flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-xl px-5 py-4">
        <i className="ri-information-line text-slate-400 text-base mt-0.5 shrink-0"></i>
        <p className="text-xs text-slate-500 leading-relaxed">
          All recipients are saved to this browser automatically. Add as many addresses as needed per category — everyone listed will receive the corresponding alert. Click <strong className="text-slate-700">Test</strong> next to any address to send a verification email before launching.
        </p>
      </div>
    </div>
  );
}

// ── Types ──────────────────────────────────────────────────────────────────
interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  signupDate: string;
  orderCount: number;
  totalSpent: number;
}

interface ConferenceRegistration {
  id: string;
  name: string;
  email: string;
  company: string;
  event: string;
  submittedAt: string;
}

interface CustomerRanking {
  id: string;
  name: string;
  email: string;
  company: string;
  orderCount: number;
  totalSpent: number;
  lastOrderDate: string;
  avgOrderValue: number;
  vipNote?: string;
}

// ── Monthly spend data per customer ───────────────────────────────────────
const CUSTOMER_MONTHLY_SPEND: Record<string, { month: string; spend: number }[]> = {
  c1: [
    { month: 'Jun', spend: 820 }, { month: 'Jul', spend: 1340 }, { month: 'Aug', spend: 980 },
    { month: 'Sep', spend: 1560 }, { month: 'Oct', spend: 1120 }, { month: 'Nov', spend: 1890 },
    { month: 'Dec', spend: 2240 }, { month: 'Jan', spend: 1670 }, { month: 'Feb', spend: 2050 },
    { month: 'Mar', spend: 1980 }, { month: 'Apr', spend: 2310 }, { month: 'May', spend: 2640 },
  ],
  c2: [
    { month: 'Jun', spend: 540 }, { month: 'Jul', spend: 870 }, { month: 'Aug', spend: 720 },
    { month: 'Sep', spend: 1100 }, { month: 'Oct', spend: 960 }, { month: 'Nov', spend: 1340 },
    { month: 'Dec', spend: 1580 }, { month: 'Jan', spend: 1200 }, { month: 'Feb', spend: 1450 },
    { month: 'Mar', spend: 1680 }, { month: 'Apr', spend: 1920 }, { month: 'May', spend: 2100 },
  ],
  c3: [
    { month: 'Jun', spend: 310 }, { month: 'Jul', spend: 620 }, { month: 'Aug', spend: 480 },
    { month: 'Sep', spend: 890 }, { month: 'Oct', spend: 740 }, { month: 'Nov', spend: 1050 },
    { month: 'Dec', spend: 1230 }, { month: 'Jan', spend: 980 }, { month: 'Feb', spend: 1140 },
    { month: 'Mar', spend: 1320 }, { month: 'Apr', spend: 1480 }, { month: 'May', spend: 1560 },
  ],
};

const DEFAULT_MONTHLY_SPEND = [
  { month: 'Jun', spend: 120 }, { month: 'Jul', spend: 240 }, { month: 'Aug', spend: 180 },
  { month: 'Sep', spend: 310 }, { month: 'Oct', spend: 260 }, { month: 'Nov', spend: 390 },
  { month: 'Dec', spend: 450 }, { month: 'Jan', spend: 380 }, { month: 'Feb', spend: 420 },
  { month: 'Mar', spend: 510 }, { month: 'Apr', spend: 580 }, { month: 'May', spend: 640 },
];

const getMonthlySpend = (customerId: string) =>
  CUSTOMER_MONTHLY_SPEND[customerId] ?? DEFAULT_MONTHLY_SPEND;

// ── Mock data ─────────────────────────────────────────────────────────────
const MOCK_CUSTOMER_RANKINGS: CustomerRanking[] = [
  { id: 'c1', name: 'Marcus Delgado', email: 'marcus.delgado@interiorpro.com', company: 'Interior Pro Design Group', orderCount: 47, totalSpent: 18420.50, lastOrderDate: '2024-03-10', avgOrderValue: 391.93 },
  { id: 'c2', name: 'Sandra Whitfield', email: 'sandra@whitfielddesign.com', company: 'Whitfield Design Studio', orderCount: 39, totalSpent: 15870.00, lastOrderDate: '2024-03-08', avgOrderValue: 407.18 },
  { id: 'c3', name: 'James Thornton', email: 'j.thornton@contractorshub.com', company: 'Contractors Hub LLC', orderCount: 34, totalSpent: 12340.75, lastOrderDate: '2024-02-28', avgOrderValue: 363.26 },
  { id: 'c4', name: 'Priya Nair', email: 'priya.nair@luxehomes.com', company: 'Luxe Homes Realty', orderCount: 28, totalSpent: 10980.20, lastOrderDate: '2024-03-05', avgOrderValue: 392.15 },
  { id: 'c5', name: 'Robert Castillo', email: 'rcastillo@buildright.net', company: 'BuildRight Construction', orderCount: 25, totalSpent: 9650.00, lastOrderDate: '2024-02-20', avgOrderValue: 386.00 },
  { id: 'c6', name: 'Angela Foster', email: 'angela.foster@stagingco.com', company: 'StagingCo Interiors', orderCount: 22, totalSpent: 8210.40, lastOrderDate: '2024-01-30', avgOrderValue: 373.20 },
  { id: 'c7', name: 'Derek Huang', email: 'derek@huangproperties.com', company: 'Huang Properties Group', orderCount: 19, totalSpent: 7430.60, lastOrderDate: '2024-02-14', avgOrderValue: 391.08 },
  { id: 'c8', name: 'Tiffany Brooks', email: 'tbrooks@modernliving.com', company: 'Modern Living Concepts', orderCount: 17, totalSpent: 6890.00, lastOrderDate: '2024-01-22', avgOrderValue: 405.29 },
  { id: 'c9', name: 'Carlos Mendez', email: 'carlos.m@renovatepro.com', company: 'RenovatePro Services', orderCount: 15, totalSpent: 5740.80, lastOrderDate: '2024-03-01', avgOrderValue: 382.72 },
  { id: 'c10', name: 'Natalie Owens', email: 'n.owens@designstudio.io', company: 'Owens Design Studio', orderCount: 13, totalSpent: 4920.30, lastOrderDate: '2024-02-10', avgOrderValue: 378.49 },
  { id: 'c11', name: 'Brian Kowalski', email: 'brian.k@gmail.com', company: 'Individual', orderCount: 1, totalSpent: 89.99, lastOrderDate: '2023-04-12', avgOrderValue: 89.99 },
  { id: 'c12', name: 'Melissa Grant', email: 'mgrant@yahoo.com', company: 'Individual', orderCount: 1, totalSpent: 129.99, lastOrderDate: '2023-06-05', avgOrderValue: 129.99 },
  { id: 'c13', name: 'Tom Nguyen', email: 'tom.nguyen@hotmail.com', company: 'Individual', orderCount: 1, totalSpent: 179.98, lastOrderDate: '2023-08-20', avgOrderValue: 179.98 },
  { id: 'c14', name: 'Rachel Kim', email: 'rachel.kim@outlook.com', company: 'Kim Home Staging', orderCount: 2, totalSpent: 219.98, lastOrderDate: '2023-09-14', avgOrderValue: 109.99 },
  { id: 'c15', name: 'Steven Park', email: 'steven.park@gmail.com', company: 'Park Renovations', orderCount: 2, totalSpent: 259.98, lastOrderDate: '2023-10-02', avgOrderValue: 129.99 },
];

// ── Customer Orders ────────────────────────────────────────────────────────
const CUSTOMER_ORDERS: Record<string, typeof mockOrders> = {
  c1: [
    { ...mockOrders[0], id: 'ORD-2024-M001', total: 1240.50 },
    { ...mockOrders[1], id: 'ORD-2024-M002', total: 980.00 },
    { ...mockOrders[2], id: 'ORD-2023-M003', total: 760.00 },
  ],
  c2: [
    { ...mockOrders[1], id: 'ORD-2024-S001', total: 870.00 },
    { ...mockOrders[3], id: 'ORD-2023-S002', total: 540.00 },
  ],
  c3: [
    { ...mockOrders[0], id: 'ORD-2024-T001', total: 620.75 },
    { ...mockOrders[2], id: 'ORD-2023-T002', total: 430.00 },
  ],
};

const getCustomerOrders = (customerId: string) =>
  CUSTOMER_ORDERS[customerId] ?? [mockOrders[0]];

// ── Spend Trend Chart ─────────────────────────────────────────────────────
interface SpendTrendChartProps {
  data: { month: string; spend: number }[];
  customerId: string;
}

function SpendTrendChart({ data, customerId }: SpendTrendChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const W = 700; const H = 160; const padL = 56; const padR = 20; const padT = 20; const padB = 32;
  const chartW = W - padL - padR; const chartH = H - padT - padB;
  const maxSpend = Math.max(...data.map(d => d.spend));
  const minSpend = Math.min(...data.map(d => d.spend));
  const range = maxSpend - minSpend || 1;
  const xStep = chartW / (data.length - 1);
  const toX = (i: number) => padL + i * xStep;
  const toY = (v: number) => padT + chartH - ((v - minSpend) / range) * chartH;
  const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(d.spend).toFixed(1)}`).join(' ');
  const areaPath = `M ${toX(0).toFixed(1)} ${(padT + chartH).toFixed(1)} ` + data.map((d, i) => `L ${toX(i).toFixed(1)} ${toY(d.spend).toFixed(1)}`).join(' ') + ` L ${toX(data.length - 1).toFixed(1)} ${(padT + chartH).toFixed(1)} Z`;
  const gradId = `grad-${customerId}`;
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => ({ value: minSpend + t * range, y: padT + chartH - t * chartH }));
  const formatK = (v: number) => v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${Math.round(v)}`;
  return (
    <div className="relative w-full" style={{ aspectRatio: `${W}/${H}` }}>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full h-full" onMouseLeave={() => setHoveredIdx(null)}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {yTicks.map((t, i) => (
          <g key={i}>
            <line x1={padL} y1={t.y} x2={W - padR} y2={t.y} stroke="#f1f5f9" strokeWidth="1" />
            <text x={padL - 8} y={t.y + 4} textAnchor="end" fontSize="10" fill="#94a3b8" fontFamily="inherit">{formatK(t.value)}</text>
          </g>
        ))}
        <path d={areaPath} fill={`url(#${gradId})`} />
        <path d={linePath} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((d, i) => (
          <g key={i}>
            <text x={toX(i)} y={H - 6} textAnchor="middle" fontSize="10" fill={hoveredIdx === i ? '#0f172a' : '#94a3b8'} fontWeight={hoveredIdx === i ? '700' : '400'} fontFamily="inherit">{d.month}</text>
            <rect x={toX(i) - xStep / 2} y={padT} width={xStep} height={chartH + padB - 10} fill="transparent" className="cursor-crosshair" onMouseEnter={() => setHoveredIdx(i)} />
            {hoveredIdx === i && (<><line x1={toX(i)} y1={padT} x2={toX(i)} y2={padT + chartH} stroke="#10b981" strokeWidth="1" strokeDasharray="4 3" /><circle cx={toX(i)} cy={toY(d.spend)} r="5" fill="#10b981" stroke="white" strokeWidth="2" /></>)}
            {hoveredIdx !== i && (<circle cx={toX(i)} cy={toY(d.spend)} r="3" fill="#10b981" stroke="white" strokeWidth="1.5" />)}
          </g>
        ))}
        {hoveredIdx !== null && (() => {
          const d = data[hoveredIdx]; const cx = toX(hoveredIdx); const cy = toY(d.spend);
          const bw = 80; const bh = 36; const bx = Math.min(Math.max(cx - bw / 2, padL), W - padR - bw); const by = cy - bh - 10 < padT ? cy + 12 : cy - bh - 10;
          return (<g><rect x={bx} y={by} width={bw} height={bh} rx="6" fill="#0f172a" /><text x={bx + bw / 2} y={by + 13} textAnchor="middle" fontSize="10" fill="#94a3b8" fontFamily="inherit">{d.month} spend</text><text x={bx + bw / 2} y={by + 27} textAnchor="middle" fontSize="12" fill="white" fontWeight="700" fontFamily="inherit">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(d.spend)}</text></g>);
        })()}
      </svg>
    </div>
  );
}

// ── Send Email Modal ──────────────────────────────────────────────────────
interface SendEmailModalProps {
  customer: CustomerRanking;
  onClose: () => void;
}

function SendEmailModal({ customer, onClose }: SendEmailModalProps) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [template, setTemplate] = useState('custom');

  const templates = [
    { id: 'custom', label: 'Custom Message' },
    { id: 'followup', label: 'Order Follow-Up' },
    { id: 'promo', label: 'Promotional Offer' },
    { id: 'restock', label: 'Restock Notification' },
    { id: 'thankyou', label: 'Thank You' },
  ];

  const applyTemplate = (id: string) => {
    setTemplate(id);
    if (id === 'followup') {
      setSubject(`Following up on your recent order — Classic Same Day Blinds`);
      setBody(`Hi ${customer.name.split(' ')[0]},\n\nThank you for your recent order with Classic Same Day Blinds! We wanted to check in and make sure everything arrived to your satisfaction.\n\nIf you have any questions or need assistance with installation, our team is here to help.\n\nWarm regards,\nClassic Same Day Blinds Team`);
    } else if (id === 'promo') {
      setSubject(`Exclusive offer just for you — 15% off your next order`);
      setBody(`Hi ${customer.name.split(' ')[0]},\n\nAs one of our valued customers, we\'d like to offer you an exclusive 15% discount on your next order.\n\nUse code: VIP15 at checkout.\n\nThis offer expires in 7 days. Shop now at classicsamedayblinds.com.\n\nBest,\nClassic Same Day Blinds Team`);
    } else if (id === 'restock') {
      setSubject(`Items you love are back in stock!`);
      setBody(`Hi ${customer.name.split(' ')[0]},\n\nGreat news! Products from your previous orders are back in stock and ready to ship.\n\nVisit our website to place your order and enjoy same-day delivery on qualifying items.\n\nThank you for your continued business!\n\nClassic Same Day Blinds Team`);
    } else if (id === 'thankyou') {
      setSubject(`Thank you for being a loyal customer`);
      setBody(`Hi ${customer.name.split(' ')[0]},\n\nWe just wanted to take a moment to say thank you for your continued support of Classic Same Day Blinds.\n\nYour loyalty means the world to us, and we look forward to serving you for many years to come.\n\nWith gratitude,\nClassic Same Day Blinds Team`);
    } else {
      setSubject('');
      setBody('');
    }
  };

  const handleSend = () => {
    if (!subject.trim() || !body.trim()) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setTimeout(() => onClose(), 2000);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 py-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
              <i className="ri-mail-send-line text-emerald-600 text-lg"></i>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Send Email</h2>
              <p className="text-xs text-slate-500">To: <span className="font-semibold text-slate-700">{customer.name}</span> &lt;{customer.email}&gt;</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer">
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>

        {sent ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 px-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <i className="ri-check-line text-3xl text-emerald-600"></i>
            </div>
            <p className="text-lg font-bold text-slate-900 mb-1">Email Sent!</p>
            <p className="text-sm text-slate-500">Your message has been sent to {customer.name}.</p>
          </div>
        ) : (
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
            {/* Template picker */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Quick Templates</label>
              <div className="flex flex-wrap gap-2">
                {templates.map(t => (
                  <button
                    key={t.id}
                    onClick={() => applyTemplate(t.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer whitespace-nowrap ${
                      template === t.id
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* To field */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">To</label>
              <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-bold">{customer.name.charAt(0)}</span>
                </div>
                <span className="text-sm text-slate-700 font-medium">{customer.name}</span>
                <span className="text-sm text-slate-400">&lt;{customer.email}&gt;</span>
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Enter email subject..."
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
              />
            </div>

            {/* Body */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Message</label>
              <textarea
                value={body}
                onChange={e => setBody(e.target.value.slice(0, 500))}
                placeholder="Write your message here..."
                rows={8}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent resize-none"
              />
              <p className="text-xs text-slate-400 mt-1 text-right">{body.length}/500</p>
            </div>
          </div>
        )}

        {!sent && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between shrink-0">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap">
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={!subject.trim() || !body.trim() || sending}
              className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              {sending ? (
                <><i className="ri-loader-4-line animate-spin"></i> Sending...</>
              ) : (
                <><i className="ri-send-plane-line"></i> Send Email</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Customer Detail Panel (right side) ───────────────────────────────────
interface CustomerDetailPanelProps {
  customer: CustomerRanking;
  onSendEmail: (customer: CustomerRanking) => void;
  onClose: () => void;
}

function CustomerDetailPanel({ customer, onSendEmail, onClose }: CustomerDetailPanelProps) {
  const orders = getCustomerOrders(customer.id);
  const monthlyData = getMonthlySpend(customer.id);
  const [selectedOrderId, setSelectedOrderId] = useState<string>(orders[0]?.id ?? '');
  const selectedOrder = orders.find(o => o.id === selectedOrderId) ?? orders[0];

  const notesKey = `customer_notes_${customer.id}`;
  const [note, setNote] = useState<string>(() => localStorage.getItem(notesKey) ?? '');
  const [noteSaved, setNoteSaved] = useState(false);
  const [noteEditing, setNoteEditing] = useState(false);

  const handleSaveNote = () => {
    localStorage.setItem(notesKey, note);
    setNoteSaved(true);
    setNoteEditing(false);
    setTimeout(() => setNoteSaved(false), 2500);
  };

  const handleClearNote = () => {
    setNote('');
    localStorage.removeItem(notesKey);
    setNoteEditing(false);
  };

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const subtotal = selectedOrder?.items.reduce((s, i) => s + i.price * i.quantity, 0) ?? 0;
  const shipping = subtotal >= 99 ? 0 : 12.99;
  const tax = subtotal * 0.08;

  const lastMonth = monthlyData[monthlyData.length - 1].spend;
  const prevMonth = monthlyData[monthlyData.length - 2].spend;
  const trendPct = ((lastMonth - prevMonth) / prevMonth) * 100;
  const totalChartSpend = monthlyData.reduce((s, d) => s + d.spend, 0);
  const peakMonth = monthlyData.reduce((a, b) => (b.spend > a.spend ? b : a));

  const getTierBadge = (orderCount: number) => {
    if (orderCount >= 30) return { label: 'Platinum', color: 'bg-slate-800 text-white' };
    if (orderCount >= 20) return { label: 'Gold', color: 'bg-amber-100 text-amber-700' };
    if (orderCount >= 10) return { label: 'Silver', color: 'bg-slate-100 text-slate-600' };
    if (orderCount >= 3) return { label: 'Bronze', color: 'bg-orange-100 text-orange-700' };
    return { label: 'New', color: 'bg-green-100 text-green-700' };
  };

  const tier = getTierBadge(customer.orderCount);

  const handleExport = () => {
    const rows = [
      ['Customer Name', 'Email', 'Company', 'Order ID', 'Date', 'Status', 'Total'],
      ...orders.map(o => [customer.name, customer.email, customer.company, o.id, o.date, o.status, o.total.toFixed(2)]),
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${customer.name.replace(/\s+/g, '_')}_orders.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Panel Header */}
      <div className="px-5 py-4 border-b border-slate-100 shrink-0">
        <div className="flex items-start justify-between mb-3">
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer shrink-0">
            <i className="ri-arrow-left-line text-base"></i>
          </button>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-download-2-line text-sm"></i> Export
            </button>
            <button
              onClick={() => onSendEmail(customer)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-mail-send-line text-sm"></i> Email
            </button>
          </div>
        </div>

        {/* Avatar + name */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-lg">{customer.name.charAt(0)}</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-slate-900 text-sm">{customer.name}</p>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${tier.color}`}>{tier.label}</span>
            </div>
            <p className="text-xs text-slate-500 truncate">{customer.email}</p>
            <p className="text-xs text-slate-400 truncate">{customer.company}</p>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-slate-900">{customer.orderCount}</p>
            <p className="text-xs text-slate-500">Orders</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-3 text-center">
            <p className="text-base font-bold text-emerald-700">{formatCurrency(customer.totalSpent)}</p>
            <p className="text-xs text-slate-500">Total Spent</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-3 text-center">
            <p className="text-base font-bold text-amber-700">{formatCurrency(customer.avgOrderValue)}</p>
            <p className="text-xs text-slate-500">Avg Order</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <p className="text-xs font-bold text-slate-900">{formatDate(customer.lastOrderDate)}</p>
            <p className="text-xs text-slate-500">Last Order</p>
          </div>
        </div>

        {/* Spend Trend */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <i className="ri-line-chart-line text-emerald-500"></i> Spend Trend
            </p>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${trendPct >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
              <i className={trendPct >= 0 ? 'ri-arrow-up-line' : 'ri-arrow-down-line'}></i>
              {Math.abs(trendPct).toFixed(1)}%
            </span>
          </div>
          <SpendTrendChart data={monthlyData} customerId={customer.id} />
          <div className="flex items-center gap-3 mt-2 pt-2 border-t border-slate-200 flex-wrap">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
              <span className="text-xs text-slate-500">12-mo: <strong className="text-slate-700">{formatCurrency(totalChartSpend)}</strong></span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-amber-400"></div>
              <span className="text-xs text-slate-500">Peak: <strong className="text-slate-700">{peakMonth.month}</strong></span>
            </div>
          </div>
        </div>

        {/* Internal Notes */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <i className="ri-sticky-note-line text-amber-500"></i> Internal Notes
            </p>
            <div className="flex items-center gap-1.5">
              {noteSaved && <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1"><i className="ri-check-line"></i> Saved</span>}
              {note && !noteEditing && (
                <button onClick={() => setNoteEditing(true)} className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer whitespace-nowrap">Edit</button>
              )}
              {note && (
                <button onClick={handleClearNote} className="text-xs text-red-400 hover:text-red-600 cursor-pointer whitespace-nowrap">Clear</button>
              )}
            </div>
          </div>
          {note && !noteEditing ? (
            <div onClick={() => setNoteEditing(true)} className="w-full min-h-[60px] bg-white border border-amber-200 rounded-lg px-3 py-2 text-xs text-slate-700 leading-relaxed cursor-text whitespace-pre-wrap">{note}</div>
          ) : (
            <div>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                onFocus={() => setNoteEditing(true)}
                placeholder="Add internal notes..."
                maxLength={500}
                rows={3}
                className="w-full bg-white border border-amber-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-100 rounded-lg px-3 py-2 text-xs text-slate-700 placeholder-slate-400 outline-none resize-none"
              />
              <div className="flex justify-between items-center mt-1.5">
                <span className="text-xs text-slate-400">{note.length}/500</span>
                <button
                  onClick={handleSaveNote}
                  disabled={!note.trim()}
                  className="px-3 py-1 text-xs font-semibold bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order History */}
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Order History ({orders.length})</p>
          <div className="space-y-2">
            {orders.map(o => (
              <button
                key={o.id}
                onClick={() => setSelectedOrderId(o.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all cursor-pointer ${
                  selectedOrderId === o.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold">{o.id}</span>
                  <span className={`text-xs font-bold ${selectedOrderId === o.id ? 'text-emerald-300' : 'text-emerald-600'}`}>{formatCurrency(o.total)}</span>
                </div>
                <p className={`text-xs mt-0.5 ${selectedOrderId === o.id ? 'text-slate-300' : 'text-slate-400'}`}>{formatDate(o.date)}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Order Items */}
        {selectedOrder && (
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Items — {selectedOrder.id}</p>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              {selectedOrder.items.map((item, idx) => (
                <div key={item.id} className={`flex items-center gap-3 px-3 py-2.5 ${idx !== selectedOrder.items.length - 1 ? 'border-b border-slate-100' : ''}`}>
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover object-top" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">{item.name}</p>
                    <p className="text-xs text-slate-400">{item.size} · Qty {item.quantity}</p>
                  </div>
                  <p className="text-xs font-bold text-slate-900 shrink-0">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              ))}
              <div className="px-3 py-2 bg-slate-50 border-t border-slate-200 flex justify-between">
                <span className="text-xs text-slate-500">Order Total</span>
                <span className="text-xs font-bold text-slate-900">{formatCurrency(selectedOrder.total)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Customer Sidebar ──────────────────────────────────────────────────────
interface CustomerSidebarProps {
  customers: CustomerRanking[];
  selectedId: string | null;
  onSelect: (customer: CustomerRanking) => void;
  onSendEmail: (customer: CustomerRanking) => void;
}

function CustomerSidebar({ customers, selectedId, onSelect, onSendEmail }: CustomerSidebarProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'vip' | 'new'>('all');

  const filtered = customers.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase());
    if (filter === 'vip') return matchSearch && c.orderCount >= 20;
    if (filter === 'new') return matchSearch && c.orderCount < 3;
    return matchSearch;
  });

  const getTierColor = (orderCount: number) => {
    if (orderCount >= 30) return 'bg-slate-800';
    if (orderCount >= 20) return 'bg-amber-400';
    if (orderCount >= 10) return 'bg-slate-400';
    if (orderCount >= 3) return 'bg-orange-300';
    return 'bg-emerald-400';
  };

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Sidebar Header */}
      <div className="px-4 py-4 border-b border-slate-100 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-bold text-slate-900">Customers</p>
            <p className="text-xs text-slate-400">{customers.length} total accounts</p>
          </div>
          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
            <i className="ri-group-line text-emerald-600 text-sm"></i>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-2">
          <i className="ri-search-line absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
          />
        </div>

        {/* Filter pills */}
        <div className="flex gap-1.5">
          {(['all', 'vip', 'new'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                filter === f ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {f === 'all' ? 'All' : f === 'vip' ? '⭐ VIP' : '🌱 New'}
            </button>
          ))}
        </div>
      </div>

      {/* Customer List */}
      <div className="overflow-y-auto flex-1">
        {filtered.length === 0 ? (
          <div className="py-10 text-center px-4">
            <i className="ri-search-line text-2xl text-slate-300 block mb-2"></i>
            <p className="text-xs text-slate-400">No customers found</p>
          </div>
        ) : (
          filtered.map(customer => (
            <div
              key={customer.id}
              onClick={() => onSelect(customer)}
              className={`group flex items-center gap-3 px-4 py-3 border-b border-slate-50 cursor-pointer transition-all ${
                selectedId === customer.id ? 'bg-slate-900' : 'hover:bg-slate-50'
              }`}
            >
              {/* Avatar with tier dot */}
              <div className="relative shrink-0">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${selectedId === customer.id ? 'bg-white' : 'bg-slate-800'}`}>
                  <span className={`font-bold text-sm ${selectedId === customer.id ? 'text-slate-900' : 'text-white'}`}>{customer.name.charAt(0)}</span>
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getTierColor(customer.orderCount)}`}></div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold truncate ${selectedId === customer.id ? 'text-white' : 'text-slate-900'}`}>{customer.name}</p>
                <p className={`text-xs truncate ${selectedId === customer.id ? 'text-slate-300' : 'text-slate-400'}`}>{customer.company}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-xs ${selectedId === customer.id ? 'text-emerald-300' : 'text-emerald-600'} font-semibold`}>{formatCurrency(customer.totalSpent)}</span>
                  <span className={`text-xs ${selectedId === customer.id ? 'text-slate-400' : 'text-slate-300'}`}>·</span>
                  <span className={`text-xs ${selectedId === customer.id ? 'text-slate-300' : 'text-slate-400'}`}>{customer.orderCount} orders</span>
                </div>
              </div>

              {/* Quick email button */}
              <button
                onClick={e => { e.stopPropagation(); onSendEmail(customer); }}
                className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all cursor-pointer shrink-0 opacity-0 group-hover:opacity-100 ${
                  selectedId === customer.id ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-slate-100 hover:bg-emerald-100 text-slate-500 hover:text-emerald-600'
                }`}
                title="Send email"
              >
                <i className="ri-mail-line text-sm"></i>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function AdminUsersPage() {
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [conferenceRegs, setConferenceRegs] = useState<ConferenceRegistration[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [rankingSearch, setRankingSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'customers' | 'users' | 'conferences' | 'rankings' | 'alerts'>('customers');
  const [rankingView, setRankingView] = useState<'top' | 'least'>('top');
  const [sortBy, setSortBy] = useState<'orders' | 'volume'>('orders');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRanking | null>(MOCK_CUSTOMER_RANKINGS[0]);
  const [emailTarget, setEmailTarget] = useState<CustomerRanking | null>(null);

  useEffect(() => {
    loadUsers();
    loadConferenceRegistrations();
  }, []);

  const loadUsers = () => {
    const storedUsers = localStorage.getItem('registered_users');
    if (storedUsers) {
      try {
        const parsedUsers = JSON.parse(storedUsers);
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const usersWithData = parsedUsers.map((user: any) => {
          const userOrders = orders.filter((order: any) => order.customerEmail === user.email);
          const totalSpent = userOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
          return {
            id: user.id || `user_${Date.now()}_${Math.random()}`,
            name: user.name || user.fullName || 'N/A',
            email: user.email,
            signupDate: user.createdAt || user.signupDate || new Date().toISOString(),
            orderCount: userOrders.length,
            totalSpent,
          };
        });
        setUsers(usersWithData);
      } catch (error) {
        console.error('Error loading users:', error);
      }
    }
  };

  const loadConferenceRegistrations = () => {
    const storedRegs = localStorage.getItem('conference_registrations');
    if (storedRegs) {
      try {
        setConferenceRegs(JSON.parse(storedRegs));
      } catch (error) {
        console.error('Error loading conference registrations:', error);
      }
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredConferenceRegs = conferenceRegs.filter(reg =>
    reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.event.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRankings = MOCK_CUSTOMER_RANKINGS.filter(c =>
    c.name.toLowerCase().includes(rankingSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(rankingSearch.toLowerCase())
  );

  const topCustomers = [...filteredRankings].filter(c => c.orderCount >= 10).sort((a, b) => sortBy === 'orders' ? b.orderCount - a.orderCount : b.totalSpent - a.totalSpent);
  const leastCustomers = [...filteredRankings].filter(c => c.orderCount < 10).sort((a, b) => sortBy === 'orders' ? a.orderCount - b.orderCount : a.totalSpent - b.totalSpent);
  const displayedRankings = rankingView === 'top' ? topCustomers : leastCustomers;

  const maxOrders = Math.max(...MOCK_CUSTOMER_RANKINGS.map(c => c.orderCount));
  const maxSpent = Math.max(...MOCK_CUSTOMER_RANKINGS.map(c => c.totalSpent));

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const getTierBadge = (orderCount: number) => {
    if (orderCount >= 30) return { label: 'Platinum', color: 'bg-slate-800 text-white' };
    if (orderCount >= 20) return { label: 'Gold', color: 'bg-amber-100 text-amber-700' };
    if (orderCount >= 10) return { label: 'Silver', color: 'bg-slate-100 text-slate-600' };
    if (orderCount >= 3) return { label: 'Bronze', color: 'bg-orange-100 text-orange-700' };
    return { label: 'New', color: 'bg-green-100 text-green-700' };
  };

  const totalVolume = MOCK_CUSTOMER_RANKINGS.reduce((s, c) => s + c.totalSpent, 0);
  const totalOrders = MOCK_CUSTOMER_RANKINGS.reduce((s, c) => s + c.orderCount, 0);
  const avgSpend = totalVolume / MOCK_CUSTOMER_RANKINGS.length;

  return (
    <div className="flex h-full" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Email Modal */}
      {emailTarget && (
        <SendEmailModal customer={emailTarget} onClose={() => setEmailTarget(null)} />
      )}

      {/* ── LEFT: Customer Sidebar ── */}
      <div className="w-72 shrink-0 flex flex-col h-full overflow-hidden">
        <CustomerSidebar
          customers={MOCK_CUSTOMER_RANKINGS}
          selectedId={selectedCustomer?.id ?? null}
          onSelect={c => { setSelectedCustomer(c); setActiveTab('customers'); }}
          onSendEmail={c => setEmailTarget(c)}
        />
      </div>

      {/* ── RIGHT: Main Content ── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* If a customer is selected and we're on the customers tab, show detail panel */}
        {activeTab === 'customers' && selectedCustomer ? (
          <div className="flex-1 overflow-hidden">
            <CustomerDetailPanel
              customer={selectedCustomer}
              onSendEmail={c => setEmailTarget(c)}
              onClose={() => setSelectedCustomer(null)}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-auto p-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Total Customers</p>
                    <p className="text-2xl font-bold text-slate-900">{MOCK_CUSTOMER_RANKINGS.length}</p>
                  </div>
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <i className="ri-user-line text-xl text-slate-600"></i>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Conference Regs</p>
                    <p className="text-2xl font-bold text-slate-900">{conferenceRegs.length}</p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <i className="ri-calendar-event-line text-xl text-green-600"></i>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Total Orders</p>
                    <p className="text-2xl font-bold text-slate-900">{totalOrders}</p>
                  </div>
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <i className="ri-shopping-bag-3-line text-xl text-amber-600"></i>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Avg Spend</p>
                    <p className="text-xl font-bold text-slate-900">{formatCurrency(avgSpend)}</p>
                  </div>
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <i className="ri-money-dollar-circle-line text-xl text-emerald-600"></i>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="border-b border-slate-200 px-6">
                <div className="flex gap-6 overflow-x-auto">
                  {[
                    { id: 'users', label: `Registered Users (${users.length})`, icon: 'ri-user-line' },
                    { id: 'conferences', label: `Conferences (${conferenceRegs.length})`, icon: 'ri-calendar-event-line' },
                    { id: 'rankings', label: 'Rankings', icon: 'ri-trophy-line' },
                    { id: 'alerts', label: 'Email Alerts', icon: 'ri-notification-3-line' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                        activeTab === tab.id ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <i className={tab.icon}></i>{tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search */}
              {activeTab !== 'rankings' && activeTab !== 'alerts' && (
                <div className="p-5 border-b border-slate-200">
                  <div className="relative">
                    <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Alerts Tab */}
              {activeTab === 'alerts' && <EmailAlertsPanel />}

              {/* Rankings Tab */}
              {activeTab === 'rankings' && (
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row gap-3 mb-5">
                    <div className="relative flex-1">
                      <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                      <input type="text" placeholder="Search customers..." value={rankingSearch} onChange={e => setRankingSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none text-sm" />
                    </div>
                    <div className="flex items-center bg-slate-100 rounded-lg p-1">
                      <button onClick={() => setRankingView('top')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${rankingView === 'top' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}><i className="ri-trophy-line mr-1"></i>Best</button>
                      <button onClick={() => setRankingView('least')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${rankingView === 'least' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}><i className="ri-arrow-down-line mr-1"></i>Least</button>
                    </div>
                    <div className="flex items-center bg-slate-100 rounded-lg p-1">
                      <button onClick={() => setSortBy('orders')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${sortBy === 'orders' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>By Orders</button>
                      <button onClick={() => setSortBy('volume')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${sortBy === 'volume' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>By Volume</button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {displayedRankings.map((customer, index) => {
                      const tier = getTierBadge(customer.orderCount);
                      const rank = rankingView === 'top' ? index + 1 : null;
                      return (
                        <div key={customer.id} className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm ${rank === 1 ? 'bg-amber-400 text-white' : rank === 2 ? 'bg-slate-300 text-slate-700' : rank === 3 ? 'bg-orange-300 text-white' : rankingView === 'top' ? 'bg-slate-100 text-slate-600' : 'bg-red-50 text-red-400'}`}>
                            {rank ? (rank <= 3 ? ['🥇','🥈','🥉'][rank-1] : `#${rank}`) : <i className="ri-arrow-down-line text-red-400"></i>}
                          </div>
                          <div className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">{customer.name.charAt(0)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="font-semibold text-slate-900 text-sm truncate">{customer.name}</p>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${tier.color}`}>{tier.label}</span>
                            </div>
                            <p className="text-xs text-slate-500 truncate">{customer.email}</p>
                          </div>
                          <div className="flex gap-5 flex-shrink-0">
                            <div className="text-center">
                              <p className="text-base font-bold text-slate-900">{customer.orderCount}</p>
                              <p className="text-xs text-slate-500">Orders</p>
                              <div className="w-16 h-1.5 bg-slate-100 rounded-full mt-1"><div className={`h-full rounded-full ${rankingView === 'top' ? 'bg-amber-400' : 'bg-red-300'}`} style={{ width: `${(customer.orderCount / maxOrders) * 100}%` }} /></div>
                            </div>
                            <div className="text-center">
                              <p className="text-base font-bold text-slate-900">{formatCurrency(customer.totalSpent)}</p>
                              <p className="text-xs text-slate-500">Spent</p>
                              <div className="w-20 h-1.5 bg-slate-100 rounded-full mt-1"><div className={`h-full rounded-full ${rankingView === 'top' ? 'bg-emerald-400' : 'bg-red-300'}`} style={{ width: `${(customer.totalSpent / maxSpent) * 100}%` }} /></div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button onClick={() => { setSelectedCustomer(customer); setActiveTab('customers'); }} className="px-3 py-1.5 text-xs font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap cursor-pointer"><i className="ri-eye-line mr-1"></i>View</button>
                            <button onClick={() => setEmailTarget(customer)} className="px-3 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors whitespace-nowrap cursor-pointer"><i className="ri-mail-line mr-1"></i>Email</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Users Tab */}
              {activeTab === 'users' && (
                <div className="overflow-x-auto">
                  {filteredUsers.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3"><i className="ri-user-line text-2xl text-slate-400"></i></div>
                      <p className="text-slate-600 text-sm">{searchTerm ? 'No users match your search' : 'No registered users yet'}</p>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="text-left py-3 px-5 text-xs font-semibold text-slate-600 uppercase tracking-wider">User</th>
                          <th className="text-left py-3 px-5 text-xs font-semibold text-slate-600 uppercase tracking-wider">Email</th>
                          <th className="text-left py-3 px-5 text-xs font-semibold text-slate-600 uppercase tracking-wider">Signup</th>
                          <th className="text-left py-3 px-5 text-xs font-semibold text-slate-600 uppercase tracking-wider">Orders</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredUsers.map(user => (
                          <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-5">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-slate-900 rounded-full flex items-center justify-center shrink-0"><span className="text-white font-bold text-sm">{user.name.charAt(0).toUpperCase()}</span></div>
                                <p className="font-medium text-slate-900 text-sm">{user.name}</p>
                              </div>
                            </td>
                            <td className="py-3 px-5 text-sm text-slate-600">{user.email}</td>
                            <td className="py-3 px-5 text-sm text-slate-600">{formatDate(user.signupDate)}</td>
                            <td className="py-3 px-5">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${user.orderCount > 0 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{user.orderCount} orders</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* Conferences Tab */}
              {activeTab === 'conferences' && (
                <div className="overflow-x-auto">
                  {filteredConferenceRegs.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3"><i className="ri-calendar-event-line text-2xl text-slate-400"></i></div>
                      <p className="text-slate-600 text-sm">{searchTerm ? 'No registrations match your search' : 'No conference registrations yet'}</p>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="text-left py-3 px-5 text-xs font-semibold text-slate-600 uppercase tracking-wider">Name</th>
                          <th className="text-left py-3 px-5 text-xs font-semibold text-slate-600 uppercase tracking-wider">Email</th>
                          <th className="text-left py-3 px-5 text-xs font-semibold text-slate-600 uppercase tracking-wider">Company</th>
                          <th className="text-left py-3 px-5 text-xs font-semibold text-slate-600 uppercase tracking-wider">Event</th>
                          <th className="text-left py-3 px-5 text-xs font-semibold text-slate-600 uppercase tracking-wider">Submitted</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredConferenceRegs.map(reg => (
                          <tr key={reg.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-5">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center shrink-0"><span className="text-green-700 font-bold text-sm">{reg.name.charAt(0).toUpperCase()}</span></div>
                                <p className="font-medium text-slate-900 text-sm">{reg.name}</p>
                              </div>
                            </td>
                            <td className="py-3 px-5 text-sm text-slate-600">{reg.email}</td>
                            <td className="py-3 px-5 text-sm text-slate-600">{reg.company}</td>
                            <td className="py-3 px-5"><span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 whitespace-nowrap">{reg.event}</span></td>
                            <td className="py-3 px-5 text-sm text-slate-600">{formatDate(reg.submittedAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
