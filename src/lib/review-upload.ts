// Browser-side helpers for review photo uploads (used by ReviewForm).
import { REVIEW_IMAGE_FULL_PX, REVIEW_UPLOAD_BUDGET_BYTES } from "@/src/lib/validations/review-images";

/**
 * Downsizes a photo to at most REVIEW_IMAGE_FULL_PX on its longest side and re-encodes it as JPEG,
 * which also drops camera metadata before it leaves the device. Falls back to the original file
 * when the browser cannot decode it (the server still validates and re-encodes everything).
 */
export async function prepareReviewPhoto(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, REVIEW_IMAGE_FULL_PX / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.86));
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

export const withinUploadBudget = (blobs: Blob[]) => blobs.reduce((sum, blob) => sum + blob.size, 0) <= REVIEW_UPLOAD_BUDGET_BYTES;

/** POSTs multipart data with upload progress (fetch has no upload progress events). */
export function postWithProgress(url: string, body: FormData, onProgress: (percent: number) => void) {
  return new Promise<{ status: number; json: { message?: string; field?: string } }>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", url);
    request.responseType = "json";
    request.upload.onprogress = (event) => { if (event.lengthComputable) onProgress(Math.min(99, Math.round((event.loaded / event.total) * 100))); };
    request.onload = () => { onProgress(100); resolve({ status: request.status, json: (request.response ?? {}) as { message?: string; field?: string } }); };
    request.onerror = () => reject(new Error("Network error. Please check your connection and try again."));
    request.ontimeout = () => reject(new Error("The upload took too long. Please try again."));
    request.timeout = 120_000;
    request.send(body);
  });
}
