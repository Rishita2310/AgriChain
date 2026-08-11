use serde::{Deserialize, Serialize};
use mongodb::bson::oid::ObjectId;
use chrono::{DateTime, Utc};

// ─── Existing structs (used by /api/kisan-ai/*) ───────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Conversation {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub user_id: ObjectId,
    pub title: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub last_message: Option<String>,
    pub total_messages: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Message {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub conversation_id: ObjectId,
    pub user_id: ObjectId,
    pub sender: String, // "user" or "assistant"
    pub message: String,
    pub detected_language: String,
    pub message_type: String, // "text" or "voice"
    pub timestamp: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

// ─── New structs (used by /api/chat) ─────────────────────────────────────────

/// A single chat message stored in the `chat_messages` collection
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ChatMessage {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    /// String userId from the request (not tied to JWT)
    pub user_id: String,
    /// "user" or "assistant"
    pub role: String,
    pub message: String,
    /// Session this message belongs to
    pub session_id: ObjectId,
    pub timestamp: DateTime<Utc>,
}

/// A chat session stored in the `chat_sessions` collection
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ChatSession {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub user_id: String,
    /// Auto-generated from the first user message
    pub title: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

