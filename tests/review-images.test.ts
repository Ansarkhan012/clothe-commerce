import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import sharp from "sharp";

import {
  isUuid, MAX_REVIEW_IMAGE_BYTES, MAX_REVIEW_IMAGES, REVIEW_IMAGE_ACCEPT, reviewImageObjectPaths, reviewImageProblem,
  selectReviewImageFiles, sniffReviewImageType, thumbPathFor,
} from "../src/lib/validations/review-images.ts";
import { checkReviewImageBytes, processReviewImage, ReviewImageError } from "../src/lib/review-image-processing.ts";
import { excerpt, ratingDistributionRows, reviewCountLabel } from "../src/lib/review-display.ts";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
const bytes = (text: string) => new TextEncoder().encode(text);
const image = (format: "jpeg" | "png" | "webp" | "avif", width = 64, height = 48) =>
  sharp({ create: { width, height, channels: 3, background: { r: 120, g: 90, b: 60 } } }).toFormat(format).toBuffer();
const REVIEW_ID = "11111111-1111-4111-8111-111111111111", IMAGE_ID = "22222222-2222-4222-8222-222222222222";

test("format is identified from bytes for JPEG, PNG, WebP and AVIF", async () => {
  for (const [format, type] of [["jpeg", "image/jpeg"], ["png", "image/png"], ["webp", "image/webp"], ["avif", "image/avif"]] as const) {
    assert.equal(sniffReviewImageType(new Uint8Array(await image(format))), type, format);
  }
});

test("unsupported or disguised files are rejected regardless of name or declared type (6)", async () => {
  const gif = await sharp({ create: { width: 4, height: 4, channels: 3, background: "#000" } }).gif().toBuffer();
  for (const [label, data] of [
    ["HTML renamed .png", bytes("<!doctype html><script>alert(1)</script>")],
    ["SVG", bytes('<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"/>')],
    ["GIF", new Uint8Array(gif)],
    ["HEIC", Uint8Array.from([0, 0, 0, 24, ...bytes("ftypheic"), 0, 0, 0, 0, ...bytes("mif1heic")])],
    ["PDF", bytes("%PDF-1.7 fake")],
  ] as const) {
    assert.equal(sniffReviewImageType(data), null, label);
    assert.throws(() => checkReviewImageBytes([data]), (error: ReviewImageError) => error.code === "UNSUPPORTED", label);
    assert.ok(reviewImageProblem({ size: data.byteLength, type: "image/png" }, data), `${label}: client also refuses`);
  }
  assert.ok(reviewImageProblem({ size: 10, type: "image/heic" }), "declared HEIC refused client-side");
  assert.ok(reviewImageProblem({ size: 10, type: "text/html" }), "declared HTML refused client-side");
  assert.equal(REVIEW_IMAGE_ACCEPT, "image/jpeg,image/png,image/webp,image/avif");
});

test("size limits: exactly 5 MB accepted, larger rejected; empty rejected (5)", async () => {
  const jpeg = new Uint8Array(await image("jpeg"));
  const atLimit = new Uint8Array(MAX_REVIEW_IMAGE_BYTES); atLimit.set(jpeg);
  const overLimit = new Uint8Array(MAX_REVIEW_IMAGE_BYTES + 1); overLimit.set(jpeg);
  assert.doesNotThrow(() => checkReviewImageBytes([atLimit]));
  assert.throws(() => checkReviewImageBytes([overLimit]), (error: ReviewImageError) => error.code === "TOO_LARGE");
  assert.throws(() => checkReviewImageBytes([new Uint8Array()]), (error: ReviewImageError) => error.code === "EMPTY");
  assert.equal(reviewImageProblem({ size: MAX_REVIEW_IMAGE_BYTES, type: "image/jpeg" }, jpeg), null);
  assert.match(reviewImageProblem({ size: MAX_REVIEW_IMAGE_BYTES + 1, type: "image/jpeg" }, jpeg) ?? "", /5 MB/);
});

