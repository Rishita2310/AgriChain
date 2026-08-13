use serde::{Deserialize, Serialize};
use crate::models::user::{FarmerDetails, BuyerDetails, UserRole, GovernmentId, VerificationDocument, Certificate, ProfileStatus};
use crate::models::product::{ProductStatus, Availability, DeliveryOptions, QualityDetails, ProductLocation};

#[derive(Debug, Deserialize)]
pub struct RegisterRequest {
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
    pub signature: String,
}

#[derive(Debug, Serialize)]
pub struct AuthResponse {
    pub token: String,
    pub role: UserRole,
    pub message: String,
}

#[derive(Debug, Deserialize)]
pub struct LoginRequestDto {
    pub wallet_address: String,
}

#[derive(Debug, Serialize)]
pub struct LoginRequestResponse {
    pub message: String,
    pub nonce: String,
}

#[derive(Debug, Deserialize)]
pub struct LoginVerifyDto {
    pub wallet_address: String,
    pub signature: String,
}

// Dashboard DTOs

#[derive(Debug, Serialize)]
pub struct RevenueStat {
    pub name: String,
    pub revenue: i32,
}

#[derive(Debug, Serialize)]
pub struct MarketPrice {
    pub name: String,
    pub price: String,
    pub trend: String,
}

#[derive(Debug, Serialize)]
pub struct FarmerDashboardStatsResponse {
    pub total_revenue: String,
    pub active_orders: String,
    pub pending_deliveries: String,
    pub profile_completion: String,
    pub revenue_chart_data: Vec<RevenueStat>,
    pub market_prices: Vec<MarketPrice>,
    pub location: String,
    pub temperature: String,
    pub rain_chance: String,
}

// Profile Completion DTOs

#[derive(Debug, Deserialize)]
pub struct UpdatePersonalInfoDto {
    pub full_name: String,
    pub email: String,
    pub phone_number: String,
    pub country: String,
    pub state: Option<String>,
    pub city: Option<String>,
    pub preferred_language: String,
    pub profile_photo: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateFarmInfoDto {
    pub farm_name: String,
    pub farm_address: String,
    pub farm_size: f64,
    pub experience: String,
    pub organic_farming: bool,
    pub primary_crops: Vec<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateDocumentsDto {
    pub government_id: Option<GovernmentId>,
    pub verification_documents: Option<Vec<VerificationDocument>>,
    pub farm_images: Option<Vec<String>>,
    pub certificates: Option<Vec<Certificate>>,
}

#[derive(Debug, Serialize)]
pub struct ProfileCompletionResponse {
    pub completion_percentage: i32,
    pub status: ProfileStatus,
}

// General profile update (any role)
#[derive(Debug, Deserialize)]
pub struct UpdateUserProfileDto {
    pub full_name: Option<String>,
    pub email: Option<String>,
    pub phone_number: Option<String>,
    pub country: Option<String>,
    pub state: Option<String>,
    pub city: Option<String>,
    pub preferred_language: Option<String>,
    pub delivery_address: Option<String>,
    pub business_name: Option<String>,
    pub business_type: Option<String>,
}

// Product DTOs

#[derive(Debug, Deserialize)]
pub struct CreateProductDto {
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
    pub save_as_draft: bool,
}

#[derive(Debug, Deserialize)]
pub struct UpdateProductStatusDto {
    pub status: ProductStatus,
}

#[derive(Debug, Deserialize)]
#[allow(dead_code)]
pub struct SearchFilterDto {
    pub q: Option<String>,
    pub category: Option<String>,
    pub min_price: Option<f64>,
    pub max_price: Option<f64>,
    pub organic: Option<bool>,
    pub rating: Option<f64>,
    pub harvest_date: Option<String>,
    pub sort: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct FarmerSummary {
    pub name: String,
    pub profile_photo: Option<String>,
    pub farm_name: String,
    pub experience: String,
    pub location: String,
    pub rating: f64,
    pub completed_orders: i32,
    pub member_since: String,
    pub wallet_address: String,
    pub response_time: String,
    pub is_verified: bool,
    pub email: String,
    pub phone_number: String,
}

#[derive(Debug, Serialize)]
pub struct ProductDetailsResponse {
    pub product: crate::models::product::Product,
    pub farmer: FarmerSummary,
    pub review_stats: ReviewStats,
}

#[derive(Debug, Serialize)]
pub struct ReviewStats {
    pub average_rating: f64,
    pub total_reviews: i32,
    pub rating_distribution: std::collections::HashMap<String, i32>, // "5": 210, "4": 80
}

#[derive(Debug, Deserialize)]
#[allow(dead_code)]
pub struct CreateOrderRequest {
    pub product_id: String,
    pub quantity: f64,
    pub delivery_address: crate::models::order::DeliveryAddress,
    pub payment_method: String,
    pub coupon_code: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct VerifyPaymentRequest {
    pub order_id: String,
    pub transaction_hash: String,
    pub eth_amount: String,
    pub eth_to_inr_rate: f64,
}

#[derive(Debug, Serialize)]
pub struct OrderResponse {
    pub message: String,
    pub order_id: String,
    pub product_name: String,
    pub quantity: f64,
    pub total_paid: f64,
    pub expected_delivery: String,
    pub payment_status: String,
}

#[derive(Debug, Serialize)]
pub struct FarmerOrderResponse {
    pub order: crate::models::order::Order,
    pub product: crate::models::product::Product,
    pub buyer: crate::models::user::User,
}

#[derive(Debug, Deserialize)]
pub struct OrderActionRequest {
    pub action: String, // accept, reject, pack, ship
    pub reason: Option<String>,
    pub tracking_number: Option<String>,
    pub courier: Option<String>,
    pub driver_number: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct ConfirmDeliveryRequest {
    pub transaction_hash: String,
}
