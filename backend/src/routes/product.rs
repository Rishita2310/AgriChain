use axum::{
    routing::{get, post, put, patch, delete},
    Router,
};
use std::sync::Arc;
use crate::database::db::Database;
use crate::controllers::product::{
    create_product, update_product, get_farmer_products, get_all_products, get_product, update_product_status, delete_product,
    get_recommended_products, get_latest_products, get_organic_products, get_popular_products, search_and_filter_products,
    get_product_reviews, get_similar_products, get_product_qrcode
};

pub fn routes() -> Router<Arc<Database>> {
    Router::new()
        .route("/", post(create_product))
        .route("/", get(get_all_products))
        .route("/recommended", get(get_recommended_products))
        .route("/latest", get(get_latest_products))
        .route("/organic", get(get_organic_products))
        .route("/popular", get(get_popular_products))
        .route("/search", get(search_and_filter_products))
        .route("/farmer", get(get_farmer_products))
        .route("/similar/{id}", get(get_similar_products))
        .route("/{id}", get(get_product))
        .route("/{id}", put(update_product))
        .route("/{id}", delete(delete_product))
        .route("/{id}/status", patch(update_product_status))
        .route("/{id}/reviews", get(get_product_reviews))
        .route("/{id}/qrcode", get(get_product_qrcode))
}
