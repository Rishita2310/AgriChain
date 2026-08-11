use axum::{
    extract::{Path, State},
    http::{HeaderMap, StatusCode},
    Json,
};
use mongodb::{bson::{doc, oid::ObjectId}, options::FindOptions};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::sync::Arc;
use std::env;
use chrono::Utc;
use reqwest::Client;
use jsonwebtoken::{decode, DecodingKey, Validation, Algorithm};
use futures::stream::StreamExt;

use crate::database::db::Database;
use crate::models::chat_models::{Conversation, Message};
use crate::models::user::User;

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: String,
    role: String,
    exp: usize,
}

#[derive(Deserialize)]
pub struct ChatMessageRequest {
    pub message: String,
    pub conversation_id: Option<String>,
}

#[derive(Deserialize)]
pub struct RenameConversationRequest {
    pub title: String,
}

async fn get_user_from_headers(headers: &HeaderMap, db: &mongodb::Database) -> Result<User, (StatusCode, Json<Value>)> {
    let auth_header = headers.get("Authorization")
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.strip_prefix("Bearer "))
        .ok_or((StatusCode::UNAUTHORIZED, Json(json!({ "error": "Missing or invalid token" }))))?;

    let secret = env::var("JWT_SECRET").unwrap_or_else(|_| "super_secret_key".into());
    let token_data = decode::<Claims>(
        auth_header,
        &DecodingKey::from_secret(secret.as_ref()),
        &Validation::new(Algorithm::HS256)
    ).map_err(|_| (StatusCode::UNAUTHORIZED, Json(json!({ "error": "Invalid or expired token" }))))?;

    let collection = db.collection::<User>("users");
    let filter = doc! { "wallet_address": { "$regex": format!("^{}$", token_data.claims.sub), "$options": "i" } };
    let user = collection.find_one(filter).await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Database error" }))))?
        .ok_or((StatusCode::NOT_FOUND, Json(json!({ "error": "User not found" }))))?;

    Ok(user)
}

pub async fn get_conversations(
    headers: HeaderMap,
    State(db_state): State<Arc<Database>>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let user = get_user_from_headers(&headers, &db_state.db).await?;
    let user_id = user.id.unwrap_or_else(ObjectId::new);

    let coll = db_state.db.collection::<Conversation>("conversations");
    let filter = doc! { "user_id": user_id };
    
    let find_options = FindOptions::builder().sort(doc! { "updated_at": -1 }).build();
    let mut cursor = coll.find(filter).with_options(find_options).await.map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Database error" })))
    })?;

    let mut conversations = Vec::new();
    while let Some(Ok(conv)) = cursor.next().await {
        conversations.push(conv);
    }

    Ok(Json(json!(conversations)))
}

pub async fn get_conversation_history(
    Path(id): Path<String>,
    headers: HeaderMap,
    State(db_state): State<Arc<Database>>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let user = get_user_from_headers(&headers, &db_state.db).await?;
    let user_id = user.id.unwrap_or_else(ObjectId::new);

    let conv_id = ObjectId::parse_str(&id).map_err(|_| {
        (StatusCode::BAD_REQUEST, Json(json!({ "error": "Invalid conversation ID" })))
    })?;

    // Verify ownership
    let conv_coll = db_state.db.collection::<Conversation>("conversations");
    let filter = doc! { "_id": conv_id, "user_id": user_id };
    let conv = conv_coll.find_one(filter).await.map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Database error" })))
    })?.ok_or((StatusCode::NOT_FOUND, Json(json!({ "error": "Conversation not found" }))))?;

    let msg_coll = db_state.db.collection::<Message>("messages");
    let msg_filter = doc! { "conversation_id": conv_id };
    let find_options = FindOptions::builder().sort(doc! { "timestamp": 1 }).build();
    
    let mut cursor = msg_coll.find(msg_filter).with_options(find_options).await.map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Database error" })))
    })?;

    let mut messages = Vec::new();
    while let Some(Ok(msg)) = cursor.next().await {
        messages.push(msg);
    }

    Ok(Json(json!({
        "conversation": conv,
        "messages": messages
    })))
}

