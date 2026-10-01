import "server-only";
import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { REVIEW_POLICY } from "@/src/lib/validations/review";

export const REVIEWS_CACHE_TAG = "reviews";

export type PublicReviewImage = { id: string; width: number; height: number };
export type PublicReview = { id: string; rating: number; title: string | null; body: string; display_name: string; verified_purchase: boolean; created_at: string; images: PublicReviewImage[] };
export type HomepageReview = Omit<PublicReview, "images"> & { product_id: string; product_title: string; product_slug: string | null; image: PublicReviewImage | null };
export type ReviewSummary = { count: number; average: number; distribution: Record<1 | 2 | 3 | 4 | 5, number> };

// Anonymous key only: the table itself is not readable by anon; the SECURITY DEFINER
// functions return approved reviews with public columns and never order/customer data.
function publicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Catalog configuration is missing");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export const emptyReviewSummary: ReviewSummary = { count: 0, average: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };

export const getReviewSummary = unstable_cache(async (productId: string): Promise<ReviewSummary> => {
  const { data, error } = await publicClient().rpc("get_product_review_summary", { p_product_id: productId });
  if (error) throw new Error("REVIEWS_UNAVAILABLE");
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return emptyReviewSummary;
  return {
    count: Number(row.review_count), average: Number(row.average_rating),
    distribution: { 1: Number(row.rating_1), 2: Number(row.rating_2), 3: Number(row.rating_3), 4: Number(row.rating_4), 5: Number(row.rating_5) },
  };
}, ["review-summary"], { revalidate: 300, tags: [REVIEWS_CACHE_TAG] });

// PostgREST "function not found": the Reviews Phase 2 migration is not applied yet.
const isMissingFunction = (error: { code?: string } | null) => error?.code === "PGRST202";

export const getReviewPage = unstable_cache(async (productId: string, page: number): Promise<PublicReview[]> => {
  const safePage = Math.min(Math.max(1, Math.trunc(page) || 1), 500);
  const args = { p_product_id: productId, p_limit: REVIEW_POLICY.pageSize, p_offset: (safePage - 1) * REVIEW_POLICY.pageSize };
  const client = publicClient();
  const withImages = await client.rpc("get_product_reviews_with_images", args);
  if (!withImages.error) return (withImages.data ?? []) as PublicReview[];
  if (!isMissingFunction(withImages.error)) throw new Error("REVIEWS_UNAVAILABLE");
  const { data, error } = await client.rpc("get_product_reviews", args);
  if (error) throw new Error("REVIEWS_UNAVAILABLE");
  return ((data ?? []) as Omit<PublicReview, "images">[]).map((review) => ({ ...review, images: [] }));
}, ["review-page-v2"], { revalidate: 300, tags: [REVIEWS_CACHE_TAG] });

export const HOMEPAGE_REVIEW_LIMIT = 6;

/** Latest approved reviews across all active products (one bounded RPC; no per-product queries). */
export const getLatestPublicReviews = unstable_cache(async (): Promise<HomepageReview[]> => {
  const { data, error } = await publicClient().rpc("get_latest_public_reviews", { p_limit: HOMEPAGE_REVIEW_LIMIT });
  if (error) throw new Error("REVIEWS_UNAVAILABLE");
  return ((data ?? []) as HomepageReview[]).slice(0, HOMEPAGE_REVIEW_LIMIT);
}, ["latest-public-reviews"], { revalidate: 300, tags: [REVIEWS_CACHE_TAG, "products"] });
