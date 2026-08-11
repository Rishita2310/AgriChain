use mongodb::{Client, bson::{doc, Bson}};
use std::env;
use chrono::{Utc, TimeZone};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenvy::dotenv().ok();
    let mongo_uri = env::var("MONGO_URI").unwrap_or_else(|_| "mongodb://localhost:27017".to_string());
    let client = Client::with_uri_str(&mongo_uri).await?;
    let db = client.database("agrichain");

    println!("Fixing products...");
    let coll = db.collection::<mongodb::bson::Document>("products");
    let mut cursor = coll.find(doc! {}).await?;
    use futures::stream::StreamExt;
    
    let mut fixed = 0;
    while let Some(result) = cursor.next().await {
        match result {
            Ok(mut doc) => {
                let id = doc.get_object_id("_id").unwrap();
                let mut needs_update = false;

                if let Some(Bson::DateTime(dt)) = doc.get("created_at") {
                    let chrono_dt = Utc.timestamp_millis_opt(dt.timestamp_millis()).unwrap();
                    doc.insert("created_at", Bson::String(chrono_dt.to_rfc3339()));
                    needs_update = true;
                }
                if let Some(Bson::DateTime(dt)) = doc.get("updated_at") {
                    let chrono_dt = Utc.timestamp_millis_opt(dt.timestamp_millis()).unwrap();
                    doc.insert("updated_at", Bson::String(chrono_dt.to_rfc3339()));
                    needs_update = true;
                }
                
                // Fallback: If it's a map containing $date, manually fix it?
                // `Bson::DateTime` handles the native representation natively.

                if needs_update {
                    coll.replace_one(doc! { "_id": id }, doc).await?;
                    fixed += 1;
                }
            }
            Err(e) => println!("Error: {}", e),
        }
    }
    println!("Fixed {} products.", fixed);

    println!("Fixing orders...");
    let coll = db.collection::<mongodb::bson::Document>("orders");
    let mut cursor = coll.find(doc! {}).await?;
    let mut fixed = 0;
    while let Some(result) = cursor.next().await {
        match result {
            Ok(mut doc) => {
                let id = doc.get_object_id("_id").unwrap();
                let mut needs_update = false;

                if let Some(Bson::DateTime(dt)) = doc.get("created_at") {
                    let chrono_dt = Utc.timestamp_millis_opt(dt.timestamp_millis()).unwrap();
                    doc.insert("created_at", Bson::String(chrono_dt.to_rfc3339()));
                    needs_update = true;
                }
                if let Some(Bson::DateTime(dt)) = doc.get("updated_at") {
                    let chrono_dt = Utc.timestamp_millis_opt(dt.timestamp_millis()).unwrap();
                    doc.insert("updated_at", Bson::String(chrono_dt.to_rfc3339()));
                    needs_update = true;
                }

                if needs_update {
                    coll.replace_one(doc! { "_id": id }, doc).await?;
                    fixed += 1;
                }
            }
            Err(_) => {}
        }
    }
    println!("Fixed {} orders.", fixed);

    Ok(())
}
