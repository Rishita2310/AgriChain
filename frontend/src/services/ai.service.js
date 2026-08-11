import api from './api';


export const aiService = {
  // Farmer APIs
  getFarmerOverview: async (productId = '') => {
    const response = await api.get(`/ai/farmer/overview${productId ? `?product_id=${productId}` : ''}`);
    return response.data;
  },
  getFarmerPrice: async (productId = '') => {
    const response = await api.get(`/ai/farmer/price${productId ? `?product_id=${productId}` : ''}`);
    return response.data;
  },
  getFarmerDemand: async () => {
    const response = await api.get(`/ai/farmer/demand`);
    return response.data;
  },
  getFarmerBestTime: async () => {
    const response = await api.get(`/ai/farmer/best-time`);
    return response.data;
  },
  sendFarmerFeedback: async (feedback) => {
    const response = await api.post(`/ai/farmer/feedback`, feedback);
    return response.data;
  },
  
  // Buyer APIs
  getBuyerRecommendations: async () => {
    const response = await api.get(`/ai/buyer/recommendations`);
    return response.data;
  },
  getBuyerNearbySellers: async () => {
    const response = await api.get(`/ai/buyer/nearby`);
    return response.data;
  },
  getBuyerDeals: async () => {
    const response = await api.get(`/ai/buyer/deals`);
    return response.data;
  },
  sendBuyerFeedback: async (feedback) => {
    const response = await api.post(`/ai/buyer/feedback`, feedback);
    return response.data;
  }
};
