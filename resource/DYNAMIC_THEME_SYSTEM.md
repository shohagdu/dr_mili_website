# Dynamic Theme System — Design Document

> A WordPress-style theming layer for the Dr. Mili website. Lets the doctor (or admin) change colors, fonts, spacing, logo, and layout from the admin panel — without touching any code.

**Status:** Design / Spec — not yet implemented
**Target stack:** Next.js 14 (App Router) + Rust/Actix backend + MySQL
**Author:** Project planning document
**Last updated:** 2026-05-18

---

## Table of Contents

1. [Overview](#1-overview)
2. [Goals & Non-Goals](#2-goals--non-goals)
3. [WordPress Comparison](#3-wordpress-comparison)
4. [Architecture](#4-architecture)
5. [Theme Token Taxonomy](#5-theme-token-taxonomy)
6. [Database Design](#6-database-design)
7. [API Design](#7-api-design)
8. [Frontend Integration](#8-frontend-integration)
9. [Preset Themes](#9-preset-themes)
10. [Admin Panel — Theme Editor](#10-admin-panel--theme-editor)
11. [Caching & Performance](#11-caching--performance)
12. [Implementation Phases](#12-implementation-phases)
13. [Migration from Current Hardcoded Design](#13-migration-from-current-hardcoded-design)
14. [Future Enhancements](#14-future-enhancements)
15. [Risks & Trade-offs](#15-risks--trade-offs)
16. [Glossary](#16-glossary)

---

## 1. Overview

Today, the Dr. Mili website's design (colors, fonts, spacing) is hardcoded in:
- `03-frontend/tailwind.config.ts` — design tokens
- `03-frontend/app/globals.css` — base styles, components
- `03-frontend/app/layout.tsx` — font imports

To change the brand color or swap a font, a developer must edit code and redeploy.

A **dynamic theme system** moves these decisions into the database. The doctor (or admin) selects a preset theme or customizes individual tokens through a UI — and the entire site updates within seconds, no rebuild required.

### Key capabilities

- **Preset themes** — 5 ready-to-use looks (e.g., Editorial Medical, Clinical Modern, Bengali Heritage)
- **Live customization** — override any token of the active theme (color, font, radius, etc.)
- **Logo & branding** — upload doctor's photo, logo, favicon from the admin panel
- **Light/Dark mode** — toggle dark variant per theme (optional)
- **Custom CSS** — power users can inject extra CSS rules
- **Instant updates** — changes appear within ~60 seconds (configurable revalidation)

---

## 2. Goals & Non-Goals

### Goals

- ✅ Doctor can change brand colors and fonts without engineer involvement
- ✅ Multiple selectable preset themes ship out of the box
- ✅ Admin can fine-tune any single token of a theme (like WordPress Customizer)
- ✅ Theme switch causes no downtime — changes are live within seconds
- ✅ No client-side flash of unstyled content (FOUC) — SSR injects the right CSS
- ✅ Themes are version-controlled in code AND editable in DB (preset + override)
- ✅ Single source of truth — Tailwind config reads from CSS variables, not hardcoded

### Non-Goals

- ❌ Full visual page builder (Elementor/Gutenberg style) — out of scope
- ❌ Per-user themes (every visitor sees the same theme)
- ❌ A/B testing of themes (could be a future enhancement)
- ❌ Marketplace for downloading third-party themes
- ❌ Plugin architecture beyond theming
- ❌ Multilingual theming (themes apply equally to all locales)

---

## 3. WordPress Comparison

| WordPress feature | Our equivalent |
|---|---|
| Themes (Twenty Twenty-Four, etc.) | **Preset themes** — JSON files in `themes/` directory |
| `theme.json` (Block Themes) | **theme JSON schema** — defines all available tokens |
| Customizer (`/wp-admin/customize.php`) | **Admin theme editor** — separate React app, talks to API |
| Site Identity (logo, title, tagline) | **Branding settings** — stored in `site_settings` table |
| Custom CSS field | **Custom CSS field** — stored as `custom_css` setting |
| Theme switch (Appearance → Themes) | **Theme picker** — admin selects active theme by slug |
| Widget areas | ❌ Not in scope for v1 |
| Page templates | ❌ Not in scope — pages are React routes |

### Mental model

> **Theme = a complete set of design tokens (preset).**
> **Customization = per-token override of the active theme.**
> **Active theme = the theme currently rendered to visitors.**

Same as WordPress: install many themes → activate one → optionally customize it.

---

## 4. Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│ ADMIN BROWSER                                                       │
│ (separate admin app, not in scope for v1 — could use any framework) │
└────────────────────────┬────────────────────────────────────────────┘
                         │ JWT-authenticated REST
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│ RUST BACKEND (api.drtapan.com)                                     │
│                                                                     │
│  GET    /api/v1/theme            → active theme + customizations    │
│  GET    /api/v1/theme/presets    → list of available presets        │
│  PATCH  /api/v1/admin/theme      → switch active theme              │
│  PATCH  /api/v1/admin/theme/customize → override individual tokens  │
│  POST   /api/v1/admin/theme/reset → clear all customizations        │
└────────────────────────┬────────────────────────────────────────────┘
                         │ SQL
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│ MYSQL                                                               │
│  themes               (preset definitions, seeded from JSON files)  │
│  theme_customizations (per-token overrides for active theme)        │
│  site_settings        (active_theme_slug, logo_url, custom_css)     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ VISITOR BROWSER (drtapan.com)                                       │
└────────────────────────▲────────────────────────────────────────────┘
                         │ HTML with inline <style> tag containing CSS vars
                         │
┌─────────────────────────────────────────────────────────────────────┐
│ NEXT.JS (Vercel, ISR with 60s revalidate)                          │
│                                                                     │
│  app/layout.tsx                                                     │
│    ↓ at SSR time:                                                   │
│    1. Fetch /api/v1/theme                                           │
│    2. Generate :root { --color-clinical: ...; } CSS block           │
│    3. Inject into <head>                                            │
│                                                                     │
│  tailwind.config.ts                                                 │
│    All colors reference var(--color-*) instead of hex codes         │
└─────────────────────────────────────────────────────────────────────┘
```

### Data flow — visitor request

1. Visitor requests `drtapan.com/services`
2. Vercel checks ISR cache → if stale (>60s), regenerates the page
3. Next.js calls backend: `GET /api/v1/theme`
4. Backend reads `site_settings.active_theme_slug` → finds row in `themes`
5. Backend merges that theme's tokens with any `theme_customizations` rows
6. Returns final flat object of resolved tokens
7. Next.js converts to CSS variables, injects into `<head>`
8. Visitor sees themed page

### Data flow — admin change

1. Admin opens theme editor, picks "Clinical Modern" theme
2. UI calls `PATCH /api/v1/admin/theme` with `{ slug: 'clinical-modern' }`
3. Backend updates `site_settings.active_theme_slug`
4. Optionally calls Vercel's revalidate webhook → page cache purged
5. Within 60 seconds (or instantly with webhook), all visitors see new theme

---

## 5. Theme Token Taxonomy

Every customizable design value is a **token**. Tokens are organized into namespaces.

### 5.1 Colors

Each color has a base value, optional `dark` variant (for dark mode), and optional foreground (text color when used as background).

| Token key | Default (Editorial Medical) | Description |
|---|---|---|
| `color.brand.primary` | `#0f4c5c` | Main brand color (buttons, links, accents) |
| `color.brand.primary-dark` | `#0a3744` | Hover/active state |
| `color.brand.primary-light` | `#1a6b80` | Light variant |
| `color.brand.primary-tint` | `#e6f0f3` | Very pale, for backgrounds |
| `color.brand.accent` | `#c47a3d` | Secondary accent (CTAs, highlights) |
| `color.brand.accent-dark` | `#9a5e2c` | Accent hover |
| `color.surface.background` | `#faf8f3` | Page background |
| `color.surface.warm` | `#f3efe7` | Section alt background |
| `color.surface.cream` | `#ece6d8` | Card backgrounds |
| `color.text.primary` | `#161514` | Body text |
| `color.text.soft` | `#2a2825` | Muted body text |
| `color.text.muted` | `#5a554f` | Secondary text |
| `color.text.subtle` | `#8b857d` | Captions, helpers |
| `color.text.inverse` | `#faf8f3` | Text on dark backgrounds |
| `color.status.success` | `#0f5132` | Success messages |
| `color.status.warning` | `#c47a3d` | Warning messages |
| `color.status.error` | `#d65d51` | Error/alert (coral) |
| `color.status.info` | `#0f4c5c` | Informational |
| `color.border.default` | `rgba(22,21,20,0.10)` | Standard borders |
| `color.border.strong` | `rgba(22,21,20,0.20)` | Emphasized borders |

### 5.2 Typography

| Token key | Default | Description |
|---|---|---|
| `font.family.display` | `"Fraunces"` | Headings (serif) |
| `font.family.body` | `"DM Sans"` | Body text (sans) |
| `font.family.mono` | `"JetBrains Mono"` | Code blocks |
| `font.family.bengali` | `"Hind Siliguri"` | Bengali text (optional) |
| `font.weight.body` | `400` | Default body weight |
| `font.weight.medium` | `500` | Medium emphasis |
| `font.weight.bold` | `700` | Strong emphasis |
| `font.size.base` | `1rem` | Base font size (16px) |
| `font.size.scale` | `1.25` | Typographic scale ratio |
| `font.letter-spacing.display` | `-0.025em` | Tighter tracking on big text |
| `font.line-height.body` | `1.6` | Body line height |
| `font.line-height.display` | `1.05` | Heading line height |

### 5.3 Spacing & Layout

| Token key | Default | Description |
|---|---|---|
| `space.unit` | `0.25rem` | Base spacing unit (4px) |
| `container.max-width` | `80rem` | Max content width |
| `container.padding` | `1.5rem` | Side padding on container |
| `section.padding-y` | `6rem` | Vertical padding between sections |

### 5.4 Borders & Radii

| Token key | Default | Description |
|---|---|---|
| `radius.small` | `0.375rem` | Small radius (inputs) |
| `radius.medium` | `0.75rem` | Medium (cards) |
| `radius.large` | `1.25rem` | Large (panels) |
| `radius.full` | `9999px` | Pill/circle |
| `border.width.default` | `1px` | Default border |
| `border.width.thick` | `2px` | Emphasized borders |

### 5.5 Shadows

| Token key | Default | Description |
|---|---|---|
| `shadow.small` | `0 1px 2px rgba(22,21,20,0.05)` | Subtle elevation |
| `shadow.medium` | `0 4px 12px rgba(22,21,20,0.08)` | Card elevation |
| `shadow.large` | `0 12px 40px rgba(22,21,20,0.12)` | Modal elevation |
| `shadow.brand` | `0 8px 30px rgba(15,76,92,0.25)` | Branded glow |

### 5.6 Motion

| Token key | Default | Description |
|---|---|---|
| `motion.duration.fast` | `150ms` | Hover transitions |
| `motion.duration.normal` | `300ms` | Standard transitions |
| `motion.duration.slow` | `600ms` | Page-load reveals |
| `motion.easing.standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | Default easing |

### 5.7 Branding (non-design, but configurable)

| Token key | Default | Description |
|---|---|---|
| `brand.site-name` | `"Prof. Dr. Maksuda Farida Akhtar (Mili)"` | Site name in header |
| `brand.tagline` | `"MBBS · FCPS (Urology)"` | Subline under name |
| `brand.logo-url` | (none — uses text) | URL to logo image |
| `brand.favicon-url` | `/favicon.ico` | Favicon path |
| `brand.og-image-url` | `/og-image.jpg` | Social share image |

### Total tokens: ~50

---

## 6. Database Design

### 6.1 New tables

```sql
-- ============================================================
-- THEMES — preset theme definitions
-- ============================================================
CREATE TABLE themes (
  id            BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  slug          VARCHAR(80) UNIQUE NOT NULL,
  name          VARCHAR(120) NOT NULL,
  description   TEXT NULL,
  author        VARCHAR(120) DEFAULT 'Dr. Mili Team',
  is_dark       BOOLEAN NOT NULL DEFAULT FALSE,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  -- Full theme tokens stored as JSON
  -- {"color.brand.primary": "#0f4c5c", "font.family.display": "Fraunces", ...}
  tokens        JSON NOT NULL,
  preview_image VARCHAR(500) NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                  ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_active_order (is_active, display_order)
) ENGINE=InnoDB;

-- ============================================================
-- THEME CUSTOMIZATIONS — per-token overrides for active theme
-- ============================================================
CREATE TABLE theme_customizations (
  id            BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  -- Which theme this customization belongs to (FK to themes.slug)
  theme_slug    VARCHAR(80) NOT NULL,
  -- Token key, e.g. "color.brand.primary"
  token_key     VARCHAR(120) NOT NULL,
  -- Overridden value
  token_value   TEXT NOT NULL,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                  ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_theme_token (theme_slug, token_key),
  INDEX idx_theme (theme_slug)
) ENGINE=InnoDB;
```

### 6.2 Extend existing `site_settings`

No schema change — just add new rows:

```sql
INSERT INTO site_settings (setting_key, setting_value) VALUES
('active_theme_slug',  'editorial-medical'),
('custom_css',         ''),
('dark_mode_enabled',  'false'),
('logo_url',           ''),
('favicon_url',        '/favicon.ico');
```

### 6.3 Resolution logic

When the backend serves `GET /api/v1/theme`:

```
1. Read `active_theme_slug` from site_settings        → "editorial-medical"
2. Load themes WHERE slug = active_theme_slug          → row with `tokens` JSON
3. Parse tokens JSON                                   → base token map
4. Load theme_customizations WHERE theme_slug = X      → override rows
5. For each override, set base[key] = override.value   → final token map
6. Read `custom_css` setting                           → append as raw CSS
7. Return { tokens: {...}, custom_css: "..." }
```

This means the **base preset is never mutated**. Customizations are layered on top, so the admin can always click "Reset to default" and the original theme returns.

### 6.4 Seed data

Five preset themes will be seeded via SQL (see [section 9](#9-preset-themes)).

---

## 7. API Design

### 7.1 Public endpoint — fetch current theme

```
GET /api/v1/theme
```

**Response:**
```json
{
  "data": {
    "slug": "editorial-medical",
    "name": "Editorial Medical",
    "is_dark": false,
    "tokens": {
      "color.brand.primary": "#0f4c5c",
      "color.brand.accent":  "#c47a3d",
      "color.surface.background": "#faf8f3",
      "color.text.primary":  "#161514",
      "font.family.display": "Fraunces",
      "font.family.body":    "DM Sans",
      "radius.medium":       "0.75rem",
      "...": "..."
    },
    "branding": {
      "site_name": "Prof. Dr. Maksuda Farida Akhtar (Mili)",
      "tagline":   "MBBS · FCPS (Urology)",
      "logo_url":  null,
      "favicon_url": "/favicon.ico"
    },
    "custom_css": "/* admin-added CSS */"
  }
}
```

Cache: `Cache-Control: public, max-age=60, stale-while-revalidate=300`

### 7.2 Public endpoint — list available preset themes

```
GET /api/v1/theme/presets
```

**Response:**
```json
{
  "data": [
    {
      "slug": "editorial-medical",
      "name": "Editorial Medical",
      "description": "Warm, serif-led, magazine-style. Default theme.",
      "is_dark": false,
      "preview_image": "/theme-previews/editorial-medical.jpg"
    },
    { "slug": "clinical-modern",   "name": "Clinical Modern",   "...": "..." },
    { "slug": "warm-caregiver",    "name": "Warm Caregiver",    "...": "..." },
    { "slug": "professional-dark", "name": "Professional Dark", "...": "..." },
    { "slug": "bengali-heritage",  "name": "Bengali Heritage",  "...": "..." }
  ]
}
```

### 7.3 Admin endpoints (JWT-required)

#### Switch active theme

```
PATCH /api/v1/admin/theme
Authorization: Bearer <jwt>
Content-Type: application/json

{ "slug": "clinical-modern" }
```

**Behavior:**
- Updates `site_settings.active_theme_slug`
- Does NOT touch customizations — they remain associated with their original theme
- Returns the new resolved theme

#### Customize a single token

```
PATCH /api/v1/admin/theme/customize
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "overrides": {
    "color.brand.primary": "#1e3a8a",
    "font.family.display": "Playfair Display"
  }
}
```

**Behavior:**
- Upserts rows in `theme_customizations` for the currently active theme
- Validates: token keys must exist in the schema, values must be syntactically valid CSS values
- Returns updated theme

#### Reset customizations

```
POST /api/v1/admin/theme/reset
Authorization: Bearer <jwt>
```

**Behavior:**
- Deletes all rows in `theme_customizations` for the active theme
- Theme reverts to the preset's original tokens

#### Update branding

```
PATCH /api/v1/admin/branding
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "site_name": "Prof. Dr. Maksuda Farida Akhtar (Mili)",
  "tagline":   "MBBS · FCPS (Urology)",
  "logo_url":  "/uploads/logo.png",
  "favicon_url": "/uploads/favicon.ico"
}
```

#### Custom CSS

```
PATCH /api/v1/admin/theme/custom-css
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "css": ".hero { background: linear-gradient(...); }"
}
```

**Security note:** CSS is sanitized — no `@import`, no `url()` pointing to external domains, no `behavior:` (IE relic). Max length: 50 KB.

### 7.4 Response after every change

Every admin mutation returns the **new resolved theme** so the editor UI updates instantly without a second fetch.

### 7.5 Revalidation trigger

After any admin mutation, backend fires a webhook to Vercel:
```
POST https://drtapan.com/api/revalidate?secret=XXX&path=/
```
This purges the ISR cache so all visitors get the new theme within seconds (rather than waiting for the 60s revalidation window).

---

## 8. Frontend Integration

### 8.1 The key insight: CSS variables + Tailwind

Tailwind colors are normally hardcoded:
```ts
// Before (current state)
colors: {
  clinical: { DEFAULT: '#0f4c5c', dark: '#0a3744' }
}
```

For dynamic theming, switch them to reference CSS variables:
```ts
// After (theme-able)
colors: {
  clinical: {
    DEFAULT: 'var(--color-brand-primary)',
    dark:    'var(--color-brand-primary-dark)',
    light:   'var(--color-brand-primary-light)',
    tint:    'var(--color-brand-primary-tint)',
  }
}
```

This way, `bg-clinical` continues to work everywhere — but the actual color comes from a runtime CSS variable.

### 8.2 Generating the CSS at SSR time

In `app/layout.tsx`, fetch the theme and inject a `<style>` tag:

```tsx
// Pseudocode — illustrates the pattern
export default async function RootLayout({ children }) {
  const theme = await api.getTheme();   // fetched at SSR / ISR time
  const css = tokensToCss(theme.tokens); // converts dot keys to CSS variables

  return (
    <html>
      <head>
        <style id="theme-vars" dangerouslySetInnerHTML={{ __html: css }} />
        {theme.custom_css && (
          <style id="theme-custom-css" dangerouslySetInnerHTML={{ __html: theme.custom_css }} />
        )}
      </head>
      <body>{children}</body>
    </html>
  );
}
```

Generated CSS looks like:
```css
:root {
  --color-brand-primary: #0f4c5c;
  --color-brand-primary-dark: #0a3744;
  --color-surface-background: #faf8f3;
  --color-text-primary: #161514;
  --font-family-display: 'Fraunces', Georgia, serif;
  --font-family-body: 'DM Sans', system-ui, sans-serif;
  --radius-medium: 0.75rem;
  /* ... ~50 variables */
}
```

### 8.3 Font loading strategy

Fonts can't be loaded the same way as colors (they need `<link>` tags or `next/font` imports). Two approaches:

**A) Curated font list (recommended)**

Pre-import the 5–10 supported fonts via `next/font` once in `layout.tsx`. The theme picks one by name. New fonts require code change.

```tsx
import { Fraunces, DM_Sans, Playfair_Display, Inter, Lora, Manrope } from 'next/font/google';

// All available, only one applied via CSS variable based on theme
const fraunces = Fraunces({ variable: '--font-fraunces', subsets: ['latin'] });
// ... etc
```

The active theme sets `--font-family-display: var(--font-fraunces)` (or whichever).

**B) Dynamic Google Fonts (more flexible, slower)**

Backend returns the font name → frontend dynamically loads it via `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=...">`. Slower first paint, but supports any Google Font.

**Recommendation:** Start with approach A (curated list). Add approach B as a future enhancement.

### 8.4 No FOUC guarantee

Because CSS variables are injected during SSR (server-rendered into the HTML), the very first paint already has the correct theme. No client-side flicker.

### 8.5 Dark mode

A theme can declare `is_dark: true`. The frontend reads this and adds `class="dark"` on `<html>`. Existing Tailwind dark mode utilities (e.g., `dark:bg-clinical`) keep working.

For future: a user toggle (light/dark) per session, stored in localStorage. The active theme has both light and dark variants in its tokens.

---

## 9. Preset Themes

Five preset themes ship with the system. Each is defined as a JSON file in `02-backend/themes/` and seeded into the `themes` table on first deploy.

### 9.1 Editorial Medical (default)

- **Mood:** Warm, refined, magazine-like. Current default.
- **Display font:** Fraunces (transitional serif)
- **Body font:** DM Sans
- **Primary:** Deep teal `#0f4c5c`
- **Accent:** Warm amber `#c47a3d`
- **Background:** Off-white paper `#faf8f3`

### 9.2 Clinical Modern

- **Mood:** Clean, minimalist, very modern hospital aesthetic
- **Display font:** Manrope
- **Body font:** Inter
- **Primary:** Confident blue `#1e40af`
- **Accent:** Cool mint `#10b981`
- **Background:** Pure white `#ffffff`

### 9.3 Warm Caregiver

- **Mood:** Soft, approachable, family-doctor warmth
- **Display font:** Lora
- **Body font:** Nunito
- **Primary:** Deep terracotta `#b45309`
- **Accent:** Sage green `#65a30d`
- **Background:** Cream `#fef9f0`

### 9.4 Professional Dark

- **Mood:** Modern, premium, calming dark UI
- **Display font:** Playfair Display
- **Body font:** DM Sans
- **Primary:** Soft gold `#d4af37`
- **Accent:** Electric blue `#3b82f6`
- **Background:** Near-black `#0a0a0a`
- **Text:** Off-white `#e5e5e5`
- **is_dark:** true

### 9.5 Bengali Heritage

- **Mood:** Locally rooted, festive yet professional, Bengali cultural notes
- **Display font:** Playfair Display (English) + Hind Siliguri (Bengali)
- **Body font:** Hind Siliguri (good for both Bengali and Latin)
- **Primary:** Sindoor red `#b91c1c`
- **Accent:** Gold `#ca8a04`
- **Background:** Soft cream `#fffbeb`

### 9.6 JSON file structure

Each theme lives at `02-backend/themes/<slug>.json`:

```json
{
  "slug": "editorial-medical",
  "name": "Editorial Medical",
  "description": "Warm, serif-led, magazine-style. Default theme for Dr. Mili.",
  "is_dark": false,
  "tokens": {
    "color.brand.primary":        "#0f4c5c",
    "color.brand.primary-dark":   "#0a3744",
    "color.brand.primary-light":  "#1a6b80",
    "color.brand.primary-tint":   "#e6f0f3",
    "color.brand.accent":         "#c47a3d",
    "color.brand.accent-dark":    "#9a5e2c",
    "color.surface.background":   "#faf8f3",
    "color.surface.warm":         "#f3efe7",
    "color.surface.cream":        "#ece6d8",
    "color.text.primary":         "#161514",
    "color.text.soft":            "#2a2825",
    "color.text.muted":           "#5a554f",
    "color.text.subtle":          "#8b857d",
    "color.text.inverse":         "#faf8f3",
    "color.status.success":       "#0f5132",
    "color.status.warning":       "#c47a3d",
    "color.status.error":         "#d65d51",
    "color.status.info":          "#0f4c5c",
    "color.border.default":       "rgba(22,21,20,0.10)",
    "color.border.strong":        "rgba(22,21,20,0.20)",
    "font.family.display":        "Fraunces",
    "font.family.body":           "DM Sans",
    "font.weight.body":           "400",
    "font.weight.medium":         "500",
    "font.weight.bold":           "700",
    "font.size.base":             "1rem",
    "font.letter-spacing.display":"-0.025em",
    "font.line-height.body":      "1.6",
    "font.line-height.display":   "1.05",
    "space.unit":                 "0.25rem",
    "container.max-width":        "80rem",
    "container.padding":          "1.5rem",
    "section.padding-y":          "6rem",
    "radius.small":               "0.375rem",
    "radius.medium":              "0.75rem",
    "radius.large":               "1.25rem",
    "radius.full":                "9999px",
    "border.width.default":       "1px",
    "border.width.thick":         "2px",
    "shadow.small":               "0 1px 2px rgba(22,21,20,0.05)",
    "shadow.medium":              "0 4px 12px rgba(22,21,20,0.08)",
    "shadow.large":               "0 12px 40px rgba(22,21,20,0.12)",
    "shadow.brand":               "0 8px 30px rgba(15,76,92,0.25)",
    "motion.duration.fast":       "150ms",
    "motion.duration.normal":     "300ms",
    "motion.duration.slow":       "600ms",
    "motion.easing.standard":     "cubic-bezier(0.4, 0, 0.2, 1)"
  }
}
```

On backend startup, a small loader reads all `*.json` files from `themes/` and upserts them into the `themes` table. This way themes are version-controlled in git but also stored in DB.

---

## 10. Admin Panel — Theme Editor

This UI lives in the **separate admin app** (deferred per project plan). Spec for when it's built:

### 10.1 Screens

#### Screen 1: Theme Picker
- Grid of preset theme cards (preview image, name, description)
- Active theme has a checkmark
- "Activate" button on each non-active theme
- "Customize" button on active theme → opens Screen 2

#### Screen 2: Customizer
Three-column layout:
- **Left sidebar (collapsible):** Token tree organized by category
  - Colors
    - Brand
    - Surface
    - Text
    - Status
    - Border
  - Typography
  - Spacing
  - Borders & Radii
  - Shadows
  - Motion
  - Branding
- **Center:** Live preview iframe pointing to staging URL
- **Right sidebar:** Inspector for the selected token
  - Color picker (for color tokens)
  - Font dropdown (for font.family.* tokens — from curated list)
  - Number + unit input (for size/space tokens)
  - Raw text input fallback for advanced tokens
  - "Reset to preset" button

#### Screen 3: Branding
- Form fields:
  - Site name (text)
  - Tagline (text)
  - Logo (file upload → /uploads/)
  - Favicon (file upload)
  - OG image (file upload)
- Save button

#### Screen 4: Custom CSS
- Code editor (Monaco or CodeMirror)
- Syntax highlighting for CSS
- Save button
- Warning: "Custom CSS can break your site. Test in preview first."

### 10.2 UX behaviors

- **Live preview** — every token change triggers an iframe refresh (debounced 500ms)
- **Unsaved changes** banner — "You have unsaved customizations. Discard / Save"
- **Reset confirmation** — "Reset all customizations? This cannot be undone."
- **Theme activate confirmation** — "Switch to Clinical Modern? Your current customizations will be saved with Editorial Medical and can be restored later."

### 10.3 Tech recommendation

- React + Vite (separate small SPA)
- TanStack Query for API state
- Form library: React Hook Form
- Color picker: `react-colorful`
- Code editor: Monaco Editor
- Hosted at `admin.drtapan.com`, login-gated

---

## 11. Caching & Performance

### 11.1 The challenge

Theme tokens are fetched on every page render. We don't want to hammer the backend.

### 11.2 Caching layers

```
┌─────────────────────────────────────────────────────────┐
│  Visitor browser     — HTML cached client-side          │
│  ↑                                                       │
│  Vercel Edge         — ISR cache (60s revalidate)       │
│  ↑                                                       │
│  Next.js fetch       — { next: { revalidate: 60 } }     │
│  ↑                                                       │
│  Backend response    — Cache-Control: max-age=60, SWR   │
│  ↑                                                       │
│  Rust in-memory      — Theme cached in a Mutex/RwLock   │
│  ↑                                                       │
│  MySQL                                                   │
└─────────────────────────────────────────────────────────┘
```

### 11.3 Cache invalidation

When admin makes a change:
1. Backend invalidates its in-memory cache for `/api/v1/theme`
2. Backend calls Vercel revalidate webhook: `POST /api/revalidate?secret=...&path=/`
3. Vercel purges all ISR cache for the site
4. Next visitor regenerates pages with new theme

Total propagation time: typically **2–5 seconds**.

### 11.4 ETag support (optional)

`GET /api/v1/theme` returns an `ETag` header derived from the theme + customizations updated_at timestamps. Next.js can use this to short-circuit unchanged responses.

---

## 12. Implementation Phases

### Phase 1 — MVP (1 week)
- ✅ Database schema (`themes`, `theme_customizations`)
- ✅ Seed 2 themes (Editorial Medical + Clinical Modern)
- ✅ `GET /api/v1/theme` endpoint
- ✅ `PATCH /api/v1/admin/theme` to switch active theme (no per-token override yet)
- ✅ Frontend: refactor `tailwind.config.ts` to use CSS variables
- ✅ Frontend: SSR injection of CSS variables in `layout.tsx`
- ✅ Manual theme switch via SQL `UPDATE site_settings ...`
- 🚫 No admin UI yet — use SQL or curl

### Phase 2 — Customization (1 week)
- ✅ `theme_customizations` resolution logic
- ✅ `PATCH /api/v1/admin/theme/customize` endpoint
- ✅ `POST /api/v1/admin/theme/reset` endpoint
- ✅ Seed remaining 3 themes (Warm Caregiver, Professional Dark, Bengali Heritage)
- ✅ Vercel revalidate webhook integration

### Phase 3 — Admin UI (2 weeks)
- ✅ Separate admin app (React + Vite)
- ✅ Theme picker screen
- ✅ Customizer with color pickers
- ✅ Live preview iframe
- ✅ Branding form with file uploads
- ✅ Custom CSS editor

### Phase 4 — Polish (1 week)
- ✅ Curated font list (load via `next/font`)
- ✅ Dark mode toggle (per-theme `is_dark`)
- ✅ Theme preview images
- ✅ Export/import theme JSON
- ✅ Audit log of changes

**Total estimated effort: 5 weeks of focused work**

---

## 13. Migration from Current Hardcoded Design

The current `03-frontend/tailwind.config.ts` has hardcoded hex values. Migration is mechanical:

### Step 1: Add CSS variables to `globals.css`

```css
:root {
  /* These are placeholder defaults — at runtime they'll be overwritten
     by the SSR-injected <style> tag based on the active theme. */
  --color-brand-primary:        #0f4c5c;
  --color-brand-primary-dark:   #0a3744;
  --color-brand-primary-light:  #1a6b80;
  --color-brand-primary-tint:   #e6f0f3;
  --color-brand-accent:         #c47a3d;
  --color-brand-accent-dark:    #9a5e2c;
  --color-surface-background:   #faf8f3;
  --color-surface-warm:         #f3efe7;
  --color-text-primary:         #161514;
  --color-text-soft:            #2a2825;
  --color-text-muted:           #5a554f;
  --color-text-subtle:          #8b857d;
  --color-status-error:         #d65d51;
  --radius-medium:              0.75rem;
  --font-family-display:        'Fraunces', Georgia, serif;
  --font-family-body:           'DM Sans', system-ui, sans-serif;
  /* ... etc */
}
```

### Step 2: Refactor `tailwind.config.ts`

Replace every hex with `var(--color-*)`:

```ts
// Before
ink: { DEFAULT: '#161514', soft: '#2a2825' }
// After
ink: { DEFAULT: 'var(--color-text-primary)', soft: 'var(--color-text-soft)' }
```

Existing class names (`bg-clinical`, `text-ink`, etc.) keep working unchanged.

### Step 3: Inject SSR CSS in `layout.tsx`

```tsx
const theme = await api.getTheme();
const cssVars = Object.entries(theme.tokens)
  .map(([k, v]) => `--${k.replace(/\./g, '-')}: ${v};`)
  .join('\n');

// inject inside <head>
<style dangerouslySetInnerHTML={{ __html: `:root { ${cssVars} }` }} />
```

### Step 4: Verify visually

After migration, the site looks **identical** to before (because the default theme matches the previous hardcoded values). Only difference: now it's swappable.

### Step 5: Test theme switch

```sql
UPDATE site_settings SET setting_value = 'clinical-modern' WHERE setting_key = 'active_theme_slug';
```

Refresh the site — should now be blue/white instead of teal/amber.

---

## 14. Future Enhancements

| Idea | Priority | Effort |
|---|---|---|
| **User-toggleable dark mode** (separate from theme dark flag) | Medium | 1 day |
| **Locale-aware themes** — show Bengali Heritage for Bengali visitors | Low | 2 days |
| **Theme marketplace** — install community themes by URL | Low | 1 week |
| **A/B theme testing** — show different themes to %s of visitors | Low | 1 week |
| **Per-page theme overrides** — blog uses Theme A, services use Theme B | Low | 3 days |
| **Logo upload + auto color extraction** — extracts brand colors from uploaded logo | Medium | 3 days |
| **Theme export** — admin downloads current theme + customizations as a JSON file | Medium | 1 day |
| **Theme import** — admin uploads a JSON file to install a new theme | Medium | 1 day |
| **Accessibility checker** — warn if color contrast fails WCAG AA | High | 2 days |
| **Live collaboration** — multiple admins editing theme simultaneously | Low | 1 week |
| **Mobile-only token overrides** — different values for mobile viewport | Low | 3 days |
| **Tailwind plugin generation** — generate a Tailwind plugin file from theme | Low | 2 days |

---

## 15. Risks & Trade-offs

### Risk 1: FOUC on cold cache
**Issue:** If the theme API is slow and ISR cache is cold, first paint might use stale theme.
**Mitigation:** Backend in-memory caching + Vercel ISR. Theme API response stays under 50ms.

### Risk 2: Theme breaks layout
**Issue:** Admin sets `radius.medium: 99rem` (silly value) → all cards turn into giant blobs.
**Mitigation:** Validation on save (numeric tokens have min/max ranges). Always offer "Reset to preset."

### Risk 3: Custom CSS XSS
**Issue:** Custom CSS could include `<style>{}; </style><script>...` if not sanitized.
**Mitigation:** Strip `<` and `>` from custom_css. Wrap in CSP that disallows inline scripts.

### Risk 4: Tailwind class purge breaks
**Issue:** Tailwind JIT only generates classes it sees in source. New theme tokens won't generate new classes.
**Mitigation:** Theme system works by **swapping CSS variable values**, not generating new classes. Class names stay the same; only their resolved values change. No JIT issue.

### Risk 5: SEO impact
**Issue:** Search engines might render a half-themed page if SSR is slow.
**Mitigation:** Theme is fetched and injected synchronously during SSR — never lazy-loaded.

### Trade-off: Performance cost
Each page now does an extra fetch (theme). **Cost:** ~30ms added to SSR cold renders. **Worth it?** Yes — ISR + caching keeps the actual cost negligible (<1% of total render time).

### Trade-off: Complexity
The codebase now has a layer of indirection (variables instead of values). **Cost:** Slightly harder for new devs. **Mitigation:** This doc + clear naming.

### Trade-off: Limited customization range
We expose ~50 tokens, not arbitrary CSS. **Cost:** Admins can't change everything. **Why:** Constrained design space prevents the doctor from accidentally creating a Comic-Sans-on-purple disaster. WordPress made the same trade-off (Customizer is constrained; full freedom requires editing PHP).

---

## 16. Glossary

| Term | Definition |
|---|---|
| **Token** | A single design value (one color, one font, one radius). |
| **Theme** | A complete, named bundle of tokens forming a coherent look. |
| **Preset** | A theme that ships with the system, defined in code (JSON). |
| **Customization** | A per-token override applied on top of an active theme. |
| **Active theme** | The theme currently shown to all visitors. |
| **FOUC** | Flash of Unstyled Content — the brief moment a page renders with wrong styles before correcting. |
| **ISR** | Incremental Static Regeneration — Next.js's caching strategy that regenerates pages in the background. |
| **JIT** | Just-in-Time — Tailwind's compilation mode that generates classes on demand. |
| **WCAG AA** | Web Content Accessibility Guidelines (color contrast standard). |
| **CSS variable** | A custom property defined as `--name: value;` and referenced via `var(--name)`. |
| **Tailwind config** | The `tailwind.config.ts` file that defines colors, spacing, fonts available as utility classes. |

---

## Appendix A — Comparison to Common CMS Theming

| Feature | WordPress | Wix | Squarespace | **Our system** |
|---|---|---|---|---|
| Preset themes | ✅ many | ✅ many | ✅ many | ✅ 5 |
| Token-level customization | ✅ (limited) | ✅ | ✅ | ✅ all ~50 tokens |
| Live preview | ✅ Customizer | ✅ | ✅ | ✅ planned |
| Custom CSS | ✅ | ✅ Premium | ✅ Premium | ✅ |
| Code edit access | ✅ (Editor / FTP) | ❌ | ❌ | ✅ (full repo) |
| Self-hostable | ✅ | ❌ | ❌ | ✅ |
| Open source | ✅ | ❌ | ❌ | ✅ (your code) |
| Cost / month | $5+ hosting | $14+ | $16+ | $5 Railway |

---

## Appendix B — File Layout (when implemented)

```
dr-tapan-website/
├── 01-database/
│   └── migrations/
│       └── 0002_themes.sql              ← NEW: themes + theme_customizations tables
├── 02-backend/
│   ├── themes/                          ← NEW: preset theme JSON files
│   │   ├── editorial-medical.json
│   │   ├── clinical-modern.json
│   │   ├── warm-caregiver.json
│   │   ├── professional-dark.json
│   │   └── bengali-heritage.json
│   └── src/
│       ├── handlers/
│       │   └── theme.rs                 ← NEW: theme endpoints
│       ├── services/
│       │   └── theme_loader.rs          ← NEW: loads JSON files into DB
│       └── models.rs                    ← extend with Theme, ThemeCustomization
├── 03-frontend/
│   ├── app/
│   │   └── layout.tsx                   ← MODIFIED: SSR theme injection
│   ├── lib/
│   │   ├── api.ts                       ← extend with getTheme()
│   │   └── theme.ts                     ← NEW: tokensToCss() helper
│   └── tailwind.config.ts               ← MODIFIED: use var(--*) refs
└── 04-admin/                            ← NEW separate app
    ├── src/
    │   ├── pages/
    │   │   ├── ThemePicker.tsx
    │   │   ├── Customizer.tsx
    │   │   ├── Branding.tsx
    │   │   └── CustomCSS.tsx
    │   └── components/
    │       ├── ColorPicker.tsx
    │       ├── FontPicker.tsx
    │       └── LivePreview.tsx
    └── package.json
```

---

## Appendix C — Example Curl Walkthrough

Once implemented, here's the full lifecycle from terminal:

```bash
# 1. View current theme
curl https://api.drtapan.com/api/v1/theme

# 2. List available presets
curl https://api.drtapan.com/api/v1/theme/presets

# 3. Login as admin
TOKEN=$(curl -X POST https://api.drtapan.com/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@drtapan.com","password":"..."}' | jq -r '.data.token')

# 4. Switch to Clinical Modern theme
curl -X PATCH https://api.drtapan.com/api/v1/admin/theme \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"slug":"clinical-modern"}'

# 5. Customize the primary color
curl -X PATCH https://api.drtapan.com/api/v1/admin/theme/customize \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"overrides":{"color.brand.primary":"#dc2626"}}'

# 6. Reset all customizations
curl -X POST https://api.drtapan.com/api/v1/admin/theme/reset \
  -H "Authorization: Bearer $TOKEN"

# 7. Verify
curl https://api.drtapan.com/api/v1/theme | jq '.data.tokens["color.brand.primary"]'
```

---

## Appendix D — Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-05-18 | Use CSS variables, not Tailwind class generation | Tailwind JIT doesn't generate classes for runtime values; CSS variables work cleanly |
| 2026-05-18 | Store tokens as JSON, not separate columns | Schema flexibility — adding new tokens doesn't need DDL changes |
| 2026-05-18 | Curated font list (not arbitrary Google Fonts) | Avoids slow font loading and `next/font` complications |
| 2026-05-18 | Separate admin app (not in main Next.js) | Doctor's request; keeps public site lean, admin can use different framework |
| 2026-05-18 | 5 preset themes for v1 | Enough variety, not overwhelming. Bengali Heritage adds local relevance |

---

**End of document.**

For implementation questions or to start Phase 1, see `02-backend/README.md` and the migration steps in [Section 13](#13-migration-from-current-hardcoded-design).
