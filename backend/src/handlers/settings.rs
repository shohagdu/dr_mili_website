use actix_web::{web, HttpResponse};
use serde_json::{json, Map, Value};

use crate::errors::ApiResult;
use crate::models::SiteSetting;
use crate::AppState;

/// GET /api/v1/settings — returns all site settings as an object
pub async fn list(state: web::Data<AppState>) -> ApiResult<HttpResponse> {
    let settings = sqlx::query_as::<_, SiteSetting>(
        "SELECT setting_key, setting_value FROM site_settings",
    )
    .fetch_all(&state.db)
    .await?;

    let mut obj = Map::new();
    for s in settings {
        obj.insert(s.setting_key, Value::String(s.setting_value));
    }

    Ok(HttpResponse::Ok().json(json!({ "data": obj })))
}
