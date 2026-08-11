use axum::{
    extract::{Path, State},
    http::{HeaderMap, StatusCode},
    Json,
};
use mongodb::bson::doc;
use serde_json::{json, Value};
use std::sync::Arc;
use crate::database::db::Database;
use crate::models::dto::FarmerOrderResponse;
use crate::models::order::Order;
use crate::models::product::Product;
use crate::models::user::User;
use crate::models::review::Review;
use crate::models::notification::Notification;
use crate::controllers::product::verify_farmer; // Can verify buyer token as well
use chrono::Utc;
use futures::stream::StreamExt;
use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct SubmitReviewRequest {
    pub rating: i32,
    pub comment: String,
    pub tags: Option<Vec<String>>,
    pub is_anonymous: Option<bool>,
}

pub async fn get_buyer_orders(
    headers: HeaderMap,
    State(db_state): State<Arc<Database>>,
) -> Result<Json<Vec<Order>>, (StatusCode, Json<Value>)> {
    let wallet_address = verify_farmer(&headers)?;

    let orders_coll = db_state.db.collection::<Order>("orders");
    
    // Sort by created_at descending
    let find_options = mongodb::options::FindOptions::builder().sort(doc! { "created_at": -1 }).build();
    let mut cursor = orders_coll.find(doc! { "buyer_wallet": &wallet_address }).with_options(find_options).await.map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Database error" })))
    })?;

    let mut orders = Vec::new();
    while let Some(result) = cursor.next().await {
        if let Ok(order) = result {
            orders.push(order);
        }
    }

    Ok(Json(orders))
}

pub async fn get_buyer_order_details(
    Path((order_id,)): Path<(String,)>,
    headers: HeaderMap,
    State(db_state): State<Arc<Database>>,
) -> Result<Json<FarmerOrderResponse>, (StatusCode, Json<Value>)> {
    let wallet_address = verify_farmer(&headers)?;

    let orders_coll = db_state.db.collection::<Order>("orders");
    let order = orders_coll.find_one(doc! { "order_id": &order_id, "buyer_wallet": &wallet_address }).await.map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Database error" })))
    })?.ok_or((StatusCode::NOT_FOUND, Json(json!({ "error": "Order not found" }))))?;

    let prod_coll = db_state.db.collection::<Product>("products");
    let product = prod_coll.find_one(doc! { "product_id": &order.product_id }).await.map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Database error" })))
    })?.ok_or((StatusCode::NOT_FOUND, Json(json!({ "error": "Product not found" }))))?;

    let user_coll = db_state.db.collection::<User>("users");
    let farmer = user_coll.find_one(doc! { "wallet_address": &order.farmer_id }).await.map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Database error" })))
    })?.unwrap_or_else(|| User {
        id: None,
        wallet_address: order.farmer_id.clone(),
        role: crate::models::user::UserRole::Farmer,
        full_name: "Unknown Farmer".to_string(),
        phone_number: "".to_string(),
        email: "".to_string(),
        country: "".to_string(),
        state: None,
        city: None,
        preferred_language: "en".to_string(),
        profile_photo: None,
        farmer_details: None,
        buyer_details: None,
        status: "Active".to_string(),
        is_verified: false,
        created_at: Utc::now().to_rfc3339(),
        updated_at: Utc::now().to_rfc3339(),
    });

    // Reusing FarmerOrderResponse but the 'buyer' field actually holds the 'farmer' in this context.
    Ok(Json(FarmerOrderResponse {
        order,
        product,
        buyer: farmer, 
    }))
}

