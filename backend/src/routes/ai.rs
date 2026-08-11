use axum::{
    routing::{get, post},
    Router,
};
use std::sync::Arc;
use crate::database::db::Database;
use crate::controllers::ai_farmer::{get_price_prediction, get_demand_forecast, get_best_time, get_farmer_ai_overview};
use crate::controllers::ai_buyer::{get_recommendations, get_nearby_sellers, get_deals};
use axum::http::StatusCode;
use axum::Json;
use serde_json::{json, Value};

async fn handle_feedback() -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    Ok(Json(json!({ "message": "Feedback received. Thank you!" })))
}

pub fn routes() -> Router<Arc<Database>> {
    Router::new()
        // Farmer AI
        .route("/farmer/overview", get(get_farmer_ai_overview))
        .route("/farmer/price", get(get_price_prediction))
        .route("/farmer/demand", get(get_demand_forecast))
        .route("/farmer/best-time", get(get_best_time))
        .route("/farmer/feedback", post(handle_feedback))
        // Buyer AI
        .route("/buyer/recommendations", get(get_recommendations))
        .route("/buyer/nearby", get(get_nearby_sellers))
        .route("/buyer/deals", get(get_deals))
        .route("/buyer/feedback", post(handle_feedback))
}
