use actix_web::{web, HttpResponse};
use serde::Deserialize;
use serde_json::json;
use validator::Validate;

use crate::errors::{ApiError, ApiResult};
use crate::models::{AdminBlogPost, CreateBlogPostInput, UpdateBlogPostInput};
use crate::AppState;

const SELECT_COLS: &str = "id, slug, title, excerpt, content, cover_image, author, tags, \
     meta_title, meta_description, reading_time_minutes, view_count, is_published, \
     published_at, created_at, updated_at";

#[derive(Deserialize)]
pub struct ListQuery {
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

pub async fn list(
    state: web::Data<AppState>,
    query: web::Query<ListQuery>,
) -> ApiResult<HttpResponse> {
    let limit = query.limit.unwrap_or(200).clamp(1, 500);
    let offset = query.offset.unwrap_or(0).max(0);

    let sql = format!(
        "SELECT {SELECT_COLS} FROM blog_posts ORDER BY COALESCE(published_at, created_at) DESC LIMIT ? OFFSET ?"
    );
    let rows = sqlx::query_as::<_, AdminBlogPost>(&sql)
        .bind(limit)
        .bind(offset)
        .fetch_all(&state.db)
        .await?;

    Ok(HttpResponse::Ok().json(json!({ "data": rows })))
}

pub async fn get(state: web::Data<AppState>, id: web::Path<u64>) -> ApiResult<HttpResponse> {
    let sql = format!("SELECT {SELECT_COLS} FROM blog_posts WHERE id = ?");
    let row = sqlx::query_as::<_, AdminBlogPost>(&sql)
        .bind(id.into_inner())
        .fetch_optional(&state.db)
        .await?
        .ok_or_else(|| ApiError::NotFound("Blog post not found".to_string()))?;
    Ok(HttpResponse::Ok().json(json!({ "data": row })))
}

pub async fn create(
    state: web::Data<AppState>,
    input: web::Json<CreateBlogPostInput>,
) -> ApiResult<HttpResponse> {
    input.validate().map_err(|e| ApiError::Validation(e.to_string()))?;
    let i = input.into_inner();
    let publish = i.is_published.unwrap_or(false);

    let result = sqlx::query(
        r#"
        INSERT INTO blog_posts
            (slug, title, excerpt, content, cover_image, author, tags,
             meta_title, meta_description, reading_time_minutes, is_published, published_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, IF(?, CURRENT_TIMESTAMP, NULL))
        "#,
    )
    .bind(&i.slug)
    .bind(&i.title)
    .bind(&i.excerpt)
    .bind(&i.content)
    .bind(&i.cover_image)
    .bind(&i.author)
    .bind(&i.tags)
    .bind(&i.meta_title)
    .bind(&i.meta_description)
    .bind(i.reading_time_minutes)
    .bind(publish)
    .bind(publish)
    .execute(&state.db)
    .await?;

    Ok(HttpResponse::Created().json(json!({ "success": true, "id": result.last_insert_id() })))
}

pub async fn update(
    state: web::Data<AppState>,
    id: web::Path<u64>,
    input: web::Json<UpdateBlogPostInput>,
) -> ApiResult<HttpResponse> {
    input.validate().map_err(|e| ApiError::Validation(e.to_string()))?;
    let id = id.into_inner();
    let i = input.into_inner();

    // Set published_at to NOW when transitioning to published and no prior value;
    // clear it when un-publishing.
    let result = sqlx::query(
        r#"
        UPDATE blog_posts SET
            slug                 = COALESCE(?, slug),
            title                = COALESCE(?, title),
            excerpt              = COALESCE(?, excerpt),
            content              = COALESCE(?, content),
            cover_image          = COALESCE(?, cover_image),
            author               = COALESCE(?, author),
            tags                 = COALESCE(?, tags),
            meta_title           = COALESCE(?, meta_title),
            meta_description     = COALESCE(?, meta_description),
            reading_time_minutes = COALESCE(?, reading_time_minutes),
            is_published         = COALESCE(?, is_published),
            published_at = CASE
                WHEN ? IS NULL THEN published_at
                WHEN ? = TRUE  AND published_at IS NULL THEN CURRENT_TIMESTAMP
                WHEN ? = FALSE THEN NULL
                ELSE published_at
            END
        WHERE id = ?
        "#,
    )
    .bind(&i.slug)
    .bind(&i.title)
    .bind(&i.excerpt)
    .bind(&i.content)
    .bind(&i.cover_image)
    .bind(&i.author)
    .bind(&i.tags)
    .bind(&i.meta_title)
    .bind(&i.meta_description)
    .bind(i.reading_time_minutes)
    .bind(i.is_published)
    .bind(i.is_published)
    .bind(i.is_published)
    .bind(i.is_published)
    .bind(id)
    .execute(&state.db)
    .await?;

    if result.rows_affected() == 0 {
        return Err(ApiError::NotFound("Blog post not found".to_string()));
    }
    Ok(HttpResponse::Ok().json(json!({ "success": true })))
}

pub async fn delete(state: web::Data<AppState>, id: web::Path<u64>) -> ApiResult<HttpResponse> {
    let result = sqlx::query("DELETE FROM blog_posts WHERE id = ?")
        .bind(id.into_inner())
        .execute(&state.db)
        .await?;
    if result.rows_affected() == 0 {
        return Err(ApiError::NotFound("Blog post not found".to_string()));
    }
    Ok(HttpResponse::Ok().json(json!({ "success": true })))
}
