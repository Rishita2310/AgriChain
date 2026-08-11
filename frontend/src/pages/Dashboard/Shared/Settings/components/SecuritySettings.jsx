import React from 'react';
import { ShieldAlert, MonitorSmartphone, KeyRound, LogOut, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SecuritySettings() {
  
  const handleLogoutAll = () => {
    toast.success('Successfully logged out of all other devices');
  };

  return (
    <div className="animate-in slide-in-from-right-4 duration-300">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Security</h2>
          <p className="text-gray-500 mt-1">Manage your active sessions and security protocols.</p>
        </div>
      </div>

      {/* Authentication Notice */}
      <div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl mb-8 flex gap-4">
        <ShieldAlert className="w-8 h-8 text-blue-600 flex-shrink-0" />
        <div>
          <h3 className="text-lg font-bold text-blue-900 mb-1">Web3 Authentication Active</h3>
          <p className="text-sm text-blue-800 font-medium leading-relaxed max-w-2xl">
            Your AgriChain account is secured entirely by your MetaMask Web3 Wallet. 
            Because you do not use an email/password combination, traditional password resets and 2FA are handled at the blockchain level. 
            <strong> Never share your private keys or seed phrases with anyone.</strong>
          </p>
        </div>
      </div>

      {/* Session Management */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Active Sessions</h3>
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
                <MonitorSmartphone className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-gray-900 flex items-center gap-2">
                  Windows 11 • Chrome 
                  <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Current
                  </span>
                </p>
                <p className="text-sm text-gray-500 font-medium mt-0.5">Mumbai, India • IP: 192.168.1.1</p>
              </div>
            </div>
          </div>

          <div className="p-6 flex justify-between items-center bg-white hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-100 text-gray-400 rounded-2xl">
                <MonitorSmartphone className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-gray-900">MacBook Pro • Safari</p>
                <p className="text-sm text-gray-500 font-medium mt-0.5">Delhi, India • Last active: 2 hours ago</p>
              </div>
            </div>
            <button className="text-red-500 font-bold text-sm hover:underline">Revoke</button>
          </div>

        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={handleLogoutAll}
          className="px-6 py-3 bg-white border border-gray-200 text-gray-700 hover:text-red-600 hover:border-red-200 rounded-xl font-bold shadow-sm transition-all flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Logout Other Devices
        </button>
      </div>
    </div>
  );
}
