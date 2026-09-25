-- ============================================================
-- 0008 — Rename doctor: Dr. Md. Touhid Belal Tapan → Prof. Dr. Maksuda Farida Akhtar (Mili)
-- ============================================================
-- Rewrites the doctor's name in content already stored in the DB.
-- Safe to re-run (pure UPDATE / REPLACE).

-- Doctor profile row
UPDATE doctors
SET
  name      = 'Prof. Dr. Maksuda Farida Akhtar (Mili)',
  slug_name = 'Dr. Mili',
  doctor_profile = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
    doctor_profile,
    'Dr. Md. Touhid Belal (Tapan)', 'Prof. Dr. Maksuda Farida Akhtar (Mili)'),
    'Dr. Md. Touhid Belal Tapan',   'Prof. Dr. Maksuda Farida Akhtar (Mili)'),
    'Dr. Tapan', 'Dr. Mili'),
    ' his ', ' her '),
    'His ',  'Her '),
    ' him ', ' her '),
    'He ',   'She ');

-- Homepage hero / about / other page blocks
UPDATE webpage_contents
SET
  title = REPLACE(REPLACE(REPLACE(title,
    'Dr. Md. Touhid Belal (Tapan)', 'Prof. Dr. Maksuda Farida Akhtar (Mili)'),
    'Dr. Md. Touhid Belal Tapan',   'Prof. Dr. Maksuda Farida Akhtar (Mili)'),
    'Dr. Tapan', 'Dr. Mili'),
  short_description = REPLACE(REPLACE(REPLACE(short_description,
    'Dr. Md. Touhid Belal (Tapan)', 'Prof. Dr. Maksuda Farida Akhtar (Mili)'),
    'Dr. Md. Touhid Belal Tapan',   'Prof. Dr. Maksuda Farida Akhtar (Mili)'),
    'Dr. Tapan', 'Dr. Mili'),
  description = REPLACE(REPLACE(REPLACE(description,
    'Dr. Md. Touhid Belal (Tapan)', 'Prof. Dr. Maksuda Farida Akhtar (Mili)'),
    'Dr. Md. Touhid Belal Tapan',   'Prof. Dr. Maksuda Farida Akhtar (Mili)'),
    'Dr. Tapan', 'Dr. Mili');

-- Services
UPDATE services
SET
  short_description = REPLACE(REPLACE(short_description, 'Dr. Md. Touhid Belal Tapan', 'Prof. Dr. Maksuda Farida Akhtar (Mili)'), 'Dr. Tapan', 'Dr. Mili'),
  full_content      = REPLACE(REPLACE(full_content,      'Dr. Md. Touhid Belal Tapan', 'Prof. Dr. Maksuda Farida Akhtar (Mili)'), 'Dr. Tapan', 'Dr. Mili'),
  meta_title        = REPLACE(REPLACE(meta_title,        'Dr. Md. Touhid Belal Tapan', 'Prof. Dr. Maksuda Farida Akhtar (Mili)'), 'Dr. Tapan', 'Dr. Mili'),
  meta_description  = REPLACE(REPLACE(meta_description,  'Dr. Md. Touhid Belal Tapan', 'Prof. Dr. Maksuda Farida Akhtar (Mili)'), 'Dr. Tapan', 'Dr. Mili');

-- Blog posts
UPDATE blog_posts
SET
  author           = REPLACE(REPLACE(author,           'Dr. Md. Touhid Belal Tapan', 'Prof. Dr. Maksuda Farida Akhtar (Mili)'), 'Dr. Tapan', 'Dr. Mili'),
  excerpt          = REPLACE(REPLACE(excerpt,          'Dr. Md. Touhid Belal Tapan', 'Prof. Dr. Maksuda Farida Akhtar (Mili)'), 'Dr. Tapan', 'Dr. Mili'),
  content          = REPLACE(REPLACE(content,          'Dr. Md. Touhid Belal Tapan', 'Prof. Dr. Maksuda Farida Akhtar (Mili)'), 'Dr. Tapan', 'Dr. Mili'),
  meta_title       = REPLACE(REPLACE(meta_title,       'Dr. Md. Touhid Belal Tapan', 'Prof. Dr. Maksuda Farida Akhtar (Mili)'), 'Dr. Tapan', 'Dr. Mili'),
  meta_description = REPLACE(REPLACE(meta_description, 'Dr. Md. Touhid Belal Tapan', 'Prof. Dr. Maksuda Farida Akhtar (Mili)'), 'Dr. Tapan', 'Dr. Mili');

-- FAQs, testimonials, site settings
UPDATE faqs
SET answer = REPLACE(REPLACE(answer, 'Dr. Md. Touhid Belal Tapan', 'Prof. Dr. Maksuda Farida Akhtar (Mili)'), 'Dr. Tapan', 'Dr. Mili');

UPDATE testimonials
SET message = REPLACE(REPLACE(message, 'Dr. Md. Touhid Belal Tapan', 'Prof. Dr. Maksuda Farida Akhtar (Mili)'), 'Dr. Tapan', 'Dr. Mili');

UPDATE site_settings
SET setting_value = REPLACE(REPLACE(setting_value, 'Dr. Md. Touhid Belal Tapan', 'Prof. Dr. Maksuda Farida Akhtar (Mili)'), 'Dr. Tapan', 'Dr. Mili');
