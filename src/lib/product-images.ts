export const MAX_PRODUCT_IMAGES = 7;
export const PRODUCT_IMAGE_LIMIT_MESSAGE = `You can upload up to ${MAX_PRODUCT_IMAGES} images per product.`;

export function selectProductImageFiles<T>(existingCount: number, selectedFiles: T[]) {
  const remaining = Math.max(0, MAX_PRODUCT_IMAGES - existingCount);
  return {
    accepted: selectedFiles.slice(0, remaining),
    exceeded: selectedFiles.length > remaining,
  };
}

// Must match the products-bucket Storage policy (202608310001_critical_security_fixes.sql).
export const PRODUCT_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "avif"] as const;
export const PRODUCT_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/avif,.jpg,.jpeg,.png,.webp,.avif";
export const MAX_PRODUCT_IMAGE_BYTES = 5 * 1024 * 1024;

/** Returns a user-facing problem for a file the Storage policy would reject, or null. */
export function productImageProblem(file: { name: string; type: string; size: number }): string | null {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!(PRODUCT_IMAGE_EXTENSIONS as readonly string[]).includes(extension) || !file.type.startsWith("image/")) {
    return `${file.name}: use JPG, PNG, WebP or AVIF images (HEIC/GIF are not supported).`;
  }
  if (file.size > MAX_PRODUCT_IMAGE_BYTES) return `${file.name}: images must be 5 MB or smaller.`;
  return null;
}
