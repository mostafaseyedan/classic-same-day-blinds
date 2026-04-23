import { useState, useEffect } from 'react';
import NotificationFrequency from './NotificationFrequency';
import NotificationActivityLog from './NotificationActivityLog';

interface NotifPref {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  required?: boolean;
}

interface NotifGroup {
  id: string;
  title: string;
  icon: string;
  color: string;
  bg: string;
  description: string;
  prefs: NotifPref[];
}

const DEFAULT_GROUPS: NotifGroup[] = [
  {
    id: 'order',
    title: 'Order Updates',
    icon: 'ri-shopping-bag-3-line',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    description: 'Stay informed at every stage of your order.',
    prefs: [
      {
        id: 'order_confirmed',
        label: 'Order Confirmed',
        description: 'Receive a receipt when your order is successfully placed.',
        enabled: true,
        required: true,
      },
      {
        id: 'order_shipped',
        label: 'Order Shipped',
        description: 'Get notified with tracking info when your order ships.',
        enabled: true,
      },
      {
        id: 'out_for_delivery',
        label: 'Out for Delivery',
        description: 'Day-of alert when your package is on its way.',
        enabled: true,
      },
      {
        id: 'order_delivered',
        label: 'Order Delivered',
        description: 'Confirmation once your order has been delivered.',
        enabled: true,
      },
      {
        id: 'order_cancelled',
        label: 'Order Cancelled',
        description: 'Notified if your order is cancelled or refunded.',
        enabled: true,
        required: true,
      },
    ],
  },
  {
    id: 'restock',
    title: 'Restock & Inventory',
    icon: 'ri-refresh-line',
    color: 'text-teal-600',
    bg: 'bg-teal-50',
    description: 'Track the status of your restock requests.',
    prefs: [
      {
        id: 'restock_approved',
        label: 'Restock Request Approved',
        description: 'When your submitted restock request gets approved.',
        enabled: true,
      },
      {
        id: 'restock_completed',
        label: 'Restock Completed',
        description: 'When the restocked items are ready for pickup or delivery.',
        enabled: true,
      },
      {
        id: 'back_in_stock',
        label: 'Back in Stock Alerts',
        description: 'When a favorited product comes back in stock.',
        enabled: false,
      },
    ],
  },
  {
    id: 'promo',
    title: 'Offers & Promotions',
    icon: 'ri-price-tag-3-line',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    description: 'Exclusive deals, discounts, and news from us.',
    prefs: [
      {
        id: 'special_offers',
        label: 'Special Offers & Discounts',
        description: 'Limited-time sales, coupon codes, and seasonal deals.',
        enabled: false,
      },
      {
        id: 'new_products',
        label: 'New Product Announcements',
        description: 'Be the first to know when we launch new window treatments.',
        enabled: false,
      },
      {
        id: 'price_drops',
        label: 'Price Drop Alerts',
        description: 'When a product in your favorites list drops in price.',
        enabled: false,
      },
      {
        id: 'newsletter',
        label: 'Monthly Newsletter',
        description: 'Tips, design inspiration, and company updates once a month.',
        enabled: false,
      },
    ],
  },
  {
    id: 'referral',
    title: 'Referral & Rewards',
    icon: 'ri-gift-line',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    description: 'Reminders to share your referral link and earn bonus points.',
    prefs: [
      {
        id: 'referral_post_order',
        label: 'Post-Order Referral Reminder',
        description: 'After each order, get an email with your referral link to share — earn 500 pts per friend who orders.',
        enabled: true,
      },
      {
        id: 'referral_credited',
        label: 'Referral Bonus Credited',
        description: 'Get notified when a friend places their first order and your bonus points are credited.',
        enabled: true,
      },
      {
        id: 'referral_milestone',
        label: 'Referral Milestone Alerts',
        description: 'Celebrate when you reach 5, 10, or 25 successful referrals.',
        enabled: false,
      },
    ],
  },
];

const STORAGE_KEY = 'notification_preferences';

function loadPrefs(): NotifGroup[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_GROUPS;
    const saved: Record<string, boolean> = JSON.parse(stored);
    return DEFAULT_GROUPS.map((group) => ({
      ...group,
      prefs: group.prefs.map((pref) => ({
        ...pref,
        enabled: pref.required ? true : (saved[pref.id] ?? pref.enabled),
      })),
    }));
  } catch {
    return DEFAULT_GROUPS;
  }
}

