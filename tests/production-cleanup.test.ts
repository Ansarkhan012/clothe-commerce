import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
const sourceRoot = new URL("../src", import.meta.url);

function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? sourceFiles(path) : /\.(ts|tsx)$/.test(name) ? [path] : [];
  });
}

test("customer source contains only the final brand and no development placeholders", () => {
  const source = sourceFiles(fileURLToPath(sourceRoot)).map((path) => readFileSync(path, "utf8")).join("\n");
  assert.doesNotMatch(source, /Zaisha|Zari\s*&\s*Taanka|OWNER_REVIEW_REQUIRED|lorem ipsum|test@example\.com|Dressed in Someting|New Collection[^\n]*2025/i);
  assert.doesNotMatch(source, /Qurzaib/);
  assert.match(source, /QurZaib Fabrics/);
});

test("business details are centralized in explicit public configuration", () => {
  const business = read("../src/config/business.ts");
  const contact = read("../src/app/contact/page.tsx");
  const environment = read("../.env.example");
  for (const key of ["NEXT_PUBLIC_BUSINESS_EMAIL", "NEXT_PUBLIC_BUSINESS_PHONE", "NEXT_PUBLIC_BUSINESS_WHATSAPP", "NEXT_PUBLIC_BUSINESS_ADDRESS"]) {
    assert.match(business, new RegExp(key));
    assert.match(environment, new RegExp(key));
  }
  assert.match(contact, /Verified business contact details will be published after confirmation/);
});

test("storefront product links use the canonical slug-or-id helper", () => {
  const card = read("../src/components/common/ProductCard.tsx");
  const commerce = read("../src/lib/product-commerce.ts");
  const catalog = read("../src/lib/catalog.ts");
  const notFound = read("../src/app/product/[id]/page.tsx");
  assert.match(card, /const href=productHref\(product\)/);
  assert.match(commerce, /product\.slug \|\| product\.id/);
  assert.match(catalog, /query\.eq\("id", identifier\) : query\.eq\("slug", identifier\)/);
  assert.match(catalog, /eq\("is_active", true\)\.eq\("status", "active"\)/);
  assert.match(notFound, /if \(!product\) notFound\(\)/);
});

test("track order uses shared storefront chrome without changing tracking logic", () => {
  const chrome = read("../src/components/layout/StorefrontChrome.tsx");
  const tracking = read("../src/app/track-order/page.tsx");
  assert.match(chrome, /<Navbar \/>\{children\}<Newsletter \/><Footer \/>/);
  assert.doesNotMatch(chrome, /track-order/);
  assert.match(tracking, /fetch\("\/api\/orders\/track"/);
});

test("email and privileged admin secrets stay in server-only modules", () => {
  const emailConfig = read("../src/lib/email/config.ts");
  const service = read("../src/lib/supabase/service.ts");
  const purchase = read("../src/components/product/ProductPurchasePanel.tsx");
  assert.match(emailConfig, /process\.env\.RESEND_API_KEY/);
  assert.doesNotMatch(emailConfig, /NEXT_PUBLIC_RESEND/);
  assert.match(service, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.doesNotMatch(purchase, /RESEND_API_KEY|SUPABASE_SERVICE_ROLE_KEY/);
});

test("literal storefront image paths resolve to public assets", () => {
  const root = fileURLToPath(new URL("..", import.meta.url));
  const source = sourceFiles(fileURLToPath(sourceRoot)).map((path) => readFileSync(path, "utf8")).join("\n");
  const images = [...source.matchAll(/["'](\/images\/[^"'?`]+)["']/g)].map((match) => match[1]);
  const missing = [...new Set(images)].filter((image) => !existsSync(join(root, "public", ...image.split("/").filter(Boolean))));
  assert.deepEqual(missing, []);
});

test("sitemap never publishes a placeholder production domain", () => {
  const sitemap = read("../src/app/sitemap.ts");
  assert.match(sitemap, /NEXT_PUBLIC_SITE_URL/);
  assert.match(sitemap, /if\(!configuredSiteUrl\)return \[\]/);
  assert.doesNotMatch(sitemap, /\.example/);
});
