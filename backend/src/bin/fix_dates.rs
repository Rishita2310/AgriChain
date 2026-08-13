use mongodb::{Client, bson::{doc, Bson}};
use std::env;
use chrono::{Utc, TimeZone};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenvy::dotenv().ok();
    let mongo_uri = env::var("MONGO_URI").unwrap_or_else(|_| "mongodb://localhost:27017".to_string());
    let client = Client::with_uri_str(&mongo_uri).await?;
    let db = client.database("agrichain_core");

    let collections = vec!["products", "orders", "users"];
    
    use futures::stream::StreamExt;
    
    for coll_name in collections {
        println!("Fixing {}...", coll_name);
        let coll = db.collection::<mongodb::bson::Document>(coll_name);
        let mut cursor = coll.find(doc! {}).await?;
        let mut fixed = 0;
        
        while let Some(result) = cursor.next().await {
            if let Ok(mut doc) = result {
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
        }
        println!("Fixed {} {}.", fixed, coll_name);
    }

    Ok(())
}
