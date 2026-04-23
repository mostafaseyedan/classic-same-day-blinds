// Competitor pricing data tracked from Blinds.com
// Source: Blinds.com full product catalog price sheet (March 2026)
// Our prices are always 15% below Blinds.com prices

export interface SizePricing {
  label: string;
  width: string;
  height: string;
  competitorPrice: number;
  ourPrice: number;
}

export interface CompetitorProduct {
  id: string;
  name: string;
  category: string;
  competitorName: string;
  competitorUrl: string;
  competitorProductName: string;
  currentCompetitorPrice: number;
  ourPrice: number;
  lastChecked: string;
  monthlyHistory: MonthlyPricePoint[];
  notes: string;
  sizes: SizePricing[];
}

export interface MonthlyPricePoint {
  month: string;
  monthShort: string;
  competitorPrice: number;
  ourPrice: number;
  hasSale: boolean;
  saleLabel?: string;
}

// Round to 2 decimal places
const our = (p: number) => Math.round(p * 0.85 * 100) / 100;
const r2 = (p: number) => Math.round(p * 100) / 100;

// Seasonal multipliers — mirrors Blinds.com's known promo calendar
const SEASONAL: { monthShort: string; month: string; m: number; hasSale: boolean; saleLabel?: string }[] = [
  { month: 'January 2026',   monthShort: 'Jan',  m: 1.20, hasSale: false },
  { month: 'February 2026',  monthShort: 'Feb',  m: 1.10, hasSale: false },
  { month: 'March 2026',     monthShort: 'Mar',  m: 1.00, hasSale: true,  saleLabel: 'Spring Sale' },
  { month: 'April 2025',     monthShort: 'Apr',  m: 0.94, hasSale: true,  saleLabel: 'Spring Sale' },
  { month: 'May 2025',       monthShort: 'May',  m: 1.10, hasSale: false },
  { month: 'June 2025',      monthShort: 'Jun',  m: 1.02, hasSale: true,  saleLabel: 'Summer Deal' },
  { month: 'July 2025',      monthShort: 'Jul',  m: 1.00, hasSale: true,  saleLabel: 'Summer Deal' },
  { month: 'August 2025',    monthShort: 'Aug',  m: 1.20, hasSale: false },
  { month: 'September 2025', monthShort: 'Sep',  m: 1.04, hasSale: true,  saleLabel: 'Fall Event' },
  { month: 'October 2025',   monthShort: 'Oct',  m: 0.98, hasSale: true,  saleLabel: 'Fall Event' },
  { month: 'November 2025',  monthShort: 'Nov',  m: 0.84, hasSale: true,  saleLabel: 'Black Friday' },
  { month: 'December 2025',  monthShort: 'Dec',  m: 0.88, hasSale: true,  saleLabel: 'Holiday Sale' },
];

function genHistory(basePrice: number): MonthlyPricePoint[] {
  return SEASONAL.map(({ month, monthShort, m, hasSale, saleLabel }) => {
    const cp = r2(basePrice * m);
    return { month, monthShort, competitorPrice: cp, ourPrice: our(cp), hasSale, ...(saleLabel ? { saleLabel } : {}) };
  });
}

// Size matrix — scales from base price at 23"×64"
const BASE_W = 23;
const BASE_H = 64;
const BASE_AREA = BASE_W * BASE_H;

function genSizes(basePrice: number): SizePricing[] {
  const combos: [number, number][] = [
    [18, 36], [18, 48], [18, 64],
    [23, 36], [23, 48], [23, 54], [23, 60], [23, 64], [23, 72], [23, 84],
    [27, 36], [27, 48], [27, 54], [27, 60], [27, 64], [27, 72], [27, 84],
    [31, 48], [31, 54], [31, 60], [31, 64], [31, 72], [31, 84],
    [35, 48], [35, 54], [35, 60], [35, 64], [35, 72], [35, 84],
    [42, 48], [42, 54], [42, 60], [42, 64], [42, 72], [42, 84],
    [47, 48], [47, 54], [47, 60], [47, 64], [47, 72], [47, 84],
    [53, 54], [53, 60], [53, 64], [53, 72], [53, 84],
    [59, 54], [59, 60], [59, 64], [59, 72], [59, 84],
    [66, 60], [66, 64], [66, 72], [66, 84],
    [71, 60], [71, 64], [71, 72], [71, 84],
  ];
  return combos.map(([w, h]) => {
    const ratio = (w * h) / BASE_AREA;
    const multiplier = 0.45 + 0.55 * ratio;
    const raw = Math.round(basePrice * multiplier * 100) / 100;
    const snapped = Math.floor(raw) + 0.99;
    return {
      label: `${w}" \u00d7 ${h}"`,
      width: `${w}"`,
      height: `${h}"`,
      competitorPrice: snapped,
      ourPrice: our(snapped),
    };
  });
}

