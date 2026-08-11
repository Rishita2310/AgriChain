use axum::{
    extract::{State, Multipart},
    http::{HeaderMap, StatusCode},
    Json,
};
use mongodb::bson::doc;
use serde_json::{json, Value};
use std::sync::Arc;
use crate::database::db::Database;
use crate::models::dto::{
    UpdatePersonalInfoDto, UpdateFarmInfoDto, UpdateDocumentsDto, ProfileCompletionResponse,
};
use crate::models::user::{ProfileStatus, User};
use jsonwebtoken::{decode, Algorithm, DecodingKey, Validation};
use serde::{Deserialize, Serialize};
use std::env;

use tokio::fs::{self, File};
use tokio::io::AsyncWriteExt;
use std::path::Path;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: String,
    role: String,
    exp: usize,
}

fn get_user_id_from_header(headers: &HeaderMap) -> Result<String, (StatusCode, Json<Value>)> {
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

    if token_data.claims.role != "Farmer" {
        return Err((
            StatusCode::FORBIDDEN,
            Json(json!({ "error": "Access denied" })),
        ));
    }

    Ok(token_data.claims.sub)
}

fn calculate_completion(user: &User) -> i32 {
    let mut percentage = 0;
    
    // Personal Info (20%)
    if !user.full_name.is_empty() && !user.email.is_empty() && !user.phone_number.is_empty() && !user.country.is_empty() {
        percentage += 20;
    }
    
    // Wallet Verification (20%) - Assuming always verified if logged in
    percentage += 20;
    
    // Farm Info (20%)
    if let Some(fd) = &user.farmer_details {
        if !fd.farm_name.is_empty() && !fd.farm_address.is_empty() && fd.farm_size > 0.0 && !fd.primary_crops.is_empty() {
            percentage += 20;
        }
    }
    
    // Verification Docs (20%)
    if let Some(fd) = &user.farmer_details {
        if let Some(docs) = &fd.verification_documents {
            if !docs.is_empty() {
                percentage += 20;
            }
        }
    }
    
    // Farm Images (10%)
    if let Some(fd) = &user.farmer_details {
        if let Some(imgs) = &fd.farm_images {
            if !imgs.is_empty() {
                percentage += 10;
            }
        }
    }
    
    // Govt ID (5%)
    if let Some(fd) = &user.farmer_details {
        if fd.government_id.is_some() {
            percentage += 5;
        }
    }
    
    // Certificates (5%)
    if let Some(fd) = &user.farmer_details {
        if let Some(certs) = &fd.certificates {
            if !certs.is_empty() {
                percentage += 5;
            }
        }
    }
    
    std::cmp::min(100, percentage)
}

pub async fn get_profile_completion(
    headers: HeaderMap,
    State(db_state): State<Arc<Database>>,
) -> Result<Json<ProfileCompletionResponse>, (StatusCode, Json<Value>)> {
    let wallet_address = get_user_id_from_header(&headers)?;

    let collection = db_state.db.collection::<User>("users");
    let filter = doc! { "wallet_address": { "$regex": format!("^{}$", wallet_address), "$options": "i" } };
    let user = collection.find_one(filter).await.unwrap_or(None).ok_or((
        StatusCode::NOT_FOUND,
        Json(json!({ "error": "User not found" })),
    ))?;

    let completion = calculate_completion(&user);
    
    let status = if let Some(fd) = &user.farmer_details {
        if let Some(st) = &fd.profile_status {
            st.clone()
        } else {
            ProfileStatus::Draft
        }
    } else {
        ProfileStatus::Draft
    };

    Ok(Json(ProfileCompletionResponse {
        completion_percentage: completion,
        status,
    }))
}

pub async fn update_personal_info(
    headers: HeaderMap,
    State(db_state): State<Arc<Database>>,
    Json(payload): Json<UpdatePersonalInfoDto>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let wallet_address = get_user_id_from_header(&headers)?;
    
    let collection = db_state.db.collection::<User>("users");
    let filter = doc! { "wallet_address": { "$regex": format!("^{}$", wallet_address), "$options": "i" } };
    
    let mut set_doc = doc! {
        "full_name": payload.full_name,
        "email": payload.email,
        "phone_number": payload.phone_number,
        "country": payload.country,
        "state": payload.state,
        "city": payload.city,
        "preferred_language": payload.preferred_language,
    };

    if let Some(profile_photo) = payload.profile_photo {
        set_doc.insert("profile_photo", profile_photo);
    }

    let update_doc = doc! {
        "$set": set_doc
    };

    collection.update_one(filter.clone(), update_doc).await.unwrap();
    
    // Recalculate
    let updated_user = collection.find_one(filter.clone()).await.unwrap_or(None).unwrap();
    let comp = calculate_completion(&updated_user);
    collection.update_one(filter.clone(), doc! { "$set": { "farmer_details.profile_completion_percentage": comp } }).await.unwrap();

    Ok(Json(json!({ "message": "Personal info updated successfully", "completion_percentage": comp })))
}

