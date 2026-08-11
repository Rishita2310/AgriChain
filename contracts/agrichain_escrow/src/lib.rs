//! AgriChain Decentralized Escrow Smart Contract for Arbitrum Stylus
//! Secures payments between Buyers and Farmers on Arbitrum Sepolia.

#![cfg_attr(not(feature = "export-abi"), no_main)]
extern crate alloc;

use alloy_primitives::{Address, U256};
use alloy_sol_types::sol;
use stylus_sdk::{
    call::transfer_eth,
    evm, msg,
    prelude::*,
};

sol_storage! {
    #[entrypoint]
    pub struct AgriChainEscrow {
        address owner;
        mapping(string => EscrowRecord) escrows;
    }

    pub struct EscrowRecord {
        address buyer;
        address farmer;
        uint256 amount;
        bool exists;
        bool is_released;
        bool is_refunded;
        uint256 created_at;
    }
}

sol! {
    event EscrowDeposited(string indexed order_id, address indexed buyer, address indexed farmer, uint256 amount);
    event EscrowReleased(string indexed order_id, address indexed farmer, uint256 amount);
    event EscrowRefunded(string indexed order_id, address indexed buyer, uint256 amount);

    error OnlyOwner();
    error OnlyBuyer();
    error EscrowNotFound();
    error EscrowAlreadyResolved();
    error ZeroDeposit();
    error TransferFailed();
}

#[public]
impl AgriChainEscrow {
    /// Initialize contract owner
    pub fn init(&mut self) -> Result<(), Vec<u8>> {
        let current_owner = self.owner.get();
        if current_owner == Address::ZERO {
            self.owner.set(msg::sender());
        }
        Ok(())
    }

    /// Deposit funds into Escrow for a given order
    #[payable]
    pub fn deposit(&mut self, order_id: String, farmer: Address) -> Result<(), Vec<u8>> {
        let value = msg::value();
        if value == U256::ZERO {
            return Err(ZeroDeposit {}.into());
        }

        let mut escrow = self.escrows.setter(order_id.clone());
        let buyer = msg::sender();

        escrow.buyer.set(buyer);
        escrow.farmer.set(farmer);
        escrow.amount.set(value);
        escrow.exists.set(true);
        escrow.is_released.set(false);
        escrow.is_refunded.set(false);
        escrow.created_at.set(U256::from(evm::block_timestamp()));

        evm::log(EscrowDeposited {
            order_id,
            buyer,
            farmer,
            amount: value,
        });

        Ok(())
    }

    /// Release funds to farmer upon buyer confirmation or admin dispute resolution
    pub fn release_escrow(&mut self, order_id: String) -> Result<(), Vec<u8>> {
        let mut escrow = self.escrows.setter(order_id.clone());
        if !escrow.exists.get() {
            return Err(EscrowNotFound {}.into());
        }
        if escrow.is_released.get() || escrow.is_refunded.get() {
            return Err(EscrowAlreadyResolved {}.into());
        }

        let caller = msg::sender();
        let buyer = escrow.buyer.get();
        let owner = self.owner.get();

        if caller != buyer && caller != owner {
            return Err(OnlyBuyer {}.into());
        }

        let farmer = escrow.farmer.get();
        let amount = escrow.amount.get();

        escrow.is_released.set(true);

        transfer_eth(farmer, amount).map_err(|_| TransferFailed {})?;

        evm::log(EscrowReleased {
            order_id,
            farmer,
            amount,
        });

        Ok(())
    }

    /// Refund funds to buyer if farmer cancels/rejects the order
    pub fn refund_escrow(&mut self, order_id: String) -> Result<(), Vec<u8>> {
        let mut escrow = self.escrows.setter(order_id.clone());
        if !escrow.exists.get() {
            return Err(EscrowNotFound {}.into());
        }
        if escrow.is_released.get() || escrow.is_refunded.get() {
            return Err(EscrowAlreadyResolved {}.into());
        }

        let caller = msg::sender();
        let farmer = escrow.farmer.get();
        let owner = self.owner.get();

        if caller != farmer && caller != owner {
            return Err(OnlyOwner {}.into());
        }

        let buyer = escrow.buyer.get();
        let amount = escrow.amount.get();

        escrow.is_refunded.set(true);

        transfer_eth(buyer, amount).map_err(|_| TransferFailed {})?;

        evm::log(EscrowRefunded {
            order_id,
            buyer,
            amount,
        });

        Ok(())
    }

    /// View escrow details
    pub fn get_escrow(&self, order_id: String) -> (Address, Address, U256, bool, bool, bool, U256) {
        let escrow = self.escrows.getter(order_id);
        (
            escrow.buyer.get(),
            escrow.farmer.get(),
            escrow.amount.get(),
            escrow.exists.get(),
            escrow.is_released.get(),
            escrow.is_refunded.get(),
            escrow.created_at.get(),
        )
    }
}
