import { legacyFaqReference, referenceCategoryLabels } from "@/lib/legacy-reference";

export type ProductCategory = {
  slug: string;
  label: string;
  shortLabel: string;
  description: string;
  priceHint: string;
  image: string;
};

export type StorefrontProduct = {
  slug: string;
  name: string;
  categoryLabel: string;
  description: string;
  story: string;
  price: number;
  originalPrice: number;
  image: string;
  badge: string;
  leadTime: string;
  bestFor: string;
  highlights: string[];
};

export const heroSlides = [
  {
    label: "Residential Homes",
    accent: "Custom cuts, clean installs, and durable day-to-day operation.",
    image: "/images/home/hero-residential.jpg",
  },
  {
    label: "Apartment Communities",
    accent: "Bulk-friendly replenishment and property-manager ordering workflows.",
    image: "/images/home/hero-apartments.jpg",
  },
];

export const marketSegments = [
  {
    label: "Hospitality",
    copy: "Fast replacement cycles and consistent room-level product specs.",
    badge: "Bulk Orders",
  },
  {
    label: "Property Managers",
    copy: "Simple replenishment for apartment turns and maintenance requests.",
    badge: "Operational",
  },
  {
    label: "Residential",
    copy: "Custom sizing without a slow, heavyweight storefront experience.",
    badge: "Direct to Customer",
  },
];

export const productCategories: ProductCategory[] = [
  {
    slug: "faux-wood-blinds",
    label: referenceCategoryLabels["wood-blinds"].label,
    shortLabel: referenceCategoryLabels["wood-blinds"].shortLabel,
    description:
      "The warm wood-look category for kitchens, family rooms, and moisture-sensitive installs.",
    priceHint: "Starting at $27.10",
    image: "/images/categories/faux-wood-blinds.jpg",
  },
  {
    slug: "vertical-blinds",
    label: referenceCategoryLabels["vertical-blinds"].label,
    shortLabel: referenceCategoryLabels["vertical-blinds"].shortLabel,
    description:
      "Custom-width coverage for patio doors, larger window spans, and commercial openings.",
    priceHint: "Starting at $44.00",
    image: "/images/categories/vertical-blinds.jpg",
  },
  {
    slug: "aluminum-blinds",
    label: referenceCategoryLabels["aluminum-blinds"].label,
    shortLabel: referenceCategoryLabels["aluminum-blinds"].shortLabel,
    description:
      "Commercial-ready heavy-gauge aluminum for offices, multi-unit properties, and high-use installs.",
    priceHint: "Starting at $11.81",
    image: "/images/categories/aluminum-blinds.jpg",
  },
];

export const storefrontProducts: StorefrontProduct[] = [
  {
    slug: "faux-wood-blinds-2-inch",
    name: '2" Faux Wood Blinds',
    categoryLabel: "Faux Wood",
    description:
      "A warm wood-look product with stronger visual depth and better moisture resistance than real wood.",
    story:
      "Real wood warmth without the warp risk. Our most popular choice for living rooms and premium remodels where moisture is a concern.",
    price: 27.1,
    originalPrice: 31.88,
    image: "/images/products/faux-wood-blinds-2-inch.jpg",
    badge: "Top Rated",
    leadTime: "Ships in 4 to 6 business days",
    bestFor: "Living rooms, kitchens, and premium remodels",
    highlights: [
      "Wood-look texture",
      "Warp resistant",
      "188 size options",
    ],
  },
  {
    slug: "vertical-blinds-made-to-fit",
    name: "Vertical Blinds / Made to Fit Any Size",
    categoryLabel: "Vertical Blinds",
    description:
      "Stock-size vertical blinds for patio doors, large openings, and commercial spans.",
    story:
      "Six stock sizes covering the most common patio door and large window spans. Same-day availability in DFW when in stock.",
    price: 44,
    originalPrice: 52,
    image: "/images/products/vertical-blinds-made-to-fit.jpg",
    badge: "In Stock",
    leadTime: "Same day in DFW when stock allows",
    bestFor: "Patio doors, large windows, and wide commercial openings",
    highlights: [
      "Six stock sizes",
      "Wide-span coverage",
      "Same-day DFW pickup",
    ],
  },
  {
    slug: "aluminum-business-class-blinds-1-inch",
    name: '1" Aluminum Business Class Blinds',
    categoryLabel: "Aluminum Blinds",
    description:
      "Institutional-grade aluminum blinds built for high-use commercial environments, offices, and multi-unit properties.",
    story:
      "Heavy-gauge aluminum slats engineered for commercial durability. Trusted by property managers and facilities teams across the DFW area.",
    price: 11.81,
    originalPrice: 13.91,
    image: "/images/products/aluminum-business-class-1-inch.jpg",
    badge: "Commercial Grade",
    leadTime: "Ships in 3 to 5 business days",
    bestFor: "Offices, multi-unit properties, and high-use commercial installs",
    highlights: [
      "Heavy-gauge aluminum",
      "94 size options",
      "Commercial durability",
    ],
  },
];

export const faqItems = [
  ...legacyFaqReference,
];
