---
name: LÉMAQQUE
description: A dark luxury athletic system for daily training, nutrition, and progress.
colors:
  obsidian: "#141a18"
  charcoal: "#242d29"
  active-lime: "#a6e083"
  champagne: "#c5ad7a"
  ivory: "#f3ede1"
  surface: "#1b231f"
  panel: "#202923"
  sage-muted: "#b1bdb4"
  sage-border: "#344138"
  field-background: "#141c17"
  field-border: "#425045"
  action-ink: "#172416"
  lime-hover: "#b8ed9a"
  outline-border: "#52614f"
  outline-text: "#e4ebdd"
  outline-hover: "#2b382a"
  ghost-text: "#c9d4c8"
  ghost-hover: "#2a352b"
  danger-background: "#713b33"
  danger-text: "#fff0e8"
  tag-background: "#29392a"
  tag-text: "#c6d8be"
typography:
  display:
    fontFamily: '"Space Grotesk Variable", sans-serif'
    fontSize: "clamp(50px, 6.6vw, 96px)"
    fontWeight: 400
    lineHeight: 1.04
    letterSpacing: "-0.04em"
  headline:
    fontFamily: '"Space Grotesk Variable", sans-serif'
    fontSize: "clamp(1.9rem, 3.1vw, 2.65rem)"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-0.035em"
  title:
    fontFamily: '"Space Grotesk Variable", sans-serif'
    fontSize: "1.4rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "-0.035em"
  body:
    fontFamily: '"Manrope Variable", sans-serif'
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.8
  label:
    fontFamily: '"Manrope Variable", sans-serif'
    fontSize: "12px"
    fontWeight: 700
    letterSpacing: "0.015em"
rounded:
  tag: "5px"
  control: "8px"
  notice: "10px"
  inset: "12px"
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
    backgroundColor: "{colors.active-lime}"
    textColor: "{colors.action-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "13px 20px"
  button-primary-hover:
    backgroundColor: "{colors.lime-hover}"
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
    textColor: "{colors.ivory}"
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
    backgroundColor: "{colors.active-lime}"
    textColor: "{colors.action-ink}"
    rounded: "{rounded.control}"
    padding: "13px 12px"
---

# Design System: LÉMAQQUE

## Overview

**Creative North Star: "Daily Performance, Precisely Crafted"**

LÉMAQQUE pairs a luxury athletic identity with the calm of a useful daily companion. Deep green-black surfaces, warm ivory type, active lime, and restrained champagne details establish the material character. The supplied brand direction is authoritative; this document captures its first implementation rather than introducing a new identity.

Expression scales with the task. The public landing uses oversized typography and an original metallic abstract performance sculpture. Tracking screens use a stable navigation rail, spacious groups of practical controls, readable records, and honest empty states. Motion supports orientation and optional exploration; full tracking works without WebGL.

**Key Characteristics:**

- Dark, warm, athletic, and precise.
- Rounded flat surfaces with thin sage separators.
- Confident display type paired with quiet functional text.
- Lime actions and active states, champagne editorial accents.
- Authentic data, useful empty states, optional dimensional imagery.

Evidence: `src/styles.css`, shared UI components, `src/main.tsx`, `src/three/PerformanceScene.tsx`, and desktop/mobile captures in `.impeccable/review/`. Frontmatter captures repeated implementation values and the explicitly supplied brand palette. The sidecar adds ramps for exploration; those ramps are synthesized previews, not implemented theme scales.

## Colors

The palette combines green-black depth with warm text and a soft, energetic accent. Values in the frontmatter are normative.

### Primary

- **Active lime:** primary actions, selected navigation, progress, text emphasis, and visible keyboard focus. Dark action ink supplies contrast within filled controls.
- **Lime hover:** a lighter response for primary actions.

### Secondary

- **Champagne:** restrained editorial details and sculpture lighting/orbits. It does not compete with primary actions.

### Neutral

