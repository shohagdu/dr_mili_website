use actix_web::{web, HttpResponse};
use serde_json::json;
use validator::Validate;

use crate::errors::{ApiError, ApiResult};
use crate::models::{Doctor, UpdateDoctorInput};
use crate::AppState;

/// GET /api/v1/admin/doctor — fetch the (single) active doctor for editing
pub async fn get(state: web::Data<AppState>) -> ApiResult<HttpResponse> {
    let doctor = sqlx::query_as::<_, Doctor>(
        r#"
        SELECT id, user_id, name, slug_name, picture, qualifications, special_training, positions,
               hero_tag, stat_experience, stat_publications, stat_patients, stat_success_rate,
               expertise, chambers, doctor_profile, mobile, email,
               facebook, twitter, instagram, linkedin, tiktok, youtube,
               display_position, is_active, created_at, updated_at
        FROM doctors
        ORDER BY display_position ASC, id ASC
        LIMIT 1
        "#,
    )
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| ApiError::NotFound("Doctor not found".to_string()))?;

    Ok(HttpResponse::Ok().json(json!({ "data": doctor })))
}

/// PATCH /api/v1/admin/doctor/{id} — partial update
pub async fn update(
    state: web::Data<AppState>,
    id: web::Path<u64>,
    input: web::Json<UpdateDoctorInput>,
) -> ApiResult<HttpResponse> {
    input.validate().map_err(|e| ApiError::Validation(e.to_string()))?;
    let id = id.into_inner();
    let i = input.into_inner();

    let result = sqlx::query(
        r#"
        UPDATE doctors SET
            name              = COALESCE(?, name),
            slug_name         = COALESCE(?, slug_name),
            picture           = COALESCE(?, picture),
            qualifications    = COALESCE(?, qualifications),
            special_training  = COALESCE(?, special_training),
            positions         = COALESCE(?, positions),
            hero_tag          = COALESCE(?, hero_tag),
            stat_experience   = COALESCE(?, stat_experience),
            stat_publications = COALESCE(?, stat_publications),
            stat_patients     = COALESCE(?, stat_patients),
            stat_success_rate = COALESCE(?, stat_success_rate),
            expertise         = COALESCE(?, expertise),
            chambers          = COALESCE(?, chambers),
            doctor_profile    = COALESCE(?, doctor_profile),
            mobile            = COALESCE(?, mobile),
            email             = COALESCE(?, email),
            facebook          = COALESCE(?, facebook),
            twitter           = COALESCE(?, twitter),
            instagram         = COALESCE(?, instagram),
            linkedin          = COALESCE(?, linkedin),
            tiktok            = COALESCE(?, tiktok),
            youtube           = COALESCE(?, youtube),
            display_position  = COALESCE(?, display_position),
            is_active         = COALESCE(?, is_active)
        WHERE id = ?
        "#,
    )
    .bind(&i.name)
    .bind(&i.slug_name)
    .bind(&i.picture)
    .bind(&i.qualifications)
    .bind(&i.special_training)
    .bind(&i.positions)
    .bind(&i.hero_tag)
    .bind(&i.stat_experience)
    .bind(&i.stat_publications)
    .bind(&i.stat_patients)
    .bind(&i.stat_success_rate)
    .bind(&i.expertise)
    .bind(&i.chambers)
    .bind(&i.doctor_profile)
    .bind(&i.mobile)
    .bind(&i.email)
    .bind(&i.facebook)
    .bind(&i.twitter)
    .bind(&i.instagram)
    .bind(&i.linkedin)
    .bind(&i.tiktok)
    .bind(&i.youtube)
    .bind(i.display_position)
    .bind(i.is_active)
    .bind(id)
    .execute(&state.db)
    .await?;

    if result.rows_affected() == 0 {
        return Err(ApiError::NotFound("Doctor not found".to_string()));
    }

    Ok(HttpResponse::Ok().json(json!({ "success": true })))
}
