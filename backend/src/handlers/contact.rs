use actix_web::{web, HttpRequest, HttpResponse};
use serde_json::json;
use validator::Validate;

use crate::errors::{ApiError, ApiResult};
use crate::models::CreateContactInput;
use crate::AppState;

/// POST /api/v1/contact — contact form submission
pub async fn create(
    state: web::Data<AppState>,
    req: HttpRequest,
    input: web::Json<CreateContactInput>,
) -> ApiResult<HttpResponse> {
    input
        .validate()
        .map_err(|e| ApiError::Validation(e.to_string()))?;

    let ip = req
        .connection_info()
        .realip_remote_addr()
        .map(|s| s.to_string());

    let ua = req
        .headers()
        .get("User-Agent")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.chars().take(255).collect::<String>());

    sqlx::query!(
        r#"
        INSERT INTO contact_messages
            (name, email, phone, subject, message, ip_address, user_agent)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        "#,
        input.name,
        input.email,
        input.phone,
        input.subject,
        input.message,
        ip,
        ua,
    )
    .execute(&state.db)
    .await?;

    Ok(HttpResponse::Created().json(json!({
        "success": true,
        "data": { "message": "Thank you for your message. We will get back to you soon." }
    })))
}
