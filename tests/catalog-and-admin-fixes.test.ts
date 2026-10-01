import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { hasValidCatalogFilterValues } from "../src/lib/catalog-filters.ts";
import { productImageProblem } from "../src/lib/product-images.ts";
import { ProductInputSchema } from "../src/lib/validations/product.ts";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
const none = { category: "", productType: "", size: "" };

test("URL filter values that previously caused HTTP 500 are rejected before querying", () => {
  assert.equal(hasValidCatalogFilterValues(none), true);
  assert.equal(hasValidCatalogFilterValues({ ...none, category: "lawn" }), false);
  assert.equal(hasValidCatalogFilterValues({ ...none, category: "a906f14f-6b0f-4fc7-be76-7b7193cbd295" }), true);
  assert.equal(hasValidCatalogFilterValues({ ...none, productType: "bogus" }), false);
  assert.equal(hasValidCatalogFilterValues({ ...none, productType: "ready_to_wear" }), true);
  assert.equal(hasValidCatalogFilterValues({ ...none, size: "XXXL" }), false);
  assert.equal(hasValidCatalogFilterValues({ ...none, size: "XXL" }), true);
  const catalog = read("../src/lib/catalog.ts");
  assert.ok(catalog.indexOf("hasValidCatalogFilterValues(filters)") < catalog.indexOf("publicCatalogClient().from(\"products\").select(select"));
});

test("size filter restricts parent products and keeps each product's full variant list", () => {
  const catalog = read("../src/lib/catalog.ts");
  assert.doesNotMatch(catalog, /product_variants\.size/, "the old embed filter trimmed variants without filtering products");
  assert.match(catalog, /size_filter:product_variants!inner\(size\)/);
  assert.match(catalog, /\.eq\("size_filter\.size", filters\.size\)\.eq\("size_filter\.is_active", true\)/);
  assert.match(catalog, /delete product\.size_filter/);
});

test("admin product mutations invalidate storefront caches and authorize first", () => {
  const create = read("../src/app/api/admin/products/route.ts");
  const update = read("../src/app/api/admin/products/[id]/route.ts");
  assert.equal((create.match(/revalidateTag\("products", \{ expire: 0 \}\)/g) ?? []).length, 1);
  assert.equal((update.match(/revalidateTag\("products", \{ expire: 0 \}\)/g) ?? []).length, 3, "PUT, archive PATCH and DELETE");
  assert.ok(create.indexOf("requireAdmin()") < create.indexOf("ProductInputSchema.safeParse"));
  assert.ok(update.indexOf("requireAdmin()") < update.indexOf("ProductInputSchema.safeParse"));
  for (const source of [create, update]) assert.match(source, /if \(error instanceof AdminAuthorizationError\) return adminErrorResponse\(error\);/);
});

const baseProduct = {
  product_type: "ready_to_wear", title: "Kurta", slug: "kurta", short_description: null, description: null, category_id: null, subcategory_id: null,
  collection_ids: [], price: 5000, sale_price: null, compare_at_price: null, base_sku: null, primary_color_id: null, additional_color_ids: [],
  images: ["https://x.supabase.co/a.jpg"], featured: false, is_new: false, status: "active", is_active: true, seo_title: null, seo_description: null,
  stock: 0, details: { garment_type: "Kurta", fabric: "Lawn" },
};
const variant = (sku: string, size: string, is_active = true) => ({ color_id: "a906f14f-6b0f-4fc7-be76-7b7193cbd295", size, sku, stock_quantity: 1, price_override: null, image_url: null, is_active });

test("duplicate colour/size rows (including inactive ones) get a clear validation error", () => {
  const duplicate = ProductInputSchema.safeParse({ ...baseProduct, variants: [variant("A", "M"), variant("B", "M", false)] });
  assert.equal(duplicate.success, false);
  assert.match(duplicate.error!.issues.map((issue) => issue.message).join(" "), /combination can only be listed once/);
  assert.equal(ProductInputSchema.safeParse({ ...baseProduct, variants: [variant("A", "M"), variant("B", "L", false)] }).success, true);
});

test("saved variants are deactivated/reactivated instead of silently disappearing", () => {
  const editor = read("../src/components/admin/ProductEditor.tsx");
  assert.match(editor, /variant\(i,"is_active",!v\.is_active\)/);
  assert.match(editor, /Inactive — hidden from customers/);
  assert.match(editor, /\{v\.id\?/, "only unsaved rows can be removed outright");
});

test("image uploads match the Storage policy and keep images uploaded before a failure", () => {
  assert.equal(productImageProblem({ name: "look.JPG", type: "image/jpeg", size: 1000 }), null);
  assert.equal(productImageProblem({ name: "look.webp", type: "image/webp", size: 1000 }), null);
  assert.match(productImageProblem({ name: "IMG_1.HEIC", type: "image/heic", size: 1000 })!, /JPG, PNG, WebP or AVIF/);
  assert.match(productImageProblem({ name: "a.gif", type: "image/gif", size: 1000 })!, /not supported/);
  assert.match(productImageProblem({ name: "big.png", type: "image/png", size: 6 * 1024 * 1024 })!, /5 MB/);
  assert.match(productImageProblem({ name: "fake.png", type: "text/html", size: 10 })!, /JPG/);
  const editor = read("../src/components/admin/ProductEditor.tsx");
  assert.match(editor, /finally\{if\(urls\.length\)setImages\(v=>\[\.\.\.v,\.\.\.urls\]\)/);
  assert.match(editor, /accept=\{PRODUCT_IMAGE_ACCEPT\}/);
  const policy = read("../../supabase/migrations/202608310001_critical_security_fixes.sql");
  assert.match(policy, /in \('jpg','jpeg','png','webp','avif'\)/);
});

test("order_items size migration widens the constraint to every variant size", () => {
  const sql = read("../../supabase/migrations/202609300002_order_items_extended_sizes.sql");
  assert.match(sql, /check \(size is null or size in \('XS','S','M','L','XL','XXL'\)\) not valid/);
  assert.match(sql, /validate constraint order_items_size_check/);
});

test("main navigation Unstitched link uses a valid product-type filter (was HTTP 500 in production)", () => {
  const navbar = read("../src/components/layout/Navbar.tsx");
  assert.match(navbar, /href: "\/collections\?type=unstitched", label: "Unstitched"/);
  for (const [, query] of navbar.matchAll(/href: "\/collections\?([^"]+)"/g)) {
    const params = new URLSearchParams(query);
    assert.equal(hasValidCatalogFilterValues({ category: params.get("category") ?? "", productType: params.get("type") ?? "", size: params.get("size") ?? "" }), true, query);
  }
});

test("product editor cannot be natively submitted before hydration (would GET-submit named fields and drop edits)", () => {
  const editor = read("../src/components/admin/ProductEditor.tsx");
  assert.match(editor, /const hydrated=useSyncExternalStore\(\(\)=>\(\)=>\{\},\(\)=>true,\(\)=>false\)/);
  assert.match(editor, /<button disabled=\{!hydrated\|\|busy\|\|uploading\|\|images\.length===0\}/);
  // Server-rendered public forms must not rely on named fields (a premature native submit would put PII in the URL).
  for (const path of ["../src/app/admin-login/page.tsx", "../src/app/track-order/page.tsx", "../src/app/contact/page.tsx", "../src/components/common/Newsletter.tsx"]) {
    assert.doesNotMatch(read(path), /<(input|select|textarea)[^>]* name=/, path);
  }
});