pub async fn delete_conversation(
    Path(id): Path<String>,
    headers: HeaderMap,
    State(db_state): State<Arc<Database>>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let user = get_user_from_headers(&headers, &db_state.db).await?;
    let user_id = user.id.unwrap_or_else(ObjectId::new);

    let conv_id = ObjectId::parse_str(&id).map_err(|_| {
        (StatusCode::BAD_REQUEST, Json(json!({ "error": "Invalid conversation ID" })))
    })?;

    let conv_coll = db_state.db.collection::<Conversation>("conversations");
    let filter = doc! { "_id": conv_id, "user_id": user_id };
    
    let res = conv_coll.delete_one(filter).await.map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Database error" })))
    })?;

    if res.deleted_count == 0 {
        return Err((StatusCode::NOT_FOUND, Json(json!({ "error": "Conversation not found" }))));
    }

    // Delete messages
    let msg_coll = db_state.db.collection::<Message>("messages");
    let _ = msg_coll.delete_many(doc! { "conversation_id": conv_id }).await;

    Ok(Json(json!({ "message": "Conversation deleted successfully" })))
}

pub async fn rename_conversation(
    Path(id): Path<String>,
    headers: HeaderMap,
    State(db_state): State<Arc<Database>>,
    Json(payload): Json<RenameConversationRequest>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let user = get_user_from_headers(&headers, &db_state.db).await?;
    let user_id = user.id.unwrap_or_else(ObjectId::new);

    let conv_id = ObjectId::parse_str(&id).map_err(|_| {
        (StatusCode::BAD_REQUEST, Json(json!({ "error": "Invalid conversation ID" })))
    })?;

    let conv_coll = db_state.db.collection::<Conversation>("conversations");
    let filter = doc! { "_id": conv_id, "user_id": user_id };
    let update = doc! { "$set": { "title": payload.title, "updated_at": mongodb::bson::DateTime::now() } };

    let res = conv_coll.update_one(filter, update).await.map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Database error" })))
    })?;

    if res.modified_count == 0 {
        return Err((StatusCode::NOT_FOUND, Json(json!({ "error": "Conversation not found or not modified" }))));
    }

    Ok(Json(json!({ "message": "Conversation renamed successfully" })))
}

pub async fn chat_message(
    headers: HeaderMap,
    State(db_state): State<Arc<Database>>,
    Json(payload): Json<ChatMessageRequest>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let user = get_user_from_headers(&headers, &db_state.db).await?;
    let user_id = user.id.unwrap_or_else(ObjectId::new);

    let conv_coll = db_state.db.collection::<Conversation>("conversations");
    let msg_coll = db_state.db.collection::<Message>("messages");

    let conv_id = if let Some(c_id) = payload.conversation_id {
        let oid = ObjectId::parse_str(&c_id).map_err(|_| {
            (StatusCode::BAD_REQUEST, Json(json!({ "error": "Invalid conversation ID" })))
        })?;
        // Verify existence and ownership
        let filter = doc! { "_id": oid, "user_id": user_id };
        let _conv = conv_coll.find_one(filter).await.map_err(|_| {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Database error" })))
        })?.ok_or((StatusCode::NOT_FOUND, Json(json!({ "error": "Conversation not found" }))))?;
        
        oid
    } else {
        // Create new conversation
        let title = if payload.message.chars().count() > 30 {
            let truncated: String = payload.message.chars().take(27).collect();
            format!("{}...", truncated)
        } else {
            payload.message.clone()
        };
        
        let mut new_conv = Conversation {
            id: None,
            user_id,
            title,
            last_message: Some(payload.message.clone()),
            total_messages: 0,
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };
        
        let res = conv_coll.insert_one(new_conv.clone()).await.map_err(|_| {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Database error" })))
        })?;
        
        let new_id = res.inserted_id.as_object_id().unwrap();
        new_conv.id = Some(new_id);
        new_id
    };

    // Save User Message
    let user_msg = Message {
        id: None,
        conversation_id: conv_id,
        user_id,
        sender: "user".to_string(),
        message: payload.message.clone(),
        detected_language: "en".to_string(),
        message_type: "text".to_string(),
        timestamp: Utc::now(),
        created_at: Utc::now(),
        updated_at: Utc::now(),
    };
    msg_coll.insert_one(user_msg.clone()).await.map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Database error" })))
    })?;

    // Call Gemini API
    let api_key = env::var("GEMINI_API_KEY").unwrap_or_default();
    let assistant_text = if api_key.is_empty() {
        "Gemini API key is not configured. Please set GEMINI_API_KEY in your .env file.".to_string()
    } else {
        let client = Client::new();
        // Using gemini-2.0-flash model
        let url = format!(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={}",
            api_key
        );
        
        let system_prompt = "You are Kisan AI, an expert agricultural assistant for Indian farmers and buyers. \
            You help with crop pricing, market trends, pest control, weather advisories, farming best practices, \
            and supply chain questions. Be concise, practical, and use simple language. \
            When relevant, mention specific crop names, prices in INR, and Indian states/seasons.";
        
        let request_body = json!({
            "system_instruction": {
                "parts": [{"text": system_prompt}]
            },
            "contents": [{
                "role": "user",
                "parts": [{"text": payload.message}]
            }],
            "generationConfig": {
                "temperature": 0.7,
                "topK": 40,
                "topP": 0.95,
                "maxOutputTokens": 1024
            }
        });

        match client
            .post(&url)
            .header("Content-Type", "application/json")
            .json(&request_body)
            .send()
            .await
        {
            Ok(resp) if resp.status().is_success() => {
                let resp_json: Value = resp.json().await.unwrap_or(json!({}));
                tracing::debug!("Gemini response: {:?}", resp_json);
                
                // Navigate the response structure
                if let Some(text) = resp_json
                    .get("candidates")
                    .and_then(|c| c.get(0))
                    .and_then(|c| c.get("content"))
                    .and_then(|c| c.get("parts"))
                    .and_then(|p| p.get(0))
                    .and_then(|p| p.get("text"))
                    .and_then(|t| t.as_str())
                {
                    text.to_string()
                } else {
                    tracing::error!("Unexpected Gemini response structure: {:?}", resp_json);
                    "I received an unexpected response. Please try again.".to_string()
                }
            },
            Ok(resp) => {
                let status = resp.status();
                let err_text = resp.text().await.unwrap_or_default();
                tracing::error!("Gemini API error {}: {}", status, err_text);
                format!("AI service returned an error (HTTP {}). Please check your API key.", status)
            },
            Err(e) => {
                tracing::error!("Request to Gemini failed: {}", e);
                "The AI service is currently unreachable. Please check your internet connection.".to_string()
            }
        }
    };

    // Save Assistant Message
    let mut assistant_msg = Message {
        id: None,
        conversation_id: conv_id,
        user_id,
        sender: "assistant".to_string(),
        message: assistant_text,
        detected_language: "en".to_string(),
        message_type: "text".to_string(),
        timestamp: Utc::now(),
        created_at: Utc::now(),
        updated_at: Utc::now(),
    };
    
    let res = msg_coll.insert_one(assistant_msg.clone()).await.map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Database error" })))
    })?;
    assistant_msg.id = res.inserted_id.as_object_id();

    // Update Conversation
    let update = doc! {
        "$set": {
            "last_message": assistant_msg.message.clone(),
            "updated_at": mongodb::bson::DateTime::now()
        },
        "$inc": { "total_messages": 2 }
    };
    let _ = conv_coll.update_one(doc! { "_id": conv_id }, update).await;

    Ok(Json(json!({
        "message": assistant_msg,
        "conversation_id": conv_id.to_hex()
    })))
}

