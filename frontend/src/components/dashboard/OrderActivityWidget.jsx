import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Package, Truck, CheckCircle2, XCircle, ArrowRight, Clock, ShieldCheck, Wallet, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { buyerOrderService } from '../../services/buyer_order.service';
import { farmerOrderService } from '../../services/farmer_order.service';

const STATUS_MESSAGES = {
  Buyer: {
    'Placed': 'Your order has been placed successfully.',
    'Payment Pending': 'Your payment is waiting for confirmation.',
    'Payment Locked': 'Payment has been securely locked in escrow.',
    'Accepted': 'The farmer has accepted your order.',
    'Packed': 'Your order has been packed and is ready for shipment.',
    'Shipped': 'Your order is on the way.',
    'Out for Delivery': 'Your order is out for delivery.',
    'Delivered': 'Your order has been delivered. Confirm delivery to release payment.',
    'Completed': 'Order completed successfully. Payment has been released.',
    'Rejected': 'This order was rejected by the farmer.',
    'Cancelled': 'This order has been cancelled.',
  },
  Farmer: {
    'Placed': 'New order received. Waiting for buyer payment.',
    'Payment Pending': 'Waiting for buyer\'s payment.',
    'Payment Locked': 'New order received. Action required: Accept or Reject.',
    'Accepted': 'You have accepted this order. Pack it next.',
    'Packed': 'Order packed. Ready to ship.',
    'Shipped': 'Order shipped to buyer.',
    'Out for Delivery': 'Order is out for delivery.',
    'Delivered': 'Delivered to buyer. Waiting for confirmation.',
    'Completed': 'Order completed. Payment released to your wallet.',
    'Rejected': 'You rejected this order.',
    'Cancelled': 'Order was cancelled.',
  }
};

const TIMELINE_STEPS = ['Placed', 'Accepted', 'Packed', 'Shipped', 'Delivered'];

