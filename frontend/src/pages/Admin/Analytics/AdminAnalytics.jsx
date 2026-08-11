import React, { useEffect, useState } from 'react';
import { adminService } from '../../../services/admin.service';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, Users, ShoppingBag, Package, Activity, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

// Colors for charts
const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

export default function AdminAnalytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getStats();
        setStats(data);
      } catch (err) {
        toast.error('Failed to load analytics data');
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
        <p className="text-gray-500 font-medium">Crunching Numbers...</p>
      </div>
    );
  }

  // Mock time-series data since backend currently only returns totals
  const monthlyData = [
    { name: 'Jan', users: Math.floor(stats.total_users * 0.1), orders: Math.floor(stats.orders_completed * 0.05) },
    { name: 'Feb', users: Math.floor(stats.total_users * 0.2), orders: Math.floor(stats.orders_completed * 0.15) },
    { name: 'Mar', users: Math.floor(stats.total_users * 0.35), orders: Math.floor(stats.orders_completed * 0.3) },
    { name: 'Apr', users: Math.floor(stats.total_users * 0.5), orders: Math.floor(stats.orders_completed * 0.5) },
    { name: 'May', users: Math.floor(stats.total_users * 0.7), orders: Math.floor(stats.orders_completed * 0.75) },
    { name: 'Jun', users: stats.total_users, orders: stats.orders_completed },
  ];

  const userDistribution = [
    { name: 'Farmers', value: stats.total_farmers },
    { name: 'Buyers', value: stats.total_buyers },
  ];

  return (
    <div className="max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Activity className="w-8 h-8 text-primary" /> Analytics Dashboard
          </h1>
          <p className="text-gray-400 mt-2 font-medium">Deep dive into platform metrics, growth, and user behavior.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* User Growth (Area Chart) */}
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-sm">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" /> Platform Growth
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#0a0a0a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend iconType="circle" wrapperStyle={{ color: '#9ca3af' }} />
                <Area type="monotone" dataKey="users" name="Total Users" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                <Area type="monotone" dataKey="orders" name="Completed Orders" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorOrders)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Demographics (Pie Chart) */}
        <div className="lg:col-span-1 bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-500" /> User Demographics
          </h3>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {userDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#0a0a0a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend iconType="circle" verticalAlign="bottom" height={36} wrapperStyle={{ color: '#9ca3af' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Marketplace Activity (Bar Chart) */}
        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-sm">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Package className="w-5 h-5 text-orange-500" /> Marketplace Activity
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <RechartsTooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ backgroundColor: '#0a0a0a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="orders" name="Orders Processed" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* High-Level Overview Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-emerald-500/10 rounded-3xl p-6 border border-emerald-500/20 flex flex-col justify-center">
            <ShoppingBag className="w-8 h-8 text-emerald-400 mb-4" />
            <p className="text-sm font-bold text-emerald-200 uppercase tracking-wider mb-1">Total Orders</p>
            <h4 className="text-3xl font-black text-emerald-50">{stats.orders_completed + stats.pending_orders}</h4>
          </div>
          <div className="bg-blue-500/10 rounded-3xl p-6 border border-blue-500/20 flex flex-col justify-center">
            <Users className="w-8 h-8 text-blue-400 mb-4" />
            <p className="text-sm font-bold text-blue-200 uppercase tracking-wider mb-1">Total Accounts</p>
            <h4 className="text-3xl font-black text-blue-50">{stats.total_users}</h4>
          </div>
          <div className="bg-orange-500/10 rounded-3xl p-6 border border-orange-500/20 flex flex-col justify-center">
            <Package className="w-8 h-8 text-orange-400 mb-4" />
            <p className="text-sm font-bold text-orange-200 uppercase tracking-wider mb-1">Active Listings</p>
            <h4 className="text-3xl font-black text-orange-50">{stats.products_listed}</h4>
          </div>
          <div className="bg-purple-500/10 rounded-3xl p-6 border border-purple-500/20 flex flex-col justify-center">
            <Activity className="w-8 h-8 text-purple-400 mb-4" />
            <p className="text-sm font-bold text-purple-200 uppercase tracking-wider mb-1">Conversion Rate</p>
            <h4 className="text-3xl font-black text-purple-50">
              {stats.total_users > 0 ? Math.round((stats.orders_completed / stats.total_users) * 100) : 0}%
            </h4>
          </div>
        </div>

      </div>
    </div>
  );
}
