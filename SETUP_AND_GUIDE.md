# AgriChain - Setup & Quick Start Guide

## Project Overview
AgriChain is a full-stack decentralized agriculture marketplace platform connecting farmers and buyers directly through blockchain-based escrow and smart contracts.

**Tech Stack:**
- **Frontend:** React 19 + Vite + Tailwind CSS + Framer Motion
- **Backend:** Rust + Axum + MongoDB
- **Blockchain:** Arbitrum Sepolia + Viem + Wagmi
- **Authentication:** JWT + Web3 Wallet Signature
- **AI:** Gemini API for KisanAI recommendations

---

## Prerequisites

### Backend Requirements
- Rust 1.70+ (install from https://rustup.rs/)
- MongoDB 4.0+ (running locally or cloud instance)
- Node.js 16+ (for utilities)

### Frontend Requirements
- Node.js 16+
- npm or yarn package manager

### Environment Setup

#### Backend (.env)
```env
DATABASE_URL=mongodb://localhost:27017/agrichain
JWT_SECRET=your_jwt_secret_key_here
GEMINI_API_KEY=your_gemini_api_key
ADMIN_WALLET=0xAdminWalletAddress (optional)
```

#### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:3000/api
```

---

## Installation & Running

### Backend Setup

```bash
cd backend

# Install dependencies
cargo build

# Run database migrations (if needed)
# - Ensure MongoDB is running on localhost:27017

# Start the server
cargo run

# Server runs on http://localhost:3000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173 in your browser
```

---

## Project Structure

```
AgriChain/
├── backend/                      # Rust + Axum backend
│   ├── src/
│   │   ├── main.rs             # Application entry point
│   │   ├── routes/             # API route definitions
│   │   │   ├── admin.rs        # Admin panel routes
│   │   │   ├── auth.rs         # Authentication routes
│   │   │   ├── farmer.rs       # Farmer dashboard routes
│   │   │   ├── buyer_actions.rs # Buyer routes
│   │   │   └── ...
│   │   ├── controllers/        # Business logic handlers
│   │   ├── models/             # Data models & DTOs
│   │   ├── services/           # External service integrations (Gemini AI)
│   │   └── database/           # MongoDB connection & initialization
│   └── Cargo.toml
│
├── frontend/                     # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx             # Main router & layout
│   │   ├── pages/              # Page components
│   │   │   ├── Admin/          # Admin panel pages
│   │   │   ├── Dashboard/      # Farmer/Buyer dashboards
│   │   │   └── ...
│   │   ├── components/         # Reusable components
│   │   ├── services/           # API service integrations
│   │   ├── store/              # Zustand state management
│   │   ├── hooks/              # Custom React hooks
│   │   ├── utils/              # Utility functions
│   │   └── styles/             # Global styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── contracts/                    # Arbitrum Stylus smart contracts (Rust)
    ├── agrichain_escrow/       # Escrow contract
    └── agrichain_registry/     # Product registry contract
```

---

## Key Features

### 1. Authentication
- **Wallet-based Login:** Connect MetaMask/Web3 wallet
- **Signature Verification:** Sign messages with wallet
- **JWT Tokens:** Secure API access with tokens
- **Role-based Access:** Farmer, Buyer, Admin roles

### 2. Farmer Dashboard
- **Product Management:** List, edit, delete agricultural products
- **Order Management:** Accept/reject/track buyer orders
- **Analytics:** Sales, revenue, performance metrics
- **Wallet:** View earnings and transaction history
- **Profile:** Manage farm details and personal information
- **Reviews:** See customer feedback and ratings
- **KisanAI:** AI-powered farming recommendations

### 3. Buyer Dashboard
- **Marketplace:** Browse and search products
- **Filtering:** Filter by price, organic, rating, location
- **Checkout:** Secure escrow-based payment
- **Orders:** Track order status and delivery
- **Reviews:** Leave feedback on products
- **Wishlist:** Save favorite products
- **AI Recommendations:** Personalized product suggestions

### 4. Admin Panel
- **Dashboard:** Platform statistics and metrics
- **User Management:** View and manage all users
- **Product Management:** Monitor product listings
- **Order Management:** Track all orders across platform
- **Analytics:** Deep dive into platform metrics
- **Smart Contracts:** Monitor blockchain contracts
- **Settings:** Platform configuration

### 5. Blockchain Integration
- **Escrow Contracts:** Secure payment handling
- **Smart Contracts:** Arbitrum Sepolia network
- **Transaction Verification:** On-chain transaction records
- **Wallet Integration:** MetaMask + Viem

---

## API Endpoints Overview

### Authentication
- `POST /api/auth/login/request` - Request nonce for signing
- `POST /api/auth/login/verify` - Verify signed message
- `POST /api/auth/register` - Register new user
- `GET /api/auth/profile` - Get user profile

### Admin Panel
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/users` - List all users
- `GET /api/admin/products` - List all products
- `GET /api/admin/orders` - List all orders
- `GET /api/admin/contracts` - Smart contract status

### Farmer Operations
- `GET /api/farmer/orders` - Farmer's orders
- `POST /api/farmer/orders/{id}/action` - Accept/reject orders
- `GET /api/farmer/profile` - Farmer profile
- `PUT /api/farmer/profile/*` - Update profile
- `GET /api/products/farmer` - Farmer's products

### Buyer Operations
- `GET /api/buyer/orders` - Buyer's orders
- `GET /api/products` - List products (marketplace)
- `GET /api/products/{id}` - Product details
- `POST /api/orders` - Create order
- `GET /api/reviews/buyer/{wallet}` - Buyer's reviews

### Products
- `POST /api/products` - Create product (Farmer)
- `GET /api/products` - List products
- `GET /api/products/{id}` - Get product details
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product
- `PATCH /api/products/{id}/status` - Update status

### Reviews
- `GET /api/reviews/farmer/{id}` - Farmer reviews
- `GET /api/reviews/buyer/{id}` - Buyer reviews
- `POST /api/reviews/helpful/{id}` - Mark as helpful

---

## Database Schema

### Collections in MongoDB

#### Users
```javascript
{
  _id: ObjectId,
  wallet_address: String,
  full_name: String,
  email: String,
  phone_number: String,
  role: String, // 'Farmer', 'Buyer', 'Admin'
  profile_photo: String,
  country: String,
  state: String,
  city: String,
  farmer_details: {...},
  buyer_details: {...},
  status: String,
  is_verified: Boolean,
  created_at: DateTime,
  updated_at: DateTime
}
```

#### Products
```javascript
{
  _id: ObjectId,
  product_id: String,
  wallet_address: String,
  product_name: String,
  category: String,
  price: Number,
  currency: String,
  quantity: Number,
  unit: String,
  description: String,
  images: [String],
  organic: Boolean,
  harvest_date: Date,
  origin: String,
  rating: Number,
  reviews_count: Number,
  status: String, // 'Active', 'Out of Stock', 'Hidden'
  created_at: DateTime,
  updated_at: DateTime
}
```

#### Orders
```javascript
{
  _id: ObjectId,
  order_id: String,
  buyer_wallet: String,
  product_id: String,
  farmer_id: String,
  quantity: Number,
  status: String,
  delivery_address: {...},
  payment: {...},
  escrow_status: String,
  blockchain_tx_hash: String,
  created_at: DateTime,
  updated_at: DateTime
}
```

---

## Common Tasks

### Add a New Admin User
Connect with admin wallet, then set ADMIN_WALLET env variable to grant admin access.

### Deploy Smart Contracts
```bash
cd contracts/agrichain_escrow
cargo build --target wasm32-unknown-unknown

# Deploy to Arbitrum Sepolia testnet
# (Requires wallet with testnet ETH)
```

### Generate Test Data
```bash
cd backend
cargo run --bin seed_orders
```

### Rebuild Frontend
```bash
cd frontend
npm run build
# Output: dist/
```

---

## Troubleshooting

### Backend won't compile
- Ensure Rust is updated: `rustup update`
- Check MongoDB is running: `mongod`
- Verify all env vars are set

### Frontend won't start
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf .vite`
- Check Node.js version: `node -v` (should be 16+)

### API calls failing
- Check backend is running on localhost:3000
- Verify JWT token is valid
- Check MongoDB connection
- Review browser console for CORS errors

### MetaMask not connecting
- Install MetaMask extension
- Switch to Arbitrum Sepolia network
- Ensure you have testnet ETH for transactions

---

## Performance Tips

1. **Frontend Optimization:**
   - Enable lazy loading for routes
   - Use React.memo for heavy components
   - Optimize images (use WebP format)
   - Enable compression in Vite

2. **Backend Optimization:**
   - Add database indexes
   - Implement caching
   - Use connection pooling
   - Enable GZIP compression

3. **General:**
   - Monitor API response times
   - Use CDN for static assets
   - Implement rate limiting
   - Regular database backups

---

## Security Checklist

- [ ] Set strong JWT_SECRET
- [ ] Use HTTPS in production
- [ ] Validate all user inputs
- [ ] Implement rate limiting
- [ ] Use environment variables for secrets
- [ ] Enable CORS restrictions
- [ ] Implement API key validation
- [ ] Regular security audits
- [ ] Keep dependencies updated

---

## Support & Documentation

For detailed component documentation, see:
- [Frontend Components Guide](./frontend/README.md)
- [Backend API Documentation](./backend/README.md)
- [Smart Contracts Guide](./contracts/README.md)

---

## License
ISC

---

**Last Updated:** 2026-08-11
**Project Status:** Production Ready ✓
