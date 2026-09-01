# QurZaib Fabrics Production Upgrade

## Features Implemented

- Professional guest checkout with customer email, Pakistani mobile validation, expanded delivery address, province, postal code, and delivery notes.
- Server-generated high-entropy public order references while preserving the legacy UUID and integer order number.
- Secure tracking by public reference plus phone, with a minimal response and fulfillment timeline.
- Database-enforced order lifecycle, immutable status-history inserts, manual courier fields, and separated payment status.
- Authenticated admin order list, search, pagination, status filtering, order detail, financial summary, items, courier entry, timeline, and confirmed status actions.
- Server-side product search, actual category/size/availability/sale/price filters, sorting, and 24-item pagination.
- Persisted support inquiries and newsletter subscriptions with strict validation and duplicate protection.
- Necessary-only cookie defaults and user-controlled optional preferences. No analytics or marketing scripts are installed.
- Branded 404/error states, sitemap, robots rules, security headers, help center, support, and policy/governance routes.

## Checkout Upgrade

The checkout sends only product UUID, size, and quantity. The server validates the full payload and calls the database RPC. PostgreSQL locks product rows, normalizes duplicate lines, validates stock/variants, snapshots product data, recalculates effective prices and delivery, inserts the order/items/history, and decrements stock atomically. The existing idempotency advisory lock remains.

Client totals are explicitly display-only. The checkout confirmation exposes the random public reference, payment method, total, and initial status—never the internal UUID or integer.

## Payment Methods

- **Cash on Delivery:** enabled and functional; new orders use `payment_status = unpaid` and `order_status = pending`.
- **Card, Easypaisa, JazzCash:** visibly disabled as “Coming soon.” No raw card data fields or simulated success exist.
- **Bank transfer:** not enabled because owner bank details and verification policy were not provided.

## Order Reference Security

`public_order_id` uses `QZF-` plus 12 uppercase hexadecimal characters generated from six cryptographically random bytes in PostgreSQL. A unique index on `upper(public_order_id)` provides case-insensitive uniqueness. Existing orders are backfilled. The UUID primary key and legacy integer `order_number` are preserved and no longer shown to customers.

## Order Lifecycle

Supported normal flow:

`pending → confirmed → processing → packed → ready_to_ship → shipped → out_for_delivery → delivered`

Controlled exceptional states include cancellation, return, refund, and failure paths. `update_order_status()` row-locks the order, verifies `profiles.role = admin` through the authenticated database session, rejects invalid transitions, updates shipment timestamps, and writes `order_status_history` in the same transaction. Payment and order state remain independent.

Migration hardening added these fulfillment invariants:

- A transition to `shipped` requires a non-empty effective courier name and courier tracking number. Values already saved on the order may be reused; otherwise the transition raises `COURIER_REQUIRED_FOR_SHIPMENT`.
- Cancelling a pre-shipment order restores stock from aggregated normalized `order_items` exactly once. The order-row `FOR UPDATE` lock serializes concurrent attempts and `inventory_restocked_at` is the durable idempotency marker.
- A legacy order without normalized `order_items` fails cancellation with `CANCELLATION_RESTOCK_REQUIRES_ORDER_ITEMS` for explicit manual remediation instead of guessing from JSON.
- Shipped/delivered orders have no cancellation transition. Returned products are never automatically restocked because resale condition requires a separate controlled decision.

## Admin Improvements

- Orders API requires server-verified admin authentication.
- Order listing supports reference/phone search, status/payment filters in the API, date bounds, sorting, and pagination.
- Order detail contains internal UUID only inside authenticated admin data, customer/delivery details, snapshot items, financial breakdown, courier information, and timeline.
- Every status action requires browser confirmation and database transition validation.
- Product CRUD remains protected by existing RLS and Storage policies. Image previews now use optimized image components, and previous lint/type defects were corrected.

## Database Migration

New unapplied migration:

`../supabase/migrations/202608310002_production_ecommerce_upgrade.sql`

It adds nullable columns first, backfills references/payment status, then applies constraints. It creates `order_status_history`, `support_inquiries`, and `newsletter_subscribers`; overloads the atomic checkout RPC without removing the legacy signature; and preserves products, orders, users, order numbers, images, RLS, and Storage behavior.

Before constraint validation, a pre-flight block normalizes only unambiguous case/spelling variants for `payment_method`, `payment_status`, `order_status`, and `province`. Unsupported values abort the transaction with `LEGACY_DATA_INCOMPATIBLE`, the exact field, and the distinct values requiring manual correction. No unknown value is silently rewritten. Policy creation is deterministic on retry: each exact intended policy is dropped with `DROP POLICY IF EXISTS` immediately before recreation.

The migration was prepared only. It was **not applied**.

## Security Controls

