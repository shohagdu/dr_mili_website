use actix_web::{web, HttpResponse};
use serde::Deserialize;
use serde_json::json;
use validator::Validate;

use crate::errors::{ApiError, ApiResult};
use crate::models::{AdminService, CreateServiceInput, UpdateServiceInput};
use crate::AppState;

const SELECT_COLS: &str = "id, slug, title, category, short_description, full_content, \
     icon, cover_image, meta_title, meta_description, display_order, is_published, \
     created_at, updated_at";

#[derive(Deserialize)]
pub struct ListQuery {
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

/// GET /api/v1/admin/services — all services (incl. unpublished)
pub async fn list(
    state: web::Data<AppState>,
    query: web::Query<ListQuery>,
) -> ApiResult<HttpResponse> {
    let limit = query.limit.unwrap_or(200).clamp(1, 500);
    let offset = query.offset.unwrap_or(0).max(0);

    let sql = format!(
        "SELECT {SELECT_COLS} FROM services ORDER BY display_order ASC, id ASC LIMIT ? OFFSET ?"
    );
    let rows = sqlx::query_as::<_, AdminService>(&sql)
        .bind(limit)
        .bind(offset)
        .fetch_all(&state.db)
        .await?;

    Ok(HttpResponse::Ok().json(json!({ "data": rows })))
}

/// GET /api/v1/admin/services/{id}
pub async fn get(state: web::Data<AppState>, id: web::Path<u64>) -> ApiResult<HttpResponse> {
    let sql = format!("SELECT {SELECT_COLS} FROM services WHERE id = ?");
    let row = sqlx::query_as::<_, AdminService>(&sql)
        .bind(id.into_inner())
        .fetch_optional(&state.db)
        .await?
        .ok_or_else(|| ApiError::NotFound("Service not found".to_string()))?;

    Ok(HttpResponse::Ok().json(json!({ "data": row })))
}

/// POST /api/v1/admin/services
pub async fn create(
    state: web::Data<AppState>,
    input: web::Json<CreateServiceInput>,
) -> ApiResult<HttpResponse> {
    input.validate().map_err(|e| ApiError::Validation(e.to_string()))?;
    let i = input.into_inner();

    let result = sqlx::query(
        r#"
        INSERT INTO services
            (slug, title, category, short_description, full_content, icon, cover_image,
             meta_title, meta_description, display_order, is_published)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        "#,
    )
    .bind(&i.slug)
    .bind(&i.title)
    .bind(&i.category)
    .bind(&i.short_description)
    .bind(&i.full_content)
    .bind(&i.icon)
    .bind(&i.cover_image)
    .bind(&i.meta_title)
    .bind(&i.meta_description)
    .bind(i.display_order.unwrap_or(0))
    .bind(i.is_published.unwrap_or(true))
    .execute(&state.db)
    .await?;

    Ok(HttpResponse::Created().json(json!({ "success": true, "id": result.last_insert_id() })))
}

/// PATCH /api/v1/admin/services/{id}
pub async fn update(
    state: web::Data<AppState>,
    id: web::Path<u64>,
    input: web::Json<UpdateServiceInput>,
) -> ApiResult<HttpResponse> {
    input.validate().map_err(|e| ApiError::Validation(e.to_string()))?;
    let id = id.into_inner();
    let i = input.into_inner();

    let result = sqlx::query(
        r#"
        UPDATE services SET
            slug              = COALESCE(?, slug),
            title             = COALESCE(?, title),
            category          = COALESCE(?, category),
            short_description = COALESCE(?, short_description),
            full_content      = COALESCE(?, full_content),
            icon              = COALESCE(?, icon),
            cover_image       = COALESCE(?, cover_image),
            meta_title        = COALESCE(?, meta_title),
            meta_description  = COALESCE(?, meta_description),
            display_order     = COALESCE(?, display_order),
            is_published      = COALESCE(?, is_published)
        WHERE id = ?
        "#,
    )
    .bind(&i.slug)
    .bind(&i.title)
    .bind(&i.category)
    .bind(&i.short_description)
    .bind(&i.full_content)
    .bind(&i.icon)
    .bind(&i.cover_image)
    .bind(&i.meta_title)
    .bind(&i.meta_description)
    .bind(i.display_order)
    .bind(i.is_published)
    .bind(id)
    .execute(&state.db)
    .await?;

    if result.rows_affected() == 0 {
        return Err(ApiError::NotFound("Service not found".to_string()));
    }
    Ok(HttpResponse::Ok().json(json!({ "success": true })))
}

/// DELETE /api/v1/admin/services/{id}
pub async fn delete(state: web::Data<AppState>, id: web::Path<u64>) -> ApiResult<HttpResponse> {
    let result = sqlx::query("DELETE FROM services WHERE id = ?")
        .bind(id.into_inner())
        .execute(&state.db)
        .await?;
    if result.rows_affected() == 0 {
        return Err(ApiError::NotFound("Service not found".to_string()));
    }
    Ok(HttpResponse::Ok().json(json!({ "success": true })))
}
