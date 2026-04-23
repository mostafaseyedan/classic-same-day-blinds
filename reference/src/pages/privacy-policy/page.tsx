import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';

const sections = [
  { id: 'overview', label: 'Overview' },
  { id: 'information-we-collect', label: 'Information We Collect' },
  { id: 'how-we-use', label: 'How We Use Your Information' },
  { id: 'sharing', label: 'Sharing & Disclosure' },
  { id: 'cookies', label: 'Cookies & Tracking' },
  { id: 'data-retention', label: 'Data Retention' },
  { id: 'your-rights', label: 'Your Rights (CCPA / GDPR)' },
  { id: 'security', label: 'Data Security' },
  { id: 'children', label: 'Children\'s Privacy' },
  { id: 'changes', label: 'Policy Changes' },
  { id: 'contact', label: 'Contact Us' },
];

export default function PrivacyPolicyPage() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const navigate = useNavigate();
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );
    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar scrolled={scrolled} />

      {/* Hero */}
      <div className="bg-stone-900 pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-stone-400 text-sm mb-5">
            <button onClick={() => navigate('/')} className="hover:text-green-400 transition-colors cursor-pointer whitespace-nowrap">Home</button>
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-right-s-line"></i></div>
            <span className="text-stone-300">Privacy Policy</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Privacy Policy</h1>
          <p className="text-stone-400 text-base max-w-2xl leading-relaxed">
            Classic Same Day Blinds is committed to protecting your personal information. This policy explains
            what we collect, how we use it, and your rights as a customer or visitor.
          </p>
          <div className="flex flex-wrap items-center gap-6 mt-6 text-sm text-stone-400">
            <span className="flex items-center gap-1.5">
              <div className="w-4 h-4 flex items-center justify-center text-green-400"><i className="ri-calendar-line"></i></div>
              Last updated: March 25, 2026
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-4 h-4 flex items-center justify-center text-green-400"><i className="ri-map-pin-2-line"></i></div>
              Los Angeles, CA, USA
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-4 h-4 flex items-center justify-center text-green-400"><i className="ri-shield-check-line"></i></div>
              CCPA &amp; GDPR compliant
            </span>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex gap-12">

          {/* Sticky sidebar TOC */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-24">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Contents</p>
              <nav className="space-y-1">
                {sections.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => scrollTo(s.id)}
                    className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-all duration-150 cursor-pointer whitespace-nowrap ${
                      activeSection === s.id
                        ? 'bg-green-50 text-green-700 font-semibold border-l-2 border-green-700'
                        : 'text-gray-500 hover:text-gray-800 hover:bg-stone-50'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </nav>
              <div className="mt-8 p-4 bg-green-50 rounded-xl border border-green-100">
                <p className="text-xs font-bold text-green-800 mb-1.5">Questions?</p>
                <p className="text-xs text-green-700 mb-3 leading-snug">Our team is happy to help explain anything in this policy.</p>
                <button
                  onClick={() => navigate('/')}
                  className="text-xs font-bold text-green-700 hover:text-green-800 flex items-center gap-1 cursor-pointer whitespace-nowrap"
                >
                  Contact us
                  <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-arrow-right-line text-xs"></i></div>
                </button>
              </div>
            </div>
          </aside>

          {/* Content */}
          <article className="flex-1 min-w-0 prose-custom">

            {/* SECTION 1 */}
            <section id="overview" className="mb-12 scroll-mt-28">
              <SectionHeader number="1" title="Overview" />
              <Prose>
                <p>
                  Classic Same Day Blinds (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) operates the website
                  at <strong>classicsamedayblinds.com</strong> and any related mobile applications or services (collectively,
                  the &ldquo;Services&rdquo;). We are based in <strong>Los Angeles, California</strong> and have been serving
                  customers since 1994.
                </p>
                <p>
                  This Privacy Policy describes how we collect, use, disclose, and safeguard your information when you visit
                  our website, place an order, or interact with us in any way. By using our Services, you agree to the terms
                  of this Privacy Policy.
                </p>
                <p>
                  If you do not agree with the terms of this Privacy Policy, please discontinue use of our Services
                  immediately and contact us with any questions.
                </p>
              </Prose>
            </section>

            {/* SECTION 2 */}
            <section id="information-we-collect" className="mb-12 scroll-mt-28">
              <SectionHeader number="2" title="Information We Collect" />
              <Prose>
                <p>We collect several categories of information depending on how you interact with us:</p>
              </Prose>
              <div className="space-y-4 mt-4">
                <InfoBlock icon="ri-user-line" title="Personal Identification Information">
                  Name, email address, mailing address, phone number, billing address, and shipping address — collected when
                  you place an order, create an account, request a free sample, or contact us.
                </InfoBlock>
                <InfoBlock icon="ri-bank-card-line" title="Payment Information">
                  Credit/debit card numbers, billing details, and transaction records. Payment data is processed securely via
                  our payment processor (Stripe) and is never stored in full on our servers.
                </InfoBlock>
                <InfoBlock icon="ri-ruler-line" title="Window Measurement Data">
                  Width, height, and custom configuration details you provide when configuring a product order.
                  This data is used solely to manufacture and fulfill your custom order.
                </InfoBlock>
                <InfoBlock icon="ri-device-line" title="Device & Usage Data">
                  IP address, browser type, operating system, pages visited, time on site, referring URLs, and other
                  analytics data collected automatically via cookies and log files.
                </InfoBlock>
                <InfoBlock icon="ri-message-3-line" title="Communications Data">
                  Any messages, emails, or chat logs you send to our customer service team.
                </InfoBlock>
              </div>
            </section>

            {/* SECTION 3 */}
            <section id="how-we-use" className="mb-12 scroll-mt-28">
              <SectionHeader number="3" title="How We Use Your Information" />
              <Prose>
                <p>We use the information we collect for the following purposes:</p>
              </Prose>
              <ul className="mt-4 space-y-2.5">
                {[
                  'Process and fulfill your custom blind and shade orders',
                  'Send order confirmations, shipping updates, and delivery notifications',
                  'Provide customer support and respond to inquiries',
                  'Process payments and prevent fraud',
                  'Send promotional emails and deals (only if you opted in — you may opt out at any time)',
                  'Improve our website, product offerings, and customer experience',
                  'Comply with legal obligations and enforce our Terms of Service',
                  'Analyze site traffic and user behavior via aggregated, anonymized analytics',
                  'Personalize your shopping experience and product recommendations',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <div className="w-4 h-4 flex items-center justify-center text-green-600 shrink-0 mt-0.5">
                      <i className="ri-check-double-line text-sm"></i>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            {/* SECTION 4 */}
            <section id="sharing" className="mb-12 scroll-mt-28">
              <SectionHeader number="4" title="Sharing & Disclosure" />
              <Prose>
                <p>
                  We do <strong>not</strong> sell your personal information. We may share your information only in the
                  following limited circumstances:
                </p>
              </Prose>
              <div className="mt-5 overflow-hidden rounded-xl border border-stone-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200">
                      <th className="text-left px-5 py-3 font-bold text-gray-700 w-1/3">Recipient</th>
                      <th className="text-left px-5 py-3 font-bold text-gray-700">Purpose</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Payment processors (Stripe)', 'Secure payment handling and fraud prevention'],
                      ['Shipping carriers (UPS, FedEx, USPS)', 'Order delivery and tracking'],
                      ['Email service providers', 'Transactional and marketing email delivery'],
                      ['Analytics providers (Google Analytics)', 'Aggregated, anonymized site usage reporting'],
                      ['Legal authorities', 'When required by law, subpoena, or court order'],
                      ['Business transfers', 'In the event of a merger, acquisition, or asset sale'],
                    ].map(([recipient, purpose], i) => (
                      <tr key={i} className={`border-b border-stone-100 last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-stone-50/50'}`}>
                        <td className="px-5 py-3 font-medium text-gray-800">{recipient}</td>
                        <td className="px-5 py-3 text-gray-600">{purpose}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* SECTION 5 */}
            <section id="cookies" className="mb-12 scroll-mt-28">
              <SectionHeader number="5" title="Cookies & Tracking Technologies" />
              <Prose>
                <p>
                  We use cookies, web beacons, and similar tracking technologies to enhance your browsing experience,
                  remember your preferences, and analyze how our site is used.
                </p>
              </Prose>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                {[
                  { type: 'Essential Cookies', desc: 'Required for core site functionality such as the shopping cart, checkout session, and account login. Cannot be disabled.', color: 'bg-green-50 border-green-200' },
                  { type: 'Analytics Cookies', desc: 'Help us understand how visitors interact with our site (e.g., Google Analytics). Data is anonymized and aggregated.', color: 'bg-stone-50 border-stone-200' },
                  { type: 'Marketing Cookies', desc: 'Used to deliver relevant advertisements and measure campaign effectiveness. Only enabled with your consent.', color: 'bg-stone-50 border-stone-200' },
                  { type: 'Preference Cookies', desc: 'Remember your language, currency, and shopping preferences between visits.', color: 'bg-stone-50 border-stone-200' },
                ].map((c) => (
                  <div key={c.type} className={`rounded-xl p-4 border ${c.color}`}>
                    <p className="font-bold text-gray-800 text-sm mb-1">{c.type}</p>
                    <p className="text-xs text-gray-600 leading-relaxed">{c.desc}</p>
                  </div>
                ))}
              </div>
              <Prose>
                <p className="mt-5">
                  You can control cookies through your browser settings. Disabling certain cookies may affect your ability
                  to use portions of our website. For more information, visit{' '}
                  <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer nofollow" className="text-green-700 hover:underline">allaboutcookies.org</a>.
                </p>
              </Prose>
            </section>

            {/* SECTION 6 */}
            <section id="data-retention" className="mb-12 scroll-mt-28">
              <SectionHeader number="6" title="Data Retention" />
              <Prose>
                <p>
                  We retain your personal information only for as long as necessary to fulfill the purposes described
                  in this policy, comply with legal obligations, resolve disputes, and enforce our agreements.
                </p>
                <p>
                  Order records are retained for a minimum of <strong>7 years</strong> for tax and accounting compliance.
                  Account information is retained for as long as your account is active, and for up to <strong>2 years</strong>{' '}
                  after account closure. Marketing communication data is deleted promptly upon unsubscription.
                </p>
                <p>
                  You may request deletion of your personal data at any time (see <em>Your Rights</em> below),
                  subject to our legal retention obligations.
                </p>
              </Prose>
            </section>

            {/* SECTION 7 */}
            <section id="your-rights" className="mb-12 scroll-mt-28">
              <SectionHeader number="7" title="Your Rights (CCPA / GDPR)" />
              <Prose>
                <p>
                  Depending on your location, you may have the following rights regarding your personal information:
                </p>
              </Prose>
              <div className="mt-5 space-y-3">
                {[
                  { icon: 'ri-eye-line', right: 'Right to Know / Access', desc: 'Request a copy of the personal information we hold about you.' },
                  { icon: 'ri-delete-bin-line', right: 'Right to Deletion', desc: 'Request that we delete your personal information, subject to certain exceptions.' },
                  { icon: 'ri-edit-line', right: 'Right to Correction', desc: 'Request that we correct inaccurate or incomplete personal information.' },
                  { icon: 'ri-forbid-line', right: 'Right to Opt Out of Sale', desc: 'We do not sell personal information. You may still submit this request via our contact form.' },
                  { icon: 'ri-download-line', right: 'Right to Data Portability', desc: 'Request a copy of your data in a commonly used, machine-readable format.' },
                  { icon: 'ri-spam-3-line', right: 'Right to Restrict Processing', desc: 'Request that we limit how we use your personal data in certain circumstances.' },
                ].map((r) => (
                  <div key={r.right} className="flex items-start gap-3 p-4 bg-stone-50 rounded-xl border border-stone-200">
                    <div className="w-8 h-8 flex items-center justify-center bg-green-100 text-green-700 rounded-lg shrink-0 mt-0.5">
                      <i className={`${r.icon} text-sm`}></i>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{r.right}</p>
                      <p className="text-xs text-gray-600 mt-0.5 leading-snug">{r.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Prose>
                <p className="mt-5">
                  To exercise any of these rights, please contact us at <strong>privacy@classicsamedayblinds.com</strong> or
                  by mail at our Los Angeles office. We will respond to verified requests within <strong>45 days</strong> as
                  required by California law (CCPA). EU/UK residents may also lodge a complaint with their local
                  supervisory authority.
                </p>
              </Prose>
            </section>

            {/* SECTION 8 */}
            <section id="security" className="mb-12 scroll-mt-28">
              <SectionHeader number="8" title="Data Security" />
              <Prose>
                <p>
                  We implement industry-standard technical and organizational security measures to protect your personal
                  information from unauthorized access, alteration, disclosure, or destruction. These measures include:
                </p>
              </Prose>
              <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  'SSL/TLS encryption on all data transmissions',
                  'PCI-DSS compliant payment processing via Stripe',
                  'Encrypted storage of sensitive personal data',
                  'Access controls and role-based permissions for staff',
                  'Regular security audits and vulnerability assessments',
                  'Secure off-site database backups',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                    <div className="w-4 h-4 flex items-center justify-center text-green-600 shrink-0 mt-0.5">
                      <i className="ri-shield-check-line text-sm"></i>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Prose>
                <p className="mt-5">
                  While we take every reasonable precaution, no method of transmission over the internet or electronic
                  storage is 100% secure. If you have reason to believe your interaction with us is no longer secure,
                  please notify us immediately at <strong>security@classicsamedayblinds.com</strong>.
                </p>
              </Prose>
            </section>

            {/* SECTION 9 */}
            <section id="children" className="mb-12 scroll-mt-28">
              <SectionHeader number="9" title="Children's Privacy" />
              <Prose>
                <p>
                  Our Services are not directed to children under the age of <strong>13</strong>, and we do not knowingly
                  collect personal information from children. If you believe we have inadvertently collected information from
                  a child under 13, please contact us immediately at <strong>privacy@classicsamedayblinds.com</strong> and
                  we will take steps to delete that information promptly.
                </p>
              </Prose>
            </section>

            {/* SECTION 10 */}
            <section id="changes" className="mb-12 scroll-mt-28">
              <SectionHeader number="10" title="Changes to This Policy" />
              <Prose>
                <p>
                  We may update this Privacy Policy from time to time to reflect changes in our practices, technology,
                  legal requirements, or business operations. When we make material changes, we will:
                </p>
              </Prose>
              <ul className="mt-4 space-y-2">
                {[
                  'Post the updated policy on this page with a revised "Last Updated" date',
                  'Send an email notification to registered account holders',
                  'Display a notice on our homepage for 30 days following significant changes',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <div className="w-4 h-4 flex items-center justify-center text-green-600 shrink-0 mt-0.5">
                      <i className="ri-arrow-right-circle-line text-sm"></i>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Prose>
                <p className="mt-4">
                  Your continued use of our Services after any changes constitutes your acceptance of the revised policy.
                </p>
              </Prose>
            </section>

            {/* SECTION 11 */}
            <section id="contact" className="mb-8 scroll-mt-28">
              <SectionHeader number="11" title="Contact Us" />
              <Prose>
                <p>
                  If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data,
                  please contact us through any of the following methods:
                </p>
              </Prose>
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: 'ri-mail-line', label: 'Email', value: 'privacy@classicsamedayblinds.com', href: 'mailto:privacy@classicsamedayblinds.com' },
                  { icon: 'ri-phone-line', label: 'Phone', value: '(310) 555-0199', href: 'tel:+13105550199' },
                  { icon: 'ri-map-pin-2-line', label: 'Mail', value: '1234 Pico Blvd, Los Angeles, CA 90015', href: null },
                ].map((c) => (
                  <div key={c.label} className="p-4 bg-stone-50 rounded-xl border border-stone-200 flex flex-col gap-2">
                    <div className="w-8 h-8 flex items-center justify-center bg-green-100 text-green-700 rounded-lg">
                      <i className={`${c.icon} text-sm`}></i>
                    </div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{c.label}</p>
                    {c.href ? (
                      <a href={c.href} className="text-sm text-green-700 font-semibold hover:underline break-all">{c.value}</a>
                    ) : (
                      <p className="text-sm text-gray-700 leading-snug">{c.value}</p>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-6 p-5 bg-green-50 rounded-xl border border-green-200 flex items-start gap-3">
                <div className="w-8 h-8 flex items-center justify-center text-green-700 shrink-0">
                  <i className="ri-information-line text-xl"></i>
                </div>
                <p className="text-sm text-green-800 leading-relaxed">
                  For California residents exercising rights under the <strong>CCPA</strong>, you may also submit
                  a verifiable consumer request through our main contact form or by calling the number above.
                  We do not charge a fee for processing reasonable requests and will respond within 45 days.
                </p>
              </div>
            </section>

            {/* Back to top */}
            <div className="pt-6 border-t border-stone-200 flex items-center justify-between">
              <p className="text-xs text-gray-400">Classic Same Day Blinds · Privacy Policy · Last updated March 25, 2026</p>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex items-center gap-1.5 text-xs font-bold text-green-700 hover:text-green-800 cursor-pointer whitespace-nowrap"
              >
                Back to top
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-up-line text-xs"></i></div>
              </button>
            </div>

          </article>
        </div>
      </div>

      <Footer />
    </div>
  );
}

/* ── Helpers ── */
function SectionHeader({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="w-7 h-7 rounded-full bg-green-700 text-white text-xs font-bold flex items-center justify-center shrink-0">
        {number}
      </span>
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
    </div>
  );
}

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
      {children}
    </div>
  );
}

function InfoBlock({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-stone-50 rounded-xl border border-stone-200">
      <div className="w-8 h-8 flex items-center justify-center bg-white text-green-700 rounded-lg border border-stone-200 shrink-0 mt-0.5">
        <i className={`${icon} text-sm`}></i>
      </div>
      <div>
        <p className="text-sm font-bold text-gray-800 mb-0.5">{title}</p>
        <p className="text-xs text-gray-600 leading-relaxed">{children}</p>
      </div>
    </div>
  );
}
