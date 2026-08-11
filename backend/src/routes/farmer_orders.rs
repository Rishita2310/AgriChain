use axum::{
    routing::{get, post},
    Router,
};
use std::sync::Arc;
use crate::database::db::Database;
use crate::controllers::farmer_orders::{get_orders, get_order_details, update_order_status};

pub fn routes() -> Router<Arc<Database>> {
    Router::new()
        .route("/", get(get_orders))
        .route("/{id}", get(get_order_details))
        .route("/{id}/action", post(update_order_status))
}
