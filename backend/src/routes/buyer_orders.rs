use axum::{
    routing::{get, post},
    Router,
};
use std::sync::Arc;
use crate::database::db::Database;
use crate::controllers::buyer_orders::{get_buyer_orders, get_buyer_order_details, submit_review, confirm_delivery};

pub fn routes() -> Router<Arc<Database>> {
    Router::new()
        .route("/", get(get_buyer_orders))
        .route("/{id}", get(get_buyer_order_details))
        .route("/{id}/review", post(submit_review))
        .route("/{id}/confirm-delivery", post(confirm_delivery))
}
