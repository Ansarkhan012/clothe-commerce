import { adminErrorResponse, requireAdmin } from "@/src/lib/auth/admin";
import { AdminOrderUpdateSchema } from "@/src/lib/validations/order";

type Context = { params: Promise<{ id: string }> };
export async function GET(_request: Request, context: Context) {
  try {
    const { serviceClient } = await requireAdmin();
    const { id } = await context.params;
    const { data: order, error } = await serviceClient.from("orders").select("*").eq("id", id).single();
    if (error) return Response.json({ message: "Order not found" }, { status: 404 });
    const [{ data: items }, { data: history }] = await Promise.all([
      serviceClient.from("order_items").select("*").eq("order_id", id).order("created_at"),
      serviceClient.from("order_status_history").select("id,old_status,new_status,note,changed_by,created_at").eq("order_id", id).order("created_at"),
    ]);
    return Response.json({ order, items: items ?? [], history: history ?? [] });
  } catch (error) { return adminErrorResponse(error); }
}

export async function PATCH(request: Request, context: Context) {
  try {
    const { sessionClient } = await requireAdmin();
    const { id } = await context.params;
    const parsed = AdminOrderUpdateSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ message: "Invalid order update" }, { status: 400 });
    const { data, error } = await sessionClient.rpc("update_order_status", {
      p_order_id: id, p_new_status: parsed.data.status,
      p_note: parsed.data.note ?? null,
      p_courier_name: parsed.data.courier_name ?? null,
      p_courier_tracking_number: parsed.data.courier_tracking_number ?? null,
      p_payment_status: parsed.data.payment_status ?? null,
    });
    if (error) return Response.json({ message: error.message.includes("INVALID_TRANSITION") ? "Invalid status transition" : "Unable to update order" }, { status: 400 });
    return Response.json({ order: data });
  } catch (error) { return adminErrorResponse(error); }
}
