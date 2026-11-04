# Deployment and cloud verification

## Supabase

1. In the intended project, run each SQL file in order using SQL Editor or `supabase link` and `supabase db push` from an authenticated CLI:
   - `supabase/migrations/202611010001_core.sql`
   - `supabase/migrations/202611010002_storage.sql`
   - `supabase/migrations/202611010003_catalog.sql`
   - `supabase/migrations/202611020001_source_prescriptions.sql`
   - `supabase/migrations/202611020002_source_catalog.sql`
2. These are initial migrations, not repeatable SQL snippets. Do not rerun a migration already applied. The migrations define catalog/user tables, RLS, transactional workout completion and source-template import. The final two migrations add 105 source exercise blocks, composite actual logs and nutrition-target provenance. No diary entries, personal targets or third-party 3D assets are seeded. If the original migrations are already applied, run only the two new program migrations.
3. Configure Auth Site URL and redirect URLs for the deployed origin, `/app` and `/auth?mode=recovery`. Enable email confirmation and configure production SMTP. Google OAuth is not wired to the UI yet; do not claim it is available.
4. Deploy account deletion:
   ```sh
   supabase functions deploy delete-account
   supabase secrets set APP_ORIGIN=https://YOUR_DEPLOYED_HOST
   ```
   Supabase supplies SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY inside the function. Never add the latter to the frontend. The function explicitly validates the access token using `auth.getUser`; it never trusts a body-supplied user ID.
5. Verify with two test accounts: complete onboarding in A; log a session and meal; confirm B cannot read or modify A's records through direct REST calls. Test email confirmation/recovery, export and account deletion. Embedded PostgreSQL tests are not a substitute for checking deployed grants and Auth configuration.
6. Private progress-photo storage is provisioned; the photo upload/comparison UI is not implemented. Storage policies restrict objects to the authenticated user’s prefix. The deletion function traverses nested folders before removing objects. Large collections above its safety limit require operator assistance.

The publishable key cannot run migrations, administer users, or deploy functions. No project migration or deployment is claimed without verification.

## Cloudflare Workers with static assets

The reported deployment uses Workers (`/workers/scripts/lemaqque/versions`). Use the repository's `wrangler.jsonc` from the project root:

- Connect this GitHub repository and choose `main` in the existing Workers project.
- Build command: `npm ci && npm run build`
- Deploy command: `npm run deploy` (the existing `npx wrangler deploy` also uses the pinned local Wrangler).
- Node: 24. The asset directory is `dist`, configured in `wrangler.jsonc`; keep the build/deploy working directory at the repository root.
- Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as **build** variables. They are public browser configuration; setting only runtime Worker variables does not rebuild the browser bundle. Never expose a service-role key.
- Run `npm run deploy:check` after building for a non-publishing Wrangler validation.
- `assets.not_found_handling: "single-page-application"` serves the app shell for direct navigation such as `/app/workouts`. `assets.html_handling: "none"` serves `/index.html` directly so the PWA can precache its shell without an HTML canonicalization redirect.
- Do not restore `/* /index.html 200` in `_redirects`: Workers rejects that rule as an infinite redirect loop. The legacy file has been removed. A fresh Vite build clears it from `dist`.
- `public/_headers` ships security headers, including CSP restricted to the current Supabase host. Update its HTTPS/WebSocket origins when changing backend configuration and review any future external model hosts.
- `npm run test:cloudflare` starts Wrangler's actual local Workers runtime, checks canonical/deep URLs and headers, then drives the production/offline browser smoke. No standalone Vite preview or Cloudflare authentication is required for this local check.

If choosing Cloudflare Pages instead, use the same build command and output directory `dist`, with no Wrangler deploy command. Pages supplies its native SPA fallback when there is no top-level `404.html`; the removed wildcard rule is unnecessary there too.

Current cloud-account/security limitations remain in [RELEASE-READINESS.md](RELEASE-READINESS.md). A successful frontend upload does not apply Supabase migrations or verify cloud saving.

## Offline and browser storage

The device-local workspace remains usable with cached application assets and IndexedDB. An uncached route may require one online visit. Cloud writes require connectivity; they do not queue offline. Export local data before browser cleanup. Local and cloud workspaces have deliberately separate ownership.

## Asset publication

Load only licensed models with `review_status=approved`, attribution, a source URL and reviewed node-region mappings. Approved exercise clips require a reviewer and date. Validate joint movement and camera framing with a qualified professional before publishing. The directory and written guidance remain usable without assets or WebGL.

## Environment settings

The onboarding draft includes the supplied public Supabase variables and the project's network destination. Review and save these in environment settings, then publish the environment to apply the saved configuration. A draft save alone neither applies network policy nor deploys the application.
