use axum::{extract::State, Json};
use std::sync::Arc;
use crate::database::db::Database;
use serde_json::{json, Value};

pub async fn get_features(State(_db): State<Arc<Database>>) -> Json<Value> {
    // Return sample features for now
    Json(json!([
        { "id": 1, "title": "Direct Farmer to Buyer Trading", "description": "Connect directly without middlemen." },
        { "id": 2, "title": "Blockchain Transparency", "description": "Immutable records of transactions." }
    ]))
}

pub async fn get_testimonials(State(_db): State<Arc<Database>>) -> Json<Value> {
    Json(json!([]))
}

pub async fn get_faq(State(_db): State<Arc<Database>>) -> Json<Value> {
    Json(json!([]))
}

pub async fn get_statistics(State(_db): State<Arc<Database>>) -> Json<Value> {
    Json(json!({
        "farmers": 10500,
        "buyers": 2600,
        "transactions": 50000,
        "countries": 16
    }))
}
