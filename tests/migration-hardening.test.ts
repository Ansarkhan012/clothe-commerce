import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const sql = readFileSync(resolve(process.cwd(), "../supabase/migrations/202608310002_production_ecommerce_upgrade.sql"), "utf8").toLowerCase();
const compact = sql.replace(/\s+/g, " ");

test("migration policies are deterministic on retry", () => {
  for (const [policy, table] of [
    ["order_status_history_admin_read", "public.order_status_history"],
    ["support_inquiries_admin_read", "public.support_inquiries"],
    ["newsletter_admin_read", "public.newsletter_subscribers"],
  ]) {
    assert.match(compact, new RegExp(`drop policy if exists ${policy} on ${table.replace(".", "\\.")}`));
    assert.match(compact, new RegExp(`create policy ${policy} on ${table.replace(".", "\\.")}`));
  }
});

test("migration legacy-value compatibility is explicit and fail-fast", () => {
  assert.match(sql, /pre-flight legacy-data compatibility/);
  for (const field of ["payment_method", "payment_status", "order_status", "province"]) {
    assert.match(sql, new RegExp(`legacy_data_incompatible: orders\\.${field}`));
  }
  assert.match(sql, /correct them explicitly before retrying/);
  for (const field of ["payment_method", "payment_status", "order_status", "province"]) {
    assert.match(sql, new RegExp(`else\\s+${field}`));
  }
});

test("public order references remain cryptographic, unique and non-sequential", () => {
  assert.match(compact, /'qzf-' \|\| upper\(encode\((?:extensions\.)?gen_random_bytes\(6\), 'hex'\)\)/);
  assert.match(compact, /unique index if not exists orders_public_order_id_upper_uidx on public\.orders \(upper\(public_order_id\)\)/);
  const generator = sql.slice(sql.indexOf("create or replace function public.generate_order_reference"), sql.indexOf("revoke all on function public.generate_order_reference"));
  assert.doesNotMatch(generator, /order_number|nextval/);
  assert.doesNotMatch(sql, /drop column[^;]*(?:order_number|id)/);
});

test("invalid order transitions are rejected and valid shipped transition remains", () => {
  assert.match(compact, /v_old_status='ready_to_ship' and p_new_status in \('shipped','cancelled'\)/);
  assert.match(sql, /raise exception 'invalid_transition'/);
  assert.doesNotMatch(compact, /v_old_status='delivered' and p_new_status/);
});

test("shipping without effective courier data is rejected", () => {
  assert.match(compact, /p_new_status = 'shipped'.*p_courier_name.*v_order\.courier_name.*p_courier_tracking_number.*v_order\.courier_tracking_number.*courier_required_for_shipment/);
});

test("valid shipped transition records fulfillment and audit history", () => {
  assert.match(compact, /shipped_at = case when p_new_status='shipped' then now\(\)/);
  assert.match(compact, /insert into public\.order_status_history\(order_id, old_status, new_status, note, changed_by\)/);
});

test("cancellation restores inventory exactly once from normalized snapshots", () => {
  assert.match(sql, /add column if not exists inventory_restocked_at timestamptz/);
  assert.match(compact, /p_new_status = 'cancelled' and v_order\.inventory_restocked_at is null/);
  assert.match(compact, /from public\.order_items oi where oi\.order_id = p_order_id and oi\.product_id is not null group by oi\.product_id/);
  assert.match(compact, /set stock = p\.stock \+ restored\.quantity/);
  assert.match(compact, /inventory_restocked_at = coalesce\(v_restocked_at, inventory_restocked_at\)/);
});

test("repeated cancellation cannot double-restock", () => {
  assert.match(compact, /if p_new_status = v_old_status then raise exception 'invalid_transition'/);
  assert.match(compact, /v_order\.inventory_restocked_at is null/);
});

test("concurrent cancellation serializes on the order row before restock", () => {
  const lockPosition = compact.indexOf("where id = p_order_id for update");
  const restockPosition = compact.indexOf("set stock = p.stock + restored.quantity");
  assert.ok(lockPosition >= 0 && restockPosition > lockPosition);
  assert.match(compact, /select \* into v_order from public\.orders where id = p_order_id for update/);
});

test("existing products, orders, users, UUIDs and legacy order numbers remain preserved", () => {
  assert.doesNotMatch(sql, /\btruncate\b/);
  assert.doesNotMatch(sql, /\bdelete\s+from\s+public\.(?:orders|products|profiles)\b/);
  assert.doesNotMatch(sql, /\bdrop\s+table\b/);
  assert.doesNotMatch(sql, /\bdrop\s+column\b/);
  assert.match(sql, /add column if not exists public_order_id/);
});

test("checkout concurrency and idempotency controls remain service-role only", () => {
  assert.match(sql, /pg_advisory_xact_lock\(hashtextextended\(p_idempotency_key::text, 0\)\)/);
  assert.match(compact, /from public\.products p where p\.id=v_item\.product_id for update/);
  assert.match(sql, /coalesce\(v_product\.sale_price,v_product\.price\)/);
  assert.match(sql, /if v_updated<>v_expected then raise exception 'out_of_stock'/);
  assert.match(compact, /revoke all on function public\.create_atomic_order\([^;]+\) from public, anon, authenticated/);
  assert.match(compact, /grant execute on function public\.create_atomic_order\([^;]+\) to service_role/);
  assert.match(compact, /'cod','unpaid','pending',v_snapshots,p_idempotency_key/);
});

test("returns are not automatically restocked", () => {
  const restockBlock = compact.slice(compact.indexOf("inventory rule:"), compact.indexOf("update public.orders set", compact.indexOf("inventory rule:")));
  assert.match(restockBlock, /p_new_status = 'cancelled'/);
  assert.doesNotMatch(restockBlock, /p_new_status = 'returned'/);
});
