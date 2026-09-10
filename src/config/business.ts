import {
  BUSINESS_EMAIL,
  BUSINESS_PHONE,
  WHATSAPP_DISPLAY,
} from "../lib/contact.ts";

const publicBusinessValue = (value: string | undefined) => value?.trim() || null;

export const businessConfig = {
  brandName: "QurZaib Fabrics",
  tagline: "Elegance Woven With Faith",
  country: "Pakistan",
  currency: "PKR",
  supportEmail: BUSINESS_EMAIL,
  supportPhone: BUSINESS_PHONE,
  whatsapp: WHATSAPP_DISPLAY,
  businessAddress: publicBusinessValue(process.env.NEXT_PUBLIC_BUSINESS_ADDRESS),
  freeShippingThreshold: 5000,
  standardDeliveryCharge: 250,
  returnWindowDays: null as number | null,
  shippingWindow: null as string | null,
  refundTimeline: null as string | null,
  disputeJurisdiction: null as string | null,
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
