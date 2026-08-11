use crate::models::nonce::Nonce;
use mongodb::{bson::doc, Database as MongoDatabase};
use rand::RngExt;
use chrono::{Utc, Duration};

pub struct NonceService;

impl NonceService {
    pub async fn generate_nonce(db: &MongoDatabase, wallet_address: &str) -> Result<String, String> {
        let collection = db.collection::<Nonce>("nonces");
        
        let nonce_val = {
            let mut rng = rand::rng();
            format!("{:06}", rng.random_range(100000..=999999))
        };
        
        let filter = doc! { "wallet_address": { "$regex": format!("^{}$", wallet_address), "$options": "i" } };
        let _ = collection.delete_many(filter).await;

        let new_nonce = Nonce {
            id: None,
            wallet_address: wallet_address.to_string(),
            nonce: nonce_val.clone(),
            expires_at: (Utc::now() + Duration::try_minutes(5).unwrap()).to_rfc3339(),
        };

        collection.insert_one(&new_nonce).await.map_err(|_| "Failed to store nonce".to_string())?;

        Ok(nonce_val)
    }

    pub async fn get_and_delete_nonce(db: &MongoDatabase, wallet_address: &str) -> Result<String, String> {
        let collection = db.collection::<Nonce>("nonces");
        
        // DEBUG: Print all nonces in DB
        if let Ok(mut cursor) = collection.find(mongodb::bson::doc! {}).await {
            while let Ok(true) = cursor.advance().await {
                println!("DEBUG NONCE IN DB: {:?}", cursor.current());
            }
        }
        
        let filter = doc! { "wallet_address": { "$regex": format!("^{}$", wallet_address), "$options": "i" } };
        println!("DEBUG SEARCHING WITH FILTER: {:?}", filter);
        
        let result = collection.find_one(filter.clone()).await.map_err(|e| {
            println!("DEBUG FIND ERROR: {:?}", e);
            "DB error".to_string()
        })?;
        
        println!("DEBUG FIND RESULT: {:?}", result);
        
        if let Some(nonce_doc) = result {
            let _ = collection.delete_one(filter).await;
            if let Ok(parsed_time) = chrono::DateTime::parse_from_rfc3339(&nonce_doc.expires_at) {
                if parsed_time.with_timezone(&Utc) < Utc::now() {
                    return Err("Nonce expired. Please try connecting again.".to_string());
                }
            } else {
                return Err("Invalid nonce expiration format.".to_string());
            }
            return Ok(nonce_doc.nonce);
        }
        
        Err("No pending login request found for this wallet.".to_string())
    }
}
