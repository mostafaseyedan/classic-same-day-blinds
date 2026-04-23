export type SupplierStatus = 'Active' | 'Inactive' | 'On Hold' | 'Pending';
export type SupplierCategory = 'Manufacturer' | 'Distributor' | 'Wholesaler' | 'Raw Materials' | 'Services';
export type SupplierTier = 'Preferred' | 'Standard' | 'Probationary';

export interface SupplierContact {
  name: string;
  title: string;
  email: string;
  phone: string;
}

export interface SupplierProduct {
  sku: string;
  name: string;
  unitCost: number;
  leadTimeDays: number;
  minOrderQty: number;
}

export interface Supplier {
  id: string;
  name: string;
  category: SupplierCategory;
  tier: SupplierTier;
  status: SupplierStatus;
  website: string;
  taxId: string;
  paymentTerms: string;
  currency: string;
  primaryContact: SupplierContact;
  billingStreet: string;
  billingCity: string;
  billingState: string;
  billingZip: string;
  billingCountry: string;
  products: SupplierProduct[];
  notes: string;
  tags: string[];
  rating: number; // 1–5
  totalOrders: number;
  totalSpend: number;
  onTimeDeliveryRate: number; // 0–100
  defectRate: number; // 0–100
  createdAt: string;
  lastOrderAt: string;
}
