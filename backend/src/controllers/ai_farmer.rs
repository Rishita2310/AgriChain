use axum::{
    extract::{Query, State},
    http::{HeaderMap, StatusCode},
    Json,
};
use mongodb::bson::{doc, oid::ObjectId};
use serde_json::{json, Value};
use serde::Deserialize;
use std::sync::Arc;
use std::str::FromStr;
use crate::database::db::Database;
use crate::controllers::product::verify_farmer;
use crate::models::product::Product;
use crate::models::user::User;
use crate::services::ai_engine::AIEngine;
use futures::stream::StreamExt;

#[derive(Debug, Deserialize)]
pub struct AICropQuery {
    pub product_id: Option<String>,
    pub crop: Option<String>,
}

pub async fn get_price_prediction(
    Query(query): Query<AICropQuery>,
    headers: HeaderMap,
    State(db_state): State<Arc<Database>>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let wallet_address = verify_farmer(&headers)?;
    let prod_coll = db_state.db.collection::<Product>("products");

    let mut crop_name = query.crop.unwrap_or_default();
    let mut current_price = 0.0;
    let mut is_organic = true;

    if let Some(pid) = query.product_id {
        let filter = if let Ok(oid) = ObjectId::from_str(&pid) {
            doc! { "$or": [ doc! { "product_id": &pid }, doc! { "_id": oid } ] }
        } else {
            doc! { "product_id": &pid }
        };

        if let Ok(Some(prod)) = prod_coll.find_one(filter).await {
            crop_name = prod.product_name;
            current_price = prod.price;
            is_organic = prod.organic;
        }
    }

    if crop_name.is_empty() {
        // Find farmer's first active product
        let filter = doc! { "wallet_address": { "$regex": format!("^{}$", wallet_address), "$options": "i" } };
        if let Ok(Some(prod)) = prod_coll.find_one(filter).await {
            crop_name = prod.product_name;
            current_price = prod.price;
            is_organic = prod.organic;
        } else {
            crop_name = "Fresh Organic Tomatoes".to_string();
            current_price = 42.0;
            is_organic = true;
        }
    }

    let prediction = AIEngine::generate_price_prediction(&crop_name, current_price, is_organic);
    Ok(Json(json!(prediction)))
}

pub async fn get_demand_forecast(
    Query(query): Query<AICropQuery>,
    headers: HeaderMap,
    State(db_state): State<Arc<Database>>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let wallet_address = verify_farmer(&headers)?;
    let prod_coll = db_state.db.collection::<Product>("products");

    let mut crop_name = query.crop.unwrap_or_default();

    if crop_name.is_empty() {
        if let Some(pid) = query.product_id {
            let filter = if let Ok(oid) = ObjectId::from_str(&pid) {
                doc! { "$or": [ doc! { "product_id": &pid }, doc! { "_id": oid } ] }
            } else {
                doc! { "product_id": &pid }
            };
            if let Ok(Some(prod)) = prod_coll.find_one(filter).await {
                crop_name = prod.product_name;
            }
        }
    }

    if crop_name.is_empty() {
        let filter = doc! { "wallet_address": { "$regex": format!("^{}$", wallet_address), "$options": "i" } };
        if let Ok(Some(prod)) = prod_coll.find_one(filter).await {
            crop_name = prod.product_name;
        } else {
            crop_name = "Farm Produce".to_string();
        }
    }

    let forecast = AIEngine::generate_demand_forecast(&crop_name);
    Ok(Json(json!(forecast)))
}

pub async fn get_best_time(
    headers: HeaderMap,
    State(_db_state): State<Arc<Database>>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let _wallet_address = verify_farmer(&headers)?;
    let best_time = AIEngine::generate_best_time();
    Ok(Json(json!(best_time)))
}

pub async fn get_farmer_ai_overview(
    Query(query): Query<AICropQuery>,
    headers: HeaderMap,
    State(db_state): State<Arc<Database>>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let wallet_address = verify_farmer(&headers)?;
    let prod_coll = db_state.db.collection::<Product>("products");
    let user_coll = db_state.db.collection::<User>("users");

    // Fetch user details for location
    let user_filter = doc! { "wallet_address": { "$regex": format!("^{}$", wallet_address), "$options": "i" } };
    let user = user_coll.find_one(user_filter).await.unwrap_or(None);
    let location_str = user.as_ref().map(|u| {
        let city = u.city.clone().unwrap_or_default();
        let state = u.state.clone().unwrap_or_else(|| "Gujarat".to_string());
        if !city.is_empty() { format!("{}, {}", city, state) } else { state }
    }).unwrap_or_else(|| "Gujarat, India".to_string());

    // Fetch all products owned by this farmer
    let filter = doc! { "wallet_address": { "$regex": format!("^{}$", wallet_address), "$options": "i" } };
    let mut cursor = prod_coll.find(filter).await.map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Database error" })))
    })?;

    let mut farmer_products = Vec::new();
    while let Some(Ok(prod)) = cursor.next().await {
        farmer_products.push(json!({
            "product_id": prod.product_id,
            "product_name": prod.product_name,
            "category": prod.category,
            "price": prod.price,
            "unit": prod.unit,
            "quantity": prod.quantity,
            "organic": prod.organic,
            "images": prod.images
        }));
    }

    // Determine target crop for analysis
    let (selected_crop, selected_price, selected_organic) = if let Some(pid) = query.product_id {
        if let Some(p) = farmer_products.iter().find(|p| p["product_id"] == pid) {
            (
                p["product_name"].as_str().unwrap_or("Fresh Produce").to_string(),
                p["price"].as_f64().unwrap_or(40.0),
                p["organic"].as_bool().unwrap_or(true)
            )
        } else {
            ("Organic Tomatoes".to_string(), 42.0, true)
        }
    } else if let Some(first_prod) = farmer_products.first() {
        (
            first_prod["product_name"].as_str().unwrap_or("Fresh Produce").to_string(),
            first_prod["price"].as_f64().unwrap_or(40.0),
            first_prod["organic"].as_bool().unwrap_or(true)
        )
    } else {
        ("Organic Tomatoes".to_string(), 42.0, true)
    };

    let price_prediction = AIEngine::generate_price_prediction(&selected_crop, selected_price, selected_organic);
    let demand_forecast = AIEngine::generate_demand_forecast(&selected_crop);
    let best_time = AIEngine::generate_best_time();
    let weather_advisory = AIEngine::generate_weather_advisory(&location_str);

    Ok(Json(json!({
        "selected_crop": selected_crop,
        "farmer_products": farmer_products,
        "price_prediction": price_prediction,
        "demand_forecast": demand_forecast,
        "best_time": best_time,
        "weather_advisory": weather_advisory,
        "farmer_location": location_str
    })))
}
