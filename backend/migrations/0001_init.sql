-- ============================================================
-- Prof. Dr. Maksuda Farida Akhtar (Mili) — Website Database Schema
-- MySQL 8.0+
-- ============================================================

CREATE DATABASE IF NOT EXISTS drtapan
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE drtapan;

-- ============================================================
-- 1. APPOINTMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS appointments (
  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  patient_name    VARCHAR(120) NOT NULL,
  phone           VARCHAR(20)  NOT NULL,
  email           VARCHAR(160) NULL,
  age             SMALLINT UNSIGNED NULL,
  gender          ENUM('male','female','other') NULL,
  problem_summary TEXT NOT NULL,
  preferred_date  DATE NOT NULL,
  preferred_slot  VARCHAR(20) NOT NULL,
  status          ENUM('pending','confirmed','completed','cancelled','no_show')
                    NOT NULL DEFAULT 'pending',
  admin_notes     TEXT NULL,
  source          VARCHAR(40) DEFAULT 'website',
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                    ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status_date (status, preferred_date),
  INDEX idx_phone (phone),
  INDEX idx_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. CONTACT MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS contact_messages (
  id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name        VARCHAR(120) NOT NULL,
  email       VARCHAR(160) NULL,
  phone       VARCHAR(20)  NULL,
  subject     VARCHAR(200) NULL,
  message     TEXT NOT NULL,
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  ip_address  VARCHAR(45)  NULL,
  user_agent  VARCHAR(255) NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_read (is_read, is_archived),
  INDEX idx_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. ADMIN USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id            BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  email         VARCHAR(160) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name     VARCHAR(120) NOT NULL,
  role          ENUM('admin','staff') NOT NULL DEFAULT 'staff',
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMP NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                  ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. SERVICES (kidney stone, prostate, UTI, etc.)
-- ============================================================
CREATE TABLE IF NOT EXISTS services (
  id                BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  slug              VARCHAR(120) UNIQUE NOT NULL,
  title             VARCHAR(200) NOT NULL,
  category          VARCHAR(80) NOT NULL,
  short_description VARCHAR(300) NOT NULL,
  full_content      LONGTEXT NOT NULL,
  icon              VARCHAR(50) NULL,
  cover_image       VARCHAR(500) NULL,
  meta_title        VARCHAR(160) NULL,
  meta_description  VARCHAR(300) NULL,
  display_order     INT NOT NULL DEFAULT 0,
  is_published      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                      ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_published_order (is_published, display_order),
  INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 5. BLOG POSTS
-- ============================================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id                   BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  slug                 VARCHAR(180) UNIQUE NOT NULL,
  title                VARCHAR(200) NOT NULL,
  excerpt              VARCHAR(500) NOT NULL,
  content              LONGTEXT NOT NULL,
  cover_image          VARCHAR(500) NULL,
  author               VARCHAR(120) NOT NULL
                         DEFAULT 'Prof. Dr. Maksuda Farida Akhtar (Mili)',
  tags                 VARCHAR(300) NULL,   -- comma-separated
  meta_title           VARCHAR(160) NULL,
  meta_description     VARCHAR(300) NULL,
  reading_time_minutes INT NULL,
  view_count           INT UNSIGNED NOT NULL DEFAULT 0,
  is_published         BOOLEAN NOT NULL DEFAULT FALSE,
  published_at         TIMESTAMP NULL,
  created_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                         ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_published_date (is_published, published_at DESC),
  INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 6. FAQS
-- ============================================================
CREATE TABLE IF NOT EXISTS faqs (
  id            BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  question      VARCHAR(400) NOT NULL,
  answer        TEXT NOT NULL,
  category      VARCHAR(80) NULL,
  display_order INT NOT NULL DEFAULT 0,
  is_published  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_category_order (category, display_order),
  INDEX idx_published (is_published)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 7. TESTIMONIALS
-- ============================================================
CREATE TABLE IF NOT EXISTS testimonials (
  id            BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  patient_name  VARCHAR(120) NOT NULL,
  patient_age   SMALLINT UNSIGNED NULL,
  location      VARCHAR(120) NULL,
  rating        TINYINT UNSIGNED NOT NULL,
  message       TEXT NOT NULL,
  treatment_for VARCHAR(120) NULL,
  is_published  BOOLEAN NOT NULL DEFAULT FALSE,
  consent_given BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_rating CHECK (rating BETWEEN 1 AND 5),
  INDEX idx_published_order (is_published, display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 8. SITE SETTINGS (clinic info, hours, etc.)
-- ============================================================
CREATE TABLE IF NOT EXISTS site_settings (
  setting_key   VARCHAR(80) PRIMARY KEY,
  setting_value TEXT NOT NULL,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                  ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
