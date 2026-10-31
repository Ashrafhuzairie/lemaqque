---
name: "LÉMAQQUE"
description: "A vibrant championship-inspired system for daily training, nutrition, and progress."
colors:
  matte-black: "#0b0d12"
  competition-crimson: "#ff4d57"
  crimson-hover: "#ff737a"
  spotlight-gold: "#ffcf5c"
  cobalt: "#76a6ff"
  off-white: "#f6f7fb"
  surface: "#161922"
  panel: "#20232e"
  steel-muted: "#b8becf"
  steel-border: "#353b4b"
  rail-background: "#11141d"
  field-background: "#15161b"
  field-border: "#404452"
  action-ink: "#18090d"
  outline-border: "#4d5163"
  outline-text: "#dfe1e9"
  outline-hover: "#2b2d37"
  ghost-text: "#c6c9d6"
  ghost-hover: "#2a2c35"
  danger-background: "#a8283b"
  danger-text: "#fff0f1"
  tag-background: "#3e202b"
  tag-text: "#ffbac1"
  source-surface: "#191c26"
  movement-surface: "#171a24"
  set-surface: "#1e2230"
  program-crimson: "#371725"
  program-gold: "#342919"
  program-cobalt: "#192a43"
typography:
  display:
    fontFamily: "\"Barlow Condensed\", sans-serif"
    fontSize: "clamp(64px, 7.7vw, 108px)"
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: "0"
  headline:
    fontFamily: "\"Barlow Condensed\", sans-serif"
    fontSize: "clamp(2.4rem, 4.3vw, 3.7rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "0.005em"
  head-section:
    fontFamily: "\"Barlow Condensed\", sans-serif"
    fontSize: "1.9rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0.005em"
  title:
    fontFamily: "\"Barlow Condensed\", sans-serif"
    fontSize: "1.35rem"
    fontWeight: 700
    letterSpacing: "0.005em"
  body:
    fontFamily: "\"Manrope Variable\", sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.8
  label:
    fontFamily: "\"Manrope Variable\", sans-serif"
    fontSize: "12px"
    fontWeight: 800
    letterSpacing: "0.015em"
rounded:
  warmup: "4px"
  tag: "5px"
  control: "8px"
  notice: "10px"
  inset: "12px"
  source-card: "14px"
  panel: "16px"
spacing:
  xs: "6px"
  sm: "8px"
  control-gap: "12px"
  mobile-gutter: "20px"
  grid-gap: "22px"
  panel-inset: "28px"
  section-gap: "42px"
components:
  button-primary:
    backgroundColor: "{colors.competition-crimson}"
    textColor: "{colors.action-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "13px 20px"
  button-primary-hover:
    backgroundColor: "{colors.crimson-hover}"
    textColor: "{colors.action-ink}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.outline-text}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "13px 20px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ghost-text}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "13px 20px"
  button-danger:
    backgroundColor: "{colors.danger-background}"
    textColor: "{colors.danger-text}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "13px 20px"
  field:
    backgroundColor: "{colors.field-background}"
    textColor: "{colors.off-white}"
    rounded: "{rounded.control}"
    padding: "11px 13px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.panel}"
    padding: "{spacing.panel-inset}"
  tag:
    backgroundColor: "{colors.tag-background}"
    textColor: "{colors.tag-text}"
    rounded: "{rounded.tag}"
    padding: "6px 9px"
  navigation-active:
    backgroundColor: "{colors.competition-crimson}"
    textColor: "{colors.action-ink}"
    rounded: "{rounded.control}"
    padding: "13px 12px"
  program-choice:
    backgroundColor: "{colors.source-surface}"
    textColor: "{colors.off-white}"
    rounded: "{rounded.source-card}"
    padding: "24px"
  source-set:
    backgroundColor: "{colors.set-surface}"
    rounded: "{rounded.notice}"
    padding: "19px 16px"
---

# Design System: LÉMAQQUE

## Overview

**Creative North Star: "The Championship Training Floor"**

