use axum::{
    extract::{State, Query},
    http::{HeaderMap, StatusCode},
    Json,
};
use mongodb::bson::doc;
use serde_json::{json, Value};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use crate::database::db::Database;
use crate::models::user::User;
use crate::models::product::Product;
use crate::models::order::Order;

use futures::stream::StreamExt;
use chrono::Utc;
use jsonwebtoken::{decode, Algorithm, DecodingKey, Validation};

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: String,
    role: String,
    exp: usize,
}

async fn is_admin(headers: &HeaderMap, db_state: &Arc<Database>) -> Result<String, (StatusCode, Json<Value>)> {
    let auth_header = headers.get("Authorization").and_then(|h| h.to_str().ok());
    let token = match auth_header {
        Some(header) if header.starts_with("Bearer ") => &header[7..],
        _ => {
            return Err((
                StatusCode::UNAUTHORIZED,
                Json(json!({ "error": "Missing or invalid Authorization header" })),
            ));
        }
    };

    let secret = std::env::var("JWT_SECRET").unwrap_or_else(|_| "super_secret_key".into());
    let token_data = match decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_ref()),
        &Validation::new(Algorithm::HS256),
    ) {
        Ok(data) => data,
        Err(_) => {
            return Err((
                StatusCode::UNAUTHORIZED,
                Json(json!({ "error": "Invalid or expired token" })),
            ));
        }
    };

    let user_coll = db_state.db.collection::<User>("users");
    let user = user_coll.find_one(doc! { "wallet_address": &token_data.claims.sub }).await.ok().flatten();

    if token_data.claims.role == "Admin" || user.as_ref().map(|u| u.role.as_str() == "Admin").unwrap_or(false) {
        Ok(token_data.claims.sub)
    } else {
        // Also allow platform admins whose wallet is registered in ADMIN_WALLETS env var
        let admin_env = std::env::var("ADMIN_WALLET").unwrap_or_default();
        if !admin_env.is_empty() && token_data.claims.sub.to_lowercase() == admin_env.to_lowercase() {
            Ok(token_data.claims.sub)
        } else {
            Err((
                StatusCode::FORBIDDEN,
                Json(json!({ "error": "Access forbidden: Admin privilege required" })),
            ))
        }
    }
}

pub async fn get_dashboard_stats(
    headers: HeaderMap,
    State(db_state): State<Arc<Database>>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let _admin = is_admin(&headers, &db_state).await?;

    let user_coll = db_state.db.collection::<User>("users");
    let prod_coll = db_state.db.collection::<Product>("products");
    let order_coll = db_state.db.collection::<Order>("orders");

    let total_users = user_coll.count_documents(doc! {}).await.unwrap_or(0);
    let total_farmers = user_coll.count_documents(doc! { "role": "Farmer" }).await.unwrap_or(0);
    let total_buyers = user_coll.count_documents(doc! { "role": "Buyer" }).await.unwrap_or(0);
    
    let total_products = prod_coll.count_documents(doc! {}).await.unwrap_or(0);
    
    let completed_orders = order_coll.count_documents(doc! { "status": "Completed" }).await.unwrap_or(0);
    let pending_orders = order_coll.count_documents(doc! { "status": { "$nin": ["Completed", "Delivered", "Rejected", "Cancelled"] } }).await.unwrap_or(0);

    // Calculate escrow locked amount
    let mut cursor = order_coll.find(doc! { "escrow_status": "Locked" }).await.map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Failed to query orders" })))
    })?;
    let mut escrow_locked = 0.0;
    while let Some(Ok(order)) = cursor.next().await {
        escrow_locked += order.payment.total;
    }

    // Calculate released payments
    let mut cursor_rel = order_coll.find(doc! { "escrow_status": "Released" }).await.map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Failed to query released orders" })))
    })?;
    let mut escrow_released = 0.0;
    while let Some(Ok(order)) = cursor_rel.next().await {
        escrow_released += order.payment.total;
    }

    let total_orders = order_coll.count_documents(doc! {}).await.unwrap_or(0);

    Ok(Json(json!({
        "total_users": total_users,
        "total_farmers": total_farmers,
        "total_buyers": total_buyers,
        "products_listed": total_products,
        "total_orders": total_orders,
        "orders_completed": completed_orders,
        "pending_orders": pending_orders,
        "escrow_locked": escrow_locked,
        "escrow_released": escrow_released,
        "network": "Arbitrum Sepolia",
        "smart_contracts_health": "Healthy",
        "blockchain_status": "Synced"
    })))
}

#[derive(Deserialize)]
pub struct UserQuery {
    pub role: Option<String>,
}

