use actix_web::{web, HttpResponse};
use serde::Deserialize;
use serde_json::json;

use crate::errors::{ApiError, ApiResult};
use crate::models::{Appointment, ContactMessage, UpdateAppointmentInput};
use crate::AppState;

#[derive(Deserialize)]
pub struct PaginationQuery {
    pub limit: Option<i64>,
    pub offset: Option<i64>,
    pub status: Option<String>,
}

/// GET /api/v1/admin/appointments
pub async fn list_appointments(
    state: web::Data<AppState>,
    query: web::Query<PaginationQuery>,
) -> ApiResult<HttpResponse> {
    let limit = query.limit.unwrap_or(50).clamp(1, 200);
    let offset = query.offset.unwrap_or(0).max(0);

    let rows = if let Some(status) = &query.status {
        sqlx::query_as::<_, Appointment>(
            r#"
            SELECT id, patient_name, phone, email, age, gender, problem_summary,
                   preferred_date, preferred_slot, status, admin_notes, source,
                   created_at, updated_at
            FROM appointments
            WHERE status = ?
            ORDER BY preferred_date DESC, created_at DESC
            LIMIT ? OFFSET ?
            "#,
        )
        .bind(status)
        .bind(limit)
        .bind(offset)
        .fetch_all(&state.db)
        .await?
    } else {
        sqlx::query_as::<_, Appointment>(
            r#"
            SELECT id, patient_name, phone, email, age, gender, problem_summary,
                   preferred_date, preferred_slot, status, admin_notes, source,
                   created_at, updated_at
            FROM appointments
            ORDER BY created_at DESC
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

/// PATCH /api/v1/admin/appointments/{id}
pub async fn update_appointment(
    state: web::Data<AppState>,
    id: web::Path<u64>,
    input: web::Json<UpdateAppointmentInput>,
) -> ApiResult<HttpResponse> {
    let id = id.into_inner();

    // Validate status if provided
    if let Some(s) = &input.status {
        if !["pending", "confirmed", "completed", "cancelled", "no_show"].contains(&s.as_str()) {
            return Err(ApiError::BadRequest(format!("Invalid status: {}", s)));
        }
    }

    let result = sqlx::query!(
        r#"
        UPDATE appointments
        SET status      = COALESCE(?, status),
            admin_notes = COALESCE(?, admin_notes)
        WHERE id = ?
        "#,
        input.status,
        input.admin_notes,
        id,
    )
    .execute(&state.db)
    .await?;

    if result.rows_affected() == 0 {
        return Err(ApiError::NotFound("Appointment not found".to_string()));
    }

    Ok(HttpResponse::Ok().json(json!({ "success": true })))
}

/// GET /api/v1/admin/messages
pub async fn list_messages(
    state: web::Data<AppState>,
    query: web::Query<PaginationQuery>,
) -> ApiResult<HttpResponse> {
    let limit = query.limit.unwrap_or(50).clamp(1, 200);
    let offset = query.offset.unwrap_or(0).max(0);

    let rows = sqlx::query_as::<_, ContactMessage>(
        r#"
        SELECT id, name, email, phone, subject, message,
               is_read, is_archived, created_at
        FROM contact_messages
        WHERE is_archived = FALSE
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
        "#,
    )
    .bind(limit)
    .bind(offset)
    .fetch_all(&state.db)
    .await?;

    Ok(HttpResponse::Ok().json(json!({ "data": rows })))
}

/// PATCH /api/v1/admin/messages/{id}/read
pub async fn mark_message_read(
    state: web::Data<AppState>,
    id: web::Path<u64>,
) -> ApiResult<HttpResponse> {
    let result = sqlx::query!("UPDATE contact_messages SET is_read = TRUE WHERE id = ?", id.into_inner())
        .execute(&state.db)
        .await?;

    if result.rows_affected() == 0 {
        return Err(ApiError::NotFound("Message not found".to_string()));
    }

    Ok(HttpResponse::Ok().json(json!({ "success": true })))
}
