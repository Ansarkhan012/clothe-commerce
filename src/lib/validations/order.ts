import { z } from "zod";
import { pakistanProvinces } from "../../config/business.ts";

export const MAX_CART_LINES = 30;
export const MAX_QUANTITY_PER_ITEM = 20;

export const PakistaniPhoneSchema = z.string().trim().min(11).max(16)
  .transform((value) => value.replace(/[\s()+-]/g, ""))
  .refine((value) => /^03\d{9}$/.test(value), "Invalid Pakistani phone number");

export const CheckoutItemSchema = z.object({
  product_id: z.string().uuid(),
  variant_id: z.string().uuid().nullable().optional(),
  size: z.enum(["XS", "S", "M", "L", "XL", "XXL"]).optional(),
  selling_unit: z.enum(["meter", "yard"]).optional(),
  quantity: z.number().positive().max(1000),
}).strict().superRefine((item,ctx)=>{if(!item.selling_unit&&(!Number.isInteger(item.quantity)||item.quantity>MAX_QUANTITY_PER_ITEM))ctx.addIssue({code:"custom",message:"Quantity must be a whole number from 1 to 20",path:["quantity"]});});

export const CheckoutSchema = z.object({
  customer_name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  phone_number: PakistaniPhoneSchema,
  delivery_address: z.string().trim().min(10).max(500),
  address_line_2: z.string().trim().max(200).default(""),
  area: z.string().trim().min(2).max(100),
  city: z.string().trim().min(2).max(100),
  province: z.enum(pakistanProvinces),
  postal_code: z.string().trim().max(20).default(""),
  delivery_notes: z.string().trim().max(500).default(""),
  payment_method: z.literal("cod"),
  idempotency_key: z.string().uuid(),
  items: z.array(CheckoutItemSchema).min(1).max(MAX_CART_LINES),
}).strict();

export const TrackOrderSchema = z.object({
  public_order_id: z.string().trim().toUpperCase().regex(/^QZF-[A-F0-9]{12}$/),
  phone_number: PakistaniPhoneSchema,
}).strict();

export const OrderStatusSchema = z.enum([
  "pending", "confirmed", "processing", "packed", "ready_to_ship", "shipped",
  "out_for_delivery", "delivered", "cancel_requested", "cancelled",
  "return_requested", "returned", "refund_pending", "refunded", "failed",
]);

export const AdminOrderUpdateSchema = z.object({
  status: OrderStatusSchema,
  note: z.string().trim().max(500).optional(),
  courier_name: z.string().trim().max(100).optional(),
  courier_tracking_number: z.string().trim().max(120).optional(),
  payment_status: z.enum(["pending", "unpaid", "paid", "failed", "refunded", "partially_refunded"]).optional(),
}).strict();

export type CheckoutFormData = z.infer<typeof CheckoutSchema>;
export type CheckoutItem = z.infer<typeof CheckoutItemSchema>;

export function normalizeCheckoutItems(items: CheckoutItem[]): CheckoutItem[] {
  const normalized = new Map<string, CheckoutItem>();
  for (const item of items) {
    const key = `${item.product_id}:${item.variant_id ?? item.size ?? "base"}`;
    const quantity = (normalized.get(key)?.quantity ?? 0) + item.quantity;
    if (!item.selling_unit && quantity > MAX_QUANTITY_PER_ITEM) {
      throw new Error("Combined item quantity exceeds the allowed maximum");
    }
    normalized.set(key, { ...item, quantity });
  }
  return [...normalized.values()];
}
