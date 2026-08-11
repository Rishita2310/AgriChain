import React from 'react';
import { Star, Leaf, Fingerprint, Calendar, ShieldCheck, Box } from 'lucide-react';

export default function ProductInfo({ product, reviewStats }) {
  return (
    <div className="flex flex-col gap-5">
      {/* Title & Badges */}
      <div>
        <div className="flex flex-wrap gap-2.5 mb-5">
          {product.organic && (
            <span className="bg-emerald-50 text-emerald-700 text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded flex items-center gap-1.5 border border-emerald-100">
              <Leaf className="w-3.5 h-3.5" /> Organic Certified
            </span>
          )}
          {product.blockchain_hash && (
            <span className="bg-blue-50 text-blue-700 text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded flex items-center gap-1.5 border border-blue-100">
              <Fingerprint className="w-3.5 h-3.5" /> Verified Origin
            </span>
          )}
        </div>
        
        <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4 tracking-tight leading-[1.1]">{product.product_name}</h1>
        
        <div className="flex flex-wrap items-center gap-5 text-sm text-gray-500">
          <span className="font-bold text-gray-900 uppercase tracking-widest text-[11px]">{product.category}</span>
          <div className="flex items-center gap-1.5 font-bold">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-gray-900">{reviewStats?.average_rating > 0 ? reviewStats?.average_rating : 'New'}</span>
            <span className="text-gray-400 font-medium">({reviewStats?.total_reviews || 0} reviews)</span>
          </div>
          <span className="font-mono text-gray-400 text-xs">ID: {product.product_id?.slice(-8).toUpperCase()}</span>
        </div>
      </div>

      <div className="w-12 h-1 bg-gray-100 my-2 rounded-full" />

      {/* Price Section */}
      <div>
        <div className="flex items-baseline gap-3 mb-3">
          <span className="text-5xl font-black text-gray-900 tracking-tighter">₹{product.price}</span>
          <span className="text-gray-400 text-xl font-medium">/ {product.unit}</span>
          {product.market_price && product.market_price > product.price && (
            <span className="text-gray-300 line-through text-xl ml-2 font-medium">₹{product.market_price}</span>
          )}
        </div>
        {product.market_price && product.market_price > product.price && (
          <p className="text-emerald-600 font-bold text-sm flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            You save ₹{product.market_price - product.price} per {product.unit} compared to market rates
          </p>
        )}
      </div>

      {/* Minimalist Specs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-8">
        <div>
          <div className="flex items-center gap-2 text-gray-400 mb-1.5">
            <Box className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Stock</span>
          </div>
          <span className="font-black text-gray-900 text-lg">{product.quantity} <span className="text-sm font-medium text-gray-500">{product.unit}</span></span>
        </div>
        <div>
          <div className="flex items-center gap-2 text-gray-400 mb-1.5">
            <Calendar className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Harvested</span>
          </div>
          <span className="font-black text-gray-900 text-lg">{new Date(product.harvest_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
        <div>
          <div className="flex items-center gap-2 text-gray-400 mb-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Quality</span>
          </div>
          <span className="font-black text-gray-900 text-lg line-clamp-1">{product.quality?.freshness || 'Premium'}</span>
        </div>
        <div>
          <div className="flex items-center gap-2 text-gray-400 mb-1.5">
            <Leaf className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Variety</span>
          </div>
          <span className="font-black text-gray-900 text-lg line-clamp-1">{product.variety || 'Standard'}</span>
        </div>
      </div>
    </div>
  );
}
