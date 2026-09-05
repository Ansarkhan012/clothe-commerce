import type { CatalogCategory, CatalogColor, ProductDetails, ProductStatus, ProductType, ProductVariant } from "./product";

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
  updated_at?: string;
  slug?: string;
  product_type: ProductType;
  short_description?: string | null;
  category_id?: string | null;
  subcategory_id?: string | null;
  status?: ProductStatus;
  compare_at_price?: number | null;
  base_sku?: string | null;
  primary_color_id?: string | null;
  is_new?: boolean;
  is_active?: boolean;
  seo_title?: string | null;
  seo_description?: string | null;
  category_record?: CatalogCategory | null;
  primary_color?: CatalogColor | null;
  details?: ProductDetails | null;
  variants?: ProductVariant[];
  collection_ids?: string[];
  additional_colors?: CatalogColor[];
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
