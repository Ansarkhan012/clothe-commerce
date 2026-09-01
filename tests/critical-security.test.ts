import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  CheckoutSchema,
  TrackOrderSchema,
  normalizeCheckoutItems,
} from "../src/lib/validations/order.ts";

const productId = "11111111-1111-4111-8111-111111111111";
const baseCheckout = {
  customer_name: "Test Customer",
  email: "customer@example.com",
  phone_number: "03001234567",
  delivery_address: "A complete test address",
  address_line_2: "",
  area: "Karachi - Clifton",
  city: "Karachi",
  province: "Sindh",
  postal_code: "",
  delivery_notes: "",
  payment_method: "cod",
  idempotency_key: "22222222-2222-4222-8222-222222222222",
  items: [{ product_id: productId, size: "M", quantity: 1 }],
};

test("checkout rejects invalid quantities", () => {
  for (const quantity of [0, -1, 1.5, 21, Number.NaN]) {
    assert.equal(CheckoutSchema.safeParse({
      ...baseCheckout,
      items: [{ ...baseCheckout.items[0], quantity }],
    }).success, false);
  }
});

test("checkout rejects missing/invalid products and client price fields", () => {
  assert.equal(CheckoutSchema.safeParse({ ...baseCheckout, items: [] }).success, false);
  assert.equal(CheckoutSchema.safeParse({
    ...baseCheckout, items: [{ product_id: "not-a-uuid", size: "M", quantity: 1 }],
  }).success, false);
  assert.equal(CheckoutSchema.safeParse({ ...baseCheckout, price: 1 }).success, false);
  assert.equal(CheckoutSchema.safeParse({
    ...baseCheckout, items: [{ ...baseCheckout.items[0], price: 1 }],
  }).success, false);
});

test("duplicate product/size lines normalize before inventory validation", () => {
  const parsed = CheckoutSchema.parse({
    ...baseCheckout,
    items: [
      { product_id: productId, size: "M", quantity: 3 },
      { product_id: productId, size: "M", quantity: 4 },
      { product_id: productId, size: "L", quantity: 2 },
    ],
  });
  assert.deepEqual(normalizeCheckoutItems(parsed.items), [
    { product_id: productId, size: "M", quantity: 7 },
    { product_id: productId, size: "L", quantity: 2 },
  ]);
});

test("tracking requires an exact public reference and phone shape", () => {
  assert.equal(TrackOrderSchema.safeParse({ phone_number: "03001234567" }).success, false);
  assert.equal(TrackOrderSchema.safeParse({ public_order_id: "QZF-8A4F2C7D9E10" }).success, false);
  assert.equal(TrackOrderSchema.safeParse({
    public_order_id: "QZF-8A4F2C7D9E10", phone_number: "03001234567",
  }).success, true);
  assert.equal(TrackOrderSchema.safeParse({
    public_order_id: "QZF-8A4F2C7D9E10", phone_number: "03001234567", extra: true,
  }).success, false);
  assert.equal(TrackOrderSchema.safeParse({ public_order_id: "10001", phone_number: "03001234567" }).success, false);
});

test("tracking route returns a minimal DTO and never queries from the browser", () => {
  const route = readFileSync(resolve(process.cwd(), "src/app/api/orders/track/route.ts"), "utf8");
  const client = readFileSync(resolve(process.cwd(), "src/app/track-order/page.tsx"), "utf8");
  assert.doesNotMatch(client, /from\(["']orders["']\)/);
  assert.doesNotMatch(route, /delivery_address|customer_name/);
  assert.match(route.replace(/\r?\n/g, " "), /public_order_id.*phone_number/);
});

test("checkout validates email, Pakistani phone, province and COD allowlist", () => {
  assert.equal(CheckoutSchema.safeParse({ ...baseCheckout, email: "bad" }).success, false);
  assert.equal(CheckoutSchema.safeParse({ ...baseCheckout, phone_number: "123" }).success, false);
  assert.equal(CheckoutSchema.safeParse({ ...baseCheckout, province: "Unknown" }).success, false);
  assert.equal(CheckoutSchema.safeParse({ ...baseCheckout, payment_method: "card" }).success, false);
});

test("production migration preserves legacy numbers and creates non-sequential references", () => {
  const sql = readFileSync(resolve(process.cwd(), "../supabase/migrations/202608310002_production_ecommerce_upgrade.sql"), "utf8").toLowerCase();
  assert.match(sql, /add column if not exists public_order_id/);
  assert.match(sql, /gen_random_bytes\(6\)/);
  assert.match(sql, /unique index if not exists orders_public_order_id_upper_uidx/);
  assert.doesNotMatch(sql, /drop column[^;]*order_number/);
  assert.match(sql, /for update/);
  assert.match(sql, /invalid_transition/);
  assert.match(sql, /order_status_history/);
});

test("migration contains atomic/idempotent/RLS controls", () => {
  const sql = readFileSync(resolve(process.cwd(), "../supabase/migrations/202608310001_critical_security_fixes.sql"), "utf8");
  for (const required of [
    "for update", "pg_advisory_xact_lock", "orders_idempotency_key_uidx",
    "alter table public.orders enable row level security", "products_admin_insert",
    "product_images_admin_insert", "grant execute on function public.create_atomic_order",
  ]) assert.match(sql.toLowerCase(), new RegExp(required.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});
