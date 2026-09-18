import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { MAX_PRODUCT_IMAGES, PRODUCT_IMAGE_LIMIT_MESSAGE, selectProductImageFiles } from "../src/lib/product-images.ts";
import { ProductInputSchema } from "../src/lib/validations/product.ts";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
const urls = Array.from({ length: 8 }, (_, index) => `https://example.com/product-${index + 1}.jpg`);
const product = {
  product_type:"unstitched" as const,title:"Image Limit Fixture",slug:"image-limit-fixture",short_description:null,description:null,
  category_id:null,subcategory_id:null,collection_ids:[],price:1000,sale_price:null,compare_at_price:null,base_sku:null,
  primary_color_id:null,additional_color_ids:[],featured:false,is_new:false,status:"active" as const,is_active:true,
  seo_title:null,seo_description:null,stock:1,variants:[],details:{pieces:3,fabric:"Lawn",work_type:null,season:null},
};

test("one through seven product images validate and eight are rejected", () => {
  assert.equal(MAX_PRODUCT_IMAGES,7);
  for(const count of [1,5,6,7]){
    const parsed=ProductInputSchema.safeParse({...product,images:urls.slice(0,count)});
    assert.equal(parsed.success,true,`${count} images should be accepted`);
    if(parsed.success)assert.deepEqual(parsed.data.images,urls.slice(0,count));
  }
  assert.equal(ProductInputSchema.safeParse({...product,images:urls}).success,false);
});

test("uploader accepts image six and seven but never selects image eight for upload", () => {
  assert.deepEqual(selectProductImageFiles(5,["six","seven"]),{accepted:["six","seven"],exceeded:false});
  assert.deepEqual(selectProductImageFiles(5,["six","seven","eight"]),{accepted:["six","seven"],exceeded:true});
  assert.deepEqual(selectProductImageFiles(7,["eight"]),{accepted:[],exceeded:true});
});

test("removing an image from seven restores one upload slot", () => {
  assert.deepEqual(selectProductImageFiles(6,["replacement"]),{accepted:["replacement"],exceeded:false});
});

test("add and edit use the shared limit and display clear feedback", () => {
  const editor=read("../src/components/admin/ProductEditor.tsx");
  assert.match(editor,/selectProductImageFiles\(images\.length/);
  assert.match(editor,/images\.length>=MAX_PRODUCT_IMAGES/);
  assert.match(editor,/Upload up to \{MAX_PRODUCT_IMAGES\} images/);
  assert.match(editor,/PRODUCT_IMAGE_LIMIT_MESSAGE/);
  assert.match(editor,/imageMessage\|\|images\.length>=MAX_PRODUCT_IMAGES/);
  assert.equal(PRODUCT_IMAGE_LIMIT_MESSAGE,"You can upload up to 7 images per product.");
  assert.doesNotMatch(editor,/slice\(0,10-images\.length\)|images\.length>=10/);
});

test("seven image URLs survive payload validation without slicing or duplication", () => {
  const seven=urls.slice(0,7);
  const parsed=ProductInputSchema.parse({...product,images:seven});
  assert.deepEqual(parsed.images,seven);
  assert.equal(new Set(parsed.images).size,7);
});

test("PDP gallery exposes every image with scrollable thumbnails and image switching", () => {
  const gallery=read("../src/components/product/ProductGallery.tsx");
  assert.match(gallery,/displayImages\.map\(\(image, index\)/);
  assert.match(gallery,/onClick=\{\(\) => setSelected\(index\)\}/);
  assert.match(gallery,/overflow-x-auto/);
  assert.match(gallery,/shrink-0/);
  assert.match(gallery,/Previous product image/);
  assert.match(gallery,/Next product image/);
  assert.doesNotMatch(gallery,/slice\(/);
});