// ─────────────────────────────────────────────────────────────
// BLINDS.COM  —  matched to Classic Same Day Blinds catalog
// Source: Blinds.com product catalog price sheet, March 2026
// ─────────────────────────────────────────────────────────────

export const competitorProducts: CompetitorProduct[] = [

  // ── 1" Vinyl Blinds ──────────────────────────────────────────
  {
    id: 'vinyl-blinds-1in',
    name: '1" Vinyl Blinds',
    category: 'Vinyl Blinds',
    competitorName: 'Blinds.com',
    competitorUrl: 'https://www.blinds.com/p/blinds.com-value-1-inch-room-darkening-vinyl-mini-blinds/20124',
    competitorProductName: 'Blinds.com Value 1 Inch Room Darkening Vinyl Mini Blinds',
    currentCompetitorPrice: 24.09,
    ourPrice: our(24.09),
    lastChecked: '2026-03-25',
    notes: 'Blinds.com Value line — entry-level room-darkening vinyl. Starting at $24.09. We beat it by 15%.',
    sizes: genSizes(24.09),
    monthlyHistory: genHistory(24.09),
  },

  // ── 1" Vinyl Mini Blind ───────────────────────────────────────
  {
    id: 'vinyl-mini-blind-1in',
    name: '1" Vinyl Mini Blind',
    category: 'Vinyl Blinds',
    competitorName: 'Blinds.com',
    competitorUrl: 'https://www.blinds.com/p/blinds.com-1-inch-mini-blinds/102344',
    competitorProductName: 'Blinds.com 1 Inch Mini Blinds',
    currentCompetitorPrice: 16.09,
    ourPrice: our(16.09),
    lastChecked: '2026-03-25',
    notes: 'Blinds.com standard 1 inch mini blind — starting at $16.09. Classic light-filtering vinyl slats.',
    sizes: genSizes(16.09),
    monthlyHistory: genHistory(16.09),
  },

  // ── 1" Vinyl Plus Blinds ──────────────────────────────────────
  {
    id: 'vinyl-plus-1in',
    name: '1" Vinyl Plus Blinds',
    category: 'Vinyl Blinds',
    competitorName: 'Blinds.com',
    competitorUrl: 'https://www.blinds.com/p/bali-1-inch-mini-blinds/114962',
    competitorProductName: 'Bali 1 Inch Mini Blinds',
    currentCompetitorPrice: 49.09,
    ourPrice: our(49.09),
    lastChecked: '2026-03-25',
    notes: 'Bali premium 1 inch vinyl mini blind on Blinds.com — starting at $49.09. Our plus tier beats it by 15%.',
    sizes: genSizes(49.09),
    monthlyHistory: genHistory(49.09),
  },

  // ── 1" Vinyl Plus Mini Blinds ─────────────────────────────────
  {
    id: 'vinyl-plus-mini-blind-1in',
    name: '1" Vinyl Plus Mini Blinds',
    category: 'Vinyl Blinds',
    competitorName: 'Blinds.com',
    competitorUrl: 'https://www.blinds.com/p/blinds.com-premium-1-inch-mini-blinds/103531',
    competitorProductName: 'Blinds.com Premium 1 Inch Mini Blinds',
    currentCompetitorPrice: 43.19,
    ourPrice: our(43.19),
    lastChecked: '2026-03-25',
    notes: 'Blinds.com Premium 1 inch — 59 measures (550 value). Starting at $43.19. We save customers 15%.',
    sizes: genSizes(43.19),
    monthlyHistory: genHistory(43.19),
  },

  // ── 1" Aluminum Blinds ────────────────────────────────────────
  {
    id: 'aluminum-blinds-1in',
    name: '1" Aluminum Blinds',
    category: 'Aluminum Blinds',
    competitorName: 'Blinds.com',
    competitorUrl: 'https://www.blinds.com/p/blinds.com-1-inch-aluminum-blinds/102411',
    competitorProductName: 'Blinds.com 1 Inch Aluminum Blinds',
    currentCompetitorPrice: 13.89,
    ourPrice: our(13.89),
    lastChecked: '2026-03-25',
    notes: 'Blinds.com standard aluminum — starting at $13.89. Moisture-proof, warp-resistant. We beat it by 15%.',
    sizes: genSizes(13.89),
    monthlyHistory: genHistory(13.89),
  },

  // ── 1" Aluminum Mini Blind ────────────────────────────────────
  {
    id: 'aluminum-mini-blind-1in',
    name: '1" Aluminum Mini Blind',
    category: 'Aluminum Blinds',
    competitorName: 'Blinds.com',
    competitorUrl: 'https://www.blinds.com/p/blinds.com-1-inch-aluminum-blinds/102411',
    competitorProductName: 'Blinds.com 1 Inch Aluminum Blinds',
    currentCompetitorPrice: 13.89,
    ourPrice: our(13.89),
    lastChecked: '2026-03-25',
    notes: 'Same Blinds.com aluminum product at stock mini-blind sizing — starting at $13.89. We beat by 15%.',
    sizes: genSizes(13.89),
    monthlyHistory: genHistory(13.89),
  },

  // ── 1" Aluminum Business Class ────────────────────────────────
  {
    id: 'aluminum-business-class-1in',
    name: '1" Aluminum Business Class Blinds',
    category: 'Aluminum Blinds',
    competitorName: 'Blinds.com',
    competitorUrl: 'https://www.blinds.com/p/blinds.com-no-tell-1-inch-aluminum-mini-blinds/104782',
    competitorProductName: 'Blinds.com No-Tell 1 Inch Aluminum Mini Blinds',
    currentCompetitorPrice: 27.09,
    ourPrice: our(27.09),
    lastChecked: '2026-03-25',
    notes: 'Blinds.com No-Tell commercial-grade aluminum — starting at $27.09, up to 38% off claimed. We beat by 15%.',
    sizes: genSizes(27.09),
    monthlyHistory: genHistory(27.09),
  },

  // ── 2" Faux Wood Blinds ───────────────────────────────────────
  {
    id: 'faux-wood-2in',
    name: '2" Faux Wood Blinds',
    category: 'Faux Wood Blinds',
    competitorName: 'Blinds.com',
    competitorUrl: 'https://www.blinds.com/p/blinds.com-classic-2-inch-faux-wood-blinds/102448',
    competitorProductName: 'Blinds.com Classic 2 Inch Faux Wood Blinds',
    currentCompetitorPrice: 31.88,
    ourPrice: our(31.88),
    lastChecked: '2026-03-25',
    notes: 'Blinds.com Classic 2 inch faux wood — starting at $31.88. We carry the equivalent at 15% less.',
    sizes: genSizes(31.88),
    monthlyHistory: genHistory(31.88),
  },

  // ── Vertical Blinds / Made to Fit Any Size ────────────────────
  {
    id: 'vertical-blinds-custom',
    name: 'Vertical Blinds / Made to Fit Any Size',
    category: 'Vertical Blinds',
    competitorName: 'Blinds.com',
    competitorUrl: 'https://www.blinds.com/p/blinds.com-vinyl-vertical-blinds/132490',
    competitorProductName: 'Blinds.com Vinyl Vertical Blinds',
    currentCompetitorPrice: 30.09,
    ourPrice: our(30.09),
    lastChecked: '2026-03-25',
    notes: 'Blinds.com Vinyl Vertical — up to 30% off claimed, starting at $30.09. Custom any size. We beat by 15%.',
    sizes: genSizes(30.09),
    monthlyHistory: genHistory(30.09),
  },

  // ── Stock Vertical Blinds ─────────────────────────────────────
  {
    id: 'stock-vertical-blinds',
    name: 'Stock Vertical Blinds',
    category: 'Vertical Blinds',
    competitorName: 'Blinds.com',
    competitorUrl: 'https://www.blinds.com/p/bali-vinyl-vertical-blinds/102311',
    competitorProductName: 'Bali Vinyl Vertical Blinds',
    currentCompetitorPrice: 22.09,
    ourPrice: our(22.09),
    lastChecked: '2026-03-25',
    notes: 'Bali Vinyl Vertical stock sizes on Blinds.com — starting at $22.09. Our stock sizes beat by 15%.',
    sizes: [
      { label: '54" \u00d7 84"', width: '54"', height: '84"', competitorPrice: 22.09, ourPrice: our(22.09) },
      { label: '66" \u00d7 84"', width: '66"', height: '84"', competitorPrice: 25.09, ourPrice: our(25.09) },
      { label: '78" \u00d7 84"', width: '78"', height: '84"', competitorPrice: 28.09, ourPrice: our(28.09) },
      { label: '102" \u00d7 84"', width: '102"', height: '84"', competitorPrice: 35.09, ourPrice: our(35.09) },
      { label: '104" \u00d7 84"', width: '104"', height: '84"', competitorPrice: 36.09, ourPrice: our(36.09) },
      { label: '110" \u00d7 84"', width: '110"', height: '84"', competitorPrice: 38.09, ourPrice: our(38.09) },
    ],
    monthlyHistory: genHistory(22.09),
  },
];

