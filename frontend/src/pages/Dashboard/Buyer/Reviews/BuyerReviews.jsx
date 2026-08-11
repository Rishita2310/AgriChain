import React, { useEffect, useState } from 'react';
import axios from '@/services/api';
import { Star, Loader2, ThumbsUp, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAccount } from 'wagmi';

export default function BuyerReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { address: buyerWallet } = useAccount();

  useEffect(() => {
    if (buyerWallet) fetchReviews();
  }, [buyerWallet]);

  const fetchReviews = async () => {
    try {
      // Create reviews endpoint if needed, but for now we'll fetch from the backend we created
      const res = await axios.get(`/reviews/buyer/${buyerWallet}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setReviews(res.data);
    } catch (err) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 text-green-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading your reviews...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12 animate-in fade-in duration-300">
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Reviews</h1>
        <p className="text-sm text-gray-500 mt-1">Your feedback helps build trust in the AgriChain community.</p>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <Star className="w-16 h-16 text-gray-300 mx-auto mb-4 fill-current" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">No Reviews Yet</h3>
          <p className="text-gray-500 mb-6">You haven't submitted any reviews for your completed orders.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review._id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6">
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(star => (
                      <Star key={star} className={`w-5 h-5 ${review.rating >= star ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} />
                    ))}
                    <span className="ml-2 font-bold text-gray-700">{review.rating}.0</span>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString()}</span>
                </div>

                <p className="text-gray-700 mb-4 whitespace-pre-wrap">{review.comment}</p>

                {review.tags && review.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {review.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
                  <span className="flex items-center gap-1"><ThumbsUp className="w-4 h-4" /> {review.helpful_count || 0} Helpful</span>
                  {review.is_anonymous && (
                    <span className="bg-gray-100 px-2 py-1 rounded text-gray-600">Posted Anonymously</span>
                  )}
                </div>
              </div>

              <div className="w-full md:w-64 bg-gray-50 rounded-xl p-4 border border-gray-100 self-start">
                 <p className="text-xs text-gray-400 uppercase font-bold mb-2">Blockchain Record</p>
                 <div className="flex items-center gap-2 text-green-700 bg-green-100/50 p-2 rounded-lg mb-3 border border-green-200 text-xs font-bold">
                    <ShieldCheck className="w-4 h-4" /> Verified on Arbitrum
                 </div>
                 {review.blockchain_tx_hash && (
                   <div>
                     <p className="text-[10px] text-gray-400 mb-1">Tx Hash</p>
                     <p className="text-xs font-mono text-gray-600 truncate bg-white p-2 rounded border border-gray-200">
                       {review.blockchain_tx_hash}
                     </p>
                   </div>
                 )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
