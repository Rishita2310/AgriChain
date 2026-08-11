import React from 'react';
import { motion } from 'framer-motion';

const CategoryCard = ({ category }) => {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group relative flex flex-col items-center justify-center p-6 bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] border border-gray-100 cursor-pointer overflow-hidden z-10"
    >
      {/* Background Gradient Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

      <motion.div 
        whileHover={{ rotate: [0, -10, 10, -5, 5, 0] }}
        transition={{ duration: 0.5 }}
        className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-50 to-teal-50 flex items-center justify-center mb-4 overflow-hidden p-3 shadow-inner border border-white/50"
      >
        <img 
          src={category.image} 
          alt={category.name} 
          className="w-full h-full object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300"
        />
      </motion.div>
      <h4 className="font-extrabold text-gray-900 text-center text-lg">{category.name}</h4>
      <p className="text-xs font-semibold text-emerald-600/80 mt-1 uppercase tracking-wider">{category.count || 0} items</p>
    </motion.div>
  );
};

export default CategoryCard;
