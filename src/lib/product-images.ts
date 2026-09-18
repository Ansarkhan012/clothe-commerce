export const MAX_PRODUCT_IMAGES = 7;
export const PRODUCT_IMAGE_LIMIT_MESSAGE = `You can upload up to ${MAX_PRODUCT_IMAGES} images per product.`;

export function selectProductImageFiles<T>(existingCount: number, selectedFiles: T[]) {
  const remaining = Math.max(0, MAX_PRODUCT_IMAGES - existingCount);
  return {
    accepted: selectedFiles.slice(0, remaining),
    exceeded: selectedFiles.length > remaining,
  };
}
