import type { Product } from "@/src/types/supabase";
import type { ProductType, ProductVariant } from "@/src/types/product";

export const activeVariants = <T extends Pick<ProductVariant, "is_active">>(product: { variants?: T[] }): T[] =>
  (product.variants ?? []).filter((variant) => variant.is_active);

export const productInventory = <T extends { stock: number; variants?: Array<Pick<ProductVariant, "is_active" | "stock_quantity">> }>(product: T): number => {
  const variants = activeVariants(product);
  return variants.length
    ? variants.reduce((total, variant) => total + Math.max(0, Number(variant.stock_quantity)), 0)
    : Math.max(0, Number(product.stock));
};

export const LOW_STOCK_QUANTITY = 1;
export type StockStatus = "out_of_stock" | "low_stock" | "in_stock";
export const stockStatus = (stock: number): StockStatus =>
  stock <= 0 ? "out_of_stock" : stock === LOW_STOCK_QUANTITY ? "low_stock" : "in_stock";

export function resolveProductVariant<T extends Pick<ProductVariant, "color_id" | "size">>(
  variants: T[],
  productType: ProductType,
  colorId: string | null,
  size: string
): T | undefined {
  const hasColors = variants.some((variant) => Boolean(variant.color_id));
  return variants.find((variant) =>
    (!hasColors || variant.color_id === colorId) &&
    (productType !== "ready_to_wear" || variant.size === size)
  );
}

type SelectableVariant = Pick<ProductVariant, "color_id" | "size" | "stock_quantity"> & { color?: { id: string; name: string } | null };

/**
 * Resolves the storefront option state without extra clicks. A product with exactly
 * one purchasable colour uses it automatically, and a ready-to-wear product whose
 * current colour offers exactly one in-stock size uses that size. The result is derived
 * (not stored in effect-driven state) so server and client render identically.
 */
export function deriveVariantSelection<T extends SelectableVariant>(
  variants: T[],
  productType: ProductType,
  chosenColorId: string | null,
  chosenSize: string
) {
  const colors = [...new Map(
    variants.filter((variant) => variant.color_id && variant.color).map((variant) => [variant.color_id, variant.color!])
  ).values()];
  const colorId = chosenColorId && colors.some((color) => color.id === chosenColorId)
    ? chosenColorId
    : colors.length === 1 ? colors[0].id : null;
  const colorVariants = variants.filter((variant) => !colors.length || variant.color_id === colorId);
  const sizes = [...new Set(colorVariants.map((variant) => variant.size).filter((size): size is NonNullable<typeof size> => Boolean(size)))];
  const inStockSizes = sizes.filter((size) => colorVariants.some((variant) => variant.size === size && Number(variant.stock_quantity) > 0));
  const chosenSizeIsValid = sizes.includes(chosenSize as NonNullable<T["size"]>);
  const size = productType !== "ready_to_wear"
    ? ""
    : chosenSizeIsValid ? chosenSize
      : sizes.length === 1 && inStockSizes.length === 1 ? inStockSizes[0] : "";
  return { colors, colorId, sizes, size, autoSelectedColor: colorId !== null && colorId !== chosenColorId, autoSelectedSize: size !== "" && size !== chosenSize };
}

export const effectiveProductPrice = (product: Product): number => {
  const base = Number(product.price);
  const sale = product.sale_price === null ? null : Number(product.sale_price);
  return sale !== null && sale > 0 && sale < base ? sale : base;
};

export const hasValidSale = (product: Product): boolean =>
  effectiveProductPrice(product) < Number(product.price);

export const productHref = (product: Pick<Product, "id" | "slug">): string =>
  `/product/${encodeURIComponent(product.slug || product.id)}`;

export const isValidMeasuredQuantity = (quantity: number, minimum: number, step: number): boolean => {
  if (!Number.isFinite(quantity) || !Number.isFinite(minimum) || !Number.isFinite(step) || step <= 0 || quantity < minimum) return false;
  const increments = (quantity - minimum) / step;
  return Math.abs(increments - Math.round(increments)) < 1e-8;
};

export const lineSelectionLabel = (item: {
  color?: string | null;
  size?: string | null;
  pieces?: number | null;
  sellingUnit?: string | null;
  quantity?: number;
}): string => {
  const parts = [item.color, item.size, item.pieces ? `${item.pieces} Piece` : null].filter(Boolean);
  if (parts.length) return parts.join(" · ");
  return item.sellingUnit ? `${item.quantity ?? ""} ${item.sellingUnit}${item.quantity === 1 ? "" : "s"}`.trim() : "Standard item";
};
