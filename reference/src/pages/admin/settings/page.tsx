import { useState, useEffect } from 'react';
import DirectMessagePanel, { type RecipientInfo } from '../layout/DirectMessagePanel';

const STORAGE_KEY = 'admin_system_settings';

interface ServiceConfig {
  id: string;
  name: string;
  description: string;
  category: 'payment' | 'ai' | 'email' | 'analytics' | 'database' | 'ecommerce' | 'communication';
  icon: string;
  iconBg: string;
  iconColor: string;
  secretKey: string;
  webhookUrl?: string;
  status: 'connected' | 'partial' | 'disconnected';
  managedVia: 'supabase_secrets' | 'local' | 'env';
  docsUrl: string;
  requiredSecrets: { key: string; label: string; description: string; isWebhook?: boolean }[];
  features: string[];
}

interface SettingsState {
  apiKeys: Record<string, Record<string, string>>;
  siteSettings: {
    siteName: string;
    adminEmail: string;
    timezone: string;
    currency: string;
    businessPhone: string;
    businessAddress: string;
    defaultDiscount: string;
  };
}

const DEFAULT_SETTINGS: SettingsState = {
  apiKeys: {},
  siteSettings: {
    siteName: 'Classic Same Day Blinds',
    adminEmail: '',
    timezone: 'America/Chicago',
    currency: 'USD',
    businessPhone: '',
    businessAddress: '',
    defaultDiscount: '15',
  },
};

