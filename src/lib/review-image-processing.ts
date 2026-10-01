// Server-side processing of customer review photos (route handlers only; kept free of
// "server-only" so the unit tests can exercise it directly in Node).
// Every accepted photo is decoded and re-encoded: this verifies it is a real image, drops all
// metadata (EXIF, GPS location, camera serials), applies the camera orientation, caps the size and
// produces a small thumbnail, so the original upload is never stored or served.
import sharp from "sharp";
import {
  MAX_REVIEW_IMAGE_BYTES, MAX_REVIEW_IMAGES, REVIEW_IMAGE_FULL_PX, REVIEW_IMAGE_THUMB_PX, sniffReviewImageType,
} from "./validations/review-images.ts";

type ReviewImageErrorCode = "TOO_MANY" | "TOO_LARGE" | "EMPTY" | "UNSUPPORTED" | "UNREADABLE";

export class ReviewImageError extends Error {
  readonly code: ReviewImageErrorCode;
  readonly index: number;
  constructor(code: ReviewImageErrorCode, index: number) {
    super(code);
    this.code = code;
    this.index = index;
  }
}

export type ProcessedReviewImage = { full: Buffer; thumb: Buffer; width: number; height: number; byteSize: number };

const SHARP_FORMATS: Record<string, string> = { "image/jpeg": "jpeg", "image/png": "png", "image/webp": "webp", "image/avif": "heif" };

/** Cheap checks that need no decoding: count, size and real format (magic bytes). */
export function checkReviewImageBytes(files: Uint8Array[]) {
  if (files.length > MAX_REVIEW_IMAGES) throw new ReviewImageError("TOO_MANY", MAX_REVIEW_IMAGES);
  files.forEach((bytes, index) => {
    if (bytes.byteLength === 0) throw new ReviewImageError("EMPTY", index);
    if (bytes.byteLength > MAX_REVIEW_IMAGE_BYTES) throw new ReviewImageError("TOO_LARGE", index);
    if (!sniffReviewImageType(bytes.subarray(0, 64))) throw new ReviewImageError("UNSUPPORTED", index);
  });
}

export async function processReviewImage(bytes: Uint8Array, index = 0): Promise<ProcessedReviewImage> {
  const type = sniffReviewImageType(bytes.subarray(0, 64));
  if (!type) throw new ReviewImageError("UNSUPPORTED", index);
  try {
    // limitInputPixels guards against decompression bombs; only the first frame of animations is used.
    const source = sharp(bytes, { limitInputPixels: 40_000_000, failOn: "error", animated: false });
    const meta = await source.metadata();
    if (meta.format !== SHARP_FORMATS[type]) throw new ReviewImageError("UNSUPPORTED", index);
    const oriented = source.rotate(); // bake EXIF orientation in before the metadata is dropped
    const full = await oriented.clone()
      .resize({ width: REVIEW_IMAGE_FULL_PX, height: REVIEW_IMAGE_FULL_PX, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 }).toBuffer({ resolveWithObject: true });
    const thumb = await oriented.clone()
      .resize({ width: REVIEW_IMAGE_THUMB_PX, height: REVIEW_IMAGE_THUMB_PX, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 74 }).toBuffer();
    return { full: full.data, thumb, width: full.info.width, height: full.info.height, byteSize: full.data.byteLength };
  } catch (error) {
    if (error instanceof ReviewImageError) throw error;
    throw new ReviewImageError("UNREADABLE", index);
  }
}

export function reviewImageErrorMessage(error: ReviewImageError) {
  const which = `Photo ${error.index + 1}`;
  switch (error.code) {
    case "TOO_MANY": return `You can attach up to ${MAX_REVIEW_IMAGES} photos.`;
    case "TOO_LARGE": return `${which} is larger than 5 MB.`;
    case "EMPTY": return `${which} is empty.`;
    case "UNSUPPORTED": return `${which} is not a JPG, PNG, WebP or AVIF image.`;
    default: return `${which} could not be read. Please choose a different photo.`;
  }
}
