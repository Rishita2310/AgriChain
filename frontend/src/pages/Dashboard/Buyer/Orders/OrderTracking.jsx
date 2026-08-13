import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Home, ChevronRight, ArrowLeft, Loader2, Check, Package, Truck, Home as HomeIcon, ShieldCheck, QrCode, ExternalLink, Star, FileText, MapPin, CheckCircle2, X } from 'lucide-react';
import { buyerOrderService } from '../../../../services/buyer_order.service';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmDeliveryModal from './components/ConfirmDeliveryModal';
import EnhancedReviewForm from './components/EnhancedReviewForm';
import { getProductImageUrl } from '../../../../services/product.service';
import OrderInvoice from '../../../../components/dashboard/OrderInvoice';
import { useWriteContract } from 'wagmi';
import EscrowABI from '../../../../contracts/EscrowABI.json';

const ARBITRUM_ESCROW_CONTRACT = "0x2C4A7e3D94bC4c10D204A81E99525Db724a73752".toLowerCase();

export default function OrderTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { writeContractAsync } = useWriteContract();
  
  // Delivery Confirmation Modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [submittingReview, setSubmittingReview] = useState(false);

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Use React Query style polling for simulated live updates
  useEffect(() => {
    fetchOrderDetails();
    const interval = setInterval(() => {
      fetchOrderDetails(false); // background fetch
    }, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const fetchOrderDetails = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const res = await buyerOrderService.getOrderDetails(id);
      setData(res);
    } catch (err) {
      if (showLoader) {
        toast.error('Failed to load tracking details');
        navigate('/buyer/orders');
      }
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  const handleConfirmDelivery = async () => {
    try {
      toast.loading("Confirming on blockchain...", { id: 'release' });
      const hash = await writeContractAsync({
        address: ARBITRUM_ESCROW_CONTRACT,
        abi: EscrowABI,
        functionName: 'release_escrow',
        args: [order.order_id],
      });
      
      toast.loading("Awaiting RPC sync...", { id: 'release' });
      setTimeout(async () => {
        try {
          await buyerOrderService.confirmDelivery(id, hash);
          toast.success("Delivery confirmed and Escrow released!", { id: 'release' });
          setShowConfirmModal(false);
          fetchOrderDetails(true);
          setTimeout(() => setShowFeedbackModal(true), 500); // Small delay before modal opens
        } catch (backendErr) {
          toast.error(backendErr.response?.data?.error || "Backend confirmation failed", { id: 'release' });
        }
      }, 5000);
      
    } catch (err) {
      toast.error(err.shortMessage || err.message || "Failed to confirm delivery", { id: 'release' });
    }
  };

  const handleReviewSubmit = async (payload) => {
    setSubmittingReview(true);
    try {
      await buyerOrderService.submitReview(id, payload);
      toast.success("Review submitted successfully");
      fetchOrderDetails(true);
    } catch (err) {
      toast.error("Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-green-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Syncing Blockchain State...</p>
      </div>
    );
  }

  const { order, product, buyer: farmer } = data; // 'buyer' alias holds farmer info here

  // Timeline Logic
  const steps = [
    { key: 'Accepted', label: 'Accepted', icon: Check, desc: 'Farmer has accepted the order.' },
    { key: 'Packed', label: 'Packed', icon: Package, desc: 'Products are carefully packed.' },
    { key: 'Shipped', label: 'Shipped', icon: Truck, desc: 'Your order is on the way.' },
    { key: 'Delivered', label: 'Delivered', icon: HomeIcon, desc: 'Delivered successfully.' }
  ];

  const getStepStatus = (stepKey) => {
    const orderStatuses = ['Waiting for Farmer', 'Accepted', 'Packed', 'Shipped', 'Delivered', 'Completed', 'Rejected'];
    const currentIndex = orderStatuses.indexOf(order.status);
    const stepIndex = orderStatuses.indexOf(stepKey);
    
    if (order.status === 'Rejected') return 'error';
    if (currentIndex >= stepIndex) return 'completed';
    if (currentIndex === stepIndex - 1 && order.status !== 'Waiting for Farmer') return 'current';
    return 'pending';
  };

  const calculateProgress = () => {
    if (order.status === 'Rejected') return 0;
    if (['Delivered', 'Completed'].includes(order.status)) return 100;
    if (order.status === 'Shipped') return 75;
    if (order.status === 'Packed') return 50;
    if (order.status === 'Accepted') return 25;
    return 5; // Waiting
  };

  return (
    <div className="max-w-7xl mx-auto pb-12 animate-in fade-in duration-300 relative min-h-screen overflow-hidden">
      {/* Ambient background blur */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-400/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[30%] h-[50%] rounded-full bg-teal-300/10 blur-[100px] pointer-events-none" />

      {/* Breadcrumb */}
      <nav className="relative z-10 flex items-center gap-2 text-sm text-gray-500 font-medium mb-8">
        <Link to="/buyer/orders" className="hover:text-emerald-600 flex items-center gap-1 transition-colors">
          <Home className="w-4 h-4" /> Dashboard
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/buyer/orders" className="hover:text-emerald-600 transition-colors">Orders</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-bold bg-white/50 px-2 py-1 rounded-md border border-gray-100 shadow-sm">Track {order.order_id?.slice(-8).toUpperCase()}</span>
      </nav>

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white/80 backdrop-blur-xl p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white"
      >
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Track Your Order</h1>
          <p className="text-gray-500 mt-1">Est. Delivery: {new Date(new Date(order.created_at).getTime() + 3*24*60*60*1000).toLocaleDateString()}</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
             <p className="text-xs text-gray-400 font-bold uppercase mb-1">Status</p>
             <p className="text-sm font-bold text-gray-900">{order.status}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
             <p className="text-xs text-gray-400 font-bold uppercase mb-1">Farmer</p>
          </div>
        </div>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-8 relative z-10">
        
        {/* LEFT COLUMN: Tracking & Map */}
        <div className="flex-1 space-y-6">
          
          {/* Main Tracking Timeline */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/80 backdrop-blur-xl rounded-[32px] p-8 md:p-10 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden"
          >
             <h2 className="text-2xl font-black text-gray-900 mb-10 tracking-tight">Live Tracking</h2>
             
             {/* Progress Bar */}
             <div className="w-full bg-gray-100 h-3 rounded-full mb-12 overflow-hidden relative shadow-inner">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${calculateProgress()}%` }}
                 transition={{ duration: 1.5, ease: "easeOut" }}
                 className={`absolute left-0 top-0 h-full rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)] ${order.status === 'Rejected' ? 'bg-rose-500' : 'bg-emerald-500'}`}
               ></motion.div>
             </div>

             {/* Timeline Steps */}
             <div className="relative border-l-2 border-gray-100 ml-4 space-y-10 py-2">
               {steps.map((step, idx) => {
                 const status = getStepStatus(step.key);
                 const Icon = step.icon;
                 
                 let colorClasses = "bg-white border-gray-200 text-gray-300"; // pending
                 if (status === 'completed') colorClasses = "bg-emerald-500 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]";
                 if (status === 'current') colorClasses = "bg-emerald-600 border-emerald-600 text-white animate-pulse shadow-[0_0_20px_rgba(16,185,129,0.6)] scale-110";
                 if (status === 'error') colorClasses = "bg-rose-500 border-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)]";

                 return (
                   <motion.div 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: idx * 0.15 }}
                     key={idx} 
                     className="relative pl-8 group"
                   >
                     <div className={`absolute -left-[17px] top-0 w-8 h-8 rounded-full border-[3px] flex items-center justify-center ${colorClasses} z-10 transition-all duration-500 group-hover:scale-110`}>
                       <Icon className="w-4 h-4" />
                     </div>
                     <div className="bg-white/50 p-4 rounded-2xl border border-transparent hover:border-gray-100 hover:bg-white hover:shadow-sm transition-all -mt-3">
                       <h3 className={`text-lg font-black tracking-tight ${status === 'completed' || status === 'current' ? 'text-gray-900' : 'text-gray-400'}`}>
                         {step.label}
                       </h3>
                       <p className={`text-sm mt-1 ${status === 'completed' || status === 'current' ? 'text-gray-600' : 'text-gray-400'}`}>
                         {step.desc}
                       </p>
                       {status === 'current' && (
                         <span className="inline-block mt-3 text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100/50 shadow-sm">IN PROGRESS...</span>
                       )}
                     </div>
                   </motion.div>
                 );
               })}
             </div>
          </motion.div>

          {/* Delivery Map Mockup */}
          {['Shipped', 'Delivered', 'Completed'].includes(order.status) && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-400" /> Delivery Route
              </h2>
              <div className="w-full h-64 bg-gray-100 rounded-xl relative overflow-hidden flex items-center justify-center border border-gray-200">
                 {/* Map Placeholder Graphic */}
                 <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                 <div className="text-center z-10">
                   <Truck className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                   <p className="text-gray-500 font-medium">GPS Tracking Simulation</p>
                   <p className="text-xs text-gray-400">Map rendering disabled in sandbox</p>
                 </div>
                 
                 {/* Mock Route Line */}
                 <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                   <path d="M 50 200 Q 150 50 300 150 T 600 100" fill="none" stroke="#22c55e" strokeWidth="4" strokeDasharray="8 8" className="opacity-50" />
                 </svg>
              </div>
            </div>
          )}

          {/* Action Section based on state */}
          {['Shipped', 'Delivered', 'Out for Delivery'].includes(order.status) && (
            <div className="bg-white rounded-2xl p-8 border border-green-200 shadow-lg relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
               <h2 className="text-2xl font-bold text-gray-900 mb-2">Delivery Arrived</h2>
               <p className="text-gray-600 mb-6">
                 Please inspect the products. If everything is in good condition, confirm the delivery to finalize the order.
               </p>
               <button 
                 onClick={() => setShowConfirmModal(true)}
                 className="w-full py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-600/30 flex justify-center items-center gap-2"
               >
                 <ShieldCheck className="w-6 h-6" /> Confirm Delivery & Release Payment
               </button>
            </div>
          )}

          {order.status === 'Completed' && (
            <div className="bg-white rounded-2xl p-8 border border-green-100 shadow-sm bg-gradient-to-br from-green-50 to-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-green-500 p-2 rounded-full text-white shadow-md">
                   <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                   <h2 className="text-xl font-bold text-gray-900">Delivery Confirmed Successfully</h2>
                   <p className="text-sm text-green-700 font-medium">Escrow payment released to farmer.</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col md:flex-row gap-3 mb-10">
                 <button 
                    onClick={() => {
                      const btn = document.getElementById('download-invoice-btn');
                      if (btn) btn.click();
                    }}
                    className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
                 >
                    <FileText className="w-5 h-5" /> Download Invoice
                 </button>
                 <a 
                    href={`https://sepolia.arbiscan.io/tx/${order.blockchain_release_tx_hash || order.blockchain_tx_hash || ''}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    onClick={(e) => {
                      if (!order.blockchain_release_tx_hash && !order.blockchain_tx_hash) {
                        e.preventDefault();
                        toast.error("Transaction hash not available yet");
                      }
                    }}
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
                 >
                    View on Arbiscan <ExternalLink className="w-4 h-4" />
                 </a>
              </div>

              {/* Review Form or Success Message */}
              {order.blockchain_tx_hash && data.reviewExists ? (
                <div className="bg-green-50 text-green-800 p-6 rounded-2xl border border-green-200 text-center">
                  <Star className="w-12 h-12 text-yellow-400 fill-current mx-auto mb-3" />
                  <h3 className="text-xl font-bold mb-2">Review Submitted</h3>
                  <p className="text-sm">Thank you for sharing your experience and helping the AgriChain community!</p>
                </div>
              ) : (
                <div className="text-center bg-gray-50 p-6 rounded-2xl border border-gray-100 mt-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">How was your experience?</h3>
                  <p className="text-sm text-gray-500 mb-4">Your feedback helps farmers and other buyers.</p>
                  <button 
                    onClick={() => setShowFeedbackModal(true)} 
                    className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors"
                  >
                    Leave a Review
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Sidebar Summary & Blockchain */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:w-[400px] shrink-0 space-y-6"
        >
          
          {/* Blockchain Verification Box */}
          <div className="bg-gray-900 rounded-[32px] p-8 text-white shadow-[0_8px_40px_rgba(0,0,0,0.15)] border border-gray-800 relative overflow-hidden group">
            {/* Cool background glow effect */}
            <div className="absolute -inset-10 bg-gradient-to-tr from-emerald-500/20 to-blue-500/20 blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-700 pointer-events-none"></div>

            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <ShieldCheck className="w-6 h-6 text-blue-400" />
                </div>
                <h2 className="text-xl font-black tracking-tight">Escrow Lock</h2>
              </div>
              <div className="bg-gray-800/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-700 flex items-center gap-1.5 text-gray-300">
                 <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                 Sepolia
              </div>
            </div>
            
            <div className="space-y-4 text-sm text-blue-100">
              <div className="flex justify-between items-center bg-black/20 p-3 rounded-lg border border-white/10">
                <span>Escrow Status</span>
                <span className={`font-bold flex items-center gap-1 ${order.escrow_status === 'Completed' ? 'text-green-400' : 'text-yellow-400 animate-pulse'}`}>
                  {order.escrow_status === 'Completed' ? <CheckCircle2 className="w-4 h-4" /> : <Loader2 className="w-4 h-4 animate-spin" />}
                  {order.escrow_status}
                </span>
              </div>
              <div className="flex justify-between items-center bg-black/20 p-3 rounded-lg border border-white/10">
                <span>Payment</span>
                <span className={`font-bold ${order.payment_status === 'Released' ? 'text-green-400' : 'text-white'}`}>{order.payment_status}</span>
              </div>
            </div>

            <hr className="border-blue-800 my-5" />
            
            <div className="mb-4">
              <p className="text-xs text-blue-400 font-bold uppercase mb-2">{order.status === 'Completed' ? 'Release Tx Hash' : 'Lock Tx Hash'}</p>
              <div className="bg-blue-950 p-3 rounded-lg border border-blue-800 flex items-center justify-between">
                <span className="text-xs font-mono text-blue-200 truncate pr-4">
                  {order.status === 'Completed' ? order.blockchain_release_tx_hash : order.blockchain_tx_hash}
                </span>
              </div>
            </div>

            <div className="flex gap-3 relative z-10">
              <button className="flex-1 bg-gray-800/80 hover:bg-gray-700 backdrop-blur-md transition-colors text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 border border-gray-700">
                <QrCode className="w-4 h-4" /> Verify QR
              </button>
              <a 
                href={`https://sepolia.arbiscan.io/tx/${order.status === 'Completed' || order.status === 'Delivered' ? (order.blockchain_release_tx_hash || order.blockchain_tx_hash || '') : (order.blockchain_tx_hash || '')}`}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => {
                  if (!order.blockchain_release_tx_hash && !order.blockchain_tx_hash) {
                    e.preventDefault();
                    toast.error("Transaction hash not available yet");
                  }
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-500 transition-colors text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(37,99,235,0.3)]">
                 Arbiscan <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[32px] p-8 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>
            
            <div className="flex gap-4 items-start pb-6 border-b border-gray-100">
              <img src={product.images?.[0] ? getProductImageUrl(product.images[0]) : 'https://via.placeholder.com/100'} alt={product.product_name} className="w-20 h-20 rounded-xl object-cover" onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/100'; }} />
              <div>
                <h3 className="font-bold text-gray-900">{product.product_name}</h3>
                <p className="text-xs text-gray-500">{product.category}</p>
                <p className="text-sm font-medium text-gray-900 mt-2">{order.quantity} {product.unit} × ₹{product.price}</p>
              </div>
            </div>

            <div className="py-6 border-b border-gray-100 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium text-gray-900">₹{order.quantity * product.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Platform Fee</span>
                <span className="font-medium text-gray-900">₹{order.payment?.platform_fee || 10}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Delivery</span>
                <span className="font-medium text-gray-900">₹{order.payment?.delivery_fee || 60}</span>
              </div>
            </div>

            <div className="pt-6 flex justify-between items-center">
              <span className="font-black text-gray-900 text-lg">Total Paid</span>
              <span className="font-black text-emerald-700 text-2xl tracking-tight">₹{order.payment?.total?.toLocaleString()}</span>
            </div>
          </div>

        </motion.div>
      </div>
      
      {/* Invoice Section */}
      <div className="relative z-10 mt-12 bg-white/40 backdrop-blur-md rounded-[32px] p-8 border border-white/50 shadow-sm">
        <h2 className="text-2xl font-black text-gray-900 mb-6 text-center">Verified Blockchain Invoice</h2>
        <OrderInvoice order={order} role="Buyer" />
      </div>

      <AnimatePresence>
        {showConfirmModal && (
          <ConfirmDeliveryModal 
            onConfirm={handleConfirmDelivery} 
            onCancel={() => setShowConfirmModal(false)} 
          />
        )}
        
        {showFeedbackModal && !data?.reviewExists && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm overflow-y-auto p-4 sm:p-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-transparent max-w-2xl w-full mx-auto my-8 sm:my-12 relative"
            >
              <button 
                onClick={() => setShowFeedbackModal(false)}
                className="absolute -top-4 -right-4 bg-white rounded-full p-2 text-gray-500 hover:text-gray-900 shadow-lg z-10"
              >
                <X className="w-5 h-5" />
              </button>
              <EnhancedReviewForm 
                onSubmit={async (payload) => {
                  await handleReviewSubmit(payload);
                  setShowFeedbackModal(false);
                }} 
                isSubmitting={submittingReview} 
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
