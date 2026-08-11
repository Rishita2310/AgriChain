use axum::{
    routing::{get, post},
    Router,
};
use std::sync::Arc;
use crate::database::db::Database;
use crate::controllers::reviews::{get_farmer_reviews, get_buyer_reviews, mark_helpful};

pub fn routes() -> Router<Arc<Database>> {
    Router::new()
        .route("/farmer/{id}", get(get_farmer_reviews))
        .route("/buyer/{id}", get(get_buyer_reviews))
        .route("/helpful/{id}", post(mark_helpful))
}
