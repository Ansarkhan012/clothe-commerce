export const businessConfig = {
  brandName: "QurZaib Fabrics",
  tagline: "Elegance Woven With Faith",
  country: "Pakistan",
  currency: "PKR",
  supportEmail: null as string | null,
  supportPhone: null as string | null,
  whatsapp: null as string | null,
  businessAddress: null as string | null,
  freeShippingThreshold: 5000,
  standardDeliveryCharge: 250,
  returnWindowDays: null as number | null,
  shippingWindow: "OWNER_REVIEW_REQUIRED",
  refundTimeline: "OWNER_REVIEW_REQUIRED",
  disputeJurisdiction: "OWNER_REVIEW_REQUIRED",
} as const;

export const pakistanProvinces = [
  "Sindh",
  "Punjab",
  "Islamabad Capital Territory",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Gilgit-Baltistan",
  "Azad Jammu & Kashmir",
] as const;

export function calculateDisplayedDelivery(subtotal: number) {
  return subtotal > businessConfig.freeShippingThreshold
    ? 0
    : businessConfig.standardDeliveryCharge;
}
