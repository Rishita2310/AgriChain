import React, { useState } from 'react';
import { Settings, Shield, Bell, Key, Database, Save, Loader2, Server } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    systemName: 'AgriChain Node',
    maintenanceMode: false,
    maxTxPerBlock: 500,
    alertEmail: 'admin@agrichain.network',
    autoApproveFarmers: false
  });

  const handleSave = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success('Admin settings updated successfully');
    }, 800);
  };

  const Section = ({ title, icon: Icon, description, children }) => (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-sm overflow-hidden mb-6">
      <div className="p-6 border-b border-white/10 bg-black/20 flex items-start gap-4">
        <div className="p-3 bg-white/10 rounded-xl shadow-sm border border-white/10">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>
      <div className="p-6 space-y-6">
        {children}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Settings className="w-8 h-8 text-primary" /> Platform Settings
          </h1>
          <p className="text-gray-400 mt-2 font-medium">Configure global platform parameters and node settings.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold shadow-sm shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Save Changes
        </button>
      </div>

      <Section 
        title="System Configuration" 
        icon={Server} 
        description="Core platform identity and operational modes."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-300">System Name</label>
            <input 
              type="text" 
              value={settings.systemName}
              onChange={(e) => setSettings({...settings, systemName: e.target.value})}
              className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 text-white outline-none transition-all font-medium"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-300">Admin Alert Email</label>
            <input 
              type="email" 
              value={settings.alertEmail}
              onChange={(e) => setSettings({...settings, alertEmail: e.target.value})}
              className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 text-white outline-none transition-all font-medium"
            />
          </div>
          
          <div className="col-span-1 md:col-span-2 pt-2 border-t border-white/10 flex items-center justify-between">
            <div>
              <p className="font-bold text-white">Maintenance Mode</p>
              <p className="text-sm text-gray-400">Temporarily disable non-admin logins and pause smart contracts.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
              />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 peer-checked:after:bg-white after:border-white/10 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
            </label>
          </div>
        </div>
      </Section>

      <Section 
        title="Network Parameters" 
        icon={Database} 
        description="Blockchain node and rate limiting settings."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-300">Max Transactions / Block</label>
            <input 
              type="number" 
              value={settings.maxTxPerBlock}
              onChange={(e) => setSettings({...settings, maxTxPerBlock: parseInt(e.target.value) || 0})}
              className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 text-white outline-none transition-all font-medium"
            />
          </div>
        </div>
      </Section>

      <Section 
        title="Security & Access" 
        icon={Shield} 
        description="Manage permissions and automated security protocols."
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-white">Auto-Approve Verified Farmers</p>
            <p className="text-sm text-gray-400">Automatically grant seller status when farmers complete 100% profile verification.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={settings.autoApproveFarmers}
              onChange={(e) => setSettings({...settings, autoApproveFarmers: e.target.checked})}
            />
            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 peer-checked:after:bg-white after:border-white/10 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
      </Section>

    </div>
  );
}
