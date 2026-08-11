use axum::{
    extract::{Path, State},
    http::{HeaderMap, StatusCode},
    Json,
};
use mongodb::bson::{doc, oid::ObjectId};
use serde_json::{json, Value};
use std::sync::Arc;
use std::str::FromStr;
use crate::database::db::Database;
use crate::models::dto::{FarmerOrderResponse, OrderActionRequest};
use crate::models::order::Order;
use crate::models::product::Product;
use crate::models::user::User;
use crate::models::notification::Notification;
use crate::controllers::product::verify_farmer;
use chrono::Utc;
use futures::stream::StreamExt;

pub async fn get_orders(
    headers: HeaderMap,
    State(db_state): State<Arc<Database>>,
) -> Result<Json<Vec<Value>>, (StatusCode, Json<Value>)> {
    let wallet_address = verify_farmer(&headers)?;

    let user_coll = db_state.db.collection::<User>("users");
    let user_filter = doc! { "wallet_address": { "$regex": format!("^{}$", wallet_address), "$options": "i" } };
    let user = user_coll.find_one(user_filter).await.unwrap_or(None);

    let mut owner_filters = vec![
        doc! { "farmer_id": { "$regex": format!("^{}$", wallet_address), "$options": "i" } },
    ];
    if let Some(ref u) = user {
        if let Some(uid) = u.id {
            owner_filters.push(doc! { "farmer_id": uid.to_string() });
        }
    }

    let orders_coll = db_state.db.collection::<Order>("orders");
    let mut cursor = orders_coll.find(doc! { "$or": owner_filters })
        .sort(doc! { "created_at": -1 })
        .await.map_err(|e| {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": format!("Database error: {}", e) })))
        })?;

    let mut orders_json = Vec::new();
    let prod_coll = db_state.db.collection::<Product>("products");

    while let Some(result) = cursor.next().await {
        if let Ok(order) = result {
            let mut order_v = serde_json::to_value(&order).unwrap_or(json!({}));
            
            let prod_filter = if let Ok(oid) = ObjectId::from_str(&order.product_id) {
                doc! { "$or": [ doc! { "product_id": &order.product_id }, doc! { "_id": oid } ] }
            } else {
                doc! { "product_id": &order.product_id }
            };

            if let Ok(Some(prod)) = prod_coll.find_one(prod_filter).await {
                if let Some(obj) = order_v.as_object_mut() {
                    obj.insert("product_name".to_string(), json!(prod.product_name));
                    obj.insert("product_category".to_string(), json!(prod.category));
                    obj.insert("product_unit".to_string(), json!(prod.unit));
                    obj.insert("product_price".to_string(), json!(prod.price));
                    obj.insert("product_image".to_string(), json!(prod.images.first().cloned().unwrap_or_default()));
                }
            }

            orders_json.push(order_v);
        }
    }

    Ok(Json(orders_json))
}

