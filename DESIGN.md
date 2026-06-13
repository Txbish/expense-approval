---
name: Approvals
description: A precise, trustworthy expense request → review → decision app — ink on cream paper, one blue stroke for action, a wax seal for every decision.
colors:
  ink: "#001011"
  storm: "#0f1e1f"
  blue: "#007aff"
  orange: "#fd5321"
  cream: "#fcfbf8"
  parchment: "#ededea"
  mist: "#c1c4c2"
  success: "#125e42"
  destructive: "#a8281a"
  muted-foreground: "#425657"
typography:
  display:
    fontFamily: "Aeonik Pro, ui-sans-serif, system-ui, sans-serif"
    fontSize: "72px"
    fontWeight: 500
    lineHeight: 0.9
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Aeonik Pro, ui-sans-serif, system-ui, sans-serif"
    fontSize: "32px"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Aeonik Pro, ui-sans-serif, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.012em"
  body:
    fontFamily: "Aeonik Pro, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "-0.006em"
  label:
    fontFamily: "Aeonik Pro, ui-sans-serif, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.16em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  "2xl": "20px"
  "3xl": "24px"
  full: "9999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.cream}"
    rounded: "{rounded.full}"
    padding: "0 24px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.storm}"
    textColor: "{colors.cream}"
  button-outline:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.blue}"
    rounded: "{rounded.full}"
    padding: "0 24px"
    height: "44px"
  button-approve:
    backgroundColor: "{colors.success}"
    textColor: "{colors.cream}"
    rounded: "{rounded.full}"
    height: "44px"
  button-danger:
    backgroundColor: "{colors.destructive}"
    textColor: "{colors.cream}"
    rounded: "{rounded.full}"
    height: "44px"
  card:
    backgroundColor: "{colors.parchment}"
    rounded: "{rounded.2xl}"
    padding: "24px"
  input:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    height: "44px"
    padding: "0 16px"
  badge-pending:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "4px 10px"
---

# Design System: Approvals

## 1. Overview

**Creative North Star: "The Blueprint Ledger"**

Approvals reads like a well-kept accounting ledger drawn on a draughtsman's table: ink on cream paper, every figure squared to a baseline, hairline rules instead of boxes-with-shadows, and exactly one electric-blue stroke reserved for the things you can act on. It is a money tool first — operations and finance staff scan a queue, trust what they see, and make a decision that goes permanently on the record. The interface earns that trust by being legible before it is pretty: tabular numerals that align column to column, status encoded three ways at once, and a single ceremonial flourish — the **Decision Seal** — at the one emotional peak, the moment a request is approved or rejected.

The aesthetic is high-contrast and flat. There is **no elevation**: depth is built from three stacked paper tones (cream canvas → parchment cards → mist hairlines), never from shadow. Color is rationed. Black ink carries primary actions and text; blue is the wayfinding accent for anything interactive (links, focus, "review" affordances); orange is an attention and decoration signal only, never body text; green and crimson appear strictly as status. The type is a single engineered sans (Aeonik Pro) across the whole product — no display/body pairing, because a tool should disappear into the task.

This system explicitly rejects the generic-SaaS starter look (indigo/violet gradients), fintech clichés (navy-and-gold, neon "terminal green" dark mode, crypto gradients), warm-cream "editorial" backgrounds used decoratively, and dashboard theatrics (hero-metric templates, gradient text, identical icon-card grids). If a screen could be mistaken for a marketing page, it is wrong.

**Key Characteristics:**
- Ink-on-paper, light-theme-only; flat surfaces, zero shadows.
- One typeface (Aeonik Pro) in three weights; tabular lining figures for all money, counts, IDs, and timestamps.
- Blue = interactive accent; orange = attention/decoration; green/crimson = status meaning only.
- Status is triple-encoded: color + glyph + word.
- The Decision Seal is the single signature moment, used once per decided request — never as row decoration.

## 2. Colors

A paper-and-ink neutral ramp carrying one interactive accent (blue), with orange held back for attention/decoration and a green/crimson pair reserved for status. Canonical values are authored as HSL in `app/globals.css` `:root`; the hex in the frontmatter is the sRGB equivalent.