LÉMAQQUE brings the energy of a bodybuilding competition stage into a practical daily training companion. Matte black, competition crimson, spotlight gold, cool steel, and off-white establish a vibrant, assertive athletic identity. Condensed uppercase headlines deliver the competition character; readable forms and source-linked records keep that energy useful.

The user-requested Mr Olympia-inspired direction replaces the earlier sage, lime, champagne, and Space Grotesk system. LÉMAQQUE and the LMQ monogram remain the identity. This is an original visual interpretation: no official Olympia or athlete logos, photography, or endorsement claims.

Expression scales with the task. Public storytelling uses large type and an original metallic abstract sculpture. Daily tracking uses a stable rail, clear controls, flat layered surfaces, and honest data states. Full tracking remains usable without WebGL.

**Key Characteristics:**

- Matte black with vivid crimson actions and gold emphasis.
- Heavy condensed display type paired with readable Manrope.
- Flat cool surfaces, thin steel separators, and rounded controls.
- Crimson, gold, and cobalt distinguish source-program families.
- Source-linked prescriptions, real records, and explicit empty states.

Evidence: `src/styles.css` (including the final championship overrides), bundled font imports in `src/main.tsx`, shared UI and source-program components, and desktop/mobile captures in `.impeccable/review/`. The YAML frontmatter is the normative token layer. Sidecar tonal ramps are synthesized previews, not an implemented theme scale.

## Colors

A cool black foundation gives vivid competition accents room to stand out. The frontmatter owns exact values; these names explain their use.

### Primary

- **Competition crimson:** primary buttons, active navigation, selected workouts, progress, and focus rings. **Action ink** supplies dark text inside filled actions; **crimson hover** provides the brighter response.

### Secondary

- **Spotlight gold:** emphasized hero words, editorial accents, source and rest references, set numbers, and calculated macro values. It also distinguishes the chest-program family.

### Tertiary

- **Cobalt:** the shred-program family and the third macro series. Supporting steel colors keep this accent coherent with the cool neutral system.
- **Program crimson / gold / cobalt:** deep family-colored banner layers. Selection also uses borders and pressed state, rather than relying on fill alone.

### Neutral

- **Matte black:** the page canvas and negative space. **Off-white:** principal content and display type.
- **Surface / panel:** shared cool black container layers. **Rail background:** the fixed navigation and mobile header. **Steel muted / steel border:** supporting text and separators.
- **Field background / border:** darker, visibly outlined controls. **Outline / ghost colors:** subordinate interaction treatments.
- **Source / movement / set surfaces:** distinguish program choices, movement blocks, and expandable logging sets without general card shadows.
- **Tag colors:** muted crimson metadata. **Danger colors:** destructive controls; textual context distinguishes them from ordinary crimson actions.

**The Action and Spotlight Rule.** Use crimson for primary action, selection, progress, and keyboard focus. Use gold for editorial emphasis, source/rest cues, and selected section text. Keep both legible against their actual background.

## Typography

**Display Font:** Barlow Condensed, with sans-serif fallback.

**Body Font:** Manrope Variable, with sans-serif fallback.

Both are self-hosted through Fontsource imports. Barlow Condensed is bundled at (700) and (800); Manrope is variable. The pairing is forceful in headlines and quiet in instructions. The hierarchy is role-based rather than a mathematical scale.

- **Display:** the frontmatter role describes the landing headline: heavy (800), uppercase, tightly stacked (0.98). Mobile uses `clamp(64px, 16vw, 92px)` at the same line height. The final championship overrides take precedence over earlier tablet headline declarations.
- **Headline:** general page headings use the frontmatter fluid scale. Dashboard headings use `clamp(33px, 3.4vw, 46px)`; mobile dashboard headings are (38px), while page headings are (39px) with line height (1.05).
- **Section / title:** shared secondary and tertiary headings use the frontmatter roles. Program banners use `clamp(40px, 4.5vw, 68px)` at (0.98), stepping to (51px) below the program tablet breakpoint. Movement headings use (25px) at (1.1).
- **Body:** general prose uses the body role and a maximum measure (72ch). Source-prescription rows use (12px) with line height (1.8), increasing to (1.9) on mobile. Keep long prescriptions wrapping naturally.
- **Label:** shared buttons use the label role. Field labels use (12px), weight (500), with a mobile variant (11px). Tags use (10px) and tracking (0.06em).
- **Data:** numeric inputs use tabular figures. Source macro values use Barlow Condensed at (32px), weight (700), and line height (1.1), increasing to (35px) on mobile. Mobile dashboard metrics use (40px), weight (700).

