use axum::{
    extract::{Path, State, Query},
    http::{HeaderMap, StatusCode},
    Json,
};
use mongodb::bson::{doc, oid::ObjectId};
use serde_json::{json, Value};
use std::sync::Arc;
use crate::database::db::Database;
use crate::models::dto::{CreateProductDto, UpdateProductStatusDto, SearchFilterDto, ProductDetailsResponse, FarmerSummary, ReviewStats};
use crate::models::product::{Product, ProductStatus};
use crate::models::user::User;
use jsonwebtoken::{decode, Algorithm, DecodingKey, Validation};
use serde::{Deserialize, Serialize};
use std::env;
use std::str::FromStr;
use chrono::Utc;
use uuid::Uuid;
use futures::stream::StreamExt;

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub role: String,
    pub exp: usize,
}

pub fn get_user_claims(headers: &HeaderMap) -> Result<Claims, (StatusCode, Json<Value>)> {
    let auth_header = headers
        .get("Authorization")
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.strip_prefix("Bearer "))
        .ok_or((
            StatusCode::UNAUTHORIZED,
            Json(json!({ "error": "Missing or invalid token" })),
        ))?;

    let secret = env::var("JWT_SECRET").unwrap_or_else(|_| "super_secret_key".into());
    let token_data = decode::<Claims>(
        auth_header,
        &DecodingKey::from_secret(secret.as_ref()),
        &Validation::new(Algorithm::HS256),
    )
    .map_err(|_| {
        (
            StatusCode::UNAUTHORIZED,
            Json(json!({ "error": "Invalid or expired token" })),
        )
    })?;

    Ok(token_data.claims)
}

pub fn verify_farmer(headers: &HeaderMap) -> Result<String, (StatusCode, Json<Value>)> {
    let claims = get_user_claims(headers)?;
    if claims.role != "Farmer" {
        return Err((
            StatusCode::FORBIDDEN,
            Json(json!({ "error": "Access denied" })),
        ));
    }
    Ok(claims.sub)
}

pub async fn create_product(
    headers: HeaderMap,
    State(db_state): State<Arc<Database>>,
    Json(payload): Json<CreateProductDto>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let wallet_address = verify_farmer(&headers)?;
    
    // Check if farmer profile is verified or pending
    let user_coll = db_state.db.collection::<User>("users");
    let filter = doc! { "wallet_address": { "$regex": format!("^{}$", wallet_address), "$options": "i" } };
    let user = user_coll.find_one(filter).await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": "Database error"}))))?
        .ok_or((StatusCode::NOT_FOUND, Json(json!({"error": "User not found"}))))?;
        
    let user_id = user.id.unwrap().to_string();
    let wallet_address = user.wallet_address;
    
    // In a real app we might reject if profile is completely empty. We assume the frontend checks it.
    
    let prod_id = format!("PRD-{}", Uuid::new_v4().to_string().chars().take(8).collect::<String>().to_uppercase());
    
    let status = if payload.save_as_draft {
        ProductStatus::Draft
    } else {
        ProductStatus::PendingVerification // Or Published, depending on rules
    };

    let blockchain_hash = if !payload.save_as_draft {
        Some(format!("0x{}", Uuid::new_v4().to_string().replace("-", "")))
    } else {
        None
    };

    // QR Code generation normally happens on frontend, but we can store a link to the product.
    let qr_code = if !payload.save_as_draft {
        Some(format!("https://agrichain.com/products/{}", prod_id))
    } else {
        None
    };

    let product = Product {
        id: None,
        product_id: prod_id.clone(),
        wallet_address,
        farmer_id: user_id.clone(),
        product_name: payload.product_name,
        category: payload.category,
        sub_category: payload.sub_category,
        variety: payload.variety,
        description: payload.description,
        quantity: payload.quantity,
        unit: payload.unit,
        price: payload.price,
        market_price: payload.market_price,
        discount_price: payload.discount_price,
        negotiable: payload.negotiable,
        organic: payload.organic,
        certificate: payload.certificate,
        harvest_date: payload.harvest_date,
        expected_shelf_life: payload.expected_shelf_life,
        ready_for_pickup: payload.ready_for_pickup,
        availability: payload.availability,
        delivery_options: payload.delivery_options,
        quality: payload.quality,
        images: payload.images,
        location: payload.location,
        status,
        blockchain_hash,
        qr_code,
        created_at: Utc::now().to_rfc3339(),
        updated_at: Utc::now().to_rfc3339(),
    };

    let collection = db_state.db.collection::<Product>("products");
    let result = collection.insert_one(product.clone()).await.map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Failed to save product" })))
    })?;

    Ok(Json(json!({
        "message": if payload.save_as_draft { "Draft saved" } else { "Product published successfully" },
        "id": result.inserted_id,
        "product_id": prod_id
    })))
}

