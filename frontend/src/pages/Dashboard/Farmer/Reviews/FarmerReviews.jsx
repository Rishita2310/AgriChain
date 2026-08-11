import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../../../store/useAuthStore';
import api from '@/services/api';
import { Star, MessageSquare, ThumbsUp, Calendar, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FarmerReviews() {
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!user?.wallet_address) return;
      try {
        const response = await api.get(`/reviews/farmer/${user.wallet_address}`);
        setReviews(response.data);
      } catch (err) {
        toast.error("Failed to load reviews");
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [user]);

  const handleHelpful = async (reviewId) => {
    try {
      await api.post(`/reviews/helpful/${reviewId}`);
      toast.success("Marked as helpful");
      setReviews(reviews.map(r => r._id === reviewId ? { ...r, helpful_count: (r.helpful_count || 0) + 1 } : r));
    } catch (err) {
      toast.error("Failed to mark as helpful");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading your reviews...</p>
      </div>
    );
  }

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
    : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Customer Reviews</h1>
          <p className="text-gray-500 mt-2">See what buyers are saying about your farm products.</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
            <span className="text-3xl font-black text-gray-900">{avgRating}</span>
          </div>
          <div className="h-10 w-px bg-gray-200"></div>
          <div>
            <p className="text-sm font-bold text-gray-900">{reviews.length} Reviews</p>
            <p className="text-xs text-gray-500">Lifetime total</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-gray-100 shadow-sm text-center">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Reviews Yet</h3>
            <p className="text-gray-500">Once buyers receive your products, their reviews will appear here.</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-6 hover:shadow-md transition-shadow">
              <div className="flex-1">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900">{review.buyer_name || 'Verified Buyer'}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3" /> {new Date(review.created_at || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                    ))}
                  </div>
                </div>
                <h4 className="text-sm font-bold text-gray-700 mb-2">Product: <span className="text-primary">{review.product_name || 'Farm Product'}</span></h4>
                <p className="text-gray-600 leading-relaxed mb-4">{review.comment}</p>
                
                <div className="flex items-center gap-4 border-t border-gray-100 pt-4">
                  <button 
                    onClick={() => handleHelpful(review._id)}
                    className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-primary transition-colors bg-gray-50 hover:bg-green-50 px-3 py-1.5 rounded-lg border border-gray-100 hover:border-green-200"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Helpful ({review.helpful_count || 0})
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
