use axum::{Router, routing::get};
use std::sync::Arc;
use crate::database::db::Database;
use crate::controllers::dashboard;

pub fn dashboard_routes() -> Router<Arc<Database>> {
    Router::new()
        .route("/farmer/stats", get(dashboard::get_farmer_stats))
        .route("/farmer/analytics", get(dashboard::get_farmer_analytics))
}
