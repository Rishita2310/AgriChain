use serde::{Deserialize, Serialize};
use mongodb::bson::oid::ObjectId;


#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Notification {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub user_id: String, // Wallet address of the recipient
    pub role: String, // "Farmer" or "Buyer"
    pub notification_type: String, // e.g., "Order", "Payment", "Review", "System"
    pub title: String,
    pub description: String,
    pub related_order_id: Option<String>,
    pub is_read: bool,
    pub created_at: String,
}
