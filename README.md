# LÉMAQQUE

Train. Fuel. Evolve. A mobile-first React fitness workspace with persistent workout, nutrition, attendance and measurement tracking.

## Run

Node 22.12+ (tested on Node 24). From the existing checkout:

```sh
npm ci
cp .env.example .env # only if .env does not already exist
# Fill VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY with your project's public values.
npm run dev
```

The supplied public Supabase connection is configured locally in ignored `.env`. No service-role credential belongs in a `VITE_` variable. Open `/auth` and choose **Open device-local workspace** to use IndexedDB without relying on cloud availability. It is a real persistent workspace, not seeded demo activity. Local and cloud records remain separate; signing into an account does not upload local data. Export a backup before clearing browser data.

## Supplied program library

Open **Training programs** to browse the three supplied PDFs: Bulk with Buendia, Building a Legendary Chest, and Shred with Buendia. The library contains **20 templates, 105 exercise blocks and 471 printed sets**, including warm-ups. Choose **Add all 20 templates**, a phase, or a single workout to copy the exact source prescriptions to My workouts. Repeating an import creates no duplicate and does not overwrite personal templates or history.

Imported blocks keep per-set prescriptions, original example pounds, rest ranges, warm-ups, supersets, partials and drops. Actual kg loads are logged separately by movement component. Unspecified instructions are identified rather than filled with generic defaults.

Nutrition → **Program calculations** contains the exact shred base equation, adjusted/re-feed arithmetic, source meal portions, and the book's separate rounded/monthly examples. No example weight or meal is inserted into your diary. Apply a selected calculation explicitly; hydration is separately chosen by you. Bulk macro ranges and chest guidance are retained without invented equations.

See [source audit and ambiguities](docs/PROGRAM-SOURCE-AUDIT.md). To use these additions in cloud mode, apply the **two new program migrations** after the original migrations; IndexedDB mode works immediately.

## Supabase setup

See [release readiness and outstanding findings](docs/RELEASE-READINESS.md) and [deployment instructions](docs/DEPLOYMENT.md). Apply all migrations in order; the public browser key cannot apply migrations. Until then, cloud forms may report missing-table errors and cloud readiness is not established.

## Commands

```sh
npm test           # fitness calculations and real PostgreSQL RLS tests via PGlite
npm run typecheck
npm run build      # dist/ and PWA service worker
npm run preview
npm run test:e2e   # start dev server separately first; Chromium required
npm run test:production # run preview on port 4173 first; checks PWA/offline behavior
npm run test:cloudflare # checks the built Pages header rules with the same browser smoke
npm audit --omit=dev    # runtime dependency advisories
npm audit              # includes unresolved build-tool advisories
```

Browser tests use `/usr/bin/chromium` by default. Set `CHROMIUM_PATH` to an installed Chromium, or adapt the Playwright configuration to your CI browser. Tests deliberately use synthetic nutrition values; none are included as production food facts.

## Implementation

- React 19, TypeScript, Vite, Tailwind 4, shadcn-style Button using Radix Slot/CVA, React Router, TanStack Query, React Hook Form/Zod, Lucide and Recharts.
- Supabase Auth and owner-scoped CRUD repository, database migrations, transactional completion RPC, private photo storage policies and account-deletion Edge Function.
- Device-local IndexedDB persistence with serialized writes. Cloud errors never silently fall back to local storage.
- Original lazy Three.js/R3F/drei hero with GSAP scroll control, reduced-motion handling, capped DPR and static fallback.
- Reviewed GLB/animation-loading infrastructure. No unvalidated human meshes or motion clips are represented as educational anatomy.

[Architecture, routes, ERD, 3D strategy and milestones](docs/ARCHITECTURE.md) · [Asset licensing](docs/ASSETS.md) · [Feature status](docs/FEATURES.md) · [Validation evidence](docs/VALIDATION.md)

## Important boundaries

This is the functional MVP implementation, not a claim that all 20 sections of the master brief have been completed or deployed. Cloud authorization still needs verification against the actual migrated project. Human anatomy and movement assets need licensing and qualified review. No verified food database, Google OAuth, AI provider, subscriptions, or production admin workflow is configured. See the feature checklist for the exact scope.
