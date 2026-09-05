import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Resend } from "resend";

export type OrderEmailType = "order_confirmation" | "admin_new_order";

export type EmailDeliveryResult =
  | { status: "sent"; providerMessageId: string }
  | { status: "sent_untracked"; providerMessageId: string }
  | { status: "failed"; error: string }
  | { status: "skipped"; reason: "already_sent" | "reservation_failed" | "recipient_not_configured" };

type DeliveryInput = {
  database: SupabaseClient;
  emailClient: Resend;
  orderId: string;
  emailType: OrderEmailType;
  recipient: string;
  from: string;
  replyTo?: string;
  subject: string;
  html: string;
};

export async function deliverTrackedEmail(input: DeliveryInput): Promise<EmailDeliveryResult> {
  const recipient = input.recipient.trim().toLowerCase();
  const { data: reservation, error: reservationError } = await input.database.rpc(
    "reserve_order_email_event",
    { p_order_id: input.orderId, p_email_type: input.emailType, p_recipient: recipient },
  );

  const event = reservation?.[0] as { event_id?: string; should_send?: boolean; current_status?: string } | undefined;
  if (reservationError || !event?.event_id) {
    console.error(`Unable to reserve ${input.emailType} email event for order ${input.orderId}.`);
    return { status: "skipped", reason: "reservation_failed" };
  }
  if (!event.should_send) return { status: "skipped", reason: "already_sent" };

  let providerMessageId: string;
  try {
    const { data, error } = await input.emailClient.emails.send(
      {
        from: input.from,
        to: recipient,
        subject: input.subject,
        html: input.html,
        ...(input.replyTo ? { replyTo: input.replyTo } : {}),
      },
      { idempotencyKey: `order-email/${event.event_id}` },
    );
    if (error || !data?.id) throw new Error(error?.message || "EMAIL_PROVIDER_REJECTED");
    providerMessageId = data.id;
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 1000) : "UNKNOWN_EMAIL_ERROR";
    const failedAt = new Date().toISOString();
    console.error(`${input.emailType} email failed for order ${input.orderId}: ${message}`);
    try {
      const failedFinalization = await input.database.from("order_email_events").update({
        status: "failed",
        last_error: message,
        updated_at: failedAt,
      }).eq("id", event.event_id).eq("status", "sending").select("id").maybeSingle();
      if (failedFinalization.error || !failedFinalization.data) {
        console.error(
          `The failed status for ${input.emailType} event ${event.event_id} could not be persisted; original provider error was: ${message}`,
        );
      }
    } catch {
      console.error(
        `The failed status for ${input.emailType} event ${event.event_id} could not be persisted; original provider error was: ${message}`,
      );
    }
    return { status: "failed", error: message };
  }

  const sentAt = new Date().toISOString();
  const sentUpdate = {
    status: "sent",
    provider_message_id: providerMessageId,
    sent_at: sentAt,
    updated_at: sentAt,
    last_error: null,
  };
  const finalizeSent = () => input.database.from("order_email_events").update(sentUpdate)
    .eq("id", event.event_id).eq("status", "sending").select("id").maybeSingle();

  try {
    let finalization = await finalizeSent();
    // Retrying this idempotent database write is safe. Resend is never called again.
    if (finalization.error || !finalization.data) finalization = await finalizeSent();
    if (!finalization.error && finalization.data) {
      return { status: "sent", providerMessageId };
    }
  } catch {
    // The provider has already accepted the message. Do not call Resend again.
  }

  console.error(
    `Resend accepted ${input.emailType} event ${event.event_id}, but its sent status could not be finalized.`,
  );
  return { status: "sent_untracked", providerMessageId };
}
