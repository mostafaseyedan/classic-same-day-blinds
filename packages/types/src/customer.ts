export type CustomerOrderStatus =
  | "pending"
  | "working-on-order"
  | "fulfilled"
  | "shipped"
  | "out-for-delivery"
  | "delivered"
  | "cancelled";

export interface CustomerAddress {
  id: string;
  label: string;
  firstName: string;
  lastName: string;
  company?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  countryCode: string;
  phone?: string;
  isDefaultShipping?: boolean;
  isDefaultBilling?: boolean;
}

export interface CustomerProfileSummary {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  companyName?: string;
}

export interface CustomerOrderSummary {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: CustomerOrderStatus;
  total: number;
  currencyCode: string;
  itemCount: number;
  trackingNumber?: string;
}

export interface OrderTrackingSummary {
  orderNumber: string;
  email: string;
  status: CustomerOrderStatus;
  trackingNumber?: string;
  carrier?: string;
  estimatedDeliveryDate?: string;
}
