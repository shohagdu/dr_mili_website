use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use validator::Validate;

// ============================================================
// APPOINTMENTS
// ============================================================
#[derive(Debug, Serialize, FromRow)]
pub struct Appointment {
    pub id: u64,
    pub patient_name: String,
    pub phone: String,
    pub email: Option<String>,
    pub age: Option<u16>,
    pub gender: Option<String>,
    pub problem_summary: String,
    pub preferred_date: NaiveDate,
    pub preferred_slot: String,
    pub status: String,
    pub admin_notes: Option<String>,
    pub source: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize, Validate)]
pub struct CreateAppointmentInput {
    #[validate(length(min = 2, max = 120, message = "Name must be 2–120 characters"))]
    pub patient_name: String,
    #[validate(length(min = 7, max = 20, message = "Phone must be 7–20 characters"))]
    pub phone: String,
    #[validate(email(message = "Invalid email"))]
    pub email: Option<String>,
    #[validate(range(min = 1, max = 130))]
    pub age: Option<u16>,
    pub gender: Option<String>,
    #[validate(length(min = 5, max = 2000, message = "Please describe your problem (5–2000 chars)"))]
    pub problem_summary: String,
    pub preferred_date: NaiveDate,
    #[validate(length(min = 1, max = 20))]
    pub preferred_slot: String,
}

#[derive(Debug, Deserialize, Validate)]
pub struct UpdateAppointmentInput {
    pub status: Option<String>,
    pub admin_notes: Option<String>,
}

// ============================================================
// CONTACT
// ============================================================
#[derive(Debug, Serialize, FromRow)]
pub struct ContactMessage {
    pub id: u64,
    pub name: String,
    pub email: Option<String>,
    pub phone: Option<String>,
    pub subject: Option<String>,
    pub message: String,
    pub is_read: bool,
    pub is_archived: bool,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize, Validate)]
pub struct CreateContactInput {
    #[validate(length(min = 2, max = 120))]
    pub name: String,
    #[validate(email)]
    pub email: Option<String>,
    pub phone: Option<String>,
    pub subject: Option<String>,
    #[validate(length(min = 5, max = 4000))]
    pub message: String,
}

// ============================================================
// SERVICES
// ============================================================
#[derive(Debug, Serialize, FromRow)]
pub struct Service {
    pub id: u64,
    pub slug: String,
    pub title: String,
    pub category: String,
    pub short_description: String,
    pub full_content: String,
    pub icon: Option<String>,
    pub cover_image: Option<String>,
    pub meta_title: Option<String>,
    pub meta_description: Option<String>,
    pub display_order: i32,
    pub is_published: bool,
}

#[derive(Debug, Serialize, FromRow)]
pub struct AdminService {
    pub id: u64,
    pub slug: String,
    pub title: String,
    pub category: String,
    pub short_description: String,
    pub full_content: String,
    pub icon: Option<String>,
    pub cover_image: Option<String>,
    pub meta_title: Option<String>,
    pub meta_description: Option<String>,
    pub display_order: i32,
    pub is_published: bool,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Deserialize, Validate)]
pub struct CreateServiceInput {
    #[validate(length(min = 1, max = 120))]
    pub slug: String,
    #[validate(length(min = 1, max = 200))]
    pub title: String,
    #[validate(length(min = 1, max = 80))]
    pub category: String,
    #[validate(length(min = 1, max = 300))]
    pub short_description: String,
    pub full_content: String,
    pub icon: Option<String>,
    pub cover_image: Option<String>,
    pub meta_title: Option<String>,
    pub meta_description: Option<String>,
    pub display_order: Option<i32>,
    pub is_published: Option<bool>,
}

