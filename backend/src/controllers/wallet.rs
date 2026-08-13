use axum::{
    extract::State,
    http::{HeaderMap, StatusCode},
    Json,
};
use mongodb::bson::doc;
use serde_json::{json, Value};
use std::sync::Arc;
use crate::database::db::Database;
use jsonwebtoken::{decode, Algorithm, DecodingKey, Validation};
use serde::{Deserialize, Serialize};
use std::env;
use crate::models::order::Order;
use crate::models::transaction::Transaction;
use futures::stream::StreamExt;



#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: String,
    role: String,
    exp: usize,
}

fn get_user_wallet(headers: &HeaderMap) -> Result<String, (StatusCode, Json<Value>)> {
    let auth_header = headers.get("Authorization")
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.strip_prefix("Bearer "))
        .ok_or((StatusCode::UNAUTHORIZED, Json(json!({ "error": "Missing or invalid token" }))))?;

    let secret = env::var("JWT_SECRET").unwrap_or_else(|_| "super_secret_key".into());
    let token_data = decode::<Claims>(
        auth_header,
        &DecodingKey::from_secret(secret.as_ref()),
        &Validation::new(Algorithm::HS256)
    ).map_err(|_| (StatusCode::UNAUTHORIZED, Json(json!({ "error": "Invalid or expired token" }))))?;

    Ok(token_data.claims.sub)
}

pub async fn get_wallet_balance(
    headers: HeaderMap,
    State(db_state): State<Arc<Database>>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let wallet_address = get_user_wallet(&headers)?;

    let orders_coll = db_state.db.collection::<Order>("orders");
    
    // Calculate total locked escrow (for orders where this wallet is buyer or farmer AND escrow_status is Active)
    let mut cursor = orders_coll.find(doc! {
        "$or": [ { "buyer_wallet": &wallet_address }, { "farmer_id": &wallet_address } ],
        "escrow_status": "Active"
    }).await.map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Database error" })))
    })?;

    let mut locked_eth = 0.0;
    while let Some(Ok(order)) = cursor.next().await {
        if let Some(eth_amount_str) = &order.eth_amount {
            if let Ok(eth_amt) = eth_amount_str.parse::<f64>() {
                locked_eth += eth_amt;
                continue;
            }
        }
        locked_eth += order.payment.total * 0.00000555;
    }

    // Mock an ETH balance for the sandbox. In a real app, Wagmi fetches this on frontend, 
    // but having it in backend is requested for API completeness.
    let eth_price = 4087.12; // Mock ETH price
    let available_eth = 1.99; // Mock static available balance

    Ok(Json(json!({
        "available_balance": available_eth,
        "locked_escrow": locked_eth,
        "total_eth": available_eth + locked_eth,
        "usd_value": (available_eth * eth_price)
    })))
}

pub async fn get_wallet_transactions(
    headers: HeaderMap,
    State(db_state): State<Arc<Database>>,
) -> Result<Json<Vec<Transaction>>, (StatusCode, Json<Value>)> {
    let wallet_address = get_user_wallet(&headers)?;

    let orders_coll = db_state.db.collection::<Order>("orders");
    
    let mut cursor = orders_coll.find(doc! {
        "$or": [ { "buyer_wallet": &wallet_address }, { "farmer_id": &wallet_address } ]
    }).await.map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Database error" })))
    })?;

    let mut transactions = Vec::new();

    while let Some(Ok(order)) = cursor.next().await {
        // If order has a locking tx hash, synthesize a Lock transaction
        if let Some(tx_hash) = order.blockchain_tx_hash.clone() {
            let amount = if let Some(eth_amount_str) = &order.eth_amount {
                eth_amount_str.parse::<f64>().unwrap_or(order.payment.total * 0.00000555)
            } else {
                order.payment.total * 0.00000555
            };
            transactions.push(Transaction {
                tx_hash,
                tx_type: "Escrow Lock".to_string(),
                amount,
                status: "Completed".to_string(),
                network: "Arbitrum Sepolia".to_string(),
                gas_fee: Some(0.0009),
                sender_wallet: order.buyer_wallet.clone(),
                receiver_wallet: "SmartContract_0xEscrow".to_string(),
                related_order_id: Some(order.order_id.clone()),
                created_at: order.created_at,
            });
        }


    }

    // Sort descending by date
    transactions.sort_by(|a, b| b.created_at.cmp(&a.created_at));

    Ok(Json(transactions))
}

pub async fn get_wallet_analytics(
    headers: HeaderMap,
    State(db_state): State<Arc<Database>>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let wallet_address = get_user_wallet(&headers)?;
    let orders_coll = db_state.db.collection::<Order>("orders");

    // Fetch all orders for this wallet to compute stats
    let mut cursor = orders_coll.find(doc! {
        "$or": [ { "buyer_wallet": &wallet_address }, { "farmer_id": &wallet_address } ]
    }).await.map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Database error" })))
    })?;

    let mut orders_paid = 0;
    let mut orders_received = 0;
    let mut total_spent = 0.0;
    let mut total_earned = 0.0;
    let mut pending_escrows = 0;

    while let Some(Ok(order)) = cursor.next().await {
        let is_buyer = order.buyer_wallet == wallet_address;
        let is_farmer = order.farmer_id == wallet_address;
        let amount = order.payment.total;

        if is_buyer {
            orders_paid += 1;
            total_spent += amount;
            if order.escrow_status == "Active" {
                pending_escrows += 1;
            }
        }
        
        if is_farmer {
            orders_received += 1;
            if order.escrow_status == "Completed" {
                total_earned += amount;
            } else if order.escrow_status == "Active" {
                pending_escrows += 1;
            }
        }
    }

    // Generate mock monthly data for the chart (last 6 months)
    let monthly_spending = vec![1200, 800, 2400, 1500, 900, 3100];
    let monthly_earnings = vec![4500, 3200, 5100, 4800, 2900, 6200];

    Ok(Json(json!({
        "orders_paid": orders_paid,
        "orders_received": orders_received,
        "total_spent_usd": total_spent,
        "total_earned_usd": total_earned,
        "pending_escrows": pending_escrows,
        "monthly_spending": monthly_spending,
        "monthly_earnings": monthly_earnings
    })))
}
