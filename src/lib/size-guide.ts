import type { GarmentSize } from "@/src/types/product";

export const garmentSizes: GarmentSize[] = ["XS", "S", "M", "L", "XL", "XXL"];

export const shirtMeasurementFields = [
  ["shoulder", "Shoulder"],
  ["chest", "Chest"],
  ["waist", "Waist"],
  ["hip", "Hip"],
  ["sleeve_length", "Sleeve Length"],
  ["armhole", "Armhole"],
  ["shirt_length", "Shirt Length"],
  ["daman", "Daman / Hem"],
] as const;

export const trouserMeasurementFields = [
  ["trouser_length", "Trouser Length"],
  ["waist_belt", "Waist / Belt"],
  ["thigh", "Thigh"],
  ["bottom_hem", "Bottom / Hem"],
] as const;

export type ShirtMeasurementKey = (typeof shirtMeasurementFields)[number][0];
export type TrouserMeasurementKey = (typeof trouserMeasurementFields)[number][0];
export type MeasurementValues = Partial<Record<ShirtMeasurementKey | TrouserMeasurementKey, number>>;
export type MeasurementBySize = Partial<Record<GarmentSize, MeasurementValues>>;
export type GarmentSizeGuide = { shirt: MeasurementBySize; trouser: MeasurementBySize };

const emptyGuide = (): GarmentSizeGuide => ({ shirt: {}, trouser: {} });

function objectValue(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

const partKeys = ["included", "fabric", "length", "width"] as const;
const measurementKeys = [...shirtMeasurementFields, ...trouserMeasurementFields].map(([key]) => key);

export function serializeOptionalGarmentPart(value: unknown): Record<string, unknown> | undefined {
  const source = objectValue(value);
  if (!source) return undefined;
  const result: Record<string, unknown> = {};
  for (const key of partKeys) {
    const field = source[key];
    if (field !== undefined && field !== null && field !== "") result[key] = field;
  }
  const rawGuide = objectValue(source.size_guide);
  const sizeGuide: Record<string, Record<string, unknown>> = {};
  if (rawGuide) {
    for (const size of garmentSizes) {
      const rawValues = objectValue(rawGuide[size]);
      if (!rawValues) continue;
      const values: Record<string, unknown> = {};
      for (const key of measurementKeys) {
        const field = rawValues[key];
        if (field !== undefined && field !== null && field !== "") values[key] = field;
      }
      if (Object.keys(values).length) sizeGuide[size] = values;
    }
  }
  if (Object.keys(sizeGuide).length) result.size_guide = sizeGuide;
  return Object.keys(result).length ? result : undefined;
}

function readMeasurements(value: unknown): MeasurementBySize {
  const guide = objectValue(objectValue(value)?.size_guide);
  if (!guide) return {};
  const result: MeasurementBySize = {};
  for (const size of garmentSizes) {
    const source = objectValue(guide[size]);
    if (!source) continue;
    const values: MeasurementValues = {};
    for (const [key, raw] of Object.entries(source)) {
      const number = typeof raw === "number" ? raw : Number.NaN;
      if (Number.isFinite(number) && number > 0) values[key as keyof MeasurementValues] = number;
    }
    if (Object.keys(values).length) result[size] = values;
  }
  return result;
}

export function readGarmentSizeGuide(details: unknown): GarmentSizeGuide {
  const source = objectValue(details);
  if (!source) return emptyGuide();
  return { shirt: readMeasurements(source.shirt), trouser: readMeasurements(source.trouser) };
}

export function hasGarmentSizeGuide(guide: GarmentSizeGuide): boolean {
  return [guide.shirt, guide.trouser].some((section) =>
    Object.values(section).some((values) => values && Object.keys(values).length > 0)
  );
}

export function hasMeasurementsForSize(guide: GarmentSizeGuide, size: GarmentSize | null | undefined): boolean {
  if (!size) return false;
  return Boolean(
    (guide.shirt[size] && Object.keys(guide.shirt[size]).length > 0) ||
    (guide.trouser[size] && Object.keys(guide.trouser[size]).length > 0)
  );
}

export function updateGarmentMeasurement(
  details: Record<string, unknown>,
  section: "shirt" | "trouser",
  size: GarmentSize,
  key: ShirtMeasurementKey | TrouserMeasurementKey,
  rawValue: string,
): Record<string, unknown> {
  const part = objectValue(details[section]) ?? {};
  const guide = readMeasurements(part);
  const values = { ...(guide[size] ?? {}) };
  if (rawValue === "") delete values[key];
  else {
    const number = Number(rawValue);
    if (Number.isFinite(number) && number > 0) values[key] = number;
  }
  if (Object.keys(values).length) guide[size] = values;
  else delete guide[size];
  return { ...details, [section]: { ...part, size_guide: guide } };
}

export function sizesWithMeasurements(guide: GarmentSizeGuide): GarmentSize[] {
  return garmentSizes.filter((size) => Boolean(guide.shirt[size] || guide.trouser[size]));
}
