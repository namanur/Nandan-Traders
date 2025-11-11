export interface Product {
  id: string;
  name: string;
  rate: number;
  unit: string;
  category: string;
  image: string;
}

export interface CartItem extends Product {
  qty: number;
}

export interface Order {
  orderId: string;
  timestamp: string;
  name: string;
  mobile: string;
  gst?: string;
  address?: string;
  items: CartItem[];
  grandTotal: number;
  notes?: string;
}

export interface PendingOrder {
  order: Order;
  attemptCount: number;
  lastAttempt: string | null;
}