function savePrefs(groups: NotifGroup[]) {
  const flat: Record<string, boolean> = {};
  groups.forEach((g) => g.prefs.forEach((p) => { flat[p.id] = p.enabled; }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(flat));
}

function Toggle({ enabled, onChange, disabled }: { enabled: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer shrink-0 ${
        disabled ? 'opacity-40 cursor-not-allowed' : ''
      } ${enabled ? 'bg-emerald-500' : 'bg-gray-200'}`}
      aria-checked={enabled}
      role="switch"
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

export default function NotificationPreferences() {
  const [groups, setGroups] = useState<NotifGroup[]>(loadPrefs);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    savePrefs(groups);
  }, [groups]);

  const totalEnabled = groups.flatMap((g) => g.prefs).filter((p) => p.enabled).length;
  const totalCount = groups.flatMap((g) => g.prefs).length;

  const togglePref = (groupId: string, prefId: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              prefs: g.prefs.map((p) =>
                p.id === prefId && !p.required ? { ...p, enabled: !p.enabled } : p
              ),
            }
          : g
      )
    );
  };

  const toggleGroup = (groupId: string, allOn: boolean) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              prefs: g.prefs.map((p) => (p.required ? p : { ...p, enabled: allOn })),
            }
          : g
      )
    );
  };

  const handleSave = () => {
    savePrefs(groups);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const isGroupAllOn = (group: NotifGroup) =>
    group.prefs.filter((p) => !p.required).every((p) => p.enabled);

  const isGroupAllOff = (group: NotifGroup) =>
    group.prefs.filter((p) => !p.required).every((p) => !p.enabled);

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Email Notifications</h2>
          <p className="text-sm text-gray-500 mt-1">
            Choose which emails you receive. Required notifications cannot be turned off.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 font-medium whitespace-nowrap">
            {totalEnabled} of {totalCount} enabled
          </span>
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap cursor-pointer ${
              saved
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {saved ? (
              <><i className="ri-checkbox-circle-line"></i> Saved!</>
            ) : (
              <><i className="ri-save-line"></i> Save Preferences</>
            )}
          </button>
        </div>
      </div>

      {/* Communication Frequency */}
      <NotificationFrequency />

      {/* Summary bar */}
      <div className="flex items-center gap-4 mb-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${(totalEnabled / totalCount) * 100}%` }}
          />
        </div>
        <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">
          {Math.round((totalEnabled / totalCount) * 100)}% active
        </span>
      </div>

      {/* Groups */}
      <div className="space-y-6">
        {groups.map((group) => {
          const nonRequired = group.prefs.filter((p) => !p.required);
          const groupAllOn = isGroupAllOn(group);
          const groupAllOff = isGroupAllOff(group);

          return (
            <div key={group.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              {/* Group Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 flex items-center justify-center rounded-xl ${group.bg} shrink-0`}>
                    <i className={`${group.icon} text-xl ${group.color}`}></i>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{group.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{group.description}</p>
                  </div>
                </div>
                {nonRequired.length > 0 && (
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => toggleGroup(group.id, !groupAllOn)}
                      className="text-xs font-semibold text-gray-500 hover:text-emerald-600 transition-colors whitespace-nowrap cursor-pointer"
                    >
                      {groupAllOn ? 'Turn all off' : 'Turn all on'}
                    </button>
                    <Toggle
                      enabled={!groupAllOff}
                      onChange={() => toggleGroup(group.id, groupAllOff || !groupAllOn)}
                      disabled={false}
                    />
                  </div>
                )}
              </div>

              {/* Individual Prefs */}
              <div className="divide-y divide-gray-50">
                {group.prefs.map((pref, idx) => (
                  <div
                    key={pref.id}
                    className={`flex items-center justify-between px-6 py-4 transition-colors ${
                      pref.enabled ? 'bg-white' : 'bg-gray-50/50'
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0 mr-6">
                      <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${pref.enabled ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-800">{pref.label}</p>
                          {pref.required && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-semibold rounded-full">
                              Required
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{pref.description}</p>
                      </div>
                    </div>
                    <Toggle
                      enabled={pref.enabled}
                      onChange={() => togglePref(group.id, pref.id)}
                      disabled={pref.required}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="mt-6 flex items-start gap-3 px-5 py-4 bg-gray-50 rounded-xl border border-gray-100">
        <div className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
          <i className="ri-information-line text-gray-400 text-base"></i>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">
          <strong className="text-gray-700">Required emails</strong> are essential service notifications we must send regardless of your preferences.
          All other emails can be turned off at any time. Changes are saved automatically when you click &ldquo;Save Preferences&rdquo;.
        </p>
      </div>

      {/* Activity Log */}
      <NotificationActivityLog />
    </div>
  );
}
