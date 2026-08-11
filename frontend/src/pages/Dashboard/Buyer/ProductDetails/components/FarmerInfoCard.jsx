import React from 'react';
import { ShieldCheck, MessageCircle, Phone, ExternalLink, MapPin, Award } from 'lucide-react';
import { getProductImageUrl } from '@/services/product.service';

export default function FarmerInfoCard({ farmer }) {
  if (!farmer) return null;

  return (
    <div className="bg-white rounded-[32px] p-8 sm:p-10 shadow-[0_2px_40px_rgba(0,0,0,0.02)] border border-gray-100 transition-all duration-500 hover:shadow-[0_10px_50px_rgba(0,0,0,0.06)] flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
      <div className="flex gap-6 items-center">
        <div className="relative shrink-0">
          <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-sm">
            <img 
              src={farmer.profile_photo ? getProductImageUrl(farmer.profile_photo) : 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'} 
              alt={farmer.name} 
              className="w-full h-full object-cover"
            />
          </div>
          {farmer.is_verified && (
            <div className="absolute -bottom-3 -right-3 bg-white rounded-xl p-1.5 shadow-sm border border-gray-50">
              <ShieldCheck className="w-6 h-6 text-blue-500" />
            </div>
          )}
        </div>

        <div>
          <h3 className="text-2xl font-black text-gray-900 mb-1 tracking-tight">{farmer.name}</h3>
          <p className="text-gray-400 font-bold text-xs mb-4 uppercase tracking-widest">{farmer.farm_name}</p>
          
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5 font-medium">
              <MapPin className="w-4 h-4 text-gray-400" />
              {farmer.location}
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Award className="w-4 h-4 text-gray-400" />
              {farmer.experience} Exp
            </span>
            <span className="text-gray-900 font-bold flex items-center gap-1.5">
              ⭐ {farmer.rating > 0 ? farmer.rating : 'New'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap lg:flex-row gap-3 w-full md:w-auto mt-2 md:mt-0">
        <a 
          href={`mailto:${farmer.email || ''}`}
          className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white px-6 py-3.5 rounded-2xl font-bold transition-all shadow-md text-sm tracking-wide"
        >
          <MessageCircle className="w-4 h-4" /> Message
        </a>
        <a 
          href={`tel:${farmer.phone_number || ''}`}
          className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-900 px-6 py-3.5 rounded-2xl font-bold transition-all shadow-sm text-sm tracking-wide"
        >
          <Phone className="w-4 h-4" /> Call
        </a>
        <button 
          onClick={() => alert("Public profile page coming soon!")}
          className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-900 px-6 py-3.5 rounded-2xl font-bold transition-all shadow-sm text-sm tracking-wide"
        >
          <ExternalLink className="w-4 h-4" /> Profile
        </button>
      </div>
    </div>
  );
}
