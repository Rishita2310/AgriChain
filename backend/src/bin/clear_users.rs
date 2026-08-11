use mongodb::{Client, options::ClientOptions, bson::doc};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client_options = ClientOptions::parse("mongodb://localhost:27017").await?;
    let client = Client::with_options(client_options)?;
    let db = client.database("agrichain");
    
    let result = db.collection::<mongodb::bson::Document>("users").delete_many(doc! {}).await?;
    println!("Deleted {} users from the database.", result.deleted_count);
    
    Ok(())
}
