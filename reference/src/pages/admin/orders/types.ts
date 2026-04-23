export interface OrderItem {
  id: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size: string;
}

export interface Order {
  id: string;
  date: string;
  status: string;
  total: number;
  items: OrderItem[];
  customer?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    companyName?: string;
    salesRep?: string;
  };
  trackingNumber?: string;
  fulfilledAt?: string;
  period?: string;
}

export interface ShippingLabel {
  id: string;
  orderId: string;
  customerName: string;
  createdAt: string;
  carrier: string;
  service: string;
  weight: string;
  dimensions: string;
  status: 'Pending' | 'Printed' | 'Voided';
  notes?: string;
  senderAddress: {
    name: string;
    company: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
  };
  recipientAddress: {
    name: string;
    company: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
  };
}
