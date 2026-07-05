use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
pub enum Entity {
    System,
    Farmer,
    Warehouse,
    Distributor,
    Retailer,
    Consumer,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
pub enum ProductStatus {
    Registered,
    Harvested,
    QualityChecked,
    Packed,
    Stored,
    Dispatched,
    InTransit,
    Delivered,
    Verified,
    Completed,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Product {
    pub id: String, // UUID
    pub name: String,
    pub category: String,
    pub origin: String,
    pub current_owner: Entity,
    pub owner_name: String,
    pub current_status: ProductStatus,
    pub history: Vec<String>, // Vector of Transaction IDs
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Transaction {
    pub id: String, // UUID
    pub product_id: String,
    pub sender: Entity,
    pub sender_name: String,
    pub receiver: Entity,
    pub receiver_name: String,
    pub status_update: ProductStatus,
    pub timestamp: DateTime<Utc>,
    pub details: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Block {
    pub index: u64,
    pub timestamp: i64,
    pub transactions: Vec<Transaction>,
    pub proof: u64,
    pub previous_hash: String,
    pub hash: String,
}
