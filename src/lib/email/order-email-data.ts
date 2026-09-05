import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

export type OrderEmailItem = {
  product_name: string;
  size: string | null;
  color: string | null;
  quantity: number;
  product_type: string;
  selling_unit: string | null;
  measurement_quantity: number | null;
  selection_details: { pieces?: number | null } | null;
  unit_price: number;
  line_total: number;
};

export type OrderEmailData = {
  id: string;
  public_order_id: string;
  customer_name: string;
  email: string;
  phone_number: string;
  delivery_address: string;
  address_line_2: string | null;
  area: string;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  delivery_notes: string | null;
  total_amount: number;
  delivery_charges: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  created_at: string;
  items: OrderEmailItem[];
};

export async function getOrderEmailData(client: SupabaseClient, orderId: string): Promise<OrderEmailData> {
  const { data: order, error: orderError } = await client.from("orders").select(
    "id,public_order_id,customer_name,email,phone_number,delivery_address,address_line_2,area,city,province,postal_code,delivery_notes,total_amount,delivery_charges,payment_method,payment_status,order_status,created_at",
  ).eq("id", orderId).single();
  if (orderError || !order?.email) throw new Error("ORDER_EMAIL_DATA_UNAVAILABLE");

  const { data: items, error: itemsError } = await client.from("order_items").select(
    "product_name,product_type,size,color,quantity,selling_unit,measurement_quantity,selection_details,unit_price,line_total,extended_line_total",
  ).eq("order_id", orderId).order("created_at", { ascending: true });
  if (itemsError) throw new Error("ORDER_EMAIL_ITEMS_UNAVAILABLE");

  return {
    ...order,
    total_amount: Number(order.total_amount),
    delivery_charges: Number(order.delivery_charges),
    items: (items ?? []).map((item) => ({
      ...item,
      quantity: Number(item.quantity),
      unit_price: Number(item.unit_price),
      line_total: Number(item.extended_line_total ?? item.line_total),
    })),
  } as OrderEmailData;
}