pub async fn get_users(
    headers: HeaderMap,
    Query(query): Query<UserQuery>,
    State(db_state): State<Arc<Database>>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let _admin = is_admin(&headers, &db_state).await?;
    
    let user_coll = db_state.db.collection::<User>("users");
    let mut filter = doc! {};
    if let Some(role) = query.role {
        filter.insert("role", role);
    }

    let mut cursor = user_coll.find(filter).await.map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Failed to fetch users" })))
    })?;
    
    let mut users = Vec::new();
    while let Some(Ok(user)) = cursor.next().await {
        users.push(user);
    }

    Ok(Json(json!({ "users": users })))
}

pub async fn get_smart_contracts(
    headers: HeaderMap,
    State(db_state): State<Arc<Database>>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let _admin = is_admin(&headers, &db_state).await?;

    let contracts = vec![
        json!({
            "name": "AgriChain Escrow Stylus",
            "address": "0x2C4A7e3D94bC4c10D204A81E99525Db724a73752",
            "status": "Active",
            "network": "Arbitrum Sepolia",
            "contract_type": "Arbitrum Stylus (Rust)",
            "last_verified": Utc::now().to_rfc3339(),
            "chain_id": 421614
        }),
        json!({
            "name": "AgriChain Product Registry Stylus",
            "address": "0x89D24A6b4CcB1B6fAA2625fE562bDD9a23260359",
            "status": "Active",
            "network": "Arbitrum Sepolia",
            "contract_type": "Arbitrum Stylus (Rust)",
            "last_verified": Utc::now().to_rfc3339(),
            "chain_id": 421614
        })
    ];

    Ok(Json(json!({ "contracts": contracts })))
}

pub async fn get_all_products_admin(
    headers: HeaderMap,
    State(db_state): State<Arc<Database>>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    is_admin(&headers, &db_state).await?;

    let collection = db_state.db.collection::<Product>("products");
    let users_coll = db_state.db.collection::<User>("users");
    
    let mut cursor = collection.find(doc! {}).await.map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Failed to fetch products" })))
    })?;

    let mut products = Vec::new();
    while let Some(result) = cursor.next().await {
        if let Ok(product) = result {
            let farmer = users_coll.find_one(doc! { "wallet_address": &product.wallet_address }).await.unwrap_or(None);
            let mut prod_json = serde_json::to_value(&product).unwrap();
            
            if let Some(user) = farmer {
                prod_json["farmer_name"] = json!(user.full_name);
            } else {
                prod_json["farmer_name"] = json!("Unknown");
            }
            products.push(prod_json);
        }
    }

    Ok(Json(json!({ "products": products })))
}

#[derive(Deserialize)]
pub struct AdminOrderQuery {
    pub status: Option<String>,
}

pub async fn get_admin_orders(
    headers: HeaderMap,
    Query(query): Query<AdminOrderQuery>,
    State(db_state): State<Arc<Database>>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    is_admin(&headers, &db_state).await?;

    let order_coll = db_state.db.collection::<Order>("orders");
    let user_coll = db_state.db.collection::<User>("users");
    let prod_coll = db_state.db.collection::<Product>("products");

    let mut filter = doc! {};
    if let Some(status) = query.status {
        if !status.is_empty() && status != "All" {
            filter.insert("status", status);
        }
    }

    let mut cursor = order_coll.find(filter).await.map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Failed to fetch orders" })))
    })?;

    let mut enriched_orders = Vec::new();
    while let Some(Ok(order)) = cursor.next().await {
        let buyer = user_coll.find_one(doc! { "wallet_address": &order.buyer_wallet }).await.unwrap_or(None);
        let product = prod_coll.find_one(doc! { "product_id": &order.product_id }).await.unwrap_or(None);
        
        let farmer = if let Some(ref p) = product {
            user_coll.find_one(doc! { "wallet_address": &p.wallet_address }).await.unwrap_or(None)
        } else {
            None
        };

        let mut order_json = serde_json::to_value(&order).unwrap();
        order_json["buyer_name"] = json!(buyer.as_ref().map(|u| u.full_name.clone()).unwrap_or_else(|| "Unknown Buyer".into()));
        order_json["buyer_phone"] = json!(buyer.as_ref().map(|u| u.phone_number.clone()).unwrap_or_default());
        order_json["product_name"] = json!(product.as_ref().map(|p| p.product_name.clone()).unwrap_or_else(|| "Unknown Crop".into()));
        order_json["farmer_name"] = json!(farmer.as_ref().map(|u| u.full_name.clone()).unwrap_or_else(|| "Unknown Farmer".into()));
        order_json["farmer_wallet"] = json!(product.as_ref().map(|p| p.wallet_address.clone()).unwrap_or_default());

        enriched_orders.push(order_json);
    }

    Ok(Json(json!({ "orders": enriched_orders })))
}
