export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  category: string;
  color?: string;
  mount?: string;
  width?: string;
  height?: string;
}

export interface CheckoutForm {
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  notes: string;
  salesRep: string;
}

export interface PickupForm {
  pickupName: string;
  pickupPhone: string;
  pickupDate: string;
  pickupTime: string;
}

export interface QuoteForm {
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  notes: string;
}
