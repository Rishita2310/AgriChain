import React, { useState, useEffect } from 'react';
import { settingsService } from '../../../../services/settings.service';
import { useAuthStore } from '../../../../store/useAuthStore';
import { 
  Globe, Moon, Bell, Wallet, ShieldCheck, Eye, Save, Loader2 
} from 'lucide-react';
import toast from 'react-hot-toast';

import LanguageSettings from './components/LanguageSettings';
import ThemeSettings from './components/ThemeSettings';
import NotificationSettings from './components/NotificationSettings';
import WalletSettings from './components/WalletSettings';
import SecuritySettings from './components/SecuritySettings';
import PrivacySettings from './components/PrivacySettings';

const TABS = [
  { id: 'language', label: 'Language', icon: Globe },
  { id: 'theme', label: 'Theme', icon: Moon },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'security', label: 'Security', icon: ShieldCheck },
  { id: 'privacy', label: 'Privacy', icon: Eye },
];

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('language');
  const [settings, setSettings] = useState(null);
  const [originalSettings, setOriginalSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await settingsService.getSettings();
        setSettings(data);
        setOriginalSettings(data);
      } catch (err) {
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const hasUnsavedChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings);

  const handleSave = async () => {
    try {
      setSaving(true);
      await settingsService.updateSettings(settings);
      setOriginalSettings(settings);
      toast.success('Settings Updated Successfully');
    } catch (err) {
      toast.error('Unable to Save Settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading preferences...</p>
      </div>
    );
  }

  const renderContent = () => {
    switch(activeTab) {
      case 'language': return <LanguageSettings settings={settings} setSettings={setSettings} />;
      case 'theme': return <ThemeSettings settings={settings} setSettings={setSettings} />;
      case 'notifications': return <NotificationSettings settings={settings} setSettings={setSettings} />;
      case 'wallet': return <WalletSettings />;
      case 'security': return <SecuritySettings />;
      case 'privacy': return <PrivacySettings settings={settings} setSettings={setSettings} />;
      default: return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Settings</h1>
          <p className="text-gray-500 mt-1 font-medium">Manage your account preferences, wallet, security, and privacy.</p>
        </div>
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="hidden sm:flex items-center gap-3 pr-4 border-r border-gray-100">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{user?.full_name || 'AgriChain User'}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
          
          <button 
            onClick={handleSave}
            disabled={!hasUnsavedChanges || saving}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              hasUnsavedChanges 
                ? 'bg-primary hover:bg-primary/90 text-gray-900 shadow-sm' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Changes
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0 space-y-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all ${
                  isActive 
                    ? 'bg-gray-900 text-white shadow-md shadow-gray-900/20' 
                    : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent hover:border-gray-200'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-gray-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right Content */}
        <div className="flex-1 bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm min-h-[500px]">
          {renderContent()}
        </div>
      </div>

    </div>
  );
}
