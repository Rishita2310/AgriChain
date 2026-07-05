use sha2::{Digest, Sha256};

/// Hashes a string using SHA-256 and returns the hex representation.
pub fn hash_string(data: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(data.as_bytes());
    let result = hasher.finalize();
    format!("{:x}", result)
}

/// Helper to serialize any Serde-compatible struct to a JSON string for hashing.
pub fn hash_struct<T: serde::Serialize>(data: &T) -> String {
    let serialized = serde_json::to_string(data).unwrap_or_default();
    hash_string(&serialized)
}
