import { useState, useRef } from 'react';

export default function PriceMatchGuarantee() {
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    competitor: '',
    details: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.phone.trim()) e.phone = 'Required';
    if (!form.competitor.trim()) e.competitor = 'Required';
    if (!form.details.trim()) e.details = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setUploadedFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0] ?? null;
    if (file) setUploadedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setFormError('');
    const params = new URLSearchParams({
      name: form.name,
      email: form.email,
      phone: form.phone,
      competitor: form.competitor,
      details: form.details,
      notes: form.notes || '—',
      attachment: uploadedFile ? `${uploadedFile.name} (${(uploadedFile.size / 1024).toFixed(1)} KB)` : 'No file attached',
    });
    try {
      await fetch('https://readdy.ai/api/form/d70e0juth28qd804cpbg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });
      setSubmitted(true);
    } catch {
      setFormError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="relative overflow-hidden bg-[#0a2e1a] py-20 px-4">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)', backgroundSize: '12px 12px' }} />

      {/* Accent glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto">
        {/* Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full">
            <i className="ri-medal-line text-sm"></i>
            Price Match Guarantee
          </div>
        </div>

        {/* Headline */}
        <div className="text-center mb-4">
          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-3">
            We Beat Any Competitor's
            <span className="block text-amber-400">Price. Guaranteed.</span>
          </h2>
          <p className="text-emerald-200 text-lg max-w-2xl mx-auto leading-relaxed">
            Found a better deal somewhere else? Send us their quote and we'll beat it — or match it on the spot.
            <span className="text-white font-semibold"> No hassle. No fine print.</span>
          </p>
        </div>

        {/* Trust badges row */}
        <div className="flex flex-wrap justify-center gap-6 mt-8 mb-10">
          {[
            { icon: 'ri-trophy-line', label: 'Lowest Price', sub: 'Or we beat it' },
            { icon: 'ri-timer-flash-line', label: 'Same-Day Response', sub: 'We reply fast' },
            { icon: 'ri-shake-hands-line', label: 'Beat or Match', sub: 'Every competitor quote' },
            { icon: 'ri-truck-line', label: 'Free Shipping', sub: 'Every order' },
          ].map(b => (
            <div key={b.label} className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center bg-emerald-800/60 border border-emerald-600/40 rounded-xl shrink-0">
                <i className={`${b.icon} text-emerald-400 text-lg`}></i>
              </div>
              <div>
                <p className="text-white text-sm font-bold">{b.label}</p>
                <p className="text-emerald-400 text-xs">{b.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        {!showForm && !submitted && (
          <div className="flex justify-center">
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2.5 px-8 py-4 bg-amber-400 hover:bg-amber-300 text-gray-900 font-extrabold rounded-xl text-base transition-all cursor-pointer whitespace-nowrap"
            >
              <i className="ri-mail-send-line text-lg"></i>
              Send Us a Competitor Quote
            </button>
          </div>
        )}

        {/* Form */}
        {showForm && !submitted && (
          <form
            data-readdy-form
            onSubmit={handleSubmit}
            className="mt-4 bg-white/5 border border-white/10 rounded-2xl p-7 max-w-2xl mx-auto backdrop-blur-sm"
          >
            <h3 className="text-white font-bold text-base mb-5 flex items-center gap-2">
              <i className="ri-mail-send-line text-amber-400"></i>
              Submit a Competitor Quote
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-semibold text-emerald-300 mb-1 block">Your Name *</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="John Smith"
                  className={`w-full bg-white/10 border rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400 ${errors.name ? 'border-red-400' : 'border-white/20'}`}
                />
                {errors.name && <p className="text-xs text-red-400 mt-0.5">{errors.name}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-emerald-300 mb-1 block">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="john@example.com"
                  className={`w-full bg-white/10 border rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400 ${errors.email ? 'border-red-400' : 'border-white/20'}`}
                />
                {errors.email && <p className="text-xs text-red-400 mt-0.5">{errors.email}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-emerald-300 mb-1 block">Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="(555) 000-0000"
                  className={`w-full bg-white/10 border rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400 ${errors.phone ? 'border-red-400' : 'border-white/20'}`}
                />
                {errors.phone && <p className="text-xs text-red-400 mt-0.5">{errors.phone}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-emerald-300 mb-1 block">Competitor Name *</label>
                <input
                  type="text"
                  name="competitor"
                  value={form.competitor}
                  onChange={e => setForm({ ...form, competitor: e.target.value })}
                  placeholder="e.g. Home Depot, Blinds.com"
                  className={`w-full bg-white/10 border rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400 ${errors.competitor ? 'border-red-400' : 'border-white/20'}`}
                />
                {errors.competitor && <p className="text-xs text-red-400 mt-0.5">{errors.competitor}</p>}
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs font-semibold text-emerald-300 mb-1 block">Their Quote / Price Details *</label>
              <textarea
                name="details"
                value={form.details}
                onChange={e => setForm({ ...form, details: e.target.value })}
                rows={3}
                maxLength={500}
                placeholder="Paste the product name, size, price, and any other details from their quote..."
                className={`w-full bg-white/10 border rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none ${errors.details ? 'border-red-400' : 'border-white/20'}`}
              />
              {errors.details && <p className="text-xs text-red-400 mt-0.5">{errors.details}</p>}
            </div>

            {/* File upload */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-emerald-300 mb-1 block">
                Upload Quote <span className="font-normal text-white/30">(PDF, image — optional)</span>
              </label>
              <div
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl px-4 py-6 cursor-pointer transition-all ${
                  uploadedFile
                    ? 'border-amber-400/60 bg-amber-400/10'
                    : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.gif"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {uploadedFile ? (
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-9 h-9 flex items-center justify-center bg-amber-400/20 rounded-lg shrink-0">
                      <i className={`${uploadedFile.type === 'application/pdf' ? 'ri-file-pdf-line' : 'ri-image-line'} text-amber-400 text-lg`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{uploadedFile.name}</p>
                      <p className="text-xs text-emerald-400">{(uploadedFile.size / 1024).toFixed(1)} KB · Click to change</p>
                    </div>
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); setUploadedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                      className="w-7 h-7 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      <i className="ri-close-line text-sm"></i>
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-xl">
                      <i className="ri-upload-cloud-2-line text-white/50 text-xl"></i>
                    </div>
                    <p className="text-sm text-white/60 text-center">
                      <span className="text-amber-400 font-semibold">Click to upload</span> or drag & drop
                    </p>
                    <p className="text-xs text-white/30">PDF, PNG, JPG up to 10MB</p>
                  </>
                )}
              </div>
            </div>

            <div className="mb-5">
              <label className="text-xs font-semibold text-emerald-300 mb-1 block">Additional Notes <span className="font-normal text-white/30">(optional)</span></label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                rows={2}
                maxLength={500}
                placeholder="Anything else we should know..."
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
              />
            </div>

            {formError && (
              <div className="flex items-center gap-2 bg-red-500/20 border border-red-400/40 rounded-lg px-3 py-2 mb-4 text-sm text-red-300">
                <i className="ri-error-warning-line"></i> {formError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 bg-amber-400 hover:bg-amber-300 text-gray-900 font-extrabold rounded-xl text-sm transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <><i className="ri-loader-4-line animate-spin"></i> Sending...</>
                ) : (
                  <><i className="ri-mail-send-line"></i> Submit Quote Request</>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-3 border border-white/20 text-white/70 hover:text-white hover:border-white/40 font-semibold rounded-xl text-sm transition-all cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Success */}
        {submitted && (
          <div className="mt-4 text-center bg-emerald-800/40 border border-emerald-500/40 rounded-2xl px-8 py-10 max-w-lg mx-auto">
            <div className="w-14 h-14 flex items-center justify-center bg-emerald-500/20 border border-emerald-400/30 rounded-full mx-auto mb-4">
              <i className="ri-checkbox-circle-fill text-emerald-400 text-3xl"></i>
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Got it — we're on it!</h3>
            <p className="text-emerald-200 text-sm leading-relaxed">
              We received your competitor quote and will respond with our best price within a few hours. Check your email at <strong className="text-white">{form.email}</strong>.
            </p>
            <button
              onClick={() => { setSubmitted(false); setShowForm(false); setUploadedFile(null); setForm({ name: '', email: '', phone: '', competitor: '', details: '', notes: '' }); }}
              className="mt-6 px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap"
            >
              Submit Another
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
