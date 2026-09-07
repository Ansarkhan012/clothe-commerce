import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
const route = read("../src/app/api/admin/products/[id]/route.ts");
const actions = read("../src/components/admin/ProductActions.tsx");
const products = read("../src/app/admin/products/page.tsx");
const checkout = read("../src/app/checkout/page.tsx");
const layout = read("../src/app/layout.tsx");

test("admin product deletion is privileged and checks all order history", () => {
  assert.match(route, /export async function DELETE/);
  assert.match(route, /requireAdmin\(\)/);
  assert.match(route, /from\("order_items"\)[\s\S]*eq\("product_id", productId\)/);
  assert.match(route, /from\("orders"\)[\s\S]*contains\("items", \[\{ product_id: productId \}\]\)/);
  assert.match(route, /if \(await hasOrderHistory\(serviceClient, id\)\)/);
  assert.equal((route.match(/hasOrderHistory\(serviceClient, id\)/g) ?? []).length, 2);
  assert.match(route, /from\("products"\)\.delete\(\)/);
});

test("referenced products can be archived without a browser-side privileged client", () => {
  assert.match(route, /export async function PATCH/);
  assert.match(route, /status: "archived", is_active: false/);
  assert.match(actions, /method: "DELETE"/);
  assert.match(actions, /method: "PATCH"/);
  assert.match(actions, /Archive \/ Deactivate/);
  assert.doesNotMatch(actions, /createClient|service_role|supabase/);
});

test("delete UI confirms, handles focus, refreshes, and reports outcomes", () => {
  assert.match(actions, /Delete this product\?/);
  assert.match(actions, /showModal\(\)/);
  assert.match(actions, /cancelRef\.current\?\.focus\(\)/);
  assert.match(actions, /onCancel=/);
  assert.match(actions, /router\.refresh\(\)/);
  assert.match(products, /Product deleted successfully/);
  assert.match(products, /Product archived and removed from the storefront/);
});

test("checkout exposes COD only and keeps the backend payment method fixed", () => {
  assert.match(checkout, /payment_method:"cod"/);
  assert.match(checkout, /Cash on Delivery/);
  assert.match(checkout, /Place COD Order/);
  for (const removed of [/CreditCard/, /card_demo/, /paymentChoice/, /billingSame/, /Card number/, /Security code/, /Pay Now/]) {
    assert.doesNotMatch(checkout, removed);
  }
});

test("metadata uses the transparent brand icon and the obsolete favicon is gone", () => {
  assert.match(layout, /icons: \{ icon: "\/icon\.png", shortcut: "\/icon\.png", apple: "\/icon\.png" \}/);
  assert.equal(existsSync(new URL("../src/app/icon.png", import.meta.url)), true);
  assert.equal(existsSync(new URL("../src/app/favicon.ico", import.meta.url)), false);
});
