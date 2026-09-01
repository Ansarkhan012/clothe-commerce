import { CheckoutSchema, normalizeCheckoutItems } from "@/src/lib/validations/order";
import { createServiceClient } from "@/src/lib/supabase/service";
import { consumeRateLimit, getRequestIp } from "@/src/lib/security/rate-limit";

const MAX_BODY_BYTES = 32_768;

export async function POST(request: Request) {
  if (Number(request.headers.get("content-length") || "0") > MAX_BODY_BYTES) {
    return Response.json({ message: "Invalid checkout request" }, { status: 413 });
  }
  if (!consumeRateLimit(`checkout:${getRequestIp(request)}`, 10, 10 * 60_000)) {
    return Response.json({ message: "Too many requests" }, { status: 429 });
  }
  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return Response.json({ message: "Invalid checkout request" }, { status: 413 });
    }
    const parsed = CheckoutSchema.safeParse(JSON.parse(rawBody));
    if (!parsed.success) return Response.json({ message: "Invalid checkout request" }, { status: 400 });
    let items;
    try { items = normalizeCheckoutItems(parsed.data.items); }
    catch { return Response.json({ message: "Invalid checkout request" }, { status: 400 }); }

    const { data, error } = await createServiceClient().rpc("create_atomic_order", {
      p_customer_name: parsed.data.customer_name,
      p_email: parsed.data.email,
      p_phone_number: parsed.data.phone_number,
      p_delivery_address: parsed.data.delivery_address,
      p_address_line_2: parsed.data.address_line_2,
      p_area: parsed.data.area,
      p_city: parsed.data.city,
      p_province: parsed.data.province,
      p_postal_code: parsed.data.postal_code,
      p_delivery_notes: parsed.data.delivery_notes,
      p_payment_method: parsed.data.payment_method,
      p_idempotency_key: parsed.data.idempotency_key,
      p_items: items,
    });
    if (error || !data?.[0]) {
      const message = error?.message?.includes("OUT_OF_STOCK")
        ? "One or more items are out of stock"
        : error?.message?.includes("INVALID_PRODUCT") || error?.message?.includes("INVALID_VARIANT")
          ? "One or more items are unavailable" : "Unable to place order";
      return Response.json({ message }, { status: 400 });
    }
    return Response.json({ success: true,
      orderReference: data[0].public_order_id,
      total: data[0].total_amount,
      deliveryCharges: data[0].delivery_charges,
      paymentStatus: data[0].payment_status,
      orderStatus: data[0].order_status,
    });
  } catch {
    return Response.json({ message: "Invalid checkout request" }, { status: 400 });
  }
}
