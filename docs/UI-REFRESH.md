# Daily training interface refresh

Mode: Operate. The existing LÉMAQQUE black, crimson and gold identity, Barlow Condensed headings and Manrope body type remain the visual foundation. This refinement prioritizes the dashboard, saved workout plans and active set logging. It is implemented in the current working draft; publication and GitHub push are separate actions.

## Interface changes

- Shared workspace: quieter navigation selection, route breadcrumbs, sentence-case headings, consistent controls and an expandable “Saved on this device” explanation. Mobile navigation retains its focus trap, Escape dismissal, inert background and focus restoration.
- Dashboard: the next saved or unfinished session leads with its actual movements and set counts. Calendar, nutrition, measurements and schedule remain tied to stored records. Source counts explicitly include warm-ups. Decorative training sculptures, repeated metric panels and motivational boxes are removed from this operational screen.
- Workout plans: search by plan, split or movement; filter by source program or custom plans; preview one plan’s real movement list with existing exercise photos and reference links. Start, edit, duplicate and confirmed deletion remain available. Clearing empty search results restores the saved list. Filtering never edits the templates.
- Active session: optional photo guidance starts collapsed; each source set keeps its original prescription visible. Detailed load guidance and the full source table are expandable. A single-component set avoids repeating the movement title above its fields. Compound sets retain all component labels and targets.
- Mobile logging: a movement selector replaces the large movement-button grid. Finish and discard actions remain accessible; discard still requires its existing confirmation. Previous/next controls preserve completed logs. Larger load fields and a stronger completion action improve use between sets.

## Implementation boundaries

`src/styles/workspace.css` is loaded after the existing stylesheet and scoped to the application workspace. Public landing artwork and its layout retain their existing implementation. Original program data, nutrition equations, repository/storage behavior, user records and exercise-photo sources are unchanged. The two pending home-exercise photos are outside this UI change. No generated instructional imagery is added.

The existing design-system files are retained. The workspace stylesheet and this note describe the route-level refinements; this task does not repair the previously reported design-sidecar drift.

## Verification and visual evidence

Unit tests cover source prescriptions, nutrition arithmetic and permissions. Browser coverage exercises existing tracking workflows plus workout search, source filtering, movement previews, clear-filter recovery, mobile movement selection, discard cancellation, previous/next navigation and completion persistence. Accessibility and overflow checks use desktop, tablet and phone widths.

Actual application captures are in `.impeccable/review/`: overview, workout browser and active-session desktop/mobile views. Captures use isolated device-local browser storage; imported program templates are source content, and any logged set values in test evidence are test inputs. No example activity is seeded into the application. The directory is ignored by Git.

Verified in this draft:

- `npm test`: 49 unit tests passed.
- `npm run build`: production build passed.
- `npm run test:e2e`: all 9 browser scenarios passed; after the two review fixes, all 5 affected browser scenarios passed again.
- `npm run test:production`: production routes, persisted local profile, active service worker, offline nutrition and bundled exercise photos passed.
- Independent visual review scored both requested corrections resolved: session metadata hierarchy and full visible labels in accessible numeric-field names.

Deployment and cloud-environment publication are separate from the GitHub update.