// ═══════════════════════════════════════════════════════════════════════════════
// NEW ENDPOINTS: POST /api/chat  and  GET /api/chat/history/:userId
// These use the dedicated GeminiService and chat_messages / chat_sessions
// collections. Existing /api/kisan-ai/* routes are NOT affected.
// ═══════════════════════════════════════════════════════════════════════════════

use crate::models::chat_models::{ChatMessage, ChatSession};
use crate::services::gemini::{GeminiService, HistoryEntry};

// ─── Request / Response types ─────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct PostChatRequest {
    #[serde(rename = "userId")]
    pub user_id: String,
    pub message: String,
}

// ─── POST /api/chat ───────────────────────────────────────────────────────────

pub async fn post_chat(
    State(db_state): State<Arc<Database>>,
    Json(payload): Json<PostChatRequest>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {

    // ── 1. Validate input ──────────────────────────────────────────────────
    let message = GeminiService::validate_message(&payload.message)
        .map_err(|e| {
            (StatusCode::BAD_REQUEST, Json(json!({ "success": false, "error": e })))
        })?;

    let user_id = payload.user_id.trim().to_string();
    if user_id.is_empty() {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(json!({ "success": false, "error": "userId cannot be empty" })),
        ));
    }

    let sessions_coll = db_state.db.collection::<ChatSession>("chat_sessions");
    let messages_coll = db_state.db.collection::<ChatMessage>("chat_messages");

    // ── 2. Find or create a chat session for this user ─────────────────────
    let session_id = {
        let filter = doc! { "user_id": &user_id };
        let find_opts = FindOptions::builder()
            .sort(doc! { "updated_at": -1 })
            .limit(1)
            .build();

        let mut cursor = sessions_coll
            .find(filter)
            .with_options(find_opts)
            .await
            .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "success": false, "error": "Database error" }))))?;

        if let Some(Ok(session)) = cursor.next().await {
            // Reuse most-recent session
            session.id.unwrap_or_else(ObjectId::new)
        } else {
            // Create a new session with auto-title from first message
            let title = {
                let chars: String = message.chars().take(47).collect();
                if message.len() > 47 { format!("{}...", chars) } else { chars.to_string() }
            };
            let new_session = ChatSession {
                id: None,
                user_id: user_id.clone(),
                title,
                created_at: Utc::now(),
                updated_at: Utc::now(),
            };
            let res = sessions_coll.insert_one(new_session).await
                .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "success": false, "error": "Database error" }))))?;
            res.inserted_id.as_object_id().unwrap_or_else(ObjectId::new)
        }
    };

    // ── 3. Load recent conversation history for context ────────────────────
    let history: Vec<HistoryEntry> = {
        let filter = doc! { "user_id": &user_id, "session_id": session_id };
        let find_opts = FindOptions::builder()
            .sort(doc! { "timestamp": 1 })
            .limit(20)
            .build();

        let mut cursor = messages_coll
            .find(filter)
            .with_options(find_opts)
            .await
            .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "success": false, "error": "Database error" }))))?;

        let mut entries = Vec::new();
        while let Some(Ok(msg)) = cursor.next().await {
            entries.push(HistoryEntry {
                role: msg.role,
                text: msg.message,
            });
        }
        entries
    };

    // ── 4. Call Gemini AI ──────────────────────────────────────────────────
    let gemini = GeminiService::new();
    let reply = gemini.generate_reply(&history, message).await.map_err(|e| {
        let (status, msg) = match &e {
            crate::services::gemini::GeminiError::InvalidApiKey =>
                (StatusCode::UNAUTHORIZED, "Invalid or expired API key"),
            crate::services::gemini::GeminiError::RateLimited =>
                (StatusCode::TOO_MANY_REQUESTS, "Rate limit exceeded. Please try again later."),
            crate::services::gemini::GeminiError::Timeout =>
                (StatusCode::GATEWAY_TIMEOUT, "AI service timed out"),
            crate::services::gemini::GeminiError::NetworkError(_) =>
                (StatusCode::BAD_GATEWAY, "Could not reach AI service"),
            _ =>
                (StatusCode::INTERNAL_SERVER_ERROR, "AI service error"),
        };
        tracing::error!("Gemini error in post_chat: {}", e);
        (status, Json(json!({ "success": false, "error": msg })))
    })?;

    // ── 5. Store user message ──────────────────────────────────────────────
    let user_msg = ChatMessage {
        id: None,
        user_id: user_id.clone(),
        role: "user".to_string(),
        message: message.to_string(),
        session_id,
        timestamp: Utc::now(),
    };
    let _ = messages_coll.insert_one(user_msg).await;

    // ── 6. Store assistant message ─────────────────────────────────────────
    let assistant_msg = ChatMessage {
        id: None,
        user_id: user_id.clone(),
        role: "assistant".to_string(),
        message: reply.clone(),
        session_id,
        timestamp: Utc::now(),
    };
    let _ = messages_coll.insert_one(assistant_msg).await;

    // ── 7. Update session timestamp ────────────────────────────────────────
    let _ = sessions_coll
        .update_one(
            doc! { "_id": session_id },
            doc! { "$set": { "updated_at": mongodb::bson::DateTime::now() } },
        )
        .await;

    Ok(Json(json!({
        "success": true,
        "reply": reply,
        "session_id": session_id.to_hex()
    })))
}

// ─── GET /api/chat/history/:userId ───────────────────────────────────────────

pub async fn get_chat_history(
    Path(user_id): Path<String>,
    State(db_state): State<Arc<Database>>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {

    if user_id.trim().is_empty() {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(json!({ "success": false, "error": "userId cannot be empty" })),
        ));
    }

    let messages_coll = db_state.db.collection::<ChatMessage>("chat_messages");

    let filter = doc! { "user_id": user_id.trim() };
    let find_opts = FindOptions::builder()
        .sort(doc! { "timestamp": 1 })
        .build();

    let mut cursor = messages_coll
        .find(filter)
        .with_options(find_opts)
        .await
        .map_err(|_| {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "success": false, "error": "Database error" })))
        })?;

    let mut messages: Vec<Value> = Vec::new();
    while let Some(Ok(msg)) = cursor.next().await {
        messages.push(json!({
            "_id": msg.id.map(|id| id.to_hex()),
            "userId": msg.user_id,
            "role": msg.role,
            "message": msg.message,
            "sessionId": msg.session_id.to_hex(),
            "timestamp": msg.timestamp.to_rfc3339()
        }));
    }

    Ok(Json(json!({
        "success": true,
        "history": messages,
        "count": messages.len()
    })))
}

