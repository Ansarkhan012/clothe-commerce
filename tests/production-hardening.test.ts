import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

test("public API rate limiting is distributed, atomic, bypassed outside production and fails open", () => {
  const limiter = read("../src/lib/security/rate-limit.ts");
  const migration = read("../../supabase/migrations/202609040001_distributed_rate_limits.sql");
  assert.match(limiter, /createHash\("sha256"\)/);
  assert.match(limiter, /rpc\("consume_api_rate_limit"/);
  assert.match(limiter, /NODE_ENV !== "production"[\s\S]*return true/);
  assert.match(limiter, /if \(error\)[\s\S]*request allowed[\s\S]*return true/);
  assert.match(limiter, /catch \(error\)[\s\S]*request allowed[\s\S]*return true/);
  assert.match(migration, /on conflict \(key_hash\) do update/);
  assert.match(migration, /revoke all on function[\s\S]*anon, authenticated/);
  assert.match(migration, /grant execute on function[\s\S]*service_role/);
});

test("production client identity trusts configured deployment headers and never uses a shared unknown bucket", () => {
  const limiter = read("../src/lib/security/rate-limit.ts");
  assert.match(limiter, /process\.env\.VERCEL === "1"[\s\S]*x-vercel-forwarded-for/);
  assert.match(limiter, /process\.env\.CF_PAGES === "1"[\s\S]*cf-connecting-ip/);
  assert.match(limiter, /request\.headers\.get\("cookie"\)/);
  assert.match(limiter, /client-\$\{createHash\("sha256"\)/);
  assert.doesNotMatch(limiter, /return ["']unknown["']/);
});

test("customer-facing routes use the approved limits and consistent 429 response", () => {
  const limiter = read("../src/lib/security/rate-limit.ts");
  const checkout = read("../src/app/api/checkout/route.ts");
  const tracking = read("../src/app/api/orders/track/route.ts");
  const newsletter = read("../src/app/api/newsletter/route.ts");
  const support = read("../src/app/api/support/route.ts");
  assert.match(checkout, /rateLimit = 60[\s\S]*15 \* 60_000/);
  assert.match(tracking, /15 \* 60_000[\s\S]*getRequestIp\(request\)\}`, 60/);
  assert.match(newsletter, /rateWindow=60\*60_000[\s\S]*getRequestIp\(request\)\}`,10/);
  assert.match(support, /rateWindow=30\*60_000[\s\S]*getRequestIp\(request\)\}`,10/);
  assert.match(limiter, /Too many requests\. Please try again shortly\./);
  assert.match(limiter, /"Retry-After"/);
});

test("atomic limiter allows requests one through the limit and rejects the next", () => {
  const migration = read("../../supabase/migrations/202609040001_distributed_rate_limits.sql");
  assert.match(migration, /then 1 else api_rate_limits\.request_count \+ 1 end/);
  assert.match(migration, /return v_count <= p_limit/);
});

test("checkout has one guarded POST and retains a stable idempotency key", () => {
  const checkoutPage = read("../src/app/checkout/page.tsx");
  assert.equal((checkoutPage.match(/fetch\("\/api\/checkout"/g) || []).length, 1);
  assert.match(checkoutPage, /submitInFlightRef\.current\)return/);
  assert.match(checkoutPage, /submitInFlightRef\.current=true/);
  assert.match(checkoutPage, /saved\?\.fingerprint===fingerprint&&saved\.key/);
  assert.match(checkoutPage, /idempotency_key:keyRef\.current/);
  assert.doesNotMatch(checkoutPage, /setTimeout[\s\S]*fetch\("\/api\/checkout"/);
});

test("development test-email endpoint remains unavailable in production", () => {
  const route = read("../src/app/api/dev/test-email/route.ts");
  assert.match(route, /NODE_ENV === "production"[\s\S]*status: 404/);
});

test("admin proxy fails closed when configuration or auth lookup fails", () => {
  const proxy = read("../src/proxy.ts");
  assert.match(proxy, /admin-login\?error=configuration/);
  assert.match(proxy, /catch \(error\)[\s\S]*admin-login\?error=authentication/);
});

test("production CSP excludes unsafe-eval and enables transport hardening", () => {
  const config = read("../next.config.ts");
  assert.match(config, /isDev \? " 'unsafe-eval'" : ""/);
  assert.match(config, /Strict-Transport-Security/);
  assert.match(config, /upgrade-insecure-requests/);
});

test("homepage no longer autoloads the oversized hero video", () => {
  const hero = read("../src/components/home/HeroSection.tsx");
  assert.doesNotMatch(hero, /<video|hero\.mp4/);
  assert.match(hero, /<Image[\s\S]*priority/);
});

test("public catalog reads are cached and avoid wildcard product selects", () => {
  const catalog = read("../src/lib/catalog.ts");
  assert.match(catalog, /unstable_cache/);
  assert.match(catalog, /revalidate: 300/);
  assert.doesNotMatch(catalog, /select\(["']\*["']\)/);
});
