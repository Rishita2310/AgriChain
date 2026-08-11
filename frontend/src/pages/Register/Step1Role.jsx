import React from 'react';
import { useRegisterStore } from '../../store/useRegisterStore';
import { Sprout, ShoppingCart, CheckCircle2, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

export default function Step1Role() {
  const { formData, updateFormData, nextStep } = useRegisterStore();

  const handleSelect = (role) => {
    updateFormData({ role });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-xs mb-2 border border-emerald-100">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Step 1 of 6</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-2">
          Choose Your Account Type
        </h2>
        <p className="text-gray-500 text-sm font-medium">
          Select how you want to participate in the AgriChain marketplace.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Farmer Card */}
        <div 
          onClick={() => handleSelect('Farmer')}
          className={`relative cursor-pointer rounded-3xl p-7 border-2 transition-all duration-300 ${
            formData.role === 'Farmer' 
              ? 'border-emerald-600 bg-emerald-50/40 shadow-xl shadow-emerald-600/10 ring-4 ring-emerald-600/10' 
              : 'border-gray-100 hover:border-emerald-200 hover:bg-gray-50/60 shadow-sm'
          }`}
        >
          {formData.role === 'Farmer' && (
            <div className="absolute top-5 right-5 bg-emerald-600 text-white rounded-full p-1 shadow-md">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          )}
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-colors ${
            formData.role === 'Farmer' 
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            <Sprout className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-1.5">Farmer / Producer</h3>
          <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-4">Sell Crops & Direct Export</p>
          <ul className="text-xs text-gray-600 space-y-2.5 font-medium">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              List harvests with custom prices
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Receive smart contract escrow payouts
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Generate verifiable QR provenance
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              AI price & mandi trend forecasts
            </li>
          </ul>
        </div>

        {/* Buyer Card */}
        <div 
          onClick={() => handleSelect('Buyer')}
          className={`relative cursor-pointer rounded-3xl p-7 border-2 transition-all duration-300 ${
            formData.role === 'Buyer' 
              ? 'border-emerald-600 bg-emerald-50/40 shadow-xl shadow-emerald-600/10 ring-4 ring-emerald-600/10' 
              : 'border-gray-100 hover:border-emerald-200 hover:bg-gray-50/60 shadow-sm'
          }`}
        >
          {formData.role === 'Buyer' && (
            <div className="absolute top-5 right-5 bg-emerald-600 text-white rounded-full p-1 shadow-md">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          )}
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-colors ${
            formData.role === 'Buyer' 
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            <ShoppingCart className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-1.5">Wholesaler / Buyer</h3>
          <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-4">Source Direct from Farms</p>
          <ul className="text-xs text-gray-600 space-y-2.5 font-medium">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Direct farm-gate wholesale prices
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              100% money-back escrow protection
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Verified lab & organic crop reports
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Real-time delivery & dispatch tracking
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-auto flex justify-end pt-4 border-t border-gray-100">
        <button 
          onClick={nextStep}
          disabled={!formData.role}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white px-8 py-3.5 rounded-2xl font-black text-sm transition-all shadow-md shadow-emerald-600/20 hover:shadow-emerald-600/40 flex items-center gap-2"
        >
          <span>Continue to Wallet Setup</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}