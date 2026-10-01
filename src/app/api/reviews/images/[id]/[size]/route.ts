import { downloadReviewImage, parseImageRouteParams, reviewImageResponse } from "@/src/lib/review-images-storage";
import { createServiceClient } from "@/src/lib/supabase/service";

const notFound = () => new Response("Not found", { status: 404, headers: { "Cache-Control": "public, max-age=60" } });

// Serves a review photo only while its review is approved, its product is active and the upload
// was confirmed (checked in the database on every cache miss). Pending, rejected and hidden
// photos return 404. Short shared caching keeps moderation changes effective within minutes.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string; size: string }> }) {
  const { id, size } = await params;
  const parsed = parseImageRouteParams(id, size);
  if (!parsed) return notFound();
  try {
    const client = createServiceClient();
    const { data, error } = await client.rpc("get_public_review_image", { p_image_id: parsed.id });
    const row = Array.isArray(data) ? data[0] : data;
    if (error || !row?.storage_path) return notFound();
    const blob = await downloadReviewImage(client, row.storage_path, parsed.size);
    return blob ? reviewImageResponse(blob, "public, max-age=300, s-maxage=300, stale-while-revalidate=60") : notFound();
  } catch {
    return new Response("Unavailable", { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
