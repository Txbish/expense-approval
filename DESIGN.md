# Design

Visual system for the Approvals app — "The Ledger." Ink on paper, tabular figures, and a
single stroke of vermilion: the seal of a decision. All tokens are defined once in
`app/globals.css` (`:root` for light, `.dark` for dark) and exposed to Tailwind v4 via the
`@theme inline` block. There is no `tailwind.config.ts` — `@theme` is Tailwind v4's
idiomatic token system and is where utilities like `bg-surface` / `text-ink` / `text-accent`
come from. No component hardcodes a color or font size.

## Theme

Light and dark, both first-class. Toggled by a `.dark` class on `<html>` (manual override
persisted to `localStorage`), defaulting to the OS preference. A tiny no-flash script in
`app/layout.tsx` applies the theme before first paint. Light is the default mood — a
daytime financial-review tool where figures must scan cleanly; the dark **sidebar rail**
supplies contrast even in light mode.

## Color (OKLCH)

Strategy: **Restrained** — pure paper + ink ramp + one accent. Warmth lives in the accent
and type, never the background.

| Role | Light | Dark | Use |
| --- | --- | --- | --- |
| `bg` | `oklch(0.985 0 0)` | `oklch(0.17 0.006 265)` | app canvas |
| `surface` | `oklch(1 0 0)` | `oklch(0.205 0.007 265)` | panels, tables, forms |
| `ink` | `oklch(0.23 0.006 265)` | `oklch(0.95 0.004 265)` | headings / primary text |
| `muted` | `oklch(0.47 0.01 265)` | `oklch(0.665 0.009 265)` | secondary text (AA) |
| `line` | `oklch(0.918 0.004 265)` | `oklch(0.285 0.008 265)` | hairlines |
| `accent` | `oklch(0.545 0.205 33)` | `oklch(0.555 0.21 33)` | primary action / focus (white text passes AA) |
| `accent-ink` | `oklch(0.47 0.17 33)` | `oklch(0.73 0.16 38)` | links / accent text on paper |
| `sidebar` | `oklch(0.205 0.012 265)` | `oklch(0.145 0.006 265)` | nav rail (fixed-dark in both themes) |

**Status — triple-encoded** (each has `-fg` / `-bg` / `-line` pill tokens, a `-solid` dot,
and a distinct glyph + word):

| Status | Hue | Glyph |
| --- | --- | --- |
| Pending | amber ~75° | hollow clock (pulses) |
| Approved | green ~155° | check |
| Rejected | crimson ~24° (cooler/deeper than the accent) | ✕ |
| Withdrawn | neutral slate | back-arrow |

Decision buttons use dedicated AA-safe fills: `approve-btn` (green) and `reject-btn`
(crimson). The brand vermilion never appears *as a status* — only on neutral primary
actions, links, and focus.

## Typography

One matched superfamily, split on a contrast axis (sans + mono), both via `next/font/google`:

- **IBM Plex Sans** — all UI text, labels, headings, body. Engineered-precise character
  reads as accountability.
- **IBM Plex Mono** — the ledger face. Every monetary amount, ID, timestamp, and count
  uses it with `tabular-nums lining-nums` so columns align. Surfaced as `font-mono` and the
  `<Money>` component.

Fixed rem scale (Tailwind's, no fluid clamp in product UI). Custom `text-2xs` / `text-3xs`
steps for badge counts. `h1–h3` get `text-wrap: balance` and tight tracking; prose gets
`text-wrap: pretty`.

## Signature element — The Decision Seal

An embossed, status-colored seal (`<Seal>` in `components/status-badge.tsx`) marks the
moment a request is decided, on the request-detail page. Its geometry is identical to the
**favicon** (`app/icon.svg`) and the in-app logo (`components/brand-mark.tsx`) — the
product's icon and its core gesture (a sealed decision) are one thing. Used as a moment,
never decoration on every row.

## Layout & components

- **App shell:** fixed left **sidebar** (dark rail) with role-grouped nav, badges, org
  switcher, theme toggle, and user/sign-out. Content is a centered `max-w-5xl` column with a
  consistent `<PageHeader>` (title · description · primary action). Below 768px the sidebar
  collapses to a top bar + slide-in drawer.
- **Tables** are the primary data surface: hairline-ruled, right-aligned tabular money,
  `<StatusBadge>` column, subtle row-hover, staggered rise on load.
- **Primitives** (`components/ui.tsx`): `Button` (primary / secondary / danger / approve /
  ghost), `Card`, form controls with full focus/hover/disabled states, `FormError`, `Money`,
  `EmptyState` (teaches the interface), `Spinner`, `PageHeader`.
- **States:** skeleton loaders (`app/(app)/loading.tsx`, `.skeleton`), branded empty states,
  branded `not-found.tsx`, inline error alerts.

## Motion

150–250ms, state-only, eased with `ease-out-quart`. Status/seal press (`animate-seal`),
list stagger (`stagger-rise`), skeleton shimmer, drawer slide, theme/sun-moon crossfade.
Every animation has a `prefers-reduced-motion: reduce` fallback (crossfade/instant). A
semantic z-index scale (`--z-dropdown` → `--z-toast`) replaces arbitrary values.