pub async fn get_farmer_products(
    headers: HeaderMap,
    State(db_state): State<Arc<Database>>,
) -> Result<Json<Vec<Product>>, (StatusCode, Json<Value>)> {
    let wallet_address = verify_farmer(&headers)?;

    let user_coll = db_state.db.collection::<crate::models::user::User>("users");
    let user = user_coll.find_one(doc! { "wallet_address": { "$regex": format!("^{}$", wallet_address), "$options": "i" } }).await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Database error" }))))?
        .ok_or((StatusCode::NOT_FOUND, Json(json!({ "error": "User not found" }))))?;
        
    let farmer_id = user.id.unwrap().to_string();

    let collection = db_state.db.collection::<Product>("products");
    let filter = doc! {
        "$or": [
            { "wallet_address": { "$regex": format!("^{}$", wallet_address), "$options": "i" } },
            { "farmer_id": farmer_id }
        ]
    };
    
    let mut cursor = collection.find(filter).await.map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Failed to fetch products" })))
    })?;

    let mut products = Vec::new();
    while let Some(result) = cursor.next().await {
        if let Ok(product) = result {
            products.push(product);
        }
    }

    Ok(Json(products))
}

pub async fn get_all_products(
    State(db_state): State<Arc<Database>>,
) -> Result<Json<Vec<Product>>, (StatusCode, Json<Value>)> {
    let collection = db_state.db.collection::<Product>("products");
    // Only fetch published products for public view
    let filter = doc! { "status": "Published" };
    
    let mut cursor = collection.find(filter).await.map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Failed to fetch products" })))
    })?;

    let mut products = Vec::new();
    while let Some(result) = cursor.next().await {
        if let Ok(product) = result {
            products.push(product);
        }
    }

    Ok(Json(products))
}

pub async fn get_product(
    Path((id,)): Path<(String,)>,
    State(db_state): State<Arc<Database>>,
) -> Result<Json<ProductDetailsResponse>, (StatusCode, Json<Value>)> {
    let collection = db_state.db.collection::<Product>("products");
    
    let filter = if let Ok(oid) = ObjectId::from_str(&id) {
        doc! { "_id": oid }
    } else {
        doc! { "product_id": &id }
    };

    let product = collection.find_one(filter).await.map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Database error" })))
    })?.ok_or((StatusCode::NOT_FOUND, Json(json!({ "error": "Product not found" }))))?;

    // Fetch Farmer Details
    let users_coll = db_state.db.collection::<User>("users");
    
    // We expect the wallet address here in the Product struct or we can look up by farmer_id.
    let user = users_coll.find_one(doc! { "wallet_address": &product.wallet_address }).await.unwrap_or(None);
    
    let farmer_summary = if let Some(u) = user {
        let details = u.farmer_details.unwrap_or_default();
        FarmerSummary {
            name: u.full_name,
            profile_photo: u.profile_photo,
            farm_name: details.farm_name,
            experience: details.experience,
            location: format!("{}, {}", u.city.unwrap_or_default(), u.state.unwrap_or_default()),
            rating: details.average_rating.unwrap_or(0.0),
            completed_orders: details.total_products.unwrap_or(0),
            member_since: chrono::DateTime::parse_from_rfc3339(&u.created_at).map(|dt| dt.format("%Y").to_string()).unwrap_or_else(|_| "2024".to_string()),
            wallet_address: u.wallet_address,
            response_time: "Responds in 10 min".to_string(),
            is_verified: u.is_verified,
            email: u.email,
            phone_number: u.phone_number,
        }
    } else {
        FarmerSummary {
            name: "Unknown Farmer".to_string(),
            profile_photo: None,
            farm_name: "Unknown Farm".to_string(),
            experience: "N/A".to_string(),
            location: "N/A".to_string(),
            rating: 0.0,
            completed_orders: 0,
            member_since: "N/A".to_string(),
            wallet_address: product.wallet_address.clone(),
            response_time: "N/A".to_string(),
            is_verified: false,
            email: "".to_string(),
            phone_number: "".to_string(),
        }
    };

    let review_coll = db_state.db.collection::<crate::models::review::Review>("reviews");
    let mut reviews_cursor = review_coll.find(doc! { "product_id": &product.product_id }).await.unwrap_or_else(|_| panic!("Failed to fetch reviews"));
    
    let mut total_reviews = 0;
    let mut sum_rating = 0.0;
    let mut distribution = std::collections::HashMap::new();
    for i in 1..=5 {
        distribution.insert(i.to_string(), 0);
    }

    while let Some(Ok(review)) = reviews_cursor.next().await {
        total_reviews += 1;
        sum_rating += review.rating as f64;
        let count = distribution.entry(review.rating.to_string()).or_insert(0);
        *count += 1;
    }

    let average_rating = if total_reviews > 0 {
        (sum_rating / total_reviews as f64 * 10.0).round() / 10.0
    } else {
        0.0
    };

    let review_stats = ReviewStats {
        average_rating,
        total_reviews,
        rating_distribution: distribution,
    };

    Ok(Json(ProductDetailsResponse {
        product,
        farmer: farmer_summary,
        review_stats,
    }))
}

