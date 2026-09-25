use actix_web::{web, HttpResponse};
use argon2::{password_hash::PasswordHash, Argon2, PasswordVerifier};
use chrono::{Duration, Utc};
use jsonwebtoken::{encode, EncodingKey, Header};
use serde_json::json;
use validator::Validate;

use crate::errors::{ApiError, ApiResult};
use crate::models::{AdminUser, AdminUserPublic, JwtClaims, LoginInput, LoginResponse};
use crate::AppState;

/// POST /api/v1/auth/login
pub async fn login(
    state: web::Data<AppState>,
    input: web::Json<LoginInput>,
) -> ApiResult<HttpResponse> {
    input
        .validate()
        .map_err(|e| ApiError::Validation(e.to_string()))?;

    let user = sqlx::query_as::<_, AdminUser>(
        r#"
        SELECT id, email, password_hash, full_name, role, is_active
        FROM admin_users
        WHERE email = ? AND is_active = TRUE
        LIMIT 1
        "#,
    )
    .bind(&input.email)
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| ApiError::Unauthorized("Invalid email or password".to_string()))?;

    // Verify password
    let parsed_hash = PasswordHash::new(&user.password_hash)
        .map_err(|_| ApiError::Internal("Invalid stored password hash".to_string()))?;

    Argon2::default()
        .verify_password(input.password.as_bytes(), &parsed_hash)
        .map_err(|_| ApiError::Unauthorized("Invalid email or password".to_string()))?;

    // Build JWT
    let now = Utc::now();
    let exp = now + Duration::hours(state.config.jwt_expiry_hours);

    let claims = JwtClaims {
        sub: user.id,
        email: user.email.clone(),
        role: user.role.clone(),
        iat: now.timestamp() as usize,
        exp: exp.timestamp() as usize,
    };

    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(state.config.jwt_secret.as_bytes()),
    )
    .map_err(|e| ApiError::Internal(format!("JWT encoding failed: {}", e)))?;

    // Update last login (fire-and-forget)
    let pool = state.db.clone();
    let user_id = user.id;
    tokio::spawn(async move {
        let _ = sqlx::query!("UPDATE admin_users SET last_login_at = NOW() WHERE id = ?", user_id)
            .execute(&pool)
            .await;
    });

    let response = LoginResponse {
        token,
        user: AdminUserPublic {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
        },
    };

    Ok(HttpResponse::Ok().json(json!({ "data": response })))
}
