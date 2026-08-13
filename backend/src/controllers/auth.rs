use axum::{extract::State, Json, http::StatusCode, http::HeaderMap};
use std::sync::Arc;
use crate::database::db::Database;
use crate::models::dto::{RegisterRequest, LoginRequestDto, LoginRequestResponse, LoginVerifyDto, AuthResponse};
use crate::services::auth::AuthService;
use crate::services::nonce_service::NonceService;
use crate::services::signature_service::SignatureService;
use crate::models::user::User;
use mongodb::bson::doc;
use serde_json::{json, Value};
use jsonwebtoken::{decode, DecodingKey, Validation, Algorithm};
use std::env;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: String,
    role: String,
    exp: usize,
}

pub async fn register(
    State(db_state): State<Arc<Database>>,
    Json(payload): Json<RegisterRequest>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    
    match AuthService::register(&db_state.db, payload).await {
        Ok(response) => Ok(Json(json!(response))),
        Err(err) => {
            let error_response = json!({ "error": err });
            Err((StatusCode::BAD_REQUEST, Json(error_response)))
        }
    }
}

#[axum::debug_handler]
pub async fn login_request(
    State(db_state): State<Arc<Database>>,
    Json(payload): Json<LoginRequestDto>,
) -> Result<Json<LoginRequestResponse>, (StatusCode, Json<Value>)> {
    match NonceService::generate_nonce(&db_state.db, &payload.wallet_address).await {
        Ok(nonce) => Ok(Json(LoginRequestResponse {
            message: format!("Welcome to AgriChain!\n\nPlease sign this message to verify your wallet ownership.\n\nNonce: {}", nonce),
            nonce,
        })),
        Err(err) => Err((StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": err })))),
    }
}

pub async fn login_verify(
    State(db_state): State<Arc<Database>>,
    Json(payload): Json<LoginVerifyDto>,
) -> Result<Json<AuthResponse>, (StatusCode, Json<Value>)> {
    
    // 1. Get and delete nonce
    let nonce = match NonceService::get_and_delete_nonce(&db_state.db, &payload.wallet_address).await {
        Ok(n) => n,
        Err(err) => return Err((StatusCode::BAD_REQUEST, Json(json!({ "error": err })))),
    };

    // 2. Verify Signature
    if let Err(err) = SignatureService::verify_signature(&payload.wallet_address, &nonce, &payload.signature) {
        return Err((StatusCode::UNAUTHORIZED, Json(json!({ "error": err }))));
    }

    // 3. Find User
    let collection = db_state.db.collection::<User>("users");
    let filter = doc! { "wallet_address": { "$regex": format!("^{}$", payload.wallet_address), "$options": "i" } };
    let user = match collection.find_one(filter).await {
        Ok(Some(u)) => u,
        Ok(None) => return Err((StatusCode::NOT_FOUND, Json(json!({ "error": "Wallet not registered. Please create an account." })))),
        Err(_) => return Err((StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Database error" })))),
    };

    // 4. Issue JWT
    let secret = env::var("JWT_SECRET").unwrap_or_else(|_| "super_secret_key".into());
    let expiration = chrono::Utc::now() + chrono::Duration::try_days(7).unwrap();
    let claims = Claims {
        sub: user.wallet_address.clone(),
        role: format!("{:?}", user.role),
        exp: expiration.timestamp() as usize,
    };
    
    let token = jsonwebtoken::encode(
        &jsonwebtoken::Header::default(),
        &claims,
        &jsonwebtoken::EncodingKey::from_secret(secret.as_ref())
    ).map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Failed to generate token" }))))?;

    Ok(Json(AuthResponse {
        token,
        role: user.role,
        message: "Login successful".to_string(),
    }))
}

pub async fn profile(
    headers: HeaderMap,
    State(db_state): State<Arc<Database>>,
) -> Result<Json<User>, (StatusCode, Json<Value>)> {
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

    let collection = db_state.db.collection::<User>("users");
    let filter = doc! { "wallet_address": { "$regex": format!("^{}$", token_data.claims.sub), "$options": "i" } };
    let user = collection.find_one(filter).await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Database error" }))))?
        .ok_or((StatusCode::NOT_FOUND, Json(json!({ "error": "User not found" }))))?;

    Ok(Json(user))
}

pub async fn update_profile(
    headers: HeaderMap,
    State(db_state): State<Arc<Database>>,
    Json(payload): Json<crate::models::dto::UpdateUserProfileDto>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
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

    let collection = db_state.db.collection::<User>("users");
    let filter = doc! { "wallet_address": { "$regex": format!("^{}$", token_data.claims.sub), "$options": "i" } };

    // Fetch user first to safely update nested fields that might be null
    let user = collection.find_one(filter.clone()).await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Database error fetching user" }))))?
        .ok_or((StatusCode::NOT_FOUND, Json(json!({ "error": "User not found" }))))?;

    let mut set_doc = doc! {};
    if let Some(v) = payload.full_name { set_doc.insert("full_name", v); }
    if let Some(v) = payload.email { set_doc.insert("email", v); }
    if let Some(v) = payload.phone_number { set_doc.insert("phone_number", v); }
    if let Some(v) = payload.country { set_doc.insert("country", v); }
    if let Some(v) = payload.state { set_doc.insert("state", v); }
    if let Some(v) = payload.city { set_doc.insert("city", v); }
    if let Some(v) = payload.preferred_language { set_doc.insert("preferred_language", v); }
    
    // Process buyer details (Shop/Business)
    if payload.delivery_address.is_some() || payload.business_name.is_some() || payload.business_type.is_some() {
        if user.buyer_details.is_some() {
            if let Some(v) = payload.delivery_address { set_doc.insert("buyer_details.delivery_address", v); }
            if let Some(v) = payload.business_name { set_doc.insert("buyer_details.business_name", v); }
            if let Some(v) = payload.business_type { set_doc.insert("buyer_details.business_type", v); }
        } else {
            // Initialize basic buyer details if it was completely missing/null
            set_doc.insert("buyer_details", doc! {
                "business_name": payload.business_name.unwrap_or(user.full_name.clone()),
                "business_type": payload.business_type.unwrap_or("Individual".to_string()),
                "delivery_address": payload.delivery_address.unwrap_or("".to_string())
            });
        }
    }

    if set_doc.is_empty() {
        return Err((StatusCode::BAD_REQUEST, Json(json!({ "error": "No fields to update" }))));
    }

    set_doc.insert("updated_at", chrono::Utc::now().to_rfc3339());

    collection.update_one(filter.clone(), doc! { "$set": set_doc }).await.map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": format!("Database error during update: {}", e) })))
    })?;

    let updated_user = collection.find_one(filter).await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Database error fetching updated user" }))))?
        .ok_or((StatusCode::NOT_FOUND, Json(json!({ "error": "User not found" }))))?;

    Ok(Json(json!({ "message": "Profile updated successfully", "user": updated_user })))
}
