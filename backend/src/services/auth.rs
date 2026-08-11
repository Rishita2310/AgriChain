use crate::models::{
    dto::{AuthResponse, RegisterRequest},
    user::User,
};
use mongodb::{bson::doc, Database as MongoDatabase};
use std::env;
use jsonwebtoken::{encode, Header, EncodingKey};
use chrono::{Utc, Duration};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: String,
    role: String,
    exp: usize,
}

pub struct AuthService;

impl AuthService {
    pub async fn register(db: &MongoDatabase, req: RegisterRequest) -> Result<AuthResponse, String> {
        let collection = db.collection::<User>("users");
        
        // Minimalistic email validation fallback (real validation handled by Zod on frontend)
        if !req.email.contains('@') {
            return Err("Invalid email format".to_string());
        }

        // Verify Signature
        let nonce = crate::services::nonce_service::NonceService::get_and_delete_nonce(db, &req.wallet_address).await?;
        if let Err(err) = crate::services::signature_service::SignatureService::verify_signature(&req.wallet_address, &nonce, &req.signature) {
            return Err(err);
        }

        // Check duplicates
        let email_filter = doc! { "email": { "$regex": format!("^{}$", req.email), "$options": "i" } };
        if collection.count_documents(email_filter).await.unwrap_or(0) > 0 {
            return Err("Email already exists".to_string());
        }
        
        let phone_filter = doc! { "phone_number": { "$regex": format!("^{}$", req.phone_number), "$options": "i" } };
        if collection.count_documents(phone_filter).await.unwrap_or(0) > 0 {
            return Err("Phone number already exists".to_string());
        }
        
        let wallet_filter = doc! { "wallet_address": { "$regex": format!("^{}$", req.wallet_address), "$options": "i" } };
        if collection.count_documents(wallet_filter).await.unwrap_or(0) > 0 {
            return Err("Wallet address already registered".to_string());
        }

        let new_user = User {
            id: None,
            role: req.role.clone(),
            wallet_address: req.wallet_address.clone(),
            full_name: req.full_name,
            email: req.email,
            phone_number: req.phone_number,
            country: req.country,
            state: req.state,
            city: req.city,
            preferred_language: req.preferred_language,
            profile_photo: req.profile_photo,
            farmer_details: req.farmer_details,
            buyer_details: req.buyer_details,
            created_at: Utc::now().to_rfc3339(),
            updated_at: Utc::now().to_rfc3339(),
            status: "Active".to_string(),
            is_verified: false,
        };

        collection.insert_one(&new_user).await.map_err(|e| format!("Database error: {}", e))?;

        let secret = env::var("JWT_SECRET").unwrap_or_else(|_| "super_secret_key".into());
        let expiration = Utc::now() + Duration::try_days(7).unwrap();
        let claims = Claims {
            sub: new_user.wallet_address.clone(),
            role: format!("{:?}", new_user.role),
            exp: expiration.timestamp() as usize,
        };
        
        let token = encode(&Header::default(), &claims, &EncodingKey::from_secret(secret.as_ref()))
            .map_err(|_| "Failed to create token".to_string())?;

        Ok(AuthResponse {
            token,
            role: new_user.role,
            message: "Registration Successful".to_string(),
        })
    }
}
