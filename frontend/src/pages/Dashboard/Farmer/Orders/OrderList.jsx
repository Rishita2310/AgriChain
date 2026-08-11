import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Loader2, Package, Search, Filter, ShieldCheck, Download, 
  CheckCircle2, XCircle, Clock, Truck, ArrowRight, Eye, 
  Calendar, MapPin, Phone, RefreshCw, LayoutGrid, List,
  TrendingUp, AlertCircle, ChevronRight, FileText, Check
} from 'lucide-react';
import { farmerOrderService } from '../../../../services/farmer_order.service';
import { getProductImageUrl } from '../../../../services/product.service';
import toast from 'react-hot-toast';

export default function OrderList() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Action Modal State
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    order: null,
    action: null, // 'accept' | 'reject' | 'pack' | 'ship'
    reason: '',
    courier: 'Delhivery',
    trackingNumber: ''
  });
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async (showToast = false) => {
    if (orders.length > 0) setRefreshing(true);
    else setLoading(true);
    
    try {
      const data = await farmerOrderService.getOrders();
      setOrders(Array.isArray(data) ? data : []);
      if (showToast) toast.success('Orders refreshed');
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Waiting for Farmer':
      case 'Pending':
        return {
          label: 'Needs Confirmation',
          badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-300/40',
          dotClass: 'bg-amber-500 animate-pulse',
          icon: Clock
        };
      case 'Accepted':
        return {
          label: 'Accepted / Confirmed',
          badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
          dotClass: 'bg-blue-500',
          icon: CheckCircle2
        };
      case 'Packed':
        return {
          label: 'Ready for Dispatch',
          badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          dotClass: 'bg-indigo-500',
          icon: Package
        };
      case 'Shipped':
        return {
          label: 'In Transit / Shipped',
          badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
          dotClass: 'bg-purple-500',
          icon: Truck
        };
      case 'Delivered':
      case 'Completed':
        return {
          label: 'Completed / Delivered',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dotClass: 'bg-emerald-500',
          icon: Check
        };
      case 'Cancelled':
      case 'Rejected':
        return {
          label: 'Cancelled / Rejected',
          badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
          dotClass: 'bg-rose-500',
          icon: XCircle
        };
      default:
        return {
          label: status || 'Processing',
          badgeClass: 'bg-gray-50 text-gray-700 border-gray-200',
          dotClass: 'bg-gray-500',
          icon: Package
        };
    }
  };

  // Quick Action execution from modal
  const handleExecuteAction = async () => {
    if (!actionModal.order || !actionModal.action) return;
    setIsSubmittingAction(true);
    try {
      const payload = {
        action: actionModal.action,
        reason: actionModal.reason || undefined,
        courier: actionModal.courier || undefined,
        tracking_number: actionModal.trackingNumber || undefined
      };
      await farmerOrderService.updateOrderStatus(actionModal.order.order_id, payload);
      toast.success(`Order ${actionModal.action}ed successfully!`);
      setActionModal({ isOpen: false, order: null, action: null, reason: '', courier: 'Delhivery', trackingNumber: '' });
      fetchOrders();
    } catch (err) {
      console.error('Order action failed:', err);
      toast.error(err.response?.data?.error || `Failed to ${actionModal.action} order`);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Filter & Search Logic
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Tab matching
      let matchesTab = true;
      if (activeTab === 'pending') {
        matchesTab = order.status === 'Waiting for Farmer' || order.status === 'Pending';
      } else if (activeTab === 'in_progress') {
        matchesTab = ['Accepted', 'Packed', 'Shipped'].includes(order.status);
      } else if (activeTab === 'completed') {
        matchesTab = ['Delivered', 'Completed'].includes(order.status);
      } else if (activeTab === 'cancelled') {
        matchesTab = ['Cancelled', 'Rejected'].includes(order.status);
      }

      // Search matching
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || (
        order.order_id?.toLowerCase().includes(query) ||
        order.product_name?.toLowerCase().includes(query) ||
        order.delivery_address?.full_name?.toLowerCase().includes(query) ||
        order.delivery_address?.city?.toLowerCase().includes(query) ||
        order.delivery_address?.state?.toLowerCase().includes(query)
      );

      return matchesTab && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      if (sortBy === 'oldest') return new Date(a.created_at || 0) - new Date(b.created_at || 0);
      if (sortBy === 'amount_high') return (b.payment?.total || 0) - (a.payment?.total || 0);
      if (sortBy === 'amount_low') return (a.payment?.total || 0) - (b.payment?.total || 0);
      return 0;
    });
  }, [orders, activeTab, searchQuery, sortBy]);

  // Summary Metrics
  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter(o => o.status === 'Waiting for Farmer' || o.status === 'Pending').length;
    const inProgress = orders.filter(o => ['Accepted', 'Packed', 'Shipped'].includes(o.status)).length;
    const completed = orders.filter(o => ['Delivered', 'Completed'].includes(o.status)).length;
    const revenue = orders
      .filter(o => o.payment_status === 'Locked' || o.payment_status === 'Released' || o.status === 'Completed')
      .reduce((sum, o) => sum + (o.payment?.total || 0), 0);

    return { total, pending, inProgress, completed, revenue };
  }, [orders]);

  // CSV Export
  const handleExportCSV = () => {
    if (orders.length === 0) {
      toast.error('No orders to export');
      return;
    }
    const headers = ['Order ID', 'Date', 'Product', 'Quantity', 'Amount (INR)', 'Buyer Name', 'City', 'State', 'Status', 'Escrow Status'];
    const rows = orders.map(o => [
      o.order_id,
      new Date(o.created_at).toLocaleDateString(),
      `"${o.product_name || 'Crop Produce'}"`,
      o.quantity,
      o.payment?.total || 0,
      `"${o.delivery_address?.full_name || 'N/A'}"`,
      `"${o.delivery_address?.city || 'N/A'}"`,
      `"${o.delivery_address?.state || 'N/A'}"`,
      o.status,
      o.escrow_status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `agrichain_farmer_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Orders exported successfully!');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center animate-pulse">
            <Package className="w-8 h-8 text-emerald-600 animate-bounce" />
          </div>
        </div>
        <h3 className="mt-4 text-base font-bold text-gray-900">Loading your farm orders...</h3>
        <p className="text-xs text-gray-500 mt-1">Connecting to blockchain escrow registry</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-16 px-4 sm:px-6">
      
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 pt-2">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100/80 text-emerald-800 rounded-xl">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Farm Orders & Sales</h1>
              <p className="text-sm text-gray-500 mt-0.5">Manage buyer purchases, pack crops, and track escrow settlements.</p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button 
            onClick={() => fetchOrders(true)}
            disabled={refreshing}
            className="px-3.5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 active:bg-gray-100 flex items-center gap-2 transition-all shadow-sm disabled:opacity-60"
            title="Refresh Order List"
          >
            <RefreshCw className={`w-4 h-4 text-gray-500 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button 
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 active:bg-gray-100 flex items-center gap-2 transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-gray-500" />
            <span>Export CSV</span>
          </button>

          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all ${viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all ${viewMode === 'table' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4 mb-8">
        
        {/* Total Orders */}
        <div 
          onClick={() => setActiveTab('all')}
          className={`bg-white p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-md ${activeTab === 'all' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-gray-100 shadow-sm'}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Orders</span>
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">{stats.total}</p>
          <p className="text-[11px] text-gray-400 mt-1">All time bookings</p>
        </div>

        {/* Needs Action */}
        <div 
          onClick={() => setActiveTab('pending')}
          className={`bg-gradient-to-br from-amber-50/80 to-amber-100/30 p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-md ${activeTab === 'pending' ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-amber-200/80 shadow-sm'}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Needs Action</span>
            <div className="w-8 h-8 rounded-lg bg-amber-200/60 flex items-center justify-center text-amber-800">
              <Clock className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-900">{stats.pending}</p>
            {stats.pending > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900">
                Action Required
              </span>
            )}
          </div>
          <p className="text-[11px] text-amber-700/80 mt-1">Waiting confirmation</p>
        </div>

        {/* In Progress */}
        <div 
          onClick={() => setActiveTab('in_progress')}
          className={`bg-white p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-md ${activeTab === 'in_progress' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-100 shadow-sm'}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Processing</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-blue-900">{stats.inProgress}</p>
          <p className="text-[11px] text-gray-400 mt-1">Packing & in transit</p>
        </div>

        {/* Completed */}
        <div 
          onClick={() => setActiveTab('completed')}
          className={`bg-white p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-md ${activeTab === 'completed' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-gray-100 shadow-sm'}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Delivered</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-900">{stats.completed}</p>
          <p className="text-[11px] text-gray-400 mt-1">Successfully fulfilled</p>
        </div>

        {/* Total Volume */}
        <div className="col-span-2 sm:col-span-2 lg:col-span-1 bg-emerald-900 text-white p-4 sm:p-5 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 w-24 h-24 bg-emerald-800/40 rounded-full blur-xl pointer-events-none"></div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Total Sales</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-800/80 flex items-center justify-center text-emerald-300">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">₹{stats.revenue.toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-emerald-300/80 mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Escrow secured
          </p>
        </div>

      </div>

      {/* Tabs, Search & Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 space-y-4">
        
        {/* Status Navigation Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'All Orders', count: stats.total },
            { id: 'pending', label: 'Needs Action', count: stats.pending, highlight: stats.pending > 0 },
            { id: 'in_progress', label: 'In Progress', count: stats.inProgress },
            { id: 'completed', label: 'Completed', count: stats.completed },
            { id: 'cancelled', label: 'Cancelled', count: orders.filter(o => ['Cancelled', 'Rejected'].includes(o.status)).length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-600'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === tab.id 
                  ? 'bg-gray-800 text-gray-200' 
                  : tab.highlight 
                    ? 'bg-amber-100 text-amber-800' 
                    : 'bg-gray-200/80 text-gray-700'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Sort Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-gray-100">
          
          {/* Search Input */}
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID, Buyer, City, Crop..." 
              className="w-full pl-10 pr-9 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs p-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs font-medium text-gray-500 whitespace-nowrap hidden sm:inline">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-auto cursor-pointer"
            >
              <option value="newest">📅 Newest Orders First</option>
              <option value="oldest">⌛ Oldest Orders First</option>
              <option value="amount_high">💰 Order Value: High to Low</option>
              <option value="amount_low">🏷️ Order Value: Low to High</option>
            </select>
          </div>

        </div>

      </div>

      {/* Orders View */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 sm:p-16 text-center shadow-sm max-w-2xl mx-auto my-6">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
            <Package className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {searchQuery ? 'No Matching Orders Found' : 'No Orders in this Status'}
          </h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
            {searchQuery 
              ? `We couldn't find any orders matching "${searchQuery}". Try searching with a different keyword or clear your filter.`
              : 'As soon as buyers place orders from the marketplace, they will appear here for your confirmation.'}
          </p>
          {searchQuery ? (
            <button 
              onClick={() => setSearchQuery('')}
              className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
            >
              Clear Search Query
            </button>
          ) : (
            <button 
              onClick={() => navigate('/farmer/products/new')}
              className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
            >
              + List New Crop for Sale
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOrders.map(order => {
            const badge = getStatusBadge(order.status);
            const isWaitingConfirmation = order.status === 'Waiting for Farmer' || order.status === 'Pending';
            const isAccepted = order.status === 'Accepted';
            const isPacked = order.status === 'Packed';

            return (
              <div 
                key={order.order_id}
                className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col hover:shadow-lg overflow-hidden group ${
                  isWaitingConfirmation 
                    ? 'border-amber-200/90 ring-1 ring-amber-400/20' 
                    : 'border-gray-100 shadow-sm'
                }`}
              >
                {/* Card Top Banner */}
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${badge.badgeClass}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dotClass}`}></span>
                        {badge.label}
                      </span>
                    </div>
                    <p className="text-xs font-mono font-bold text-gray-800">{order.order_id}</p>
                  </div>

                  {/* Escrow Badge */}
                  {order.payment_status === 'Locked' && (
                    <div className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 border border-emerald-100/80 shadow-xs">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>₹ Escrow Locked</span>
                    </div>
                  )}
                </div>

                {/* Card Main Body */}
                <div className="p-5 flex-1 flex flex-col">
                  
                  {/* Crop / Product Snippet */}
                  <div className="flex gap-3.5 items-center mb-4">
                    <img 
                      src={order.product_image ? getProductImageUrl(order.product_image) : 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=400&auto=format&fit=crop&q=80'} 
                      alt={order.product_name || 'Crop'} 
                      className="w-14 h-14 rounded-xl object-cover border border-gray-100 shrink-0 bg-gray-50"
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=400&auto=format&fit=crop&q=80'; }}
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-gray-900 text-base truncate group-hover:text-emerald-700 transition-colors">
                        {order.product_name || 'Farm Produce Item'}
                      </h4>
                      <p className="text-xs text-gray-500 truncate">
                        {order.product_category || 'Farm Fresh'} • {order.quantity} {order.product_unit || 'kg'} ordered
                      </p>
                      <p className="text-sm font-extrabold text-emerald-700 mt-0.5">
                        ₹{(order.payment?.total || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  {/* Buyer & Destination */}
                  <div className="bg-gray-50/80 rounded-xl p-3 mb-4 text-xs space-y-1.5 border border-gray-100/80">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 font-medium">Buyer:</span>
                      <span className="font-bold text-gray-900">{order.delivery_address?.full_name || 'Direct Buyer'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 font-medium">Destination:</span>
                      <span className="font-semibold text-gray-700 truncate max-w-[170px]">
                        {order.delivery_address?.city}, {order.delivery_address?.state}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 font-medium">Order Date:</span>
                      <span className="text-gray-600">{new Date(order.created_at || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>

                  {/* Quick Action Buttons on Card */}
                  <div className="mt-auto space-y-2">
                    {isWaitingConfirmation && (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          onClick={() => setActionModal({ isOpen: true, order, action: 'accept', reason: '', courier: 'Delhivery', trackingNumber: '' })}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Accept
                        </button>
                        <button
                          onClick={() => setActionModal({ isOpen: true, order, action: 'reject', reason: '', courier: 'Delhivery', trackingNumber: '' })}
                          className="w-full py-2 bg-white border border-rose-200 hover:bg-rose-50 active:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    )}

                    {isAccepted && (
                      <button
                        onClick={() => setActionModal({ isOpen: true, order, action: 'pack', reason: '', courier: 'Delhivery', trackingNumber: '' })}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                      >
                        <Package className="w-3.5 h-3.5" /> Mark as Packed
                      </button>
                    )}

                    {isPacked && (
                      <button
                        onClick={() => setActionModal({ isOpen: true, order, action: 'ship', reason: '', courier: 'Delhivery', trackingNumber: `TRK-${Date.now().toString().slice(-6)}` })}
                        className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                      >
                        <Truck className="w-3.5 h-3.5" /> Dispatch & Ship
                      </button>
                    )}

                    {/* View Full Order Details Link */}
                    <button 
                      onClick={() => navigate(`/farmer/orders/${order.order_id}`)}
                      className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-gray-100"
                    >
                      <Eye className="w-3.5 h-3.5 text-gray-500" /> View Full Order Details <ArrowRight className="w-3 h-3 ml-0.5" />
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

      ) : (

        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/80 border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="py-3.5 px-4">Order ID & Date</th>
                  <th className="py-3.5 px-4">Crop Item</th>
                  <th className="py-3.5 px-4">Buyer & City</th>
                  <th className="py-3.5 px-4">Quantity</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Order Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map(order => {
                  const badge = getStatusBadge(order.status);
                  const isWaiting = order.status === 'Waiting for Farmer' || order.status === 'Pending';
                  
                  return (
                    <tr key={order.order_id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-mono font-bold text-gray-900 text-xs">{order.order_id}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {new Date(order.created_at || Date.now()).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={order.product_image ? getProductImageUrl(order.product_image) : 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=200&auto=format&fit=crop&q=80'} 
                            alt="" 
                            className="w-9 h-9 rounded-lg object-cover border border-gray-100"
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=200&auto=format&fit=crop&q=80'; }}
                          />
                          <div>
                            <p className="font-bold text-gray-900 text-xs truncate max-w-[150px]">{order.product_name || 'Crop Produce'}</p>
                            <p className="text-[11px] text-gray-500">{order.product_category || 'Farm Produce'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-gray-900 text-xs">{order.delivery_address?.full_name || 'Buyer'}</p>
                        <p className="text-[11px] text-gray-500">{order.delivery_address?.city}, {order.delivery_address?.state}</p>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-gray-800 text-xs">
                        {order.quantity} {order.product_unit || 'kg'}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-extrabold text-emerald-700 text-xs">₹{(order.payment?.total || 0).toLocaleString('en-IN')}</p>
                        <span className="text-[10px] text-gray-400">Escrow Locked</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${badge.badgeClass}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dotClass}`}></span>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isWaiting && (
                            <>
                              <button
                                onClick={() => setActionModal({ isOpen: true, order, action: 'accept', reason: '', courier: 'Delhivery', trackingNumber: '' })}
                                className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold"
                                title="Accept Order"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setActionModal({ isOpen: true, order, action: 'reject', reason: '', courier: 'Delhivery', trackingNumber: '' })}
                                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold"
                                title="Reject Order"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => navigate(`/farmer/orders/${order.order_id}`)}
                            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold transition-colors"
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      )}

      {/* QUICK ACTION MODAL */}
      {actionModal.isOpen && actionModal.order && (
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
                  <p className="text-xs text-gray-500 font-mono">{actionModal.order.order_id}</p>
                </div>
              </div>
              <button 
                onClick={() => setActionModal({ isOpen: false, order: null, action: null, reason: '', courier: 'Delhivery', trackingNumber: '' })}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 text-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Context Info */}
            <div className="bg-gray-50 rounded-2xl p-4 mb-4 text-xs space-y-1.5 border border-gray-100">
              <div className="flex justify-between font-medium text-gray-600">
                <span>Crop:</span>
                <span className="font-bold text-gray-900">{actionModal.order.product_name || 'Produce Item'}</span>
              </div>
              <div className="flex justify-between font-medium text-gray-600">
                <span>Quantity:</span>
                <span className="font-bold text-gray-900">{actionModal.order.quantity} {actionModal.order.product_unit || 'kg'}</span>
              </div>
              <div className="flex justify-between font-medium text-gray-600">
                <span>Buyer Amount:</span>
                <span className="font-extrabold text-emerald-700">₹{(actionModal.order.payment?.total || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Action Specific Inputs */}
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
                onClick={() => setActionModal({ isOpen: false, order: null, action: null, reason: '', courier: 'Delhivery', trackingNumber: '' })}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteAction}
                disabled={isSubmittingAction || (actionModal.action === 'reject' && !actionModal.reason.trim())}
                className={`px-5 py-2.5 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 ${
                  actionModal.action === 'accept' ? 'bg-emerald-600 hover:bg-emerald-700' :
                  actionModal.action === 'reject' ? 'bg-rose-600 hover:bg-rose-700' :
                  actionModal.action === 'pack' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {isSubmittingAction ? (
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
