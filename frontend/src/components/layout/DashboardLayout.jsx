import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Home, Package, ShoppingCart, CreditCard, BarChart2, Star, User, Settings,
  Store, Heart, History, Wallet, LogOut, Menu, X, Loader2, Brain, Sprout, ChevronDown
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useDisconnect } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationDropdown from './NotificationDropdown';
import KisanAIWidget from '../common/KisanAI/KisanAIWidget';
const farmerLinks = [
  { path: '/farmer/dashboard', label: 'Home', icon: Home },
  { path: '/farmer/products', label: 'Products', icon: Package },
  { path: '/farmer/orders', label: 'Orders', icon: ShoppingCart },
  { path: '/farmer/payments', label: 'Payments', icon: CreditCard },
  { path: '/farmer/ai', label: 'AI Insights', icon: Brain },
  { path: '/farmer/reviews', label: 'Reviews', icon: Star },
  { path: '/farmer/profile', label: 'Profile', icon: User },
  { path: '/farmer/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout({ role }) {
  const { user, logout } = useAuthStore();
  const { disconnect } = useDisconnect();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  
  const links = farmerLinks;

  const handleLogout = () => {
    disconnect();
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50/70 organic-luxury-bg overflow-hidden font-sans relative">
      
      {/* Background ambient lighting */}
      <div className="fixed top-0 right-1/4 w-[600px] h-[600px] bg-emerald-400/5 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 left-10 w-[500px] h-[500px] bg-teal-300/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Luxury Frosted */}
      <motion.aside 
        className={`fixed lg:static inset-y-0 left-0 w-72 bg-white/80 backdrop-blur-2xl border-r border-white/60 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} shadow-[4px_0_24px_rgba(0,0,0,0.02)]`}
      >
        <div className="flex items-center justify-between h-24 px-8 border-b border-gray-100/50">
          <div 
            onClick={() => navigate('/farmer/dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-900 via-emerald-800 to-teal-900 flex items-center justify-center text-emerald-400 border border-emerald-700/40 shadow-md shadow-emerald-950/20 group-hover:scale-105 transition-transform duration-300">
              <Sprout className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-[0.22em] text-gray-900 uppercase leading-none font-sans">
                Agri<span className="text-emerald-700">Chain</span>
              </span>
              <span className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.28em] leading-none mt-1.5">
                Luxury Cultivator
              </span>
            </div>
          </div>
          <button className="lg:hidden p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-5 space-y-1 overflow-y-auto h-[calc(100vh-96px)] custom-scrollbar">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => 
                  `flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 group ${
                    isActive 
                      ? 'bg-gradient-to-r from-emerald-50 to-teal-50/50 text-emerald-700 shadow-sm border border-emerald-100/50' 
                      : 'text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-xs border border-transparent'
                  }`
                }
                onClick={() => setIsSidebarOpen(false)}
              >
                <Icon className={`w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110 ${location.pathname === link.path ? 'text-emerald-600' : 'text-gray-400 group-hover:text-emerald-500'}`} />
                {link.label}
              </NavLink>
            );
          })}
          
          <div className="pt-6 mt-6 border-t border-gray-100/50 space-y-1">
            <NavLink
              to="/farmer/wallet"
              className={({ isActive }) => 
                `flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 group ${
                  isActive 
                    ? 'bg-gradient-to-r from-amber-50 to-orange-50/50 text-amber-700 shadow-sm border border-amber-100/50' 
                    : 'text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-xs border border-transparent'
                }`
              }
              onClick={() => setIsSidebarOpen(false)}
            >
              <Wallet className={`w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110 ${location.pathname === '/farmer/wallet' ? 'text-amber-600' : 'text-gray-400 group-hover:text-amber-500'}`} />
              Escrow Wallet
            </NavLink>

            <button 
              onClick={handleLogout}
              className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-bold text-sm text-gray-500 hover:text-rose-600 hover:bg-white hover:shadow-xs transition-all duration-300 w-full group border border-transparent"
            >
              <LogOut className="w-5 h-5 shrink-0 text-gray-400 group-hover:text-rose-500 transition-transform duration-300 group-hover:scale-110" />
              Sign Out
            </button>
          </div>
        </nav>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Top Luxury Navbar */}
        <div className="pt-3 px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto absolute top-0 left-0 right-0 z-40 pointer-events-none">
          <header className="pointer-events-auto bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl h-16 flex items-center justify-between px-3 sm:px-6 transition-all duration-300 hover:bg-white/90">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors -ml-2"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50/50 border border-emerald-100/50">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black tracking-widest text-emerald-700 uppercase">System Online</span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <NotificationDropdown />
              
              <div className="h-5 w-px bg-gray-200/60 mx-1 hidden sm:block" />

              {/* Profile Dropdown */}
              <div className="relative">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-1.5 p-1 rounded-full bg-emerald-50/60 hover:bg-emerald-100/60 border border-emerald-200/60 transition-all cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-700 to-teal-600 flex items-center justify-center text-white font-black text-xs shadow-xs">
                    {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'F'}
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
                            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'F'}
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-xs font-black truncate">{user?.full_name || 'Farmer'}</p>
                            <span className="inline-block text-[9px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-900/60 px-1.5 py-0.5 rounded border border-emerald-700/50 mt-0.5">
                              Verified Cultivator
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-0.5 text-xs font-bold text-gray-700">
                        <button onClick={() => { setIsProfileDropdownOpen(false); navigate('/farmer/profile'); }} className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition-colors w-full text-left cursor-pointer">
                          <User className="w-4 h-4 text-emerald-600" /> My Profile
                        </button>
                        <button onClick={handleLogout} className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-600 transition-colors w-full text-left cursor-pointer mt-1">
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </header>
        </div>

        {/* Dynamic Content */}
        <main className="flex-1 overflow-y-auto bg-transparent pt-24 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full custom-scrollbar">
          <React.Suspense fallback={<div className="flex justify-center items-center h-full"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>}>
            <Outlet />
          </React.Suspense>
        </main>
      </div>
      <KisanAIWidget />
    </div>
  );
}
