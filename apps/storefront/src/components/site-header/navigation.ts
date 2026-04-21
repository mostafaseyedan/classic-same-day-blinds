export type MenuLink = {
  label: string;
  href: string;
  note?: string;
};

export type MegaMenuSection = {
  heading: string;
  links: MenuLink[];
};

export type MegaMenuKey = "blinds" | "by-room" | "services" | "commercial";

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
      {
        heading: "Shop by need",
        links: [
          { label: "Moisture-prone rooms", href: "/products?category=faux-wood-blinds", note: "Kitchens and baths" },
          { label: "Rental turns", href: "/products?category=vinyl-blinds", note: "Fast repeatable replenishment" },
          { label: "Office glare control", href: "/products?category=aluminum-blinds", note: "Professional low-noise finish" },
          { label: "Patio door coverage", href: "/products?category=vertical-blinds", note: "Custom width spans" },
        ],
      },
      {
        heading: "Plan the order",
        links: [
          { label: "Free Sample", href: "/free-sample", note: "Check color and material first" },
          { label: "How to Measure", href: "/how-to-measure", note: "Get the fit right before checkout" },
          { label: "Room Visualizer", href: "/room-visualizer", note: "Preview finish direction in context" },
          { label: "Request a Quote", href: "/quote", note: "For larger or mixed-window jobs" },
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
      {
        heading: "Need help choosing?",
        links: [
          { label: "Talk to Sales", href: "/quote", note: "Best for mixed-room projects" },
          { label: "Free Sample", href: "/free-sample", note: "Compare finishes before you buy" },
          { label: "How to Measure", href: "/how-to-measure", note: "Avoid ordering errors" },
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
          { label: "Request a Quote", href: "/quote", note: "For larger or custom jobs" },
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
          { label: "Request a Quote", href: "/quote", note: "Mixed-window and project pricing" },
          { label: "Free Sample", href: "/free-sample", note: "Approve finishes before rollout" },
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
          { label: "Track Order", href: "/track-order", note: "Status for existing jobs" },
          { label: "Contact Sales", href: "/contact", note: "Get a real person involved" },
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
];

export const programNavItems = [
  { label: "Room Visualizer", href: "/room-visualizer" },
  { label: "Trade Program", href: "/membership" },
];