#[derive(Debug, Deserialize, Validate, Default)]
pub struct UpdateServiceInput {
    #[validate(length(min = 1, max = 120))]
    pub slug: Option<String>,
    #[validate(length(min = 1, max = 200))]
    pub title: Option<String>,
    #[validate(length(min = 1, max = 80))]
    pub category: Option<String>,
    #[validate(length(min = 1, max = 300))]
    pub short_description: Option<String>,
    pub full_content: Option<String>,
    pub icon: Option<String>,
    pub cover_image: Option<String>,
    pub meta_title: Option<String>,
    pub meta_description: Option<String>,
    pub display_order: Option<i32>,
    pub is_published: Option<bool>,
}

// ============================================================
// BLOG
// ============================================================
#[derive(Debug, Serialize, FromRow)]
pub struct BlogPostSummary {
    pub id: u64,
    pub slug: String,
    pub title: String,
    pub excerpt: String,
    pub cover_image: Option<String>,
    pub author: String,
    pub tags: Option<String>,
    pub reading_time_minutes: Option<i32>,
    pub published_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, FromRow)]
pub struct BlogPost {
    pub id: u64,
    pub slug: String,
    pub title: String,
    pub excerpt: String,
    pub content: String,
    pub cover_image: Option<String>,
    pub author: String,
    pub tags: Option<String>,
    pub meta_title: Option<String>,
    pub meta_description: Option<String>,
    pub reading_time_minutes: Option<i32>,
    pub view_count: u32,
    pub published_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, FromRow)]
pub struct AdminBlogPost {
    pub id: u64,
    pub slug: String,
    pub title: String,
    pub excerpt: String,
    pub content: String,
    pub cover_image: Option<String>,
    pub author: String,
    pub tags: Option<String>,
    pub meta_title: Option<String>,
    pub meta_description: Option<String>,
    pub reading_time_minutes: Option<i32>,
    pub view_count: u32,
    pub is_published: bool,
    pub published_at: Option<DateTime<Utc>>,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Deserialize, Validate)]
pub struct CreateBlogPostInput {
    #[validate(length(min = 1, max = 180))]
    pub slug: String,
    #[validate(length(min = 1, max = 200))]
    pub title: String,
    #[validate(length(min = 1, max = 500))]
    pub excerpt: String,
    pub content: String,
    pub cover_image: Option<String>,
    #[validate(length(min = 1, max = 120))]
    pub author: String,
    pub tags: Option<String>,
    pub meta_title: Option<String>,
    pub meta_description: Option<String>,
    pub reading_time_minutes: Option<i32>,
    pub is_published: Option<bool>,
}

#[derive(Debug, Deserialize, Validate, Default)]
pub struct UpdateBlogPostInput {
    #[validate(length(min = 1, max = 180))]
    pub slug: Option<String>,
    #[validate(length(min = 1, max = 200))]
    pub title: Option<String>,
    #[validate(length(min = 1, max = 500))]
    pub excerpt: Option<String>,
    pub content: Option<String>,
    pub cover_image: Option<String>,
    #[validate(length(min = 1, max = 120))]
    pub author: Option<String>,
    pub tags: Option<String>,
    pub meta_title: Option<String>,
    pub meta_description: Option<String>,
    pub reading_time_minutes: Option<i32>,
    pub is_published: Option<bool>,
}

// ============================================================
// FAQ
// ============================================================
#[derive(Debug, Serialize, FromRow)]
pub struct Faq {
    pub id: u64,
    pub question: String,
    pub answer: String,
    pub category: Option<String>,
    pub display_order: i32,
}

// ============================================================
// TESTIMONIAL
// ============================================================
#[derive(Debug, Serialize, FromRow)]
pub struct Testimonial {
    pub id: u64,
    pub patient_name: String,
    pub patient_age: Option<u16>,
    pub location: Option<String>,
    pub rating: u8,
    pub message: String,
    pub treatment_for: Option<String>,
    pub display_order: i32,
}