pub async fn update_product(
    headers: HeaderMap,
    Path((id,)): Path<(String,)>,
    State(db_state): State<Arc<Database>>,
    Json(payload): Json<CreateProductDto>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let wallet_address = verify_farmer(&headers)?;
    let collection = db_state.db.collection::<Product>("products");

    let mut id_filters = vec![
        doc! { "product_id": &id },
        doc! { "_id": &id },
    ];
    if let Ok(oid) = ObjectId::from_str(&id) {
        id_filters.push(doc! { "_id": oid });
    }

    let existing = collection.find_one(doc! { "$or": &id_filters }).await.map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": format!("Database error: {}", e) })))
    })?.ok_or((StatusCode::NOT_FOUND, Json(json!({ "error": "Product not found" }))))?;

    let user_coll = db_state.db.collection::<User>("users");
    let user_filter = doc! { "wallet_address": { "$regex": format!("^{}$", wallet_address), "$options": "i" } };
    let user = user_coll.find_one(user_filter).await.unwrap_or(None);

    let is_owner = existing.wallet_address.eq_ignore_ascii_case(&wallet_address)
        || user.as_ref().map(|u| u.id.map(|uid| uid.to_string() == existing.farmer_id).unwrap_or(false)).unwrap_or(false)
        || user.as_ref().map(|u| format!("{:?}", u.role) == "Admin").unwrap_or(false);

    if !is_owner {
        return Err((StatusCode::FORBIDDEN, Json(json!({ "error": "You do not have permission to update this product" }))));
    }

    let status = if payload.save_as_draft {
        ProductStatus::Draft
    } else {
        ProductStatus::Published
    };

    let status_val = mongodb::bson::to_bson(&status).map_err(|_| {
        (StatusCode::BAD_REQUEST, Json(json!({"error": "Invalid status"})))
    })?;

    let location_val = mongodb::bson::to_bson(&payload.location).unwrap_or(mongodb::bson::Bson::Null);
    let availability_val = mongodb::bson::to_bson(&payload.availability).unwrap_or(mongodb::bson::Bson::Null);
    let delivery_val = mongodb::bson::to_bson(&payload.delivery_options).unwrap_or(mongodb::bson::Bson::Null);
    let quality_val = mongodb::bson::to_bson(&payload.quality).unwrap_or(mongodb::bson::Bson::Null);

    let update = doc! {
        "$set": {
            "product_name": &payload.product_name,
            "category": &payload.category,
            "sub_category": &payload.sub_category,
            "variety": &payload.variety,
            "description": &payload.description,
            "quantity": payload.quantity,
            "unit": &payload.unit,
            "price": payload.price,
            "market_price": payload.market_price,
            "discount_price": payload.discount_price,
            "negotiable": payload.negotiable,
            "organic": payload.organic,
            "certificate": &payload.certificate,
            "harvest_date": &payload.harvest_date,
            "expected_shelf_life": &payload.expected_shelf_life,
            "ready_for_pickup": payload.ready_for_pickup,
            "images": &payload.images,
            "location": location_val,
            "availability": availability_val,
            "delivery_options": delivery_val,
            "quality": quality_val,
            "status": status_val,
            "updated_at": Utc::now().to_rfc3339()
        }
    };

    collection.update_one(doc! { "$or": id_filters }, update).await.map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": format!("Failed to update: {}", e)})))
    })?;

    Ok(Json(json!({
        "message": "Product updated successfully",
        "product_id": existing.product_id
    })))
}

