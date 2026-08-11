import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Star, ShieldCheck, Heart, ShoppingCart, Leaf, PackageCheck } from 'lucide-react';
import { getProductImageUrl } from '@/services/product.service';
import { motion } from 'framer-motion';
import { useWishlistStore } from '@/store/useWishlistStore';

const ProductCard = ({ product, listView = false }) => {
  const navigate = useNavigate();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  const isOrganic = product.organic;
  const isVerified = product.blockchain_hash != null;
  const prodId = product.product_id || product._id || product.id;
  const imageUrl = getProductImageUrl(product.images?.[0]) || 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=600&auto=format&fit=crop';
  
  const inWishlist = isInWishlist(prodId);

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(prodId);
    } else {
      addToWishlist(product);
    }
  };

  if (listView) {
    return (
      <motion.div 
        whileHover={{ y: -3, scale: 1.01 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="bg-white rounded-[24px] p-4 sm:p-5 shadow-[0_4px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-gray-100 transition-all duration-300 flex flex-col sm:flex-row items-center gap-6 cursor-pointer relative group"
        onClick={() => navigate(`/product/${prodId}`)}
      >
        {/* Thumbnail */}
        <div className="relative w-full sm:w-48 h-44 rounded-[16px] overflow-hidden bg-gray-50 shrink-0">
          <img 
            src={imageUrl} 
            onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=600&auto=format&fit=crop'; }}
            alt={product.product_name || "Product"} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-2 left-2 flex flex-col gap-1.5">
            {isOrganic && (
              <span className="bg-white/95 backdrop-blur-md text-gray-900 text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1.5">
                <Leaf className="w-3 h-3 text-emerald-600" /> Organic
              </span>
            )}
            {isVerified && (
              <span className="bg-white/95 backdrop-blur-md text-gray-900 text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-blue-600" /> Verified
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 w-full py-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-black text-gray-900 text-xl group-hover:text-emerald-700 transition-colors">
                {product.product_name}
              </h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">
                Cultivator: <span className="text-gray-700">{product.farmer_name || `Farmer #${String(product.farmer_id || '').slice(0, 6)}`}</span>
              </p>
            </div>
            <button
              onClick={handleWishlistClick}
              className={`p-2.5 rounded-full backdrop-blur-md transition-all border shadow-sm ${
                inWishlist 
                  ? 'bg-rose-50 border-rose-100 text-rose-500' 
                  : 'bg-white hover:bg-gray-50 border-gray-100 text-gray-400 hover:text-rose-500'
              }`}
            >
              <Heart className={`w-4 h-4 ${inWishlist ? 'fill-rose-500' : ''}`} />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-gray-500">
            <div className="flex items-center gap-1.5 font-bold text-gray-700">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{product.rating > 0 ? product.rating : 'New'}</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-gray-200"></div>
            <div className="flex items-center gap-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              <span>{product.location?.village ? `${product.location?.village}, ` : ''}{product.location?.state || 'India'}</span>
            </div>
            {product.quantity && (
              <>
                <div className="w-1 h-1 rounded-full bg-gray-200"></div>
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                  <PackageCheck className="w-4 h-4 text-emerald-600" />
                  <span>{product.quantity} {product.unit} available</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Price & CTA */}
        <div className="flex sm:flex-col items-center sm:items-end justify-center w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-100 gap-4 shrink-0 pl-0 sm:pl-6 sm:border-l">
          <div className="text-left sm:text-right">
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Price</div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-gray-900 tracking-tight">₹{product.price}</span>
              <span className="text-xs text-gray-500 font-medium">/{product.unit}</span>
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/product/${prodId}`); }}
            className="px-6 py-3 rounded-2xl bg-gray-900 hover:bg-emerald-600 text-white font-bold text-sm transition-all shadow-md hover:shadow-emerald-600/20 flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Buy Now</span>
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      className="bg-white rounded-[28px] overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_40px_rgba(0,0,0,0.08)] transition-all duration-300 border border-gray-100 group flex flex-col cursor-pointer relative"
      onClick={() => navigate(`/product/${prodId}`)}
    >
      {/* Image Container */}
      <div className="relative h-60 overflow-hidden bg-gray-50 p-2">
        <div className="w-full h-full rounded-[20px] overflow-hidden relative">
          <motion.img 
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            src={imageUrl} 
            onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=600&auto=format&fit=crop'; }}
            alt={product.product_name || "Product"} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        
        {/* Badges */}
        <div className="absolute top-5 left-5 flex flex-col gap-1.5 z-10">
          {isOrganic && (
            <div className="bg-white/95 backdrop-blur-md text-gray-900 text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5">
              <Leaf className="w-3 h-3 text-emerald-600" />
              Organic
            </div>
          )}
          {isVerified && (
            <div className="bg-white/95 backdrop-blur-md text-gray-900 text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-blue-600" />
              Verified
            </div>
          )}
        </div>

        {/* Wishlist Button */}
        <div className="absolute top-5 right-5 z-10">
          <motion.button 
            onClick={handleWishlistClick}
            whileTap={{ scale: 0.9 }}
            className={`p-2.5 rounded-full backdrop-blur-md transition-all shadow-sm ${
              inWishlist 
                ? 'bg-rose-50 text-rose-500' 
                : 'bg-white/90 hover:bg-white text-gray-400 hover:text-rose-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-rose-500' : ''}`} />
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow bg-white">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-black text-gray-900 text-lg leading-snug line-clamp-1 group-hover:text-emerald-700 transition-colors">
              {product.product_name}
            </h3>
            <p className="text-xs text-gray-400 font-bold tracking-wide uppercase mt-1">
              {product.farmer_name || String(product.farmer_id || '').slice(0, 8)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>{product.rating > 0 ? product.rating : 'New'}</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-gray-200"></div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
            <MapPin className="w-3.5 h-3.5 text-gray-400" />
            <span className="truncate max-w-[130px]">{product.location?.village ? `${product.location?.village}, ` : ''}{product.location?.state || 'India'}</span>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-gray-50 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Price</div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-gray-900 tracking-tight">₹{product.price}</span>
              <span className="text-xs font-medium text-gray-500">/{product.unit}</span>
            </div>
          </div>
          
          <button 
            onClick={(e) => { e.stopPropagation(); navigate(`/product/${prodId}`); }}
            className="w-12 h-12 rounded-2xl bg-gray-900 text-white flex items-center justify-center group-hover:bg-emerald-600 transition-colors shadow-md group-hover:shadow-emerald-600/20"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
