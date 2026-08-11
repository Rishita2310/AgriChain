import React from 'react';
import { Search, Filter, Mic, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const SearchBar = ({ searchQuery, setSearchQuery, onSearch, onFilterClick }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="relative w-full max-w-4xl mx-auto group/search"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 via-teal-300/20 to-emerald-400/20 blur-xl opacity-0 group-focus-within/search:opacity-100 transition-opacity duration-700 rounded-[3rem]"></div>
      
      <div className="relative flex items-center w-full h-16 md:h-20 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] focus-within:shadow-[0_20px_40px_rgba(16,185,129,0.2)] bg-white/90 backdrop-blur-xl border border-white focus-within:border-emerald-100 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all duration-500">
        
        {/* Filter Button */}
        <button 
          onClick={onFilterClick}
          className="h-full flex items-center justify-center gap-2 px-6 text-gray-400 hover:text-emerald-600 transition-colors group border-r border-gray-100/50"
          title="Open Filters"
        >
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            className="p-2.5 rounded-2xl group-hover:bg-emerald-50 transition-colors"
          >
            <Filter className="h-5 w-5 md:h-6 md:w-6" />
          </motion.div>
          <span className="hidden md:block font-bold text-sm tracking-wide">Filter</span>
        </button>

        {/* Input Field */}
        <div className="flex-1 flex items-center h-full px-6 relative">
          <Search className="h-5 w-5 md:h-6 md:w-6 text-gray-400 mr-4 group-focus-within/search:text-emerald-500 transition-colors duration-300" />
          <input
            className="w-full h-full outline-none text-gray-800 bg-transparent text-lg md:text-xl font-medium placeholder-gray-400"
            type="text"
            id="search"
            placeholder="Search fresh vegetables, fruits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          />
        </div>

        {/* Quick Actions & Search Button */}
        <div className="flex items-center pr-3 md:pr-4 gap-2">
          <div className="hidden md:flex items-center gap-1 border-r border-gray-100/50 pr-3 mr-1">
            <motion.button 
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 text-gray-400 hover:text-emerald-600 transition-colors rounded-full hover:bg-emerald-50"
            >
              <Mic className="h-5 w-5" />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 text-gray-400 hover:text-emerald-600 transition-colors rounded-full hover:bg-emerald-50"
            >
              <ImageIcon className="h-5 w-5" />
            </motion.button>
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSearch}
            className="relative overflow-hidden flex items-center gap-2 bg-gray-900 hover:bg-emerald-600 text-white px-6 md:px-8 py-3.5 md:py-4 rounded-full font-bold text-sm md:text-base transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-emerald-600/30 group"
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
            <span className="relative z-10">Search</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default SearchBar;
