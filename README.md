
# AgriChain ⛓️🌱

**A transparent and decentralized solution for the modern agricultural supply chain.**

[![Rust Version][rust-shield]][rust-link]
[![Build Status][build-shield]][build-link]
[![License][license-shield]][license-link]

---

**AgriChain** is a blockchain-inspired platform designed to bring transparency, traceability, and efficiency to the agricultural supply chain. By creating an immutable and decentralized ledger, AgriChain empowers farmers, distributors, retailers, and consumers with trusted information about the origin and journey of agricultural products.

## Table of Contents

- [The Problem](#the-problem)
- [The Solution](#the-solution)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started) 
  - [Prerequisites](#prerequisites)
  - [Installation & Setup](#installation--setup)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## The Problem

The traditional agricultural supply chain is often opaque, fragmented, and inefficient. This leads to several challenges:

- **Lack of Transparency:** Consumers have little to no information about where their food comes from, how it was grown, or the conditions under which it was transported.
- **Food Fraud:** Adulteration and counterfeiting of products are rampant, leading to health risks and economic losses.
- **Inefficiency:** Manual and paper-based tracking systems are prone to errors, delays, and fraud.
- **Unfair Farmer Compensation:** Small-scale farmers often lack direct access to markets, leading to exploitation by intermediaries.
- **Difficulty in Recalls:** In the event of a food safety issue, tracing the source of the contamination is a slow and difficult process.

## The Solution

**AgriChain** addresses these problems by leveraging a blockchain-inspired backend to create a single source of truth for the entire supply chain. Each transaction, from the farm to the consumer, is recorded as a 'block' in a distributed 'chain', ensuring that the data is:

- **Immutable:** Once a record is added, it cannot be altered, preventing fraud and tampering.
- **Transparent:** All stakeholders can access the same information, fostering trust and accountability.
- **Traceable:** The entire journey of a product can be traced in seconds, from its origin to the point of sale.
- **Efficient:** Digital records eliminate the need for cumbersome paperwork and reduce administrative overhead.

This system empowers consumers to make informed choices, helps farmers get fair value for their produce, and enables businesses to build more resilient and trustworthy supply chains.

## Key Features

- **Decentralized Ledger:** A secure, append-only log of all transactions.
- **Product Tracking:** Track the entire lifecycle of a product from farm to fork.
- **QR Code Integration:** (Future Goal) Consumers can scan a QR code to view the product's history.
- **Stakeholder Management:** Register and manage different actors in the supply chain (farmers, distributors, etc.).
- **RESTful API:** A simple yet powerful API for interacting with the blockchain.

## Tech Stack

- **Backend:** Rust
- **Web Framework:** Axum
- **Async Runtime:** Tokio
- **Data Serialization:** Serde
- **Hashing:** SHA256 for data integrity
- **Frontend:** HTML, CSS, JavaScript (served statically)

## Getting Started

Follow these instructions to get a local copy of AgriChain up and running.

### Prerequisites

You need to have Rust and its package manager, Cargo, installed on your system.

**Step 1: Install Rust**

If you don't have Rust installed, you can install it using `rustup`. `rustup` is the official tool for managing Rust toolchains.

- **On macOS / Linux:**
  ```shell
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
  ```
- **On Windows:**
  Download and run `rustup-init.exe` from the [official Rust website](https://www.rust-lang.org/tools/install).

Follow the on-screen instructions. This will install both `rustc` (the compiler) and `cargo` (the package manager and build tool).

**Step 2: Verify Installation**

Open a new terminal and run the following commands to ensure Rust and Cargo are correctly installed:
```shell
rustc --version
cargo --version
```
You should see the version numbers of the installed tools.

### Installation & Setup

**Step 1: Clone the Repository**

First, clone the AgriChain repository to your local machine:
```shell
git clone https://github.com/your-username/AgriChain.git
cd AgriChain/agri-chain
```
*(Note: Replace `your-username` with the actual repository URL)*

**Step 2: Build the Project**

Cargo will handle all the dependencies. Navigate to the project directory and use `cargo build` to compile the project. For an optimized build, use the `--release` flag.
```shell
cargo build --release
```

**Step 3: Run the Server**

Once the build is complete, you can start the AgriChain server:
```shell
cargo run --release
```
The server will start, and you should see output indicating that it is listening on a specific port (e.g., `http://127.0.0.1:3000`).

**Step 4: Access the Application**

Open your web browser and navigate to `http://127.0.0.1:3000`. You should see the AgriChain web interface.

## Project Structure

```
agri-chain/
├── Cargo.toml      # Project manifest and dependencies
├── src/
│   ├── main.rs         # Application entry point
│   ├── blockchain.rs   # Core blockchain logic
│   ├── models.rs       # Data structures (e.g., Block, Transaction)
│   ├── handlers.rs     # API request handlers
│   ├── routes.rs       # API route definitions
│   ├── errors.rs       # Custom error types
│   ├── storage.rs      # Data persistence logic
│   └── utils.rs        # Utility functions
└── static/
    ├── index.html      # Main frontend page
    └── ...             # CSS and JS files
```

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## Team

| Name           | GitHub                                             | LinkedIn                                                              |
|----------------|----------------------------------------------------|-----------------------------------------------------------------------|
| Dixit Patel    | [create2learn7238](https://github.com/create2learn7238) | -                                                                     |
| Akshar Patel   | [aksharpatel007](https://github.com/aksharpatel007)     | [akshar-patel-a83611344](https://www.linkedin.com/in/akshar-patel-a83611344/) |
| Rishita Bhuva  | [Rishita2310](https://github.com/Rishita2310/)         | -                                                                     |
| Isha Agarwal   | [ishaagarwal18](https://github.com/ishaagarwal18)       | [isha-agarwal-164a83319](https://www.linkedin.com/in/isha-agarwal-164a83319)                                                                     |


## License

Distributed under the MIT License. See `LICENSE` for more information.

[rust-shield]: https://img.shields.io/badge/rust-1.78-orange.svg
[rust-link]: https://www.rust-lang.org
[build-shield]: https://img.shields.io/badge/build-passing-brightgreen
[build-link]: #
[license-shield]: https://img.shields.io/badge/license-MIT-blue.svg
[license-link]: #
