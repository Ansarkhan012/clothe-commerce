import { z } from "zod";
import { getReviewPage } from "@/src/lib/reviews";
import { consumeRateLimit, getRequestIp, rateLimitExceededResponse } from "@/src/lib/security/rate-limit";
import { createServiceClient } from "@/src/lib/supabase/service";
import { REVIEW_POLICY, ReviewSubmissionSchema } from "@/src/lib/validations/review";
import { MAX_REVIEW_IMAGE_BYTES, MAX_REVIEW_IMAGES } from "@/src/lib/validations/review-images";
import { checkReviewImageBytes, processReviewImage, ReviewImageError, reviewImageErrorMessage, type ProcessedReviewImage } from "@/src/lib/review-image-processing";
import { removeReviewImageObjects, uploadReviewImages } from "@/src/lib/review-images-storage";

const MAX_BODY_BYTES = 8_192;
// Text fields + up to three photos of at most 5 MB each (the browser normally sends much less,
// see REVIEW_UPLOAD_BUDGET_BYTES; hosting platforms may cap request bodies lower).
const MAX_MULTIPART_BYTES = MAX_REVIEW_IMAGES * MAX_REVIEW_IMAGE_BYTES + 64 * 1024;
const QuerySchema = z.object({ product_id: z.string().uuid(), page: z.coerce.number().int().min(1).max(500).default(1) });

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = QuerySchema.safeParse({ product_id: url.searchParams.get("product_id"), page: url.searchParams.get("page") ?? undefined });
  if (!parsed.success) return Response.json({ message: "Invalid request" }, { status: 400 });
  try {
    const reviews = await getReviewPage(parsed.data.product_id, parsed.data.page);
    return Response.json({ reviews, hasMore: reviews.length === REVIEW_POLICY.pageSize });
  } catch {
    return Response.json({ message: "Reviews are temporarily unavailable" }, { status: 503 });
  }
}

const failureMessages: Record<string, [number, string]> = {
  REVIEW_NOT_ELIGIBLE: [400, "We couldn't verify a delivered order for this product with that order ID and mobile number."],
  REVIEW_ALREADY_SUBMITTED: [409, "A review for this product has already been submitted for this order."],
  VERIFICATION_REQUIRED: [400, "Enter the order ID and mobile number of your delivered order."],
  INVALID_PRODUCT: [404, "This product is not available for reviews."],
  INVALID_REVIEW: [400, "Please check your review and try again."],
};

const tooLarge = () => Response.json({ message: "Your review or photos are too large." }, { status: 413 });
const imageFailure = (error: ReviewImageError) => Response.json({ message: reviewImageErrorMessage(error), field: "images" }, { status: 400 });
const unavailable = (message = "Unable to submit your review right now. Please try again later.") => Response.json({ message }, { status: 503 });

/** Reads at most `limit` bytes of the body; null when the body is larger. */
async function readLimited(request: Request, limit: number) {
  if (Number(request.headers.get("content-length") ?? 0) > limit) return null;
  const reader = request.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > limit) { await reader.cancel(); return null; }
    chunks.push(value);
  }
  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
  return body;
}

