import React from 'react';
import { motion } from 'framer-motion';
import { Package, TrendingUp, DollarSign, Clock, ArrowUpRight, CloudRain, ThermometerSun, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../../store/useAuthStore';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import axios from '@/services/api';
import OrderActivityWidget from '../../../components/dashboard/OrderActivityWidget';

export default function FarmerHome() {
  const { user, token } = useAuthStore();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['farmerDashboardStats'],
    queryFn: async () => {
      const response = await axios.get('/dashboard/farmer/stats', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    },
    enabled: !!token,
    staleTime: 60000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-40 bg-gray-200 animate-pulse rounded-3xl w-full"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-3xl w-full"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-gray-200 animate-pulse rounded-3xl w-full"></div>
          <div className="space-y-6">
            <div className="h-40 bg-gray-200 animate-pulse rounded-3xl w-full"></div>
            <div className="h-48 bg-gray-200 animate-pulse rounded-3xl w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-2xl flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="w-12 h-12 mb-4 text-red-500" />
        <h2 className="text-xl font-bold mb-2">Failed to load dashboard data</h2>
        <p className="text-red-600 mb-4">{error?.response?.data?.error || error.message}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors">
          Retry
        </button>
      </div>
    );
  }

  const stats = [
    { label: 'Total Revenue', value: data.total_revenue, icon: DollarSign, trend: '+12.5%', color: 'bg-green-100 text-green-600' },
    { label: 'Active Orders', value: data.active_orders, icon: Package, trend: '+5.2%', color: 'bg-blue-100 text-blue-600' },
    { label: 'Pending Deliveries', value: data.pending_deliveries, icon: Clock, trend: '-2.1%', color: 'bg-orange-100 text-orange-600' },
    { label: 'Profile Completion', value: data.profile_completion, icon: TrendingUp, trend: '+0%', color: 'bg-purple-100 text-purple-600' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Welcome Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/60 backdrop-blur-xl rounded-[2rem] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-emerald-400/20 transition-colors duration-700"></div>
        <div className="relative z-10">
          <h2 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">
            Good Morning, <span className="text-emerald-700">{user?.full_name || 'Farmer'}</span>! 👋
          </h2>
          <p className="text-gray-500 font-medium text-lg">Here's what's happening with your luxury organic crops today.</p>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/60 backdrop-blur-xl rounded-[2rem] p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 flex flex-col hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.color} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="w-7 h-7" />
              </div>
              <span className={`text-sm font-bold flex items-center gap-1 px-2.5 py-1 rounded-full ${stat.trend.startsWith('+') ? 'text-emerald-700 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
                {stat.trend} <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <div>
              <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1.5">{stat.label}</p>
              <h3 className="text-3xl font-black text-gray-900 tracking-tight">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <OrderActivityWidget role="Farmer" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white/60 backdrop-blur-xl rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">Revenue Overview</h3>
            <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenue_chart_data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#111827', fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Weather & Market Widget */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-6"
        >
          {/* Weather Widget */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[2rem] p-7 text-white shadow-[0_8px_30px_rgba(16,185,129,0.2)] relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4 group-hover:scale-110 transition-transform duration-500"></div>
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div>
                <h3 className="font-bold text-emerald-50 uppercase tracking-widest text-xs mb-1">{data.location}</h3>
                <p className="text-4xl font-black tracking-tight">{data.temperature}</p>
              </div>
              <ThermometerSun className="w-10 h-10 text-amber-300 drop-shadow-md" />
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-50 relative z-10 bg-black/10 w-fit px-3 py-1.5 rounded-xl backdrop-blur-sm">
              <CloudRain className="w-4 h-4 text-emerald-200" />
              <span>{data.rain_chance} chance of rain today</span>
            </div>
          </div>

          {/* Market Prices */}
          <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60">
            <h3 className="text-lg font-black text-gray-900 mb-5">Latest Market Prices</h3>
            <div className="space-y-4">
              {data.market_prices.map((item, i) => (
                <div key={i} className="flex justify-between items-center group cursor-pointer hover:bg-white/40 p-2 -mx-2 rounded-xl transition-colors">
                  <span className="text-gray-700 font-bold">{item.name}</span>
                  <div className="text-right">
                    <p className="text-gray-900 font-black">{item.price}</p>
                    <p className={`text-xs font-bold ${item.trend.startsWith('+') ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {item.trend}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-3 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white font-black text-xs uppercase tracking-widest rounded-xl transition-colors shadow-sm">
              View All Trends
            </button>
          </div>

        </motion.div>
      </div>

    </div>
  );
}