#[derive(Debug, Serialize, FromRow)]
pub struct AdminTestimonial {
    pub id: u64,
    pub patient_name: String,
    pub patient_age: Option<u16>,
    pub location: Option<String>,
    pub rating: u8,
    pub message: String,
    pub treatment_for: Option<String>,
    pub is_published: bool,
    pub consent_given: bool,
    pub display_order: i32,
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Deserialize, Validate)]
pub struct CreateTestimonialInput {
    #[validate(length(min = 1, max = 120))]
    pub patient_name: String,
    #[validate(range(min = 1, max = 130))]
    pub patient_age: Option<u16>,
    pub location: Option<String>,
    #[validate(range(min = 1, max = 5))]
    pub rating: u8,
    #[validate(length(min = 1, max = 4000))]
    pub message: String,
    pub treatment_for: Option<String>,
    pub is_published: Option<bool>,
    pub consent_given: Option<bool>,
    pub display_order: Option<i32>,
}

#[derive(Debug, Deserialize, Validate, Default)]
pub struct UpdateTestimonialInput {
    #[validate(length(min = 1, max = 120))]
    pub patient_name: Option<String>,
    #[validate(range(min = 1, max = 130))]
    pub patient_age: Option<u16>,
    pub location: Option<String>,
    #[validate(range(min = 1, max = 5))]
    pub rating: Option<u8>,
    #[validate(length(min = 1, max = 4000))]
    pub message: Option<String>,
    pub treatment_for: Option<String>,
    pub is_published: Option<bool>,
    pub consent_given: Option<bool>,
    pub display_order: Option<i32>,
}

// ============================================================
// ADMIN USER & AUTH
// ============================================================
#[derive(Debug, FromRow)]
pub struct AdminUser {
    pub id: u64,
    pub email: String,
    pub password_hash: String,
    pub full_name: String,
    pub role: String,
    pub is_active: bool,
}

#[derive(Debug, Deserialize, Validate)]
pub struct LoginInput {
    #[validate(email)]
    pub email: String,
    #[validate(length(min = 8, max = 128))]
    pub password: String,
}

#[derive(Debug, Serialize)]
pub struct LoginResponse {
    pub token: String,
    pub user: AdminUserPublic,
}

#[derive(Debug, Serialize)]
pub struct AdminUserPublic {
    pub id: u64,
    pub email: String,
    pub full_name: String,
    pub role: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct JwtClaims {
    pub sub: u64,           // user id
    pub email: String,
    pub role: String,
    pub exp: usize,         // expiry timestamp
    pub iat: usize,         // issued at
}

// ============================================================
// SITE SETTINGS
// ============================================================
#[derive(Debug, Serialize, FromRow)]
pub struct SiteSetting {
    pub setting_key: String,
    pub setting_value: String,
}

#[derive(Debug, Deserialize, Validate)]
pub struct UpsertSettingInput {
    #[validate(length(min = 1, max = 80))]
    pub setting_key: String,
    pub setting_value: String,
}

#[derive(Debug, Deserialize)]
pub struct BulkSettingsInput {
    pub settings: std::collections::HashMap<String, String>,
}

// ============================================================
// DYNAMIC THEME SYSTEM
// ============================================================
/// A preset theme row. `tokens` is a flat JSON object of
/// "color.clinical" -> "#2d5bff" style entries.
#[derive(Debug, Serialize, FromRow)]
pub struct Theme {
    pub slug: String,
    pub name: String,
    pub description: Option<String>,
    pub is_dark: bool,
    pub preview_image: Option<String>,
    pub display_order: i32,
    pub tokens: serde_json::Value,
}

/// Lightweight preset summary for the theme picker (no token blob).
#[derive(Debug, Serialize, FromRow)]
pub struct ThemeSummary {
    pub slug: String,
    pub name: String,
    pub description: Option<String>,
    pub is_dark: bool,
    pub preview_image: Option<String>,
}

#[derive(Debug, FromRow)]
pub struct ThemeCustomization {
    pub token_key: String,
    pub token_value: String,
}

/// PATCH /admin/theme — switch the active preset.
#[derive(Debug, Deserialize, Validate)]
pub struct SwitchThemeInput {
    #[validate(length(min = 1, max = 80))]
    pub slug: String,
}

/// PATCH /admin/theme/customize — upsert per-token overrides for the
/// currently active theme.
#[derive(Debug, Deserialize)]
pub struct CustomizeThemeInput {
    pub overrides: std::collections::HashMap<String, String>,
}

// ============================================================
// DOCTOR PROFILE (single-doctor CMS)
// ============================================================
#[derive(Debug, Serialize, FromRow)]
pub struct Doctor {
    pub id: u64,
    pub user_id: Option<u64>,
    pub name: String,
    pub slug_name: Option<String>,
    pub picture: Option<String>,
    pub qualifications: Option<String>,
    pub special_training: Option<String>,
    pub positions: Option<String>,
    pub hero_tag: Option<String>,
    pub stat_experience: Option<String>,
    pub stat_publications: Option<String>,
    pub stat_patients: Option<String>,
    pub stat_success_rate: Option<String>,
    pub expertise: Option<serde_json::Value>,
    pub chambers: Option<serde_json::Value>,
    pub doctor_profile: Option<String>,
    pub mobile: Option<String>,
    pub email: Option<String>,
    pub facebook: Option<String>,
    pub twitter: Option<String>,
    pub instagram: Option<String>,
    pub linkedin: Option<String>,
    pub tiktok: Option<String>,
    pub youtube: Option<String>,
    pub display_position: Option<i32>,
    pub is_active: i8,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Deserialize, Validate, Default)]
