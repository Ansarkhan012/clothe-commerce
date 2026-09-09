import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Resend } from "resend";
import { OrderConfirmationEmail } from "@/src/emails/OrderConfirmationEmail";
import type { EmailConfig } from "./config";
import type { OrderEmailData } from "./order-email-data";
import { deliverTrackedEmail } from "./tracked-delivery";

export function sendOrderConfirmation(database: SupabaseClient, emailClient: Resend, config: EmailConfig, order: OrderEmailData) {
  const trackUrl = new URL(`/track-order?reference=${encodeURIComponent(order.public_order_id)}`, config.siteUrl).toString();
  return deliverTrackedEmail({
    database, emailClient,
    orderId: order.id,
    emailType: "order_confirmation",
    recipient: order.email,
    from: config.from,
    replyTo: config.replyTo,
    subject: `Order Confirmed — #${order.public_order_id} | QurZaib Fabrics`,
    html: OrderConfirmationEmail(order, trackUrl),
  });
}
