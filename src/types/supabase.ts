export interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  category: string;
  featured: boolean;
  images: string[];
  sizes: string[];
  stock: number;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string | null;
  order_number: number;
  public_order_id: string;
  customer_name: string;
  email: string | null;
  phone_number: string;
  delivery_address: string;
  area: string;
  city: string | null;
  province: string | null;
  total_amount: number;
  payment_method: string;
  payment_status: 'pending' | 'unpaid' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
  order_status: 'pending' | 'confirmed' | 'processing' | 'packed' | 'ready_to_ship' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancel_requested' | 'cancelled' | 'return_requested' | 'returned' | 'refund_pending' | 'refunded' | 'failed';
  items: OrderItem[];
  created_at: string;
}

export interface OrderItem {
  product_id: string;
  size: string;
  quantity: number;
  price_at_time: number;
  title?: string;
}
