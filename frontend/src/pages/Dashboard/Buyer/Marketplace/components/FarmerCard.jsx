import React from 'react';
import { MapPin, Star, ShieldCheck, Navigation } from 'lucide-react';
import { getProductImageUrl } from '@/services/product.service';
import { motion } from 'framer-motion';

const FarmerCard = ({ farmer }) => {
  const distance = farmer.distance?.toFixed(1) || 'N/A'; 
  
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md border border-gray-100 transition-all flex flex-col gap-4"
    >
      <div className="flex items-start gap-4">
        <div className="relative">
          <img 
            src={farmer.profile_photo ? getProductImageUrl(farmer.profile_photo) : 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'} 
            alt={farmer.full_name} 
            className="w-16 h-16 rounded-full object-cover border-2 border-green-50"
            onError={(e) => { e.target.onerror = null; e.target.src = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'; }}
          />
          {farmer.is_verified && (
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
              <ShieldCheck className="w-5 h-5 text-blue-500 fill-blue-50" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-900 truncate">{farmer.full_name}</h4>
          <p className="text-sm text-gray-500 truncate">{farmer.farmer_details?.farm_name || 'Independent Farm'}</p>
          
          <div className="flex items-center gap-3 mt-1.5">
            <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              {farmer.farmer_details?.rating || 'N/A'}
            </div>
            <div className="w-1 h-1 rounded-full bg-gray-300"></div>
            <div className="text-sm text-gray-600">
              {farmer.farmer_details?.total_products || 0} Products
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5 text-gray-600">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="truncate max-w-[150px]">{farmer.city || farmer.farmer_details?.farm_address || 'Local Region'}</span>
          </div>
          <div className="flex items-center gap-1 text-green-700 font-medium bg-green-50 px-2 py-0.5 rounded-full">
            <Navigation className="w-3 h-3" />
            {distance} km
          </div>
        </div>
        
        <div className="flex gap-2 mt-2">
          <button className="flex-1 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 rounded-xl transition-colors text-sm">
            Visit Farm
          </button>
          <button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-xl shadow-sm transition-colors text-sm">
            Products
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default FarmerCard;
