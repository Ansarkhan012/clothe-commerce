import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createEmailClient } from "./client";
import { getEmailConfig } from "./config";
import { getOrderEmailData } from "./order-email-data";
import { sendAdminOrderNotification } from "./send-admin-order-notification";
import { sendOrderConfirmation } from "./send-order-confirmation";
import type { EmailDeliveryResult } from "./tracked-delivery";

const acceptedByProvider = (result: EmailDeliveryResult) =>
  result.status === "sent" || result.status === "sent_untracked" ||
  (result.status === "skipped" && result.reason === "already_sent");

export async function sendOrderEmails(database: SupabaseClient, orderId: string) {
  const config = getEmailConfig();
  if (!config) return { customerEmailAccepted: false, adminEmailAccepted: false, emailStatus: "skipped" as const };

  try {
    const order = await getOrderEmailData(database, orderId);
    const emailClient = createEmailClient(config.apiKey);
    const [customer, admin] = await Promise.allSettled([
      sendOrderConfirmation(database, emailClient, config, order),
      sendAdminOrderNotification(database, emailClient, config, order),
    ]);
    const customerResult: EmailDeliveryResult = customer.status === "fulfilled"
      ? customer.value
      : { status: "failed", error: "UNEXPECTED_EMAIL_DELIVERY_FAILURE" };
    const adminResult: EmailDeliveryResult = admin.status === "fulfilled"
      ? admin.value
      : { status: "failed", error: "UNEXPECTED_EMAIL_DELIVERY_FAILURE" };
    const customerEmailAccepted = acceptedByProvider(customerResult);
    const adminEmailAccepted = acceptedByProvider(adminResult);
    const hasUntrackedDelivery = customerResult.status === "sent_untracked" || adminResult.status === "sent_untracked";
    const emailStatus = customerEmailAccepted && adminEmailAccepted && !hasUntrackedDelivery
      ? "sent" as const
      : customerEmailAccepted || adminEmailAccepted
        ? "partial" as const
        : "failed" as const;
    return { customerEmailAccepted, adminEmailAccepted, emailStatus };
  } catch (error) {
    console.error(`Post-order email processing failed for order ${orderId}:`, error instanceof Error ? error.message : "UNKNOWN_EMAIL_ERROR");
    return { customerEmailAccepted: false, adminEmailAccepted: false, emailStatus: "failed" as const };
  }
}
