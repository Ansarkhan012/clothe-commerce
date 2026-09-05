import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

test("public API rate limiting is distributed, atomic and fail closed", () => {
  const limiter = read("../src/lib/security/rate-limit.ts");
  const migration = read("../../supabase/migrations/202609040001_distributed_rate_limits.sql");
  assert.match(limiter, /createHash\("sha256"\)/);
  assert.match(limiter, /rpc\("consume_api_rate_limit"/);
  assert.match(limiter, /if \(error\)[\s\S]*return false/);
  assert.match(migration, /on conflict \(key_hash\) do update/);
  assert.match(migration, /revoke all on function[\s\S]*anon, authenticated/);
  assert.match(migration, /grant execute on function[\s\S]*service_role/);
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
