import { z } from "zod";
import { PakistaniPhoneSchema } from "./order.ts";

/** Client decision: unverified reviews stay disabled until the owner approves a policy for them. */
export const REVIEW_POLICY = { allowUnverified: false, pageSize: 5 } as const;

// Review text is stored and rendered as plain text (React escapes it). These rules
// additionally keep markup, links and control characters out of the database.
const CONTROL_CHARACTERS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F​-‏‪-‮⁦-⁩]/g;
export const normalizeReviewText = (value: string) =>
  value.normalize("NFC").replace(/\r\n?/g, "\n").replace(CONTROL_CHARACTERS, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
const MARKUP = /<\s*\/?\s*[a-z!?]|&[a-z]+;|&#\d+;/i;
const LINK = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|pk|io|co|info|xyz|site|shop)\b)/i;

const reviewText = (min: number, max: number) => z.string().transform(normalizeReviewText)
  .pipe(z.string().min(min).max(max)
    .refine((value) => !MARKUP.test(value), "HTML is not allowed in reviews")
    .refine((value) => !LINK.test(value), "Links are not allowed in reviews"));

export const ReviewSubmissionSchema = z.object({
  product_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  display_name: reviewText(2, 60).refine((value) => /^[\p{L}\p{M}\p{N} .'-]+$/u.test(value), "Use letters, numbers, spaces, apostrophes, dots or hyphens"),
  title: z.string().optional().transform((value) => normalizeReviewText(value ?? "")).pipe(z.union([z.literal(""), reviewText(2, 120)])),
  body: reviewText(10, 2000),
  order_reference: z.string().trim().toUpperCase().regex(/^QZF-[A-F0-9]{12}$/, "Enter the order ID from your confirmation, e.g. QZF-1A2B3C4D5E6F").optional().or(z.literal("").transform(() => undefined)),
  phone_number: PakistaniPhoneSchema.optional().or(z.literal("").transform(() => undefined)),
  // Honeypot: real customers never see or fill this field.
  website: z.string().max(0).optional(),
}).strict().superRefine((value, ctx) => {
  if (Boolean(value.order_reference) !== Boolean(value.phone_number)) {
    ctx.addIssue({ code: "custom", path: [value.order_reference ? "phone_number" : "order_reference"], message: "Enter both your order ID and the mobile number used for the order" });
  }
  if (!REVIEW_POLICY.allowUnverified && !value.order_reference) {
    ctx.addIssue({ code: "custom", path: ["order_reference"], message: "Enter the order ID and mobile number of your delivered order" });
  }
});

export const ReviewModerationSchema = z.object({
  status: z.enum(["pending", "approved", "rejected", "hidden"]),
  note: z.string().trim().max(500).optional(),
}).strict();

export const reviewStatuses = ["pending", "approved", "rejected", "hidden"] as const;
export type ReviewStatus = (typeof reviewStatuses)[number];
