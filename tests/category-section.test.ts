import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read=(path:string)=>readFileSync(new URL(path,import.meta.url),"utf8");
const catalog=read("../src/lib/catalog.ts");
const section=read("../src/components/home/CategorySection.tsx");
const admin=read("../src/components/admin/TaxonomyManager.tsx");
const css=read("../src/app/globals.css");
const migration=read("../../supabase/migrations/202609040004_product_domain_architecture.sql");

test("existing category schema already provides nullable image_url",()=>assert.match(migration,/description text, image_url text, parent_id/i));
test("homepage category query serializes image_url",()=>{assert.match(catalog,/select\("name,slug,image_url"\)/);assert.match(catalog,/image_url:row\.image_url\?\?null/)});
test("homepage exposes only active top-level categories",()=>{assert.match(catalog,/eq\("is_active",true\)\.is\("parent_id",null\)/);assert.match(catalog,/order\("sort_order"\)/)});
test("category with an image uses Next Image and object-cover",()=>{assert.match(section,/category\.image_url \? <Image/);assert.match(section,/className="object-cover/);assert.match(section,/sizes="\(max-width: 640px\) 96px, 144px"/)});
test("category without an image uses neutral initial fallback",()=>{assert.match(section,/bg-brand-cream-dark/);assert.match(section,/category\.name\.trim\(\)\.charAt\(0\)\.toUpperCase\(\)/);assert.doesNotMatch(section,/absolute inset-0 bg-brand-green/)});
test("category cards use the canonical slug route",()=>assert.match(section,/href=\{`\/collections\/\$\{category\.slug\}`\}/));
test("carousel remains scrollable while native scrollbars are hidden",()=>{assert.match(section,/overflow-x-auto/);assert.match(section,/scrollbar-hide/);assert.match(css,/scrollbar-width: none/);assert.match(css,/::-webkit-scrollbar \{ display: none; \}/)});
test("carousel controls derive disabled state from scroll position",()=>{assert.match(section,/disabled=\{!canBack\}/);assert.match(section,/disabled=\{!canForward\}/);assert.match(section,/scrollBy\(\{ left:.*behavior: "smooth"/)});
test("admin category images validate, upload, preview, and persist image_url",()=>{assert.match(admin,/CATEGORY_IMAGE_TYPES/);assert.match(admin,/5\*1024\*1024/);assert.match(admin,/storage\.from\("products"\)\.upload/);assert.match(admin,/categories\/\$\{crypto\.randomUUID\(\)\}/);assert.match(admin,/image_url:form\.image_url\|\|null/);assert.match(admin,/Category image/);assert.match(admin,/preview/)});
