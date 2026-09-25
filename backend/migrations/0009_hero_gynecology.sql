-- ============================================================
-- 0009 — Homepage hero headline: urological → gynecological care
-- ============================================================
-- Safe to re-run (pure UPDATE).

UPDATE webpage_contents
SET title = REPLACE(title, 'gynecological care', 'gynecological care')
WHERE type = 9;

-- Any other stored copy mentioning "urological care"
UPDATE webpage_contents
SET
  title             = REPLACE(title,             'urological care', 'gynecological care'),
  short_description = REPLACE(short_description, 'urological care', 'gynecological care'),
  description       = REPLACE(description,       'urological care', 'gynecological care');

UPDATE doctors
SET doctor_profile = REPLACE(doctor_profile, 'urological care', 'gynecological care');

UPDATE site_settings
SET setting_value = REPLACE(setting_value, 'urological care', 'gynecological care');
