pub mod admin;
pub mod admin_blog;
pub mod admin_content;
pub mod admin_doctor;
pub mod admin_services;
pub mod admin_settings;
pub mod admin_testimonials;
pub mod admin_theme;
pub mod appointments;
pub mod auth;
pub mod blog;
pub mod contact;
pub mod content;
pub mod doctor;
pub mod faqs;
pub mod services;
pub mod settings;
pub mod testimonials;
pub mod theme;
pub mod upload;

use actix_web::HttpResponse;
use serde_json::json;

/// Health check endpoint
pub async fn health() -> HttpResponse {
    HttpResponse::Ok().json(json!({
        "status": "ok",
        "service": "drtapan-api",
        "version": env!("CARGO_PKG_VERSION"),
    }))
}
