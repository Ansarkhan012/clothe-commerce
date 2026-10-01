"use client";
import { BadgeCheck } from "lucide-react";
import { useState } from "react";
import type { PublicReview } from "@/src/lib/reviews";
import { formatReviewDate, StarRating } from "@/src/components/product/StarRating";
import { ReviewImageGallery } from "@/src/components/product/ReviewImageGallery";

export function ReviewList({ productId, initialReviews, total, pageSize }: { productId: string; initialReviews: PublicReview[]; total: number; pageSize: number }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialReviews.length === pageSize && total > initialReviews.length);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadMore() {
    if (loading) return;
    setLoading(true); setError(null);
    try {
      const response = await fetch(`/api/reviews?product_id=${encodeURIComponent(productId)}&page=${page + 1}`);
      const result = await response.json() as { reviews?: PublicReview[]; hasMore?: boolean; message?: string };
      if (!response.ok || !result.reviews) throw new Error(result.message || "Unable to load more reviews");
      const seen = new Set(reviews.map((review) => review.id));
      setReviews([...reviews, ...result.reviews.filter((review) => !seen.has(review.id))]);
      setPage(page + 1);
      setHasMore(Boolean(result.hasMore));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load more reviews");
    } finally { setLoading(false); }
  }

  if (!reviews.length) return <div className="min-w-0 self-center border border-dashed border-border p-8 text-center text-sm text-muted">Be the first to review this product.</div>;

  return <div className="min-w-0">
    <ul className="divide-y divide-border border-y border-border" aria-label="Customer reviews">
      {reviews.map((review) => <li key={review.id} className="py-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1"><StarRating value={review.rating} size={14} label={`${review.rating} out of 5 stars`} />{review.title && <h3 className="font-semibold text-brand-charcoal">{review.title}</h3>}</div>
        <p className="mt-3 whitespace-pre-line break-words text-sm leading-7 text-brand-charcoal">{review.body}</p>
        <ReviewImageGallery images={review.images ?? []} reviewer={review.display_name} />
        <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted"><span className="font-medium text-brand-charcoal">{review.display_name}</span>{review.verified_purchase && <span className="inline-flex items-center gap-1 text-brand-green"><BadgeCheck size={14} aria-hidden="true" />Verified purchase</span>}<time dateTime={review.created_at}>{formatReviewDate(review.created_at)}</time></p>
      </li>)}
    </ul>
    {error && <p role="alert" className="mt-4 text-sm text-error">{error}</p>}
    {hasMore && <button type="button" onClick={() => void loadMore()} disabled={loading} className="mt-6 min-h-11 border border-brand-green-dark px-6 text-xs font-semibold uppercase tracking-[.16em] text-brand-green-dark disabled:opacity-50">{loading ? "Loading…" : "Show more reviews"}</button>}
  </div>;
}
