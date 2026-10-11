---
name: Tally Intelligence Dark
colors:
  surface: '#0a0f1d'
  surface-dim: '#060911'
  surface-bright: '#1e293b'
  surface-container-lowest: '#04070e'
  surface-container-low: '#0a0f1d'
  surface-container: '#111827'
  surface-container-high: '#1a233a'
  surface-container-highest: '#242f4c'
  on-surface: '#f8fafc'
  on-surface-variant: '#94a3b8'
  outline: 'rgba(255, 255, 255, 0.08)'
  outline-variant: 'rgba(99, 102, 241, 0.3)'
  primary: '#6366f1'
  on-primary: '#ffffff'
  primary-container: '#4338ca'
  on-primary-container: '#c7d2fe'
  secondary: '#06b6d4'
  on-secondary: '#ffffff'
  secondary-container: '#0e7490'
  tertiary: '#10b981'
  on-tertiary: '#ffffff'
  tertiary-container: '#047857'
  error: '#ef4444'
  on-error: '#ffffff'
  error-container: '#991b1b'
  background: '#060911'
  on-background: '#f8fafc'
  surface-variant: '#151e33'
  text-primary: '#f8fafc'
  text-secondary: '#94a3b8'
  text-muted: '#64748b'
  accent-indigo: '#6366f1'
  accent-cyan: '#06b6d4'
  accent-emerald: '#10b981'
  accent-amber: '#f59e0b'
  accent-rose: '#f43f5e'
typography:
  headline-lg:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Outfit
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Outfit
    fontSize: 18px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: '1'
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: '1'
rounded:
  sm: 0.375rem
  DEFAULT: 0.5rem
  md: 0.625rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 24px
  margin-desktop: 32px
  margin-mobile: 16px
---

# Design System: Tally Intelligence Dark

A high-contrast, data-dense dark glassmorphism design system engineered specifically for accounting, audit trail verification, and financial master data extraction from Tally Prime EditLog 2.1 systems.

---

## 1. Design Philosophy
- **High-Density Legibility:** Financial and audit professionals require dense information layouts without clutter. We use structured spacing, tabular data alignments, and clean visual dividers.
- **Glassmorphism with Depth:** Subtly translucent container backgrounds with 12px backdrop blur layered over a deep radial glow void (`#060911`).
- **Precision Data Accents:** Statutory codes, tax IDs (PAN, GSTIN), session UUIDs, and voucher numbers are highlighted with distinct semantic color badges and monospaced typography (`JetBrains Mono`).

---

## 2. Color Token Roles
- **Background (`#060911`):** Deep charcoal void reducing eye fatigue during intensive ledger audits.
- **Primary Indigo (`#6366f1`):** Master interactions, primary action buttons, brand mark, and active tab states.
- **Emerald Green (`#10b981`):** Verified records, PAN numbers, success alerts, and completed ingestion states.
- **Cyan (`#06b6d4`):** Voucher sequences, LinkMgr indices, and secondary actions.
- **Amber Gold (`#f59e0b`):** GST registrations, tax compliance tags, and warning highlights.
- **Rose Red (`#f43f5e`):** Operator sessions, EditLog alteration events, and danger actions.

---

## 3. Typography Hierarchy
- **Display & Headings:** `Outfit, sans-serif` — Modern, geometric, clean letterforms with high authority.
- **User Interface & Body:** `Inter, sans-serif` — Highly readable interface font at small sizes (12px - 14px).
- **Data & Identifiers:** `JetBrains Mono, monospace` — Used for PANs, GSTINs, voucher references, timestamps, and session UUIDs.

---

## 4. Components & Elevation
- **Cards:** `1px solid rgba(255, 255, 255, 0.08)` borders with `rgba(17, 24, 39, 0.75)` backdrop fill.
- **Buttons:**
  - *Primary:* Indigo gradient (`#6366f1` to `#9333ea`) with subtle 4px glow.
  - *Secondary:* Translucent white (`rgba(255, 255, 255, 0.05)`) with border.
  - *Success CTA:* Emerald gradient for instant local scans.
- **Badges:** Pill shapes with matching 15% opacity tint backgrounds and solid border strokes.
- **Data Grids:** Hover highlights on rows, sticky table headers, monospace tabular figures, and click-to-copy utility icons.
