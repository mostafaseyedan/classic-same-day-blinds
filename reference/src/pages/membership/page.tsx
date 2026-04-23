import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const tiers = [
  {
    name: 'Silver',
    price: '$10,000',
    period: '/year',
    tagline: 'Perfect for growing businesses',
    color: 'from-slate-400 to-slate-600',
    accent: 'text-slate-600',
    border: 'border-slate-300',
    icon: 'ri-medal-line',
    features: [
      'Up to 15% discount on all orders',
      'Dedicated account manager',
      'Priority customer support',
      'Free measurement service (up to 10 visits/yr)',
      'Free professional installation (up to 5 rooms/yr)',
      'Access to exclusive member-only products',
      'Early access to new collections',
      'Quarterly design consultation (1 session)',
      'Free shipping on every order',
      'Annual style lookbook mailed to you',
    ],
    notIncluded: [
      'White-glove concierge service',
      'Unlimited installation visits',
      'Custom commercial pricing',
    ],
    cta: 'Join Silver',
    popular: false,
  },
  {
    name: 'Gold',
    price: '$20,000',
    period: '/year',
    tagline: 'Best for property managers & hotels',
    color: 'from-amber-400 to-amber-600',
    accent: 'text-amber-600',
    border: 'border-amber-400',
    icon: 'ri-vip-crown-line',
    features: [
      'Up to 25% discount on all orders',
      'Dedicated senior account manager',
      '24/7 VIP customer support',
      'Free measurement service (unlimited visits)',
      'Free professional installation (up to 20 rooms/yr)',
      'Access to exclusive member-only products',
      'First access to new collections & limited editions',
      'Monthly design consultation (12 sessions/yr)',
      'Free expedited shipping on every order',
      'White-glove concierge service',
      'Bulk order project management',
      'Annual in-home design review',
    ],
    notIncluded: [
      'Unlimited installation visits',
    ],
    cta: 'Join Gold',
    popular: true,
  },
  {
    name: 'Platinum',
    price: '$30,000',
    period: '/year',
    tagline: 'For large-scale commercial clients',
    color: 'from-emerald-500 to-green-700',
    accent: 'text-green-700',
    border: 'border-green-500',
    icon: 'ri-vip-diamond-line',
    features: [
      'Up to 40% discount on all orders',
      'Dedicated executive account team',
      '24/7 priority hotline & on-site support',
      'Free measurement service (unlimited visits)',
      'Free professional installation (unlimited rooms)',
      'Full access to all exclusive & custom products',
      'Exclusive pre-launch product previews',
      'Weekly design consultation (unlimited sessions)',
      'Free same-day shipping on qualifying orders',
      'White-glove concierge service',
      'Full commercial project management',
      'Custom branding & labeling options',
      'Dedicated warehouse inventory allocation',
      'Annual executive business review',
    ],
    notIncluded: [],
    cta: 'Join Platinum',
    popular: false,
  },
];

