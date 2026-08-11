use axum::{
    routing::get,
    Router,
};
use std::sync::Arc;
use crate::database::db::Database;
use crate::controllers::farmer::get_nearby_farmers;

pub fn routes() -> Router<Arc<Database>> {
    Router::new()
        .route("/nearby", get(get_nearby_farmers))
}
