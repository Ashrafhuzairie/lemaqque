# Cloudflare release readiness — 4 November 2026

The frontend build can be deployed to Cloudflare Pages. A complete cloud-account launch is **not cleared**: the configured Supabase data API reports unavailable tables, authenticated saving/isolation has not been verified against that project, and the full dependency audit retains build-tool advisories. Publishing frontend files does not resolve those items.

## Verification result

The final run passed **64 unit/database tests and all 15 browser scenarios**. TypeScript/production build and the production/offline smoke with shipped Cloudflare security headers passed. See [VALIDATION.md](VALIDATION.md) for scope and limits.

## Checks and changes

- Public beta/testing/placeholder language and unfinished product sections were reviewed. Unavailable 3D notices no longer occupy exercise and muscle screens; the working photos, written guidance and eleven-group directory remain. The unlaunched membership destination redirects home and the footer links to real training programs. Privacy text describes actual storage behavior without claiming certification.
- The supplied feline emblem is used in the shared brand, favicon, installed-app icons and static hero fallback. LMQ lettering uses outlined Barlow Condensed. Asset provenance and font licensing are in [ASSETS.md](ASSETS.md).
- Imported/custom workouts can compare compatible prior completed sets and explicitly reuse loads. Timed planks use seconds labels and are excluded from repetition-based lifting volume. Source prescriptions and nutrition equations remain intact.
- Device-workspace selection survives cloud-session restoration and reload. Signing in explicitly selects the cloud workspace. Switching storage does not copy records between accounts and devices.
- Calendar accessible names include their visible date/status text. Desktop/mobile route checks, serious/critical accessibility scans and workout lifecycle checks are automated in `tests/e2e/readiness.spec.ts`.
- `public/_headers` supplies CSP, anti-framing, MIME protection, referrer policy, restricted browser capabilities, HTTPS transport policy, immutable hashed assets and fresh service-worker/manifest checks. CSP allows only this configured Supabase project's HTTPS/WebSocket origin; review it when changing backend or approving external model assets. Inline styles remain permitted for React/charts; inline scripts are not permitted.
- `npm run test:cloudflare` applies the actual built Pages header rules to preview responses and drives the production/offline smoke. This is a local deployment simulation, not evidence of live Cloudflare headers.

## Security evidence and limits

`npm audit --omit=dev` reports **zero advisories**. The full audit reports **ten affected build packages: eight moderate, two low; zero high/critical**. The underlying advisories concern `deepmerge`, `glob` and `minimatch` in the PWA/Workbox build chain. `npm audit fix --dry-run` offered no compatible changes. These findings have not been suppressed, marked resolved or bypassed by replacing dependencies with incompatible aliases. A fully clean dependency assessment remains open.

The source review checked owner-scoped repository writes, SQL RLS and cross-owner foreign keys, catalog authorization through server-controlled `app_metadata`, invoker RPCs, Auth-token validation in account deletion, safe source URLs and escaped user text. PostgreSQL tests exercise migration policies locally. A pattern scan of tracked/proposed source found no matching private keys or privileged tokens. This is not an independent penetration test or a guarantee that no vulnerability exists.

Live cloud checks are described in [CLOUD-READINESS.md](CLOUD-READINESS.md). Auth settings respond, but public exercises and zero-row private-table queries return `PGRST205`. No hosted migrations, account creation, emails, private-data reads or deployment were performed. Operator review of migration history/API exposure, authenticated CRUD, two-account isolation, email delivery/recovery and deployed account deletion is still required. Do not widen private-table grants to make an anonymous probe succeed.

The deployed privacy page also needs the operator's real identity/contact information. No operator details, human anatomy mesh or professionally validated motion clips are invented.

## Deploy from GitHub

1. In Cloudflare Pages, connect this repository and choose the intended production branch.
2. Use build command `npm ci && npm run build`, output directory `dist`, and Node 24.
3. Add the intended project's public `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as build variables. Never add a service-role/admin key to a frontend variable.
4. Complete the Supabase checks in [DEPLOYMENT.md](DEPLOYMENT.md), using only unapplied migrations and the actual deployed HTTPS origin for Auth redirects and Edge Function CORS.
5. After a Pages preview exists, verify `/app/workouts` direct navigation, response security headers, sign-up/confirmation/recovery, separate-account saving, export/deletion, and offline device tracking on that origin. The repository's SPA redirect and PWA assets are included in `dist`.

A GitHub push, environment publication and Cloudflare deployment are separate actions. No Cloudflare credentials/project binding are available in this workspace.
