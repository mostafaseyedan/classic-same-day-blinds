import { useState } from 'react';

type Frequency = 'immediate' | 'daily' | 'weekly';

interface FrequencyOption {
  id: Frequency;
  label: string;
  sublabel: string;
  icon: string;
  description: string;
  tag?: string;
  tagColor?: string;
}

const OPTIONS: FrequencyOption[] = [
  {
    id: 'immediate',
    label: 'Immediate',
    sublabel: 'Send right away',
    icon: 'ri-send-plane-line',
    description: 'Every notification is sent the moment it\'s triggered. Best for staying on top of orders in real time.',
    tag: 'Recommended',
    tagColor: 'bg-emerald-100 text-emerald-700',
  },
  {
    id: 'daily',
    label: 'Daily Summary',
    sublabel: 'Once per day',
    icon: 'ri-calendar-check-line',
    description: 'All non-urgent updates are batched into one morning digest email. Required alerts still send immediately.',
  },
  {
    id: 'weekly',
    label: 'Weekly Summary',
    sublabel: 'Every Monday',
    icon: 'ri-mail-open-line',
    description: 'Promotional and inventory updates arrive once per week. Order confirmations and shipping always send immediately.',
  },
];

const STORAGE_KEY = 'notification_frequency';

function loadFrequency(): Frequency {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'immediate' || stored === 'daily' || stored === 'weekly') return stored;
    return 'immediate';
  } catch {
    return 'immediate';
  }
}

interface NotificationFrequencyProps {
  onSaveSignal?: boolean;
}

export default function NotificationFrequency({ onSaveSignal }: NotificationFrequencyProps) {
  const [selected, setSelected] = useState<Frequency>(loadFrequency);
  const [justSaved, setJustSaved] = useState(false);

  const handleSelect = (id: Frequency) => {
    setSelected(id);
    localStorage.setItem(STORAGE_KEY, id);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1800);
  };

  const alwaysImmediateNote =
    selected !== 'immediate'
      ? 'Order confirmations, cancellations, and shipping alerts are always sent immediately regardless of this setting.'
      : null;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-8">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 shrink-0">
            <i className="ri-timer-line text-xl text-gray-600"></i>
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Communication Frequency</h3>
            <p className="text-xs text-gray-500 mt-0.5">Control how often you receive non-urgent email updates.</p>
          </div>
        </div>
        {justSaved && (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
            <i className="ri-checkbox-circle-line"></i> Saved
          </span>
        )}
      </div>

      {/* Options */}
      <div className="p-6">
        <div className="grid grid-cols-3 gap-4 mb-4">
          {OPTIONS.map((opt) => {
            const isSelected = selected === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                className={`relative text-left rounded-xl border-2 p-4 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/60'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {opt.tag && (
                  <span className={`absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full ${opt.tagColor}`}>
                    {opt.tag}
                  </span>
                )}
                {/* Icon + radio */}
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${isSelected ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                    <i className={`${opt.icon} text-base ${isSelected ? 'text-emerald-600' : 'text-gray-500'}`}></i>
                  </div>
                  <div className={`ml-auto w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'
                  }`}>
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
                <p className={`text-sm font-bold mb-0.5 ${isSelected ? 'text-emerald-700' : 'text-gray-800'}`}>
                  {opt.label}
                </p>
                <p className="text-xs text-gray-500 font-medium mb-2">{opt.sublabel}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{opt.description}</p>
              </button>
            );
          })}
        </div>

        {alwaysImmediateNote && (
          <div className="flex items-start gap-2.5 px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl">
            <div className="w-4 h-4 flex items-center justify-center shrink-0 mt-0.5">
              <i className="ri-information-line text-amber-500 text-sm"></i>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">{alwaysImmediateNote}</p>
          </div>
        )}
      </div>
    </div>
  );
}
