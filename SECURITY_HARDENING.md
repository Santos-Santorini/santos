# Security hardening — 2026-10-14

This change removes the known application backdoors and hardens the reviewed Next.js application. It does not certify that every hosted service is free of vulnerabilities.

## Access changes

- No owner access through `ADMIN_ACCESS_TOKEN`, URL query tokens, token headers, or legacy token cookies. Use the normal login.
- No hidden-user listing filter, password sharing with an owner, or privilege override for a support username. The identified legacy support usernames and `admin_webwise_hidden` record are retired and shown as inactive.
- Google owner access comes only from `ADMIN_GOOGLE_ALLOWED_EMAILS`. Previously implicit Google owners must be configured explicitly if the client wants them retained. Old Google sessions must sign in again.
- Existing password sessions must sign in again. Every server authorization verifies the current active account and a fingerprint of its password and roles. Password changes, role changes, deletion and deactivation revoke sessions.
- Server-rendered order packing slips and sales analytics require webshop permissions; the dashboard omits customer/order/integration records outside the viewer's permissions.
- All reviewed admin API handlers check permissions themselves. Content editors cannot invoke order or integration operations by calling API URLs directly.
- Cookie mutations check the browser origin. Public catalog uploads and deletes require the preview permission. Cron endpoints fail closed when `CRON_SECRET` is missing.
- Login attempts are limited per IP per process. Deployments with several instances should also enforce a shared hosting firewall limit; this process limit alone is not a global brute-force protection guarantee.
- New and changed admin passwords must contain 12–256 characters. Existing passwords and infrastructure keys were not rotated in this change.

## Data and content

- Admin registry reads and writes use strict persistent storage. Storage errors cannot restore cached/local privileges. Production requires configured persistent admin storage.
- Public custom-suit submissions are unpriced drafts with an allowlist of configuration fields; they cannot assign payment status, account ownership, webshop items or totals. Existing webshop checkout prices are still calculated on the server.
- Production order creation fails when its database is unavailable instead of accepting orders into ephemeral files.
- Product and blog HTML is sanitized; structured JSON cannot terminate a script element.
- Asset reads reject traversal and local symlink escapes. Upload filenames must have an allowed extension even if their claimed MIME type is allowed.
- Remote image fetches use trusted hosts, reject redirects and credentials, restrict MIME types, time out and cap streamed data at 10 MB. SVG/HTML are not accepted through the image proxy.

## Validation

- TypeScript passed; all 320 tests in 37 suites passed, including access revocation, hidden-account regression, permission checks, CSRF, XSS, remote image restrictions and public upload rejection.
- Production build passed. Production dependency audit reported zero vulnerabilities.
- Local production HTTP smoke checks confirmed public catalog writes return 403, private orders/admin reads return 401, legacy tokens return 401, and cross-origin login returns 403.
- Read-only live verification confirmed `site-config` is private; anonymous HEAD requests for `orders`, `integration_sync_runs` and `integration_sync_items` returned 401. The connected Supabase account did not expose this project's database administration, so a complete live SQL/RLS/advisor inventory was not performed.
- At review time `npm audit --omit=dev` reported zero vulnerabilities. The full audit retained five high entries for the same unpatched `braces` issue through the ESLint development dependency chain. Do not downgrade Next.js to follow `npm audit fix --force`; revisit this tooling advisory when a compatible patch becomes available.

## Production follow-up

Verify the deployed login, owner user list, allowed Google owner addresses and cron secret after deployment. Existing registered client owner access is preserved. Review/rotate client-owned admin passwords and hosting, database, cPanel and upload credentials where necessary. Keep the configuration bucket private. Review storage policies, database functions, infrastructure members and cPanel PHP/upload handlers separately: those remote services are not fully represented by this tracked repository.

A push to main can trigger the hosting provider's deployment. A successful Git push alone is not evidence that the deployment succeeded. No bank/payment integration is included.
