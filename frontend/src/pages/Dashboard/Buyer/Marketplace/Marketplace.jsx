import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  SlidersHorizontal, Leaf, Clock, MapPin, TrendingUp, Sparkles, Filter, 
  Search, Sprout, ShieldCheck, X, IndianRupee, Star, LayoutGrid, List,
  ArrowUpDown, CheckCircle2, Zap, Lock
} from 'lucide-react';
import ProductCard from './components/ProductCard';
import FilterPanel from './components/FilterPanel';
import { productService } from '../../../../services/product.service';
import axios from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  { id: 'all', label: 'All Produce', icon: null },
  { id: 'organic', label: 'Certified Organic', icon: '🌿' },
  { id: 'grains', label: 'Grains & Cereals', icon: '🌾' },
  { id: 'vegetables', label: 'Fresh Veggies', icon: '🥬' },
  { id: 'fruits', label: 'Fruits', icon: '🍎' },
  { id: 'spices', label: 'Spices & Herbs', icon: '🌶️' },
  { id: 'pulses', label: 'Pulses & Legumes', icon: '🥜' },
];

const Marketplace = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [isFilterOpen, setIsFilterOpen] = useState(searchParams.get('filter') === 'open' || searchParams.get('filter') === '1');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    organicOnly: false,
    radius: 50,
    minRating: 0,
    additional: []
  });

  const [recommended, setRecommended] = useState([]);
  const [organic, setOrganic] = useState([]);
  const [latest, setLatest] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [nearbyFarmers, setNearbyFarmers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync state when URL params change
  useEffect(() => {
    const query = searchParams.get('q') || '';
    const organicParam = searchParams.get('organic') === '1' || searchParams.get('organic') === 'true';
    const minPriceParam = searchParams.get('minPrice') || '';
    const maxPriceParam = searchParams.get('maxPrice') || '';
    const ratingParam = Number(searchParams.get('minRating')) || 0;
    const radiusParam = Number(searchParams.get('radius')) || 50;
    const onChainParam = searchParams.get('onChain') === '1';
    const kycParam = searchParams.get('kyc') === '1';
    const harvestParam = searchParams.get('harvest') === '1';
    const filterParam = searchParams.get('filter');

    const additionalFilters = [];
    if (onChainParam) additionalFilters.push('On-Chain Provenance Verified');
    if (kycParam) additionalFilters.push('KYC Verified Cultivators');
    if (harvestParam) additionalFilters.push('Immediate Harvest Ready');

    const updatedFilters = {
      minPrice: minPriceParam,
      maxPrice: maxPriceParam,
      organicOnly: organicParam,
      radius: radiusParam,
      minRating: ratingParam,
      additional: additionalFilters
    };

    setSearchQuery(query);
    setFilters(updatedFilters);

    if (filterParam === 'open' || filterParam === '1') {
      setIsFilterOpen(true);
    }

    if (query.trim() || organicParam || minPriceParam || maxPriceParam || ratingParam > 0 || additionalFilters.length > 0) {
      executeSearchWithFilters(query, updatedFilters);
    } else {
      setSearchResults(null);
    }
  }, [searchParams]);

  const executeSearchWithFilters = async (queryText, currentFilters) => {
    setLoading(true);
    try {
      const params = {
        q: queryText || undefined,
        min_price: currentFilters.minPrice || undefined,
        max_price: currentFilters.maxPrice || undefined,
        organic: currentFilters.organicOnly ? true : undefined,
        rating: currentFilters.minRating || undefined
      };
      const results = await productService.searchAndFilter(params);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [recRes, orgRes, latRes, farmersRes] = await Promise.all([
          productService.getRecommended(),
          productService.getOrganic(),
          productService.getLatest(),
          axios.get('/farmers/nearby')
        ]);
        
        setRecommended(recRes);
        setOrganic(orgRes);
        setLatest(latRes);
        setNearbyFarmers(farmersRes.data);
      } catch (error) {
        console.error("Error fetching marketplace data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const clearSearch = () => {
    setSearchResults(null);
    setSearchQuery('');
    setSelectedCategory('all');
    setFilters({
      minPrice: '',
      maxPrice: '',
      organicOnly: false,
      radius: 50,
      minRating: 0,
      additional: []
    });
    setSearchParams({});
  };

  const hasActiveFilters = Boolean(
    searchQuery.trim() || 
    filters.organicOnly || 
    filters.minPrice || 
    filters.maxPrice || 
    filters.minRating > 0 || 
    selectedCategory !== 'all' ||
    (filters.additional && filters.additional.length > 0)
  );

  // Filtered & Sorted items computation
  const processedItems = useMemo(() => {
    let items = [...(searchResults !== null ? searchResults : latest)];

    // Category filter
    if (selectedCategory === 'organic') {
      items = items.filter(p => p.organic);
    } else if (selectedCategory !== 'all') {
      const catKeyword = selectedCategory.toLowerCase();
      items = items.filter(p => 
        (p.category && p.category.toLowerCase().includes(catKeyword)) ||
        (p.product_name && p.product_name.toLowerCase().includes(catKeyword))
      );
    }

    // Sort
    if (sortBy === 'price_asc') {
      items.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (sortBy === 'price_desc') {
      items.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    } else if (sortBy === 'rating_desc') {
      items.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    } else if (sortBy === 'newest') {
      items.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    }

    return items;
  }, [searchResults, latest, selectedCategory, sortBy]);

  // Stagger variants for the grid
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 320, damping: 25 } }
  };

  return (
    <div className="min-h-screen marketplace-bg bg-gray-50/50 pt-4 sm:pt-6 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto pb-24 relative">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-[550px] h-[550px] bg-emerald-100/40 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/3 left-10 w-[450px] h-[450px] bg-teal-50/60 rounded-full blur-[130px] pointer-events-none -z-10" />
      
      {/* 1. Enhanced Premium Hero Banner */}
      <div className="mb-8 bg-gray-900 text-white p-8 sm:p-12 rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-10">
        {/* Decorative Background Elements */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-emerald-500/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-emerald-400/10 rounded-full blur-[60px] pointer-events-none" />
        <Sprout className="absolute -right-4 -bottom-6 w-56 h-56 text-white/[0.02] pointer-events-none rotate-12" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs font-bold text-emerald-300 mb-5 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Live Direct Agricultural Exchange</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
            {searchResults !== null ? 'Search Results' : (
              <>Fresh <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Produce</span></>
            )}
          </h1>
          <p className="text-sm sm:text-base text-gray-300 font-medium mt-4 leading-relaxed max-w-lg">
            Direct farmer-to-buyer decentralized trading backed by Arbitrum Sepolia smart contracts, on-chain crop provenance, and instant escrow payment safety.
          </p>
        </div>

        {/* Live Metrics / Web3 Badges */}
        <div className="relative z-10 flex flex-col sm:flex-row gap-4 shrink-0">
          <div className="flex flex-col gap-1 px-6 py-4 rounded-[24px] bg-white/5 backdrop-blur-xl border border-white/10 text-left">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Active Produce</span>
            <span className="text-2xl font-black text-white">{loading ? '...' : `${processedItems.length} Listings`}</span>
          </div>
          <div className="flex flex-col gap-1 px-6 py-4 rounded-[24px] bg-white/5 backdrop-blur-xl border border-white/10 text-left">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Escrow Safety</span>
            <span className="text-2xl font-black text-emerald-400">100% Secure</span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Category Tabs Strip */}
      <div className="mb-8 flex items-center gap-3 overflow-x-auto pb-2 hide-scrollbar">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-[20px] text-sm font-bold shrink-0 transition-all duration-300 border cursor-pointer ${
                isSelected
                  ? 'bg-gray-900 text-white border-gray-900 shadow-lg shadow-gray-900/20'
                  : 'bg-white text-gray-600 border-gray-100 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 shadow-sm'
              }`}
            >
              {cat.icon && <span className="text-base">{cat.icon}</span>}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Sub-Header Toolbar (Active Tags + Sort + View Mode) */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-gray-200/70 shadow-2xs">
        
        {/* Left: Active status / active filter pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-black text-gray-500">
            Showing <strong className="text-gray-900">{processedItems.length}</strong> produce:
          </span>

          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-1.5">
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
                  <Search className="w-3 h-3 text-emerald-600" />
                  "{searchQuery}"
                </span>
              )}
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
                  {CATEGORIES.find(c => c.id === selectedCategory)?.label}
                </span>
              )}
              {filters.organicOnly && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-600 text-white text-xs font-bold">
                  <Leaf className="w-3 h-3" />
                  Organic
                </span>
              )}
              {(filters.minPrice || filters.maxPrice) && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-gray-100 border border-gray-200 text-xs font-bold text-gray-800">
                  <IndianRupee className="w-3 h-3 text-emerald-600" />
                  ₹{filters.minPrice || 0} - ₹{filters.maxPrice || '∞'}
                </span>
              )}
              {filters.minRating > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-50 border border-amber-200 text-xs font-black text-amber-800">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  {filters.minRating}+ Stars
                </span>
              )}
              <button
                onClick={clearSearch}
                className="px-2 py-0.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs transition-colors flex items-center gap-1 ml-1 cursor-pointer"
              >
                <X className="w-3 h-3" />
                Reset
              </button>
            </div>
          )}
        </div>

        {/* Right: Sort and View Controls */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200/80 rounded-xl px-2.5 py-1.5 text-xs font-bold text-gray-700">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent font-bold text-gray-800 outline-none cursor-pointer text-xs"
            >
              <option value="featured">Sort: Featured</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating_desc">Highest Rated ★</option>
              <option value="newest">Newest Harvest</option>
            </select>
          </div>

          {/* Grid / List Switcher */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200/70">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid' 
                  ? 'bg-white text-emerald-700 shadow-2xs' 
                  : 'text-gray-400 hover:text-gray-700'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list' 
                  ? 'bg-white text-emerald-700 shadow-2xs' 
                  : 'text-gray-400 hover:text-gray-700'
              }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Products Container */}
      <div className="flex gap-8 items-start relative">
        {/* Mobile / URL triggered Filter Panel */}
        <FilterPanel 
          filters={filters} 
          setFilters={setFilters} 
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
        />

        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="flex items-center justify-center py-28 bg-white rounded-3xl border border-gray-200/80 shadow-xs">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-3 border-emerald-600 border-t-transparent"></div>
                <p className="text-xs font-bold text-gray-500">Loading fresh marketplace produce...</p>
              </div>
            </div>
          ) : processedItems.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border border-gray-200/80 shadow-xs px-4">
              <div className="w-20 h-20 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-black text-gray-900">No Produce Found</h3>
              <p className="text-gray-500 text-xs font-medium mt-1 max-w-sm mx-auto">
                No produce listings match your active filters. Try clearing filters or searching for other items.
              </p>
              <button
                onClick={clearSearch}
                className="mt-5 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-black text-xs hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {processedItems.map(p => (
                <motion.div key={p._id || p.product_id} variants={itemVariants}>
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            /* List View */
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="flex flex-col gap-4"
            >
              {processedItems.map(p => (
                <motion.div key={p._id || p.product_id} variants={itemVariants}>
                  <ProductCard product={p} listView={true} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Mobile Filter Overlay */}
      {isFilterOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsFilterOpen(false)}
        />
      )}
    </div>
  );
};

export default Marketplace;


