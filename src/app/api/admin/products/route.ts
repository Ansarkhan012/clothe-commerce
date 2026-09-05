import { requireAdmin } from "@/src/lib/auth/admin";
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
    const text = await request.text();
    if (new TextEncoder().encode(text).byteLength > MAX_BODY) {
      return Response.json({ message: "Product payload is too large" }, { status: 413 });
    }

    let json: unknown;
    try { json = JSON.parse(text); }
    catch { return Response.json({ message: "Invalid product" }, { status: 400 }); }

    const parsed = ProductInputSchema.safeParse(json);
    if (!parsed.success) {
      return Response.json({ message: "Invalid product", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { serviceClient } = await requireAdmin();
    const { data, error } = await serviceClient.rpc("save_product", {
      p_product: parsed.data,
      p_product_id: null,
    });

    if (error) {
      logServerDatabaseError("Admin product create RPC failed", error);
      return databaseErrorResponse(error);
    }
    return Response.json({ id: data }, { status: 201 });
  } catch (error) {
    logServerDatabaseError("Admin product create failed", error);
    return Response.json({ message: "Unable to save product" }, { status: 500 });
  }
}
