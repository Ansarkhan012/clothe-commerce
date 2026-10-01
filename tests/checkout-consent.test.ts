import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { CheckoutSchema, isMissingTermsAcceptance } from "../src/lib/validations/order.ts";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
const checkout = {
  customer_name: "Test Customer", email: "customer@example.com", phone_number: "03001234567",
  delivery_address: "A complete test address", area: "Clifton", city: "Karachi", province: "Sindh",
  payment_method: "cod", idempotency_key: "22222222-2222-4222-8222-222222222222",
  items: [{ product_id: "11111111-1111-4111-8111-111111111111", quantity: 1 }],
};

test("server rejects checkout without the Terms & Privacy acknowledgement", () => {
  for (const terms of [undefined, false, "true", 1, null]) {
    const parsed = CheckoutSchema.safeParse(terms === undefined ? checkout : { ...checkout, terms_accepted: terms });
    assert.equal(parsed.success, false, `terms_accepted=${String(terms)} must be rejected`);
    assert.equal(!parsed.success && isMissingTermsAcceptance(parsed.error.issues), true);
  }
  assert.equal(CheckoutSchema.safeParse({ ...checkout, terms_accepted: true }).success, true);
});

test("marketing opt-in is never part of the mandatory order payload", () => {
  assert.equal(CheckoutSchema.safeParse({ ...checkout, terms_accepted: true, marketing_opt_in: true }).success, false, "strict schema: no implicit marketing field");
  const page = read("../src/app/checkout/page.tsx");
  assert.match(page, /terms_accepted:termsAccepted/);
  assert.doesNotMatch(page, /terms_accepted:(offers|true)/);
});

test("checkout consent checkbox is unchecked by default, labelled, linked and accessible", () => {
  const page = read("../src/app/checkout/page.tsx");
  assert.match(page, /useState\(false\);\n\s*const \[termsAccepted,setTermsAccepted\] = useState\(false\)/);
  assert.match(page, /id="terms_accepted" type="checkbox" checked=\{termsAccepted\}/);
  assert.match(page, /<label htmlFor="terms_accepted"/);
  assert.match(page, /href="\/terms-and-conditions" target="_blank" rel="noopener noreferrer"/);
  assert.match(page, /href="\/privacy-policy" target="_blank" rel="noopener noreferrer"/);
  assert.match(page, /aria-invalid=\{Boolean\(errors\.terms_accepted\)\}/);
  assert.match(page, /aria-describedby=\{errors\.terms_accepted\?"terms_accepted-error":undefined\}/);
  assert.match(page, /if\(!termsAccepted\)next\.terms_accepted=TERMS_REQUIRED_MESSAGE/);
  assert.match(page, /submitInFlightRef\.current\)return/, "duplicate submissions remain blocked");
});

test("checkout API returns a field-specific consent error before any database work", () => {
  const route = read("../src/app/api/checkout/route.ts");
  const consent = route.indexOf("isMissingTermsAcceptance(parsed.error.issues)");
  assert.ok(consent > 0 && consent < route.indexOf("consumeRateLimit(") && consent < route.indexOf('rpc(\n'));
  assert.match(route, /field: "terms_accepted"/);
});

test("both legal pages linked from checkout exist", () => {
  assert.ok(read("../src/app/terms-and-conditions/page.tsx").length > 0);
  assert.ok(read("../src/app/privacy-policy/page.tsx").length > 0);
});
