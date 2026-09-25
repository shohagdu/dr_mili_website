use actix_web::{web, HttpResponse};
use serde::Deserialize;
use serde_json::json;

use crate::errors::ApiResult;
use crate::models::Faq;
use crate::AppState;

#[derive(Deserialize)]
pub struct FaqQuery {
    pub category: Option<String>,
}

/// GET /api/v1/faqs?category=infertility (optional filter)
pub async fn list(
    state: web::Data<AppState>,
    query: web::Query<FaqQuery>,
) -> ApiResult<HttpResponse> {
    let faqs = if let Some(category) = &query.category {
        sqlx::query_as::<_, Faq>(
            r#"
            SELECT id, question, answer, category, display_order
            FROM faqs
            WHERE is_published = TRUE AND category = ?
            ORDER BY display_order ASC, id ASC
            "#,
        )
        .bind(category)
        .fetch_all(&state.db)
        .await?
    } else {
        sqlx::query_as::<_, Faq>(
            r#"
            SELECT id, question, answer, category, display_order
            FROM faqs
            WHERE is_published = TRUE
            ORDER BY display_order ASC, id ASC
            "#,
        )
        .fetch_all(&state.db)
        .await?
    };

    Ok(HttpResponse::Ok().json(json!({ "data": faqs })))
}
