import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { getUserDashboardPath } from '../../utils/auth';
import { 
  Menu, X, Sprout, ShoppingBag, Heart, Bell, User, LogOut, 
  Search, SlidersHorizontal, LayoutDashboard, Wallet, Settings, 
  ChevronDown, ExternalLink, Sparkles, LogIn, UserPlus, Home
} from 'lucide-react';
import LanguageSelector from '../common/LanguageSelector';
import NavbarFilterModal from '../common/NavbarFilterModal';
import NotificationDropdown from './NotificationDropdown';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { t } = useTranslation();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { items: wishlistItems } = useWishlistStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  
  const userDropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 15);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change or outside click
  useEffect(() => {
    setMobileMenuOpen(false);
    setIsUserDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const dashboardPath = getUserDashboardPath(user);
  const targetMarketplacePath = user?.role === 'Buyer' ? '/buyer/marketplace' : '/marketplace';
  const wishlistPath = isAuthenticated ? (user?.role === 'Buyer' ? '/buyer/wishlist' : dashboardPath) : '/login';
  const ordersPath = isAuthenticated ? (user?.role === 'Buyer' ? '/buyer/orders' : '/farmer/orders') : '/login';

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      navigate(`${targetMarketplacePath}?q=${encodeURIComponent(query)}`);
    } else {
      navigate(targetMarketplacePath);
    }
  };

  const handleFilterClick = (e) => {
    if (e) e.preventDefault();
    setIsFilterModalOpen(true);
  };

  return (
    <nav className={`fixed w-full top-0 left-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/90 backdrop-blur-xl border-b border-gray-200/80 shadow-[0_4px_25px_rgba(0,0,0,0.03)] py-2.5' 
        : 'bg-white/70 backdrop-blur-md border-b border-transparent py-3 sm:py-3.5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center gap-2 sm:gap-4">
          
          {/* 1. Luxury Brand Emblem & Wordmark */}
          <Link to={isAuthenticated ? dashboardPath : '/'} className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-emerald-900 via-emerald-800 to-teal-900 flex items-center justify-center text-emerald-400 border border-emerald-700/40 shadow-md shadow-emerald-950/20 group-hover:scale-105 transition-transform duration-300">
              <Sprout className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-black tracking-[0.22em] text-gray-900 uppercase leading-none font-sans">
                Agri<span className="text-emerald-700">Chain</span>
              </span>
              <span className="text-[7.5px] sm:text-[8px] font-bold text-gray-400 uppercase tracking-[0.28em] leading-none mt-1">
                {t('nav.luxuryDecentralizedMarket')}
              </span>
            </div>
          </Link>

          {/* 2. Middle Section: Search or Links */}
          <div className="hidden md:flex flex-1 items-center justify-center lg:mx-4">
            {user?.role === 'Buyer' ? (
              <div className="flex items-center gap-2 w-full max-w-md lg:max-w-lg">
                <button
                  onClick={() => navigate('/')}
                  className="p-2 rounded-full text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors shrink-0 cursor-pointer"
                  title={t('nav.home')}
                >
                  <Home className="w-5 h-5" />
                </button>
                <form 
                  onSubmit={handleSearchSubmit} 
                  className="w-full relative flex items-center bg-gray-50/80 hover:bg-white focus-within:bg-white border border-gray-200/80 hover:border-gray-300 focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-500/10 rounded-full transition-all duration-300 shadow-2xs p-1 pl-2 gap-2 group/search"
                >
                <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 transition-colors group-focus-within/search:bg-emerald-600 group-focus-within/search:text-white">
                  <Search className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('nav.searchPlaceholder')}
                  className="bg-transparent text-xs sm:text-sm font-medium text-gray-900 placeholder-gray-400 outline-none w-full px-1"
                />

                {searchQuery && (
                  <button 
                    type="button" 
                    onClick={() => setSearchQuery('')} 
                    className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}

                <div className="w-px h-4 bg-gray-200 shrink-0" />

                <button
                  type="button"
                  onClick={handleFilterClick}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-emerald-600 text-gray-700 hover:text-white font-bold text-xs border border-gray-200/80 hover:border-emerald-600 transition-all duration-200 shrink-0 shadow-2xs group/filter cursor-pointer"
                  title={t('nav.filterMarketplace')}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600 group-hover/filter:text-white transition-transform group-hover/filter:rotate-90" />
                  <span className="text-[11px]">{t('nav.filter')}</span>
                </button>
              </form>
            </div>
            ) : (
              <div className="flex items-center gap-8 text-[13px] font-bold text-gray-700">
                <Link to="/" className="hover:text-emerald-700 transition-colors">{t('nav.home')}</Link>
                <a href="#how-it-works" className="hover:text-emerald-700 transition-colors">{t('nav.howItWorks')}</a>
                <a href="#features" className="hover:text-emerald-700 transition-colors">{t('nav.features')}</a>
                <a href="#about" className="hover:text-emerald-700 transition-colors">{t('nav.aboutUs')}</a>
              </div>
            )}
          </div>

          {/* 3. Luxury Icon-Only Action Cluster */}
          <div className="hidden md:flex items-center gap-1.5 sm:gap-2">
            
            {/* Wishlist Button */}
            {user?.role === 'Buyer' && (
              <button
                onClick={() => navigate(wishlistPath)}
                className="relative p-2.5 rounded-full text-gray-600 hover:text-rose-600 hover:bg-rose-50/70 border border-transparent hover:border-rose-100 transition-all duration-200 group cursor-pointer"
                title="Wishlist"
              >
                <Heart className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                {wishlistItems && wishlistItems.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs">
                    {wishlistItems.length}
                  </span>
                )}
              </button>
            )}

            {/* Orders / Shopping Bag Button */}
            {user?.role === 'Buyer' && (
              <button
                onClick={() => navigate(ordersPath)}
                className="relative p-2.5 rounded-full text-gray-600 hover:text-emerald-700 hover:bg-emerald-50/70 border border-transparent hover:border-emerald-100 transition-all duration-200 group cursor-pointer"
                title={t('nav.myOrders')}
              >
                <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              </button>
            )}

            {/* Notifications Dropdown (Icon-Only with badge) */}
            {isAuthenticated && (
              <NotificationDropdown />
            )}

            {/* Language Selector */}
            <div className="flex items-center">
              <LanguageSelector />
            </div>

            <div className="w-px h-5 bg-gray-200 mx-1" />

            {/* User Profile / Account Trigger */}
            <div className="relative" ref={userDropdownRef}>
              {isAuthenticated ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-1.5 p-1 rounded-full bg-emerald-50/60 hover:bg-emerald-100/60 border border-emerald-200/60 transition-all cursor-pointer"
                  title="Account"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-700 to-teal-600 flex items-center justify-center text-white font-black text-xs shadow-xs">
                    {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 mr-1 ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="p-2.5 rounded-full text-gray-700 hover:text-emerald-700 hover:bg-emerald-50/80 border border-gray-200/80 hover:border-emerald-200 transition-all cursor-pointer"
                  title="Sign In / Account"
                >
                  <User className="w-5 h-5" />
                </motion.button>
              )}

              {/* Luxury User Dropdown Panel */}
              <AnimatePresence>
                {isUserDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-gray-100 p-2 z-50 origin-top-right overflow-hidden"
                  >
                    {isAuthenticated ? (
                      <div>
                        {/* Profile Header */}
                        <div className="p-3 bg-gradient-to-br from-emerald-950 to-teal-950 text-white rounded-xl mb-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-emerald-600/80 flex items-center justify-center text-white font-black text-sm border border-emerald-400/30">
                              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-xs font-black truncate">{user?.full_name || 'Member'}</p>
                              <span className="inline-block text-[9px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-900/60 px-1.5 py-0.5 rounded border border-emerald-700/50 mt-0.5">
                                {user?.role || 'User'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Navigation Actions */}
                        <div className="flex flex-col gap-0.5 text-xs font-bold text-gray-700">
                          <button
                            onClick={() => { setIsUserDropdownOpen(false); navigate(dashboardPath); }}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition-colors w-full text-left cursor-pointer"
                          >
                            <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                            <span>{t('nav.dashboard')}</span>
                          </button>
                          {user?.role === 'Buyer' && (
                            <>
                              <button
                                onClick={() => { setIsUserDropdownOpen(false); navigate(ordersPath); }}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition-colors w-full text-left cursor-pointer"
                              >
                                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                                <span>{t('nav.myOrders')}</span>
                              </button>
                              <button
                                onClick={() => { setIsUserDropdownOpen(false); navigate(wishlistPath); }}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition-colors w-full text-left cursor-pointer"
                              >
                                <Heart className="w-4 h-4 text-rose-500" />
                                <span>{t('nav.wishlist')}</span>
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => { setIsUserDropdownOpen(false); navigate(user?.role === 'Buyer' ? '/buyer/wallet' : '/farmer/payments'); }}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition-colors w-full text-left cursor-pointer"
                          >
                            <Wallet className="w-4 h-4 text-amber-500" />
                            <span>{t('nav.web3EscrowWallet')}</span>
                          </button>
                        </div>

                        <div className="h-px bg-gray-100 my-1.5" />

                        <button
                          onClick={() => { setIsUserDropdownOpen(false); logout(); navigate('/login'); }}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-600 font-bold text-xs transition-colors w-full text-left cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>{t('nav.signOut')}</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1 p-1">
                        <div className="p-3 bg-emerald-50/70 rounded-xl mb-1 border border-emerald-100/70">
                          <p className="text-xs font-black text-gray-900">{t('nav.welcomeToAgriChain')}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5 font-medium">{t('nav.connectWithTrusted')}</p>
                        </div>
                        <button
                          onClick={() => { setIsUserDropdownOpen(false); navigate('/login'); }}
                          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-colors shadow-xs cursor-pointer"
                        >
                          <LogIn className="w-4 h-4" />
                          <span>{t('nav.signIn')}</span>
                        </button>
                        <button
                          onClick={() => { setIsUserDropdownOpen(false); navigate('/register'); }}
                          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition-colors cursor-pointer"
                        >
                          <UserPlus className="w-4 h-4 text-gray-600" />
                          <span>{t('nav.createAccount')}</span>
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

          {/* 4. Mobile Minimal Actions */}
          <div className="md:hidden flex items-center gap-1.5">
            {user?.role === 'Buyer' && (
              <button
                onClick={() => navigate(wishlistPath)}
                className="p-2 text-gray-600 hover:text-rose-600"
                title="Wishlist"
              >
                <Heart className="w-5 h-5" />
              </button>
            )}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="p-2 text-gray-800 bg-gray-100 rounded-xl"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Search Bar or Links */}
        <div className="md:hidden mt-2.5 pb-1">
          {user?.role === 'Buyer' ? (
            <form 
              onSubmit={handleSearchSubmit} 
              className="w-full relative flex items-center bg-gray-50 border border-gray-200 focus-within:border-emerald-600 rounded-xl px-3 py-1.5 gap-2"
            >
              <Search className="w-4 h-4 text-emerald-600 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search produce, grains, spices..."
                className="bg-transparent text-xs font-semibold text-gray-800 placeholder-gray-400 outline-none w-full"
              />
              <button
                type="button"
                onClick={handleFilterClick}
                className="p-1 text-emerald-700 bg-emerald-50 rounded-md border border-emerald-200"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <div className="flex justify-between items-center px-2 py-1 text-[11px] font-bold text-gray-600 overflow-x-auto gap-4 scrollbar-hide">
              <Link to="/" className="whitespace-nowrap hover:text-emerald-700 transition-colors">Home</Link>
              <a href="#how-it-works" className="whitespace-nowrap hover:text-emerald-700 transition-colors">How it Works</a>
              <a href="#features" className="whitespace-nowrap hover:text-emerald-700 transition-colors">Features</a>
              <a href="#about" className="whitespace-nowrap hover:text-emerald-700 transition-colors">About Us</a>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-2xl border-b border-gray-200 px-6 py-6 space-y-4 shadow-xl animate-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col gap-2">
            <Link to="/marketplace" className="text-emerald-700 font-bold py-2.5 px-3 rounded-xl bg-emerald-50 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              {t('nav.browseMarketplace')}
            </Link>
            {isAuthenticated ? (
              <>
                <Link to={dashboardPath} className="text-gray-700 font-bold py-2 px-3 rounded-xl hover:bg-gray-50 flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" /> {t('nav.dashboard')}
                </Link>
                {user?.role === 'Buyer' && (
                  <>
                    <Link to={ordersPath} className="text-gray-700 font-bold py-2 px-3 rounded-xl hover:bg-gray-50 flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4" /> {t('nav.myOrders')}
                    </Link>
                    <Link to={wishlistPath} className="text-gray-700 font-bold py-2 px-3 rounded-xl hover:bg-gray-50 flex items-center gap-2">
                      <Heart className="w-4 h-4" /> {t('nav.wishlist')}
                    </Link>
                  </>
                )}
                <button onClick={logout} className="text-rose-600 font-bold py-2 px-3 rounded-xl hover:bg-rose-50 flex items-center gap-2 text-left">
                  <LogOut className="w-4 h-4" /> {t('nav.signOut')}
                </button>
              </>
            ) : (
              <div className="pt-2 flex flex-col gap-2">
                <Link to="/login" className="w-full text-center py-2.5 text-gray-800 font-bold rounded-xl border border-gray-200">
                  {t('nav.signIn')}
                </Link>
                <Link to="/register" className="w-full text-center py-2.5 bg-emerald-600 text-white font-bold rounded-xl shadow-md">
                  {t('nav.joinAgriChain')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filter Modal with all custom options */}
      <NavbarFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        searchQuery={searchQuery}
        targetPath={targetMarketplacePath}
      />
    </nav>
  );
}