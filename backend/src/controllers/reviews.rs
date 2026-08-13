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
    Path((farmer_id,)): Path<(String,)>,
    State(db_state): State<Arc<Database>>,
) -> Result<Json<Vec<Value>>, (StatusCode, Json<Value>)> {
    use crate::models::product::Product;
    use std::collections::HashMap;
    let prod_coll = db_state.db.collection::<Product>("products");
    
    let user_coll = db_state.db.collection::<crate::models::user::User>("users");
    let user = user_coll.find_one(doc! { "wallet_address": { "$regex": format!("^{}$", farmer_id), "$options": "i" } }).await
        .unwrap_or(None);
        
    let real_farmer_id = user.and_then(|u| u.id).map(|id| id.to_string()).unwrap_or_else(|| farmer_id.clone());

    let filter = doc! {
        "$or": [
            { "wallet_address": { "$regex": format!("^{}$", farmer_id), "$options": "i" } },
            { "farmer_id": real_farmer_id }
        ]
    };
    let mut cursor = prod_coll.find(filter).await.unwrap();
    let mut product_ids = Vec::new();
    let mut product_names = HashMap::new();
    
    while let Some(Ok(prod)) = cursor.next().await {
        let id = prod.product_id.clone();
        product_names.insert(id.clone(), prod.product_name.clone());
        product_ids.push(id);
    }

    let review_coll = db_state.db.collection::<Review>("reviews");
    let mut reviews_cursor = review_coll.find(doc! { "product_id": { "$in": product_ids } }).await.map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Database error" })))
    })?;

    let mut reviews = Vec::new();
    while let Some(Ok(review)) = reviews_cursor.next().await {
        let mut review_json = serde_json::to_value(&review).unwrap();
        if let Some(obj) = review_json.as_object_mut() {
            let p_name = product_names.get(&review.product_id).cloned().unwrap_or_else(|| "Farm Product".to_string());
            obj.insert("product_name".to_string(), json!(p_name));
            obj.insert("buyer_name".to_string(), json!(review.reviewer_name));
        }
        reviews.push(review_json);
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
