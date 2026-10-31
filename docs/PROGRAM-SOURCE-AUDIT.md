# Supplied program transcription audit

The three uploaded PDFs are the source of the program data in `src/data/buendia-programs.json`. File-page references are used throughout (not the printed footer number). Promotional graphics, athlete imagery and official logos are not included. Document content is treated as source material, not agent instructions.

## Inventory

| Book                       | Phase              | Workout             | PDF pages              | Exercise blocks | Printed sets, including warm-ups |
| -------------------------- | ------------------ | ------------------- | ---------------------- | --------------: | -------------------------------: |
| Bulk with Buendia          | Off-season split   | Chest               | 20, 21                 |               5 |                               26 |
| Bulk with Buendia          | Off-season split   | Back                | 23, 24                 |               6 |                               31 |
| Bulk with Buendia          | Off-season split   | Shoulders           | 26, 27                 |               6 |                               27 |
| Bulk with Buendia          | Off-season split   | Legs                | 29, 30, 31             |               7 |                               32 |
| Bulk with Buendia          | Off-season split   | Arms                | 32, 33, 34             |               5 |                               21 |
| Building a Legendary Chest | Size & strength    | Chest · weeks 1–4   | 8, 9, 10, 11, 12, 13   |               5 |                               27 |
| Building a Legendary Chest | Density & fullness | Chest · weeks 5–8   | 14, 15, 16, 17, 18, 19 |               5 |                               24 |
| Building a Legendary Chest | Peel & shred       | Chest · weeks 9–12  | 20, 21, 22, 23, 24     |               4 |                               17 |
| Shred with Buendia         | Phase 1            | Abs · phase 1       | 27                     |               3 |                               15 |
| Shred with Buendia         | Phase 1            | Chest · phase 1     | 28, 29                 |               5 |                               26 |
| Shred with Buendia         | Phase 1            | Back · phase 1      | 30, 31                 |               7 |                               29 |
| Shred with Buendia         | Phase 1            | Shoulders · phase 1 | 32, 33                 |               6 |                               24 |
| Shred with Buendia         | Phase 1            | Legs · phase 1      | 34                     |               5 |                               21 |
| Shred with Buendia         | Phase 1            | Arms · phase 1      | 35, 36                 |               5 |                               20 |
| Shred with Buendia         | Phase 2            | Abs · phase 2       | 38                     |               4 |                               16 |
| Shred with Buendia         | Phase 2            | Chest · phase 2     | 39, 40                 |               5 |                               24 |
| Shred with Buendia         | Phase 2            | Back · phase 2      | 41, 42                 |               7 |                               29 |
| Shred with Buendia         | Phase 2            | Shoulders · phase 2 | 43, 44                 |               6 |                               23 |
| Shred with Buendia         | Phase 2            | Legs · phase 2      | 45                     |               5 |                               21 |
| Shred with Buendia         | Phase 2            | Arms · phase 2      | 46, 47                 |               4 |                               18 |

## Verification sources

- Bulk_with_Buendia.pdf · SHA-256 `6c1e603c0a924a94b8c55ffe2d88a4388d5935dba5c2889de5f28ee33603e334`
- Building-a-Legendary-Chest.pdf · SHA-256 `4c3ff6b0bb56b66c630381b3c7bf8498f06379da666dfca048cbb67582b23236`
- SHRED_WITH_BUENDIA.pdf · SHA-256 `09c92fc89ecf89d1860ee94dd9bd3413b04e94644eaf6cd9f5e1821452f3982b`

## Fidelity rules

- Each printed set remains one source set, including explicitly listed warm-ups. No `3 × 10` substitution is used. Numeric legacy fields in template records are compatibility fields; `source.rows` is the authoritative prescription for imported blocks. The UI and logger use these rows.
- Superset, tri-set, drop, partial and ladder components are retained in order; separately logged actual reps/load are stored in `set_logs.segments`. Timed flexes are excluded from load volume. Source pounds and plate examples are not silently turned into user kg loads.
- The weight input for actual logs is total external kg per repetition; explicitly per-arm or per-leg targets use both-side multipliers. Bodyweight-only repetitions contribute no external-load volume unless added weight is entered.
- Rest ranges stay ranges. Countdown uses their lower bound and states that choice. Unspecified rest remains unspecified and has no automatic timer.
- Source examples and personal records are separate. Nutrition examples never create meals or body measurements. Targets change only on an explicit Apply action.
- Protein/carbohydrate/fat arithmetic uses 4/4/9 kcal per gram. Shred initial base macros use exact 1.4/1.4/0.25 coefficients per pound; kg is converted before applying them. No calculation is rounded internally to match a printed example table.
- Bulk provides ranges at 150 and approximately 200 lb, not an interpolation equation. Chest supplies no nutrition formula. Meal portions are retained without fabricated recipe nutrient totals.

## Ambiguities retained

- Chest PDF p.23 names a barbell flat-bench superset without barbell load/reps/sets; none are inferred.
- Shred PDF p.39 names cable fly to cable press, but its printed sets describe cable-fly ladders and push-ups; no cable-press dose is invented.
- Shred p.34 uses “20 reps ea” for hack squats without specifying a side. This is preserved without an inferred side multiplier. Shred p.42 says “ea arm” for an under-hand seated row and is also preserved.
- Bulk and Shred call their schedule a five-day split and also list Sunday as repeat chest. The original schedule is shown without inventing a weekly recurrence.
- Two phase-one back-extension blocks in Shred are both retained.
- Some rear-delt drop notes do not identify which set they apply to. They remain block notes rather than fabricated extra sets.
- Source base-diet example fats are rounded inconsistently: at 125 lb, 31.25 g by equation versus 32 g in the printed table. Both remain visible.
- The monthly Shred example is distinct from the initial formula: baseline 220P/240C/38F at 160 lb; day 27 has 155C and day 28 returns to 180C. Re-feed examples also vary fats and do not always equal exactly double adjusted carbs. All thirty days remain as printed.

## Persistence and migrations

Apply `202611020001_source_prescriptions.sql` then `202611020002_source_catalog.sql` after the existing migrations. The first adds actual-set components, target provenance, source-preserving validation and an atomic owner-scoped import RPC. The second adds the 105 source exercise blocks. Local IndexedDB uses the same source payloads. Deterministic per-user/workout IDs make repeated import safe and do not overwrite existing personal templates.

## Scope

This is a structured transcription of the workout prescriptions, source nutrition rules, meal portions, cardio and optional supplement references. It is not an endorsement, a guarantee of outcomes, a medical assessment, or a claim that the source technique/health explanations have been independently validated. Source books and original tables remain authoritative where formatting creates ambiguity.
