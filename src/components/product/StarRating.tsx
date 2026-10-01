import { Star } from "lucide-react";

export function StarRating({ value, size = 16, label }: { value: number; size?: number; label?: string }) {
  const rounded = Math.round(value * 2) / 2;
  return <span role="img" aria-label={label ?? `Rated ${value.toFixed(1)} out of 5`} className="inline-flex items-center gap-0.5 text-brand-gold-dark">
    {[1, 2, 3, 4, 5].map((star) => <span key={star} className="relative inline-flex" aria-hidden="true">
      <Star size={size} strokeWidth={1.5} />
      {rounded >= star - 0.5 && <span className="absolute inset-0 overflow-hidden" style={{ width: rounded >= star ? "100%" : "50%" }}><Star size={size} strokeWidth={1.5} fill="currentColor" /></span>}
    </span>)}
  </span>;
}

// Fixed time zone keeps server and client markup identical (no hydration mismatch).
export const formatReviewDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-PK", { year: "numeric", month: "short", day: "numeric", timeZone: "Asia/Karachi" });
