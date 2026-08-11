import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import React, { useEffect } from 'react';
import axios from '@/services/api';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import PublicRoute from './components/layout/PublicRoute';
import RoleProtectedRoute from './components/layout/RoleProtectedRoute';
import BuyerLayout from './components/layout/BuyerLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminLayout from './components/layout/AdminLayout';
import FarmerHome from './pages/Dashboard/Farmer/FarmerHome';
import ProductDetails from './pages/Dashboard/Buyer/ProductDetails/ProductDetails';
import CompleteProfile from './pages/Dashboard/Farmer/CompleteProfile';
import BuyerWishlist from './pages/Dashboard/Buyer/Wishlist/BuyerWishlist';
import ProductList from './pages/Dashboard/Farmer/Products/ProductList';
import AddProduct from './pages/Dashboard/Farmer/Products/AddProduct';
import ProductSuccess from './pages/Dashboard/Farmer/Products/ProductSuccess';
import OrderList from './pages/Dashboard/Farmer/Orders/OrderList';
import OrderDetails from './pages/Dashboard/Farmer/Orders/OrderDetails';
import BuyerOrdersList from './pages/Dashboard/Buyer/Orders/BuyerOrdersList';
import OrderTracking from './pages/Dashboard/Buyer/Orders/OrderTracking';
import BuyerReviews from './pages/Dashboard/Buyer/Reviews/BuyerReviews';
import BuyerProfile from './pages/Dashboard/Buyer/Profile/BuyerProfile';
import WalletDashboard from './pages/Dashboard/Shared/WalletDashboard/WalletDashboard';
import NotificationsPage from './pages/Dashboard/Shared/Notifications/NotificationsPage';
import SettingsPage from './pages/Dashboard/Shared/Settings/SettingsPage';
import FarmerAIFeatures from './pages/Dashboard/Farmer/AIFeatures/FarmerAIFeatures';
import FarmerAnalytics from './pages/Dashboard/Farmer/Analytics';
import FarmerReviews from './pages/Dashboard/Farmer/Reviews/FarmerReviews';
import FarmerProfile from './pages/Dashboard/Farmer/Profile/FarmerProfile';
import BuyerAIFeatures from './pages/Dashboard/Buyer/AIFeatures/BuyerAIFeatures';

// Admin Pages
import AdminHome from './pages/Admin/Dashboard/AdminHome';
import UserManagement from './pages/Admin/Management/UserManagement';
import SmartContractStatus from './pages/Admin/SmartContracts/SmartContractStatus';
import AdminSettings from './pages/Admin/Settings/AdminSettings';
import AdminAnalytics from './pages/Admin/Analytics/AdminAnalytics';
import ProductManagement from './pages/Admin/Management/ProductManagement';
import OrderManagement from './pages/Admin/Management/OrderManagement';

import Marketplace from './pages/Dashboard/Buyer/Marketplace/Marketplace';
import Checkout from './pages/Dashboard/Buyer/Checkout/Checkout';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/useAuthStore';

// Layout for public pages
function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function SharedLayout() {
  const { user } = useAuthStore();
  if (user?.role === 'Buyer') return <BuyerLayout />;
  if (user?.role === 'Farmer') return <DashboardLayout role="Farmer" />;
  
  return (
    <div className="pt-20">
      <PublicLayout />
    </div>
  );
}

function App() {
  const { initAuth, logout, setProfileLoading } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem('agrichain_token');
    if (token) {
      axios.get('/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        initAuth(token, res.data);
      })
      .catch(err => {
        console.error("Auto login failed", err);
        logout();
      });
    } else {
      setProfileLoading(false);
    }
  }, [initAuth, logout, setProfileLoading]);

  return (
    <HelmetProvider>
      <Router>
        <Routes>
          {/* Guest-only Routes (Redirects to dashboard if logged in) */}
          <Route element={<PublicRoute />}>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
            </Route>
          </Route>

          {/* Open Shared Marketplace & Product Details (Dynamically wrapped based on role) */}
          <Route element={<SharedLayout />}>
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/products" element={<Marketplace />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/products/:id" element={<ProductDetails />} />
          </Route>

          {/* Farmer Dashboard Routes (No public Navbar) */}
          <Route element={<RoleProtectedRoute allowedRoles={['Farmer']} />}>
            <Route element={<DashboardLayout role="Farmer" />}>
              <Route path="/farmer/dashboard" element={<FarmerHome />} />
              <Route path="/farmer/complete-profile" element={<CompleteProfile />} />
              <Route path="/farmer/products" element={<ProductList />} />
              <Route path="/farmer/products/new" element={<AddProduct />} />
              <Route path="/farmer/products/add" element={<AddProduct />} />
              <Route path="/farmer/products/edit/:id" element={<AddProduct />} />
              <Route path="/farmer/products/success" element={<ProductSuccess />} />
              <Route path="/farmer/orders" element={<OrderList />} />
              <Route path="/farmer/orders/:id" element={<OrderDetails />} />
              <Route path="/farmer/payments" element={<WalletDashboard />} />
              <Route path="/farmer/wallet" element={<WalletDashboard />} />
              <Route path="/farmer/ai" element={<FarmerAIFeatures />} />
              <Route path="/farmer/analytics" element={<FarmerAnalytics />} />
              <Route path="/farmer/notifications" element={<NotificationsPage />} />
              <Route path="/farmer/reviews" element={<FarmerReviews />} />
              <Route path="/farmer/profile" element={<FarmerProfile />} />
              <Route path="/farmer/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          {/* Admin Dashboard Routes (Bypassed for testing) */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminHome />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="orders" element={<OrderManagement />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="contracts" element={<SmartContractStatus />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Buyer Dashboard Routes (No public Navbar) */}
          <Route element={<RoleProtectedRoute allowedRoles={['Buyer']} />}>
            <Route element={<BuyerLayout />}>
              <Route path="/buyer/dashboard" element={<Navigate to="/marketplace" replace />} />
              <Route path="/buyer/marketplace" element={<Navigate to="/marketplace" replace />} />
              <Route path="/checkout/:id" element={<Checkout />} />
              <Route path="/buyer/orders" element={<BuyerOrdersList />} />
              <Route path="/buyer/orders/:id/track" element={<OrderTracking />} />
              <Route path="/buyer/reviews" element={<BuyerReviews />} />
              <Route path="/buyer/wishlist" element={<BuyerWishlist />} />
              <Route path="/buyer/history" element={<BuyerOrdersList />} />
              <Route path="/buyer/wallet" element={<WalletDashboard />} />
              <Route path="/buyer/payments" element={<WalletDashboard />} />
              <Route path="/buyer/notifications" element={<NotificationsPage />} />
              <Route path="/buyer/profile" element={<BuyerProfile />} />
            </Route>
          </Route>

          {/* Fallback wildcard route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="bottom-right" />
      </Router>
    </HelmetProvider>
  );
}

export default App;
