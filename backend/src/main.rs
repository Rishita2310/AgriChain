mod config;
mod controllers;
mod database;
mod middleware;
mod models;
mod response;
mod routes;
mod services;
mod utils;

use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use tower_http::services::ServeDir;
use dotenvy::dotenv;
use database::db::Database;
use std::sync::Arc;
use axum::extract::DefaultBodyLimit;

#[tokio::main]
async fn main() {
    dotenv().ok();
    
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "backend=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let db = Database::init().await.expect("Failed to initialize database");
    let app_state = Arc::new(db);
    
    let app = routes::create_router(app_state)
        .layer(DefaultBodyLimit::disable())
        .nest_service("/uploads", ServeDir::new("uploads"));

    let port = std::env::var("PORT").unwrap_or_else(|_| "3000".to_string());
    let addr = format!("0.0.0.0:{}", port);
    
    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    tracing::info!("🚀 Server started successfully on {}", addr);
    
    axum::serve(listener, app).await.unwrap();
}
