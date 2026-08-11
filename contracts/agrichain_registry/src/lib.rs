//! AgriChain Product & Origin Registry for Arbitrum Stylus
//! Stores immutable product provenance, harvest records, and farmer credentials.

#![cfg_attr(not(feature = "export-abi"), no_main)]
extern crate alloc;

use alloy_primitives::{Address, U256};
use alloy_sol_types::sol;
use stylus_sdk::{
    evm, msg,
    prelude::*,
};

sol_storage! {
    #[entrypoint]
    pub struct ProductRegistry {
        address owner;
        mapping(string => ProductRecord) products;
    }

    pub struct ProductRecord {
        address farmer;
        string product_name;
        string category;
        uint256 quantity;
        uint256 price;
        bool is_organic;
        uint256 harvest_timestamp;
        bool exists;
    }
}

sol! {
    event ProductRegistered(string indexed product_id, address indexed farmer, string product_name, uint256 price);
    event ProductStockUpdated(string indexed product_id, uint256 new_quantity);

    error OnlyFarmerOrOwner();
    error ProductAlreadyExists();
    error ProductDoesNotExist();
}

#[public]
impl ProductRegistry {
    /// Initialize owner
    pub fn init(&mut self) -> Result<(), Vec<u8>> {
        let current_owner = self.owner.get();
        if current_owner == Address::ZERO {
            self.owner.set(msg::sender());
        }
        Ok(())
    }

    /// Register a new agricultural product on-chain
    pub fn register_product(
        &mut self,
        product_id: String,
        product_name: String,
        category: String,
        quantity: U256,
        price: U256,
        is_organic: bool,
    ) -> Result<(), Vec<u8>> {
        let mut record = self.products.setter(product_id.clone());
        if record.exists.get() {
            return Err(ProductAlreadyExists {}.into());
        }

        let farmer = msg::sender();
        record.farmer.set(farmer);
        record.product_name.set_str(&product_name);
        record.category.set_str(&category);
        record.quantity.set(quantity);
        record.price.set(price);
        record.is_organic.set(is_organic);
        record.harvest_timestamp.set(U256::from(evm::block_timestamp()));
        record.exists.set(true);

        evm::log(ProductRegistered {
            product_id,
            farmer,
            product_name,
            price,
        });

        Ok(())
    }

    /// Update quantity when orders are placed
    pub fn update_quantity(&mut self, product_id: String, new_quantity: U256) -> Result<(), Vec<u8>> {
        let mut record = self.products.setter(product_id.clone());
        if !record.exists.get() {
            return Err(ProductDoesNotExist {}.into());
        }

        let caller = msg::sender();
        let farmer = record.farmer.get();
        let owner = self.owner.get();

        if caller != farmer && caller != owner {
            return Err(OnlyFarmerOrOwner {}.into());
        }

        record.quantity.set(new_quantity);

        evm::log(ProductStockUpdated {
            product_id,
            new_quantity,
        });

        Ok(())
    }

    /// Verify a product's provenance and on-chain details
    pub fn get_product(&self, product_id: String) -> (Address, String, String, U256, U256, bool, U256, bool) {
        let record = self.products.getter(product_id);
        (
            record.farmer.get(),
            record.product_name.get_string(),
            record.category.get_string(),
            record.quantity.get(),
            record.price.get(),
            record.is_organic.get(),
            record.harvest_timestamp.get(),
            record.exists.get(),
        )
    }
}
