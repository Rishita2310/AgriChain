import React, { useEffect, useState } from 'react';
import { adminService } from '../../../services/admin.service';
import { ShieldCheck, Server, AlertCircle, RefreshCw, Box, Zap, ExternalLink, ShieldAlert, Loader2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SmartContractStatus() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchContracts = async () => {
    try {
      setRefreshing(true);
      const data = await adminService.getSmartContracts();
      setContracts(data.contracts);
    } catch (err) {
      toast.error('Failed to connect to blockchain node');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchContracts();
    const interval = setInterval(fetchContracts, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Server className="w-12 h-12 text-primary animate-pulse mb-4" />
        <p className="text-gray-500 font-medium">Syncing with Arbitrum node...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Server className="w-8 h-8 text-primary" /> Smart Contract Status
          </h1>
          <p className="text-gray-400 mt-2 font-medium">Monitor real-time health and metrics of deployed Arbitrum Stylus contracts.</p>
        </div>
        <button 
          onClick={fetchContracts}
          disabled={refreshing}
          className="px-5 py-2.5 bg-white/5 border border-white/10 hover:border-primary text-white hover:bg-white/10 rounded-xl font-bold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Status
        </button>
      </div>

      {/* Global Network Status */}
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 sm:p-8 mb-8 flex flex-col md:flex-row justify-between items-center gap-6 border border-white/10 shadow-[0_0_50px_rgba(16,185,129,0.05)] relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 bg-black/50 border border-gray-700 rounded-2xl flex items-center justify-center relative">
            <div className="absolute inset-0 border-2 border-primary rounded-2xl animate-ping opacity-20"></div>
            <Server className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="text-gray-400 font-medium text-sm mb-1">Connected Network</p>
            <h2 className="text-2xl font-black text-white flex items-center gap-2 tracking-tight">
              Arbitrum Sepolia
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] uppercase tracking-widest px-2 py-1 rounded font-bold">Live</span>
            </h2>
          </div>
        </div>
        <div className="flex gap-4 md:gap-8 relative z-10 w-full md:w-auto">
          <div className="flex-1 md:flex-none bg-black/30 p-4 rounded-2xl border border-gray-800 text-center">
            <p className="text-gray-400 text-xs font-bold mb-1 uppercase tracking-wider">L2 Block</p>
            <p className="text-xl font-mono text-white font-bold">{contracts[0]?.current_block || '---'}</p>
          </div>
          <div className="flex-1 md:flex-none bg-black/30 p-4 rounded-2xl border border-gray-800 text-center">
            <p className="text-gray-400 text-xs font-bold mb-1 uppercase tracking-wider">Ping</p>
            <p className="text-xl font-mono text-emerald-400 font-bold flex justify-center items-center gap-1">
              <Zap className="w-4 h-4" /> 14ms
            </p>
          </div>
        </div>
      </div>

      {/* Contracts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {contracts.map((contract, i) => (
          <div key={i} className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-white/10 flex justify-between items-start bg-black/20">
              <div>
                <h3 className="text-xl font-black text-white mb-1">{contract.name}</h3>
                <p className="text-xs font-mono text-gray-400 flex items-center gap-1 bg-black/50 px-2 py-1 rounded-md w-fit border border-white/5">
                  {contract.address} <ExternalLink className="w-3 h-3 cursor-pointer hover:text-primary" />
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-sm ${
                contract.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {contract.status === 'Active' ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                {contract.status}
              </span>
            </div>
            
            <div className="p-6 grid grid-cols-2 gap-4 flex-1">
              <div className="bg-black/40 rounded-2xl p-4 border border-white/10">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Box className="w-3 h-3" /> Gas Used
                </p>
                <p className="text-lg font-mono font-bold text-white">{contract.gas_used}</p>
              </div>
              <div className="bg-black/40 rounded-2xl p-4 border border-white/10">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Last Tx
                </p>
                <p className="text-sm font-medium text-white">
                  {new Date(contract.last_transaction).toLocaleTimeString()}
                </p>
              </div>
              <div className="col-span-2 bg-black/40 rounded-2xl p-4 border border-white/10 flex justify-between items-center">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Owner</p>
                <p className="text-sm font-mono text-white font-medium bg-white/10 px-2 py-1 rounded shadow-sm border border-white/5">{contract.owner}</p>
              </div>
            </div>

            <div className="p-4 border-t border-white/10 flex gap-2 bg-black/20">
              <button 
                onClick={() => window.open(`https://sepolia.arbiscan.io/address/${contract.address}`, '_blank')}
                className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-2 rounded-xl text-sm transition-colors shadow-sm"
              >
                View on Arbiscan
              </button>
              {contract.status === 'Active' ? (
                <button className="flex-1 bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 text-orange-400 font-bold py-2 rounded-xl text-sm transition-colors shadow-sm">
                  Pause Contract
                </button>
              ) : (
                <button className="flex-1 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 font-bold py-2 rounded-xl text-sm transition-colors shadow-sm">
                  Resume Contract
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
