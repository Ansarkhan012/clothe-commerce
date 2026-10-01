import { adminErrorResponse, requireAdmin } from "@/src/lib/auth/admin";
import { processReviewImageDeletions } from "@/src/lib/review-images-storage";

// Removes Storage objects of review photos whose database rows no longer exist (discarded
// submissions, deleted products) and prunes uploads never confirmed within 24 hours.
// It never deletes a photo that still belongs to a review, whatever the review's status.
export async function POST() {
  try {
    const { serviceClient } = await requireAdmin();
    return Response.json(await processReviewImageDeletions(serviceClient));
  } catch (error) {
    return adminErrorResponse(error);
  }
}
