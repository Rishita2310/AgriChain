import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Package, Plus, Search, Filter, Grid, List, CheckCircle2, 
  AlertTriangle, Clock, QrCode, ExternalLink, Trash2, 
  Edit3, MoreVertical, RefreshCw, Leaf, MapPin, Calendar, 
  Layers, IndianRupee, ShieldCheck, Copy, Check, Eye, X, Loader2
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import { productService, getProductImageUrl } from '../../../../services/product.service';

const CATEGORIES = ['All', 'Vegetables', 'Fruits', 'Grains', 'Pulses', 'Spices', 'Flowers', 'Herbs', 'Seeds', 'Dairy', 'Organic Products', 'Other'];

export default function ProductList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modals state
  const [selectedProductForQR, setSelectedProductForQR] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await productService.getFarmerProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch farmer products:', err);
      toast.error('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Compute metrics
  const metrics = useMemo(() => {
    const total = products.length;
    const published = products.filter(p => p.status === 'Published').length;
    const draft = products.filter(p => p.status === 'Draft' || p.status === 'PendingVerification').length;
    const outOfStock = products.filter(p => p.status === 'OutOfStock' || p.status === 'SoldOut' || p.quantity <= 0).length;
    const totalInventoryValue = products.reduce((acc, p) => acc + ((p.price || 0) * (p.quantity || 0)), 0);

    return { total, published, draft, outOfStock, totalInventoryValue };
  }, [products]);

  // Filter & Sort
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        const matchesSearch = 
          (p.product_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.variety || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.product_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.category || '').toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
        
        let matchesStatus = true;
        if (selectedStatus === 'Published') matchesStatus = p.status === 'Published';
        else if (selectedStatus === 'Draft') matchesStatus = p.status === 'Draft';
        else if (selectedStatus === 'OutOfStock') matchesStatus = p.status === 'OutOfStock' || p.quantity <= 0;
        else if (selectedStatus === 'PendingVerification') matchesStatus = p.status === 'PendingVerification';

        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        if (sortBy === 'oldest') return new Date(a.created_at || 0) - new Date(b.created_at || 0);
        if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0);
        if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0);
        if (sortBy === 'stock-low') return (a.quantity || 0) - (b.quantity || 0);
        if (sortBy === 'stock-high') return (b.quantity || 0) - (a.quantity || 0);
        return 0;
      });
  }, [products, searchQuery, selectedCategory, selectedStatus, sortBy]);

  // Status update handler
  const handleStatusChange = async (productId, newStatus) => {
    setUpdatingStatusId(productId);
    try {
      await productService.updateStatus(productId, newStatus);
      setProducts(prev => prev.map(p => {
        if (p.product_id === productId || p._id === productId || p.id === productId) {
          return { ...p, status: newStatus };
        }
        return p;
      }));
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      console.error('Status update failed:', err);
      toast.error(err.response?.data?.error || 'Failed to update status');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Delete product handler
  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    const targetId = productToDelete.product_id || (typeof productToDelete._id === 'string' ? productToDelete._id : productToDelete._id?.$oid) || productToDelete.id;
    setIsDeleting(true);
    try {
      await productService.delete(targetId);
      setProducts(prev => prev.filter(p => {
        const pId = p.product_id || (typeof p._id === 'string' ? p._id : p._id?.$oid) || p.id;
        return pId !== targetId && p.product_id !== targetId;
      }));
      toast.success('Product deleted successfully');
      setProductToDelete(null);
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error(err.response?.data?.error || 'Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status, quantity) => {
    if (status === 'Draft') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          Draft
        </span>
      );
    }
    if (status === 'OutOfStock' || status === 'SoldOut') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          Out of Stock
        </span>
      );
    }
    if (status === 'Published') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Published & Live
        </span>
      );
    }
    if (quantity <= 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          Out of Stock
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
        {status || 'Pending'}
      </span>
    );
  };

  const copyToClipboard = (text, isHash = false) => {
    navigator.clipboard.writeText(text);
    if (isHash) {
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-800 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-900/10">
        <div>
          <div className="flex items-center gap-2 mb-2 text-emerald-200 text-sm font-medium">
            <Layers className="w-4 h-4" />
            <span>Farm Inventory & Traceability</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Farmer Product Management
          </h1>
          <p className="text-emerald-100/90 text-sm mt-1 max-w-xl">
            Manage your crops, update real-time stock levels, view blockchain traceability QR codes, and reach thousands of verified buyers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchProducts}
            title="Refresh Inventory"
            disabled={loading}
            className="p-3 bg-white/10 hover:bg-white/20 active:scale-95 text-white rounded-2xl backdrop-blur-md transition-all border border-white/10"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button 
            onClick={() => navigate('/farmer/products/new')}
            className="flex items-center gap-2 bg-white text-emerald-900 px-5 py-3 rounded-2xl font-bold hover:bg-emerald-50 active:scale-95 transition-all shadow-lg shadow-black/10"
          >
            <Plus className="w-5 h-5 text-primary" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Metrics Summary Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Products</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-gray-900 mt-3">{metrics.total}</div>
          <div className="text-xs text-gray-500 mt-1">Listed in your inventory</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Active Listings</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-600 mt-3">{metrics.published}</div>
          <div className="text-xs text-gray-500 mt-1">Live in Buyer Marketplace</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">Drafts / Inactive</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-600 mt-3">{metrics.draft}</div>
          <div className="text-xs text-gray-500 mt-1">Unpublished / Draft items</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Est. Inventory Value</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900 mt-3 truncate">
            ₹{metrics.totalInventoryValue.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-gray-500 mt-1">Based on available stock</div>
        </div>
      </div>

      {/* Filter & Toolbar Area */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search product, category, variety..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filters & View Switches */}
          <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 w-full md:w-auto">
            
            {/* Category dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
              ))}
            </select>

            {/* Sort dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="stock-high">Stock: High to Low</option>
              <option value="stock-low">Stock: Low to High</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'table' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Status Pill Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-gray-100 no-scrollbar">
          {[
            { id: 'All', label: 'All Products', count: products.length },
            { id: 'Published', label: 'Published & Live', count: metrics.published },
            { id: 'Draft', label: 'Drafts', count: metrics.draft },
            { id: 'OutOfStock', label: 'Out of Stock', count: metrics.outOfStock },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                selectedStatus === tab.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                selectedStatus === tab.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center shadow-sm">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900">Loading your farm inventory...</h3>
          <p className="text-sm text-gray-500 mt-1">Connecting to AgriChain blockchain state</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-3xl p-12 sm:p-16 text-center shadow-sm max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-emerald-50 text-primary rounded-3xl flex items-center justify-center mx-auto mb-5">
            <Package className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-extrabold text-gray-900 mb-2">
            {products.length === 0 ? 'No Products Listed Yet' : 'No Matching Products Found'}
          </h3>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            {products.length === 0 
              ? 'Start selling directly to buyers by adding your harvest, vegetables, fruits, or grains to AgriChain.'
              : 'Try clearing your search filters or selecting a different category/status tab.'
            }
          </p>
          {products.length === 0 ? (
            <button 
              onClick={() => navigate('/farmer/products/new')}
              className="bg-primary text-white px-6 py-3 rounded-2xl font-bold hover:bg-primary-dark transition-all inline-flex items-center gap-2 shadow-lg shadow-primary/20"
            >
              <Plus className="w-5 h-5" /> Add Your First Product
            </button>
          ) : (
            <button 
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setSelectedStatus('All'); }}
              className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl font-medium hover:bg-gray-200 transition-colors inline-flex items-center gap-2 text-sm"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        
        /* Grid Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((p) => {
            const prodIdentifier = p.product_id || p._id || p.id;
            const imageUrl = p.images && p.images.length > 0 ? getProductImageUrl(p.images[0]) : null;
            const isLowStock = (p.quantity || 0) <= 10 && (p.quantity || 0) > 0;

            return (
              <div 
                key={prodIdentifier}
                className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                {/* Product Image Box */}
                <div className="h-52 bg-gray-100 overflow-hidden relative">
                  {imageUrl ? (
                    <img 
                      src={imageUrl} 
                      alt={p.product_name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                      <Package className="w-12 h-12 mb-1 opacity-40" />
                      <span className="text-xs font-medium">No Image Uploaded</span>
                    </div>
                  )}

                  {/* Badges on Image */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {p.organic && (
                      <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-md flex items-center gap-1 backdrop-blur-md">
                        <Leaf className="w-3 h-3" /> Organic
                      </span>
                    )}
                  </div>

                  <div className="absolute top-3 right-3">
                    {getStatusBadge(p.status, p.quantity)}
                  </div>

                  {/* Blockchain Tag */}
                  {p.blockchain_hash && (
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-mono px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>Blockchain Verified</span>
                    </div>
                  )}

                  {/* Image count */}
                  {p.images && p.images.length > 1 && (
                    <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs px-2 py-0.5 rounded-md font-medium">
                      +{p.images.length - 1} photos
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span className="font-semibold text-primary uppercase tracking-wider">{p.category}</span>
                      {p.variety && <span className="text-gray-400">• {p.variety}</span>}
                    </div>

                    <h3 className="font-bold text-lg text-gray-900 truncate leading-snug" title={p.product_name}>
                      {p.product_name}
                    </h3>

                    {/* Pricing & Stock Details */}
                    <div className="mt-3 grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                      <div>
                        <div className="text-[11px] text-gray-500 font-medium">Selling Price</div>
                        <div className="text-lg font-extrabold text-primary flex items-baseline">
                          ₹{p.price}
                          <span className="text-xs font-normal text-gray-500 ml-1">/{p.unit}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[11px] text-gray-500 font-medium">Available Stock</div>
                        <div className="text-base font-bold text-gray-800">
                          {p.quantity} <span className="text-xs font-normal text-gray-500">{p.unit}</span>
                        </div>
                        {isLowStock && (
                          <div className="text-[10px] font-bold text-amber-600 flex items-center justify-end gap-0.5">
                            <AlertTriangle className="w-2.5 h-2.5" /> Low Stock
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Metadata tags */}
                    <div className="mt-3 space-y-1 text-xs text-gray-500">
                      {p.harvest_date && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>Harvested: <strong className="text-gray-700 font-medium">{p.harvest_date}</strong></span>
                        </div>
                      )}
                      {p.location?.city && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          <span className="truncate">{p.location.city}, {p.location.state}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    
                    {/* Status quick select */}
                    <select
                      value={p.status || 'Draft'}
                      disabled={updatingStatusId === prodIdentifier}
                      onChange={(e) => handleStatusChange(prodIdentifier, e.target.value)}
                      className="text-xs font-semibold py-1.5 px-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="Published">Publish</option>
                      <option value="Draft">Draft</option>
                      <option value="OutOfStock">Out of Stock</option>
                    </select>

                    {/* Button Group */}
                    <div className="flex items-center gap-1">
                      {/* Edit Button */}
                      <Link
                        to={`/farmer/products/edit/${prodIdentifier}`}
                        title="Edit Product Details"
                        className="p-2 rounded-xl text-gray-600 hover:text-amber-600 hover:bg-amber-50 transition-colors border border-gray-100"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Link>

                      {/* QR Code Button */}
                      <button
                        onClick={() => setSelectedProductForQR(p)}
                        title="View QR Code & Traceability"
                        className="p-2 rounded-xl text-gray-600 hover:text-primary hover:bg-primary/10 transition-colors border border-gray-100"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>

                      {/* Public Marketplace Preview */}
                      <Link
                        to={`/product/${p.product_id || p._id || p.id}`}
                        target="_blank"
                        title="View in Marketplace"
                        className="p-2 rounded-xl text-gray-600 hover:text-primary hover:bg-primary/10 transition-colors border border-gray-100"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>

                      {/* Delete Button */}
                      <button
                        onClick={() => setProductToDelete(p)}
                        title="Delete Product"
                        className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors border border-gray-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (

        /* Table Layout */
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/80 text-xs font-semibold uppercase text-gray-500 border-b border-gray-100 tracking-wider">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Harvest Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((p) => {
                  const prodIdentifier = p.product_id || p._id || p.id;
                  const thumb = p.images && p.images.length > 0 ? getProductImageUrl(p.images[0]) : null;

                  return (
                    <tr key={prodIdentifier} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                            {thumb ? (
                              <img src={thumb} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 line-clamp-1">{p.product_name}</div>
                            <div className="text-xs text-gray-400 font-mono">{p.product_id || 'ID-N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-700">{p.category}</span>
                        {p.variety && <span className="text-xs text-gray-400 block">{p.variety}</span>}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">
                        ₹{p.price} <span className="text-xs font-normal text-gray-500">/{p.unit}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900">{p.quantity}</span> {p.unit}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(p.status, p.quantity)}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {p.harvest_date || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/farmer/products/edit/${prodIdentifier}`}
                            title="Edit Product"
                            className="p-1.5 rounded-lg text-gray-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setSelectedProductForQR(p)}
                            title="QR Code"
                            className="p-1.5 rounded-lg text-gray-500 hover:text-primary hover:bg-primary/10 transition-colors"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                          <Link
                            to={`/product/${p.product_id || p._id || p.id}`}
                            target="_blank"
                            title="View Marketplace Link"
                            className="p-1.5 rounded-lg text-gray-500 hover:text-primary hover:bg-primary/10 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setProductToDelete(p)}
                            title="Delete Product"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* QR Code & Blockchain Traceability Modal */}
      {selectedProductForQR && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200 relative">
            <button 
              onClick={() => setSelectedProductForQR(null)}
              className="absolute right-5 top-5 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <div className="w-14 h-14 bg-emerald-50 text-primary rounded-2xl flex items-center justify-center mx-auto mb-3">
                <QrCode className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Product QR & Blockchain Seal</h3>
              <p className="text-xs text-gray-500 mt-1">
                Scan this QR code to view authenticated harvest origin and farm traceability.
              </p>
            </div>

            {/* QR Code SVG */}
            <div className="my-6 p-4 bg-gray-50 rounded-2xl flex flex-col items-center justify-center border border-gray-200">
              <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                <QRCodeSVG 
                  value={`${window.location.origin}/product/${selectedProductForQR.product_id || selectedProductForQR._id || selectedProductForQR.id}`}
                  size={160}
                  level="H"
                  includeMargin={false}
                />
              </div>
              <div className="mt-3 text-center">
                <div className="font-bold text-gray-900 text-sm">{selectedProductForQR.product_name}</div>
                <div className="text-xs font-mono text-primary font-semibold mt-0.5">{selectedProductForQR.product_id || 'ID'}</div>
              </div>
            </div>

            {/* Blockchain Details */}
            <div className="space-y-2 text-xs bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Blockchain Status:</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Immutable
                </span>
              </div>
              {selectedProductForQR.blockchain_hash && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Tx Hash:</span>
                  <div className="flex items-center gap-1 font-mono text-gray-800">
                    <span>{selectedProductForQR.blockchain_hash.substring(0, 10)}...</span>
                    <button 
                      onClick={() => copyToClipboard(selectedProductForQR.blockchain_hash, true)}
                      className="text-gray-400 hover:text-primary"
                    >
                      {copiedHash ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Location:</span>
                <span className="font-medium text-gray-800">
                  {selectedProductForQR.location?.city ? `${selectedProductForQR.location.city}, ${selectedProductForQR.location.state}` : 'Farm Location'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => copyToClipboard(`${window.location.origin}/product/${selectedProductForQR.product_id || selectedProductForQR._id || selectedProductForQR.id}`)}
                className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Link Copied' : 'Copy Public Link'}</span>
              </button>

              <Link
                to={`/product/${selectedProductForQR.product_id || selectedProductForQR._id || selectedProductForQR.id}`}
                target="_blank"
                className="flex-1 py-3 px-4 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 text-sm shadow-md"
              >
                <Eye className="w-4 h-4" />
                <span>Open in Marketplace</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-bold text-gray-900 text-center">Delete Product Listing?</h3>
            <p className="text-sm text-gray-500 text-center mt-2 leading-relaxed">
              Are you sure you want to delete <strong className="text-gray-900 font-semibold">{productToDelete.product_name}</strong>? This action cannot be undone and will remove it from the marketplace.
            </p>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>
              
              <button
                type="button"
                onClick={handleDeleteProduct}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition-colors flex items-center justify-center gap-2 text-sm shadow-md shadow-rose-600/20"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>{isDeleting ? 'Deleting...' : 'Yes, Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
