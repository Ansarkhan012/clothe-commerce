// Shared (client + server) rules for optional review photos. The server is authoritative: it
// re-checks every rule, identifies the real format from the file's bytes (never the name or the
// declared MIME type) and re-encodes the image before anything is stored.

export const MAX_REVIEW_IMAGES = 3;
export const MAX_REVIEW_IMAGE_BYTES = 5 * 1024 * 1024;
export const REVIEW_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;
export type ReviewImageType = (typeof REVIEW_IMAGE_TYPES)[number];
export const REVIEW_IMAGE_ACCEPT = REVIEW_IMAGE_TYPES.join(",");
// Hosting platforms cap request bodies (Vercel: 4.5 MB), so the browser downsizes photos before
// upload and keeps the whole submission under this budget. Originals up to 5 MB each are accepted.
export const REVIEW_UPLOAD_BUDGET_BYTES = 4 * 1024 * 1024;
export const REVIEW_IMAGE_FULL_PX = 1600;
export const REVIEW_IMAGE_THUMB_PX = 400;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const isUuid = (value: string) => UUID.test(value);

const ascii = (bytes: Uint8Array, start: number, end: number) => String.fromCharCode(...bytes.subarray(start, end));

/** Identifies a supported image from its leading bytes (at least 32). Returns null for anything else. */
export function sniffReviewImageType(bytes: Uint8Array): ReviewImageType | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length >= 8 && [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((value, index) => bytes[index] === value)) return "image/png";
  if (bytes.length >= 12 && ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 12) === "WEBP") return "image/webp";
  if (bytes.length >= 16 && ascii(bytes, 4, 8) === "ftyp") {
    // ISO-BMFF: major brand at 8..12, compatible brands after the minor version (16..box end).
    const boxEnd = Math.min(bytes.length, ((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3]) >>> 0 || 32);
    const brands = [ascii(bytes, 8, 12)];
    for (let offset = 16; offset + 4 <= boxEnd; offset += 4) brands.push(ascii(bytes, offset, offset + 4));
    if (brands.some((brand) => brand === "avif" || brand === "avis")) return "image/avif";
  }
  return null;
}

/** User-facing problem for a selected file, or null. `head` = its first bytes when available. */
export function reviewImageProblem(file: { size: number; type: string }, head?: Uint8Array): string | null {
  if (file.size <= 0) return "This photo is empty.";
  if (file.size > MAX_REVIEW_IMAGE_BYTES) return "Photos must be 5 MB or smaller.";
  const declared = (REVIEW_IMAGE_TYPES as readonly string[]).includes(file.type);
  const actual = head ? sniffReviewImageType(head) : null;
  if (!declared || (head && !actual)) return "Use JPG, PNG, WebP or AVIF photos (HEIC and GIF are not supported).";
  return null;
}

/** Keeps at most MAX_REVIEW_IMAGES in total and reports whether any selected file was dropped. */
export function selectReviewImageFiles<T>(existingCount: number, selected: T[]) {
  const remaining = Math.max(0, MAX_REVIEW_IMAGES - existingCount);
  return { accepted: selected.slice(0, remaining), exceeded: selected.length > remaining };
}

/** Storage object paths for a photo; derived only from server-generated UUIDs (never a filename). */
export function reviewImageObjectPaths(reviewId: string, imageId: string) {
  if (!isUuid(reviewId) || !isUuid(imageId)) throw new Error("INVALID_REVIEW_IMAGE_ID");
  const base = `reviews/${reviewId.toLowerCase()}/${imageId.toLowerCase()}`;
  return { full: `${base}.webp`, thumb: `${base}_thumb.webp` };
}

/** Thumbnail path for a stored full-size path (reviews/<uuid>/<uuid>.webp), or null if malformed. */
export function thumbPathFor(storagePath: string): string | null {
  return /^reviews\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.webp$/.test(storagePath) ? storagePath.replace(/\.webp$/, "_thumb.webp") : null;
}

export const publicReviewImageUrl = (imageId: string, size: "thumb" | "full") => `/api/reviews/images/${imageId}/${size}`;
export const adminReviewImageUrl = (imageId: string, size: "thumb" | "full") => `/api/admin/reviews/images/${imageId}/${size}`;
