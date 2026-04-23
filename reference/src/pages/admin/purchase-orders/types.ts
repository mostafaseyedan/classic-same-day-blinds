export type POStatus = 'Draft' | 'Pending Approval' | 'Approved' | 'Sent to Supplier' | 'Acknowledged' | 'In Production' | 'Shipped' | 'Partially Received' | 'Received' | 'Cancelled';
export type POPriority = 'Low' | 'Standard' | 'High' | 'Urgent';

export interface POLineItem {
  id: string;
  sku: string;
  name: string;
  description: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface POShipment {
  carrier: string;
  trackingNumber: string;
  estimatedDelivery: string;
  receivedQty: number;
  shippedAt: string;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  companyId?: string;   // originating company (B2B request)
  companyName?: string;
  requestedBy: string;
  status: POStatus;
  priority: POPriority;
  lineItems: POLineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  shippingCost: number;
  total: number;
  currency: string;
  paymentTerms: string;
  expectedDelivery: string;
  deliveryAddress: string;
  notes: string;
  internalNotes: string;
  shipment?: POShipment;
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
}
