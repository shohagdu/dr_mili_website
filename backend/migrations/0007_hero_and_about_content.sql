-- ============================================================
-- 0007 — Homepage hero + About section copy
-- Source: resource/dr-touhid-belal-tapan-website-content.md
--         (Hero "Option 1 — Trust & Authority Focused")
-- ============================================================
-- Hero lives in webpage_contents type 9 (single row, updated in place).
-- The About page intro is webpage_contents type 2 with is_highlight_item=1;
-- the "Background" paragraphs come from doctors.doctor_profile (see 0006),
-- so here we only seed the intro headline + lead. Safe to re-run.

-- ------------------------------------------------------------
-- Homepage hero (type 9). title: wrap a phrase in *asterisks* to
-- colour it; \n is a manual line break.
-- ------------------------------------------------------------
UPDATE webpage_contents
SET
  icon = 'Specialist Urologist',
  title = 'Expert *Urology Care*\nYou Can Trust',
  short_description = 'With over 16 years of clinical experience, Dr. Mili offers advanced diagnosis and treatment for kidney stones, prostate problems, urinary tract disorders, and male urological health — combining modern medical expertise with compassionate, patient-centered care.'
WHERE type = 9
  AND id = (SELECT id FROM (SELECT MIN(id) AS id FROM webpage_contents WHERE type = 9) AS t);

-- ------------------------------------------------------------
-- About page intro (type 2, highlighted). Provides the About H1
-- (title) and the lead paragraph (short_description). Inserted only
-- if no highlighted About row already exists.
-- ------------------------------------------------------------
INSERT INTO webpage_contents
  (type, title, short_description, display_position, is_highlight_item, is_active)
SELECT
  2,
  'Specialist Urologist, Surgeon & Educator',
  'With more than 16 years of experience, Dr. Mili diagnoses, treats, and surgically manages diseases of the kidney, urinary tract, prostate, and male reproductive system — serving as Associate Professor of Urology at NIKDU and Consultant at the Centre for Kidney Diseases & Urology Hospital, Shyamoli.',
  0, 1, 1
WHERE NOT EXISTS (
  SELECT 1 FROM webpage_contents w WHERE w.type = 2 AND w.is_highlight_item = 1
);
