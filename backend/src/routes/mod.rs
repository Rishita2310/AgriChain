use axum::{Router, routing::get};
use std::sync::Arc;
use crate::database::db::Database;
use crate::controllers::{health, landing};
use tower_http::cors::{CorsLayer, Any};

pub mod auth;
pub mod dashboard;
pub mod farmer_profile;
pub mod product;
pub mod farmer;
pub mod blockchain;
pub mod buyer_actions;
pub mod order;
pub mod farmer_orders;
pub mod buyer_orders;
pub mod reviews;
pub mod wallet;
pub mod notifications;
pub mod ai;
pub mod admin;
pub mod settings;
pub mod chat;

pub fn create_router(state: Arc<Database>) -> Router {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    Router::new()
        .route("/", get(health::check))
        .route("/api/features", get(landing::get_features))
        .route("/api/testimonials", get(landing::get_testimonials))
        .route("/api/faq", get(landing::get_faq))
        .route("/api/statistics", get(landing::get_statistics))
        .nest("/api/auth", auth::auth_routes())
        .nest("/api/dashboard", dashboard::dashboard_routes())
        .nest("/api/farmer/profile", farmer_profile::routes())
        .nest("/api/products", product::routes())
        .nest("/api/farmers", farmer::routes())
        .nest("/api/blockchain", blockchain::routes())
        .nest("/api/buyer", buyer_actions::routes())
        .nest("/api/buyer/orders", buyer_orders::routes())
        .nest("/api/orders", order::routes())
        .nest("/api/farmer/orders", farmer_orders::routes())
        .nest("/api/reviews", reviews::routes())
        .nest("/api/wallet", wallet::routes())
        .nest("/api/notifications", notifications::routes())
        .nest("/api/ai", ai::routes())
        .nest("/api/admin", admin::routes())
        .nest("/api/settings", settings::routes())
        .nest("/api/kisan-ai", chat::routes())
        .nest("/api/chat", chat::chat_routes())
        .with_state(state)
        .layer(cors)
}
