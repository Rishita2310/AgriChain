use axum::{
    routing::{get, post},
    Router,
};
use std::sync::Arc;
use crate::database::db::Database;
use crate::controllers::farmer_orders::{get_orders, get_order_details, update_order_status};

pub fn routes() -> Router<Arc<Database>> {
    Router::new()
        .route("/", get(get_orders))
        .route("/{id}", get(get_order_details))
        .route("/{id}/action", post(update_order_status))
        .route("/test", get(test_get_all_orders))
}

pub async fn test_get_all_orders(
    axum::extract::State(db_state): axum::extract::State<Arc<Database>>,
) -> Result<axum::Json<Vec<serde_json::Value>>, (axum::http::StatusCode, axum::Json<serde_json::Value>)> {
    let orders_coll = db_state.db.collection::<crate::models::order::Order>("orders");
    let _prod_coll = db_state.db.collection::<crate::models::product::Product>("products");
    
    let filter = mongodb::bson::doc! {};
    let mut cursor = orders_coll.find(filter).await.unwrap();
    let mut orders_json = Vec::new();
    
    use futures::stream::StreamExt;
    use serde_json::json;
    while let Some(result) = cursor.next().await {
        if let Ok(order) = result {
            let order_v = serde_json::to_value(&order).unwrap_or(json!({}));
            orders_json.push(order_v);
        } else if let Err(e) = result {
            orders_json.push(json!({"error": e.to_string()}));
        }
    }
    
    Ok(axum::Json(orders_json))
}
