# Cloud readiness check — 4 November 2026

Read-only checks used the configured browser URL and publishable key for the selected Supabase project. No accounts, messages, migrations, records or deployments were created or changed.

| Endpoint                             | Observation                                                                                                            |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Auth settings                        | HTTP 200; email provider enabled, sign-up enabled, email confirmation required.                                        |
| Public exercises REST query, limit 1 | HTTP 404, `PGRST205`: `public.exercises` unavailable in the schema cache.                                              |
| Profiles REST query, limit 0         | HTTP 404, `PGRST205`: `public.profiles` unavailable in the schema cache; no rows requested.                            |
| Workout sessions REST query, limit 0 | HTTP 404, `PGRST205`: `public.workout_sessions` unavailable in the schema cache; no rows requested.                    |
| REST root/OpenAPI                    | HTTP 401, “Secret API key required.” This introspection restriction does not establish that the browser key is broken. |

Auth reachability does not verify email delivery, sign-in, persistent cloud saving or cross-account isolation. The REST checks used the publishable key without a user session; private-table responses do not establish what an authenticated user can access. The unavailable public catalog and schema errors require project-operator review of migration history and API schema exposure/cache.

The owner should review the intended project's applied migrations against [DEPLOYMENT.md](DEPLOYMENT.md), apply only unapplied migrations, and check API schema/cache configuration without broadening private-table access. Then verify authenticated saving, email confirmation/recovery and two-account isolation using that deployment checklist. The publishable key cannot perform migration/admin work. Never put privileged keys in frontend configuration.

The UI now translates missing-table (`PGRST205`) and missing-function (`PGRST202`) errors into a clear setup message. A profile setup failure offers retry and an explicit switch to the device workspace, retaining existing device records and keeping account data separate. Other permission, validation and network errors retain their own messages. This recovery does not repair the cloud schema or queue cloud writes offline.

The automated cloud-error browser scenario mocks Auth and REST responses with synthetic credentials inside the browser. It verifies fallback, accessibility, responsive layout and preservation of device records; it is not live Auth or RLS validation.