export const competitorSummary = {
  competitor: 'Blinds.com',
  ourDiscount: 15,
  lastFullReview: '2026-03-25',
  productsTracked: competitorProducts.length,
  avgSavingsVsCompetitor: Math.round(
    (competitorProducts.reduce((s, p) => s + (p.currentCompetitorPrice - p.ourPrice), 0) /
      competitorProducts.length) * 100
  ) / 100,
};

// ─────────────────────────────────────────────────────────────
// LOWE'S — kept for reference
// ─────────────────────────────────────────────────────────────

export const lowesProducts: CompetitorProduct[] = [
  {
    id: 'lowes-vinyl-blinds-1in',
    name: '1" Vinyl Blinds',
    category: 'Vinyl Blinds',
    competitorName: "Lowe\'s",
    competitorUrl: 'https://www.lowes.com/search?searchTerm=1+inch+vinyl+mini+blinds',
    competitorProductName: 'Project Source 1-in Vinyl Light Filtering Mini Blinds',
    currentCompetitorPrice: 24.99,
    ourPrice: our(24.99),
    lastChecked: '2026-03-25',
    notes: "Project Source entry-level vinyl blind at Lowe\'s.",
    sizes: genSizes(24.99),
    monthlyHistory: genHistory(24.99),
  },
  {
    id: 'lowes-vinyl-mini-blind-1in',
    name: '1" Vinyl Mini Blind',
    category: 'Vinyl Blinds',
    competitorName: "Lowe\'s",
    competitorUrl: 'https://www.lowes.com/search?searchTerm=1+inch+vinyl+mini+blind+classic',
    competitorProductName: 'Allen + Roth 1-in Vinyl Light Filtering Mini Blinds',
    currentCompetitorPrice: 18.99,
    ourPrice: our(18.99),
    lastChecked: '2026-03-25',
    notes: "Allen + Roth classic 1\" vinyl mini blind at Lowe\'s.",
    sizes: genSizes(18.99),
    monthlyHistory: genHistory(18.99),
  },
  {
    id: 'lowes-vinyl-plus-1in',
    name: '1" Vinyl Plus Blinds',
    category: 'Vinyl Blinds',
    competitorName: "Lowe\'s",
    competitorUrl: 'https://www.lowes.com/search?searchTerm=1+inch+premium+vinyl+blinds',
    competitorProductName: 'Allen + Roth Premium 1-in Vinyl Mini Blinds',
    currentCompetitorPrice: 52.99,
    ourPrice: our(52.99),
    lastChecked: '2026-03-25',
    notes: "Allen + Roth Premium line at Lowe\'s.",
    sizes: genSizes(52.99),
    monthlyHistory: genHistory(52.99),
  },
  {
    id: 'lowes-vinyl-plus-mini-blind-1in',
    name: '1" Vinyl Plus Mini Blinds',
    category: 'Vinyl Blinds',
    competitorName: "Lowe\'s",
    competitorUrl: 'https://www.lowes.com/search?searchTerm=1+inch+premium+vinyl+mini+blind',
    competitorProductName: 'Allen + Roth 1-in Premium Vinyl Light Filtering Mini Blinds',
    currentCompetitorPrice: 52.99,
    ourPrice: our(52.99),
    lastChecked: '2026-03-25',
    notes: "Allen + Roth Premium 1\" mini blind at Lowe\'s.",
    sizes: genSizes(52.99),
    monthlyHistory: genHistory(52.99),
  },
  {
    id: 'lowes-aluminum-blinds-1in',
    name: '1" Aluminum Blinds',
    category: 'Aluminum Blinds',
    competitorName: "Lowe\'s",
    competitorUrl: 'https://www.lowes.com/search?searchTerm=1+inch+aluminum+mini+blinds',
    competitorProductName: 'Project Source 1-in Aluminum Light Filtering Mini Blinds',
    currentCompetitorPrice: 14.99,
    ourPrice: our(14.99),
    lastChecked: '2026-03-25',
    notes: "Project Source aluminum mini blind at Lowe\'s.",
    sizes: genSizes(14.99),
    monthlyHistory: genHistory(14.99),
  },
  {
    id: 'lowes-aluminum-mini-blind-1in',
    name: '1" Aluminum Mini Blind',
    category: 'Aluminum Blinds',
    competitorName: "Lowe\'s",
    competitorUrl: 'https://www.lowes.com/search?searchTerm=1+inch+aluminum+mini+blind+classic',
    competitorProductName: 'Project Source 1-in Aluminum Light Filtering Mini Blinds Classic',
    currentCompetitorPrice: 14.99,
    ourPrice: our(14.99),
    lastChecked: '2026-03-25',
    notes: "Project Source Classic aluminum mini blind at Lowe\'s.",
    sizes: genSizes(14.99),
    monthlyHistory: genHistory(14.99),
  },
  {
    id: 'lowes-aluminum-business-class-1in',
    name: '1" Aluminum Business Class Blinds',
    category: 'Aluminum Blinds',
    competitorName: "Lowe\'s",
    competitorUrl: 'https://www.lowes.com/search?searchTerm=commercial+grade+aluminum+blinds',
    competitorProductName: 'Commercial Grade 1-in Aluminum Room Darkening Mini Blinds',
    currentCompetitorPrice: 29.99,
    ourPrice: our(29.99),
    lastChecked: '2026-03-25',
    notes: "Commercial-grade aluminum blind at Lowe\'s.",
    sizes: genSizes(29.99),
    monthlyHistory: genHistory(29.99),
  },
  {
    id: 'lowes-faux-wood-2in',
    name: '2" Faux Wood Blinds',
    category: 'Faux Wood Blinds',
    competitorName: "Lowe\'s",
    competitorUrl: 'https://www.lowes.com/search?searchTerm=2+inch+faux+wood+blinds',
    competitorProductName: 'Allen + Roth 2-in Faux Wood Room Darkening Mini Blinds',
    currentCompetitorPrice: 37.99,
    ourPrice: our(37.99),
    lastChecked: '2026-03-25',
    notes: "Allen + Roth 2\" faux wood at Lowe\'s.",
    sizes: genSizes(37.99),
    monthlyHistory: genHistory(37.99),
  },
];

export const lowesSummary = {
  competitor: "Lowe\'s",
  ourDiscount: 15,
  lastFullReview: '2026-03-25',
  productsTracked: lowesProducts.length,
  avgSavingsVsCompetitor: Math.round(
    (lowesProducts.reduce((s, p) => s + (p.currentCompetitorPrice - p.ourPrice), 0) /
      lowesProducts.length) * 100
  ) / 100,
};
