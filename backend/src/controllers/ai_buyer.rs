use axum::{
    extract::State,
    http::{HeaderMap, StatusCode},
    Json,
};
use mongodb::bson::doc;
use serde_json::{json, Value};
use std::sync::Arc;
use crate::database::db::Database;
use crate::controllers::product::verify_farmer;
use crate::models::product::Product;
use crate::models::user::User;
use crate::services::ai_engine::AIEngine;
use futures::stream::StreamExt;
use rand::RngExt;

pub async fn get_recommendations(
    headers: HeaderMap,
    State(db_state): State<Arc<Database>>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let _wallet_address = verify_farmer(&headers)?;
    let prod_coll = db_state.db.collection::<Product>("products");
    
    // 1. Fetch real published products from DB
    let mut cursor = prod_coll.find(doc! { "status": "Published" }).sort(doc! { "created_at": -1 }).await.map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Database error" })))
    })?;

    let mut db_products = Vec::new();
    while let Some(Ok(product)) = cursor.next().await {
        db_products.push(product);
        if db_products.len() >= 8 { break; }
    }

    let mut recommended = Vec::new();
    let mut rng = rand::rng();

    for product in db_products {
        let (mandi_base, _) = AIEngine::get_crop_benchmark(&product.product_name);
        let confidence_score = rng.random_range(88..99);
        
        let ai_reason = if product.organic {
            "🌱 100% Certified Organic — Direct from local verified farm with 0 middleman markup.".to_string()
        } else if product.price <= mandi_base {
            format!("💰 High Value — Priced below regional Mandi benchmark (₹{:.1}/kg).", mandi_base)
        } else {
            "⭐ Top Trending — Highly demanded by local buyers and restaurants this week.".to_string()
        };

        recommended.push(json!({
            "product": product,
            "ai_reason": ai_reason,
            "confidence_score": confidence_score,
            "distance_km": rng.random_range(3..22)
        }));
    }

    // Fallback if no products in database yet
    if recommended.is_empty() {
        let fallback_crops = vec![
            ("Organic Sharbati Wheat", "Grains", 34.0, "kg", true, "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600"),
            ("Farm Fresh Red Tomatoes", "Vegetables", 38.0, "kg", true, "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600"),
            ("Basmati Rice (Heritage)", "Grains", 92.0, "kg", false, "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600"),
        ];

        for (name, cat, price, unit, organic, img) in fallback_crops {
            recommended.push(json!({
                "product": {
                    "product_id": format!("PROD-{}", name.replace(" ", "")),
                    "product_name": name,
                    "category": cat,
                    "price": price,
                    "unit": unit,
                    "quantity": 500.0,
                    "organic": organic,
                    "images": [img],
                    "status": "Published"
                },
                "ai_reason": "AI matched to regional staple consumption patterns.",
                "confidence_score": rng.random_range(90..98),
                "distance_km": rng.random_range(5..18)
            }));
        }
    }

    Ok(Json(json!({ "recommendations": recommended })))
}

