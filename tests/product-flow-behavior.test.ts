import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { initializeEditorDetails, normalizeDetailsForType, normalizeVariantsForType, subcategoriesForCategory, updatePieceDetail } from "../src/lib/admin/product-editor-state.ts";
import { sanitizePersistedCart } from "../src/lib/cart-persistence.ts";
import { activeVariants, productInventory, resolveProductVariant } from "../src/lib/product-commerce.ts";

const productId = "351400bf-6c57-4500-ada4-d4e22495eb65";
const ivory = "a906f14f-6b0f-4fc7-be76-7b7193cbd295";
const rose = "e5aae973-44ed-468e-b949-118fdc4120df";
const variants = [
  { id:"1c3b389d-3bdb-4891-9ef6-590e68434c19",product_id:productId,color_id:ivory,size:"S" as const,sku:"QF-RTW-001-IV-S",stock_quantity:3,price_override:null,image_url:null,is_active:true },
  { id:"0f2b64f0-a367-4ccb-a880-2f32ad204e7d",product_id:productId,color_id:ivory,size:"M" as const,sku:"QF-RTW-001-IV-M",stock_quantity:0,price_override:null,image_url:null,is_active:true },
  { id:"00000000-0000-4000-8000-000000000031",product_id:productId,color_id:rose,size:"S" as const,sku:"QF-RTW-001-RO-S",stock_quantity:2,price_override:null,image_url:null,is_active:true },
  { id:"00000000-0000-4000-8000-000000000032",product_id:productId,color_id:ivory,size:"L" as const,sku:"INACTIVE",stock_quantity:20,price_override:null,image_url:null,is_active:false },
];

test("S and M selections resolve their exact UUID and SKU in either switching direction",()=>{
  const active=activeVariants({variants});
  const small=resolveProductVariant(active,"ready_to_wear",ivory,"S");
  const medium=resolveProductVariant(active,"ready_to_wear",ivory,"M");
  assert.deepEqual([small?.id,small?.sku],[variants[0].id,variants[0].sku]);
  assert.deepEqual([medium?.id,medium?.sku],[variants[1].id,variants[1].sku]);
  assert.equal(resolveProductVariant(active,"ready_to_wear",rose,"S")?.sku,"QF-RTW-001-RO-S");
  assert.equal(resolveProductVariant(active,"ready_to_wear",ivory,"L"),undefined);
  assert.equal(Number(medium?.stock_quantity)>0,false);
});

const cartLine=(variant:typeof variants[number],quantity:number)=>({id:productId,title:"Ivory Bloom",price:4999,image:"https://example.com/ivory.jpg",productType:"ready_to_wear" as const,variantId:variant.id,sku:variant.sku,size:variant.size,color:"Ivory",quantity,stock:variant.stock_quantity,quantityStep:1,minimumQuantity:1,lineKey:`${productId}:${variant.id}`});

test("persisted cart keeps S and M as separate exact variant snapshots",()=>{
  const lines=sanitizePersistedCart([cartLine(variants[1],2),cartLine(variants[0],1)]);
  assert.equal(lines.length,2);
  assert.deepEqual(lines.map(line=>[line.variantId,line.sku,line.size,line.quantity]),[[variants[1].id,variants[1].sku,"M",2],[variants[0].id,variants[0].sku,"S",1]]);
});

test("malformed persisted variant metadata is rejected",()=>{
  assert.deepEqual(sanitizePersistedCart([{...cartLine(variants[0],1),sku:variants[1].sku,lineKey:`${productId}:base`}]),[]);
  assert.deepEqual(sanitizePersistedCart([{...cartLine(variants[0],1),variantId:undefined}]),[]);
});

test("unstitched nested details survive unrelated edits and intentional edits",()=>{
  const stored={pieces:3,fabric:"Lawn",shirt:{included:true,fabric:"Lawn",length:2.5,width:1.1},trouser:{included:true,fabric:"Cotton",length:2.3,width:1},dupatta:{included:true,fabric:"Chiffon",length:2.5,width:1.2}};
  const loaded=initializeEditorDetails(stored);
  const unrelatedPayload={title:"Renamed",price:5200,details:loaded};
  assert.deepEqual(unrelatedPayload.details,stored);
  const edited=updatePieceDetail(loaded,"shirt","length","2.75");
  assert.equal((edited.shirt as {length:number}).length,2.75);
  assert.deepEqual((edited.trouser as object),stored.trouser);
  assert.notStrictEqual(loaded,stored);
});

test("editor type normalization preserves relevant state and variant IDs",()=>{
  const rows=normalizeVariantsForType("unstitched",variants.slice(0,1));
  assert.equal(rows[0].id,variants[0].id);
  assert.equal(rows[0].size,null);
  assert.deepEqual(normalizeVariantsForType("loose_fabric",rows),[]);
  const details=normalizeDetailsForType("unstitched",{garment_type:"Kurta",pieces:3,shirt:{included:true},selling_unit:"meter"});
  assert.equal(details.garment_type,undefined);
  assert.deepEqual(details.shirt,{included:true});
});

test("subcategory choices are scoped to their selected parent",()=>{
  const categories=[{id:"root",parent_id:null},{id:"child",parent_id:"root"},{id:"other",parent_id:"else"}] as never[];
  assert.deepEqual(subcategoriesForCategory(categories,"root").map(item=>item.id),["child"]);
});

test("authoritative inventory handles every variant-backed product type",()=>{
  for(const product_type of ["ready_to_wear","unstitched","dupatta","shawl"] as const) assert.equal(productInventory({product_type,stock:99,variants:[{is_active:true,stock_quantity:2},{is_active:false,stock_quantity:30}]}),2);
  assert.equal(productInventory({product_type:"loose_fabric",stock:2.5,variants:[]}),2.5);
});

test("checkout and admin views use canonical identity and inventory helpers",()=>{
  const checkout=readFileSync(new URL("../src/app/checkout/page.tsx",import.meta.url),"utf8");
  const inventory=readFileSync(new URL("../src/app/admin/inventory/page.tsx",import.meta.url),"utf8");
  const dashboard=readFileSync(new URL("../src/app/admin/page.tsx",import.meta.url),"utf8");
  assert.match(checkout,/variant_id:variantId\?\?null/);
  assert.match(inventory,/productInventory\(/);
  assert.match(dashboard,/productInventory\(product\)/);
});
