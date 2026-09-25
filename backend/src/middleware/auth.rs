use std::future::{ready, Ready};

use actix_web::{
    body::EitherBody,
    dev::{forward_ready, Service, ServiceRequest, ServiceResponse, Transform},
    web, Error, HttpMessage, HttpResponse,
};
use futures_util::future::LocalBoxFuture;
use jsonwebtoken::{decode, DecodingKey, Validation};
use serde_json::json;

use crate::models::JwtClaims;
use crate::AppState;

pub struct JwtAuth;

impl<S, B> Transform<S, ServiceRequest> for JwtAuth
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<EitherBody<B>>;
    type Error = Error;
    type InitError = ();
    type Transform = JwtAuthMiddleware<S>;
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ready(Ok(JwtAuthMiddleware { service }))
    }
}

pub struct JwtAuthMiddleware<S> {
    service: S,
}

impl<S, B> Service<ServiceRequest> for JwtAuthMiddleware<S>
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<EitherBody<B>>;
    type Error = Error;
    type Future = LocalBoxFuture<'static, Result<Self::Response, Self::Error>>;

    forward_ready!(service);

    fn call(&self, req: ServiceRequest) -> Self::Future {
        // Extract Authorization header
        let auth_header = req
            .headers()
            .get("Authorization")
            .and_then(|h| h.to_str().ok())
            .map(|s| s.to_string());

        let token = match auth_header {
            Some(h) if h.starts_with("Bearer ") => h[7..].to_string(),
            _ => {
                let res = HttpResponse::Unauthorized()
                    .json(json!({ "error": { "code": 401, "message": "Missing or invalid Authorization header" } }))
                    .map_into_right_body();
                let (req, _) = req.into_parts();
                return Box::pin(async move { Ok(ServiceResponse::new(req, res)) });
            }
        };

        // Verify against app state's secret
        let state = req
            .app_data::<web::Data<AppState>>()
            .cloned();

        let state = match state {
            Some(s) => s,
            None => {
                let res = HttpResponse::InternalServerError()
                    .json(json!({ "error": { "code": 500, "message": "App state missing" } }))
                    .map_into_right_body();
                let (req, _) = req.into_parts();
                return Box::pin(async move { Ok(ServiceResponse::new(req, res)) });
            }
        };

        let decoded = decode::<JwtClaims>(
            &token,
            &DecodingKey::from_secret(state.config.jwt_secret.as_bytes()),
            &Validation::default(),
        );

        match decoded {
            Ok(token_data) => {
                // Store claims in request extensions for handlers
                req.extensions_mut().insert(token_data.claims);
                let fut = self.service.call(req);
                Box::pin(async move {
                    let res = fut.await?;
                    Ok(res.map_into_left_body())
                })
            }
            Err(_) => {
                let res = HttpResponse::Unauthorized()
                    .json(json!({ "error": { "code": 401, "message": "Invalid or expired token" } }))
                    .map_into_right_body();
                let (req, _) = req.into_parts();
                Box::pin(async move { Ok(ServiceResponse::new(req, res)) })
            }
        }
    }
}
