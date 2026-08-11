import React, { useEffect, useState } from 'react';
import { aiService } from '../../../../services/ai.service';
import { Brain, TrendingUp, TrendingDown, Clock, BarChart2, Loader2, RefreshCw, ThumbsUp, ThumbsDown, ThermometerSun, Droplets, MapPin, AlertTriangle, Bug, CloudRain } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FarmerAIFeatures() {
  const [aiData, setAiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCropId, setSelectedCropId] = useState('');

  const fetchAIInsights = async (productId = '') => {
    try {
      if (!aiData) setLoading(true);
      else setRefreshing(true);

      const overview = await aiService.getFarmerOverview(productId);
      setAiData(overview);
      
    } catch (err) {
      toast.error('Failed to generate AI insights');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAIInsights();
  }, []);

  const handleCropChange = (e) => {
    const val = e.target.value;
    setSelectedCropId(val);
    fetchAIInsights(val);
  };

  const handleFeedback = async (type, isHelpful) => {
    toast.success('Thank you for the feedback!');
    await aiService.sendFarmerFeedback({ type, isHelpful });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Brain className="w-16 h-16 text-primary animate-pulse mb-4" />
        <p className="text-xl font-bold text-gray-800">Generating AI Insights...</p>
        <p className="text-gray-500 mt-2">Analyzing real market rates, weather data, and demand trends for your crops.</p>
      </div>
    );
  }

  if (!aiData) return null;

  const { price_prediction, demand_forecast, best_time, weather_advisory, farmer_products, selected_crop, farmer_location } = aiData;

  return (
    <div className="max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      
      {/* Header & Crop Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <Brain className="w-8 h-8 text-primary" /> Agri-Intelligence Dashboard
          </h1>
          <p className="text-gray-500 mt-2 flex items-center gap-2">
            <MapPin className="w-4 h-4" /> {farmer_location} — Data-driven AI insights customized for your actual crops.
          </p>
        </div>
        <div className="flex gap-3 items-center">
          {farmer_products?.length > 0 && (
            <select
              value={selectedCropId}
              onChange={handleCropChange}
              className="bg-white border border-gray-200 text-gray-700 font-bold rounded-xl px-4 py-2.5 focus:ring-primary focus:border-primary outline-none"
            >
              <option value="">Analyze Top Crop</option>
              {farmer_products.map((p) => (
                <option key={p.product_id} value={p.product_id}>
                  {p.product_name}
                </option>
              ))}
            </select>
          )}
          
          <button 
            onClick={() => fetchAIInsights(selectedCropId)}
            disabled={refreshing}
            className="px-5 py-2.5 bg-primary text-white hover:bg-primary/90 rounded-xl font-bold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            Sync AI
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Recommended Price Card */}
        {price_prediction && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <TrendingUp className="w-32 h-32 text-primary" />
            </div>
            
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Price Optimizer</h2>
                <p className="text-sm text-gray-500 font-medium">For {selected_crop}</p>
              </div>
              <div className="flex flex-col items-end">
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-extrabold flex items-center gap-1">
                  <Brain className="w-3 h-3" /> {price_prediction.confidence_score}% Confidence
                </span>
                <span className="text-[10px] text-gray-400 mt-1 font-mono">Real-time Mandi Benchmark</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
              <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
                <p className="text-sm text-green-700 font-bold mb-1">AI Recommended Price</p>
                <p className="text-3xl font-black text-green-800">₹{price_prediction.recommended_price} <span className="text-base font-normal text-green-600">/ kg</span></p>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <p className="text-sm text-gray-600 font-bold mb-1">Current Mandi Avg</p>
                <p className="text-2xl font-bold text-gray-800">₹{price_prediction.current_market_average} <span className="text-sm font-normal">/ kg</span></p>
                <p className="text-xs text-gray-500 mt-1 font-medium">Govt MSP: ₹{price_prediction.msp_benchmark}</p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-2xl p-4 mb-6 border border-blue-100 relative z-10">
              <p className="text-sm text-blue-900 font-medium leading-relaxed mb-2">
                <span className="font-bold flex items-center gap-1"><Brain className="w-4 h-4" /> AI Analysis:</span> {price_prediction.reason}
              </p>
              <p className="text-sm font-bold text-blue-800">
                Action: {price_prediction.suggested_action}
              </p>
            </div>

            <div className="mb-6 relative z-10">
              <p className="text-sm font-bold text-gray-700 mb-3">30-Day Simulated Price Trend Forecast</p>
              <div className="flex items-end gap-1 h-24 mt-4">
                {price_prediction.price_trend_30_days.map((val, i) => {
                  const max = Math.max(...price_prediction.price_trend_30_days);
                  const min = Math.min(...price_prediction.price_trend_30_days);
                  const height = ((val - min) / (max - min)) * 100;
                  return (
                    <div key={i} className="flex-1 bg-green-100 rounded-t-md relative group/bar hover:bg-primary transition-colors" style={{ height: `${Math.max(10, height)}%` }}>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity z-10 pointer-events-none">
                        ₹{val}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-6 relative z-10">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-green-600 flex items-center gap-1 bg-green-50 px-3 py-1.5 rounded-xl border border-green-100">
                  <TrendingUp className="w-4 h-4" /> +{price_prediction.expected_profit_percentage}% Est. Profit Boost
                </span>
                {price_prediction.organic_premium > 0 && (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                    +{price_prediction.organic_premium}% Organic Premium
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-8">
          
          {/* Weather Advisory Card */}
          {weather_advisory && (
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-6 shadow-md text-white relative overflow-hidden flex-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-bold flex items-center gap-2 mb-1">
                      <ThermometerSun className="w-6 h-6 text-yellow-300" /> Agri-Weather Advisory
                    </h2>
                    <p className="text-blue-100 text-sm font-medium">{weather_advisory.region}</p>
                  </div>
                  <CloudRain className="w-8 h-8 text-blue-200" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-xs text-blue-200 mb-1 uppercase tracking-wider font-bold">Temperature</p>
                    <p className="font-semibold text-sm">{weather_advisory.temperature}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-200 mb-1 uppercase tracking-wider font-bold">Rainfall Chance</p>
                    <p className="font-semibold text-sm">{weather_advisory.rainfall_probability}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-200 mb-1 uppercase tracking-wider font-bold">Soil Condition</p>
                    <p className="font-semibold text-sm">{weather_advisory.soil_moisture_condition}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-200 mb-1 uppercase tracking-wider font-bold flex items-center gap-1">
                      <Bug className="w-3 h-3" /> Pest Risk
                    </p>
                    <p className="font-semibold text-sm">{weather_advisory.pest_risk_level}</p>
                  </div>
                </div>

                <div className="bg-black/20 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <p className="text-sm font-bold text-yellow-300 mb-1 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Harvest & Storage Recommendation
                  </p>
                  <p className="text-sm text-blue-50 mb-2 leading-relaxed">{weather_advisory.harvest_recommendation}</p>
                  <p className="text-xs text-blue-200 leading-relaxed italic">{weather_advisory.shelf_life_advisory}</p>
                </div>
              </div>
            </div>
          )}

          {/* Demand Forecast Card */}
          {demand_forecast && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm flex-1 relative overflow-hidden group">
              <div className="flex justify-between items-start mb-6 relative z-10">
                <h2 className="text-xl font-bold text-gray-900">Demand & Velocity</h2>
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-extrabold border border-orange-200">
                  {demand_forecast.demand_level}
                </span>
              </div>

              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="p-4 bg-orange-50 rounded-2xl text-orange-600">
                  <BarChart2 className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-semibold">Expected Growth (7 Days)</p>
                  <p className="text-3xl font-black text-gray-900">+{demand_forecast.expected_growth_percentage}%</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                  <p className="text-xs text-gray-500 font-bold mb-1 uppercase">Active Buyer Inquiries</p>
                  <p className="text-2xl font-bold text-primary">{demand_forecast.buyer_inquiries_count}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                  <p className="text-xs text-red-600 font-bold mb-1 uppercase">Est. Stock Depletion</p>
                  <p className="text-2xl font-bold text-red-700">{demand_forecast.stock_depletion_days} Days</p>
                </div>
              </div>

              <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-2xl leading-relaxed relative z-10 border border-gray-100">
                <span className="font-bold text-gray-900">Market Insight:</span> {demand_forecast.reason}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Best Selling Time */}
      {best_time && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Optimal Listing Window</h2>
              <p className="text-gray-500">AI prediction of when buyers are most active for bulk orders.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-4">
              <div className="p-5 border border-purple-100 bg-purple-50/50 rounded-2xl">
                <p className="text-sm font-bold text-purple-900 mb-1">Peak Buying Days</p>
                <p className="text-xl font-black text-purple-700">{best_time.best_day}</p>
              </div>
              <div className="p-5 border border-blue-100 bg-blue-50/50 rounded-2xl">
                <p className="text-sm font-bold text-blue-900 mb-1">Peak Activity Hours</p>
                <p className="text-xl font-black text-blue-700">{best_time.best_time}</p>
              </div>
              <div className="p-5 border border-gray-100 bg-gray-50 rounded-2xl">
                <p className="text-sm font-bold text-gray-700 mb-1">Market Context</p>
                <p className="text-sm font-medium text-gray-600 leading-relaxed">{best_time.market_activity_peak}</p>
              </div>
            </div>

            <div className="md:col-span-2 bg-gray-50 p-6 rounded-3xl border border-gray-100">
              <h3 className="text-sm font-bold text-gray-700 mb-4">Buyer Engagement Heatmap (7 Days)</h3>
              <div className="flex items-end gap-2 h-48 pt-4">
                {best_time.heatmap_data.map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-crosshair">
                    <div className="w-full relative flex items-end justify-center h-full">
                      <div 
                        className="w-full bg-purple-200 rounded-t-xl group-hover:bg-purple-500 transition-colors relative" 
                        style={{ height: `${val}%` }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap pointer-events-none">
                          {val} Score
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-gray-500">Day {i + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
