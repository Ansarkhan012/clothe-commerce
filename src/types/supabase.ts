export interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  images: string[];
  sizes: string[];
  stock: number;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string | null;
  customer_name: string;
  phone_number: string;
  delivery_address: string;
  area: string;
  total_amount: number;
  payment_method: string;
  order_status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
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