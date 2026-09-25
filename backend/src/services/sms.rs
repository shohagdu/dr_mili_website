use crate::config::Config;

/// Sends an SMS via BulkSMSBD-style API.
/// Adapt the params if you use a different Bangladeshi SMS gateway.
pub async fn send(config: &Config, phone: &str, message: &str) -> anyhow::Result<()> {
    if !config.sms_enabled {
        tracing::info!("SMS disabled — would have sent to {}: {}", phone, message);
        return Ok(());
    }

    if config.sms_api_url.is_empty() || config.sms_api_key.is_empty() {
        anyhow::bail!("SMS gateway not configured");
    }

    let client = reqwest::Client::new();
    let params = [
        ("api_key", config.sms_api_key.as_str()),
        ("type", "text"),
        ("number", phone),
        ("senderid", config.sms_sender_id.as_str()),
        ("message", message),
    ];

    let res = client
        .post(&config.sms_api_url)
        .form(&params)
        .send()
        .await?;

    if !res.status().is_success() {
        let status = res.status();
        let body = res.text().await.unwrap_or_default();
        anyhow::bail!("SMS gateway returned {}: {}", status, body);
    }

    tracing::info!("SMS sent to {}", phone);
    Ok(())
}
