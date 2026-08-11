use ethers::core::types::Signature;
use std::str::FromStr;

pub struct SignatureService;

impl SignatureService {
    pub fn verify_signature(wallet_address: &str, nonce: &str, signature_hex: &str) -> Result<bool, String> {
        let message = format!("Welcome to AgriChain!\n\nPlease sign this message to verify your wallet ownership.\n\nNonce: {}", nonce);
        
        let signature = Signature::from_str(signature_hex).map_err(|_| "Invalid signature format".to_string())?;
        
        // recover address
        let recovered_address = signature.recover(message).map_err(|_| "Failed to recover wallet address from signature".to_string())?;
        
        let recovered_hex = format!("{:?}", recovered_address).to_lowercase();
        let expected_hex = wallet_address.to_lowercase();
        
        if recovered_hex == expected_hex {
            Ok(true)
        } else {
            Err(format!("Signature address mismatch. Recovered: {}", recovered_hex))
        }
    }
}
