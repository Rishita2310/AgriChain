import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Package, MapPin, Search } from 'lucide-react';
import { buyerOrderService } from '../../../../services/buyer_order.service';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function BuyerOrdersList() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await buyerOrderService.getOrders();
      setOrders(data);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Waiting for Farmer': 'bg-yellow-500/10 text-yellow-700 border-yellow-200/50 shadow-[0_0_10px_rgba(234,179,8,0.2)]',
      'Accepted': 'bg-blue-500/10 text-blue-700 border-blue-200/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]',
      'Packed': 'bg-indigo-500/10 text-indigo-700 border-indigo-200/50 shadow-[0_0_10px_rgba(99,102,241,0.2)]',
      'Shipped': 'bg-purple-500/10 text-purple-700 border-purple-200/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]',
      'Delivered': 'bg-emerald-500/10 text-emerald-700 border-emerald-200/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]',
      'Completed': 'bg-emerald-500/10 text-emerald-700 border-emerald-200/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]',
      'Rejected': 'bg-rose-500/10 text-rose-700 border-rose-200/50 shadow-[0_0_10px_rgba(244,63,94,0.2)]',
      'Cancelled': 'bg-gray-500/10 text-gray-700 border-gray-200/50 shadow-[0_0_10px_rgba(107,114,128,0.2)]'
    };
    return (
      <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md flex items-center gap-1.5 ${styles[status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${status === 'Delivered' || status === 'Completed' ? 'bg-emerald-500' : 'bg-current animate-pulse'}`}></span>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading your orders...</p>
      </div>
    );
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="max-w-7xl mx-auto pb-12 animate-in fade-in duration-300 relative overflow-hidden min-h-screen">
      {/* Ambient background blur */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-400/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[30%] h-[50%] rounded-full bg-teal-300/10 blur-[100px] pointer-events-none" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 relative z-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Orders</h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">Track and manage your purchases from verified farmers.</p>
        </div>
        <div className="relative group">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-emerald-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search orders..." 
            className="pl-11 pr-4 py-3 bg-white/80 backdrop-blur-xl border border-white rounded-2xl text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none w-full md:w-72 shadow-[0_4px_20px_rgb(0,0,0,0.03)] transition-all placeholder-gray-400"
          />
        </div>
      </div>

      {orders.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/80 backdrop-blur-xl rounded-[32px] border border-white p-16 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative z-10"
        >
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-12 h-12 text-gray-300" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-2">No Orders Yet</h3>
          <p className="text-gray-500 mb-8 font-medium">You haven't placed any orders on the marketplace.</p>
          <button onClick={() => navigate('/buyer/marketplace')} className="px-8 py-3.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20">
            Explore Marketplace
          </button>
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10"
        >
          {orders.map(order => (
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              key={order.order_id}
              onClick={() => navigate(`/buyer/orders/${order.order_id}/track`)}
              className="bg-white/90 backdrop-blur-xl rounded-[24px] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_-10px_rgba(16,185,129,0.2)] transition-all duration-300 cursor-pointer flex flex-col group overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100/50 flex justify-between items-start bg-gray-50/50">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Order ID</p>
                  <p className="text-sm font-mono font-bold text-gray-900 bg-white px-2 py-1 rounded-md border border-gray-100 shadow-sm">{order.order_id?.slice(-8).toUpperCase()}</p>
                </div>
                {getStatusBadge(order.status)}
              </div>
              
              <div className="p-6 flex-1 space-y-5">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-black text-gray-900 text-xl mb-1">{order.quantity} Items</h4>
                    <p className="text-xs font-bold text-gray-500 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-emerald-500" /> To {order.delivery_address?.city}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Total</p>
                    <p className="font-black text-emerald-700 text-2xl tracking-tight">₹{order.payment?.total?.toLocaleString()}</p>
                  </div>
                </div>

                <div className="bg-gray-50/80 rounded-2xl p-4 flex justify-between items-center border border-gray-100 group-hover:bg-emerald-50/50 group-hover:border-emerald-100 transition-colors">
                  <span className="text-xs font-bold text-gray-500">{new Date(order.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  <div className="flex items-center gap-1.5 text-emerald-600 font-black group-hover:translate-x-1 transition-transform">
                    <span className="text-sm">Track Order</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
