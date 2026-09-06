import { isValidMeasuredQuantity } from "./product-commerce.ts";
import { productTypes, type FabricUnit, type GarmentSize, type ProductType } from "../types/product.ts";

export type PersistedCartLine = {
  id: string;
  title: string;
  price: number;
  image: string;
  productType: ProductType;
  variantId?: string;
  sku?: string;
  size?: GarmentSize;
  color?: string;
  pieces?: number;
  sellingUnit?: FabricUnit;
  quantity: number;
  stock?: number;
  quantityStep?: number;
  minimumQuantity?: number;
  lineKey: string;
};

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const sizes = new Set(["XS", "S", "M", "L", "XL", "XXL"]);

export function isValidPersistedCartLine(value: unknown): value is PersistedCartLine {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const line = value as Record<string, unknown>;
  if (typeof line.id !== "string" || !uuid.test(line.id) || typeof line.title !== "string" || !line.title.trim()) return false;
  if (typeof line.price !== "number" || !Number.isFinite(line.price) || line.price < 0 || typeof line.image !== "string") return false;
  if (typeof line.productType !== "string" || !productTypes.includes(line.productType as ProductType)) return false;
  if (typeof line.quantity !== "number" || !Number.isFinite(line.quantity) || line.quantity <= 0) return false;
  const variantId = typeof line.variantId === "string" && uuid.test(line.variantId) ? line.variantId : undefined;
  if (line.lineKey !== `${line.id}:${variantId ?? "base"}`) return false;

  if (line.productType === "ready_to_wear") {
    if (!variantId || typeof line.sku !== "string" || !line.sku.trim() || typeof line.color !== "string" || !line.color.trim()) return false;
    if (typeof line.size !== "string" || !sizes.has(line.size) || !Number.isInteger(line.quantity)) return false;
  } else if (line.productType === "loose_fabric") {
    if (variantId || line.size !== undefined || !["meter", "yard"].includes(String(line.sellingUnit))) return false;
    const minimum = Number(line.minimumQuantity);
    const step = Number(line.quantityStep);
    if (!isValidMeasuredQuantity(line.quantity, minimum, step)) return false;
  } else {
    if (line.size !== undefined || !Number.isInteger(line.quantity)) return false;
    if (variantId && (typeof line.sku !== "string" || !line.sku.trim() || typeof line.color !== "string" || !line.color.trim())) return false;
    if (!variantId && (line.sku !== undefined || line.color !== undefined)) return false;
  }
  return true;
}

export function sanitizePersistedCart(value: unknown): PersistedCartLine[] {
  return Array.isArray(value) ? value.filter(isValidPersistedCartLine) : [];
}
