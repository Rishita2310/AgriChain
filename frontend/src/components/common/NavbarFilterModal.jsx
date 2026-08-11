import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SlidersHorizontal, X, Check, Star, ShieldCheck, BadgeCheck, Zap, 
  Leaf, RotateCcw, ArrowRight, MapPin, IndianRupee 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NavbarFilterModal({ 
  isOpen, 
  onClose, 
  initialFilters = {}, 
  searchQuery = '',
  onApply,
  targetPath = '/marketplace' 
}) {
  const navigate = useNavigate();

  const defaultFilters = {
    organicOnly: false,
    pricePreset: '', // 'under50', '50-150', '150plus', 'custom'
    minPrice: '',
    maxPrice: '',
    minRating: 0,
    radius: 50,
    trustVerification: {
      onChainProvenance: false,
      kycVerified: false,
      immediateHarvest: false
    }
  };

  const [filters, setFilters] = useState({
    ...defaultFilters,
    ...initialFilters,
    trustVerification: {
      ...defaultFilters.trustVerification,
      ...(initialFilters.trustVerification || {})
    }
  });

  // Sync state when initialFilters change or modal opens
  useEffect(() => {
    if (isOpen) {
      setFilters({
        ...defaultFilters,
        ...initialFilters,
        trustVerification: {
          ...defaultFilters.trustVerification,
          ...(initialFilters.trustVerification || {})
        }
      });
    }
  }, [isOpen]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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

  const handleCustomPriceChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      pricePreset: 'custom',
      [field]: value
    }));
  };

  const toggleTrustVerification = (key) => {
    setFilters(prev => ({
      ...prev,
      trustVerification: {
        ...prev.trustVerification,
        [key]: !prev.trustVerification[key]
      }
    }));
  };

  const handleReset = () => {
    setFilters(defaultFilters);
  };

  // Count total active filters
  const activeFilterCount = [
    filters.organicOnly,
    filters.minPrice || filters.maxPrice,
    filters.minRating > 0,
    filters.radius !== 50,
    filters.trustVerification?.onChainProvenance,
    filters.trustVerification?.kycVerified,
    filters.trustVerification?.immediateHarvest
  ].filter(Boolean).length;

  const handleApply = () => {
    if (onApply) {
      onApply(filters);
    } else {
      // Build query string and navigate
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      if (filters.organicOnly) params.set('organic', '1');
      if (filters.minPrice) params.set('minPrice', filters.minPrice);
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
      if (filters.minRating > 0) params.set('minRating', filters.minRating.toString());
      if (filters.radius !== 50) params.set('radius', filters.radius.toString());
      if (filters.trustVerification?.onChainProvenance) params.set('onChain', '1');
      if (filters.trustVerification?.kycVerified) params.set('kyc', '1');
      if (filters.trustVerification?.immediateHarvest) params.set('harvest', '1');
      params.set('filter', 'open');

      navigate(`${targetPath}?${params.toString()}`);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-20 px-3 sm:px-4 pb-6 overflow-y-auto">
          {/* Backdrop Blur */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.94, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -20 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-10 flex flex-col max-h-[85vh]"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/50 via-white to-emerald-50/30">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-gray-900 leading-tight">
                      Filter Marketplace
                    </h3>
                    {activeFilterCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-extrabold text-[10px] uppercase tracking-wider shadow-xs">
                        {activeFilterCount} Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 font-medium">
                    Refine produce by organic standards, price, rating & verification
                  </p>
                </div>
              </div>
              
              <button 
                onClick={onClose}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
              
              {/* 1. Certified Organic */}
              <div>
                <label className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer select-none ${
                  filters.organicOnly 
                    ? 'bg-emerald-50/80 border-emerald-500 shadow-sm shadow-emerald-500/10' 
                    : 'bg-gray-50/60 border-gray-200/80 hover:border-emerald-300'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                      filters.organicOnly ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      <Leaf className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-black text-gray-900">Certified Organic</span>
                        <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded">ECO</span>
                      </div>
                      <p className="text-xs font-semibold text-gray-500 mt-0.5">
                        100% pesticide-free produce
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="sr-only"
                      checked={filters.organicOnly}
                      onChange={(e) => setFilters(prev => ({ ...prev, organicOnly: e.target.checked }))}
                    />
                    <div className={`w-11 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                      filters.organicOnly ? 'bg-emerald-600' : 'bg-gray-300'
                    }`} />
                    <div className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 shadow-md ${
                      filters.organicOnly ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </div>
                </label>
              </div>

              {/* 2. Price Range (₹/kg) */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
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
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => handlePricePreset('under50')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      filters.pricePreset === 'under50'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                    }`}
                  >
                    Under ₹50
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePricePreset('50-150')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      filters.pricePreset === '50-150'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                    }`}
                  >
                    ₹50 - ₹150
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePricePreset('150plus')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      filters.pricePreset === '150plus'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                    }`}
                  >
                    ₹150+
                  </button>
                </div>

                {/* Min / Max Inputs */}
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">₹</span>
                    <input 
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => handleCustomPriceChange('minPrice', e.target.value)}
                      className="w-full pl-7 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 shadow-xs"
                    />
                  </div>
                  <span className="text-gray-400 font-bold text-xs">to</span>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">₹</span>
                    <input 
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => handleCustomPriceChange('maxPrice', e.target.value)}
                      className="w-full pl-7 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 shadow-xs"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Minimum Cultivator Rating */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-gray-700">
                    Minimum Cultivator Rating
                  </span>
                  {filters.minRating > 0 && (
                    <span className="text-xs font-bold text-amber-600">
                      ★ {filters.minRating}+ Stars
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => {
                    const isSelected = filters.minRating === rating;
                    const isTop = rating === 5;
                    return (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setFilters(prev => ({
                          ...prev,
                          minRating: isSelected ? 0 : rating
                        }))}
                        className={`py-2 px-1 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center gap-0.5 border ${
                          isSelected 
                            ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-sm shadow-amber-400/20' 
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-amber-50/60 hover:border-amber-300'
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
                  <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-100">
                    Within {filters.radius} km
                  </span>
                </div>

                <input 
                  type="range"
                  min="5"
                  max="150"
                  step="5"
                  value={filters.radius}
                  onChange={(e) => setFilters(prev => ({ ...prev, radius: Number(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 focus:outline-none"
                />

                <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 mt-2">
                  <span>5 km (Local)</span>
                  <span>150 km (Regional)</span>
                </div>
              </div>

              {/* 5. Trust & Verification */}
              <div>
                <div className="mb-2.5">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-gray-700">
                    Trust & Verification
                  </span>
                </div>

                <div className="space-y-2.5">
                  {/* On-Chain Provenance */}
                  <div 
                    onClick={() => toggleTrustVerification('onChainProvenance')}
                    className={`flex items-start gap-3 p-3 rounded-2xl border-2 transition-all cursor-pointer select-none ${
                      filters.trustVerification?.onChainProvenance
                        ? 'bg-emerald-50/70 border-emerald-500 shadow-xs'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center mt-0.5 transition-colors ${
                      filters.trustVerification?.onChainProvenance 
                        ? 'bg-emerald-600 border-emerald-600 text-white' 
                        : 'bg-white border-gray-300'
                    }`}>
                      {filters.trustVerification?.onChainProvenance && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-xs sm:text-sm font-black text-gray-900">
                          On-Chain Provenance Verified
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-gray-500 mt-0.5">
                        Smart contract verified batch
                      </p>
                    </div>
                  </div>

                  {/* KYC Verified Cultivators */}
                  <div 
                    onClick={() => toggleTrustVerification('kycVerified')}
                    className={`flex items-start gap-3 p-3 rounded-2xl border-2 transition-all cursor-pointer select-none ${
                      filters.trustVerification?.kycVerified
                        ? 'bg-emerald-50/70 border-emerald-500 shadow-xs'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center mt-0.5 transition-colors ${
                      filters.trustVerification?.kycVerified 
                        ? 'bg-emerald-600 border-emerald-600 text-white' 
                        : 'bg-white border-gray-300'
                    }`}>
                      {filters.trustVerification?.kycVerified && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <BadgeCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-xs sm:text-sm font-black text-gray-900">
                          KYC Verified Cultivators
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-gray-500 mt-0.5">
                        Identity & land validated
                      </p>
                    </div>
                  </div>

                  {/* Immediate Harvest Ready */}
                  <div 
                    onClick={() => toggleTrustVerification('immediateHarvest')}
                    className={`flex items-start gap-3 p-3 rounded-2xl border-2 transition-all cursor-pointer select-none ${
                      filters.trustVerification?.immediateHarvest
                        ? 'bg-emerald-50/70 border-emerald-500 shadow-xs'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center mt-0.5 transition-colors ${
                      filters.trustVerification?.immediateHarvest 
                        ? 'bg-emerald-600 border-emerald-600 text-white' 
                        : 'bg-white border-gray-300'
                    }`}>
                      {filters.trustVerification?.immediateHarvest && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                        <span className="text-xs sm:text-sm font-black text-gray-900">
                          Immediate Harvest Ready
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-gray-500 mt-0.5">
                        Available for instant dispatch
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 sm:p-5 border-t border-gray-100 bg-gray-50/80 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2.5 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-200/60 font-bold text-xs sm:text-sm transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset All
              </button>

              <button
                type="button"
                onClick={handleApply}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm transition-all shadow-md shadow-emerald-600/20 hover:shadow-lg hover:shadow-emerald-600/30 flex items-center gap-2 active:scale-95"
              >
                <span>Apply Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
