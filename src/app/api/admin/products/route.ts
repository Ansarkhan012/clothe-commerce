import { revalidateTag } from "next/cache";
import { AdminAuthorizationError, adminErrorResponse, requireAdmin } from "@/src/lib/auth/admin";
import { logServerDatabaseError } from "@/src/lib/errors/supabase-error";
import { ProductInputSchema } from "@/src/lib/validations/product";

const MAX_BODY = 100_000;
type DatabaseError = { code?: string; message?: string };

function databaseErrorResponse(error: DatabaseError) {
  if (error.code === "23505") {
    return Response.json({ message: "The product slug or a variant SKU is already in use" }, { status: 409 });
  }
  if (error.code === "23503" || error.message?.includes("INVALID_") || error.message?.includes("VARIANT")) {
    return Response.json({ message: "One or more product references or variants are invalid" }, { status: 400 });
  }
  return Response.json({ message: "Unable to save product" }, { status: 500 });
}

export async function POST(request: Request) {
  try {
    const { serviceClient } = await requireAdmin();
    const text = await request.text();
    if (new TextEncoder().encode(text).byteLength > MAX_BODY) {
      return Response.json({ message: "Product payload is too large" }, { status: 413 });
    }

    let json: unknown;
    try { json = JSON.parse(text); }
    catch { return Response.json({ message: "Invalid product" }, { status: 400 }); }

    const parsed = ProductInputSchema.safeParse(json);
    if (!parsed.success) {
      const issues = parsed.error.flatten().fieldErrors;
      return Response.json({ message: parsed.error.issues[0]?.message ?? "Invalid product", issues }, { status: 400 });
    }

    const { data, error } = await serviceClient.rpc("save_product", {
      p_product: parsed.data,
      p_product_id: null,
    });

    if (error) {
      logServerDatabaseError("Admin product create RPC failed", error);
      return databaseErrorResponse(error);
    }
    // Storefront catalog caches (tag "products") must not keep serving the old product.
    revalidateTag("products", { expire: 0 });
    return Response.json({ id: data }, { status: 201 });
  } catch (error) {
    if (error instanceof AdminAuthorizationError) return adminErrorResponse(error);
    logServerDatabaseError("Admin product create failed", error);
    return Response.json({ message: "Unable to save product" }, { status: 500 });
  }
}
