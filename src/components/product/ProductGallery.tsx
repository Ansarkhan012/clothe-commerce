"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const displayImages = images.length ? images : ["/images/home/hero-model.png"];
  const [selected, setSelected] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const touchStart = useRef<number | null>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const previous = useCallback(() => setSelected((value) => (value - 1 + displayImages.length) % displayImages.length), [displayImages.length]);
  const next = useCallback(() => setSelected((value) => (value + 1) % displayImages.length), [displayImages.length]);

  useEffect(() => {
    if (!lightbox) return;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightbox(false);
      if (event.key === "ArrowLeft") previous();
      if (event.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", keydown);
    return () => { document.body.style.overflow = oldOverflow; window.removeEventListener("keydown", keydown); };
  }, [lightbox, next, previous]);

  const swipeEnd = (x: number) => {
    if (touchStart.current === null) return;
    const distance = x - touchStart.current;
    if (Math.abs(distance) > 45) {
      if (distance > 0) previous();
      else next();
    }
    touchStart.current = null;
  };

  const viewer = lightbox ? <div role="dialog" aria-modal="true" aria-label={`${title} full-screen image viewer`} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-3 sm:p-8" onMouseDown={(event) => { if (event.target === event.currentTarget) setLightbox(false); }}>
    <button ref={closeButton} type="button" onClick={() => setLightbox(false)} aria-label="Close image viewer" className="absolute right-4 top-4 z-10 grid h-12 w-12 place-items-center rounded-full bg-white text-brand-charcoal"><X /></button>
    {displayImages.length > 1 && <button type="button" onClick={previous} aria-label="Previous product image" className="absolute left-3 z-10 grid h-12 w-12 place-items-center rounded-full bg-white/90 text-brand-charcoal sm:left-8"><ChevronLeft /></button>}
    <div className="relative h-[88vh] w-[88vw]" onTouchStart={(event) => { touchStart.current = event.touches[0].clientX; }} onTouchEnd={(event) => swipeEnd(event.changedTouches[0].clientX)}><Image src={displayImages[selected]} alt={`${title} — view ${selected + 1}`} fill priority className="object-contain" sizes="100vw" /></div>
    {displayImages.length > 1 && <button type="button" onClick={next} aria-label="Next product image" className="absolute right-3 z-10 grid h-12 w-12 place-items-center rounded-full bg-white/90 text-brand-charcoal sm:right-8"><ChevronRight /></button>}
    <p className="absolute bottom-4 rounded-full bg-black/60 px-3 py-1 text-xs text-white">{selected + 1} / {displayImages.length}</p>
  </div> : null;

  return <section aria-label={`${title} image gallery`} className="min-w-0">
    <button type="button" onClick={() => setLightbox(true)} aria-label={`Open full-screen image of ${title}`} className="group relative block aspect-[3/4] w-full overflow-hidden bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold-dark">
      <Image key={displayImages[selected]} src={displayImages[selected]} alt={`${title}${displayImages.length > 1 ? ` — view ${selected + 1}` : ""}`} fill priority className="object-cover object-top transition duration-500 group-hover:scale-[1.02] motion-safe:animate-[fadeIn_.25s_ease-out]" sizes="(max-width: 1024px) 100vw, 58vw" />
      <span className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-brand-green-dark shadow"><Maximize2 size={17}/></span>
    </button>
    {displayImages.length > 1 && <div className="mt-3 flex gap-2 overflow-x-auto pb-2" role="list" aria-label="Product views">{displayImages.map((image, index) => <button key={`${image}-${index}`} type="button" onClick={() => setSelected(index)} aria-label={`Show ${title} view ${index + 1}`} aria-pressed={selected === index} className={`relative aspect-[3/4] w-16 shrink-0 overflow-hidden border-2 bg-white transition sm:w-20 ${selected === index ? "border-brand-gold-dark" : "border-transparent hover:border-brand-green/40"}`}><Image src={image} alt="" fill className="object-cover object-top" sizes="80px" /></button>)}</div>}
    {typeof document !== "undefined" && viewer ? createPortal(viewer, document.body) : null}
  </section>;
}
