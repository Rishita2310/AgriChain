use axum::{
    routing::post,
    Router,
};
use std::sync::Arc;
use crate::database::db::Database;
use crate::controllers::order::create_order;

pub fn routes() -> Router<Arc<Database>> {
    Router::new()
        .route("/", post(create_order))
}
