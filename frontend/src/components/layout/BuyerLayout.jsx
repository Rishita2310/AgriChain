import React, { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { 
  Store, ShoppingBag, Heart, Wallet, User, LogOut, Menu, X, Loader2, Sprout, Star, Settings,
  Search, SlidersHorizontal, LayoutDashboard, ChevronDown
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useDisconnect } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationDropdown from './NotificationDropdown';
import KisanAIWidget from '../common/KisanAI/KisanAIWidget';
import NavbarFilterModal from '../common/NavbarFilterModal';

const buyerLinks = [
  { path: '/buyer/marketplace', label: 'Marketplace', icon: Store },
  { path: '/buyer/orders', label: 'My Orders', icon: ShoppingBag },
  { path: '/buyer/wishlist', label: 'Wishlist', icon: Heart },
  { path: '/buyer/wallet', label: 'Escrow Wallet', icon: Wallet },
  { path: '/buyer/reviews', label: 'My Reviews', icon: Star },
];

export default function BuyerLayout() {
  const { user, logout } = useAuthStore();
  const { items: wishlistItems } = useWishlistStore();
  const { disconnect } = useDisconnect();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [navSearch, setNavSearch] = useState('');

  const handleLogout = () => {
    disconnect();
    logout();
    navigate('/login');
  };

  const handleNavSearch = (e) => {
    if (e) e.preventDefault();
    const query = navSearch.trim();
    if (query) {
      navigate(`/buyer/marketplace?q=${encodeURIComponent(query)}`);
    } else {
      navigate('/buyer/marketplace');
    }
  };

  const handleNavFilter = (e) => {
    if (e) e.preventDefault();
    setIsFilterModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 marketplace-bg flex flex-col font-sans relative overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="fixed top-0 right-1/4 w-[600px] h-[600px] bg-emerald-400/5 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 left-10 w-[500px] h-[500px] bg-teal-300/5 rounded-full blur-[140px] pointer-events-none -z-10" />
      
      {/* Top Luxury Navbar */}
      <div className="pt-3 px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto fixed top-0 left-0 right-0 z-50 pointer-events-none">
        <header className="pointer-events-auto bg-white/90 backdrop-blur-xl border border-gray-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl h-16 flex items-center justify-between px-3 sm:px-6 gap-2 sm:gap-4 transition-all duration-300 hover:bg-white/95">
          
          {/* 1. Luxury Brand Emblem & Wordmark */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-1.5 -ml-1 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div 
              className="flex items-center gap-2.5 cursor-pointer group" 
              onClick={() => navigate('/buyer/marketplace')}
            >
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-900 via-emerald-800 to-teal-900 flex items-center justify-center text-emerald-400 border border-emerald-700/40 shadow-md shadow-emerald-950/20 group-hover:scale-105 transition-transform duration-300">
                <Sprout className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex flex-col hidden sm:flex">
                <span className="text-base font-black tracking-[0.22em] text-gray-900 uppercase leading-none font-sans">
                  Agri<span className="text-emerald-700">Chain</span>
                </span>
                <span className="text-[7.5px] font-bold text-gray-400 uppercase tracking-[0.28em] leading-none mt-1">
                  Luxury Buyer Portal
                </span>
              </div>
            </div>
          </div>

          {/* 2. Luxury Integrated Search Bar & Filter */}
          <div className="flex-1 max-w-sm sm:max-w-md lg:max-w-lg mx-1 sm:mx-2">
            <form 
              onSubmit={handleNavSearch} 
              className="w-full relative flex items-center bg-gray-50/90 hover:bg-white focus-within:bg-white border border-gray-200/80 hover:border-gray-300 focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-500/10 rounded-full transition-all duration-300 shadow-2xs p-1 pl-2 gap-1.5 sm:gap-2 group/buyersearch"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 transition-colors group-focus-within/buyersearch:bg-emerald-600 group-focus-within/buyersearch:text-white">
                <Search className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <input
                type="text"
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                placeholder="Search luxury produce, organic crops, grains..."
                className="bg-transparent text-xs sm:text-sm font-medium text-gray-900 placeholder-gray-400 outline-none w-full px-1"
              />
              {navSearch && (
                <button 
                  type="button" 
                  onClick={() => setNavSearch('')} 
                  className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <div className="w-px h-4 bg-gray-200 shrink-0" />
              <button
                type="button"
                onClick={handleNavFilter}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-emerald-600 text-gray-700 hover:text-white font-bold text-xs border border-gray-200/80 hover:border-emerald-600 transition-all duration-200 shrink-0 shadow-2xs group/filter cursor-pointer"
                title="Filter produce"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600 group-hover/filter:text-white transition-transform group-hover/filter:rotate-90" />
                <span className="text-[11px] hidden md:inline">Filter</span>
              </button>
            </form>
          </div>

          {/* 3. Luxury Icon-Only Action Cluster */}
          <div className="flex items-center gap-1 sm:gap-2">
            
            {/* Wishlist Button */}
            <button
              onClick={() => navigate('/buyer/wishlist')}
              className="relative p-2.5 text-gray-600 hover:text-rose-600 hover:bg-rose-50/70 rounded-full transition-all duration-200 hidden sm:block group cursor-pointer"
              title="Wishlist"
            >
              <Heart className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              {wishlistItems && wishlistItems.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs">
                  {wishlistItems.length}
                </span>
              )}
            </button>

            {/* My Orders Button */}
            <button
              onClick={() => navigate('/buyer/orders')}
              className="relative p-2.5 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50/70 rounded-full transition-all duration-200 hidden sm:block group cursor-pointer"
              title="My Orders & Shipments"
            >
              <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
            </button>

            {/* Notifications Dropdown */}
            <NotificationDropdown />

            <div className="h-5 w-px bg-gray-200 mx-1 hidden sm:block" />

            {/* Luxury Profile Dropdown */}
            <div className="relative">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-1.5 p-1 rounded-full bg-emerald-50/60 hover:bg-emerald-100/60 border border-emerald-200/60 transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-700 to-teal-600 flex items-center justify-center text-white font-black text-xs shadow-xs">
                  {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'B'}
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 mr-1 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
              </motion.button>

              <AnimatePresence>
                {isProfileDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-gray-100 p-2 z-50 origin-top-right overflow-hidden"
                  >
                    {/* Header */}
                    <div className="p-3 bg-gradient-to-br from-emerald-950 to-teal-950 text-white rounded-xl mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-emerald-600/80 flex items-center justify-center text-white font-black text-sm border border-emerald-400/30">
                          {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'B'}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-black truncate">{user?.full_name || 'Buyer'}</p>
                          <span className="inline-block text-[9px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-900/60 px-1.5 py-0.5 rounded border border-emerald-700/50 mt-0.5">
                            Buyer Member
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-0.5 text-xs font-bold text-gray-700">
                      <button 
                        onClick={() => { setIsProfileDropdownOpen(false); navigate('/buyer/profile'); }} 
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition-colors w-full text-left cursor-pointer"
                      >
                        <User className="w-4 h-4 text-emerald-600" />
                        <span>My Profile</span>
                      </button>
                      <button 
                        onClick={() => { setIsProfileDropdownOpen(false); navigate('/buyer/orders'); }} 
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition-colors w-full text-left cursor-pointer"
                      >
                        <ShoppingBag className="w-4 h-4 text-emerald-600" />
                        <span>My Orders</span>
                      </button>
                      <button 
                        onClick={() => { setIsProfileDropdownOpen(false); navigate('/buyer/wishlist'); }} 
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition-colors w-full text-left cursor-pointer"
                      >
                        <Heart className="w-4 h-4 text-rose-500" />
                        <span>Wishlist</span>
                      </button>
                      <button 
                        onClick={() => { setIsProfileDropdownOpen(false); navigate('/buyer/wallet'); }} 
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition-colors w-full text-left cursor-pointer"
                      >
                        <Wallet className="w-4 h-4 text-amber-500" />
                        <span>Escrow Wallet</span>
                      </button>
                      <button 
                        onClick={() => { setIsProfileDropdownOpen(false); navigate('/buyer/reviews'); }} 
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition-colors w-full text-left cursor-pointer"
                      >
                        <Star className="w-4 h-4 text-amber-500" />
                        <span>My Reviews</span>
                      </button>
                    </div>

                    <div className="h-px bg-gray-100 my-1.5" />

                    <button 
                      onClick={handleLogout} 
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-600 font-bold text-xs transition-colors w-full text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
        </header>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Menu Sidebar */}
      <motion.aside 
        initial={{ x: '-100%' }}
        animate={{ x: isMobileMenuOpen ? 0 : '-100%' }}
        transition={{ type: "spring", bounce: 0, duration: 0.3 }}
        className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-50 lg:hidden flex flex-col border-r border-gray-100"
      >
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="text-emerald-600 font-black text-xl tracking-tight">🌾 AgriChain</div>
          <button className="p-2 -mr-2 text-gray-400 hover:bg-gray-100 rounded-full" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="p-4 flex flex-col gap-2">
          {buyerLinks.map(link => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${isActive ? 'bg-emerald-50 text-emerald-600' : 'text-gray-600 hover:bg-gray-50'}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </NavLink>
            );
          })}
          <div className="h-px bg-gray-100 my-2"></div>
          <NavLink to="/buyer/wishlist" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${isActive ? 'bg-emerald-50 text-emerald-600' : 'text-gray-600 hover:bg-gray-50'}`} onClick={() => setIsMobileMenuOpen(false)}>
            <Heart className="w-5 h-5" /> Wishlist
          </NavLink>
          <NavLink to="/buyer/wallet" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${isActive ? 'bg-emerald-50 text-emerald-600' : 'text-gray-600 hover:bg-gray-50'}`} onClick={() => setIsMobileMenuOpen(false)}>
            <Wallet className="w-5 h-5" /> Wallet
          </NavLink>
        </nav>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full relative pt-20">
        <React.Suspense fallback={<div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>}>
          <Outlet />
        </React.Suspense>
      </main>
      <KisanAIWidget />
      <NavbarFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        searchQuery={navSearch}
        targetPath="/buyer/marketplace"
      />
    </div>
  );
}
