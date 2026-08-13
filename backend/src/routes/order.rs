use axum::{
    routing::post,
    Router,
};
use std::sync::Arc;
use crate::database::db::Database;
use crate::controllers::order::{payment_intent, verify_payment};

pub fn routes() -> Router<Arc<Database>> {
    Router::new()
        .route("/payment-intent", post(payment_intent))
        .route("/verify-payment", post(verify_payment))
}
