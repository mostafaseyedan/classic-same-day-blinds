import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';

const colorOptions = [
  { name: 'White', swatch: '#F5F5F5' },
  { name: 'Ivory', swatch: '#FFFFF0' },
  { name: 'Gray', swatch: '#9E9E9E' },
  { name: 'Beige', swatch: '#D4B896' },
  { name: 'Espresso', swatch: '#3B1F0E' },
  { name: 'Natural', swatch: '#C8A96E' },
];

const productTypes = [
  'Wood Blinds',
  'Roller Shades',
  'Cellular Shades',
  'Roman Shades',
  'Motorized Blinds',
  'Faux Wood Blinds',
];

export default function FreeSamplePage() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [selectedColor, setSelectedColor] = useState('');
  const [charCount, setCharCount] = useState(0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const body = new URLSearchParams();
    data.forEach((value, key) => {
      body.append(key, value.toString());
    });

    try {
      await fetch('https://readdy.ai/api/form/d6qrud3a90d3mf3egmg0', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar scrolled={false} />
      <div className="h-[calc(2.25rem+1.75rem+3.5rem+2.75rem)] sm:h-[calc(2.75rem+1.75rem+3.5rem+2.75rem)]"></div>

      {/* Hero Banner */}
      <div className="relative bg-gradient-to-br from-green-800 to-green-600 py-14 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img
            src="https://readdy.ai/api/search-image?query=elegant%20window%20blinds%20texture%20pattern%20close%20up%20fabric%20weave%20neutral%20tones%20subtle%20background&width=1440&height=300&seq=sample-hero-bg&orientation=landscape"
            alt=""
            className="w-full h-full object-cover object-top"
          />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-bold px-4 py-1.5 rounded-full mb-4 uppercase tracking-widest">
            <i className="ri-gift-line"></i> 100% Free — No Credit Card Required
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 leading-tight">
            Order Your Free Sample
          </h1>
          <p className="text-green-100 text-base leading-relaxed">
            Not sure about the color or texture? We'll ship a real sample right to your door — completely free. One sample per customer.
          </p>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-green-50 border-b border-green-100 py-6 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-center">
          {[
            { icon: 'ri-file-list-3-line', title: 'Fill the Form', desc: 'Choose your color & product type' },
            { icon: 'ri-truck-line', title: 'We Ship Free', desc: 'Delivered to your door in 2–4 days' },
            { icon: 'ri-check-double-line', title: 'Feel Confident', desc: 'Order your custom blinds with certainty' },
          ].map((step) => (
            <div key={step.title} className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 flex items-center justify-center bg-green-700 text-white rounded-full">
                <i className={`${step.icon} text-lg`}></i>
              </div>
              <p className="text-sm font-bold text-gray-900">{step.title}</p>
              <p className="text-xs text-gray-500">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-14">
        {submitted ? (
          <div className="text-center py-16 flex flex-col items-center gap-5">
            <div className="w-20 h-20 flex items-center justify-center bg-green-100 rounded-full">
              <i className="ri-checkbox-circle-line text-5xl text-green-700"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Sample Request Received!</h2>
            <p className="text-gray-500 text-sm max-w-sm leading-relaxed">
              Thank you! Your free sample is on its way. Expect it within 2–4 business days. Once you've had a chance to feel the quality, come back and order your custom blinds.
            </p>
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => navigate('/')}
                className="px-6 py-2.5 bg-green-700 text-white text-sm font-semibold rounded-md hover:bg-green-800 transition-colors cursor-pointer whitespace-nowrap"
              >
                Browse Products
              </button>
              <button
                onClick={() => { setSubmitted(false); setSelectedColor(''); setCharCount(0); }}
                className="px-6 py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-md hover:border-green-400 transition-colors cursor-pointer whitespace-nowrap"
              >
                Submit Another
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-green-700 transition-colors cursor-pointer mb-5 group"
              >
                <div className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-200 group-hover:border-green-400 transition-colors">
                  <i className="ri-arrow-left-line text-sm"></i>
                </div>
                Back
              </button>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Request Your Free Sample</h2>
              <p className="text-sm text-gray-500">Fill in your details below. Limit: 1 sample per customer.</p>
            </div>

            <form
              data-readdy-form
              id="free-sample-form"
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">First Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="first_name"
                    required
                    placeholder="Jane"
                    className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Last Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="last_name"
                    required
                    placeholder="Smith"
                    className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="jane@example.com"
                  className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="(555) 000-0000"
                  className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>

              {/* Shipping Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Street Address <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="address"
                  required
                  placeholder="123 Main St"
                  className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">City <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="city"
                    required
                    placeholder="Las Vegas"
                    className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">State <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="state"
                    required
                    placeholder="NV"
                    className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">ZIP Code <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="zip"
                    required
                    placeholder="89101"
                    className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>
              </div>

              {/* Product Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Product Type <span className="text-red-500">*</span></label>
                <select
                  name="product_type"
                  required
                  className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-600 bg-white cursor-pointer"
                >
                  <option value="">Select a product type...</option>
                  {productTypes.map((pt) => (
                    <option key={pt} value={pt}>{pt}</option>
                  ))}
                </select>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Preferred Color <span className="text-red-500">*</span>
                </label>
                <input type="hidden" name="preferred_color" value={selectedColor} />
                <div className="flex flex-wrap gap-3">
                  {colorOptions.map((c) => (
                    <button
                      type="button"
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md border text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                        selectedColor === c.name
                          ? 'border-green-700 bg-green-50 text-green-800 ring-2 ring-green-200'
                          : 'border-gray-200 text-gray-600 hover:border-green-400'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-gray-300 shrink-0"
                        style={{ backgroundColor: c.swatch }}
                      ></span>
                      {c.name}
                    </button>
                  ))}
                </div>
                {selectedColor === '' && (
                  <p className="text-xs text-gray-400 mt-1.5">Please select a color above.</p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Additional Notes</label>
                <textarea
                  name="notes"
                  rows={3}
                  maxLength={500}
                  placeholder="Any specific questions or details about your windows..."
                  onChange={(e) => setCharCount(e.target.value.length)}
                  className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-600 resize-none"
                />
                <p className="text-xs text-gray-400 text-right mt-0.5">{charCount}/500</p>
              </div>

              {/* Policy note */}
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-lg p-4">
                <div className="w-5 h-5 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
                  <i className="ri-information-line text-base"></i>
                </div>
                <p className="text-xs text-amber-700 leading-relaxed">
                  <strong>1 sample per customer.</strong> By submitting this form, you confirm this is your first sample request. Duplicate requests will not be fulfilled.
                </p>
              </div>

              <button
                type="submit"
                disabled={!selectedColor}
                className="w-full py-3.5 bg-green-700 text-white font-bold rounded-md hover:bg-green-800 transition-colors cursor-pointer whitespace-nowrap text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="ri-send-plane-line"></i>
                Send My Free Sample
              </button>
            </form>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
