use axum::{Router, routing::post};
use std::sync::Arc;
use crate::database::db::Database;
use crate::controllers::auth;

pub fn auth_routes() -> Router<Arc<Database>> {
    Router::new()
        .route("/register", post(auth::register))
        .route("/login/request", post(auth::login_request))
        .route("/login/verify", post(auth::login_verify))
        .route("/profile", axum::routing::get(auth::profile).put(auth::update_profile))
}
