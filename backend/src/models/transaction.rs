use serde::{Deserialize, Serialize};


#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Transaction {
    pub tx_hash: String,
    pub tx_type: String, // e.g., "Payment", "Escrow Lock", "Escrow Release"
    pub amount: f64,
    pub status: String, // e.g., "Completed", "Pending", "Failed"
    pub network: String,
    pub gas_fee: Option<f64>,
    pub sender_wallet: String,
    pub receiver_wallet: String,
    pub related_order_id: Option<String>,
    pub created_at: String,
}
