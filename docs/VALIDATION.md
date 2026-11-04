# Validation evidence

## Original MVP checks (historical)

Verified in this cloud workspace on 1 November 2026 (Asia/Kuala_Lumpur).

- `npm test`: **27 passed**. Fitness calculations, serving multipliers, timezone boundaries, pause timing, attendance denominator, input bounds, five-day/equipment plan generation, PostgreSQL RLS ownership, cross-user foreign keys, transactional/idempotent workout completion, admin-claim handling, draft catalog access, and private storage ownership policies.
- PostgreSQL tests execute the core, storage and catalog migrations in PGlite with test Auth/Storage schemas and real PostgreSQL roles/RLS. They do not establish the state of the hosted Supabase project.
- `npm run test:e2e`: **4 passed** in Chromium. Device-local onboarding, plan generation, set logging after reload, pause/resume, completion, food-serving arithmetic, meal persistence, water, attendance, measurement entry, mobile navigation, real Three.js canvas, WebGL-disabled fallback, and serious/critical axe checks on landing/auth/settings/nutrition/attendance/library.
- After the final dashboard readability batch, the persistent workflow/browser test was rerun and passed. The visual reviewer scored both requested fixes resolved. This review covered supplied landing/dashboard/drawer evidence and the fix list, not every route or full accessibility conformance.
- `npm run typecheck`: passed.
- `npm run build`: passed; generates `dist`, service worker, manifest, standard-size icons and SPA routing. Vite reports bundle-size advisories for the lazy Three.js and application chunks, plus third-party annotation warnings.
- `npm run test:production` against the built app: passed. Production route loading, manifest/icons, saved profile, active service worker and offline reload of the local nutrition page were verified.
- No user activity or nutrient facts are seeded. Browser screenshots contain explicitly synthetic test inputs entered only within isolated test contexts.

## Not verified

Actual Supabase email delivery, registration/recovery, deployed database policies, cloud CRUD, Edge Function execution, and Cloudflare deployment. Supabase HTTP access returned proxy HTTP 403; the domain addition and public frontend variables were saved to the environment draft, which requires user review/save and publication. No database-admin or deployment credential was supplied. The public browser key cannot apply migrations.

No licensed human anatomy mesh or professionally validated exercise animation is supplied. Model/clip playback infrastructure therefore has not been verified against an approved human asset. Those acceptance criteria remain open, along with the advanced features listed in FEATURES.md.

## Supplied-program and championship-theme update

- `npm test`: **44 passed** across four suites. Added source inventory/fidelity fixtures, exact unrounded nutrition math, kg-to-lb conversion, inconsistent printed examples, deterministic imports, source-preserving database validation, atomic/idempotent imports, composite actual logs and cross-user isolation.
- `npm run test:e2e`: **6 passed**. Added all-20-template imports with reload/deduplication checks, source bench and nine-component cable-ladder logs, per-component external-volume calculation, exact source target application, desktop/mobile source screens and automated serious/critical accessibility checks. The source workflow was rerun successfully after recapturing mobile evidence from the document top.
- `npm run build`: passed with self-hosted Barlow Condensed, updated icons, source data, PWA and SPA output. Existing bundle-size advisories remain.
- `npm run test:production`: passed against the updated built app, including active service worker and offline local nutrition route.
- The Impeccable reviewer returned `ship` for the supplied redesigned landing/dashboard/program captures and separately for the source nutrition/logger captures, at visual/readability scope.
- The mechanical design scan initially reported only differences from the old system's documented colors, sizes, fonts and radii. The user explicitly requested replacing that system; DESIGN.md and the token sidecar now document the actual championship palette/type.
- Hosted Supabase is now reachable. A read-only request returned HTTP 404 / PGRST205 for `public.exercises`. The base catalog is not available through the project API. No hosted migration, source import or personal-data write was performed; project-admin migration access is still required. Follow DEPLOYMENT.md and apply pending migrations in order.
- Source transcription inventory is **3 books, 20 templates, 105 exercise blocks, 471 printed sets**. The source audit documents file hashes, original PDF page references, warm-up/compound-set handling and retained ambiguities. Original PDFs and their graphics are not bundled.

## Release-readiness and LMQ branding — 4 November 2026

- `npm test`: **64 passed** across six suites, including PostgreSQL ownership/RLS, source fidelity/imports, nutrition arithmetic, previous-set matching/load-only reuse and timed-plank volume.
- `npm run test:e2e`: **15 passed** in one final Chromium run. Coverage includes all twenty source imports, composite logging, history/reload/pause behavior, custom workout create/edit/reorder/duplicate/delete, escaped user text, device export/deletion, persistent storage fallback, eleven app routes at 1440/390px, serious/critical axe checks, image failure, 3D unavailable and renderer-startup failure. Viewport checks are browser simulations, not certification on every device/browser.
- `npm run build`: passed, including TypeScript, SPA output, new icon assets and PWA generation. Existing third-party annotation and bundle-size advisories remain.
- `npm run test:cloudflare`: passed against the final build. Actual built Pages security-header rules were applied to preview responses, then verified with browser production/offline smoke: direct routes, manifest/icons, persisted profile, service worker, offline nutrition and exercise/brand assets, and no observed CSP violations.
- Shared feline/LMQ branding and the source/custom history, cloud recovery and muscle-directory captures were reviewed independently. The static fallback's misleading drag instruction was fixed, recaptured and scored resolved. The resulting visual/interaction-evidence disposition is `ship`; it does not clear live cloud security or deployment.
- Runtime dependency audit: **zero advisories**. Full audit: **ten affected build packages (eight moderate, two low), zero high/critical**; compatible normal audit fix offered no changes. No matching private keys or privileged tokens were found by the tracked/proposed source pattern scan. The full security assessment is not claimed clean.
- Live Auth settings are reachable; REST still reported `PGRST205` in the read-only checks. Hosted migrations, authenticated cloud saving/isolation, email delivery/recovery, account deletion and deployed Cloudflare responses remain unverified. See [CLOUD-READINESS.md](CLOUD-READINESS.md) and [RELEASE-READINESS.md](RELEASE-READINESS.md). No hosted migrations or Cloudflare/environment publication were performed.
