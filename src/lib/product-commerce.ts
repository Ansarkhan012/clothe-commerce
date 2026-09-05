import type { Product } from "@/src/types/supabase";
import type { ProductVariant } from "@/src/types/product";

export const activeVariants = <T extends Pick<ProductVariant, "is_active">>(product: { variants?: T[] }): T[] =>
  (product.variants ?? []).filter((variant) => variant.is_active);

export const productInventory = <T extends { stock: number; variants?: Array<Pick<ProductVariant, "is_active" | "stock_quantity">> }>(product: T): number => {
  const variants = activeVariants(product);
  return variants.length
    ? variants.reduce((total, variant) => total + Math.max(0, Number(variant.stock_quantity)), 0)
    : Math.max(0, Number(product.stock));
};

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
