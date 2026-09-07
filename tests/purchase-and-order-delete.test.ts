import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
const purchase = read("../src/components/product/ProductPurchasePanel.tsx");
const productPage = read("../src/app/product/[id]/page.tsx");
const catalog = read("../src/lib/catalog.ts");
const orderRoute = read("../src/app/api/admin/orders/[id]/route.ts");
const orderActions = read("../src/components/admin/OrderActions.tsx");
const ordersPage = read("../src/app/admin/orders/page.tsx");

test("Buy Now reuses the exact selected cart line and navigates once", () => {
  assert.match(purchase, /const selectedCartLine=/);
  assert.equal((purchase.match(/addToCart\(selectedCartLine\(\)\)/g) ?? []).length, 2);
  assert.match(purchase, /variantId:selected\?\.id/);
  assert.match(purchase, /lineKey:`\$\{product\.id\}:\$\{selected\?\.id\?\?"base"\}`/);
  assert.match(purchase, /if\(!available\|\|buyInFlight\.current\)return/);
  assert.match(purchase, /router\.push\("\/checkout"\)/);
});

test("Buy Now matches selection, stock, and measured quantity availability", () => {
  assert.match(purchase, /complete&&validQuantity&&stock>=quantity&&stock>0/);
  assert.match(purchase, /disabled=\{!available\|\|buying\}/);
  assert.match(purchase, /resolveProductVariant\(variants,type,colorId,size\)/);
  assert.match(purchase, /isValidMeasuredQuantity\(quantity,minimum,step\)/);
  assert.match(purchase, /quantityStep:step,minimumQuantity:minimum/);
});

test("related products use one category query, prefer matching type, and hide when empty", () => {
  assert.match(productPage, /getRelatedProducts\(product\.category_id, product\.id, product\.product_type\)/);
  assert.match(catalog, /eq\("is_active", true\)\.eq\("status", "active"\)\.eq\("category_id", categoryId\)\.neq\("id", excludedId\)/);
  assert.match(catalog, /right\.product_type === productType/);
  assert.match(catalog, /slice\(0, 4\)/);
  assert.match(productPage, /related\.length > 0 && <section/);
  assert.match(productPage, /<ProductCard key=\{item\.id\} product=\{item\}/);
});

test("order delete is admin-only, UUID validated, and final-status restricted", () => {
  assert.match(orderRoute, /export async function DELETE/);
  assert.match(orderRoute, /requireAdmin\(\)/);
  assert.match(orderRoute, /z\.string\(\)\.uuid\(\)/);
  assert.match(orderRoute, /new Set\(\["cancelled", "delivered"\]\)/);
  assert.match(orderRoute, /status: 409/);
  for (const status of ["pending", "confirmed", "processing", "packed", "ready_to_ship", "shipped", "out_for_delivery"]) {
    assert.equal(new Set(["cancelled", "delivered"]).has(status), false);
  }
});

test("order delete removes dependencies in order and never changes inventory", () => {
  const email = orderRoute.indexOf('"order_email_events"');
  const history = orderRoute.indexOf('"order_status_history"', email);
  const items = orderRoute.indexOf('"order_items"', history);
  const order = orderRoute.indexOf('.from("orders")\n      .delete()', items);
  assert.ok(email > -1 && history > email && items > history && order > items);
  assert.doesNotMatch(orderRoute.slice(orderRoute.indexOf("export async function DELETE")), /update_order_status|create_atomic_order|inventory_restocked_at|from\("products"\)|from\("product_variants"\)|\.rpc\(/);
});

test("order delete UI appears only for final orders and handles confirmation safely", () => {
  assert.match(orderActions, /new Set\(\["cancelled", "delivered"\]\)/);
  assert.match(orderActions, /\{canDelete && <button/);
  assert.match(orderActions, /Delete this order\?/);
  assert.match(orderActions, /Inventory will not be changed/);
  assert.match(orderActions, /showModal\(\)/);
  assert.match(orderActions, /onCancel=/);
  assert.match(orderActions, /requestInFlight\.current/);
  assert.match(ordersPage, /setOrders\(current=>current\.filter/);
  assert.match(ordersPage, /Order deleted successfully/);
});