pub async fn get_order_details(
    Path((order_id,)): Path<(String,)>,
    headers: HeaderMap,
    State(db_state): State<Arc<Database>>,
) -> Result<Json<FarmerOrderResponse>, (StatusCode, Json<Value>)> {
    let wallet_address = verify_farmer(&headers)?;

    let user_coll = db_state.db.collection::<User>("users");
    let user_filter = doc! { "wallet_address": { "$regex": format!("^{}$", wallet_address), "$options": "i" } };
    let user = user_coll.find_one(user_filter).await.unwrap_or(None);

    let mut owner_filters = vec![
        doc! { "farmer_id": { "$regex": format!("^{}$", wallet_address), "$options": "i" } },
    ];
    if let Some(ref u) = user {
        if let Some(uid) = u.id {
            owner_filters.push(doc! { "farmer_id": uid.to_string() });
        }
    }

    let orders_coll = db_state.db.collection::<Order>("orders");
    let order_filter = doc! {
        "order_id": &order_id,
        "$or": owner_filters
    };
    let order = orders_coll.find_one(order_filter).await.map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": format!("Database error: {}", e) })))
    })?.ok_or((StatusCode::NOT_FOUND, Json(json!({ "error": "Order not found" }))))?;

    let prod_coll = db_state.db.collection::<Product>("products");
    let prod_filter = if let Ok(oid) = ObjectId::from_str(&order.product_id) {
        doc! { "$or": [ doc! { "product_id": &order.product_id }, doc! { "_id": oid } ] }
    } else {
        doc! { "product_id": &order.product_id }
    };

    let product = prod_coll.find_one(prod_filter).await.unwrap_or(None).unwrap_or_else(|| {
        Product {
            id: None,
            product_id: order.product_id.clone(),
            wallet_address: wallet_address.clone(),
            farmer_id: "".to_string(),
            product_name: "Fresh Farm Crop".to_string(),
            category: "Vegetables".to_string(),
            sub_category: None,
            variety: "Standard".to_string(),
            description: "Direct fresh produce item".to_string(),
            quantity: order.quantity,
            unit: "kg".to_string(),
            price: if order.quantity > 0.0 { order.payment.product_price / order.quantity } else { order.payment.product_price },
            market_price: None,
            discount_price: None,
            negotiable: false,
            organic: true,
            certificate: None,
            harvest_date: "".to_string(),
            expected_shelf_life: "5 days".to_string(),
            ready_for_pickup: true,
            images: vec!["https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=600&auto=format&fit=crop&q=80".to_string()],
            location: crate::models::product::ProductLocation {
                village: "".to_string(),
                city: order.delivery_address.city.clone(),
                district: "".to_string(),
                state: order.delivery_address.state.clone(),
                country: "India".to_string(),
                pin_code: Some(order.delivery_address.pin_code.clone()),
                latitude: None,
                longitude: None,
            },
            availability: Some(crate::models::product::Availability {
                from: None,
                until: None,
                min_order_quantity: Some(1.0),
                max_order_quantity: None,
            }),
            delivery_options: Some(crate::models::product::DeliveryOptions {
                pickup_available: true,
                home_delivery: true,
                delivery_radius_km: Some(50),
                transportation_available: true,
            }),
            quality: Some(crate::models::product::QualityDetails {
                freshness: "Excellent".to_string(),
                moisture_level: None,
                storage_type: "Normal Storage".to_string(),
            }),
            status: crate::models::product::ProductStatus::Published,
            blockchain_hash: None,
            qr_code: None,
            created_at: Utc::now().to_rfc3339(),
            updated_at: Utc::now().to_rfc3339(),
        }
    });

    let buyer = user_coll.find_one(doc! { "wallet_address": { "$regex": format!("^{}$", order.buyer_wallet), "$options": "i" } }).await.unwrap_or(None).unwrap_or_else(|| User {
        id: None,
        wallet_address: order.buyer_wallet.clone(),
        role: crate::models::user::UserRole::Buyer,
        full_name: if !order.delivery_address.full_name.is_empty() { order.delivery_address.full_name.clone() } else { "Verified Buyer".to_string() },
        phone_number: order.delivery_address.phone_number.clone(),
        email: "".to_string(),
        country: "India".to_string(),
        state: Some(order.delivery_address.state.clone()),
        city: Some(order.delivery_address.city.clone()),
        preferred_language: "en".to_string(),
        profile_photo: None,
        farmer_details: None,
        buyer_details: None,
        status: "Active".to_string(),
        is_verified: true,
        created_at: Utc::now().to_rfc3339(),
        updated_at: Utc::now().to_rfc3339(),
    });

    Ok(Json(FarmerOrderResponse {
        order,
        product,
        buyer,
    }))
}

