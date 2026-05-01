import { Breadcrumbs, Eyebrow, EyebrowAccent, PageTitle } from "@blinds/ui";

const sections = [
  {
    heading: "Information We Collect",
    body: [
      "When you place an order or create an account, we collect your name, email address, phone number, shipping address, and payment information. Payment card details are processed and stored securely by Stripe and are never held on our servers.",
      "When you browse our storefront, we may collect standard usage data such as pages visited, device type, and browser information. This data is used solely to improve site performance and is not sold to third parties.",
    ],
  },
  {
    heading: "How We Use Your Information",
    body: [
      "We use your information to process and fulfill orders, send order confirmations and shipping updates, respond to support requests, and manage your customer account.",
      "If you opt in, we may use your email to send product updates or promotional offers from Classic Same Day Blinds. You can unsubscribe at any time from any marketing email we send.",
    ],
  },
  {
    heading: "How We Share Your Information",
    body: [
      "We do not sell, rent, or trade your personal information. We share your data only with service providers necessary to operate our business — including Stripe for payment processing, and shipping carriers for order delivery.",
      "We may disclose your information if required by law, court order, or to protect the rights and safety of our customers or staff.",
    ],
  },
  {
    heading: "Data Retention",
    body: [
      "We retain your account and order information for as long as your account is active or as needed to provide services, comply with legal obligations, and resolve disputes.",
      "You may request deletion of your account and associated data at any time by visiting your account settings or contacting us directly. We will process deletion requests within 48 hours.",
    ],
  },
  {
    heading: "Cookies",
    body: [
      "Our storefront uses cookies to maintain your shopping cart session and remember your preferences. We do not use third-party advertising cookies. You may disable cookies in your browser settings, though some storefront features may not function correctly without them.",
    ],
  },
  {
    heading: "Security",
    body: [
      "We take reasonable technical and organizational measures to protect your personal information against unauthorized access, loss, or misuse. All data transmitted between your browser and our storefront is encrypted via HTTPS.",
      "No method of transmission or storage is 100% secure. If you believe your account has been compromised, contact us immediately at support@classicsamedayblinds.com.",
    ],
  },
  {
    heading: "Your Rights",
    body: [
      "You have the right to access, correct, or delete the personal information we hold about you. To exercise these rights, sign in to your account or contact us at the address below. We will respond to all verified requests within a reasonable timeframe.",
    ],
  },
];

const contactDetails = [
  { key: "Company", value: "Classic Same Day Blinds" },
  { key: "Address", value: "2801 Brasher Ln, Bedford, TX 76021" },
  { key: "Email", value: "support@classicsamedayblinds.com" },
  { key: "Phone", value: "1-800-505-1905" },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="page-section pb-20 pt-10">
      <div className="mx-auto max-w-4xl">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]} />
        <section>
          <PageTitle>How we collect, use, and protect your information.</PageTitle>
          <p className="mt-4 text-sm leading-7 text-slate/70">
            Effective date: January 1, 2025. This policy explains what information Classic Same Day
            Blinds collects, how we use it, and the choices you have.
          </p>

          <div className="mt-12 space-y-10">
            {sections.map((section) => (
              <div key={section.heading}>
                <Eyebrow className="group flex items-center gap-4">
                  <span className="block h-px w-10 bg-olive transition-all duration-300 group-hover:w-16" />
                  {section.heading}
                </Eyebrow>
                <div className="mt-4 space-y-4">
                  {section.body.map((paragraph) => (
                    <p key={paragraph} className="text-sm leading-7 text-slate/70">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            ))}

            <div>
              <Eyebrow className="group flex items-center gap-4">
                <span className="block h-px w-10 bg-olive transition-all duration-300 group-hover:w-16" />
                Contact
              </Eyebrow>
              <div className="mt-4 grid gap-3">
                {contactDetails.map(({ key, value }) => (
                  <div key={key} className="flex gap-3">
                    <EyebrowAccent className="w-16 shrink-0">{key}</EyebrowAccent>
                    <p className="text-sm leading-5 text-slate/70">{value}</p>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-sm leading-7 text-slate/70">
                If you have questions about this policy or how we handle your data, reach out and we will respond promptly.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
