use actix_multipart::Multipart;
use actix_web::HttpResponse;
use futures_util::StreamExt;
use serde_json::json;
use std::io::Write;
use uuid::Uuid;

use crate::errors::{ApiError, ApiResult};

const MAX_FILE_SIZE: usize = 5 * 1024 * 1024; // 5 MB
const UPLOAD_DIR: &str = "./uploads";

/// POST /api/v1/admin/upload — multipart upload, returns relative path
pub async fn upload(mut payload: Multipart) -> ApiResult<HttpResponse> {
    // Ensure upload dir exists (idempotent)
    if let Err(e) = std::fs::create_dir_all(UPLOAD_DIR) {
        return Err(ApiError::Internal(format!("Cannot create upload dir: {}", e)));
    }

    while let Some(item) = payload.next().await {
        let mut field = item.map_err(|e| ApiError::BadRequest(format!("multipart error: {}", e)))?;

        // Only accept the field named "file"
        if field.name() != Some("file") {
            continue;
        }

        // Resolve extension from content_type (fallback to .bin)
        let content_type = field.content_type().map(|m| m.essence_str().to_string());
        let ext = match content_type.as_deref() {
            Some("image/jpeg") => "jpg",
            Some("image/png") => "png",
            Some("image/webp") => "webp",
            Some("image/gif") => "gif",
            Some("image/svg+xml") => "svg",
            Some("application/pdf") => "pdf",
            Some(other) => {
                return Err(ApiError::BadRequest(format!(
                    "Unsupported content type: {}",
                    other
                )))
            }
            None => "bin",
        };

        let filename = format!("{}.{}", Uuid::new_v4(), ext);
        let disk_path = format!("{}/{}", UPLOAD_DIR, filename);
        let public_path = format!("uploads/{}", filename);

        // Stream-write the file with size cap
        let path = disk_path.clone();
        let mut file = web_block_create_file(&path)?;
        let mut written: usize = 0;

        while let Some(chunk) = field.next().await {
            let bytes =
                chunk.map_err(|e| ApiError::BadRequest(format!("upload chunk error: {}", e)))?;
            written += bytes.len();
            if written > MAX_FILE_SIZE {
                let _ = std::fs::remove_file(&path);
                return Err(ApiError::BadRequest(format!(
                    "File exceeds {} MB limit",
                    MAX_FILE_SIZE / (1024 * 1024)
                )));
            }
            file = web_block_write(file, bytes.to_vec())?;
        }

        // Drop the file handle to flush
        drop(file);

        return Ok(HttpResponse::Ok().json(json!({ "data": { "path": public_path } })));
    }

    Err(ApiError::BadRequest("Missing 'file' field".to_string()))
}

// Tiny helpers — kept inline because each upload is short.
fn web_block_create_file(path: &str) -> ApiResult<std::fs::File> {
    std::fs::File::create(path).map_err(|e| ApiError::Internal(format!("Cannot open file: {}", e)))
}

fn web_block_write(mut file: std::fs::File, bytes: Vec<u8>) -> ApiResult<std::fs::File> {
    file.write_all(&bytes)
        .map_err(|e| ApiError::Internal(format!("Write failed: {}", e)))?;
    Ok(file)
}
