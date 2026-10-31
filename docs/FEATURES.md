# Feature status

## Implemented MVP capabilities

- Vibrant championship-inspired black/crimson/gold brand system, local Barlow Condensed/Manrope fonts, keyboard controls, reduced motion and mobile navigation.
- All three supplied PDF programs: 20 source-linked templates, 105 exercise blocks, 471 printed sets; idempotent single/phase/all import; exact per-set rows, example pounds and rest ranges.
- Composite actual-set logging for supersets, partial/drop segments and ladders, with timed flexes excluded from volume.
- Exact source shred macro equations, adjusted/re-feed arithmetic, source meal portions, rounded examples and 30-day example table. No fabricated recipe macros or auto-entered example records.
- Email sign-up/sign-in/password recovery UI with Supabase client integration; cloud flows require reachable and configured Auth.
- Device-local workspace explicitly labeled, persisted in IndexedDB, separate from cloud accounts.
- Editable adult profile: goals, height/weight, experience, equipment, preferred days, duration, restrictions, timezone and static-display preference.
- Starter plan and seven-day schedule generation; full-body or push/pull/legs approach based on days and equipment. Restrictions are retained as notes, not medically interpreted.
- Workout template create/edit/reorder/duplicate/delete, per-exercise sets, reps and rest.
- Resumable active sessions, per-set reps/weight/RPE, completion, previous results, pause/resume, rest timer, finish summary and explicit discard confirmation.
- Atomic completed-session/attendance/schedule persistence, locally and through a Supabase RPC.
- Manual check-in, rest/partial/completed statuses, calendar, scheduling and rescheduling; rest/future dates excluded from attendance denominator.
- Food diary with source-required manual values and serving arithmetic, copy-to-today, deletion, editable targets and water logging.
- Measurement entry, actual-data weight trend/table, completed-session count and total training volume.
- Explainable rule-based coaching with suggestions that do not silently edit plans.
- Exercise written cues and searchable muscle directory for eleven groups. Picture gallery for all 105 imported movement blocks and 14 starter exercises, separate superset/tri-set references, original chest PDF drawings, attributed supplemental photos, enlargement, offline caching and image-failure fallback. Two home-only exercises (wall push-up and prone W raise) remain labeled written-only; pictured variation differences are explicit.
- Three.js hero, reviewed asset/animation viewer infrastructure, static alternative.
- User data export/local deletion; server account-deletion implementation.
- Schema, RLS, catalog seed, storage policies, PWA build and Cloudflare SPA routing.

## External validation required

- Actual Supabase migrations, email delivery/recovery, persistent cloud flows, production RLS and Storage behavior, deployed account deletion.
- A licensed anatomically accurate GLB with left/right region mappings; no final anatomy mesh currently exists in the product.
- Professionally validated animation clips for the twelve requested exercises; no motion has been approved or shipped.
- A reliable regional food composition dataset. Names of Malaysian foods are available for custom entry, but nutrient values are not fabricated.
- Production privacy/legal operator information and deployment configuration.

## Not implemented in this MVP

- Google OAuth button/provider integration.
- Advanced onboarding preferences (favorite muscle groups, style, detailed measurement formulas), automated interpretation of restrictions, or all split-specific program generators.
- Initial load prescriptions, exercise replacement inside an active session, personal-record detection, recovery feedback and achievement automation.
- Recipe/meal-template CRUD and meal editing, macro estimates or advanced nutrition trend charts.
- Weekly attendance view, historical streak algorithms and monthly narrative summaries.
- Strength progression charts, measurement charts beyond weight, progress-photo upload/comparison UI or body-fat estimates.
- Full validated anatomy/animation experience, hover tooltips, left/right node selection, rep counter or authored skeletal assets.
- Independent professional validation or endorsement of the uploaded athlete programs. Supplied sources are transcribed and attributed; they are not claimed as an official affiliation or individualized prescription.
- Protected admin interface and editorial approval workflow; catalog writes are reserved for server-controlled admin app_metadata roles.
- AI integration, subscriptions/billing, cloud offline-write synchronization, local-to-cloud import, production analytics/monitoring.

Never treat a migration, UI integration or loading infrastructure as evidence that an external service or asset has been deployed and validated.
