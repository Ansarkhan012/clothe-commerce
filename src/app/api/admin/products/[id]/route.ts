import { z } from "zod";

import { AdminAuthorizationError, adminErrorResponse, requireAdmin } from "@/src/lib/auth/admin";
import { logServerDatabaseError } from "@/src/lib/errors/supabase-error";
import { ProductInputSchema } from "@/src/lib/validations/product";

const ProductActionSchema = z.object({ action: z.literal("archive") }).strict();

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

    const { data: deleted, error: deleteError } = await serviceClient.from("products").delete().eq("id", id).select("id").maybeSingle();
    if (deleteError) {
      logServerDatabaseError("Admin product delete failed", deleteError);
      if (deleteError.code === "23503") {
        return Response.json({ message: "This product is still referenced and cannot be deleted." }, { status: 409 });
      }
      return Response.json({ message: "The product could not be deleted. Please try again." }, { status: 500 });
    }
    if (!deleted) return Response.json({ message: "Product not found" }, { status: 404 });

    // Product image objects are intentionally retained: URL ownership is not
    // exclusive in the current schema, so deleting Storage objects is unsafe.
    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof AdminAuthorizationError) return adminErrorResponse(error);
    logServerDatabaseError("Admin product delete failed", error);
    return Response.json({ message: "The product could not be deleted. Please try again." }, { status: 500 });
  }
}
