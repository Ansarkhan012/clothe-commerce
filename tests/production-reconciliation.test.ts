import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
const md5 = (s: string) => createHash("md5").update(s, "utf8").digest("hex");
const SIGNATURE = "create_atomic_order(text,text,text,text,text,text,text,text,text,text,text,uuid,jsonb)";
const PRODUCTION = "3caaed70d7c06c499d732632cd2c0e8c";
const CANONICAL = "51f53ed2f0cbfbd986177d40bf785726";
const MIGRATION = "../../supabase/migrations/202609300000_reconcile_create_atomic_order_with_production.sql";

type ProductionFunction = { signature: string; fingerprint: string; definition: string };
const production = JSON.parse(read("../../docs/qa/sql/production-introspection-result.json")) as { functions: ProductionFunction[]; constraints: { table: string; name: string; definition: string }[] };
const bodyOf = (definition: string) => definition.match(/AS \$function\$([\s\S]*)\$function\$\n?$/)![1];

test("saved production introspection is intact (every function body reproduces its production md5)", () => {
  assert.equal(production.functions.length, 13);
  for (const fn of production.functions) assert.equal(md5(bodyOf(fn.definition)), fn.fingerprint, fn.signature);
});

test("reconciliation migration installs exactly the production checkout body (line endings aside)", () => {
  const live = production.functions.find((fn) => fn.signature === SIGNATURE)!;
  assert.equal(live.fingerprint, PRODUCTION);
  assert.equal(md5(bodyOf(live.definition).replace(/\r\n/g, "\n")), CANONICAL);
  const sql = read(MIGRATION).replace(/\r\n/g, "\n");
  const installed = sql.match(/AS \$function\$([\s\S]*)\$function\$\$ddl\$/)![1];
  assert.equal(md5(installed), CANONICAL, "migration body must be the normalised production body");
});

test("canonical checkout carries both production fixes; history keeps the broken original", () => {
  const sql = read(MIGRATION);
  assert.match(sql, /ELSE v_qty::integer\s+END/);
  assert.match(sql, /\(\(x->>'quantity'\)::numeric\)::integer/);
  const history = read("../../supabase/migrations/202609040004_product_domain_architecture.sql");
  assert.match(history, /\(x->>'quantity'\)::integer,nullif\(x->>'size',''\)/, "historical migration must stay unedited");
});

test("reconciliation guard never overwrites a working or unknown function and keeps service_role-only access", () => {
  const sql = read(MIGRATION);
  assert.match(sql, new RegExp(`if v_md5 = '${CANONICAL}' then[\\s\\S]*unchanged[\\s\\S]*return;`));
  assert.match(sql, /elsif v_md5 is not null and v_md5 <> '4e7daed8426ec48ad69db72c22856a45' then\s+raise exception 'UNRECOGNISED/);
  assert.match(sql, /md5\(replace\(p\.prosrc, E'\\r\\n', E'\\n'\)\)/);
  assert.match(sql, /revoke all on function public\.create_atomic_order\([^)]*\) from public, anon, authenticated;/);
  assert.match(sql, /grant execute on function public\.create_atomic_order\([^)]*\) to service_role;/);
  assert.doesNotMatch(sql, /\bdrop\b/i);
});

test("XS/XXL migration targets the exact production constraint and only widens it", () => {
  const live = production.constraints.find((c) => c.table === "order_items" && c.name === "order_items_size_check")!;
  assert.equal(live.definition, "CHECK ((size = ANY (ARRAY['S'::text, 'M'::text, 'L'::text, 'XL'::text])))");
  const sql = read("../../supabase/migrations/202609300002_order_items_extended_sizes.sql");
  assert.match(sql, /drop constraint if exists order_items_size_check;/);
  assert.match(sql, /check \(size is null or size in \('XS','S','M','L','XL','XXL'\)\) not valid;/);
  assert.equal((sql.match(/alter table/gi) ?? []).length, 3, "only the size constraint is touched");
});

test("release rehearsal and DB tests no longer depend on a harness patch", () => {
  for (const script of ["./db/run-db-tests.sh", "./db/run-concurrency-tests.sh", "./db/run-release-rehearsal.sh"]) {
    assert.doesNotMatch(read(script), /harness\//, script);
  }
  assert.match(read("./db/run-release-rehearsal.sh"), /202609040001_distributed_rate_limits 202609300002_order_items_extended_sizes 202609300001_product_reviews 202609300000_reconcile/);
});
