use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use mongodb::bson::doc;
use serde_json::{json, Value};
use std::sync::Arc;
use crate::database::db::Database;
use crate::models::review::Review;
use futures::stream::StreamExt;

pub async fn get_farmer_reviews(
    Path((farmer_id,)): Path<(String,)>, // Can be ID or wallet address. Let's assume it's querying for a product of this farmer or directly joining. Actually, the prompt says get reviews for a farmer, but Review only has user_id (reviewer) and product_id. Wait, we don't have farmer_id in Review right now. The model only has product_id. Let's look up all products by this farmer, then get reviews for those products.
    State(db_state): State<Arc<Database>>,
) -> Result<Json<Vec<Review>>, (StatusCode, Json<Value>)> {
    // For simplicity right now, since we only have product_id on Review, 
    // we would technically need an aggregation pipeline.
    // Given the constraints and sandbox nature, we can just fetch all reviews and filter manually (not for production)
    // or better, fetch products for the farmer, then find reviews where product_id IN [..].
    
    use crate::models::product::Product;
    let prod_coll = db_state.db.collection::<Product>("products");
    
    let mut cursor = prod_coll.find(doc! { "farmer_id": &farmer_id }).await.unwrap();
    let mut product_ids = Vec::new();
    while let Some(Ok(prod)) = cursor.next().await {
        let id = prod.product_id.clone();
        product_ids.push(id);
    }

    let review_coll = db_state.db.collection::<Review>("reviews");
    let mut reviews_cursor = review_coll.find(doc! { "product_id": { "$in": product_ids } }).await.map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Database error" })))
    })?;

    let mut reviews = Vec::new();
    while let Some(Ok(review)) = reviews_cursor.next().await {
        reviews.push(review);
    }

    Ok(Json(reviews))
}

pub async fn get_buyer_reviews(
    Path((buyer_id,)): Path<(String,)>, // wallet address
    State(db_state): State<Arc<Database>>,
) -> Result<Json<Vec<Review>>, (StatusCode, Json<Value>)> {
    let review_coll = db_state.db.collection::<Review>("reviews");
    
    let find_options = mongodb::options::FindOptions::builder().sort(doc! { "created_at": -1 }).build();
    let mut cursor = review_coll.find(doc! { "user_id": &buyer_id }).with_options(find_options).await.map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Database error" })))
    })?;

    let mut reviews = Vec::new();
    while let Some(Ok(review)) = cursor.next().await {
        reviews.push(review);
    }

    Ok(Json(reviews))
}

pub async fn mark_helpful(
    Path((review_id,)): Path<(String,)>,
    State(db_state): State<Arc<Database>>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let review_coll = db_state.db.collection::<Review>("reviews");
    
    let obj_id = mongodb::bson::oid::ObjectId::parse_str(&review_id).map_err(|_| {
        (StatusCode::BAD_REQUEST, Json(json!({ "error": "Invalid review ID" })))
    })?;

    review_coll.update_one(
        doc! { "_id": obj_id },
        doc! { "$inc": { "helpful_count": 1 } }
    ).await.map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Database error" })))
    })?;

    Ok(Json(json!({ "message": "Marked as helpful" })))
}
