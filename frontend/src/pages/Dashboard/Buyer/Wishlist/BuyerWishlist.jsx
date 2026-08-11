import React from 'react';
import { useWishlistStore } from '@/store/useWishlistStore';
import ProductCard from '../Marketplace/components/ProductCard';
import { Heart, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function BuyerWishlist() {
  const { items } = useWishlistStore();
  const navigate = useNavigate();

  // Stagger variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pt-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20 relative overflow-hidden">
      {/* Ambient background blur */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-rose-400/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[30%] h-[50%] rounded-full bg-orange-300/10 blur-[100px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="relative z-10 flex items-center gap-4 mb-10 bg-white/80 backdrop-blur-xl p-6 md:p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white"
      >
        <div className="p-4 bg-rose-100/50 rounded-2xl border border-rose-200">
          <Heart className="w-8 h-8 text-rose-500 fill-rose-500 animate-pulse" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">My Wishlist</h1>
          <p className="text-gray-500 font-bold mt-1 text-sm uppercase tracking-wider">
            {items.length} {items.length === 1 ? 'item' : 'items'} saved for later
          </p>
        </div>
      </motion.div>

      {items.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-24 bg-white/80 backdrop-blur-xl rounded-[32px] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center justify-center max-w-2xl mx-auto relative z-10"
        >
          <div className="w-24 h-24 bg-rose-50/80 rounded-[24px] flex items-center justify-center mb-6 shadow-inner">
            <Heart className="w-10 h-10 text-rose-400" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-8 max-w-md font-medium leading-relaxed">
            Save your favorite fresh produce and organic finds here to easily purchase them later.
          </p>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/buyer/marketplace')}
            className="flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
          >
            <Search className="w-5 h-5" />
            Discover Products
          </motion.button>
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 relative z-10"
        >
          {items.map(product => (
            <motion.div variants={itemVariants} key={product._id || product.product_id} className="relative group">
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      )}

    </div>
  );
}
