import React, { useEffect, useState } from 'react';
import { adminService } from '../../../services/admin.service';
import { 
  Users, UserCheck, ShoppingBag, Package, CheckCircle, 
  Clock, Lock, Unlock, ShieldCheck, Activity, Loader2 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminHome() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getStats();
        setStats(data);
      } catch (err) {
        toast.error('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Aggregating Platform Data...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mb-4 border border-rose-500/20">
          <Activity className="w-8 h-8 text-rose-500" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Failed to load statistics</h2>
        <p className="text-gray-400 font-medium max-w-md text-center mb-6">We couldn't reach the backend server. Please make sure the backend is running.</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all border border-white/5"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, colorClass, subtitle }) => (
    <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-sm hover:bg-white/10 transition-all relative overflow-hidden group">
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 transition-transform group-hover:scale-150 ${colorClass.replace('text-', 'bg-')}`}></div>
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-sm font-bold text-gray-400 mb-1">{title}</p>
          <h3 className="text-3xl font-black text-white">{value}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-2 font-medium">{subtitle}</p>}
        </div>
        <div className={`p-4 rounded-2xl bg-white/5 border border-white/10 ${colorClass}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight">Platform Overview</h1>
        <p className="text-gray-400 mt-1 font-medium">Real-time statistics and administrative controls.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Users" 
          value={stats.total_users.toLocaleString()} 
          icon={Users} 
          colorClass="text-blue-500" 
          subtitle="Across all roles"
        />
        <StatCard 
          title="Registered Farmers" 
          value={stats.total_farmers.toLocaleString()} 
          icon={UserCheck} 
          colorClass="text-green-500"
          subtitle="Verified & Unverified"
        />
        <StatCard 
          title="Registered Buyers" 
          value={stats.total_buyers.toLocaleString()} 
          icon={ShoppingBag} 
          colorClass="text-purple-500"
        />
        <StatCard 
          title="Products Listed" 
          value={stats.products_listed.toLocaleString()} 
          icon={Package} 
          colorClass="text-orange-500"
          subtitle="Active marketplace items"
        />
      </div>

      <h2 className="text-xl font-bold text-white mb-4 tracking-tight">Transactions & Escrow</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Completed Orders" 
          value={stats.orders_completed.toLocaleString()} 
          icon={CheckCircle} 
          colorClass="text-emerald-500"
        />
        <StatCard 
          title="Pending Orders" 
          value={stats.pending_orders.toLocaleString()} 
          icon={Clock} 
          colorClass="text-yellow-500"
        />
        <StatCard 
          title="Smart Contracts" 
          value={stats.smart_contracts_health} 
          icon={ShieldCheck} 
          colorClass="text-teal-500"
          subtitle={`${stats.blockchain_tx_today} transactions today`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-white relative overflow-hidden">
          <Lock className="absolute -right-4 -bottom-4 w-48 h-48 text-white/5" />
          <p className="text-gray-400 font-bold mb-2">Total Escrow Locked</p>
          <h3 className="text-5xl font-black mb-4">₹{stats.escrow_locked.toLocaleString()}</h3>
          <p className="text-sm text-gray-400">Funds currently secured in Arbitrum Stylus contracts waiting for delivery confirmation.</p>
        </div>
        
        <div className="bg-emerald-500/20 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-8 text-emerald-50 relative overflow-hidden">
          <Unlock className="absolute -right-4 -bottom-4 w-48 h-48 text-white/10" />
          <p className="text-green-100 font-bold mb-2">Total Escrow Released</p>
          <h3 className="text-5xl font-black mb-4">₹{stats.escrow_released.toLocaleString()}</h3>
          <p className="text-sm text-green-100">Total volume successfully paid out to farmers upon successful delivery.</p>
        </div>
      </div>
      
      {/* Recent Activity Feed Mockup */}
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-sm p-6 sm:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white tracking-tight">System Activity Log</h2>
          <button className="text-sm font-bold text-primary hover:underline">View All Logs</button>
        </div>
        
        <div className="space-y-4">
          <div className="text-center py-8 text-gray-500 font-medium">
            No recent activity logs available.
          </div>
        </div>
      </div>

    </div>
  );
}
