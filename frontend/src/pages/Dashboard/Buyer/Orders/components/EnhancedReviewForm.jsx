import React, { useState } from 'react';
import { Star, Upload, X, ShieldCheck, Loader2, MessageSquareHeart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TAGS = [
  "Fresh Produce", "Organic", "Fast Delivery", "Good Packaging", 
  "Accurate Quantity", "Reasonable Price", "Highly Recommended", 
  "Friendly Farmer", "Excellent Quality", "Needs Improvement", 
  "Late Delivery", "Poor Packaging"
];

export default function EnhancedReviewForm({ onSubmit, isSubmitting }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [images, setImages] = useState([]); // Array of strings (mocked URLs)

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleImageMockUpload = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      alert("You can only upload up to 5 images.");
      return;
    }
    const newImages = files.map(f => URL.createObjectURL(f));
    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
  };

  const getRatingText = () => {
    const val = hoverRating || rating;
    switch(val) {
      case 1: return "Very Bad 😠";
      case 2: return "Bad 😞";
      case 3: return "Average 😐";
      case 4: return "Good 😊";
      case 5: return "Excellent 🤩";
      default: return "Select your rating";
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) return alert("Please select a star rating");
    if (comment.length < 20) return alert("Comment must be at least 20 characters");
    
    onSubmit({
      rating,
      comment,
      tags: selectedTags,
      is_anonymous: isAnonymous,
      images
    });
  };

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] p-8 sm:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white relative overflow-hidden">
      {/* Decorative gradient blur */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100/40 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      
      <div className="flex items-center gap-4 mb-3">
        <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center shrink-0">
          <MessageSquareHeart className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">Leave Your Review</h3>
          <p className="text-gray-500 text-sm font-medium">Your feedback helps improve the AgriChain community.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 mt-8">
        
        {/* Interactive Star Rating */}
        <div className="flex flex-col items-center p-8 bg-gray-50/50 rounded-3xl border border-gray-100 shadow-inner">
          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transform transition-all hover:scale-110 focus:outline-none focus:ring-4 focus:ring-emerald-100 rounded-full p-1"
              >
                <Star 
                  className={`w-12 h-12 transition-all duration-300 ${
                    (hoverRating || rating) >= star 
                      ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]' 
                      : 'text-gray-200 fill-gray-50 hover:fill-gray-100'
                  }`}
                />
              </button>
            ))}
          </div>
          <motion.span 
            key={hoverRating || rating}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`font-black text-lg ${rating > 0 || hoverRating > 0 ? 'text-gray-800' : 'text-gray-400'}`}
          >
            {getRatingText()}
          </motion.span>
        </div>

        {/* Comment Section */}
        <div>
          <label className="block text-sm font-black text-gray-800 mb-3 uppercase tracking-wider">Detailed Feedback</label>
          <div className="relative group">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 1000))}
              placeholder="Tell us about product quality, freshness, packaging, and farmer communication..."
              className="w-full bg-gray-50/50 group-hover:bg-gray-50 border border-gray-200 rounded-[1.5rem] p-5 min-h-[140px] focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none text-sm resize-none transition-all duration-300 shadow-sm"
              required
            ></textarea>
            <div className={`absolute bottom-4 right-4 text-xs font-bold px-2 py-1 rounded-md backdrop-blur-sm ${comment.length < 20 ? 'text-rose-500 bg-rose-50' : 'text-emerald-600 bg-emerald-50'}`}>
              {comment.length} / 1000
            </div>
          </div>
          {comment.length > 0 && comment.length < 20 && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-rose-500 mt-2 font-medium pl-2">
              Minimum 20 characters required.
            </motion.p>
          )}
        </div>

        {/* Tags Selection */}
        <div>
          <label className="block text-sm font-black text-gray-800 mb-3 uppercase tracking-wider">Quick Tags <span className="text-gray-400 font-medium normal-case tracking-normal">(Optional)</span></label>
          <div className="flex flex-wrap gap-2.5">
            {TAGS.map(tag => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 border shadow-sm ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-emerald-100/50 scale-105' 
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Image Upload (Mock) */}
        <div>
          <label className="block text-sm font-black text-gray-800 mb-3 uppercase tracking-wider">Add Photos <span className="text-gray-400 font-medium normal-case tracking-normal">(Max 5)</span></label>
          <div className="flex flex-wrap gap-4">
            <AnimatePresence>
              {images.map((img, idx) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  key={idx} 
                  className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-emerald-100 group shadow-sm"
                >
                  <img src={img} alt="review" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <button type="button" onClick={() => removeImage(idx)} className="absolute top-1.5 right-1.5 bg-black/60 backdrop-blur-sm text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            {images.length < 5 && (
              <label className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all cursor-pointer bg-gray-50/50 group">
                <Upload className="w-6 h-6 mb-2 group-hover:-translate-y-1 transition-transform" />
                <span className="text-xs font-bold tracking-wide">UPLOAD</span>
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageMockUpload} />
              </label>
            )}
          </div>
        </div>

        {/* Anonymous Toggle */}
        <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="pt-0.5">
            <input 
              type="checkbox" 
              id="anonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-5 h-5 rounded-md border-gray-300 text-emerald-600 focus:ring-emerald-500 transition-colors cursor-pointer"
            />
          </div>
          <label htmlFor="anonymous" className="cursor-pointer flex-1 select-none">
            <span className="font-bold text-gray-900 block mb-1">Post Anonymously</span>
            <span className="text-gray-500 text-xs font-medium leading-relaxed block">
              Your name will be hidden from the public review, but stored internally for verification purposes.
            </span>
          </label>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting || rating === 0 || comment.length < 20}
          className="w-full py-4.5 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-black text-lg hover:from-emerald-500 hover:to-teal-500 transition-all flex items-center justify-center gap-3 disabled:from-gray-300 disabled:to-gray-400 disabled:text-gray-500 disabled:cursor-not-allowed shadow-[0_8px_25px_rgba(16,185,129,0.3)] disabled:shadow-none hover:shadow-[0_12px_30px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 min-h-[64px]"
        >
          {isSubmitting ? (
            <><Loader2 className="w-6 h-6 animate-spin" /> Submitting to Blockchain...</>
          ) : (
            <><ShieldCheck className="w-6 h-6" /> Submit Verified Review</>
          )}
        </button>

      </form>
    </div>
  );
}
