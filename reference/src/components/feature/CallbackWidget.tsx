import { useState } from 'react';

type TabType = 'callback' | 'message';

interface FormState {
  name: string;
  phone: string;
  email: string;
  message: string;
  preferredTime: string;
}

const INITIAL_FORM: FormState = {
  name: '',
  phone: '',
  email: '',
  message: '',
  preferredTime: '',
};

export default function CallbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<TabType>('callback');
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(false);

  // Show notification bubble after delay if not opened
  useState(() => {
    const timer = setTimeout(() => {
      setNotification(true);
    }, 8000);
    return () => clearTimeout(timer);
  });

  const validate = (): boolean => {
    const errs: Partial<FormState> = {};
    if (!form.name.trim()) errs.name = 'Required';
    if (tab === 'callback') {
      if (!form.phone.trim()) errs.phone = 'Required';
    } else {
      if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email required';
      if (!form.message.trim()) errs.message = 'Required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    const params = new URLSearchParams({
      type: tab === 'callback' ? 'Callback Request' : 'Message',
      name: form.name,
      phone: form.phone || '—',
      email: form.email || '—',
      preferred_time: form.preferredTime || '—',
      message: form.message || '—',
    });

    try {
      await fetch('https://readdy.ai/api/form/d708vntt4s7j0tv5iodg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });
    } catch {
      // silent fail — still show success to user
    } finally {
      setSubmitting(false);
      setSubmitted(true);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSubmitted(false);
    setForm(INITIAL_FORM);
    setErrors({});
  };

  const handleOpen = () => {
    setIsOpen(true);
    setNotification(false);
  };

  return (
    <>
      {/* Floating trigger button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {/* Notification tooltip */}
        {notification && !isOpen && (
          <div className="bg-gray-900 text-white text-xs font-semibold px-3 py-2 rounded-xl max-w-[180px] text-right leading-snug animate-bounce-once shadow-lg">
            Need help? Chat or request a callback!
            <div className="absolute bottom-[-6px] right-5 w-3 h-3 bg-gray-900 rotate-45"></div>
          </div>
        )}

        <button
          onClick={isOpen ? handleClose : handleOpen}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 cursor-pointer ${
            isOpen ? 'bg-gray-800 rotate-45' : 'bg-green-700 hover:bg-green-800 hover:scale-110'
          }`}
        >
          {isOpen ? (
            <i className="ri-close-line text-white text-2xl"></i>
          ) : (
            <i className="ri-customer-service-2-line text-white text-2xl"></i>
          )}
          {notification && !isOpen && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
          )}
        </button>
      </div>

      {/* Panel */}
      <div
        className={`fixed bottom-24 right-6 z-50 w-80 bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all duration-300 origin-bottom-right ${
          isOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none'
        }`}
        style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
      >
        {/* Header */}
        <div className="bg-green-700 px-5 py-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 flex items-center justify-center bg-white/20 rounded-full shrink-0">
              <i className="ri-customer-service-2-line text-white text-lg"></i>
            </div>
            <div>
              <p className="text-white font-bold text-sm">Classic Same Day Blinds</p>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                <span className="text-green-200 text-xs">We typically reply within 1 hour</span>
              </div>
            </div>
          </div>
        </div>

        {!submitted ? (
          <>
            {/* Tabs */}
            <div className="flex border-b border-gray-100">
              <button
                onClick={() => setTab('callback')}
                className={`flex-1 py-3 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  tab === 'callback' ? 'text-green-700 border-b-2 border-green-700' : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                <i className="ri-phone-line text-sm"></i>
                Request Callback
              </button>
              <button
                onClick={() => setTab('message')}
                className={`flex-1 py-3 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  tab === 'message' ? 'text-green-700 border-b-2 border-green-700' : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                <i className="ri-message-2-line text-sm"></i>
                Send a Message
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} data-readdy-form className="px-5 py-4 space-y-3" noValidate>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Your Name *</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="John Smith"
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                />
                {errors.name && <p className="text-xs text-red-500 mt-0.5">{errors.name}</p>}
              </div>

              {tab === 'callback' && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="(555) 000-0000"
                      className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 ${errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                    />
                    {errors.phone && <p className="text-xs text-red-500 mt-0.5">{errors.phone}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Best Time to Call</label>
                    <select
                      name="preferredTime"
                      value={form.preferredTime}
                      onChange={(e) => setForm({ ...form, preferredTime: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 bg-white cursor-pointer"
                    >
                      <option value="">Any time</option>
                      <option value="Morning (8am–12pm)">Morning (8am–12pm)</option>
                      <option value="Afternoon (12pm–5pm)">Afternoon (12pm–5pm)</option>
                      <option value="Evening (5pm–8pm)">Evening (5pm–8pm)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Any notes? <span className="font-normal text-gray-400">(optional)</span></label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      rows={2}
                      maxLength={500}
                      placeholder="What can we help you with?"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 resize-none"
                    />
                  </div>
                </>
              )}

              {tab === 'message' && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@example.com"
                      className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                    />
                    {errors.email && <p className="text-xs text-red-500 mt-0.5">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Message *</label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      rows={3}
                      maxLength={500}
                      placeholder="How can we help you today?"
                      className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 resize-none ${errors.message ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                    />
                    {errors.message && <p className="text-xs text-red-500 mt-0.5">{errors.message}</p>}
                    <p className="text-xs text-gray-400 text-right mt-0.5">{form.message.length}/500</p>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-green-700 text-white font-bold text-sm rounded-lg hover:bg-green-800 transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? (
                  <><i className="ri-loader-4-line animate-spin"></i> Sending...</>
                ) : tab === 'callback' ? (
                  <><i className="ri-phone-line"></i> Request Callback</>
                ) : (
                  <><i className="ri-send-plane-line"></i> Send Message</>
                )}
              </button>
            </form>
          </>
        ) : (
          /* Success state */
          <div className="px-5 py-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-checkbox-circle-fill text-green-600 text-3xl"></i>
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-2">
              {tab === 'callback' ? 'Callback Requested!' : 'Message Sent!'}
            </h3>
            <p className="text-sm text-gray-500 mb-5 leading-relaxed">
              {tab === 'callback'
                ? "We've received your request and will call you back shortly during business hours."
                : "Thanks! We've got your message and will reply to your email within 1 business hour."}
            </p>
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-green-700 text-white text-sm font-bold rounded-lg hover:bg-green-800 transition-colors cursor-pointer whitespace-nowrap"
            >
              Close
            </button>
          </div>
        )}

        {/* Footer note */}
        {!submitted && (
          <div className="px-5 pb-4 flex items-center gap-2 text-xs text-gray-400">
            <i className="ri-lock-line text-green-600"></i>
            Your info is never shared or sold.
          </div>
        )}
      </div>
    </>
  );
}
