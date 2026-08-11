import React, { useState, useEffect } from 'react';
import { useRegisterStore } from '../../store/useRegisterStore';
import { useConnect, useAccount, useDisconnect } from 'wagmi';
import { Wallet, CheckCircle2, AlertCircle, ExternalLink, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { ethers } from 'ethers';

export default function Step2Wallet() {
  const { formData, updateFormData, nextStep, prevStep } = useRegisterStore();
  const { connectAsync, connectors, isPending: isConnecting } = useConnect();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [error, setError] = useState('');

  // Sync connected account with register store
  useEffect(() => {
    if (isConnected && address && !formData.wallet_address) {
      updateFormData({ wallet_address: address });
    }
  }, [isConnected, address, formData.wallet_address, updateFormData]);

  const hasMetaMask = typeof window !== 'undefined' && Boolean(window.ethereum);

  const handleConnectWallet = async () => {
    setError('');
    
    if (!hasMetaMask && connectors.length === 0) {
      setError('MetaMask extension is not detected. Please install it to continue.');
      return;
    }

    try {
      if (connectors.length > 0) {
        const res = await connectAsync({ connector: connectors[0] });
        const connectedAddr = res.accounts?.[0] || res.account || address;
        if (connectedAddr) {
          updateFormData({ wallet_address: connectedAddr });
          toast.success('Wallet connected successfully!');
          return;
        }
      }

      // Fallback direct provider
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        if (accounts.length > 0) {
          updateFormData({ wallet_address: accounts[0] });
          toast.success('Wallet connected successfully!');
        }
      }
    } catch (err) {
      console.error(err);
      const isRejected = err.code === 4001 || 
                         err.message?.toLowerCase().includes('user rejected') || 
                         err.message?.toLowerCase().includes('user denied');
      if (isRejected) {
        setError('Wallet connection was cancelled.');
      } else {
        setError('Failed to connect wallet. Please try again.');
      }
    }
  };

  const handleDisconnectWallet = () => {
    disconnect();
    updateFormData({ wallet_address: '' });
  };

  const currentWallet = formData.wallet_address || (isConnected ? address : '');

  return (
    <div className="h-full flex flex-col">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Connect Your Wallet</h2>
        <p className="text-gray-500">Connect your Web3 wallet to verify ownership on Arbitrum.</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-6">
        <div className="w-28 h-28 bg-orange-50/80 rounded-3xl border border-orange-100 flex items-center justify-center mb-6 relative shadow-inner">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" 
            alt="MetaMask" 
            className="w-16 h-16" 
          />
          {currentWallet && (
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md border border-emerald-100">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-2xl flex items-center mb-6 text-sm max-w-md w-full">
            <AlertCircle className="w-5 h-5 mr-2 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {currentWallet ? (
          <div className="text-center w-full max-w-md">
            <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 mb-4 shadow-sm text-left">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                  Wallet Connected
                </span>
              </div>
              <p className="text-gray-900 font-mono text-sm font-semibold break-all bg-white p-2.5 rounded-xl border border-emerald-100">
                {currentWallet}
              </p>
            </div>
            <button 
              onClick={handleDisconnectWallet}
              className="text-gray-500 hover:text-red-600 text-xs font-semibold transition-colors py-1 px-3 rounded-lg hover:bg-red-50"
            >
              Disconnect / Change Wallet
            </button>
          </div>
        ) : hasMetaMask || connectors.length > 0 ? (
          <button 
            onClick={handleConnectWallet}
            disabled={isConnecting}
            className="bg-[#F6851B] hover:bg-[#E2761B] active:scale-[0.99] text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-orange-500/25 flex items-center gap-3 text-base w-full max-w-xs justify-center disabled:opacity-75"
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <Wallet className="w-5 h-5" />
                <span>Connect MetaMask</span>
              </>
            )}
          </button>
        ) : (
          <a
            href="https://metamask.io/download/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#F6851B] hover:bg-[#E2761B] text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-orange-500/25 flex items-center gap-2 text-base w-full max-w-xs justify-center"
          >
            <span>Install MetaMask</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>

      <div className="mt-auto flex justify-between pt-6 border-t border-gray-100">
        <button 
          type="button"
          onClick={prevStep}
          className="text-gray-500 hover:text-gray-900 px-6 py-3 font-medium transition-colors"
        >
          Back
        </button>
        <button 
          type="button"
          onClick={nextStep}
          disabled={!currentWallet}
          className="bg-primary hover:bg-primary-dark disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white px-8 py-3 rounded-full font-bold transition-all shadow-md hover:shadow-lg disabled:shadow-none"
        >
          Continue
        </button>
      </div>
    </div>
  );
}