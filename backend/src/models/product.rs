use serde::{Deserialize, Serialize};
use mongodb::bson::oid::ObjectId;


#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub enum ProductStatus {
    Draft,
    PendingVerification,
    Published,
    OutOfStock,
    SoldOut,
    Hidden,
    Rejected,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Availability {
    pub from: Option<String>,
    pub until: Option<String>,
    pub min_order_quantity: Option<f64>,
    pub max_order_quantity: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DeliveryOptions {
    pub pickup_available: bool,
    pub home_delivery: bool,
    pub delivery_radius_km: Option<i32>,
    pub transportation_available: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct QualityDetails {
    pub freshness: String, // Excellent, Good, Average
    pub moisture_level: Option<String>,
    pub storage_type: String, // Cold Storage, Normal Storage, Warehouse
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProductLocation {
    pub village: String,
    pub city: String,
    pub district: String,
    pub state: String,
    pub country: String,
    pub pin_code: Option<String>,
    pub latitude: Option<f64>,
    pub longitude: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Product {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub product_id: String,
    pub wallet_address: String,
    pub farmer_id: String, // ObjectId string
    pub product_name: String,
    pub category: String,
    pub sub_category: Option<String>,
    pub variety: String,
    pub description: String,
    pub quantity: f64,
    pub unit: String,
    pub price: f64,
    pub market_price: Option<f64>,
    pub discount_price: Option<f64>,
    pub negotiable: bool,
    pub organic: bool,
    pub certificate: Option<String>,
    pub harvest_date: String,
    pub expected_shelf_life: String,
    pub ready_for_pickup: bool,
    pub availability: Option<Availability>,
    pub delivery_options: Option<DeliveryOptions>,
    pub quality: Option<QualityDetails>,
    pub images: Vec<String>,
    pub location: ProductLocation,
    pub status: ProductStatus,
    pub blockchain_hash: Option<String>,
    pub qr_code: Option<String>, // Usually generated on client, but we can store if needed
    pub created_at: String,
    pub updated_at: String,
}
