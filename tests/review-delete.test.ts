import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { deleteReview } from "../src/lib/review-moderation.ts";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
const ID = "11111111-1111-4111-8111-111111111111";

// Minimal fake of the Supabase query builder: records every call and simulates the rows table.
function fakeClient(rows: { id: string; status: string }[]) {
  const calls: string[] = [];
  const client = {
    from(table: string) {
      calls.push(`from:${table}`);
      let target = "";
      const builder = {
        delete() { calls.push("delete"); return builder; },
        eq(column: string, value: string) { calls.push(`eq:${column}=${value}`); target = value; return builder; },
        select(columns: string) { calls.push(`select:${columns}`); return builder; },
        async maybeSingle() {
          const index = rows.findIndex((row) => row.id === target);
          if (index < 0) return { data: null, error: null };
          const [removed] = rows.splice(index, 1);
          return { data: { id: removed.id }, error: null };
        },
      };
      return builder;
    },
  };
  return { client: client as unknown as Parameters<typeof deleteReview>[0], calls, rows };
}

for (const status of ["pending", "approved", "rejected", "hidden"]) {
  test(`admin deletion removes a ${status} review and touches nothing else`, async () => {
    const other = { id: "22222222-2222-4222-8222-222222222222", status: "approved" };
    const fake = fakeClient([{ id: ID, status }, other]);
    assert.equal(await deleteReview(fake.client, ID), "deleted");
    assert.deepEqual(fake.rows, [other], "only the selected review is removed");
    assert.deepEqual(fake.calls, ["from:product_reviews", "delete", `eq:id=${ID}`, "select:id"], "single-row delete by id on product_reviews only, no status filter");
  });
}

test("invalid UUIDs are rejected before any database call", async () => {
  for (const bad of ["not-a-uuid", "", "1 or 1=1", "../reviews", `${ID}' --`]) {
    const fake = fakeClient([{ id: ID, status: "approved" }]);
    assert.equal(await deleteReview(fake.client, bad), "invalid", bad);
    assert.equal(fake.calls.length, 0);
  }
});

test("unknown review reports not_found", async () => {
  const fake = fakeClient([]);
  assert.equal(await deleteReview(fake.client, ID), "not_found");
});

test("database errors propagate (never reported as deleted)", async () => {
  const client = { from: () => ({ delete: () => ({ eq: () => ({ select: () => ({ maybeSingle: async () => ({ data: null, error: new Error("boom") }) }) }) }) }) };
  await assert.rejects(deleteReview(client as unknown as Parameters<typeof deleteReview>[0], ID), /boom/);
});

test("DELETE endpoint: admin first, 400/404, cache revalidation, queued photo cleanup", () => {
  const route = read("../src/app/api/admin/reviews/[id]/route.ts");
  const handler = route.slice(route.indexOf("export async function DELETE"));
  assert.ok(handler.indexOf("await requireAdmin()") > 0 && handler.indexOf("await requireAdmin()") < handler.indexOf("deleteReview("), "authorization before any deletion");
  assert.match(handler, /result === "invalid"\) return Response\.json\(\{ message: "Invalid review" \}, \{ status: 400 \}\)/);
  assert.match(handler, /result === "not_found"\) return Response\.json\(\{ message: "Review not found" \}, \{ status: 404 \}\)/);
  assert.match(handler, /revalidateTag\(REVIEWS_CACHE_TAG, \{ expire: 0 \}\)/, "product lists, summaries and homepage feed refresh");
  assert.match(handler, /processReviewImageDeletions\(serviceClient\)/, "uses the existing queue-based Storage cleanup");
  assert.match(handler, /catch \(error\) \{\s*return adminErrorResponse\(error\);/, "401/403 for non-admins, generic 500 otherwise");
  assert.doesNotMatch(handler, /storage\.from|\.remove\(|storage_path|request\.json/, "no client-supplied Storage paths; no request body");
  assert.doesNotMatch(route, /\.in\("id"|\.delete\(\)\.(neq|in|gt|lt|not)\(/, "no bulk deletion");
});

test("no public delete path: the public review API and SQL expose no deletion", () => {
  assert.doesNotMatch(read("../src/app/api/reviews/route.ts"), /export async function DELETE|\.delete\(\)/);
  for (const migration of ["202609300001_product_reviews.sql", "202610010001_review_images.sql"]) {
    assert.doesNotMatch(read(`../../supabase/migrations/${migration}`), /function public\.delete_|grant[^;]*delete[^;]*to (anon|authenticated)/i, migration);
  }
  assert.match(read("../../supabase/migrations/202610010001_review_images.sql"), /references public\.product_reviews\(id\) on delete cascade/, "photo rows cascade with the review");
});

test("admin UI: separate Delete action with explicit two-step confirmation", () => {
  const ui = read("../src/components/admin/ReviewModerationActions.tsx");
  assert.match(ui, /onClick=\{\(\) => setConfirming\(true\)\}[^>]*>Delete</, "first click only asks for confirmation");
  assert.match(ui, /Permanently delete this review and its photos\? This cannot be undone\./);
  assert.match(ui, /onClick=\{\(\) => void remove\(\)\}[^>]*>\{busy \? "Deleting…" : "Delete permanently"\}/);
  assert.match(ui, /method: "DELETE"/);
  assert.match(ui, /Keep review/);
  assert.match(ui, /border-red-700[^"]*text-red-700/, "visually distinct from Approve/Reject/Hide");
  const page = read("../src/app/admin/reviews/page.tsx");
  assert.match(page, /<ReviewModerationActions id=\{review\.id\} status=\{review\.status\} \/>/, "rendered for every review, any status");
});