pub async fn update_product_status(
    headers: HeaderMap,
    Path((id,)): Path<(String,)>,
    State(db_state): State<Arc<Database>>,
    Json(payload): Json<UpdateProductStatusDto>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let wallet_address = verify_farmer(&headers)?;
    let collection = db_state.db.collection::<Product>("products");
    
    let mut id_filters = vec![
        doc! { "product_id": &id },
        doc! { "_id": &id },
    ];
    if let Ok(oid) = ObjectId::from_str(&id) {
        id_filters.push(doc! { "_id": oid });
    }
    
    let existing = collection.find_one(doc! { "$or": &id_filters }).await.map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": format!("Database error: {}", e) })))
    })?.ok_or((StatusCode::NOT_FOUND, Json(json!({ "error": "Product not found" }))))?;

    let user_coll = db_state.db.collection::<User>("users");
    let user_filter = doc! { "wallet_address": { "$regex": format!("^{}$", wallet_address), "$options": "i" } };
    let user = user_coll.find_one(user_filter).await.unwrap_or(None);

    let is_owner = existing.wallet_address.eq_ignore_ascii_case(&wallet_address)
        || user.as_ref().map(|u| u.id.map(|uid| uid.to_string() == existing.farmer_id).unwrap_or(false)).unwrap_or(false)
        || user.as_ref().map(|u| format!("{:?}", u.role) == "Admin").unwrap_or(false);

    if !is_owner {
        return Err((StatusCode::FORBIDDEN, Json(json!({ "error": "You do not have permission to change status" }))));
    }

    let status_val = mongodb::bson::to_bson(&payload.status).map_err(|_| {
        (StatusCode::BAD_REQUEST, Json(json!({"error": "Invalid status"})))
    })?;

    let update = doc! {
        "$set": {
            "status": status_val,
            "updated_at": Utc::now().to_rfc3339()
        }
    };

    collection.update_one(doc! { "$or": id_filters }, update).await.map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": "Failed to update product"})))
    })?;

    Ok(Json(json!({ "message": "Product status updated" })))
}

pub async fn delete_product(
    headers: HeaderMap,
    Path((id,)): Path<(String,)>,
    State(db_state): State<Arc<Database>>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let wallet_address = verify_farmer(&headers)?;
    let collection = db_state.db.collection::<Product>("products");
    
    let mut id_filters = vec![
        doc! { "product_id": &id },
        doc! { "_id": &id },
    ];
    if let Ok(oid) = ObjectId::from_str(&id) {
        id_filters.push(doc! { "_id": oid });
    }

    let product = collection.find_one(doc! { "$or": &id_filters }).await.map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": format!("Database error: {}", e) })))
    })?;

    let product = match product {
        Some(p) => p,
        None => return Err((StatusCode::NOT_FOUND, Json(json!({ "error": "Product not found" })))),
    };

    let user_coll = db_state.db.collection::<User>("users");
    let user_filter = doc! { "wallet_address": { "$regex": format!("^{}$", wallet_address), "$options": "i" } };
    let user = user_coll.find_one(user_filter).await.unwrap_or(None);
    
    let is_owner = product.wallet_address.eq_ignore_ascii_case(&wallet_address)
        || user.as_ref().map(|u| u.id.map(|uid| uid.to_string() == product.farmer_id).unwrap_or(false)).unwrap_or(false)
        || user.as_ref().map(|u| format!("{:?}", u.role) == "Admin").unwrap_or(false);

    if !is_owner {
        return Err((StatusCode::FORBIDDEN, Json(json!({ "error": "You do not have permission to delete this product listing" }))));
    }

    let result = collection.delete_one(doc! { "$or": id_filters }).await.map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": format!("Failed to delete: {}", e) })))
    })?;

    if result.deleted_count == 0 {
        return Err((StatusCode::NOT_FOUND, Json(json!({ "error": "Product could not be deleted" }))));
    }

    Ok(Json(json!({ "message": "Product deleted successfully" })))
}

pub async fn get_recommended_products(
    State(db_state): State<Arc<Database>>,
) -> Result<Json<Vec<Product>>, (StatusCode, Json<Value>)> {
    let collection = db_state.db.collection::<Product>("products");
    let mut cursor = collection.find(doc! { "status": "Published" }).limit(8).await.map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Failed to fetch products" })))
    })?;

    let mut products = Vec::new();
    while let Some(result) = cursor.next().await {
        match result {
            Ok(product) => products.push(product),
            Err(e) => tracing::error!("Failed to deserialize product: {:?}", e),
        }
    }
    Ok(Json(products))
}

