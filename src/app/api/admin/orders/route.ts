import { adminErrorResponse, requireAdmin } from "@/src/lib/auth/admin";

export async function GET(request: Request) {
  try {
    const { serviceClient } = await requireAdmin();
    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const pageSize = Math.min(50, Math.max(10, Number(url.searchParams.get("pageSize")) || 20));
    const status = url.searchParams.get("status");
    const paymentStatus = url.searchParams.get("paymentStatus");
    const paymentMethod = url.searchParams.get("paymentMethod");
    const search = url.searchParams.get("search")?.trim();
    const fromDate = url.searchParams.get("from");
    const toDate = url.searchParams.get("to");
    let query = serviceClient.from("orders").select(
      "id,public_order_id,customer_name,email,phone_number,created_at,total_amount,delivery_charges,payment_method,payment_status,order_status,items",
      { count: "exact" },
    );
    if (status) query = query.eq("order_status", status);
    if (paymentStatus) query = query.eq("payment_status", paymentStatus);
    if (paymentMethod) query = query.eq("payment_method", paymentMethod);
    if (fromDate) query = query.gte("created_at", `${fromDate}T00:00:00.000Z`);
    if (toDate) query = query.lte("created_at", `${toDate}T23:59:59.999Z`);
    if (search) query = query.or(`public_order_id.ilike.%${search.replace(/[%(),]/g, "")}%,phone_number.ilike.%${search.replace(/[%(),]/g, "")}%`);
    const ascending = url.searchParams.get("sort") === "oldest";
    const from = (page - 1) * pageSize;
    const { data, error, count } = await query.order("created_at", { ascending }).range(from, from + pageSize - 1);
    if (error) throw error;
    return Response.json({ orders: data ?? [], count: count ?? 0, page, pageSize });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
