use axum::{
    extract::State,
    http::{HeaderMap, StatusCode},
    Json,
};
use mongodb::bson::doc;
use std::sync::Arc;
use crate::database::db::Database;
use crate::models::settings::UserSettings;
use crate::controllers::product::verify_farmer; // Verify token wrapper
use chrono::Utc;
use serde_json::{json, Value};

pub async fn get_settings(
    headers: HeaderMap,
    State(db_state): State<Arc<Database>>,
) -> Result<Json<UserSettings>, (StatusCode, Json<Value>)> {
    let wallet_address = verify_farmer(&headers)?;
    let settings_coll = db_state.db.collection::<UserSettings>("settings");

    if let Some(settings) = settings_coll.find_one(doc! { "wallet_address": &wallet_address }).await.unwrap() {
        Ok(Json(settings))
    } else {
        // Return defaults if none exist
        Ok(Json(UserSettings::default_for(wallet_address)))
    }
}

pub async fn update_settings(
    headers: HeaderMap,
    State(db_state): State<Arc<Database>>,
    Json(mut new_settings): Json<UserSettings>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let wallet_address = verify_farmer(&headers)?;
    let settings_coll = db_state.db.collection::<UserSettings>("settings");

    new_settings.wallet_address = wallet_address.clone();
    new_settings.updated_at = Utc::now().to_rfc3339();

    let query = doc! { "wallet_address": &wallet_address };
    let update = doc! {
        "$set": mongodb::bson::to_bson(&new_settings).unwrap()
    };
    let options = mongodb::options::UpdateOptions::builder().upsert(true).build();

    settings_coll.update_one(query, update).with_options(options).await.unwrap();

    Ok(Json(json!({ "message": "Settings updated successfully" })))
}
