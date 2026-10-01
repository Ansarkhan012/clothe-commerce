import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isUuid, reviewImageObjectPaths, thumbPathFor } from "@/src/lib/validations/review-images";
import type { ProcessedReviewImage } from "@/src/lib/review-image-processing";

export const REVIEW_IMAGES_BUCKET = "review-images";

type CreatedImage = { id: string; storage_path: string; sort_order: number };

/** Uploads re-encoded photos to the database-generated paths. Never overwrites (upsert: false). */
export async function uploadReviewImages(client: SupabaseClient, reviewId: string, created: CreatedImage[], processed: ProcessedReviewImage[]) {
  const uploaded: string[] = [];
  try {
    for (const image of created) {
      const paths = reviewImageObjectPaths(reviewId, image.id);
      const source = processed[image.sort_order];
      if (!source || paths.full !== image.storage_path) throw new Error("REVIEW_IMAGE_PATH_MISMATCH");
      for (const [path, data] of [[paths.full, source.full], [paths.thumb, source.thumb]] as const) {
        const { error } = await client.storage.from(REVIEW_IMAGES_BUCKET).upload(path, data, { contentType: "image/webp", upsert: false, cacheControl: "31536000" });
        if (error) throw error;
        uploaded.push(path);
      }
    }
    return uploaded;
  } catch (error) {
    await removeReviewImageObjects(client, uploaded);
    throw error;
  }
}

/** Best-effort removal; failures are left in the deletion queue for the admin cleanup. */
export async function removeReviewImageObjects(client: SupabaseClient, paths: string[]) {
  if (!paths.length) return true;
  const { error } = await client.storage.from(REVIEW_IMAGES_BUCKET).remove(paths);
  return !error;
}

/** Downloads one rendition. Paths come from the database, never from the request. */
export async function downloadReviewImage(client: SupabaseClient, storagePath: string, size: "thumb" | "full") {
  const path = size === "thumb" ? thumbPathFor(storagePath) : storagePath;
  if (!path) return null;
  const { data, error } = await client.storage.from(REVIEW_IMAGES_BUCKET).download(path);
  return error || !data ? null : data;
}

export function reviewImageResponse(blob: Blob, cacheControl: string) {
  return new Response(blob, { headers: {
    "Content-Type": "image/webp", "Cache-Control": cacheControl, "X-Content-Type-Options": "nosniff",
    "Content-Disposition": "inline", "Content-Security-Policy": "default-src 'none'; sandbox",
  } });
}

export const parseImageRouteParams = (id: string, size: string) =>
  isUuid(id) && (size === "thumb" || size === "full") ? { id: id.toLowerCase(), size: size as "thumb" | "full" } : null;

/**
 * Orphan cleanup: prunes abandoned (unconfirmed > 24 h) photo rows, then removes queued Storage
 * objects (both renditions) for photos whose rows were deleted. Only queued paths are touched.
 */
export async function processReviewImageDeletions(client: SupabaseClient, limit = 100) {
  const { data: pruned, error: pruneError } = await client.rpc("prune_unconfirmed_review_images");
  if (pruneError) throw pruneError;
  const { data: queue, error } = await client.from("review_image_deletions").select("storage_path,attempts").order("queued_at").limit(limit);
  if (error) throw error;
  const rows = (queue ?? []) as { storage_path: string; attempts: number }[];
  const paths = rows.flatMap((row) => [row.storage_path, thumbPathFor(row.storage_path)].filter((path): path is string => Boolean(path)));
  if (!rows.length) return { pruned: Number(pruned ?? 0), removed: 0, failed: 0 };
  const { error: removeError } = await client.storage.from(REVIEW_IMAGES_BUCKET).remove(paths);
  if (removeError) {
    await Promise.all(rows.map((row) => client.from("review_image_deletions")
      .update({ attempts: row.attempts + 1, last_error: removeError.message.slice(0, 300) }).eq("storage_path", row.storage_path)));
    return { pruned: Number(pruned ?? 0), removed: 0, failed: rows.length };
  }
  const { error: deleteError } = await client.from("review_image_deletions").delete().in("storage_path", rows.map((row) => row.storage_path));
  if (deleteError) throw deleteError;
  return { pruned: Number(pruned ?? 0), removed: rows.length, failed: 0 };
}
