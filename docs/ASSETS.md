# Asset licenses and approval

The LMQ mark and procedural hero sculpture are original project assets. Manrope Variable and Barlow Condensed fonts are distributed under SIL OFL via @fontsource packages (license included in each package). Lucide icons use ISC. No human anatomy meshes or exercise animations are included. Exercise reference imagery is documented below.

Model catalog records require URL, author, source URL, license, attribution, named region map and `review_status = approved`. Exercise clips additionally require a reviewer and review date. Do not publish an approval without a qualified review. Browser loading accepts HTTPS and same-origin root paths only; no script/data URL assets.

Nutrition: no food macro values are seeded. Users must supply quantities and values from a label or a documented composition source. Local food suggestions are names, not database nutrition claims.

The new championship-inspired theme retains original LMQ artwork with crimson/gold lighting. No official Olympia logos or branding photographs are copied. Supplied PDF program text is transformed into source-linked structured data at the user’s request; original PDFs are not bundled. Selected exercise drawings are now extracted at the user’s explicit request.

## Exercise reference pictures

The user requires actual photographs only. Do not use AI-generated photo references, including for wall push-up and prone W raise. Obtain matching reusable photographs before filling those two remaining gaps.

`public/exercise-images/` and `src/data/exercise-media.json` contain 165 photo positions and 18 optional source drawings. Real-person photographs are the primary references for all 105 imported program blocks and 14 starter-library exercises. PDF drawings are available only through optional source links. Supersets, tri-sets and cable-fly ladders show components separately. Wall push-up and prone W raise remain explicitly marked as written-only because no exact image was found in the supplied PDFs or chosen photo collection.

- Drawings: Jeremy Buendia, user-supplied `Building-a-Legendary-Chest.pdf`, PDF pages 9–13, 16–19 and 21–24. Extracted original embedded drawings, resized/converted to WebP. Manifest records each file page; rights remain with their source holders. These user-provided drawings are not relicensed under the photo dataset license. No endorsement or qualified technique review is claimed.
- Photos: [Free Exercise DB](https://github.com/yuhonas/free-exercise-db), distributed by its maintainers under the [Unlicense](https://github.com/yuhonas/free-exercise-db/blob/main/LICENSE.md). Full source license is bundled as `public/exercise-images/LICENSE-Free-Exercise-DB.txt`. Per-reference source URLs and pinned revision are recorded in the manifest. Converted to WebP without cropping limbs or equipment. Position labels do not imply a start/end order. The first dataset plank image is excluded because it depicts a transition rather than a forearm plank. The formerly drawing-only incline press, mid-height cable fly, cable fly/press and decline push-up references now use photographs. Close-grip references disclose that the photograph uses a shoulder-width neutral grip; mid-height fly references disclose that the photograph uses higher pulleys. The standing cable press now uses standing photos.
- Bulk and Shred PDF “illustration” buttons generally link to videos; these buttons/backgrounds are not represented as exercise photos. Supplemental images are clearly attributed separately.
- Equipment, grip, stance or support differences from the program are shown beside the affected picture. Pictures do not change source sets, tempo, nutrition, prescribed holds or repetitions. Static reference pictures are separate from approved animation assets.

Rebuild assets with `python scripts/import-exercise-images.py /path/to/free-exercise-db /path/to/Building-a-Legendary-Chest.pdf` (Pillow and PyMuPDF required). Runtime is entirely self-hosted; the PWA precaches WebP references for offline use. External source and enlargement links open a new tab. Failed images keep written cues and set logging usable.

## LMQ brand assets

The user supplied the red faceted feline emblem in chat and requested an icon-only treatment with new LMQ lettering. `public/brand/lmq-icon.png` is a transparent image-tool extraction/redraw from that reference; the textured background, original lettering and tagline are excluded. It is used in the shared brand component, static hero fallback, favicon and 192/512-pixel app icons. This is a brand graphic, not an exercise photograph.

`public/brand/lmq-wordmark.svg` outlines the existing Barlow Condensed ExtraBold letters with a forward lean, slightly broader proportions and custom spacing. The font's SIL Open Font License is included in `public/brand/OFL-Barlow.txt`. The full product name remains LÉMAQQUE in accessible navigation and descriptive copy. No premium-performance claim or third-party endorsement is added.
