use actix_web::{web, HttpResponse};
use serde_json::json;

use crate::errors::ApiResult;
use crate::models::Testimonial;
use crate::AppState;

/// GET /api/v1/testimonials
pub async fn list(state: web::Data<AppState>) -> ApiResult<HttpResponse> {
    let testimonials = sqlx::query_as::<_, Testimonial>(
        r#"
        SELECT id, patient_name, patient_age, location, rating, message,
               treatment_for, display_order
        FROM testimonials
        WHERE is_published = TRUE AND consent_given = TRUE
        ORDER BY display_order ASC, id DESC
        "#,
    )
    .fetch_all(&state.db)
    .await?;

    Ok(HttpResponse::Ok().json(json!({ "data": testimonials })))
}
