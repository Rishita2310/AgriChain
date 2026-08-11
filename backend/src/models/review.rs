use serde::{Deserialize, Serialize};
use mongodb::bson::oid::ObjectId;


#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Review {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub product_id: String,
    pub user_id: String,       // ID or Wallet Address of the reviewer
    pub reviewer_name: String,
    pub reviewer_photo: Option<String>,
    pub rating: i32,           // 1 to 5
    pub comment: String,
    pub verified_buyer: bool,
    pub tags: Option<Vec<String>>,
    pub is_anonymous: Option<bool>,
    pub helpful_count: Option<i32>,
    pub blockchain_tx_hash: Option<String>,
    pub created_at: String,
}