test("zero to three photos accepted; a fourth is refused client- and server-side (1–4)", async () => {
  const jpeg = new Uint8Array(await image("jpeg"));
  for (const count of [0, 1, 2, 3]) assert.doesNotThrow(() => checkReviewImageBytes(Array(count).fill(jpeg)), `${count} photos`);
  assert.throws(() => checkReviewImageBytes(Array(4).fill(jpeg)), (error: ReviewImageError) => error.code === "TOO_MANY");
  assert.equal(MAX_REVIEW_IMAGES, 3);
  assert.deepEqual(selectReviewImageFiles(2, ["a", "b"]), { accepted: ["a"], exceeded: true });
  assert.deepEqual(selectReviewImageFiles(0, ["a", "b", "c"]), { accepted: ["a", "b", "c"], exceeded: false });
  assert.deepEqual(selectReviewImageFiles(3, ["a"]), { accepted: [], exceeded: true });
});

test("photos are re-encoded to WebP: metadata (GPS) stripped, orientation applied, size capped, thumbnail made", async () => {
  const withGps = await sharp({ create: { width: 3000, height: 2000, channels: 3, background: "#996633" } })
    .withExif({ IFD0: { Make: "PhoneMaker", Model: "Secret Model" }, IFD3: { GPSLatitudeRef: "N", GPSLatitude: "24/1 51/1 0/1", GPSLongitudeRef: "E", GPSLongitude: "67/1 0/1 0/1" } })
    .jpeg().toBuffer();
  assert.ok((await sharp(withGps).metadata()).exif, "fixture really carries EXIF");
  const processed = await processReviewImage(new Uint8Array(withGps));
  const full = await sharp(processed.full).metadata(), thumb = await sharp(processed.thumb).metadata();
  assert.equal(full.format, "webp"); assert.equal(thumb.format, "webp");
  assert.equal(full.exif, undefined, "no EXIF/GPS in stored photo"); assert.equal(thumb.exif, undefined);
  assert.ok(!processed.full.includes("Secret Model"), "camera details removed");
  assert.equal(Math.max(processed.width, processed.height), 1600);
  assert.ok(Math.max(thumb.width!, thumb.height!) <= 400);
  assert.equal(processed.byteSize, processed.full.byteLength);
  const rotated = await sharp({ create: { width: 200, height: 100, channels: 3, background: "#123456" } }).jpeg().withMetadata({ orientation: 6 }).toBuffer();
  const upright = await processReviewImage(new Uint8Array(rotated));
  assert.deepEqual([upright.width, upright.height], [100, 200], "EXIF orientation baked in before metadata is dropped");
  const small = await processReviewImage(new Uint8Array(await image("png", 64, 48)));
  assert.deepEqual([small.width, small.height], [64, 48], "small photos are not enlarged");
  for (const format of ["png", "webp", "avif"] as const) assert.equal((await sharp((await processReviewImage(new Uint8Array(await image(format)))).full).metadata()).format, "webp", format);
});

test("a corrupt file with a valid signature is rejected as unreadable", async () => {
  const jpeg = new Uint8Array(await image("jpeg"));
  await assert.rejects(processReviewImage(jpeg.slice(0, 40)), (error: ReviewImageError) => error.code === "UNREADABLE");
  const fakePng = new Uint8Array(64); fakePng.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  await assert.rejects(processReviewImage(fakePng), (error: ReviewImageError) => ["UNREADABLE", "UNSUPPORTED"].includes(error.code));
});

test("storage paths come only from server UUIDs; traversal and filenames are impossible (7)", () => {
  assert.deepEqual(reviewImageObjectPaths(REVIEW_ID, IMAGE_ID), {
    full: `reviews/${REVIEW_ID}/${IMAGE_ID}.webp`, thumb: `reviews/${REVIEW_ID}/${IMAGE_ID}_thumb.webp`,
  });
  for (const bad of ["../../etc/passwd", "../products/logo.png", `${REVIEW_ID}/../x`, "photo.png", ""]) {
    assert.throws(() => reviewImageObjectPaths(bad, IMAGE_ID)); assert.throws(() => reviewImageObjectPaths(REVIEW_ID, bad));
  }
  assert.equal(thumbPathFor(`reviews/${REVIEW_ID}/${IMAGE_ID}.webp`), `reviews/${REVIEW_ID}/${IMAGE_ID}_thumb.webp`);
  assert.equal(thumbPathFor("reviews/../products/x.webp"), null);
  assert.equal(isUuid("not-a-uuid"), false);
  const route = read("../src/app/api/reviews/route.ts");
  assert.doesNotMatch(route, /\.name\b/, "customer filenames are never read by the API");
  assert.doesNotMatch(route, /upsert:\s*true/);
  assert.match(read("../src/lib/review-images-storage.ts"), /upsert: false/, "uploads never overwrite an existing object");
});

