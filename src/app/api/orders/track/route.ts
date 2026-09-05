import { TrackOrderSchema } from "@/src/lib/validations/order";
import { createServiceClient } from "@/src/lib/supabase/service";
import { consumeRateLimit, getRequestIp } from "@/src/lib/security/rate-limit";

export async function POST(request: Request) {
  if (!await consumeRateLimit(`track:${getRequestIp(request)}`, 8, 10 * 60_000)) {
    return Response.json({ message: "Order not found" }, { status: 404 });
  }
  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > 1_024) throw new Error();
    const parsed = TrackOrderSchema.safeParse(JSON.parse(rawBody));
    if (!parsed.success) throw new Error();
    const supabase = createServiceClient();
    const { data: order } = await supabase.from("orders")
      .select("id, public_order_id, order_status, payment_method, payment_status, total_amount, created_at, courier_name, courier_tracking_number")
      .ilike("public_order_id", parsed.data.public_order_id)
      .eq("phone_number", parsed.data.phone_number).maybeSingle();
    if (!order) throw new Error();
    const { data: items } = await supabase.from("order_items")
      .select("product_name, product_type, unit_price, quantity, selling_unit, measurement_quantity, selection_details, size, color, image, line_total, extended_line_total")
      .eq("order_id", order.id).order("created_at", { ascending: true });
    const { data: history } = await supabase.from("order_status_history")
      .select("new_status, created_at").eq("order_id", order.id)
      .order("created_at", { ascending: true });
    return Response.json({ order: { public_order_id: order.public_order_id,
      order_status: order.order_status, total_amount: order.total_amount,
      payment_method: order.payment_method, payment_status: order.payment_status,
      courier_name: order.courier_name, courier_tracking_number: order.courier_tracking_number,
      created_at: order.created_at, items: (items ?? []).map((item) => ({ ...item,
        line_total: item.extended_line_total ?? item.line_total })), history: history ?? [] } });
  } catch {
    return Response.json({ message: "Order not found" }, { status: 404 });
  }
}
