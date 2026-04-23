import { useState } from 'react';
import type { EntityType } from '../utils/emailStorage';
import { saveEmail } from '../utils/emailStorage';

export interface BulkRecipient {
  id: string;
  name: string;
  email: string;
  entityType: EntityType;
}

interface Props {
  recipients: BulkRecipient[];
  onClose: () => void;
  onSent: () => void;
}

const TEMPLATES = [
  { id: 'blank', label: 'Blank', subject: '', body: '' },
  { id: 'followup', label: 'Follow-Up', subject: 'Following up on your recent inquiry', body: 'Hi {name},\n\nI wanted to follow up and see if you have any questions or need additional assistance.\n\nPlease don\'t hesitate to reach out — we\'re always happy to help!\n\nBest regards,\nThe Team' },
  { id: 'promo', label: 'Promo Offer', subject: 'Exclusive offer just for you', body: 'Hi {name},\n\nAs a valued partner, we\'d like to extend an exclusive offer on your next order. Reply to this email to take advantage.\n\nBest regards,\nThe Team' },
  { id: 'restock', label: 'Restock Update', subject: 'Your requested item is back in stock', body: 'Hi {name},\n\nGreat news! The item you requested is now available. We encourage you to place your order soon as stock is limited.\n\nBest regards,\nThe Team' },
  { id: 'checkIn', label: 'Check-In', subject: 'Checking in — how can we help?', body: 'Hi {name},\n\nI hope everything is going well! I wanted to check in and see if there\'s anything we can do to better support you.\n\nBest regards,\nThe Team' },
];

export default function BulkEmailModal({ recipients: initialRecipients, onClose, onSent }: Props) {
  const [recipients, setRecipients] = useState<BulkRecipient[]>(initialRecipients);
  const [templateId, setTemplateId] = useState('blank');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [sentCount, setSentCount] = useState(0);
  const [done, setDone] = useState(false);

  const applyTemplate = (id: string) => {
    const tpl = TEMPLATES.find((t) => t.id === id);
    if (!tpl) return;
    setTemplateId(id);
    setSubject(tpl.subject);
    setBody(tpl.body);
  };

  const removeRecipient = (id: string) => {
    setRecipients((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSend = () => {
    if (!subject.trim() || !body.trim() || recipients.length === 0) return;
    setSending(true);
    let count = 0;
    const interval = setInterval(() => {
      const r = recipients[count];
      if (!r) {
        clearInterval(interval);
        setDone(true);
        setSending(false);
        setTimeout(() => { onSent(); onClose(); }, 1500);
        return;
      }
      saveEmail({
        id: `bulk-${Date.now()}-${r.id}`,
        entityType: r.entityType,
        entityId: r.id,
        entityName: r.name,
        entityEmail: r.email,
        subject: subject.trim(),
        body: body.trim().replace(/\{name\}/g, r.name.split(' ')[0]),
        template: templateId,
        sentAt: new Date().toISOString(),
        direction: 'outbound',
        status: 'sent',
        readAt: new Date().toISOString(),
      });
      count++;
      setSentCount(count);
    }, 120);
  };

  const canSend = subject.trim() && body.trim() && recipients.length > 0 && !sending && !done;

  return (
    <div className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-3xl flex flex-col max-h-[92vh]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
              <i className="ri-mail-send-line text-teal-600 text-lg"></i>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Bulk Email</h2>
              <p className="text-xs text-slate-500">Sending to {recipients.length} recipient{recipients.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors">
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Recipients */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-2">Recipients ({recipients.length})</label>
            <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 min-h-[52px]">
              {recipients.map((r) => (
                <div key={r.id} className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3 py-1.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${r.entityType === 'customer' ? 'bg-sky-500' : r.entityType === 'company' ? 'bg-teal-500' : 'bg-orange-500'}`}>
                    {r.name.charAt(0)}
                  </div>
                  <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">{r.name}</span>
                  <span className="text-xs text-slate-400 whitespace-nowrap hidden sm:inline">{r.email}</span>
                  {recipients.length > 1 && (
                    <button onClick={() => removeRecipient(r.id)} className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-red-100 text-slate-300 hover:text-red-500 cursor-pointer transition-colors ml-1">
                      <i className="ri-close-line text-xs"></i>
                    </button>
                  )}
                </div>
              ))}
              {recipients.length === 0 && <p className="text-xs text-slate-400 py-1 px-2">All recipients removed</p>}
            </div>
          </div>

          {/* Templates */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-2">Template</label>
            <div className="flex gap-2 flex-wrap">
              {TEMPLATES.map((t) => (
                <button key={t.id} onClick={() => applyTemplate(t.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors ${templateId === t.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1.5">Subject</label>
            <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject..."
              className="w-full border border-slate-200 focus:border-slate-400 rounded-lg px-4 py-2.5 text-sm outline-none text-slate-700 placeholder-slate-400" />
          </div>

          {/* Body */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1.5">
              Message <span className="text-slate-400 font-normal">— use <code className="bg-slate-100 px-1 rounded">{'{name}'}</code> for first name</span>
            </label>
            <textarea value={body} onChange={(e) => setBody(e.target.value.slice(0, 2000))}
              placeholder="Write your message here..." rows={8}
              className="w-full border border-slate-200 focus:border-slate-400 rounded-lg px-4 py-3 text-sm outline-none text-slate-700 placeholder-slate-400 resize-none" />
            <p className="text-xs text-slate-400 mt-1 text-right">{body.length}/2000</p>
          </div>

          {/* Progress */}
          {(sending || done) && (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-700">
                  {done ? 'All emails sent!' : `Sending ${sentCount} of ${recipients.length}…`}
                </span>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${done ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-600'}`}>
                  {done ? 'Complete' : 'In Progress'}
                </span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className={`h-2 rounded-full transition-all duration-200 ${done ? 'bg-emerald-500' : 'bg-sky-500'}`}
                  style={{ width: `${(sentCount / recipients.length) * 100}%` }}></div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <i className="ri-information-line text-sm"></i>
            Each recipient gets a personalized copy saved to their history
          </p>
          <div className="flex items-center gap-2.5">
            <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer whitespace-nowrap transition-colors">
              Cancel
            </button>
            <button onClick={handleSend} disabled={!canSend}
              className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-lg cursor-pointer whitespace-nowrap transition-colors ${done ? 'bg-emerald-500' : sending ? 'bg-sky-400' : !canSend ? 'bg-slate-300 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700'}`}>
              {done ? <><i className="ri-check-line"></i> Done!</> :
               sending ? <><i className="ri-loader-4-line animate-spin"></i> Sending…</> :
               <><i className="ri-send-plane-line"></i> Send to {recipients.length} Recipients</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