Small decorative captions are not a template for essential instructions or values. Uppercase is the default for main and section headings; the base tertiary heading does not impose uppercase globally.

**The Two Voices Rule.** Use Barlow Condensed for headings and prominent values, and Manrope for controls, records, and explanations. Keep essential prescriptions readable at their implemented body sizes.

## Layout

The desktop workspace has a fixed rail (246px), topbar (75px), horizontal content padding (43px), and maximum content width (1600px). At (1200px), the rail narrows (215px), gutters reduce (27px), and shared panel padding reduces (24px). Dashboard paired groups stack at (900px). At (700px), metrics become one column with horizontal separators.

At (700px), the rail becomes an off-canvas drawer (265px), a sticky mobile brand/menu header appears, and main content uses the mobile gutter. Keep the existing focus trap, Escape close, focus restoration, and inert background behavior when extending it. Shared panels use mobile padding (23px 20px).

Source-program choices form three columns with gaps (15px), then stack at (800px). The workout workspace pairs a navigation column (225px) with fluid detail and a gap (23px); the column narrows (190px) at (1100px), then moves above the detail as a two-column button grid at (800px). Tabs can scroll horizontally. At (700px), phase selection occupies a full row, the add-phase action spans the width, and load/repetition inputs become two equal columns below each component description. The macro summary moves from four columns to two; calculator inputs stay in two columns. Preserve wrapped prescriptions and bounded horizontal table scrolling where needed.

The public landing uses percentage gutters (6%), a broad typography/artwork split, and large section spacing. Mobile uses a single column with padding (55px 22px 80px), copy before artwork, and a scene height (340px). At (1650px and above), the hero has maximum width (1700px), minimum height (850px), and scene height (650px). Keep this expressive composition scoped to storytelling.

**The Stable Workspace Rule.** Keep desktop navigation fixed and mobile navigation in the shared drawer so daily task locations stay predictable.

## Elevation & Depth

Daily surfaces are flat at rest, separated by cool tonal layers, thin strokes, spacing, and deeper insets. The primary action carries a restrained crimson shadow (`0 6px 22px #ff4d571a`). The drawer uses a dark scrim (`#0009`) to establish its modal layer.

Dimensional shading belongs to the original metallic landing sculpture and the dashboard's crimson loop illustration. The latter has localized inset/drop shadows (`inset 9px 12px 18px #280c16, 7px 12px 20px #200b13`). These are artwork treatments, not general card elevation. Hero art has a localized crimson radial spotlight rather than a glowing border around every panel.

**The Flat Surface Rule.** Keep ordinary cards shadow-free. Reserve the small crimson lift for the primary action and dimensional shading for artwork.

## Shapes

Panels have generous rounded corners; controls are tighter and metadata tags tighter still. Source-program and movement cards use the intermediate source-card radius. Expandable set rows and notices share a compact middle radius, while nested information uses the inset scale. Borders are thin and cool; primary action emphasis comes from fill. Circular marks serve avatars, status, and empty-state affordances.

Looped metallic geometry is the recurring expressive motif. It remains optional artwork rather than a decoration required on every screen.

## Components

### Buttons

Compact, decisive controls. Primary buttons use competition crimson with action ink, outline buttons use steel strokes, ghost buttons remain transparent until hover, and destructive buttons use the danger pair. Shared controls have minimum height (44px), gap (12px), and the frontmatter padding. Small controls use minimum height (36px) and padding (8px 12px); icon controls retain minimum width (44px).

Hover shifts a button upward (1px), with background/transform transitions (0.2s). Primary hover uses crimson hover; outline and ghost use their dedicated dark fills. Focus uses a crimson outline (2px), offset (4px). Disabled controls use opacity (0.45) and a not-allowed cursor. Reduced motion shortens CSS animations and transitions to (0.01ms).

