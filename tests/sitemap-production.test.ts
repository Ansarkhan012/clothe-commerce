import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
const sitemap = read("../src/app/sitemap.ts");
const robots = read("../src/app/robots.ts");
const catalog = read("../src/lib/catalog.ts");

test("sitemap generation is deferred until runtime catalog access is available", () => {
  assert.match(sitemap, /export const dynamic = "force-dynamic"/);
  assert.match(sitemap, /await getSitemapProducts\(\)/);
});

test("sitemap products are limited to public published catalog rows", () => {
  assert.match(catalog, /from\("products"\)\.select\("id,slug,updated_at"\)\.eq\("is_active", true\)\.eq\("status", "active"\)/);
  assert.match(sitemap, /\/product\/\$\{encodeURIComponent\(product\.slug\|\|product\.id\)\}/);
});

test("sitemap static routes exclude private and transactional areas", () => {
  const paths = sitemap.match(/const paths=\[([^;]+)\];/)?.[1] ?? "";
  assert.doesNotMatch(paths, /admin|checkout|cart|account|api/);
});

test("robots uses the configured production origin for its sitemap directive", () => {
  assert.match(robots, /process\.env\.NEXT_PUBLIC_SITE_URL/);
  assert.match(robots, /new URL\(configuredSiteUrl\)\.origin/);
  assert.match(robots, /\/sitemap\.xml/);
  assert.match(robots, /disallow: \["\/admin", "\/admin-portal", "\/api\/"\]/);
});
