import React from 'react';
import ProductCard from '@/pages/Dashboard/Buyer/Marketplace/components/ProductCard';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function SimilarProducts({ products }) {
  if (!products || products.length === 0) return null;

  return (
    <div className="mt-12 bg-gradient-to-br from-emerald-50/80 via-white to-green-50/50 rounded-[32px] p-6 sm:p-10 border border-emerald-100/50 shadow-sm relative overflow-hidden">
      {/* Decorative Blob */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 relative z-10 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-black uppercase tracking-wider mb-4 border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5" />
            Curated For You
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight">
            Similar <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-500">Products</span>
          </h2>
          <p className="text-gray-500 font-medium mt-2">Discover other high-quality produce you might love.</p>
        </div>
        
        <button className="shrink-0 bg-white hover:bg-gray-50 text-gray-900 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm border border-gray-200 flex items-center gap-2 transition-all hover:shadow-md hover:border-gray-300 group">
          View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
      
      <div className="flex gap-6 overflow-x-auto pb-8 hide-scrollbar snap-x snap-mandatory relative z-10">
        {products.map(p => (
          <div key={p.product_id || p._id} className="w-[300px] shrink-0 snap-start">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </div>
  );
}
