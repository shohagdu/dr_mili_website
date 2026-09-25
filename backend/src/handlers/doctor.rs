use actix_web::{web, HttpResponse};
use serde_json::json;

use crate::errors::{ApiError, ApiResult};
use crate::models::Doctor;
use crate::AppState;

/// GET /api/v1/doctor — returns the active doctor profile (single-doctor site)
pub async fn get_active(state: web::Data<AppState>) -> ApiResult<HttpResponse> {
    let doctor = sqlx::query_as::<_, Doctor>(
        r#"
        SELECT id, user_id, name, slug_name, picture, qualifications, special_training, positions,
               hero_tag, stat_experience, stat_publications, stat_patients, stat_success_rate,
               expertise, chambers, doctor_profile, mobile, email,
               facebook, twitter, instagram, linkedin, tiktok, youtube,
               display_position, is_active, created_at, updated_at
        FROM doctors
        WHERE is_active = 1
        ORDER BY display_position ASC, id ASC
        LIMIT 1
        "#,
    )
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| ApiError::NotFound("No active doctor configured".to_string()))?;

    Ok(HttpResponse::Ok().json(json!({ "data": doctor })))
}