### Primary
- **Ink** (#001011 · `hsl(187 100% 3%)`): The near-black workhorse. Primary buttons, all headings and body text, the active nav item's fill, avatars. Black ink is the default "voice"; blue is the exception.
- **Electric Blue** (#007aff · `hsl(211 100% 50%)`): The one interactive accent. Links, focus rings, outline buttons, "Review →" affordances, the active-selection check. Wayfinding only — it marks what you can act on, never decorates.

### Secondary
- **Vermilion Orange** (#fd5321 · `hsl(13 98% 56%)`): Attention and decoration only — the pending-status border, unread/queue count badges, and the decorative block on the auth panel. **Never used as text.**

### Tertiary (status-only)
- **Ledger Green** (#125e42 · `hsl(158 67% 22%)`): Approved status and the Approve decision button.
- **Crimson** (#a8281a · `hsl(6 73% 38%)`): Rejected status, the Reject decision button, destructive actions, and inline error alerts. Deeper and cooler than the vermilion so the two never read as the same colour.

### Neutral
- **Cream** (#fcfbf8 · `hsl(47 33% 98%)`): The app canvas and the field/input surface.
- **Parchment** (#ededea · `hsl(60 9% 92%)`): Card and panel surface — one step down from the canvas, which is how cards read as cards without a border or shadow.
- **Mist** (#c1c4c2 · `hsl(150 3% 76%)`): Every hairline — borders, dividers, table rules.
- **Storm** (#0f1e1f · `hsl(184 35% 9%)`): Primary-button hover, and secondary ink for withdrawn status.
- **Muted Foreground** (#425657 · `hsl(184 14% 30%)`): Secondary text. Body/secondary copy in practice uses `storm` at 70–85% opacity over cream (AA-safe); reserve lighter tints for non-essential metadata only.

### Named Rules
**The One Blue Rule.** Blue means "interactive." If an element isn't a link, a focusable control, or an action affordance, it is not blue. Its scarcity is what makes it scannable.

**The Orange-Is-Never-Text Rule.** Orange is a border, a dot, a decorative block, or a count chip — never a run of text. Pending status is drawn with an orange *border* + ink text + a clock glyph, precisely because orange text on cream fails contrast and dilutes the signal.

## 3. Typography

**Display / Body / Label Font:** Aeonik Pro (with `ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`).
**Tabular Font:** Aeonik Pro with `font-variant-numeric: tabular-nums lining-nums` (surfaced as `.tabular` and the `<Money>` component). A monospace stack (`ui-monospace, SFMono-Regular, Menlo`) is used only for raw invite codes/tokens.

**Character:** One engineered, slightly technical geometric sans across the entire product — headings, labels, buttons, body, and data. Its precision reads as accountability. There is deliberately no second family: contrast comes from weight (400/500/700) and the tabular-figure treatment, not from pairing. OpenType `ss02`/`ss08`/`dlig` are enabled globally; default tracking is a tight `-0.012em`.

### Hierarchy
- **Display** (500, 72px / `heading-lg`, line-height 0.9, -0.025em): The auth/marketing hero headline only. (A 101px `display` step exists but is unused in product UI.)
- **Headline** (500, 32–36px / `heading-sm`–`heading`, line-height 1.1, -0.02em): Page titles in `<PageHeader>` and request detail.
- **Title** (500, 24px / `subheading`, line-height 1.1): Section and card headings ("Latest activity", "Invite a member").
- **Body** (400, 15px / `field`, line-height 1.4): The UI workhorse — form values, table cells, controls. Longer descriptions step up to 18px (`body-sm`) and prose to 21px (`body`); cap prose at 65–75ch.
- **Label** (500, 11px / `2xs`, letter-spacing 0.16em, UPPERCASE): The eyebrow/kicker and field labels — the system's signature small type. Counts use 10px (`3xs`).

### Named Rules
**The Ledger Figures Rule.** Every monetary amount, count, ID, and timestamp is set in tabular lining figures so columns align to the pixel. Money never renders as a float and never with a proportional figure.

## 4. Elevation

**There are no shadows.** Hierarchy is built entirely from surface tone and hairlines: the cream canvas recedes, parchment cards sit one tone above it, and mist hairlines draw the edges. This is a deliberate flat, blueprint-like depth model — if you reach for `box-shadow`, you are off-system.

The single exception, and the only "elevation" the system allows, is the **focus ring**: a 2px blue outline at 2px offset on `:focus-visible`. State (hover, focus, active) is expressed through background-tone shifts and the blue ring, not lift.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at every rest and hover state. The only thing that may visually "rise" is a focused control, and it rises with a blue ring — never a shadow.

## 5. Components

### Buttons
- **Shape:** Full pill (`rounded-full`, 9999px), fixed height 44px, horizontal padding 24px, `text-field` (15px) medium weight, `whitespace-nowrap`. One `ease-out-quart` color transition (200ms).
- **Primary:** Ink fill, cream text; hover → storm. The default for the page's main action.
- **Outline:** Blue border + blue text on cream; hover → blue at 8% tint. Secondary navigation-style actions ("Review N pending").
- **Secondary:** Parchment fill, mist border, ink text; hover → mist tint.
- **Approve / Danger:** Dedicated AA-safe fills — green (`approve`) and crimson (`danger`) — used only on the decision path and destructive actions. Orange (`wash`) is a rare ink-on-orange variant for decorative emphasis.
- **Focus:** 2px blue ring at 40% (`focus-visible:ring-blue/40`). Disabled → 45% opacity, no pointer events.

### Chips & Badges
- **Status badge:** A small pill (`rounded-md`, 8px) with a hairline border, glyph, and capitalized word. **Triple-encoded** — pending (orange border, ink text, clock), approved (green border+text, check), rejected (crimson border+text, ✕), withdrawn (mist border, storm text, back-arrow). Never relies on colour alone.
- **Count chip:** Orange circle, ink tabular numerals (nav badges, unread counts).
- **Filter pills:** Full pills; active = ink fill/cream text, inactive = cream/mist border with hover border shift.

### Cards / Containers
- **Corner style:** `rounded-2xl` (20px) for primary panels; `rounded-xl` (16px) for compact tiles.
- **Background:** Parchment (`bg-card`) — distinguished from the cream canvas by tone, not border.
- **Shadow strategy:** None (see Elevation). Data surfaces (tables, lists) use a mist border + cream background instead.
- **Internal padding:** 24px (`p-6`), 32px (`p-8`) on larger forms. Never nest a card inside a card.

### Inputs / Fields
- **Style:** Cream fill, mist border, `rounded-lg` (12px), height 44px. Labels are uppercase `label` type above the control.
- **Focus:** Border shifts to blue + 2px blue ring at 30%. Hover lifts the border to storm/30.
- **Select:** A custom, cross-platform listbox (not the native `<select>`) — a field-style trigger with a rotating chevron and a `fixed`-positioned menu (escapes `overflow-hidden` ancestors) of options with a blue check on the active one. Identical on every browser/OS.
- **Error:** Crimson border + crimson text in an inline alert with a warning glyph (`FormError`).

### Navigation
- **Desktop:** A fixed 256px left rail on cream with a mist border, role-grouped links under uppercase `label` headings; the active link is an ink fill with cream text and icon. A sticky top bar carries the org breadcrumb, role badge, notifications, and avatar.
- **Mobile (<768px):** The rail collapses to a sticky top bar (brand + notifications + hamburger) and a left slide-in drawer (`translate-x`, 300ms `ease-out`) over an ink/60 scrim, with safe-area insets.
- **Notifications:** A bell that opens an anchored popover (a `fixed` panel, not a route) listing recent items with unread dots and "Mark all read"; "View all" deep-links to the full page.

### Signature Component — The Decision Seal
The emotional peak. When a request is decided, the detail page stamps a flat, status-colored disc (`<Seal>`, 56px) — a solid fill in the status hue with an inner hairline ring and the status glyph, animated in once with `scale-in`. Its geometry is identical to the favicon and the in-app brand mark: the product's icon and its core gesture (a sealed decision) are one thing. Used as a moment, never as row decoration.

## 6. Do's and Don'ts

### Do:
- **Do** build depth from the three paper tones (cream → parchment → mist) and hairlines. Cards are parchment on cream; tables are a mist border on cream.
- **Do** reserve blue for interactive elements only — links, focus, outline buttons, action affordances (**The One Blue Rule**).
- **Do** set every amount, count, ID, and timestamp in tabular lining figures, and store and render money as integer minor units (**The Ledger Figures Rule**).
- **Do** encode every status three ways — colour + glyph + word — so it survives a glance, grayscale, and colour-blindness.
- **Do** use Aeonik Pro for everything; create contrast with weight (400/500/700) and size, not a second family.
- **Do** give every interactive control a visible 2px blue `:focus-visible` ring, and a `prefers-reduced-motion` fallback for every animation.
- **Do** keep the Decision Seal to the one moment a request is decided.

### Don't:
- **Don't** add shadows or glassmorphism to convey depth — the system is flat by default (**The Flat-By-Default Rule**).
- **Don't** render orange as text; pending uses an orange border + ink text + glyph (**The Orange-Is-Never-Text Rule**).
- **Don't** reach for the indigo/violet "generic SaaS starter" look, or fintech clichés — navy-and-gold, neon "terminal green" dark mode, or crypto gradients.
- **Don't** use warm-cream/parchment as a *decorative editorial* background; here paper tone is structural (canvas vs. card), not mood.
- **Don't** build decorative dashboards: no hero-metric templates, no gradient text, no identical icon-card grids.
- **Don't** ship a dark theme — Approvals is a daytime, figure-scanning, light-only tool.
- **Don't** reinvent standard affordances for flavour, with one sanctioned exception: the custom Select exists because native `<select>` can't be themed cross-platform.
- **Don't** nest a card inside a card.
