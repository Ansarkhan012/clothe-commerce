import { getReviewPage, getReviewSummary, type PublicReview, type ReviewSummary } from "@/src/lib/reviews";
import { REVIEW_POLICY } from "@/src/lib/validations/review";
import { ReviewForm } from "@/src/components/product/ReviewForm";
import { ReviewList } from "@/src/components/product/ReviewList";
import { StarRating } from "@/src/components/product/StarRating";
import { ratingDistributionRows, reviewCountLabel } from "@/src/lib/review-display";

export async function ProductReviews({ productId }: { productId: string }) {
  let summary: ReviewSummary;
  let firstPage: PublicReview[];
  try {
    [summary, firstPage] = await Promise.all([getReviewSummary(productId), getReviewPage(productId, 1)]);
  } catch {
    // Reviews are optional: an outage (or the migration not being applied yet) must never break the product page.
    return null;
  }

  return <section id="reviews" aria-labelledby="reviews-title" className="mt-14 border-t border-border bg-white py-14">
    <div className="mx-auto grid max-w-[1440px] gap-10 px-4 sm:px-8 lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.6fr)] lg:px-12">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[.24em] text-brand-gold-dark">Customer reviews</p>
        <h2 id="reviews-title" className="mt-2 font-display text-3xl text-brand-green-dark sm:text-4xl">Ratings &amp; Reviews</h2>
        {summary.count > 0 ? <>
          <div className="mt-6 flex items-center gap-4">
            <strong className="font-display text-5xl text-brand-charcoal">{summary.average.toFixed(1)}</strong>
            <div><StarRating value={summary.average} size={18} label={`Average rating ${summary.average.toFixed(1)} out of 5`} /><p className="mt-1 text-sm text-muted">Based on {reviewCountLabel(summary.count)}</p></div>
          </div>
          <dl className="mt-6 space-y-2" aria-label="Rating breakdown">
            {ratingDistributionRows(summary.distribution, summary.count).map((row) =>
              // Visible value is the review COUNT; the bar width is the share of all reviews.
              <div key={row.stars} className="grid grid-cols-[3.5rem_1fr_2.5rem] items-center gap-3 text-xs">
                <dt>{row.label}</dt>
                <dd className="h-2 overflow-hidden bg-brand-cream-dark" aria-hidden="true"><span data-testid="rating-bar" className="block h-full bg-brand-gold-dark" style={{ width: `${row.percent}%` }} /></dd>
                <dd className="text-right tabular-nums text-muted">{row.count}<span className="sr-only"> {row.count === 1 ? "review" : "reviews"}</span></dd>
              </div>)}
          </dl>
        </> : <p className="mt-6 text-sm leading-6 text-muted">No reviews yet. Customers who have received this product can share their experience.</p>}
        <ReviewForm productId={productId} requireOrder={!REVIEW_POLICY.allowUnverified} />
      </div>
      <ReviewList productId={productId} initialReviews={firstPage} total={summary.count} pageSize={REVIEW_POLICY.pageSize} />
    </div>
  </section>;
}
