import React from 'react';
import { Shield, Eye, Database, Trash2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PrivacySettings({ settings, setSettings }) {
  if (!settings) return null;

  const togglePrivacy = (key) => {
    setSettings({
      ...settings,
      privacy: {
        ...settings.privacy,
        [key]: !settings.privacy[key]
      }
    });
  };

  const setVisibility = (val) => {
    setSettings({
      ...settings,
      privacy: {
        ...settings.privacy,
        profile_visibility: val
      }
    });
  };

  const Toggle = ({ label, desc, isChecked, onChange }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
      <div className="pr-4">
        <p className="font-bold text-gray-900">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed max-w-lg">{desc}</p>
      </div>
      <button 
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          isChecked ? 'bg-primary' : 'bg-gray-200'
        }`}
      >
        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          isChecked ? 'translate-x-5' : 'translate-x-0'
        }`} />
      </button>
    </div>
  );

  const Section = ({ title, icon: Icon, children }) => (
    <div className="mb-8">
      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
        <Icon className="w-4 h-4" /> {title}
      </h3>
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
        {children}
      </div>
    </div>
  );

  const handleDeleteAccount = () => {
    const confirmed = window.confirm("Are you absolutely sure you want to delete your account? This action cannot be undone and will orphan your blockchain transactions.");
    if (confirmed) {
      toast.error("Account deletion request submitted to network admins.");
    }
  };

  const p = settings.privacy;

  return (
    <div className="animate-in slide-in-from-right-4 duration-300">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Privacy Settings</h2>
          <p className="text-gray-500 mt-1">Control your public footprint and data sharing.</p>
        </div>
      </div>

      <Section title="Profile Visibility" icon={Eye}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {['Public', 'Buyers Only', 'Private'].map((val) => (
            <button
              key={val}
              onClick={() => setVisibility(val)}
              className={`p-4 rounded-2xl border-2 transition-all text-center font-bold ${
                p.profile_visibility === val 
                  ? 'border-primary bg-primary/5 text-primary shadow-sm' 
                  : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200 hover:bg-gray-100'
              }`}
            >
              {val}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-4 font-medium">
          <strong>Public</strong>: Anyone can see your profile. <strong>Buyers Only</strong>: Hidden from search engines, visible to logged-in buyers. <strong>Private</strong>: Hidden from everyone except your active orders.
        </p>
      </Section>

      <Section title="Contact Information" icon={Shield}>
        <Toggle label="Share Farm Location" desc="Allow buyers to see your approximate geographical region on maps to calculate shipping." isChecked={p.share_farm_location} onChange={() => togglePrivacy('share_farm_location')} />
        <Toggle label="Show Phone Number" desc="Display your verified phone number on your public profile." isChecked={p.show_phone_number} onChange={() => togglePrivacy('show_phone_number')} />
        <Toggle label="Show Email Address" desc="Allow direct email contact from your public profile." isChecked={p.show_email} onChange={() => togglePrivacy('show_email')} />
      </Section>

      <Section title="Data & Analytics" icon={Database}>
        <Toggle label="Allow Analytics Collection" desc="Share anonymous usage data to help us improve AgriChain." isChecked={p.allow_analytics} onChange={() => togglePrivacy('allow_analytics')} />
        <Toggle label="AI Personalization" desc="Allow our heuristic engine to analyze your history for better product recommendations." isChecked={p.allow_personalized_recommendations} onChange={() => togglePrivacy('allow_personalized_recommendations')} />
      </Section>

      {/* Danger Zone */}
      <div className="mt-12 border-t border-red-100 pt-8">
        <h3 className="text-sm font-bold text-red-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> Danger Zone
        </h3>
        <div className="bg-red-50 border border-red-100 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <h4 className="text-xl font-black text-red-900 mb-1">Delete Account</h4>
            <p className="text-sm text-red-700/80 font-medium max-w-md leading-relaxed">
              Permanently delete your profile, inventory, and unlink your wallet from AgriChain. Blockchain transaction history will remain immutable on Arbitrum.
            </p>
          </div>
          <button 
            onClick={handleDeleteAccount}
            className="flex-shrink-0 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-sm transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-5 h-5" />
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
