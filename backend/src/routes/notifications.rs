use axum::{
    routing::{get, put, delete},
    Router,
};
use std::sync::Arc;
use crate::database::db::Database;
use crate::controllers::notifications::{
    get_notifications,
    get_unread_count,
    mark_as_read,
    mark_all_as_read,
    clear_all
};

pub fn routes() -> Router<Arc<Database>> {
    Router::new()
        .route("/", get(get_notifications))
        .route("/unread-count", get(get_unread_count))
        .route("/read/{id}", put(mark_as_read))
        .route("/read-all", put(mark_all_as_read))
        .route("/clear", delete(clear_all))
}
