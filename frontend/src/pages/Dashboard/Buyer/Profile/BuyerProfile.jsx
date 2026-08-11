import React, { useState } from 'react';
import { useAuthStore } from '../../../../store/useAuthStore';
import { User, Mail, MapPin, Phone, ShieldCheck, Wallet, Edit3, X, Loader2, Globe, Languages } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '@/services/api';

export default function BuyerProfile() {
  const { user, token, initAuth } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone_number: user?.phone_number || '',
    country: user?.country || '',
    state: user?.state || '',
    city: user?.city || '',
    preferred_language: user?.preferred_language || 'English',
  });

  const openEditModal = () => {
    // Sync form with latest user data
    setForm({
      full_name: user?.full_name || '',
      email: user?.email || '',
      phone_number: user?.phone_number || '',
      country: user?.country || '',
      state: user?.state || '',
      city: user?.city || '',
      preferred_language: user?.preferred_language || 'English',
    });
    setIsEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!form.full_name.trim()) {
      toast.error('Full name is required');
      return;
    }
    if (!form.email.trim()) {
      toast.error('Email is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.put('/auth/profile', form);

      // Re-fetch the updated profile
      const profileRes = await api.get('/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      initAuth(token, profileRes.data);

      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const InfoRow = ({ icon: Icon, label, value, iconColor = 'text-gray-400' }) => (
    <div className="flex items-center gap-3 text-gray-600">
      <Icon className={`w-5 h-5 ${iconColor} shrink-0`} />
      <div className="min-w-0">
        <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">{label}</p>
        <span className="text-sm font-medium text-gray-700 break-all">{value || '—'}</span>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 relative min-h-screen">
      {/* Ambient background blur */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-400/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[30%] h-[50%] rounded-full bg-blue-300/10 blur-[100px] pointer-events-none" />
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Profile</h1>
          <p className="text-gray-500 font-medium mt-1">Manage your personal information and preferences.</p>
        </div>
        <button 
          onClick={openEditModal}
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-sm"
        >
          <Edit3 className="w-4 h-4" /> Edit
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        {/* Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="col-span-1 bg-white/80 backdrop-blur-xl rounded-[32px] p-8 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center text-center"
        >
          <div className="w-32 h-32 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-5xl mb-6 shadow-inner ring-4 ring-emerald-50">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'B'}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{user?.full_name || 'Buyer User'}</h2>
          <div className="flex items-center gap-1.5 text-emerald-600 font-medium bg-emerald-50 px-3 py-1 rounded-full text-sm mb-6">
            <ShieldCheck className="w-4 h-4" /> Verified Buyer
          </div>
          
          <div className="w-full h-px bg-gray-100 mb-6"></div>
          
          <div className="w-full flex flex-col gap-4 text-left">
            <InfoRow icon={Mail} label="Email" value={user?.email} />
            <InfoRow icon={Phone} label="Phone" value={user?.phone_number} />
            <InfoRow 
              icon={MapPin} 
              label="Location" 
              value={[user?.city, user?.state, user?.country].filter(Boolean).join(', ') || null} 
            />
            <InfoRow icon={Languages} label="Language" value={user?.preferred_language} />
          </div>
        </motion.div>

        {/* Details & Settings */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="col-span-1 md:col-span-2 flex flex-col gap-6"
        >
          {/* Wallet Section */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[32px] p-8 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_40px_rgba(16,185,129,0.1)] transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <Wallet className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Connected Wallet</h3>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
              <p className="text-sm text-gray-500 font-medium mb-1">Wallet Address</p>
              <p className="text-gray-900 font-mono font-bold break-all">{user?.wallet_address}</p>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[32px] p-8 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Preferences</h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-500">Receive order updates and promotions via email.</p>
                </div>
                <div className="w-12 h-6 bg-emerald-500 rounded-full relative cursor-pointer">
                  <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
                </div>
              </div>
              
              <div className="w-full h-px bg-gray-100"></div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900">SMS Notifications</p>
                  <p className="text-sm text-gray-500">Receive delivery updates via SMS.</p>
                </div>
                <div className="w-12 h-6 bg-gray-200 rounded-full relative cursor-pointer">
                  <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5 shadow-sm"></div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white/95 backdrop-blur-xl rounded-[32px] w-full max-w-lg p-8 shadow-2xl relative border border-white"
            >
              <button 
                onClick={() => setIsEditing(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-primary/10 rounded-xl">
                  <Edit3 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
                  <p className="text-sm text-gray-500">Update your personal information</p>
                </div>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Full Name *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-gray-400" />
                      </div>
                      <input 
                        type="text" 
                        required 
                        value={form.full_name} 
                        onChange={e => setForm({...form, full_name: e.target.value})} 
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                        placeholder="Your full name" 
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Email *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-gray-400" />
                      </div>
                      <input 
                        type="email" 
                        required 
                        value={form.email} 
                        onChange={e => setForm({...form, email: e.target.value})} 
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                        placeholder="you@example.com" 
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Phone Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-4 w-4 text-gray-400" />
                      </div>
                      <input 
                        type="text" 
                        value={form.phone_number} 
                        onChange={e => setForm({...form, phone_number: e.target.value})} 
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                        placeholder="+1 234 567 890" 
                      />
                    </div>
                  </div>

                  {/* Country */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Country</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Globe className="h-4 w-4 text-gray-400" />
                      </div>
                      <input 
                        type="text" 
                        value={form.country} 
                        onChange={e => setForm({...form, country: e.target.value})} 
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                        placeholder="India" 
                      />
                    </div>
                  </div>

                  {/* State */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">State</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-4 w-4 text-gray-400" />
                      </div>
                      <input 
                        type="text" 
                        value={form.state} 
                        onChange={e => setForm({...form, state: e.target.value})} 
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                        placeholder="Maharashtra" 
                      />
                    </div>
                  </div>

                  {/* City */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">City</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-4 w-4 text-gray-400" />
                      </div>
                      <input 
                        type="text" 
                        value={form.city} 
                        onChange={e => setForm({...form, city: e.target.value})} 
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                        placeholder="Mumbai" 
                      />
                    </div>
                  </div>

                  {/* Language */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Preferred Language</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Languages className="h-4 w-4 text-gray-400" />
                      </div>
                      <input 
                        type="text" 
                        value={form.preferred_language} 
                        onChange={e => setForm({...form, preferred_language: e.target.value})} 
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                        placeholder="English" 
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                  <button 
                    type="button" 
                    onClick={() => setIsEditing(false)} 
                    className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