function rpcFailure(error: { message?: string; code?: string }) {
  const code = Object.keys(failureMessages).find((key) => error.message?.includes(key));
  if (code) {
    const [status, message] = failureMessages[code];
    return Response.json({ message }, { status });
  }
  console.error("Review submission failed", { code: error.code });
  return unavailable();
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    const multipart = contentType.toLowerCase().startsWith("multipart/form-data");
    const raw = await readLimited(request, multipart ? MAX_MULTIPART_BYTES : MAX_BODY_BYTES);
    if (!raw) return tooLarge();

    let json: unknown;
    let files: Uint8Array[] = [];
    if (multipart) {
      // Fields: "review" (the same JSON as text-only submissions) and 0..3 "images" files.
      // Customer filenames and declared types are ignored; only the bytes are examined.
      let form: FormData;
      try { form = await new Response(raw as BodyInit, { headers: { "content-type": contentType } }).formData(); } catch { return Response.json({ message: "Invalid review" }, { status: 400 }); }
      if ([...form.keys()].some((key) => key !== "review" && key !== "images")) return Response.json({ message: "Invalid review" }, { status: 400 });
      const fields = form.get("review"), uploads = form.getAll("images");
      if (typeof fields !== "string" || uploads.some((entry) => typeof entry === "string")) return Response.json({ message: "Invalid review" }, { status: 400 });
      if (new TextEncoder().encode(fields).byteLength > MAX_BODY_BYTES) return tooLarge();
      try { json = JSON.parse(fields); } catch { return Response.json({ message: "Invalid review" }, { status: 400 }); }
      if (uploads.length > MAX_REVIEW_IMAGES) return imageFailure(new ReviewImageError("TOO_MANY", MAX_REVIEW_IMAGES));
      files = await Promise.all((uploads as File[]).map(async (file) => new Uint8Array(await file.arrayBuffer())));
    } else {
      try { json = JSON.parse(new TextDecoder().decode(raw)); } catch { return Response.json({ message: "Invalid review" }, { status: 400 }); }
    }

    const parsed = ReviewSubmissionSchema.safeParse(json);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return Response.json({ message: issue?.message ?? "Invalid review", field: issue?.path[0] ?? null }, { status: 400 });
    }
    try { checkReviewImageBytes(files); } catch (error) { if (error instanceof ReviewImageError) return imageFailure(error); throw error; }

    const rateWindow = 60 * 60_000;
    if (!await consumeRateLimit(`review:${getRequestIp(request)}`, 5, rateWindow, { failClosed: true })) return rateLimitExceededResponse(rateWindow);

    // Decode + re-encode every photo before anything is written (strips metadata, proves it is an image).
    let processed: ProcessedReviewImage[];
    try { processed = await Promise.all(files.map((bytes, index) => processReviewImage(bytes, index))); } catch (error) {
      if (error instanceof ReviewImageError) return imageFailure(error);
      throw error;
    }

    const review = parsed.data;
    const client = createServiceClient();
    const args = {
      p_product_id: review.product_id, p_rating: review.rating, p_title: review.title || null, p_body: review.body,
      p_display_name: review.display_name, p_public_order_id: review.order_reference ?? null,
      p_phone_number: review.phone_number ?? null, p_allow_unverified: REVIEW_POLICY.allowUnverified,
    };
    if (!processed.length) {
      const { error } = await client.rpc("submit_product_review", args);
      if (error) return rpcFailure(error);
      return Response.json({ success: true, message: "Thank you! Your review has been submitted and will appear after it is approved." }, { status: 201 });
    }

    // Verification and the photo rows are created in one transaction; storage paths are generated
    // by the database from server UUIDs. Uploads follow; on any failure the pending submission is
    // discarded (its rows queue the objects for deletion) so the customer can simply retry.
    const { data, error } = await client.rpc("submit_product_review_with_images", {
      ...args, p_images: processed.map((image) => ({ byte_size: image.byteSize, width: image.width, height: image.height })),
    });
    if (error) {
      if (error.code === "PGRST202") return unavailable("Photo reviews are not available yet. Please submit your review without photos.");
      return rpcFailure(error);
    }
    const created = (Array.isArray(data) ? data[0] : data) as { review_id: string; images: { id: string; storage_path: string; sort_order: number }[] } | null;
    if (!created) return unavailable();
    let uploaded: string[] = [];
    try {
      uploaded = await uploadReviewImages(client, created.review_id, created.images, processed);
      const { data: confirmed, error: confirmError } = await client.rpc("confirm_product_review_images", { p_review_id: created.review_id, p_image_ids: created.images.map((image) => image.id) });
      if (confirmError || Number(confirmed) !== created.images.length) throw new Error("REVIEW_IMAGE_CONFIRM_FAILED");
    } catch {
      console.error("Review photo upload failed; submission discarded");
      await client.rpc("discard_product_review_submission", { p_review_id: created.review_id });
      await removeReviewImageObjects(client, uploaded);
      return unavailable("We couldn't upload your photos. Please try again.");
    }
    return Response.json({ success: true, message: "Thank you! Your review and photos have been submitted and will appear after approval." }, { status: 201 });
  } catch {
    return unavailable();
  }
}
