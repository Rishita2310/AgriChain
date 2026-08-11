use axum::{
    routing::get,
    Router,
};
use std::sync::Arc;
use crate::database::db::Database;
use crate::controllers::wallet::{get_wallet_balance, get_wallet_transactions, get_wallet_analytics};

pub fn routes() -> Router<Arc<Database>> {
    Router::new()
        .route("/balance", get(get_wallet_balance))
        .route("/transactions", get(get_wallet_transactions))
        .route("/analytics", get(get_wallet_analytics))
}
