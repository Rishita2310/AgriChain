mod blockchain;
mod errors;
mod handlers;
mod models;
mod routes;
mod storage;
mod utils;

use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() {
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "agri_chain=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    tracing::info!("Initializing AgriChain State...");
    let state = storage::init_state().await;

    let app = routes::create_router(state);

    let addr = tokio::net::TcpListener::bind("0.0.0.0:8000").await.unwrap();
    tracing::info!("AgriChain server running on http://localhost:8000");

    axum::serve(addr, app).await.unwrap();
}
