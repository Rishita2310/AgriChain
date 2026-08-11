import React, { useEffect, useState } from 'react';
import { adminService } from '../../../services/admin.service';
import { productService } from '../../../services/product.service';
import { Search, Filter, Box, Edit, Trash2, Loader2, Tag, CheckCircle, XCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [updating, setUpdating] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await adminService.getProducts();
      setProducts(data.products || data || []);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      setUpdating(true);
      const id = editingProduct._id?.$oid || editingProduct._id || editingProduct.product_id;
      await productService.updateStatus(id, editingProduct.status);
      toast.success('Product status updated successfully');
      
      // Update local state
      setProducts(products.map(p => {
        const pid = p._id?.$oid || p._id || p.product_id;
        if (pid === id) return { ...p, status: editingProduct.status };
        return p;
      }));
      setEditingProduct(null);
    } catch (error) {
      toast.error('Failed to update product status');
    } finally {
      setUpdating(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const searchLower = search.toLowerCase();
    const titleMatch = p.product_name ? p.product_name.toLowerCase().includes(searchLower) : false;
    const farmerMatch = p.farmer_name ? p.farmer_name.toLowerCase().includes(searchLower) : false;
    const matchesSearch = titleMatch || farmerMatch;
    const matchesStatus = statusFilter ? p.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Product Management</h1>
          <p className="text-gray-400 mt-1 font-medium">Monitor and manage all agricultural products listed on the platform.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded-xl font-bold shadow-sm transition-colors flex items-center gap-2">
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 sm:p-6 border-b border-white/10 flex flex-col sm:flex-row justify-between gap-4 bg-black/20">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by product title or farmer..."
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
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Out of Stock">Out of Stock</option>
              <option value="Hidden">Hidden</option>
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
                  <th className="p-4 pl-6">Product Info</th>
                  <th className="p-4">Farmer</th>
                  <th className="p-4">Price / Qty</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Listed Date</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredProducts.length === 0 ? (
                  <tr><td colSpan="6" className="p-8 text-center text-gray-500">No products found.</td></tr>
                ) : filteredProducts.map((product) => (
                  <tr key={product._id?.$oid || product._id || product.product_id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/10 shrink-0">
                          <Box className="w-5 h-5 opacity-70" />
                        </div>
                        <div>
                          <p className="font-bold text-white line-clamp-1">{product.product_name || 'Unknown Product'}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <Tag className="w-3 h-3" /> {product.category || 'Uncategorized'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-300 font-medium">
                      {product.farmer_name || 'Unknown'}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-mono text-white font-bold">₹{product.price}</span>
                        <span className="text-xs text-gray-500">{product.quantity} {product.unit} left</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded w-fit ${
                        product.status === 'Active' || !product.status ? 'text-emerald-400 bg-emerald-500/20 border border-emerald-500/30' : 
                        'text-orange-400 bg-orange-500/20 border border-orange-500/30'
                      }`}>
                        {product.status === 'Active' || !product.status ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />} 
                        {product.status || 'Active'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-400 font-medium">
                      {product.created_at ? new Date(product.created_at).toLocaleDateString() : '---'}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setEditingProduct(product)}
                          className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" 
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Pagination mock */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between text-sm text-gray-400 font-medium">
          <p>Showing {filteredProducts.length} products</p>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-white/10 text-white rounded hover:bg-white/5 transition-colors">Prev</button>
            <button className="px-3 py-1 bg-primary text-gray-900 rounded font-bold">1</button>
            <button className="px-3 py-1 border border-white/10 text-white rounded hover:bg-white/5 transition-colors">Next</button>
          </div>
        </div>
      </div>

      {/* Edit Status Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#121212] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/40">
              <h2 className="text-xl font-bold text-white">Edit Product Status</h2>
              <button 
                onClick={() => setEditingProduct(null)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateStatus} className="p-6 flex-1 bg-[#121212]">
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-400 mb-2">Product Name</label>
                <input 
                  type="text" 
                  disabled
                  value={editingProduct.product_name || editingProduct.title || 'Unknown'}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 font-medium opacity-70 cursor-not-allowed"
                />
              </div>

              <div className="mb-8">
                <label className="block text-sm font-bold text-gray-400 mb-2">Status</label>
                <select 
                  value={editingProduct.status || 'Active'}
                  onChange={(e) => setEditingProduct({ ...editingProduct, status: e.target.value })}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-white font-medium"
                >
                  <option value="Active">Active</option>
                  <option value="Published">Published</option>
                  <option value="Out of Stock">Out of Stock</option>
                  <option value="Hidden">Hidden</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={updating}
                  className="flex-1 px-4 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold transition-colors flex items-center justify-center shadow-sm disabled:opacity-50"
                >
                  {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
