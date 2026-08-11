import React, { useState } from 'react';
import { X, ExternalLink, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function MetaMaskSimulationModal({ amount, gas, onConfirm, onReject }) {
  const [step, setStep] = useState('confirm'); // confirm | signing | confirmed

  const handleSign = () => {
    setStep('signing');
    
    // Simulate network delay
    setTimeout(() => {
      setStep('confirmed');
      const mockTxHash = `0x${Math.random().toString(16).slice(2, 40).padEnd(64, '0')}`;
      toast.success("Transaction Confirmed on Arbitrum Sepolia");
      setTimeout(() => {
        onConfirm(mockTxHash);
      }, 1500);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white w-full max-w-[360px] rounded-2xl shadow-2xl overflow-hidden font-sans border border-gray-200"
      >
        {/* MetaMask Header */}
        <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center gap-2">
            <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" className="w-6 h-6" />
            <span className="font-bold text-gray-900 text-sm">MetaMask</span>
          </div>
          {step === 'confirm' && (
            <button onClick={onReject} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="p-5">
          {step === 'confirm' && (
            <>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-500 p-0.5">
                     <div className="w-full h-full bg-white rounded-full border border-white"></div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold">Account 1</p>
                    <p className="text-xs text-gray-900 font-mono">0x7d...A91B</p>
                  </div>
                </div>
                <div className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                  Arbitrum Sepolia
                </div>
              </div>

              <div className="text-center mb-6">
                <h3 className="text-sm font-bold text-gray-900 mb-1">Contract Interaction</h3>
                <div className="bg-gray-50 p-2 rounded-lg border border-gray-200 inline-block">
                   <p className="text-xs font-mono text-gray-600">0xEscrowContract...1234</p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-xl mb-6">
                 <div className="p-3 border-b border-gray-200 flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Estimated gas fee</span>
                    <span className="text-sm font-bold text-gray-900 font-mono">₹{gas.toFixed(2)}</span>
                 </div>
                 <div className="p-3 bg-gray-50 flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-900">Total</span>
                    <span className="text-lg font-extrabold text-blue-600 font-mono">₹{(amount).toFixed(2)}</span>
                 </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={onReject}
                  className="flex-1 py-3 border border-blue-600 text-blue-600 font-bold rounded-full hover:bg-blue-50 transition-colors"
                >
                  Reject
                </button>
                <button 
                  onClick={handleSign}
                  className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30"
                >
                  Confirm
                </button>
              </div>
            </>
          )}

          {step === 'signing' && (
            <div className="flex flex-col items-center justify-center py-10">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Transaction Pending</h3>
              <p className="text-sm text-gray-500 text-center">Waiting for blockchain confirmation on Arbitrum Sepolia...</p>
            </div>
          )}

          {step === 'confirmed' && (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                 <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Confirmed!</h3>
              <p className="text-sm text-gray-500 text-center">Payment successfully locked in Escrow.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
