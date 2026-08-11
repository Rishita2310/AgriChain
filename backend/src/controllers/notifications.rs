use axum::{
    extract::{Path, State},
    http::{HeaderMap, StatusCode},
    Json,
};
use mongodb::bson::{doc, oid::ObjectId};
use serde_json::{json, Value};
use std::sync::Arc;
use crate::database::db::Database;
use crate::controllers::product::get_user_claims;
use crate::models::notification::Notification;
use futures::stream::StreamExt;


pub async fn get_notifications(
    headers: HeaderMap,
    State(db_state): State<Arc<Database>>,
) -> Result<Json<Vec<Notification>>, (StatusCode, Json<Value>)> {
    let claims = get_user_claims(&headers)?;
    let wallet_address = claims.sub;

    let notif_coll = db_state.db.collection::<Notification>("notifications");
    
    let find_options = mongodb::options::FindOptions::builder()
        .sort(doc! { "created_at": -1 })
        .limit(50)
        .build();

    let mut cursor = notif_coll.find(doc! { "user_id": &wallet_address }).with_options(find_options).await.map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Database error" })))
    })?;

    let mut notifications = Vec::new();
    while let Some(Ok(notif)) = cursor.next().await {
        notifications.push(notif);
    }

    Ok(Json(notifications))
}

pub async fn get_unread_count(
    headers: HeaderMap,
    State(db_state): State<Arc<Database>>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let claims = get_user_claims(&headers)?;
    let wallet_address = claims.sub;
    let notif_coll = db_state.db.collection::<Notification>("notifications");
    
    let count = notif_coll.count_documents(doc! { "user_id": &wallet_address, "is_read": false }).await.unwrap_or(0);

    Ok(Json(json!({ "unread_count": count })))
}

pub async fn mark_as_read(
    Path((id,)): Path<(String,)>,
    headers: HeaderMap,
    State(db_state): State<Arc<Database>>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let claims = get_user_claims(&headers)?;
    let wallet_address = claims.sub;
    let notif_coll = db_state.db.collection::<Notification>("notifications");
    
    let obj_id = ObjectId::parse_str(&id).map_err(|_| {
        (StatusCode::BAD_REQUEST, Json(json!({ "error": "Invalid notification ID" })))
    })?;

    let res = notif_coll.update_one(
        doc! { "_id": obj_id, "user_id": &wallet_address },
        doc! { "$set": { "is_read": true } }
    ).await.map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Database error" })))
    })?;

    if res.matched_count == 0 {
        return Err((StatusCode::NOT_FOUND, Json(json!({ "error": "Notification not found" }))));
    }

    Ok(Json(json!({ "message": "Marked as read" })))
}

pub async fn mark_all_as_read(
    headers: HeaderMap,
    State(db_state): State<Arc<Database>>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let claims = get_user_claims(&headers)?;
    let wallet_address = claims.sub;
    let notif_coll = db_state.db.collection::<Notification>("notifications");
    
    notif_coll.update_many(
        doc! { "user_id": &wallet_address, "is_read": false },
        doc! { "$set": { "is_read": true } }
    ).await.map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Database error" })))
    })?;

    Ok(Json(json!({ "message": "All marked as read" })))
}

pub async fn clear_all(
    headers: HeaderMap,
    State(db_state): State<Arc<Database>>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let claims = get_user_claims(&headers)?;
    let wallet_address = claims.sub;
    let notif_coll = db_state.db.collection::<Notification>("notifications");
    
    notif_coll.delete_many(doc! { "user_id": &wallet_address }).await.map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Database error" })))
    })?;

    Ok(Json(json!({ "message": "All notifications cleared" })))
}
