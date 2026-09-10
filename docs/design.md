---
name: Editorial Test Portal
colors:
  surface: '#faf9f6'
  surface-dim: '#dbdad7'
  surface-bright: '#faf9f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f0'
  surface-container: '#efeeeb'
  surface-container-high: '#e9e8e5'
  surface-container-highest: '#e3e2df'
  on-surface: '#1a1c1a'
  on-surface-variant: '#45474b'
  inverse-surface: '#2f312f'
  inverse-on-surface: '#f2f1ee'
  outline: '#76777c'
  outline-variant: '#c6c6cb'
  surface-tint: '#5b5e67'
  primary: '#1e2229'
  on-primary: '#ffffff'
  primary-container: '#1e2229'
  on-primary-container: '#868992'
  inverse-primary: '#c3c6d0'
  secondary: '#575f68'
  on-secondary: '#ffffff'
  secondary-container: '#d9e0eb'
  on-secondary-container: '#5b636c'
  tertiary: '#c4553b'
  on-tertiary: '#ffffff'
  tertiary-container: '#ffdad2'
  on-tertiary-container: '#832610'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  background: '#faf9f6'
  on-background: '#1a1c1a'
  surface-variant: '#e3e2df'
typography:
  headline-xl:
    fontFamily: Newsreader
    fontSize: 40px
    fontWeight: '400'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Newsreader
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Newsreader
    fontSize: 24px
    fontWeight: '400'
    lineHeight: 32px
  headline-sm:
    fontFamily: Source Sans 3
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Source Sans 3
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Source Sans 3
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Source Sans 3
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Source Sans 3
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Source Sans 3
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  grid-max-width: 1120px
  margin-desktop: 4rem
  margin-mobile: 1.5rem
  gutter: 2rem
  space-2: 0.5rem
  space-4: 1rem
  space-6: 1.5rem
  space-8: 2rem
  space-12: 3rem
  space-16: 4rem
---

## Brand & Style

This design system is built on a **Minimalism** philosophy tailored for an intellectual, focused testing environment. The brand personality is scholarly, calm, and uncompromisingly precise. It targets students and professionals who value clarity, literary restraint, and distraction-free cognitive performance over gamified noise. 

The UI evokes an atmosphere of a quiet reading room or a high-end academic journal. It relies on generous whitespace, rigorous grid alignment, and sophisticated typographic hierarchies to instill confidence and deep concentration.

## Colors

The palette is restrained, earthy, and paper-inspired. The foundation rests on a warm off-white neutral (`#FAF9F6` / `#F8F7F4`) that mimics high-grade matte book paper rather than sterile digital white, reducing eye fatigue during long examination sessions. 

- **Primary (Deep Slate `#1E2229`):** Used for all structural text, primary headers, and high-emphasis interface elements.
- **Secondary (Muted Slate `#575F68` / `#717982`):** Applied to secondary metadata, inactive states, and structural dividers.
- **Tertiary (Terracotta `#C4553B`):** A sparing, deliberate accent color reserved exclusively for critical actions, active states, and error alerts.

## Typography

Typography bridges rigorous academic publishing with digital utility. Headlines utilize **Newsreader**, providing an authoritative, literary serif voice that makes exam titles and section headers feel like chapters in a textbook. 

Body and interface text rely on **Source Sans 3**, ensuring maximum legibility for dense questions, multiple-choice options, and analytical reports. Line heights are intentionally generous to support deep reading comprehension. For mobile viewports, headlines larger than 32px automatically scale down to prevent awkward wrapping.

## Layout & Spacing

The layout follows a centered **Fixed grid** philosophy constrained to a maximum width of 1120px. This prevents long-form reading lines from stretching uncomfortably wide on ultra-wide desktop displays, maintaining an ideal measure for text-heavy question prompts.

- **Margins:** Generous side margins (4rem on desktop, 1.5rem on mobile) frame the testing environment like the margin of a printed page.
- **Whitespace:** Rhythmic vertical spacing (multiples of 8px) separates question blocks, navigation controls, and analytical panels, establishing clear spatial boundaries without heavy visual containers.

## Elevation & Depth

Depth is conveyed strictly through **low-contrast outlines** and subtle surface shifts rather than floating shadows or dramatic blurs. 

- **Surfaces:** Cards and question panels sit on flat, crisp planes using the warm off-white neutral against pure white, or defined by hair-thin borders in `#E2E0D8`.
- **Boundaries:** There are no ambient drop shadows. Hierarchy is strictly structural, relying on precise typographic weight, whitespace, and delicate single-pixel borders to delineate interactive zones.

## Shapes

The system uses a **Soft** shape language (`0` to `0.25rem` radius) to maintain a restrained, bookish architecture. 

- **Containers:** Input fields, test cards, and buttons feature minimal corner rounding (`4px`), avoiding the casual, overly bubbly feel of pill-shaped mobile apps. 
- **Badges & Pills:** Reserved exclusively for status tags (e.g., "Answered", "Flagged") where fully rounded shapes provide functional differentiation from primary interaction cards.

## Components

### Buttons
Primary buttons feature a solid deep slate background with crisp text, shifting to terracotta on hover. Secondary buttons use a ghost style with a subtle outline border and deep slate text. Avoid any gradient fills or multi-layer drop shadows.

### Input Fields
Text inputs and essay response boxes feature a clean 1px border in neutral gray, with a soft background fill. Focus states transition the border instantly to deep slate without an outer glow.

### Checkboxes & Radio Buttons
Rendered as sharp squares (checkboxes) and circles (radio buttons) with precise 1.5px borders. Selected states fill with deep slate and feature a clean, centered marker, maintaining a traditional academic test booklet feel.

### Cards
Test modules and question containers are presented on flat cards bounded by a single-pixel border, featuring generous internal padding and clear separation between prompt text and option sets.

### Chips & Tags
Compact metadata elements used for question status (e.g., "Marked for Review") utilizing subtle neutral backgrounds and uppercase tracking for readability.

### Specialized Components
- **Question Navigator Grid:** A structured matrix tracking test progress, utilizing minimal square nodes that shift color based on completion status (unvisited, answered, flagged).
- **Timer Display:** Monospaced numerical readout paired with restrained structural dividers to maintain a calm, non-panicked atmosphere.
