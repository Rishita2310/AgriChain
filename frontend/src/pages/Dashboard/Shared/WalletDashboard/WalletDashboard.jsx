import React, { useEffect, useState } from 'react';
import { walletService } from '../../../../services/wallet.service';
import { Wallet, Activity, ArrowUpRight, ArrowDownRight, RefreshCw, Loader2, Search, ExternalLink, QrCode, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

import { useAccount, useBalance } from 'wagmi';
import { formatEther } from 'viem';

export default function WalletDashboard() {
  const { address: wagmiAddress, isConnected } = useAccount();
  const { data: wagmiBalance } = useBalance({ address: wagmiAddress });

  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  const fetchAll = async () => {
    try {
      setRefreshing(true);
      const [bal, txs, stats] = await Promise.all([
        walletService.getBalance(),
        walletService.getTransactions(),
        walletService.getAnalytics()
      ]);
      setBalance(bal);
      setTransactions(txs);
      setAnalytics(stats);
      setWalletAddress(wagmiAddress || localStorage.getItem('wallet_address') || '0xUnknown');
    } catch (err) {
      toast.error('Failed to load wallet data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [wagmiAddress]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Syncing with Arbitrum Sepolia...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <Wallet className="w-8 h-8 text-blue-600" /> Wallet
          </h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span> Connected to Arbitrum Sepolia
          </p>
        </div>
        <button 
          onClick={fetchAll} disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Wallet Address Card */}
        <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-2xl p-6 text-white shadow-xl border border-blue-800 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Wallet className="w-32 h-32" />
          </div>
          <div>
            <p className="text-blue-300 text-sm font-bold uppercase mb-1">Wallet Address</p>
            <p className="text-lg font-mono font-medium truncate mb-4">{wagmiAddress || walletAddress}</p>
            <div className="inline-block bg-blue-500/20 px-3 py-1 rounded-full text-xs font-bold border border-blue-400/30 text-blue-300 mb-6">
              Status: {isConnected ? 'Connected' : 'Disconnected'}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => copyToClipboard(walletAddress)} className="flex-1 bg-white/10 hover:bg-white/20 py-2 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2">
              <Copy className="w-4 h-4" /> Copy
            </button>
            <button className="flex-1 bg-blue-600 hover:bg-blue-500 py-2 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-900/50">
              <QrCode className="w-4 h-4" /> QR Code
            </button>
          </div>
        </div>

        {/* Balance Card */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm col-span-1 lg:col-span-2 flex flex-col justify-center">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-gray-500 font-bold mb-1">Available Balance</p>
              <h2 className="text-4xl font-extrabold text-gray-900">{wagmiBalance ? Number(formatEther(wagmiBalance.value)).toFixed(4) : balance?.available_balance?.toFixed(4)} ETH</h2>
              <p className="text-green-600 font-bold mt-1">≈ ${( (wagmiBalance ? Number(formatEther(wagmiBalance.value)) : (balance?.available_balance || 0)) * 4087.12 ).toLocaleString()}</p>
            </div>
            <div className="bg-blue-50 text-blue-700 p-3 rounded-xl border border-blue-100">
              <p className="text-xs font-bold uppercase mb-1 text-blue-500">Locked in Escrow</p>
              <p className="text-xl font-bold">{balance?.locked_escrow?.toFixed(4)} ETH</p>
            </div>
          </div>
          
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden flex">
            <div className="bg-green-500 h-full" style={{ width: `${(balance?.available_balance / balance?.total_eth) * 100}%` }}></div>
            <div className="bg-blue-400 h-full" style={{ width: `${(balance?.locked_escrow / balance?.total_eth) * 100}%` }}></div>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
             <span>Available ({((balance?.available_balance / balance?.total_eth) * 100).toFixed(0)}%)</span>
             <span>Locked ({((balance?.locked_escrow / balance?.total_eth) * 100).toFixed(0)}%)</span>
          </div>
        </div>
      </div>

      {/* Analytics & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
         <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Activity className="w-6 h-6" /></div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase">Total Transactions</p>
              <p className="text-xl font-bold text-gray-900">{transactions.length}</p>
            </div>
         </div>
         <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl"><ArrowUpRight className="w-6 h-6" /></div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase">Total Spent</p>
              <p className="text-xl font-bold text-gray-900">${analytics?.total_spent_usd?.toLocaleString()}</p>
            </div>
         </div>
         <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl"><ArrowDownRight className="w-6 h-6" /></div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase">Total Earned</p>
              <p className="text-xl font-bold text-gray-900">${analytics?.total_earned_usd?.toLocaleString()}</p>
            </div>
         </div>
         <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl"><Wallet className="w-6 h-6" /></div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase">Active Escrows</p>
              <p className="text-xl font-bold text-gray-900">{analytics?.pending_escrows}</p>
            </div>
         </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-900">Transaction History</h2>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search hashes..." 
              className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none w-48 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Transaction Hash</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Explorer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No transactions found on the blockchain.
                  </td>
                </tr>
              ) : (
                transactions.map((tx, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-600 flex items-center gap-2">
                       {tx.tx_hash.substring(0,10)}...{tx.tx_hash.substring(tx.tx_hash.length-8)}
                       <button onClick={() => copyToClipboard(tx.tx_hash)} className="text-gray-400 hover:text-blue-600"><Copy className="w-3 h-3" /></button>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${tx.tx_type.includes('Release') ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {tx.tx_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{tx.amount.toFixed(4)} ETH</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">≈ ₹{(tx.amount * 180180.18).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1 text-green-600 font-medium">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a 
                        href={`https://sepolia.arbiscan.io/tx/${tx.tx_hash}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-1 font-bold text-xs"
                      >
                        Arbiscan <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
