import { CONTACT_FACTS } from "@/components/storefront/contact-facts";
import { ContactInfo } from "@/components/storefront/contact-info";
import Link from "next/link";

const footerLinks = [
  { href: "/products", label: "Products" },
  { href: "/room-visualizer", label: "Room Visualizer" },
  { href: "/free-sample", label: "Free Sample" },
  { href: "/how-to-measure", label: "How to Measure" },
  { href: "/quote", label: "Quote Request" },
  { href: "/track-order", label: "Track Order" },
  { href: "/contact", label: "Contact" },
];

export function SiteFooter() {
  const primaryContactFacts = CONTACT_FACTS.slice(0, 3);
  const secondaryContactFacts = CONTACT_FACTS.slice(3);

  return (
    <footer className="bg-slate pb-[calc(2rem+var(--safe-bottom))] pt-16 lg:pt-20">
      <div className="content-shell">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)]">
          {/* Brand column */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brass">
              Classic Same Day Blinds
            </p>
            <p className="mt-3 max-w-[22ch] font-display text-[2.4rem] font-semibold leading-[1.1] text-shell md:text-[2.7rem]">
              Custom blinds for homes, teams, and commercial projects.
            </p>
            <p className="mt-4 max-w-[33rem] text-sm leading-6 text-shell/60">
              Shop made-to-order blinds, request samples, get measuring help, and work directly with the Bedford showroom team when a project needs a human touch.
            </p>
          </div>

          {/* Links + Contact columns */}
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.46fr)_minmax(0,1.54fr)] lg:pl-8 xl:pl-12">
            {/* Quick Links */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brass">
                Quick Links
              </p>
              <div className="mt-6 grid gap-3">
                {footerLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm font-medium text-shell/65 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <p className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-brass">
                Contact
              </p>
              <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)]">
                <ContactInfo facts={primaryContactFacts} className="space-y-5" itemClassName="gap-3" />
                <ContactInfo facts={secondaryContactFacts} className="space-y-5" itemClassName="gap-3" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-5 text-xs tracking-[0.04em] text-shell/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Classic Same Day Blinds. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/privacy-policy" className="transition-colors hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/faq" className="transition-colors hover:text-white">
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
