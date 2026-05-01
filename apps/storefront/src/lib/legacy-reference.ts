export const referenceCategoryLabels = {
  "mini-blinds": {
    label: '1" Vinyl Blinds',
    shortLabel: "Vinyl",
  },
  "aluminum-blinds": {
    label: '1" Aluminum Blinds',
    shortLabel: "Aluminum",
  },
  "wood-blinds": {
    label: '2" Faux Wood Blinds',
    shortLabel: "Faux Wood",
  },
  "vertical-blinds": {
    label: "Vertical Blinds",
    shortLabel: "Vertical",
  },
} as const;

export const legacyProductAttributeReference = [
  {
    category: "mini-blinds",
    displayLabel: referenceCategoryLabels["mini-blinds"].label,
    merchandisingBadges: ["Best Seller", "Popular", "Best Value", "Customer Favorite"],
    commonColors: ["White", "Ivory", "Tan", "Brown", "Gray", "Black"],
    materials: ["Vinyl slats", "Reinforced headrail", "Moisture-resistant finish"],
    controlOptions: ["Wand tilt", "Cord lift", "Cordless upgrade path"],
    sizeNotes: ["Custom widths and drop", "Standard residential windows", "Value-led opening price"],
  },
  {
    category: "aluminum-blinds",
    displayLabel: referenceCategoryLabels["aluminum-blinds"].label,
    merchandisingBadges: ["Best Value", "Commercial Grade", "Moisture Proof"],
    commonColors: ["Silver", "White", "Bronze", "Champagne", "Charcoal"],
    materials: ["Aluminum slats", "Commercial headrail", "Rust-resistant finish"],
    controlOptions: ["Wand tilt", "Cord lift"],
    sizeNotes: ["Good for bathrooms and utility spaces", "Higher-use commercial openings"],
  },
  {
    category: "wood-blinds",
    displayLabel: referenceCategoryLabels["wood-blinds"].label,
    merchandisingBadges: ["Top Rated", "Premium Look", "Warp Resistant"],
    commonColors: ["White", "Ivory", "Natural Oak", "Warm Cherry", "Espresso", "Gray"],
    materials: ["Faux wood composite", "Wide 2-inch slats", "Moisture-proof finish"],
    controlOptions: ["Tilt control", "Lift control", "Decorative ladder options"],
    sizeNotes: ["Style-led category", "Kitchen and living-room friendly", "Higher AOV family"],
  },
  {
    category: "vertical-blinds",
    displayLabel: referenceCategoryLabels["vertical-blinds"].label,
    merchandisingBadges: ["In Stock", "Made to Fit", "Large Opening Coverage"],
    commonColors: ["White", "Ivory", "Bone", "Gray", "Taupe", "Charcoal"],
    materials: ["PVC vanes", "Traverse rail", "Commercial-friendly spans"],
    controlOptions: ["Wand tilt", "Cord traverse"],
    sizeNotes: [
      "Sliding doors and patio openings",
      'Stock sizes from 54"x84" upward',
      "Same-day candidates when inventory allows",
    ],
  },
] as const;

