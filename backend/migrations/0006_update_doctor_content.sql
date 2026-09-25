-- ============================================================
-- 0006 — Refresh doctor profile from approved website content
-- Source: resource/dr-touhid-belal-tapan-website-content.md
-- ============================================================
-- Updates the primary (first) doctor row with the verified positions,
-- chamber details, expanded expertise list, contact numbers and the
-- longer "About" profile copy. Safe to re-run (pure UPDATE).

UPDATE doctors
SET
  qualifications = 'MBBS, FCPS (Urology)',
  positions = 'Associate Professor of Urology, NIKDU · Consultant Urologist, CKDU Shyamoli',
  expertise = JSON_ARRAY(
    'Kidney stones and ureteral stones',
    'Prostate problems, including BPH (enlarged prostate)',
    'Urinary Tract Infections (UTIs) and pyelonephritis',
    'Bladder control problems and neurogenic bladder',
    'Hydronephrosis and ureteral stricture',
    'Erectile Dysfunction (ED) and Peyronie''s disease',
    'Epididymitis, orchitis, and testicular conditions',
    'Testicular cancer and other urologic cancers',
    'Cystocele and general urologic diseases'
  ),
  chambers = JSON_ARRAY(
    JSON_OBJECT(
      'name', 'Centre for Kidney Diseases & Urology Hospital',
      'address', 'House No. 32, Road No. 3, Shyamoli, Dhaka-1207, Bangladesh',
      'phones', JSON_ARRAY('01777-685821', '01777-685822', '02-9127306', '02-9127566'),
      'hours', 'Open 24 hours',
      'geo', JSON_OBJECT('lat', 23.7747, 'lng', 90.3618)
    )
  ),
  doctor_profile = CONCAT(
    'Prof. Dr. Maksuda Farida Akhtar (Mili) is one of Dhaka''s trusted urology specialists, with more than 16 years of experience dedicated to diagnosing, treating, and surgically managing diseases of the kidney, urinary tract, prostate, and male reproductive system. She currently serves as an Associate Professor of Urology at the National Institute of Kidney Diseases & Urology (NIKDU) — the country''s premier specialized institution for kidney and gynecological care — and practices as a Consultant at the Centre for Kidney Diseases & Urology Hospital (CKDU), Shyamoli, Dhaka.',
    '\n\n',
    'After completing her MBBS, Dr. Mili went on to earn her FCPS in Urology from the Bangladesh College of Physicians and Surgeons — a rigorous fellowship that established her expertise in both medical and surgical urology. Her academic position at NIKDU keeps her at the forefront of evolving treatment protocols, while her clinical work has helped thousands of patients regain comfort, health, and quality of life.',
    '\n\n',
    'Patients consistently describe Dr. Mili as attentive, thorough, and reassuring — a physician who takes the time to listen, explain conditions in plain language, and design treatment plans tailored to each individual.'
  ),
  mobile = '01777-685821'
WHERE id = (SELECT id FROM (SELECT MIN(id) AS id FROM doctors) AS t);
