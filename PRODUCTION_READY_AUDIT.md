# Production Readiness Audit

Audit date: 2026-08-31  
Scope: repository implementation and static/automated verification; no live Supabase migration or deployment performed.

## Scorecard

| Area | Score | Assessment |
|---|---:|---|
| Security | 8.7/10 | Strong transactional/RLS/admin/tracking design plus fail-fast migration gates; distributed rate limiting and staging RLS tests remain. |
| Reliability | 8.5/10 | Atomic checkout, idempotency, retry-safe policies, locked exactly-once cancellation restock, and clean build; live migration exercises remain. |
| E-commerce Completeness | 8/10 | Mature COD, fulfillment, tracking, support, search/filter; no gateway, courier integration, coupons, or customer account. |
| UX | 8.5/10 | Premium branded shopping and professional checkout/admin flows. |
| Mobile | 8/10 | Responsive layouts implemented; final real-device data-rich QA remains. |
| Performance | 8/10 | Server pagination, selected product fields, Next Image, bounded queries; bundle and real CDN telemetry remain. |
| SEO | 8/10 | Metadata, dynamic product metadata, sitemap and robots; production canonical host and structured data expansion remain. |
| Accessibility | 8/10 | Strong semantic/focus/form baseline; formal assistive-technology audit remains. |
| Maintainability | 8/10 | Central config/validation, server routes, additive migration, zero lint errors; some compact components merit later formatting/refactoring. |

Overall readiness: **8.3/10 — staging candidate, not yet production-approved**.

## Critical

None identified in the code after this upgrade.

## High

1. **Migration not integration-tested.** Apply only in staging first. Its pre-flight raises `LEGACY_DATA_INCOMPATIBLE` with distinct unsupported `payment_method`, `payment_status`, `order_status`, or `province` values. Correct such data explicitly, then retry the whole transaction. Test rollback-safe deployment ordering.
2. **Rate limiting is process-local.** Multi-instance/serverless deployments need a distributed store or platform WAF rules for login, tracking, checkout, support, and newsletter endpoints.
3. **Owner/legal configuration incomplete.** Contact details and policy commitments remain `OWNER_REVIEW_REQUIRED`; production publication requires approval.

## Medium

1. No transactional email provider. Orders succeed without email and the UI makes no false delivery claim.
2. No automated live Postgres concurrency, RLS-role, or Storage integration suite. Existing tests statically assert critical controls and validate shared schemas.
3. Customer account/order history is absent. Guest COD and secure reference tracking remain functional.
4. Product deletion remains available under existing admin RLS; operational policy should prefer archive/unpublish once schema support exists.
5. CSP currently permits inline styles/scripts required by the present Next.js setup and allows `unsafe-eval` for development compatibility. Test a nonce-based production CSP as a later hardening task.
6. Legacy orders that have no normalized `order_items` cannot be safely auto-restocked. Cancellation intentionally fails with a remediation error; define an owner-approved manual process for those orders.

## Low

1. Multiple lockfiles cause a Next.js workspace-root warning. Set `turbopack.root` or remove the redundant root lockfile after confirming workspace ownership.
2. Node’s test runner reports a typeless-package reparsing warning; tests still pass.
3. Static sitemap uses an example origin until `NEXT_PUBLIC_SITE_URL` is configured.
4. Formal screen-reader, keyboard trap, color-contrast tooling, and throttled-network audits remain.

## Security Review

- XSS: React escaping and bounded plain-text inputs used; no new HTML injection sink.
- Injection: strict schemas and Supabase query builders used; search control characters are stripped before PostgREST OR expressions.
- Authorization/IDOR: admin endpoints call `requireAdmin`; transition RPC independently checks `is_admin()`; public tracking requires reference plus phone and returns a minimal DTO.
- CSRF: state-changing admin requests rely on same-site Supabase session cookies and database authorization. Add explicit Origin checking if cross-site cookie settings change.
- Service role: imported only by server modules and never exposed with a public prefix.
- Mass assignment: API bodies are strict and RPC parameters are explicitly mapped.
- PII: tracking omits identity/address/internal IDs and returns generic not-found responses.
- Storage: prior admin-only writes and public delivery/no-listing design are preserved.
- Inventory: row locks, nonnegative stock constraint, authoritative pricing, duplicate normalization, and transaction rollback remain.
- Cancellation inventory: the locked order row plus `inventory_restocked_at` prevents repeated/concurrent double-restock; quantities come only from normalized `order_items`. Shipment requires courier identity/tracking, and returns never auto-restock.
- Migration retries: exact new read policies are dropped deterministically before recreation, avoiding duplicate-policy failure after partial/manual schema preparation.
- Legacy compatibility: only explicit case/spelling equivalents are normalized. Unknown values abort with field-specific diagnostics while the surrounding transaction preserves all existing rows.

## Required Staging Scenarios

1. Guest browses/filter/searches, chooses a real in-stock size, adds quantity within stock, and completes COD checkout.
2. Confirm random `QZF-XXXXXXXXXXXX`, preserved legacy `order_number`, authoritative delivery charge, item snapshots, and stock decrement.
3. Repeat the same idempotency key and verify one order only.
4. Race two checkouts for the final unit and verify one clean out-of-stock failure.
5. Track with reference plus correct phone; reject reference-only, phone-only, wrong phone, legacy integer, and malformed input.
6. Verify tracking payload contains no name, email, phone, address, UUID, internal note, or admin data.
7. Anonymous and customer sessions cannot list/update orders/history or write products/Storage.
8. Admin can execute each valid transition and cannot skip or reverse states; every change produces one history row.
9. Verify shipment without either courier field fails; add both fields, ship successfully, deliver, then change payment status intentionally according to owner process.
10. Cancel a new pre-shipment order and verify stock returns once and `inventory_restocked_at` is set. Retry and race two cancellation sessions; verify no double-restock. Confirm shipped/delivered and returned orders do not auto-restock.
11. Submit support/newsletter forms; verify persistence, duplicate handling, validation, rate limiting, and no fake success when tables are unavailable.
12. Verify public product image delivery works while anonymous Storage object listing remains denied.
13. Test 320, 360, 375, 390, 414, 430, 768, 1024, 1280, and 1440 widths with real catalog/order data.

## Verification Evidence

- `npm run lint`: PASS
- `npm run typecheck`: PASS
- `npm test`: PASS (20/20)
- `npm run build`: PASS (40/40 routes, no `location is not defined` diagnostic)
- `git diff --check`: PASS (line-ending notices only)

## Release Decision

**Do not deploy or apply the migration yet.** The implementation is ready for owner review and staging. Production approval requires resolving all High findings, completing the staging scenarios, backing up production, and confirming deployment ordering.
