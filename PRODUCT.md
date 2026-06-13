# Product

## Register

product

## Users

Operations and finance staff at small companies (the archetype: a 28-year-old ops
manager at a ~30-person company) who use the tool several times a week. Two primary
contexts:

- **Requesters** submit expense/budget requests and track their status.
- **Approvers / admins** review a queue and make decisions, manage members, and set policy.

They care about speed and clarity far more than aesthetics — but a tool that looks
considered earns their trust with money decisions.

## Product Purpose

A multi-tenant **request → review → decision** app for company expense approvals.
Success is a fast, unambiguous decision loop with a complete audit trail: everyone can
see who decided what, when, and why. Authorization lives in the database (RLS + the
`decide_request` RPC); the UI only ever reflects permissions, never enforces them.

## Brand Personality

Clear, accountable, decisive. Three words: **precise, trustworthy, calm.** The interface
should feel like a well-kept ledger — every figure lines up, every decision is on the
record. Voice is plain and direct; no cute jargon around money.

## Anti-references

- The indigo/violet "generic SaaS starter" look (which is what the unstyled app was).
- Fintech clichés: navy-and-gold, neon "terminal green" dark mode, crypto gradients.
- Warm-cream / parchment "editorial" backgrounds — wrong for figure-scanning.
- Decorative dashboards: hero-metric templates, gradient text, identical icon-card grids.

## Design Principles

1. **The ledger lines up.** Money and counts use tabular figures and align, so a queue
   scans in seconds. Clarity of numbers is the core craft.
2. **Status is unmistakable.** The four request states are encoded three ways at once —
   color, glyph, and word — so they survive a glance, grayscale, and colorblindness.
3. **A decision is a sealed act.** The moment of approval/rejection is the emotional peak
   and gets a signature treatment (the seal). Accountability is felt, not just logged.
4. **The tool disappears into the task.** Familiar app patterns (sidebar, tables, forms),
   consistent component vocabulary, motion only to convey state.
5. **Trust through restraint.** One accent, lots of paper/ink, hairline structure. Color
   is used for meaning (status, primary action), never decoration.

## Accessibility & Inclusion

- WCAG AA for all text (body ≥4.5:1, large/graphic ≥3:1), verified in light and dark.
- Status never relies on color alone (glyph + label always present).
- Full `prefers-reduced-motion` fallbacks; all interactive controls have visible focus.
- Responsive and usable down to 768px (sidebar collapses to a drawer below that).
