use actix_web::{web, HttpResponse};
use serde::Deserialize;
use serde_json::json;

use crate::errors::{ApiError, ApiResult};
use crate::models::{BlogPost, BlogPostSummary};
use crate::AppState;

#[derive(Deserialize)]
pub struct ListQuery {
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

/// GET /api/v1/blog?limit=10&offset=0
pub async fn list(
    state: web::Data<AppState>,
    query: web::Query<ListQuery>,
) -> ApiResult<HttpResponse> {
    let limit = query.limit.unwrap_or(20).clamp(1, 100);
    let offset = query.offset.unwrap_or(0).max(0);

    let posts = sqlx::query_as::<_, BlogPostSummary>(
        r#"
        SELECT id, slug, title, excerpt, cover_image, author, tags,
               reading_time_minutes, published_at
        FROM blog_posts
        WHERE is_published = TRUE
        ORDER BY published_at DESC
        LIMIT ? OFFSET ?
        "#,
    )
    .bind(limit)
    .bind(offset)
    .fetch_all(&state.db)
    .await?;

    Ok(HttpResponse::Ok().json(json!({ "data": posts })))
}

/// GET /api/v1/blog/{slug}
pub async fn get_by_slug(
    state: web::Data<AppState>,
    slug: web::Path<String>,
) -> ApiResult<HttpResponse> {
    let slug = slug.into_inner();

    let post = sqlx::query_as::<_, BlogPost>(
        r#"
        SELECT id, slug, title, excerpt, content, cover_image, author, tags,
               meta_title, meta_description, reading_time_minutes,
               view_count, published_at
        FROM blog_posts
        WHERE slug = ? AND is_published = TRUE
        LIMIT 1
        "#,
    )
    .bind(&slug)
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| ApiError::NotFound("Blog post not found".to_string()))?;

    // Increment view count (fire-and-forget)
    let pool = state.db.clone();
    let post_id = post.id;
    tokio::spawn(async move {
        let _ = sqlx::query!("UPDATE blog_posts SET view_count = view_count + 1 WHERE id = ?", post_id)
            .execute(&pool)
            .await;
    });

    Ok(HttpResponse::Ok().json(json!({ "data": post })))
}