### Chips

Metadata tags use muted crimson fill/text, compact corners, and the documented padding. They are informational unless implemented as buttons. Program choices and muscle filters are separate interactive patterns with explicit pressed states.

### Cards / Containers

Shared cards use surface fill, panel corners, and the frontmatter inset. Source movements use movement-surface fill and padding (24px); at mobile, padding becomes (22px 15px). Record lists and prescription tables use separators rather than wrapping every row in a card. Preserve space between heading, source reference, and printed set prescription.

### Inputs / Fields

Dark fields use a visible steel stroke (1px), off-white content, compact corners, text (13px), and minimum height (44px). Labels sit above with gap (8px). Focus uses a crimson outline (2px), offset (1px). Textareas resize vertically; number inputs use tabular figures. Component load inputs have a compact desktop minimum height (40px), with responsive grouping below each source component on mobile.

Ordinary notices use cool gray fill; errors use a deep crimson notice treatment and textual alert content. Do not communicate errors only with color.

### Navigation

Rail links use icon/label rows, minimum height (45px), text (12px), and compact corners. Muted resting links gain a quiet dark hover surface. Current links gain crimson fill, action ink, heavier weight, and a trailing chevron. Preserve the mobile drawer's keyboard behavior. Program section tabs use a crimson underline with gold selected text and remain horizontally scrollable.

### Source Programs and Set Logger

Source choices have an outlined dark resting state, condensed titles, and crimson/gold/cobalt icons. Pressed choices gain the corresponding deep family fill and accent border. Hover uses a shared dark response. The banner repeats the selected family and separates the source-block count from user performance data.

Movement blocks pair a numbered badge, condensed movement title, source reference, rest cue, and the original printed set table. Warm-up badges remain explicit. Expandable logging sets use the set surface, gold set headings, and visible component-level load/repetition fields. Completed sets gain a warmer fill and gold state icon; keep the textual state and source prescription visible. These are source/library and user-input records, not invented activity.

### Empty States and Performance Artwork

Empty states use a small circular plus mark, concise explanation, and next useful action when available. Loading, errors, local storage, and unavailable assets remain explicit. The original WebGL sculpture supports optional exploration, limits device pixel ratio, and pauses continuous rendering off-screen or under reduced motion; its static LMQ fallback keeps the landing usable. Neither it nor unavailable anatomy/motion assets can stand in for validated exercise technique.

## Do's and Don'ts

### Do:

- **Do** use the matte-black, competition-crimson, spotlight-gold, cobalt, and off-white system with the retained LÉMAQQUE identity.
- **Do** use Barlow Condensed at the bundled heading weights and Manrope for functional reading.
- **Do** preserve visible crimson focus, readable source tables, and usable mobile logging controls.
- **Do** use real records, traceable prescriptions, explicit calculator inputs, and useful empty states.
- **Do** respect reduced motion and preserve full tracking without WebGL.

### Don't:

- **Don't** restore the retired sage/lime palette or Space Grotesk heading system.
- **Don't** use official Olympia or athlete logos, photos, or implied endorsements.
- **Don't** fill the interface with invented performance statistics, transformation claims, or nutrition values.
- **Don't** turn a decorative sculpture or unavailable/unvalidated motion asset into exercise instruction.
- **Don't** apply hero-scale typography or artwork to every tracking panel.


### Exercise Reference Pictures

Exercise pictures are functional reference content on library details, source program blocks and active sessions. Show paired positions without cropping limbs or equipment; preserve a single original PDF drawing when available for the exact source movement. Supersets, tri-sets and ladder heights have separate named references. The gallery uses native disclosure, body typography, subdued source credits and an enlargement link for each picture. Equipment/grip/support differences appear in gold beside the affected picture. Use a readable missing-image message while preserving written cues and logging. Library rows use contained thumbnails. Builder references start collapsed; active and detail galleries start open. Keep images self-hosted and precached for offline access. Pictures remain separate from reviewed 3D demonstrations.
