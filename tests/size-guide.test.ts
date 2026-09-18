import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { normalizeDetailsForType, serializeWritableProductDetails } from "../src/lib/admin/product-editor-state.ts";
import { ProductInputSchema } from "../src/lib/validations/product.ts";
import { hasGarmentSizeGuide, hasMeasurementsForSize, readGarmentSizeGuide, updateGarmentMeasurement } from "../src/lib/size-guide.ts";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
const variant = { id:"1c3b389d-3bdb-4891-9ef6-590e68434c19",color_id:"a906f14f-6b0f-4fc7-be76-7b7193cbd295",size:"M" as const,sku:"QF-RTW-M",stock_quantity:5,price_override:null,image_url:null,is_active:true };
const product = {
  product_type:"ready_to_wear" as const,title:"Measured Kurta",slug:"measured-kurta",short_description:null,description:null,
  category_id:null,subcategory_id:null,collection_ids:[],price:5000,sale_price:null,compare_at_price:null,base_sku:null,
  primary_color_id:null,additional_color_ids:[],images:["https://example.com/product.jpg"],featured:false,is_new:false,
  status:"active" as const,is_active:true,seo_title:null,seo_description:null,stock:0,variants:[variant],
  details:{garment_type:"Kurta",fabric:"Lawn",work_type:null},
};

test("RTW measurements are optional and decimal values validate", () => {
  assert.equal(ProductInputSchema.safeParse(product).success, true);
  const measured = { ...product, details:{...product.details,shirt:{size_guide:{M:{chest:21.5,shirt_length:38.25}}}} };
  assert.equal(ProductInputSchema.safeParse(measured).success, true);
});

test("measurement editing preserves variant UUID, SKU and stock", () => {
  const variants = structuredClone(product.variants);
  const details = updateGarmentMeasurement(product.details, "shirt", "M", "chest", "21.5");
  assert.deepEqual(product.variants, variants);
  assert.equal(readGarmentSizeGuide(details).shirt.M?.chest, 21.5);
});

test("existing measurements load, update and remain in normalized RTW details", () => {
  const stored = {garment_type:"Kurta",fabric:"Lawn",shirt:{size_guide:{S:{shoulder:14}}},trouser:{size_guide:{S:{trouser_length:38}}}};
  const loaded = readGarmentSizeGuide(stored);
  assert.equal(loaded.shirt.S?.shoulder, 14);
  const updated = updateGarmentMeasurement(stored,"shirt","S","shoulder","14.25");
  const normalized = normalizeDetailsForType("ready_to_wear",updated);
  assert.equal(readGarmentSizeGuide(normalized).shirt.S?.shoulder,14.25);
  assert.equal(readGarmentSizeGuide(normalized).trouser.S?.trouser_length,38);
});

test("edit serialization removes database metadata and preserves RTW size guides", () => {
  const loaded = {
    product_id:"b9567753-2d38-4091-bbc7-bfaccb46c833",
    created_at:"2026-09-01T00:00:00Z",
    updated_at:"2026-09-18T00:00:00Z",
    garment_type:"3-Piece Suit",
    fabric:"Lawn",
    work_type:"Printed",
    care_instructions:"Dry clean",
    shirt:{size_guide:{L:{chest:22.5,shirt_length:40}}},
    trouser:{size_guide:{L:{trouser_length:39,waist_belt:18.5}}},
  };
  const details = serializeWritableProductDetails("ready_to_wear",loaded);
  assert.equal("product_id" in details,false);
  assert.equal("created_at" in details,false);
  assert.equal("updated_at" in details,false);
  assert.equal(details.garment_type,"3-Piece Suit");
  assert.equal(details.fabric,"Lawn");
  assert.equal(details.work_type,"Printed");
  assert.equal(details.care_instructions,"Dry clean");
  assert.equal(readGarmentSizeGuide(details).shirt.L?.chest,22.5);
  assert.equal(readGarmentSizeGuide(details).trouser.L?.trouser_length,39);
  assert.equal(ProductInputSchema.safeParse({...product,details}).success,true);
});

