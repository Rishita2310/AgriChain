use axum::{
    extract::{Path, State},
    Json,
};
use chrono::Utc;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::{
    errors::AppError,
    models::{Entity, Product, ProductStatus, Transaction},
    storage::{save_state_to_disk, SharedState},
};

#[derive(Deserialize)]
pub struct CreateProductRequest {
    pub name: String,
    pub category: String,
    pub origin: String,
    pub owner_name: String,
}

pub async fn create_product(
    State(state): State<SharedState>,
    Json(payload): Json<CreateProductRequest>,
) -> Result<Json<Product>, AppError> {
    let mut state = state.write().await;

    let product_id = Uuid::new_v4().to_string();
    let tx_id = Uuid::new_v4().to_string();
    let now = Utc::now();

    // Create genesis transaction for the product
    let transaction = Transaction {
        id: tx_id.clone(),
        product_id: product_id.clone(),
        sender: Entity::System,
        sender_name: "AgriChain System".to_string(),
        receiver: Entity::Farmer,
        receiver_name: payload.owner_name.clone(),
        status_update: ProductStatus::Registered,
        timestamp: now,
        details: Some("Product registered in the system".to_string()),
    };

    // Mine a new block with this transaction
    let last_block = state.blockchain.last_block().unwrap().clone();
    let last_proof = last_block.proof;
    let previous_hash = last_block.hash.clone();

    let proof = crate::blockchain::Blockchain::proof_of_work(last_proof, &vec![transaction.clone()]);
    state.blockchain.create_block(proof, previous_hash, vec![transaction]);

    // Create Product
    let product = Product {
        id: product_id.clone(),
        name: payload.name,
        category: payload.category,
        origin: payload.origin,
        current_owner: Entity::Farmer,
        owner_name: payload.owner_name,
        current_status: ProductStatus::Registered,
        history: vec![tx_id],
        created_at: now,
        updated_at: now,
    };

    state.products.insert(product_id.clone(), product.clone());
    
    // Save to disk asynchronously
    save_state_to_disk(&state).await;

    Ok(Json(product))
}

pub async fn get_products(State(state): State<SharedState>) -> Json<Vec<Product>> {
    let state = state.read().await;
    let mut products: Vec<Product> = state.products.values().cloned().collect();
    // Sort by created_at descending
    products.sort_by(|a, b| b.created_at.cmp(&a.created_at));
    Json(products)
}

pub async fn get_product(
    State(state): State<SharedState>,
    Path(id): Path<String>,
) -> Result<Json<serde_json::Value>, AppError> {
    let state = state.read().await;
    let product = state.products.get(&id).ok_or(AppError::ProductNotFound)?;

    // Gather all transactions for this product from the blockchain
    let mut history_tx = Vec::new();
    for block in &state.blockchain.chain {
        for tx in &block.transactions {
            if tx.product_id == id {
                history_tx.push(tx.clone());
            }
        }
    }

    Ok(Json(serde_json::json!({
        "product": product,
        "history": history_tx
    })))
}

#[derive(Deserialize)]
pub struct TransferRequest {
    pub product_id: String,
    pub receiver: Entity,
    pub receiver_name: String,
    pub status: ProductStatus,
    pub details: Option<String>,
}

pub async fn transfer_product(
    State(state): State<SharedState>,
    Json(payload): Json<TransferRequest>,
) -> Result<Json<Transaction>, AppError> {
    let mut state = state.write().await;

    // Check if product exists
    let product = state.products.get_mut(&payload.product_id).ok_or(AppError::ProductNotFound)?;
    
    let tx_id = Uuid::new_v4().to_string();
    let now = Utc::now();

    let transaction = Transaction {
        id: tx_id.clone(),
        product_id: payload.product_id.clone(),
        sender: product.current_owner.clone(),
        sender_name: product.owner_name.clone(),
        receiver: payload.receiver.clone(),
        receiver_name: payload.receiver_name.clone(),
        status_update: payload.status.clone(),
        timestamp: now,
        details: payload.details,
    };

    // Update product
    product.current_owner = payload.receiver;
    product.owner_name = payload.receiver_name;
    product.current_status = payload.status;
    product.updated_at = now;
    product.history.push(tx_id.clone());

    // Mine a new block
    let last_block = state.blockchain.last_block().unwrap().clone();
    let last_proof = last_block.proof;
    let previous_hash = last_block.hash.clone();

    let proof = crate::blockchain::Blockchain::proof_of_work(last_proof, &vec![transaction.clone()]);
    state.blockchain.create_block(proof, previous_hash, vec![transaction.clone()]);

    save_state_to_disk(&state).await;

    Ok(Json(transaction))
}

pub async fn get_blockchain(State(state): State<SharedState>) -> Json<crate::blockchain::Blockchain> {
    let state = state.read().await;
    Json(state.blockchain.clone())
}

pub async fn validate_blockchain(State(state): State<SharedState>) -> Json<serde_json::Value> {
    let state = state.read().await;
    let is_valid = state.blockchain.is_chain_valid();
    Json(serde_json::json!({
        "valid": is_valid,
        "length": state.blockchain.chain.len()
    }))
}

#[derive(Serialize)]
pub struct Analytics {
    pub total_products: usize,
    pub total_blocks: usize,
    pub total_transactions: usize,
}

pub async fn get_analytics(State(state): State<SharedState>) -> Json<Analytics> {
    let state = state.read().await;
    
    let total_transactions = state.blockchain.chain.iter().map(|b| b.transactions.len()).sum();

    Json(Analytics {
        total_products: state.products.len(),
        total_blocks: state.blockchain.chain.len(),
        total_transactions,
    })
}
