use serde::{Deserialize, Serialize};
use mongodb::bson::oid::ObjectId;
use chrono::Utc;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct NotificationSettings {
    pub new_orders: bool,
    pub order_accepted: bool,
    pub order_shipped: bool,
    pub order_delivered: bool,
    pub payment_released: bool,
    pub new_product_recommendations: bool,
    pub nearby_farmers: bool,
    pub best_deals: bool,
    pub wallet_activity: bool,
    pub smart_contract_events: bool,
    pub payment_confirmation: bool,
    pub login_alerts: bool,
    pub password_changes: bool,
    pub wallet_connection_alerts: bool,
    pub email_notifications: bool,
    pub push_notifications: bool,
    pub sms_notifications: bool,
}

impl Default for NotificationSettings {
    fn default() -> Self {
        Self {
            new_orders: true, order_accepted: true, order_shipped: true, order_delivered: true, payment_released: true,
            new_product_recommendations: false, nearby_farmers: true, best_deals: false, wallet_activity: true,
            smart_contract_events: false, payment_confirmation: true, login_alerts: true, password_changes: false,
            wallet_connection_alerts: true, email_notifications: true, push_notifications: true, sms_notifications: false,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PrivacySettings {
    pub profile_visibility: String, // "Public", "Buyers Only", "Private"
    pub share_farm_location: bool,
    pub show_phone_number: bool,
    pub show_email: bool,
    pub allow_analytics: bool,
    pub allow_personalized_recommendations: bool,
    pub allow_ai_suggestions: bool,
}

impl Default for PrivacySettings {
    fn default() -> Self {
        Self {
            profile_visibility: "Public".to_string(),
            share_farm_location: true,
            show_phone_number: false,
            show_email: false,
            allow_analytics: true,
            allow_personalized_recommendations: true,
            allow_ai_suggestions: true,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UserSettings {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub wallet_address: String,
    pub language: String,
    pub theme: String, // "light", "dark", "system"
    pub notifications: NotificationSettings,
    pub privacy: PrivacySettings,
    pub updated_at: String,
}

impl UserSettings {
    pub fn default_for(wallet: String) -> Self {
        Self {
            id: None,
            wallet_address: wallet,
            language: "English".to_string(),
            theme: "system".to_string(),
            notifications: NotificationSettings::default(),
            privacy: PrivacySettings::default(),
            updated_at: Utc::now().to_rfc3339(),
        }
    }
}
