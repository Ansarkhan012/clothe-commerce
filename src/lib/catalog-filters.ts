import { productTypes } from "../types/product.ts";

const catalogUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const catalogSizes = new Set(["XS", "S", "M", "L", "XL", "XXL"]);

/** Filter values come straight from the URL; invalid ones match nothing instead of raising a 500. */
export const hasValidCatalogFilterValues = (filters: { category: string; productType: string; size: string }) =>
  (!filters.category || catalogUuid.test(filters.category)) &&
  (!filters.productType || (productTypes as readonly string[]).includes(filters.productType)) &&
  (!filters.size || catalogSizes.has(filters.size));
