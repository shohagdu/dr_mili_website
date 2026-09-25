use actix_web::{web, HttpResponse};
use serde_json::{json, Map, Value};
use validator::Validate;

use crate::errors::{ApiError, ApiResult};
use crate::models::{BulkSettingsInput, SiteSetting, UpsertSettingInput};
use crate::AppState;

/// GET /api/v1/admin/settings — all site settings as an object
pub async fn list(state: web::Data<AppState>) -> ApiResult<HttpResponse> {
    let settings = sqlx::query_as::<_, SiteSetting>(
        "SELECT setting_key, setting_value FROM site_settings ORDER BY setting_key ASC",
    )
    .fetch_all(&state.db)
    .await?;

    let mut obj = Map::new();
    for s in settings {
        obj.insert(s.setting_key, Value::String(s.setting_value));
    }
    Ok(HttpResponse::Ok().json(json!({ "data": obj })))
}

/// PUT /api/v1/admin/settings — bulk upsert (replaces values for keys in payload)
pub async fn bulk_upsert(
    state: web::Data<AppState>,
    input: web::Json<BulkSettingsInput>,
) -> ApiResult<HttpResponse> {
    let i = input.into_inner();
    if i.settings.is_empty() {
        return Ok(HttpResponse::Ok().json(json!({ "success": true, "updated": 0 })));
    }

    let mut tx = state.db.begin().await?;
    let mut count = 0u64;
    for (key, value) in i.settings {
        if key.is_empty() || key.len() > 80 {
            return Err(ApiError::Validation(format!("Invalid setting key: {key}")));
        }
        sqlx::query(
            r#"
            INSERT INTO site_settings (setting_key, setting_value)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
            "#,
        )
        .bind(&key)
        .bind(&value)
        .execute(&mut *tx)
        .await?;
        count += 1;
    }
    tx.commit().await?;

    Ok(HttpResponse::Ok().json(json!({ "success": true, "updated": count })))
}

/// POST /api/v1/admin/settings — create or update a single setting
pub async fn upsert(
    state: web::Data<AppState>,
    input: web::Json<UpsertSettingInput>,
) -> ApiResult<HttpResponse> {
    input.validate().map_err(|e| ApiError::Validation(e.to_string()))?;
    let i = input.into_inner();

    sqlx::query(
        r#"
        INSERT INTO site_settings (setting_key, setting_value)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
        "#,
    )
    .bind(&i.setting_key)
    .bind(&i.setting_value)
    .execute(&state.db)
    .await?;

    Ok(HttpResponse::Ok().json(json!({ "success": true })))
}

/// DELETE /api/v1/admin/settings/{key}
pub async fn delete(state: web::Data<AppState>, key: web::Path<String>) -> ApiResult<HttpResponse> {
    let result = sqlx::query("DELETE FROM site_settings WHERE setting_key = ?")
        .bind(key.into_inner())
        .execute(&state.db)
        .await?;
    if result.rows_affected() == 0 {
        return Err(ApiError::NotFound("Setting not found".to_string()));
    }
    Ok(HttpResponse::Ok().json(json!({ "success": true })))
}
