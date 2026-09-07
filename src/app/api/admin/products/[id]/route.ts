import { z } from "zod";

import { requireAdmin } from "@/src/lib/auth/admin";
import { logServerDatabaseError } from "@/src/lib/errors/supabase-error";
import { ProductInputSchema } from "@/src/lib/validations/product";

const ProductActionSchema = z.object({ action: z.literal("archive") }).strict();

async function hasOrderHistory(serviceClient: Awaited<ReturnType<typeof requireAdmin>>["serviceClient"], productId: string) {
  const [orderItems, legacyOrders] = await Promise.all([
    serviceClient.from("order_items").select("id", { count: "exact", head: true }).eq("product_id", productId),
    serviceClient.from("orders").select("id", { count: "exact", head: true }).contains("items", [{ product_id: productId }]),
  ]);

  if (orderItems.error) throw orderItems.error;
  if (legacyOrders.error) throw legacyOrders.error;
  return (orderItems.count ?? 0) > 0 || (legacyOrders.count ?? 0) > 0;
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!z.string().uuid().safeParse(id).success) return Response.json({ message: "Invalid product" }, { status: 400 });
    const parsed = ProductInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      const issues = parsed.error.flatten().fieldErrors;
      return Response.json({ message: issues.variants?.[0] ?? "Invalid product", issues }, { status: 400 });
    }
    const { serviceClient } = await requireAdmin();
    const { data, error } = await serviceClient.rpc("save_product", { p_product: parsed.data, p_product_id: id });
    if (error) {
      if (error.code === "23505") return Response.json({ message: "The product slug or a variant SKU is already in use" }, { status: 409 });
      if (error.message.includes("PRODUCT_TYPE_LOCKED")) return Response.json({ message: "Product type cannot change after variants or orders exist" }, { status: 409 });
      throw error;
    }
    return Response.json({ id: data });
  } catch (error) {
    logServerDatabaseError("Admin product update failed", error);
    return Response.json({ message: "Unable to save product" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!z.string().uuid().safeParse(id).success) return Response.json({ message: "Invalid product" }, { status: 400 });
    const parsed = ProductActionSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ message: "Invalid product action" }, { status: 400 });

    const { serviceClient } = await requireAdmin();
    const { data, error } = await serviceClient
      .from("products")
      .update({ status: "archived", is_active: false, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data) return Response.json({ message: "Product not found" }, { status: 404 });
    return Response.json({ success: true });
  } catch (error) {
    logServerDatabaseError("Admin product archive failed", error);
    return Response.json({ message: "Unable to archive product" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!z.string().uuid().safeParse(id).success) return Response.json({ message: "Invalid product" }, { status: 400 });

    const { serviceClient } = await requireAdmin();
    const { data: product, error: productError } = await serviceClient.from("products").select("id").eq("id", id).maybeSingle();
    if (productError) throw productError;
    if (!product) return Response.json({ message: "Product not found" }, { status: 404 });

    if (await hasOrderHistory(serviceClient, id)) {
      return Response.json({ message: "This product belongs to order history and cannot be permanently deleted.", referenced: true }, { status: 409 });
    }

    // Deactivate first so a new checkout cannot reference the product between the
    // history check and deletion. A second check covers an already-running order.
    const { error: deactivateError } = await serviceClient
      .from("products")
      .update({ status: "archived", is_active: false, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (deactivateError) throw deactivateError;

    if (await hasOrderHistory(serviceClient, id)) {
      return Response.json({ message: "This product was archived because it is now part of order history.", referenced: true }, { status: 409 });
    }

    const { data: deleted, error: deleteError } = await serviceClient.from("products").delete().eq("id", id).select("id").maybeSingle();
    if (deleteError) throw deleteError;
    if (!deleted) return Response.json({ message: "Product not found" }, { status: 404 });

    // Product image objects are intentionally retained: URL ownership is not
    // exclusive in the current schema, so deleting Storage objects is unsafe.
    return Response.json({ success: true });
  } catch (error) {
    logServerDatabaseError("Admin product delete failed", error);
    return Response.json({ message: "Unable to delete product" }, { status: 500 });
  }
}
