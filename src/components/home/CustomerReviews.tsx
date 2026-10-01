import Image from "next/image";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { formatReviewDate, StarRating } from "@/src/components/product/StarRating";
import { productHref } from "@/src/lib/product-commerce";
import { excerpt } from "@/src/lib/review-display";
import { getLatestPublicReviews, type HomepageReview } from "@/src/lib/reviews";
import { publicReviewImageUrl } from "@/src/lib/validations/review-images";

// Latest approved reviews across all active products. Server-rendered (no client JS),
// one bounded query, cached with the review/product tags. Hidden when there are none or on error.
export async function CustomerReviews() {
  let reviews: HomepageReview[];
  try { reviews = await getLatestPublicReviews(); } catch { return null; }
  if (!reviews.length) return null;

  return <section aria-labelledby="customer-reviews-title" className="bg-white py-16 sm:py-20">
    <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
      <div className="mb-9 border-b border-border pb-4">
        <p className="text-[10px] font-semibold tracking-[0.28em] text-accent">IN THEIR WORDS</p>
        <h2 id="customer-reviews-title" className="mt-2 font-display text-3xl text-brand-green-dark sm:text-4xl">What Our Customers Say</h2>
      </div>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map((review) => {
          const href = productHref({ id: review.product_id, slug: review.product_slug ?? "" });
          return <li key={review.id} className="flex min-w-0 flex-col border border-border bg-brand-cream p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <StarRating value={review.rating} size={15} label={`${review.rating} out of 5 stars`} />
              {review.image && <Link href={href} tabIndex={-1} aria-hidden="true" className="-mt-1 block h-16 w-16 shrink-0 overflow-hidden border border-border bg-white">
                <Image src={publicReviewImageUrl(review.image.id, "thumb")} alt="" width={64} height={64} unoptimized loading="lazy" className="h-full w-full object-cover" />
              </Link>}
            </div>
            {review.title && <h3 className="mt-3 font-semibold text-brand-charcoal">{review.title}</h3>}
            <blockquote className="mt-2 flex-1 whitespace-pre-line break-words text-sm leading-7 text-brand-charcoal">{excerpt(review.body)}</blockquote>
            <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
              <span className="font-medium text-brand-charcoal">{review.display_name}</span>
              {review.verified_purchase && <span className="inline-flex items-center gap-1 text-brand-green"><BadgeCheck size={14} aria-hidden="true" />Verified purchase</span>}
              <time dateTime={review.created_at}>{formatReviewDate(review.created_at)}</time>
            </p>
            <Link href={href} className="mt-3 line-clamp-1 text-xs font-semibold text-brand-green-dark underline-offset-2 hover:text-accent hover:underline">{review.product_title}</Link>
          </li>;
        })}
      </ul>
    </div>
  </section>;
}
