use axum::{
    routing::post,
    Router,
};
use crate::controllers::buyer_actions::{add_to_cart, add_wishlist, contact_farmer};

pub fn routes() -> Router<std::sync::Arc<crate::database::db::Database>> {
    Router::new()
        .route("/cart", post(add_to_cart))
        .route("/wishlist", post(add_wishlist))
        .route("/contact-farmer", post(contact_farmer))
}
