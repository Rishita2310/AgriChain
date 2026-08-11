import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getProductImageUrl } from '@/services/product.service';

export default function ImageGallery({ images, productName }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const displayImages = images && images.length > 0 
    ? images 
    : ['https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=800&auto=format&fit=crop'];

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <motion.div 
        whileHover={{ scale: 1.02, y: -5 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative aspect-square md:aspect-[4/3] rounded-[32px] overflow-hidden bg-gray-50 cursor-zoom-in group border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_30px_60px_-15px_rgba(16,185,129,0.3)] transition-shadow duration-500"
        onClick={() => setIsFullscreen(true)}
      >
        <motion.img 
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          key={currentIndex}
          src={getProductImageUrl(displayImages[currentIndex])} 
          alt={productName} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=800&auto=format&fit=crop';
          }}
        />
        <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-xl text-gray-900 px-4 py-1.5 rounded-full text-xs font-black tracking-widest shadow-[0_8px_20px_rgba(0,0,0,0.1)] border border-white/50">
          {currentIndex + 1} / {displayImages.length}
        </div>
      </motion.div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar px-1 pt-1">
          {displayImages.map((img, idx) => (
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`relative flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                idx === currentIndex ? 'border-emerald-500 ring-4 ring-emerald-500/20 shadow-[0_8px_20px_rgba(16,185,129,0.3)]' : 'border-transparent hover:border-emerald-200 shadow-sm'
              }`}
            >
              <img 
                src={getProductImageUrl(img)} 
                alt={`Thumbnail ${idx}`} 
                className="w-full h-full object-cover" 
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=800&auto=format&fit=crop';
                }}
              />
              {idx === currentIndex && (
                <motion.div 
                  layoutId="active-thumbnail"
                  className="absolute inset-0 border-2 border-emerald-500 rounded-2xl pointer-events-none"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </div>
      )}

      {/* Fullscreen Overlay */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setIsFullscreen(false)}
          >
            <img 
              src={getProductImageUrl(displayImages[currentIndex])} 
              alt={productName} 
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
