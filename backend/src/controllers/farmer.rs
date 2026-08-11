use axum::{
    extract::{Query, State},
    http::StatusCode,
    Json,
};
use mongodb::bson::doc;
use serde_json::{json, Value};
use std::sync::Arc;
use crate::database::db::Database;
use crate::models::user::{User, UserRole};
use futures::stream::StreamExt;
use serde::Deserialize;

#[derive(Debug, Deserialize)]
#[allow(dead_code)]
pub struct LocationQuery {
    pub lat: Option<f64>,
    pub lng: Option<f64>,
    pub radius: Option<f64>, // in km
}

pub async fn get_nearby_farmers(
    Query(_params): Query<LocationQuery>,
    State(db_state): State<Arc<Database>>,
) -> Result<Json<Vec<User>>, (StatusCode, Json<Value>)> {
    let collection = db_state.db.collection::<User>("users");
    
    // Convert enum variant to string for query
    let role_val = mongodb::bson::to_bson(&UserRole::Farmer).unwrap();
    
    let mut cursor = collection.find(doc! { 
        "role": role_val,
        // "is_verified": true // Only show verified farmers (if enforced)
    }).limit(20).await.map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Failed to fetch farmers" })))
    })?;

    let mut farmers = Vec::new();
    while let Some(result) = cursor.next().await {
        if let Ok(farmer) = result {
            farmers.push(farmer);
        }
    }
    
    Ok(Json(farmers))
}