- **Obsidian:** page canvas and surrounding negative space.
- **Charcoal:** the user-specified brand anchor. Current CSS uses the greener surface and panel values below for repeated containers; charcoal is retained as a brand commitment, not described as the current panel fill.
- **Surface / panel:** green-black tonal layers for cards and nested containers. Surface is the default shared card background.
- **Ivory:** primary content and display text.
- **Muted sage:** paragraph text, secondary labels, and supporting information.
- **Sage border:** subtle structure between records and groups. Fields use a stronger dedicated stroke over a deeper background.
- **Outline / ghost colors:** subdued interactive alternatives that preserve the hierarchy of the lime action.
- **Danger colors:** warm red-brown destructive controls; reserve them for destructive meaning.
- **Tag colors:** muted green metadata treatments.

**The Active Lime Rule.** Use lime to identify action, selection, progress, or deliberate headline emphasis; do not turn every container into an accent surface.

## Typography

**Display Font:** Space Grotesk Variable, with sans-serif fallback.

**Body Font:** Manrope Variable, with sans-serif fallback.

Both are self-hosted through bundled Fontsource variable-font imports. Space Grotesk gives the identity its compact geometry; Manrope keeps forms and records calm. The hierarchy is role-based rather than a single mathematical scale.

- **Display:** the frontmatter role describes the wide-screen landing headline. At tablet widths it steps to (65px) and then (54px); mobile uses `clamp(48px, 11.5vw, 76px)` with a more open line height (1.08).
- **Headline:** the general page heading role; dashboard headings use a smaller fluid variant, and mobile page headings have route-specific adjustments.
- **Title:** section headings; shared tertiary headings use (1.05rem). Cards may select larger titles when they carry the next primary task.
- **Body:** supporting prose has a maximum measure (72ch). Narrow explanatory blocks reduce that measure further.
- **Label:** controls use compact, confident type. Forms use a medium-weight label variant; metadata and tracked values are separate roles.
- **Data:** use tabular numerals for number entry and recurring measurements. Metric values use Space Grotesk with a lighter weight (400). Mobile metric labels, explanatory copy, and links use (12px), with prominent values (32px).

Some nonessential editorial captions remain smaller than body text. Do not copy these decorative sizes into essential instructions, values, or action labels.

**The Two Voices Rule.** Use Space Grotesk for headings and prominent values, and Manrope for controls, labels, records, and explanatory text.

## Layout

The desktop workspace has a fixed rail (246px), a compact topbar (75px), and a content region with generous horizontal padding (43px) and a maximum width (1600px). The rail narrows (215px) at the first desktop breakpoint (1200px), while content gutters reduce (27px). Repeated content grids use gaps around the documented grid-gap and panel-inset steps.

The dashboard pairs a larger training feature with a weekly summary, followed by a three-column metrics strip and a second pair of supporting panels. The two-column groups become a single column at (900px). At (700px), metrics also become one column with horizontal separators, preserving readable labels and action links. This is a dashboard pattern, not a required composition for other tasks.

At (700px), the rail becomes an off-canvas drawer (265px), a sticky mobile brand/menu header appears, and content uses the mobile gutter. The drawer traps keyboard focus, closes with Escape, restores focus to its opener, and makes background content inert. Forms, builders, and workout grids collapse according to their task; preserve usable control widths rather than shrinking a desktop grid indefinitely.

The landing uses percentage gutters, a broad typographic/visual split, and large section spacing. At mobile widths, copy leads and the sculpture follows in a single column. At large widths (1650px and above), the hero has a maximum width (1700px) and a taller scene. Keep that expressive composition scoped to public storytelling.

**The Stable Workspace Rule.** Keep desktop navigation fixed and mobile navigation in the shared drawer so daily task locations stay predictable.

## Elevation & Depth

Application surfaces are flat at rest. Depth comes from restrained tonal layering, generous spacing, thin separators, and selective darker insets, rather than floating card shadows or luminous neon. The mobile drawer uses a dark translucent scrim to separate its modal layer.

Dimensional rendering belongs to artwork: the landing sculpture has metallic material, lime/champagne lighting, and thin orbit rings; the dashboard training illustration uses curved bands with a localized inset/drop shadow. Its exact shadow is recorded in the sidecar and is not a general card elevation token.