pub async fn submit_review(
    Path((order_id,)): Path<(String,)>,
    headers: HeaderMap,
    State(db_state): State<Arc<Database>>,
    Json(payload): Json<SubmitReviewRequest>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let wallet_address = verify_farmer(&headers)?;

    let orders_coll = db_state.db.collection::<Order>("orders");
    let order = orders_coll.find_one(doc! { "order_id": &order_id, "buyer_wallet": &wallet_address }).await.map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Database error" })))
    })?.ok_or((StatusCode::NOT_FOUND, Json(json!({ "error": "Order not found" }))))?;

    if order.status != "Completed" && order.status != "Delivered" {
        return Err((StatusCode::BAD_REQUEST, Json(json!({ "error": "Order must be completed before reviewing" }))));
    }

    // Mock Blockchain Hash for review
    let blockchain_tx_hash = {
        use rand::RngExt;
        let mut rng = rand::rng();
        let tx_hash: String = (0..64).map(|_| {
            let b = rng.random_range(0..16);
            std::char::from_digit(b, 16).unwrap()
        }).collect();
        format!("0x{}", tx_hash)
    };

    let review = Review {
        id: None,
        product_id: order.product_id.clone(),
        user_id: wallet_address.clone(),
        reviewer_name: if payload.is_anonymous.unwrap_or(false) { "Anonymous Buyer".to_string() } else { order.delivery_address.full_name.clone() },
        reviewer_photo: None,
        rating: payload.rating,
        comment: payload.comment,
        verified_buyer: true,
        tags: payload.tags,
        is_anonymous: payload.is_anonymous,
        helpful_count: Some(0),
        blockchain_tx_hash: Some(blockchain_tx_hash.clone()),
        created_at: Utc::now().to_rfc3339(),
    };

    let review_coll = db_state.db.collection::<Review>("reviews");
    review_coll.insert_one(review).await.map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Failed to submit review" })))
    })?;

    // Update Farmer Reputation
    let user_coll = db_state.db.collection::<User>("users");
    if let Ok(Some(mut farmer)) = user_coll.find_one(doc! { "wallet_address": &order.farmer_id }).await {
        if let Some(ref mut details) = farmer.farmer_details {
            let current_total = details.total_reviews.unwrap_or(0);
            let current_avg = details.average_rating.unwrap_or(0.0);
            
            let new_total = current_total + 1;
            let new_avg = ((current_avg * current_total as f64) + payload.rating as f64) / new_total as f64;
            
            details.total_reviews = Some(new_total);
            details.average_rating = Some(new_avg);
            
            // Increment specific star count
            match payload.rating {
                5 => details.five_star_count = Some(details.five_star_count.unwrap_or(0) + 1),
                4 => details.four_star_count = Some(details.four_star_count.unwrap_or(0) + 1),
                3 => details.three_star_count = Some(details.three_star_count.unwrap_or(0) + 1),
                2 => details.two_star_count = Some(details.two_star_count.unwrap_or(0) + 1),
                1 => details.one_star_count = Some(details.one_star_count.unwrap_or(0) + 1),
                _ => {}
            }

            // Calculate Trust Level
            details.trust_level = Some(match new_avg {
                a if a >= 4.8 => "Elite Farmer".to_string(),
                a if a >= 4.5 => "Trusted Farmer".to_string(),
                a if a >= 4.0 => "Verified Farmer".to_string(),
                a if a >= 3.5 => "Growing Farmer".to_string(),
                _ => "Needs Improvement".to_string(),
            });
            
            let _ = user_coll.update_one(
                doc! { "wallet_address": &order.farmer_id },
                doc! { "$set": { "farmer_details": mongodb::bson::to_bson(&details).unwrap() } }
            ).await;
        }
    }

    // Create Notification for Farmer
    let notif = Notification {
        id: None,
        user_id: order.farmer_id.clone(),
        role: "Farmer".to_string(),
        notification_type: "Review".to_string(),
        title: "⭐ New Review".to_string(),
        description: format!("You received a {} star review from a buyer.", payload.rating),
        related_order_id: Some(order_id.clone()),
        is_read: false,
        created_at: Utc::now().to_rfc3339(),
    };
    let _ = db_state.db.collection::<Notification>("notifications").insert_one(notif).await;

    Ok(Json(json!({ 
        "message": "Review submitted successfully",
        "blockchain_tx_hash": blockchain_tx_hash
    })))
}

pub async fn confirm_delivery(
    Path((order_id,)): Path<(String,)>,
    headers: HeaderMap,
    State(db_state): State<Arc<Database>>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let wallet_address = verify_farmer(&headers)?;

    let orders_coll = db_state.db.collection::<Order>("orders");
    let order = orders_coll.find_one(doc! { "order_id": &order_id, "buyer_wallet": &wallet_address }).await.map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Database error" })))
    })?.ok_or((StatusCode::NOT_FOUND, Json(json!({ "error": "Order not found" }))))?;

    if order.status != "Delivered" {
        return Err((StatusCode::BAD_REQUEST, Json(json!({ "error": "Order must be in Delivered state to confirm" }))));
    }

    // Mock Blockchain Transaction Hash for the release
    let blockchain_release_tx_hash = {
        use rand::RngExt;
        let mut rng = rand::rng();
        let tx_hash: String = (0..64).map(|_| {
            let b = rng.random_range(0..16);
            std::char::from_digit(b, 16).unwrap()
        }).collect();
        format!("0x{}", tx_hash)
    };

    let _ = orders_coll.update_one(
        doc! { "order_id": &order_id },
        doc! { "$set": { 
            "status": "Completed", 
            "payment_status": "Released", 
            "escrow_status": "Completed", 
            "updated_at": Utc::now().to_rfc3339(),
            "blockchain_release_tx_hash": &blockchain_release_tx_hash
        } }
    ).await.map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Failed to update order status" })))
    })?;

    // Create Notification for Farmer
    let notif = Notification {
        id: None,
        user_id: order.farmer_id.clone(),
        role: "Farmer".to_string(),
        notification_type: "Payment".to_string(),
        title: "💰 Payment Released".to_string(),
        description: format!("Escrow payment has been released for order {}.", order_id),
        related_order_id: Some(order_id.clone()),
        is_read: false,
        created_at: Utc::now().to_rfc3339(),
    };
    let _ = db_state.db.collection::<Notification>("notifications").insert_one(notif).await;

    Ok(Json(json!({ 
        "message": "Delivery confirmed and escrow released",
        "blockchain_release_tx_hash": blockchain_release_tx_hash
    })))
}
