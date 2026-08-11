use serde::{Deserialize, Serialize};
use mongodb::bson::oid::ObjectId;

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub enum UserRole {
    Farmer,
    Buyer,
    Admin,
}

impl UserRole {
    pub fn as_str(&self) -> &'static str {
        match self {
            UserRole::Farmer => "Farmer",
            UserRole::Buyer => "Buyer",
            UserRole::Admin => "Admin",
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub enum ProfileStatus {
    Draft,
    Incomplete,
    PendingVerification,
    Verified,
    Suspended,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GovernmentId {
    pub id_type: String, // Aadhaar, PAN, etc.
    pub front_image: String,
    pub back_image: String,
    pub status: String, // Pending, Verified, Skipped, etc.
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct VerificationDocument {
    pub document_type: String, // Land Ownership, Lease, etc.
    pub url: String,
    pub status: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Certificate {
    pub name: String,
    pub issuing_authority: String,
    pub issue_date: String,
    pub expiry_date: String,
    pub certificate_number: String,
    pub url: String,
    pub status: String, // Verified, Pending, Expired
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct FarmerDetails {
    pub farm_name: String,
    pub farm_address: String,
    pub farm_size: f64,
    pub experience: String,
    pub organic_farming: bool,
    pub primary_crops: Vec<String>,
    pub notes: Option<String>,
    
    // Location and Metrics
    pub latitude: Option<f64>,
    pub longitude: Option<f64>,
    pub average_rating: Option<f64>,
    pub total_reviews: Option<i32>,
    pub five_star_count: Option<i32>,
    pub four_star_count: Option<i32>,
    pub three_star_count: Option<i32>,
    pub two_star_count: Option<i32>,
    pub one_star_count: Option<i32>,
    pub trust_level: Option<String>,
    pub total_products: Option<i32>,
    
    // New Profile Completion Fields
    pub government_id: Option<GovernmentId>,
    pub verification_documents: Option<Vec<VerificationDocument>>,
    pub farm_images: Option<Vec<String>>,
    pub certificates: Option<Vec<Certificate>>,
    pub profile_completion_percentage: Option<i32>,
    pub profile_status: Option<ProfileStatus>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct BuyerDetails {
    pub business_name: String,
    pub business_type: String,
    pub delivery_address: String,
    pub latitude: Option<f64>,
    pub longitude: Option<f64>,
    pub gst_number: Option<String>,
    pub registration_number: Option<String>,
    pub website: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct User {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub role: UserRole,
    pub wallet_address: String,
    pub full_name: String,
    pub email: String,
    pub phone_number: String,
    pub country: String,
    pub state: Option<String>,
    pub city: Option<String>,
    pub preferred_language: String,
    pub profile_photo: Option<String>,
    pub farmer_details: Option<FarmerDetails>,
    pub buyer_details: Option<BuyerDetails>,
    pub created_at: String,
    pub updated_at: String,
    pub status: String,
    pub is_verified: bool,
}
