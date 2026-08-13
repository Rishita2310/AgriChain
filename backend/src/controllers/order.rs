use axum::{
    extract::State,
    http::{HeaderMap, StatusCode},
    Json,
};
use mongodb::bson::doc;
use serde_json::{json, Value};
use std::sync::Arc;
use crate::database::db::Database;
use crate::models::dto::{CreateOrderRequest, OrderResponse, VerifyPaymentRequest};
use crate::models::order::{Order, PaymentSummary};
use crate::models::product::Product;
use crate::models::notification::Notification;
use crate::controllers::product::get_user_claims;
use chrono::{Utc, Duration};
use rand::RngExt;

const ARBITRUM_ESCROW_CONTRACT: &str = "0x2C4A7e3D94bC4c10D204A81E99525Db724a73752";
const ARBITRUM_SEPOLIA_RPC: &str = "https://sepolia-rollup.arbitrum.io/rpc";

pub async fn payment_intent(
    headers: HeaderMap,
    State(db_state): State<Arc<Database>>,
    Json(payload): Json<CreateOrderRequest>,
) -> Result<Json<OrderResponse>, (StatusCode, Json<Value>)> {
    let claims = get_user_claims(&headers)?;
    let buyer_wallet = claims.sub;

    let prod_coll = db_state.db.collection::<Product>("products");
    
    let product = prod_coll.find_one(doc! { "product_id": &payload.product_id }).await.map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Database error" })))
    })?.ok_or((StatusCode::NOT_FOUND, Json(json!({ "error": "Product not found" }))))?;

    if payload.quantity > product.quantity {
        return Err((StatusCode::BAD_REQUEST, Json(json!({ "error": "Selected quantity exceeds available stock." }))));
    }

    if payload.quantity <= 0.0 {
        return Err((StatusCode::BAD_REQUEST, Json(json!({ "error": "Invalid quantity." }))));
    }

    // For testing purposes, allow buyers to purchase their own products
    /*
    if product.wallet_address.to_lowercase() == buyer_wallet.to_lowercase() {
        return Err((StatusCode::BAD_REQUEST, Json(json!({ "error": "Buyers cannot purchase their own products." }))));
    }
    */

    let subtotal = payload.quantity * product.price;
    let total = subtotal;

    let payment_summary = PaymentSummary {
        product_price: subtotal,
        total,
        payment_method: payload.payment_method,
    };

    let rng_num: u32 = rand::rng().random_range(1000..9999);
    let order_id = format!("AGR-{}", rng_num);
    
    let expected_delivery = (Utc::now() + Duration::try_days(3).unwrap()).to_rfc3339();

    let order = Order {
        id: None,
        order_id: order_id.clone(),
        buyer_wallet,
        product_id: product.product_id.clone(),
        farmer_id: product.wallet_address.clone(),
        quantity: payload.quantity,
        status: "Pending".to_string(), // Pending payment
        delivery_address: payload.delivery_address,
        payment: payment_summary.clone(),
        eth_amount: None,
        eth_to_inr_rate: None,
        payment_status: "Pending".to_string(),
        escrow_status: "Inactive".to_string(),
        escrow_contract_address: Some(ARBITRUM_ESCROW_CONTRACT.to_string()),
        blockchain_network: Some("Arbitrum Sepolia".to_string()),
        blockchain_tx_hash: None,
        blockchain_release_tx_hash: None,
        courier_name: None,
        driver_number: None,
        tracking_id: None,
        awb_number: None,
        shipment_status: None,
        expected_delivery: expected_delivery.clone(),
        created_at: Utc::now().to_rfc3339(),
        updated_at: Utc::now().to_rfc3339(),
    };

    let orders_coll = db_state.db.collection::<Order>("orders");
    orders_coll.insert_one(order.clone()).await.map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Failed to save order intent" })))
    })?;

    Ok(Json(OrderResponse {
        message: "Payment intent created".to_string(),
        order_id,
        product_name: product.product_name,
        quantity: payload.quantity,
        total_paid: total,
        expected_delivery,
        payment_status: "Pending".to_string(),
    }))
}

