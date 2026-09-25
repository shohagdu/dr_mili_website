-- ============================================================
-- 0003 — Homepage Hero Section CMS content (type = 9)
-- ============================================================
-- Adds a new webpage_contents type so the homepage hero can be
-- edited from the admin "Site Content" menu. Field mapping for
-- type 9 (Homepage Hero Section):
--   icon              -> small tag/badge text above the headline
--   title             -> headline (wrap a phrase in *asterisks* to
--                        colour it; use \n for a manual line break)
--   short_description -> subtitle paragraph
--   storage_type      -> 1 = local upload, 2 = external URL (portrait)
--   file_path         -> portrait image path / URL

-- Document the new type in the column comment.
ALTER TABLE webpage_contents
  MODIFY COLUMN type TINYINT UNSIGNED NOT NULL
  COMMENT '1=Why Choose, 2=About Us, 3=Service, 4=Emergency Service, 5=FAQ, 6=Testimonial, 7=Picture, 8=Video, 9=Homepage Hero Section';

-- Seed the current hardcoded hero copy as the single active hero row.
INSERT INTO webpage_contents
  (type, icon, title, short_description, storage_type, file_path,
   display_position, is_highlight_item, is_active)
VALUES (
  9,
  'Creating a better tomorrow',
  'Modern *gynecological care*\nyou can trust.',
  'Prof. Dr. Maksuda Farida Akhtar (Mili) is an FCPS-qualified urologist with over 16 years of experience treating complex kidney, prostate, and male-health conditions. Her practice focuses on clear communication and minimally invasive techniques — so patients understand their options and recover faster.',
  '2',
  '/doctor-hero.svg',
  0,
  1,
  1
);
