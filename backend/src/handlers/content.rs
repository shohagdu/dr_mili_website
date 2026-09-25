use actix_web::{web, HttpResponse};
use serde::Deserialize;
use serde_json::json;

use crate::errors::ApiResult;
use crate::models::WebpageContent;
use crate::AppState;

#[derive(Deserialize)]
pub struct ContentQuery {
    #[serde(rename = "type")]
    pub type_: Option<u8>,
    pub highlight: Option<u8>,
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

/// GET /api/v1/content?type=N[&highlight=1] — list active content rows of a type
pub async fn list(
    state: web::Data<AppState>,
    query: web::Query<ContentQuery>,
) -> ApiResult<HttpResponse> {
    let limit = query.limit.unwrap_or(100).clamp(1, 500);
    let offset = query.offset.unwrap_or(0).max(0);

    // Build query with optional filters — sqlx doesn't compose easily, so branch.
    let rows = match (query.type_, query.highlight) {
        (Some(t), Some(h)) => sqlx::query_as::<_, WebpageContent>(
            r#"
            SELECT id, type, icon, title, short_description, description,
                   storage_type, file_path, display_position, is_highlight_item,
                   is_active, created_at, updated_at
            FROM webpage_contents
            WHERE is_active = 1 AND type = ? AND is_highlight_item = ?
            ORDER BY display_position ASC, id ASC
            LIMIT ? OFFSET ?
            "#,
        )
        .bind(t)
        .bind(h)
        .bind(limit)
        .bind(offset)
        .fetch_all(&state.db)
        .await?,
        (Some(t), None) => sqlx::query_as::<_, WebpageContent>(
            r#"
            SELECT id, type, icon, title, short_description, description,
                   storage_type, file_path, display_position, is_highlight_item,
                   is_active, created_at, updated_at
            FROM webpage_contents
            WHERE is_active = 1 AND type = ?
            ORDER BY display_position ASC, id ASC
            LIMIT ? OFFSET ?
            "#,
        )
        .bind(t)
        .bind(limit)
        .bind(offset)
        .fetch_all(&state.db)
        .await?,
        _ => sqlx::query_as::<_, WebpageContent>(
            r#"
            SELECT id, type, icon, title, short_description, description,
                   storage_type, file_path, display_position, is_highlight_item,
                   is_active, created_at, updated_at
            FROM webpage_contents
            WHERE is_active = 1
            ORDER BY type ASC, display_position ASC, id ASC
            LIMIT ? OFFSET ?
            "#,
        )
        .bind(limit)
        .bind(offset)
        .fetch_all(&state.db)
        .await?,
    };

    Ok(HttpResponse::Ok().json(json!({ "data": rows })))
}