pub async fn update_farm_info(
    headers: HeaderMap,
    State(db_state): State<Arc<Database>>,
    Json(payload): Json<UpdateFarmInfoDto>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let wallet_address = get_user_id_from_header(&headers)?;
    
    let collection = db_state.db.collection::<User>("users");
    let filter = doc! { "wallet_address": { "$regex": format!("^{}$", wallet_address), "$options": "i" } };
    
    let update_doc = doc! {
        "$set": {
            "farmer_details.farm_name": payload.farm_name,
            "farmer_details.farm_address": payload.farm_address,
            "farmer_details.farm_size": payload.farm_size,
            "farmer_details.experience": payload.experience,
            "farmer_details.organic_farming": payload.organic_farming,
            "farmer_details.primary_crops": payload.primary_crops,
        }
    };

    collection.update_one(filter.clone(), update_doc).await.unwrap();
    
    let updated_user = collection.find_one(filter.clone()).await.unwrap_or(None).unwrap();
    let comp = calculate_completion(&updated_user);
    collection.update_one(filter.clone(), doc! { "$set": { "farmer_details.profile_completion_percentage": comp } }).await.unwrap();

    Ok(Json(json!({ "message": "Farm info updated successfully", "completion_percentage": comp })))
}

pub async fn update_documents(
    headers: HeaderMap,
    State(db_state): State<Arc<Database>>,
    Json(payload): Json<UpdateDocumentsDto>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let wallet_address = get_user_id_from_header(&headers)?;
    
    let collection = db_state.db.collection::<User>("users");
    let filter = doc! { "wallet_address": { "$regex": format!("^{}$", wallet_address), "$options": "i" } };
    
    let mut set_doc = doc! {};
    if let Some(g_id) = payload.government_id {
        set_doc.insert("farmer_details.government_id", mongodb::bson::to_bson(&g_id).unwrap());
    }
    if let Some(v_docs) = payload.verification_documents {
        set_doc.insert("farmer_details.verification_documents", mongodb::bson::to_bson(&v_docs).unwrap());
    }
    if let Some(f_imgs) = payload.farm_images {
        set_doc.insert("farmer_details.farm_images", mongodb::bson::to_bson(&f_imgs).unwrap());
    }
    if let Some(certs) = payload.certificates {
        set_doc.insert("farmer_details.certificates", mongodb::bson::to_bson(&certs).unwrap());
    }

    if !set_doc.is_empty() {
        collection.update_one(filter.clone(), doc! { "$set": set_doc }).await.unwrap();
    }
    
    let updated_user = collection.find_one(filter.clone()).await.unwrap_or(None).unwrap();
    let comp = calculate_completion(&updated_user);
    collection.update_one(filter.clone(), doc! { "$set": { "farmer_details.profile_completion_percentage": comp } }).await.unwrap();

    Ok(Json(json!({ "message": "Documents updated successfully", "completion_percentage": comp })))
}

pub async fn submit_profile(
    headers: HeaderMap,
    State(db_state): State<Arc<Database>>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let wallet_address = get_user_id_from_header(&headers)?;
    
    let collection = db_state.db.collection::<User>("users");
    let filter = doc! { "wallet_address": { "$regex": format!("^{}$", wallet_address), "$options": "i" } };
    let user = collection.find_one(filter.clone()).await.unwrap_or(None).unwrap();
    let comp = calculate_completion(&user);

    if comp < 100 {
        return Err((StatusCode::BAD_REQUEST, Json(json!({ "error": "Profile must be 100% complete to submit" }))));
    }

    // ProfileStatus::PendingVerification corresponds to "PendingVerification" string serialization
    collection.update_one(
        filter.clone(), 
        doc! { "$set": { "farmer_details.profile_status": "PendingVerification" } }
    ).await.unwrap();

    Ok(Json(json!({ "message": "Profile submitted successfully" })))
}

pub async fn upload_file(
    headers: HeaderMap,
    mut multipart: Multipart,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let _user_id = get_user_id_from_header(&headers)?; // Just to verify auth
    
    let mut uploaded_url = String::new();

    // Ensure uploads directory exists
    let upload_dir = Path::new("uploads");
    if !upload_dir.exists() {
        fs::create_dir_all(upload_dir).await.map_err(|_| {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Failed to create upload directory" })))
        })?;
    }

    while let Some(field) = multipart.next_field().await.map_err(|e| {
        (StatusCode::BAD_REQUEST, Json(json!({ "error": format!("Multipart error: {}", e) })))
    })? {
        if let Some(file_name) = field.file_name() {
            let file_name = file_name.to_string();
            let data = field.bytes().await.map_err(|_| {
                (StatusCode::BAD_REQUEST, Json(json!({ "error": "Failed to read file data" })))
            })?;

            let ext = Path::new(&file_name).extension().and_then(|s| s.to_str()).unwrap_or("bin");
            let new_filename = format!("{}.{}", Uuid::new_v4(), ext);
            let file_path = upload_dir.join(&new_filename);

            let mut file = File::create(&file_path).await.map_err(|_| {
                (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Failed to save file" })))
            })?;
            file.write_all(&data).await.map_err(|_| {
                (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Failed to write file" })))
            })?;

            uploaded_url = format!("/uploads/{}", new_filename);
            break; // Only handle the first file for simplicity in this endpoint
        }
    }

    if uploaded_url.is_empty() {
        return Err((StatusCode::BAD_REQUEST, Json(json!({ "error": "No file uploaded" }))));
    }

    Ok(Json(json!({ "url": uploaded_url })))
}
