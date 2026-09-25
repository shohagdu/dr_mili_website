-- ============================================================
-- 0004 — Doctor short display name (slug_name)
-- ============================================================
-- A short label (e.g. "Dr. Mili") used for the header brand,
-- footer brand, and the homepage hero card. Editable from the
-- admin Doctor profile instead of being derived in code.

ALTER TABLE doctors
  ADD COLUMN slug_name VARCHAR(255) DEFAULT NULL AFTER name;

UPDATE doctors SET slug_name = 'Dr. Mili' WHERE slug_name IS NULL;