const SERVICES: ServiceConfig[] = [
  {
    id: 'supabase',
    name: 'Supabase',
    description: 'Database, Auth, Storage & Edge Functions backend',
    category: 'database',
    icon: 'ri-database-2-line',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    secretKey: '',
    status: 'connected',
    managedVia: 'env',
    docsUrl: 'https://supabase.com/docs',
    requiredSecrets: [
      { key: 'VITE_PUBLIC_SUPABASE_URL', label: 'Project URL', description: 'Your Supabase project URL' },
      { key: 'VITE_PUBLIC_SUPABASE_ANON_KEY', label: 'Anon Key', description: 'Public anonymous key for client access' },
    ],
    features: ['PostgreSQL Database', 'Row Level Security', 'Edge Functions', 'Real-time subscriptions'],
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Payment processing for checkout and subscriptions',
    category: 'payment',
    icon: 'ri-bank-card-line',
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
    secretKey: '',
    status: 'connected',
    managedVia: 'supabase_secrets',
    docsUrl: 'https://stripe.com/docs',
    requiredSecrets: [
      { key: 'STRIPE_SECRET_KEY', label: 'Secret Key', description: 'sk_live_... or sk_test_... from Stripe dashboard' },
      { key: 'STRIPE_WEBHOOK_SECRET', label: 'Webhook Secret', description: 'whsec_... for verifying webhook events', isWebhook: true },
    ],
    features: ['Checkout sessions', 'Payment intents', 'Webhook events', 'Subscription billing'],
  },
  {
    id: 'anthropic',
    name: 'Claude (Anthropic)',
    description: 'AI product matching agent for competitor pricing analysis',
    category: 'ai',
    icon: 'ri-sparkling-2-fill',
    iconBg: 'bg-fuchsia-50',
    iconColor: 'text-fuchsia-600',
    secretKey: '',
    status: 'disconnected',
    managedVia: 'supabase_secrets',
    docsUrl: 'https://console.anthropic.com',
    requiredSecrets: [
      { key: 'ANTHROPIC_API_KEY', label: 'API Key', description: 'sk-ant-... from console.anthropic.com' },
    ],
    features: ['Product matching agent', 'Competitor price analysis', 'AI-powered suggestions', 'Confidence scoring'],
  },
  {
    id: 'resend',
    name: 'Resend',
    description: 'Transactional email delivery for order confirmations',
    category: 'email',
    icon: 'ri-mail-send-line',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    secretKey: '',
    status: 'partial',
    managedVia: 'supabase_secrets',
    docsUrl: 'https://resend.com/docs',
    requiredSecrets: [
      { key: 'RESEND_API_KEY', label: 'API Key', description: 're_... from resend.com dashboard' },
    ],
    features: ['Order confirmation emails', 'Shipping notifications', 'Admin alerts', 'HTML email templates'],
  },
  {
    id: 'google_reviews',
    name: 'Google Reviews',
    description: 'Fetch and display live Google business reviews',
    category: 'analytics',
    icon: 'ri-google-fill',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    secretKey: '',
    status: 'partial',
    managedVia: 'supabase_secrets',
    docsUrl: 'https://developers.google.com/maps/documentation/places',
    requiredSecrets: [
      { key: 'GOOGLE_PLACES_API_KEY', label: 'Places API Key', description: 'From Google Cloud Console — Places API enabled' },
      { key: 'GOOGLE_PLACE_ID', label: 'Place ID', description: 'Your Google Business Place ID (ChIJ...)' },
    ],
    features: ['Live review fetching', 'Star rating display', 'Review count sync', 'Homepage integration'],
  },
  {
    id: 'shopify',
    name: 'Shopify',
    description: 'Connect your Shopify store products and inventory',
    category: 'ecommerce',
    icon: 'ri-shopping-bag-2-line',
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600',
    secretKey: '',
    status: 'disconnected',
    managedVia: 'supabase_secrets',
    docsUrl: 'https://shopify.dev/docs/api/storefront',
    requiredSecrets: [
      { key: 'ShopifyDomain', label: 'Store Domain', description: 'your-store.myshopify.com' },
      { key: 'StorefrontAccessToken', label: 'Storefront Access Token', description: 'From Shopify → Apps → Private apps → Storefront API' },
    ],
    features: ['Product catalog sync', 'Inventory tracking', 'Cart integration', 'Order management'],
  },
  {
    id: 'smtp',
    name: 'SMTP / Custom Email',
    description: 'Custom SMTP server for sending admin and customer emails',
    category: 'email',
    icon: 'ri-server-line',
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-600',
    secretKey: '',
    status: 'disconnected',
    managedVia: 'local',
    docsUrl: 'https://nodemailer.com/',
    requiredSecrets: [
      { key: 'SMTP_HOST', label: 'SMTP Host', description: 'smtp.gmail.com / smtp.sendgrid.net etc.' },
      { key: 'SMTP_PORT', label: 'SMTP Port', description: '587 (TLS) or 465 (SSL)' },
      { key: 'SMTP_USER', label: 'Username / Email', description: 'Your SMTP login username' },
      { key: 'SMTP_PASS', label: 'Password / API Key', description: 'SMTP password or API key' },
    ],
    features: ['Custom sender domain', 'Bulk email support', 'Delivery tracking', 'Alternative to Resend'],
  },
  {
    id: 'google_analytics',
    name: 'Google Analytics',
    description: 'Track website visitors, conversions and ecommerce events',
    category: 'analytics',
    icon: 'ri-line-chart-fill',
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-500',
    secretKey: '',
    status: 'disconnected',
    managedVia: 'local',
    docsUrl: 'https://analytics.google.com',
    requiredSecrets: [
      { key: 'GA_MEASUREMENT_ID', label: 'Measurement ID', description: 'G-XXXXXXXXXX from Google Analytics 4 property' },
    ],
    features: ['Page view tracking', 'Ecommerce events', 'Conversion goals', 'Audience insights'],
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  database: 'Database & Infrastructure',
  payment: 'Payments',
  ai: 'Artificial Intelligence',
  email: 'Email & Notifications',
  analytics: 'Analytics & Tracking',
  ecommerce: 'Ecommerce',
  communication: 'Communication',
};

function loadSettings(): SettingsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function StatusBadge({ status }: { status: 'connected' | 'partial' | 'disconnected' }) {
  const map = {
    connected:    { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', label: 'Connected' },
    partial:      { bg: 'bg-amber-50 text-amber-700 border-amber-200',       dot: 'bg-amber-400',   label: 'Needs Config' },
    disconnected: { bg: 'bg-slate-100 text-slate-500 border-slate-200',      dot: 'bg-slate-400',   label: 'Not Connected' },
  };
  const { bg, dot, label } = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot} ${status === 'connected' ? 'animate-pulse' : ''}`}></span>
      {label}
    </span>
  );
}

interface ApiKeyRowProps {
  secret: { key: string; label: string; description: string; isWebhook?: boolean };
  serviceId: string;
  managedVia: string;
  savedValue: string;
  onSave: (serviceId: string, key: string, value: string) => void;
}

function ApiKeyRow({ secret, serviceId, managedVia, savedValue, onSave }: ApiKeyRowProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(savedValue);
  const [visible, setVisible] = useState(false);
  const [saved, setSaved] = useState(false);

  const masked = savedValue
    ? savedValue.slice(0, 4) + '•'.repeat(Math.min(savedValue.length - 6, 20)) + savedValue.slice(-4)
    : '';

  const handleSave = () => {
    onSave(serviceId, secret.key, value.trim());
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2500);
  };

  const isSupabaseManaged = managedVia === 'supabase_secrets';
  const isEnvManaged = managedVia === 'env';

  return (
    <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-slate-800">{secret.label}</p>
            {secret.isWebhook && (
              <span className="text-[10px] font-bold bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full">Webhook</span>
            )}
            {isSupabaseManaged && (
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">Supabase Secret</span>
            )}
            {isEnvManaged && (
              <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full">Env Variable</span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">{secret.key}</p>
          <p className="text-xs text-slate-500 mt-0.5">{secret.description}</p>
        </div>
        {savedValue && !editing && (
          <div className="flex items-center gap-1 shrink-0">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span className="text-[11px] font-bold text-emerald-600">Saved</span>
          </div>
        )}
        {saved && (
          <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 shrink-0">
            <i className="ri-check-line"></i> Saved!
          </span>
        )}
      </div>

      {isEnvManaged ? (
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2">
          <i className="ri-lock-line text-slate-400 text-sm shrink-0"></i>
          <span className="text-xs text-slate-500 font-mono">Configured in .env file</span>
          <span className="ml-auto text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Active</span>
        </div>
      ) : editing ? (
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center bg-white border border-slate-300 focus-within:border-emerald-400 rounded-lg overflow-hidden transition-colors">
            <input
              type={visible ? 'text' : 'password'}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditing(false); }}
              placeholder={`Enter ${secret.label}...`}
              className="flex-1 px-3 py-2 text-sm text-slate-700 font-mono bg-transparent outline-none"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              className="px-2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <i className={`ri-eye${visible ? '-off' : ''}-line text-sm`}></i>
            </button>
          </div>
          <button
            onClick={handleSave}
            className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-lg cursor-pointer whitespace-nowrap transition-colors"
          >
            Save
          </button>
          <button
            onClick={() => setEditing(false)}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-semibold rounded-lg cursor-pointer whitespace-nowrap transition-colors"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center bg-white border border-slate-200 rounded-lg px-3 py-2">
            {savedValue ? (
              <span className="text-sm font-mono text-slate-600 flex-1">{masked}</span>
            ) : (
              <span className="text-sm text-slate-400 flex-1">Not configured</span>
            )}
          </div>
          <button
            onClick={() => { setEditing(true); setValue(savedValue); }}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:border-slate-400 text-slate-600 text-sm font-semibold rounded-lg cursor-pointer whitespace-nowrap transition-colors"
          >
            <i className="ri-pencil-line text-sm"></i>
            {savedValue ? 'Update' : 'Add Key'}
          </button>
          {savedValue && (
            <button
              onClick={() => { onSave(serviceId, secret.key, ''); setValue(''); }}
              className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 hover:border-red-300 hover:text-red-500 text-slate-400 rounded-lg cursor-pointer transition-colors"
            >
              <i className="ri-delete-bin-line text-sm"></i>
            </button>
          )}
        </div>
      )}

      {isSupabaseManaged && !isEnvManaged && (
        <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
          <i className="ri-information-line"></i>
          This key is stored in Supabase Edge Function secrets — it never reaches the browser.
        </p>
      )}
    </div>
  );
}

export default function AdminSystemSettingsPage() {
  const [settings, setSettings] = useState<SettingsState>(loadSettings);
  const [activeTab, setActiveTab] = useState<'integrations' | 'api-keys' | 'site' | 'team'>('integrations');
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [siteForm, setSiteForm] = useState(loadSettings().siteSettings);
  const [siteSaved, setSiteSaved] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [dmRecipient, setDmRecipient] = useState<RecipientInfo | null>(null);

  // Load backend team members
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  useEffect(() => {
    try {
      const accounts = JSON.parse(localStorage.getItem('admin_accounts') ?? '[]');
      setTeamMembers(accounts);
    } catch { setTeamMembers([]); }
  }, []);

  // Current admin
  const [currentAdmin, setCurrentAdmin] = useState<any>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem('admin_user');
      if (raw) setCurrentAdmin(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const connectedCount = SERVICES.filter((s) => s.status === 'connected' || savedKeysForService(settings, s.id)).length;

  function savedKeysForService(st: SettingsState, serviceId: string) {
    const keys = st.apiKeys[serviceId] ?? {};
    return Object.values(keys).some((v) => v && v.length > 0);
  }

  const getEffectiveStatus = (service: ServiceConfig): 'connected' | 'partial' | 'disconnected' => {
    if (service.status === 'connected') return 'connected';
    const keys = settings.apiKeys[service.id] ?? {};
    const filled = service.requiredSecrets.filter((s) => keys[s.key] && keys[s.key].length > 0).length;
    if (filled === 0) return service.status;
    if (filled === service.requiredSecrets.length) return 'connected';
    return 'partial';
  };

  const handleSaveApiKey = (serviceId: string, key: string, value: string) => {
    const updated: SettingsState = {
      ...settings,
      apiKeys: {
        ...settings.apiKeys,
        [serviceId]: { ...(settings.apiKeys[serviceId] ?? {}), [key]: value },
      },
    };
    setSettings(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleSaveSiteSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = { ...settings, siteSettings: siteForm };
    setSettings(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setSiteSaved(true);
    setTimeout(() => setSiteSaved(false), 2500);
  };

  const categories = ['all', ...Array.from(new Set(SERVICES.map((s) => s.category)))];
  const filteredServices = filterCategory === 'all'
    ? SERVICES
    : SERVICES.filter((s) => s.category === filterCategory);

  return (
    <div className="p-8 space-y-8 max-w-6xl">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
              <i className="ri-settings-3-line text-slate-700 text-xl"></i>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">System Settings</h2>
              <p className="text-sm text-slate-500">API keys, integrations &amp; site configuration</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-xl">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-bold text-emerald-700">{connectedCount} of {SERVICES.length} services active</span>
          </div>
        </div>
      </div>

      {/* ── Tab Toggle ── */}
      <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {([
          { id: 'integrations', icon: 'ri-plug-2-line', label: 'Integrations' },
          { id: 'api-keys', icon: 'ri-key-2-line', label: 'API Keys' },
          { id: 'site', icon: 'ri-settings-4-line', label: 'Site Config' },
          { id: 'team', icon: 'ri-team-line', label: 'Backend Team' },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === tab.id ? 'bg-white text-slate-900' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <div className="w-4 h-4 flex items-center justify-center"><i className={tab.icon}></i></div>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Integrations Tab ── */}
      {activeTab === 'integrations' && (
        <div className="space-y-5">

          {/* Category filter */}
          <div className="flex items-center gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap capitalize ${
                  filterCategory === cat
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                }`}
              >
                {cat === 'all' ? 'All Services' : CATEGORY_LABELS[cat] ?? cat}
              </button>
            ))}
          </div>

          {/* Service grid */}
          <div className="grid grid-cols-2 gap-4">
            {filteredServices.map((service) => {
              const effectiveStatus = getEffectiveStatus(service);
              const isExpanded = expandedService === service.id;
              const hasAnyKey = Object.values(settings.apiKeys[service.id] ?? {}).some((v) => v);

              return (
                <div
                  key={service.id}
                  className={`bg-white rounded-2xl border transition-all ${
                    effectiveStatus === 'connected'
                      ? 'border-emerald-200'
                      : effectiveStatus === 'partial'
                      ? 'border-amber-200'
                      : 'border-slate-200'
                  }`}
                >
                  {/* Card header */}
                  <div
                    className="flex items-start gap-4 p-5 cursor-pointer"
                    onClick={() => setExpandedService(isExpanded ? null : service.id)}
                  >
                    <div className={`w-11 h-11 ${service.iconBg} rounded-xl flex items-center justify-center shrink-0`}>
                      <i className={`${service.icon} ${service.iconColor} text-xl`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-slate-900">{service.name}</p>
                        <StatusBadge status={effectiveStatus} />
                        {hasAnyKey && effectiveStatus !== 'connected' && (
                          <span className="text-[10px] font-bold bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded-full">Keys saved locally</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{service.description}</p>
                      {/* Feature pills */}
                      <div className="flex items-center gap-1.5 flex-wrap mt-2">
                        {service.features.slice(0, 3).map((f) => (
                          <span key={f} className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{f}</span>
                        ))}
                        {service.features.length > 3 && (
                          <span className="text-[10px] text-slate-400">+{service.features.length - 3} more</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={service.docsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors"
                      >
                        <i className="ri-external-link-line text-sm"></i>
                      </a>
                      <button
                        onClick={(e) => { e.stopPropagation(); setExpandedService(isExpanded ? null : service.id); setActiveTab('api-keys'); }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg cursor-pointer whitespace-nowrap transition-colors"
                      >
                        <i className="ri-key-2-line text-xs"></i>
                        {effectiveStatus === 'connected' ? 'Manage Keys' : 'Configure'}
                      </button>
                    </div>
                  </div>

                  {/* Management info */}
                  <div className="px-5 pb-4 border-t border-slate-50">
                    <div className="flex items-center gap-2 pt-3">
                      <div className="w-3 h-3 flex items-center justify-center">
                        <i className={`text-[10px] ${service.managedVia === 'env' ? 'ri-file-code-line text-slate-400' : service.managedVia === 'supabase_secrets' ? 'ri-database-line text-emerald-500' : 'ri-device-line text-amber-500'}`}></i>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {service.managedVia === 'env' && 'Managed via environment variables (.env)'}
                        {service.managedVia === 'supabase_secrets' && 'Keys stored in Supabase Edge Function Secrets'}
                        {service.managedVia === 'local' && 'Settings stored locally in this browser'}
                      </span>
                      <span className="ml-auto text-[11px] text-slate-400">
                        {service.requiredSecrets.length} key{service.requiredSecrets.length !== 1 ? 's' : ''} required
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Supabase secrets instructions */}
          <div className="bg-slate-900 rounded-2xl p-6 flex items-start gap-5">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
              <i className="ri-shield-keyhole-line text-white text-lg"></i>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-white mb-1">How to add API keys to Supabase Secrets</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                For security, sensitive API keys are stored in Supabase Edge Function Secrets — never exposed to the browser.
              </p>
              <ol className="space-y-1.5">
                {[
                  'Go to your Supabase project dashboard',
                  'Navigate to Edge Functions → Secrets (left sidebar)',
                  'Click "Add new secret" and enter the key name and value',
                  'The secret will be available to all Edge Functions automatically',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-300 shrink-0 mt-0.5">{i + 1}</span>
                    <span className="text-xs text-slate-400">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl cursor-pointer whitespace-nowrap transition-colors"
            >
              <i className="ri-external-link-line"></i>
              Open Supabase
            </a>
          </div>
        </div>
      )}

      {/* ── API Keys Tab ── */}
      {activeTab === 'api-keys' && (
        <div className="space-y-6">
          {SERVICES.filter((s) => s.managedVia !== 'env').map((service) => (
            <div key={service.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              {/* Service header */}
              <div className="flex items-center gap-4 px-6 py-4 border-b border-slate-50 bg-slate-50/50">
                <div className={`w-9 h-9 ${service.iconBg} rounded-xl flex items-center justify-center shrink-0`}>
                  <i className={`${service.icon} ${service.iconColor} text-base`}></i>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-900">{service.name}</p>
                    <StatusBadge status={getEffectiveStatus(service)} />
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{service.description}</p>
                </div>
                <a
                  href={service.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 underline underline-offset-2 whitespace-nowrap cursor-pointer"
                >
                  <i className="ri-external-link-line"></i> Get API Key
                </a>
              </div>

              {/* Key rows */}
              <div className="p-5 space-y-3">
                {service.requiredSecrets.map((secret) => (
                  <ApiKeyRow
                    key={secret.key}
                    secret={secret}
                    serviceId={service.id}
                    managedVia={service.managedVia}
                    savedValue={settings.apiKeys[service.id]?.[secret.key] ?? ''}
                    onSave={handleSaveApiKey}
                  />
                ))}
              </div>
            </div>
          ))}

          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
              <i className="ri-information-line text-amber-600"></i>
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900">Security Notice</p>
              <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                Keys marked <strong>Supabase Secret</strong> are referenced here for configuration tracking only.
                The actual production values must be added directly to Supabase Edge Function Secrets in your Supabase dashboard
                — they are never stored in the browser for those services.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Site Config Tab ── */}
      {activeTab === 'site' && (
        <form onSubmit={handleSaveSiteSettings} className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h3 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2">
              <div className="w-6 h-6 flex items-center justify-center"><i className="ri-store-2-line text-slate-600"></i></div>
              Business Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Site / Business Name</label>
                <input
                  type="text"
                  value={siteForm.siteName}
                  onChange={(e) => setSiteForm((p) => ({ ...p, siteName: e.target.value }))}
                  className="w-full text-sm border border-slate-200 focus:border-emerald-400 rounded-xl px-3 py-2.5 outline-none text-slate-700"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Admin Notification Email</label>
                <input
                  type="email"
                  value={siteForm.adminEmail}
                  onChange={(e) => setSiteForm((p) => ({ ...p, adminEmail: e.target.value }))}
                  placeholder="admin@yourdomain.com"
                  className="w-full text-sm border border-slate-200 focus:border-emerald-400 rounded-xl px-3 py-2.5 outline-none text-slate-700"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Business Phone</label>
                <input
                  type="tel"
                  value={siteForm.businessPhone}
                  onChange={(e) => setSiteForm((p) => ({ ...p, businessPhone: e.target.value }))}
                  placeholder="(555) 000-0000"
                  className="w-full text-sm border border-slate-200 focus:border-emerald-400 rounded-xl px-3 py-2.5 outline-none text-slate-700"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Default Competitor Discount (%)</label>
                <input
                  type="number"
                  value={siteForm.defaultDiscount}
                  onChange={(e) => setSiteForm((p) => ({ ...p, defaultDiscount: e.target.value }))}
                  min="1"
                  max="50"
                  className="w-full text-sm border border-slate-200 focus:border-emerald-400 rounded-xl px-3 py-2.5 outline-none text-slate-700"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Business Address</label>
                <input
                  type="text"
                  value={siteForm.businessAddress}
                  onChange={(e) => setSiteForm((p) => ({ ...p, businessAddress: e.target.value }))}
                  placeholder="123 Main St, City, TX 75001"
                  className="w-full text-sm border border-slate-200 focus:border-emerald-400 rounded-xl px-3 py-2.5 outline-none text-slate-700"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h3 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2">
              <div className="w-6 h-6 flex items-center justify-center"><i className="ri-global-line text-slate-600"></i></div>
              Locale &amp; Currency
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Timezone</label>
                <select
                  value={siteForm.timezone}
                  onChange={(e) => setSiteForm((p) => ({ ...p, timezone: e.target.value }))}
                  className="w-full text-sm border border-slate-200 focus:border-emerald-400 rounded-xl px-3 py-2.5 outline-none text-slate-700 bg-white"
                >
                  {['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'America/Phoenix', 'Pacific/Honolulu'].map((tz) => (
                    <option key={tz} value={tz}>{tz.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Currency</label>
                <select
                  value={siteForm.currency}
                  onChange={(e) => setSiteForm((p) => ({ ...p, currency: e.target.value }))}
                  className="w-full text-sm border border-slate-200 focus:border-emerald-400 rounded-xl px-3 py-2.5 outline-none text-slate-700 bg-white"
                >
                  <option value="USD">USD — US Dollar</option>
                  <option value="EUR">EUR — Euro</option>
                  <option value="GBP">GBP — British Pound</option>
                  <option value="CAD">CAD — Canadian Dollar</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setSiteForm(DEFAULT_SETTINGS.siteSettings)}
              className="px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer whitespace-nowrap transition-colors"
            >
              Reset Defaults
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl cursor-pointer whitespace-nowrap transition-colors"
            >
              {siteSaved ? <><i className="ri-check-line"></i> Saved!</> : <><i className="ri-save-line"></i> Save Configuration</>}
            </button>
          </div>
        </form>
      )}

      {/* ── Team Tab ── */}
      {activeTab === 'team' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Backend Team</h3>
              <p className="text-sm text-slate-500 mt-0.5">Message individual team members directly</p>
            </div>
            <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">
              {teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''} with access
            </span>
          </div>

          {teamMembers.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
              <i className="ri-team-line text-slate-300 text-4xl block mb-3"></i>
              <p className="text-slate-500 text-sm">No team members found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {teamMembers.map((member: any, idx: number) => {
                const isCurrentUser = currentAdmin?.id === member.id;
                const isSuperAdmin = member.role === 'super_admin';
                const COLORS = ['bg-amber-500','bg-emerald-600','bg-sky-600','bg-rose-500','bg-violet-600','bg-teal-600'];
                const avatarBg = isSuperAdmin ? 'bg-amber-500' : COLORS[(idx % (COLORS.length - 1)) + 1];
                return (
                  <div key={member.id} className={`bg-white rounded-2xl border p-5 ${isCurrentUser ? 'border-emerald-200' : 'border-slate-100'}`}>
                    <div className="flex items-start gap-4">
                      <div className="relative shrink-0">
                        <div className={`w-12 h-12 ${avatarBg} rounded-full flex items-center justify-center text-white text-lg font-bold`}>
                          {member.name.charAt(0)}
                        </div>
                        {isSuperAdmin && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-amber-400 rounded-full border-2 border-white flex items-center justify-center">
                            <i className="ri-shield-star-fill text-[9px] text-white"></i>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold text-slate-900">{member.name}</p>
                          {isCurrentUser && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">You</span>}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{member.email}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {isSuperAdmin ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                              <i className="ri-shield-star-line text-xs"></i> Super Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                              <i className="ri-admin-line text-xs"></i> Admin
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 font-mono">@{member.username}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      {!isCurrentUser ? (
                        <button
                          onClick={() => setDmRecipient({ id: member.id, name: member.name, role: member.role, email: member.email, avatarColor: avatarBg })}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl cursor-pointer whitespace-nowrap transition-colors"
                        >
                          <i className="ri-chat-1-line text-sm"></i>
                          Message {member.name.split(' ')[0]}
                        </button>
                      ) : (
                        <div className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 text-slate-400 text-sm font-semibold rounded-xl border border-slate-200">
                          <i className="ri-user-line text-sm"></i> Your Account
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-9 h-9 bg-slate-200 rounded-xl flex items-center justify-center shrink-0">
              <i className="ri-chat-smile-2-line text-slate-600"></i>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">How messaging works</p>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Direct messages sync across browser tabs in real time. For group messages use the <strong>Team Chat</strong> button in the header. You can also message members from the <strong>Backend Access</strong> sidebar panel.
              </p>
            </div>
          </div>
        </div>
      )}

      {dmRecipient && (
        <DirectMessagePanel recipient={dmRecipient} onClose={() => setDmRecipient(null)} />
      )}

    </div>
  );
}
