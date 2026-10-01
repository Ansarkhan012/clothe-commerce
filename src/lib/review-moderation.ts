// Admin review deletion (kept free of "server-only" so it can be unit-tested; callers must
// authorize first — see /api/admin/reviews/[id] DELETE, which requires an admin).
// Deletes exactly one product_reviews row by id, whatever its status. Its photo rows cascade and
// the existing trigger queues their Storage paths in review_image_deletions for cleanup; orders,
// order items, products and other reviews are never touched.
import type { SupabaseClient } from "@supabase/supabase-js";
import { isUuid } from "./validations/review-images.ts";

export type ReviewDeletion = "deleted" | "not_found" | "invalid";

export async function deleteReview(client: Pick<SupabaseClient, "from">, id: string): Promise<ReviewDeletion> {
  if (!isUuid(id)) return "invalid";
  const { data, error } = await client.from("product_reviews").delete().eq("id", id).select("id").maybeSingle();
  if (error) throw error;
  return data ? "deleted" : "not_found";
}
