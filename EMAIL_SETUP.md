# Qurzaib Fabrics transactional email setup

Order confirmation and store-owner notification emails use Resend. All account, sender, recipient, reply-to, and website values are controlled through environment variables; client handoff requires no source changes.

## Local / developer testing

1. Create or sign in to a Resend account and create an API key.
2. Add these values to `.env.local` (never commit that file):

   ```env
   RESEND_API_KEY=re_xxxxxxxxx
   EMAIL_FROM="Qurzaib Fabrics <onboarding@resend.dev>"
   ORDER_NOTIFICATION_EMAIL=your-test-email@example.com
   EMAIL_REPLY_TO=your-test-email@example.com
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

3. Resend's test sender may restrict recipients. Use an address allowed by the active Resend account.
4. Restart the Next.js development server after changing environment variables.
5. Send a configuration test with `POST http://localhost:3000/api/dev/test-email`. This endpoint returns 404 in production.
6. Apply all Supabase migrations, including `202609040002_order_email_events.sql`, before testing checkout email delivery.
7. Place a test order and verify both the customer and store-owner messages.

## Client production setup

1. Transfer control to a client-owned Resend account or have the client create one.
2. Add the client's sending domain in Resend.
3. Publish the DNS records Resend provides and wait for the domain to be verified.
4. Create a production API key in the client-owned account.
5. Set the hosting environment variables:

   ```env
   RESEND_API_KEY=re_client_production_key
   EMAIL_FROM="Qurzaib Fabrics <orders@clientdomain.com>"
   ORDER_NOTIFICATION_EMAIL=client-email@example.com
   EMAIL_REPLY_TO=client-email@example.com
   NEXT_PUBLIC_SITE_URL=https://clientdomain.com
   ```

6. Redeploy the application. No source-code change is needed.

`RESEND_API_KEY`, `EMAIL_FROM`, and `ORDER_NOTIFICATION_EMAIL` are server-only settings. Never prefix them with `NEXT_PUBLIC_`. The site URL is used to construct track-order and admin links.

## Delivery and retries

Each recipient/type pair is reserved in `order_email_events` under a unique `(order_id, email_type, recipient)` constraint. Successful events are not sent again when checkout is retried with the same idempotency key. Failed events may be claimed by a later retry, and stale `sending` events can be reclaimed after 15 minutes.

Email delivery occurs only after the atomic order RPC succeeds. A Resend or configuration failure is logged and tracked without rolling back the order or changing a successful checkout response.
