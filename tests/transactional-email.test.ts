import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

test("checkout creates the atomic order before attempting email and never makes delivery authoritative", () => {
  const route = read("../src/app/api/checkout/route.ts");
  const rpcPosition = route.indexOf('rpc(\n        "create_atomic_order"');
  const emailPosition = route.indexOf("sendOrderEmails(serviceClient, data[0].order_id)");
  assert.ok(rpcPosition >= 0);
  assert.ok(emailPosition > rpcPosition);
  assert.match(route, /if \(error \|\| !data\?\.\[0\]\)[\s\S]*sendOrderEmails/);
  assert.match(route, /customerEmailAccepted: emailResult\.customerEmailAccepted/);
});

test("email delivery is configuration-driven and secrets remain server-only", () => {
  const config = read("../src/lib/email/config.ts");
  const example = read("../.env.example");
  assert.match(config, /process\.env\.RESEND_API_KEY/);
  assert.match(config, /process\.env\.EMAIL_FROM/);
  assert.match(config, /process\.env\.ORDER_NOTIFICATION_EMAIL/);
  assert.match(config, /process\.env\.EMAIL_REPLY_TO/);
  assert.doesNotMatch(config + example, /NEXT_PUBLIC_RESEND_API_KEY/);
  assert.doesNotMatch(config, /onboarding@resend\.dev|clientdomain\.com|my-test-email/);
});

test("email events atomically prevent duplicates and allow failed or stale retries", () => {
  const migration = read("../../supabase/migrations/202609040002_order_email_events.sql");
  assert.match(migration, /unique \(order_id, email_type, recipient\)/);
  assert.match(migration, /on conflict \(order_id, email_type, recipient\) do nothing/);
  assert.match(migration, /v_event\.status = 'failed'/);
  assert.match(migration, /interval '15 minutes'/);
  assert.match(migration, /revoke all on table public\.order_email_events from public, anon, authenticated/);
  assert.match(migration, /grant execute[\s\S]*service_role/);
});

test("emails use trusted stored order data and PKR display formatting", () => {
  const data = read("../src/lib/email/order-email-data.ts");
  const shared = read("../src/emails/order-email-shared.ts");
  const confirmation = read("../src/emails/OrderConfirmationEmail.ts");
  assert.match(data, /from\("orders"\)/);
  assert.match(data, /from\("order_items"\)/);
  assert.match(shared, /`Rs\. \$\{Number\(value\)/);
  assert.doesNotMatch(shared + confirmation, /USD|US\$/);
});

test("provider failures are caught, persisted and reported without exposing secrets", () => {
  const delivery = read("../src/lib/email/tracked-delivery.ts");
  assert.match(delivery, /status: "sent_untracked"/);
  assert.match(delivery, /providerMessageId = data\.id/);
  assert.match(delivery, /idempotencyKey: `order-email\/\$\{event\.event_id\}`/);
  assert.match(delivery, /finalization\.error \|\| !finalization\.data/);
  assert.match(delivery, /status: "failed"/);
  assert.match(delivery, /last_error: message/);
  assert.match(delivery, /failedFinalization\.error \|\| !failedFinalization\.data/);
  assert.match(delivery, /original provider error was/);
  assert.doesNotMatch(delivery, /apiKey|RESEND_API_KEY/);
});

test("development test email endpoint is unavailable in production", () => {
  const route = read("../src/app/api/dev/test-email/route.ts");
  assert.match(route, /process\.env\.NODE_ENV === "production"/);
  assert.match(route, /status: 404/);
  assert.match(route, /getEmailConfig\(\)/);
  assert.doesNotMatch(route, /RESEND_API_KEY|re_[A-Za-z0-9]/);
});