pub struct UpdateDoctorInput {
    #[validate(length(min = 1, max = 255))]
    pub name: Option<String>,
    pub slug_name: Option<String>,
    pub picture: Option<String>,
    pub qualifications: Option<String>,
    pub special_training: Option<String>,
    pub positions: Option<String>,
    pub hero_tag: Option<String>,
    pub stat_experience: Option<String>,
    pub stat_publications: Option<String>,
    pub stat_patients: Option<String>,
    pub stat_success_rate: Option<String>,
    pub expertise: Option<serde_json::Value>,
    pub chambers: Option<serde_json::Value>,
    pub doctor_profile: Option<String>,
    pub mobile: Option<String>,
    pub email: Option<String>,
    pub facebook: Option<String>,
    pub twitter: Option<String>,
    pub instagram: Option<String>,
    pub linkedin: Option<String>,
    pub tiktok: Option<String>,
    pub youtube: Option<String>,
    pub display_position: Option<i32>,
    pub is_active: Option<i8>,
}

// ============================================================
// WEBPAGE CONTENTS (typed CMS rows: Why Choose, About, Picture, Video, ...)
// ============================================================
#[derive(Debug, Serialize, FromRow)]
pub struct WebpageContent {
    pub id: u64,
    #[sqlx(rename = "type")]
    #[serde(rename = "type")]
    pub type_: u8,
    pub icon: Option<String>,
    pub title: String,
    pub short_description: Option<String>,
    pub description: Option<String>,
    pub storage_type: Option<String>,
    pub file_path: Option<String>,
    pub display_position: u32,
    pub is_highlight_item: u8,
    pub is_active: u8,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Deserialize, Validate)]
pub struct CreateContentInput {
    #[serde(rename = "type")]
    pub type_: u8,
    pub icon: Option<String>,
    #[validate(length(min = 1, max = 255))]
    pub title: String,
    pub short_description: Option<String>,
    pub description: Option<String>,
    pub storage_type: Option<String>,
    pub file_path: Option<String>,
    pub display_position: Option<u32>,
    pub is_highlight_item: Option<u8>,
    pub is_active: Option<u8>,
}

#[derive(Debug, Deserialize, Validate, Default)]
pub struct UpdateContentInput {
    #[serde(rename = "type")]
    pub type_: Option<u8>,
    pub icon: Option<String>,
    pub title: Option<String>,
    pub short_description: Option<String>,
    pub description: Option<String>,
    pub storage_type: Option<String>,
    pub file_path: Option<String>,
    pub display_position: Option<u32>,
    pub is_highlight_item: Option<u8>,
    pub is_active: Option<u8>,
}
