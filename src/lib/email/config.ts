import "server-only";

export type EmailConfig = {
  apiKey: string;
  from: string;
  replyTo?: string;
  siteUrl: string;
  adminRecipient?: string;
};

export function getEmailConfig(): EmailConfig | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  const replyTo = process.env.EMAIL_REPLY_TO?.trim() || undefined;
  const adminRecipient = process.env.ORDER_NOTIFICATION_EMAIL?.trim().toLowerCase() || undefined;
  const siteUrlValue = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const missing = [!apiKey && "RESEND_API_KEY", !from && "EMAIL_FROM", !siteUrlValue && "NEXT_PUBLIC_SITE_URL"].filter(Boolean);

  if (missing.length) {
    const message = `Transactional email is disabled; missing ${missing.join(", ")}.`;
    if (process.env.NODE_ENV === "production") console.error(message);
    else console.warn(message);
    return null;
  }

  let siteUrl: string;
  try {
    siteUrl = new URL(siteUrlValue!).origin;
  } catch {
    console.error("Transactional email is disabled; NEXT_PUBLIC_SITE_URL is not a valid absolute URL.");
    return null;
  }

  if (!adminRecipient) {
    const message = "Admin order email is disabled; ORDER_NOTIFICATION_EMAIL is missing.";
    if (process.env.NODE_ENV === "production") console.error(message);
    else console.warn(message);
  }

  return { apiKey: apiKey!, from: from!, replyTo, siteUrl, adminRecipient };
}
