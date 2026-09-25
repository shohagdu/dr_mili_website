use actix_web::{web, HttpResponse};
use serde_json::json;
use validator::Validate;

use crate::errors::{ApiError, ApiResult};
use crate::handlers::theme::resolve_active_theme;
use crate::models::{CustomizeThemeInput, SwitchThemeInput};
use crate::AppState;

/// PATCH /api/v1/admin/theme — switch the active preset theme.
/// Customizations stay associated with their own theme, so switching
/// back later restores them.
pub async fn switch_theme(
    state: web::Data<AppState>,
    input: web::Json<SwitchThemeInput>,
) -> ApiResult<HttpResponse> {
    input.validate().map_err(|e| ApiError::Validation(e.to_string()))?;
    let slug = input.into_inner().slug;

    // Reject unknown slugs so the site never points at a missing theme.
    let exists =
        sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM themes WHERE slug = ? AND is_active = TRUE")
            .bind(&slug)
            .fetch_one(&state.db)
            .await?;
    if exists == 0 {
        return Err(ApiError::NotFound(format!("Theme '{slug}' not found")));
    }

    sqlx::query(
        "INSERT INTO site_settings (setting_key, setting_value) VALUES ('active_theme_slug', ?) \
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)",
    )
    .bind(&slug)
    .execute(&state.db)
    .await?;

    let data = resolve_active_theme(&state).await?;
    Ok(HttpResponse::Ok().json(json!({ "data": data })))
}

/// PATCH /api/v1/admin/theme/customize — upsert per-token overrides for
/// the currently active theme.
pub async fn customize(
    state: web::Data<AppState>,
    input: web::Json<CustomizeThemeInput>,
) -> ApiResult<HttpResponse> {
    let overrides = input.into_inner().overrides;
    if overrides.is_empty() {
        let data = resolve_active_theme(&state).await?;
        return Ok(HttpResponse::Ok().json(json!({ "data": data })));
    }

    let active_slug =
        sqlx::query_scalar::<_, String>("SELECT setting_value FROM site_settings WHERE setting_key = 'active_theme_slug'")
            .fetch_optional(&state.db)
            .await?
            .unwrap_or_else(|| "clinical-blue".to_string());

    let mut tx = state.db.begin().await?;
    for (key, value) in overrides {
        if key.is_empty() || key.len() > 120 {
            return Err(ApiError::Validation(format!("Invalid token key: {key}")));
        }
        // Light sanity guard — reject values containing CSS-breaking chars.
        if value.len() > 500 || value.contains('{') || value.contains('}') || value.contains(';') {
            return Err(ApiError::Validation(format!("Invalid token value for {key}")));
        }
        sqlx::query(
            "INSERT INTO theme_customizations (theme_slug, token_key, token_value) VALUES (?, ?, ?) \
             ON DUPLICATE KEY UPDATE token_value = VALUES(token_value)",
        )
        .bind(&active_slug)
        .bind(&key)
        .bind(&value)
        .execute(&mut *tx)
        .await?;
    }
    tx.commit().await?;

    let data = resolve_active_theme(&state).await?;
    Ok(HttpResponse::Ok().json(json!({ "data": data })))
}

/// POST /api/v1/admin/theme/reset — clear all customizations for the
/// active theme, reverting it to the preset defaults.
pub async fn reset(state: web::Data<AppState>) -> ApiResult<HttpResponse> {
    let active_slug =
        sqlx::query_scalar::<_, String>("SELECT setting_value FROM site_settings WHERE setting_key = 'active_theme_slug'")
            .fetch_optional(&state.db)
            .await?
            .unwrap_or_else(|| "clinical-blue".to_string());

    sqlx::query("DELETE FROM theme_customizations WHERE theme_slug = ?")
        .bind(&active_slug)
        .execute(&state.db)
        .await?;

    let data = resolve_active_theme(&state).await?;
    Ok(HttpResponse::Ok().json(json!({ "data": data })))
}
