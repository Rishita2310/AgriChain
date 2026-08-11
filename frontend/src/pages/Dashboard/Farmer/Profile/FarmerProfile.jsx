import React, { useState } from 'react';
import { useAuthStore } from '../../../../store/useAuthStore';
import api from '@/services/api';
import { 
  User, MapPin, Phone, Mail, Home, ShieldCheck, 
  Loader2, Camera, Sprout, Tractor, Compass, CheckCircle2,
  Calendar, Award
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getProductImageUrl } from '@/services/product.service';

export default function FarmerProfile() {
  const { user, initAuth } = useAuthStore();
  const token = localStorage.getItem('agrichain_token');

  const [savingPersonal, setSavingPersonal] = useState(false);
  const [savingFarm, setSavingFarm] = useState(false);
  
  const [personalInfo, setPersonalInfo] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone_number: user?.phone_number || '',
    country: user?.country || '',
    state: user?.state || '',
    city: user?.city || '',
    zip_code: user?.zip_code || '',
    profile_photo: user?.profile_photo || '',
  });

  const [uploadingImage, setUploadingImage] = useState(false);

  const [farmInfo, setFarmInfo] = useState({
    farm_name: user?.farmer_details?.farm_name || '',
    farm_address: user?.farmer_details?.farm_address || '',
    farm_size: user?.farmer_details?.farm_size || 0,
    primary_crops: user?.farmer_details?.primary_crops || [],
    experience: user?.farmer_details?.experience || '',
    organic_farming: user?.farmer_details?.organic_farming || false,
  });

  const refreshProfile = async () => {
    try {
      const res = await api.get('/auth/profile');
      initAuth(token, res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePersonalSubmit = async (e) => {
    e.preventDefault();
    setSavingPersonal(true);
    try {
      await api.put('/farmer/profile/personal', personalInfo);
      toast.success("Personal Information Updated");
      await refreshProfile();
    } catch (err) {
      toast.error(err.response?.data?.error || "Update failed");
    } finally {
      setSavingPersonal(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploadingImage(true);
    try {
      const res = await api.post('/farmer/profile/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPersonalInfo({ ...personalInfo, profile_photo: res.data.url });
      toast.success("Profile photo uploaded!");
    } catch (err) {
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFarmSubmit = async (e) => {
    e.preventDefault();
    setSavingFarm(true);
    try {
      await api.put('/farmer/profile/farm', {
        ...farmInfo,
        farm_size: parseFloat(farmInfo.farm_size) || 0
      });
      toast.success("Farm Details Updated");
      await refreshProfile();
    } catch (err) {
      toast.error(err.response?.data?.error || "Update failed");
    } finally {
      setSavingFarm(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-base text-gray-500 mt-2">Manage your profile details and farm operations.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Sidebar: Profile Summary */}
        <div className="w-full lg:w-1/3 xl:w-1/4">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm sticky top-6">
            <div className="flex flex-col items-center">
              <div className="relative group w-36 h-36 rounded-full border border-gray-100 shadow-sm bg-gray-50 overflow-hidden mb-5">
                <img 
                  src={personalInfo.profile_photo ? getProductImageUrl(personalInfo.profile_photo) : 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'} 
                  alt="Profile" 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <label className="absolute inset-0 bg-black/50 hidden group-hover:flex flex-col items-center justify-center cursor-pointer transition-all">
                  <Camera className="w-6 h-6 text-white mb-1" />
                  <span className="text-white text-xs font-bold uppercase tracking-wider">Change</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                </label>
                {uploadingImage && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 text-center">{personalInfo.full_name || 'Farmer Profile'}</h2>
              <div className="flex items-center gap-1.5 mt-3 px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-bold">
                <CheckCircle2 className="w-4 h-4" /> Verified Farmer
              </div>
            </div>

            <hr className="my-6 border-gray-100" />

            <div className="space-y-5">
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-gray-500 uppercase">Blockchain ID</span>
                <div className="flex items-center gap-2 text-base text-gray-700 font-mono bg-gray-50 p-2.5 rounded-lg border border-gray-100 break-all">
                  <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                  {user?.wallet_address || 'Not Connected'}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-gray-500 uppercase">Location</span>
                <div className="flex items-center gap-2 text-base text-gray-700">
                  <MapPin className="w-5 h-5 text-gray-400 shrink-0" />
                  {personalInfo.city && personalInfo.state ? `${personalInfo.city}, ${personalInfo.state}` : 'Not specified'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Area: Forms */}
        <div className="w-full lg:w-2/3 xl:w-3/4 space-y-8">
          
          {/* Personal Info Form */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
              <p className="text-base text-gray-500 mt-1">Update your contact details and location.</p>
            </div>
            <div className="p-8">
              <form onSubmit={handlePersonalSubmit} className="space-y-6">
                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-1.5">Full Name</label>
                  <input 
                    type="text" 
                    value={personalInfo.full_name} 
                    onChange={e => setPersonalInfo({...personalInfo, full_name: e.target.value})} 
                    className="w-full bg-white border border-gray-300 text-gray-900 text-base rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" 
                    placeholder="John Doe"
                    required 
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-base font-semibold text-gray-700 mb-1.5">Email Address</label>
                    <input 
                      type="email" 
                      value={personalInfo.email} 
                      onChange={e => setPersonalInfo({...personalInfo, email: e.target.value})} 
                      className="w-full bg-white border border-gray-300 text-gray-900 text-base rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" 
                      placeholder="john@example.com"
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-base font-semibold text-gray-700 mb-1.5">Phone Number</label>
                    <input 
                      type="text" 
                      value={personalInfo.phone_number} 
                      onChange={e => setPersonalInfo({...personalInfo, phone_number: e.target.value})} 
                      className="w-full bg-white border border-gray-300 text-gray-900 text-base rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" 
                      placeholder="+1 234 567 890"
                      required 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-base font-semibold text-gray-700 mb-1.5">State</label>
                    <input 
                      type="text" 
                      value={personalInfo.state} 
                      onChange={e => setPersonalInfo({...personalInfo, state: e.target.value})} 
                      className="w-full bg-white border border-gray-300 text-gray-900 text-base rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" 
                      placeholder="California"
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-base font-semibold text-gray-700 mb-1.5">City</label>
                    <input 
                      type="text" 
                      value={personalInfo.city} 
                      onChange={e => setPersonalInfo({...personalInfo, city: e.target.value})} 
                      className="w-full bg-white border border-gray-300 text-gray-900 text-base rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" 
                      placeholder="Sacramento"
                      required 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-base font-semibold text-gray-700 mb-1.5">Country</label>
                    <input 
                      type="text" 
                      value={personalInfo.country} 
                      onChange={e => setPersonalInfo({...personalInfo, country: e.target.value})} 
                      className="w-full bg-white border border-gray-300 text-gray-900 text-base rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" 
                      placeholder="USA"
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-base font-semibold text-gray-700 mb-1.5">Zip Code</label>
                    <input 
                      type="text" 
                      value={personalInfo.zip_code} 
                      onChange={e => setPersonalInfo({...personalInfo, zip_code: e.target.value})} 
                      className="w-full bg-white border border-gray-300 text-gray-900 text-base rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" 
                      placeholder="90210"
                      required 
                    />
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end">
                  <button 
                    type="submit" 
                    disabled={savingPersonal} 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-base font-bold px-6 py-3 rounded-lg transition-colors disabled:opacity-70 flex items-center gap-2"
                  >
                    {savingPersonal ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                    {savingPersonal ? 'Saving...' : 'Save Personal Info'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Farm Info Form */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900">Farm Operations</h3>
              <p className="text-base text-gray-500 mt-1">Details about your agricultural business.</p>
            </div>
            
            <div className="p-8">
              <form onSubmit={handleFarmSubmit} className="space-y-6">
                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-1.5">Farm Name</label>
                  <input 
                    type="text" 
                    value={farmInfo.farm_name} 
                    onChange={e => setFarmInfo({...farmInfo, farm_name: e.target.value})} 
                    className="w-full bg-white border border-gray-300 text-gray-900 text-base rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" 
                    placeholder="Green Acres Farm"
                    required 
                  />
                </div>

                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-1.5">Full Farm Address</label>
                  <textarea 
                    value={farmInfo.farm_address} 
                    onChange={e => setFarmInfo({...farmInfo, farm_address: e.target.value})} 
                    className="w-full bg-white border border-gray-300 text-gray-900 text-base rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none" 
                    rows="3" 
                    placeholder="123 Farm Road..."
                    required 
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-base font-semibold text-gray-700 mb-1.5">Size (Acres)</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      value={farmInfo.farm_size} 
                      onChange={e => setFarmInfo({...farmInfo, farm_size: e.target.value})} 
                      className="w-full bg-white border border-gray-300 text-gray-900 text-base rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" 
                      placeholder="100"
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-base font-semibold text-gray-700 mb-1.5">Primary Crops</label>
                    <input 
                      type="text" 
                      value={farmInfo.primary_crops.join(', ')} 
                      onChange={e => setFarmInfo({...farmInfo, primary_crops: e.target.value.split(',').map(c => c.trim()).filter(Boolean)})} 
                      className="w-full bg-white border border-gray-300 text-gray-900 text-base rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" 
                      placeholder="Wheat, Corn..."
                      required 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-base font-semibold text-gray-700 mb-1.5">Farming Experience</label>
                    <input 
                      type="text" 
                      value={farmInfo.experience} 
                      onChange={e => setFarmInfo({...farmInfo, experience: e.target.value})} 
                      className="w-full bg-white border border-gray-300 text-gray-900 text-base rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" 
                      placeholder="e.g. 5 Years"
                      required 
                    />
                  </div>
                  <div className="flex items-center pt-7">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className={`w-12 h-7 rounded-full relative transition-colors ${farmInfo.organic_farming ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                        <div className={`w-6 h-6 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${farmInfo.organic_farming ? 'translate-x-5.5 left-0.5' : 'left-0.5'}`}></div>
                      </div>
                      <input 
                        type="checkbox" 
                        className="hidden"
                        checked={farmInfo.organic_farming}
                        onChange={e => setFarmInfo({...farmInfo, organic_farming: e.target.checked})}
                      />
                      <span className="text-base font-semibold text-gray-700">Practices Organic Farming</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button 
                    type="submit" 
                    disabled={savingFarm} 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-base font-bold px-6 py-3 rounded-lg transition-colors disabled:opacity-70 flex items-center gap-2"
                  >
                    {savingFarm ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                    {savingFarm ? 'Saving...' : 'Update Farm Details'}
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
