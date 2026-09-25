use actix_web::{web, HttpResponse};
use serde_json::json;

use crate::errors::{ApiError, ApiResult};
use crate::models::Service;
use crate::AppState;

/// GET /api/v1/services — list all published services
pub async fn list(state: web::Data<AppState>) -> ApiResult<HttpResponse> {
    let services = sqlx::query_as::<_, Service>(
        r#"
        SELECT id, slug, title, category, short_description, full_content,
               icon, cover_image, meta_title, meta_description,
               display_order, is_published
        FROM services
        WHERE is_published = TRUE
        ORDER BY display_order ASC, id ASC
        "#,
    )
    .fetch_all(&state.db)
    .await?;

    Ok(HttpResponse::Ok().json(json!({ "data": services })))
}

/// GET /api/v1/services/{slug}
pub async fn get_by_slug(
    state: web::Data<AppState>,
    slug: web::Path<String>,
) -> ApiResult<HttpResponse> {
    let service = sqlx::query_as::<_, Service>(
        r#"
        SELECT id, slug, title, category, short_description, full_content,
               icon, cover_image, meta_title, meta_description,
               display_order, is_published
        FROM services
        WHERE slug = ? AND is_published = TRUE
        LIMIT 1
        "#,
    )
    .bind(slug.into_inner())
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| ApiError::NotFound("Service not found".to_string()))?;

    Ok(HttpResponse::Ok().json(json!({ "data": service })))
}