export default function OrderActivityWidget({ role = 'Buyer' }) {
  const navigate = useNavigate();
  const isBuyer = role === 'Buyer';

  const { data: orders, isLoading, isError } = useQuery({
    queryKey: [`${role.toLowerCase()}OrdersActivity`],
    queryFn: async () => {
      const data = isBuyer ? await buyerOrderService.getOrders() : await farmerOrderService.getOrders();
      return data || [];
    },
    refetchInterval: 15000, // Poll every 15 seconds
  });

  const recentOrders = useMemo(() => {
    if (!orders || !Array.isArray(orders)) return [];
    
    // Sort logic: active orders first, then most recently updated/created
    const sorted = [...orders].sort((a, b) => {
      const aIsTerminal = ['Completed', 'Cancelled', 'Rejected'].includes(a.status);
      const bIsTerminal = ['Completed', 'Cancelled', 'Rejected'].includes(b.status);
      
      if (aIsTerminal && !bIsTerminal) return 1;
      if (!aIsTerminal && bIsTerminal) return -1;
      
      const timeA = new Date(a.updated_at || a.created_at).getTime();
      const timeB = new Date(b.updated_at || b.created_at).getTime();
      
      return timeB - timeA;
    });

    return sorted.slice(0, 2);
  }, [orders]);

  if (isLoading) {
    return (
      <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 mb-8 w-full max-w-full">
        <h2 className="text-xl font-black text-gray-900 mb-6 tracking-tight">
          {isBuyer ? 'Your Recent Orders' : 'Incoming Orders'}
        </h2>
        <div className="space-y-4">
          <div className="h-40 bg-gray-200 animate-pulse rounded-2xl w-full"></div>
          <div className="h-40 bg-gray-200 animate-pulse rounded-2xl w-full"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-rose-50 rounded-[2rem] p-8 border border-rose-100 mb-8 text-center flex flex-col items-center w-full max-w-full">
        <XCircle className="w-10 h-10 text-rose-500 mb-3" />
        <h3 className="text-lg font-bold text-rose-900">Unable to load your latest orders.</h3>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-6 py-2 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (recentOrders.length === 0) {
    return (
      <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 mb-8 flex flex-col items-center justify-center text-center w-full max-w-full">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Package className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-black text-gray-900 mb-2">No orders yet</h3>
        <p className="text-gray-500 mb-6 max-w-sm">
          {isBuyer 
            ? "You haven't placed any orders yet. Discover premium organic produce directly from farmers." 
            : "You don't have any active orders right now."}
        </p>
        <button 
          onClick={() => navigate(isBuyer ? '/buyer/marketplace' : '/farmer/products')}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2"
        >
          {isBuyer ? 'Explore Marketplace' : 'View Your Products'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 mb-8 w-full max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">
          {isBuyer ? 'What\'s Happening With Your Orders' : 'Incoming Orders Activity'}
        </h2>
        <button 
          onClick={() => navigate(isBuyer ? '/buyer/orders' : '/farmer/orders')}
          className="text-sm font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 transition-colors bg-emerald-50 px-3 py-1.5 rounded-lg w-fit"
        >
          View All <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recentOrders.map((order, idx) => (
          <OrderCard key={order.order_id || idx} order={order} role={role} isBuyer={isBuyer} navigate={navigate} />
        ))}
      </div>
    </div>
  );
}

function OrderCard({ order, role, isBuyer, navigate }) {
  const status = order.status || 'Placed';
  const message = STATUS_MESSAGES[role][status] || `Order status: ${status}`;
  const isTerminal = ['Completed', 'Cancelled', 'Rejected'].includes(status);
  
  // Format dates securely
  const updatedDate = new Date(order.updated_at || order.created_at);
  const formattedTime = updatedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedDate = updatedDate.toLocaleDateString([], { month: 'short', day: 'numeric' });

  let currentStepIndex = TIMELINE_STEPS.indexOf(status);
  if (status === 'Payment Locked') currentStepIndex = 0; // After placed, before accepted

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow relative overflow-hidden flex flex-col w-full h-full"
    >
      {/* Dynamic Status Banner */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 -mx-5 -mt-5 px-5 py-3 mb-5 border-b border-emerald-100/50 flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
          {status === 'Delivered' || status === 'Completed' ? <CheckCircle2 className="w-5 h-5" /> :
           status === 'Cancelled' || status === 'Rejected' ? <XCircle className="w-5 h-5 text-rose-500" /> :
           status === 'Shipped' || status === 'Out for Delivery' ? <Truck className="w-5 h-5" /> :
           <Package className="w-5 h-5" />}
        </div>
        <div className="min-w-0">
          <h4 className={`font-bold text-sm leading-tight ${status === 'Cancelled' || status === 'Rejected' ? 'text-rose-700' : 'text-emerald-800'}`}>
            {message}
          </h4>
          <p className="text-[10px] sm:text-xs font-medium text-emerald-700/60 mt-1">
            Updated {formattedDate} at {formattedTime}
          </p>
        </div>
      </div>

      <div className="flex gap-4 mb-5 flex-1">
        <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 shadow-inner">
          <Package className="w-6 h-6 text-emerald-200" />
        </div>
        
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex justify-between items-start gap-2 mb-1">
            <h5 className="font-black text-gray-900 truncate flex-1 text-sm sm:text-base">
              {order.quantity} {order.unit || 'kg'} • {order.product_id ? `Product #${order.product_id.substring(0, 4)}` : 'Item'}
            </h5>
            <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-xs sm:text-sm">
              ₹{order.payment?.total || order.total_amount || 0}
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-2 truncate">
            ID: <span className="font-mono text-gray-600">{order.order_id?.substring(0, 8)}...</span>
          </p>
          <div className="bg-gray-50 rounded-lg p-2 border border-gray-100 w-fit">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">
              {isBuyer ? 'Farmer' : 'Buyer'}
            </p>
            <p className="text-xs font-bold text-gray-800 truncate max-w-[120px] sm:max-w-[150px]">
              {isBuyer ? (order.farmer_id?.substring(0, 8) + '...') : (order.delivery_address?.full_name || 'Buyer')}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Timeline */}
      {!isTerminal && (
        <div className="mb-6 relative mt-auto px-2">
          <div className="absolute top-1.5 left-2 right-2 h-0.5 bg-gray-100 z-0" />
          <div 
            className="absolute top-1.5 left-2 h-0.5 bg-emerald-500 z-0 transition-all duration-700 ease-in-out" 
            style={{ width: currentStepIndex >= 0 ? `${(currentStepIndex / (TIMELINE_STEPS.length - 1)) * 100}%` : '0%' }}
          />
          <div className="flex justify-between relative z-10">
            {TIMELINE_STEPS.map((step, idx) => {
              const isPast = currentStepIndex >= idx;
              const isCurrent = currentStepIndex === idx;
              return (
                <div key={step} className="flex flex-col items-center gap-1.5" title={step}>
                  <div className={`w-3.5 h-3.5 rounded-full border-2 transition-colors duration-500 ${
                    isPast ? 'bg-emerald-500 border-emerald-500' : 
                    isCurrent ? 'bg-white border-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.2)]' : 
                    'bg-white border-gray-200'
                  }`} />
                  <span className={`text-[9px] font-black uppercase tracking-wider hidden sm:block ${
                    isPast ? 'text-emerald-700' : 'text-gray-300'
                  }`}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Terminal State Fallback */}
      {isTerminal && (
        <div className="mb-5 flex items-center justify-center py-2 bg-gray-50 rounded-lg border border-gray-100">
          <span className={`text-xs font-black uppercase tracking-widest ${status === 'Completed' ? 'text-emerald-600' : 'text-rose-600'}`}>
            Order {status}
          </span>
        </div>
      )}

      {/* Blockchain Info */}
      {order.blockchain_tx_hash || order.blockchain_release_tx_hash ? (
        <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-emerald-50/70 rounded-xl border border-emerald-100">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Blockchain Verified</p>
            <p className="text-xs text-emerald-600/80 truncate font-medium">Payment secured on Arbitrum Sepolia</p>
          </div>
        </div>
      ) : order.payment_status === 'Locked' || order.escrow_status === 'Locked' ? (
        <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-amber-50/70 rounded-xl border border-amber-100">
          <Wallet className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest">Escrow Secured</p>
            <p className="text-xs text-amber-600/80 truncate font-medium">Blockchain transaction pending</p>
          </div>
        </div>
      ) : <div className="mb-4 h-[42px]"></div>}

      {/* Action Button */}
      <button 
        onClick={() => navigate(`/${role.toLowerCase()}/orders/${order.order_id}`)}
        className="w-full mt-auto py-3 bg-white hover:bg-emerald-600 border border-gray-200 hover:border-emerald-600 text-gray-700 hover:text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-sm flex justify-center items-center gap-2 group cursor-pointer"
      >
        View Order <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </button>
    </motion.div>
  );
}
