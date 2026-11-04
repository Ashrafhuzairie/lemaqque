# Public features and member workspace

The public site describes LMQ's capabilities at `/features`: workout planning and set logging, exercise guidance, food/water tracking, attendance, measurements and backups. It does not render the source books' detailed prescriptions or calculations. The landing links to this overview.

Every `/app` route now requires a restored Supabase account session. `/programs` redirects to `/app/programs`, preserving the selected program and hash. Anonymous visitors are sent to sign-in and returned to the requested internal workspace URL afterward. External and non-workspace return destinations are rejected. A legacy `lmq:mode=local` flag is not an account session and cannot open the workspace by itself.

The public account-free entry and explanatory block were removed. Member device storage remains an explicit recovery option after sign-in when cloud storage is unavailable. Existing IndexedDB records are retained, not uploaded or deleted by this change. The device-storage note can switch a signed-in member back to their cloud workspace. Backend owner policies and source program/nutrition data are unchanged.

These are account-gated screens. Source reference assets remain bundled for offline use; route gating is not encrypted content delivery. Cloud record authorization still depends on deployed Supabase policies.

The landing's abstract sculpture was replaced with a procedural dumbbell using stacked plates, steel edges, crimson collars, grip grooves and the existing feline emblem. Drag interaction, reduced motion, off-screen rendering suspension and the static emblem/error fallback are preserved. It is decorative gym branding, not an exercise demonstration.

Browser tests use a test-only member fixture with all Auth/REST requests intercepted. Synthetic credentials are not sent to Supabase and are absent from the production bundle. A separate mocked sign-in scenario drives the real form and confirms the selected-program return URL and sign-out behavior. These tests do not establish live email delivery, cloud table readiness or deployed account isolation.
