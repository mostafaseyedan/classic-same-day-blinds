export type ContactFact = {
  icon: "phone" | "email" | "location" | "hours";
  title: string;
  detail: string;
  helper: string;
  href?: string;
};

export const CONTACT_FACTS: readonly ContactFact[] = [
  {
    icon: "phone",
    title: "Call us",
    detail: "(817) 540-9300",
    helper: "Local showroom line",
    href: "tel:8175409300",
  },
  {
    icon: "phone",
    title: "Toll Free",
    detail: "(800) 961-9867",
    helper: "For orders outside DFW",
    href: "tel:8009619867",
  },
  {
    icon: "email",
    title: "Email us",
    detail: "support@blindsshop.com",
    helper: "Replies within one business day",
    href: "mailto:support@blindsshop.com",
  },
  {
    icon: "location",
    title: "Visit the showroom",
    detail: "2801 Brasher Ln, Bedford, TX 76021",
    helper: "DFW walk-ins and measuring help",
    href: "https://maps.google.com/?q=2801+Brasher+Ln,+Bedford,+TX+76021",
  },
  {
    icon: "hours",
    title: "Business hours",
    detail: "Mon – Fri · 8:00 AM – 5:00 PM",
    helper: "Weekend orders ship Monday or Tuesday",
  },
] as const;
