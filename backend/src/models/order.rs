use serde::{Deserialize, Serialize};
use mongodb::bson::oid::ObjectId;


#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DeliveryAddress {
    pub full_name: String,
    pub phone_number: String,
    pub address_line1: String,
    pub address_line2: Option<String>,
    pub city: String,
    pub state: String,
    pub country: String,
    pub pin_code: String,
    pub address_type: String, // Home, Office, Farm
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PaymentSummary {
    pub product_price: f64,
    pub total: f64,
    pub payment_method: String, // Wallet, UPI, Card
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Order {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub order_id: String,
    pub buyer_wallet: String,
    pub product_id: String,
    pub farmer_id: String, // Wallet address of farmer
    pub quantity: f64,
    pub status: String, // Pending, Confirmed, Shipped, Delivered, Cancelled
    pub delivery_address: DeliveryAddress,
    pub payment: PaymentSummary,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub eth_amount: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub eth_to_inr_rate: Option<f64>,
    pub payment_status: String, // Pending, Locked, Released, Refunded
    pub escrow_status: String, // Inactive, Active, Completed, Disputed
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub escrow_contract_address: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub blockchain_network: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub blockchain_tx_hash: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub blockchain_release_tx_hash: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub courier_name: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub tracking_id: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub driver_number: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub awb_number: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub shipment_status: Option<String>,
    pub expected_delivery: String,
    pub created_at: String,
    pub updated_at: String,
}