test("empty RTW guide stays valid while unrelated product details remain unaffected", () => {
  assert.equal(hasGarmentSizeGuide(readGarmentSizeGuide(product.details)),false);
  const unstitched = normalizeDetailsForType("unstitched",{pieces:3,fabric:"Lawn",shirt:{included:true}});
  const loose = normalizeDetailsForType("loose_fabric",{fabric:"Lawn",selling_unit:"meter",width:42,minimum_quantity:1,quantity_step:.5});
  assert.deepEqual(unstitched.shirt,{included:true});
  assert.equal(loose.quantity_step,.5);
});

test("admin measurement matrix is RTW-only and uses existing variant sizes", () => {
  const editor = read("../src/components/admin/ProductEditor.tsx");
  const matrix = read("../src/components/admin/GarmentMeasurementsEditor.tsx");
  assert.match(editor,/type==="ready_to_wear"&&<GarmentMeasurementsEditor/);
  assert.match(editor,/variants\.some\(variant=>variant\.is_active&&variant\.size===size\)/);
  assert.match(matrix,/step="0\.01"/);
  assert.match(matrix,/Optional garment measurements in inches/);
});

test("add and edit flows persist and reload measurements through existing product details", () => {
  const editor = read("../src/components/admin/ProductEditor.tsx");
  const create = read("../src/app/api/admin/products/route.ts");
  const editPage = read("../src/app/admin/products/[id]/edit/page.tsx");
  const update = read("../src/app/api/admin/products/[id]/route.ts");
  const migration = read("../../supabase/migrations/202609040004_product_domain_architecture.sql");
  assert.match(editor,/writableDetails=serializeWritableProductDetails\(type,\{\.\.\.details/);
  assert.match(editor,/details:writableDetails/);
  assert.match(create,/p_product: parsed\.data/);
  assert.match(update,/p_product: parsed\.data/);
  assert.match(editPage,/details:product_details\(\*\)/);
  assert.match(migration,/p_product#>'\{details,shirt\}'/);
  assert.match(migration,/p_product#>'\{details,trouser\}'/);
});

test("PDP only offers a guide with data and highlights the selected size", () => {
  const panel = read("../src/components/product/ProductPurchasePanel.tsx");
  const dialog = read("../src/components/product/SizeGuideDialog.tsx");
  assert.match(panel,/hasSelectedSizeGuide&&<button/);
  assert.match(panel,/Boolean\(selected\)&&hasMeasurementsForSize/);
  assert.match(panel,/>View Size Guide<\/button>/);
  assert.match(panel,/selectedSize=\{size\}/);
  assert.match(dialog,/availableSizes\.includes\(size\)/);
  assert.match(dialog,/selectedSize===size/);
  assert.match(dialog,/role="dialog"/);
  assert.match(dialog,/aria-modal="true"/);
  assert.match(dialog,/Kameez and trouser measurement diagram/);
});

test("guide action requires measurements for the currently selected size", () => {
  const guide = readGarmentSizeGuide({shirt:{size_guide:{L:{chest:22}}}});
  assert.equal(hasMeasurementsForSize(guide,null),false);
  assert.equal(hasMeasurementsForSize(guide,"M"),false);
  assert.equal(hasMeasurementsForSize(guide,"L"),true);
});

test("size guide remains informational and does not touch cart or checkout", () => {
  const dialog = read("../src/components/product/SizeGuideDialog.tsx");
  const panel = read("../src/components/product/ProductPurchasePanel.tsx");
  assert.doesNotMatch(dialog,/useCartStore|addToCart|fetch\(|router\.push/);
  assert.match(panel,/variantId:selected\?\.id/);
  assert.match(panel,/router\.push\("\/checkout"\)/);
});
