import React from 'react';
import { Fingerprint, CheckCircle2, Box, Clock, ShieldCheck, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';

export default function BlockchainVerificationCard({ verificationData, loading, onVerify }) {
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-3xl p-8 text-white relative overflow-hidden animate-pulse min-h-[260px]">
        <div className="absolute inset-0 bg-blue-400/10 backdrop-blur-3xl"></div>
      </div>
    );
  }

  if (!verificationData) {
    return (
      <div className="bg-gray-50 rounded-3xl p-8 text-center border border-gray-200">
        <Fingerprint className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-900 mb-2">Blockchain Verification</h3>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">This product does not have a blockchain verification record yet. It might be saved as a draft or pending smart contract execution.</p>
      </div>
    );
  }

  const isVerified = verificationData.status === 'Verified' && verificationData.transaction_hash;

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-[32px] p-8 md:p-10 text-white relative overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-gray-800">
      {/* Decorative background elements */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500 rounded-full mix-blend-screen filter blur-[100px] opacity-20"></div>
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500 rounded-full mix-blend-screen filter blur-[100px] opacity-20"></div>

      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-10">
        
        {/* Left Side: Header & Primary Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-500/20 p-3 rounded-2xl backdrop-blur-md">
              <ShieldCheck className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                {isVerified ? 'Blockchain Verified' : 'Blockchain Verification Pending'}
                {isVerified ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-amber-400" />
                )}
              </h2>
              <p className="text-blue-200">Arbitrum Sepolia Stylus Network</p>
            </div>
          </div>

          <p className="text-gray-300 text-sm max-w-lg leading-relaxed mb-8">
            {isVerified 
              ? "This product's provenance, origin batch, and farmer credentials are cryptographically stamped on Arbitrum Sepolia."
              : "This product is registered in AgriChain and will be stamped to the Arbitrum Sepolia Stylus registry upon purchase escrow activation."}
          </p>

          <div className="flex flex-wrap gap-4">
            {isVerified ? (
              <a 
                href={`https://sepolia.arbiscan.io/tx/${verificationData.transaction_hash}`} 
                target="_blank" 
                rel="noreferrer"
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/25"
              >
                <ExternalLink className="w-5 h-5" /> View on Arbiscan
              </a>
            ) : (
              <span className="bg-amber-500/20 border border-amber-500/30 text-amber-300 px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2">
                <Clock className="w-4 h-4" /> Ready for On-Chain Escrow
              </span>
            )}
            <button 
              onClick={onVerify}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-5 h-5" /> Refresh Status
            </button>
          </div>
        </div>

        {/* Right Side: Technical Details Grid */}
        <div className="w-full md:w-5/12 bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-blue-200 uppercase tracking-wider mb-5">Contract & Block State</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                <span className="flex items-center gap-1.5"><Fingerprint className="w-3.5 h-3.5" /> Transaction Hash</span>
              </div>
              <div className="font-mono text-xs text-gray-200 break-all bg-black/20 p-2.5 rounded-lg border border-white/5">
                {verificationData.transaction_hash || 'Pending On-Chain Broadcast'}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Contract Address</span>
              </div>
              <div className="font-mono text-xs text-emerald-300 break-all bg-black/20 p-2.5 rounded-lg border border-white/5">
                {verificationData.contract_address || '0x89D24A6b4CcB1B6fAA2625fE562bDD9a23260359'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                  <Box className="w-3.5 h-3.5" /> Latest Block
                </div>
                <div className="font-mono text-sm font-bold text-blue-300">
                  #{verificationData.block_number || 'Synced'}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                  <Clock className="w-3.5 h-3.5" /> Timestamp
                </div>
                <div className="text-sm font-medium text-gray-200">
                  {verificationData.verification_timestamp ? new Date(verificationData.verification_timestamp).toLocaleDateString() : 'Live'}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
