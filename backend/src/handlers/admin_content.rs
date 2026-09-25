use actix_web::{web, HttpResponse};
use serde::Deserialize;
use serde_json::json;
use validator::Validate;

use crate::errors::{ApiError, ApiResult};
use crate::models::{CreateContentInput, UpdateContentInput, WebpageContent};
use crate::AppState;

#[derive(Deserialize)]
pub struct ListQuery {
    #[serde(rename = "type")]
    pub type_: Option<u8>,
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

/// GET /api/v1/admin/content[?type=N]
pub async fn list(
    state: web::Data<AppState>,
    query: web::Query<ListQuery>,
) -> ApiResult<HttpResponse> {
    let limit = query.limit.unwrap_or(200).clamp(1, 500);
    let offset = query.offset.unwrap_or(0).max(0);

    let rows = if let Some(t) = query.type_ {
        sqlx::query_as::<_, WebpageContent>(
            r#"
            SELECT id, type, icon, title, short_description, description,
                   storage_type, file_path, display_position, is_highlight_item,
                   is_active, created_at, updated_at
            FROM webpage_contents
            WHERE type = ?
            ORDER BY display_position ASC, id ASC
            LIMIT ? OFFSET ?
            "#,
        )
        .bind(t)
        .bind(limit)
        .bind(offset)
        .fetch_all(&state.db)
        .await?
    } else {
        sqlx::query_as::<_, WebpageContent>(
            r#"
            SELECT id, type, icon, title, short_description, description,
                   storage_type, file_path, display_position, is_highlight_item,
                   is_active, created_at, updated_at
            FROM webpage_contents
            ORDER BY type ASC, display_position ASC, id ASC
            LIMIT ? OFFSET ?
            "#,
        )
        .bind(limit)
        .bind(offset)
        .fetch_all(&state.db)
        .await?
    };

    Ok(HttpResponse::Ok().json(json!({ "data": rows })))
}

/// GET /api/v1/admin/content/{id}
pub async fn get(state: web::Data<AppState>, id: web::Path<u64>) -> ApiResult<HttpResponse> {
    let row = sqlx::query_as::<_, WebpageContent>(
        r#"
        SELECT id, type, icon, title, short_description, description,
               storage_type, file_path, display_position, is_highlight_item,
               is_active, created_at, updated_at
        FROM webpage_contents WHERE id = ?
        "#,
    )
    .bind(id.into_inner())
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| ApiError::NotFound("Content not found".to_string()))?;

    Ok(HttpResponse::Ok().json(json!({ "data": row })))
}

/// POST /api/v1/admin/content
pub async fn create(
    state: web::Data<AppState>,
    input: web::Json<CreateContentInput>,
) -> ApiResult<HttpResponse> {
    input.validate().map_err(|e| ApiError::Validation(e.to_string()))?;
    let i = input.into_inner();

    let result = sqlx::query(
        r#"
        INSERT INTO webpage_contents
            (type, icon, title, short_description, description,
             storage_type, file_path, display_position, is_highlight_item, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        "#,
    )
    .bind(i.type_)
    .bind(&i.icon)
    .bind(&i.title)
    .bind(&i.short_description)
    .bind(&i.description)
    .bind(&i.storage_type)
    .bind(&i.file_path)
    .bind(i.display_position.unwrap_or(0))
    .bind(i.is_highlight_item.unwrap_or(0))
    .bind(i.is_active.unwrap_or(1))
    .execute(&state.db)
    .await?;

    Ok(HttpResponse::Created().json(json!({ "success": true, "id": result.last_insert_id() })))
}

/// PATCH /api/v1/admin/content/{id}
pub async fn update(
    state: web::Data<AppState>,
    id: web::Path<u64>,
    input: web::Json<UpdateContentInput>,
) -> ApiResult<HttpResponse> {
    input.validate().map_err(|e| ApiError::Validation(e.to_string()))?;
    let id = id.into_inner();
    let i = input.into_inner();

    let result = sqlx::query(
        r#"
        UPDATE webpage_contents SET
            type              = COALESCE(?, type),
            icon              = COALESCE(?, icon),
            title             = COALESCE(?, title),
            short_description = COALESCE(?, short_description),
            description       = COALESCE(?, description),
            storage_type      = COALESCE(?, storage_type),
            file_path         = COALESCE(?, file_path),
            display_position  = COALESCE(?, display_position),
            is_highlight_item = COALESCE(?, is_highlight_item),
            is_active         = COALESCE(?, is_active)
        WHERE id = ?
        "#,
    )
    .bind(i.type_)
    .bind(&i.icon)
    .bind(&i.title)
    .bind(&i.short_description)
    .bind(&i.description)
    .bind(&i.storage_type)
    .bind(&i.file_path)
    .bind(i.display_position)
    .bind(i.is_highlight_item)
    .bind(i.is_active)
    .bind(id)
    .execute(&state.db)
    .await?;

    if result.rows_affected() == 0 {
        return Err(ApiError::NotFound("Content not found".to_string()));
    }

    Ok(HttpResponse::Ok().json(json!({ "success": true })))
}

/// DELETE /api/v1/admin/content/{id}
pub async fn delete(state: web::Data<AppState>, id: web::Path<u64>) -> ApiResult<HttpResponse> {
    let result = sqlx::query("DELETE FROM webpage_contents WHERE id = ?")
        .bind(id.into_inner())
        .execute(&state.db)
        .await?;

    if result.rows_affected() == 0 {
        return Err(ApiError::NotFound("Content not found".to_string()));
    }

    Ok(HttpResponse::Ok().json(json!({ "success": true })))
}