**The Quiet Surface Rule.** Keep ordinary cards shadow-free; use tonal contrast and spacing to establish their hierarchy.

## Shapes

Panels use generous, gently curved corners. Controls use a smaller, consistent curve; metadata tags are tighter still. Notices and inset illustrations sit between those scales. Circular marks communicate avatars, status, and small empty-state affordances. Borders are thin and muted; the primary action gains emphasis from fill rather than a heavy stroke.

The performance artwork repeats looped, interlocking geometry. Treat this as a recognizable visual motif for expression, not a required decoration on every screen.

## Components

### Buttons

Compact, confident controls with clear hierarchy. Primary buttons use active lime and action ink; outline buttons use a muted sage stroke; ghost buttons sit quietly until hover; destructive buttons use warm danger colors. The shared control has a minimum height (44px), a gap (12px), and the documented padding. Small controls reduce to (36px); icon controls retain a minimum width (44px).

Hover shifts the button upward (1px) over (0.2s), with the variant's background response. Focus is a visible lime outline (2px) offset from the control (4px). Disabled buttons lower opacity (0.45) and use a not-allowed cursor. Honor reduced-motion preferences.

### Chips

Small, quiet labels use green metadata fill, compact corners, letter spacing (0.06em), and type (10px). They communicate metadata; they are not automatically interactive. Muscle filters are a distinct button pattern with a lime selected state and explicit pressed semantics.

### Cards / Containers

Flat surface cards use the documented panel radius and inset. At smaller desktop widths padding reduces (24px), and mobile shared cards use (23px 20px). Record lists rely on thin horizontal separators rather than nesting every item inside another card. Keep prominent headings and their next useful action easy to find.

### Inputs / Fields

Deep fields have a visible sage stroke (1px), ivory text, compact corners, a minimum height (44px), and text (13px). Labels sit above fields with a small gap (8px), with optional muted help beneath. Focus uses a lime outline (2px) with a closer offset (1px). Textareas resize vertically. Numeric fields use tabular numerals.

Error messages use the warm red notice treatment and alert semantics; ordinary notices use a muted green treatment and status semantics. Errors must remain textual, not color-only.

### Navigation

The shared rail uses icon/label rows with a consistent hit area (minimum 45px). Resting links are muted, hover gains a quiet green surface, and the current route gains lime fill, dark text, heavier weight, and a trailing chevron. The public header is simpler and hides its secondary links at tablet width. Preserve the mobile drawer's keyboard behavior when extending navigation.

### Empty States and Performance Artwork

Empty states use a small circular plus mark, a concise heading, a short explanation, and a next useful action when available. Never insert fabricated records or charts to fill space. Loading and failure states remain explicit.

The original landing sculpture is an optional WebGL enhancement. It supports drag exploration, limits device pixel ratio, and pauses continuous rendering off-screen or under reduced motion. The current reduced-motion path disables ambient continuous rendering; a static LMQ graphic covers unavailable WebGL. Do not present this abstract object as validated anatomy or exercise technique.

## Do's and Don'ts

### Do:

- **Do** preserve the supplied obsidian, charcoal, lime, champagne, and ivory identity.
- **Do** use the shared font pairing, rounded controls, flat panels, and visible lime keyboard focus.
- **Do** keep daily tasks spacious and predictable across the desktop rail and mobile drawer.
- **Do** use real data, useful empty states, and text explanations for errors or unavailable assets.
- **Do** respect reduced motion and preserve full tracking without WebGL.

### Don't:

- **Don't** introduce luminous neon, ornamental card shadows, or competing accent palettes.
- **Don't** use the public hero's oversized composition as the default layout for tracking screens.
- **Don't** invent statistics, transformation claims, nutrition values, or athlete endorsements for visual polish.
- **Don't** treat an abstract sculpture or an unvalidated animation as authoritative technique.
- **Don't** hide essential actions or instructions in the smallest decorative caption sizes.
