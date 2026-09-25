use actix_web::{web, HttpResponse};
use serde_json::{json, Map, Value};

use crate::errors::{ApiError, ApiResult};
use crate::models::{Theme, ThemeCustomization, ThemeSummary};
use crate::AppState;

/// Read a single site_settings value, falling back to `default`.
async fn setting_or(state: &AppState, key: &str, default: &str) -> String {
    sqlx::query_scalar::<_, String>("SELECT setting_value FROM site_settings WHERE setting_key = ?")
        .bind(key)
        .fetch_optional(&state.db)
        .await
        .ok()
        .flatten()
        .unwrap_or_else(|| default.to_string())
}

/// Resolve the active theme: load the preset's base tokens, layer the
/// per-token customizations on top, and attach custom CSS. Shared by the
/// public endpoint and every admin mutation (which echo the new state).
pub async fn resolve_active_theme(state: &AppState) -> ApiResult<Value> {
    let active_slug = setting_or(state, "active_theme_slug", "clinical-blue").await;

    // Load the preset; fall back to the first available theme if the
    // configured slug is missing (e.g. a deleted theme).
    let theme = sqlx::query_as::<_, Theme>(
        "SELECT slug, name, description, is_dark, preview_image, display_order, tokens \
         FROM themes WHERE slug = ? AND is_active = TRUE",
    )
    .bind(&active_slug)
    .fetch_optional(&state.db)
    .await?;

    let theme = match theme {
        Some(t) => t,
        None => sqlx::query_as::<_, Theme>(
            "SELECT slug, name, description, is_dark, preview_image, display_order, tokens \
             FROM themes WHERE is_active = TRUE ORDER BY display_order ASC LIMIT 1",
        )
        .fetch_optional(&state.db)
        .await?
        .ok_or_else(|| ApiError::NotFound("No themes are configured".into()))?,
    };

    // Base tokens from the preset.
    let mut tokens: Map<String, Value> = match theme.tokens {
        Value::Object(m) => m,
        _ => Map::new(),
    };

    // Layer customizations for this theme on top.
    let overrides = sqlx::query_as::<_, ThemeCustomization>(
        "SELECT token_key, token_value FROM theme_customizations WHERE theme_slug = ?",
    )
    .bind(&theme.slug)
    .fetch_all(&state.db)
    .await?;
    for o in overrides {
        tokens.insert(o.token_key, Value::String(o.token_value));
    }

    let custom_css = setting_or(state, "custom_css", "").await;

    Ok(json!({
        "slug": theme.slug,
        "name": theme.name,
        "is_dark": theme.is_dark,
        "tokens": tokens,
        "custom_css": custom_css,
    }))
}

/// GET /api/v1/theme — active theme tokens + custom CSS (public).
pub async fn get_active(state: web::Data<AppState>) -> ApiResult<HttpResponse> {
    let data = resolve_active_theme(&state).await?;
    Ok(HttpResponse::Ok()
        .insert_header((
            actix_web::http::header::CACHE_CONTROL,
            "public, max-age=60, stale-while-revalidate=300",
        ))
        .json(json!({ "data": data })))
}

/// GET /api/v1/theme/presets — list selectable preset themes (public).
pub async fn list_presets(state: web::Data<AppState>) -> ApiResult<HttpResponse> {
    let presets = sqlx::query_as::<_, ThemeSummary>(
        "SELECT slug, name, description, is_dark, preview_image \
         FROM themes WHERE is_active = TRUE ORDER BY display_order ASC",
    )
    .fetch_all(&state.db)
    .await?;

    let active_slug = setting_or(&state, "active_theme_slug", "clinical-blue").await;

    Ok(HttpResponse::Ok().json(json!({
        "data": { "active_slug": active_slug, "presets": presets }
    })))
}
