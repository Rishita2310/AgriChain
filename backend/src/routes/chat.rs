use axum::{
    routing::{get, post, patch, delete},
    Router,
};
use std::sync::Arc;
use crate::database::db::Database;
use crate::controllers::chat::{
    // Existing kisan-ai handlers
    get_conversations,
    get_conversation_history,
    chat_message,
    rename_conversation,
    delete_conversation,
    // New /api/chat handlers
    post_chat,
    get_chat_history,
};

/// Routes mounted at /api/kisan-ai (existing, unchanged)
pub fn routes() -> Router<Arc<Database>> {
    Router::new()
        .route("/chat", post(chat_message))
        .route("/conversations", get(get_conversations))
        .route("/conversations/{id}", get(get_conversation_history))
        .route("/conversations/{id}", patch(rename_conversation))
        .route("/conversations/{id}", delete(delete_conversation))
}

/// New routes mounted at /api/chat
pub fn chat_routes() -> Router<Arc<Database>> {
    Router::new()
        .route("/", post(post_chat))
        .route("/history/{user_id}", get(get_chat_history))
}

