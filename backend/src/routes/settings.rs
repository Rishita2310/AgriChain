use axum::{
    routing::get,
    Router,
};
use std::sync::Arc;
use crate::database::db::Database;
use crate::controllers::settings::{get_settings, update_settings};

pub fn routes() -> Router<Arc<Database>> {
    Router::new()
        .route("/", get(get_settings).put(update_settings))
}
