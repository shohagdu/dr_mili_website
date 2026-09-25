use actix_cors::Cors;
use actix_web::{middleware::Logger, web, App, HttpServer};
use tracing::info;

mod config;
mod db;
mod errors;
mod handlers;
mod middleware;
mod models;
mod services;

use config::Config;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Load .env
    dotenvy::dotenv().ok();

    // Init logging
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| tracing_subscriber::EnvFilter::new("info")),
        )
        .init();

    // Load config
    let config = Config::from_env().expect("Failed to load configuration");
    let bind_addr = format!("{}:{}", config.host, config.port);

    info!("Starting Dr. Mili API on {}", bind_addr);

    // Connect to MySQL
    let pool = db::init_pool(&config.database_url, config.database_max_connections)
        .await
        .expect("Failed to connect to database");

    info!("Database pool initialized");

    // Shared app data
    let app_state = web::Data::new(AppState {
        db: pool.clone(),
        config: config.clone(),
    });

    HttpServer::new(move || {
        // CORS — allow only the configured origins
        let mut cors = Cors::default()
            .allowed_methods(vec!["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"])
            .allowed_headers(vec![
                actix_web::http::header::AUTHORIZATION,
                actix_web::http::header::CONTENT_TYPE,
                actix_web::http::header::ACCEPT,
            ])
            .supports_credentials()
            .max_age(3600);

        for origin in &config.allowed_origins {
            cors = cors.allowed_origin(origin);
        }

        App::new()
            .app_data(app_state.clone())
            .app_data(web::JsonConfig::default().limit(1024 * 1024)) // 1 MB
            .wrap(cors)
            .wrap(Logger::default())
            // Health
            .route("/health", web::get().to(handlers::health))
            // Static — uploaded files (doctor pictures, content media)
            .service(actix_files::Files::new("/uploads", "./uploads"))
            // Public API
            .service(
                web::scope("/api/v1")
                    .route("/appointments", web::post().to(handlers::appointments::create))
                    .route("/contact", web::post().to(handlers::contact::create))
                    .route("/services", web::get().to(handlers::services::list))
                    .route("/services/{slug}", web::get().to(handlers::services::get_by_slug))
                    .route("/blog", web::get().to(handlers::blog::list))
                    .route("/blog/{slug}", web::get().to(handlers::blog::get_by_slug))
                    .route("/testimonials", web::get().to(handlers::testimonials::list))
                    .route("/faqs", web::get().to(handlers::faqs::list))
                    .route("/settings", web::get().to(handlers::settings::list))
                    .route("/doctor", web::get().to(handlers::doctor::get_active))
                    .route("/content", web::get().to(handlers::content::list))
                    .route("/theme", web::get().to(handlers::theme::get_active))
                    .route("/theme/presets", web::get().to(handlers::theme::list_presets))
                    .route("/auth/login", web::post().to(handlers::auth::login))
                    // Admin scope (JWT-protected — middleware checks token)
                    .service(
                        web::scope("/admin")
                            .wrap(middleware::auth::JwtAuth)
                            .route("/appointments", web::get().to(handlers::admin::list_appointments))
                            .route("/appointments/{id}", web::patch().to(handlers::admin::update_appointment))
                            .route("/messages", web::get().to(handlers::admin::list_messages))
                            .route("/messages/{id}/read", web::patch().to(handlers::admin::mark_message_read))
                            // Doctor profile
                            .route("/doctor", web::get().to(handlers::admin_doctor::get))
                            .route("/doctor/{id}", web::patch().to(handlers::admin_doctor::update))
                            // Webpage content CRUD
                            .route("/content", web::get().to(handlers::admin_content::list))
                            .route("/content", web::post().to(handlers::admin_content::create))
                            .route("/content/{id}", web::get().to(handlers::admin_content::get))
                            .route("/content/{id}", web::patch().to(handlers::admin_content::update))
                            .route("/content/{id}", web::delete().to(handlers::admin_content::delete))
                            // Services CRUD
                            .route("/services", web::get().to(handlers::admin_services::list))
                            .route("/services", web::post().to(handlers::admin_services::create))
                            .route("/services/{id}", web::get().to(handlers::admin_services::get))
                            .route("/services/{id}", web::patch().to(handlers::admin_services::update))
                            .route("/services/{id}", web::delete().to(handlers::admin_services::delete))
                            // Testimonials CRUD
                            .route("/testimonials", web::get().to(handlers::admin_testimonials::list))
                            .route("/testimonials", web::post().to(handlers::admin_testimonials::create))
                            .route("/testimonials/{id}", web::get().to(handlers::admin_testimonials::get))
                            .route("/testimonials/{id}", web::patch().to(handlers::admin_testimonials::update))
                            .route("/testimonials/{id}", web::delete().to(handlers::admin_testimonials::delete))
                            // Blog posts CRUD
                            .route("/blog", web::get().to(handlers::admin_blog::list))
                            .route("/blog", web::post().to(handlers::admin_blog::create))
                            .route("/blog/{id}", web::get().to(handlers::admin_blog::get))
                            .route("/blog/{id}", web::patch().to(handlers::admin_blog::update))
                            .route("/blog/{id}", web::delete().to(handlers::admin_blog::delete))
                            // Theme system
                            .route("/theme", web::patch().to(handlers::admin_theme::switch_theme))
                            .route("/theme/customize", web::patch().to(handlers::admin_theme::customize))
                            .route("/theme/reset", web::post().to(handlers::admin_theme::reset))
                            // Site settings
                            .route("/settings", web::get().to(handlers::admin_settings::list))
                            .route("/settings", web::post().to(handlers::admin_settings::upsert))
                            .route("/settings", web::put().to(handlers::admin_settings::bulk_upsert))
                            .route("/settings/{key}", web::delete().to(handlers::admin_settings::delete))
                            // File upload (multipart, up to 5 MB)
                            .route("/upload", web::post().to(handlers::upload::upload)),
                    ),
            )
    })
    .bind(&bind_addr)?
    .run()
    .await
}

// Shared application state
#[derive(Clone)]
pub struct AppState {
    pub db: sqlx::MySqlPool,
    pub config: Config,
}
