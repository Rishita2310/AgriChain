use mongodb::{bson::doc, Client};
use std::env;
use uuid::Uuid;
use chrono::Utc;
use dotenvy::dotenv;

#[derive(serde::Serialize, serde::Deserialize, Debug)]
pub struct User {
    pub full_name: String,
    pub wallet_address: String,
    pub role: String,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenv().ok();
    let mongo_uri = env::var("DATABASE_URL").unwrap_or_else(|_| "mongodb://localhost:27017".to_string());
    
    let client = Client::with_uri_str(&mongo_uri).await?;
    let db = client.database("agrichain");
    let users_coll = db.collection::<User>("users");
    let orders_coll = db.collection::<mongodb::bson::Document>("orders");

    // Search for Axar Patel (Buyer)
    let mut buyer = users_coll.find_one(doc! { 
        "full_name": { "$regex": "Axar Patel", "$options": "i" },
        "role": "Buyer"
    }).await?;

    // Search for akshar patel (Farmer)
    let mut farmer = users_coll.find_one(doc! { 
        "full_name": { "$regex": "akshar patel", "$options": "i" },
        "role": "Farmer"
    }).await?;

    if buyer.is_none() {
        println!("Buyer Axar Patel not found, creating mock buyer...");
        let new_buyer = User {
            full_name: "Axar Patel".to_string(),
            wallet_address: format!("0xbuyer{}", &Uuid::new_v4().to_string().replace("-", "")[..10]),
            role: "Buyer".to_string(),
        };
        users_coll.insert_one(&new_buyer).await?;
        buyer = Some(new_buyer);
    }

    if farmer.is_none() {
        println!("Farmer akshar patel not found, creating mock farmer...");
        let new_farmer = User {
            full_name: "akshar patel".to_string(),
            wallet_address: format!("0xfarmer{}", &Uuid::new_v4().to_string().replace("-", "")[..9]),
            role: "Farmer".to_string(),
        };
        users_coll.insert_one(&new_farmer).await?;
        farmer = Some(new_farmer);
    }

    let buyer_user = buyer.unwrap();
    let farmer_user = farmer.unwrap();

    let now = Utc::now().to_rfc3339();

    let order1 = doc! {
        "order_id": Uuid::new_v4().to_string(),
        "buyer_wallet": &buyer_user.wallet_address,
        "product_id": Uuid::new_v4().to_string(),
        "farmer_id": &farmer_user.wallet_address,
        "quantity": 150.0,
        "status": "Completed",
        "delivery_address": {
            "full_name": &buyer_user.full_name,
            "phone_number": "9876543210",
            "address_line1": "123 Buyer Street",
            "address_line2": "",
            "city": "Mumbai",
            "state": "MH",
            "country": "India",
            "pin_code": "400001",
            "address_type": "Home"
        },
        "payment": {
            "product_price": 5000.0,
            "total": 5000.0,
            "payment_method": "Wallet Escrow"
        },
        "payment_status": "Released",
        "escrow_status": "Completed",
        "escrow_contract_address": "0x1234567890abcdef1234567890abcdef12345678",
        "blockchain_network": "Arbitrum Sepolia",
        "blockchain_tx_hash": "0xabc123abc123abc123abc123abc123abc123abc123abc123abc123abc123ab",
        "blockchain_release_tx_hash": "0xdef456def456def456def456def456def456def456def456def456def456de",
        "expected_delivery": now.clone(),
        "created_at": now.clone(),
        "updated_at": now.clone()
    };

    let order2 = doc! {
        "order_id": Uuid::new_v4().to_string(),
        "buyer_wallet": &buyer_user.wallet_address,
        "product_id": Uuid::new_v4().to_string(),
        "farmer_id": &farmer_user.wallet_address,
        "quantity": 50.0,
        "status": "Packed",
        "delivery_address": {
            "full_name": &buyer_user.full_name,
            "phone_number": "9876543210",
            "address_line1": "123 Buyer Street",
            "address_line2": "",
            "city": "Mumbai",
            "state": "MH",
            "country": "India",
            "pin_code": "400001",
            "address_type": "Home"
        },
        "payment": {
            "product_price": 2000.0,
            "total": 2000.0,
            "payment_method": "Wallet Escrow"
        },
        "payment_status": "Locked",
        "escrow_status": "Active",
        "escrow_contract_address": "0x0987654321fedcba0987654321fedcba09876543",
        "blockchain_network": "Arbitrum Sepolia",
        "blockchain_tx_hash": "0x987fed987fed987fed987fed987fed987fed987fed987fed987fed987fed98",
        "expected_delivery": now.clone(),
        "created_at": now.clone(),
        "updated_at": now.clone()
    };

    orders_coll.insert_many(vec![order1, order2]).await?;
    println!("Successfully seeded orders between {} and {}!", buyer_user.full_name, farmer_user.full_name);

    Ok(())
}
