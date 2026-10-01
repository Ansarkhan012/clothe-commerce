import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { ReviewModerationActions } from "@/src/components/admin/ReviewModerationActions";
import { ReviewImageCleanup } from "@/src/components/admin/ReviewImageCleanup";
import { ReviewImageGallery } from "@/src/components/product/ReviewImageGallery";
import { requireAdmin } from "@/src/lib/auth/admin";
import { reviewStatuses, type ReviewStatus } from "@/src/lib/validations/review";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const statusStyles: Record<ReviewStatus, string> = { pending: "bg-amber-50 text-amber-800", approved: "bg-emerald-50 text-emerald-800", rejected: "bg-red-50 text-red-700", hidden: "bg-gray-100 text-gray-700" };
type AdminReviewImage = { id: string; width: number; height: number; sort_order: number; confirmed_at: string | null };
type ReviewRow = { id: string; rating: number; title: string | null; body: string; display_name: string; verified_purchase: boolean; status: ReviewStatus; created_at: string; order_id: string | null; images?: AdminReviewImage[]; product: { id: string; title: string } | { id: string; title: string }[] | null };

export default async function ReviewsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const raw = await searchParams;
  const value = (key: string) => typeof raw[key] === "string" ? raw[key] as string : "";
  const status = value("status") === "all" ? "" : (reviewStatuses as readonly string[]).includes(value("status")) ? value("status") : "pending";
  const productId = uuidPattern.test(value("product")) ? value("product") : "";
  const page = Math.max(1, Number(value("page")) || 1), pageSize = 25, from = (page - 1) * pageSize;
  const { serviceClient } = await requireAdmin();

  const baseColumns = "id,rating,title,body,display_name,verified_purchase,status,created_at,order_id,product:products(id,title)";
  const reviewQuery = (columns: string) => {
    let query = serviceClient.from("product_reviews").select(columns, { count: "exact" });
    if (status) query = query.eq("status", status);
    if (productId) query = query.eq("product_id", productId);
    return query.order("created_at", { ascending: false }).range(from, from + pageSize - 1);
  };
  const [withImages, { data: products }] = await Promise.all([
    reviewQuery(`${baseColumns},images:product_review_images(id,width,height,sort_order,confirmed_at)`),
    serviceClient.from("products").select("id,title").order("title").limit(500),
  ]);
  // Before the Reviews Phase 2 migration the photo table does not exist: list reviews without photos.
  const { data, count, error } = withImages.error ? await reviewQuery(baseColumns) : withImages;
  const photosAvailable = !withImages.error;
  const reviews = (data ?? []) as unknown as ReviewRow[];
  const params = new URLSearchParams(Object.entries(raw).flatMap(([key, item]) => typeof item === "string" ? [[key, item]] : []));
  const href = (target: number) => { params.set("page", String(target)); return `/admin/reviews?${params}`; };

  return <main className="mx-auto max-w-[1500px]">
    <div className="mb-6"><h2 className="text-2xl font-semibold">Reviews</h2><p className="mt-1 text-sm text-[#6B7280]">Reviews and their photos are hidden from customers until approved. Ratings only count approved reviews.</p>{photosAvailable && <ReviewImageCleanup />}</div>
    <form className="mb-6 flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
      <label className="text-sm font-medium">Status<select name="status" defaultValue={status || "all"} className="mt-1 block h-10 rounded-md border border-[#D8DADF] bg-white px-3"><option value="all">All</option>{reviewStatuses.map((item) => <option key={item} value={item}>{item[0].toUpperCase() + item.slice(1)}</option>)}</select></label>
      <label className="min-w-64 text-sm font-medium">Product<select name="product" defaultValue={productId} className="mt-1 block h-10 w-full rounded-md border border-[#D8DADF] bg-white px-3"><option value="">All products</option>{(products ?? []).map((product) => <option key={product.id} value={product.id}>{product.title}</option>)}</select></label>
      <button className="h-10 rounded-md bg-[#1A1A1A] px-4 text-sm font-medium text-white">Filter</button>
    </form>
    {error ? <p role="alert" className="rounded border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Reviews are unavailable. The product reviews database migration may not be applied yet.</p>
      : !reviews.length ? <p className="rounded-lg border bg-white p-8 text-center text-sm text-[#6B7280]">No reviews match these filters.</p>
      : <ul className="space-y-3">{reviews.map((review) => {
        const product = Array.isArray(review.product) ? review.product[0] : review.product;
        return <li key={review.id} className="rounded-lg border bg-white p-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className={`rounded px-2 py-0.5 font-medium capitalize ${statusStyles[review.status]}`}>{review.status}</span>
            <span aria-label={`${review.rating} out of 5 stars`} className="text-amber-600">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
            {review.verified_purchase ? <span className="inline-flex items-center gap-1 text-emerald-700"><BadgeCheck size={14} aria-hidden="true" />Verified purchase{review.order_id && <Link href={`/admin/orders/${review.order_id}`} className="underline">(order)</Link>}</span> : <span className="text-[#6B7280]">Unverified</span>}
            <span className="text-[#6B7280]">{new Date(review.created_at).toLocaleString("en-PK", { timeZone: "Asia/Karachi" })}</span>
          </div>
          <p className="mt-2 text-sm"><span className="text-[#6B7280]">Product: </span>{product ? <Link href={`/admin/reviews?status=${status || "all"}&product=${product.id}`} className="font-medium underline">{product.title}</Link> : "—"}</p>
          {review.title && <p className="mt-2 font-semibold">{review.title}</p>}
          <p className="mt-1 whitespace-pre-line break-words text-sm text-[#374151]">{review.body}</p>
          {(() => {
            const images = [...(review.images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
            const ready = images.filter((image) => image.confirmed_at);
            return <>
              {ready.length > 0 && <ReviewImageGallery images={ready} reviewer={review.display_name} variant="admin" thumbSize={88} />}
              {images.length > ready.length && <p className="mt-2 text-xs text-amber-800">{images.length - ready.length} photo upload(s) incomplete — not shown to customers.</p>}
            </>;
          })()}
          <p className="mt-2 text-xs text-[#6B7280]">— {review.display_name}</p>
          <div className="mt-3"><ReviewModerationActions id={review.id} status={review.status} /></div>
        </li>;
      })}</ul>}
    <div className="mt-6 flex items-center justify-between text-sm"><span className="text-[#6B7280]">{count ?? 0} reviews</span><span className="flex gap-2">{page > 1 && <Link href={href(page - 1)} className="rounded border px-3 py-1.5">Previous</Link>}{page * pageSize < (count ?? 0) && <Link href={href(page + 1)} className="rounded border px-3 py-1.5">Next</Link>}</span></div>
  </main>;
}
