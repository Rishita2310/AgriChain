use axum::{
    extract::State,
    http::{HeaderMap, StatusCode},
    Json,
};
use mongodb::bson::doc;
use serde_json::{json, Value};
use std::sync::Arc;
use crate::database::db::Database;
use crate::models::dto::{CreateOrderRequest, OrderResponse};
use crate::models::order::{Order, PaymentSummary};
use crate::models::product::Product;
use crate::models::notification::Notification;
use crate::controllers::product::get_user_claims;
use chrono::{Utc, Duration};
use uuid::Uuid;

const ARBITRUM_ESCROW_CONTRACT: &str = "0x2C4A7e3D94bC4c10D204A81E99525Db724a73752";

pub async fn create_order(
    headers: HeaderMap,
    State(db_state): State<Arc<Database>>,
    Json(payload): Json<CreateOrderRequest>,
) -> Result<Json<OrderResponse>, (StatusCode, Json<Value>)> {
    // 1. Verify Buyer
    let claims = get_user_claims(&headers)?;
    let buyer_wallet = claims.sub;

    let prod_coll = db_state.db.collection::<Product>("products");
    
    // 2. Fetch Product & Check Stock
    let product = prod_coll.find_one(doc! { "product_id": &payload.product_id }).await.map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Database error" })))
    })?.ok_or((StatusCode::NOT_FOUND, Json(json!({ "error": "Product not found" }))))?;

    if payload.quantity > product.quantity {
        return Err((StatusCode::BAD_REQUEST, Json(json!({ "error": "Selected quantity exceeds available stock." }))));
    }

    if payload.quantity <= 0.0 {
        return Err((StatusCode::BAD_REQUEST, Json(json!({ "error": "Invalid quantity." }))));
    }

    // 3. Deduct Stock
    let new_quantity = product.quantity - payload.quantity;
    let new_status = if new_quantity <= 0.0 { "SoldOut" } else { "Published" };
    
    prod_coll.update_one(
        doc! { "product_id": &payload.product_id },
        doc! { 
            "$set": { 
                "quantity": new_quantity,
                "status": new_status,
                "updated_at": Utc::now().to_rfc3339()
            }
        },
    ).await.map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Failed to update product stock" })))
    })?;

    // 4. Calculate Pricing
    let subtotal = payload.quantity * product.price;
    let delivery_charge = 60.0;
    let platform_fee = 20.0;
    let gst = subtotal * 0.05; // 5% GST
    let discount = if let Some(code) = payload.coupon_code {
        if code == "DISCOUNT50" { 50.0 } else { 0.0 }
    } else { 0.0 };

    let total = subtotal + delivery_charge + platform_fee + gst - discount;

    let payment_summary = PaymentSummary {
        product_price: subtotal,
        delivery_charge,
        platform_fee,
        gst,
        discount,
        total,
        payment_method: payload.payment_method,
    };

    // 5. Create Order
    let order_id = format!("ORD-{}", Uuid::new_v4().to_string().chars().take(8).collect::<String>().to_uppercase());
    let tx_hash = payload.blockchain_tx_hash.clone();
    let expected_delivery = (Utc::now() + Duration::try_days(3).unwrap()).to_rfc3339();

    let order = Order {
        id: None,
        order_id: order_id.clone(),
        buyer_wallet,
        product_id: product.product_id.clone(),
        farmer_id: product.wallet_address.clone(), // Farmer's wallet
        quantity: payload.quantity,
        status: "Waiting for Farmer".to_string(),
        delivery_address: payload.delivery_address,
        payment: payment_summary.clone(),
        payment_status: "Locked".to_string(),
        escrow_status: "Active".to_string(),
        escrow_contract_address: Some(ARBITRUM_ESCROW_CONTRACT.to_string()),
        blockchain_network: Some("Arbitrum Sepolia".to_string()),
        blockchain_tx_hash: tx_hash.clone(),
        expected_delivery: expected_delivery.clone(),
        created_at: Utc::now().to_rfc3339(),
        updated_at: Utc::now().to_rfc3339(),
    };

    let orders_coll = db_state.db.collection::<Order>("orders");
    orders_coll.insert_one(order.clone()).await.map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Failed to save order" })))
    })?;

    // Create Notification for Farmer
    let notif = Notification {
        id: None,
        user_id: product.wallet_address.clone(),
        role: "Farmer".to_string(),
        notification_type: "Order".to_string(),
        title: "📦 New Order Received".to_string(),
        description: format!("Buyer ordered {} units of {}.", payload.quantity, product.product_name),
        related_order_id: Some(order_id.clone()),
        is_read: false,
        created_at: Utc::now().to_rfc3339(),
    };
    let _ = db_state.db.collection::<Notification>("notifications").insert_one(notif).await;

    // 6. Return Response
    Ok(Json(OrderResponse {
        message: "Order Successfully Placed".to_string(),
        order_id,
        product_name: product.product_name,
        quantity: payload.quantity,
        total_paid: total,
        expected_delivery,
        blockchain_tx_hash: tx_hash.unwrap_or_default(),
    }))
}
