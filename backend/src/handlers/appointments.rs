use actix_web::{web, HttpResponse};
use serde_json::json;
use validator::Validate;

use crate::errors::{ApiError, ApiResult};
use crate::models::{Appointment, CreateAppointmentInput};
use crate::services::{email, sms};
use crate::AppState;

/// POST /api/v1/appointments  — patient submits an appointment request
pub async fn create(
    state: web::Data<AppState>,
    input: web::Json<CreateAppointmentInput>,
) -> ApiResult<HttpResponse> {
    input
        .validate()
        .map_err(|e| ApiError::Validation(e.to_string()))?;

    let result = sqlx::query!(
        r#"
        INSERT INTO appointments
            (patient_name, phone, email, age, gender, problem_summary,
             preferred_date, preferred_slot, status, source)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'website')
        "#,
        input.patient_name,
        input.phone,
        input.email,
        input.age,
        input.gender,
        input.problem_summary,
        input.preferred_date,
        input.preferred_slot,
    )
    .execute(&state.db)
    .await?;

    let id = result.last_insert_id();

    // Fire-and-forget notifications (don't block response)
    let state_clone = state.clone();
    let phone = input.phone.clone();
    let email_opt = input.email.clone();
    let name = input.patient_name.clone();
    let date = input.preferred_date;
    let slot = input.preferred_slot.clone();

    tokio::spawn(async move {
        // SMS to patient
        let sms_msg = format!(
            "Dear {}, your appointment request for {} ({}) at Dr. Mili's chamber has been received. We will confirm shortly.",
            name, date, slot
        );
        if let Err(e) = sms::send(&state_clone.config, &phone, &sms_msg).await {
            tracing::warn!("SMS send failed: {:?}", e);
        }

        // Email confirmation if email given
        if let Some(email_addr) = email_opt {
            if let Err(e) = email::send_appointment_confirmation(
                &state_clone.config,
                &email_addr,
                &name,
                date,
                &slot,
            )
            .await
            {
                tracing::warn!("Email send failed: {:?}", e);
            }
        }
    });

    Ok(HttpResponse::Created().json(json!({
        "success": true,
        "data": {
            "id": id,
            "message": "Your appointment request has been received. We will contact you shortly to confirm."
        }
    })))
}
