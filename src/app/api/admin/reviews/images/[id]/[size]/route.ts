import { adminErrorResponse, requireAdmin } from "@/src/lib/auth/admin";
import { downloadReviewImage, parseImageRouteParams, reviewImageResponse } from "@/src/lib/review-images-storage";

// Admin preview of any submitted photo (pending/rejected/hidden included) for moderation.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string; size: string }> }) {
  try {
    const { serviceClient } = await requireAdmin();
    const { id, size } = await params;
    const parsed = parseImageRouteParams(id, size);
    if (!parsed) return new Response("Not found", { status: 404 });
    const { data, error } = await serviceClient.from("product_review_images").select("storage_path").eq("id", parsed.id).maybeSingle();
    if (error || !data) return new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });
    const blob = await downloadReviewImage(serviceClient, data.storage_path, parsed.size);
    return blob ? reviewImageResponse(blob, "private, no-store") : new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
