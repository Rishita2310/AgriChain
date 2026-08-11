use axum::{
    routing::get,
    Router,
};
use std::sync::Arc;
use crate::database::db::Database;
use crate::controllers::admin::{
    get_dashboard_stats, get_users, get_smart_contracts, get_all_products_admin, get_admin_orders
};

pub fn routes() -> Router<Arc<Database>> {
    Router::new()
        .route("/stats", get(get_dashboard_stats))
        .route("/users", get(get_users))
        .route("/contracts", get(get_smart_contracts))
        .route("/products", get(get_all_products_admin))
        .route("/orders", get(get_admin_orders))
}