export const legacyContentBlocks = {
  sameDayDelivery: {
    title: "DFW same-day delivery and pick-up",
    summary:
      "Legacy positioned same-day service as a major differentiator. That promise should remain highly visible in the final storefront.",
    bullets: [
      "Order cutoff and route eligibility must become real operational rules.",
      "Bedford warehouse and DFW coverage should stay explicit in messaging.",
      "Standard shipping fallback should be presented cleanly when same-day is unavailable.",
    ],
  },
  freeSample: {
    title: "Free sample request flow",
    summary:
      "The sample route is a strong conversion aid for finish uncertainty and should route to ops rather than a dead third-party form endpoint.",
    bullets: [
      "Collect shipping details and preferred product family.",
      "Enforce sample limits operationally, not in front-end-only logic.",
      "Turn sample requests into a real follow-up workflow.",
    ],
  },
  conferences: {
    title: "Conference and partnership outreach",
    summary:
      "The conference page is a business-development surface, not just marketing filler. It belongs in the final product if those partnerships matter.",
    bullets: [
      "Conference interest should enter an ops/business-development queue.",
      "The route should focus on strategic verticals rather than fake event schedules.",
      "Position Classic Same Day Blinds as an operations partner for multifamily and commercial buyers.",
    ],
  },
  membership: {
    title: "Membership / preferred buyer program",
    summary:
      "Legacy treated membership as a high-touch commercial buyer program. It should survive only as a real inquiry-driven offering.",
    bullets: [
      "Keep tier framing if the program is real.",
      "Do not imply live entitlements until backend and business rules exist.",
      "Use inquiry capture instead of fake checkout or fake account logic.",
    ],
  },
  account: {
    title: "Customer account IA",
    summary:
      "The legacy account area had the right breadth, but the wrong implementation. The IA is still useful for the final portal.",
    bullets: [
      "Orders, addresses, payments, wishlist, restock alerts, and referrals belong in the long-term account model.",
      "Everything must move to real customer identity and service ownership.",
    ],
  },
} as const;

export const legacyMerchandisingIdeas = [
  {
    key: "property-turns",
    audience: "Property managers",
    headline: "Fast replacement cycles for unit turns",
    emphasis: "Operational speed and repeat ordering",
  },
  {
    key: "same-day-dfw",
    audience: "Residential and DFW buyers",
    headline: "Same-day fulfillment when stock and route allow",
    emphasis: "Local differentiation",
  },
  {
    key: "competitor-gap",
    audience: "Price-sensitive shoppers",
    headline: "15% under competitor starting price references",
    emphasis: "Price-match and competitor-backed selling",
  },
  {
    key: "commercial-grade",
    audience: "Facilities and hospitality teams",
    headline: "Commercial-ready SKUs for moisture and high-use environments",
    emphasis: "Durability and maintenance",
  },
  {
    key: "style-led-faux-wood",
    audience: "Homeowners and remodels",
    headline: "Faux wood as the style-led hero category",
    emphasis: "Visual warmth and premium look",
  },
  {
    key: "large-opening",
    audience: "Patio and wide-span buyers",
    headline: "Vertical blinds for large openings and stock-size speed",
    emphasis: "Coverage and availability",
  },
] as const;

export const legacyFaqReference = [
  {
    question: "How do I measure my windows for blinds?",
    answer:
      "For inside mount, measure the exact width and height of the window opening at three points (top, middle, bottom for width; left, center, right for height) and use the smallest measurement. For outside mount, measure the area you want to cover and add 2-3 inches on each side for best light blockage and coverage.",
  },
  {
    question: "What is the difference between light filtering and blackout shades?",
    answer:
      "Light filtering shades allow soft, diffused natural light to pass through while providing privacy during the day. Blackout shades block 99-100% of light, making them ideal for bedrooms, nurseries, and home theaters where complete darkness is desired.",
  },
  {
    question: "Are your blinds child and pet safe?",
    answer:
      "Yes! All our cordless and motorized options are certified child and pet safe. We strongly recommend cordless or motorized blinds for homes with young children or pets. Our cordless lift systems eliminate dangling cords entirely.",
  },
  {
    question: "Do you offer free samples?",
    answer:
      "Absolutely! We offer free fabric and material samples so you can see and feel the quality before ordering. Simply select up to 5 samples from any product page and we'll ship them to you at no charge, usually within 2-3 business days.",
  },
  {
    question: "How long does it take to receive my custom blinds?",
    answer:
      "Most custom blinds and shades are made to order and ship within 3-5 business days. Standard delivery takes 5-7 business days after shipping. Expedited options are available at checkout. You'll receive a tracking number as soon as your order ships.",
  },
  {
    question: "Can I install blinds myself?",
    answer:
      "Yes! Our blinds come with detailed installation instructions and all necessary hardware. Most installations take under 30 minutes per window with basic tools. We also offer video tutorials on our website and our customer support team is available to guide you through the process.",
  },
  {
    question: "What is your return and warranty policy?",
    answer:
      "We offer a 30-day return policy on all stock items. Custom-made blinds are non-returnable but are covered by our Best Price Guarantee and a 3-year warranty against manufacturing defects. If your blinds arrive damaged or incorrect, we'll replace them at no cost.",
  },
  {
    question: "Do you offer motorized and smart home compatible blinds?",
    answer:
      "Yes! Our motorized blinds are compatible with Amazon Alexa, Google Home, and Apple HomeKit. You can control them via app, voice command, or set automated schedules. Our smart blinds use rechargeable batteries or can be hardwired for a permanent solution.",
  },
] as const;

