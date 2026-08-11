use axum::{
    routing::{get, post, put},
    Router,
};
use std::sync::Arc;
use crate::database::db::Database;
use crate::controllers::farmer_profile::{
    get_profile_completion, update_personal_info, update_farm_info,
    update_documents, submit_profile, upload_file,
};

pub fn routes() -> Router<Arc<Database>> {
    Router::new()
        .route("/completion", get(get_profile_completion))
        .route("/personal", put(update_personal_info))
        .route("/farm", put(update_farm_info))
        .route("/documents", put(update_documents))
        .route("/submit", post(submit_profile))
        .route("/upload", post(upload_file))
}