- Service-role key remains server-only.
- Checkout, tracking, support, and newsletter inputs use strict Zod validation and body limits where sensitive.
- Tracking returns no name, phone, email, address, user UUID, internal order UUID, or notes.
- Admin mutations use an authenticated Supabase session and database admin-role verification.
- Support/newsletter tables have no public insert policy; only validated server routes write with the service role.
- Security headers include nosniff, frame denial, strict referrer behavior, restrictive permissions, and a Supabase-compatible CSP.
- Current rate limiting is best-effort process-local protection. A distributed/edge limiter remains a deployment requirement for serverless scale.

## New Pages

Help Center, Support, Cookies, Refund, Cancellation, Return/Exchange, Disclaimer, Accessibility, Security Policy, Responsible Disclosure, Data Processing Information, Acceptable Use, Community Guidelines, branded Not Found, and general error handling.

## Homepage / Design Improvements

The prior emerald/gold QurZaib rebrand remains. Navigation now opens real catalog search; the footer exposes customer care, legal, security/governance, cookie preferences, and newsletter functions without fake social profiles or unsupported categories.

## Mobile Improvements

Checkout fields stack cleanly, order confirmation actions stack on small screens, catalog filters collapse into one/two-column layouts, admin data tables scroll within their container, and order detail cards reflow. The previous global 320px overflow issue remains fixed.

## SEO

- Static sitemap and robots metadata routes.
- Dynamic product metadata retained.
- Branded application/Open Graph/Twitter metadata retained.
- `NEXT_PUBLIC_SITE_URL` configures production sitemap origins.
- No fake ratings or review structured data were added.

## Accessibility

- Explicit labels, error associations, alert/live regions, disabled states, keyboard-native forms/details, focus styling, semantic fieldsets, and reduced motion.
- Icon-only cart actions now have accessible names.
- Cookie preferences are presented as a labelled modal dialog.

## Tests

- Lint: **PASS**
- Typecheck: **PASS**
- Tests: **PASS — 20/20**
- Build: **PASS — 40/40 routes generated**
- Previous checkout `location is not defined` diagnostic: **resolved; absent from build output**

Automated tests cover strict checkout data, unknown price rejection, quantity bounds, duplicate normalization, public-reference plus phone tracking, minimal tracking DTO, random-reference uniqueness controls, policy retry safety, legacy-value fail-fast gates, transition enforcement, mandatory shipment courier data, valid shipment auditing, exactly-once cancellation restock, repeated/concurrent cancellation guards, data preservation, atomic checkout locking/idempotency, and RLS/security markers. These are code/schema invariant tests; live PostgreSQL concurrency and RLS behavior still require staging integration tests after migration application.

## Production Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — server-only; never use a `NEXT_PUBLIC_` prefix
- `NEXT_PUBLIC_SITE_URL`

Future email/payment/rate-limit providers will require separate server-only variables when selected.

## Owner Configuration Required

- Support email, phone, WhatsApp number, and business address.
- Return/exchange window, eligible conditions, exclusions, and return-shipping responsibility.
- Shipping window and service exceptions.
- Refund method and processing timeline.
- Cancellation cutoff and treatment of dispatched orders.
- Governing law, dispute jurisdiction, privacy retention schedule, and legal entity information.
- Security disclosure mailbox and response target.
- Final hero/logo approval and licensed imagery.
- Whether COD collection should be marked paid manually at delivery.

## Remaining Risks

- The new migration has not been executed against a Supabase staging database; SQL behavior, RLS roles, RPC grants, and legacy data values require staging verification.
- Existing legacy orders without normalized `order_items` intentionally require manual remediation before cancellation can restore inventory. The migration will not infer restock quantities from legacy JSON.
- Process-local rate limiting is not sufficient across multiple serverless instances. Configure an edge/WAF or distributed provider before public launch.
- No transactional email provider exists; checkout accurately avoids claiming an email was sent.
- Customer account/order-history functionality was not added because only admin authentication exists and guest COD must remain available.
- No payment gateway, courier API, coupon engine, analytics, or marketing platform is configured.
- Policy templates are not final legal advice and contain explicit owner-review fields.
- Full real-data browser testing needs a reachable staging Supabase project and admin/customer test identities.

## Deployment Steps

1. Back up production and clone current data into staging.
2. Review all owner/legal configuration and update `src/config/business.ts`.
3. Apply `202608310002_production_ecommerce_upgrade.sql` to staging only.
4. Verify backfill uniqueness, legacy integer preservation, constraints, RLS, RPC grants, and status-history initialization.
5. Deploy the matching application build to staging with all four environment variables.
6. Execute the guest checkout, tracking, admin lifecycle, support, newsletter, and authorization scenarios listed in the audit.
7. Configure distributed rate limiting/WAF rules.
8. Re-run lint, typecheck, tests, and build in CI.
9. Schedule a production backup and maintenance window, then apply the migration before deploying code that calls the new RPC signature.
10. Monitor checkout errors, stock, order history, and support writes. Do not log PII or secrets.

Rollback should prefer application rollback while retaining additive columns/tables. Do not drop populated production columns during an incident. The old atomic RPC overload is retained for application compatibility; remove it only in a later reviewed migration after all old deployments are gone.
