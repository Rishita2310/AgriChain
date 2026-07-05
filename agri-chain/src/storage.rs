use std::collections::HashMap;
use std::fs;
use std::path::Path;
use std::sync::Arc;
use tokio::sync::RwLock;

use crate::blockchain::Blockchain;
use crate::models::Product;

#[derive(Debug, Clone)]
pub struct AppState {
    pub blockchain: Blockchain,
    pub products: HashMap<String, Product>,
}

impl AppState {
    pub fn new() -> Self {
        AppState {
            blockchain: Blockchain::new(),
            products: HashMap::new(),
        }
    }
}

pub type SharedState = Arc<RwLock<AppState>>;

pub async fn init_state() -> SharedState {
    let state = load_state_from_disk().unwrap_or_else(|| AppState::new());
    Arc::new(RwLock::new(state))
}

fn load_state_from_disk() -> Option<AppState> {
    let chain_path = Path::new("data/blockchain.json");
    let products_path = Path::new("data/products.json");

    if chain_path.exists() && products_path.exists() {
        let chain_data = fs::read_to_string(chain_path).ok()?;
        let products_data = fs::read_to_string(products_path).ok()?;

        let blockchain: Blockchain = serde_json::from_str(&chain_data).ok()?;
        let products: HashMap<String, Product> = serde_json::from_str(&products_data).ok()?;

        Some(AppState {
            blockchain,
            products,
        })
    } else {
        None
    }
}

pub async fn save_state_to_disk(state: &AppState) {
    let chain_data = serde_json::to_string_pretty(&state.blockchain).unwrap_or_default();
    let products_data = serde_json::to_string_pretty(&state.products).unwrap_or_default();

    // Ensure data directory exists
    if !Path::new("data").exists() {
        let _ = fs::create_dir("data");
    }

    let _ = fs::write("data/blockchain.json", chain_data);
    let _ = fs::write("data/products.json", products_data);
}
