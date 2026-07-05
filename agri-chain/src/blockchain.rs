use chrono::Utc;
use serde_json::json;

use crate::models::{Block, Transaction};
use crate::utils::hash_string;

use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Blockchain {
    pub chain: Vec<Block>,
}

impl Blockchain {
    /// Initialize a new blockchain and create the genesis block.
    pub fn new() -> Self {
        let mut blockchain = Blockchain { chain: Vec::new() };
        // Create genesis block
        blockchain.create_block(100, "1".to_string(), vec![]);
        blockchain
    }

    /// Creates a new block and adds it to the chain.
    pub fn create_block(
        &mut self,
        proof: u64,
        previous_hash: String,
        transactions: Vec<Transaction>,
    ) -> Block {
        let timestamp = Utc::now().timestamp();
        
        let mut block = Block {
            index: (self.chain.len() + 1) as u64,
            timestamp,
            transactions,
            proof,
            previous_hash,
            hash: String::new(),
        };

        block.hash = Self::hash_block(&block);
        self.chain.push(block.clone());
        block
    }

    /// Gets the last block in the chain.
    pub fn last_block(&self) -> Option<&Block> {
        self.chain.last()
    }

    /// Simple Proof of Work Algorithm:
    /// - Find a number p' such that hash(p + p' + transactions) contains 4 leading zeroes
    /// - Where p is the previous proof, and p' is the new proof
    pub fn proof_of_work(last_proof: u64, transactions: &[Transaction]) -> u64 {
        let mut proof: u64 = 0;
        while !Self::valid_proof(last_proof, proof, transactions) {
            proof += 1;
        }
        proof
    }

    /// Validates the proof: Does hash(last_proof, proof, transactions) contain 4 leading zeroes?
    fn valid_proof(last_proof: u64, proof: u64, transactions: &[Transaction]) -> bool {
        let tx_data = serde_json::to_string(transactions).unwrap_or_default();
        let guess = format!("{}{}{}", last_proof, proof, tx_data);
        let guess_hash = hash_string(&guess);
        guess_hash.starts_with("0000") // Difficulty level of 4
    }

    /// Creates a SHA-256 hash of a Block.
    pub fn hash_block(block: &Block) -> String {
        // We hash everything except the hash field itself
        let block_data = json!({
            "index": block.index,
            "timestamp": block.timestamp,
            "transactions": block.transactions,
            "proof": block.proof,
            "previous_hash": block.previous_hash
        });
        
        let block_str = serde_json::to_string(&block_data).unwrap_or_default();
        hash_string(&block_str)
    }

    /// Validate the entire blockchain.
    pub fn is_chain_valid(&self) -> bool {
        let mut last_block = &self.chain[0];
        let mut current_index = 1;

        while current_index < self.chain.len() {
            let block = &self.chain[current_index];

            // Check if the hash of the block is correct
            if block.previous_hash != Self::hash_block(last_block) {
                return false;
            }

            // Check if the proof of work is correct
            if !Self::valid_proof(last_block.proof, block.proof, &block.transactions) {
                return false;
            }

            last_block = block;
            current_index += 1;
        }

        true
    }
}
