import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Loader2, Package, Truck, CheckCircle2, ShieldCheck, 
  MapPin, Phone, User, Clock, Copy, Check, Printer, ExternalLink,
  AlertTriangle, XCircle, FileText, ChevronRight, Hash, DollarSign
} from 'lucide-react';
import { farmerOrderService } from '../../../../services/farmer_order.service';
import { getProductImageUrl } from '../../../../services/product.service';
import toast from 'react-hot-toast';

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [copiedTx, setCopiedTx] = useState(false);
  const [copiedWallet, setCopiedWallet] = useState(false);

  // Action Modals State
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    action: null, // 'accept' | 'reject' | 'pack' | 'ship'
    reason: '',
    courier: 'Delhivery',
    trackingNumber: `TRK-${Date.now().toString().slice(-6)}`
  });

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      const res = await farmerOrderService.getOrderDetails(id);
      setData(res);
    } catch (err) {
      console.error('Failed to load order details:', err);
      toast.error('Failed to load order details');
      navigate('/farmer/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteAction = async () => {
    if (!actionModal.action) return;
    setActionLoading(true);
    try {
      const payload = {
        action: actionModal.action,
        reason: actionModal.reason || undefined,
        courier: actionModal.courier || undefined,
        tracking_number: actionModal.trackingNumber || undefined
      };
      await farmerOrderService.updateOrderStatus(id, payload);
      toast.success(`Order ${actionModal.action}ed successfully`);
      setActionModal({ isOpen: false, action: null, reason: '', courier: 'Delhivery', trackingNumber: '' });
      fetchOrderDetails(); // refresh
    } catch (err) {
      console.error('Action failed:', err);
      toast.error(err.response?.data?.error || `Failed to ${actionModal.action} order`);
    } finally {
      setActionLoading(false);
    }
  };

  const copyToClipboard = (text, type) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (type === 'tx') {
      setCopiedTx(true);
      setTimeout(() => setCopiedTx(false), 2000);
    } else if (type === 'wallet') {
      setCopiedWallet(true);
      setTimeout(() => setCopiedWallet(false), 2000);
    }
    toast.success('Copied to clipboard');
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center animate-pulse mb-3">
          <Loader2 className="w-7 h-7 text-emerald-600 animate-spin" />
        </div>
        <p className="text-sm font-bold text-gray-700">Loading order specification...</p>
      </div>
    );
  }

  const { order, product, buyer } = data;

  const isWaitingConfirmation = order.status === 'Waiting for Farmer' || order.status === 'Pending';
  const isAccepted = order.status === 'Accepted';
  const isPacked = order.status === 'Packed';
  const isShipped = order.status === 'Shipped';
  const isDelivered = order.status === 'Delivered' || order.status === 'Completed';
  const isCancelled = order.status === 'Cancelled' || order.status === 'Rejected';

  const timelineSteps = [
    { 
      label: 'Order Placed by Buyer', 
      desc: 'Buyer created order on marketplace',
      status: 'completed', 
      time: new Date(order.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) 
    },
    { 
      label: 'Smart Contract Escrow Locked', 
      desc: 'Payment held safely in blockchain escrow',
      status: order.escrow_status === 'Active' || order.payment_status === 'Locked' || isDelivered ? 'completed' : isCancelled ? 'failed' : 'pending',
      time: order.blockchain_tx_hash ? 'Verified on-chain' : null
    },
    { 
      label: 'Farmer Confirmation', 
      desc: isCancelled ? 'Order was rejected/cancelled' : 'Farmer verified produce availability',
      status: ['Accepted', 'Packed', 'Shipped', 'Delivered', 'Completed'].includes(order.status) ? 'completed' : isCancelled ? 'failed' : 'current' 
    },
    { 
      label: 'Produce Packed & Graded', 
      desc: 'Sorted, weighed and packed for shipment',
      status: ['Packed', 'Shipped', 'Delivered', 'Completed'].includes(order.status) ? 'completed' : isAccepted ? 'current' : 'pending' 
    },
    { 
      label: 'Dispatched & In Transit', 
      desc: order.courier ? `Via ${order.courier} (Tracking: ${order.tracking_number || 'Generated'})` : 'Handed over to transport logistics',
      status: ['Shipped', 'Delivered', 'Completed'].includes(order.status) ? 'completed' : isPacked ? 'current' : 'pending' 
    },
    { 
      label: 'Delivery & Escrow Release', 
      desc: 'Buyer receives delivery & funds released to farmer',
      status: isDelivered ? 'completed' : 'pending' 
    },
  ];

  return (
    <div className="max-w-6xl mx-auto pb-16 px-4 sm:px-6 animate-in fade-in duration-300">
      
      {/* Header & Back Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pt-2">
        <div className="flex items-center gap-3.5">
          <button 
            onClick={() => navigate('/farmer/orders')} 
            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-xs"
            title="Back to Orders"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 font-mono">{order.order_id}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border ${
                isWaitingConfirmation ? 'bg-amber-50 text-amber-800 border-amber-200 ring-1 ring-amber-300' :
                isAccepted ? 'bg-blue-50 text-blue-700 border-blue-200' :
                isPacked ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                isShipped ? 'bg-purple-50 text-purple-700 border-purple-200' :
                isDelivered ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {order.status}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        {/* Print & Share */}
        <div className="flex items-center gap-2">
          <button 
            onClick={handlePrint}
            className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 flex items-center gap-2 transition-all shadow-xs"
          >
            <Printer className="w-4 h-4 text-gray-500" />
            <span>Print Invoice / Slip</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT & CENTER COLUMN (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Produce Item Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-600" /> Produce Ordered
              </h2>
              {product.organic && (
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
                  🌱 100% Organic
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center bg-gray-50/60 p-4 rounded-2xl border border-gray-100/80">
              <img 
                src={product.images?.[0] ? getProductImageUrl(product.images[0]) : 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=600&auto=format&fit=crop&q=80'} 
                alt={product.product_name} 
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border border-gray-200 shrink-0 bg-white"
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=600&auto=format&fit=crop&q=80'; }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                    {product.category}
                  </span>
                  {product.variety && (
                    <span className="text-xs text-gray-500 font-medium">
                      Variety: {product.variety}
                    </span>
                  )}
                </div>
                <h3 className="font-extrabold text-gray-900 text-lg sm:text-xl truncate">{product.product_name}</h3>
                <p className="text-xs text-gray-500 line-clamp-2 mt-1 mb-3">
                  {product.description || 'Farm-direct freshly harvested crop.'}
                </p>

                <div className="grid grid-cols-3 gap-2 bg-white p-2.5 rounded-xl border border-gray-100 text-center">
                  <div>
                    <span className="text-[11px] text-gray-400 block font-medium">Quantity</span>
                    <span className="text-sm font-extrabold text-gray-900">{order.quantity} {product.unit || 'kg'}</span>
                  </div>
                  <div className="border-x border-gray-100">
                    <span className="text-[11px] text-gray-400 block font-medium">Price / {product.unit || 'kg'}</span>
                    <span className="text-sm font-extrabold text-gray-900">₹{product.price}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-400 block font-medium">Subtotal</span>
                    <span className="text-sm font-extrabold text-emerald-700">₹{(order.payment?.product_price || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Buyer & Shipping Address Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Buyer Details */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-500" /> Buyer Profile
                  </h2>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-md text-[11px] font-bold">
                    Verified Buyer
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center font-bold text-base">
                      {order.delivery_address?.full_name?.charAt(0) || 'B'}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{order.delivery_address?.full_name}</h4>
                      <p className="text-xs text-gray-500">AgriChain Registered Buyer</p>
                    </div>
                  </div>

                  {order.delivery_address?.phone_number && (
                    <a 
                      href={`tel:${order.delivery_address.phone_number}`}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 hover:bg-emerald-50 hover:text-emerald-700 text-gray-700 text-xs font-semibold transition-colors border border-gray-100"
                    >
                      <Phone className="w-4 h-4 text-emerald-600" />
                      <span>{order.delivery_address.phone_number}</span>
                      <span className="ml-auto text-[10px] text-emerald-700 font-bold underline">Click to Call</span>
                    </a>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Buyer Wallet</label>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-100 text-xs font-mono text-gray-600">
                      <span className="truncate max-w-[200px]">{order.buyer_wallet}</span>
                      <button 
                        onClick={() => copyToClipboard(order.buyer_wallet, 'wallet')}
                        className="text-gray-400 hover:text-gray-700 p-1"
                        title="Copy Wallet"
                      >
                        {copiedWallet ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Destination */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-gray-500" /> Delivery Address
                  </h2>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md text-[11px] font-bold">
                    {order.delivery_address?.address_type || 'Home / Facility'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 space-y-1.5 text-xs text-gray-700 leading-relaxed">
                  <p className="font-bold text-gray-900 text-sm">{order.delivery_address?.full_name}</p>
                  <p>{order.delivery_address?.address_line1}</p>
                  {order.delivery_address?.address_line2 && <p>{order.delivery_address.address_line2}</p>}
                  <p className="font-semibold">{order.delivery_address?.city}, {order.delivery_address?.state} - {order.delivery_address?.pin_code}</p>
                  <p className="text-gray-500">{order.delivery_address?.country || 'India'}</p>
                </div>
              </div>

              {order.delivery_address?.city && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${order.delivery_address.address_line1}, ${order.delivery_address.city}, ${order.delivery_address.state}, ${order.delivery_address.pin_code}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 flex items-center justify-center gap-1.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> View on Google Maps
                </a>
              )}
            </div>

          </div>

          {/* Timeline / Progress Tracking */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-sm">
            <h2 className="text-base font-extrabold text-gray-900 mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" /> Order Fulfillment Progression
            </h2>

            <div className="space-y-6 relative pl-2">
              {timelineSteps.map((step, idx) => {
                const isDone = step.status === 'completed';
                const isCurr = step.status === 'current';
                const isFail = step.status === 'failed';

                return (
                  <div key={idx} className="relative pl-7">
                    {/* Line Connector */}
                    {idx !== timelineSteps.length - 1 && (
                      <div className={`absolute left-[7px] top-4 w-[2px] h-[calc(100%+12px)] ${
                        isDone ? 'bg-emerald-500' : isFail ? 'bg-rose-400' : 'bg-gray-200'
                      }`} />
                    )}

                    {/* Step Dot */}
                    <div className={`absolute left-0 top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      isDone ? 'bg-emerald-500 border-emerald-500 text-white' :
                      isFail ? 'bg-rose-500 border-rose-500 text-white' :
                      isCurr ? 'bg-white border-amber-500 ring-4 ring-amber-100' :
                      'bg-white border-gray-300'
                    }`}>
                      {isDone && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      {isFail && <span className="text-[9px] font-bold">✕</span>}
                      {isCurr && <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />}
                    </div>

                    <div className="-mt-0.5">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <h4 className={`text-sm font-bold ${
                          isDone ? 'text-gray-900' : isCurr ? 'text-amber-800 font-extrabold' : isFail ? 'text-rose-700' : 'text-gray-400'
                        }`}>
                          {step.label}
                        </h4>
                        {step.time && (
                          <span className="text-[11px] text-gray-400 font-medium">{step.time}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (1 Col - Action Center & Escrow) */}
        <div className="space-y-6">
          
          {/* Action Center Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm sticky top-6">
            <h2 className="text-base font-extrabold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-500" /> Order Actions
            </h2>

            {/* Waiting for Confirmation Actions */}
            {isWaitingConfirmation && (
              <div className="space-y-3">
                <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200/80 mb-4 text-xs text-amber-900">
                  <p className="font-bold flex items-center gap-1.5 mb-1">
                    <Clock className="w-4 h-4 text-amber-600 animate-pulse" /> Farmer Action Required
                  </p>
                  <p className="text-amber-800/90 leading-relaxed">
                    Please accept this order if you have the produce harvested and ready for packing.
                  </p>
                </div>

                <button 
                  onClick={() => setActionModal({ isOpen: true, action: 'accept', reason: '', courier: 'Delhivery', trackingNumber: '' })}
                  disabled={actionLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-emerald-400 text-white font-extrabold py-3.5 px-4 rounded-2xl flex justify-center items-center gap-2 transition-all shadow-md hover:shadow-lg"
                >
                  <CheckCircle2 className="w-5 h-5" /> Accept & Confirm Order
                </button>

                <button 
                  onClick={() => setActionModal({ isOpen: true, action: 'reject', reason: '', courier: 'Delhivery', trackingNumber: '' })}
                  disabled={actionLoading}
                  className="w-full bg-white border border-rose-200 hover:bg-rose-50 active:bg-rose-100 text-rose-600 font-bold py-3 px-4 rounded-2xl transition-colors text-xs"
                >
                  <XCircle className="w-4 h-4 text-rose-500" /> Reject Order & Refund Escrow
                </button>
              </div>
            )}

            {/* Accepted -> Pack */}
            {isAccepted && (
              <div className="space-y-3">
                <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-100 mb-4 text-xs text-blue-900">
                  <p className="font-bold mb-1">Next Step: Pack the crop</p>
                  <p className="text-blue-800/80">Once you have sorted, weighed, and packed the produce, mark it as packed.</p>
                </div>
                <button 
                  onClick={() => setActionModal({ isOpen: true, action: 'pack', reason: '', courier: 'Delhivery', trackingNumber: '' })}
                  disabled={actionLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-indigo-400 text-white font-extrabold py-3.5 px-4 rounded-2xl flex justify-center items-center gap-2 transition-all shadow-md"
                >
                  <Package className="w-5 h-5" /> Mark Produce as Packed
                </button>
              </div>
            )}

            {/* Packed -> Ship */}
            {isPacked && (
              <div className="space-y-3">
                <div className="p-3.5 bg-indigo-50 rounded-2xl border border-indigo-100 mb-4 text-xs text-indigo-900">
                  <p className="font-bold mb-1">Next Step: Dispatch to Transport</p>
                  <p className="text-indigo-800/80">Hand over to logistics partner and update the tracking number.</p>
                </div>
                <button 
                  onClick={() => setActionModal({ isOpen: true, action: 'ship', reason: '', courier: 'Delhivery', trackingNumber: `TRK-${Date.now().toString().slice(-6)}` })}
                  disabled={actionLoading}
                  className="w-full bg-purple-600 hover:bg-purple-700 active:bg-purple-800 disabled:bg-purple-400 text-white font-extrabold py-3.5 px-4 rounded-2xl flex justify-center items-center gap-2 transition-all shadow-md"
                >
                  <Truck className="w-5 h-5" /> Mark as Shipped & In-Transit
                </button>
              </div>
            )}

            {/* Shipped */}
            {isShipped && (
              <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 text-center">
                <Truck className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-purple-900">Order is In Transit</p>
                <p className="text-xs text-purple-700 mt-1">Waiting for buyer delivery confirmation.</p>
                {order.tracking_number && (
                  <p className="text-xs font-mono font-bold text-gray-800 mt-2 bg-white py-1 px-2 rounded border border-purple-200 inline-block">
                    Tracking: {order.tracking_number}
                  </p>
                )}
              </div>
            )}

            {/* Delivered / Completed */}
            {isDelivered && (
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-emerald-900">Fulfillment Complete</p>
                <p className="text-xs text-emerald-700 mt-1">Produce delivered and escrow funds released!</p>
              </div>
            )}

            {/* Rejected */}
            {isCancelled && (
              <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 text-center">
                <XCircle className="w-8 h-8 text-rose-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-rose-900">Order Cancelled / Rejected</p>
                <p className="text-xs text-rose-600 mt-1">Payment has been refunded to the buyer.</p>
              </div>
            )}

            <hr className="my-6 border-gray-100" />

            {/* Payment & Financial Breakdown */}
            <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-3">Financial Settlement</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Produce Price ({order.quantity} {product.unit})</span>
                <span className="font-semibold text-gray-900">₹{(order.payment?.product_price || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery / Transport</span>
                <span className="font-semibold text-gray-900">₹{(order.payment?.delivery_charge || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Platform Fee</span>
                <span className="font-semibold text-emerald-600">₹0 (Zero Fee)</span>
              </div>
              <div className="pt-2 border-t border-gray-100 flex justify-between text-sm font-extrabold text-gray-900">
                <span>Total Order Value</span>
                <span className="text-emerald-700 text-base">₹{(order.payment?.total || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>

          </div>

          {/* Blockchain Smart Contract Escrow */}
          <div className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-extrabold tracking-wide">Blockchain Escrow Security</h3>
            </div>

            <div className="space-y-3 text-xs text-slate-200">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Escrow State:</span>
                <span className="font-bold text-emerald-300 px-2 py-0.5 bg-emerald-900/60 rounded border border-emerald-700/60">
                  {order.escrow_status || 'Active'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Payment Status:</span>
                <span className={`font-bold ${order.payment_status === 'Locked' ? 'text-amber-300' : 'text-emerald-300'}`}>
                  {order.payment_status || 'Locked'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Network:</span>
                <span className="font-semibold text-white">{order.blockchain_network || 'Arbitrum Sepolia'}</span>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Transaction Hash</p>
                <div className="flex items-center justify-between bg-slate-950/80 p-2 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-400">
                  <span className="truncate max-w-[210px]">{order.blockchain_tx_hash || '0x4f8e...92a1'}</span>
                  <button 
                    onClick={() => copyToClipboard(order.blockchain_tx_hash || '0x4f8e...92a1', 'tx')}
                    className="text-slate-400 hover:text-white p-1"
                    title="Copy Tx Hash"
                  >
                    {copiedTx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ACTION DIALOG MODAL */}
      {actionModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
            
            {/* Modal Title */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className={`p-2.5 rounded-xl ${
                  actionModal.action === 'accept' ? 'bg-emerald-100 text-emerald-700' :
                  actionModal.action === 'reject' ? 'bg-rose-100 text-rose-700' :
                  actionModal.action === 'pack' ? 'bg-indigo-100 text-indigo-700' : 'bg-purple-100 text-purple-700'
                }`}>
                  {actionModal.action === 'accept' && <CheckCircle2 className="w-5 h-5" />}
                  {actionModal.action === 'reject' && <XCircle className="w-5 h-5" />}
                  {actionModal.action === 'pack' && <Package className="w-5 h-5" />}
                  {actionModal.action === 'ship' && <Truck className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 capitalize">
                    {actionModal.action === 'accept' ? 'Confirm & Accept Order' :
                     actionModal.action === 'reject' ? 'Reject Order & Refund' :
                     actionModal.action === 'pack' ? 'Mark Order as Packed' : 'Dispatch & Add Tracking'}
                  </h3>
                  <p className="text-xs text-gray-500 font-mono">{order.order_id}</p>
                </div>
              </div>
              <button 
                onClick={() => setActionModal({ isOpen: false, action: null, reason: '', courier: 'Delhivery', trackingNumber: '' })}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 text-sm"
              >
                ✕
              </button>
            </div>

            {/* Reject Form */}
            {actionModal.action === 'reject' && (
              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-700 mb-1">Reason for Rejection (Required):</label>
                <textarea
                  rows="3"
                  value={actionModal.reason}
                  onChange={(e) => setActionModal(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="e.g., Stock unavailable, Quality damage, Logistics not feasible..."
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
                  required
                />
                <p className="text-[11px] text-gray-400 mt-1">The buyer will be refunded their escrow payment automatically.</p>
              </div>
            )}

            {/* Ship Form */}
            {actionModal.action === 'ship' && (
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Logistics / Courier Partner:</label>
                  <select
                    value={actionModal.courier}
                    onChange={(e) => setActionModal(prev => ({ ...prev, courier: e.target.value }))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Delhivery">Delhivery Express</option>
                    <option value="Shadowfax">Shadowfax Agro</option>
                    <option value="Ecom Express">Ecom Express</option>
                    <option value="Local Truck Transport">Local Truck / Mandi Transport</option>
                    <option value="Farm Pickup">Buyer Farm Pickup</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Tracking Number / Vehicle No:</label>
                  <input
                    type="text"
                    value={actionModal.trackingNumber}
                    onChange={(e) => setActionModal(prev => ({ ...prev, trackingNumber: e.target.value }))}
                    placeholder="e.g., TRK-987654 or GJ01-AB-1234"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            )}

            {actionModal.action === 'accept' && (
              <p className="text-xs text-gray-600 mb-4 bg-emerald-50/70 p-3 rounded-xl border border-emerald-100">
                ✅ By accepting this order, you confirm you have this produce ready and will pack it within the designated timeline.
              </p>
            )}

            {actionModal.action === 'pack' && (
              <p className="text-xs text-gray-600 mb-4 bg-indigo-50/70 p-3 rounded-xl border border-indigo-100">
                📦 Confirm that the produce has been graded, weighed, packed securely, and labeled with the order ID.
              </p>
            )}

            {/* Modal Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActionModal({ isOpen: false, action: null, reason: '', courier: 'Delhivery', trackingNumber: '' })}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteAction}
                disabled={actionLoading || (actionModal.action === 'reject' && !actionModal.reason.trim())}
                className={`px-5 py-2.5 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 ${
                  actionModal.action === 'accept' ? 'bg-emerald-600 hover:bg-emerald-700' :
                  actionModal.action === 'reject' ? 'bg-rose-600 hover:bg-rose-700' :
                  actionModal.action === 'pack' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing...
                  </>
                ) : (
                  <>Confirm & Update</>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