export const legacyReviewThemes = {
  headline: "Legacy review corpus showed consistent patterns worth preserving in the new storefront.",
  themes: [
    "Easy installation and measurement support",
    "Stronger perceived value than big-box alternatives",
    "Good fit for property refreshes and repeat multi-unit orders",
    "Positive reaction to same-day delivery and fast fulfillment",
    "Clean, modern look as a recurring purchase driver",
  ],
} as const;

export const sampleOrderSchemaReference = {
  statuses: ["Pending", "Working on Order", "Fulfilled & Shipped", "Delivered", "Cancelled"],
  orderFields: [
    { key: "id", label: "Order ID", required: true, notes: "Stable public-facing order number." },
    { key: "date", label: "Created at", required: true, notes: "Used for order history sort and confirmation." },
    { key: "status", label: "Status", required: true, notes: "Should align with storefront and ops status mapping." },
    { key: "subtotal", label: "Subtotal", required: true },
    { key: "shipping", label: "Shipping total", required: true },
    { key: "tax", label: "Tax total", required: true },
    { key: "total", label: "Grand total", required: true },
    { key: "customer", label: "Customer snapshot", required: true, notes: "Email and shipping context at order time." },
    { key: "trackingNumber", label: "Tracking number", required: false },
    { key: "fulfilledAt", label: "Fulfilled timestamp", required: false },
  ],
  itemFields: [
    { key: "productId", label: "Product ID", required: true },
    { key: "name", label: "Line item name", required: true },
    { key: "quantity", label: "Quantity", required: true },
    { key: "price", label: "Unit price", required: true },
    { key: "size", label: "Selected size or measurement", required: false },
    { key: "color", label: "Selected color", required: false },
    { key: "mount", label: "Mount style", required: false },
    { key: "image", label: "Product image", required: false },
  ],
} as const;

export const visualizerProductReferences = [
  {
    key: "vinyl-blinds",
    label: '1" Vinyl Blinds',
    category: "mini-blinds",
    defaultColors: ["#ffffff", "#f1ece2", "#c9a97a", "#7c5c3e"],
    previewMode: "horizontal",
    notes: "Everyday value blind with classic horizontal slat preview.",
  },
  {
    key: "faux-wood",
    label: '2" Faux Wood Blinds',
    category: "wood-blinds",
    defaultColors: ["#ffffff", "#f7efe3", "#d4a96a", "#3c1a0e"],
    previewMode: "horizontal",
    notes: "Style-led warm wood-look option.",
  },
  {
    key: "vertical",
    label: "Vertical Blinds",
    category: "vertical-blinds",
    defaultColors: ["#ffffff", "#fffff0", "#e8e0d0", "#9ca3af"],
    previewMode: "vertical",
    notes: "Large-opening coverage and sliding-door use case.",
  },
  {
    key: "blackout-roller",
    label: "Blackout Roller",
    category: "mini-blinds",
    defaultColors: ["#f6f2e9", "#d9d2c5", "#73737b", "#3f4046"],
    previewMode: "horizontal",
    notes: "Temporary placeholder category for stronger room darkening visualization.",
  },
] as const;
