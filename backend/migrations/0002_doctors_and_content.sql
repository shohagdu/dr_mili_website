-- ============================================================
-- 0002 — Doctors profile + Webpage CMS content
-- ============================================================

-- Doctor profile (single-doctor site — first active row drives the public pages)
CREATE TABLE IF NOT EXISTS doctors (
  id                BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id           BIGINT UNSIGNED DEFAULT NULL,
  name              VARCHAR(255) NOT NULL,
  picture           VARCHAR(255) DEFAULT NULL,
  qualifications    VARCHAR(255) DEFAULT NULL,
  special_training  VARCHAR(255) DEFAULT NULL,
  positions         VARCHAR(255) DEFAULT NULL,
  hero_tag          VARCHAR(255) DEFAULT NULL,
  stat_experience   VARCHAR(255) DEFAULT NULL,
  stat_publications VARCHAR(255) DEFAULT NULL,
  stat_patients     VARCHAR(255) DEFAULT NULL,
  stat_success_rate VARCHAR(255) DEFAULT NULL,
  expertise         JSON DEFAULT NULL,
  chambers          JSON DEFAULT NULL,
  doctor_profile    TEXT DEFAULT NULL,
  mobile            VARCHAR(30) DEFAULT NULL,
  email             VARCHAR(150) DEFAULT NULL,
  facebook          VARCHAR(255) DEFAULT NULL,
  twitter           VARCHAR(255) DEFAULT NULL,
  instagram         VARCHAR(255) DEFAULT NULL,
  linkedin          VARCHAR(255) DEFAULT NULL,
  tiktok            VARCHAR(255) DEFAULT NULL,
  youtube           VARCHAR(255) DEFAULT NULL,
  display_position  INT DEFAULT 0,
  is_active         TINYINT NOT NULL DEFAULT 1 COMMENT '1=Active, 0=Inactive',
  created_by        INT DEFAULT NULL,
  created_ip        VARCHAR(45) DEFAULT NULL,
  updated_by        INT DEFAULT NULL,
  updated_ip        VARCHAR(45) DEFAULT NULL,
  created_at        TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_doctors_active_position (is_active, display_position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Typed CMS content (Why Choose, About, Pictures, Videos, etc.)
CREATE TABLE IF NOT EXISTS webpage_contents (
  id                 BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  type               TINYINT UNSIGNED NOT NULL COMMENT '1=Why Choose, 2=About Us, 3=Service, 4=Emergency Service, 5=FAQ, 6=Testimonial, 7=Picture, 8=Video',
  icon               VARCHAR(255) DEFAULT NULL,
  title              VARCHAR(255) NOT NULL,
  short_description  TEXT DEFAULT NULL,
  description        TEXT DEFAULT NULL,
  storage_type       VARCHAR(255) DEFAULT NULL COMMENT 'Used for type 7 (image) or 8 (video): 1=local upload, 2=external URL',
  file_path          VARCHAR(255) DEFAULT NULL COMMENT 'Relative path (uploads/xxx.jpg) or full URL',
  display_position   INT UNSIGNED NOT NULL DEFAULT 0,
  is_highlight_item  TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '1=Yes, 0=No',
  is_active          TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '1=Active, 2=Inactive, 3=Deleted',
  created_by         INT DEFAULT NULL,
  created_ip         VARCHAR(45) DEFAULT NULL,
  updated_by         INT DEFAULT NULL,
  updated_ip         VARCHAR(45) DEFAULT NULL,
  created_at         TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_content_type_active_pos (type, is_active, display_position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Seed: one doctor row carrying the current hardcoded values
-- ============================================================
INSERT INTO doctors (
  name, picture, qualifications, special_training, positions, hero_tag,
  stat_experience, stat_publications, stat_patients, stat_success_rate,
  expertise, chambers, doctor_profile, mobile, email, display_position, is_active
) VALUES (
  'Prof. Dr. Maksuda Farida Akhtar (Mili)',
  '/doctor-hero.svg',
  'MBBS, FCPS (Urology)',
  'Endourology, Laser Stone Surgery, Minimally Invasive Urological Surgery',
  'Consultant Urologist · Assistant Professor of Urology',
  'Creating a better tomorrow',
  '16+',
  '20+',
  '10,000+',
  '98%',
  JSON_ARRAY(
    'Kidney Stone Treatment',
    'Prostate Disease (BPH)',
    'Urinary Tract Infection (UTI)',
    'Male Infertility',
    'Erectile Dysfunction',
    'Endourology',
    'Laser Urology',
    'Minimally Invasive Urological Surgery'
  ),
  JSON_ARRAY(
    JSON_OBJECT(
      'name', 'CKD & Urology Hospital',
      'address', '32 Road No. 3, Shyamoli, Dhaka-1207, Bangladesh',
      'phones', JSON_ARRAY('+880 9611-530530', '+880 1777-685821'),
      'hours', 'Open 24 hours',
      'geo', JSON_OBJECT('lat', 23.7747, 'lng', 90.3618)
    )
  ),
  'Prof. Dr. Maksuda Farida Akhtar (Mili) is an FCPS-qualified urologist with over 16 years of experience treating complex kidney, prostate, and male-health conditions. Her practice focuses on clear communication and minimally invasive techniques — so patients understand their options and recover faster.',
  '+880 9611-530530',
  'info@drtapan.com',
  0,
  1
);