test("submission API: validation → rate limit → image decoding → DB → upload, with compensation on failure (8)", () => {
  const route = read("../src/app/api/reviews/route.ts");
  const order = ["ReviewSubmissionSchema.safeParse", "checkReviewImageBytes(files)", "consumeRateLimit(", "processReviewImage(bytes", 'rpc("submit_product_review_with_images"', "uploadReviewImages(", 'rpc("confirm_product_review_images"'].map((needle) => route.indexOf(needle));
  assert.ok(order.every((index, position) => index > 0 && (position === 0 || index > order[position - 1])), `order ${order.join(",")}`);
  assert.match(route, /catch \{[\s\S]*rpc\("discard_product_review_submission"[\s\S]*removeReviewImageObjects/, "failed uploads discard the pending submission and its objects");
  assert.match(route, /key !== "review" && key !== "images"/, "unexpected multipart fields rejected");
  assert.match(route, /MAX_MULTIPART_BYTES = MAX_REVIEW_IMAGES \* MAX_REVIEW_IMAGE_BYTES/);
  const form = read("../src/components/product/ReviewForm.tsx");
  assert.match(form, /if \(inFlight\.current\) return;/, "duplicate submissions blocked client-side");
  assert.match(form, /disabled=\{submitting\}/);
});

test("public photo route serves only approved photos by id; admin route requires an admin (10–12)", () => {
  const pub = read("../src/app/api/reviews/images/[id]/[size]/route.ts");
  assert.match(pub, /rpc\("get_public_review_image"/);
  assert.doesNotMatch(pub, /requireAdmin|product_review_images/);
  const admin = read("../src/app/api/admin/reviews/images/[id]/[size]/route.ts");
  assert.ok(admin.indexOf("requireAdmin()") > 0 && admin.indexOf("requireAdmin()") < admin.indexOf('from("product_review_images")'));
  assert.match(admin, /private, no-store/);
  const storage = read("../src/lib/review-images-storage.ts");
  assert.match(storage, /"X-Content-Type-Options": "nosniff"/);
  assert.match(storage, /"Content-Type": "image\/webp"/, "content type fixed server-side, never from the upload");
  const cleanup = read("../src/app/api/admin/reviews/images/cleanup/route.ts");
  assert.match(cleanup, /await requireAdmin\(\)/);
  const page = read("../src/app/admin/reviews/page.tsx");
  assert.match(page, /images:product_review_images\(id,width,height,sort_order,confirmed_at\)/);
  assert.match(page, /variant="admin"/);
});

test("public review data exposes photo ids only (no storage paths) and stays on the anon key", () => {
  const lib = read("../src/lib/reviews.ts");
  assert.doesNotMatch(lib, /storage_path|SERVICE_ROLE|order_id|phone/);
  assert.match(lib, /rpc\("get_product_reviews_with_images"/);
  assert.match(lib, /isMissingFunction\(withImages\.error\)[\s\S]*rpc\("get_product_reviews"/, "falls back to text-only reviews before the Phase 2 migration");
  const gallery = read("../src/components/product/ReviewImageGallery.tsx");
  assert.match(gallery, /<dialog/); assert.match(gallery, /loading="lazy"/); assert.match(gallery, /"thumb"/);
  assert.doesNotMatch(gallery, /storage_path|supabase/);
});

test("rating distribution shows counts; bars keep the percentage (19, 20)", () => {
  const rows = ratingDistributionRows({ 1: 0, 2: 0, 3: 0, 4: 1, 5: 0 }, 1);
  assert.deepEqual(rows.map((row) => [row.label, row.count, row.percent]), [["5 stars", 0, 0], ["4 stars", 1, 100], ["3 stars", 0, 0], ["2 stars", 0, 0], ["1 star", 0, 0]]);
  const many = ratingDistributionRows({ 1: 0, 2: 1, 3: 2, 4: 5, 5: 12 }, 20);
  assert.deepEqual(many.map((row) => row.count), [12, 5, 2, 1, 0]);
  assert.deepEqual(many.map((row) => row.percent), [60, 25, 10, 5, 0]);
  assert.deepEqual(ratingDistributionRows({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, 0).map((row) => row.percent), [0, 0, 0, 0, 0]);
  const section = read("../src/components/product/ProductReviews.tsx");
  assert.match(section, /\{row\.count\}/, "visible value is the count");
  assert.match(section, /width: `\$\{row\.percent\}%`/, "bar width is the percentage");
  assert.doesNotMatch(section, /\{percent\}%|\{row\.percent\}%</, "no visible percentage text");
});

test("review count wording is singular/plural (21) and excerpts cut at a word", () => {
  assert.equal(reviewCountLabel(1), "1 review");
  assert.equal(reviewCountLabel(2), "2 reviews");
  assert.equal(reviewCountLabel(0), "0 reviews");
  assert.match(read("../src/components/product/ProductReviews.tsx"), /Based on \{reviewCountLabel\(summary\.count\)\}/);
  assert.equal(excerpt("short text"), "short text");
  const long = excerpt("word ".repeat(80), 50);
  assert.ok(long.endsWith("…") && long.length <= 51 && !long.includes("wor…"));
});

test("homepage reviews: one bounded cached query, approved-only feed, hidden when empty (15–18)", () => {
  const lib = read("../src/lib/reviews.ts");
  assert.match(lib, /rpc\("get_latest_public_reviews", \{ p_limit: HOMEPAGE_REVIEW_LIMIT \}\)/);
  assert.match(lib, /HOMEPAGE_REVIEW_LIMIT = 6/);
  assert.match(lib, /\["latest-public-reviews"\], \{ revalidate: 300, tags: \[REVIEWS_CACHE_TAG, "products"\] \}/, "invalidated by moderation and product changes");
  const section = read("../src/components/home/CustomerReviews.tsx");
  assert.doesNotMatch(section, /"use client"/, "server-rendered: no client JS");
  assert.match(section, /if \(!reviews\.length\) return null;/, "no fake testimonials: hidden when empty");
  assert.match(section, /catch \{ return null; \}/, "homepage never breaks on review errors");
  assert.match(section, /productHref\(/); assert.match(section, /"thumb"/);
  assert.match(read("../src/app/page.tsx"), /<Suspense fallback=\{null\}><CustomerReviews \/><\/Suspense>/);
  assert.match(read("../src/app/api/admin/reviews/[id]/route.ts"), /revalidateTag\(REVIEWS_CACHE_TAG, \{ expire: 0 \}\)/, "moderation invalidates homepage + product review caches");
});

test("review form: optional accessible photo picker with previews, removal, errors and progress (22)", () => {
  const form = read("../src/components/product/ReviewForm.tsx");
  assert.match(form, /Add photos \(optional\)/);
  assert.match(form, /type="file" accept=\{REVIEW_IMAGE_ACCEPT\} multiple/);
  assert.match(form, /aria-label=\{`Remove photo \$\{index \+ 1\}`\}/);
  assert.match(form, /URL\.revokeObjectURL/, "previews are released");
  assert.match(form, /<progress id="review-upload-progress"/);
  assert.match(form, /role="alert" className="mt-2 text-xs text-error">\{photoError\}/);
  assert.match(form, /min-h-11/, "44 px touch targets");
  assert.match(form, /fetch\("\/api\/reviews", \{ method: "POST", headers: \{ "Content-Type": "application\/json" \}/, "text-only reviews keep the JSON request");
});

test("Phase 2 migration is additive, private and does not touch audited release objects", () => {
  const sql = read("../../supabase/migrations/202610010001_review_images.sql");
  assert.doesNotMatch(sql, /create or replace function public\.(submit_product_review|get_product_reviews|get_product_review_summary|create_atomic_order)\(/);
  assert.doesNotMatch(sql, /alter table public\.(product_reviews|orders|products)|drop table|create policy/i);
  assert.match(sql, /'review-images', 'review-images', false/);
  assert.match(sql, /revoke all on table public\.product_review_images from public, anon, authenticated/);
  assert.match(sql, /grant execute on function public\.get_public_review_image\(uuid\) to service_role;/);
  assert.match(sql, /storage_path = 'reviews\/' \|\| review_id::text \|\| '\/' \|\| id::text \|\| '\.webp'/);
});
