use mongodb::{Client, Database as MongoDatabase, options::ClientOptions};
use std::env;

#[derive(Clone)]
pub struct Database {
    #[allow(dead_code)]
    pub db: MongoDatabase,
}

impl Database {
    pub async fn init() -> mongodb::error::Result<Self> {
        let uri = env::var("MONGODB_URI").unwrap_or_else(|_| "mongodb://localhost:27017".into());
        let mut client_options = ClientOptions::parse(&uri).await?;
        client_options.app_name = Some("AgriChain".to_string());
        
        let client = Client::with_options(client_options)?;
        let db = client.database("agrichain_core");
        
        // Seed default data if needed
        Self::seed_data(&db).await?;
        
        tracing::info!("✅ MongoDB connected successfully");
        
        Ok(Self { db })
    }

    async fn seed_data(db: &MongoDatabase) -> mongodb::error::Result<()> {
        // Explicitly create collections so they appear immediately in the database
        let collections = vec!["users", "products", "orders", "wallets", "features", "testimonials", "faq", "conversations", "messages", "chat_messages", "chat_sessions"];
        for collection_name in collections {
            // Ignore error if collection already exists
            let _ = db.create_collection(collection_name).await;
        }
        
        let features = db.collection::<mongodb::bson::Document>("features");
        if features.count_documents(mongodb::bson::doc! {}).await.unwrap_or(0) == 0 {
            // Seed sample feature just to populate the DB
            let sample_feature = mongodb::bson::doc! {
                "title": "Smart Farming",
                "description": "Blockchain backed farming records"
            };
            let _ = features.insert_one(sample_feature).await;
        }
        Ok(())
    }
}
