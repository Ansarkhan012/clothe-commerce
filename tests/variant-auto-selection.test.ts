import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { sanitizePersistedCart } from "../src/lib/cart-persistence.ts";
import { deriveVariantSelection, resolveProductVariant } from "../src/lib/product-commerce.ts";
import { CheckoutSchema } from "../src/lib/validations/order.ts";

const productId = "351400bf-6c57-4500-ada4-d4e22495eb65";
const black = { id: "a906f14f-6b0f-4fc7-be76-7b7193cbd295", name: "Black" };
const rose = { id: "e5aae973-44ed-468e-b949-118fdc4120df", name: "Dusty Rose" };
let seq = 0;
const v = (color: typeof black | null, size: "XS" | "S" | "M" | "L" | "XL" | "XXL" | null, stock: number) => ({
  id: `00000000-0000-4000-8000-${String(++seq).padStart(12, "0")}`,
  product_id: productId, color_id: color?.id ?? null, color: color ? { ...color, slug: "", hex_code: null, sort_order: 0, is_active: true } : null,
  size, sku: `SKU-${seq}`, stock_quantity: stock, price_override: null, image_url: null, is_active: true,
});

/** Mirrors ProductPurchasePanel: derive state, resolve the exact variant, build the cart line. */
function purchase(variants: ReturnType<typeof v>[], type: "ready_to_wear" | "unstitched", chosenColor: string | null = null, chosenSize = "") {
  const selection = deriveVariantSelection(variants, type, chosenColor, chosenSize);
  const selected = resolveProductVariant(variants, type, selection.colorId, selection.size);
  return { selection, selected };
}

test("1. one color, one in-stock size: both are selected automatically", () => {
  const only = v(black, "M", 3);
  const { selection, selected } = purchase([only], "ready_to_wear");
  assert.equal(selection.colorId, black.id);
  assert.equal(selection.size, "M");
  assert.equal(selected?.id, only.id);
  assert.equal(selected?.sku, only.sku);
});

test("2. one color, multiple sizes: color is automatic and its sizes show immediately", () => {
  const variants = [v(black, "S", 1), v(black, "M", 2), v(black, "L", 0)];
  const { selection, selected } = purchase(variants, "ready_to_wear");
  assert.equal(selection.colorId, black.id);
  assert.deepEqual(selection.sizes, ["S", "M", "L"]);
  assert.equal(selection.size, "", "customer must still choose between several sizes");
  assert.equal(selected, undefined);
  const chosen = purchase(variants, "ready_to_wear", null, "M");
  assert.equal(chosen.selected?.id, variants[1].id);
});

test("3. multiple colors: nothing is auto-selected and normal selection works", () => {
  const variants = [v(black, "S", 1), v(black, "M", 1), v(rose, "S", 1), v(rose, "M", 1)];
  const initial = purchase(variants, "ready_to_wear");
  assert.equal(initial.selection.colorId, null);
  assert.deepEqual(initial.selection.sizes, []);
  const chosen = purchase(variants, "ready_to_wear", rose.id, "M");
  assert.equal(chosen.selected?.id, variants[3].id);
});

test("4. multiple colors with different sizes: sizes follow the chosen color; an incompatible size resets", () => {
  const variants = [v(black, "S", 1), v(black, "M", 1), v(rose, "XL", 1)];
  assert.deepEqual(purchase(variants, "ready_to_wear", black.id).selection.sizes, ["S", "M"]);
  const rosePick = purchase(variants, "ready_to_wear", rose.id, "S");
  assert.deepEqual(rosePick.selection.sizes, ["XL"]);
  assert.equal(rosePick.selection.size, "XL", "stale S is discarded; the single in-stock XL is used");
  assert.equal(rosePick.selected?.id, variants[2].id);
});

test("5. one color with out-of-stock sizes: a sold-out variant is never auto-selected", () => {
  const soldOutOnly = purchase([v(black, "M", 0)], "ready_to_wear");
  assert.equal(soldOutOnly.selection.colorId, black.id);
  assert.equal(soldOutOnly.selection.size, "");
  assert.equal(soldOutOnly.selected, undefined);
  const mixed = purchase([v(black, "S", 0), v(black, "M", 4)], "ready_to_wear");
  assert.equal(mixed.selection.size, "", "two sizes exist, so the choice stays with the customer");
});

test("6. product with no size variants (unstitched colour variant) resolves after auto colour", () => {
  const only = v(black, null, 5);
  const { selection, selected } = purchase([only], "unstitched");
  assert.equal(selection.colorId, black.id);
  assert.equal(selection.size, "");
  assert.equal(selected?.id, only.id);
});

test("7. product without colour variants shows sizes directly", () => {
  const variants = [v(null, "S", 2), v(null, "M", 2)];
  const { selection } = purchase(variants, "ready_to_wear");
  assert.deepEqual(selection.colors, []);
  assert.deepEqual(selection.sizes, ["S", "M"]);
  assert.equal(purchase(variants, "ready_to_wear", null, "M").selected?.id, variants[1].id);
});

test("8. product with no available inventory never auto-selects an unavailable size", () => {
  const { selection, selected } = purchase([v(black, "S", 0), v(black, "M", 0)], "ready_to_wear");
  assert.equal(selection.size, "");
  assert.equal(selected, undefined);
});

const cartLine = (variant: ReturnType<typeof v>, quantity: number) => ({
  id: productId, title: "Test Kurta", price: 4999, image: "https://example.com/a.jpg", productType: "ready_to_wear" as const,
  variantId: variant.id, sku: variant.sku, size: variant.size ?? undefined, color: variant.color?.name, quantity,
  stock: variant.stock_quantity, quantityStep: 1, minimumQuantity: 1, lineKey: `${productId}:${variant.id}`,
});

test("9-10. auto-selected variant survives cart refresh and reaches checkout with its exact ID", () => {
  const only = v(black, "XL", 2);
  const { selected } = purchase([only], "ready_to_wear");
  const persisted = sanitizePersistedCart(JSON.parse(JSON.stringify([cartLine(selected!, 1)])));
  assert.equal(persisted.length, 1);
  assert.deepEqual([persisted[0].variantId, persisted[0].sku, persisted[0].size], [only.id, only.sku, "XL"]);
  const payload = { customer_name: "Test Buyer", email: "qa@example.test", phone_number: "03001234567", delivery_address: "House 1, Street 2, Block 3",
    area: "Area", city: "Karachi", province: "Sindh", payment_method: "cod", idempotency_key: "8f14e45f-ceea-4f6a-9e2b-1c1d5f7a8b9c", terms_accepted: true,
    items: persisted.map(({ id, variantId, quantity }) => ({ product_id: id, variant_id: variantId ?? null, quantity })) };
  const parsed = CheckoutSchema.safeParse(payload);
  assert.equal(parsed.success, true);
  assert.equal(parsed.success && parsed.data.items[0].variant_id, only.id);
});

test("cart refresh keeps a colourless variant line (previously dropped silently)", () => {
  const colourless = v(null, "M", 3);
  assert.equal(sanitizePersistedCart([cartLine(colourless, 1)]).length, 1);
  assert.equal(sanitizePersistedCart([{ ...cartLine(colourless, 1), color: "" }]).length, 0, "an empty colour string is still malformed");
});

test("purchase panel derives selection instead of syncing it through effects", () => {
  const panel = readFileSync(new URL("../src/components/product/ProductPurchasePanel.tsx", import.meta.url), "utf8");
  assert.match(panel, /deriveVariantSelection\(variants,type,chosenColorId,chosenSize\)/);
  assert.doesNotMatch(panel, /useEffect/);
});
