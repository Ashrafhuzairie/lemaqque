# Validation evidence

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
