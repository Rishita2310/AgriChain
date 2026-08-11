import React from 'react';
import { Star, CheckCircle } from 'lucide-react';

export default function ReviewsSection({ reviews, stats }) {
  if (!stats) return null;
  return (
    <div className="bg-white rounded-[32px] p-8 sm:p-12 shadow-[0_2px_40px_rgba(0,0,0,0.02)] border border-gray-100">
      <h2 className="text-2xl font-black text-gray-900 mb-10 tracking-tight">Customer Reviews</h2>
      
      <div className="flex flex-col md:flex-row gap-12 mb-12">
        {/* Overall Rating */}
        <div className="flex flex-col items-center justify-center lg:w-48 flex-shrink-0">
          <div className="text-5xl font-extrabold text-gray-900 mb-2">{stats.average_rating}</div>
          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map(star => (
              <Star 
                key={star} 
                className={`w-6 h-6 ${star <= Math.round(stats.average_rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} 
              />
            ))}
          </div>
          <div className="text-sm text-gray-500 font-medium">Based on {stats.total_reviews} reviews</div>
        </div>

        {/* Rating Distribution */}
        <div className="flex-1 flex flex-col gap-3 justify-center">
          {[5, 4, 3, 2, 1].map(rating => {
            const count = stats.rating_distribution?.[rating.toString()] || 0;
            const percentage = stats.total_reviews > 0 ? Math.round((count / stats.total_reviews) * 100) : 0;
            
            return (
              <div key={rating} className="flex items-center gap-4">
                <div className="flex items-center gap-1 w-12 text-sm font-medium text-gray-700">
                  <span>{rating}</span>
                  <Star className="w-3.5 h-3.5 text-gray-400 fill-gray-400" />
                </div>
                <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-400 rounded-full" 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="w-12 text-sm text-gray-500 text-right">{count}</div>
              </div>
            );
          })}
        </div>
      </div>

      <hr className="border-gray-100 mb-8" />

      {/* Review List */}
      <div className="space-y-6">
        {reviews?.map((review, idx) => (
          <div key={idx} className="pb-6 border-b border-gray-50 last:border-0 last:pb-0">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-lg">
                  {review.reviewer_name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{review.reviewer_name}</h4>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star 
                          key={star} 
                          className={`w-3.5 h-3.5 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} 
                        />
                      ))}
                    </div>
                    {review.verified_buyer && (
                      <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                        <CheckCircle className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <span className="text-sm text-gray-500">{new Date(review.created_at).toLocaleDateString()}</span>
            </div>
            <p className="text-gray-600 leading-relaxed text-sm md:text-base ml-13 pl-13">
              {review.comment}
            </p>
          </div>
        ))}
        {(!reviews || reviews.length === 0) && (
          <p className="text-center text-gray-500 py-4">No reviews yet.</p>
        )}
      </div>
    </div>
  );
}
