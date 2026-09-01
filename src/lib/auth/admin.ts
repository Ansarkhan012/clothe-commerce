import "server-only";
import { createClient as createSessionClient } from "@/src/lib/supabase/server";
import { createServiceClient } from "@/src/lib/supabase/service";

export class AdminAuthorizationError extends Error {}

export async function requireAdmin() {
  const sessionClient = await createSessionClient();
  const { data: { user }, error } = await sessionClient.auth.getUser();
  if (error || !user) throw new AdminAuthorizationError("Unauthorized");
  const serviceClient = createServiceClient();
  const { data: profile, error: profileError } = await serviceClient
    .from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profileError || profile?.role !== "admin") throw new AdminAuthorizationError("Forbidden");
  return { user, serviceClient, sessionClient };
}

export function adminErrorResponse(error: unknown) {
  if (error instanceof AdminAuthorizationError) {
    return Response.json({ message: error.message }, {
      status: error.message === "Unauthorized" ? 401 : 403,
    });
  }
  console.error("Admin API operation failed");
  return Response.json({ message: "Operation failed" }, { status: 500 });
}
