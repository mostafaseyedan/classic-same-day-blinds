export type MenuLink = {
  label: string;
  href: string;
  note?: string;
};

export type MegaMenuSection = {
  heading: string;
  links: MenuLink[];
};

export type MegaMenuKey = "blinds" | "by-room" | "services" | "commercial" | "company";

export type MegaMenuConfig = {
  label: string;
  featured: {
    eyebrow: string;
    title: string;
    copy: string;
    href: string;
    cta: string;
  };
  sections: MegaMenuSection[];
};

export const megaMenus: Record<MegaMenuKey, MegaMenuConfig> = {
  blinds: {
    label: "Blinds",
    featured: {
      eyebrow: "Core Catalog",
      title: "Start with the blind families that actually drive the storefront.",
      copy:
        "Use the real product lines first, then branch into room fit, samples, and measuring only when you need support.",
      href: "/products",
      cta: "Browse all blinds",
    },
    sections: [
      {
        heading: "Shop by product",
        links: [
          { label: "Faux Wood", href: "/products?category=faux-wood-blinds", note: "Warm wood-look finish" },
          { label: "Vinyl Blinds", href: "/products?category=vinyl-blinds", note: "Everyday value line" },
          { label: "Aluminum Blinds", href: "/products?category=aluminum-blinds", note: "Office and utility use" },
          { label: "Vertical Blinds", href: "/products?category=vertical-blinds", note: "Wide openings and patio doors" },
        ],
      },
    ],
  },
  "by-room": {
    label: "By Room",
    featured: {
      eyebrow: "Guided Discovery",
      title: "Start with the space, not the taxonomy.",
      copy:
        "Room-led navigation is faster for first-time shoppers and still gives pros a clean path into the full catalog.",
      href: "/products",
      cta: "See all room-ready options",
    },
    sections: [
      {
        heading: "Most common rooms",
        links: [
          { label: "Living Room", href: "/products?category=faux-wood-blinds", note: "Warm finishes and visual depth" },
          { label: "Bedroom", href: "/products?category=vinyl-blinds", note: "Privacy-first everyday control" },
          { label: "Kitchen", href: "/products?category=faux-wood-blinds", note: "Easy-clean, moisture-aware pick" },
          { label: "Office", href: "/products?category=aluminum-blinds", note: "Reduce screen glare" },
        ],
      },
      {
        heading: "Larger openings",
        links: [
          { label: "Patio Doors", href: "/products?category=vertical-blinds", note: "Wide sliders and glass spans" },
          { label: "Property Turns", href: "/products?category=vinyl-blinds", note: "Bulk-friendly replacements" },
          { label: "Commercial Rooms", href: "/products?category=aluminum-blinds", note: "Higher-use workspaces" },
        ],
      },
    ],
  },
  services: {
    label: "Services",
    featured: {
      eyebrow: "Support Before Order",
      title: "Keep the buying path simple, then bring in service when it helps.",
      copy:
        "Samples, measuring help, quotes, and same-day support should be easy to find without overwhelming product discovery.",
      href: "/free-sample",
      cta: "Start with samples",
    },
    sections: [
      {
        heading: "Pre-purchase help",
        links: [
          { label: "Free Sample", href: "/free-sample", note: "Material and color review" },
          { label: "How to Measure", href: "/how-to-measure", note: "Inside vs. outside mount guidance" },
          { label: "Room Visualizer", href: "/room-visualizer", note: "Preview product direction at home" },
          { label: "Price Match", href: "/price-match", note: "We'll beat any verified competitor quote" },
        ],
      },
      {
        heading: "Order support",
        links: [
          { label: "Track Order", href: "/track-order", note: "Check shipment or status" },
          { label: "Same-Day Delivery", href: "/same-day-delivery", note: "Local fast-turn support" },
          { label: "FAQ", href: "/faq", note: "Returns, lead times, and product basics" },
          { label: "Contact", href: "/contact", note: "Talk to the showroom team" },
        ],
      },
      {
        heading: "Account tools",
        links: [
          { label: "Sign In", href: "/auth", note: "Manage orders and saved items" },
          { label: "Account", href: "/account", note: "Profile and saved details" },
          { label: "Wishlist", href: "/wishlist", note: "Return to saved products" },
          { label: "Cart", href: "/cart", note: "Review items before checkout" },
        ],
      },
    ],
  },
  commercial: {
    label: "Commercial",
    featured: {
      eyebrow: "Programs and Projects",
      title: "Built for property teams, hospitality, and repeat ordering.",
      copy:
        "Use the commercial menu for quotes, trade inquiries, conferences, and higher-touch project workflows.",
      href: "/membership",
      cta: "Explore trade program",
    },
    sections: [
      {
        heading: "Programs",
        links: [
          { label: "Trade Program", href: "/membership", note: "High-touch inquiry workflow" },
          { label: "Who We Work With", href: "/who-we-work-with", note: "Client types and project fit" },
          { label: "Request a Quote", href: "/quote", note: "Mixed-window and project pricing" },
        ],
      },
      {
        heading: "Project paths",
        links: [
          { label: "Property Turns", href: "/products?category=vinyl-blinds", note: "Fast repeatable replenishment" },
          { label: "Office Installs", href: "/products?category=aluminum-blinds", note: "Commercial-ready everyday line" },
          { label: "Wide Openings", href: "/products?category=vertical-blinds", note: "Larger glazing and sliders" },
          { label: "Same-Day Delivery", href: "/same-day-delivery", note: "Local urgent support" },
        ],
      },
      {
        heading: "Events and resources",
        links: [
          { label: "Conferences", href: "/conferences", note: "Upcoming industry events" },
          { label: "Contact Sales", href: "/contact", note: "Get a real person involved" },
        ],
      },
    ],
  },
  company: {
    label: "Company",
    featured: {
      eyebrow: "Proof and Story",
      title: "See the people, work, and reputation behind the order.",
      copy:
        "Use this menu when shoppers want confidence before they buy: company story, installed work, reviews, and project fit.",
      href: "/#about",
      cta: "About Us",
    },
    sections: [
      {
        heading: "About Us",
        links: [
          { label: "About Us", href: "/#about", note: "Company story and local context" },
          { label: "Who We Work With", href: "/who-we-work-with", note: "Homes, property teams, and commercial buyers" },
          { label: "Contact", href: "/contact", note: "Talk to the showroom team" },
          { label: "Privacy Policy", href: "/privacy-policy", note: "How customer data is handled" },
        ],
      },
      {
        heading: "See the work",
        links: [
          { label: "Photo Gallery", href: "/#photo-gallery", note: "Installed blinds in real spaces" },
          { label: "Before and After", href: "/#before-after", note: "Finished-room transformations" },
          { label: "Google Reviews", href: "/#reviews", note: "Customer feedback and rating proof" },
        ],
      },
      {
        heading: "Why customers choose us",
        links: [
          { label: "Same-Day Delivery", href: "/same-day-delivery", note: "Local DFW fast-turn support" },
          { label: "Price Match", href: "/price-match", note: "Guaranteed lowest price" },
          { label: "Trade Program", href: "/membership", note: "Repeat-order and project support" },
        ],
      },
    ],
  },
};

export const browseNavItems: { key: MegaMenuKey; label: string }[] = [
  { key: "blinds", label: megaMenus.blinds.label },
  { key: "by-room", label: megaMenus["by-room"].label },
  { key: "services", label: megaMenus.services.label },
  { key: "commercial", label: megaMenus.commercial.label },
  { key: "company", label: megaMenus.company.label },
];

export const programNavItems = [
  { label: "Room Visualizer", href: "/room-visualizer" },
  { label: "Trade Program", href: "/membership" },
];
