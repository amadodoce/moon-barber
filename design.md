# Design — Moon Barber

Locked design system for the Moon Barber app. Every page reads this file before emitting UI.

## Genre
Editorial luxury — warm charcoal surfaces, restrained gold accent, Persian-first RTL.

## Macrostructure families
- **Marketing pages:** Marquee Hero + Split Studio sections
- **App / transactional pages:** Workbench — persistent context, task pane, restrained cards
- **Status / content pages:** Long Document — single-purpose hierarchy

## Theme
- `--color-paper` oklch(14% 0.012 65)
- `--color-paper-2` oklch(18% 0.014 65)
- `--color-ink` oklch(95% 0.008 85)
- `--color-accent` oklch(78% 0.12 85)
- `--color-rule` oklch(28% 0.014 65)

## Typography
- Display & body: Yekan (Persian UI)
- Scale: `--text-display` for hero, `--text-md` body, max measure 65ch

## Spacing
4-point named scale in `tokens.css`. Use `var(--space-*)` only.

## Motion
- Easings: `--ease-out`
- Reveal: fade + subtle translate only
- Reduced motion: opacity-only ≤150ms

## Microinteractions
- Silent success toasts
- Hover tooltips delay 800ms; focus 0ms
- Eight states on all interactive controls

## CTA voice
- Primary: filled gold pill, `--radius-input`, verb-led Persian copy
- Secondary: outline on `--color-rule`, same radius

## Navigation & footer
- Nav: N9 edge-aligned minimal (marketing), grouped sidebar (admin)
- Footer: Ft1 mast-headed

## Per-page allowances
- Marketing MAY use photography and section enrichment
- App pages MUST NOT use decorative enrichment
- Status pages: typography + compact recovery actions only

## What pages MUST share
- BrandMark, accent placement, Yekan typography, CTA shape, status badge colors

## Exports
See `tokens.css` at project root for portable token definitions.
