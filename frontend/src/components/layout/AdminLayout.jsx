import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Package, ShoppingCart, BarChart2, Shield, Settings,
  LogOut, Menu, X, Bell, Loader2, Sprout
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useDisconnect } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationDropdown from './NotificationDropdown';

const adminLinks = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/users', label: 'Users', icon: Users },
  { path: '/admin/products', label: 'Products', icon: Package },
  { path: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { path: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
  { path: '/admin/contracts', label: 'Smart Contracts', icon: Shield },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const { disconnect } = useDisconnect();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    disconnect();
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-900 organic-admin-bg overflow-hidden font-sans text-gray-300 text-sm relative">
      
      {/* Background ambient lighting */}
      <div className="fixed top-0 right-1/4 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 left-10 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Dark Luxury */}
      <motion.aside 
        className={`fixed lg:static inset-y-0 left-0 w-72 bg-slate-900/60 backdrop-blur-2xl text-white border-r border-white/5 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} shadow-[4px_0_24px_rgba(0,0,0,0.2)]`}
      >
        <div className="flex items-center justify-between h-24 px-8 border-b border-white/5 bg-transparent">
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-900 via-emerald-800 to-teal-900 flex items-center justify-center text-emerald-400 border border-emerald-700/40 shadow-[0_0_15px_rgba(16,185,129,0.2)] group-hover:scale-105 transition-transform duration-300">
              <Sprout className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-[0.22em] text-white uppercase leading-none font-sans">
                Agri<span className="text-emerald-500">Chain</span>
              </span>
              <span className="text-[8px] font-bold text-emerald-500/80 uppercase tracking-[0.28em] leading-none mt-1.5 border border-emerald-500/20 px-1.5 py-0.5 rounded w-fit bg-emerald-500/10">
                Command Center
              </span>
            </div>
          </div>
          <button className="lg:hidden p-2 text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-colors" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-5 space-y-1 overflow-y-auto h-[calc(100vh-96px)] custom-scrollbar">
          {adminLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => 
                  `flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 group ${
                    isActive 
                      ? 'bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] border border-emerald-500/20' 
                      : 'text-gray-400 hover:bg-white/5 hover:text-white hover:shadow-xs border border-transparent'
                  }`
                }
                onClick={() => setIsSidebarOpen(false)}
              >
                <Icon className={`w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110 ${location.pathname === link.path ? 'text-emerald-400' : 'text-gray-500 group-hover:text-emerald-300'}`} />
                {link.label}
              </NavLink>
            );
          })}
          
          <div className="pt-6 mt-6 border-t border-white/5 space-y-1">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-bold text-sm text-gray-400 hover:text-rose-400 hover:bg-white/5 transition-all duration-300 w-full group border border-transparent"
            >
              <LogOut className="w-5 h-5 shrink-0 text-gray-500 group-hover:text-rose-400 transition-transform duration-300 group-hover:scale-110" />
              Terminate Session
            </button>
          </div>
        </nav>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Top Dark Luxury Navbar */}
        <div className="pt-3 px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto absolute top-0 left-0 right-0 z-40 pointer-events-none">
          <header className="pointer-events-auto bg-slate-900/60 backdrop-blur-xl border border-white/5 shadow-[0_8px_30px_rgba(0,0,0,0.3)] rounded-2xl h-16 flex items-center justify-between px-3 sm:px-6 transition-all duration-300 hover:bg-slate-900/80">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-colors -ml-2"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase">System Active</span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <NotificationDropdown />
              
              <div className="h-5 w-px bg-white/10 mx-1 hidden sm:block" />
              
              {/* Profile Readout */}
              <div className="flex items-center gap-3 bg-white/5 p-1 rounded-full border border-white/5">
                <div className="hidden sm:block text-right ml-2 mr-1">
                  <p className="text-sm font-bold text-white tracking-tight">Admin</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-700 to-teal-600 border border-emerald-500/50 flex items-center justify-center text-white font-black text-xs shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                  A
                </div>
              </div>
            </div>
          </header>
        </div>

        {/* Dynamic Content */}
        <main className="flex-1 overflow-y-auto bg-transparent pt-24 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full custom-scrollbar">
          <React.Suspense fallback={<div className="flex justify-center items-center h-full"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>}>
            <Outlet />
          </React.Suspense>
        </main>
      </div>
    </div>
  );
}
