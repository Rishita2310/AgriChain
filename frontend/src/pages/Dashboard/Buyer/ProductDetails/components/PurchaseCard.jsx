import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Minus, Plus, Truck, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { productService } from '../../../../../services/product.service';
import { motion } from 'framer-motion';

import { useWishlistStore } from '@/store/useWishlistStore';

export default function PurchaseCard({ product }) {
  const [quantity, setQuantity] = useState(product.availability?.min_order_quantity || 1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { items, addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  const prodId = product.product_id || product._id || product.id;
  const inWishlist = isInWishlist(prodId);

  const totalPrice = quantity * product.price;

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      await productService.addToCart({ productId: product.product_id, quantity });
      toast.success('Added to Cart!');
    } catch (err) {
      toast.error('Failed to add to cart');
    } finally {
      setLoading(false);
    }
  };


  const handleBuyNow = () => {
    navigate(`/checkout/${product.product_id}?qty=${quantity}`);
  };

  const handleWishlistClick = (e) => {
    if (inWishlist) {
      removeFromWishlist(prodId);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <motion.div 
      className="bg-white rounded-[32px] p-8 shadow-[0_4px_40px_rgba(0,0,0,0.04)] border border-gray-100 sticky top-32 w-full transition-all duration-300"
    >
      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Order Details</h3>
      
      {/* Quantity Selector */}
      <div className="mb-8">
        <span className="text-gray-900 font-bold text-sm block mb-3">Quantity ({product.unit})</span>
        <div className="flex items-center justify-between bg-gray-50/50 rounded-2xl p-2 border border-gray-100">
          <button 
            onClick={() => setQuantity(Math.max(product.availability?.min_order_quantity || 1, quantity - 1))}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-gray-900 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md transition-all active:scale-95"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="font-black text-xl text-gray-900 tabular-nums w-12 text-center">{quantity}</span>
          <button 
            onClick={() => setQuantity(quantity + 1)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-gray-900 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="space-y-4 mb-8">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">Subtotal</span>
          <span className="font-bold text-gray-900">₹{totalPrice.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">Shipping</span>
          <span className="font-bold text-emerald-600">Calculated at checkout</span>
        </div>
        <div className="pt-4 border-t border-gray-50 flex justify-between items-end">
          <span className="text-gray-900 font-bold uppercase tracking-widest text-xs mb-1">Total</span>
          <span className="text-3xl font-black text-gray-900 tracking-tighter tabular-nums">
            ₹{totalPrice.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-4">
        <motion.button 
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleBuyNow}
          className="relative overflow-hidden w-full bg-gray-900 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-[0_10px_30px_rgba(0,0,0,0.1)] hover:shadow-[0_10px_40px_rgba(0,0,0,0.15)] flex items-center justify-center gap-3 group text-sm tracking-wide"
        >
          <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
          <span className="relative z-10 flex items-center gap-2">
            Buy Now
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </span>
        </motion.button>
        
        <div className="flex gap-4 w-full">
          <motion.button 
            whileHover={{ scale: 1.01, backgroundColor: "#f9fafb" }}
            whileTap={{ scale: 0.99 }}
            onClick={handleAddToCart}
            disabled={loading}
            className="flex-1 bg-white text-gray-900 border border-gray-200 font-bold py-4 px-4 rounded-2xl transition-all hover:border-gray-300 flex items-center justify-center gap-2 text-sm tracking-wide shadow-sm hover:shadow-md"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Add to Cart</span>
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleWishlistClick}
            className={`w-14 h-14 shrink-0 rounded-2xl border transition-all flex items-center justify-center ${
              inWishlist 
                ? 'border-rose-100 bg-rose-50 text-rose-500 shadow-inner' 
                : 'border-gray-200 hover:border-rose-200 hover:bg-rose-50/50 text-gray-400 hover:text-rose-500 bg-white shadow-sm hover:shadow-md'
            }`}
          >
            <Heart className={`w-5 h-5 transition-all ${inWishlist ? 'fill-rose-500' : ''}`} />
          </motion.button>
        </div>
      </div>

      {/* Shipping Info */}
      <div className="mt-8 flex items-center gap-4 bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
        <div className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-100 shrink-0">
          <Truck className="w-5 h-5 text-gray-600" />
        </div>
        <div className="min-w-0">
          <h4 className="font-bold text-gray-900 text-xs uppercase tracking-widest">Direct from Farm</h4>
          <p className="text-xs text-gray-500 mt-1">
            Shipped directly by the farmer for maximum freshness.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
