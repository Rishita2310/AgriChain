import React, { useEffect, useState } from 'react';
import { adminService } from '../../../services/admin.service';
import { Users, Search, Filter, MoreVertical, ShieldCheck, Ban, Edit, Trash2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await adminService.getUsers(roleFilter);
        setUsers(data.users);
      } catch (err) {
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [roleFilter]);

  const filteredUsers = users.filter(u => 
    (u.full_name?.toLowerCase().includes(search.toLowerCase())) || 
    (u.wallet_address?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">User Management</h1>
          <p className="text-gray-400 mt-1 font-medium">Manage Farmers, Buyers, and Admins across the platform.</p>
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
              placeholder="Search by name or wallet..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-white transition-all font-medium placeholder-gray-500"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="py-2.5 pl-4 pr-10 bg-black/50 text-white border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium"
            >
              <option value="">All Roles</option>
              <option value="Farmer">Farmers</option>
              <option value="Buyer">Buyers</option>
              <option value="Admin">Admins</option>
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
                  <th className="p-4 pl-6">User</th>
                  <th className="p-4">Wallet</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Joined</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredUsers.length === 0 ? (
                  <tr><td colSpan="6" className="p-8 text-center text-gray-500">No users found.</td></tr>
                ) : filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-bold border border-white/10">
                          {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-white">{user.full_name || 'Unknown'}</p>
                          <p className="text-xs text-gray-400">{user.email || 'No email'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-sm text-gray-400">
                      {user.wallet_address.substring(0, 6)}...{user.wallet_address.substring(user.wallet_address.length - 4)}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        user.role === 'Farmer' ? 'bg-green-100 text-green-700' : 
                        user.role === 'Buyer' ? 'bg-purple-100 text-purple-700' : 
                        'bg-red-100 text-red-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded w-fit">
                        <ShieldCheck className="w-3 h-3" /> Active
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-400 font-medium">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-orange-400 hover:bg-orange-500/10 rounded-lg transition-colors" title="Suspend">
                          <Ban className="w-4 h-4" />
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
          <p>Showing {filteredUsers.length} users</p>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-white/10 text-white rounded hover:bg-white/5 transition-colors">Prev</button>
            <button className="px-3 py-1 bg-primary text-gray-900 rounded font-bold">1</button>
            <button className="px-3 py-1 border border-white/10 text-white rounded hover:bg-white/5 transition-colors">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
