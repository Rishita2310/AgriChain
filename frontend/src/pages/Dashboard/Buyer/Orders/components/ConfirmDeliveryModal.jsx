import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ConfirmDeliveryModal({ onConfirm, onCancel }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden font-sans border border-gray-200 p-6"
      >
        <div className="flex justify-between items-start mb-6">
          <div className="bg-emerald-100 p-3 rounded-xl">
             <ShieldCheck className="w-8 h-8 text-emerald-600" />
          </div>
          {!isSubmitting && (
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 p-1">
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirm Delivery & Release Escrow</h2>
        <p className="text-gray-600 mb-6 text-sm leading-relaxed">
          Please confirm that you have received your agricultural produce in good quality. 
          Upon confirmation, the funds locked in the Arbitrum Sepolia escrow will be released to the farmer.
        </p>

        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-8 flex gap-3 text-blue-800 text-xs leading-relaxed">
          <ShieldCheck className="w-5 h-5 shrink-0 text-blue-600 mt-0.5" />
          <p>This action records final delivery on-chain and initiates payment settlement to the farmer's registered wallet.</p>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Releasing...
              </>
            ) : (
              'Confirm & Release'
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
