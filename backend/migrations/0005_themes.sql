-- ============================================================
-- 0005 — Dynamic Theme System
-- ============================================================
-- WordPress-style theming: preset themes (full token sets) plus
-- per-token overrides layered on top of the active theme. The
-- frontend turns these tokens into :root CSS variables at SSR time,
-- so the doctor can re-colour the whole site from the admin panel
-- with no code change or redeploy.
--
-- Token keys map 1:1 to CSS variables: "color.clinical" -> --color-clinical
-- (the frontend replaces '.' with '-'). Keys mirror the Tailwind palette
-- so the default theme reproduces the current hardcoded look exactly.

-- ------------------------------------------------------------
-- Preset theme definitions (seeded below, also editable in DB)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS themes (
  id            BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  slug          VARCHAR(80) UNIQUE NOT NULL,
  name          VARCHAR(120) NOT NULL,
  description   TEXT NULL,
  is_dark       BOOLEAN NOT NULL DEFAULT FALSE,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  tokens        JSON NOT NULL,
  preview_image VARCHAR(500) NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                  ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_active_order (is_active, display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Per-token overrides for a given theme (the "customizer" layer)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS theme_customizations (
  id            BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  theme_slug    VARCHAR(80) NOT NULL,
  token_key     VARCHAR(120) NOT NULL,
  token_value   TEXT NOT NULL,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                  ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_theme_token (theme_slug, token_key),
  INDEX idx_theme (theme_slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Theme-related site_settings rows
-- ------------------------------------------------------------
INSERT INTO site_settings (setting_key, setting_value) VALUES
  ('active_theme_slug', 'clinical-blue'),
  ('custom_css',        '')
ON DUPLICATE KEY UPDATE setting_value = setting_value;

-- ============================================================
-- Seed presets. token keys are identical across themes so any
-- theme can re-colour the whole site.
-- ============================================================

-- 1. Clinical Blue — current default look (vibrant medical blue)
INSERT INTO themes (slug, name, description, is_dark, display_order, tokens) VALUES
('clinical-blue', 'Clinical Blue',
 'Vibrant modern medical blue — the default look.', FALSE, 1,
 JSON_OBJECT(
   'color.ink', '#0f1b3d', 'color.ink-soft', '#1f2a4d', 'color.ink-muted', '#5b6378', 'color.ink-subtle', '#8b94a8',
   'color.paper', '#ffffff', 'color.paper-warm', '#f5f8ff', 'color.paper-cream', '#e7eeff',
   'color.clinical', '#2d5bff', 'color.clinical-dark', '#1e44d6', 'color.clinical-light', '#5b82ff', 'color.clinical-tint', '#e7eeff', 'color.clinical-deep', '#0b1f6b',
   'color.accent', '#06b6d4', 'color.accent-dark', '#0891b2', 'color.accent-light', '#67e8f9',
   'color.coral', '#ef4444'
 )),

-- 2. Editorial Medical — warm teal + amber, magazine feel
('editorial-medical', 'Editorial Medical',
 'Warm, serif-led, magazine style. Deep teal with warm amber accent.', FALSE, 2,
 JSON_OBJECT(
   'color.ink', '#161514', 'color.ink-soft', '#2a2825', 'color.ink-muted', '#5a554f', 'color.ink-subtle', '#8b857d',
   'color.paper', '#faf8f3', 'color.paper-warm', '#f3efe7', 'color.paper-cream', '#ece6d8',
   'color.clinical', '#0f4c5c', 'color.clinical-dark', '#0a3744', 'color.clinical-light', '#1a6b80', 'color.clinical-tint', '#e6f0f3', 'color.clinical-deep', '#0a3744',
   'color.accent', '#c47a3d', 'color.accent-dark', '#9a5e2c', 'color.accent-light', '#d99a63',
   'color.coral', '#d65d51'
 )),

-- 3. Warm Caregiver — soft terracotta + sage, family-doctor warmth
('warm-caregiver', 'Warm Caregiver',
 'Soft, approachable terracotta with sage green accent.', FALSE, 3,
 JSON_OBJECT(
   'color.ink', '#1c1917', 'color.ink-soft', '#292524', 'color.ink-muted', '#57534e', 'color.ink-subtle', '#a8a29e',
   'color.paper', '#fef9f0', 'color.paper-warm', '#fdf4e3', 'color.paper-cream', '#fae8c8',
   'color.clinical', '#b45309', 'color.clinical-dark', '#92400e', 'color.clinical-light', '#d97706', 'color.clinical-tint', '#fef3e2', 'color.clinical-deep', '#7c2d12',
   'color.accent', '#65a30d', 'color.accent-dark', '#4d7c0f', 'color.accent-light', '#84cc16',
   'color.coral', '#dc2626'
 )),

-- 4. Professional Dark — premium dark UI, soft gold + electric blue
('professional-dark', 'Professional Dark',
 'Modern, premium dark UI with soft gold and electric blue.', TRUE, 4,
 JSON_OBJECT(
   'color.ink', '#e5e5e5', 'color.ink-soft', '#d4d4d4', 'color.ink-muted', '#a3a3a3', 'color.ink-subtle', '#737373',
   'color.paper', '#0a0a0a', 'color.paper-warm', '#171717', 'color.paper-cream', '#1f1f1f',
   'color.clinical', '#d4af37', 'color.clinical-dark', '#b8941f', 'color.clinical-light', '#e6c757', 'color.clinical-tint', '#2a2a2a', 'color.clinical-deep', '#d4af37',
   'color.accent', '#3b82f6', 'color.accent-dark', '#2563eb', 'color.accent-light', '#60a5fa',
   'color.coral', '#f87171'
 )),

-- 5. Bengali Heritage — sindoor red + gold, locally rooted
('bengali-heritage', 'Bengali Heritage',
 'Locally rooted, festive yet professional — sindoor red with gold.', FALSE, 5,
 JSON_OBJECT(
   'color.ink', '#1c1917', 'color.ink-soft', '#292524', 'color.ink-muted', '#57534e', 'color.ink-subtle', '#a8a29e',
   'color.paper', '#fffbeb', 'color.paper-warm', '#fef9e7', 'color.paper-cream', '#fef3c7',
   'color.clinical', '#b91c1c', 'color.clinical-dark', '#991b1b', 'color.clinical-light', '#dc2626', 'color.clinical-tint', '#fef2f2', 'color.clinical-deep', '#7f1d1d',
   'color.accent', '#ca8a04', 'color.accent-dark', '#a16207', 'color.accent-light', '#eab308',
   'color.coral', '#dc2626'
 ))
ON DUPLICATE KEY UPDATE
  name = VALUES(name), description = VALUES(description),
  is_dark = VALUES(is_dark), display_order = VALUES(display_order),
  tokens = VALUES(tokens);
