import { revalidateTag } from "next/cache";
import { z } from "zod";
import { adminErrorResponse, requireAdmin } from "@/src/lib/auth/admin";
import { REVIEWS_CACHE_TAG } from "@/src/lib/reviews";
import { deleteReview } from "@/src/lib/review-moderation";
import { processReviewImageDeletions } from "@/src/lib/review-images-storage";
import { ReviewModerationSchema } from "@/src/lib/validations/review";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, serviceClient } = await requireAdmin();
    const { id } = await params;
    if (!z.string().uuid().safeParse(id).success) return Response.json({ message: "Invalid review" }, { status: 400 });
    const parsed = ReviewModerationSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return Response.json({ message: "Invalid moderation action" }, { status: 400 });

    const now = new Date().toISOString();
    const { data, error } = await serviceClient.from("product_reviews")
      .update({ status: parsed.data.status, moderation_note: parsed.data.note || null, moderated_by: user.id, moderated_at: now, updated_at: now })
      .eq("id", id).select("id,status").maybeSingle();
    if (error) throw error;
    if (!data) return Response.json({ message: "Review not found" }, { status: 404 });
    // Approved-only aggregates and lists must reflect moderation on the next request.
    revalidateTag(REVIEWS_CACHE_TAG, { expire: 0 });
    return Response.json({ review: data });
  } catch (error) {
    return adminErrorResponse(error);
  }
}

// Permanent deletion (any status). Admin only; one review per request, no bulk delete.
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { serviceClient } = await requireAdmin();
    const { id } = await params;
    const result = await deleteReview(serviceClient, id);
    if (result === "invalid") return Response.json({ message: "Invalid review" }, { status: 400 });
    if (result === "not_found") return Response.json({ message: "Review not found" }, { status: 404 });
    // Product lists, summaries and the homepage feed drop the review on the next request.
    revalidateTag(REVIEWS_CACHE_TAG, { expire: 0 });
    // Photo rows were cascade-deleted and their paths queued by the database trigger; remove the
    // queued Storage files now through the existing cleanup. On failure they stay queued for the
    // admin "Clean up orphaned review photos" action.
    try { await processReviewImageDeletions(serviceClient); } catch { console.error("Review photo cleanup deferred"); }
    return Response.json({ deleted: true });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