export default function MembershipPage() {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    tier: '',
    message: '',
  });
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.message.length > 500) return;
    setSubmitStatus('submitting');
    try {
      const body = new URLSearchParams();
      Object.entries(formData).forEach(([k, v]) => body.append(k, v));
      const res = await fetch('https://readdy.ai/api/form/d6p3sfl39lnhn4hh1k0g', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
      if (res.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', phone: '', company: '', tier: '', message: '' });
        setTimeout(() => setSubmitStatus('idle'), 5000);
      } else {
        setSubmitStatus('error');
        setTimeout(() => setSubmitStatus('idle'), 4000);
      }
    } catch {
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Nav with Back Button */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-green-700 hover:text-white text-gray-700 text-sm font-semibold rounded-md transition-all duration-200 cursor-pointer whitespace-nowrap"
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-arrow-left-line"></i>
              </div>
              Back to Home
            </Link>
            <Link to="/" className="text-base font-bold text-gray-900">
              Classic Same Day Blinds
            </Link>
            <div className="w-36"></div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative bg-gray-900 overflow-hidden">
        <img
          src="https://readdy.ai/api/search-image?query=Luxury%20penthouse%20interior%20with%20floor%20to%20ceiling%20windows%20dressed%20in%20premium%20custom%20blinds%20and%20shades%2C%20elegant%20upscale%20living%20room%20with%20warm%20golden%20lighting%2C%20sophisticated%20modern%20decor%2C%20marble%20surfaces%2C%20high-end%20window%20treatments%2C%20architectural%20photography%2C%20rich%20warm%20tones%2C%20exclusive%20private%20residence&width=1920&height=600&seq=membership-hero-001&orientation=landscape"
          alt="Classic Same Day Blinds Membership Program"
          className="w-full h-[420px] object-cover object-top opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 via-gray-900/50 to-gray-900/80"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <span className="inline-flex items-center gap-2 bg-green-700/30 border border-green-500/40 text-green-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-5">
            <i className="ri-vip-crown-line"></i> Exclusive Membership Program
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
            Unlock Premium Benefits &<br />
            <span className="text-green-400">Exclusive Savings</span>
          </h1>
          <p className="text-lg text-white/80 max-w-xl mb-8">
            Join thousands of hotels, property managers, and design professionals who save big with our annual membership tiers.
          </p>
          <a
            href="#tiers"
            className="px-8 py-3.5 bg-green-700 text-white font-semibold rounded-md hover:bg-green-800 transition-all cursor-pointer whitespace-nowrap text-base"
          >
            View Membership Tiers
          </a>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-green-700 py-5">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '3,800+', label: 'Active Members' },
            { value: 'Up to 40%', label: 'Member Discounts' },
            { value: '38 Years', label: 'Industry Experience' },
            { value: '24/7', label: 'VIP Support' },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-green-200 text-sm mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Tiers */}
      <section id="tiers" className="py-20 px-4 bg-stone-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Choose Your Membership Tier</h2>
            <p className="text-gray-500 text-base max-w-xl mx-auto">All memberships are billed annually. Discounts, services, and perks scale with your tier.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative bg-white rounded-2xl border-2 ${tier.border} shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col`}
              >
                {tier.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-amber-500 text-white text-xs font-bold text-center py-1.5 tracking-wide uppercase">
                    ⭐ Most Popular
                  </div>
                )}
                <div className={`bg-gradient-to-br ${tier.color} p-8 ${tier.popular ? 'pt-10' : ''}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 flex items-center justify-center bg-white/20 rounded-xl">
                      <i className={`${tier.icon} text-white text-xl`}></i>
                    </div>
                    <span className="text-white font-bold text-xl">{tier.name}</span>
                  </div>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-4xl font-bold text-white">{tier.price}</span>
                    <span className="text-white/80 text-base mb-1">{tier.period}</span>
                  </div>
                  <p className="text-white/80 text-sm">{tier.tagline}</p>
                </div>

                <div className="p-7 flex flex-col flex-1">
                  <ul className="space-y-3 mb-6 flex-1">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700">
                        <div className="w-4 h-4 flex items-center justify-center mt-0.5 shrink-0">
                          <i className="ri-checkbox-circle-fill text-green-600 text-base"></i>
                        </div>
                        {f}
                      </li>
                    ))}
                    {tier.notIncluded.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-gray-400">
                        <div className="w-4 h-4 flex items-center justify-center mt-0.5 shrink-0">
                          <i className="ri-close-circle-line text-gray-300 text-base"></i>
                        </div>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <a
                    href="#inquiry"
                    className={`block w-full text-center py-3 rounded-lg font-semibold text-sm transition-all cursor-pointer whitespace-nowrap ${
                      tier.popular
                        ? 'bg-amber-500 hover:bg-amber-600 text-white'
                        : tier.name === 'Platinum'
                        ? 'bg-green-700 hover:bg-green-800 text-white'
                        : 'bg-gray-900 hover:bg-gray-800 text-white'
                    }`}
                    onClick={() => setFormData((p) => ({ ...p, tier: tier.name }))}
                  >
                    {tier.cta}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Join */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Why Join Classic Same Day Blinds?</h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm">Trusted by the hospitality industry since 1986. Our members get more than discounts — they get a partner.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: 'ri-history-line', title: '38 Years of Expertise', desc: 'Our founder has been in the blind industry since 1986. No one knows window treatments better than we do.' },
              { icon: 'ri-building-2-line', title: 'Trusted by Hotels & Casinos', desc: 'From boutique hotels to large casino resorts, our members trust us to outfit thousands of rooms at a time.' },
              { icon: 'ri-scissors-cut-line', title: 'Custom Made to Order', desc: 'Every blind and shade is custom manufactured to your exact specifications — no off-the-shelf compromises.' },
              { icon: 'ri-truck-line', title: 'Same Day – 4 Day Shipping', desc: 'Industry-leading turnaround times. Members get priority production slots and expedited shipping.' },
              { icon: 'ri-customer-service-2-line', title: 'Dedicated Account Team', desc: 'Gold and Platinum members get a named account manager available by phone, email, and text.' },
              { icon: 'ri-shield-check-line', title: '3-Year Warranty Included', desc: 'All products come with our industry-leading 3-year warranty. Members get extended coverage options.' },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 p-6 bg-stone-50 rounded-xl border border-stone-100 hover:border-green-200 transition-colors">
                <div className="w-11 h-11 flex items-center justify-center bg-green-100 rounded-xl shrink-0">
                  <i className={`${item.icon} text-green-700 text-xl`}></i>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-stone-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">What Our Members Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'James Whitfield',
                role: 'Director of Operations, Grand Palms Resort',
                tier: 'Platinum',
                quote: 'The Platinum membership paid for itself in the first order. We outfitted 340 rooms and saved over $80,000 compared to our previous supplier.',
                avatar: 'https://readdy.ai/api/search-image?query=Professional%20male%20hotel%20director%20headshot%2C%20confident%20business%20executive%2C%20warm%20smile%2C%20neutral%20background%2C%20corporate%20portrait%20photography&width=80&height=80&seq=member-avatar-001&orientation=squarish',
              },
              {
                name: 'Sandra Reyes',
                role: 'Property Manager, Apex Residential Group',
                tier: 'Gold',
                quote: 'Managing 12 apartment complexes used to be a nightmare for window treatments. With Gold membership, I have one contact who handles everything.',
                avatar: 'https://readdy.ai/api/search-image?query=Professional%20female%20property%20manager%20headshot%2C%20friendly%20smile%2C%20business%20casual%20attire%2C%20neutral%20background%2C%20corporate%20portrait%20photography&width=80&height=80&seq=member-avatar-002&orientation=squarish',
              },
              {
                name: 'Michael Torres',
                role: 'Interior Designer, Torres Design Studio',
                tier: 'Silver',
                quote: 'The Silver tier gives me the discount I need to stay competitive on client bids, plus the design consultations are genuinely valuable.',
                avatar: 'https://readdy.ai/api/search-image?query=Professional%20male%20interior%20designer%20headshot%2C%20creative%20professional%2C%20warm%20smile%2C%20studio%20background%2C%20portrait%20photography&width=80&height=80&seq=member-avatar-003&orientation=squarish',
              },
            ].map((t) => (
              <div key={t.name} className="bg-white rounded-xl p-6 border border-stone-200 shadow-sm">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className="ri-star-fill text-amber-400 text-sm"></i>
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-5 italic">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover object-top" />
                  <div>
                    <div className="font-bold text-gray-900 text-sm">{t.name}</div>
                    <div className="text-gray-400 text-xs">{t.role}</div>
                  </div>
                  <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${
                    t.tier === 'Platinum' ? 'bg-green-100 text-green-700' :
                    t.tier === 'Gold' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>{t.tier}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Inquiry Form */}
      <section id="inquiry" className="py-20 px-4 bg-stone-50">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Ready to Join?</h2>
            <p className="text-gray-500 text-sm">Fill out the form below and a membership specialist will contact you within 1 business day.</p>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8">
            {submitStatus === 'success' ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 flex items-center justify-center bg-green-100 rounded-full mx-auto mb-4">
                  <i className="ri-checkbox-circle-fill text-green-600 text-3xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Inquiry Received!</h3>
                <p className="text-gray-500 text-sm">Thank you! A membership specialist will reach out to you within 1 business day.</p>
              </div>
            ) : (
              <form
                id="membership-inquiry-form"
                onSubmit={handleSubmit}
                data-readdy-form
                className="space-y-5"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                      placeholder="John Smith"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                      placeholder="john@company.com"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="(555) 000-0000"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Company / Property Name</label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={(e) => setFormData((p) => ({ ...p, company: e.target.value }))}
                      placeholder="Grand Palms Resort"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Membership Tier of Interest *</label>
                  <select
                    name="tier"
                    required
                    value={formData.tier}
                    onChange={(e) => setFormData((p) => ({ ...p, tier: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent cursor-pointer"
                  >
                    <option value="">Select a tier...</option>
                    <option value="Silver">Silver — $10,000/year</option>
                    <option value="Gold">Gold — $20,000/year</option>
                    <option value="Platinum">Platinum — $30,000/year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Message <span className="text-gray-400 font-normal">({formData.message.length}/500)</span>
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    maxLength={500}
                    value={formData.message}
                    onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
                    placeholder="Tell us about your business, number of properties, or any questions you have..."
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent resize-none"
                  />
                  {formData.message.length > 500 && (
                    <p className="text-red-500 text-xs mt-1">Message cannot exceed 500 characters.</p>
                  )}
                </div>

                {submitStatus === 'error' && (
                  <p className="text-red-500 text-sm text-center">Something went wrong. Please try again.</p>
                )}

                <button
                  type="submit"
                  disabled={submitStatus === 'submitting' || formData.message.length > 500}
                  className="w-full py-3.5 bg-green-700 text-white font-bold rounded-lg hover:bg-green-800 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60 text-sm"
                >
                  {submitStatus === 'submitting' ? 'Submitting...' : 'Submit Membership Inquiry'}
                </button>

                <p className="text-center text-xs text-gray-400">
                  Already a member?{' '}
                  <Link to="/account" className="text-green-700 hover:underline cursor-pointer">
                    Sign in to your account
                  </Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-14 px-4 bg-gray-900 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">Questions? Call Our Membership Team</h2>
        <p className="text-gray-400 text-sm mb-6">Available Mon–Fri 8am–9pm ET · Sat–Sun 9am–6pm ET</p>
        <a
          href="tel:18005051905"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-green-700 text-white font-bold rounded-md hover:bg-green-800 transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-phone-fill"></i>
          1-800-505-1905
        </a>
      </section>
    </div>
  );
}
