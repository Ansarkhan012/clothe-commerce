"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import {
  hasGarmentSizeGuide,
  readGarmentSizeGuide,
  shirtMeasurementFields,
  sizesWithMeasurements,
  trouserMeasurementFields,
  type GarmentSizeGuide,
} from "@/src/lib/size-guide";
import type { GarmentSize, ProductDetails } from "@/src/types/product";

function GarmentDiagram({ showTrouser }: { showTrouser: boolean }) {
  return (
    <div className="rounded border border-border bg-brand-cream p-4">
      <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-[.18em] text-brand-gold-dark">Measurement positions</p>
      <svg viewBox={showTrouser ? "0 0 440 330" : "0 0 300 330"} role="img" aria-label={showTrouser ? "Kameez and trouser measurement diagram" : "Kameez measurement diagram"} className="mx-auto h-auto w-full max-w-md text-brand-green-dark">
        <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <path strokeWidth="2" d="M92 55 62 83 38 143l25 11 20-43-9 174h152l-9-174 20 43 25-11-24-60-30-28-35-14h-46Z" />
          <path strokeWidth="1.5" d="M127 41c2 21 44 21 46 0M82 94h136M79 142h142M77 190h146M74 274h152" />
          <path strokeDasharray="4 4" d="M58 55h184M53 94h194M51 142h198M49 190h202M49 274h202M262 55v219" />
          <g fill="currentColor" stroke="none" fontSize="10" fontFamily="sans-serif">
            <text x="102" y="50">Shoulder</text><text x="105" y="89">Chest</text><text x="106" y="137">Waist</text><text x="112" y="185">Hip</text><text x="103" y="269">Daman / Hem</text><text x="265" y="168" transform="rotate(90 265 168)">Shirt Length</text><text x="11" y="120" transform="rotate(-68 11 120)">Sleeve Length</text>
          </g>
          {showTrouser && <g transform="translate(290 48)"><path strokeWidth="2" d="M25 8h92l-8 101 22 154H82L71 135 60 263H11l22-154Z"/><path strokeDasharray="4 4" d="M20 30h102M2 263h138M71 15v248"/><g fill="currentColor" stroke="none" fontSize="10" fontFamily="sans-serif"><text x="39" y="25">Waist / Belt</text><text x="77" y="150" transform="rotate(90 77 150)">Trouser Length</text><text x="33" y="281">Bottom / Hem</text></g></g>}
        </g>
      </svg>
      <p className="mt-3 text-center text-xs text-muted">All garment measurements are in inches.</p>
    </div>
  );
}

function MeasurementTable({ title, guide, sizes, fields, selectedSize }: { title: string; guide: GarmentSizeGuide["shirt"]; sizes: GarmentSize[]; fields: typeof shirtMeasurementFields | typeof trouserMeasurementFields; selectedSize: string }) {
  const visibleFields = fields.filter(([key]) => sizes.some((size) => guide[size]?.[key] !== undefined));
  if (!visibleFields.length) return null;
  return <section aria-label={title}><h3 className="mb-3 font-display text-xl text-brand-green-dark">{title}</h3><div className="overflow-x-auto border border-border"><table className="w-full min-w-max border-collapse text-sm"><thead><tr className="bg-brand-cream"><th className="sticky left-0 z-10 bg-brand-cream px-4 py-3 text-left text-[10px] uppercase tracking-[.14em]">Measurement</th>{sizes.map((size)=><th key={size} scope="col" className={`min-w-20 px-4 py-3 text-center ${selectedSize===size?"bg-brand-gold/20 text-brand-green-dark":""}`}>{size}{selectedSize===size&&<span className="sr-only"> (selected)</span>}</th>)}</tr></thead><tbody>{visibleFields.map(([key,label])=><tr key={key} className="border-t border-border"><th scope="row" className="sticky left-0 bg-white px-4 py-3 text-left font-medium">{label}</th>{sizes.map((size)=><td key={size} className={`px-4 py-3 text-center tabular-nums ${selectedSize===size?"bg-brand-gold/10 font-semibold text-brand-green-dark":"text-muted"}`}>{guide[size]?.[key] !== undefined ? `${guide[size]?.[key]}″` : "—"}</td>)}</tr>)}</tbody></table></div></section>;
}

export function SizeGuideDialog({ details, availableSizes, selectedSize, open, onClose }: { details: ProductDetails | null | undefined; availableSizes: GarmentSize[]; selectedSize: string; open: boolean; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const guide = readGarmentSizeGuide(details);
  const sizes = sizesWithMeasurements(guide).filter((size) => availableSizes.includes(size));
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", escape);
    return () => { document.body.style.overflow = previous; window.removeEventListener("keydown", escape); };
  }, [open, onClose]);
  if (!open || !hasGarmentSizeGuide(guide) || sizes.length === 0) return null;
  const showTrouser = Object.keys(guide.trouser).length > 0;
  return <div className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center sm:p-5" role="dialog" aria-modal="true" aria-labelledby="size-guide-title"><button type="button" className="absolute inset-0 bg-black/55" aria-label="Close size guide" onClick={onClose}/><div className="relative max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:max-w-5xl sm:rounded-lg"><header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-white px-5 py-4 sm:px-7"><div><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-brand-gold-dark">Garment measurements</p><h2 id="size-guide-title" className="font-display text-2xl text-brand-green-dark">Size Guide</h2></div><button ref={closeRef} type="button" onClick={onClose} aria-label="Close size guide" className="grid size-11 place-items-center rounded-full border border-border text-brand-green-dark hover:bg-brand-cream focus-visible:outline-2 focus-visible:outline-brand-gold-dark"><X aria-hidden="true" size={20}/></button></header><div className="grid gap-7 p-5 sm:p-7 lg:grid-cols-[minmax(260px,.75fr)_minmax(0,1.35fr)]"><GarmentDiagram showTrouser={showTrouser}/><div className="min-w-0 space-y-7"><MeasurementTable title="Shirt / Kameez" guide={guide.shirt} sizes={sizes} fields={shirtMeasurementFields} selectedSize={selectedSize}/><MeasurementTable title="Trouser Measurements" guide={guide.trouser} sizes={sizes} fields={trouserMeasurementFields} selectedSize={selectedSize}/></div></div></div></div>;
}
