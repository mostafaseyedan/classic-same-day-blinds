import { useState } from 'react';
import type { EntityType } from '../utils/emailStorage';
import { saveEmail } from '../utils/emailStorage';

interface Props {
  entityType: EntityType;
  entityId: string;
  entityName: string;
  entityEmail: string;
  onClose: () => void;
  onSent: () => void;
}

const TEMPLATES = [
  { id: 'blank', label: 'Blank', subject: '', body: '' },
  {
    id: 'followup',
    label: 'Follow-Up',
    subject: 'Following up on your recent inquiry',
    body: 'Hi {name},\n\nI wanted to follow up on our recent conversation and see if you have any questions or need additional assistance.\n\nPlease don\'t hesitate to reach out — we\'re always happy to help!\n\nBest regards,\nThe Team',
  },
  {
    id: 'quote',
    label: 'Custom Quote',
    subject: 'Your custom quote is ready',
    body: 'Hi {name},\n\nThank you for your interest! I\'ve put together a custom quote based on your requirements. Please review the details and let me know if you\'d like any adjustments.\n\nLooking forward to hearing from you.\n\nBest regards,\nThe Team',
  },
  {
    id: 'promo',
    label: 'Promo Offer',
    subject: 'Exclusive offer just for you',
    body: 'Hi {name},\n\nAs a valued partner, we\'d like to extend an exclusive offer on your next order. This limited-time discount is our way of saying thank you for your continued business.\n\nReply to this email to take advantage of this offer.\n\nBest regards,\nThe Team',
  },
  {
    id: 'restock',
    label: 'Restock Update',
    subject: 'Your requested item is back in stock',
    body: 'Hi {name},\n\nGreat news! The item you requested a restock notification for is now available. We encourage you to place your order soon as stock is limited.\n\nBest regards,\nThe Team',
  },
  {
    id: 'checkIn',
    label: 'Account Check-In',
    subject: 'Checking in — how can we help?',
    body: 'Hi {name},\n\nI hope everything is going well! I wanted to take a moment to check in and see if there\'s anything we can do to better support you.\n\nWe\'ve recently updated our product catalog and have some exciting new offerings that might be of interest. Would you be available for a quick call this week?\n\nBest regards,\nThe Team',
  },
];

export default function ComposeEmailModal({ entityType, entityId, entityName, entityEmail, onClose, onSent }: Props) {
  const [templateId, setTemplateId] = useState('blank');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const firstName = entityName.split(' ')[0];

  const applyTemplate = (id: string) => {
    const tpl = TEMPLATES.find((t) => t.id === id);
    if (!tpl) return;
    setTemplateId(id);
    setSubject(tpl.subject);
    setBody(tpl.body.replace(/\{name\}/g, firstName));
  };

  const handleSend = () => {
    if (!subject.trim() || !body.trim()) return;
    setSending(true);
    setTimeout(() => {
      saveEmail({
        id: `email-${Date.now()}`,
        entityType,
        entityId,
        entityName,
        entityEmail,
        subject: subject.trim(),
        body: body.trim(),
        template: templateId,
        sentAt: new Date().toISOString(),
        direction: 'outbound',
        status: 'sent',
        readAt: new Date().toISOString(),
      });
      setSending(false);
      setSent(true);
      setTimeout(() => {
        onSent();
        onClose();
      }, 1200);
    }, 850);
  };

  const canSend = subject.trim() && body.trim() && !sending && !sent;

  return (
    <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
              <i className="ri-mail-send-line text-sky-600 text-lg"></i>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Compose Email</h2>
              <p className="text-xs text-slate-500">To: {entityName} &lt;{entityEmail}&gt;</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors">
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Templates */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-2">Template</label>
            <div className="flex gap-2 flex-wrap">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => applyTemplate(t.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors ${templateId === t.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Recipient */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1.5">To</label>
            <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5">
              <div className="w-7 h-7 bg-slate-900 rounded-full flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-bold">{entityName.charAt(0)}</span>
              </div>
              <span className="text-sm font-semibold text-slate-700">{entityName}</span>
              <span className="text-xs text-slate-400">&lt;{entityEmail}&gt;</span>
              <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
                entityType === 'customer' ? 'bg-sky-100 text-sky-700' :
                entityType === 'company' ? 'bg-teal-100 text-teal-700' :
                'bg-orange-100 text-orange-700'
              }`}>{entityType}</span>
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1.5">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject..."
              className="w-full border border-slate-200 focus:border-slate-400 rounded-lg px-4 py-2.5 text-sm outline-none text-slate-700 placeholder-slate-400 transition-colors"
            />
          </div>

          {/* Body */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1.5">Message</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value.slice(0, 2000))}
              placeholder="Write your message here..."
              rows={9}
              className="w-full border border-slate-200 focus:border-slate-400 rounded-lg px-4 py-3 text-sm outline-none text-slate-700 placeholder-slate-400 resize-none transition-colors"
            />
            <p className="text-xs text-slate-400 mt-1 text-right">{body.length}/2000</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <i className="ri-information-line text-sm"></i>
            Email will be saved to the correspondence history
          </p>
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer whitespace-nowrap transition-colors"
            >
              Discard
            </button>
            <button
              onClick={handleSend}
              disabled={!canSend}
              className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-lg cursor-pointer whitespace-nowrap transition-colors ${
                sent ? 'bg-emerald-500' :
                sending ? 'bg-sky-400' :
                !canSend ? 'bg-slate-300 cursor-not-allowed' :
                'bg-sky-600 hover:bg-sky-700'
              }`}
            >
              {sent ? (
                <><i className="ri-check-line"></i> Sent!</>
              ) : sending ? (
                <><i className="ri-loader-4-line animate-spin"></i> Sending…</>
              ) : (
                <><i className="ri-send-plane-line"></i> Send Email</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
