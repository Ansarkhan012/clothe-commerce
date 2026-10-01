import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { normalizeReviewText, REVIEW_POLICY, ReviewModerationSchema, ReviewSubmissionSchema } from "../src/lib/validations/review.ts";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
const valid = {
  product_id: "11111111-1111-4111-8111-111111111111", rating: 5, display_name: "Ayesha K.", title: "Beautiful",
  body: "The fabric quality is excellent and colours match the photos.", order_reference: "qzf-1a2b3c4d5e6f", phone_number: "0300-1234567",
};

test("valid verified submission is normalized", () => {
  const parsed = ReviewSubmissionSchema.parse(valid);
  assert.equal(parsed.order_reference, "QZF-1A2B3C4D5E6F");
  assert.equal(parsed.phone_number, "03001234567");
});

test("HTML, script injection and links are rejected; text is stored plain", () => {
  for (const body of ["<script>alert(1)</script> great fabric", "Nice <img src=x onerror=alert(1)> fabric", "Great &lt;b&gt; fabric really", "Buy cheap at https://spam.example now", "visit www.spam-site.com for more", "cheap deals on fakeshop.pk today"]) {
    assert.equal(ReviewSubmissionSchema.safeParse({ ...valid, body }).success, false, body);
  }
  assert.equal(ReviewSubmissionSchema.safeParse({ ...valid, display_name: "<b>Admin</b>" }).success, false);
  assert.equal(ReviewSubmissionSchema.safeParse({ ...valid, title: "<i>x</i> title" }).success, false);
  assert.equal(ReviewSubmissionSchema.safeParse({ ...valid, body: "Size 5 < 6 but lovely" }).success, true, "a plain comparison is not markup");
});

test("control and bidi characters are stripped and whitespace normalized", () => {
  assert.equal(normalizeReviewText("  Lovely‮ fabric\u0000\r\n\r\n\r\n\r\nWould buy\t\tagain  "), "Lovely fabric\n\nWould buy again");
});

test("rating bounds, length limits, strict fields and honeypot are enforced", () => {
  for (const rating of [0, 6, 4.5, "5"]) assert.equal(ReviewSubmissionSchema.safeParse({ ...valid, rating }).success, false, String(rating));
  assert.equal(ReviewSubmissionSchema.safeParse({ ...valid, body: "too short" }).success, false);
  assert.equal(ReviewSubmissionSchema.safeParse({ ...valid, body: "x".repeat(2001) }).success, false);
  assert.equal(ReviewSubmissionSchema.safeParse({ ...valid, website: "http://bot" }).success, false);
  assert.equal(ReviewSubmissionSchema.safeParse({ ...valid, verified_purchase: true }).success, false, "clients cannot assert verification");
  assert.equal(ReviewSubmissionSchema.safeParse({ ...valid, status: "approved" }).success, false, "clients cannot self-approve");
});

test("verification is required while unverified reviews are disabled", () => {
  assert.equal(REVIEW_POLICY.allowUnverified, false);
  assert.equal(ReviewSubmissionSchema.safeParse({ ...valid, order_reference: "", phone_number: "" }).success, false);
  assert.equal(ReviewSubmissionSchema.safeParse({ ...valid, phone_number: "" }).success, false);
  assert.equal(ReviewSubmissionSchema.safeParse({ ...valid, order_reference: "12345" }).success, false);
});

test("moderation accepts only known statuses", () => {
  assert.equal(ReviewModerationSchema.safeParse({ status: "approved" }).success, true);
  assert.equal(ReviewModerationSchema.safeParse({ status: "published" }).success, false);
  assert.equal(ReviewModerationSchema.safeParse({ status: "approved", verified_purchase: true }).success, false);
});

test("submission API validates, rate-limits, then calls the server-only RPC without trusting client flags", () => {
  const route = read("../src/app/api/reviews/route.ts");
  const parse = route.indexOf("ReviewSubmissionSchema.safeParse"), limit = route.indexOf("consumeRateLimit("), rpc = route.indexOf('rpc("submit_product_review"');
  assert.ok(parse > 0 && parse < limit && limit < rpc);
  assert.match(route, /MAX_BODY_BYTES = 8_192/);
  assert.match(route, /p_allow_unverified: REVIEW_POLICY\.allowUnverified/);
  assert.doesNotMatch(route, /verified_purchase/);
  assert.doesNotMatch(route, /from\("product_reviews"\)/, "no direct table writes from the public API");
});

test("moderation API requires an admin, records the moderator and invalidates review caches", () => {
  const route = read("../src/app/api/admin/reviews/[id]/route.ts");
  assert.ok(route.indexOf("requireAdmin()") < route.indexOf('from("product_reviews")'));
  assert.match(route, /moderated_by: user\.id/);
  assert.match(route, /revalidateTag\(REVIEWS_CACHE_TAG, \{ expire: 0 \}\)/);
  assert.match(read("../src/app/admin/reviews/page.tsx"), /await requireAdmin\(\)/);
});

test("public review reads never select private columns and use the anon key", () => {
  const lib = read("../src/lib/reviews.ts");
  assert.match(lib, /import "server-only"/);
  assert.match(lib, /NEXT_PUBLIC_SUPABASE_ANON_KEY/);
  assert.doesNotMatch(lib, /SERVICE_ROLE|order_id|phone/);
});

test("product page degrades gracefully when reviews are unavailable", () => {
  const section = read("../src/components/product/ProductReviews.tsx");
  assert.match(section, /catch \{[\s\S]*return null;/);
  assert.match(read("../src/app/product/[id]/page.tsx"), /<Suspense fallback=\{null\}><ProductReviews productId=\{product\.id\} \/><\/Suspense>/);
});

test("review migration is additive, deny-all for clients and does not touch drifted order functions", () => {
  const sql = read("../../supabase/migrations/202609300001_product_reviews.sql");
  assert.doesNotMatch(sql, /create_atomic_order|update_order_status|save_product|drop table|alter table public\.(orders|products)/i);
  assert.match(sql, /revoke all on table public\.product_reviews from public, anon, authenticated/);
  assert.match(sql, /grant execute on function public\.submit_product_review\([^)]*\) to service_role;/);
  assert.match(sql, /order_status = 'delivered'/);
  assert.match(sql, /where r\.product_id = p_product_id and r\.status = 'approved'/);
});

test("review submissions fail closed when the rate limiter is unavailable; checkout keeps availability-first behaviour", () => {
  const limiter = read("../src/lib/security/rate-limit.ts");
  assert.match(limiter, /\{ failClosed = false \}: \{ failClosed\?: boolean \} = \{\}/);
  assert.equal((limiter.match(/return !failClosed;/g) ?? []).length, 3, "every limiter failure path honours failClosed");
  assert.doesNotMatch(limiter, /return true;\n\s*\}\n\s*\n\s*if \(data !== true/, "no unconditional allow on RPC error");
  assert.match(read("../src/app/api/reviews/route.ts"), /consumeRateLimit\(`review:\$\{getRequestIp\(request\)\}`, 5, rateWindow, \{ failClosed: true \}\)/);
  assert.doesNotMatch(read("../src/app/api/checkout/route.ts"), /failClosed/);
});
