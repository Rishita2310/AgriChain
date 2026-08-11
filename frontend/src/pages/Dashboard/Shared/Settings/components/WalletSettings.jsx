import React from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { Wallet, ShieldCheck, Zap, LogOut, Copy, ExternalLink, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WalletSettings() {
  const { address, isConnected, connector } = useAccount();
  const { disconnect } = useDisconnect();

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success('Wallet address copied to clipboard');
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
        <Wallet className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-xl font-bold text-gray-900">Wallet Disconnected</h3>
        <p className="text-gray-500 mt-2 max-w-sm">Please log in again using MetaMask to manage your blockchain wallet settings.</p>
      </div>
    );
  }

  return (
    <div className="animate-in slide-in-from-right-4 duration-300">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Wallet Settings</h2>
        <p className="text-gray-500 mt-1">Manage your connected Web3 identity.</p>
      </div>

      <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl mb-8">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Wallet className="w-48 h-48" />
        </div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-sm font-bold text-gray-400 mb-1">Connected Network</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <h3 className="text-xl font-bold">Arbitrum Sepolia</h3>
              </div>
            </div>
            <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 px-3 py-1.5 rounded-xl flex items-center gap-2">
              <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" className="w-5 h-5" />
              <span className="text-sm font-bold">{connector?.name || 'Injected'}</span>
            </div>
          </div>

          <div className="mb-8">
            <p className="text-sm font-bold text-gray-400 mb-2">Wallet Address</p>
            <div className="flex items-center gap-3">
              <p className="text-2xl sm:text-3xl font-mono font-bold tracking-tight break-all">
                {address?.substring(0, 6)}...{address?.substring(address.length - 4)}
              </p>
              <button onClick={handleCopy} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-gray-300 hover:text-white group">
                <Copy className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 border-t border-gray-800 pt-6">
            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 px-4 py-2 rounded-xl text-sm font-bold border border-emerald-400/20">
              <ShieldCheck className="w-4 h-4" /> Cryptographically Verified
            </div>
            <a 
              href={`https://sepolia.arbiscan.io/address/${address}`} 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-2 text-gray-300 hover:text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors"
            >
              View on Arbiscan <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Security Actions */}
      <div className="bg-red-50 rounded-3xl p-6 border border-red-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-red-900 mb-1">Disconnect Wallet</h3>
          <p className="text-sm text-red-700/80 font-medium">This will log you out of your current AgriChain session.</p>
        </div>
        <button 
          onClick={() => disconnect()}
          className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-sm transition-colors flex items-center gap-2 flex-shrink-0"
        >
          <LogOut className="w-5 h-5" /> Disconnect
        </button>
      </div>

    </div>
  );
}