pub async fn verify_payment(
    headers: HeaderMap,
    State(db_state): State<Arc<Database>>,
    Json(payload): Json<VerifyPaymentRequest>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let claims = get_user_claims(&headers)?;
    let buyer_wallet = claims.sub;

    let orders_coll = db_state.db.collection::<Order>("orders");
    let order = orders_coll.find_one(doc! { "order_id": &payload.order_id, "buyer_wallet": &buyer_wallet }).await.map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Database error" })))
    })?.ok_or((StatusCode::NOT_FOUND, Json(json!({ "error": "Order not found" }))))?;

    if order.payment_status != "Pending" {
        return Err((StatusCode::BAD_REQUEST, Json(json!({ "error": "Order is not pending payment" }))));
    }

    let prod_coll = db_state.db.collection::<Product>("products");
    let product = prod_coll.find_one(doc! { "product_id": &order.product_id }).await.unwrap_or(None)
        .ok_or((StatusCode::NOT_FOUND, Json(json!({ "error": "Product not found" }))))?;

    let client = reqwest::Client::new();
    let rpc_payload = json!({
        "jsonrpc": "2.0",
        "method": "eth_getTransactionReceipt",
        "params": [&payload.transaction_hash],
        "id": 1
    });

    let mut receipt_opt = None;
    for _ in 0..5 {
        if let Ok(res) = client.post(ARBITRUM_SEPOLIA_RPC).json(&rpc_payload).send().await {
            if let Ok(rpc_response) = res.json::<Value>().await {
                if let Some(receipt) = rpc_response.get("result").and_then(|v| v.as_object()) {
                    receipt_opt = Some(receipt.clone());
                    break;
                }
            }
        }
        tokio::time::sleep(tokio::time::Duration::from_secs(3)).await;
    }

    let receipt = receipt_opt.ok_or_else(|| {
        (StatusCode::BAD_REQUEST, Json(json!({ "error": "Transaction not found on chain or pending" })))
    })?;

    let status = receipt.get("status").and_then(|v| v.as_str()).unwrap_or("0x0");
    if status != "0x1" {
        return Err((StatusCode::BAD_REQUEST, Json(json!({ "error": "Transaction reverted on chain" }))));
    }

    let to = receipt.get("to").and_then(|v| v.as_str()).unwrap_or("");
    if to.to_lowercase() != ARBITRUM_ESCROW_CONTRACT.to_lowercase() {
        return Err((StatusCode::BAD_REQUEST, Json(json!({ "error": "Transaction recipient mismatch" }))));
    }

    // Deduct stock
    let new_quantity = product.quantity - order.quantity;
    let new_status = if new_quantity <= 0.0 { "SoldOut" } else { "Published" };
    let _ = prod_coll.update_one(
        doc! { "product_id": &product.product_id },
        doc! { "$set": { "quantity": new_quantity, "status": new_status, "updated_at": Utc::now().to_rfc3339() } }
    ).await;

    // Mark order as Paid/Locked
    let _ = orders_coll.update_one(
        doc! { "order_id": &payload.order_id },
        doc! { "$set": { 
            "status": "Waiting for Farmer",
            "payment_status": "Locked",
            "escrow_status": "Active",
            "eth_amount": &payload.eth_amount,
            "eth_to_inr_rate": payload.eth_to_inr_rate,
            "blockchain_tx_hash": &payload.transaction_hash,
            "updated_at": Utc::now().to_rfc3339()
        } }
    ).await;

    // Create Notification for Farmer
    let notif = Notification {
        id: None,
        user_id: product.wallet_address.clone(),
        role: "Farmer".to_string(),
        notification_type: "Order".to_string(),
        title: "📦 New Order & Payment Locked".to_string(),
        description: format!("Buyer paid and locked {} ETH in Escrow for order {}.", payload.eth_amount, payload.order_id),
        related_order_id: Some(payload.order_id.clone()),
        is_read: false,
        created_at: Utc::now().to_rfc3339(),
    };
    let _ = db_state.db.collection::<Notification>("notifications").insert_one(notif).await;

    Ok(Json(json!({
        "message": "Payment verified and escrow locked successfully",
        "order_id": payload.order_id,
        "total_paid": order.payment.total,
        "blockchain_tx_hash": payload.transaction_hash,
        "expected_delivery": order.expected_delivery
    })))
}
