use axum::{
    routing::get,
    Router,
};
use crate::controllers::blockchain::verify_blockchain_transaction;

pub fn routes() -> Router<std::sync::Arc<crate::database::db::Database>> {
    Router::new()
        .route("/verify/{id}", get(verify_blockchain_transaction))
}
