"use client";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useRef, useState } from "react";
import { adminReviewImageUrl, publicReviewImageUrl } from "@/src/lib/validations/review-images";

type GalleryImage = { id: string; width: number; height: number };

// Thumbnails (400 px renditions, lazy) open a native <dialog>: focus is contained, Escape closes and
// focus returns to the thumbnail. The full rendition (max 1600 px) loads only when opened.
// Images are served by the app from database ids; storage paths never reach the browser.
export function ReviewImageGallery({ images, reviewer, variant = "public", thumbSize = 72 }: { images: GalleryImage[]; reviewer: string; variant?: "public" | "admin"; thumbSize?: number }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const [index, setIndex] = useState<number | null>(null);
  if (!images.length) return null;
  const url = variant === "admin" ? adminReviewImageUrl : publicReviewImageUrl;
  const current = index === null ? null : images[index];
  const label = (position: number) => `Photo ${position + 1} of ${images.length} from ${reviewer}'s review`;

  function open(position: number, button: HTMLButtonElement) {
    opener.current = button;
    setIndex(position);
    dialog.current?.showModal();
  }
  const step = (delta: number) => setIndex((value) => value === null ? null : (value + delta + images.length) % images.length);

  return <>
    <ul className="mt-3 flex flex-wrap gap-2" aria-label={`Photos from ${reviewer}'s review`}>
      {images.map((image, position) => <li key={image.id}>
        <button type="button" onClick={(event) => open(position, event.currentTarget)} aria-label={`Open photo ${position + 1} of ${images.length} from ${reviewer}'s review`} className="block overflow-hidden border border-border bg-brand-cream-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold-dark" style={{ width: thumbSize, height: thumbSize }}>
          <Image src={url(image.id, "thumb")} alt="" width={thumbSize} height={thumbSize} unoptimized loading="lazy" className="h-full w-full object-cover" />
        </button>
      </li>)}
    </ul>
    <dialog ref={dialog} aria-label={current ? label(index!) : "Review photo"} onClose={() => { setIndex(null); opener.current?.focus(); }}
      onKeyDown={(event) => { if (images.length > 1 && event.key === "ArrowRight") step(1); if (images.length > 1 && event.key === "ArrowLeft") step(-1); }}
      onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }}
      className="m-auto max-h-[92vh] w-[min(92vw,960px)] bg-transparent p-0 backdrop:bg-black/80">
      {current && <figure className="relative flex flex-col items-center gap-3">
        <Image src={url(current.id, "full")} alt={label(index!)} width={current.width} height={current.height} unoptimized className="max-h-[80vh] w-auto max-w-full bg-black object-contain" />
        <figcaption className="text-xs text-white/80">{index! + 1} / {images.length}</figcaption>
        <div className="flex gap-2">
          {images.length > 1 && <button type="button" onClick={() => step(-1)} aria-label="Previous photo" className="grid h-11 w-11 place-items-center bg-white text-brand-charcoal"><ChevronLeft size={20} aria-hidden="true" /></button>}
          <button type="button" onClick={() => dialog.current?.close()} aria-label="Close photo" autoFocus className="grid h-11 w-11 place-items-center bg-white text-brand-charcoal"><X size={20} aria-hidden="true" /></button>
          {images.length > 1 && <button type="button" onClick={() => step(1)} aria-label="Next photo" className="grid h-11 w-11 place-items-center bg-white text-brand-charcoal"><ChevronRight size={20} aria-hidden="true" /></button>}
        </div>
      </figure>}
    </dialog>
  </>;
}
