use actix_web::{web, HttpResponse};
use serde::Deserialize;
use serde_json::json;
use validator::Validate;

use crate::errors::{ApiError, ApiResult};
use crate::models::{AdminTestimonial, CreateTestimonialInput, UpdateTestimonialInput};
use crate::AppState;

const SELECT_COLS: &str = "id, patient_name, patient_age, location, rating, message, \
     treatment_for, is_published, consent_given, display_order, created_at";

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
        "SELECT {SELECT_COLS} FROM testimonials ORDER BY display_order ASC, id DESC LIMIT ? OFFSET ?"
    );
    let rows = sqlx::query_as::<_, AdminTestimonial>(&sql)
        .bind(limit)
        .bind(offset)
        .fetch_all(&state.db)
        .await?;

    Ok(HttpResponse::Ok().json(json!({ "data": rows })))
}

pub async fn get(state: web::Data<AppState>, id: web::Path<u64>) -> ApiResult<HttpResponse> {
    let sql = format!("SELECT {SELECT_COLS} FROM testimonials WHERE id = ?");
    let row = sqlx::query_as::<_, AdminTestimonial>(&sql)
        .bind(id.into_inner())
        .fetch_optional(&state.db)
        .await?
        .ok_or_else(|| ApiError::NotFound("Testimonial not found".to_string()))?;
    Ok(HttpResponse::Ok().json(json!({ "data": row })))
}

pub async fn create(
    state: web::Data<AppState>,
    input: web::Json<CreateTestimonialInput>,
) -> ApiResult<HttpResponse> {
    input.validate().map_err(|e| ApiError::Validation(e.to_string()))?;
    let i = input.into_inner();

    let result = sqlx::query(
        r#"
        INSERT INTO testimonials
            (patient_name, patient_age, location, rating, message, treatment_for,
             is_published, consent_given, display_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        "#,
    )
    .bind(&i.patient_name)
    .bind(i.patient_age)
    .bind(&i.location)
    .bind(i.rating)
    .bind(&i.message)
    .bind(&i.treatment_for)
    .bind(i.is_published.unwrap_or(false))
    .bind(i.consent_given.unwrap_or(false))
    .bind(i.display_order.unwrap_or(0))
    .execute(&state.db)
    .await?;

    Ok(HttpResponse::Created().json(json!({ "success": true, "id": result.last_insert_id() })))
}

pub async fn update(
    state: web::Data<AppState>,
    id: web::Path<u64>,
    input: web::Json<UpdateTestimonialInput>,
) -> ApiResult<HttpResponse> {
    input.validate().map_err(|e| ApiError::Validation(e.to_string()))?;
    let id = id.into_inner();
    let i = input.into_inner();

    let result = sqlx::query(
        r#"
        UPDATE testimonials SET
            patient_name  = COALESCE(?, patient_name),
            patient_age   = COALESCE(?, patient_age),
            location      = COALESCE(?, location),
            rating        = COALESCE(?, rating),
            message       = COALESCE(?, message),
            treatment_for = COALESCE(?, treatment_for),
            is_published  = COALESCE(?, is_published),
            consent_given = COALESCE(?, consent_given),
            display_order = COALESCE(?, display_order)
        WHERE id = ?
        "#,
    )
    .bind(&i.patient_name)
    .bind(i.patient_age)
    .bind(&i.location)
    .bind(i.rating)
    .bind(&i.message)
    .bind(&i.treatment_for)
    .bind(i.is_published)
    .bind(i.consent_given)
    .bind(i.display_order)
    .bind(id)
    .execute(&state.db)
    .await?;

    if result.rows_affected() == 0 {
        return Err(ApiError::NotFound("Testimonial not found".to_string()));
    }
    Ok(HttpResponse::Ok().json(json!({ "success": true })))
}

pub async fn delete(state: web::Data<AppState>, id: web::Path<u64>) -> ApiResult<HttpResponse> {
    let result = sqlx::query("DELETE FROM testimonials WHERE id = ?")
        .bind(id.into_inner())
        .execute(&state.db)
        .await?;
    if result.rows_affected() == 0 {
        return Err(ApiError::NotFound("Testimonial not found".to_string()));
    }
    Ok(HttpResponse::Ok().json(json!({ "success": true })))
}
