import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Resend } from "resend";
import { AdminOrderNotificationEmail } from "@/src/emails/AdminOrderNotificationEmail";
import type { EmailConfig } from "./config";
import type { OrderEmailData } from "./order-email-data";
import { deliverTrackedEmail, type EmailDeliveryResult } from "./tracked-delivery";

export function sendAdminOrderNotification(database: SupabaseClient, emailClient: Resend, config: EmailConfig, order: OrderEmailData) {
  if (!config.adminRecipient) return Promise.resolve<EmailDeliveryResult>({ status: "skipped", reason: "recipient_not_configured" });
  const adminUrl = new URL(`/admin/orders/${encodeURIComponent(order.id)}`, config.siteUrl).toString();
  return deliverTrackedEmail({
    database,
    emailClient,
    orderId: order.id,
    emailType: "admin_new_order",
    recipient: config.adminRecipient,
    from: config.from,
    replyTo: config.replyTo,
    subject: `New Order #${order.public_order_id} — Rs. ${order.total_amount.toLocaleString("en-PK")}`,
    html: AdminOrderNotificationEmail(order, adminUrl),
  });
}
