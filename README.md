# AgriChain 🌾

![AgriChain](https://img.shields.io/badge/AgriChain-Blockchain%20%7C%20AI-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)

## 📖 Introduction
AgriChain is an innovative, decentralized agricultural platform designed to empower Indian farmers and buyers. By leveraging the power of Web3 (Blockchain) and Artificial Intelligence, AgriChain provides a secure, transparent, and intelligent ecosystem for agricultural trade, advisory, and supply chain management. 

At the heart of the platform is **Kisan AI**, an expert agricultural assistant powered by Gemini, which helps farmers with real-time crop pricing, pest control, weather advisories, and best farming practices.

## ⚠️ The Problem
The traditional agricultural supply chain faces numerous challenges:
- **Lack of Transparency:** Farmers often do not get fair prices due to middlemen and opaque market conditions.
- **Information Gap:** Access to real-time market trends, weather forecasts, and modern farming techniques is limited.
- **Trust Issues:** Buyers and sellers struggle with trust, leading to delayed payments and quality disputes.
- **Supply Chain Inefficiencies:** Tracking produce from farm to table is difficult, causing food wastage and quality degradation.

## 💡 Our Solution
AgriChain addresses these issues by combining modern technologies:
- **Blockchain (Smart Contracts):** Ensures transparent, immutable, and trustless transactions between farmers and buyers. Payments are automated and secure.
- **Kisan AI (Artificial Intelligence):** Provides tailored advice on crop management, government schemes, and market prices in regional contexts.
- **Decentralized Marketplace:** Connects farmers directly with buyers, eliminating unnecessary intermediaries and ensuring fair compensation.

## 🚀 Key Features
- **Smart Contract Based Trading:** Secure escrow and automated payments.
- **Kisan AI Chatbot:** Get instant answers to farming-related queries.
- **Real-Time Market Data:** Access to the latest crop prices and trends.
- **Weather & Crop Advisories:** Proactive alerts for weather changes and pest control.

## 🛠️ Technology Stack
- **Frontend:** React / Next.js (Modern Web Interface)
- **Backend:** Rust (High-performance API and AI integration)
- **Blockchain:** Solidity (Smart Contracts)
- **AI Integration:** Google Gemini API

## 📂 Project Structure
- `/frontend` - Web application for users (Farmers and Buyers).
- `/backend` - Rust-based server handling API requests, AI services, and database connections.
- `/contracts` - Solidity smart contracts deployed on the blockchain.

## ⚙️ Setup & Installation

### Prerequisites
- Node.js & npm/yarn
- Rust & Cargo
- MongoDB (or equivalent database)
- Google Gemini API Key

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a `.env` file based on `.env.example` and add your Gemini API Key.
3. Run the server:
   ```bash
   cargo run --bin backend
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 🤝 Contributing
Contributions are welcome! Please fork the repository and create a pull request with your features or bug fixes.

## 📄 License
This project is licensed under the MIT License.
