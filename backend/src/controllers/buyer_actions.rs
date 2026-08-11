use axum::{
    http::StatusCode,
    Json,
};
use serde_json::{json, Value};

pub async fn add_to_cart() -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    Ok(Json(json!({ "message": "Item added to cart successfully" })))
}

pub async fn add_wishlist() -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    Ok(Json(json!({ "message": "Item added to wishlist successfully" })))
}

pub async fn contact_farmer() -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    Ok(Json(json!({ "message": "Message sent to farmer successfully" })))
}
