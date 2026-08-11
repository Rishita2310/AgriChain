import React, { useEffect, useState } from 'react';
import { aiService } from '../../../../services/ai.service';
import { getProductImageUrl } from '../../../../services/product.service';
import { Brain, MapPin, Tag, ShieldCheck, Leaf, ArrowRight, Loader2, RefreshCw, ThumbsUp, ThumbsDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function BuyerAIFeatures() {
  const [recommendations, setRecommendations] = useState([]);
  const [nearbySellers, setNearbySellers] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const fetchAIInsights = async () => {
    try {
      setRefreshing(true);
      const [recData, sellersData, dealsData] = await Promise.all([
        aiService.getBuyerRecommendations(),
        aiService.getBuyerNearbySellers(),
        aiService.getBuyerDeals()
      ]);
      setRecommendations(recData.recommendations);
      setNearbySellers(sellersData.nearby_sellers);
      setDeals(dealsData.deals);
    } catch (err) {
      toast.error('Failed to load AI recommendations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAIInsights();
  }, []);

  const handleFeedback = async (type, isHelpful) => {
    toast.success('Thank you for the feedback!');
    await aiService.sendBuyerFeedback({ type, isHelpful });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Brain className="w-16 h-16 text-primary animate-pulse mb-4" />
        <p className="text-xl font-bold text-gray-800">Analyzing Your Preferences...</p>
        <p className="text-gray-500 mt-2">Curating the best products and deals for you</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <Brain className="w-8 h-8 text-primary" /> AI Recommendations
          </h1>
          <p className="text-gray-500 mt-2">Personalized insights based on your buying habits and location.</p>
        </div>
        <button 
          onClick={fetchAIInsights}
          disabled={refreshing}
          className="px-5 py-2.5 bg-white border border-gray-200 hover:border-primary text-gray-700 hover:text-primary rounded-xl font-bold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          Generate New Insights
        </button>
      </div>

      {/* Recommended Products */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Top Picks For You</h2>
          <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">AI Curated</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((rec, i) => (
            <div key={i} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
              <div className="h-48 bg-gray-100 relative overflow-hidden">
                <img src={getProductImageUrl(rec.product.images[0])} alt={rec.product.product_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=400'; }} />
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-900 flex items-center gap-1 shadow-sm">
                    {rec.confidence_score}% Match
                  </span>
                  {rec.product.is_organic && (
                    <span className="bg-green-500/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1 shadow-sm">
                      <Leaf className="w-3 h-3" /> Organic
                    </span>
                  )}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{rec.product.product_name}</h3>
                <p className="text-2xl font-black text-primary mb-4">₹{rec.product.price} <span className="text-sm text-gray-500 font-normal">/ {rec.product.unit}</span></p>
                
                <div className="bg-blue-50 rounded-xl p-3 mb-6 border border-blue-100">
                  <p className="text-xs text-blue-800 flex gap-2">
                    <Brain className="w-4 h-4 flex-shrink-0" />
                    <span><span className="font-bold">Why?</span> {rec.ai_reason}</span>
                  </p>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => navigate(`/buyer/product/${rec.product.product_id}`)}
                    className="flex-1 bg-gray-900 hover:bg-black text-white py-3 rounded-xl font-bold transition-colors"
                  >
                    View Product
                  </button>
                  <div className="flex gap-1">
                    <button onClick={() => handleFeedback('rec', true)} className="px-3 border border-gray-200 hover:bg-gray-50 rounded-xl"><ThumbsUp className="w-4 h-4 text-gray-500" /></button>
                    <button onClick={() => handleFeedback('rec', false)} className="px-3 border border-gray-200 hover:bg-gray-50 rounded-xl"><ThumbsDown className="w-4 h-4 text-gray-500" /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Best Deals */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-2xl font-bold text-gray-900">High-Value Deals</h2>
          <span className="px-3 py-1 bg-orange-100 text-orange-600 text-xs font-bold rounded-full flex items-center gap-1"><Tag className="w-3 h-3" /> Savings</span>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {deals.map((deal, i) => (
            <div key={i} className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-6 border border-orange-100 flex flex-col sm:flex-row gap-6 items-center">
              <div className="w-32 h-32 flex-shrink-0 rounded-2xl overflow-hidden shadow-sm bg-white">
                <img src={getProductImageUrl(deal.product.images[0])} alt={deal.product.product_name} className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=400'; }} />
              </div>
              <div className="flex-1 w-full">
                <div className="flex justify-between items-start mb-2">
                  <span className="bg-red-500 text-white px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">
                    {deal.deal_badge}
                  </span>
                  <span className="text-xs font-bold text-orange-600">Ends in {deal.offer_ends_in}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{deal.product.product_name}</h3>
                
                <div className="flex items-baseline gap-2 mb-4">
                  <p className="text-3xl font-black text-red-600">₹{deal.discounted_price}</p>
                  <p className="text-sm font-bold text-gray-400 line-through">₹{deal.original_price}</p>
                  <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Save {deal.savings_percentage.toFixed(0)}%</span>
                </div>
                
                <div className="flex justify-between items-center border-t border-orange-200/50 pt-4">
                  <p className="text-xs text-orange-800 max-w-[200px]"><span className="font-bold">AI Note:</span> {deal.ai_reason}</p>
                  <button 
                    onClick={() => navigate(`/buyer/product/${deal.product.product_id}`)}
                    className="bg-white text-gray-900 hover:text-primary px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors"
                  >
                    Grab Deal
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Nearby Sellers */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Top Farmers Near You</h2>
          <span className="px-3 py-1 bg-blue-100 text-blue-600 text-xs font-bold rounded-full flex items-center gap-1"><MapPin className="w-3 h-3" /> Location Based</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {nearbySellers.map((seller, i) => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-6">
              <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0 border-4 border-gray-50">
                <img src={getProductImageUrl(seller.photo_url)} alt={seller.owner} className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'; }} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-lg font-bold text-gray-900">{seller.farm_name}</h3>
                  <div className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-full">
                    <MapPin className="w-3 h-3 text-gray-500" />
                    <span className="text-xs font-bold text-gray-600">{seller.distance_km} km</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-3">{seller.owner}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {seller.blockchain_verified && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      <ShieldCheck className="w-3 h-3" /> Verified
                    </span>
                  )}
                  {seller.is_organic && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                      <Leaf className="w-3 h-3" /> 100% Organic
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-xs font-semibold text-gray-600">
                  <p>⭐ {seller.rating} ({seller.orders_completed}+ orders)</p>
                  <p>🚚 ~{seller.estimated_delivery_time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
