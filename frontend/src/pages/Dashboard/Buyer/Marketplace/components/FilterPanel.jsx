import React from 'react';
import { 
  SlidersHorizontal, X, Check, Leaf, Star, ShieldCheck, BadgeCheck, 
  Zap, IndianRupee, MapPin, RotateCcw 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FilterPanel = ({ filters, setFilters, isOpen, onClose }) => {
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handlePricePreset = (preset) => {
    if (filters.pricePreset === preset) {
      setFilters(prev => ({ ...prev, pricePreset: '', minPrice: '', maxPrice: '' }));
      return;
    }
    if (preset === 'under50') {
      setFilters(prev => ({ ...prev, pricePreset: 'under50', minPrice: '', maxPrice: '50' }));
    } else if (preset === '50-150') {
      setFilters(prev => ({ ...prev, pricePreset: '50-150', minPrice: '50', maxPrice: '150' }));
    } else if (preset === '150plus') {
      setFilters(prev => ({ ...prev, pricePreset: '150plus', minPrice: '150', maxPrice: '' }));
    }
  };

  const toggleTrustVerification = (itemKey) => {
    setFilters(prev => {
      const current = prev.additional || [];
      const updated = current.includes(itemKey)
        ? current.filter(x => x !== itemKey)
        : [...current, itemKey];
      return { ...prev, additional: updated };
    });
  };

  const handleReset = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      pricePreset: '',
      organicOnly: false,
      radius: 50,
      minRating: 0,
      additional: []
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs z-40"
            onClick={onClose}
          />
          
          {/* Panel */}
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="fixed inset-y-0 left-0 z-50 w-full max-w-[360px] sm:max-w-[400px] bg-white shadow-2xl flex flex-col rounded-r-3xl border-r border-gray-100 overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-emerald-50/60 to-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-black text-gray-900">
                    Filter Marketplace
                  </h2>
                  <p className="text-[11px] font-semibold text-gray-500">
                    Organic, pricing, ratings & provenance
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Close Filter Panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Filters */}
            <div className="p-5 overflow-y-auto flex-grow flex flex-col gap-6 hide-scrollbar">
              
              {/* 1. Certified Organic */}
              <div>
                <label className={`flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all cursor-pointer select-none ${
                  filters.organicOnly 
                    ? 'bg-emerald-50/80 border-emerald-500 shadow-xs' 
                    : 'bg-gray-50/60 border-gray-200/80 hover:border-emerald-300'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                      filters.organicOnly ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      <Leaf className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-gray-900 block">Certified Organic</span>
                      <span className="text-[11px] font-semibold text-gray-500">
                        100% pesticide-free produce
                      </span>
                    </div>
                  </div>

                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={filters.organicOnly || false}
                      onChange={(e) => handleFilterChange('organicOnly', e.target.checked)}
                    />
                    <div className={`w-10 h-5 rounded-full transition-colors duration-200 ${
                      filters.organicOnly ? 'bg-emerald-600' : 'bg-gray-300'
                    }`} />
                    <div className={`absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-xs ${
                      filters.organicOnly ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </div>
                </label>
              </div>

              {/* 2. Price Range (₹/kg) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-gray-700 flex items-center gap-1">
                    <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                    Price Range (₹/kg)
                  </span>
                  {(filters.minPrice || filters.maxPrice) && (
                    <span className="text-xs font-bold text-emerald-700">
                      ₹{filters.minPrice || 0} - ₹{filters.maxPrice || '∞'}
                    </span>
                  )}
                </div>

                {/* Preset Chips */}
                <div className="grid grid-cols-3 gap-1.5 mb-2.5">
                  <button
                    type="button"
                    onClick={() => handlePricePreset('under50')}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                      filters.pricePreset === 'under50'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    Under ₹50
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePricePreset('50-150')}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                      filters.pricePreset === '50-150'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    ₹50 - ₹150
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePricePreset('150plus')}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                      filters.pricePreset === '150plus'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    ₹150+
                  </button>
                </div>

                {/* Min / Max Inputs */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">₹</span>
                    <input 
                      type="number" 
                      placeholder="Min" 
                      className="w-full pl-6 pr-2.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder-gray-400 shadow-xs"
                      value={filters.minPrice || ''}
                      onChange={(e) => {
                        handleFilterChange('pricePreset', 'custom');
                        handleFilterChange('minPrice', e.target.value);
                      }}
                    />
                  </div>
                  <span className="text-gray-400 font-bold text-xs">to</span>
                  <div className="relative flex-1">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">₹</span>
                    <input 
                      type="number" 
                      placeholder="Max" 
                      className="w-full pl-6 pr-2.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder-gray-400 shadow-xs"
                      value={filters.maxPrice || ''}
                      onChange={(e) => {
                        handleFilterChange('pricePreset', 'custom');
                        handleFilterChange('maxPrice', e.target.value);
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* 3. Minimum Cultivator Rating */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-gray-700">
                    Minimum Cultivator Rating
                  </span>
                  {filters.minRating > 0 && (
                    <span className="text-xs font-bold text-amber-600">
                      ★ {filters.minRating}+ Stars
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 4, 5].map((rating) => {
                    const isSelected = filters.minRating === rating;
                    const isTop = rating === 5;
                    return (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => handleFilterChange('minRating', isSelected ? 0 : rating)}
                        className={`py-2 px-1 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center gap-0.5 border ${
                          isSelected 
                            ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-xs' 
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-amber-50/60'
                        }`}
                      >
                        <span className="flex items-center gap-0.5">
                          <Star className={`w-3.5 h-3.5 ${isSelected ? 'fill-amber-950 text-amber-950' : 'fill-amber-400 text-amber-400'}`} />
                          <span>{rating}</span>
                        </span>
                        <span className={`text-[10px] font-bold ${isSelected ? 'text-amber-950' : 'text-gray-400'}`}>
                          {isTop ? 'Top' : '+'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Farm Distance */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-gray-700 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    Farm Distance
                  </span>
                  <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                    Within {filters.radius || 50} km
                  </span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="150" 
                  step="5"
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  value={filters.radius || 50}
                  onChange={(e) => handleFilterChange('radius', Number(e.target.value))}
                />
                <div className="flex justify-between text-[11px] font-bold text-gray-400 mt-1.5">
                  <span>5 km (Local)</span>
                  <span>150 km (Regional)</span>
                </div>
              </div>

              {/* 5. Trust & Verification */}
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-gray-700 block mb-2">
                  Trust & Verification
                </span>
                <div className="space-y-2">
                  {/* On-Chain Provenance */}
                  <div 
                    onClick={() => toggleTrustVerification('On-Chain Provenance Verified')}
                    className={`flex items-start gap-2.5 p-3 rounded-2xl border-2 transition-all cursor-pointer select-none ${
                      filters.additional?.includes('On-Chain Provenance Verified')
                        ? 'bg-emerald-50/80 border-emerald-500 shadow-xs'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center mt-0.5 ${
                      filters.additional?.includes('On-Chain Provenance Verified')
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-white border-gray-300'
                    }`}>
                      {filters.additional?.includes('On-Chain Provenance Verified') && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-xs font-bold text-gray-900">On-Chain Provenance Verified</span>
                      </div>
                      <p className="text-[10px] text-gray-500">Smart contract verified batch</p>
                    </div>
                  </div>

                  {/* KYC Verified */}
                  <div 
                    onClick={() => toggleTrustVerification('KYC Verified Cultivators')}
                    className={`flex items-start gap-2.5 p-3 rounded-2xl border-2 transition-all cursor-pointer select-none ${
                      filters.additional?.includes('KYC Verified Cultivators')
                        ? 'bg-emerald-50/80 border-emerald-500 shadow-xs'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center mt-0.5 ${
                      filters.additional?.includes('KYC Verified Cultivators')
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-white border-gray-300'
                    }`}>
                      {filters.additional?.includes('KYC Verified Cultivators') && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-xs font-bold text-gray-900">KYC Verified Cultivators</span>
                      </div>
                      <p className="text-[10px] text-gray-500">Identity & land validated</p>
                    </div>
                  </div>

                  {/* Immediate Harvest */}
                  <div 
                    onClick={() => toggleTrustVerification('Immediate Harvest Ready')}
                    className={`flex items-start gap-2.5 p-3 rounded-2xl border-2 transition-all cursor-pointer select-none ${
                      filters.additional?.includes('Immediate Harvest Ready')
                        ? 'bg-emerald-50/80 border-emerald-500 shadow-xs'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center mt-0.5 ${
                      filters.additional?.includes('Immediate Harvest Ready')
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-white border-gray-300'
                    }`}>
                      {filters.additional?.includes('Immediate Harvest Ready') && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-xs font-bold text-gray-900">Immediate Harvest Ready</span>
                      </div>
                      <p className="text-[10px] text-gray-500">Available for instant dispatch</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
              <button 
                onClick={handleReset}
                className="px-3 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-xl flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
              <button 
                onClick={onClose}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs transition-all shadow-md shadow-emerald-600/20"
              >
                Apply & Close
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FilterPanel;