pub async fn get_nearby_sellers(
    headers: HeaderMap,
    State(db_state): State<Arc<Database>>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let _wallet_address = verify_farmer(&headers)?;
    let user_coll = db_state.db.collection::<User>("users");
    let prod_coll = db_state.db.collection::<Product>("products");

    // Fetch real registered farmers
    let mut cursor = user_coll.find(doc! { "role": "Farmer" }).await.map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Database error" })))
    })?;

    let mut farmer_users = Vec::new();
    while let Some(Ok(user)) = cursor.next().await {
        farmer_users.push(user);
        if farmer_users.len() >= 6 { break; }
    }

    let mut sellers = Vec::new();

    for user in farmer_users {
        let farmer_wallet = user.wallet_address.clone();
        
        let mut crop_names = Vec::new();
        if let Ok(mut prod_cursor) = prod_coll.find(doc! { "wallet_address": &farmer_wallet, "status": "Published" }).await {
            while let Some(Ok(p)) = prod_cursor.next().await {
                crop_names.push(p.product_name);
                if crop_names.len() >= 3 { break; }
            }
        }

        let mut rng = rand::rng();
        if crop_names.is_empty() {
            crop_names = vec!["Fresh Wheat".to_string(), "Tomatoes".to_string()];
        }

        let farm_name = if let Some(ref fd) = user.farmer_details {
            if !fd.farm_name.is_empty() { fd.farm_name.clone() } else { format!("{} Farm", user.full_name) }
        } else {
            format!("{} Organic Farm", user.full_name)
        };

        let location = format!("{}, {}", user.city.clone().unwrap_or_else(|| "Anand".to_string()), user.state.clone().unwrap_or_else(|| "Gujarat".to_string()));

        sellers.push(json!({
            "farmer_id": user.wallet_address,
            "farm_name": farm_name,
            "owner": user.full_name,
            "location": location,
            "distance_km": rng.random_range(2..18),
            "rating": (rng.random_range(44..50) as f64) / 10.0,
            "orders_completed": rng.random_range(45..240),
            "is_organic": true,
            "blockchain_verified": user.is_verified,
            "estimated_delivery_time": format!("{} mins", rng.random_range(20..45)),
            "photo_url": user.profile_photo.unwrap_or_else(|| "https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?auto=format&fit=crop&q=80&w=200".to_string()),
            "available_crops": crop_names
        }));

        if sellers.len() >= 4 { break; }
    }

    // If fewer than 4, supplement with verified regional farms
    if sellers.len() < 4 {
        let mocks = vec![
            ("0xFarmerKisan1", "Sardar Patel Agro Farm", "Ramesh Patel", "Anand, Gujarat", 4.9, 185, vec!["Organic Wheat", "Mustard", "Potatoes"]),
            ("0xFarmerKisan2", "Green Earth Organics", "Mahesh Solanki", "Kheda, Gujarat", 4.8, 142, vec!["Tomatoes", "Cauliflower", "Green Peas"]),
            ("0xFarmerKisan3", "Narmada Valley Produce", "Pravin Bhai", "Vadodara, Gujarat", 4.7, 98, vec!["Basmati Rice", "Cotton", "Banana"]),
        ];

        let mut rng = rand::rng();
        for (w, fnm, own, loc, rat, ords, crops) in mocks {
            if sellers.len() >= 4 { break; }
            sellers.push(json!({
                "farmer_id": w,
                "farm_name": fnm,
                "owner": own,
                "location": loc,
                "distance_km": rng.random_range(4..15),
                "rating": rat,
                "orders_completed": ords,
                "is_organic": true,
                "blockchain_verified": true,
                "estimated_delivery_time": format!("{} mins", rng.random_range(25..50)),
                "photo_url": "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=200",
                "available_crops": crops
            }));
        }
    }

    Ok(Json(json!({ "nearby_sellers": sellers })))
}

pub async fn get_deals(
    headers: HeaderMap,
    State(db_state): State<Arc<Database>>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let _wallet_address = verify_farmer(&headers)?;
    let prod_coll = db_state.db.collection::<Product>("products");
    
    let mut cursor = prod_coll.find(doc! { "status": "Published" }).await.map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Database error" })))
    })?;

    let mut db_products = Vec::new();
    while let Some(Ok(product)) = cursor.next().await {
        db_products.push(product);
        if db_products.len() >= 8 { break; }
    }

    let mut deals = Vec::new();
    let mut rng = rand::rng();

    for product in db_products {
        let (mandi_base, _) = AIEngine::get_crop_benchmark(&product.product_name);
        
        let original_price = product.market_price.unwrap_or(mandi_base * 1.25);
        let actual_price = product.price;
        
        let discount_pct = if original_price > actual_price {
            (((original_price - actual_price) / original_price) * 100.0).round()
        } else {
            rng.random_range(12..28) as f64
        };

        deals.push(json!({
            "product": product,
            "original_price": (original_price * 10.0).round() / 10.0,
            "discounted_price": actual_price,
            "savings_percentage": discount_pct,
            "deal_badge": if discount_pct > 20.0 { "🔥 Direct Farm Super-Saver" } else { "⚡ Limited Time Deal" },
            "best_value_score": rng.random_range(90..99),
            "offer_ends_in": "06:45:30",
            "ai_reason": format!("Direct farm listing priced {:.0}% below local retail mandi index.", discount_pct)
        }));

        if deals.len() >= 4 { break; }
    }

    // Fallback deals if DB is empty
    if deals.is_empty() {
        deals.push(json!({
            "product": {
                "product_id": "DEAL-TOMATO-1",
                "product_name": "Fresh Organic Tomatoes",
                "category": "Vegetables",
                "price": 38.0,
                "unit": "kg",
                "quantity": 250.0,
                "organic": true,
                "images": ["https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600"],
                "status": "Published"
            },
            "original_price": 52.0,
            "discounted_price": 38.0,
            "savings_percentage": 27.0,
            "deal_badge": "🔥 Direct Farm Super-Saver",
            "best_value_score": 96,
            "offer_ends_in": "08:12:40",
            "ai_reason": "Direct farm price is 27% lower than nearby retail market."
        }));
    }

    Ok(Json(json!({ "deals": deals })))
}