pub async fn update_order_status(
    Path((order_id,)): Path<(String,)>,
    headers: HeaderMap,
    State(db_state): State<Arc<Database>>,
    Json(payload): Json<OrderActionRequest>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let wallet_address = verify_farmer(&headers)?;

    let user_coll = db_state.db.collection::<User>("users");
    let user_filter = doc! { "wallet_address": { "$regex": format!("^{}$", wallet_address), "$options": "i" } };
    let user = user_coll.find_one(user_filter).await.unwrap_or(None);

    let mut owner_filters = vec![
        doc! { "farmer_id": { "$regex": format!("^{}$", wallet_address), "$options": "i" } },
    ];
    if let Some(ref u) = user {
        if let Some(uid) = u.id {
            owner_filters.push(doc! { "farmer_id": uid.to_string() });
        }
    }

    let orders_coll = db_state.db.collection::<Order>("orders");
    let order_filter = doc! {
        "order_id": &order_id,
        "$or": owner_filters
    };
    
    let order = orders_coll.find_one(order_filter).await.map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": format!("Database error: {}", e) })))
    })?.ok_or((StatusCode::NOT_FOUND, Json(json!({ "error": "Order not found" }))))?;

    let mut update_doc = doc! {
        "updated_at": Utc::now().to_rfc3339()
    };

    let action = payload.action.to_lowercase();
    match action.as_str() {
        "accept" => {
            if order.status != "Waiting for Farmer" && order.status != "Pending" {
                return Err((StatusCode::BAD_REQUEST, Json(json!({ "error": "Can only accept orders waiting for confirmation" }))));
            }
            update_doc.insert("status", "Accepted");
        },
        "reject" => {
            if order.status != "Waiting for Farmer" && order.status != "Pending" {
                return Err((StatusCode::BAD_REQUEST, Json(json!({ "error": "Can only reject orders waiting for confirmation" }))));
            }
            update_doc.insert("status", "Rejected");
            update_doc.insert("payment_status", "Refunded");
            update_doc.insert("escrow_status", "Cancelled");
            if let Some(r) = payload.reason {
                update_doc.insert("rejection_reason", r);
            }
            
            // Revert stock
            let prod_coll = db_state.db.collection::<Product>("products");
            let prod_filter = if let Ok(oid) = ObjectId::from_str(&order.product_id) {
                doc! { "$or": [ doc! { "product_id": &order.product_id }, doc! { "_id": oid } ] }
            } else {
                doc! { "product_id": &order.product_id }
            };
            let _ = prod_coll.update_one(
                prod_filter,
                doc! { "$inc": { "quantity": order.quantity }, "$set": { "status": "Published" } }
            ).await;
        },
        "pack" => {
            if order.status != "Accepted" {
                return Err((StatusCode::BAD_REQUEST, Json(json!({ "error": "Order must be accepted before packing" }))));
            }
            update_doc.insert("status", "Packed");
        },
        "ship" => {
            if order.status != "Packed" && order.status != "Accepted" {
                return Err((StatusCode::BAD_REQUEST, Json(json!({ "error": "Order must be packed before shipping" }))));
            }
            update_doc.insert("status", "Shipped");
            if let Some(t) = payload.tracking_number {
                update_doc.insert("tracking_number", t);
            }
            if let Some(c) = payload.courier {
                update_doc.insert("courier", c);
            }
        },
        _ => return Err((StatusCode::BAD_REQUEST, Json(json!({ "error": "Invalid action" })))),
    }

    orders_coll.update_one(
        doc! { "order_id": &order_id },
        doc! { "$set": update_doc }
    ).await.map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": format!("Failed to update order: {}", e) })))
    })?;

    // Create Notification for Buyer
    let notif = match action.as_str() {
        "accept" => Some(Notification {
            id: None,
            user_id: order.buyer_wallet.clone(),
            role: "Buyer".to_string(),
            notification_type: "Order".to_string(),
            title: "✅ Order Accepted".to_string(),
            description: format!("Your order {} has been confirmed by the farmer.", order_id),
            related_order_id: Some(order_id.clone()),
            is_read: false,
            created_at: Utc::now().to_rfc3339(),
        }),
        "pack" => Some(Notification {
            id: None,
            user_id: order.buyer_wallet.clone(),
            role: "Buyer".to_string(),
            notification_type: "Order".to_string(),
            title: "📦 Order Packed".to_string(),
            description: format!("Your order {} is packed and ready for dispatch.", order_id),
            related_order_id: Some(order_id.clone()),
            is_read: false,
            created_at: Utc::now().to_rfc3339(),
        }),
        "ship" => Some(Notification {
            id: None,
            user_id: order.buyer_wallet.clone(),
            role: "Buyer".to_string(),
            notification_type: "Order".to_string(),
            title: "🚚 Order Dispatched & Shipped".to_string(),
            description: format!("Your order {} has been shipped and is on the way.", order_id),
            related_order_id: Some(order_id.clone()),
            is_read: false,
            created_at: Utc::now().to_rfc3339(),
        }),
        "reject" => Some(Notification {
            id: None,
            user_id: order.buyer_wallet.clone(),
            role: "Buyer".to_string(),
            notification_type: "Order".to_string(),
            title: "❌ Order Cancelled/Rejected".to_string(),
            description: format!("Order {} was rejected by the farmer. Escrow refund initiated.", order_id),
            related_order_id: Some(order_id.clone()),
            is_read: false,
            created_at: Utc::now().to_rfc3339(),
        }),
        _ => None,
    };

    if let Some(n) = notif {
        let _ = db_state.db.collection::<Notification>("notifications").insert_one(n).await;
    }

    Ok(Json(json!({ "message": "Order status updated successfully" })))
}
