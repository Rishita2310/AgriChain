import React, { useEffect, useState } from 'react';
import { adminService } from '../../../services/admin.service';
import { 
  Search, Filter, ShoppingBag, Eye, Loader2, ShieldCheck, 
  ExternalLink, CheckCircle, Clock, Truck, XCircle, AlertCircle, X, MapPin
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await adminService.getOrders(statusFilter);
      setOrders(data.orders || data || []);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const getStatusBadge = (status) => {
    const map = {
      'Waiting for Farmer': { bg: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Clock },
      'Accepted': { bg: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: CheckCircle },
      'Packed': { bg: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30', icon: ShoppingBag },
      'Shipped': { bg: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: Truck },
      'Delivered': { bg: 'bg-teal-500/20 text-teal-400 border-teal-500/30', icon: CheckCircle },
      'Completed': { bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: CheckCircle },
      'Rejected': { bg: 'bg-rose-500/20 text-rose-400 border-rose-500/30', icon: XCircle },
      'Cancelled': { bg: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: AlertCircle },
    };

    const cfg = map[status] || { bg: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: Clock };
    const Icon = cfg.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${cfg.bg}`}>
        <Icon className="w-3.5 h-3.5" />
        {status}
      </span>
    );
  };

  const filteredOrders = orders.filter(order => {
    const q = search.toLowerCase();
    const matchesSearch = 
      (order.order_id && order.order_id.toLowerCase().includes(q)) ||
      (order.product_name && order.product_name.toLowerCase().includes(q)) ||
      (order.buyer_name && order.buyer_name.toLowerCase().includes(q)) ||
      (order.farmer_name && order.farmer_name.toLowerCase().includes(q)) ||
      (order.buyer_wallet && order.buyer_wallet.toLowerCase().includes(q));
    return matchesSearch;
  });

  const totalVolume = orders.reduce((acc, curr) => acc + (curr.payment?.total || 0), 0);
  const activeEscrows = orders.filter(o => o.escrow_status === 'Active' || o.payment_status === 'Locked').length;

  return (
    <div className="max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-primary" /> Order Management
          </h1>
          <p className="text-gray-400 mt-1 font-medium">Monitor all marketplace orders, escrow statuses, and on-chain settlements.</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-2xl">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Orders</p>
          <p className="text-3xl font-black text-white">{orders.length}</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-2xl">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Active Escrows</p>
          <p className="text-3xl font-black text-amber-400">{activeEscrows}</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-2xl">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Volume</p>
          <p className="text-3xl font-black text-emerald-400">₹{totalVolume.toLocaleString()}</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-2xl">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Network</p>
          <p className="text-xl font-bold text-blue-400 mt-1">Arbitrum Sepolia</p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 sm:p-6 border-b border-white/10 flex flex-col sm:flex-row justify-between gap-4 bg-black/20">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by Order ID, Buyer, Farmer, Product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-white transition-all font-medium placeholder-gray-500"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2.5 pl-4 pr-10 bg-black/50 text-white border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="Waiting for Farmer">Waiting for Farmer</option>
              <option value="Accepted">Accepted</option>
              <option value="Packed">Packed</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Completed">Completed</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/40 border-b border-white/10 text-xs uppercase tracking-wider text-gray-400 font-bold">
                  <th className="p-4 pl-6">Order ID & Date</th>
                  <th className="p-4">Product</th>
                  <th className="p-4">Buyer / Farmer</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Escrow</th>
                  <th className="p-4 pr-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredOrders.length === 0 ? (
                  <tr><td colSpan="7" className="p-8 text-center text-gray-500">No orders found.</td></tr>
                ) : filteredOrders.map((order) => (
                  <tr key={order.order_id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 pl-6">
                      <div>
                        <p className="font-mono font-bold text-white text-sm">{order.order_id}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {order.created_at ? new Date(order.created_at).toLocaleDateString() : '---'}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-bold text-white text-sm">{order.product_name || 'Crop Order'}</p>
                        <p className="text-xs text-gray-400">{order.quantity} units</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-xs">
                        <p className="text-gray-200 font-bold">Buyer: {order.buyer_name}</p>
                        <p className="text-gray-400 font-medium">Farmer: {order.farmer_name}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-emerald-400 font-bold text-base">
                        ₹{(order.payment?.total || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${
                        order.escrow_status === 'Released' || order.status === 'Completed'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        <ShieldCheck className="w-3 h-3" />
                        {order.escrow_status || 'Active'}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors inline-flex items-center gap-1.5 text-xs font-bold"
                      >
                        <Eye className="w-4 h-4" /> Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#121212] border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/40">
              <div>
                <h2 className="text-xl font-bold text-white">Order {selectedOrder.order_id}</h2>
                <p className="text-xs text-gray-400 mt-1">Arbitrum Sepolia Escrow Order</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Product Info */}
              <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Product</span>
                  <span className="font-bold text-white">{selectedOrder.product_name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Quantity</span>
                  <span className="font-bold text-white">{selectedOrder.quantity} units</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Total Paid</span>
                  <span className="font-bold text-emerald-400 font-mono">₹{selectedOrder.payment?.total}</span>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-primary" /> Delivery Destination
                </h4>
                <p className="text-sm text-white font-medium">{selectedOrder.delivery_address?.full_name}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {selectedOrder.delivery_address?.address_line1}, {selectedOrder.delivery_address?.city}, {selectedOrder.delivery_address?.state} - {selectedOrder.delivery_address?.pin_code}
                </p>
                <p className="text-xs text-gray-400 mt-1">📞 {selectedOrder.delivery_address?.phone_number}</p>
              </div>

              {/* Blockchain & Escrow Info */}
              <div className="bg-blue-950/40 border border-blue-500/20 p-4 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-blue-300 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 text-blue-400" />
                  Arbitrum Sepolia Escrow Contract
                </div>
                <div className="text-xs space-y-1.5 font-mono text-gray-300">
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-sans">Escrow Contract:</span>
                    <span className="text-blue-400">{selectedOrder.escrow_contract_address || '0x2C4A7e3D94bC4c10D204A81E99525Db724a73752'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-sans">Buyer Wallet:</span>
                    <span className="truncate max-w-[200px]">{selectedOrder.buyer_wallet}</span>
                  </div>
                  {selectedOrder.blockchain_tx_hash && (
                    <div className="flex justify-between items-center pt-2 border-t border-blue-500/20">
                      <span className="text-gray-400 font-sans">Tx Hash:</span>
                      <a 
                        href={`https://sepolia.arbiscan.io/tx/${selectedOrder.blockchain_tx_hash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline flex items-center gap-1 font-bold"
                      >
                        Arbiscan <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-white/10 bg-black/40 flex justify-end">
              <button 
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-sm transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
