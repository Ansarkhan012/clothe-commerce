import type { CatalogCategory, ProductType } from "@/src/types/product";

export type EditorVariant = {
  id?: string;
  color_id: string | null;
  size: string | null;
  sku: string;
  stock_quantity: number;
  price_override: number | null;
  image_url: string | null;
  is_active: boolean;
};

export type EditorDetails = Record<string, unknown>;
export type PieceKey = "shirt" | "trouser" | "dupatta";

export function initializeEditorDetails(value: EditorDetails | null | undefined): EditorDetails {
  return structuredClone(value ?? {});
}

export function updatePieceDetail(
  details: EditorDetails,
  piece: PieceKey,
  field: "included" | "fabric" | "length" | "width",
  value: boolean | string
): EditorDetails {
  const current = details[piece];
  const row = current && typeof current === "object" && !Array.isArray(current)
    ? { ...(current as Record<string, unknown>) }
    : {};
  const normalized = (field === "length" || field === "width") && typeof value === "string"
    ? (value === "" ? undefined : Number(value))
    : value;
  return { ...details, [piece]: { ...row, [field]: normalized } };
}

export function normalizeVariantsForType(type: ProductType, variants: EditorVariant[]): EditorVariant[] {
  if (type === "loose_fabric") return [];
  return variants.map((variant) => ({
    ...variant,
    size: type === "ready_to_wear" ? (variant.size ?? "S") : null,
    stock_quantity: Number.isInteger(variant.stock_quantity)
      ? variant.stock_quantity
      : Math.max(0, Math.trunc(variant.stock_quantity)),
  }));
}

export function normalizeDetailsForType(type: ProductType, details: EditorDetails): EditorDetails {
  const common = {
    fabric: details.fabric,
    work_type: details.work_type,
    care_instructions: details.care_instructions,
  };
  if (type === "ready_to_wear") return { ...common, garment_type: details.garment_type };
  if (type === "unstitched") return {
    ...common,
    pieces: details.pieces,
    season: details.season,
    shirt: details.shirt,
    trouser: details.trouser,
    dupatta: details.dupatta,
  };
  if (type === "loose_fabric") return {
    ...common,
    selling_unit: details.selling_unit,
    width: details.width,
    minimum_quantity: details.minimum_quantity,
    quantity_step: details.quantity_step,
  };
  return {
    ...common,
    season: type === "shawl" ? details.season : undefined,
    length: details.length,
    width: details.width,
  };
}

export const subcategoriesForCategory = (categories: CatalogCategory[], categoryId: string | null) =>
  categories.filter((category) => category.parent_id === categoryId);
