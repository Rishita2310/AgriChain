use axum::{
    routing::{get, post},
    Router,
};
use tower_http::services::ServeDir;
use tower_http::cors::{CorsLayer, Any};

use crate::{handlers::*, storage::SharedState};

pub fn create_router(state: SharedState) -> Router {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let api_routes = Router::new()
        .route("/products", get(get_products).post(create_product))
        .route("/products/:id", get(get_product))
        .route("/transfer", post(transfer_product))
        .route("/blockchain", get(get_blockchain))
        .route("/blockchain/validate", get(validate_blockchain))
        .route("/analytics", get(get_analytics))
        .with_state(state);

    Router::new()
        .nest("/api", api_routes)
        // Serve static files from the "static" directory
        .fallback_service(ServeDir::new("static"))
        .layer(cors)
}