pub async fn get_latest_products(
    State(db_state): State<Arc<Database>>,
) -> Result<Json<Vec<Product>>, (StatusCode, Json<Value>)> {
    let collection = db_state.db.collection::<Product>("products");
    let mut cursor = collection.find(doc! { "status": "Published" }).sort(doc! { "created_at": -1 }).limit(10).await.map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Failed to fetch products" })))
    })?;

    let mut products = Vec::new();
    while let Some(result) = cursor.next().await {
        if let Ok(product) = result {
            products.push(product);
        }
    }
    Ok(Json(products))
}

pub async fn get_organic_products(
    State(db_state): State<Arc<Database>>,
) -> Result<Json<Vec<Product>>, (StatusCode, Json<Value>)> {
    let collection = db_state.db.collection::<Product>("products");
    let mut cursor = collection.find(doc! { "status": "Published", "organic": true }).limit(10).await.map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Failed to fetch products" })))
    })?;

    let mut products = Vec::new();
    while let Some(result) = cursor.next().await {
        if let Ok(product) = result {
            products.push(product);
        }
    }
    Ok(Json(products))
}

pub async fn get_popular_products(
    State(db_state): State<Arc<Database>>,
) -> Result<Json<Vec<Product>>, (StatusCode, Json<Value>)> {
    let collection = db_state.db.collection::<Product>("products");
    let mut cursor = collection.find(doc! { "status": "Published" }).limit(10).await.map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Failed to fetch products" })))
    })?;

    let mut products = Vec::new();
    while let Some(result) = cursor.next().await {
        if let Ok(product) = result {
            products.push(product);
        }
    }
    Ok(Json(products))
}

pub async fn search_and_filter_products(
    Query(params): Query<SearchFilterDto>,
    State(db_state): State<Arc<Database>>,
) -> Result<Json<Vec<Product>>, (StatusCode, Json<Value>)> {
    let collection = db_state.db.collection::<Product>("products");
    let mut filter = doc! { "status": "Published" };

    if let Some(q) = params.q {
        filter.insert("product_name", doc! { "$regex": q, "$options": "i" });
    }
    if let Some(category) = params.category {
        filter.insert("category", doc! { "$regex": category, "$options": "i" });
    }
    if let Some(organic) = params.organic {
        filter.insert("organic", organic);
    }
    
    // Price range
    let mut price_filter = doc! {};
    if let Some(min_p) = params.min_price {
        price_filter.insert("$gte", min_p);
    }
    if let Some(max_p) = params.max_price {
        price_filter.insert("$lte", max_p);
    }
    if !price_filter.is_empty() {
        filter.insert("price", price_filter);
    }

    let mut cursor = collection.find(filter).await.map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Failed to fetch products" })))
    })?;

    let mut products = Vec::new();
    while let Some(result) = cursor.next().await {
        if let Ok(product) = result {
            products.push(product);
        }
    }
    Ok(Json(products))
}

pub async fn get_product_reviews(
    Path((product_id,)): Path<(String,)>,
    State(db_state): State<Arc<Database>>,
) -> Result<Json<Vec<crate::models::review::Review>>, (StatusCode, Json<Value>)> {
    let review_coll = db_state.db.collection::<crate::models::review::Review>("reviews");
    
    let find_options = mongodb::options::FindOptions::builder().sort(doc! { "created_at": -1 }).build();
    let mut cursor = review_coll.find(doc! { "product_id": &product_id }).with_options(find_options).await.map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Database error" })))
    })?;

    let mut reviews = Vec::new();
    while let Some(Ok(review)) = cursor.next().await {
        reviews.push(review);
    }

    Ok(Json(reviews))
}

pub async fn get_similar_products(
    Path((id,)): Path<(String,)>,
    State(db_state): State<Arc<Database>>,
) -> Result<Json<Vec<Product>>, (StatusCode, Json<Value>)> {
    let collection = db_state.db.collection::<Product>("products");
    let mut cursor = collection.find(doc! { "status": "Published" }).limit(4).await.unwrap();
    let mut products = Vec::new();
    while let Some(result) = cursor.next().await {
        if let Ok(p) = result {
            if p.product_id != id {
                products.push(p);
            }
        }
    }
    Ok(Json(products))
}

pub async fn get_product_qrcode(
    Path((id,)): Path<(String,)>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let qr_data = json!({
        "product_id": id,
        "verification_url": format!("https://agrichain.com/verify/{}", id),
        "timestamp": Utc::now().to_rfc3339()
    });
    Ok(Json(qr_data))
}
