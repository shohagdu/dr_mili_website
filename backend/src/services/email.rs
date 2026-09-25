use chrono::NaiveDate;
use lettre::{
    message::{header::ContentType, Mailbox},
    transport::smtp::authentication::Credentials,
    AsyncSmtpTransport, AsyncTransport, Message, Tokio1Executor,
};

use crate::config::Config;

pub async fn send_appointment_confirmation(
    config: &Config,
    to_email: &str,
    patient_name: &str,
    date: NaiveDate,
    slot: &str,
) -> anyhow::Result<()> {
    if config.smtp_host.is_empty() {
        tracing::info!("SMTP not configured — skipping email to {}", to_email);
        return Ok(());
    }

    let from: Mailbox = format!("{} <{}>", config.smtp_from_name, config.smtp_from_email)
        .parse()?;
    let to: Mailbox = to_email.parse()?;

    let body = format!(
        r#"Dear {name},

Thank you for booking an appointment with Prof. Dr. Maksuda Farida Akhtar (Mili).

Your request:
  • Date: {date}
  • Preferred slot: {slot}
  • Status: PENDING — our team will contact you shortly to confirm.

Chambers:
  Central Hospital Limited
  House # 02, Road # 05, Green Road, Dhanmondi, Dhaka-1205
  7:30 PM - 10:00 PM (Sat-Thu) · 02-9660015, 02-9660016

  Medilife Specialized Hospital Ltd
  4/5, Mitford Road, Mitford Tower, Dhaka-1100
  3:00 PM - 6:00 PM (Sat-Thu) · 01715-303344, 09614-502299

— Dr. Mili Chamber Team
"#,
        name = patient_name,
        date = date,
        slot = slot
    );

    let email = Message::builder()
        .from(from)
        .to(to)
        .subject("Your appointment request has been received")
        .header(ContentType::TEXT_PLAIN)
        .body(body)?;

    let creds = Credentials::new(
        config.smtp_username.clone(),
        config.smtp_password.clone(),
    );

    let mailer: AsyncSmtpTransport<Tokio1Executor> =
        AsyncSmtpTransport::<Tokio1Executor>::starttls_relay(&config.smtp_host)?
            .port(config.smtp_port)
            .credentials(creds)
            .build();

    mailer.send(email).await?;
    tracing::info!("Confirmation email sent to {}", to_email);
    Ok(())
}
