import React, { useState } from 'react';
import { Star, Upload, X, ShieldCheck, Loader2, Image as ImageIcon } from 'lucide-react';

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
    // Mock the upload by creating object URLs
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
      images // passing mocked images
    });
  };

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
      <h3 className="text-2xl font-bold text-gray-900 mb-2">Leave Your Review</h3>
      <p className="text-gray-500 text-sm mb-8">Share your buying experience to help other buyers and improve transparency.</p>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Interactive Star Rating */}
        <div className="flex flex-col items-center p-6 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="flex gap-2 mb-3">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transform transition-transform hover:scale-110 focus:outline-none"
              >
                <Star 
                  className={`w-12 h-12 transition-colors duration-200 ${
                    (hoverRating || rating) >= star ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          <span className="font-bold text-lg text-gray-700">{getRatingText()}</span>
        </div>

        {/* Comment Section */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">Detailed Feedback</label>
          <div className="relative">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 1000))}
              placeholder="Tell us about product quality, freshness, packaging, and farmer communication..."
              className="w-full bg-white border border-gray-200 rounded-xl p-4 min-h-[120px] focus:ring-2 focus:ring-green-500 outline-none text-sm resize-none"
              required
            ></textarea>
            <div className={`absolute bottom-3 right-3 text-xs font-medium ${comment.length < 20 ? 'text-red-500' : 'text-gray-400'}`}>
              {comment.length} / 1000
            </div>
          </div>
          {comment.length > 0 && comment.length < 20 && (
            <p className="text-xs text-red-500 mt-1">Minimum 20 characters required.</p>
          )}
        </div>

        {/* Tags Selection */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">Quick Tags (Optional)</label>
          <div className="flex flex-wrap gap-2">
            {TAGS.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagToggle(tag)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-colors border ${
                  selectedTags.includes(tag) 
                    ? 'bg-green-100 border-green-200 text-green-700' 
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Image Upload (Mock) */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">Add Photos (Max 5)</label>
          <div className="flex flex-wrap gap-4">
            {images.map((img, idx) => (
              <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 group">
                <img src={img} alt="review" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {images.length < 5 && (
              <label className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-green-500 hover:text-green-500 transition-colors cursor-pointer bg-gray-50">
                <Upload className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">Upload</span>
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageMockUpload} />
              </label>
            )}
          </div>
        </div>

        {/* Anonymous Toggle */}
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
          <input 
            type="checkbox" 
            id="anonymous"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="w-5 h-5 rounded text-green-600 focus:ring-green-500"
          />
          <label htmlFor="anonymous" className="text-sm text-gray-700 cursor-pointer flex-1">
            <span className="font-bold block">Post Anonymously</span>
            <span className="text-gray-500 text-xs">Your name will be hidden from the public review, but stored internally for verification.</span>
          </label>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting || rating === 0 || comment.length < 20}
          className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-black transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-xl shadow-gray-900/20"
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
