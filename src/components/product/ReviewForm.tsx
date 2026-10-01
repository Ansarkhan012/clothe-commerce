"use client";
import Image from "next/image";
import { ImagePlus, Star, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { postWithProgress, prepareReviewPhoto, withinUploadBudget } from "@/src/lib/review-upload";
import { MAX_REVIEW_IMAGES, REVIEW_IMAGE_ACCEPT, reviewImageProblem, selectReviewImageFiles } from "@/src/lib/validations/review-images";

type Fields = { display_name: string; title: string; body: string; order_reference: string; phone_number: string; website: string };
const empty: Fields = { display_name: "", title: "", body: "", order_reference: "", phone_number: "", website: "" };
type Photo = { key: string; file: File; preview: string };
const input = "mt-1 w-full border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-green-dark aria-[invalid=true]:border-error";

export function ReviewForm({ productId, requireOrder }: { productId: string; requireOrder: boolean }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [fields, setFields] = useState<Fields>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields | "rating", string>>>({});
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const inFlight = useRef(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const photoInput = useRef<HTMLInputElement>(null);
  const previews = useRef(new Set<string>());
  useEffect(() => { const urls = previews.current; return () => urls.forEach((url) => URL.revokeObjectURL(url)); }, []);
  const dropPreview = (url: string) => { URL.revokeObjectURL(url); previews.current.delete(url); };
  const clearPhotos = () => { photos.forEach((photo) => dropPreview(photo.preview)); setPhotos([]); setPhotoError(null); };

  async function addPhotos(list: FileList | null) {
    const selected = Array.from(list ?? []);
    if (photoInput.current) photoInput.current.value = ""; // allow re-selecting the same file
    if (!selected.length) return;
    const { accepted, exceeded } = selectReviewImageFiles(photos.length, selected);
    const problems: string[] = exceeded ? [`You can add up to ${MAX_REVIEW_IMAGES} photos.`] : [];
    const added: Photo[] = [];
    for (const file of accepted) {
      const head = new Uint8Array(await file.slice(0, 64).arrayBuffer());
      const problem = reviewImageProblem(file, head);
      if (problem) { problems.push(`${file.name}: ${problem}`); continue; }
      const preview = URL.createObjectURL(file);
      previews.current.add(preview);
      added.push({ key: crypto.randomUUID(), file, preview });
    }
    setPhotos((current) => [...current, ...added].slice(0, MAX_REVIEW_IMAGES));
    setPhotoError(problems.length ? problems.join(" ") : null);
  }
  function removePhoto(key: string) {
    const photo = photos.find((item) => item.key === key);
    if (photo) dropPreview(photo.preview);
    setPhotos((current) => current.filter((item) => item.key !== key));
    setPhotoError(null);
    // The picker re-mounts once a slot is free; move focus to it after that render.
    requestAnimationFrame(() => photoInput.current?.focus());
  }
  const set = (name: keyof Fields, value: string) => { setFields((current) => ({ ...current, [name]: value })); setErrors((current) => ({ ...current, [name]: undefined })); };

  function validate() {
    const next: typeof errors = {};
    if (!rating) next.rating = "Choose a star rating.";
    if (fields.display_name.trim().length < 2) next.display_name = "Enter the name to show with your review.";
    if (fields.body.trim().length < 10) next.body = "Write at least 10 characters.";
    if (requireOrder && !/^QZF-[A-F0-9]{12}$/i.test(fields.order_reference.trim())) next.order_reference = "Enter the order ID from your confirmation, e.g. QZF-1A2B3C4D5E6F.";
    if (requireOrder && !/^03\d{9}$/.test(fields.phone_number.replace(/\D/g, ""))) next.phone_number = "Use the mobile number from your order (03XXXXXXXXX).";
    setErrors(next);
    const first = Object.keys(next)[0];
    if (first) document.getElementById(first === "rating" ? "review-rating-1" : `review-${first}`)?.focus();
    return !first;
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (inFlight.current) return;
    setStatus(null);
    if (!validate()) return;
    inFlight.current = true; setSubmitting(true);
    try {
      const payload = {
        product_id: productId, rating, display_name: fields.display_name, title: fields.title, body: fields.body,
        order_reference: fields.order_reference.trim(), phone_number: fields.phone_number.replace(/\D/g, ""), website: fields.website,
      };
      let status: number, result: { message?: string; field?: string };
      if (photos.length) {
        // Photos: downsized in the browser, sent as multipart with upload progress.
        setProgress(0);
        const blobs = await Promise.all(photos.map((photo) => prepareReviewPhoto(photo.file)));
        if (!withinUploadBudget(blobs)) {
          setPhotoError("These photos are too large to upload together. Please remove one or choose smaller photos.");
          throw new Error("Your photos are too large to upload together.");
        }
        const form = new FormData();
        form.append("review", JSON.stringify(payload));
        blobs.forEach((blob, index) => form.append("images", blob, `photo-${index + 1}`));
        ({ status, json: result } = await postWithProgress("/api/reviews", form, setProgress));
      } else {
        // Text-only reviews keep the original JSON request.
        const response = await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        status = response.status;
        result = await response.json().catch(() => ({})) as { message?: string; field?: string };
      }
      if (status < 200 || status >= 300) {
        if (result.field === "images") setPhotoError(result.message ?? "Please check your photos.");
        else if (result.field && result.field in empty) setErrors((current) => ({ ...current, [result.field as keyof Fields]: result.message }));
        throw new Error(result.message || "Unable to submit your review.");
      }
      setStatus({ ok: true, message: result.message || "Thank you! Your review will appear after it is approved." });
      setFields(empty); setRating(0); clearPhotos(); setOpen(false);
    } catch (caught) {
      setStatus({ ok: false, message: caught instanceof Error ? caught.message : "Unable to submit your review." });
    } finally { inFlight.current = false; setSubmitting(false); setProgress(null); }
  }

  const field = (name: keyof Fields, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}, optional = false) =>
    <div><label htmlFor={`review-${name}`} className="block text-sm font-medium">{label}{optional ? " (optional)" : " *"}</label>
      <input id={`review-${name}`} value={fields[name]} onChange={(event) => set(name, event.target.value)} aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `review-${name}-error` : undefined} className={input} {...props} />
      {errors[name] && <p id={`review-${name}-error`} className="mt-1 text-xs text-error">{errors[name]}</p>}</div>;

  if (!open) return <div className="mt-8">
    {status?.ok && <p role="status" className="mb-4 border border-brand-green/30 bg-brand-green/5 p-3 text-sm text-brand-green-dark">{status.message}</p>}
    <button type="button" onClick={() => { setOpen(true); setStatus(null); }} className="min-h-11 w-full border border-brand-green-dark bg-brand-green-dark px-6 text-xs font-semibold uppercase tracking-[.16em] text-white sm:w-auto">Write a review</button>
  </div>;

  return <form onSubmit={(event) => void submit(event)} noValidate className="relative mt-8 space-y-4 border border-border bg-brand-cream p-5" aria-labelledby="review-form-title">
    <h3 id="review-form-title" className="font-display text-2xl text-brand-green-dark">Write a review</h3>
    {requireOrder && <p className="text-xs leading-5 text-muted">Reviews are open to customers with a delivered order. Your order ID and mobile number are used only to verify your purchase and are never published. Reviews appear after approval.</p>}
    <fieldset aria-describedby={errors.rating ? "review-rating-error" : undefined}>
      <legend className="text-sm font-medium">Your rating *</legend>
      <div className="mt-1 flex gap-1">{[1, 2, 3, 4, 5].map((value) => <label key={value} className="cursor-pointer p-1 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand-gold-dark">
        <input id={`review-rating-${value}`} type="radio" name="rating" value={value} aria-label={`${value} star${value === 1 ? "" : "s"}`} checked={rating === value} onChange={() => { setRating(value); setErrors((current) => ({ ...current, rating: undefined })); }} className="sr-only" />
        <Star size={26} strokeWidth={1.5} aria-hidden="true" className="text-brand-gold-dark" fill={value <= rating ? "currentColor" : "none"} />
        <span className="sr-only">{value} star{value === 1 ? "" : "s"}</span>
      </label>)}</div>
      {errors.rating && <p id="review-rating-error" className="mt-1 text-xs text-error">{errors.rating}</p>}
    </fieldset>
    {field("display_name", "Name to display", { maxLength: 60, autoComplete: "given-name" })}
    {field("title", "Review title", { maxLength: 120 }, true)}
    <div><label htmlFor="review-body" className="block text-sm font-medium">Your review *</label>
      <textarea id="review-body" value={fields.body} onChange={(event) => set("body", event.target.value)} rows={5} maxLength={2000} aria-invalid={Boolean(errors.body)} aria-describedby={`review-body-count${errors.body ? " review-body-error" : ""}`} className={input} />
      <p id="review-body-count" className="mt-1 text-right text-[11px] text-muted">{fields.body.length}/2000</p>
      {errors.body && <p id="review-body-error" className="text-xs text-error">{errors.body}</p>}</div>
    <fieldset aria-describedby={`review-photos-help${photoError ? " review-photos-error" : ""}`}>
      <legend className="text-sm font-medium">Add photos (optional)</legend>
      <p id="review-photos-help" className="mt-1 text-xs text-muted">Up to {MAX_REVIEW_IMAGES} photos of the product: JPG, PNG, WebP or AVIF, 5 MB each. Photos are shown only after your review is approved.</p>
      {photos.length > 0 && <ul className="mt-3 grid max-w-sm grid-cols-3 gap-3" aria-label="Selected photos">
        {photos.map((photo, index) => <li key={photo.key} className="relative aspect-square overflow-hidden border border-border bg-white">
          <Image src={photo.preview} alt={`Selected photo ${index + 1}`} fill unoptimized sizes="120px" className="object-cover" />
          <button type="button" onClick={() => removePhoto(photo.key)} disabled={submitting} aria-label={`Remove photo ${index + 1}`} className="absolute right-0 top-0 grid h-11 w-11 place-items-center bg-white/90 text-brand-charcoal shadow disabled:opacity-50"><X size={16} aria-hidden="true" /></button>
        </li>)}
      </ul>}
      {photos.length < MAX_REVIEW_IMAGES && <div className="mt-3">
        <input ref={photoInput} id="review-photos" type="file" accept={REVIEW_IMAGE_ACCEPT} multiple disabled={submitting} onChange={(event) => void addPhotos(event.target.files)} className="peer sr-only" />
        <label htmlFor="review-photos" className="inline-flex min-h-11 cursor-pointer items-center gap-2 border border-brand-green-dark bg-white px-4 text-xs font-semibold uppercase tracking-[.14em] text-brand-green-dark peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-gold-dark peer-disabled:opacity-50"><ImagePlus size={16} aria-hidden="true" />{photos.length ? "Add another photo" : "Add photos"}</label>
      </div>}
      {photoError && <p id="review-photos-error" role="alert" className="mt-2 text-xs text-error">{photoError}</p>}
    </fieldset>
    {requireOrder && <div className="grid gap-4 sm:grid-cols-2">
      {field("order_reference", "Order ID", { maxLength: 16, autoCapitalize: "characters", placeholder: "QZF-XXXXXXXXXXXX" })}
      {field("phone_number", "Mobile number used for the order", { type: "tel", inputMode: "numeric", maxLength: 16, autoComplete: "tel" })}
    </div>}
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden"><label htmlFor="review-website">Website</label><input id="review-website" tabIndex={-1} autoComplete="off" value={fields.website} onChange={(event) => set("website", event.target.value)} /></div>
    {progress !== null && <div role="status" aria-live="polite" className="text-xs text-muted">
      <label htmlFor="review-upload-progress">{progress < 100 ? `Uploading photos… ${progress}%` : "Processing photos…"}</label>
      <progress id="review-upload-progress" max={100} value={progress} className="mt-1 block h-2 w-full accent-brand-green-dark" />
    </div>}
    {status && !status.ok && <p role="alert" className="text-sm text-error">{status.message}</p>}
    <div className="flex flex-wrap gap-3">
      <button disabled={submitting} className="min-h-11 bg-brand-green-dark px-6 text-xs font-semibold uppercase tracking-[.16em] text-white disabled:opacity-50">{submitting ? "Submitting…" : "Submit review"}</button>
      <button type="button" onClick={() => setOpen(false)} className="min-h-11 border border-border px-6 text-xs font-semibold uppercase tracking-[.16em]">Cancel</button>
    </div>
  </form>;
}
