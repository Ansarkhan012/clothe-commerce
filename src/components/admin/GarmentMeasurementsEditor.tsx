import type { GarmentSize } from "@/src/types/product";
import {
  readGarmentSizeGuide,
  shirtMeasurementFields,
  trouserMeasurementFields,
  updateGarmentMeasurement,
} from "@/src/lib/size-guide";

type Props = {
  sizes: GarmentSize[];
  details: Record<string, unknown>;
  onChange: (details: Record<string, unknown>) => void;
};

export function GarmentMeasurementsEditor({ sizes, details, onChange }: Props) {
  const guide = readGarmentSizeGuide(details);
  const rows = (section: "shirt" | "trouser", fields: typeof shirtMeasurementFields | typeof trouserMeasurementFields) => (
    fields.map(([key, label]) => (
      <tr key={key} className="border-t border-[#E5E7EB]">
        <th scope="row" className="sticky left-0 min-w-36 bg-white px-3 py-2 text-left text-xs font-medium text-[#4B5563]">{label}</th>
        {sizes.map((size) => (
          <td key={size} className="min-w-24 p-1.5">
            <input
              type="number"
              min="0.01"
              max="200"
              step="0.01"
              inputMode="decimal"
              aria-label={`${label}, size ${size}, inches`}
              value={guide[section][size]?.[key] ?? ""}
              onChange={(event) => onChange(updateGarmentMeasurement(details, section, size, key, event.target.value))}
              className="h-10 w-full rounded border border-[#D8DADF] px-2 text-sm"
            />
          </td>
        ))}
      </tr>
    ))
  );

  return (
    <section className="space-y-4 rounded-lg border bg-white p-5" aria-labelledby="garment-measurements-title">
      <div>
        <h2 id="garment-measurements-title" className="text-lg font-semibold">Garment Measurements / Size Guide (Optional)</h2>
        <p className="mt-1 text-sm text-[#6B7280]">Optional garment measurements in inches. Sizes come from the product variants above.</p>
      </div>
      {sizes.length === 0 ? (
        <p className="rounded border border-dashed border-[#D8DADF] p-4 text-sm text-[#6B7280]">Add a Ready-to-Wear size variant to enter measurements.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-[#E5E7EB] bg-white">
            <thead><tr><th className="sticky left-0 bg-[#F7F7F8] px-3 py-2 text-left text-xs uppercase tracking-wide">Shirt / Kurti Measurements (Optional)</th>{sizes.map((size) => <th key={size} scope="col" className="min-w-24 bg-[#F7F7F8] px-3 py-2 text-sm">{size}</th>)}</tr></thead>
            <tbody>{rows("shirt", shirtMeasurementFields)}</tbody>
          </table>
          <table className="mt-5 w-full border border-[#E5E7EB] bg-white">
            <caption className="pb-2 text-left text-sm text-[#6B7280]">Leave blank if this product does not include trousers.</caption>
            <thead><tr><th className="sticky left-0 bg-[#F7F7F8] px-3 py-2 text-left text-xs uppercase tracking-wide">Trouser Measurements (Optional)</th>{sizes.map((size) => <th key={size} scope="col" className="min-w-24 bg-[#F7F7F8] px-3 py-2 text-sm">{size}</th>)}</tr></thead>
            <tbody>{rows("trouser", trouserMeasurementFields)}</tbody>
          </table>
        </div>
      )}
    </section>
  );
}
