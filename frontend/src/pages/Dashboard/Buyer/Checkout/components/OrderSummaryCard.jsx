import React from 'react';
import { Package, MapPin, Leaf, ShieldCheck } from 'lucide-react';
import { getProductImageUrl } from '@/services/product.service';

export default function OrderSummaryCard({ product, quantity, setQuantity }) {
  if (!product) return null;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
      
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="w-full sm:w-32 h-32 bg-gray-50 rounded-xl overflow-hidden shrink-0">
          <img 
            src={product.images?.[0] ? getProductImageUrl(product.images[0]) : 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=200&auto=format&fit=crop'} 
            alt={product.product_name}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=200&auto=format&fit=crop'; }}
          />
        </div>
        
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap gap-2 mb-2">
              {product.organic && (
                <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 uppercase tracking-wider">
                  <Leaf className="w-3 h-3" /> Organic
                </span>
              )}
              {product.blockchain_hash && (
                <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 uppercase tracking-wider">
                  <ShieldCheck className="w-3 h-3" /> Verified
                </span>
              )}
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 leading-tight">{product.product_name}</h3>
            <p className="text-sm text-gray-500 mb-2">{product.category} • Farmer ID: {product.wallet_address?.slice(0, 8)}...</p>
          </div>

          <div className="flex flex-wrap items-end justify-between mt-4">
            <div>
              <div className="text-2xl font-extrabold text-green-700">₹{product.price}</div>
              <div className="text-xs text-gray-500">per {product.unit}</div>
            </div>

            <div className="mt-4 sm:mt-0 flex flex-col items-end">
              <label className="text-xs font-semibold text-gray-500 mb-1">Quantity</label>
              <div className="flex items-center gap-3 bg-gray-50 p-1 rounded-lg border border-gray-200">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-700 font-medium hover:bg-gray-100"
                >
                  -
                </button>
                <span className="w-8 text-center font-bold text-gray-900">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                  className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-700 font-medium hover:bg-gray-100"
                >
                  +
                </button>
              </div>
              <span className="text-[10px] text-gray-400 mt-1">{product.quantity} {product.unit} available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
