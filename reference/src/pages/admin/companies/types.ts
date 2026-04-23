export type CompanyType = 'Wholesale' | 'Business' | 'Contractor' | 'Retail';
export type CompanyTier = 'Bronze' | 'Silver' | 'Gold' | 'Diamond';
export type CompanyStatus = 'Active' | 'Inactive' | 'Prospect';
export type CreditTerms = 'Net-15' | 'Net-30' | 'Net-45' | 'Net-60' | 'Prepay' | 'COD';

export interface Company {
  id: string;
  name: string;
  industry: string;
  type: CompanyType;
  tier: CompanyTier;
  status: CompanyStatus;
  primaryContact: string;
  email: string;
  phone: string;
  website: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  creditTerms: CreditTerms;
  creditLimit: number;
  outstandingBalance: number;
  discount: number;
  taxExempt: boolean;
  taxExemptId: string;
  accountManager: string;
  notes: string;
  tags: string[];
  createdAt: string;
  customerIds: string[];
  annualRevenue: number;
}

export const SEED_COMPANIES: Company[] = [
  {
    id: 'COMP-001', name: 'Johnson Interiors', industry: 'Interior Design', type: 'Business', tier: 'Gold',
    status: 'Active', primaryContact: 'Sarah Johnson', email: 'sarah.johnson@example.com', phone: '(424) 555-0183',
    website: 'www.johnsoninteriors.com', street: '2200 Beverly Glen Blvd', city: 'Los Angeles', state: 'CA',
    zip: '90077', country: 'US', creditTerms: 'Net-30', creditLimit: 250000, outstandingBalance: 62400,
    discount: 8, taxExempt: true, taxExemptId: 'CA-EXEMPT-44821', accountManager: 'Holly Price',
    notes: 'Premier bulk buyer. Always orders 1,000+ units. Flagship LA account.',
    tags: ['bulk-buyer', 'vip', 'repeat', 'flagship'], createdAt: new Date(Date.now() - 365 * 86400000 * 2).toISOString(),
    customerIds: ['CUST-00001'], annualRevenue: 574672,
  },
  {
    id: 'COMP-002', name: 'DesignHaus Studio', industry: 'Architecture & Design', type: 'Wholesale', tier: 'Diamond',
    status: 'Active', primaryContact: 'James MacAllister', email: 'james.mac@designhaus.com', phone: '(617) 555-0090',
    website: 'www.designhaus.com', street: '900 Commonwealth Ave', city: 'Boston', state: 'MA',
    zip: '02215', country: 'US', creditTerms: 'Net-60', creditLimit: 500000, outstandingBalance: 96000,
    discount: 12, taxExempt: true, taxExemptId: 'MA-EXEMPT-91024', accountManager: 'Holly Price',
    notes: 'Wholesale account with fixed 12% discount. Key account — priority fulfillment.',
    tags: ['wholesale', 'key-account', 'vip', 'priority'], createdAt: new Date(Date.now() - 730 * 86400000).toISOString(),
    customerIds: ['CUST-00006'], annualRevenue: 960400,
  },
  {
    id: 'COMP-003', name: 'Rivera Renovations', industry: 'General Contracting', type: 'Contractor', tier: 'Silver',
    status: 'Active', primaryContact: 'Marcus Rivera', email: 'marcus.rivera@example.com', phone: '(310) 555-0192',
    website: '', street: '8820 Sunset Blvd', city: 'West Hollywood', state: 'CA',
    zip: '90069', country: 'US', creditTerms: 'Net-30', creditLimit: 80000, outstandingBalance: 18500,
    discount: 5, taxExempt: false, taxExemptId: '', accountManager: 'Tom Ward',
    notes: 'Seasonal orders — heavy spring demand. Referred by Johnson Interiors.',
    tags: ['contractor', 'seasonal', 'referral'], createdAt: new Date(Date.now() - 280 * 86400000).toISOString(),
    customerIds: ['CUST-00003'], annualRevenue: 187600,
  },
  {
    id: 'COMP-004', name: 'BuildRight Contracting', industry: 'Commercial Construction', type: 'Contractor', tier: 'Gold',
    status: 'Active', primaryContact: 'Carlos Espinoza', email: 'carlos@buildright.co', phone: '(305) 555-0203',
    website: 'www.buildright.co', street: '101 Brickell Ave', city: 'Miami', state: 'FL',
    zip: '33131', country: 'US', creditTerms: 'Net-45', creditLimit: 200000, outstandingBalance: 31200,
    discount: 7, taxExempt: false, taxExemptId: '', accountManager: 'Tom Ward',
    notes: 'Top FL contractor. Refers others. Always early payer — consider credit limit increase.',
    tags: ['contractor', 'vip', 'referrer', 'early-payer'], createdAt: new Date(Date.now() - 900 * 86400000).toISOString(),
    customerIds: ['CUST-00010'], annualRevenue: 409000,
  },
  {
    id: 'COMP-005', name: 'LuxSpaces Hawaii', industry: 'Hospitality', type: 'Wholesale', tier: 'Silver',
    status: 'Active', primaryContact: 'Linda Nakamura', email: 'linda.n@luxspaces.net', phone: '(808) 555-0055',
    website: 'www.luxspaces.net', street: '1600 Kapiolani Blvd', city: 'Honolulu', state: 'HI',
    zip: '96814', country: 'US', creditTerms: 'Net-30', creditLimit: 150000, outstandingBalance: 22400,
    discount: 6, taxExempt: true, taxExemptId: 'HI-EXEMPT-28301', accountManager: 'Holly Price',
    notes: 'Manages 3 luxury resorts. Special packaging required for all orders.',
    tags: ['hospitality', 'wholesale', 'special-packaging'], createdAt: new Date(Date.now() - 610 * 86400000).toISOString(),
    customerIds: ['CUST-00009'], annualRevenue: 320000,
  },
  {
    id: 'COMP-006', name: 'Chen Window Works', industry: 'Window Installation', type: 'Contractor', tier: 'Bronze',
    status: 'Active', primaryContact: 'Emily Chen', email: 'emily.chen@example.com', phone: '(310) 555-0261',
    website: '', street: '1100 Glendon Ave', city: 'Los Angeles', state: 'CA',
    zip: '90024', country: 'US', creditTerms: 'Net-15', creditLimit: 50000, outstandingBalance: 8700,
    discount: 3, taxExempt: false, taxExemptId: '', accountManager: 'Tom Ward',
    notes: 'Specializes in commercial installations. Interested in volume pricing — nurture to Silver.',
    tags: ['commercial', 'volume-pricing', 'nurture'], createdAt: new Date(Date.now() - 320 * 86400000).toISOString(),
    customerIds: ['CUST-00005'], annualRevenue: 98400,
  },
  {
    id: 'COMP-007', name: 'Nguyen Design Co.', industry: 'Interior Design', type: 'Business', tier: 'Silver',
    status: 'Active', primaryContact: 'David Nguyen', email: 'david.nguyen@example.com', phone: '(323) 555-0147',
    website: '', street: '4501 Wilshire Blvd', city: 'Los Angeles', state: 'CA',
    zip: '90010', country: 'US', creditTerms: 'Net-30', creditLimit: 100000, outstandingBalance: 15600,
    discount: 4, taxExempt: false, taxExemptId: '', accountManager: 'Holly Price',
    notes: 'Custom sizes always. Net-30 payer, consistent and reliable.',
    tags: ['interior-designer', 'net-30', 'custom-orders'], createdAt: new Date(Date.now() - 400 * 86400000).toISOString(),
    customerIds: ['CUST-00002'], annualRevenue: 247000,
  },
  {
    id: 'COMP-008', name: 'Kim Architecture', industry: 'Architecture', type: 'Business', tier: 'Bronze',
    status: 'Inactive', primaryContact: 'Robert Kim', email: 'robert.kim@kimarch.com', phone: '(206) 555-0118',
    website: 'www.kimarch.com', street: '1000 2nd Ave', city: 'Seattle', state: 'WA',
    zip: '98104', country: 'US', creditTerms: 'Net-30', creditLimit: 40000, outstandingBalance: 0,
    discount: 2, taxExempt: false, taxExemptId: '', accountManager: 'Tom Ward',
    notes: 'Went quiet after last project. Follow up Q2. Had good project volume before.',
    tags: ['follow-up', 'architect', 'reactivation-target'], createdAt: new Date(Date.now() - 500 * 86400000).toISOString(),
    customerIds: ['CUST-00008'], annualRevenue: 62000,
  },
  {
    id: 'COMP-009', name: 'Okonkwo Design Group', industry: 'Luxury Residential', type: 'Business', tier: 'Silver',
    status: 'Active', primaryContact: 'Derek Okonkwo', email: 'derek@okonkwo-design.com', phone: '(212) 555-0039',
    website: 'www.okonkwo-design.com', street: '350 5th Ave', city: 'New York', state: 'NY',
    zip: '10118', country: 'US', creditTerms: 'Net-45', creditLimit: 120000, outstandingBalance: 28400,
    discount: 5, taxExempt: false, taxExemptId: '', accountManager: 'Holly Price',
    notes: 'High-end residential in Manhattan and Brooklyn. White-glove delivery required.',
    tags: ['high-end', 'white-glove', 'nyc', 'luxury'], createdAt: new Date(Date.now() - 130 * 86400000).toISOString(),
    customerIds: ['CUST-00012'], annualRevenue: 198000,
  },
  {
    id: 'COMP-010', name: 'Patel Home Solutions', industry: 'Home Improvement', type: 'Business', tier: 'Bronze',
    status: 'Active', primaryContact: 'Priya Patel', email: 'priya.patel@example.com', phone: '(213) 555-0031',
    website: '', street: '650 S Grand Ave', city: 'Los Angeles', state: 'CA',
    zip: '90017', country: 'US', creditTerms: 'COD', creditLimit: 25000, outstandingBalance: 0,
    discount: 2, taxExempt: false, taxExemptId: '', accountManager: 'Tom Ward',
    notes: 'Growing account. Currently COD — consider extending Net-15 after next 3 orders.',
    tags: ['growing', 'cod', 'promotion-candidate'], createdAt: new Date(Date.now() - 180 * 86400000).toISOString(),
    customerIds: ['CUST-00004'], annualRevenue: 74000,
  },
];
