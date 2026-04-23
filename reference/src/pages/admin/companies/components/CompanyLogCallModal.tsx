import { useState } from 'react';
import type { Company } from '../types';
import { saveCompanyActivity } from '../utils/companyActivities';

interface Props {
  company: Company;
  onClose: () => void;
  onLogged: () => void;
}

const OUTCOMES = [
  { id: 'spoke', label: 'Spoke with contact', icon: 'ri-phone-line', color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  { id: 'voicemail', label: 'Left voicemail', icon: 'ri-voiceprint-line', color: 'bg-amber-100 text-amber-700 border-amber-300' },
  { id: 'no_answer', label: 'No answer', icon: 'ri-phone-off-line', color: 'bg-slate-100 text-slate-600 border-slate-300' },
  { id: 'callback', label: 'Contact to call back', icon: 'ri-phone-forward-line', color: 'bg-sky-100 text-sky-700 border-sky-300' },
];

const DIRECTIONS = [
  { id: 'outbound', label: 'Outbound', icon: 'ri-phone-outgoing-line' },
  { id: 'inbound', label: 'Inbound', icon: 'ri-phone-incoming-line' },
];

export default function CompanyLogCallModal({ company, onClose, onLogged }: Props) {
  const [direction, setDirection] = useState('outbound');
  const [outcome, setOutcome] = useState('spoke');
  const [durationMins, setDurationMins] = useState('');
  const [durationSecs, setDurationSecs] = useState('');
  const [notes, setNotes] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleLog = () => {
    if (!outcome) return;
    setSaving(true);
    setTimeout(() => {
      const outcomeLabel = OUTCOMES.find((o) => o.id === outcome)?.label ?? outcome;
      const mins = parseInt(durationMins || '0');
      const secs = parseInt(durationSecs || '0');
      const totalSecs = mins * 60 + secs;
      const durationStr = totalSecs > 0
        ? `${mins > 0 ? `${mins}m ` : ''}${secs > 0 ? `${secs}s` : ''}`.trim()
        : null;

      let detail = `${direction === 'outbound' ? 'Outbound' : 'Inbound'} call — ${outcomeLabel}`;
      if (durationStr) detail += ` · ${durationStr}`;
      if (notes.trim()) detail += `. ${notes.trim()}`;
      if (followUp.trim()) detail += ` | Follow-up: ${followUp.trim()}`;

      saveCompanyActivity(company.id, {
        id: `call-${Date.now()}`,
        type: 'call',
        title: `Phone call with ${company.primaryContact}`,
        detail,
        time: new Date().toISOString(),
        icon: direction === 'outbound' ? 'ri-phone-outgoing-line' : 'ri-phone-incoming-line',
        color: outcome === 'spoke' ? 'bg-emerald-100 text-emerald-700' : outcome === 'voicemail' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600',
      });
      setSaving(false);
      setSaved(true);
      setTimeout(() => { onLogged(); onClose(); }, 1100);
    }, 650);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
              <i className="ri-phone-line text-teal-600 text-lg"></i>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Log Call</h2>
              <p className="text-xs text-slate-500">{company.name} &bull; {company.primaryContact}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors">
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Direction */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-2">Call Direction</label>
            <div className="flex gap-2">
              {DIRECTIONS.map((d) => (
                <button key={d.id} onClick={() => setDirection(d.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer whitespace-nowrap transition-colors border ${
                    direction === d.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}>
                  <div className="w-4 h-4 flex items-center justify-center"><i className={`${d.icon} text-sm`}></i></div>
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Outcome */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-2">Outcome</label>
            <div className="grid grid-cols-2 gap-2">
              {OUTCOMES.map((o) => (
                <button key={o.id} onClick={() => setOutcome(o.id)}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold cursor-pointer whitespace-nowrap transition-all border ${
                    outcome === o.id ? o.color : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}>
                  <div className="w-4 h-4 flex items-center justify-center"><i className={`${o.icon} text-sm`}></i></div>
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-2">Duration (optional)</label>
            <div className="flex items-center gap-2">
              <input type="number" min="0" max="999" value={durationMins} onChange={(e) => setDurationMins(e.target.value)}
                placeholder="0" className="w-24 border border-slate-200 focus:border-slate-400 rounded-lg px-3 py-2.5 text-sm outline-none text-center text-slate-700" />
              <span className="text-sm text-slate-500 font-medium">min</span>
              <input type="number" min="0" max="59" value={durationSecs} onChange={(e) => setDurationSecs(e.target.value)}
                placeholder="0" className="w-24 border border-slate-200 focus:border-slate-400 rounded-lg px-3 py-2.5 text-sm outline-none text-center text-slate-700" />
              <span className="text-sm text-slate-500 font-medium">sec</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1.5">Call Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value.slice(0, 500))}
              placeholder="Key points from the conversation..." rows={3}
              className="w-full border border-slate-200 focus:border-slate-400 rounded-lg px-4 py-3 text-sm outline-none text-slate-700 placeholder-slate-400 resize-none" />
            <p className="text-xs text-slate-400 text-right mt-1">{notes.length}/500</p>
          </div>

          {/* Follow-up */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1.5">Follow-up Action (optional)</label>
            <input type="text" value={followUp} onChange={(e) => setFollowUp(e.target.value)}
              placeholder="e.g. Send updated quote, Schedule site visit..."
              className="w-full border border-slate-200 focus:border-slate-400 rounded-lg px-4 py-2.5 text-sm outline-none text-slate-700 placeholder-slate-400" />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer whitespace-nowrap transition-colors">
            Cancel
          </button>
          <button onClick={handleLog} disabled={saving || saved}
            className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-lg cursor-pointer whitespace-nowrap transition-colors ${
              saved ? 'bg-emerald-500' : saving ? 'bg-teal-400' : 'bg-teal-600 hover:bg-teal-700'
            }`}>
            {saved ? <><i className="ri-check-line text-base"></i> Logged!</> :
             saving ? <><i className="ri-loader-4-line text-base animate-spin"></i> Saving…</> :
             <><i className="ri-phone-line text-base"></i> Log Call</>}
          </button>
        </div>
      </div>
    </div>
  );
}
