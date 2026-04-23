import { useState } from 'react';
import type { Company } from '../types';
import { saveCompanyActivity } from '../utils/companyActivities';

interface Props {
  company: Company;
  onClose: () => void;
  onAdded: () => void;
}

const NOTE_TYPES = [
  { id: 'general', label: 'General Note', icon: 'ri-sticky-note-line', color: 'bg-amber-500' },
  { id: 'important', label: 'Important', icon: 'ri-error-warning-line', color: 'bg-red-500' },
  { id: 'followup', label: 'Follow-Up', icon: 'ri-calendar-check-line', color: 'bg-sky-500' },
  { id: 'pricing', label: 'Pricing', icon: 'ri-price-tag-3-line', color: 'bg-emerald-500' },
  { id: 'complaint', label: 'Complaint', icon: 'ri-chat-warning-line', color: 'bg-orange-500' },
  { id: 'opportunity', label: 'Opportunity', icon: 'ri-lightbulb-line', color: 'bg-violet-500' },
];

export default function CompanyAddNoteModal({ company, onClose, onAdded }: Props) {
  const [noteType, setNoteType] = useState('general');
  const [text, setText] = useState('');
  const [pinned, setPinned] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleAdd = () => {
    if (!text.trim()) return;
    setSaving(true);
    setTimeout(() => {
      const type = NOTE_TYPES.find((t) => t.id === noteType)!;
      saveCompanyActivity(company.id, {
        id: `note-${Date.now()}`,
        type: 'note',
        title: `${type.label} added${pinned ? ' · Pinned' : ''}`,
        detail: text.trim(),
        time: new Date().toISOString(),
        icon: type.icon,
        color: `${type.color.replace('bg-', 'bg-').replace('-500', '-100')} text-${type.color.replace('bg-', '').replace('-500', '-700')}`,
      });
      setSaving(false);
      setSaved(true);
      setTimeout(() => { onAdded(); onClose(); }, 1100);
    }, 600);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <i className="ri-sticky-note-add-line text-amber-600 text-lg"></i>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Add Note</h2>
              <p className="text-xs text-slate-500">{company.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors">
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Note type */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-2">Note Type</label>
            <div className="grid grid-cols-3 gap-2">
              {NOTE_TYPES.map((t) => (
                <button key={t.id} onClick={() => setNoteType(t.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap transition-all border ${
                    noteType === t.id ? `${t.color} text-white border-transparent` : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}>
                  <div className="w-4 h-4 flex items-center justify-center"><i className={`${t.icon} text-sm`}></i></div>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Text */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1.5">Note</label>
            <textarea value={text} onChange={(e) => setText(e.target.value.slice(0, 500))}
              placeholder="Write your note here..." rows={5}
              className="w-full border border-slate-200 focus:border-slate-400 rounded-lg px-4 py-3 text-sm outline-none text-slate-700 placeholder-slate-400 resize-none" autoFocus />
            <p className="text-xs text-slate-400 text-right mt-1">{text.length}/500</p>
          </div>

          {/* Pin */}
          <button onClick={() => setPinned(!pinned)}
            className={`flex items-center gap-2 text-sm font-semibold cursor-pointer transition-colors ${pinned ? 'text-amber-600' : 'text-slate-400 hover:text-slate-600'}`}>
            <div className="w-4 h-4 flex items-center justify-center">
              <i className={`${pinned ? 'ri-pushpin-fill' : 'ri-pushpin-line'} text-sm`}></i>
            </div>
            Pin this note
          </button>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer whitespace-nowrap transition-colors">
            Cancel
          </button>
          <button onClick={handleAdd} disabled={!text.trim() || saving || saved}
            className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-lg cursor-pointer whitespace-nowrap transition-colors ${
              saved ? 'bg-emerald-500' : saving ? 'bg-amber-400' : !text.trim() ? 'bg-slate-300 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600'
            }`}>
            {saved ? <><i className="ri-check-line text-base"></i> Added!</> :
             saving ? <><i className="ri-loader-4-line text-base animate-spin"></i> Saving…</> :
             <><i className="ri-sticky-note-add-line text-base"></i> Add Note</>}
          </button>
        </div>
      </div>
    </div>
  );
}
